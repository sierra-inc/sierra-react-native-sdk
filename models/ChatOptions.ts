// Copyright Sierra

import { ChatStyleOptions } from "./ChatStyle";
import { ConversationOptions } from "./ConversationTypes";

/**
 * Interface to configure custom chat options
 */
export interface ChatOptions {
    name: string;

    /**
     * Use chat interface strings configured on the server (greeting, error messages, etc.).
     * When enabled, server-configured strings take precedence over local string options.
     * @default false
     */
    useConfiguredChatStrings?: boolean;

    /**
     * Use styling configured on the server (colors, typography, logo, etc.).
     * When enabled, server-configured styles take precedence over local chatStyle.
     * @default false
     */
    useConfiguredStyle?: boolean;

    /**
     * Message shown from the agent when starting the conversation.
     * Overridden by server-configured greeting message if useConfiguredChatStrings is true.
     */
    greetingMessage?: string;

    /**
     * Secondary text to display above the agent message at the start of a conversation.
     * Overridden by server-configured disclosure if useConfiguredChatStrings is true.
     */
    disclosure?: string;

    /**
     * Message shown when an error is encountered during the conversation.
     * Overridden by server-configured error message if useConfiguredChatStrings is true.
     */
    errorMessage?: string;

    /**
     * Placeholder value displayed in the chat input when it is empty.
     * Overridden by server-configured input placeholder if useConfiguredChatStrings is true.
     * Defaults to "Message..." when this value is empty.
     */
    inputPlaceholder?: string;

    /**
     * Message shown in place of the chat input when the conversation has ended.
     * Overridden by server-configured conversation ended message if useConfiguredChatStrings is true.
     * Defaults to "Chat ended" when this value is empty.
     */
    conversationEndedMessage?: string;

    /**
     * Message shown when waiting for a human agent to join the conversation.
     * Overridden by server-configured waiting message if useConfiguredChatStrings is true.
     */
    agentTransferWaitingMessage?: string;

    /**
     * Message shown when a human agent has joined the conversation.
     * Overridden by server-configured joined message if useConfiguredChatStrings is true.
     */
    agentJoinedMessage?: string;

    /**
     * Message shown when a human agent has left the conversation.
     * Overridden by server-configured left message if useConfiguredChatStrings is true.
     */
    agentLeftMessage?: string;

    /**
     * Customize the colors and other appearance of the chat UI.
     * Overridden by server-configured chat style if useConfiguredStyle is true.
     */
    chatStyle?: ChatStyleOptions;

    hideTitleBar?: boolean;
    conversationOptions?: ConversationOptions;
    canPrintTranscript?: boolean;
    canEndConversation?: boolean;
    canStartNewChat?: boolean;
    startAtTop?: boolean;
    pinDisclosure?: boolean;
}
