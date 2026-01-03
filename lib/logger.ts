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
    private logHistory: LogEntry[] = []
    private maxHistorySize = 100
    private batchedLogs: LogEntry[] = []
    private batchFlushInterval: NodeJS.Timeout | null = null
    private rotationThreshold = 1000 // Rotate after 1000 entries
    private archivedLogs: LogEntry[][] = []
    private maxArchives = 5

    private constructor() {
        // Auto-flush batched logs every 5 seconds in production
        if (!this.isDevelopment && typeof setInterval !== 'undefined') {
            this.batchFlushInterval = setInterval(() => this.flushBatchedLogs(), 5000)
        }
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    private formatLog(entry: LogEntry): string {
        const level = LogLevel[entry.level]
        const context = entry.context ? `[${entry.context}]` : ''
        // Use timestamp directly for better performance - ISO format is already readable
        return `[${entry.timestamp}] ${level}${context} ${entry.message}`
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.logLevel
    }

    private createLogEntry(level: LogLevel, message: string, data?: unknown, context?: string): LogEntry {
        const entry = {
            level,
            message,
            data,
            context,
            timestamp: new Date().toISOString(),
        }

        // Store in history for debugging
        this.logHistory.push(entry)

        // Check if rotation is needed
        if (this.logHistory.length >= this.rotationThreshold) {
            this.rotateLogs()
        } else if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory.shift()
        }

        return entry
    }

    /**
     * Rotate logs when threshold is reached
     * Moves current logs to archive and starts fresh
     */
    private rotateLogs(): void {
        if (this.logHistory.length === 0) return

        // Archive current logs
        this.archivedLogs.push([...this.logHistory])

        // Keep only the most recent archives
        if (this.archivedLogs.length > this.maxArchives) {
            this.archivedLogs.shift()
        }

        // Clear current logs
        this.logHistory = []

        log.info(`Log rotation completed. Archived ${this.archivedLogs.length} log sets`, undefined, 'Logger')
    }

    /**
     * Get compressed log summary for performance analysis
     */
    getCompressedLogs(): { current: number; archived: number; totalEntries: number } {
        const totalEntries = this.logHistory.length +
            this.archivedLogs.reduce((sum, archive) => sum + archive.length, 0)

        return {
            current: this.logHistory.length,
            archived: this.archivedLogs.length,
            totalEntries
        }
    }

    /**
     * Get archived logs by index
     */
    getArchivedLogs(archiveIndex: number): LogEntry[] {
        return this.archivedLogs[archiveIndex] || []
    }

    /**
     * Get all logs (current + archived)
     */
    getAllLogs(): LogEntry[] {
        return [...this.archivedLogs.flat(), ...this.logHistory]
    }

    /**
     * Filter logs by level
     */
    filterByLevel(level: LogLevel, includeArchived = false): LogEntry[] {
        const logs = includeArchived ? this.getAllLogs() : this.logHistory
        return logs.filter(entry => entry.level === level)
    }

    /**
     * Filter logs by context
     */
    filterByContext(context: string, includeArchived = false): LogEntry[] {
        const logs = includeArchived ? this.getAllLogs() : this.logHistory
        return logs.filter(entry => entry.context === context)
    }

    /**
     * Search logs by message content
     */
    searchLogs(query: string, includeArchived = false): LogEntry[] {
        const logs = includeArchived ? this.getAllLogs() : this.logHistory
        const lowerQuery = query.toLowerCase()
        return logs.filter(entry =>
            entry.message.toLowerCase().includes(lowerQuery) ||
            (entry.context && entry.context.toLowerCase().includes(lowerQuery))
        )
    }

    /**
     * Filter logs by time range
     */
    filterByTimeRange(startTime: Date, endTime: Date, includeArchived = false): LogEntry[] {
        const logs = includeArchived ? this.getAllLogs() : this.logHistory
        const start = startTime.getTime()
        const end = endTime.getTime()

        return logs.filter(entry => {
            const entryTime = new Date(entry.timestamp).getTime()
            return entryTime >= start && entryTime <= end
        })
    }

    /**
     * Get logs with advanced filtering
     */
    getFilteredLogs(filters: {
        level?: LogLevel
        context?: string
        searchQuery?: string
        startTime?: Date
        endTime?: Date
        includeArchived?: boolean
    }): LogEntry[] {
        let logs = filters.includeArchived ? this.getAllLogs() : this.logHistory

        if (filters.level !== undefined) {
            logs = logs.filter(entry => entry.level === filters.level)
        }

        if (filters.context) {
            logs = logs.filter(entry => entry.context === filters.context)
        }

        if (filters.searchQuery) {
            const lowerQuery = filters.searchQuery.toLowerCase()
            logs = logs.filter(entry =>
                entry.message.toLowerCase().includes(lowerQuery) ||
                (entry.context && entry.context.toLowerCase().includes(lowerQuery))
            )
        }

        if (filters.startTime && filters.endTime) {
            const start = filters.startTime.getTime()
            const end = filters.endTime.getTime()
            logs = logs.filter(entry => {
                const entryTime = new Date(entry.timestamp).getTime()
                return entryTime >= start && entryTime <= end
            })
        }

        return logs
    }

    /**
     * Get recent log history for debugging
     */
    getLogHistory(count = 50): LogEntry[] {
        return this.logHistory.slice(-count)
    }

    /**
     * Clear log history
     */
    clearLogHistory(): void {
        this.logHistory = []
    }

    /**
     * Add log to batch (for production performance)
     */
    private addToBatch(entry: LogEntry): void {
        if (!this.isDevelopment) {
            this.batchedLogs.push(entry)
            if (this.batchedLogs.length >= 10) {
                this.flushBatchedLogs()
            }
        }
    }

    /**
     * Flush batched logs to console
     */
    private flushBatchedLogs(): void {
        if (this.batchedLogs.length === 0) return

        console.log(`[Batched Logs: ${this.batchedLogs.length} entries]`)
        this.batchedLogs.forEach(entry => {
            console.log(this.formatLog(entry))
        })
        this.batchedLogs = []
    }

    /**
     * Get performance insights from logs
     */
    getPerformanceInsights(): { slowOperations: LogEntry[]; averageDuration: number; totalOps: number } {
        const perfLogs = this.logHistory.filter(entry =>
            entry.context === 'Performance' && entry.data && typeof entry.data === 'object'
        )

        const slowOps = perfLogs.filter(entry => {
            const data = entry.data as any
            return data?.duration && data.duration > 1000
        })

        const totalDuration = perfLogs.reduce((sum, entry) => {
            const data = entry.data as any
            return sum + (data?.duration || 0)
        }, 0)

        return {
            slowOperations: slowOps,
            averageDuration: perfLogs.length > 0 ? totalDuration / perfLogs.length : 0,
            totalOps: perfLogs.length
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

        if (this.isDevelopment) {
            console.log(this.formatLog(entry), data || '')
        } else {
            // Use batching in production for better performance
            this.addToBatch(entry)
        }
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
    // Utility method for API errors. Accepts optional requestId for tracing.
    apiError(endpoint: string, error: Error | unknown, requestId?: string, context = 'API'): void {
        const ctx = requestId ? `${context} [req:${requestId}]` : context
        this.error(`API call failed: ${endpoint}`, error, ctx)
    }

    // Utility method for component errors
    componentError(component: string, error: Error | unknown, context = 'Component'): void {
        this.error(`Component error in ${component}`, error, context)
    }

    // Performance logging utility
    performanceMetric(operation: string, duration: number, metadata?: unknown, context = 'Performance'): void {
        const level = duration > 1000 ? LogLevel.WARN : duration > 500 ? LogLevel.INFO : LogLevel.DEBUG
        const message = `${operation} completed in ${duration}ms`

        if (level >= this.logLevel) {
            const entry = this.createLogEntry(level, message, { duration, metadata, operation }, context)

            if (level === LogLevel.WARN) {
                console.warn(this.formatLog(entry), { duration, metadata })
            } else {
                console.log(this.formatLog(entry), { duration, metadata })
            }
        }
    }

    // Security event logging
    securityEvent(eventType: 'login_attempt' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded', details: unknown, context = 'Security'): void {
        this.warn(`Security Event: ${eventType}`, details, context)
    }

    // Database operation logging
    dbOperation(operation: string, collection: string, duration?: number, error?: Error, context = 'Database'): void {
        if (error) {
            this.error(`DB Error: ${operation} on ${collection}`, error, context)
        } else {
            const message = duration ? `${operation} on ${collection} (${duration}ms)` : `${operation} on ${collection}`
            this.debug(message, { operation, collection, duration }, context)
        }
    }

    // Memory and resource monitoring
    resourceMetrics(metrics: { memoryUsage?: number; cpuUsage?: number; activeConnections?: number }, context = 'Resources'): void {
        const critical = metrics.memoryUsage && metrics.memoryUsage > 0.9
        const level = critical ? LogLevel.ERROR : LogLevel.DEBUG

        if (level >= this.logLevel) {
            const entry = this.createLogEntry(level, 'Resource metrics', metrics, context)

            if (critical) {
                console.error(this.formatLog(entry), metrics)
            } else {
                console.debug(this.formatLog(entry), metrics)
            }
        }
    }

    /**
     * Export logs as JSON for debugging or analysis
     */
    exportLogs(): string {
        return JSON.stringify(this.logHistory, null, 2)
    }

    /**
     * Get log statistics
     */
    getLogStats(): { total: number; byLevel: Record<string, number> } {
        const stats = {
            total: this.logHistory.length,
            byLevel: {} as Record<string, number>
        }

        this.logHistory.forEach(entry => {
            const levelName = LogLevel[entry.level]
            stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1
        })

        return stats
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
    performanceMetric: (operation: string, duration: number, metadata?: unknown) => logger.performanceMetric(operation, duration, metadata),
    securityEvent: (eventType: 'login_attempt' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded', details: unknown) => logger.securityEvent(eventType, details),
    dbOperation: (operation: string, collection: string, duration?: number, error?: Error) => logger.dbOperation(operation, collection, duration, error),
    resourceMetrics: (metrics: { memoryUsage?: number; cpuUsage?: number; activeConnections?: number }) => logger.resourceMetrics(metrics),
    // New utility methods
    getHistory: (count?: number) => logger.getLogHistory(count),
    clearHistory: () => logger.clearLogHistory(),
    exportLogs: () => logger.exportLogs(),
    getStats: () => logger.getLogStats(),
    getCompressed: () => logger.getCompressedLogs(),
    getAllLogs: () => logger.getAllLogs(),
    getArchived: (index: number) => logger.getArchivedLogs(index),
    filterByLevel: (level: LogLevel, includeArchived?: boolean) => logger.filterByLevel(level, includeArchived),
    filterByContext: (context: string, includeArchived?: boolean) => logger.filterByContext(context, includeArchived),
    searchLogs: (query: string, includeArchived?: boolean) => logger.searchLogs(query, includeArchived),
    filterByTimeRange: (startTime: Date, endTime: Date, includeArchived?: boolean) => logger.filterByTimeRange(startTime, endTime, includeArchived),
    getFilteredLogs: (filters: Parameters<typeof logger.getFilteredLogs>[0]) => logger.getFilteredLogs(filters),
    getPerformanceInsights: () => logger.getPerformanceInsights(),
}
