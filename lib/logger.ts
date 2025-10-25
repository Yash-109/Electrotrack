/**
 * Centralized logging utility for the application
 * Provides structured logging with different levels and environment-aware output
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

interface LogEntry {
    level: LogLevel
    message: string
    data?: unknown
    timestamp: string
    context?: string
}

class Logger {
    private static instance: Logger
    private isDevelopment = process.env.NODE_ENV === 'development'
    private logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO

    private constructor() { }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    private formatLog(entry: LogEntry): string {
        const level = LogLevel[entry.level]
        const context = entry.context ? `[${entry.context}]` : ''
        return `${entry.timestamp} ${level} ${context} ${entry.message}`
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.logLevel
    }

    private createLogEntry(level: LogLevel, message: string, data?: unknown, context?: string): LogEntry {
        return {
            level,
            message,
            data,
            context,
            timestamp: new Date().toISOString(),
        }
    }

    debug(message: string, data?: unknown, context?: string): void {
        if (!this.shouldLog(LogLevel.DEBUG)) return

        const entry = this.createLogEntry(LogLevel.DEBUG, message, data, context)
        if (this.isDevelopment) {
            console.debug(this.formatLog(entry), data || '')
        }
    }

    info(message: string, data?: unknown, context?: string): void {
        if (!this.shouldLog(LogLevel.INFO)) return

        const entry = this.createLogEntry(LogLevel.INFO, message, data, context)
        console.log(this.formatLog(entry), data || '')
    }

    warn(message: string, data?: unknown, context?: string): void {
        if (!this.shouldLog(LogLevel.WARN)) return

        const entry = this.createLogEntry(LogLevel.WARN, message, data, context)
        console.warn(this.formatLog(entry), data || '')
    }

    error(message: string, error?: Error | unknown, context?: string): void {
        if (!this.shouldLog(LogLevel.ERROR)) return

        const entry = this.createLogEntry(LogLevel.ERROR, message, error, context)

        // Always log errors, but in production, don't include sensitive details
        if (this.isDevelopment) {
            console.error(this.formatLog(entry), error)
        } else {
            console.error(this.formatLog(entry))
        }
    }

    // Utility method for API errors
    apiError(endpoint: string, error: Error | unknown, context = 'API'): void {
        this.error(`API call failed: ${endpoint}`, error, context)
    }

    // Utility method for component errors
    componentError(component: string, error: Error | unknown, context = 'Component'): void {
        this.error(`Component error in ${component}`, error, context)
    }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Export convenience functions
export const log = {
    debug: (message: string, data?: unknown, context?: string) => logger.debug(message, data, context),
    info: (message: string, data?: unknown, context?: string) => logger.info(message, data, context),
    warn: (message: string, data?: unknown, context?: string) => logger.warn(message, data, context),
    error: (message: string, error?: Error | unknown, context?: string) => logger.error(message, error, context),
    apiError: (endpoint: string, error: Error | unknown) => logger.apiError(endpoint, error),
    componentError: (component: string, error: Error | unknown) => logger.componentError(component, error),
}
