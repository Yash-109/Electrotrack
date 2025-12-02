import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()

    // Add sample orders
    const orders = db.collection('orders')
    const sampleOrders = [
      {
        _id: new ObjectId(),
        userId: 'sample-user-1',
        items: [
          { id: '1', name: 'Wireless Headphones', price: 79.99, quantity: 1 }
        ],
        total: 79.99,
        status: 'completed',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
      },
      {
        _id: new ObjectId(),
        userId: 'sample-user-2',
        items: [
          { id: '2', name: 'Smartphone Case', price: 24.99, quantity: 2 }
        ],
        total: 49.98,
        status: 'completed',
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date('2024-12-02')
      },
      {
        _id: new ObjectId(),
        userId: 'sample-user-3',
        items: [
          { id: '3', name: 'Bluetooth Speaker', price: 129.99, quantity: 1 }
        ],
        total: 129.99,
        status: 'completed',
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05')
      },
      {
        _id: new ObjectId(),
        userId: 'sample-user-4',
        items: [
          { id: '4', name: 'Laptop Stand', price: 89.99, quantity: 1 },
          { id: '5', name: 'Wireless Mouse', price: 39.99, quantity: 1 }
        ],
        total: 129.98,
        status: 'completed',
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10')
      },
      {
        _id: new ObjectId(),
        userId: 'sample-user-5',
        items: [
          { id: '6', name: 'Gaming Keyboard', price: 159.99, quantity: 1 }
        ],
        total: 159.99,
        status: 'completed',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02')
      },
      {
        _id: new ObjectId(),
        userId: 'sample-user-6',
        items: [
          { id: '7', name: 'Monitor', price: 299.99, quantity: 1 }
        ],
        total: 299.99,
        status: 'completed',
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-05')
      }
    ]

    await orders.insertMany(sampleOrders)

    // Add sample expenses
    const expenses = db.collection('expenses')
    const sampleExpenses = [
      {
        _id: new ObjectId(),
        description: 'Office rent for December',
        amount: 1200.00,
        category: 'Operations',
        notes: 'Monthly office space rental',
        date: new Date('2024-12-01'),
        type: 'expense',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
      },
      {
        _id: new ObjectId(),
        description: 'Google Ads campaign',
        amount: 450.00,
        category: 'Marketing',
        notes: 'December advertising spend',
        date: new Date('2024-12-03'),
        type: 'expense',
        createdAt: new Date('2024-12-03'),
        updatedAt: new Date('2024-12-03')
      },
      {
        _id: new ObjectId(),
        description: 'Office supplies',
        amount: 125.50,
        category: 'Supplies',
        notes: 'Stationery and printing materials',
        date: new Date('2024-12-05'),
        type: 'expense',
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05')
      },
      {
        _id: new ObjectId(),
        description: 'Web hosting and services',
        amount: 89.99,
        category: 'Technology',
        notes: 'Monthly hosting and domain costs',
        date: new Date('2024-12-08'),
        type: 'expense',
        createdAt: new Date('2024-12-08'),
        updatedAt: new Date('2024-12-08')
      },
      {
        _id: new ObjectId(),
        description: 'January office rent',
        amount: 1200.00,
        category: 'Operations',
        notes: 'Monthly office space rental',
        date: new Date('2025-01-01'),
        type: 'expense',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        _id: new ObjectId(),
        description: 'Social media marketing',
        amount: 320.00,
        category: 'Marketing',
        notes: 'Facebook and Instagram ads',
        date: new Date('2025-01-03'),
        type: 'expense',
        createdAt: new Date('2025-01-03'),
        updatedAt: new Date('2025-01-03')
      }
    ]

    await expenses.insertMany(sampleExpenses)

    return NextResponse.json({
      success: true,
      message: 'Sample data added successfully',
      data: {
        ordersAdded: sampleOrders.length,
        expensesAdded: sampleExpenses.length
      }
    })

  } catch (error) {
    const { log } = require('@/lib/logger')
    log.error('Sample data error', error, 'AdminSampleData')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
