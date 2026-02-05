// Copyright Sierra

import { PersistenceMode } from "./PersistenceMode";

/**
 * Enum for API host environments
 * @readonly
 */
export enum AgentAPIHostType {
    PROD = "prod",
    EU = "eu",
    SG = "sg",
    STAGING = "staging",
    LOCAL = "local",
}
/**
 * Configuration for the Sierra Agent
 */
export class AgentConfig {
    token: string;
    target?: string;
    apiHost: AgentAPIHostType;
    persistence: PersistenceMode;

    /**
     * @param token - The agent token
     * @param target - Optional release target name
     * @param apiHost - The API host to use
     * @param persistence - How conversation state is persisted (default: MEMORY)
     */
    constructor(
        token: string,
        target?: string,
        apiHost?: AgentAPIHostType,
        persistence?: PersistenceMode
    ) {
        this.token = token;
        this.target = target;
        this.apiHost = apiHost || AgentAPIHostType.PROD;
        this.persistence = persistence || PersistenceMode.MEMORY;
    }

    /**
     * Get the URL for the agent
     * @returns The URL for the agent
     */
    get url(): string {
        return `${this.getEmbedBaseURL(this.apiHost)}/agent/${this.token}/mobile`;
    }

    private getEmbedBaseURL(host: AgentAPIHostType): string {
        switch (host) {
            case AgentAPIHostType.PROD:
                return "https://sierra.chat";
            case AgentAPIHostType.EU:
                return "https://eu.sierra.chat";
            case AgentAPIHostType.SG:
                return "https://sg.sierra.chat";
            case AgentAPIHostType.STAGING:
                return "https://staging.sierra.chat";
            case AgentAPIHostType.LOCAL:
                return "https://chat.sierra.codes:8083";
            default:
                return "https://sierra.chat";
        }
    }
}
