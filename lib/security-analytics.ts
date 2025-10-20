// Security Analytics and Monitoring for Verification System
// Tracks patterns, detects suspicious activity, and provides insights

import { getDb } from '@/lib/mongodb'

export interface SecurityAlert {
    type: 'suspicious_ip' | 'repeated_failures' | 'rapid_requests' | 'fake_email_pattern'
    severity: 'low' | 'medium' | 'high' | 'critical'
    details: string
    ip?: string
    email?: string
    count?: number
    timestamp: Date
}

export interface AnalyticsData {
    timeframe: '1h' | '24h' | '7d' | '30d'
    totalRequests: number
    successfulVerifications: number
    failedAttempts: number
    uniqueIPs: number
    uniqueEmails: number
    blockedRequests: number
    topFailedEmails: Array<{ email: string; count: number }>
    topIPs: Array<{ ip: string; requests: number; success: number }>
    alerts: SecurityAlert[]
    trends: {
        successRate: number
        averageAttemptsPerVerification: number
        peakHour: number
    }
}

// Generate security analytics report
export async function generateSecurityAnalytics(timeframe: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<AnalyticsData> {
    const db = await getDb()

    // Calculate time range
    const timeRanges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
    }

    const startTime = new Date(Date.now() - timeRanges[timeframe])

    try {
        // Aggregate basic stats
        const [
            totalRequests,
            successfulVerifications,
            records
        ] = await Promise.all([
            db.collection('pre_signup_verification').countDocuments({
                createdAt: { $gt: startTime }
            }),
            db.collection('pre_signup_verification').countDocuments({
                verified: true,
                verifiedAt: { $gt: startTime }
            }),
            db.collection('pre_signup_verification').find({
                createdAt: { $gt: startTime }
            }).toArray()
        ])

        // Process records for detailed analytics
        const ipMap = new Map<string, { requests: number; success: number }>()
        const emailMap = new Map<string, { attempts: number; success: boolean }>()
        const alerts: SecurityAlert[] = []
        const hourlyRequests = new Array(24).fill(0)

        let totalFailedAttempts = 0

        records.forEach(record => {
            // IP analytics
            const ip = record.clientIP || 'unknown'
            if (!ipMap.has(ip)) {
                ipMap.set(ip, { requests: 0, success: 0 })
            }
            const ipStats = ipMap.get(ip)!
            ipStats.requests++
            if (record.verified) ipStats.success++

            // Email analytics
            if (!emailMap.has(record.email)) {
                emailMap.set(record.email, { attempts: 0, success: false })
            }
            const emailStats = emailMap.get(record.email)!
            emailStats.attempts++
            if (record.verified) emailStats.success = true

            // Failed attempts counting
            totalFailedAttempts += record.failedAttempts || 0

            // Hour distribution
            if (record.createdAt instanceof Date) {
                const hour = record.createdAt.getHours()
                hourlyRequests[hour]++
            }

            // Generate alerts for suspicious patterns
            generateAlertsFromRecord(record, alerts)
        })

        // Top failed emails (high attempts, no success)
        const topFailedEmails = Array.from(emailMap.entries())
            .filter(([_, stats]) => !stats.success && stats.attempts >= 3)
            .sort((a, b) => b[1].attempts - a[1].attempts)
            .slice(0, 10)
            .map(([email, stats]) => ({ email, count: stats.attempts }))

        // Top IPs by request count
        const topIPs = Array.from(ipMap.entries())
            .sort((a, b) => b[1].requests - a[1].requests)
            .slice(0, 10)
            .map(([ip, stats]) => ({ ip, requests: stats.requests, success: stats.success }))

        // Calculate trends
        const successRate = totalRequests > 0 ? (successfulVerifications / totalRequests) * 100 : 0
        const averageAttemptsPerVerification = successfulVerifications > 0 ? totalFailedAttempts / successfulVerifications : 0
        const peakHour = hourlyRequests.indexOf(Math.max(...hourlyRequests))

        // Detect suspicious IPs
        ipMap.forEach((stats, ip) => {
            if (stats.requests >= 20 && stats.success === 0) {
                alerts.push({
                    type: 'suspicious_ip',
                    severity: 'high',
                    details: `IP ${ip} made ${stats.requests} requests with 0 successful verifications`,
                    ip,
                    count: stats.requests,
                    timestamp: new Date()
                })
            }
        })

        return {
            timeframe,
            totalRequests,
            successfulVerifications,
            failedAttempts: totalFailedAttempts,
            uniqueIPs: ipMap.size,
            uniqueEmails: emailMap.size,
            blockedRequests: records.filter(r => (r.failedAttempts || 0) >= 10).length,
            topFailedEmails,
            topIPs,
            alerts,
            trends: {
                successRate: Math.round(successRate * 100) / 100,
                averageAttemptsPerVerification: Math.round(averageAttemptsPerVerification * 100) / 100,
                peakHour
            }
        }

    } catch (error) {
        console.error('Analytics generation error:', error)
        throw error
    }
}

