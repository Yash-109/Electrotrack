import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Get all expenses
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const category = url.searchParams.get('category')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    const db = await getDb()
    const expenses = db.collection('expenses')

    // Build filter
    const filter: any = {}
    if (category) filter.category = category
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    // Get expenses with pagination
    const skip = (page - 1) * limit
    const expenseList = await expenses
      .find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count
    const total = await expenses.countDocuments(filter)

    // Get categories for filter
    const categories = await (expenses as any).distinct('category')

    return NextResponse.json({
      success: true,
      expenses: expenseList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      categories
    })

  } catch (error: any) {
    console.error('Get expenses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Add new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, amount, category, notes, date } = body

    if (!description || !amount || !category) {
      return NextResponse.json({
        error: 'Description, amount, and category are required'
      }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({
        error: 'Amount must be greater than 0'
      }, { status: 400 })
    }

    const db = await getDb()
    const expenses = db.collection('expenses')

    const expense = {
      _id: new ObjectId(),
      description: description.trim(),
      amount: parseFloat(amount),
      category: category.trim(),
      notes: notes ? notes.trim() : '',
      date: date ? new Date(date) : new Date(),
      type: 'expense',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await expenses.insertOne(expense)

    return NextResponse.json({
      success: true,
      message: 'Expense added successfully',
      expense
    })

  } catch (error: any) {
    console.error('Add expense error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update expense
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, description, amount, category, notes, date } = body

    if (!id) {
      return NextResponse.json({
        error: 'Expense ID is required'
      }, { status: 400 })
    }

    const db = await getDb()
    const expenses = db.collection('expenses')

    const updateData: any = { updatedAt: new Date() }
    if (description) updateData.description = description.trim()
    if (amount) {
      const parsedAmount = parseFloat(amount)
      if (parsedAmount <= 0) {
        return NextResponse.json({
          error: 'Amount must be greater than 0'
        }, { status: 400 })
      }
      updateData.amount = parsedAmount
    }
    if (category) updateData.category = category.trim()
    if (notes !== undefined) updateData.notes = notes.trim()
    if (date) updateData.date = new Date(date)

    const result = await expenses.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({
        error: 'Expense not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully'
    })

  } catch (error: any) {
    console.error('Update expense error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete expense
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        error: 'Expense ID is required'
      }, { status: 400 })
    }

    const db = await getDb()
    const expenses = db.collection('expenses')

    const result = await expenses.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({
        error: 'Expense not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete expense error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
