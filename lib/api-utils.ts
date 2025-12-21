import { logger as appLogger } from './logger'

// Request tracking
let requestCounter = 0
const activeRequests = new Map<string, { startTime: number; endpoint: string }>()

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
    requestCounter++
    return `req_${Date.now()}_${requestCounter}`
}

/**
 * Track request start for performance monitoring
 */
export function trackRequestStart(requestId: string, endpoint: string): void {
    activeRequests.set(requestId, {
        startTime: Date.now(),
        endpoint
    })
}

/**
 * Track request end and log performance
 */
export function trackRequestEnd(requestId: string): number | null {
    const request = activeRequests.get(requestId)
    if (!request) return null

    const duration = Date.now() - request.startTime
    activeRequests.delete(requestId)

    // Log slow requests
    if (duration > 1000) {
        appLogger.warn(`Slow API request: ${request.endpoint}`, { duration, requestId }, 'API')
    }

    return duration
}

/**
 * Get active request count for monitoring
 */
export function getActiveRequestCount(): number {
    return activeRequests.size
}

// Enhanced error types for better categorization
export enum ErrorType {
    VALIDATION = 'VALIDATION_ERROR',
    AUTHENTICATION = 'AUTHENTICATION_ERROR',
    AUTHORIZATION = 'AUTHORIZATION_ERROR',
    NOT_FOUND = 'NOT_FOUND_ERROR',
    NETWORK = 'NETWORK_ERROR',
    DATABASE = 'DATABASE_ERROR',
    EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
    INTERNAL = 'INTERNAL_ERROR'
}

// Custom error class with better context
export class AppError extends Error {
    public readonly type: ErrorType
    public readonly statusCode: number
    public readonly isOperational: boolean
    public readonly timestamp: Date
    public readonly context?: Record<string, any>
    public readonly requestId?: string

    constructor(
        message: string,
        type: ErrorType = ErrorType.INTERNAL,
        statusCode: number = 500,
        isOperational: boolean = true,
        context?: Record<string, any>,
        requestId?: string
    ) {
        super(message)
        this.type = type
        this.statusCode = statusCode
        this.isOperational = isOperational
        this.timestamp = new Date()
        this.context = context
        this.requestId = requestId

        Error.captureStackTrace(this, this.constructor)
    }
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * Check if a key has exceeded rate limit
 * @param key - Identifier (e.g., IP address, user ID)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited, false otherwise
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(key)

    if (!record || now > record.resetTime) {
        // New window
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
        return false
    }

    if (record.count >= limit) {
        return true
    }

    record.count++
    return false
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimits(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    rateLimitMap.forEach((value, key) => {
        if (now > value.resetTime) {
            keysToDelete.push(key)
        }
    })

    keysToDelete.forEach(key => rateLimitMap.delete(key))

    if (keysToDelete.length > 0) {
        appLogger.debug(`Cleaned up ${keysToDelete.length} expired rate limit entries`, {}, 'API')
    }
}

// Simple logger utility to replace console logging
export const logger = {
    info: (message: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[INFO] ${message}`, data || '')
            appLogger.info(message, data, 'API')
        }
    },

    error: (message: string, error?: any) => {
        console.error(`[ERROR] ${message}`, process.env.NODE_ENV === 'development' ? error : '')
        appLogger.error(message, error, 'API')
    },

    warn: (message: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`[WARN] ${message}`, data || '')
        }
    },

    debug: (message: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, data || '')
        }
    }
}

// Standardized API response helpers
export const ApiResponse = {
    success: (data: any, message?: string, requestId?: string) => {
        const response: any = {
            success: true,
            message: message || 'Operation successful',
            data
        }
        if (requestId) response.requestId = requestId
        return response
    },

    error: (message: string, statusCode: number = 500, details?: any, requestId?: string) => {
        const response: any = {
            success: false,
            error: message
        }

        if (requestId) response.requestId = requestId

        // Only include details in development
        if (process.env.NODE_ENV === 'development' && details) {
            response.details = details
        }

        return { response, statusCode }
    },

    validation: (errors: any[], requestId?: string) => {
        const response: any = {
            success: false,
            error: 'Validation failed',
            validationErrors: errors
        }
        if (requestId) response.requestId = requestId
        return response
    }
}

// Sanitize errors for client responses with better categorization
export function sanitizeError(error: unknown): { message: string; type: string } {
    if (error instanceof AppError) {
        return {
            message: error.message,
            type: error.type
        }
    }

    if (process.env.NODE_ENV === 'development') {
        const message = error instanceof Error ? error.message : 'An error occurred'
        return {
            message,
            type: ErrorType.INTERNAL
        }
    }

    // In production, return generic messages for security
    if (error && typeof error === 'object' && 'code' in error) {
        switch ((error as any).code) {
            case 11000:
                return {
                    message: 'Duplicate data found',
                    type: ErrorType.VALIDATION
                }
            case 'ENOTFOUND':
            case 'ECONNREFUSED':
                return {
                    message: 'Service temporarily unavailable',
                    type: ErrorType.NETWORK
                }
            default:
                return {
                    message: 'Internal server error',
                    type: ErrorType.INTERNAL
                }
        }
    }

    return {
        message: 'Internal server error',
        type: ErrorType.INTERNAL
    }
}