function generateAlertsFromRecord(record: any, alerts: SecurityAlert[]): void {
    // Alert for excessive failed attempts
    if (record.failedAttempts >= 8) {
        alerts.push({
            type: 'repeated_failures',
            severity: record.failedAttempts >= 15 ? 'critical' : 'high',
            details: `Email ${record.email} has ${record.failedAttempts} failed verification attempts`,
            email: record.email,
            count: record.failedAttempts,
            timestamp: record.lastAttemptAt || record.createdAt
        })
    }

    // Alert for fake email patterns (based on existing validation logic)
    const email = record.email?.toLowerCase() || ''
    const localPart = email.split('@')[0]

    const suspiciousPatterns = [
        /^[a-z]{1,5}\d{3,}$/i,        // Short name + many digits
        /^[a-z]+\d{3,}$/i,            // Any name + 3+ digits
        /^[a-z]\d+$/i,                // Single letter + digits
        /^\d+[a-z]*$/i,               // Starting with digits
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(localPart))) {
        alerts.push({
            type: 'fake_email_pattern',
            severity: 'medium',
            details: `Suspicious email pattern detected: ${record.email}`,
            email: record.email,
            ip: record.clientIP,
            timestamp: record.createdAt
        })
    }
}

// Log security event for monitoring
export async function logSecurityEvent(
    eventType: 'verification_request' | 'verification_success' | 'verification_failure' | 'rate_limit_hit' | 'suspicious_activity',
    details: {
        email?: string
        ip?: string
        userAgent?: string
        metadata?: any
    }
): Promise<void> {
    try {
        const db = await getDb()

        await db.collection('security_events').insertOne({
            eventType,
            ...details,
            timestamp: new Date(),
            processed: false
        })

    } catch (error) {
        console.error('Failed to log security event:', error)
        // Don't throw - logging failure shouldn't break the main flow
    }
}

// Get real-time security status
export async function getSecurityStatus(): Promise<{
    status: 'green' | 'yellow' | 'red'
    alerts: SecurityAlert[]
    summary: string
}> {
    try {
        const analytics = await generateSecurityAnalytics('1h')
        const criticalAlerts = analytics.alerts.filter(a => a.severity === 'critical')
        const highAlerts = analytics.alerts.filter(a => a.severity === 'high')

        let status: 'green' | 'yellow' | 'red' = 'green'
        let summary = 'All systems normal'

        if (criticalAlerts.length > 0) {
            status = 'red'
            summary = `${criticalAlerts.length} critical security alerts detected`
        } else if (highAlerts.length > 0 || analytics.trends.successRate < 70) {
            status = 'yellow'
            summary = `${highAlerts.length} high priority alerts, ${analytics.trends.successRate}% success rate`
        } else if (analytics.trends.successRate >= 90) {
            summary = `System healthy, ${analytics.trends.successRate}% success rate`
        }

        return {
            status,
            alerts: analytics.alerts.filter(a => ['critical', 'high'].includes(a.severity)),
            summary
        }

    } catch (error) {
        console.error('Security status check failed:', error)
        return {
            status: 'red',
            alerts: [{
                type: 'suspicious_ip',
                severity: 'critical',
                details: 'Security monitoring system error',
                timestamp: new Date()
            }],
            summary: 'Security monitoring unavailable'
        }
    }
}
