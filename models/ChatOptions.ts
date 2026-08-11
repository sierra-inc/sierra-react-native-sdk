// Copyright Sierra

import { ChatStyleOptions } from "./ChatStyle";
import { ConversationOptions } from "./ConversationTypes";

/**
 * Interface to configure custom chat options
 */
export interface ChatOptions {
    name: string;

    /**
     * Use chat interface strings configured on the server (greeting, error messages, etc.),
     * including server-managed locale/direction settings for those strings.
     * When enabled, server-configured values take precedence over local string options.
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
     * Message shown when a conversation was ended due to inactivity.
     * Overridden by server-configured inactivity message if useConfiguredChatStrings is true.
     */
    inactivityMessage?: string;

    /**
     * Message shown when waiting for a human agent to join the conversation.
     * Overridden by server-configured waiting message if useConfiguredChatStrings is true.
     */
    agentTransferWaitingMessage?: string;

    /**
     * Message shown when waiting for a human agent to join the conversation, and the queue
     * size is known. "{QUEUE_SIZE}" will be replaced with the size of the queue. Overridden by
     * server-configured queue size message if useConfiguredChatStrings is true.
     */
    agentTransferQueueSizeMessage?: string;

    /**
     * Message shown when waiting for a human agent to join the conversation, and the user is
     * next in line. Overridden by server-configured queue next message if
     * useConfiguredChatStrings is true.
     */
    agentTransferQueueNextMessage?: string;

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

    /**
     * Inline SVG markup for the chat send button. Replaces the default send arrow (including
     * its background) when provided. Overridden by the server-configured value if useConfiguredStyle
     * is true.
     */
    sendButtonSVG?: string;

    /**
     * Inline SVG markup for the send button when it is disabled (e.g. the input is empty).
     * Falls back to sendButtonSVG when not provided. Overridden by the server-configured value
     * if useConfiguredStyle is true.
     */
    sendButtonDisabledSVG?: string;

    /** Hide the title bar at the top of the chat UI. */
    hideTitleBar?: boolean;

    /**
     * A signed JWT that identifies the end user for this session. When set, the token is
     * forwarded to the server on every chat request for identity resolution. The server
     * extracts the `sub` claim and resolves a persistent EndUser, enabling cross-session
     * memory and conversation history. Must be an RS256-signed JWT with `aud: "sierra.ai"`.
     */
    userIdentityToken?: string;

    /** Whether to show the conversation list UI. Requires userIdentityToken. */
    enableConversationList?: boolean;

    /** Whether to show the conversation list by default when the chat opens. */
    showConversationListByDefault?: boolean;

    /**
     * When true, the variables and secrets supplied via `conversationOptions` are re-sent when an
     * existing conversation is resumed (e.g. when the view is recreated with new values), so the
     * resumed conversation picks them up. Values are merged per key (later values win); keys not
     * supplied are left unchanged. When false (the default), variables and secrets are only applied
     * when the conversation is first created.
     */
    updateVariablesAndSecretsOnSessionResume?: boolean;

    /** Customization of the conversation that the controller will create. */
    conversationOptions?: ConversationOptions;

    /** If true, the user will be able to save a conversation transcript via a menu item. */
    canPrintTranscript?: boolean;

    /** If true, the user will be able to end a conversation via a menu item. */
    canEndConversation?: boolean;

    /**
     * If true, the user is asked to confirm before the conversation ends. The confirmation is
     * shown inline within the chat (covering the transcript and input). Only effective when
     * `canEndConversation` is true.
     */
    confirmEndConversation?: boolean;

    /**
     * If true, an end conversation button is shown in the chat footer (above the input) while the
     * user is waiting for or speaking with a live agent. While waiting, the agent's transfer
     * waiting message takes precedence when the agent has it enabled. Only effective when
     * `canEndConversation` is true.
     */
    footerEndConversationButton?: boolean;

    /**
     * If true, a "new chat" button is shown on the conversation view after the conversation
     * has ended. Only effective when `canEndConversation` is true. When the conversation list
     * is enabled, the list view always includes its own button to start a new chat regardless
     * of this setting.
     */
    canStartNewChat?: boolean;

    /**
     * Start the chat with messages at the top of the chat frame, allowing the conversation to
     * expand downward until the frame height has been reached, at which point older messages
     * scroll out of view.
     */
    startAtTop?: boolean;

    /**
     * Whether to show a scroll-to-bottom indicator when the user scrolls up in the chat.
     */
    showScrollToBottom?: boolean;

    /**
     * Pin the disclosure text to the top of the chat frame so that it is visible throughout
     * the conversation and never scrolls out of view. This controls where the disclosure sits
     * within the conversation view, and has no effect when disclosurePlacement is
     * "conversationList".
     */
    pinDisclosure?: boolean;

    /**
     * Which view(s) the disclosure text is displayed in. Defaults to "conversation".
     *
     * - "conversation": above the conversation transcript.
     * - "conversationList": centered below the "start new chat" button in the conversation
     *   list, and not shown in the conversation itself. Requires enableConversationList.
     * - "both": displayed in both views.
     */
    disclosurePlacement?: "conversation" | "conversationList" | "both";

    /**
     * When true, removes the divider (top border) drawn between the chat transcript and the
     * message input area. Defaults to false.
     */
    removeInputDivider?: boolean;

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
     * Whether or not to show per-message avatars for agents. When enabled, the
     * chat shows avatars next to live agent messages using image URLs provided
     * by the contact center. If `agentAvatarURL` is also set, that image is
     * shown next to virtual agent messages. If not set, the server-configured
     * value from the Style panel is used.
     */
    showAvatars?: boolean;

    /**
     * HTTPS URL of an image to show next to virtual agent messages when
     * `showAvatars` is enabled. Values are trimmed and must be 2048 characters
     * or fewer. If not set, the server-configured value from the Style panel is
     * used.
     */
    agentAvatarURL?: string;

    /**
     * Controls whether the message label (speaker name and timestamp) is shown above or below
     * chat message bubbles. When not set and useConfiguredStyle is true, the server-configured
     * value from the Style panel is used.
     */
    messageLabelPlacement?: "above" | "below";

    /**
     * Explicitly set whether or not to auto-detect locale-specific chat strings and text direction
     * from the conversation locale.
     */
    autoDetectChatStrings?: boolean;

    /**
     * Explicitly set the text direction of the chat window.
     * - `"ltr"`: Forces the chat window to use a left-to-right language layout.
     * - `"rtl"`: Forces the chat window to use a right-to-left language layout.
     * - `"auto"`: Text direction is automatically configured from the conversation locale.
     * When not set, automatically determined from locale if auto-detection is active --
     * either via `autoDetectChatStrings` or the server's Agent Studio configuration
     * when `useConfiguredChatStrings` is true. Otherwise falls back to the server
     * value when `useConfiguredChatStrings` is true, or left-to-right.
     */
    textDirection?: "ltr" | "rtl" | "auto";

    /** Menu label for the conversation transcript saving item. */
    saveTranscriptLabel?: string;

    /** Menu label for the conversation ending item. */
    endConversationLabel?: string;

    /** Label for the new chat button. */
    newChatButtonLabel?: string;
}
