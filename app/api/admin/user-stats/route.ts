import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const db = await getDb()

    // Count total users from different collections
    const usersCollection = db.collection('users')
    const accountsCollection = db.collection('accounts') // NextAuth accounts
    const sessionsCollection = db.collection('sessions') // NextAuth sessions

    // Get total registered users (from both custom users and OAuth users)
    let customUsers = 0
    let oauthUsers = 0
    let activeSessions = 0

    try {
      customUsers = await usersCollection.countDocuments({})
    } catch (error) {
      console.log('Custom users collection not found or empty')
    }

    try {
      oauthUsers = await accountsCollection.countDocuments({})
    } catch (error) {
      console.log('OAuth accounts collection not found or empty')
    }

    try {
      activeSessions = await sessionsCollection.countDocuments({
        expires: { $gt: new Date() }
      })
    } catch (error) {
      console.log('Sessions collection not found or empty')
    }

    // Get unique users (avoid double counting if user has both custom and OAuth account)
    const allUserEmails = new Set<string>()

    // Add custom user emails
    try {
      const customUserEmails = await usersCollection.find({}).project({ email: 1 }).toArray()
      customUserEmails.forEach((user: any) => {
        if (user.email) allUserEmails.add(user.email.toLowerCase())
      })
    } catch (error) {
      console.log('Error fetching custom user emails:', error)
    }

    // Add OAuth user emails
    try {
      const oauthAccounts = await accountsCollection.find({}).project({ userId: 1 }).toArray()
      for (const account of oauthAccounts) {
        if (account.userId) {
          // Get user details from NextAuth users collection
          const userDoc = await db.collection('users').findOne({ _id: new ObjectId(account.userId) })
          if (userDoc?.email) {
            allUserEmails.add(userDoc.email.toLowerCase())
          }
        }
      }
    } catch (error) {
      console.log('Error fetching OAuth user emails:', error)
    }

    // Calculate total unique users
    const totalUniqueUsers = allUserEmails.size

    // If no users found, show the sum of custom and OAuth users (may have some duplicates)
    const totalUsers = totalUniqueUsers > 0 ? totalUniqueUsers : (customUsers + oauthUsers)

    const stats = {
      totalUsers,
      registeredUsers: totalUsers,
      customUsers,
      oauthUsers,
      activeSessions,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}
