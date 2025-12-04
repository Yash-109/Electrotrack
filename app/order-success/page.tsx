"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, Truck, Home, CreditCard, Calendar, User, MapPin } from "lucide-react"
import { userAuth } from "@/lib/user-auth"
import { CartService } from "@/lib/cart-service"

function OrderSuccessContent() {
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const initializeOrderSuccess = async () => {
      try {
        // Check for URL parameters (from enhanced payment system)
        const orderId = searchParams.get('orderId')
        const paymentId = searchParams.get('paymentId')
        const paymentMethod = searchParams.get('paymentMethod')

        if (orderId) {
          // Fetch order details from backend first
          try {
            const response = await fetch(`/api/orders/${orderId}`)
            if (response.ok) {
              const result = await response.json()
              if (result.success) {
                const orderDataToSet = {
                  orderId,
                  paymentId: paymentId || 'COD_' + orderId,
                  paymentMethod: paymentMethod || result.order.paymentMethod,
                  ...result.order
                }
                setOrderData(orderDataToSet)

                // Store in localStorage for future refreshes
                localStorage.setItem("radhika_last_order", JSON.stringify(orderDataToSet))

                // Clear cart data only after successful API fetch
                const user = userAuth.getCurrentUser()
                if (user) {
                  try {
                    await CartService.clearCart(user.email)
                    // Cart cleared successfully after order
                  } catch (error) {
                    console.error('Failed to clear cart after order:', error)
                  }
                }
                localStorage.removeItem("radhika_checkout_cart")
                localStorage.removeItem("radhika_current_order")
                return
              }
            }
          } catch (error) {
            console.error('Failed to fetch order from API:', error)
          }

          // If API fails, try localStorage
          const storedOrderData = localStorage.getItem("radhika_current_order")
          const lastOrderData = localStorage.getItem("radhika_last_order")

          if (storedOrderData) {
            const parsedData = JSON.parse(storedOrderData)
            setOrderData({
              orderId,
              paymentId: paymentId || parsedData.paymentId || 'COD_' + orderId,
              paymentMethod: paymentMethod || parsedData.paymentMethod,
              ...parsedData
            })
          } else if (lastOrderData) {
            // Use last order data if current order matches
            const parsedData = JSON.parse(lastOrderData)
            if (parsedData.orderId === orderId) {
              setOrderData(parsedData)
            }
          }
        } else {
          // Fallback to localStorage for older orders or when no orderId in URL
          const storedOrderData = localStorage.getItem("radhika_current_order")
          const lastOrderData = localStorage.getItem("radhika_last_order")

          if (storedOrderData) {
            setOrderData(JSON.parse(storedOrderData))
          } else if (lastOrderData) {
            setOrderData(JSON.parse(lastOrderData))
          }
        }

        // Only clear checkout cart, keep current order for refreshes
        // localStorage.removeItem("radhika_checkout_cart") // Only clear this after API success
        // localStorage.removeItem("radhika_current_order") // Keep this for refreshes

      } catch (error) {
        console.error('Error loading order details:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeOrderSuccess()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-8">We couldn&apos;t find your order details. Please check your email for the order confirmation.</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
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
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="bg-green-100 text-green-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {orderData.paymentMethod === 'cod' ? 'Order Placed Successfully!' : 'Payment Successful!'}
            </h1>
            <p className="text-gray-600">
              {orderData.paymentMethod === 'cod'
                ? 'Thank you for your order. You can pay when your order is delivered to your doorstep.'
                : 'Thank you for your purchase. Your order has been confirmed and payment processed.'
              }
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => navigator.clipboard.writeText(orderData.orderId)}
                    title="Click to copy Order ID">
                    {orderData.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {orderData.createdAt
                      ? new Date(orderData.createdAt).toLocaleDateString()
                      : new Date(orderData.orderDate || Date.now()).toLocaleDateString()
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <p className="font-semibold capitalize">
                      {orderData.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : orderData.paymentMethod === "card"
                          ? "Credit/Debit Card"
                          : orderData.paymentMethod === "upi"
                            ? "UPI"
                            : orderData.paymentMethod === "netbanking"
                              ? "Net Banking"
                              : orderData.paymentMethod === "wallet"
                                ? "Digital Wallet"
                                : "Online Payment"
                      }
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <Badge
                    variant={orderData.paymentStatus === 'completed' ? 'default' : 'secondary'}
                    className={
                      orderData.paymentStatus === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : orderData.paymentMethod === 'cod'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ''
                    }
                  >
                    {orderData.paymentStatus === 'completed'
                      ? 'Paid'
                      : orderData.paymentMethod === 'cod'
                        ? 'Pay on Delivery'
                        : 'Processing'
                    }
                  </Badge>
                </div>
                {orderData.paymentId && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Payment ID / Tracking Reference</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded hover:bg-gray-200 cursor-pointer"
                      onClick={() => navigator.clipboard.writeText(orderData.paymentId)}
                      title="Click to copy Payment ID">
                      {orderData.paymentId}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  // Get items from the correct location
                  const items = orderData.items || orderData.cartData?.items || []

                  return items && items.length > 0 ? (
                    items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-500">₹{item.price.toLocaleString()} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items found in this order</p>
                    </div>
                  )
                })()}

                <div className="pt-4 space-y-2 border-t">
                  {(() => {
                    // Get items from the correct location
                    const items = orderData.items || orderData.cartData?.items || []

                    // Calculate totals from items if not provided
                    const calculatedSubtotal = items?.reduce((sum: number, item: any) =>
                      sum + (item.price * item.quantity), 0) || 0

                    // Use stored totals first, then cartData totals, then calculated
                    const subtotal = orderData.subtotal || orderData.cartData?.subtotal || calculatedSubtotal
                    const tax = orderData.tax || orderData.cartData?.tax || 0
                    const shipping = orderData.shipping || orderData.cartData?.shipping || 0
                    const total = orderData.total || orderData.cartData?.total || (subtotal + tax + shipping)

                    return (
                      <>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal:</span>
                          <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        {tax > 0 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax (GST):</span>
                            <span>₹{tax.toLocaleString()}</span>
                          </div>
                        )}
                        {shipping > 0 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Shipping:</span>
                            <span>₹{shipping.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
                          <span>Total Amount:</span>
                          <span className="text-green-600">₹{total.toLocaleString()}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                What&apos;s Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-sm text-gray-600">You&apos;ll receive an email confirmation shortly</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-sm text-gray-600">Your order will be processed within 1-2 business days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <p className="font-medium">Shipping</p>
                    <p className="text-sm text-gray-600">Estimated delivery in 5-7 business days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/profile">
                <User className="h-4 w-4 mr-2" />
                View Orders
              </Link>
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Need Help?</p>
            <p className="text-sm text-blue-700">
              Contact our support team at{" "}
              <Link href="/contact" className="underline font-medium">
                support@radhikaelectronics.com
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
