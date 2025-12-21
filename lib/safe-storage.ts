/**
 * Safe localStorage wrapper with error handling, retry mechanism, and quota management
 * Provides fallback to memory storage when localStorage is unavailable
 */

import { log } from "./logger"

interface StorageItem {
    value: any
    expiry?: number
    compressed?: boolean
}

// Storage operation statistics
interface StorageStats {
    reads: number
    writes: number
    deletes: number
    failures: number
    cacheHits: number
    cacheMisses: number
}

const stats: StorageStats = {
    reads: 0,
    writes: 0,
    deletes: 0,
    failures: 0,
    cacheHits: 0,
    cacheMisses: 0
}

// In-memory fallback storage
const memoryStorage = new Map<string, string>()

// Storage availability flag
let isLocalStorageAvailable: boolean | null = null

// Auto-cleanup interval
let cleanupInterval: NodeJS.Timeout | null = null

/**
 * Check if localStorage is available and working
 */
const checkLocalStorageAvailability = (): boolean => {
    if (isLocalStorageAvailable !== null) {
        return isLocalStorageAvailable
    }

    try {
        const testKey = "__storage_test__"
        localStorage.setItem(testKey, "test")
        localStorage.removeItem(testKey)
        isLocalStorageAvailable = true

        // Initialize auto-cleanup on first successful access
        initializeAutoCleanup()

        return true
    } catch (error) {
        log.warn("localStorage is not available, falling back to memory storage", { error }, "SafeStorage")
        isLocalStorageAvailable = false
        return false
    }
}

/**
 * Initialize automatic cleanup interval
 */
const initializeAutoCleanup = (): void => {
    if (cleanupInterval) return

    // Run cleanup every 5 minutes
    cleanupInterval = setInterval(() => {
        cleanupExpiredItems()
    }, 5 * 60 * 1000)

    log.debug('Auto-cleanup initialized', {}, 'SafeStorage')
}

/**
 * Check available localStorage quota
 */
const checkStorageQuota = (): { used: number; available: number; percentage: number } => {
    if (!checkLocalStorageAvailability()) {
        return { used: 0, available: 0, percentage: 0 }
    }

    try {
        let used = 0
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                used += localStorage[key].length + key.length
            }
        }

        // Most browsers provide 5-10MB, we'll estimate 5MB (5242880 bytes)
        const available = 5242880
        const percentage = (used / available) * 100

        return { used, available, percentage }
    } catch (error) {
        log.error("Failed to check storage quota", error, "SafeStorage")
        return { used: 0, available: 0, percentage: 0 }
    }
}

/**
 * Clean up expired items from storage
 */
const cleanupExpiredItems = (): void => {
    if (!checkLocalStorageAvailability()) return

    try {
        const now = Date.now()
        const keysToRemove: string[] = []

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (!key) continue

            try {
                const item = localStorage.getItem(key)
                if (!item) continue

                const parsed: StorageItem = JSON.parse(item)
                if (parsed.expiry && parsed.expiry < now) {
                    keysToRemove.push(key)
                }
            } catch {
                // Skip invalid JSON items
                continue
            }
        }

        keysToRemove.forEach((key) => {
            try {
                localStorage.removeItem(key)
                log.debug(`Removed expired item: ${key}`, {}, "SafeStorage")
            } catch (error) {
                log.error(`Failed to remove expired item: ${key}`, error, "SafeStorage")
            }
        })

        if (keysToRemove.length > 0) {
            log.info(`Cleaned up ${keysToRemove.length} expired items`, {}, "SafeStorage")
        }
    } catch (error) {
        log.error("Failed to cleanup expired items", error, "SafeStorage")
    }
}

/**
 * Safely get item from storage with retry mechanism
 */
export const safeGetItem = (key: string, maxRetries: number = 3): string | null => {
    stats.reads++
    let attempt = 0

    while (attempt < maxRetries) {
        try {
            if (checkLocalStorageAvailability()) {
                const item = localStorage.getItem(key)
                if (!item) {
                    stats.cacheMisses++
                    return null
                }

                try {
                    const parsed: StorageItem = JSON.parse(item)

                    // Check if item has expired
                    if (parsed.expiry && parsed.expiry < Date.now()) {
                        localStorage.removeItem(key)
                        log.debug(`Expired item removed: ${key}`, {}, "SafeStorage")
                        stats.cacheMisses++
                        return null
                    }

                    stats.cacheHits++
                    return parsed.value
                } catch {
                    // Item is not wrapped, return as-is (for backward compatibility)
                    stats.cacheHits++
                    return item
                }
            } else {
                // Use memory storage fallback
                const item = memoryStorage.get(key)
                if (item) {
                    stats.cacheHits++
                } else {
                    stats.cacheMisses++
                }
                return item || null
            }
        } catch (error) {
            attempt++
            stats.failures++
            log.error(`Failed to get item (attempt ${attempt}/${maxRetries})`, { key, error }, "SafeStorage")

            if (attempt >= maxRetries) {
                // Final fallback to memory storage
                const item = memoryStorage.get(key)
                return item || null
            }

            // Wait before retry with exponential backoff
            const delay = Math.pow(2, attempt) * 100
            const start = Date.now()
            while (Date.now() - start < delay) {
                // Blocking delay
            }
        }
    }

    return null
}

/**
 * Safely set item in storage with retry mechanism and quota management
 */
