"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrderTracking } from "@/components/order-tracking"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { log } from "@/lib/logger"

interface Order {
    _id: string
    orderId: string
    userEmail: string
    total: number
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    createdAt: string
    estimatedDelivery?: string
    trackingHistory?: TrackingEvent[]
    items: OrderItem[]
}

interface TrackingEvent {
    status: string
    timestamp: string
    description: string
    location?: string
}

interface OrderItem {
    id: number
    name: string
    price: number
    quantity: number
    image?: string
}

export default function OrderTrackingPage() {
    const { data: session, status } = useSession()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()
    const router = useRouter()

    // Fetch user orders
    const fetchUserOrders = useCallback(async (userEmail: string) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/orders?userEmail=${encodeURIComponent(userEmail)}`)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
            } else {
                throw new Error(data.message || 'Failed to load orders')
            }
        } catch (error) {
            log.error('Failed to fetch user orders', error, 'OrderTracking')
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            toast({
                title: "Error",
                description: `Failed to load orders: ${errorMessage}`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        const initializePage = async () => {
            if (status === "loading") {
                return // Still loading authentication state
            }

            if (session?.user?.email) {
                await fetchUserOrders(session.user.email)
            } else {
                setLoading(false)
            }
        }

        initializePage()
    }, [session, status, fetchUserOrders])

    if (loading || status === "loading") {
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

    // Redirect to login if not authenticated
    if (!session?.user) {
        router.push('/login')
        return null
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

                    {/* Orders List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Orders</CardTitle>
                            <CardDescription>
                                Welcome back, {session.user.name || session.user.email}! Here are all your orders.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrderTracking
                                orders={orders}
                                onRefresh={() => session?.user?.email && fetchUserOrders(session.user.email)}
                                currentUserEmail={session?.user?.email || ''}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    )
}
