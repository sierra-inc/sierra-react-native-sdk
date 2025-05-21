// Copyright Sierra

import React, { useRef, forwardRef, ReactElement } from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import WebView from "react-native-webview";
import { ConversationTransfer } from "../models/ConversationTypes";
import { Agent } from "../Agent";

interface SierraAgentViewProps {
    agent: Agent;
    style?: ViewStyle;
    renderLoading?: () => ReactElement;
    onConversationTransfer?: (transfer: ConversationTransfer) => void;
    onAgentMessageEnd?: () => void;
    onEndChat?: () => void;
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
        }: SierraAgentViewProps,
        ref: React.Ref<WebView>
    ) => {
        const webViewRef = useRef<WebView>(null);

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
                    ref={webViewRef}
                    source={{ uri: agent.getEmbedUrl() }}
                    style={styles.webView}
                    onMessage={handleMessage}
                    onLoadEnd={() => {
                        setupWebViewStorage();
                    }}
                    onError={error => {
                        console.log(`WebView error: ${error.nativeEvent.description}`);
                    }}
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
