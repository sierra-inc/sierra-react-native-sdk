// Copyright Sierra

import React, {
    useCallback,
    useRef,
    forwardRef,
    useImperativeHandle,
    ReactElement,
    useMemo,
    useState,
    useEffect,
} from "react";
import { View, StyleSheet, ViewStyle, Platform, ActivityIndicator } from "react-native";
import WebView from "react-native-webview";
import type {
    WebViewErrorEvent,
    WebViewHttpErrorEvent,
} from "react-native-webview/lib/WebViewTypes";
import { ConversationTransfer, SecretExpiryReplyHandler } from "../models/ConversationTypes";
import { Agent } from "../Agent";

/**
 * Resume budget: how long to keep the loading overlay up after the embed reports a resumed
 * conversation (onOpen with isNewConversation: false) while waiting for onConversationReady. Armed
 * when onOpen arrives -- not at mount -- so the window excludes page-load time, matching iOS/Android.
 */
const REVEAL_FALLBACK_MS = 10_000;

/**
 * Hard safety net armed when the WebView mounts. Only reached when the embed never posts onOpen at
 * all (e.g. an older embed that doesn't bridge onOpen to React Native, or a bridge regression), so
 * the overlay can't get stuck forever. Long enough to clear any realistic page-load + resume so it
 * never pre-empts the normal onConversationReady reveal.
 */
const REVEAL_HARD_TIMEOUT_MS = 30_000;

interface SierraAgentViewProps {
    agent: Agent;
    /**
     * Opaque conversation state token returned by the public Sierra API. When set, the chat
     * resumes the conversation identified by this token instead of starting a new one.
     *
     * Supply this only on the view instance that should resume the referenced conversation;
     * do not retain it on long-lived configuration. Once the customer ends that conversation
     * and starts a new one, the SDK's own `ConversationStorage` takes over. If you continue
     * to pass the original `conversationState` on subsequent mounts, the new conversation will
     * be replaced by the original one.
     */
    conversationState?: string;
    style?: ViewStyle;
    renderLoading?: () => ReactElement;
    onConversationTransfer?: (transfer: ConversationTransfer) => void;
    onAgentMessageEnd?: () => void;
    onEndChat?: () => void;
    onShowConversationList?: () => void;
    onHideConversationList?: () => void;
    onError?: (event: WebViewErrorEvent) => void;
    onHttpError?: (event: WebViewHttpErrorEvent) => void;
    /**
     * Callback invoked when a secret needs to be refreshed. Reply handler should be invoked with one of:
     * - { value: newValue } - a new value for the secret
     * - { value: null } - if the secret cannot be provided due to a known condition (e.g. the user has signed out)
     * - { error: errorMessage } - if the secret cannot be fetched right now, but the request should be retried
     */
    onSecretExpiry?: (secretName: string, replyHandler: SecretExpiryReplyHandler) => void;
    /**
     * Callback invoked when the user identity token (JWT) has expired and needs to be refreshed.
     * Reply handler should be invoked with one of:
     * - { value: freshToken } - a fresh JWT string
     * - { value: null } - if the token cannot be provided (the session downgrades to anonymous)
     * - { error: errorMessage } - if the token cannot be fetched right now, but the request should be retried
     */
    onUserIdentityTokenExpiry?: (replyHandler: SecretExpiryReplyHandler) => void;
    /**
     * Callback invoked when the WebView attempts to open a new window (e.g. window.open() or
     * a link with target="_blank"). When provided, the default behavior of opening in the system
     * browser is suppressed, and the event is passed to this callback instead.
     */
    onOpenWindow?: (event: { targetUrl: string }) => void;
}

/** Interface to match postMessage messages sent by the mobile web embed. */
type WebViewMessage =
    | {
          type: "onOpen";
          isNewConversation: boolean;
      }
    | {
          type: "onConversationReady";
      }
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
      }
    | {
          type: "onUserIdentityTokenExpiry";
          callbackId: string;
      }
    | {
          type: "onShowConversationList";
      }
    | {
          type: "onHideConversationList";
      };

export interface SierraAgentViewHandle {
    /** The underlying WebView instance, if available. */
    webView: WebView | null;
    /** Navigate to the conversation list view programmatically. */
    showConversationList(): void;
}

/**
 * Sierra WebView Chat component that uses a WebView to embed the Sierra chat experience
 */
