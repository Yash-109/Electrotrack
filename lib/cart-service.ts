// Cart persistence utilities
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  category?: string
}

export interface Cart {
  _id?: string
  userEmail: string
  items: CartItem[]
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

export class CartService {
  // In-memory fallback storage for development
  private static fallbackStorage: Map<string, CartItem[]> = new Map()

  static calculateTotal(items: CartItem[]): number {
    if (!Array.isArray(items) || items.length === 0) {
      return 0
    }

    return items.reduce((total, item) => {
      // Safety check for item properties
      const price = typeof item?.price === 'number' ? item.price : 0
      const quantity = typeof item?.quantity === 'number' ? item.quantity : 0
      return total + (price * quantity)
    }, 0)
  }

  static async saveCart(userEmail: string, items: CartItem[]): Promise<boolean> {
    // Validate inputs
    if (!userEmail || !items) {
      // eslint-disable-next-line no-console
      console.error('Invalid saveCart parameters:', { userEmail, items })
      return false
    }

    const safeItems = Array.isArray(items) ? items : []
    const totalAmount = this.calculateTotal(safeItems)

    try {
      const response = await fetch('/api/cart/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          items: safeItems,
          totalAmount
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        // eslint-disable-next-line no-console
        console.error('Cart save failed:', response.status, errorData)

        // Fallback to in-memory storage for development
        // eslint-disable-next-line no-console
        console.warn('Using fallback in-memory cart storage')
        this.fallbackStorage.set(userEmail, safeItems)
        return true
      }

      const result = await response.json()
      // eslint-disable-next-line no-console
      console.log('Cart saved successfully:', result)
      return true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving cart:', error)

      // Check if it's a network error or server error
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch')
      const errorType = isNetworkError ? 'Network Error' : 'Server Error'

      // eslint-disable-next-line no-console
      console.warn(`Cart save failed with ${errorType}, using fallback storage`)

      // Fallback to in-memory storage for development
      this.fallbackStorage.set(userEmail, safeItems)
      return true
    }
  }

  static async getCart(userEmail: string): Promise<CartItem[]> {
    if (!userEmail) {
      // eslint-disable-next-line no-console
      console.error('Invalid getCart parameter: userEmail is required')
      return []
    }

    try {
      const response = await fetch(`/api/cart/get?userEmail=${encodeURIComponent(userEmail)}`)

      if (response.ok) {
        const data = await response.json()
        return data.items || []
      }

      // Fallback to in-memory storage
      const fallbackItems = this.fallbackStorage.get(userEmail)
      if (fallbackItems) {
        // eslint-disable-next-line no-console
        console.warn('Using fallback cart data for user:', userEmail)
        return fallbackItems
      }

      return []
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error retrieving cart:', error)

      // Fallback to in-memory storage
      const fallbackItems = this.fallbackStorage.get(userEmail)
      if (fallbackItems) {
        // eslint-disable-next-line no-console
        console.warn('Using fallback cart data due to error for user:', userEmail)
        return fallbackItems
      }

      return []
    }
  }

  static async clearCart(userEmail: string): Promise<boolean> {
    if (!userEmail) {
      // eslint-disable-next-line no-console
      console.error('Invalid clearCart parameter: userEmail is required')
      return false
    }

    try {
      const response = await fetch('/api/cart/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      })

      if (response.ok) {
        // Also clear fallback storage
        this.fallbackStorage.delete(userEmail)
        return true
      }

      // If API fails, still clear fallback storage
      this.fallbackStorage.delete(userEmail)
      return true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing cart:', error)

      // Clear fallback storage even if API fails
      this.fallbackStorage.delete(userEmail)
      return true
    }
  }
}
