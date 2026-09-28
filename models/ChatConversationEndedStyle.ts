// Copyright Sierra

import type { ChatButtonStyle } from "./ChatButtonStyle";

/** Optional layout for an ended conversation. Omitted fields keep their defaults. */
export interface ChatConversationEndedStyle {
    /** Logical alignment of the ended message. */
    messageAlignment?: "start" | "center" | "end";
    /** Show the conversation disclosure after the conversation ends. Defaults to true. */
    showDisclosure?: boolean;
    /** Keep the composer background, border, sizing, and insets. Defaults to true. */
    showComposerContainer?: boolean;
    /** Space above the new-chat action, in pixels. Clamped to 0-320; zero removes it. */
    actionSpacing?: number;
    /** Style of this conversation's new-chat button, separate from the list button. */
    newChatButtonStyle?: ChatButtonStyle;
}
