import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { z } from 'zod'

const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  userEmail: z.string().email('Valid email required'),
  userName: z.string().min(1, 'User name is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Review title is required'),
  comment: z.string().min(1, 'Review comment is required'),
  isVerifiedPurchase: z.boolean().optional()
})

// Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    const userEmail = url.searchParams.get('userEmail')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const db = await getDb()
    const reviews = db.collection('reviews')

    const query: Record<string, any> = {}

    if (productId) {
      query.productId = productId
    }

    if (userEmail) {
      query.userEmail = userEmail
    }

    // Get total count for pagination
    const totalReviews = await reviews.countDocuments(query)

    // Get reviews with pagination
    const reviewList = await reviews.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Get average rating if getting reviews for a product
    let averageRating: { average: number; total: number } | null = null
    if (productId) {
      const ratingStats = await reviews.aggregate([
        { $match: { productId } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalRatings: { $sum: 1 }
          }
        }
      ]).toArray()

      if (ratingStats.length > 0) {
        averageRating = {
          average: Math.round(ratingStats[0].avgRating * 10) / 10,
          total: ratingStats[0].totalRatings
        }
      }
    }

    return NextResponse.json({
      success: true,
      reviews: reviewList,
      averageRating,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate review data
    const validatedData = reviewSchema.parse(body)

    const db = await getDb()
    const reviews = db.collection('reviews')
    const orders = db.collection('orders')

    // Check if user has already reviewed this product
    const existingReview = await reviews.findOne({
      productId: validatedData.productId,
      userEmail: validatedData.userEmail
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
    }

    // Check if it's a verified purchase
    let isVerifiedPurchase = false
    const userOrder = await orders.findOne({
      userEmail: validatedData.userEmail,
      'items.id': parseInt(validatedData.productId),
      status: { $in: ['delivered', 'processing', 'shipped'] }
    })

    if (userOrder) {
      isVerifiedPurchase = true
    }

    // Create review record
    const newReview = {
      ...validatedData,
      isVerifiedPurchase,
      isApproved: true, // Auto-approve for now
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await reviews.insertOne(newReview)

    return NextResponse.json({
      success: true,
      message: 'Review added successfully',
      reviewId: result.insertedId,
      review: newReview
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create review error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Mark review as helpful
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewId, action } = body

    if (!reviewId || !action) {
      return NextResponse.json({ error: 'Review ID and action are required' }, { status: 400 })
    }

    const db = await getDb()
    const reviews = db.collection('reviews')

    let updateOperation = {}

    if (action === 'helpful') {
      updateOperation = { $inc: { helpfulCount: 1 } }
    } else if (action === 'approve') {
      updateOperation = { $set: { isApproved: true, updatedAt: new Date() } }
    } else if (action === 'reject') {
      updateOperation = { $set: { isApproved: false, updatedAt: new Date() } }
    }

    const result = await reviews.updateOne(
      { _id: reviewId },
      updateOperation
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully'
    })

  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