export const safeSetItem = (
    key: string,
    value: any,
    expiryMs?: number,
    maxRetries: number = 3
): boolean => {
    stats.writes++
    let attempt = 0

    while (attempt < maxRetries) {
        try {
            const stringValue = typeof value === "string" ? value : JSON.stringify(value)

            const storageItem: StorageItem = {
                value: stringValue,
                expiry: expiryMs ? Date.now() + expiryMs : undefined,
            }

            const itemString = JSON.stringify(storageItem)

            if (checkLocalStorageAvailability()) {
                // Check quota before writing
                const quota = checkStorageQuota()
                if (quota.percentage > 90) {
                    log.warn("Storage quota exceeded 90%, cleaning up expired items", { quota }, "SafeStorage")
                    cleanupExpiredItems()
                }

                try {
                    localStorage.setItem(key, itemString)
                    log.debug(`Item stored: ${key}`, { size: itemString.length }, "SafeStorage")
                    return true
                } catch (error: any) {
                    if (error.name === "QuotaExceededError") {
                        log.warn("Storage quota exceeded, cleaning up and retrying", { key }, "SafeStorage")
                        cleanupExpiredItems()

                        // Retry after cleanup
                        try {
                            localStorage.setItem(key, itemString)
                            return true
                        } catch (retryError) {
                            log.error("Failed to store item after cleanup", { key, retryError }, "SafeStorage")
                            // Fall through to memory storage
                        }
                    } else {
                        throw error
                    }
                }
            }

            // Fallback to memory storage
            memoryStorage.set(key, itemString)
            log.debug(`Item stored in memory: ${key}`, {}, "SafeStorage")
            return true
        } catch (error) {
            attempt++
            log.error(`Failed to set item (attempt ${attempt}/${maxRetries})`, { key, error }, "SafeStorage")

            if (attempt >= maxRetries) {
                // Final fallback to memory storage
                try {
                    const stringValue = typeof value === "string" ? value : JSON.stringify(value)
                    memoryStorage.set(key, JSON.stringify({ value: stringValue }))
                    log.warn(`Item stored in memory after all retries failed: ${key}`, {}, "SafeStorage")
                    return true
                } catch (memError) {
                    log.error("Failed to store in memory storage", { key, memError }, "SafeStorage")
                    return false
                }
            }

            // Wait before retry
            const delay = Math.pow(2, attempt) * 100
            const start = Date.now()
            while (Date.now() - start < delay) {
                // Blocking delay
            }
        }
    }

    return false
}

/**
 * Safely remove item from storage with retry mechanism
 */
export const safeRemoveItem = (key: string, maxRetries: number = 3): boolean => {
    stats.deletes++
    let attempt = 0

    while (attempt < maxRetries) {
        try {
            if (checkLocalStorageAvailability()) {
                localStorage.removeItem(key)
            }

            // Also remove from memory storage
            memoryStorage.delete(key)
            log.debug(`Item removed: ${key}`, {}, "SafeStorage")
            return true
        } catch (error) {
            attempt++
            log.error(`Failed to remove item (attempt ${attempt}/${maxRetries})`, { key, error }, "SafeStorage")

            if (attempt >= maxRetries) {
                // Try memory storage as fallback
                memoryStorage.delete(key)
                return false
            }

            // Wait before retry
            const delay = Math.pow(2, attempt) * 100
            const start = Date.now()
            while (Date.now() - start < delay) {
                // Blocking delay
            }
        }
    }

    return false
}

/**
 * Safely clear all storage with retry mechanism
 */
export const safeClearStorage = (maxRetries: number = 3): boolean => {
    let attempt = 0

    while (attempt < maxRetries) {
        try {
            if (checkLocalStorageAvailability()) {
                localStorage.clear()
            }

            memoryStorage.clear()
            log.info("Storage cleared successfully", {}, "SafeStorage")
            return true
        } catch (error) {
            attempt++
            log.error(`Failed to clear storage (attempt ${attempt}/${maxRetries})`, { error }, "SafeStorage")

            if (attempt >= maxRetries) {
                memoryStorage.clear()
                return false
            }

            // Wait before retry
            const delay = Math.pow(2, attempt) * 100
            const start = Date.now()
            while (Date.now() - start < delay) {
                // Blocking delay
            }
        }
    }

    return false
}

/**
 * Get storage statistics including operation metrics
 */
export const getStorageStats = () => {
    const quota = checkStorageQuota()
    const isAvailable = checkLocalStorageAvailability()
    const memorySize = Array.from(memoryStorage.values()).reduce((sum, val) => sum + val.length, 0)

    return {
        isLocalStorageAvailable: isAvailable,
        quota,
        memoryStorageSize: memorySize,
        memoryItemCount: memoryStorage.size,
        operations: {
            ...stats,
            hitRate: stats.reads > 0 ? ((stats.cacheHits / stats.reads) * 100).toFixed(2) + '%' : '0%'
        }
    }
}

/**
 * Reset storage statistics
 */
export const resetStorageStats = (): void => {
    stats.reads = 0
    stats.writes = 0
    stats.deletes = 0
    stats.failures = 0
    stats.cacheHits = 0
    stats.cacheMisses = 0
    log.debug('Storage statistics reset', {}, 'SafeStorage')
}

// Initialize cleanup on module load - removed duplicate initialization
if (typeof window !== "undefined") {
    // Cleanup will be initialized on first checkLocalStorageAvailability call
    cleanupExpiredItems()
}
