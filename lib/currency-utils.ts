/**
 * Utility function for consistent currency formatting across the application
 * This prevents the "1"s issue caused by toLocaleString()
 */

import { log } from './logger'

// Cache for formatted values to improve performance
const formatCache = new Map<string, string>()
const CACHE_SIZE_LIMIT = 1000
let cacheHits = 0
let cacheMisses = 0

/**
 * Validate if a value is a valid currency amount
 */
export function isValidCurrencyAmount(amount: any): boolean {
    if (amount === null || amount === undefined || amount === '') return false

    const num = typeof amount === 'number' ? amount : parseFloat(amount.toString())

    if (!isFinite(num) || isNaN(num)) return false
    if (num < 0) return false // No negative currency
    if (Math.abs(num) > Number.MAX_SAFE_INTEGER) return false

    return true
}

/**
 * Safely parse any value to a valid currency number
 * Returns 0 for invalid inputs
 */
export function safeParseCurrency(value: any): number {
    if (value === null || value === undefined) return 0

    // If already a valid number
    if (typeof value === 'number') {
        return isValidCurrencyAmount(value) ? value : 0
    }

    // If string, try to parse
    if (typeof value === 'string') {
        const cleaned = value.replace(/[₹,\s]/g, '')
        const num = parseFloat(cleaned)
        return isValidCurrencyAmount(num) ? num : 0
    }

    return 0
}

// Clear cache when it gets too large
function manageCacheSize() {
    if (formatCache.size > CACHE_SIZE_LIMIT) {
        const keysToDelete = Array.from(formatCache.keys()).slice(0, CACHE_SIZE_LIMIT / 2)
        keysToDelete.forEach(key => formatCache.delete(key))
        log.debug('Currency format cache cleared', {
            remainingEntries: formatCache.size,
            hitRate: calculateCacheHitRate()
        }, 'CurrencyUtils')
    }
}

/**
 * Calculate cache hit rate for monitoring
 */
function calculateCacheHitRate(): string {
    const total = cacheHits + cacheMisses
    if (total === 0) return '0%'
    return `${((cacheHits / total) * 100).toFixed(1)}%`
}

/**
 * Format currency in compact notation for large numbers
 * e.g., ₹1.2K, ₹3.5M, ₹2.1B
 */
export function formatCurrencyCompact(amount: number | string): string {
    const num = parseFloat(amount.toString())
    if (!isFinite(num) || isNaN(num)) return '₹0'

    const absNum = Math.abs(num)
    const sign = num < 0 ? '-' : ''

    if (absNum >= 1e9) {
        return `${sign}₹${(absNum / 1e9).toFixed(1)}B`
    } else if (absNum >= 1e6) {
        return `${sign}₹${(absNum / 1e6).toFixed(1)}M`
    } else if (absNum >= 1e3) {
        return `${sign}₹${(absNum / 1e3).toFixed(1)}K`
    }

    return `${sign}₹${absNum.toFixed(2)}`
}

/**
 * Format currency with proper error handling and thousands separator
 * Primary function for currency formatting in the application
 */
export function formatCurrency(amount: number | string, useCache = true): string {
    // Use safe parsing for better error handling
    const num = safeParseCurrency(amount)

    if (num === 0 && !isValidCurrencyAmount(amount)) {
        return '₹0.00'
    }

    // Check cache first for performance
    const cacheKey = `${num}_currency`
    if (useCache && formatCache.has(cacheKey)) {
        cacheHits++
        return formatCache.get(cacheKey)!
    }

    cacheMisses++

    // Format with 2 decimal places
    const formatted = num.toFixed(2)
    const parts = formatted.split('.')

    // Add thousands separator manually
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    const result = `₹${parts.join('.')}`

    // Cache the result
    if (useCache) {
        manageCacheSize()
        formatCache.set(cacheKey, result)
    }

    return result
}

/**
 * Format currency without the ₹ symbol (useful for calculations display)
 */
export function formatNumber(amount: number | string, useCache = true): string {
    if (!amount || isNaN(Number(amount))) return '0.00'

    const num = parseFloat(amount.toString())
    if (isNaN(num)) return '0.00'

    // Check cache first
    const cacheKey = `${num}_number`
    if (useCache && formatCache.has(cacheKey)) {
        return formatCache.get(cacheKey)!
    }

    const formatted = num.toFixed(2)
    const parts = formatted.split('.')

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    const result = parts.join('.')

    // Cache the result
    if (useCache) {
        manageCacheSize()
        formatCache.set(cacheKey, result)
    }

    return result
}

/**
 * Format percentage values with error handling and caching
 */
export function formatPercentage(amount: number, decimals = 0, useCache = true): string {
    if (!amount || isNaN(amount)) return '0%'

    const cacheKey = `${amount}_${decimals}_percentage`
    if (useCache && formatCache.has(cacheKey)) {
        return formatCache.get(cacheKey)!
    }

    const result = `${amount.toFixed(decimals)}%`

    if (useCache) {
        manageCacheSize()
        formatCache.set(cacheKey, result)
    }

    return result
}

/**
 * Parse currency string back to number for calculations
 */
export function parseCurrency(currencyString: string): number {
    if (!currencyString || typeof currencyString !== 'string') return 0

    try {
        // Remove currency symbol, commas, and spaces
        const cleanString = currencyString.replace(/[₹,\s]/g, '')
        const num = parseFloat(cleanString)

        return isNaN(num) ? 0 : num
    } catch (error) {
        log.error('Currency parsing error', error, 'CurrencyUtils')
        return 0
    }
}

/**
 * Calculate percentage with proper rounding
 */
export function calculatePercentage(value: number, total: number): number {
    if (!total || total === 0 || isNaN(value) || isNaN(total)) return 0

    try {
        const percentage = (value / total) * 100
        return Math.round(percentage * 100) / 100 // Round to 2 decimal places
    } catch (error) {
        log.error('Percentage calculation error', error, 'CurrencyUtils')
        return 0
    }
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export function formatCompactNumber(amount: number | string): string {
    const num = parseFloat(amount.toString())
    if (isNaN(num)) return '0'

    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num.toString()
}

/**
 * Clear the formatting cache (useful for testing or memory management)
 */
export function clearFormatCache(): void {
    formatCache.clear()
    log.debug('Currency format cache cleared manually', {}, 'CurrencyUtils')
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): { size: number; limit: number; hitRate: string; hits: number; misses: number } {
    return {
        size: formatCache.size,
        limit: CACHE_SIZE_LIMIT,
        hitRate: calculateCacheHitRate(),
        hits: cacheHits,
        misses: cacheMisses
    }
}
