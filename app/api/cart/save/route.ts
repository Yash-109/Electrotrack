import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { logger, ApiResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    logger.info('Cart save API called')
    const body = await request.json()
    logger.debug('Cart save request body', { userEmail: body.userEmail, itemCount: body.items?.length })
    const { userEmail, items, totalAmount } = body

    if (!userEmail) {
      logger.warn('Cart save attempted without userEmail')
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
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
        cartId: result.upsertedId || 'updated'
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
            cartId: insertResult.insertedId
          })
        } catch (secondError) {
          logger.error('Failed to recreate cart after conflict', secondError)
          return NextResponse.json({
            error: 'Cart save failed due to database conflict'
          }, { status: 500 })
        }
      }

      throw err
    }

  } catch (error) {
    logger.error('Error saving cart', error)
    return NextResponse.json(
      { error: 'Failed to save cart' },
      { status: 500 }
    )
  }
}
