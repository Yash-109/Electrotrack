"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, CreditCard, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { userAuth } from "@/lib/user-auth"
import { useAdminIntegration } from "@/hooks/use-admin-integration"

interface CartData {
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
    category: string
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
}

export default function ShippingPage() {
  const [shippingData, setShippingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Gujarat",
    pincode: "",
    deliveryMethod: "standard",
    paymentMethod: "cod",
  })

  const [cartData, setCartData] = useState<CartData | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [isNewAddress, setIsNewAddress] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { addOnlineSale } = useAdminIntegration()

  useEffect(() => {
    // Check if user is logged in
    const user = userAuth.getCurrentUser()
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to access checkout.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setCurrentUser(user)

    // Load cart data
    const storedCartData = localStorage.getItem("radhika_checkout_cart")
    if (!storedCartData) {
      toast({
        title: "No cart data found",
        description: "Please add items to cart first.",
        variant: "destructive",
      })
      router.push("/cart")
      return
    }

    const parsedCartData: CartData = JSON.parse(storedCartData)
    setCartData(parsedCartData)

    // Load user profile and shipping address
    const loadUserProfile = async () => {
      try {
        const response = await fetch(`/api/user/profile?userId=${encodeURIComponent(user.email)}`)
        const data = await response.json()
        
        if (data.success && data.user) {
          // Pre-fill user data
          setShippingData((prev) => ({
            ...prev,
            fullName: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          }))
          
          // Load saved addresses
          const addresses = data.user.shippingAddresses || []
          setSavedAddresses(addresses)
          
          // If user has addresses, find default or use first one
          if (addresses.length > 0) {
            const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0]
            setSelectedAddressId(defaultAddress.id)
            setIsNewAddress(false)
            
            // Pre-fill with default address
            setShippingData((prev) => ({
              ...prev,
              fullName: defaultAddress.fullName || prev.fullName,
              phone: defaultAddress.phone || prev.phone,
              address: defaultAddress.address || "",
              city: defaultAddress.city || "",
              state: defaultAddress.state || "Gujarat",
              pincode: defaultAddress.pincode || "",
            }))
          }
        } else {
          // Fallback to basic user info
          setShippingData((prev) => ({
            ...prev,
            fullName: user.name || "",
            email: user.email || "",
          }))
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        // Fallback to basic user info
        setShippingData((prev) => ({
          ...prev,
          fullName: user.name || "",
          email: user.email || "",
        }))
      }
    }

    loadUserProfile()
  }, [router, toast])

  const handleAddressSelection = (addressId: string) => {
    if (addressId === 'new') {
      setIsNewAddress(true)
      setSelectedAddressId('')
      // Clear address fields for new address
      setShippingData((prev) => ({
        ...prev,
        address: "",
        city: "",
        state: "Gujarat",
        pincode: "",
      }))
    } else {
      setIsNewAddress(false)
      setSelectedAddressId(addressId)
      
      // Find and load selected address
      const selectedAddress = savedAddresses.find((addr: any) => addr.id === addressId)
      if (selectedAddress) {
        setShippingData((prev) => ({
          ...prev,
          fullName: selectedAddress.fullName || prev.fullName,
          phone: selectedAddress.phone || prev.phone,
          address: selectedAddress.address || "",
          city: selectedAddress.city || "",
          state: selectedAddress.state || "Gujarat",
          pincode: selectedAddress.pincode || "",
        }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!shippingData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!shippingData.email.trim()) newErrors.email = "Email is required"
    if (!shippingData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!shippingData.address.trim()) newErrors.address = "Address is required"
    if (!shippingData.city.trim()) newErrors.city = "City is required"
    if (!shippingData.pincode.trim()) newErrors.pincode = "Pincode is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !cartData) return

    setIsLoading(true)

    try {
      // Save shipping address to user profile
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.email,
          phone: shippingData.phone,
          shippingAddress: {
            fullName: shippingData.fullName,
            addressLine1: shippingData.address,
            city: shippingData.city,
            state: shippingData.state,
            postalCode: shippingData.pincode,
            country: 'India',
            phone: shippingData.phone
          }
        })
      })

      // Add each cart item as a separate sale in admin system
      cartData.items.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          addOnlineSale({
            description: item.name,
            category: item.category,
            amount: item.price,
            paymentMethod: shippingData.paymentMethod === "cod" ? "COD" : "Online",
            customer: shippingData.fullName,
            orderId: `ORD${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          })
        }
      })

      // Store order data
      const orderData = {
        ...shippingData,
        cartData,
        orderDate: new Date().toISOString(),
        orderId: `ORD${Date.now()}`,
        customer: currentUser,
      }
      localStorage.setItem("radhika_current_order", JSON.stringify(orderData))

      if (shippingData.paymentMethod === "online") {
        // Redirect to payment page
        router.push("/payment")
      } else {
        // Process COD order
        toast({
          title: "Order placed successfully!",
          description:
            "Your order will be delivered within 3-5 business days. Order details have been added to our system.",
        })

        // Clear cart and redirect to success page
        localStorage.removeItem("radhika_checkout_cart")
        router.push("/order-success")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error placing order",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setShippingData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!cartData || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  const deliveryFee = shippingData.deliveryMethod === "express" ? 1000 : 500
  const finalTotal = cartData.subtotal + cartData.tax + deliveryFee

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shipping & Payment</h1>

        {/* User Info Alert */}
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Logged in as: <strong>{currentUser.name}</strong> ({currentUser.email})
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={shippingData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                      {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address Selection */}
                  {savedAddresses.length > 0 && (
                    <div>
                      <Label>Select Address</Label>
                      <RadioGroup 
                        value={isNewAddress ? 'new' : selectedAddressId} 
                        onValueChange={handleAddressSelection}
                        className="mt-2"
                      >
                        {savedAddresses.map((address: any) => (
                          <div key={address.id} className="flex items-start space-x-2">
                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                            <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                              <div className="p-3 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium">{address.fullName}</span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{address.address}</p>
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p className="text-sm text-gray-600">{address.phone}</p>
                              </div>
                            </Label>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="new" id="new" />
                          <Label htmlFor="new" className="cursor-pointer font-medium">
                            Use new address
                          </Label>
                        </div>
                      </RadioGroup>
                      <Separator className="my-4" />
                    </div>
                  )}

                  {/* Address Form - only show if new address selected or no saved addresses */}
                  {(isNewAddress || savedAddresses.length === 0) && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Textarea
                          id="address"
                          value={shippingData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={shippingData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            className={errors.city ? "border-red-500" : ""}
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>

                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={shippingData.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                            readOnly
                          />
                        </div>

                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={shippingData.pincode}
                            onChange={(e) => handleInputChange("pincode", e.target.value)}
                            className={errors.pincode ? "border-red-500" : ""}
                          />
                          {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={shippingData.deliveryMethod}
                    onValueChange={(value) => handleInputChange("deliveryMethod", value)}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Standard Delivery</p>
                            <p className="text-sm text-gray-600">5-7 business days</p>
                          </div>
                          <span className="font-medium">₹500</span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Express Delivery</p>
                            <p className="text-sm text-gray-600">2-3 business days</p>
                          </div>
                          <span className="font-medium">₹1,000</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={shippingData.paymentMethod}
                    onValueChange={(value) => handleInputChange("paymentMethod", value)}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <Truck className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-600">Pay when you receive your order</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Online Payment</p>
                            <p className="text-sm text-gray-600">Net Banking, UPI, Cards</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : shippingData.paymentMethod === "online" ? (
                  "Proceed to Payment"
                ) : (
                  "Place Order"
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartData.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartData.subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{cartData.tax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{deliveryFee.toLocaleString()}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📊 This order will be automatically added to our admin system for tracking and analytics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
