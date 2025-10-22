"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Minus, Plus, Trash2, ShoppingBag, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { userAuth } from "@/lib/user-auth"
import { CartService, type CartItem as ServiceCartItem } from "@/lib/cart-service"

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
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set())
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const initializeCart = async () => {
      const loggedIn = userAuth.isLoggedIn()
      const user = userAuth.getCurrentUser()
      setIsLoggedIn(loggedIn)
      setCurrentUser(user)

      if (loggedIn && user) {
        // Load cart from database using new cart service
        try {
          const dbItems = await CartService.getCart(user.email)
          const uiItems = dbItems.map((item, index) => ({
            id: parseInt(item.id),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || '/placeholder.jpg',
            category: item.category || 'Electronics',
            productId: item.id
          }))
          setCartItems(uiItems)
        } catch (error) {
          console.error('Failed to load cart:', error)
        }
      } else {
        // Not logged in - show empty cart
        setCartItems([])
      }

      setIsLoading(false)
    }

    initializeCart()
  }, [])

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return

    if (!isLoggedIn || !currentUser) {
      toast({
        title: "Login required",
        description: "Please login to update cart.",
        variant: "destructive",
      })
      return
    }

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

      try {
        await CartService.saveCart(currentUser.email, serviceItems)
        // Dispatch cart updated event for header to update count
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } catch (error) {
        console.error('Failed to update cart:', error)
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
    } catch (error) {
      console.error('Cart update error:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const removeItem = async (id: number) => {
    if (!isLoggedIn || !currentUser) {
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

      await CartService.saveCart(currentUser.email, serviceItems)
      // Dispatch cart updated event for header to update count
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })
    } catch (error) {
      console.error('Failed to remove item:', error)
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.18 // 18% GST
  const shipping = subtotal > 50000 ? 0 : 500 // Free shipping above ₹50,000
  const total = subtotal + tax + shipping

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Please login to proceed with checkout.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Store cart data for checkout
    localStorage.setItem(
      "radhika_checkout_cart",
      JSON.stringify({
        items: cartItems,
        subtotal,
        tax,
        shipping,
        total,
      }),
    )

    router.push("/shipping")
  }

  if (isLoading) {
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
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some electronics to get started!</p>
            <Link href="/dashboard">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        {/* Login Alert */}
        {!isLoggedIn && (
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
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                {isLoggedIn && currentUser && (
                  <p className="text-sm text-gray-600">
                    Logged in as: {currentUser.name} ({currentUser.email})
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
                      <p className="text-blue-600 font-bold text-lg">₹{item.price.toLocaleString()}</p>
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
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                        min="1"
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
                      <p className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={removingItems.has(item.id) || updatingItems.has(item.id)}
                      >
                        {removingItems.has(item.id) ? (
                          <LoadingSpinner size="sm" variant="inline" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
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
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>

                {shipping === 0 && <p className="text-sm text-green-600">🎉 You got free shipping!</p>}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <div className="space-y-3 pt-4">
                  <Button className="w-full" size="lg" onClick={handleCheckout} disabled={!isLoggedIn}>
                    {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
                  </Button>

                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                {!isLoggedIn && (
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
