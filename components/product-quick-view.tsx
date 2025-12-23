"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Star, Heart, GitCompare, Truck, Shield, RotateCcw } from "lucide-react"
import Image from "next/image"

interface Product {
    id: number
    name: string
    category: string
    price: number
    originalPrice: number
    image: string
    rating: number
    reviews: number
    inStock: boolean
    description: string
}

interface ProductQuickViewProps {
    product: Product | null
    open: boolean
    onClose: () => void
    onAddToCart: (product: Product) => void
    onToggleFavorite: (productId: number) => void
    onToggleCompare: (productId: number) => void
    isFavorite: boolean
    isInCompare: boolean
    isAddingToCart: boolean
}

export function ProductQuickView({
    product,
    open,
    onClose,
    onAddToCart,
    onToggleFavorite,
    onToggleCompare,
    isFavorite,
    isInCompare,
    isAddingToCart,
}: ProductQuickViewProps) {
    if (!product) return null

    const discount = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Product Image */}
                    <div className="relative bg-gray-50 rounded-lg p-8 flex items-center justify-center">
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="w-full h-auto object-contain max-h-96"
                            priority
                        />
                        {discount > 0 && (
                            <Badge className="absolute top-4 left-4 bg-red-500 text-lg px-3 py-1">
                                {discount}% OFF
                            </Badge>
                        )}
                        {!product.inStock && (
                            <Badge variant="secondary" className="absolute top-4 right-4 text-lg px-3 py-1">
                                Out of Stock
                            </Badge>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col gap-4">
                        {/* Category Badge */}
                        <Badge variant="outline" className="w-fit">
                            {product.category.toUpperCase()}
                        </Badge>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1 font-semibold">{product.rating}</span>
                            </div>
                            <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 leading-relaxed">{product.description}</p>

                        <Separator />

                        {/* Pricing */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-blue-600">
                                ₹{product.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            </span>
                            {product.originalPrice > product.price && (
                                <>
                                    <span className="text-xl text-gray-500 line-through">
                                        ₹{product.originalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-green-600 font-semibold">
                                        Save ₹{(product.originalPrice - product.price).toLocaleString()}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full text-lg py-6"
                                onClick={() => onAddToCart(product)}
                                disabled={!product.inStock || isAddingToCart}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {isAddingToCart ? "Adding..." : product.inStock ? "Add to Cart" : "Out of Stock"}
                            </Button>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => onToggleFavorite(product.id)}
                                    className="flex items-center gap-2"
                                >
                                    <Heart
                                        className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                                    />
                                    {isFavorite ? "Favorited" : "Add to Favorites"}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => onToggleCompare(product.id)}
                                    className="flex items-center gap-2"
                                >
                                    <GitCompare
                                        className={`h-4 w-4 ${isInCompare ? "text-blue-600" : ""}`}
                                    />
                                    {isInCompare ? "In Compare" : "Compare"}
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Benefits */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Truck className="h-5 w-5 text-green-600" />
                                <span>Free delivery on orders above ₹5,000</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <RotateCcw className="h-5 w-5 text-blue-600" />
                                <span>7-day return policy</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="h-5 w-5 text-purple-600" />
                                <span>1 year warranty included</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
