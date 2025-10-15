import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const messageId = params.id

        if (!ObjectId.isValid(messageId)) {
            return NextResponse.json({
                error: 'Invalid message ID'
            }, { status: 400 })
        }

        const db = await getDb()
        const contacts = db.collection('contacts')

        const result = await contacts.updateOne(
            { _id: new ObjectId(messageId) },
            {
                $set: {
                    status: 'read',
                    readAt: new Date()
                }
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({
                error: 'Message not found'
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: 'Message marked as read'
        })

    } catch (error: any) {
        console.error('Mark as read error:', error)
        return NextResponse.json({
            error: 'Failed to update message status'
        }, { status: 500 })
    }
}
