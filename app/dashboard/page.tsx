"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Star, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { CartService, type CartItem } from "@/lib/cart-service"
import { useRouter } from "next/navigation"

const products = [
  // FANS (4 products)
  {
    id: 1,
    name: "Bajaj Ceiling Fan 1200mm",
    category: "fans",
    price: 2499,
    originalPrice: 2999,
    image: "/images/Fan/Bajaj_fan.jpg",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    description: "High-speed ceiling fan with decorative design",
  },
  {
    id: 7,
    name: "Orient Electric Aeroquiet Fan",
    category: "fans",
    price: 3299,
    originalPrice: 3799,
    image: "/images/Fan/Aeroquite_fan.jpg",
    rating: 4.6,
    reviews: 95,
    inStock: true,
    description: "Premium silent operation ceiling fan with remote control",
  },
  {
    id: 8,
    name: "Havells Stealth Neo 1200mm",
    category: "fans",
    price: 2899,
    originalPrice: 3399,
    image: "/images/Fan/Havells_fan.jpg",
    rating: 4.4,
    reviews: 167,
    inStock: true,
    description: "Energy efficient BLDC motor ceiling fan",
  },
  {
    id: 9,
    name: "Crompton Hill Briz 1200mm",
    category: "fans",
    price: 2199,
    originalPrice: 2699,
    image: "/images/Fan/Crompton_fan.jpg",
    rating: 4.3,
    reviews: 142,
    inStock: true,
    description: "High air delivery ceiling fan with metallic finish",
  },

  // TVs (4 products)
  {
    id: 2,
    name: 'Samsung 43" Smart TV',
    category: "tvs",
    price: 32999,
    originalPrice: 36999,
    image: "/images/TV/Samusung_TV.jpg",
    rating: 4.7,
    reviews: 89,
    inStock: true,
    description: "4K Ultra HD Smart LED TV with HDR",
  },
  {
    id: 10,
    name: 'LG 55" OLED Smart TV',
    category: "tvs",
    price: 89999,
    originalPrice: 99999,
    image: "/images/TV/Lg_tv.jpeg",
    rating: 4.8,
    reviews: 156,
    inStock: true,
    description: "55-inch OLED 4K Smart TV with AI ThinQ",
  },
  {
    id: 11,
    name: 'Sony Bravia 50" LED TV',
    category: "tvs",
    price: 58999,
    originalPrice: 64999,
    image: "/images/TV/Sony_tv.jpeg",
    rating: 4.6,
    reviews: 203,
    inStock: true,
    description: "4K HDR Smart TV with Google TV platform",
  },
  {
    id: 12,
    name: 'Mi TV 32" HD Ready',
    category: "tvs",
    price: 14999,
    originalPrice: 18999,
    image: "/images/TV/Xiaomi_tv.jpeg",
    rating: 4.2,
    reviews: 312,
    inStock: true,
    description: "32-inch HD Ready Smart LED TV with Android TV",
  },

  // AIR CONDITIONERS (4 products)
  {
    id: 3,
    name: "LG 1.5 Ton Split AC",
    category: "acs",
    price: 28999,
    originalPrice: 32999,
    image: "/images/AC/Lg_ac.jpg",
    rating: 4.6,
    reviews: 156,
    inStock: true,
    description: "Inverter AC with copper condenser",
  },
  {
    id: 13,
    name: "Daikin 1 Ton Inverter AC",
    category: "acs",
    price: 35999,
    originalPrice: 39999,
    image: "/images/AC/Daikin_ac.jpeg",
    rating: 4.7,
    reviews: 189,
    inStock: true,
    description: "5-star rated inverter AC with PM 2.5 filter",
  },
  {
    id: 14,
    name: "Blue Star 2 Ton Split AC",
    category: "acs",
    price: 42999,
    originalPrice: 47999,
    image: "/images/AC/Bluestar_ac.jpeg",
    rating: 4.5,
    reviews: 98,
    inStock: true,
    description: "Heavy duty 2-ton AC for large rooms",
  },
  {
    id: 15,
    name: "Voltas 1.5 Ton Window AC",
    category: "acs",
    price: 24999,
    originalPrice: 28999,
    image: "/images/AC/Voltas_ac.jpg",
    rating: 4.3,
    reviews: 234,
    inStock: true,
    description: "Window AC with rotary compressor and copper coil",
  },

  // COOLERS (4 products)
  {
    id: 4,
    name: "Symphony Desert Air Cooler",
    category: "coolers",
    price: 8999,
    originalPrice: 10999,
    image: "/images/Cooler/Symphony_cooler.jpg",
    rating: 4.3,
    reviews: 67,
    inStock: true,
    description: "70L capacity with powerful air throw",
  },
  {
    id: 16,
    name: "Bajaj PCF 25 DLX Personal Cooler",
    category: "coolers",
    price: 4999,
    originalPrice: 5999,
    image: "/images/Cooler/Bajaj_cooler.jpeg",
    rating: 4.1,
    reviews: 145,
    inStock: true,
    description: "25L personal air cooler with ice chamber",
  },
  {
    id: 17,
    name: "Orient Electric Supercool 50L",
    category: "coolers",
    price: 7499,
    originalPrice: 8499,
    image: "/images/Cooler/Orient_cooler.jpeg",
    rating: 4.4,
    reviews: 89,
    inStock: true,
    description: "50L tower cooler with honeycomb pads",
  },
  {
    id: 18,
    name: "Crompton Ozone 88L Desert Cooler",
    category: "coolers",
    price: 12999,
    originalPrice: 14999,
    image: "/images/Cooler/Crompton_cooler.jpeg",
    rating: 4.5,
    reviews: 76,
    inStock: true,
    description: "88L desert cooler with inverter compatibility",
  },

  // MOBILE PHONES (5 products)
  {
    id: 5,
    name: "iPhone 15 128GB",
    category: "mobiles",
    price: 79999,
    originalPrice: 84999,
    image: "/images/Phone/iphone.jpg",
    rating: 4.8,
    reviews: 234,
    inStock: true,
    description: "Latest iPhone with A17 Pro chip",
  },
  {
    id: 19,
    name: "Samsung Galaxy S24 Ultra",
    category: "mobiles",
    price: 124999,
    originalPrice: 134999,
    image: "/images/Phone/Samsung_phone.jpeg",
    rating: 4.7,
    reviews: 178,
    inStock: true,
    description: "Flagship Android phone with S Pen and 200MP camera",
  },
  {
    id: 20,
    name: "OnePlus 12 256GB",
    category: "mobiles",
    price: 64999,
    originalPrice: 69999,
    image: "/images/Phone/Oneplus_phone.jpeg",
    rating: 4.6,
    reviews: 267,
    inStock: true,
    description: "Snapdragon 8 Gen 3 processor with 100W fast charging",
  },
  {
    id: 21,
    name: "Xiaomi 14 Pro 512GB",
    category: "mobiles",
    price: 79999,
    originalPrice: 84999,
    image: "/images/Phone/Xiaomi_phone.jpeg",
    rating: 4.5,
    reviews: 198,
    inStock: true,
    description: "Leica camera system with Snapdragon 8 Gen 3",
  },
  {
    id: 22,
    name: "Google Pixel 8 Pro",
    category: "mobiles",
    price: 106999,
    originalPrice: 114999,
    image: "/images/Phone/Google_phone.jpeg",
    rating: 4.6,
    reviews: 134,
    inStock: true,
    description: "Pure Android experience with advanced AI features",
  },

  // LAPTOPS (5 products)
  {
    id: 6,
    name: "Dell Inspiron 15 Laptop",
    category: "laptops",
    price: 45999,
    originalPrice: 49999,
    image: "/images/Laptop/Dell_laptop.jpg",
    rating: 4.4,
    reviews: 92,
    inStock: true,
    description: "Intel i5, 8GB RAM, 512GB SSD",
  },
  {
    id: 23,
    name: "HP Pavilion Gaming Laptop",
    category: "laptops",
    price: 67999,
    originalPrice: 74999,
    image: "/images/Laptop/Hp_laptop.jpeg",
    rating: 4.5,
    reviews: 156,
    inStock: true,
    description: "AMD Ryzen 7, 16GB RAM, RTX 4050 Graphics",
  },
  {
    id: 24,
    name: "Lenovo ThinkPad E14",
    category: "laptops",
    price: 52999,
    originalPrice: 57999,
    image: "/images/Laptop/Lenovo_laptop.jpeg",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    description: "Business laptop with Intel i7, 16GB RAM, 1TB SSD",
  },
  {
    id: 25,
    name: "ASUS VivoBook 15",
    category: "laptops",
    price: 38999,
    originalPrice: 42999,
    image: "/images/Laptop/Asus_laptop.jpg",
    rating: 4.3,
    reviews: 167,
    inStock: true,
    description: "Affordable laptop with AMD Ryzen 5, 8GB RAM",
  },
  {
    id: 26,
    name: "MacBook Air M3 13-inch",
    category: "laptops",
    price: 114999,
    originalPrice: 124999,
    image: "/images/Laptop/Macbook_laptop.jpg",
    rating: 4.8,
    reviews: 234,
    inStock: true,
    description: "Apple M3 chip, 8GB unified memory, 256GB SSD",
  },
]

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const { user: currentUser, isAuthenticated: isLoggedIn, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const categories = [
    { value: "all", label: "All Products" },
    { value: "fans", label: "Fans" },
    { value: "tvs", label: "TVs" },
    { value: "acs", label: "Air Conditioners" },
    { value: "coolers", label: "Coolers" },
    { value: "mobiles", label: "Mobile Phones" },
    { value: "laptops", label: "Laptops" },
  ]

  const filteredProducts = products
    .filter(
      (product) =>
        (selectedCategory === "all" || product.category === selectedCategory) &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const addToCart = async (product: (typeof products)[0]) => {
    if (!isLoggedIn || !currentUser) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!product || !product.id || !product.name || typeof product.price !== 'number') {
      toast({
        title: "Invalid product",
        description: "Unable to add this product to cart.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get current cart
      const currentCart = await CartService.getCart(currentUser.email)

      // Check if item already exists in cart
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id.toString())

      let updatedCart: CartItem[]
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedCart = currentCart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: product.id.toString(),
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          category: product.category
        }
        updatedCart = [...currentCart, newItem]
      }

      // Save updated cart
      console.log('Saving cart for user:', currentUser.email, 'with items:', updatedCart)
      const success = await CartService.saveCart(currentUser.email, updatedCart)

      if (success) {
        console.log('Cart saved successfully, dispatching cartUpdated event')
        toast({
          title: "Added to cart!",
          description: `${product.name} has been added to your cart.`,
        })

        // Trigger header refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        toast({
          title: "Failed to add to cart",
          description: "Unable to save cart. Please check your connection and try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Add to cart error:', error)
      toast({
        title: "Failed to add to cart",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Our Electronics Collection</h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative bg-gray-50 rounded-t-lg overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-contain p-4 hover:scale-105 transition-transform duration-300"
                  />
                  {product.originalPrice > product.price && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                <CardDescription className="mb-3">{product.description}</CardDescription>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{product.rating}</span>
                    <span className="ml-1 text-sm text-gray-600">({product.reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <Button className="w-full" onClick={() => addToCart(product)} disabled={!product.inStock}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
