// Copyright Sierra

/**
 * Controls how conversation state is persisted.
 */
export enum PersistenceMode {
    /**
     * No persistence. Conversation state is lost when the chat view is destroyed.
     * Use for apps that must not store any conversation data.
     */
    NONE = "none",

    /**
     * In-memory persistence. Conversation survives navigation and view recreation,
     * but is lost on app restart. This is the default.
     */
    MEMORY = "memory",

    /**
     * Disk persistence. Conversation survives app restart.
     * Requires a storageAdapter to be provided to the Agent constructor.
     */
    DISK = "disk",
}
