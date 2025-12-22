import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { log } from '@/lib/logger'

// Get user orders
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const db = await getDb()
    const orders = db.collection('orders')

    // Get orders for the user, sorted by date (newest first)
    const userOrders = await orders.find({
      userEmail: userId
    }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      orders: userOrders
    })

  } catch (error: unknown) {
    log.error('Get orders error', error, 'user-orders-api')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new order (called after successful payment)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userEmail,
      items,
      shippingAddress,
      paymentId,
      total,
      orderId
    } = body

    if (!userEmail || !items || !shippingAddress || !paymentId || !total) {
      return NextResponse.json({
        error: 'Missing required order information'
      }, { status: 400 })
    }

    const db = await getDb()
    const orders = db.collection('orders')

    const newOrder = {
      _id: new ObjectId(),
      orderId: orderId || `ORD-${Date.now()}`,
      userEmail,
      items,
      shippingAddress,
      paymentId,
      total,
      status: 'Processing',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await orders.insertOne(newOrder)

    // Clear user's cart after successful order
    const carts = db.collection('carts')
    await carts.deleteOne({ userEmail })

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    })

  } catch (error: unknown) {
    log.error('Create order error', error, 'user-orders-api')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update order status (for admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({
        error: 'Order ID and status are required'
      }, { status: 400 })
    }

    const db = await getDb()
    const orders = db.collection('orders')

    await orders.updateOne(
      { orderId },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully'
    })

  } catch (error: unknown) {
    log.error('Update order error', error, 'user-orders-api')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
