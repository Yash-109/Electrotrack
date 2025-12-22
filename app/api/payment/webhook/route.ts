import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getDb } from '@/lib/mongodb'
import { log } from '@/lib/logger'

// Webhook endpoint to handle payment events from Razorpay
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({
        error: 'Missing webhook signature'
      }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({
        error: 'Invalid webhook signature'
      }, { status: 400 })
    }

    const event = JSON.parse(body)
    const db = await getDb()
    const orders = db.collection('orders')
    const webhookLogs = db.collection('webhook_logs')

    // Log webhook event
    await webhookLogs.insertOne({
      event: event.event,
      payload: event,
      receivedAt: new Date()
    })

    // Handle different payment events
    switch (event.event) {
      case 'payment.captured':
        // Payment was successfully captured
        const capturedPayment = event.payload.payment.entity
        await orders.updateOne(
          { paymentId: capturedPayment.id },
          {
            $set: {
              paymentStatus: 'captured',
              orderStatus: 'confirmed',
              updatedAt: new Date()
            }
          }
        )
        break

      case 'payment.failed':
        // Payment failed
        const failedPayment = event.payload.payment.entity
        await orders.updateOne(
          { paymentId: failedPayment.id },
          {
            $set: {
              paymentStatus: 'failed',
              orderStatus: 'cancelled',
              failureReason: failedPayment.error_description,
              updatedAt: new Date()
            }
          }
        )
        break

      case 'order.paid':
        // Order was fully paid
        const paidOrder = event.payload.order.entity
        await orders.updateOne(
          { razorpayOrderId: paidOrder.id },
          {
            $set: {
              paymentStatus: 'paid',
              orderStatus: 'processing',
              updatedAt: new Date()
            }
          }
        )
        break

      case 'payment.authorized':
        // Payment was authorized (for card payments)
        const authorizedPayment = event.payload.payment.entity
        await orders.updateOne(
          { paymentId: authorizedPayment.id },
          {
            $set: {
              paymentStatus: 'authorized',
              updatedAt: new Date()
            }
          }
        )
        break

      default:
        log.info(`Unhandled webhook event: ${event.event}`, 'payment-webhook')
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error: unknown) {
    log.error('Webhook processing error', error, 'payment-webhook')
    return NextResponse.json({
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
