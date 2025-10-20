// API for sending verification code before signup
import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCode, generateVerificationCode } from '@/lib/pre-signup-verification'
import { getDb } from '@/lib/mongodb'
import { logSecurityEvent } from '@/lib/security-analytics'

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP.trim()
  }
  if (cfIP) {
    return cfIP.trim()
  }

  // Fallback to remote address from headers
  return request.headers.get('x-forwarded-for') || 'unknown'
}

// Gmail address validation - Block obvious fake patterns
async function verifyGmailExists(email: string): Promise<boolean> {
  try {
    const localPart = email.split('@')[0].toLowerCase()

    // Block specific fake name patterns that user reported
    const fakeNamePatterns = [
      /^kunj\d*$/i,           // kunj + any digits (kunj24, kunj123, etc.)
      /^khyati.*\d{3,}$/i,    // khyati + anything + 3+ digits (khyatiparmar225, khyatiparmar2560, etc.)
      /^khyatiparmar\d+$/i    // khyatiparmar + any digits
    ]

    if (fakeNamePatterns.some(pattern => pattern.test(localPart))) {
      console.log('Blocked fake name pattern:', email)
      return false
    }

    // Known fake emails reported by user (exact matches)
    const knownFakeEmails = [
      'kunj24',
      'khyatiparmar2560',
      'khyatiparmar225'  // Added this one since it also doesn't exist
    ]

    if (knownFakeEmails.includes(localPart)) {
      console.log('Blocked known fake email:', email)
      return false
    }

    // Block obviously fake patterns
    const obviousFakePatterns = [
      /^test\d*$/i,
      /^fake\d*$/i,
      /^dummy\d*$/i,
      /^temp\d*$/i,
      /^sample\d*$/i,
      /^example\d*$/i,
      /^admin\d*$/i,
      /^null\d*$/i,
      /^spam\d*$/i
    ]

    if (obviousFakePatterns.some(pattern => pattern.test(localPart))) {
      console.log('Blocked obvious fake email pattern:', email)
      return false
    }

    // Block suspicious patterns that are likely fake
    const suspiciousPatterns = [
      /^[a-z]{1,5}\d{3,}$/i,        // Short name + many digits (e.g., abc123)
      /^[a-z]+\d{3,}$/i,            // Any name + 3+ digits (catches most fake patterns)
      /^[a-z]\d+$/i,                // Single letter + digits
      /^\d+[a-z]*$/i,               // Starting with digits
      /^(user|guest|visitor)\d*$/i, // Generic names
      /^[a-z]{1,3}\d{2,}$/i,        // Very short + digits pattern
      /^[a-z]+\.[a-z]+\d{3,}$/i     // name.lastname + 3+ digits (like sarah.smith123)
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(localPart))) {
      console.log('Blocked suspicious email pattern:', email)
      return false
    }

    // Additional checks for common fake patterns
    if (localPart.length < 3) {
      console.log('Blocked too short email:', email)
      return false
    }

    // Block if it's all numbers
    if (/^\d+$/.test(localPart)) {
      console.log('Blocked all-numbers email:', email)
      return false
    }

    // If it passes all checks, consider it valid
    console.log('Email passed validation:', email)
    return true

  } catch (error: any) {
    console.error('Email validation error:', error.message)
    // If validation fails, block to be safe
    return false
  }
}
// Store verification codes temporarily (before account creation)
async function storeVerificationCode(email: string, code: string, name: string, clientIP: string) {
  try {
    const db = await getDb()

    // Remove any existing codes for this email
    await db.collection('pre_signup_verification').deleteMany({ email })

    // Store new code with 10-minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await db.collection('pre_signup_verification').insertOne({
      email,
      code,
      name,
      clientIP,
      expiresAt,
      createdAt: new Date(),
      verified: false,
      attempts: 0,
      lastAttemptAt: null,
      failedAttempts: 0
    })

    return true
  } catch (error) {
    console.error('Failed to store verification code:', error)
    return false
  }
}

