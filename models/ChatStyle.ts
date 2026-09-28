// Copyright Sierra

import { type ChatButtonStyle } from "./ChatButtonStyle";

/**
 * Type for ChatStyleColors options.
 * Color values accept `#RRGGBB` hex strings. The `background`, `assistantBubble`,
 * `humanAgentBubble`, `userBubble`, `assistantBubbleBorder`, `humanAgentBubbleBorder`,
 * `userBubbleBorder`, `inputPlaceholder`, `disclosure`, and `disclosureLink` colors also accept
 * `#RRGGBBAA`, where the last pair of digits sets the opacity. Every other color must be fully
 * opaque.
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
    /**
     * The color of the message composer's border, drawn when
     * `ChatComposerStyle.borderWidth` is set. When omitted, falls back to `border`.
     */
    inputBorder?: string;
    /**
     * The message composer border color while the input is focused. Only
     * applies when `ChatComposerStyle` gives the composer its own surface and
     * sets `borderWidth`. When omitted, `inputBorder` remains in use while
     * focused.
     */
    inputFocusBorder?: string;
    /**
     * The color of the text the user types in the message input. When omitted,
     * falls back to `text`.
     */
    inputText?: string;
    titleBar?: string;
    titleBarText?: string;
    assistantBubble?: string;
    assistantBubbleText?: string;
    /** Human-agent bubble background. Defaults to `assistantBubble`, including opacity. */
    humanAgentBubble?: string;
    /** Human-agent bubble text color. Defaults to `assistantBubbleText`. */
    humanAgentBubbleText?: string;
    /** Human-agent bubble link color. Defaults to `assistantBubbleLink`. */
    humanAgentBubbleLink?: string;
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
     * `inputText` at reduced opacity; when set, its configured opacity is used.
     */
    inputPlaceholder?: string;
    /**
     * The color of the file upload (attachment) button icon in the chat input.
     * When omitted, falls back to `userBubble`. Override this when `userBubble`
     * does not contrast well with `background` in light or dark mode.
     */
    uploadButtonIcon?: string;
    /**
     * The color of the disclosure (disclaimer) text. When omitted, defaults to
     * `text` at 65% opacity; when set, its configured opacity is used.
     */
    disclosure?: string;
    /**
     * The color of links within the disclosure (disclaimer) text. When omitted,
     * defaults to `assistantBubbleLink` at 65% opacity; when set, its configured
     * opacity is used.
     */
    disclosureLink?: string;
    /** The color of links in chat bubbles for messages from the user. */
    userBubbleLink?: string;
    /** The color of links in chat bubbles for messages from the AI assistant. */
    assistantBubbleLink?: string;
    /** The border color for AI assistant chat bubbles. When omitted, no border is drawn. */
    assistantBubbleBorder?: string;
    /** The border color for user chat bubbles. When omitted, no border is drawn. */
    userBubbleBorder?: string;
    /** Human-agent bubble border color. Defaults to `assistantBubbleBorder`. */
    humanAgentBubbleBorder?: string;
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
    /** Text alignment. When omitted, keeps the region's default alignment. */
    textAlign?: "left" | "center" | "right" | "start" | "end";
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

/**
 * Insets for one edge box of the message composer, in pixels. `start` and `end`
 * are logical, so one set of insets is correct in both layout directions.
 */
export interface ChatComposerInsets {
    /** Inset from the top edge. */
    top?: number;
    /** Inset from the leading edge (left in LTR, right in RTL). */
    start?: number;
    /** Inset from the bottom edge. */
    bottom?: number;
    /** Inset from the trailing edge (right in LTR, left in RTL). */
    end?: number;
}

/**
 * Layout overrides for the message composer (the text input and its action buttons).
 * Every field is optional and overrides only its own default, so an omitted
 * `composerStyle` leaves the composer unchanged. Supplying `outerInsets` insets the
 * composer from the edges of the chat and paints the `inputBackground` color on the
 * composer itself, so the inset gutter shows the chat background.
 *
 * Composer colors stay in `ChatStyleColors`: `inputBackground`, `inputBorder`,
 * `inputFocusBorder`, `inputText`, and `inputPlaceholder`.
 */
export interface ChatComposerStyle {
    /** Space between the edges of the chat and the composer. */
    outerInsets?: ChatComposerInsets;
    /**
     * Space between the composer's edges and its content. Replaces the default
     * padding around the text input and its action buttons.
     */
    contentInsets?: ChatComposerInsets;
    /** Minimum height of the composer. */
    minimumHeight?: number;
    /** Number of lines the text input grows to before it starts scrolling. */
    maximumLines?: number;
    /** Corner radius of the composer. */
    cornerRadius?: number;
    /** Width of the composer's border. Drawn in `ChatStyleColors.inputBorder`. */
    borderWidth?: number;
    /** Width and height of the send and upload buttons. */
    actionButtonSize?: number;
    /**
     * Width and height of the send and upload button glyphs. The rendered size is
     * clamped to the effective action button size. Does not resize SVGs that
     * replace the complete send button.
     */
    actionIconSize?: number;
}

/** Style overrides for inline end-conversation confirmation. Omitted fields keep their defaults. */
export interface EndConversationConfirmationStyle {
    showFooterDivider?: boolean;
    confirmButton?: ChatButtonStyle;
    cancelButton?: ChatButtonStyle;
}
