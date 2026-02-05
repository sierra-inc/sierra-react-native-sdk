// Copyright Sierra

import { Agent, AgentSessionStorage } from "./Agent";
import { AgentConfig, AgentAPIHostType } from "./models/AgentConfig";
import { type ChatStyleOptions } from "./models/ChatStyle";
import {
    type ConversationOptions,
    type SecretExpiryResult,
    type SecretExpiryReplyHandler,
} from "./models/ConversationTypes";
import { type ChatOptions } from "./models/ChatOptions";
import { PersistenceMode } from "./models/PersistenceMode";
import { ConversationStorage, type StorageAdapter } from "./models/ConversationStorage";
import SierraAgentView from "./components/SierraAgentView";

export {
    Agent,
    AgentConfig,
    type ChatOptions,
    type ChatStyleOptions,
    type ConversationOptions,
    type SecretExpiryResult,
    type SecretExpiryReplyHandler,
    SierraAgentView,
    AgentAPIHostType,
    PersistenceMode,
    ConversationStorage,
    type StorageAdapter,
    /** @deprecated Use ConversationStorage instead */
    AgentSessionStorage,
};
