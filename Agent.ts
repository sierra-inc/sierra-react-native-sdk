// Copyright Sierra

import { AgentConfig } from "./models/AgentConfig";
import { ChatOptions } from "./models/ChatOptions";
import { ChatStyleOptions } from "./models/ChatStyle";
import { PersistenceMode } from "./models/PersistenceMode";
import { ConversationStorage, StorageAdapter } from "./models/ConversationStorage";

/**
 * Main agent class that handles Sierra chat functionality
 */
export class Agent {
    private config: AgentConfig;
    private options: ChatOptions;
    private url: string;
    private storage: ConversationStorage;

    /**
     * Create a new Agent instance
     * @param config - Configuration for the agent
     * @param options - Options for the chat
     * @param storageAdapter - Storage adapter for disk persistence (required if persistence is DISK)
     */
    constructor({
        config,
        options,
        storageAdapter,
    }: {
        config: AgentConfig;
        options: ChatOptions;
        storageAdapter?: StorageAdapter;
    }) {
        // Fail fast if DISK mode without adapter
        if (config.persistence === PersistenceMode.DISK && !storageAdapter) {
            throw new Error(
                "storageAdapter is required for PersistenceMode.DISK. " +
                    "Either provide a storage adapter (e.g., AsyncStorage), " +
                    "or use PersistenceMode.MEMORY or PersistenceMode.NONE."
            );
        }

        this.config = config;
        this.storage = new ConversationStorage(
            config.persistence,
            `sierra_chat_${config.token}`,
            storageAdapter
        );

        this.options = options;
        this.url = this.buildUrl(this.options);
    }

    /**
     * Get the agent's conversation storage
     * @returns The conversation storage object
     */
    getStorage(): ConversationStorage {
        return this.storage;
    }

    /**
     * Get the agent's session storage
     * @deprecated Use getStorage() instead
     * @returns The conversation storage object
     */
    getSessionStorage(): ConversationStorage {
        console.warn("getSessionStorage() is deprecated. Use getStorage() instead.");
        return this.storage;
    }

    /**
     * Clear any stored conversation state, causing the next chat session to start fresh.
     * This affects both in-memory and disk-persisted state depending on the persistence mode.
     */
    resetConversation(): void {
        this.storage.clear();
    }

    /**
     * Wait for storage to finish loading from disk.
     * Returns immediately for NONE and MEMORY persistence modes.
     * For DISK mode, resolves when the initial load from storage completes.
     *
     * This should be awaited before displaying the chat UI to ensure
     * conversation state is properly restored.
     */
    waitForLoad(): Promise<void> {
        return this.storage.waitForLoad();
    }

    /**
     * Get the agent's URL with all custom parameters
     * @returns The agent's URL
     */
    getEmbedUrl(): string {
        return this.url;
    }

    getEmbedOrigin(): string {
        try {
            const url = new URL(this.url);
            return `${url.protocol}//${url.host}`;
        } catch (error) {
            console.error(`Error parsing embed URL: ${error}`);
            return "*";
        }
    }

    /**
     * Get the agent's initial memory (variables and secrets). These are delivered to the web embed
     * via the window.__sierraInitialMemory bridge global instead of URL query parameters, so the
     * values cannot leak into device, proxy, or analytics logs.
     */
    getInitialMemory(): { variables?: Record<string, string>; secrets?: Record<string, string> } {
        const conversationOptions = this.options.conversationOptions;
        const memory: { variables?: Record<string, string>; secrets?: Record<string, string> } = {};
        if (
            conversationOptions?.variables &&
            Object.keys(conversationOptions.variables).length > 0
        ) {
            memory.variables = conversationOptions.variables;
        }
        if (conversationOptions?.secrets && Object.keys(conversationOptions.secrets).length > 0) {
            memory.secrets = conversationOptions.secrets;
        }
        return memory;
    }