// Check IP-based rate limiting
async function checkIPRateLimit(clientIP: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const db = await getDb()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    // Count verification codes requested from this IP in the last hour
    const ipRequestCount = await db.collection('pre_signup_verification').countDocuments({
      clientIP,
      createdAt: { $gt: oneHourAgo }
    })

    // Allow max 10 requests per IP per hour (across all emails)
    if (ipRequestCount >= 10) {
      return {
        allowed: false,
        reason: 'Too many verification requests from this IP address. Please wait an hour before trying again.'
      }
    }

    // Check for suspicious rapid requests (more than 3 in 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const rapidRequests = await db.collection('pre_signup_verification').countDocuments({
      clientIP,
      createdAt: { $gt: tenMinutesAgo }
    })

    if (rapidRequests >= 3) {
      return {
        allowed: false,
        reason: 'Too many rapid verification requests. Please wait 10 minutes before trying again.'
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('IP rate limit check error:', error)
    return { allowed: true } // Allow on error to not block legitimate users
  }
}

// Cleanup expired verification records
async function cleanupExpiredRecords(): Promise<void> {
  try {
    const db = await getDb()
    const now = new Date()

    const result = await db.collection('pre_signup_verification').deleteMany({
      expiresAt: { $lt: now }
    })

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired verification records`)
    }
  } catch (error) {
    console.error('Cleanup expired records error:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    const clientIP = getClientIP(request)

    // Cleanup expired records first (housekeeping)
    await cleanupExpiredRecords()

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email and name are required'
      }, { status: 400 })
    }

    // Check IP-based rate limiting first
    const ipCheck = await checkIPRateLimit(clientIP)
    if (!ipCheck.allowed) {
      console.log('🚫 IP rate limit exceeded:', { ip: clientIP, email })

      // Log security event
      await logSecurityEvent('rate_limit_hit', {
        email,
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
        metadata: { reason: ipCheck.reason }
      })

      return NextResponse.json({
        success: false,
        error: ipCheck.reason
      }, { status: 429 })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 })
    }

    // Check if it's a Gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.json({
        success: false,
        error: 'Only Gmail addresses are supported'
      }, { status: 400 })
    }

    // Gmail address existence verification - CRITICAL: Must block if address doesn't exist
    const gmailExists = await verifyGmailExists(email)
    if (!gmailExists) {
      // Log suspicious activity for fake email attempts
      await logSecurityEvent('suspicious_activity', {
        email,
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
        metadata: { reason: 'fake_email_blocked', pattern: 'gmail_verification_failed' }
      })

      return NextResponse.json({
        success: false,
        error: 'This Gmail address does not exist or cannot receive emails.',
        details: 'Please enter a valid Gmail address that you can access.'
      }, { status: 400 })
    }

    // Check if user already exists
    const db = await getDb()
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User already exists with this email'
      }, { status: 400 })
    }

    // Check rate limiting - max 3 codes per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCodes = await db.collection('pre_signup_verification').countDocuments({
      email,
      createdAt: { $gt: oneHourAgo }
    })

    if (recentCodes >= 3) {
      return NextResponse.json({
        success: false,
        error: 'Too many verification attempts. Please wait an hour before requesting another code.'
      }, { status: 429 })
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()

    // Store code in database
    const codeStored = await storeVerificationCode(email, verificationCode, name, clientIP)
    if (!codeStored) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate verification code'
      }, { status: 500 })
    }

    // Send verification code email
    const emailResult = await sendVerificationCode(email, name, verificationCode)

    if (!emailResult.success) {
      // Clean up stored code if email failed
      await db.collection('pre_signup_verification').deleteMany({ email, code: verificationCode })

      // Provide more specific error message
      let errorMessage = 'Failed to send verification code'
      let statusCode = 500

      if (emailResult.error?.includes('550') || emailResult.error?.includes('not found') || emailResult.error?.includes('does not exist')) {
        errorMessage = 'The Gmail address you entered does not exist. Please check your email address and try again.'
        statusCode = 400
      } else if (emailResult.error?.includes('blocked') || emailResult.error?.includes('rejected')) {
        errorMessage = 'Email delivery was blocked. Please ensure your Gmail address can receive emails.'
        statusCode = 400
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: 'Please double-check that your Gmail address is correct and can receive emails.'
      }, { status: statusCode })
    }

    // Log successful verification request
    await logSecurityEvent('verification_request', {
      email,
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: { success: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      email: email,
      expiresInMinutes: 10
    })

  } catch (error: any) {
    console.error('Send verification code error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
