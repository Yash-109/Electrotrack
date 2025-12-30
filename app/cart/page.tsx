"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { log } from "@/lib/logger"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Minus, Plus, Trash2, ShoppingBag, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CartService, type CartItem as ServiceCartItem } from "@/lib/cart-service"

// Utility function for debouncing rapid updates
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  category: string
  productId?: string
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set())
  const [retryAttempts, setRetryAttempts] = useState<Map<number, number>>(new Map())
  const [isRetrying, setIsRetrying] = useState(false)
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const router = useRouter()
  const { toast } = useToast()

  // Debounced update function to prevent rapid API calls
  const debouncedUpdate = useCallback(
    debounce(async (userEmail: string, items: ServiceCartItem[]) => {
      try {
        await CartService.saveCart(userEmail, items)
        window.dispatchEvent(new CustomEvent('cartUpdated'))
        // Reset retry attempts on successful update
        setRetryAttempts(new Map())
      } catch (error) {
        log.error('Cart update failed during debounce', error, 'CartPage')
        throw error
      }
    }, 1000),
    []
  )

  // Memoized cart totals for performance
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.18 // 18% GST
    const shipping = subtotal > 5000 ? 0 : 50 // Free shipping above ₹5000
    const total = subtotal + tax + shipping

    return { subtotal, tax, shipping, total }
  }, [cartItems])

  // Retry mechanism for failed cart operations
  const retryCartOperation = useCallback(async (
    operation: () => Promise<void>,
    itemId: number,
    maxRetries: number = 3
  ) => {
    const currentAttempts = retryAttempts.get(itemId) || 0

    if (currentAttempts >= maxRetries) {
      toast({
        title: "Operation failed",
        description: "Unable to complete operation after multiple attempts. Please refresh and try again.",
        variant: "destructive"
      })
      return false
    }

    try {
      await operation()
      setRetryAttempts(prev => {
        const newMap = new Map(prev)
        newMap.delete(itemId)
        return newMap
      })
      return true
    } catch (error) {
      setRetryAttempts(prev => {
        const newMap = new Map(prev)
        newMap.set(itemId, currentAttempts + 1)
        return newMap
      })

      if (currentAttempts < maxRetries - 1) {
        setIsRetrying(true)
        setTimeout(() => {
          setIsRetrying(false)
          retryCartOperation(operation, itemId, maxRetries)
        }, 1000 * Math.pow(2, currentAttempts)) // Exponential backoff
      }
      return false
    }
  }, [retryAttempts, toast])

  useEffect(() => {
    const initializeCart = async () => {
      if (status === "loading") {
        return // Still loading authentication state
      }

      if (session?.user?.email) {
        // Load cart from database using new cart service
        try {
          const dbItems = await CartService.getCart(session.user.email)

          const uiItems = dbItems.map((item) => {
            return {
              id: parseInt(item.id),
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || '/placeholder.jpg',
              category: item.category || 'Electronics',
              productId: item.id
            };
          });

          setCartItems(uiItems)
        } catch (error) {
          log.error('Failed to load cart from service', error, 'CartPage')
        }
      } else {
        // Not logged in - show empty cart
        setCartItems([])
      }

      setIsLoading(false)
    }

    initializeCart()
  }, [session, status])

  const updateQuantity = async (id: number, newQuantity: number) => {
    // Validate quantity range (1-99)
    if (newQuantity < 1 || newQuantity > 99) {
      if (newQuantity > 99) {
        toast({
          title: "Maximum quantity exceeded",
          description: "You can add a maximum of 99 items per product.",
          variant: "destructive",
        })
      }
      return
    }

    if (!session?.user?.email) {
      toast({
        title: "Login required",
        description: "Please login to update cart.",
        variant: "destructive",
      })
      return
    }

    // Prevent multiple simultaneous updates
    if (updatingItems.has(id)) return

    // Add loading state for this specific item
    setUpdatingItems(prev => new Set(prev).add(id))

    try {
      // Update locally first for immediate feedback
      const updatedItems = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
      setCartItems(updatedItems)

      // Convert to service format and save to database
      const serviceItems: ServiceCartItem[] = updatedItems.map(item => ({
        id: item.productId || item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category
      }))

      await CartService.saveCart(session.user.email, serviceItems)
      // Dispatch cart updated event for header to update count
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    } catch (error) {
      log.error('Failed to update cart in service', error, 'CartPage')
      // Revert local changes on error
      setCartItems(cartItems)
      toast({
        title: "Update failed",
        description: "Failed to update cart. Please try again.",
        variant: "destructive"
      })
    } finally {
      // Remove loading state
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const removeItem = async (id: number) => {
    if (!session?.user?.email) {
      toast({
        title: "Login required",
        description: "Please login to update cart.",
        variant: "destructive",
      })
      return
    }

    // Add loading state for this specific item
    setRemovingItems(prev => new Set(prev).add(id))

    try {
      // Update locally first for immediate feedback
      const updatedItems = cartItems.filter((item) => item.id !== id)
      setCartItems(updatedItems)

      // Convert to service format and save to database
      const serviceItems: ServiceCartItem[] = updatedItems.map(item => ({
        id: item.productId || item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category
      }))

      await CartService.saveCart(session.user.email, serviceItems)
      // Dispatch cart updated event for header to update count
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })
    } catch (error) {
      log.error('Failed to remove item from cart', error, 'CartPage')
      // Revert local changes on error
      setCartItems(cartItems)
      toast({
        title: "Remove failed",
        description: "Failed to remove item. Please try again.",
        variant: "destructive"
      })
    } finally {
      // Remove loading state
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const saveForLater = async (id: number) => {
    if (!session?.user?.email) {
      toast({
        title: "Login required",
        description: "Please login to save items.",
        variant: "destructive",
      })
      return
    }

    const itemToSave = cartItems.find((item) => item.id === id)
    if (!itemToSave) return

    setRemovingItems(prev => new Set(prev).add(id))

    try {
      // Move item from cart to saved for later
      const updatedCartItems = cartItems.filter((item) => item.id !== id)
      setSavedForLater(prev => [...prev, itemToSave])
      setCartItems(updatedCartItems)

      // Update cart in database
      const serviceItems: ServiceCartItem[] = updatedCartItems.map(item => ({
        id: item.productId || item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category
      }))

      await CartService.saveCart(session.user.email, serviceItems)
      window.dispatchEvent(new CustomEvent('cartUpdated'))

      toast({
        title: "Saved for later",
        description: `${itemToSave.name} has been saved for later.`,
      })
    } catch (error) {
      log.error('Failed to save item for later', error, 'CartPage')
      // Revert changes on error
      setCartItems(cartItems)
      setSavedForLater(prev => prev.filter(item => item.id !== id))
      toast({
        title: "Failed to save",
        description: "Could not save item for later. Please try again.",
        variant: "destructive"
      })
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const moveToCart = async (id: number) => {
    if (!session?.user?.email) {
      toast({
        title: "Login required",
        description: "Please login to update cart.",
        variant: "destructive",
      })
      return
    }

    const itemToMove = savedForLater.find((item) => item.id === id)
    if (!itemToMove) return

    setUpdatingItems(prev => new Set(prev).add(id))

    try {
      // Move item from saved for later back to cart
      const updatedSaved = savedForLater.filter((item) => item.id !== id)
      const updatedCart = [...cartItems, itemToMove]

      setSavedForLater(updatedSaved)
      setCartItems(updatedCart)

      // Update cart in database
      const serviceItems: ServiceCartItem[] = updatedCart.map(item => ({
        id: item.productId || item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category
      }))

      await CartService.saveCart(session.user.email, serviceItems)
      window.dispatchEvent(new CustomEvent('cartUpdated'))

      toast({
        title: "Moved to cart",
        description: `${itemToMove.name} has been moved to your cart.`,
      })
    } catch (error) {
      log.error('Failed to move item to cart', error, 'CartPage')
      // Revert changes on error
      setSavedForLater(savedForLater)
      setCartItems(cartItems)
      toast({
        title: "Failed to move",
        description: "Could not move item to cart. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const removeSavedItem = (id: number) => {
    const itemToRemove = savedForLater.find((item) => item.id === id)
    setSavedForLater(prev => prev.filter((item) => item.id !== id))

    toast({
      title: "Item removed",
      description: `${itemToRemove?.name} has been removed from saved items.`,
    })
  }

  const clearCart = async () => {
    if (!session?.user?.email) return

    try {
      setCartItems([])
      await CartService.saveCart(session.user.email, [])
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast({
        title: "Cart cleared",
        description: "All items removed from cart.",
      })
    } catch (error) {
      log.error('Failed to clear cart', error, 'CartPage')
      toast({
        title: "Failed to clear cart",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const getEstimatedDelivery = () => {
    const today = new Date()
    const deliveryDate = new Date(today)
    deliveryDate.setDate(today.getDate() + 5)
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleCheckout = () => {
    if (!session?.user?.email) {
      toast({
        title: "Login required",
        description: "Please login to proceed with checkout.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Store cart data for checkout using memoized totals
    localStorage.setItem(
      "radhika_checkout_cart",
      JSON.stringify({
        items: cartItems,
        ...cartTotals,
      }),
    )

    router.push("/shipping")
  }

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading your cart..." />
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-16">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-16 w-16 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
                <p className="text-gray-600 mb-8 text-lg">Discover amazing electronics and start shopping today!</p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Browse Products
                    </Button>
                  </Link>
                  {session?.user && (
                    <Link href="/order-tracking">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        View My Orders
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Suggestions */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Why shop with us?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Secure Checkout</p>
                        <p className="text-sm text-gray-600">100% safe & secure payments</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Fast Delivery</p>
                        <p className="text-sm text-gray-600">Quick delivery to your door</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Best Prices</p>
                        <p className="text-sm text-gray-600">Competitive pricing guaranteed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saved for Later Section */}
                {savedForLater.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved for Later ({savedForLater.length})</h3>
                    <p className="text-sm text-gray-600 mb-4">You have items waiting in your saved list</p>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                      View Saved Items
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        {/* Login Alert */}
        {!session?.user && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You need to login to proceed with checkout.
              <Link href="/login" className="ml-2 text-orange-600 hover:underline font-medium">
                Login here
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                  {cartItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear Cart
                    </Button>
                  )}
                </div>
                {session?.user && (
                  <p className="text-sm text-gray-600">
                    Logged in as: {session.user.name} ({session.user.email})
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600 capitalize">{item.category}</p>
                      <p className="text-blue-600 font-bold text-lg">₹{item.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingItems.has(item.id) || removingItems.has(item.id)}
                      >
                        {updatingItems.has(item.id) ? (
                          <LoadingSpinner size="sm" variant="inline" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </Button>

                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 1
                          updateQuantity(item.id, Math.min(Math.max(value, 1), 99))
                        }}
                        className="w-16 text-center"
                        min="1"
                        max="99"
                        disabled={updatingItems.has(item.id) || removingItems.has(item.id)}
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingItems.has(item.id) || removingItems.has(item.id)}
                      >
                        {updatingItems.has(item.id) ? (
                          <LoadingSpinner size="sm" variant="inline" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveForLater(item.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          disabled={removingItems.has(item.id) || updatingItems.has(item.id)}
                          title="Save for later"
                        >
                          {removingItems.has(item.id) ? (
                            <LoadingSpinner size="sm" variant="inline" />
                          ) : (
                            <span className="text-xs">Save for Later</span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={removingItems.has(item.id) || updatingItems.has(item.id)}
                          title="Remove from cart"
                        >
                          {removingItems.has(item.id) ? (
                            <LoadingSpinner size="sm" variant="inline" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Saved for Later Section */}
            {savedForLater.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Saved for Later ({savedForLater.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {savedForLater.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                        <p className="text-blue-600 font-bold">₹{item.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => moveToCart(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {updatingItems.has(item.id) ? (
                            <LoadingSpinner size="sm" variant="inline" />
                          ) : (
                            "Move to Cart"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSavedItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotals.subtotal.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{cartTotals.tax.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{cartTotals.shipping === 0 ? "Free" : `₹${cartTotals.shipping}`}</span>
                </div>

                {cartTotals.shipping === 0 && <p className="text-sm text-green-600">🎉 You got free shipping!</p>}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{cartTotals.total.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')}</span>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">📦 Estimated Delivery</p>
                  <p className="text-sm text-blue-700">{getEstimatedDelivery()}</p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button className="w-full" size="lg" onClick={handleCheckout} disabled={!session?.user}>
                    {session?.user ? "Proceed to Checkout" : "Login to Checkout"}
                  </Button>

                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                {!session?.user && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800 text-center">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Please login to proceed with your order
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
