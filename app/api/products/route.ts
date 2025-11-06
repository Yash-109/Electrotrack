import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { logger, AppError, ErrorType, sanitizeError } from '@/lib/api-utils'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  images: z.array(z.string()).optional(),
  specifications: z.record(z.string()).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional()
})

// Get products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    logger.info('Products GET API called')

    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const subcategory = url.searchParams.get('subcategory')
    const search = url.searchParams.get('search')
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20'))) // Cap at 100
    const featured = url.searchParams.get('featured') === 'true'

    // Validate search query length
    if (search && search.length > 100) {
      throw new AppError('Search query too long', ErrorType.VALIDATION, 400)
    }

    const db = await getDb()
    const products = db.collection('products')

    // Build query
    const query: any = { isActive: { $ne: false } }

    if (category) {
      // Validate category format
      if (!/^[a-zA-Z0-9\-_]+$/.test(category)) {
        throw new AppError('Invalid category format', ErrorType.VALIDATION, 400)
      }
      query.category = category
    }

    if (subcategory) {
      if (!/^[a-zA-Z0-9\-_]+$/.test(subcategory)) {
        throw new AppError('Invalid subcategory format', ErrorType.VALIDATION, 400)
      }
      query.subcategory = subcategory
    }

    if (featured) {
      query.isFeatured = true
    }

    if (search) {
      // Escape regex special characters for security
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { brand: { $regex: escapedSearch, $options: 'i' } }
      ]
    }

    logger.debug('Products query built', { query, page, limit })

    // Get total count for pagination
    const totalProducts = await products.countDocuments(query)

    // Get products with pagination
    const productList = await products.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    logger.info('Products retrieved successfully', {
      count: productList.length,
      total: totalProducts,
      page
    })

    return NextResponse.json({
      success: true,
      products: productList,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        hasNext: page < Math.ceil(totalProducts / limit),
        hasPrev: page > 1,
        limit,
        showing: productList.length // Add count of items in current page
      }
    })

  } catch (error) {
    logger.error('Get products error', error)

    if (error instanceof AppError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        type: error.type
      }, { status: error.statusCode })
    }

    const sanitized = sanitizeError(error)
    return NextResponse.json({
      success: false,
      error: sanitized.message
    }, { status: 500 })
  }
}

// Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate product data
    const validatedData = productSchema.parse(body)

    const db = await getDb()
    const products = db.collection('products')

    // Generate SKU if not provided
    if (!validatedData.sku) {
      validatedData.sku = `PRD-${Date.now()}`
    }

    // Create product record
    const newProduct = {
      ...validatedData,
      isActive: validatedData.isActive ?? true,
      isFeatured: validatedData.isFeatured ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
      salesCount: 0,
      viewCount: 0
    }

    const result = await products.insertOne(newProduct)

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertedId,
      product: newProduct
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create product error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, ...updateData } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const db = await getDb()
    const products = db.collection('products')

    const result = await products.updateOne(
      { _id: productId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    })

  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
