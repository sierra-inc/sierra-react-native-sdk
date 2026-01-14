// Copyright Sierra

import React, { useCallback, useRef, forwardRef, ReactElement } from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import WebView from "react-native-webview";
import type {
    WebViewErrorEvent,
    WebViewHttpErrorEvent,
} from "react-native-webview/lib/WebViewTypes";
import { ConversationTransfer, SecretExpiryReplyHandler } from "../models/ConversationTypes";
import { Agent } from "../Agent";

interface SierraAgentViewProps {
    agent: Agent;
    style?: ViewStyle;
    renderLoading?: () => ReactElement;
    onConversationTransfer?: (transfer: ConversationTransfer) => void;
    onAgentMessageEnd?: () => void;
    onEndChat?: () => void;
    onError?: (event: WebViewErrorEvent) => void;
    onHttpError?: (event: WebViewHttpErrorEvent) => void;
    /**
     * Callback invoked when a secret needs to be refreshed. Reply handler should be invoked with one of:
     * - { value: newValue } - a new value for the secret
     * - { value: null } - if the secret cannot be provided due to a known condition (e.g. the user has signed out)
     * - { error: errorMessage } - if the secret cannot be fetched right now, but the request should be retried
     */
    onSecretExpiry?: (secretName: string, replyHandler: SecretExpiryReplyHandler) => void;
}

/**
 * Interface to match postMessage's message parameter from web/sites/embed/pages/agent/{token}/mobile.tsx
 */
type WebViewMessage =
    | {
          type: "storeValue";
          data: { key: string; value: string };
      }
    | {
          type: "clearStorage";
      }
    | {
          type: "transfer";
          data: { isSynchronous: boolean; isContactCenter: boolean; data: any };
      }
    | {
          type: "agentMessageEnd";
      }
    | {
          type: "onEndChat";
      }
    | {
          type: "onSecretExpiry";
          secretName: string;
          callbackId: string;
      };

/**
 * Sierra WebView Chat component that uses a WebView to embed the Sierra chat experience
 */
const SierraAgentView: React.FC<SierraAgentViewProps> = forwardRef<WebView, SierraAgentViewProps>(
    (
        {
            agent,
            style,
            renderLoading,
            onConversationTransfer,
            onAgentMessageEnd,
            onEndChat,
            onError,
            onHttpError,
            onSecretExpiry,
        }: SierraAgentViewProps,
        ref: React.Ref<WebView>
    ) => {
        const webViewRef = useRef<WebView>(null);
        const setWebViewRef = useCallback(
            (instance: WebView | null) => {
                webViewRef.current = instance;
                if (typeof ref === "function") {
                    ref(instance);
                } else if (ref) {
                    ref.current = instance;
                }
            },
            [ref]
        );

        // Handle messages from the WebViewMessageEvent
        const handleMessage = (event: any) => {
            const data = event.nativeEvent?.data;
            try {
                const message: WebViewMessage = JSON.parse(data);

                switch (message.type) {
                    case "storeValue":
                        if (message.data?.key && message.data?.value !== undefined) {
                            // Update the agent's storage
                            agent.getSessionStorage().setItem(message.data.key, message.data.value);

                            // Update the WebView's sync storage
                            if (webViewRef.current) {
                                webViewRef.current.injectJavaScript(`
                                    window.__sierraSyncStorage['${
                                        message.data.key
                                    }'] = ${JSON.stringify(message.data.value)};
                                    true;
                                `);
                            }
                        }
                        break;

                    case "clearStorage":
                        // Update the agent's storage
                        agent.getSessionStorage().clear();

                        // Clear the WebView's sync storage
                        if (webViewRef.current) {
                            webViewRef.current.injectJavaScript(`
                                window.__sierraSyncStorage = {};
                                true;
                            `);
                        }
                        break;

                    case "transfer":
                        onConversationTransfer?.({
                            isSynchronous: message.data.isSynchronous,
                            isContactCenter: message.data.isContactCenter,
                            data: message.data.data,
                        });
                        break;

                    case "agentMessageEnd":
                        onAgentMessageEnd?.();
                        break;

                    case "onEndChat":
                        agent.getSessionStorage().clear();

                        if (webViewRef.current) {
                            webViewRef.current.injectJavaScript(`
                                window.__sierraSyncStorage = {};
                                true;
                            `);
                        }
                        onEndChat?.();
                        break;

                    case "onSecretExpiry":
                        if (onSecretExpiry) {
                            onSecretExpiry(message.secretName, result => {
                                if (webViewRef.current) {
                                    const jsCode =
                                        "error" in result
                                            ? `window.__sierraResolveCallback(${JSON.stringify(message.callbackId)}, null, ${JSON.stringify(result.error)}); true;`
                                            : `window.__sierraResolveCallback(${JSON.stringify(message.callbackId)}, ${JSON.stringify(result.value)}); true;`;
                                    webViewRef.current.injectJavaScript(jsCode);
                                }
                            });
                        } else {
                            // No handler provided, resolve with null
                            if (webViewRef.current) {
                                webViewRef.current.injectJavaScript(
                                    `window.__sierraResolveCallback(${JSON.stringify(message.callbackId)}, null); true;`
                                );
                            }
                        }
                        break;
                }
            } catch (error) {
                console.error(`Error handling message from WebView: ${JSON.stringify(error)}`);
            }
        };

        const setupWebViewStorage = () => {
            if (!webViewRef.current) return;

            // Initialize the webview with existing storage
            const storage = agent.getSessionStorage().getAll();
            const setupScript = `
                window.__sierraSyncStorage = ${JSON.stringify(storage)};
            `;

            webViewRef.current.injectJavaScript(setupScript);
        };

        return (
            <View style={[styles.container, style]}>
                <WebView
                    userAgent={getUserAgent()}
                    ref={setWebViewRef}
                    source={{ uri: agent.getEmbedUrl() }}
                    style={styles.webView}
                    onMessage={handleMessage}
                    onLoadEnd={() => {
                        setupWebViewStorage();
                    }}
                    onError={(error: WebViewErrorEvent) => {
                        console.log(`WebView error: ${error.nativeEvent.description}`);
                        onError?.(error);
                    }}
                    onHttpError={onHttpError}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scrollEnabled={true}
                    originWhitelist={[agent.getEmbedOrigin()]}
                    renderLoading={renderLoading}
                />
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webView: {
        flex: 1,
        zIndex: 0,
    },
});

export default SierraAgentView;

/**
 * Get the user agent string for API requests
 * @returns The user agent string
 */
function getUserAgent(): string {
    const deviceInfo = {
        appName: "Sierra Agent View",
        appVersion: "0",
        deviceModel: Platform.OS,
        osVersion: Platform.Version,
    };

    // No native dependencies, so we use basic platform info
    let userAgent = `Sierra-ReactNative-SDK (${deviceInfo.appName}/${deviceInfo.appVersion} ${deviceInfo.deviceModel}/${deviceInfo.osVersion})`;

    return userAgent;
}
