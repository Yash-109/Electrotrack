/**
 * Custom hook for managing session storage and cleanup
 * Prevents memory leaks and provides better session management
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { log } from '@/lib/logger'

export function useSessionCleanup() {
    const cleanupFunctionsRef = useRef<Array<() => void>>([])

    // Register a cleanup function
    const registerCleanup = useCallback((cleanupFn: () => void) => {
        cleanupFunctionsRef.current.push(cleanupFn)
    }, [])

    // Manual cleanup trigger
    const cleanup = useCallback(() => {
        cleanupFunctionsRef.current.forEach(fn => {
            try {
                fn()
            } catch (error) {
                log.warn('Cleanup function failed', error, 'use-performance')
            }
        })
        cleanupFunctionsRef.current = []
    }, [])

    // Auto cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup()
        }
    }, [cleanup])

    return { registerCleanup, cleanup }
}

/**
 * Custom hook for debounced values with automatic cleanup
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Cleanup on unmount or value change
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [value, delay])

    return debouncedValue
}

/**
 * Custom hook for managing localStorage with automatic cleanup
 */
export function useLocalStorageCleanup(key: string, maxAge: number = 24 * 60 * 60 * 1000) {
    const isExpired = useCallback((timestamp: number) => {
        return Date.now() - timestamp > maxAge
    }, [maxAge])

    const cleanupExpiredData = useCallback(() => {
        try {
            const data = localStorage.getItem(key)
            if (!data) return

            const parsed = JSON.parse(data)

            // If data has timestamp, check if expired
            if (parsed.timestamp && isExpired(parsed.timestamp)) {
                localStorage.removeItem(key)
                return true
            }

            // If it's an array of items with timestamps, filter expired ones
            if (Array.isArray(parsed)) {
                const filtered = parsed.filter(item =>
                    !item.timestamp || !isExpired(item.timestamp)
                )

                if (filtered.length !== parsed.length) {
                    localStorage.setItem(key, JSON.stringify(filtered))
                    return true
                }
            }
        } catch (error) {
            log.warn(`Failed to cleanup localStorage key: ${key}`, error, 'use-performance')
        }
        return false
    }, [key, isExpired])

    useEffect(() => {
        // Initial cleanup
        cleanupExpiredData()

        // Set up periodic cleanup
        const interval = setInterval(cleanupExpiredData, 10 * 60 * 1000) // Every 10 minutes

        return () => clearInterval(interval)
    }, [cleanupExpiredData])

    return cleanupExpiredData
}

/**
 * Custom hook for managing component visibility and lazy loading
 */
export function useIntersectionObserver(
    threshold: number = 0.1,
    rootMargin: string = '0px'
) {
    const [isVisible, setIsVisible] = useState(false)
    const [hasBeenVisible, setHasBeenVisible] = useState(false)
    const elementRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.isIntersecting
                setIsVisible(visible)

                if (visible && !hasBeenVisible) {
                    setHasBeenVisible(true)
                }
            },
            { threshold, rootMargin }
        )

        observer.observe(element)

        return () => {
            observer.unobserve(element)
            observer.disconnect()
        }
    }, [threshold, rootMargin, hasBeenVisible])

    return { elementRef, isVisible, hasBeenVisible }
}
