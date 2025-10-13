// Simple logger utility to replace console logging
export const logger = {
    info: (message: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[INFO] ${message}`, data || '')
        }
    },

    error: (message: string, error?: any) => {
        console.error(`[ERROR] ${message}`, process.env.NODE_ENV === 'development' ? error : '')
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

// Sanitize errors for client responses
export function sanitizeError(error: any): string {
    if (process.env.NODE_ENV === 'development') {
        return error?.message || 'An error occurred'
    }

    // In production, return generic messages for security
    if (error?.code === 11000) {
        return 'Duplicate data found'
    }

    return 'Internal server error'
}
