# Review Voting System Enhancement

## Overview
Enhanced the product review system with a comprehensive voting mechanism that tracks helpful/unhelpful votes per user, prevents duplicate votes, and provides toggle functionality.

## Features Added

### 1. **User-Specific Vote Tracking**
- Each vote is now associated with a user's email
- Prevents multiple votes from the same user
- Stores votes in a dedicated `review_votes` collection

### 2. **Vote Toggle Functionality**
- Clicking "helpful" again removes the vote (toggle off)
- Switching from "helpful" to "unhelpful" updates the vote
- Automatically adjusts both helpful and unhelpful counts

### 3. **Unhelpful Vote Support**
- Added `unhelpfulCount` field to reviews
- Supports both positive and negative feedback
- Provides balanced review credibility assessment

## API Endpoints

### PUT /api/reviews
**Enhanced to support user-based voting**

**Request Body:**
```json
{
  "reviewId": "review_id_string",
  "action": "helpful" | "unhelpful" | "approve" | "reject",
  "userEmail": "user@example.com"  // Required for helpful/unhelpful actions
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "helpfulCount": 15,
  "unhelpfulCount": 2
}
```

### GET /api/reviews/user-votes
**New endpoint to retrieve user's vote status**

**Query Parameters:**
- `userEmail` (required): User's email address
- `reviewIds` (optional): Comma-separated list of review IDs

**Response:**
```json
{
  "success": true,
  "votes": {
    "review_id_1": "helpful",
    "review_id_2": "unhelpful"
  }
}
```

## Database Schema

### review_votes Collection
```typescript
{
  _id: ObjectId,
  reviewId: string,           // Reference to review
  userEmail: string,          // User who voted
  voteType: "helpful" | "unhelpful",
  createdAt: Date,
  updatedAt: Date
}
```

### reviews Collection (Updated)
```typescript
{
  // ... existing fields
  helpfulCount: number,        // Count of helpful votes
  unhelpfulCount: number,      // Count of unhelpful votes (NEW)
  // ... other fields
}
```

## Vote Logic

### New Vote
1. User clicks "helpful" or "unhelpful"
2. Creates entry in `review_votes` collection
3. Increments corresponding counter in review

### Toggle Vote (Same Type)
1. User clicks same vote type again
2. Removes entry from `review_votes` collection
3. Decrements corresponding counter

### Change Vote (Different Type)
1. User switches from "helpful" to "unhelpful" or vice versa
2. Updates existing entry in `review_votes` collection
3. Increments new counter, decrements old counter

## Benefits

1. **Prevents Vote Manipulation**: Users can't spam helpful/unhelpful votes
2. **User-Friendly**: Toggle functionality feels natural and intuitive
3. **Scalable**: Separate collection allows efficient vote lookups
4. **Flexible**: Easy to add features like vote history or analytics
5. **Data Integrity**: Accurate vote counts with proper constraints

## Usage Example

```typescript
// Vote helpful
const response = await fetch('/api/reviews', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reviewId: 'abc123',
    action: 'helpful',
    userEmail: 'user@example.com'
  })
})

// Get user's votes
const votesResponse = await fetch(
  '/api/reviews/user-votes?userEmail=user@example.com&reviewIds=abc123,def456'
)
const { votes } = await votesResponse.json()
// votes = { "abc123": "helpful", "def456": "unhelpful" }
```

## Future Enhancements

- Add vote analytics dashboard for admin
- Implement vote-based review sorting
- Add "most helpful" review highlighting
- Track vote changes over time
- Add vote notifications for review authors

## Testing

To test the functionality:

1. Submit a review for a product
2. Vote "helpful" on the review
3. Check that helpfulCount increases
4. Click "helpful" again to toggle off
5. Check that helpfulCount decreases
6. Vote "unhelpful"
7. Check that unhelpfulCount increases and you can't vote helpful simultaneously
8. Verify votes persist across page refreshes

## Migration Notes

Existing reviews will have:
- `helpfulCount` maintained (existing field)
- `unhelpfulCount` initialized to 0 (new field added automatically)

No database migration script needed - the system handles backward compatibility automatically.
