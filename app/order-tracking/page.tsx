"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrderTracking } from "@/components/order-tracking"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Truck, Clock, MapPin, Phone, Mail } from "lucide-react"
import { userAuth } from "@/lib/user-auth"
import { useToast } from "@/hooks/use-toast"

export default function OrderTrackingPage() {
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [trackingInput, setTrackingInput] = useState("")
    const [guestOrder, setGuestOrder] = useState<any>(null)
    const [guestTracking, setGuestTracking] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    // Fetch user orders
    const fetchUserOrders = async (userEmail: string) => {
        try {
            const response = await fetch(`/api/orders?userEmail=${encodeURIComponent(userEmail)}`)
            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            toast({
                title: "Error",
                description: "Failed to load orders. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Track order by ID for guest users
    const trackGuestOrder = async () => {
        if (!trackingInput.trim()) {
            toast({
                title: "Order ID Required",
                description: "Please enter a valid order ID to track your order.",
                variant: "destructive",
            })
            return
        }

        setGuestTracking(true)
        try {
            const response = await fetch(`/api/orders/${trackingInput.trim()}`)
            const data = await response.json()

            if (data.success) {
                setGuestOrder(data.order)
            } else {
                toast({
                    title: "Order Not Found",
                    description: "No order found with the provided ID. Please check and try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Failed to fetch order:', error)
            toast({
                title: "Error",
                description: "Failed to track order. Please try again.",
                variant: "destructive",
            })
        } finally {
            setGuestTracking(false)
        }
    }

    useEffect(() => {
        const initializePage = async () => {
            const isLoggedIn = userAuth.isLoggedIn()

            if (isLoggedIn) {
                const user = userAuth.getCurrentUser()
                setCurrentUser(user)

                if (user && user.email) {
                    await fetchUserOrders(user.email)
                }
            }

            setLoading(false)
        }

        initializePage()
    }, [])

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case "processing":
                return <Clock className="h-5 w-5 text-yellow-500" />
            case "shipped":
                return <Truck className="h-5 w-5 text-blue-500" />
            case "delivered":
                return <Package className="h-5 w-5 text-green-500" />
            default:
                return <Package className="h-5 w-5 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-800 border-green-200"
            case "shipped":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "processing":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading orders...</p>
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
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
                        <p className="text-gray-600 mt-2">Track your orders and view detailed delivery information</p>
                    </div>

                    {currentUser ? (
                        /* Logged in user - show all orders */
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Orders</CardTitle>
                                    <CardDescription>
                                        Welcome back, {currentUser.name || currentUser.email}! Here are all your orders.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <OrderTracking
                                        orders={orders}
                                        onRefresh={() => fetchUserOrders(currentUser.email)}
                                        currentUserEmail={currentUser.email}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        /* Guest user - order ID tracking */
                        <div className="space-y-8">
                            {/* Guest Tracking Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Track Your Order</CardTitle>
                                    <CardDescription>
                                        Enter your order ID to track your package delivery status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <Label htmlFor="orderid">Order ID</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <Input
                                                    id="orderid"
                                                    placeholder="Enter your order ID (e.g., ORD-1234567890)"
                                                    value={trackingInput}
                                                    onChange={(e) => setTrackingInput(e.target.value)}
                                                    className="pl-10"
                                                    onKeyPress={(e) => e.key === 'Enter' && trackGuestOrder()}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={trackGuestOrder}
                                            disabled={guestTracking}
                                            className="sm:mt-6"
                                        >
                                            {guestTracking ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            ) : (
                                                <Search className="h-4 w-4 mr-2" />
                                            )}
                                            Track Order
                                        </Button>
                                    </div>

                                    {/* Login Suggestion */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-blue-900">Have an account?</h3>
                                                <p className="text-sm text-blue-700">Login to view all your orders and get faster tracking</p>
                                            </div>
                                            <Button variant="outline" onClick={() => router.push('/login')}>
                                                Login
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Guest Order Display */}
                            {guestOrder && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{guestOrder.orderId}</CardTitle>
                                                <CardDescription>
                                                    Ordered on {formatDate(guestOrder.createdAt)}
                                                </CardDescription>
                                            </div>
                                            <Badge className={`${getStatusColor(guestOrder.status)} border`}>
                                                {getStatusIcon(guestOrder.status)}
                                                <span className="ml-2 capitalize">{guestOrder.status}</span>
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <OrderTracking
                                            orders={[guestOrder]}
                                            onRefresh={() => trackGuestOrder()}
                                            currentUserEmail={guestOrder?.userEmail}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Help Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Need Help?</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="font-medium">Call Support</p>
                                                <p className="text-sm text-gray-600">1800-123-4567 (Toll Free)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="font-medium">Email Support</p>
                                                <p className="text-sm text-gray-600">support@electrotrack.com</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Delivery Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700">Standard Delivery:</p>
                                            <p className="text-gray-600">5-7 business days</p>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700">Express Delivery:</p>
                                            <p className="text-gray-600">2-3 business days</p>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700">Same Day Delivery:</p>
                                            <p className="text-gray-600">Available in select cities</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}
