"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { log } from "@/lib/logger"
import Image from "next/image"
import { ShoppingCart, Star, Search, Filter, Heart, GitCompare, X, Eye, AlertCircle, ThumbsUp, MessageSquare } from "lucide-react"
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
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<typeof products[0] | null>(null)
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [imageLoadingStates, setImageLoadingStates] = useState<Set<number>>(new Set())
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewProduct, setReviewProduct] = useState<typeof products[0] | null>(null)
  const [productReviews, setProductReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const { user: currentUser, isAuthenticated: isLoggedIn, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Accessibility: keep track of previously focused element so focus can be restored
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  // Handle image loading states
  const handleImageLoad = useCallback((productId: number) => {
    setImageLoadingStates(prev => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
  }, [])

  const handleImageLoadStart = useCallback((productId: number) => {
    setImageLoadingStates(prev => new Set(prev).add(productId))
  }, [])

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
    // Early return if no filters applied and no search term
    if (selectedCategory === "all" && !searchTerm && priceRange.min === 0 && priceRange.max === 150000) {
      return products.sort((a, b) => {
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
    }

    // Pre-compute search term once for efficiency
    const searchLower = searchTerm.toLowerCase()
    const hasSearchTerm = searchTerm.length > 0

    return products
      .filter((product) => {
        // Category filter (most restrictive first)
        if (selectedCategory !== "all" && product.category !== selectedCategory) {
          return false
        }

        // Price range filter (numeric comparison, fast)
        if (product.price < priceRange.min || product.price > priceRange.max) {
          return false
        }

        // Search filter - pre-compute lowercase values for efficiency
        if (hasSearchTerm) {
          const nameMatch = product.name.toLowerCase().includes(searchLower)
          const categoryMatch = product.category.toLowerCase().includes(searchLower)
          const descMatch = product.description.toLowerCase().includes(searchLower)

          if (!nameMatch && !categoryMatch && !descMatch) {
            return false
          }
        }

        return true
      })
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
    // Consolidated login and user validation
    if (!isLoggedIn || !currentUser?.email) {
      const message = !isLoggedIn
        ? "Please login to add items to cart."
        : "Your account is missing an email address. Please re-login to continue."

      toast({
        title: isLoggedIn ? "Account issue" : "Login required",
        description: message,
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Validate product data
    if (!product?.id || !product?.name || typeof product.price !== 'number' || product.price <= 0) {
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
        log.error('Failed to load favorites from localStorage', error, 'Dashboard')
      }
    }

    // Load search history
    const savedHistory = localStorage.getItem('electrotrack-search-history')
    if (savedHistory) {
      try {
        const historyArray = JSON.parse(savedHistory)
        setSearchHistory(historyArray)
      } catch (error) {
        log.error('Failed to load search history from localStorage', error, 'Dashboard')
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

  // Generate search suggestions with better performance
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) {
      return searchHistory.slice(0, 5)
    }

    const searchLower = searchTerm.toLowerCase()
    const suggestions = new Set<string>()

    // Add product name suggestions (limited to avoid performance issues)
    products
      .filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      )
      .slice(0, 10) // Limit to 10 for performance
      .forEach(product => suggestions.add(product.name))

    // Add category suggestions
    categories
      .filter(cat =>
        cat.label.toLowerCase().includes(searchLower) &&
        cat.value !== "all"
      )
      .forEach(cat => suggestions.add(cat.label))

    return Array.from(suggestions).slice(0, 8) // Limit final results
  }, [searchTerm, searchHistory])

  // Fetch reviews for a product
  const fetchProductReviews = useCallback(async (productId: number) => {
    setReviewsLoading(true)
    try {
      const response = await fetch(`/api/reviews?productId=${productId}&limit=50`)
      const data = await response.json()

      if (data.success) {
        setProductReviews(data.reviews)
      }
    } catch (error) {
      log.componentError('Dashboard fetchProductReviews', error)
    } finally {
      setReviewsLoading(false)
    }
  }, [])

  // Submit a product review
  const submitReview = useCallback(async () => {
    if (!isLoggedIn || !currentUser?.email || !reviewProduct) {
      toast({
        title: "Login required",
        description: "Please login to submit a review.",
        variant: "destructive",
      })
      return
    }

    if (!reviewForm.title || !reviewForm.comment) {
      toast({
        title: "Missing information",
        description: "Please provide both title and comment for your review.",
        variant: "destructive",
      })
      return
    }

    setSubmittingReview(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: reviewProduct.id.toString(),
          userEmail: currentUser.email,
          userName: currentUser.name || 'Anonymous',
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Review submitted!",
          description: "Thank you for your feedback.",
        })
        setShowReviewModal(false)
        setReviewForm({ rating: 5, title: '', comment: '' })
        // Refresh reviews
        fetchProductReviews(reviewProduct.id)
      } else {
        toast({
          title: "Failed to submit review",
          description: data.error || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      log.componentError('Dashboard submitReview', error)
      toast({
        title: "Failed to submit review",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingReview(false)
    }
  }, [isLoggedIn, currentUser, reviewProduct, reviewForm, toast, fetchProductReviews])

  // Mark review as helpful
  const markReviewHelpful = useCallback(async (reviewId: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action: 'helpful' })
      })

      const data = await response.json()

      if (data.success && reviewProduct) {
        toast({
          title: "Thank you!",
          description: "Your feedback helps others.",
        })
        fetchProductReviews(reviewProduct.id)
      }
    } catch (error) {
      log.componentError('Dashboard markReviewHelpful', error)
    }
  }, [reviewProduct, toast, fetchProductReviews])

  // Debounced search history save function to prevent excessive localStorage writes
  const debouncedSaveSearchHistory = useCallback(() => {
    let timeoutId: NodeJS.Timeout | null = null

    return (newHistory: string[]) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        localStorage.setItem('electrotrack-search-history', JSON.stringify(newHistory))
      }, 500) // 500ms delay
    }
  }, [])()

  // Handle search selection
  const handleSearchSelect = useCallback((selectedTerm: string) => {
    setSearchTerm(selectedTerm)
    setShowSearchSuggestions(false)

    // Add to search history
    const newHistory = [selectedTerm, ...searchHistory.filter(item => item !== selectedTerm)].slice(0, 10)
    setSearchHistory(newHistory)
    debouncedSaveSearchHistory(newHistory)
  }, [searchHistory])

  // Debounced search effect with proper cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2) {
        log.debug('Search term updated', { searchTerm, length: searchTerm.length }, 'Dashboard')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Cleanup event listeners on unmount
  useEffect(() => {
    const handleCartUpdate = () => {
      // Force re-render when cart is updated from other components
      setAddingToCart(null)
    }

    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  // Auto-cleanup expired search suggestions
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setSearchHistory(prev => {
        // Keep only recent searches (limit to 10 most recent)
        const trimmedHistory = prev.slice(0, 10)

        // Only save if the history was actually trimmed
        if (trimmedHistory.length !== prev.length) {
          debouncedSaveSearchHistory(trimmedHistory)
          return trimmedHistory
        }

        return prev
      })
    }, 5 * 60 * 1000) // Run every 5 minutes

    return () => clearInterval(cleanupInterval)
  }, [debouncedSaveSearchHistory])

  // Reset selected suggestion index when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(-1)
  }, [searchSuggestions])

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
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="container mx-auto px-4 py-8">
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
            {/* Search Bar (wrapped in a non-submitting form to avoid accidental Enter submits) */}
            <form onSubmit={(e) => e.preventDefault()} className="relative w-full" aria-label="Search form" role="search">
              <label htmlFor="dashboard-search" className="sr-only">Search products</label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" aria-hidden="true" />
              <Input
                placeholder="Search products..."
                id="dashboard-search"
                aria-controls="search-suggestions"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSearchSuggestions(true)
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSearchSuggestions(false)
                    setSelectedSuggestionIndex(-1)
                    e.currentTarget.blur()
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setSelectedSuggestionIndex(prev =>
                      prev < searchSuggestions.length - 1 ? prev + 1 : 0
                    )
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setSelectedSuggestionIndex(prev =>
                      prev > 0 ? prev - 1 : searchSuggestions.length - 1
                    )
                  } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
                    e.preventDefault()
                    const selectedSuggestion = searchSuggestions[selectedSuggestionIndex]
                    if (selectedSuggestion) {
                      handleSearchSelect(selectedSuggestion)
                      setSelectedSuggestionIndex(-1)
                    }
                  }
                }}
                className="pl-10"
                aria-label="Search products by name, category, or description"
                aria-expanded={showSearchSuggestions && searchSuggestions.length > 0}
                aria-haspopup="listbox"
                aria-autocomplete="list"
                role="combobox"
              />

              {/* Search Suggestions Dropdown */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div
                  id="search-suggestions"
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  {searchTerm.length === 0 && searchHistory.length > 0 && (
                    <div className="px-3 py-2 text-xs text-gray-500 border-b" role="presentation">Recent Searches</div>
                  )}
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 ${index === selectedSuggestionIndex
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 focus:bg-gray-50'
                        }`}
                      onClick={() => {
                        handleSearchSelect(suggestion)
                        setSelectedSuggestionIndex(-1)
                      }}
                      role="option"
                      aria-selected={index === selectedSuggestionIndex}
                      tabIndex={showSearchSuggestions ? 0 : -1}
                      data-suggestion-index={index}
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
            </form>

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
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          role="region"
          aria-label="Products listing"
          aria-live="polite"
          aria-busy={loadingProducts}
        >
          {filteredProducts.map((product, index) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow focus-within:shadow-lg"
              tabIndex={0}
              role="article"
              aria-labelledby={`product-title-${product.id}`}
            >
              <CardHeader className="p-0">
                <div className="relative bg-gray-50 rounded-t-lg overflow-hidden">
                  {/* Image loading skeleton */}
                  {imageLoadingStates.has(product.id) && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg animate-pulse"></div>
                    </div>
                  )}
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={`Image of ${product.name}`}
                    className="w-full h-48 object-contain p-4 hover:scale-105 transition-transform duration-300"
                    width={600}
                    height={288}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={false}
                    onLoadStart={() => handleImageLoadStart(product.id)}
                    onLoad={() => handleImageLoad(product.id)}
                    onError={() => handleImageLoad(product.id)}
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
                      fetchProductReviews(product.id)
                    }}
                    aria-label="Quick view product details"
                  >
                    <Eye className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-3 sm:p-4">
                <CardTitle
                  id={`product-title-${product.id}`}
                  className="text-base sm:text-lg mb-2 line-clamp-2"
                >
                  {product.name}
                </CardTitle>
                <CardDescription className="mb-3 text-sm line-clamp-2">
                  {product.description}
                </CardDescription>

                <div className="flex items-center mb-3">
                  <div
                    className="flex items-center cursor-pointer hover:underline"
                    role="button"
                    aria-label={`Rating: ${product.rating} out of 5 stars, ${product.reviews} reviews - Click to view reviews`}
                    onClick={() => {
                      setQuickViewProduct(product)
                      fetchProductReviews(product.id)
                    }}
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <span className="ml-1 text-sm font-medium" aria-hidden="true">{product.rating}</span>
                    <span className="ml-1 text-sm text-gray-600" aria-hidden="true">({product.reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4" aria-label="Pricing information">
                  <div>
                    <span
                      className="text-lg sm:text-2xl font-bold text-blue-600"
                      aria-label={`Current price ${product.price.toLocaleString()} rupees`}
                    >
                      ₹{product.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </span>
                    {product.originalPrice > product.price && (
                      <span
                        className="ml-2 text-sm text-gray-500 line-through"
                        aria-label={`Original price ${product.originalPrice.toLocaleString()} rupees`}
                      >
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full text-sm sm:text-base"
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock || addingToCart === product.id}
                  aria-label={`Add ${product.name} to cart${!product.inStock ? ' - Currently out of stock' : ''}`}
                  aria-describedby={`product-title-${product.id}`}
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
      </main>

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
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded border"
                        width={48}
                        height={48}
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
                    onClick={() => setShowComparisonModal(true)}
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
                    <Image
                      src={quickViewProduct.image}
                      alt={quickViewProduct.name}
                      className="w-full h-64 object-contain"
                      width={800}
                      height={512}
                      priority={false}
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
                      <span className="text-3xl font-bold text-blue-600">₹{quickViewProduct.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                      {quickViewProduct.originalPrice > quickViewProduct.price && (
                        <span className="text-lg text-gray-500 line-through">
                          ₹{quickViewProduct.originalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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

                  {/* Write Review Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      setReviewProduct(quickViewProduct)
                      setShowReviewModal(true)
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Customer Reviews</h3>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{quickViewProduct.rating}</span>
                    <span className="text-gray-600">({productReviews.length} reviews)</span>
                  </div>
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : productReviews.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {productReviews.slice(0, 5).map((review: any) => (
                      <div key={review._id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.userName}</span>
                              {review.isVerifiedPurchase && (
                                <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium mb-1">{review.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markReviewHelpful(review._id)}
                          className="text-xs"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Helpful ({review.helpfulCount || 0})
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Comparison Modal */}
      <Dialog open={showComparisonModal} onOpenChange={setShowComparisonModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Product Comparison ({comparedProducts.length} items)</DialogTitle>
            <p className="text-gray-600">Compare features, specifications, and value to make the best choice</p>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-4 font-semibold min-w-[180px] bg-gray-50">Feature</th>
                  {comparedProducts.map((product) => (
                    <th key={product.id} className="text-center p-4 font-semibold min-w-[220px] bg-gray-50">
                      <div className="space-y-3">
                        <div className="relative">
                          <Image
                            src={product.image}
                            alt={product.name}
                            className="w-28 h-28 object-contain mx-auto rounded-lg border shadow-sm"
                            width={112}
                            height={112}
                          />
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">Out of Stock</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900 leading-tight">{product.name}</div>
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price & Savings Analysis */}
                <tr className="border-b hover:bg-blue-50">
                  <td className="p-4 font-medium text-blue-900 bg-blue-50">💰 Price & Savings</td>
                  {comparedProducts.map((product) => {
                    const discount = product.originalPrice > product.price ?
                      Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
                    const savings = product.originalPrice - product.price
                    return (
                      <td key={`${product.id}-price`} className="p-4 text-center">
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-green-600">₹{product.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
                          {product.originalPrice > product.price && (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500 line-through">
                                ₹{product.originalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              </div>
                              <Badge className="bg-red-500 text-xs">
                                Save ₹{savings.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ({discount}% OFF)
                              </Badge>
                            </div>
                          )}
                          {discount === 0 && <div className="text-xs text-gray-500">No discount</div>}
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Customer Satisfaction */}
                <tr className="border-b hover:bg-yellow-50">
                  <td className="p-4 font-medium text-yellow-900 bg-yellow-50">⭐ Customer Satisfaction</td>
                  {comparedProducts.map((product) => {
                    const ratingColor = product.rating >= 4.5 ? 'text-green-600' :
                      product.rating >= 4.0 ? 'text-yellow-600' : 'text-red-600'
                    return (
                      <td key={`${product.id}-rating`} className="p-4 text-center">
                        <div className="space-y-2">
                          <div className={`flex items-center justify-center text-lg font-bold ${ratingColor}`}>
                            <Star className="h-5 w-5 fill-current mr-1" />
                            {product.rating}/5
                          </div>
                          <div className="text-sm text-gray-600">{product.reviews} verified reviews</div>
                          <div className="text-xs">
                            {product.rating >= 4.5 ? '🏆 Excellent' :
                              product.rating >= 4.0 ? '👍 Very Good' :
                                product.rating >= 3.5 ? '👌 Good' : '⚠️ Average'}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Availability & Stock */}
                <tr className="border-b hover:bg-green-50">
                  <td className="p-4 font-medium text-green-900 bg-green-50">📦 Availability</td>
                  {comparedProducts.map((product) => (
                    <td key={`${product.id}-stock`} className="p-4 text-center">
                      <div className="space-y-2">
                        <Badge
                          variant={product.inStock ? "default" : "destructive"}
                          className={product.inStock ? "bg-green-500" : ""}
                        >
                          {product.inStock ? "✅ In Stock" : "❌ Out of Stock"}
                        </Badge>
                        <div className="text-xs text-gray-600">
                          {product.inStock ? "Ready to ship" : "Currently unavailable"}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Product Features */}
                <tr className="border-b hover:bg-purple-50">
                  <td className="p-4 font-medium text-purple-900 bg-purple-50">🔧 Key Features</td>
                  {comparedProducts.map((product) => {
                    // Generate features based on product category
                    const getFeatures = () => {
                      switch (product.category) {
                        case 'mobiles':
                          return ['📱 Smartphone', '📷 Camera Phone', '🔋 Long Battery', '📶 5G Ready']
                        case 'laptops':
                          return ['💻 Portable', '⚡ Fast Performance', '🔋 All-day Battery', '💾 Large Storage']
                        case 'tvs':
                          return ['📺 Smart TV', '🎬 4K Display', '🔊 Surround Sound', '📡 Streaming Ready']
                        case 'acs':
                          return ['❄️ Fast Cooling', '⚡ Energy Efficient', '🌿 Eco-friendly', '📱 Smart Control']
                        case 'fans':
                          return ['💨 High Speed', '🔇 Silent Operation', '⚡ Energy Saving', '💪 Durable Motor']
                        case 'coolers':
                          return ['❄️ Powerful Cooling', '💧 Large Tank', '🌿 Eco-friendly', '🔇 Low Noise']
                        default:
                          return ['⭐ Premium Quality', '💪 Durable', '⚡ Energy Efficient', '🛡️ Warranty']
                      }
                    }

                    return (
                      <td key={`${product.id}-features`} className="p-4 text-center">
                        <div className="space-y-1">
                          {getFeatures().map((feature, index) => (
                            <div key={index} className="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1 mx-1 inline-block mb-1">
                              {feature}
                            </div>
                          ))}
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Smart Value Analysis */}
                <tr className="border-b hover:bg-indigo-50">
                  <td className="p-4 font-medium text-indigo-900 bg-indigo-50">🎯 Smart Value Score</td>
                  {comparedProducts.map((product) => {
                    // Advanced value calculation
                    const prices = comparedProducts.map(p => p.price)
                    const ratings = comparedProducts.map(p => p.rating)
                    const maxPrice = Math.max(...prices)
                    const minPrice = Math.min(...prices)
                    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length

                    // Normalized scores (0-1)
                    const priceScore = maxPrice === minPrice ? 0.5 :
                      (maxPrice - product.price) / (maxPrice - minPrice) // Lower price = higher score
                    const ratingScore = product.rating / 5 // Rating out of 5
                    const popularityScore = Math.min(product.reviews / 200, 1) // More reviews = more popular
                    const discountScore = product.originalPrice > product.price ?
                      ((product.originalPrice - product.price) / product.originalPrice) : 0

                    // Weighted final score
                    const finalScore = (
                      ratingScore * 0.35 +      // 35% rating quality
                      priceScore * 0.25 +       // 25% price competitiveness
                      popularityScore * 0.2 +   // 20% popularity
                      discountScore * 0.2       // 20% discount value
                    ) * 10

                    const scoreColor = finalScore >= 8 ? 'text-green-600' :
                      finalScore >= 6.5 ? 'text-yellow-600' : 'text-red-600'
                    const badge = finalScore >= 8.5 ? '🏆 Best Value' :
                      finalScore >= 7.5 ? '⭐ Great Choice' :
                        finalScore >= 6 ? '👍 Good Option' : '⚠️ Consider Others'

                    return (
                      <td key={`${product.id}-value`} className="p-4 text-center">
                        <div className="space-y-2">
                          <div className={`text-3xl font-bold ${scoreColor}`}>
                            {finalScore.toFixed(1)}/10
                          </div>
                          <div className="text-xs font-medium text-gray-700">{badge}</div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Quality: {(ratingScore * 10).toFixed(1)}/10</div>
                            <div>Price: {(priceScore * 10).toFixed(1)}/10</div>
                            <div>Popular: {(popularityScore * 10).toFixed(1)}/10</div>
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Detailed Description */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 bg-gray-50">📝 Description</td>
                  {comparedProducts.map((product) => (
                    <td key={`${product.id}-description`} className="p-4 text-center">
                      <div className="text-sm text-gray-600 max-w-[200px] mx-auto leading-relaxed">
                        {product.description}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Recommendation */}
                <tr className="border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50">
                  <td className="p-4 font-medium text-gray-900 bg-gradient-to-r from-blue-50 to-green-50">🎖️ Our Recommendation</td>
                  {comparedProducts.map((product) => {
                    // Calculate recommendation based on multiple factors
                    const isHighRated = product.rating >= 4.3
                    const isGoodValue = product.originalPrice > product.price
                    const isPopular = product.reviews >= 100
                    const isAvailable = product.inStock

                    const getRecommendation = () => {
                      if (!isAvailable) return { text: "⏳ Wait for Restock", color: "text-gray-600", bg: "bg-gray-100" }
                      if (isHighRated && isGoodValue && isPopular) return { text: "🥇 Top Choice!", color: "text-green-700", bg: "bg-green-100" }
                      if (isHighRated && isGoodValue) return { text: "⭐ Excellent Pick", color: "text-blue-700", bg: "bg-blue-100" }
                      if (isHighRated) return { text: "👍 Quality Choice", color: "text-purple-700", bg: "bg-purple-100" }
                      if (isGoodValue) return { text: "💰 Great Deal", color: "text-orange-700", bg: "bg-orange-100" }
                      return { text: "🤔 Consider Options", color: "text-yellow-700", bg: "bg-yellow-100" }
                    }

                    const rec = getRecommendation()

                    return (
                      <td key={`${product.id}-recommendation`} className="p-4 text-center">
                        <div className={`${rec.bg} ${rec.color} px-3 py-2 rounded-lg font-medium text-sm mx-auto max-w-[160px]`}>
                          {rec.text}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
            {comparedProducts.map((product, index) => (
              <div key={product.id} className="flex-1">
                <Button
                  className={`w-full h-12 text-sm font-medium ${index === 0 ? 'bg-green-600 hover:bg-green-700' :
                    index === 1 ? 'bg-blue-600 hover:bg-blue-700' :
                      'bg-purple-600 hover:bg-purple-700'
                    }`}
                  onClick={() => {
                    addToCart(product)
                    setShowComparisonModal(false)
                    toast({
                      title: "Added to Cart!",
                      description: `${product.name} has been added to your cart.`,
                    })
                  }}
                  disabled={!product.inStock}
                >
                  {product.inStock ? (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add {product.name.split(' ')[0]} to Cart
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Out of Stock
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Comparison Tips */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 Comparison Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Smart Value Score</strong> combines price, quality, popularity, and discounts</li>
              <li>• Check <strong>customer ratings</strong> for real user experiences</li>
              <li>• Consider <strong>availability</strong> and delivery times for your needs</li>
              <li>• Look for <strong>features</strong> that matter most for your use case</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Submission Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            {reviewProduct && (
              <p className="text-sm text-gray-600 mt-1">{reviewProduct.name}</p>
            )}
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Rating Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer transition-colors ${i < reviewForm.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-400'
                        }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 self-center">
                  {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <Input
                placeholder="Summarize your experience"
                value={reviewForm.title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                maxLength={100}
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <textarea
                className="w-full min-h-[120px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your thoughts about this product..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reviewForm.comment.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewModal(false)
                  setReviewForm({ rating: 5, title: '', comment: '' })
                }}
                className="flex-1"
                disabled={submittingReview}
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                className="flex-1"
                disabled={submittingReview || !reviewForm.title || !reviewForm.comment}
              >
                {submittingReview ? (
                  <LoadingSpinner size="sm" variant="inline" text="Submitting..." />
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
