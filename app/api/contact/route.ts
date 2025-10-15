import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { sendContactNotification } from '@/lib/email-service'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { fullName, email, phone, subject, message } = body

        // Validation
        if (!fullName || !email || !subject || !message) {
            return NextResponse.json({
                error: 'Full name, email, subject, and message are required'
            }, { status: 400 })
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                error: 'Please provide a valid email address'
            }, { status: 400 })
        }

        const db = await getDb()
        const contacts = db.collection('contacts')

        // Create contact message
        const contactMessage = {
            fullName,
            email,
            phone: phone || null,
            subject,
            message,
            status: 'unread',
            createdAt: new Date(),
            ipAddress: request.ip || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        }

        const result = await contacts.insertOne(contactMessage)

        // Send email notification to admin (optional)
        try {
            await sendContactNotification({
                fullName,
                email,
                phone,
                subject,
                message
            })
        } catch (emailError) {
            console.error('Failed to send contact notification email:', emailError)
            // Don't fail the entire request if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.',
            messageId: result.insertedId
        }, { status: 201 })

    } catch (error: any) {
        console.error('Contact form error:', error)
        return NextResponse.json({
            error: 'Failed to send message. Please try again later.',
            details: error.message
        }, { status: 500 })
    }
}

// GET endpoint to retrieve contact messages (admin only)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') // 'read', 'unread', or null for all
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = parseInt(searchParams.get('skip') || '0')

        const db = await getDb()
        const contacts = db.collection('contacts')

        // Build query
        const query: any = {}
        if (status && ['read', 'unread'].includes(status)) {
            query.status = status
        }

        // Get messages with pagination
        const messages = await contacts
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray()

        const totalCount = await contacts.countDocuments(query)
        const unreadCount = await contacts.countDocuments({ status: 'unread' })

        return NextResponse.json({
            success: true,
            messages,
            pagination: {
                total: totalCount,
                unread: unreadCount,
                limit,
                skip,
                hasMore: (skip + limit) < totalCount
            }
        })

    } catch (error: any) {
        console.error('Get contacts error:', error)
        return NextResponse.json({
            error: 'Failed to retrieve messages'
        }, { status: 500 })
    }
}
