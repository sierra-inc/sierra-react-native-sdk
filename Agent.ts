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

    private buildUrl(options: ChatOptions): string {
        const { config } = this;

        const params = new URLSearchParams();

        // Add the specific release target for the agent
        if (config.target) {
            params.append("target", config.target);
        }

        // Should match the Brand type from bots/useChat.tsx
        const brandJSON = JSON.stringify({
            botName: options.name ?? "Your virtual assistant",
            greetingMessage: options.greetingMessage ?? "How can I help you today?",
            errorMessage:
                options.errorMessage ?? "Oops, an error was encountered! Please try again.",
            agentTransferWaitingMessage:
                options.agentTransferWaitingMessage ?? "Waiting for agent…",
            agentJoinedMessage: options.agentJoinedMessage ?? "Agent connected",
            agentLeftMessage: options.agentLeftMessage ?? "Agent disconnected",
            chatStyle: options.chatStyle ? this.transformChatStyle(options.chatStyle) : undefined,
        });

        params.append("brand", brandJSON);

        // Subset of the ChatUiStrings type from chat/ui-strings.ts
        const chatInterfaceStrings = JSON.stringify({
            inputPlaceholder: options.inputPlaceholder ?? "",
            disclosure: options.disclosure ?? "",
            conversationEndedMessage: options.conversationEndedMessage ?? "",
        });
        params.append("chatInterfaceStrings", chatInterfaceStrings);

        if (options.hideTitleBar) {
            params.append("hideTitleBar", "true");
        }

        // Use custom persistence mode to store and load chat session data across views
        params.append("persistenceMode", "custom");

        const conversationOptions = options.conversationOptions ?? {};

        const locale = conversationOptions.locale ?? "en-US";
        params.append("locale", locale);
        // Add variables
        if (conversationOptions.variables) {
            for (const [name, value] of Object.entries(conversationOptions.variables)) {
                params.append("variable", `${name}:${value}`);
            }
        }
        // Add secrets
        if (conversationOptions.secrets) {
            for (const [name, value] of Object.entries(conversationOptions.secrets)) {
                params.append("secret", `${name}:${value}`);
            }
        }

        const customGreeting = conversationOptions.customGreeting ?? options.greetingMessage;
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

        if (options.canStartNewChat) {
            params.append("canStartNewChat", "true");
        }

        if (options.startAtTop) {
            params.append("startAtTop", "true");
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

        return `${config.url}?${params.toString()}`;
    }

    private transformChatStyle(chatStyle: ChatStyleOptions): string {
        if (!chatStyle) return JSON.stringify({});

        // Create a clean new object with only the properties we need
        const result: any = {
            colors: chatStyle.colors,
        };

        // Transform typography to type to match the ChatStyle type from ui/chat/chat.tsx
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