    private buildUrl(options: ChatOptions): string {
        const { config } = this;
        const DEFAULT_GREETING_MESSAGE = "How can I help you today?";

        const params = new URLSearchParams();
        const shouldOmitDefaultChatStrings =
            options.autoDetectChatStrings === true || options.useConfiguredChatStrings === true;

        // Add the specific release target for the agent
        if (config.target) {
            params.append("target", config.target);
        }

        // Should match the web embed's Brand shape.
        const brandJSON = JSON.stringify(
            shouldOmitDefaultChatStrings
                ? {
                      // If locale auto-detect or server-configured chat strings are enabled,
                      // only include fields the caller explicitly provided. Omitted fields use
                      // locale defaults or server-provided values instead.
                      botName: options.name ?? "Your virtual assistant",
                      ...(options.greetingMessage != null && {
                          greetingMessage: options.greetingMessage,
                      }),
                      ...(options.errorMessage != null && {
                          errorMessage: options.errorMessage,
                      }),
                      ...(options.inactivityMessage != null && {
                          inactivityMessage: options.inactivityMessage,
                      }),
                      ...(options.agentTransferWaitingMessage != null && {
                          agentTransferWaitingMessage: options.agentTransferWaitingMessage,
                      }),
                      ...(options.agentTransferQueueSizeMessage != null && {
                          agentTransferQueueSizeMessage: options.agentTransferQueueSizeMessage,
                      }),
                      ...(options.agentTransferQueueNextMessage != null && {
                          agentTransferQueueNextMessage: options.agentTransferQueueNextMessage,
                      }),
                      ...(options.agentJoinedMessage != null && {
                          agentJoinedMessage: options.agentJoinedMessage,
                      }),
                      ...(options.agentLeftMessage != null && {
                          agentLeftMessage: options.agentLeftMessage,
                      }),
                      chatStyle: options.chatStyle
                          ? this.transformChatStyle(options.chatStyle)
                          : undefined,
                      ...(options.showTimestamps != null && {
                          showTimestamps: options.showTimestamps,
                      }),
                      ...(options.showSpeakerLabels != null && {
                          showBotName: options.showSpeakerLabels,
                      }),
                      ...(options.showAvatars != null && {
                          showAvatars: options.showAvatars,
                      }),
                      ...(options.agentAvatarURL != null && {
                          agentAvatarURL: options.agentAvatarURL,
                      }),
                      ...(options.sendButtonSVG != null && {
                          sendButtonSVG: options.sendButtonSVG,
                      }),
                      ...(options.sendButtonDisabledSVG != null && {
                          sendButtonDisabledSVG: options.sendButtonDisabledSVG,
                      }),
                      messageLabelPlacement: options.messageLabelPlacement ?? "",
                  }
                : {
                      botName: options.name ?? "Your virtual assistant",
                      greetingMessage: options.greetingMessage ?? DEFAULT_GREETING_MESSAGE,
                      errorMessage:
                          options.errorMessage ??
                          "Oops, an error was encountered! Please try again.",
                      inactivityMessage: options.inactivityMessage ?? "",
                      agentTransferWaitingMessage:
                          options.agentTransferWaitingMessage ?? "Waiting for agent…",
                      agentTransferQueueSizeMessage:
                          options.agentTransferQueueSizeMessage ?? "Queue Size: {QUEUE_SIZE}",
                      agentTransferQueueNextMessage:
                          options.agentTransferQueueNextMessage ?? "You are next in line",
                      agentJoinedMessage: options.agentJoinedMessage ?? "Agent connected",
                      agentLeftMessage: options.agentLeftMessage ?? "Agent disconnected",
                      chatStyle: options.chatStyle
                          ? this.transformChatStyle(options.chatStyle)
                          : undefined,
                      ...(options.showTimestamps != null && {
                          showTimestamps: options.showTimestamps,
                      }),
                      ...(options.showSpeakerLabels != null && {
                          showBotName: options.showSpeakerLabels,
                      }),
                      ...(options.showAvatars != null && {
                          showAvatars: options.showAvatars,
                      }),
                      ...(options.agentAvatarURL != null && {
                          agentAvatarURL: options.agentAvatarURL,
                      }),
                      ...(options.sendButtonSVG != null && {
                          sendButtonSVG: options.sendButtonSVG,
                      }),
                      ...(options.sendButtonDisabledSVG != null && {
                          sendButtonDisabledSVG: options.sendButtonDisabledSVG,
                      }),
                      messageLabelPlacement: options.messageLabelPlacement ?? "",
                  }
        );

        params.append("brand", brandJSON);

        // Subset of the web embed's chat UI strings.
        const chatInterfaceStrings = JSON.stringify(
            shouldOmitDefaultChatStrings
                ? {
                      ...(options.inputPlaceholder != null && {
                          inputPlaceholder: options.inputPlaceholder,
                      }),
                      ...(options.disclosure != null && { disclosure: options.disclosure }),
                      ...(options.conversationEndedMessage != null && {
                          conversationEndedMessage: options.conversationEndedMessage,
                      }),
                      ...(options.newChatButtonLabel != null && {
                          newChatButtonLabel: options.newChatButtonLabel,
                      }),
                      ...(options.saveTranscriptLabel != null && {
                          printTranscriptMenuLabel: options.saveTranscriptLabel,
                      }),
                      ...(options.endConversationLabel != null && {
                          endConversationMenuLabel: options.endConversationLabel,
                      }),
                  }
                : {
                      inputPlaceholder: options.inputPlaceholder ?? "",
                      disclosure: options.disclosure ?? "",
                      conversationEndedMessage: options.conversationEndedMessage ?? "",
                      newChatButtonLabel: options.newChatButtonLabel ?? "",
                      printTranscriptMenuLabel: options.saveTranscriptLabel ?? "",
                      endConversationMenuLabel: options.endConversationLabel ?? "",
                  }
        );
        params.append("chatInterfaceStrings", chatInterfaceStrings);

        if (options.hideTitleBar) {
            params.append("hideTitleBar", "true");
        }

        // Use custom persistence mode to store and load chat session data across views
        params.append("persistenceMode", "custom");

        const conversationOptions = options.conversationOptions ?? {};

        const locale = conversationOptions.locale ?? "en-US";
        params.append("locale", locale);
        // Variables and secrets are intentionally not added to the URL. They are delivered to the
        // web embed via the window.__sierraInitialMemory bridge global (see getInitialMemory and
        // SierraAgentView) so they cannot leak into device, proxy, or analytics logs.

        const shouldUseGreetingMessageAsCustomGreeting =
            !!options.greetingMessage &&
            (!shouldOmitDefaultChatStrings || options.greetingMessage !== DEFAULT_GREETING_MESSAGE);
        const customGreeting =
            conversationOptions.customGreeting ??
            (shouldUseGreetingMessageAsCustomGreeting ? options.greetingMessage : undefined);
        if (customGreeting) {
            params.append("greeting", customGreeting);
        }

        if (conversationOptions.enableContactCenter) {
            params.append("enableContactCenter", "true");
        }

        if (options.canPrintTranscript) {
            params.append("canPrintTranscript", "true");
        }

        if (options.canEndConversation) {
            params.append("canEndConversation", "true");
        }

        if (options.confirmEndConversation) {
            params.append("confirmEndConversation", "true");
        }

        if (options.footerEndConversationButton) {
            params.append("footerEndConversationButton", "true");
        }

        if (options.canStartNewChat) {
            params.append("canStartNewChat", "true");
        }

        if (options.startAtTop) {
            params.append("startAtTop", "true");
        }

        if (options.showScrollToBottom) {
            params.append("showScrollToBottom", "true");
        }

        if (options.pinDisclosure) {
            params.append("pinDisclosure", "true");
        }

        if (options.useConfiguredChatStrings) {
            params.append("useConfiguredChatStrings", "true");
        }

        if (options.useConfiguredStyle) {
            params.append("useConfiguredStyle", "true");
        }

        if (options.autoDetectChatStrings !== undefined) {
            params.append("autoDetectChatStrings", String(options.autoDetectChatStrings));
        }

        if (options.textDirection) {
            params.append("textDirection", options.textDirection);
        }

        if (options.userIdentityToken) {
            params.append("userIdentityToken", options.userIdentityToken);
        }

        if (options.enableConversationList) {
            params.append("enableConversationList", "true");
        }

        if (options.showConversationListByDefault) {
            params.append("showConversationListByDefault", "true");
        }

        if (options.updateVariablesAndSecretsOnSessionResume) {
            params.append("updateVariablesAndSecretsOnSessionResume", "true");
        }

        return `${config.url}?${params.toString()}`;
    }

    private transformChatStyle(chatStyle: ChatStyleOptions): string {
        if (!chatStyle) return JSON.stringify({});

        // Create a clean new object with only the properties we need
        const result: any = {
            colors: chatStyle.colors,
        };

        // Transform typography to type to match the web embed's ChatStyle shape.
        if (chatStyle.typography) {
            const type: any = {
                ...chatStyle.typography,
            };

            // Set all responsive font sizes
            if (chatStyle.typography.fontSize !== undefined) {
                type.fontSize900 = chatStyle.typography.fontSize;
                type.fontSize750 = chatStyle.typography.fontSize;
                type.fontSize500 = chatStyle.typography.fontSize;
            }

            result.type = type;
        }

        return JSON.stringify(result);
    }
}

/**
 * @deprecated Use ConversationStorage from ./models/ConversationStorage instead
 */
export class AgentSessionStorage {
    private storage: Record<string, string> = {};

    getItem(key: string): string | null {
        return this.storage[key] || null;
    }

    setItem(key: string, value: string): void {
        this.storage[key] = value;
    }

    clear(): void {
        this.storage = {};
    }

    // Get all storage items as an object
    getAll(): Record<string, string> {
        return { ...this.storage };
    }
}
