import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, CreditCard, Truck } from "lucide-react"

interface OrderItem {
    id: number
    name: string
    price: number
    quantity: number
    category: string
}

interface OrderConfirmationProps {
    orderId: string
    items: OrderItem[]
    total: number
    paymentMethod: string
    shippingAddress: {
        fullName: string
        address: string
        city: string
        state: string
        pincode: string
        phone: string
    }
    estimatedDelivery?: string
    status?: string
}

export function OrderConfirmation({
    orderId,
    items,
    total,
    paymentMethod,
    shippingAddress,
    estimatedDelivery = "5-7 business days",
    status = "processing"
}: OrderConfirmationProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "bg-green-100 text-green-800"
            case "processing":
                return "bg-blue-100 text-blue-800"
            case "shipped":
                return "bg-purple-100 text-purple-800"
            case "delivered":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
            case "delivered":
                return <CheckCircle className="h-4 w-4" />
            case "processing":
                return <Package className="h-4 w-4" />
            case "shipped":
                return <Truck className="h-4 w-4" />
            default:
                return <Package className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600">Thank you for your purchase. Your order has been received.</p>
            </div>

            {/* Order Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Order Details</CardTitle>
                        <Badge className={getStatusColor(status)}>
                            {getStatusIcon(status)}
                            <span className="ml-1 capitalize">{status}</span>
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-500">Order ID:</span>
                            <p className="font-mono">{orderId}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500">Payment Method:</span>
                            <p className="capitalize">{paymentMethod}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500">Estimated Delivery:</span>
                            <p>{estimatedDelivery}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500">Total Amount:</span>
                            <p className="font-semibold">₹{total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <p className="text-sm text-gray-500">Category: {item.category}</p>
                                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                                        <p className="text-sm text-gray-500">₹{item.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} each</p>
                                    </div>
                                </div>
                                {index < items.length - 1 && <Separator className="mt-4" />}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Truck className="h-5 w-5 mr-2" />
                        Shipping Address
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm">
                        <p className="font-medium">{shippingAddress.fullName}</p>
                        <p>{shippingAddress.address}</p>
                        <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                        <p>Phone: {shippingAddress.phone}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Payment Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm">
                        <p>
                            <span className="font-medium">Payment Method:</span> {paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                        </p>
                        {paymentMethod === "cod" && (
                            <p className="text-amber-600 mt-2">
                                💰 Please keep ₹{total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ready for payment upon delivery.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
