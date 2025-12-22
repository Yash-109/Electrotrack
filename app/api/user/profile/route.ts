import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { z } from 'zod'
import { log } from '@/lib/logger'

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  isDefault: z.boolean().optional()
})

// Get user profile with shipping addresses
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const db = await getDb()
    const users = db.collection('users')

    const user = await users.findOne({
      email: userId
    }, {
      projection: { password: 0 }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessType: user.businessType,
        shippingAddresses: user.shippingAddresses || [],
        preferences: user.preferences || {}
      }
    })

  } catch (error: unknown) {
    log.error('Get profile error', error, 'user-profile-api')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update user profile or add shipping address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, data } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const db = await getDb()
    const users = db.collection('users')

    if (action === 'add_address') {
      const validatedAddress = addressSchema.parse(data)

      // If this is set as default, unset other defaults
      if (validatedAddress.isDefault) {
        await users.updateOne(
          { email: userId },
          { $set: { 'shippingAddresses.$[].isDefault': false } }
        )
      }

      const addressWithId = {
        ...validatedAddress,
        id: new Date().getTime().toString(),
        createdAt: new Date()
      }

      await users.updateOne(
        { email: userId },
        {
          $push: { shippingAddresses: addressWithId } as any,
          $set: { updatedAt: new Date() }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Shipping address added successfully',
        address: addressWithId
      })
    }

    if (action === 'update_address') {
      const { addressId, ...addressData } = data
      const validatedAddress = addressSchema.parse(addressData)

      await users.updateOne(
        { email: userId, 'shippingAddresses.id': addressId },
        {
          $set: {
            'shippingAddresses.$': {
              ...validatedAddress,
              id: addressId,
              updatedAt: new Date()
            }
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Shipping address updated successfully'
      })
    }

    if (action === 'delete_address') {
      const { addressId } = data

      await users.updateOne(
        { email: userId },
        {
          $pull: { shippingAddresses: { id: addressId } } as any,
          $set: { updatedAt: new Date() }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Shipping address deleted successfully'
      })
    }

    if (action === 'update_profile') {
      const { name, businessType, phone } = data

      await users.updateOne(
        { email: userId },
        {
          $set: {
            name: name || '',
            businessType: businessType || '',
            phone: phone || '',
            updatedAt: new Date()
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: unknown) {
    log.error('Profile update error', error, 'user-profile-api')

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
