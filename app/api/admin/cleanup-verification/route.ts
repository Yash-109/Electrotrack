// Admin API for cleaning up expired verification records
// Can be called periodically or manually by admins

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

interface CleanupStats {
    expiredRecords: number
    oldUnverifiedRecords: number
    suspiciousRecords: number
    totalCleaned: number
    dbSizeBeforeMB?: number
    dbSizeAfterMB?: number
}

async function getCollectionStats() {
    try {
        const db = await getDb()
        const totalRecords = await db.collection('pre_signup_verification').countDocuments()

        // Estimate size based on document count (rough estimation)
        const estimatedSizeMB = (totalRecords * 0.5) / 1024 // Assuming ~0.5KB per document

        return {
            totalRecords,
            sizeMB: estimatedSizeMB.toFixed(2)
        }
    } catch (error) {
        return { totalRecords: 0, sizeMB: '0' }
    }
}

async function performCleanup(): Promise<CleanupStats> {
    const db = await getDb()
    const stats: CleanupStats = {
        expiredRecords: 0,
        oldUnverifiedRecords: 0,
        suspiciousRecords: 0,
        totalCleaned: 0
    }

    try {
        // Get initial DB size
        const initialStats = await getCollectionStats()
        stats.dbSizeBeforeMB = parseFloat(initialStats.sizeMB)

        const now = new Date()

        // 1. Clean up expired records (past expiration time)
        const expiredResult = await db.collection('pre_signup_verification').deleteMany({
            expiresAt: { $lt: now }
        })
        stats.expiredRecords = expiredResult.deletedCount

        // 2. Clean up old unverified records (older than 24 hours, regardless of expiration)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const oldUnverifiedResult = await db.collection('pre_signup_verification').deleteMany({
            verified: false,
            createdAt: { $lt: oneDayAgo }
        })
        stats.oldUnverifiedRecords = oldUnverifiedResult.deletedCount

        // 3. Clean up records with too many failed attempts (potential abuse)
        const suspiciousResult = await db.collection('pre_signup_verification').deleteMany({
            failedAttempts: { $gte: 15 }, // More than 15 failed attempts
            verified: false
        })
        stats.suspiciousRecords = suspiciousResult.deletedCount

        // Calculate total cleaned
        stats.totalCleaned = stats.expiredRecords + stats.oldUnverifiedRecords + stats.suspiciousRecords

        // Get final DB size
        const finalStats = await getCollectionStats()
        stats.dbSizeAfterMB = parseFloat(finalStats.sizeMB)

        return stats

    } catch (error) {
        console.error('Cleanup operation failed:', error)
        throw error
    }
}

export async function POST(request: NextRequest) {
    try {
        // Basic security - check for admin auth header (in production, use proper authentication)
        const authHeader = request.headers.get('authorization')
        const adminKey = process.env.ADMIN_CLEANUP_KEY || 'cleanup-key-2025'

        if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized - Admin access required'
            }, { status: 401 })
        }

        console.log('🧹 Starting verification records cleanup...')
        const cleanupStats = await performCleanup()

        const responseMessage = `Cleanup completed successfully!
    - Expired records removed: ${cleanupStats.expiredRecords}
    - Old unverified records removed: ${cleanupStats.oldUnverifiedRecords}
    - Suspicious records removed: ${cleanupStats.suspiciousRecords}
    - Total records cleaned: ${cleanupStats.totalCleaned}
    - Database size: ${cleanupStats.dbSizeBeforeMB}MB → ${cleanupStats.dbSizeAfterMB}MB`

        console.log('✅ Cleanup completed:', cleanupStats)

        return NextResponse.json({
            success: true,
            message: 'Verification records cleanup completed successfully',
            stats: cleanupStats,
            cleanupTime: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('Cleanup API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Cleanup operation failed',
            details: error.message
        }, { status: 500 })
    }
}

// GET endpoint to check cleanup stats without performing cleanup
export async function GET(request: NextRequest) {
    try {
        const db = await getDb()
        const now = new Date()
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const [
            totalRecords,
            expiredCount,
            oldUnverifiedCount,
            suspiciousCount,
            recentVerified
        ] = await Promise.all([
            db.collection('pre_signup_verification').countDocuments(),
            db.collection('pre_signup_verification').countDocuments({ expiresAt: { $lt: now } }),
            db.collection('pre_signup_verification').countDocuments({
                verified: false,
                createdAt: { $lt: oneDayAgo }
            }),
            db.collection('pre_signup_verification').countDocuments({
                failedAttempts: { $gte: 15 },
                verified: false
            }),
            db.collection('pre_signup_verification').countDocuments({
                verified: true,
                verifiedAt: { $gt: oneDayAgo }
            })
        ])

        const stats = await getCollectionStats()

        return NextResponse.json({
            success: true,
            summary: {
                totalRecords,
                databaseSize: `${stats.sizeMB}MB`,
                cleanupCandidates: {
                    expired: expiredCount,
                    oldUnverified: oldUnverifiedCount,
                    suspicious: suspiciousCount,
                    total: expiredCount + oldUnverifiedCount + suspiciousCount
                },
                recent: {
                    successfulVerifications: recentVerified
                }
            },
            lastChecked: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('Cleanup stats API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to get cleanup stats'
        }, { status: 500 })
    }
}
