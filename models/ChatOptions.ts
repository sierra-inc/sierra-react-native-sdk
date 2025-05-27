// Copyright Sierra

import { ChatStyleOptions } from "./ChatStyle";
import { ConversationOptions } from "./ConversationTypes";

/**
 * Interface to configure custom chat options
 */
export interface ChatOptions {
    name: string;
    greetingMessage?: string;
    disclosure?: string;
    errorMessage?: string;
    inputPlaceholder?: string;
    conversationEndedMessage?: string;
    agentTransferWaitingMessage?: string;
    agentJoinedMessage?: string;
    agentLeftMessage?: string;
    hideTitleBar?: boolean;
    chatStyle?: ChatStyleOptions;
    conversationOptions?: ConversationOptions;
    canPrintTranscript?: boolean;
    canEndConversation?: boolean;
    canStartNewChat?: boolean;
}
