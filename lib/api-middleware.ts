/**
 * API Middleware for consistent error handling and request validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger, AppError, ErrorType, sanitizeError } from '@/lib/api-utils'
import { z } from 'zod'

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
        try {
            // Add request ID for tracing
            const requestId = Math.random().toString(36).substring(7)
            logger.info(`API Request started: ${req.method} ${req.url}`, { requestId })

            const response = await handler(req)

            logger.info(`API Request completed: ${req.method} ${req.url}`, {
                requestId,
                status: response.status
            })

            return response
        } catch (error) {
            logger.error(`API Request failed: ${req.method} ${req.url}`, error)

            if (error instanceof AppError) {
                return NextResponse.json({
                    success: false,
                    error: error.message,
                    type: error.type,
                    timestamp: error.timestamp.toISOString()
                }, { status: error.statusCode })
            }

            if (error instanceof z.ZodError) {
                return NextResponse.json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                        code: e.code
                    }))
                }, { status: 400 })
            }

            const sanitized = sanitizeError(error)
            return NextResponse.json({
                success: false,
                error: sanitized.message,
                type: sanitized.type
            }, { status: 500 })
        }
    }
}

export function withRateLimit(limit: number = 100, windowMs: number = 60000) {
    return function (handler: (req: NextRequest) => Promise<NextResponse>) {
        return async (req: NextRequest) => {
            const clientIP = req.headers.get('x-forwarded-for') ||
                req.headers.get('x-real-ip') ||
                'unknown'

            const now = Date.now()
            const key = `${clientIP}-${req.url}`
            const current = rateLimitMap.get(key)

            if (current) {
                if (now < current.resetTime) {
                    if (current.count >= limit) {
                        throw new AppError(
                            'Too many requests. Please try again later.',
                            ErrorType.VALIDATION,
                            429
                        )
                    }
                    current.count++
                } else {
                    // Reset window
                    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
                }
            } else {
                rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
            }

            // Cleanup old entries periodically
            if (Math.random() < 0.01) { // 1% chance
                for (const [mapKey, value] of rateLimitMap.entries()) {
                    if (now > value.resetTime) {
                        rateLimitMap.delete(mapKey)
                    }
                }
            }

            return handler(req)
        }
    }
}

export function withValidation<T>(schema: z.ZodSchema<T>) {
    return function (handler: (req: NextRequest, data: T) => Promise<NextResponse>) {
        return async (req: NextRequest) => {
            let body
            try {
                body = await req.json()
            } catch (error) {
                throw new AppError('Invalid JSON format', ErrorType.VALIDATION, 400)
            }

            const validatedData = schema.parse(body)
            return handler(req, validatedData)
        }
    }
}

// Utility to combine multiple middleware
export function withMiddleware(...middlewares: Array<(handler: any) => any>) {
    return function (handler: any) {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
    }
}

// Common validation schemas
export const commonSchemas = {
    email: z.string().email('Valid email is required'),
    mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
    pagination: z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20)
    }),
    search: z.object({
        query: z.string().max(100, 'Search query too long').optional(),
        category: z.string().regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid category format').optional(),
        sortBy: z.enum(['name', 'price', 'date', 'rating']).default('date')
    })
}
