"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  Shield,
  AlertCircle,
  QrCode,
  Banknote
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { userAuth } from "@/lib/user-auth"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  category: string
}

interface CheckoutData {
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("cards")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          setRazorpayLoaded(true)
          resolve(true)
        }
        script.onerror = () => {
          console.error('Failed to load Razorpay script')
          resolve(false)
        }
        document.body.appendChild(script)
      })
    }

    // Check if Razorpay is already loaded
    if (typeof window !== 'undefined') {
      if (window.Razorpay) {
        setRazorpayLoaded(true)
      } else {
        loadRazorpayScript()
      }
    }

    // Check login status
    const user = userAuth.getCurrentUser()
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a payment.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setCurrentUser(user)
    setIsLoggedIn(true)

    // Load checkout data
    const savedCheckoutData = localStorage.getItem("radhika_checkout_cart")
    if (!savedCheckoutData) {
      toast({
        title: "No items found",
        description: "Please add items to your cart first.",
        variant: "destructive",
      })
      router.push("/cart")
      return
    }

    try {
      const checkoutData = JSON.parse(savedCheckoutData)
      setCheckoutData(checkoutData)
    } catch (error) {
      console.error("Error parsing checkout data:", error)
      toast({
        title: "Error loading checkout data",
        description: "Please try again from your cart.",
        variant: "destructive",
      })
      router.push("/cart")
    }
  }, [router, toast])

  const processRazorpayPayment = async () => {
    if (!checkoutData || !currentUser) return

    // Check if Razorpay script is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      toast({
        title: "Payment system loading",
        description: "Please wait for the payment system to load and try again.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Create order on our backend with enhanced options
      const response = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: checkoutData.total,
          currency: 'INR',
          userId: currentUser.email,
          preferredMethod: paymentMethod,
          customerInfo: {
            name: currentUser.name || currentUser.email.split('@')[0],
            email: currentUser.email,
            contact: currentUser.phone || ''
          },
          orderDetails: {
            items: checkoutData.items,
            subtotal: checkoutData.subtotal,
            tax: checkoutData.tax,
            shipping: checkoutData.shipping,
            total: checkoutData.total
          }
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment order')
      }

      // Enhanced Razorpay options with multiple payment methods
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Radhika Electronics',
        description: 'Purchase from Radhika Electronics',
        order_id: data.orderId,
        prefill: {
          name: currentUser.name || currentUser.email.split('@')[0],
          email: currentUser.email,
          contact: currentUser.phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        method: {
          card: paymentMethod === 'cards',
          netbanking: paymentMethod === 'netbanking',
          upi: paymentMethod === 'upi',
          wallet: paymentMethod === 'wallet',
          emi: false,
          paylater: false
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payment/razorpay', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: currentUser.email,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              // Clear checkout data
              localStorage.removeItem("radhika_checkout_cart")

              toast({
                title: "Payment successful!",
                description: `Order ${verifyData.order.orderId} has been placed successfully.`,
              })

              // Redirect to success page with order details
              router.push(`/order-success?orderId=${verifyData.order.orderId}&paymentId=${verifyData.order.paymentId}`)
            } else {
              throw new Error(verifyData.error || 'Payment verification failed')
            }
          } catch (verifyError: any) {
            console.error('Payment verification error:', verifyError)
            toast({
              title: "Payment verification failed",
              description: verifyError.message,
              variant: "destructive",
            })
          }
          setIsProcessing(false)
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
            toast({
              title: "Payment cancelled",
              description: "You cancelled the payment process.",
              variant: "destructive",
            })
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error: any) {
      console.error('Payment error:', error)
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const processCODOrder = async () => {
    if (!checkoutData || !currentUser) return

    setIsProcessing(true)

    try {
      // Get shipping address from localStorage
      const shippingData = localStorage.getItem("radhika_shipping_data")
      if (!shippingData) {
        toast({
          title: "Missing shipping information",
          description: "Please provide shipping address",
          variant: "destructive",
        })
        router.push('/shipping')
        return
      }

      const shippingAddress = JSON.parse(shippingData)

      // Create order data
      const orderData = {
        userEmail: currentUser.email,
        items: checkoutData.items,
        shippingAddress,
        paymentMethod: 'cod',
        total: checkoutData.total,
        subtotal: checkoutData.subtotal,
        tax: checkoutData.tax,
        shipping: checkoutData.shipping,
        paymentStatus: 'pending', // COD is pending until delivery
        status: 'processing'
      }

      // Create order in backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        // Store order data in localStorage for order success page
        localStorage.setItem("radhika_current_order", JSON.stringify({
          orderId: result.orderId,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          ...result.order
        }))

        // Clear checkout data
        localStorage.removeItem("radhika_checkout_cart")

        toast({
          title: "Order placed successfully!",
          description: `Order ${result.orderId} has been placed. You can pay on delivery.`,
        })

        // Redirect to success page
        router.push(`/order-success?orderId=${result.orderId}&paymentMethod=cod`)
      } else {
        throw new Error(result.error || 'Failed to place order')
      }
    } catch (error: any) {
      console.error('COD order error:', error)
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (paymentMethod === 'cod') {
      await processCODOrder()
    } else {
      await processRazorpayPayment()
    }
  }

  if (!checkoutData || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Complete Payment</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Choose Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>

                    {/* Credit/Debit Cards */}
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="cards" id="cards" />
                      <Label htmlFor="cards" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                            <div>
                              <p className="font-semibold">Credit/Debit Cards</p>
                              <p className="text-sm text-gray-600">Visa, Mastercard, RuPay, Amex</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                            <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* UPI */}
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-purple-300 transition-colors">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <QrCode className="h-6 w-6 text-purple-600" />
                            <div>
                              <p className="font-semibold">UPI</p>
                              <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm, BHIM</p>
                            </div>
                          </div>
                          <div className="text-green-600 font-semibold text-sm">INSTANT</div>
                        </div>
                      </Label>
                    </div>

                    {/* Net Banking */}
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-green-300 transition-colors">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Label htmlFor="netbanking" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-6 w-6 text-green-600" />
                            <div>
                              <p className="font-semibold">Net Banking</p>
                              <p className="text-sm text-gray-600">All major banks supported</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded">SBI</div>
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded">HDFC</div>
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded">ICICI</div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Wallets */}
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-orange-300 transition-colors">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Wallet className="h-6 w-6 text-orange-600" />
                            <div>
                              <p className="font-semibold">Digital Wallets</p>
                              <p className="text-sm text-gray-600">Paytm, PhonePe, Amazon Pay</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Smartphone className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Cash on Delivery */}
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-yellow-300 transition-colors">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Banknote className="h-6 w-6 text-yellow-600" />
                            <div>
                              <p className="font-semibold">Cash on Delivery</p>
                              <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                            </div>
                          </div>
                          <div className="text-yellow-600 font-semibold text-sm">NO ADVANCE</div>
                        </div>
                      </Label>
                    </div>

                  </RadioGroup>

                  {/* Security Info */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-800 font-semibold">100% Secure Payment</p>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your payment information is encrypted using 256-bit SSL technology.
                      All transactions are processed securely through Razorpay.
                    </p>
                  </div>

                  {/* Payment Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-5 w-5" />
                        <span>Pay ₹{checkoutData.total.toLocaleString()}</span>
                      </div>
                    )}
                  </Button>
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
                  {/* Items */}
                  <div className="space-y-3">
                    {checkoutData.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{checkoutData.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{checkoutData.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>₹{checkoutData.shipping.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">₹{checkoutData.total.toLocaleString()}</span>
                  </div>

                  {/* Delivery Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Estimated Delivery</p>
                    <p className="text-sm text-blue-700">5-7 business days</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}
