import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

// Get user's votes for reviews
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userEmail = url.searchParams.get('userEmail')
    const reviewIds = url.searchParams.get('reviewIds')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    const db = await getDb()
    const reviewVotes = db.collection('review_votes')

    let query: Record<string, any> = { userEmail }

    // If specific review IDs provided, filter by them
    if (reviewIds) {
      const reviewIdArray = reviewIds.split(',')
      query.reviewId = { $in: reviewIdArray }
    }

    const userVotes = await reviewVotes.find(query).toArray()

    // Create a map of reviewId -> voteType for easy lookup
    const votesMap = userVotes.reduce((acc: Record<string, string>, vote: any) => {
      acc[vote.reviewId] = vote.voteType
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      votes: votesMap
    })

  } catch (error) {
    console.error('Get user votes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
