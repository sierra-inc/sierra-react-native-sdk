// Copyright Sierra

import React, { useCallback, useRef, forwardRef, ReactElement, useState, useEffect } from "react";
import { View, StyleSheet, ViewStyle, Platform, ActivityIndicator } from "react-native";
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
        const [isStorageReady, setIsStorageReady] = useState(false);

        // Wait for storage to load before rendering the WebView.
        // This ensures conversation state is properly restored for DISK mode.
        useEffect(() => {
            setIsStorageReady(false);
            let mounted = true;
            agent.waitForLoad().then(() => {
                if (mounted) {
                    setIsStorageReady(true);
                }
            });
            return () => {
                mounted = false;
            };
        }, [agent]);

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
                            agent.getStorage().setItem(message.data.key, message.data.value);

                            // Update the WebView's sync storage, initializing if needed
                            if (webViewRef.current) {
                                webViewRef.current.injectJavaScript(`
                                    window.__sierraSyncStorage = window.__sierraSyncStorage || {};
                                    window.__sierraSyncStorage[${JSON.stringify(
                                        message.data.key
                                    )}] = ${JSON.stringify(message.data.value)};
                                    true;
                                `);
                            }
                        }
                        break;

                    case "clearStorage":
                        // Update the agent's storage
                        agent.getStorage().clear();

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
                        agent.getStorage().clear();

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

        // Show loading state while waiting for storage to load from disk.
        // This prevents the WebView from initializing with empty storage.
        if (!isStorageReady) {
            return (
                <View style={[styles.container, styles.loadingContainer, style]}>
                    {renderLoading ? renderLoading() : <ActivityIndicator size="large" />}
                </View>
            );
        }

        // Build the injection script with current storage state.
        // Storage is guaranteed to be loaded at this point.
        const storageScript = `
            window.__sierraSyncStorage = ${JSON.stringify(agent.getStorage().getAll())};
            true;
        `;

        return (
            <View style={[styles.container, style]}>
                <WebView
                    userAgent={getUserAgent()}
                    ref={setWebViewRef}
                    source={{ uri: agent.getEmbedUrl() }}
                    style={styles.webView}
                    onMessage={handleMessage}
                    injectedJavaScriptBeforeContentLoaded={storageScript}
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
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
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
