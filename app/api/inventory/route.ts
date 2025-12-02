import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { z } from 'zod'
import { ObjectId } from 'mongodb'

const inventoryUpdateSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int(),
  type: z.enum(['add', 'remove', 'set']),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional()
})

const stockAlertSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  minStock: z.number().int().min(0, 'Minimum stock cannot be negative'),
  maxStock: z.number().int().min(1, 'Maximum stock must be positive')
})

// Get inventory status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    const lowStock = url.searchParams.get('lowStock') === 'true'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const db = await getDb()
    const products = db.collection('products')
    const inventory = db.collection('inventory')

    const query: Record<string, any> = {}

    if (productId) {
      // Get specific product inventory
      const product = await products.findOne({ _id: new ObjectId(productId) })
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const inventoryHistory = await inventory.find({ productId })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray()

      return NextResponse.json({
        success: true,
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          currentStock: product.stock,
          minStock: product.minStock || 5,
          maxStock: product.maxStock || 100
        },
        history: inventoryHistory
      })
    }

    // Get all products with inventory status
    if (lowStock) {
      query.stock = { $lte: 10 } // Products with 10 or fewer items
    }

    const totalProducts = await products.countDocuments(query)
    const productList = await products.find(query)
      .sort({ stock: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Get stock alerts
    const stockAlerts = db.collection('stock_alerts')
    const alerts = await stockAlerts.find({}).toArray()
    const alertMap = alerts.reduce((acc: any, alert) => {
      acc[alert.productId] = alert
      return acc
    }, {})

    const inventoryStatus = productList.map(product => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      currentStock: product.stock,
      minStock: alertMap[product._id.toString()]?.minStock || 5,
      maxStock: alertMap[product._id.toString()]?.maxStock || 100,
      status: product.stock <= (alertMap[product._id.toString()]?.minStock || 5) ? 'low' :
        product.stock >= (alertMap[product._id.toString()]?.maxStock || 100) ? 'high' : 'normal',
      lastUpdated: product.updatedAt
    }))

    return NextResponse.json({
      success: true,
      inventory: inventoryStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        hasNext: page < Math.ceil(totalProducts / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get inventory error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update inventory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'update_stock') {
      // Validate inventory update data
      const validatedData = inventoryUpdateSchema.parse(body)

      const db = await getDb()
      const products = db.collection('products')
      const inventory = db.collection('inventory')

      // Get current product
      const product = await products.findOne({ _id: new ObjectId(validatedData.productId) })
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      let newStock = product.stock

      switch (validatedData.type) {
        case 'add':
          newStock += validatedData.quantity
          break
        case 'remove':
          newStock = Math.max(0, newStock - validatedData.quantity)
          break
        case 'set':
          newStock = validatedData.quantity
          break
      }

      // Update product stock
      await products.updateOne(
        { _id: new ObjectId(validatedData.productId) },
        {
          $set: {
            stock: newStock,
            updatedAt: new Date()
          }
        }
      )

      // Record inventory transaction
      const inventoryRecord = {
        productId: validatedData.productId,
        previousStock: product.stock,
        newStock,
        quantity: validatedData.quantity,
        type: validatedData.type,
        reason: validatedData.reason,
        notes: validatedData.notes || '',
        createdAt: new Date()
      }

      await inventory.insertOne(inventoryRecord)

      return NextResponse.json({
        success: true,
        message: 'Inventory updated successfully',
        previousStock: product.stock,
        newStock
      })
    }

    if (action === 'set_alerts') {
      // Validate stock alert data
      const validatedData = stockAlertSchema.parse(body)

      const db = await getDb()
      const stockAlerts = db.collection('stock_alerts')

      // Upsert stock alert settings
      await stockAlerts.updateOne(
        { productId: validatedData.productId },
        {
          $set: {
            ...validatedData,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      )

      return NextResponse.json({
        success: true,
        message: 'Stock alert settings updated successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Update inventory error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
