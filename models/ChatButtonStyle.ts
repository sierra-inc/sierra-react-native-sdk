// Copyright Sierra

/** Optional overrides for a chat button. Dimensions use CSS strings with px, em, rem, or % units, except borderWidth cannot use %. */
export interface ChatButtonStyle {
    /** Start and end follow the text direction. */
    alignment?: "start" | "center" | "end";
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: string;
    height?: string;
    width?: string;
    padding?: string;
    borderRadius?: string;
    /** Decorative SVG before the label. Sanitized by the shared renderer. */
    iconSVG?: string;
}

/** An optional text-message action above the composer. */
export interface MessageInputPresetAction {
    label: string;
    clientEvent: { type: "message"; message: { content: string } };
    showAfterAgentMessageCount?: number;
    style?: ChatButtonStyle;
}
