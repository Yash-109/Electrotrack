import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { logger, ApiResponse, AppError, ErrorType } from '@/lib/api-utils'
import { z } from 'zod'

// Validation schema for cart save request
const cartSaveSchema = z.object({
  userEmail: z.string().email('Valid email is required'),
  items: z.array(z.object({
    id: z.string().min(1, 'Item ID is required'),
    name: z.string().min(1, 'Item name is required'),
    price: z.number().positive('Price must be positive'),
    quantity: z.number().int().positive('Quantity must be positive'),
    image: z.string().optional(),
    category: z.string().optional()
  })).default([]),
  totalAmount: z.number().min(0, 'Total amount cannot be negative').default(0)
})

export async function POST(request: NextRequest) {
  try {
    logger.info('Cart save API called')

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      logger.warn('Invalid JSON in cart save request')
      throw new AppError('Invalid JSON format', ErrorType.VALIDATION, 400)
    }

    logger.debug('Cart save request body', { userEmail: body.userEmail, itemCount: body.items?.length })

    // Validate request data
    const validatedData = cartSaveSchema.parse(body)
    const { userEmail, items, totalAmount } = validatedData

    // Additional business logic validation
    if (items.length > 50) {
      throw new AppError('Cart cannot contain more than 50 items', ErrorType.VALIDATION, 400)
    }

    // Verify total amount matches items
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      logger.warn('Total amount mismatch in cart save', {
        provided: totalAmount,
        calculated: calculatedTotal,
        userEmail
      })
      throw new AppError('Total amount does not match cart items', ErrorType.VALIDATION, 400)
    }

    logger.debug('Getting database connection for cart save')
    const db = await getDb('electrotrack')
    logger.debug('Database connected, accessing carts collection')
    const cartsCollection = db.collection('carts')

    logger.debug('Performing cart upsert operation', { userEmail })
    // Use replaceOne with upsert to handle database conflicts properly
    // This will completely replace the document, avoiding index conflicts
    try {
      const result = await cartsCollection.replaceOne(
        {
          $or: [
            { userEmail: userEmail },
            { userId: userEmail }
          ]
        },
        {
          userEmail,
          userId: userEmail, // Keep for backward compatibility
          items: items || [],
          totalAmount: totalAmount || 0,
          updatedAt: new Date(),
          createdAt: new Date() // Will be ignored if document exists
        },
        { upsert: true }
      )

      logger.info('Cart saved successfully', { userEmail, upserted: !!result.upsertedId })
      return NextResponse.json({
        success: true,
        message: 'Cart saved successfully',
        cartId: result.upsertedId || 'updated',
        itemCount: items.length,
        totalAmount
      })
    } catch (err: any) {
      // Handle duplicate-key specifically to provide a clearer message
      if (err && err.code === 11000) {
        logger.warn('Duplicate key error while saving cart, attempting recovery', { userEmail })

        // Try to delete existing cart and create new one
        try {
          await cartsCollection.deleteMany({
            $or: [
              { userEmail: userEmail },
              { userId: userEmail }
            ]
          })

          const insertResult = await cartsCollection.insertOne({
            userEmail,
            userId: userEmail,
            items: items || [],
            totalAmount: totalAmount || 0,
            updatedAt: new Date(),
            createdAt: new Date()
          })

          logger.info('Cart recreated successfully after conflict', { userEmail })
          return NextResponse.json({
            success: true,
            message: 'Cart saved successfully',
            cartId: insertResult.insertedId,
            itemCount: items.length,
            totalAmount
          })
        } catch (secondError) {
          logger.error('Failed to recreate cart after conflict', secondError)
          throw new AppError('Cart save failed due to database conflict', ErrorType.DATABASE, 500)
        }
      }

      // Check for other specific database errors
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        throw new AppError('Database connection failed', ErrorType.DATABASE, 503)
      }

      throw err
    }

  } catch (error) {
    logger.error('Error saving cart', error)

    // Handle different error types appropriately
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          type: error.type
        },
        { status: error.statusCode }
      )
    }

    if (error instanceof z.ZodError) {
      logger.warn('Cart save validation failed', { errors: error.errors })
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid cart data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    // Generic error response for unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
