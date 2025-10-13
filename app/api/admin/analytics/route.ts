import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { requireAdminRole } from '@/lib/admin-middleware'

// Get analytics data
export const GET = requireAdminRole('admin')(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'monthly' // daily, weekly, monthly, yearly

    const db = await getDb()
    const orders = db.collection('orders')
    const expenses = db.collection('expenses')
    const analytics = db.collection('analytics')

    // Calculate revenue from orders
    const revenueData = await orders.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]).toArray()

    // Calculate total expenses
    const expenseData = await expenses.aggregate([
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]).toArray()

    // Get monthly revenue trends
    const monthlyRevenue = await orders.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]).toArray()

    // Get monthly expenses trends
    const monthlyExpenses = await expenses.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          expenses: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]).toArray()

    // Get category-wise expenses
    const categoryExpenses = await expenses.aggregate([
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]).toArray()

    // Calculate totals
    const totalRevenue = revenueData[0]?.totalRevenue || 0
    const totalExpenses = expenseData[0]?.totalExpenses || 0
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Format monthly data for charts
    const monthlyData = []
    const monthMap = new Map()

    // Add revenue data
    monthlyRevenue.forEach(item => {
      const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`
      monthMap.set(key, {
        month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: item.revenue,
        expenses: 0,
        profit: item.revenue
      })
    })

    // Add expense data
    monthlyExpenses.forEach(item => {
      const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`
      if (monthMap.has(key)) {
        const existing = monthMap.get(key)
        existing.expenses = item.expenses
        existing.profit = existing.revenue - item.expenses
      } else {
        monthMap.set(key, {
          month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: 0,
          expenses: item.expenses,
          profit: -item.expenses
        })
      }
    })

    // Convert map to array and sort
    const chartData = Array.from(monthMap.values()).sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime()
    })

    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin: parseFloat(profitMargin.toFixed(2)),
          totalOrders: revenueData[0]?.totalOrders || 0,
          avgOrderValue: parseFloat((revenueData[0]?.avgOrderValue || 0).toFixed(2))
        },
        chartData,
        categoryData: categoryExpenses.map(cat => ({
          name: cat._id,
          value: cat.amount,
          count: cat.count
        }))
      }
    })

  } catch (error: any) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// Add expense or revenue entry
export const POST = requireAdminRole('admin')(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { type, description, amount, category, notes, date } = body

    if (!type || !description || !amount || !category) {
      return NextResponse.json({
        error: 'Type, description, amount, and category are required'
      }, { status: 400 })
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json({
        error: 'Type must be either "income" or "expense"'
      }, { status: 400 })
    }

    const db = await getDb()
    const collection = type === 'expense' ? db.collection('expenses') : db.collection('revenue')

    const entry = {
      _id: new ObjectId(),
      description,
      amount: parseFloat(amount),
      category,
      type,
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await collection.insertOne(entry)

    return NextResponse.json({
      success: true,
      message: `${type} entry added successfully`,
      entry
    })

  } catch (error: any) {
    console.error('Analytics add error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// Update expense or revenue entry
export const PUT = requireAdminRole('admin')(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, type, description, amount, category, notes, date } = body

    if (!id || !type) {
      return NextResponse.json({
        error: 'ID and type are required'
      }, { status: 400 })
    }

    const db = await getDb()
    const collection = type === 'expense' ? db.collection('expenses') : db.collection('revenue')

    const updateData: any = { updatedAt: new Date() }
    if (description) updateData.description = description
    if (amount) updateData.amount = parseFloat(amount)
    if (category) updateData.category = category
    if (notes !== undefined) updateData.notes = notes
    if (date) updateData.date = new Date(date)

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    return NextResponse.json({
      success: true,
      message: `${type} entry updated successfully`
    })

  } catch (error: any) {
    console.error('Analytics update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// Delete expense or revenue entry
export const DELETE = requireAdminRole('super_admin')(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const type = url.searchParams.get('type')

    if (!id || !type) {
      return NextResponse.json({
        error: 'ID and type are required'
      }, { status: 400 })
    }

    const db = await getDb()
    const collection = type === 'expense' ? db.collection('expenses') : db.collection('revenue')

    await collection.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      message: `${type} entry deleted successfully`
    })

  } catch (error: any) {
    console.error('Analytics delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
