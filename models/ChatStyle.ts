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
 * Type for ChatStyle options
 */
export interface ChatStyleOptions {
    colors?: ChatStyleColors;
}
