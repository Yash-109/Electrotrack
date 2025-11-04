"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { log } from "@/lib/logger"
import { ShoppingCart, Star, Search, Filter, Heart, GitCompare, X, Eye } from "lucide-react"
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
  // State management for search, filtering, and cart operations
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 150000 })
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [compareList, setCompareList] = useState<number[]>([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<typeof products[0] | null>(null)
  const { user: currentUser, isAuthenticated: isLoggedIn, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Accessibility: keep track of previously focused element so focus can be restored
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  // Close quick view on Escape and restore focus
  useEffect(() => {
    if (!quickViewProduct) return

    // store previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement | null

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuickViewProduct(null)
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      // restore focus to previous element if available
      try {
        previouslyFocusedElement.current?.focus()
      } catch (err) {
        // ignore focus restore errors
      }
    }
  }, [quickViewProduct])

  const categories = [
    { value: "all", label: "All Products" },
    { value: "fans", label: "Fans" },
    { value: "tvs", label: "TVs" },
    { value: "acs", label: "Air Conditioners" },
    { value: "coolers", label: "Coolers" },
    { value: "mobiles", label: "Mobile Phones" },
    { value: "laptops", label: "Laptops" },
  ]

  // Memoize filtered and sorted products for better performance
  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          (selectedCategory === "all" || product.category === selectedCategory) &&
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          product.price >= priceRange.min &&
          product.price <= priceRange.max,
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
  }, [selectedCategory, searchTerm, sortBy, priceRange])

  // Memoize addToCart function to prevent unnecessary re-renders
  const addToCart = useCallback(async (product: (typeof products)[0]) => {
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

    // Set loading state for this specific product
    setAddingToCart(product.id)

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
      const success = await CartService.saveCart(currentUser.email, updatedCart)

      if (success) {
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
    } catch (error: unknown) {
      log.componentError('Dashboard addToCart', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "Failed to add to cart",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      // Clear loading state
      setAddingToCart(null)
    }
  }, [isLoggedIn, currentUser, toast, router]) // Dependencies for useCallback

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('electrotrack-favorites')
    if (savedFavorites) {
      try {
        const favoritesArray = JSON.parse(savedFavorites)
        setFavorites(new Set(favoritesArray))
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }

    // Load search history
    const savedHistory = localStorage.getItem('electrotrack-search-history')
    if (savedHistory) {
      try {
        const historyArray = JSON.parse(savedHistory)
        setSearchHistory(historyArray)
      } catch (error) {
        console.error('Error loading search history:', error)
      }
    }
  }, [])

  // Toggle favorite status
  const toggleFavorite = useCallback((productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }

      // Save to localStorage
      localStorage.setItem('electrotrack-favorites', JSON.stringify(Array.from(newFavorites)))

      return newFavorites
    })
  }, [])

  // Toggle product in comparison list
  const toggleCompare = useCallback((productId: number) => {
    setCompareList(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else if (prev.length < 3) {
        return [...prev, productId]
      } else {
        toast({
          title: "Maximum comparison limit",
          description: "You can compare up to 3 products at once.",
          variant: "destructive",
        })
        return prev
      }
    })
  }, [toast])

  // Get compared products
  const comparedProducts = useMemo(() => {
    return products.filter(product => compareList.includes(product.id))
  }, [compareList])

  // Generate search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) {
      return searchHistory.slice(0, 5)
    }

    const productSuggestions = products
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5)
      .map(product => product.name)

    const categorySuggestions = categories
      .filter(cat =>
        cat.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        cat.value !== "all"
      )
      .map(cat => cat.label)

    return [...new Set([...productSuggestions, ...categorySuggestions])]
  }, [searchTerm, searchHistory])

  // Handle search selection
  const handleSearchSelect = useCallback((selectedTerm: string) => {
    setSearchTerm(selectedTerm)
    setShowSearchSuggestions(false)

    // Add to search history
    const newHistory = [selectedTerm, ...searchHistory.filter(item => item !== selectedTerm)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('electrotrack-search-history', JSON.stringify(newHistory))
  }, [searchHistory])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2) {
        // This would be where you'd call an API for search analytics
        console.log('Searching for:', searchTerm)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
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

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <p className="text-sm text-gray-600">Total Products</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{categories.length - 1}</div>
                <p className="text-sm text-gray-600">Categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{filteredProducts.length}</div>
                <p className="text-sm text-gray-600">Filtered Results</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSearchSuggestions(true)
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 150)}
                className="pl-10"
                aria-label="Search products"
              />

              {/* Search Suggestions Dropdown */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchTerm.length === 0 && searchHistory.length > 0 && (
                    <div className="px-3 py-2 text-xs text-gray-500 border-b">Recent Searches</div>
                  )}
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSearchSelect(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {searchTerm && suggestion.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                            <>
                              {suggestion.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
                                part.toLowerCase() === searchTerm.toLowerCase() ?
                                  <mark key={i} className="bg-yellow-200">{part}</mark> : part
                              )}
                            </>
                          ) : (
                            suggestion
                          )}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:flex-1" aria-label="Select category">
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
                <SelectTrigger className="w-full sm:flex-1" aria-label="Sort products">
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

            {/* Price Range Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <Input
                  type="number"
                  placeholder="Min ₹"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <Input
                  type="number"
                  placeholder="Max ₹"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 150000 }))}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setPriceRange({ min: 0, max: 150000 })}
                className="whitespace-nowrap"
              >
                Reset Price
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow focus-within:shadow-lg">
              <CardHeader className="p-0">
                <div className="relative bg-gray-50 rounded-t-lg overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={`Image of ${product.name}`}
                    className="w-full h-48 object-contain p-4 hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.originalPrice > product.price && (
                    <Badge
                      className="absolute top-2 left-2 bg-red-500"
                      aria-label={`${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% discount`}
                    >
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge variant="secondary" className="absolute top-2 right-2" aria-label="Out of stock">
                      Out of Stock
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(product.id)
                    }}
                    aria-label={favorites.has(product.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.has(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600 hover:text-red-500"
                        }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-12 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCompare(product.id)
                    }}
                    aria-label={compareList.includes(product.id) ? "Remove from comparison" : "Add to comparison"}
                  >
                    <GitCompare
                      className={`h-4 w-4 ${compareList.includes(product.id)
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                        }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-22 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      setQuickViewProduct(product)
                    }}
                    aria-label="Quick view product details"
                  >
                    <Eye className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-3 sm:p-4">
                <CardTitle className="text-base sm:text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
                <CardDescription className="mb-3 text-sm line-clamp-2">{product.description}</CardDescription>

                <div className="flex items-center mb-3">
                  <div className="flex items-center" role="img" aria-label={`Rating: ${product.rating} out of 5 stars`}>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{product.rating}</span>
                    <span className="ml-1 text-sm text-gray-600">({product.reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg sm:text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full text-sm sm:text-base"
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock || addingToCart === product.id}
                  aria-label={`Add ${product.name} to cart`}
                >
                  {addingToCart === product.id ? (
                    <LoadingSpinner size="sm" variant="inline" text="Adding..." />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="text-center py-12 max-w-md mx-auto">
            <CardContent className="p-8">
              <div className="mb-4">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== "all" || priceRange.min > 0 || priceRange.max < 150000
                  ? "Try adjusting your search or filter criteria."
                  : "No products available at the moment."}
              </p>
              {(searchTerm || selectedCategory !== "all" || priceRange.min > 0 || priceRange.max < 150000) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setPriceRange({ min: 0, max: 150000 })
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Comparison Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="shadow-lg border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-sm">Compare ({compareList.length}/3)</span>
                </div>

                <div className="flex gap-2">
                  {comparedProducts.map((product) => (
                    <div key={product.id} className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded border"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        onClick={() => toggleCompare(product.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {compareList.length >= 2 && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      toast({
                        title: "Comparison Feature",
                        description: "Detailed comparison page would open here with side-by-side specs.",
                      })
                    }}
                  >
                    Compare Now
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareList([])}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick View Modal */}
      <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {quickViewProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{quickViewProduct.name}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <img
                      src={quickViewProduct.image}
                      alt={quickViewProduct.name}
                      className="w-full h-64 object-contain"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFavorite(quickViewProduct.id)}
                      className="flex-1"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${favorites.has(quickViewProduct.id) ? "fill-red-500 text-red-500" : ""}`} />
                      {favorites.has(quickViewProduct.id) ? "Favorited" : "Add to Favorites"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCompare(quickViewProduct.id)}
                      className="flex-1"
                    >
                      <GitCompare className={`h-4 w-4 mr-2 ${compareList.includes(quickViewProduct.id) ? "text-blue-600" : ""}`} />
                      {compareList.includes(quickViewProduct.id) ? "In Comparison" : "Compare"}
                    </Button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  {/* Price and Rating */}
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-3xl font-bold text-blue-600">₹{quickViewProduct.price.toLocaleString()}</span>
                      {quickViewProduct.originalPrice > quickViewProduct.price && (
                        <span className="text-lg text-gray-500 line-through">
                          ₹{quickViewProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 font-medium">{quickViewProduct.rating}</span>
                      </div>
                      <span className="text-gray-600">({quickViewProduct.reviews} reviews)</span>
                      <Badge variant={quickViewProduct.inStock ? "default" : "secondary"}>
                        {quickViewProduct.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{quickViewProduct.description}</p>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h3 className="font-semibold mb-2">Specifications</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="capitalize">{quickViewProduct.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product ID:</span>
                        <span>#{quickViewProduct.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Availability:</span>
                        <span className={quickViewProduct.inStock ? "text-green-600" : "text-red-600"}>
                          {quickViewProduct.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <Button
                    className="w-full"
                    onClick={() => {
                      addToCart(quickViewProduct)
                      setQuickViewProduct(null)
                    }}
                    disabled={!quickViewProduct.inStock || addingToCart === quickViewProduct.id}
                  >
                    {addingToCart === quickViewProduct.id ? (
                      <LoadingSpinner size="sm" variant="inline" text="Adding..." />
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {quickViewProduct.inStock ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
