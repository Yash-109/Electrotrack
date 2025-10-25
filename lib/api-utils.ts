import { logger as appLogger } from './logger'

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

    constructor(
        message: string,
        type: ErrorType = ErrorType.INTERNAL,
        statusCode: number = 500,
        isOperational: boolean = true,
        context?: Record<string, any>
    ) {
        super(message)
        this.type = type
        this.statusCode = statusCode
        this.isOperational = isOperational
        this.timestamp = new Date()
        this.context = context

        Error.captureStackTrace(this, this.constructor)
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
    success: (data: any, message?: string) => ({
        success: true,
        message: message || 'Operation successful',
        data
    }),

    error: (message: string, statusCode: number = 500, details?: any) => {
        const response: any = {
            success: false,
            error: message
        }

        // Only include details in development
        if (process.env.NODE_ENV === 'development' && details) {
            response.details = details
        }

        return { response, statusCode }
    },

    validation: (errors: any[]) => ({
        success: false,
        error: 'Validation failed',
        validationErrors: errors
    })
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
