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

  // Cache for calculated totals to improve performance
  private static totalCache: Map<string, { total: number; timestamp: number }> = new Map()
  private static CACHE_DURATION = 5000 // 5 seconds

  // Cache for item counts
  private static countCache: Map<string, { count: number; timestamp: number }> = new Map()

  /**
   * Validate a single cart item
   * @returns true if item is valid, false otherwise
   */
  static isValidCartItem(item: CartItem): boolean {
    if (!item || typeof item !== 'object') return false
    if (typeof item.id !== 'string' || !item.id.trim()) return false
    if (typeof item.name !== 'string' || !item.name.trim()) return false
    if (typeof item.price !== 'number' || item.price < 0 || !isFinite(item.price)) return false
    if (typeof item.quantity !== 'number' || item.quantity <= 0 || !isFinite(item.quantity)) return false
    return true
  }

  /**
   * Filter and return only valid cart items
   */
  static sanitizeCartItems(items: CartItem[]): CartItem[] {
    if (!Array.isArray(items)) return []
    return items.filter(item => {
      const isValid = this.isValidCartItem(item)
      if (!isValid) {
        log.warn('Invalid cart item removed', { item }, 'CartService')
      }
      return isValid
    })
  }

  /**
   * Merge duplicate items in cart by summing quantities
   */
  static mergeDuplicateItems(items: CartItem[]): CartItem[] {
    if (!Array.isArray(items) || items.length === 0) return []

    const itemMap = new Map<string, CartItem>()

    items.forEach(item => {
      if (itemMap.has(item.id)) {
        const existing = itemMap.get(item.id)!
        existing.quantity += item.quantity
      } else {
        itemMap.set(item.id, { ...item })
      }
    })

    return Array.from(itemMap.values())
  }

  /**
   * Get cart item count with caching
   */
  static getItemCount(items: CartItem[]): number {
    if (!Array.isArray(items)) return 0

    // Generate cache key
    const cacheKey = JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity })))
    const cached = this.countCache.get(cacheKey)

    // Return cached value if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.count
    }

    const count = items.reduce((sum, item) => {
      // Validate quantity before adding
      const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 0
      return sum + quantity
    }, 0)

    // Cache the result
    this.countCache.set(cacheKey, { count, timestamp: Date.now() })

    // Clean up old cache entries periodically
    this.cleanupCache(this.countCache)

    return count
  }

  /**
   * Clean up expired cache entries
   */
  private static cleanupCache<T>(cache: Map<string, { timestamp: number } & T>): void {
    if (cache.size > 100) {
      const now = Date.now()
      const keysToDelete: string[] = []

      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > this.CACHE_DURATION) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach(key => cache.delete(key))
    }
  }

  static calculateTotal(items: CartItem[]): number {
    if (!Array.isArray(items) || items.length === 0) {
      return 0
    }

    // Generate cache key from items
    const cacheKey = JSON.stringify(items.map(i => ({ id: i.id, price: i.price, quantity: i.quantity })))
    const cached = this.totalCache.get(cacheKey)

    // Return cached value if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.total
    }

    try {
      const total = items.reduce((sum, item) => {
        // Validate item data before calculation
        if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
          log.warn('Invalid cart item data detected', { item }, 'CartService')
          return sum
        }

        // Ensure non-negative values and skip zero quantities
        const validPrice = Math.max(0, item.price)
        const validQuantity = Math.max(0, Math.floor(item.quantity))

        // Check for unreasonably large values to prevent overflow
        if (validPrice > 1e10 || validQuantity > 1e6) {
          log.warn('Cart item has suspicious values', { price: validPrice, quantity: validQuantity }, 'CartService')
          return sum
        }

        if (validQuantity === 0 || validPrice === 0) return sum
        return sum + (validPrice * validQuantity)
      }, 0)

      // Cache the result
      this.totalCache.set(cacheKey, { total, timestamp: Date.now() })

      // Clean up old cache entries periodically
      this.cleanupCache(this.totalCache)

      return total
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

    // Sanitize and merge duplicate items
    const sanitizedItems = this.sanitizeCartItems(items)
    const safeItems = this.mergeDuplicateItems(sanitizedItems)
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
        const items = data.items || []
        // Sanitize items from server to ensure data integrity
        const validItems = this.sanitizeCartItems(items)
        if (validItems.length !== items.length) {
          log.warn('Some invalid items removed from cart', {
            original: items.length,
            valid: validItems.length
          }, 'CartService')
        }
        return validItems
      }

      // Fallback to in-memory storage
      const fallbackItems = this.fallbackStorage.get(userEmail)
      if (fallbackItems) {
        log.warn('Using fallback cart data for user', { userEmail }, 'CartService')
        return this.sanitizeCartItems(fallbackItems)
      }

      return []
    } catch (error) {
      log.error('Error retrieving cart', error, 'CartService')

      // Fallback to in-memory storage
      const fallbackItems = this.fallbackStorage.get(userEmail)
      if (fallbackItems) {
        log.warn('Using fallback cart data due to error for user', { userEmail }, 'CartService')
        return this.sanitizeCartItems(fallbackItems)
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
