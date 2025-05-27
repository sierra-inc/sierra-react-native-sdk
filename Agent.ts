// Copyright Sierra

import { AgentConfig } from "./models/AgentConfig";
import { ChatOptions } from "./models/ChatOptions";

/**
 * Main agent class that handles Sierra chat functionality
 */
export class Agent {
    private config: AgentConfig;
    private options: ChatOptions;
    private url: string;
    private sessionStorage: AgentSessionStorage;
    /**
     * Create a new Agent instance
     * @param config - Configuration for the agent
     * @param options - Options for the chat
     */
    constructor({ config, options }: { config: AgentConfig; options: ChatOptions }) {
        this.config = config;
        this.sessionStorage = new AgentSessionStorage();

        this.options = options;
        this.url = this.buildUrl(this.options);
    }

    /**
     * Get the agent's session storage
     * @returns The session storage object
     */
    getSessionStorage(): AgentSessionStorage {
        return this.sessionStorage;
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
            errorMessage:
                options.errorMessage ?? "Oops, an error was encountered! Please try again.",
            greetingMessage: options.greetingMessage ?? "How can I help you today?",
            disclosure: options.disclosure,
            inputPlaceholder: options.inputPlaceholder ?? "Message…",
            agentTransferWaitingMessage:
                options.agentTransferWaitingMessage ?? "Waiting for agent…",
            agentJoinedMessage: options.agentJoinedMessage ?? "Agent connected",
            agentLeftMessage: options.agentLeftMessage ?? "Agent disconnected",
            conversationEndedMessage: options.conversationEndedMessage ?? "Chat Ended",
            chatStyle: options.chatStyle ? JSON.stringify(options.chatStyle) : undefined,
        });

        params.append("brand", brandJSON);

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

        return `${config.url}?${params.toString()}`;
    }
}

// Session storage implementation for the agent
class AgentSessionStorage {
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
