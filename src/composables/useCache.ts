import { ref } from 'vue';
import { StorageUtils } from '../utils/storage.utils';

/**
 * Composable for caching data with TTL support
 */
export function useCache() {
    const isCacheAvailable = ref(true);

    /**
     * Get cached data
     */
    async function get<T>(key: string): Promise<T | null> {
        try {
            return await StorageUtils.getCacheItem<T>(key);
        } catch (error) {
            console.error('Cache get failed:', error);
            return null;
        }
    }

    /**
     * Set cached data with optional TTL
     */
    async function set<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
        try {
            await StorageUtils.setCacheItem(key, data, ttlSeconds);
        } catch (error) {
            console.error('Cache set failed:', error);
        }
    }

    /**
     * Get cached data or fetch and cache it
     */
    async function getOrFetch<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds?: number,
    ): Promise<T> {
        // Try cache first
        const cached = await get<T>(key);
        if (cached !== null) return cached;

        // Fetch fresh data
        const data = await fetcher();

        // Cache the result
        await set(key, data, ttlSeconds);

        return data;
    }

    /**
     * Remove cached item
     */
    async function remove(key: string): Promise<void> {
        try {
            await StorageUtils.removeStorageItem(`cache_${key}`);
        } catch (error) {
            console.error('Cache remove failed:', error);
        }
    }

    /**
     * Clear all cached data
     */
    async function clearAll(): Promise<void> {
        try {
            await StorageUtils.clearCache();
        } catch (error) {
            console.error('Cache clear failed:', error);
        }
    }

    /**
     * Check if cached data exists and is not expired
     */
    async function has(key: string): Promise<boolean> {
        const data = await get(key);
        return data !== null;
    }

    /**
     * Generate a cache key from parameters
     */
    function generateKey(prefix: string, params: Record<string, any>): string {
        const sorted = Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join('&');
        return `${prefix}:${sorted}`;
    }

    return {
        isCacheAvailable,
        get,
        set,
        getOrFetch,
        remove,
        clearAll,
        has,
        generateKey,
    };
}