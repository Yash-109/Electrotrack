import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()

    // Check collections
    const orders = await db.collection('orders').countDocuments()
    const expenses = await db.collection('expenses').countDocuments()
    const users = await db.collection('users').countDocuments()
    const carts = await db.collection('carts').countDocuments()

    // Get sample data from each collection
    const allOrders = await db.collection('orders').find().limit(5).toArray()
    const allExpenses = await db.collection('expenses').find().limit(5).toArray()
    const allUsers = await db.collection('users').find().limit(3).toArray()

    // Get collection names
    const collections = await (db as any).listCollections().toArray()
    const collectionNames = collections.map((c: any) => c.name)

    return NextResponse.json({
      success: true,
      status: 'Database connected successfully',
      timestamp: new Date().toISOString(),
      collections: {
        available: collectionNames,
        orders: {
          count: orders,
          samples: allOrders
        },
        expenses: {
          count: expenses,
          samples: allExpenses
        },
        users: {
          count: users,
          samples: allUsers.map(u => ({ _id: u._id, email: u.email, name: u.name })) // Hide sensitive data
        },
        carts: {
          count: carts
        }
      }
    })

  } catch (error: any) {
    console.error('Database status error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    }, { status: 500 })
  }
}
