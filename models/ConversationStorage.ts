// Copyright Sierra

import { PersistenceMode } from "./PersistenceMode";

/**
 * Interface for async key-value storage adapters.
 * Compatible with @react-native-async-storage/async-storage and similar libraries.
 */
export interface StorageAdapter {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}

/**
 * Manages conversation state storage with pluggable backing stores based on persistence mode.
 *
 * - `none`: No storage, all operations are no-ops
 * - `memory`: In-memory cache only, state lost on app restart
 * - `disk`: In-memory cache backed by StorageAdapter, state survives app restart
 */
export class ConversationStorage {
    private mode: PersistenceMode;
    private cache: Record<string, string> = {};
    private adapter?: StorageAdapter;
    private storageKey: string;
    private loadPromise: Promise<void> | null = null;

    constructor(mode: PersistenceMode, storageKey: string, adapter?: StorageAdapter) {
        this.mode = mode;
        this.storageKey = storageKey;
        this.adapter = adapter;

        if (mode === PersistenceMode.DISK && adapter) {
            this.loadPromise = this.loadFromDisk();
        }
    }

    private async loadFromDisk(): Promise<void> {
        try {
            const stored = await this.adapter!.getItem(this.storageKey);
            if (stored) {
                const parsed: unknown = JSON.parse(stored);
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    this.cache = parsed as Record<string, string>;
                }
            }
        } catch (error) {
            console.warn("Failed to load conversation storage from disk:", error);
        }
    }

    /**
     * Wait for storage to finish loading from disk.
     * Returns immediately for NONE and MEMORY modes.
     * For DISK mode, resolves when the initial load completes.
     */
    waitForLoad(): Promise<void> {
        return this.loadPromise ?? Promise.resolve();
    }

    /**
     * Get a value from storage.
     * @param key The key to look up
     * @returns The stored value, or null if not found or in NONE mode
     */
    getItem(key: string): string | null {
        if (this.mode === PersistenceMode.NONE) return null;
        return this.cache[key] ?? null;
    }

    /**
     * Store a value.
     * @param key The key to store under
     * @param value The value to store
     */
    setItem(key: string, value: string): void {
        if (this.mode === PersistenceMode.NONE) return;
        this.cache[key] = value;
        if (this.mode === PersistenceMode.DISK && this.adapter) {
            this.adapter.setItem(this.storageKey, JSON.stringify(this.cache)).catch(error => {
                console.warn("Failed to persist conversation storage:", error);
            });
        }
    }

    /**
     * Clear all stored values.
     */
    clear(): void {
        this.cache = {};
        if (this.mode === PersistenceMode.DISK && this.adapter) {
            this.adapter.removeItem(this.storageKey).catch(error => {
                console.warn("Failed to clear conversation storage:", error);
            });
        }
    }

    /**
     * Get all stored values as an object.
     * @returns A copy of all stored key-value pairs
     */
    getAll(): Record<string, string> {
        return { ...this.cache };
    }
}
