// Copyright Sierra

/**
 * Type for ChatStyleColors options
 */
export interface ChatStyleColors {
    background?: string;
    text?: string;
    border?: string;
    titleBar?: string;
    titleBarText?: string;
    assistantBubble?: string;
    assistantBubbleText?: string;
    userBubble?: string;
    userBubbleText?: string;
}

/**
 * Type for ChatStyleTypography options
 */
export interface ChatStyleTypography {
    /**
     * The font family, a comma-separated list of font names.
     * Note: Only built-in system fonts are supported. Custom fonts loaded by the app are not available.
     */
    fontFamily?: string;
    /** The font size, in pixels. */
    fontSize?: number;
}

/**
 * Type for ChatStyle options
 */
export interface ChatStyleOptions {
    colors?: ChatStyleColors;
    typography?: ChatStyleTypography;
}
