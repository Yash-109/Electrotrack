// Cart persistence utilities
import { log } from './logger'

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

    try {
      return items.reduce((total, item) => {
        // Validate item data before calculation
        if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
          log.warn('Invalid cart item data detected', { item }, 'CartService')
          return total
        }

        // Ensure non-negative values and skip zero quantities
        const validPrice = Math.max(0, item.price)
        const validQuantity = Math.max(0, Math.floor(item.quantity))

        // Check for unreasonably large values to prevent overflow
        if (validPrice > 1e10 || validQuantity > 1e6) {
          log.warn('Cart item has suspicious values', { price: validPrice, quantity: validQuantity }, 'CartService')
          return total
        }

        if (validQuantity === 0 || validPrice === 0) return total
        return total + (validPrice * validQuantity)
      }, 0)
    } catch (error) {
      log.error('Error calculating cart total', error, 'CartService')
      return 0
    }
  }

  static async saveCart(userEmail: string, items: CartItem[]): Promise<boolean> {
    // Validate inputs
    if (!userEmail || !items) {
      log.error('Invalid saveCart parameters', { userEmail: !!userEmail, items: !!items }, 'CartService')
      return false
    }

    const safeItems = Array.isArray(items) ? items : []
    const totalAmount = this.calculateTotal(safeItems)

    // If offline, persist to fallback immediately without network attempt
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.fallbackStorage.set(userEmail, safeItems)
        log.warn('Offline: saved cart to fallback storage', { userEmail }, 'CartService')
        return true
      }
    } catch (err) {
      // ignore navigator access errors in SSR contexts
    }

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
        log.error('Cart save failed', { status: response.status, error: errorData }, 'CartService')

        // Fallback to in-memory storage for development
        log.warn('Using fallback in-memory cart storage', { userEmail }, 'CartService')
        this.fallbackStorage.set(userEmail, safeItems)
        return true
      }

      const result = await response.json()
      log.debug('Cart saved successfully', { userEmail, itemCount: safeItems.length }, 'CartService')
      return true
    } catch (error) {
      log.error('Error saving cart', error, 'CartService')

      // Check if it's a network error or server error
      const isNetworkError = error instanceof TypeError && (error as Error).message.includes('fetch')
      const errorType = isNetworkError ? 'Network Error' : 'Server Error'

      log.warn(`Cart save failed with ${errorType}, using fallback storage`, { userEmail }, 'CartService')

      // Fallback to in-memory storage for development
      this.fallbackStorage.set(userEmail, safeItems)
      return true
    }
  }

  static async getCart(userEmail: string): Promise<CartItem[]> {
    if (!userEmail) {
      log.error('Invalid getCart parameter: userEmail is required', {}, 'CartService')
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
      log.error('Error retrieving cart', error, 'CartService')

      // Fallback to in-memory storage
      const fallbackItems = this.fallbackStorage.get(userEmail)
      if (fallbackItems) {
        log.warn('Using fallback cart data due to error for user', { userEmail }, 'CartService')
        return fallbackItems
      }

      return []
    }
  }

  static async clearCart(userEmail: string): Promise<boolean> {
    if (!userEmail) {
      log.error('Invalid clearCart parameter: userEmail is required', {}, 'CartService')
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
      log.error('Error clearing cart', error, 'CartService')

      // Clear fallback storage even if API fails
      this.fallbackStorage.delete(userEmail)
      return true
    }
  }
}
