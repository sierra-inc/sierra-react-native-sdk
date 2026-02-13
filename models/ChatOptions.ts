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

    /** Hide the title bar at the top of the chat UI. */
    hideTitleBar?: boolean;

    /** Customization of the conversation that the controller will create. */
    conversationOptions?: ConversationOptions;

    /** If true, the user will be able to save a conversation transcript via a menu item. */
    canPrintTranscript?: boolean;

    /** If true, the user will be able to end a conversation via a menu item. */
    canEndConversation?: boolean;

    /** If true, the user will be able to start a new conversation via a button in the chat UI. */
    canStartNewChat?: boolean;

    /**
     * Start the chat with messages at the top of the chat frame, allowing the conversation to
     * expand downward until the frame height has been reached, at which point older messages
     * scroll out of view.
     */
    startAtTop?: boolean;

    /**
     * Pin the disclosure text to the top of the chat frame so that it is visible throughout
     * the conversation and never scrolls out of view.
     */
    pinDisclosure?: boolean;

    /**
     * Whether to show timestamps on chat messages. If not set, the server-configured value
     * from the Style panel is used.
     */
    showTimestamps?: boolean;

    /**
     * Whether to show speaker labels (e.g. the agent name) on chat messages. If not set,
     * the server-configured value from the Style panel is used.
     */
    showSpeakerLabels?: boolean;

    /**
     * Controls whether the message label (speaker name and timestamp) is shown above or below
     * chat message bubbles. When not set and useConfiguredStyle is true, the server-configured
     * value from the Style panel is used.
     */
    messageLabelPlacement?: "above" | "below";
}
