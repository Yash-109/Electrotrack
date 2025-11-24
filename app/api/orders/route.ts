import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { z } from 'zod'

const orderSchema = z.object({
  userEmail: z.string().email('Valid email required'),
  items: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    category: z.string(),
    image: z.string().optional()
  })),
  shippingAddress: z.object({
    fullName: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    phone: z.string()
  }),
  paymentMethod: z.string(),
  total: z.number(),
  subtotal: z.number(),
  tax: z.number().optional(),
  shipping: z.number().optional(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional()
})

// Get orders for a user
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userEmail = url.searchParams.get('userEmail')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    const db = await getDb()
    const orders = db.collection('orders')

    const userOrders = await orders.find({ userEmail })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      orders: userOrders
    })

  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate order data
    const validatedData = orderSchema.parse(body)

    const db = await getDb()
    const orders = db.collection('orders')

    // Generate order ID
    const orderId = `ORD-${Date.now()}`

    // Calculate estimated delivery date (5 business days from now)
    const now = new Date()
    const estimatedDelivery = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)

    // Create order record
    const newOrder = {
      orderId,
      ...validatedData,
      status: validatedData.status || 'processing',
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery,
      trackingHistory: [
        {
          status: 'processing',
          timestamp: new Date(),
          description: 'Order placed and is being processed',
          location: 'Processing Center'
        }
      ],
      notifications: {
        emailSent: false,
        smsSent: false
      }
    }

    const result = await orders.insertOne(newOrder)

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderId: newOrder.orderId,
      order: newOrder
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create order error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, trackingNumber, description, location } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    const db = await getDb()
    const orders = db.collection('orders')

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber
    }

    // Add tracking history entry
    const trackingEntry = {
      status,
      timestamp: new Date(),
      description: description || getStatusDescription(status),
      location: location || getStatusLocation(status)
    }

    // Update estimated delivery for shipped orders
    if (status === 'shipped') {
      const now = new Date()
      updateData.estimatedDelivery = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from shipping
    }

    const result = await orders.updateOne(
      { orderId },
      {
        $set: updateData,
        $push: { trackingHistory: trackingEntry }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    })

  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getStatusDescription(status: string): string {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'Order is being prepared for shipment'
    case 'shipped':
      return 'Package has been shipped and is on the way'
    case 'delivered':
      return 'Package has been successfully delivered'
    case 'cancelled':
      return 'Order has been cancelled'
    default:
      return `Order status updated to ${status}`
  }
}

function getStatusLocation(status: string): string {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'Processing Center'
    case 'shipped':
      return 'In Transit'
    case 'delivered':
      return 'Delivered to Address'
    case 'cancelled':
      return 'Order Centre'
    default:
      return 'Order Centre'
  }
}

// Delete order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const userEmail = searchParams.get('userEmail')

    if (!orderId || !userEmail) {
      return NextResponse.json({ error: 'Order ID and user email are required' }, { status: 400 })
    }

    const db = await getDb()
    const orders = db.collection('orders')

    // Verify order belongs to user before deleting
    const order = await orders.findOne({ orderId, userEmail })
    if (!order) {
      return NextResponse.json({ error: 'Order not found or not authorized' }, { status: 404 })
    }

    // Delete the order
    await orders.deleteOne({ orderId, userEmail })

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })

  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
