import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getDb } from '@/lib/mongodb'
import crypto from 'crypto'

// Initialize Razorpay only if keys are available
let razorpay: Razorpay | null = null

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

// Supported payment methods
const PAYMENT_METHODS = {
  'card': ['visa', 'mastercard', 'amex', 'rupay'],
  'netbanking': ['hdfc', 'icici', 'axis', 'sbi', 'kotak', 'yesbank', 'pnb', 'bob', 'canara'],
  'upi': ['upi'],
  'wallet': ['paytm', 'phonepe', 'googlepay', 'amazonpay', 'freecharge'],
  'emi': ['cardemi', 'nbemi']
}

// Create payment order
export async function POST(request: NextRequest) {
  try {
    if (!razorpay) {
      return NextResponse.json({
        success: false,
        error: 'Payment gateway not configured. Please contact administrator.'
      }, { status: 500 })
    }

    const body = await request.json()
    const {
      amount,
      currency = 'INR',
      userId,
      orderDetails,
      preferredMethod = 'card',
      customerInfo
    } = body

    if (!amount || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Amount and user ID are required'
      }, { status: 400 })
    }

    // Validate amount (minimum ₹1)
    if (amount < 1) {
      return NextResponse.json({
        success: false,
        error: 'Minimum amount is ₹1'
      }, { status: 400 })
    }

    // Create Razorpay order with enhanced options
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        order_type: 'online_purchase',
        customer_email: userId,
        preferred_method: preferredMethod,
        created_at: new Date().toISOString()
      }
    }

    const order = await razorpay!.orders.create(options)

    // Store temporary order in database with enhanced details
    const db = await getDb()
    const tempOrders = db.collection('temp_orders')

    const orderRecord = {
      razorpayOrderId: order.id,
      userId,
      amount: amount,
      currency,
      receipt: options.receipt,
      preferredMethod,
      customerInfo,
      orderDetails,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
    }

    await tempOrders.insertOne(orderRecord)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      supportedMethods: PAYMENT_METHODS,
      orderDetails: {
        receipt: options.receipt,
        notes: options.notes
      }
    })

  } catch (error: any) {
    console.error('Payment order creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment order',
      details: error.message
    }, { status: 500 })
  }
}

// Verify payment
export async function PUT(request: NextRequest) {
  try {
    if (!razorpay) {
      return NextResponse.json({
        success: false,
        error: 'Payment gateway not configured'
      }, { status: 500 })
    }

    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      orderDetails
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({
        success: false,
        error: 'Missing payment verification parameters'
      }, { status: 400 })
    }

    // Verify signature
    const text = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment signature'
      }, { status: 400 })
    }

    // Get payment details from Razorpay
    const payment = await razorpay!.payments.fetch(razorpay_payment_id)

    // Update order status in database and create order record
    const db = await getDb()
    const orders = db.collection('orders')
    const tempOrders = db.collection('temp_orders')

    // Find the temporary order
    const tempOrder = await tempOrders.findOne({
      razorpayOrderId: razorpay_order_id,
      userId
    })

    if (!tempOrder) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }

    // Create permanent order record with payment details
    const orderRecord = {
      orderId: `ORD${Date.now()}`,
      userEmail: userId,
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      paymentMethod: payment.method,
      bank: payment.bank || null,
      wallet: payment.wallet || null,
      vpa: payment.vpa || null, // UPI VPA
      items: orderDetails?.items || tempOrder.orderDetails?.items || [],
      shippingAddress: orderDetails?.shippingAddress || tempOrder.orderDetails?.shippingAddress || {},
      subtotal: orderDetails?.subtotal || tempOrder.orderDetails?.subtotal || 0,
      tax: orderDetails?.tax || tempOrder.orderDetails?.tax || 0,
      shipping: orderDetails?.shipping || tempOrder.orderDetails?.shipping || 0,
      total: tempOrder.amount,
      currency: tempOrder.currency,
      paymentStatus: 'completed',
      orderStatus: 'processing',
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentDetails: {
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        captured: payment.captured,
        createdAt: new Date(payment.created_at * 1000)
      }
    }

    await orders.insertOne(orderRecord)

    // Clean up temporary order
    await tempOrders.deleteOne({ _id: tempOrder._id })

    // Clear user's cart after successful payment
    const carts = db.collection('carts')
    await carts.deleteOne({ userEmail: userId })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        orderId: orderRecord.orderId,
        paymentId: razorpay_payment_id,
        amount: orderRecord.total,
        currency: orderRecord.currency,
        status: orderRecord.orderStatus,
        paymentMethod: orderRecord.paymentMethod
      }
    })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to verify payment',
      details: error.message
    }, { status: 500 })
  }
}
