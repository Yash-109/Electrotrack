"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
    Package,
    Truck,
    Check,
    Clock,
    MapPin,
    Calendar,
    Eye,
    Search,
    Trash2,
    Filter,
    MessageSquare,
    Share2,
    Download,
    RefreshCw,
    Home,
    Building,
    Phone,
    Mail,
    Star
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { InvoiceGenerator, orderToInvoiceData } from "@/lib/invoice-generator"

interface OrderTrackingProps {
    orders: any[]
    onRefresh: () => void
    currentUserEmail?: string
}export function OrderTracking({ orders, onRefresh, currentUserEmail }: OrderTrackingProps) {
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [deletingOrder, setDeletingOrder] = useState<string | null>(null)
    const [cancelingOrder, setCancelingOrder] = useState<string | null>(null)
    const [reorderingOrder, setReorderingOrder] = useState<string | null>(null)
    const { toast } = useToast()

    // Filter and search orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesFilter = filterStatus === "all" || order.status.toLowerCase() === filterStatus.toLowerCase()
        return matchesSearch && matchesFilter
    })

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "processing":
                return <Clock className="h-4 w-4" />
            case "shipped":
                return <Truck className="h-4 w-4" />
            case "delivered":
                return <Check className="h-4 w-4" />
            default:
                return <Package className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
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

    const getProgressPercentage = (status: string) => {
        switch (status.toLowerCase()) {
            case "processing":
                return 25
            case "shipped":
                return 75
            case "delivered":
                return 100
            case "cancelled":
                return 0
            default:
                return 10
        }
    }

    const getTrackingSteps = (order: any) => {
        const baseSteps = [
            {
                id: 1,
                title: "Order Placed",
                status: "completed",
                time: order.createdAt,
                description: "Your order has been confirmed and received"
            },
            {
                id: 2,
                title: "Processing",
                status: order.status === "processing" ? "active" : (getProgressPercentage(order.status) > 25 ? "completed" : "pending"),
                time: order.status === "processing" || getProgressPercentage(order.status) > 25 ? order.createdAt : null,
                description: "Order is being prepared and packed"
            },
            {
                id: 3,
                title: "Shipped",
                status: order.status === "shipped" ? "active" : (order.status === "delivered" ? "completed" : "pending"),
                time: order.status === "shipped" || order.status === "delivered" ? (order.trackingHistory?.find((h: any) => h.status === "shipped")?.timestamp || order.updatedAt) : null,
                description: "Package is on the way to your address"
            },
            {
                id: 4,
                title: "Delivered",
                status: order.status === "delivered" ? "completed" : "pending",
                time: order.status === "delivered" ? (order.trackingHistory?.find((h: any) => h.status === "delivered")?.timestamp || order.updatedAt) : null,
                description: "Package has been delivered successfully"
            }
        ]

        // If we have tracking history, use more detailed information
        if (order.trackingHistory && order.trackingHistory.length > 1) {
            return order.trackingHistory.map((history: any, index: number) => ({
                id: index + 1,
                title: history.status.charAt(0).toUpperCase() + history.status.slice(1),
                status: index === order.trackingHistory.length - 1 ? "active" : "completed",
                time: history.timestamp,
                description: history.description,
                location: history.location
            }))
        }

        return baseSteps
    }

    const handleTrackOrder = (order: any) => {
        setSelectedOrder(order)
        setTrackingDialogOpen(true)
    }

    const handleCancelOrder = async (orderId: string) => {
        setCancelingOrder(orderId)
        try {
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    status: 'cancelled'
                })
            })

            if (response.ok) {
                toast({
                    title: "Order Cancelled",
                    description: "Your order has been cancelled successfully.",
                })
                onRefresh()
            } else {
                throw new Error('Failed to cancel order')
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to cancel order. Please try again.",
                variant: "destructive",
            })
        } finally {
            setCancelingOrder(null)
        }
    }

    const handleReorder = (order: any) => {
        // Logic to add items to cart for reordering
        toast({
            title: "Items Added",
            description: "Items from this order have been added to your cart.",
        })
    }

    const handleDeleteOrder = async (orderId: string) => {
        if (!currentUserEmail) {
            toast({
                title: "Authentication required",
                description: "Please log in to delete orders.",
                variant: "destructive"
            })
            return
        }

        if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
            return
        }

        setDeletingOrder(orderId)

        try {
            const response = await fetch(`/api/orders?orderId=${orderId}&userEmail=${currentUserEmail}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                // Refresh the orders list
                onRefresh()
                toast({
                    title: "Order deleted",
                    description: "The order has been successfully deleted.",
                })
            } else {
                toast({
                    title: "Delete failed",
                    description: data.error || "Failed to delete order. Please try again.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Delete order error:', error)
            toast({
                title: "Delete failed",
                description: "An error occurred while deleting the order.",
                variant: "destructive"
            })
        } finally {
            setDeletingOrder(null)
        }
    }

    const handleDownloadInvoice = async (order: any) => {
        try {
            if (!currentUserEmail) {
                toast({
                    title: "Error",
                    description: "Unable to generate invoice. User email not found.",
                    variant: "destructive",
                })
                return
            }

            // Show loading state
            toast({
                title: "Generating Invoice",
                description: "Please wait while we prepare your invoice...",
            })

            try {
                // Try PDF generation first
                const invoiceData = orderToInvoiceData(order, currentUserEmail)
                InvoiceGenerator.generateInvoicePDF(invoiceData)

                toast({
                    title: "Invoice Downloaded",
                    description: `PDF invoice for order ${order.orderId} has been downloaded successfully.`,
                })
            } catch (pdfError) {
                console.warn('PDF generation failed, falling back to HTML:', pdfError)

                // Fallback to HTML download
                const downloadUrl = `/api/invoice?orderId=${encodeURIComponent(order.orderId)}&userEmail=${encodeURIComponent(currentUserEmail)}`
                window.open(downloadUrl, '_blank')

                toast({
                    title: "Invoice Generated",
                    description: `HTML invoice for order ${order.orderId} has been opened in a new tab.`,
                })
            }
        } catch (error) {
            console.error('Error generating invoice:', error)
            toast({
                title: "Error",
                description: "Failed to generate invoice. Please try again or contact support.",
                variant: "destructive",
            })
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

    const formatCurrency = (amount: number): string => {
        if (!amount || isNaN(amount)) return '₹0.00'

        // Convert to number and ensure it's valid
        const num = parseFloat(amount.toString())
        if (isNaN(num)) return '₹0.00'

        // Format with 2 decimal places
        const formatted = num.toFixed(2)

        // Add thousands separator manually
        const parts = formatted.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

        return `₹${parts.join('.')}`
    }

    const getEstimatedDelivery = (order: any) => {
        if (order.status === "delivered") return "Delivered"
        if (order.estimatedDelivery) {
            return formatDate(order.estimatedDelivery)
        }
        // Default: 5 days from order date
        const orderDate = new Date(order.createdAt)
        const estimatedDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000)
        return formatDate(estimatedDate)
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search orders by ID or product name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border rounded-md bg-background"
                    >
                        <option value="all">All Orders</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <Card key={order._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-lg">{order.orderId}</h3>
                                                <Badge className={`${getStatusColor(order.status)} border`}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="ml-1 capitalize">{order.status}</span>
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Ordered on {formatDate(order.createdAt)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Expected delivery: {getEstimatedDelivery(order)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold">{formatCurrency(order.total)}</p>
                                            <p className="text-sm text-gray-500">{order.items.length} items</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Order Progress</span>
                                            <span>{getProgressPercentage(order.status)}% Complete</span>
                                        </div>
                                        <Progress
                                            value={getProgressPercentage(order.status)}
                                            className="h-2"
                                        />
                                    </div>

                                    {/* Items Preview */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Items:</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {order.items.slice(0, 3).map((item: any, index: number) => (
                                                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                                                    <div className="relative">
                                                        <img
                                                            src={item.image && item.image !== "" ? item.image : "/placeholder.svg"}
                                                            alt={item.name || "Product"}
                                                            className="w-8 h-8 object-cover rounded bg-gray-100 border-2 border-blue-200"
                                                            onError={(e) => {
                                                                console.error(`Preview image failed for ${item.name}: ${item.image}`);
                                                                e.currentTarget.src = "/placeholder.svg";
                                                                e.currentTarget.style.border = "2px solid red";
                                                            }}
                                                            onLoad={() => {
                                                                console.log(`Preview image loaded for ${item.name}: ${item.image}`);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="flex items-center justify-center p-2 bg-gray-50 rounded-md">
                                                    <span className="text-xs text-gray-500">
                                                        +{order.items.length - 3} more items
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleTrackOrder(order)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Track Order
                                        </Button>

                                        {order.status === "processing" && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleCancelOrder(order.orderId)}
                                                disabled={cancelingOrder === order.orderId}
                                            >
                                                {cancelingOrder === order.orderId ? (
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                ) : null}
                                                {cancelingOrder === order.orderId ? "Canceling..." : "Cancel Order"}
                                            </Button>
                                        )}

                                        {order.status === "delivered" && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReorder(order)}
                                                >
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Reorder
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Star className="h-4 w-4 mr-2" />
                                                    Review
                                                </Button>
                                            </>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownloadInvoice(order)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Invoice
                                        </Button>

                                        {order.status === "cancelled" && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteOrder(order.orderId)}
                                                disabled={deletingOrder === order.orderId}
                                            >
                                                {deletingOrder === order.orderId ? (
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchQuery || filterStatus !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "Your order history will appear here once you make a purchase"
                                }
                            </p>
                            {!searchQuery && filterStatus === "all" && (
                                <Button onClick={() => window.location.href = '/dashboard'}>
                                    Start Shopping
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Detailed Tracking Dialog */}
            <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order Tracking Details</DialogTitle>
                        <DialogDescription>
                            Track your order progress and view detailed information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <Tabs defaultValue="tracking" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                                <TabsTrigger value="details">Order Details</TabsTrigger>
                                <TabsTrigger value="support">Support</TabsTrigger>
                            </TabsList>

                            <TabsContent value="tracking" className="space-y-6">
                                {/* Order Summary */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{selectedOrder.orderId}</CardTitle>
                                                <CardDescription>
                                                    Ordered on {formatDate(selectedOrder.createdAt)}
                                                </CardDescription>
                                            </div>
                                            <Badge className={`${getStatusColor(selectedOrder.status)} border`}>
                                                {getStatusIcon(selectedOrder.status)}
                                                <span className="ml-1 capitalize">{selectedOrder.status}</span>
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Total Amount</p>
                                                <p className="text-lg font-semibold">{formatCurrency(selectedOrder.total)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Expected Delivery</p>
                                                <p className="text-lg font-semibold">{getEstimatedDelivery(selectedOrder)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tracking Progress */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tracking Progress</CardTitle>
                                        {selectedOrder.trackingNumber && (
                                            <CardDescription>
                                                Tracking Number: {selectedOrder.trackingNumber}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {getTrackingSteps(selectedOrder).map((step, index) => (
                                                <div key={step.id} className="flex items-start space-x-4 relative">
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${step.status === 'completed'
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : step.status === 'active'
                                                            ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                                                            : 'bg-white border-gray-300 text-gray-400'
                                                        }`}>
                                                        {step.status === 'completed' ? (
                                                            <Check className="h-5 w-5" />
                                                        ) : step.status === 'active' ? (
                                                            <Clock className="h-5 w-5" />
                                                        ) : (
                                                            <span className="text-sm font-medium">{step.id}</span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className={`font-medium ${step.status === 'completed' || step.status === 'active'
                                                                ? 'text-gray-900'
                                                                : 'text-gray-500'
                                                                }`}>
                                                                {step.title}
                                                            </h4>
                                                            {step.time && (
                                                                <span className="text-sm text-gray-500 font-medium">
                                                                    {formatDate(step.time)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className={`text-sm mt-1 ${step.status === 'completed' || step.status === 'active'
                                                            ? 'text-gray-600'
                                                            : 'text-gray-400'
                                                            }`}>
                                                            {step.description}
                                                        </p>

                                                        {step.location && (
                                                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                                                <MapPin className="h-3 w-3 mr-1" />
                                                                {step.location}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Connecting line */}
                                                    {index < getTrackingSteps(selectedOrder).length - 1 && (
                                                        <div
                                                            className={`absolute left-5 top-10 w-0.5 h-8 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                                                }`}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Estimated delivery info */}
                                        {selectedOrder.status !== 'delivered' && selectedOrder.estimatedDelivery && (
                                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center">
                                                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                                                    <div>
                                                        <p className="font-medium text-blue-900">
                                                            Expected Delivery: {formatDate(selectedOrder.estimatedDelivery)}
                                                        </p>
                                                        <p className="text-sm text-blue-700">
                                                            We'll notify you once your package is out for delivery
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Delivery Address */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Delivery Address</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="font-medium">{selectedOrder.shippingAddress?.fullName}</p>
                                                <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.address}</p>
                                                <p className="text-sm text-gray-600">
                                                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                                                </p>
                                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                                    <Phone className="h-3 w-3 mr-1" />
                                                    {selectedOrder.shippingAddress?.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="details" className="space-y-6">
                                {/* Items List */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order Items</CardTitle>
                                        <p className="text-sm text-gray-500">Total items: {selectedOrder.items.length}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {selectedOrder.items.map((item: any, index: number) => {
                                                console.log(`Rendering item ${index + 1}:`, item);
                                                console.log(`Item image path:`, item.image);
                                                return (
                                                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                                        <div className="relative">
                                                            <img
                                                                src={item.image && item.image !== "" ? item.image : "/placeholder.svg"}
                                                                alt={item.name || "Product"}
                                                                className="w-16 h-16 object-cover rounded-md bg-gray-100 border-2 border-blue-200"
                                                                onError={(e) => {
                                                                    console.error(`Image load failed for item ${index + 1} - ${item.name}:`, item.image);
                                                                    e.currentTarget.src = "/placeholder.svg";
                                                                    e.currentTarget.style.border = "2px solid red";
                                                                }}
                                                                onLoad={() => {
                                                                    console.log(`Image loaded successfully for item ${index + 1} - ${item.name}:`, item.image);
                                                                }}
                                                            />
                                                            {(!item.image || item.image === "") && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-red-200 rounded-md opacity-75">
                                                                    <span className="text-xs text-red-800 font-bold">NO IMG</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">{item.name}</h4>
                                                            <p className="text-sm text-gray-600">Category: {item.category}</p>
                                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                            <p className="text-xs text-gray-400">Image: {item.image || "No image path"}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                                            <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment & Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Payment Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Payment Method:</span>
                                                    <span className="font-medium capitalize">{selectedOrder.paymentMethod}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Payment Status:</span>
                                                    <Badge variant="outline" className="text-green-600">Paid</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Order Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Subtotal:</span>
                                                    <span>{formatCurrency(selectedOrder.subtotal || (selectedOrder.total - (selectedOrder.shipping || 0) - (selectedOrder.tax || 0)))}</span>
                                                </div>
                                                {selectedOrder.shipping && (
                                                    <div className="flex justify-between">
                                                        <span>Shipping:</span>
                                                        <span>{formatCurrency(selectedOrder.shipping)}</span>
                                                    </div>
                                                )}
                                                {selectedOrder.tax && (
                                                    <div className="flex justify-between">
                                                        <span>Tax:</span>
                                                        <span>{formatCurrency(selectedOrder.tax)}</span>
                                                    </div>
                                                )}
                                                <Separator />
                                                <div className="flex justify-between font-semibold text-lg">
                                                    <span>Total:</span>
                                                    <span>{formatCurrency(selectedOrder.total)}</span>
                                                </div>

                                                {/* Download Invoice Button */}
                                                <div className="mt-6 pt-4 border-t">
                                                    <Button
                                                        onClick={() => handleDownloadInvoice(selectedOrder)}
                                                        className="w-full"
                                                        size="sm"
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download Invoice
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="support" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Need Help?</CardTitle>
                                        <CardDescription>
                                            Get assistance with your order
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button variant="outline" className="h-auto p-4">
                                                <div className="text-left">
                                                    <MessageSquare className="h-5 w-5 mb-2" />
                                                    <p className="font-medium">Chat Support</p>
                                                    <p className="text-sm text-gray-500">Get instant help from our team</p>
                                                </div>
                                            </Button>

                                            <Button variant="outline" className="h-auto p-4">
                                                <div className="text-left">
                                                    <Mail className="h-5 w-5 mb-2" />
                                                    <p className="font-medium">Email Support</p>
                                                    <p className="text-sm text-gray-500">Send us detailed questions</p>
                                                </div>
                                            </Button>

                                            <Button variant="outline" className="h-auto p-4">
                                                <div className="text-left">
                                                    <Phone className="h-5 w-5 mb-2" />
                                                    <p className="font-medium">Call Support</p>
                                                    <p className="text-sm text-gray-500">1800-123-4567</p>
                                                </div>
                                            </Button>

                                            <Button variant="outline" className="h-auto p-4">
                                                <div className="text-left">
                                                    <RefreshCw className="h-5 w-5 mb-2" />
                                                    <p className="font-medium">Return/Exchange</p>
                                                    <p className="text-sm text-gray-500">Initiate return process</p>
                                                </div>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
