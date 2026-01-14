// Copyright Sierra

/**
 * Options for a conversation with an agent
 */
export type ConversationOptions = {
    variables?: Record<string, string>;
    secrets?: Record<string, string>;
    locale?: string;
    customGreeting?: string;
    enableContactCenter?: boolean;
};

/**
 * Interface for transfer data
 */
export interface TransferData {
    isSynchronous?: boolean;
    isContactCenter?: boolean;
    data?: Record<string, any>;
}

/**
 * Information about a transfer to a human agent
 */
export class ConversationTransfer {
    isSynchronous: boolean;
    isContactCenter: boolean;
    data: Record<string, any>;

    /**
     * @param data - Transfer data
     */
    constructor(data?: TransferData) {
        this.isSynchronous = data?.isSynchronous || false;
        this.isContactCenter = data?.isContactCenter || false;
        this.data = data?.data || {};
    }

    /**
     * Create a ConversationTransfer from a JSON string
     * @param json - JSON string to parse
     * @returns The parsed transfer, or null if parsing failed
     */
    static fromJSON(json: string): ConversationTransfer | null {
        try {
            const data = JSON.parse(json);

            // Handle the case where data might be an array of key-value pairs
            if (data.data && Array.isArray(data.data)) {
                const dataMap: Record<string, any> = {};
                for (const item of data.data) {
                    if (item.key && item.value) {
                        dataMap[item.key] = item.value;
                    }
                }
                data.data = dataMap;
            }

            return new ConversationTransfer(data);
        } catch (error) {
            console.error("Error decoding transfer data:", error);
            return null;
        }
    }
}

/**
 * Result type for secret expiry callback responses.
 */
export type SecretExpiryResult = { value: string | null } | { error: string };

/**
 * Reply handler type for secret expiry callbacks.
 */
export type SecretExpiryReplyHandler = (result: SecretExpiryResult) => void;

/**
 * Callbacks for conversation events
 */
export class ConversationCallbacks {
    /**
     * Callback invoked when the user chatting with the virtual agent has requested a transfer to an
     * external agent.
     * @param transfer - Information about the transfer
     */
    onConversationTransfer(_transfer: ConversationTransfer): void {}

    /**
     * Callback invoked when the virtual agent finishes replying to the user.
     * Not invoked for the greeting message.
     */
    onAgentMessageEnd(): void {}

    /**
     * Callback invoked when the conversation ends.
     */
    onConversationEnded(): void {}

    /**
     * Callback invoked when a secret needs to be refreshed. Reply handler should be invoked with one of:
     * - { value: newValue } - a new value for the secret
     * - { value: null } - if the secret cannot be provided due to a known condition (e.g. the user has signed out)
     * - { error: errorMessage } - if the secret cannot be fetched right now, but the request should be retried
     * @param secretName - The name of the secret that needs refreshing
     * @param replyHandler - Function to call with the refresh result
     */
    onSecretExpiry(_secretName: string, replyHandler: SecretExpiryReplyHandler): void {
        replyHandler({ value: null });
    }
}
