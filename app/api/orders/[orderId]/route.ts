import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }

    const db = await getDb()
    const orders = db.collection('orders')

    // Find the order by orderId
    const order = await orders.findOne({ orderId })

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }

    // Return order details (exclude sensitive information)
    const orderDetails = {
      orderId: order.orderId,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      shippingAddress: order.shippingAddress
    }

    return NextResponse.json({
      success: true,
      order: orderDetails
    })

  } catch (error: any) {
    console.error('Order fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch order details',
      details: error.message
    }, { status: 500 })
  }
}