const SierraAgentView = forwardRef<SierraAgentViewHandle, SierraAgentViewProps>(
    (
        {
            agent,
            conversationState,
            style,
            renderLoading,
            onConversationTransfer,
            onAgentMessageEnd,
            onEndChat,
            onShowConversationList,
            onHideConversationList,
            onError,
            onHttpError,
            onSecretExpiry,
            onUserIdentityTokenExpiry,
            onOpenWindow,
        }: SierraAgentViewProps,
        ref: React.Ref<SierraAgentViewHandle>
    ) => {
        const webViewRef = useRef<WebView>(null);
        const [isStorageReady, setIsStorageReady] = useState(false);
        const [contentReady, setContentReady] = useState(false);
        const revealFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        const clearRevealFallbackTimer = useCallback(() => {
            if (revealFallbackTimerRef.current !== null) {
                clearTimeout(revealFallbackTimerRef.current);
                revealFallbackTimerRef.current = null;
            }
        }, []);

        const revealContent = useCallback(() => {
            clearRevealFallbackTimer();
            setContentReady(true);
        }, [clearRevealFallbackTimer]);

        const scheduleRevealFallback = useCallback(
            (delayMs: number) => {
                // Restart from a clean slate so each call gets a full window: the resume-budget
                // timer (armed on onOpen) replaces the mount-armed hard net, and a timer still
                // pending from a previous embedUrl can't fire early for the new load.
                clearRevealFallbackTimer();
                revealFallbackTimerRef.current = setTimeout(() => {
                    revealFallbackTimerRef.current = null;
                    setContentReady(true);
                }, delayMs);
            },
            [clearRevealFallbackTimer]
        );

        // Clear any pending fallback timer on unmount.
        useEffect(() => clearRevealFallbackTimer, [clearRevealFallbackTimer]);

        const embedUrl = useMemo(() => {
            const baseUrl = agent.getEmbedUrl();
            if (!conversationState) {
                return baseUrl;
            }
            const separator = baseUrl.includes("?") ? "&" : "?";
            return `${baseUrl}${separator}state=${encodeURIComponent(conversationState)}`;
        }, [agent, conversationState]);

        useImperativeHandle(ref, () => ({
            get webView() {
                return webViewRef.current;
            },
            showConversationList() {
                webViewRef.current?.injectJavaScript("sierraMobile.showConversationList(); true;");
            },
        }));

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

        // Arm the hard safety net once the WebView is about to mount, so the loading overlay is
        // always eventually removed even if the embed never posts a readiness signal -- e.g. an
        // older embed that does not send onOpen/onConversationReady to React Native, or a future
        // regression in that bridge. The shorter resume budget is armed later, when onOpen reports
        // a resumed conversation; revealContent() cancels whichever timer is pending.
        //
        // Re-entering on embedUrl changes matters because the WebView navigates to a new URL (and
        // re-resumes) when conversationState or agent changes; without re-hiding, the previous
        // reveal would leave the overlay off and flash the new conversation's empty state.
        useEffect(() => {
            if (!isStorageReady) {
                return;
            }
            setContentReady(false);
            scheduleRevealFallback(REVEAL_HARD_TIMEOUT_MS);
        }, [isStorageReady, embedUrl, scheduleRevealFallback]);

        const setWebViewRef = useCallback((instance: WebView | null) => {
            webViewRef.current = instance;
        }, []);

        // Handle messages from the WebViewMessageEvent
        const handleMessage = (event: any) => {
            const data = event.nativeEvent?.data;
            try {
                const message: WebViewMessage = JSON.parse(data);

                switch (message.type) {
                    case "onOpen":
                        if (message.isNewConversation) {
                            // New conversation: the greeting is already rendered, so reveal now.
                            revealContent();
                        } else {
                            // Resuming an existing conversation: start the resume budget now that the
                            // embed has mounted (matches iOS/Android). Anchoring here rather than at
                            // mount keeps page-load time out of the window, so a slow load can't drop
                            // the overlay before onConversationReady. Stays up until that arrives.
                            scheduleRevealFallback(REVEAL_FALLBACK_MS);
                        }
                        break;

                    case "onConversationReady":
                        revealContent();
                        break;

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

                    case "onShowConversationList":
                        onShowConversationList?.();
                        break;

                    case "onHideConversationList":
                        onHideConversationList?.();
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

                    case "onUserIdentityTokenExpiry":
                        if (onUserIdentityTokenExpiry) {
                            onUserIdentityTokenExpiry(result => {
                                if (webViewRef.current) {
                                    const jsCode =
                                        "error" in result
                                            ? `window.__sierraResolveCallback(${JSON.stringify(message.callbackId)}, null, ${JSON.stringify(result.error)}); true;`
                                            : `window.__sierraResolveCallback(${JSON.stringify(message.callbackId)}, ${JSON.stringify(result.value)}); true;`;
                                    webViewRef.current.injectJavaScript(jsCode);
                                }
                            });
                        } else {
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

        // Build the injection script with current storage state and capability advertisement.
        // Storage is guaranteed to be loaded at this point. __sierraMobileCapabilities lets the
        // web embed avoid registering bridge functions this SDK build can't service.
        const bootstrapScript = `
            window.__sierraSyncStorage = ${JSON.stringify(agent.getStorage().getAll())};
            window.__sierraMobileCapabilities = { onUserIdentityTokenExpiry: true };
            window.__sierraInitialMemory = ${JSON.stringify(agent.getInitialMemory())};
            true;
        `;

        // Match the loading overlay background to any background color the host supplied via
        // `style`, so the overlay fully hides the WebView (which would otherwise flash white).
        const overlayBackgroundColor =
            (StyleSheet.flatten(style)?.backgroundColor as string | undefined) ?? "white";

        return (
            <View style={[styles.container, style]}>
                <WebView
                    userAgent={getUserAgent()}
                    ref={setWebViewRef}
                    source={{ uri: embedUrl }}
                    style={styles.webView}
                    onMessage={handleMessage}
                    injectedJavaScriptBeforeContentLoaded={bootstrapScript}
                    onError={(error: WebViewErrorEvent) => {
                        console.log(`WebView error: ${error.nativeEvent.description}`);
                        onError?.(error);
                    }}
                    onHttpError={onHttpError}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scrollEnabled={true}
                    originWhitelist={[agent.getEmbedOrigin()]}
                    onOpenWindow={
                        onOpenWindow
                            ? syntheticEvent => {
                                  onOpenWindow(syntheticEvent.nativeEvent);
                              }
                            : undefined
                    }
                />
                {!contentReady && (
                    <View
                        style={[styles.loadingOverlay, { backgroundColor: overlayBackgroundColor }]}
                    >
                        {renderLoading ? renderLoading() : <ActivityIndicator size="large" />}
                    </View>
                )}
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
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
