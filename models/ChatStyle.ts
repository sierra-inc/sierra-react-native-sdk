// Copyright Sierra

/**
 * Type for ChatStyleColors options.
 * Overridden by server-configured styles if useConfiguredStyle is true in ChatOptions.
 */
export interface ChatStyleColors {
    background?: string;
    text?: string;
    border?: string;
    /**
     * The background color of the message input area (the region below the divider
     * that contains the text input). When omitted, falls back to `background`.
     */
    inputBackground?: string;
    titleBar?: string;
    titleBarText?: string;
    assistantBubble?: string;
    assistantBubbleText?: string;
    userBubble?: string;
    userBubbleText?: string;
    /**
     * The color of the new-chat button. When the button appears as a flat button
     * in the chat footer, this controls the text color. When the button appears as
     * a filled button in the conversation list, this controls the background color;
     * in that case `newChatButtonText` controls the text color. When omitted, falls
     * back to `userBubble`.
     */
    newChatButton?: string;
    /**
     * The text color of the new-chat button in the conversation list. When omitted,
     * falls back to `userBubbleText`.
     */
    newChatButtonText?: string;
    /**
     * The color of the placeholder text shown in the message input, also used for
     * the send button arrow when the input is empty. When omitted, falls back to
     * `text` at reduced opacity; when set, it is used at full opacity.
     */
    inputPlaceholder?: string;
    /**
     * The color of the file upload (attachment) button icon in the chat input.
     * When omitted, falls back to `userBubble`. Override this when `userBubble`
     * does not contrast well with `background` in light or dark mode.
     */
    uploadButtonIcon?: string;
    /** The color of the disclosure (disclaimer) text. When omitted, the default disclosure text color is used. */
    disclosure?: string;
    /** The color of links within the disclosure (disclaimer) text. */
    disclosureLink?: string;
    /** The color of links in chat bubbles for messages from the user. */
    userBubbleLink?: string;
    /** The color of links in chat bubbles for messages from the AI assistant. */
    assistantBubbleLink?: string;
}

/**
 * Styling overrides for hyperlinks within a region's text (e.g. links in the
 * disclosure or in chat bubbles).
 */
export interface ChatLinkStyle {
    /** The font weight (or boldness) of hyperlinks. */
    fontWeight?: number;
    /** The font style of hyperlinks. */
    fontStyle?: "normal" | "italic";
    /**
     * Underline behavior for hyperlinks. "hover" (the default) underlines on
     * hover only; on touch devices this effectively means no underline at rest.
     */
    underline?: "always" | "hover" | "none";
}

/**
 * Typography overrides for a specific region of the chat UI (e.g. user bubbles,
 * agent bubbles, the title bar, or the disclosure text).
 */
export interface ChatTextStyle {
    /** The font size, in pixels. */
    fontSize?: number;
    /** The font weight, or boldness. */
    fontWeight?: number;
    /** The line height, as a unitless multiplier of the font size. */
    lineHeight?: number;
    /** The horizontal spacing between text characters, in em units. */
    letterSpacing?: number;
    /**
     * The font family, a comma-separated list of font names. Overrides the
     * global `fontFamily` for this region.
     * Note: Only built-in system fonts are supported.
     */
    fontFamily?: string;
    /** The font style. */
    fontStyle?: "normal" | "italic";
    /** Styling overrides for hyperlinks within this region's text. */
    link?: ChatLinkStyle;
}

/**
 * Type for ChatStyleTypography options.
 * Overridden by server-configured styles if useConfiguredStyle is true in ChatOptions.
 */
export interface ChatStyleTypography {
    /**
     * The font family, a comma-separated list of font names.
     * Note: Only built-in system fonts are supported. Custom fonts loaded by the app are not available.
     */
    fontFamily?: string;
    /** The font size, in pixels. */
    fontSize?: number;
    /** Typography overrides for chat bubbles from the user. */
    userBubble?: ChatTextStyle;
    /** Typography overrides for chat bubbles from the AI assistant. */
    assistantBubble?: ChatTextStyle;
    /** Typography overrides for the title bar text. */
    titleBar?: ChatTextStyle;
    /** Typography overrides for the disclosure (disclaimer) text. */
    disclosure?: ChatTextStyle;
    /** Typography overrides for the message input text. */
    messageInput?: ChatTextStyle;
}

/**
 * Type for ChatStyle options.
 * Overridden by server-configured styles if useConfiguredStyle is true in ChatOptions.
 * Server-configured styles provide a centralized way to manage chat appearance across all platforms.
 */
export interface ChatStyleOptions {
    colors?: ChatStyleColors;
    typography?: ChatStyleTypography;
}
