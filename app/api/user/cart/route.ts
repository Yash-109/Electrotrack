import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { z } from 'zod'
import { log } from '@/lib/logger'

const cartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().positive(),
  image: z.string(),
  category: z.string()
})

// Get user's cart
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const db = await getDb()
    const carts = db.collection('carts')

    const userCart = await carts.findOne({ userId })

    return NextResponse.json({
      success: true,
      cart: userCart ? userCart.items : [],
      updatedAt: userCart?.updatedAt || null
    })

  } catch (error: unknown) {
    log.error('Get cart error', error, 'user-cart-api')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Add item to cart or update cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, item } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const db = await getDb()
    const carts = db.collection('carts')

    if (action === 'add_item') {
      const validatedItem = cartItemSchema.parse(item)

      // Check if cart exists
      const existingCart = await carts.findOne({ userId })

      if (existingCart) {
        // Check if item already exists in cart
        const existingItemIndex = existingCart.items.findIndex(
          (cartItem: any) => cartItem.productId === validatedItem.productId
        )

        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          await carts.updateOne(
            { userId },
            {
              $set: {
                [`items.${existingItemIndex}.quantity`]: existingCart.items[existingItemIndex].quantity + validatedItem.quantity,
                updatedAt: new Date()
              }
            }
          )
        } else {
          // Add new item to cart
          await carts.updateOne(
            { userId },
            {
              $push: { items: validatedItem } as any,
              $set: { updatedAt: new Date() }
            }
          )
        }
      } else {
        // Create new cart
        await carts.insertOne({
          userId,
          items: [validatedItem],
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Item added to cart successfully'
      })
    }

    if (action === 'update_quantity') {
      const { productId, quantity } = body

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await carts.updateOne(
          { userId },
          {
            $pull: { items: { productId } } as any,
            $set: { updatedAt: new Date() }
          }
        )
      } else {
        await carts.updateOne(
          { userId, 'items.productId': productId },
          {
            $set: {
              'items.$.quantity': quantity,
              updatedAt: new Date()
            }
          }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Cart updated successfully'
      })
    }

    if (action === 'remove_item') {
      const { productId } = body

      await carts.updateOne(
        { userId },
        {
          $pull: { items: { productId } } as any,
          $set: { updatedAt: new Date() }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      })
    }

    if (action === 'clear_cart') {
      await carts.updateOne(
        { userId },
        {
          $set: {
            items: [],
            updatedAt: new Date()
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: unknown) {
    log.error('Cart operation error', error, 'user-cart-api')

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
