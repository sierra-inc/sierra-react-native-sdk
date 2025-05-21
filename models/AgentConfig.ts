// Copyright Sierra

/**
 * Enum for API host environments
 * @readonly
 */
export enum AgentAPIHostType {
    PROD = "prod",
    STAGING = "staging",
    LOCAL = "local",
}
/**
 * Configuration for the Sierra Agent
 */
export class AgentConfig {
    token: string;
    apiHost: AgentAPIHostType;

    /**
     * @param token - The agent token
     * @param apiHost - The API host to use
     */
    constructor(token: string, apiHost?: AgentAPIHostType) {
        this.token = token;
        this.apiHost = apiHost || AgentAPIHostType.PROD;
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
            case AgentAPIHostType.STAGING:
                return "https://staging.sierra.chat";
            case AgentAPIHostType.LOCAL:
                return "https://chat.sierra.codes:8083";
            default:
                return "https://sierra.chat";
        }
    }
}
