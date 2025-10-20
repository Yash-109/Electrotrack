// Admin API for security analytics and monitoring
import { NextRequest, NextResponse } from 'next/server'
import { generateSecurityAnalytics, getSecurityStatus, logSecurityEvent } from '@/lib/security-analytics'

export async function GET(request: NextRequest) {
    try {
        // Basic security check
        const authHeader = request.headers.get('authorization')
        const adminKey = process.env.ADMIN_ANALYTICS_KEY || 'analytics-key-2025'

        if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized - Admin access required'
            }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const timeframe = (searchParams.get('timeframe') as '1h' | '24h' | '7d' | '30d') || '24h'
        const action = searchParams.get('action') || 'analytics'

        if (action === 'status') {
            // Get real-time security status
            const status = await getSecurityStatus()
            return NextResponse.json({
                success: true,
                ...status,
                timestamp: new Date().toISOString()
            })
        }

        if (action === 'analytics') {
            // Get detailed analytics
            const analytics = await generateSecurityAnalytics(timeframe)

            return NextResponse.json({
                success: true,
                data: analytics,
                generatedAt: new Date().toISOString()
            })
        }

        return NextResponse.json({
            success: false,
            error: 'Invalid action parameter'
        }, { status: 400 })

    } catch (error: any) {
        console.error('Security analytics API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to generate security analytics',
            details: error.message
        }, { status: 500 })
    }
}

// POST endpoint for logging custom security events
export async function POST(request: NextRequest) {
    try {
        // Basic security check
        const authHeader = request.headers.get('authorization')
        const adminKey = process.env.ADMIN_ANALYTICS_KEY || 'analytics-key-2025'

        if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized - Admin access required'
            }, { status: 401 })
        }

        const { eventType, details } = await request.json()

        if (!eventType) {
            return NextResponse.json({
                success: false,
                error: 'eventType is required'
            }, { status: 400 })
        }

        await logSecurityEvent(eventType, details || {})

        return NextResponse.json({
            success: true,
            message: 'Security event logged successfully'
        })

    } catch (error: any) {
        console.error('Security event logging API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to log security event'
        }, { status: 500 })
    }
}
