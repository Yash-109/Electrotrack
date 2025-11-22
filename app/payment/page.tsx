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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { useAdminIntegration } from "@/hooks/use-admin-integration"
import { log } from "@/lib/logger"

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
  const [showUPIScanner, setShowUPIScanner] = useState(false)
  const [upiProcessing, setUpiProcessing] = useState(false)
  const [showNetbankingInterface, setShowNetbankingInterface] = useState(false)
  const [showCardInterface, setShowCardInterface] = useState(false)
  const [showWalletInterface, setShowWalletInterface] = useState(false)
  const [netbankingProcessing, setNetbankingProcessing] = useState(false)
  const [cardProcessing, setCardProcessing] = useState(false)
  const [walletProcessing, setWalletProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { addOnlineSale } = useAdminIntegration()

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
          log.error('Failed to load Razorpay script', {}, 'Payment')
          setRazorpayLoaded(false)
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
      log.error('Error parsing checkout data', error, 'Payment')
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
                orderDetails: {
                  items: checkoutData.items,
                  subtotal: checkoutData.subtotal,
                  tax: checkoutData.tax,
                  shipping: checkoutData.shipping,
                  total: checkoutData.total,
                  shippingAddress: JSON.parse(localStorage.getItem("radhika_shipping_data") || '{}')
                }
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              // Create transaction in admin system for successful online payment
              addOnlineSale({
                description: `Order: ${checkoutData.items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}`,
                category: "Mixed Electronics",
                amount: checkoutData.total,
                paymentMethod: "Online",
                customer: currentUser.name || currentUser.email.split('@')[0],
                orderId: verifyData.order.orderId,
                orderDate: new Date().toISOString().split("T")[0]
              })

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
            log.error('Payment verification error', verifyError, 'Payment')
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
      log.error('Payment error', error, 'Payment')
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const processUPIOrder = async () => {
    if (!checkoutData || !currentUser) return

    setUpiProcessing(true)

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
        paymentMethod: 'upi',
        total: checkoutData.total,
        subtotal: checkoutData.subtotal,
        tax: checkoutData.tax,
        shipping: checkoutData.shipping,
        paymentStatus: 'completed', // Assume UPI payment is successful
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
        // Add to admin system for successful UPI payment
        addOnlineSale({
          description: `Order: ${checkoutData.items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}`,
          category: "Mixed Electronics",
          amount: checkoutData.total,
          paymentMethod: "UPI",
          customer: currentUser.name || currentUser.email.split('@')[0],
          orderId: result.orderId,
          orderDate: new Date().toISOString().split("T")[0]
        })

        // Store order data in localStorage for order success page
        const orderDataToStore = {
          orderId: result.orderId,
          paymentMethod: 'upi',
          paymentStatus: 'completed',
          ...result.order
        }
        localStorage.setItem("radhika_current_order", JSON.stringify(orderDataToStore))

        // Also store as last order for refresh protection
        localStorage.setItem("radhika_last_order", JSON.stringify(orderDataToStore))

        // Clear checkout data
        localStorage.removeItem("radhika_checkout_cart")

        toast({
          title: "Payment successful!",
          description: `Order ${result.orderId} has been placed successfully via UPI.`,
        })

        // Redirect to success page with orderId
        router.push(`/order-success?orderId=${result.orderId}&paymentMethod=upi`)
      } else {
        throw new Error(result.error || 'Failed to place order')
      }
    } catch (error: any) {
      log.error('UPI order error', error, 'Payment')
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUpiProcessing(false)
    }
  }

  const processNetbankingOrder = async () => {
    if (!checkoutData || !currentUser) return

    setNetbankingProcessing(true)

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
        paymentMethod: 'netbanking',
        total: checkoutData.total,
        subtotal: checkoutData.subtotal,
        tax: checkoutData.tax,
        shipping: checkoutData.shipping,
        paymentStatus: 'completed',
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
        // Add to admin system for successful Netbanking payment
        addOnlineSale({
          description: `Order: ${checkoutData.items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}`,
          category: "Mixed Electronics",
          amount: checkoutData.total,
          paymentMethod: "Netbanking",
          customer: currentUser.name || currentUser.email.split('@')[0],
          orderId: result.orderId,
          orderDate: new Date().toISOString().split("T")[0]
        })

        // Store order data in localStorage for order success page
        const orderDataToStore = {
          orderId: result.orderId,
          paymentMethod: 'netbanking',
          paymentStatus: 'completed',
          ...result.order
        }
        localStorage.setItem("radhika_current_order", JSON.stringify(orderDataToStore))
        localStorage.setItem("radhika_last_order", JSON.stringify(orderDataToStore))

        // Clear checkout data
        localStorage.removeItem("radhika_checkout_cart")

        toast({
          title: "Payment successful!",
          description: `Order ${result.orderId} has been placed successfully via Netbanking.`,
        })

        // Redirect to success page with orderId
        router.push(`/order-success?orderId=${result.orderId}&paymentMethod=netbanking`)
      } else {
        throw new Error(result.error || 'Failed to place order')
      }
    } catch (error: any) {
      log.error('Netbanking order error', error, 'Payment')
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setNetbankingProcessing(false)
    }
  }

  const processCardOrder = async () => {
    if (!checkoutData || !currentUser) return

    setCardProcessing(true)

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
        paymentMethod: 'card',
        total: checkoutData.total,
        subtotal: checkoutData.subtotal,
        tax: checkoutData.tax,
        shipping: checkoutData.shipping,
        paymentStatus: 'completed',
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
        // Add to admin system for successful Card payment
        addOnlineSale({
          description: `Order: ${checkoutData.items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}`,
          category: "Mixed Electronics",
          amount: checkoutData.total,
          paymentMethod: "Card",
          customer: currentUser.name || currentUser.email.split('@')[0],
          orderId: result.orderId,
          orderDate: new Date().toISOString().split("T")[0]
        })

        // Store order data in localStorage for order success page
        const orderDataToStore = {
          orderId: result.orderId,
          paymentMethod: 'card',
          paymentStatus: 'completed',
          ...result.order
        }
        localStorage.setItem("radhika_current_order", JSON.stringify(orderDataToStore))
        localStorage.setItem("radhika_last_order", JSON.stringify(orderDataToStore))

        // Clear checkout data
        localStorage.removeItem("radhika_checkout_cart")

        toast({
          title: "Payment successful!",
          description: `Order ${result.orderId} has been placed successfully via Card.`,
        })

        // Redirect to success page with orderId
        router.push(`/order-success?orderId=${result.orderId}&paymentMethod=card`)
      } else {
        throw new Error(result.error || 'Failed to place order')
      }
    } catch (error: any) {
      log.error('Card order error', error, 'Payment')
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCardProcessing(false)
    }
  }

  const processWalletOrder = async () => {
    if (!checkoutData || !currentUser) return

    setWalletProcessing(true)

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
        paymentMethod: 'wallet',
        total: checkoutData.total,
        subtotal: checkoutData.subtotal,
        tax: checkoutData.tax,
        shipping: checkoutData.shipping,
        paymentStatus: 'completed',
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
        // Add to admin system for successful Wallet payment
        addOnlineSale({
          description: `Order: ${checkoutData.items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ')}`,
          category: "Mixed Electronics",
          amount: checkoutData.total,
          paymentMethod: "Wallet",
          customer: currentUser.name || currentUser.email.split('@')[0],
          orderId: result.orderId,
          orderDate: new Date().toISOString().split("T")[0]
        })

        // Store order data in localStorage for order success page
        const orderDataToStore = {
          orderId: result.orderId,
          paymentMethod: 'wallet',
          paymentStatus: 'completed',
          ...result.order
        }
        localStorage.setItem("radhika_current_order", JSON.stringify(orderDataToStore))
        localStorage.setItem("radhika_last_order", JSON.stringify(orderDataToStore))

        // Clear checkout data
        localStorage.removeItem("radhika_checkout_cart")

        toast({
          title: "Payment successful!",
          description: `Order ${result.orderId} has been placed successfully via Digital Wallet.`,
        })

        // Redirect to success page with orderId
        router.push(`/order-success?orderId=${result.orderId}&paymentMethod=wallet`)
      } else {
        throw new Error(result.error || 'Failed to place order')
      }
    } catch (error: any) {
      log.error('Wallet order error', error, 'Payment')
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setWalletProcessing(false)
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
        const orderDataToStore = {
          orderId: result.orderId,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          ...result.order
        }
        localStorage.setItem("radhika_current_order", JSON.stringify(orderDataToStore))

        // Also store as last order for refresh protection
        localStorage.setItem("radhika_last_order", JSON.stringify(orderDataToStore))

        // Clear checkout data
        localStorage.removeItem("radhika_checkout_cart")

        toast({
          title: "Order placed successfully!",
          description: `Order ${result.orderId} has been placed. You can pay on delivery.`,
        })

        // Redirect to success page with orderId
        router.push(`/order-success?orderId=${result.orderId}&paymentMethod=cod`)
      } else {
        throw new Error(result.error || 'Failed to place order')
      }
    } catch (error: any) {
      log.error('COD order error', error, 'Payment')
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
    } else if (paymentMethod === 'upi') {
      setShowUPIScanner(true)
    } else if (paymentMethod === 'netbanking') {
      setShowNetbankingInterface(true)
    } else if (paymentMethod === 'cards') {
      setShowCardInterface(true)
    } else if (paymentMethod === 'wallet') {
      setShowWalletInterface(true)
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

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-800 font-semibold">100% Secure Payment</p>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment information is encrypted using 256-bit SSL technology.
                      All transactions are processed securely through Razorpay.
                    </p>
                  </div>

                  {/* Loading Status */}
                  {!razorpayLoaded && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent"></div>
                        <p className="text-sm text-yellow-800 font-medium">Loading payment system...</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing || (!razorpayLoaded && paymentMethod !== 'cod')}
                    className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : !razorpayLoaded && paymentMethod !== 'cod' ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Loading Payment System...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-5 w-5" />
                        <span>{paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${checkoutData.total.toLocaleString()}`}</span>
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

      {/* UPI QR Scanner Modal */}
      <Dialog open={showUPIScanner} onOpenChange={setShowUPIScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">UPI Payment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-6">
            {/* Static QR Code */}
            <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg p-3">
              <div className="w-full h-full bg-white relative" style={{
                background: `
                  repeating-linear-gradient(
                    0deg,
                    black 0px, black 8px,
                    transparent 8px, transparent 16px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    black 0px, black 8px,
                    transparent 8px, transparent 16px
                  )
                `,
                backgroundSize: '16px 16px'
              }}>
                {/* Corner finder patterns */}
                <div className="absolute top-0 left-0 w-14 h-14 bg-black">
                  <div className="absolute top-2 left-2 w-10 h-10 bg-white">
                    <div className="absolute top-2 left-2 w-6 h-6 bg-black"></div>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-14 h-14 bg-black">
                  <div className="absolute top-2 left-2 w-10 h-10 bg-white">
                    <div className="absolute top-2 left-2 w-6 h-6 bg-black"></div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-14 h-14 bg-black">
                  <div className="absolute top-2 left-2 w-10 h-10 bg-white">
                    <div className="absolute top-2 left-2 w-6 h-6 bg-black"></div>
                  </div>
                </div>

                {/* Center alignment pattern */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black">
                  <div className="absolute top-1 left-1 w-8 h-8 bg-white">
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-black">
                      <div className="absolute top-1 left-1 w-3 h-3 bg-white">
                        <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-black"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="w-full bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-800">Amount:</span>
                <span className="text-lg font-bold text-blue-900">₹{checkoutData?.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Merchant:</span>
                <span className="text-sm font-medium text-blue-800">Radhika Electronics</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="w-full text-center space-y-2">
              <p className="text-sm text-gray-600">
                📱 Open any UPI app (GPay, PhonePe, Paytm)
              </p>
              <p className="text-sm text-gray-600">
                📷 Scan the QR code above
              </p>
              <p className="text-sm text-gray-600">
                💰 Complete the payment
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 w-full mt-6">
              <Button
                variant="outline"
                onClick={() => setShowUPIScanner(false)}
                className="flex-1"
                disabled={upiProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={processUPIOrder}
                disabled={upiProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {upiProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Payment Done"
                )}
              </Button>
            </div>

            {/* Note */}
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-yellow-800 text-center">
                ⚡ Demo Mode: Click "Payment Done" after scanning to simulate successful payment
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Netbanking Interface Modal */}
      <Dialog open={showNetbankingInterface} onOpenChange={setShowNetbankingInterface}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Net Banking</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-6">
            {/* Bank Selection Interface */}
            <div className="w-full bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <Building2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Select Your Bank</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white border border-green-200 rounded-lg p-3 text-center hover:bg-green-100 cursor-pointer">
                  <div className="font-semibold text-sm text-blue-800">SBI</div>
                  <div className="text-xs text-gray-600">State Bank of India</div>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3 text-center hover:bg-green-100 cursor-pointer">
                  <div className="font-semibold text-sm text-red-800">HDFC</div>
                  <div className="text-xs text-gray-600">HDFC Bank</div>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3 text-center hover:bg-green-100 cursor-pointer">
                  <div className="font-semibold text-sm text-orange-800">ICICI</div>
                  <div className="text-xs text-gray-600">ICICI Bank</div>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3 text-center hover:bg-green-100 cursor-pointer">
                  <div className="font-semibold text-sm text-purple-800">AXIS</div>
                  <div className="text-xs text-gray-600">Axis Bank</div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="w-full bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-800">Amount:</span>
                <span className="text-lg font-bold text-green-900">₹{checkoutData?.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Merchant:</span>
                <span className="text-sm font-medium text-green-800">Radhika Electronics</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="w-full text-center space-y-2">
              <p className="text-sm text-gray-600">
                🏦 Select your bank from above
              </p>
              <p className="text-sm text-gray-600">
                🔐 You will be redirected to bank login
              </p>
              <p className="text-sm text-gray-600">
                ✅ Complete the payment securely
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 w-full mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNetbankingInterface(false)}
                className="flex-1"
                disabled={netbankingProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={processNetbankingOrder}
                disabled={netbankingProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {netbankingProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Proceed to Bank"
                )}
              </Button>
            </div>

            {/* Note */}
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-yellow-800 text-center">
                🔒 Demo Mode: Click "Proceed to Bank" to simulate successful netbanking payment
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card Payment Interface Modal */}
      <Dialog open={showCardInterface} onOpenChange={setShowCardInterface}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Card Payment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-6">
            {/* Card Interface */}
            <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">Enter Card Details</h3>
              </div>

              <div className="space-y-3">
                <div className="bg-white border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Card Number</div>
                  <div className="text-sm font-mono text-gray-400">**** **** **** 1234</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Expiry</div>
                    <div className="text-sm font-mono text-gray-400">MM/YY</div>
                  </div>
                  <div className="bg-white border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">CVV</div>
                    <div className="text-sm font-mono text-gray-400">***</div>
                  </div>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Cardholder Name</div>
                  <div className="text-sm text-gray-400">{currentUser?.name || 'Card Holder'}</div>
                </div>
              </div>

              {/* Card Type Icons */}
              <div className="flex justify-center space-x-2 mt-3">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                <div className="w-8 h-5 bg-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">RUPAY</div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="w-full bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-800">Amount:</span>
                <span className="text-lg font-bold text-blue-900">₹{checkoutData?.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Merchant:</span>
                <span className="text-sm font-medium text-blue-800">Radhika Electronics</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="w-full text-center space-y-2">
              <p className="text-sm text-gray-600">
                💳 Your card details are secure
              </p>
              <p className="text-sm text-gray-600">
                🔐 256-bit SSL encryption
              </p>
              <p className="text-sm text-gray-600">
                ⚡ Instant payment processing
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 w-full mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCardInterface(false)}
                className="flex-1"
                disabled={cardProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={processCardOrder}
                disabled={cardProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {cardProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </div>

            {/* Note */}
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-yellow-800 text-center">
                🔒 Demo Mode: Click "Pay Now" to simulate successful card payment
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Digital Wallet Interface Modal */}
      <Dialog open={showWalletInterface} onOpenChange={setShowWalletInterface}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Digital Wallet</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-6">
            {/* Wallet Selection Interface */}
            <div className="w-full bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <Wallet className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800">Choose Your Wallet</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white border border-orange-200 rounded-lg p-3 text-center hover:bg-orange-100 cursor-pointer">
                  <div className="font-semibold text-sm text-blue-800">Paytm</div>
                  <div className="text-xs text-gray-600">One97 Communications</div>
                </div>
                <div className="bg-white border border-orange-200 rounded-lg p-3 text-center hover:bg-orange-100 cursor-pointer">
                  <div className="font-semibold text-sm text-purple-800">PhonePe</div>
                  <div className="text-xs text-gray-600">Flipkart Payments</div>
                </div>
                <div className="bg-white border border-orange-200 rounded-lg p-3 text-center hover:bg-orange-100 cursor-pointer">
                  <div className="font-semibold text-sm text-orange-800">Amazon Pay</div>
                  <div className="text-xs text-gray-600">Amazon India</div>
                </div>
                <div className="bg-white border border-orange-200 rounded-lg p-3 text-center hover:bg-orange-100 cursor-pointer">
                  <div className="font-semibold text-sm text-green-800">MobiKwik</div>
                  <div className="text-xs text-gray-600">One MobiKwik</div>
                </div>
              </div>

              {/* Wallet Balance Display */}
              <div className="bg-white border border-orange-200 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600 mb-1">Available Balance</div>
                <div className="text-lg font-bold text-green-600">₹{(checkoutData?.total + 1000).toLocaleString()}</div>
                <div className="text-xs text-green-600">✓ Sufficient balance available</div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="w-full bg-orange-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-orange-800">Amount:</span>
                <span className="text-lg font-bold text-orange-900">₹{checkoutData?.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-700">Merchant:</span>
                <span className="text-sm font-medium text-orange-800">Radhika Electronics</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="w-full text-center space-y-2">
              <p className="text-sm text-gray-600">
                💰 Select your preferred wallet
              </p>
              <p className="text-sm text-gray-600">
                📱 You may receive an OTP for verification
              </p>
              <p className="text-sm text-gray-600">
                ⚡ Instant payment from wallet balance
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 w-full mt-6">
              <Button
                variant="outline"
                onClick={() => setShowWalletInterface(false)}
                className="flex-1"
                disabled={walletProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={processWalletOrder}
                disabled={walletProcessing}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {walletProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Pay with Wallet"
                )}
              </Button>
            </div>

            {/* Note */}
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-yellow-800 text-center">
                💳 Demo Mode: Click "Pay with Wallet" to simulate successful wallet payment
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}
