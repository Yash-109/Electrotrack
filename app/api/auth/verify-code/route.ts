// API for verifying code before signup
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { logSecurityEvent } from '@/lib/security-analytics'

// Calculate delay for failed attempts (exponential backoff)
function calculateProgressiveDelay(failedAttempts: number): number {
    if (failedAttempts <= 2) return 0 // No delay for first 2 attempts
    if (failedAttempts <= 4) return 30 * 1000 // 30 seconds for attempts 3-4
    if (failedAttempts <= 6) return 60 * 1000 // 1 minute for attempts 5-6
    if (failedAttempts <= 8) return 5 * 60 * 1000 // 5 minutes for attempts 7-8
    return 15 * 60 * 1000 // 15 minutes for attempts 9+
}

// Get client IP address
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfIP = request.headers.get('cf-connecting-ip')

    if (forwarded) return forwarded.split(',')[0].trim()
    if (realIP) return realIP.trim()
    if (cfIP) return cfIP.trim()
    return 'unknown'
}

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json()
        const clientIP = getClientIP(request)

        if (!email || !code) {
            return NextResponse.json({
                success: false,
                error: 'Email and verification code are required'
            }, { status: 400 })
        }

        const db = await getDb()

        // Find the verification record for this email (regardless of code to check rate limiting)
        const verificationRecord = await db.collection('pre_signup_verification').findOne({
            email,
            expiresAt: { $gt: new Date() } // Not expired
        })

        if (!verificationRecord) {
            console.log('🚫 No valid verification record found:', { email, clientIP })
            return NextResponse.json({
                success: false,
                error: 'No verification code found or code has expired. Please request a new code.'
            }, { status: 400 })
        }

        // Check if account is locked due to too many attempts
        if (verificationRecord.failedAttempts >= 10) {
            console.log('🔒 Account locked due to too many failed attempts:', { email, clientIP })
            return NextResponse.json({
                success: false,
                error: 'Account temporarily locked due to too many failed attempts. Please request a new verification code.'
            }, { status: 429 })
        }

        // Check if user needs to wait due to progressive delay
        if (verificationRecord.lastAttemptAt && verificationRecord.failedAttempts > 2) {
            const requiredDelay = calculateProgressiveDelay(verificationRecord.failedAttempts)
            const timeSinceLastAttempt = Date.now() - verificationRecord.lastAttemptAt.getTime()

            if (timeSinceLastAttempt < requiredDelay) {
                const remainingWait = Math.ceil((requiredDelay - timeSinceLastAttempt) / 1000)
                console.log('⏱️ Progressive delay in effect:', { email, clientIP, remainingWait })
                return NextResponse.json({
                    success: false,
                    error: `Please wait ${remainingWait} seconds before trying again.`,
                    retryAfter: remainingWait
                }, { status: 429 })
            }
        }

        // Check if the provided code matches
        if (verificationRecord.code !== code) {
            // Increment failed attempts and update last attempt time
            await db.collection('pre_signup_verification').updateOne(
                { email },
                {
                    $inc: { failedAttempts: 1 },
                    $set: { lastAttemptAt: new Date() }
                }
            )

            const newFailedAttempts = (verificationRecord.failedAttempts || 0) + 1
            console.log('❌ Invalid code attempt:', { email, clientIP, failedAttempts: newFailedAttempts })

            // Log failed verification attempt
            await logSecurityEvent('verification_failure', {
                email,
                ip: clientIP,
                userAgent: request.headers.get('user-agent') || undefined,
                metadata: { failedAttempts: newFailedAttempts, providedCode: code }
            })

            return NextResponse.json({
                success: false,
                error: 'Invalid verification code. Please check and try again.',
                attemptsRemaining: Math.max(0, 10 - newFailedAttempts)
            }, { status: 400 })
        }

        // Check if already verified
        if (verificationRecord.verified) {
            return NextResponse.json({
                success: false,
                error: 'This verification code has already been used.'
            }, { status: 400 })
        }

        // Mark code as verified and reset failed attempts
        await db.collection('pre_signup_verification').updateOne(
            { email },
            {
                $set: {
                    verified: true,
                    verifiedAt: new Date(),
                    failedAttempts: 0, // Reset failed attempts on success
                    lastAttemptAt: new Date()
                }
            }
        )

        console.log('✅ Email verified successfully:', { email, clientIP })

        // Log successful verification
        await logSecurityEvent('verification_success', {
            email,
            ip: clientIP,
            userAgent: request.headers.get('user-agent') || undefined,
            metadata: { previousFailedAttempts: verificationRecord?.failedAttempts || 0 }
        })

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully! You can now complete your registration.',
            verificationToken: `verified_${email}_${Date.now()}`, // Temporary token for signup
            email: email,
            name: verificationRecord?.name || 'User'
        })

    } catch (error: any) {
        console.error('Code verification error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 })
    }
}
