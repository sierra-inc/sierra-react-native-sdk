// Copyright Sierra

import { Agent, AgentSessionStorage } from "./Agent";
import { AgentConfig, AgentAPIHostType } from "./models/AgentConfig";
import {
    type ChatStyleOptions,
    type ChatComposerInsets,
    type EndConversationConfirmationStyle,
    type ChatComposerStyle,
} from "./models/ChatStyle";
import {
    type ConversationOptions,
    type SecretExpiryResult,
    type SecretExpiryReplyHandler,
} from "./models/ConversationTypes";
import { type ChatOptions } from "./models/ChatOptions";
import { type ChatButtonStyle, type MessageInputPresetAction } from "./models/ChatButtonStyle";
import { type ChatConversationEndedStyle } from "./models/ChatConversationEndedStyle";
import { PersistenceMode } from "./models/PersistenceMode";
import { ConversationStorage, type StorageAdapter } from "./models/ConversationStorage";
import SierraAgentView from "./components/SierraAgentView";
import {
    type AddAgentTagsOptions,
    type SierraAgentViewHandle,
    type UserAttachment,
} from "./components/SierraAgentView";

export {
    Agent,
    AgentConfig,
    type EndConversationConfirmationStyle,
    type ChatOptions,
    type ChatButtonStyle,
    type ChatConversationEndedStyle,
    type MessageInputPresetAction,
    type ChatStyleOptions,
    type ConversationOptions,
    type SecretExpiryResult,
    type SecretExpiryReplyHandler,
    SierraAgentView,
    type AddAgentTagsOptions,
    type SierraAgentViewHandle,
    type UserAttachment,
    AgentAPIHostType,
    PersistenceMode,
    ConversationStorage,
    type StorageAdapter,
    /** @deprecated Use ConversationStorage instead */
    AgentSessionStorage,
    type ChatComposerInsets,
    type ChatComposerStyle,
};
