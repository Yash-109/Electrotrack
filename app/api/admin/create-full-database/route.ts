import { NextRequest, NextResponse } from 'next/server'
import { getDb, getMongoClient } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()

    // Clear existing collections (except users and carts)
    const collectionsToKeep = ['users', 'carts']
    const existingCollections = await (db as any).listCollections({}).toArray()

    for (const collection of existingCollections) {
      if (!collectionsToKeep.includes(collection.name)) {
        await db.collection(collection.name).deleteMany({})
      }
    }

    // 1. PRODUCTS Collection - Electronics inventory
    const products = [
      {
        name: "Samsung Galaxy S24 Ultra",
        category: "smartphones",
        brand: "Samsung",
        price: 89999,
        originalPrice: 99999,
        discount: 10,
        description: "Latest flagship smartphone with S Pen and AI features",
        images: ["/placeholder.jpg"],
        specifications: {
          display: "6.8 inch Dynamic AMOLED",
          processor: "Snapdragon 8 Gen 3",
          ram: "12GB",
          storage: "256GB",
          camera: "200MP + 50MP + 12MP + 10MP",
          battery: "5000mAh"
        },
        stock: 25,
        rating: 4.7,
        reviews: 156,
        featured: true,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date()
      },
      {
        name: "iPhone 15 Pro Max",
        category: "smartphones",
        brand: "Apple",
        price: 134900,
        originalPrice: 134900,
        discount: 0,
        description: "Pro camera system, Action button, Strong and light titanium design",
        images: ["/placeholder.jpg"],
        specifications: {
          display: "6.7 inch Super Retina XDR",
          processor: "A17 Pro chip",
          ram: "8GB",
          storage: "256GB",
          camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
          battery: "4441mAh"
        },
        stock: 18,
        rating: 4.8,
        reviews: 203,
        featured: true,
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date()
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        category: "headphones",
        brand: "Sony",
        price: 24990,
        originalPrice: 29990,
        discount: 17,
        description: "Industry-leading noise canceling with Dual Noise Sensor technology",
        images: ["/placeholder.jpg"],
        specifications: {
          type: "Over-ear wireless",
          noiseCancellation: "Yes",
          batteryLife: "30 hours",
          connectivity: "Bluetooth 5.2, NFC",
          weight: "250g"
        },
        stock: 42,
        rating: 4.6,
        reviews: 89,
        featured: false,
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date()
      },
      {
        name: "MacBook Air M3",
        category: "laptops",
        brand: "Apple",
        price: 114900,
        originalPrice: 114900,
        discount: 0,
        description: "Supercharged by the next-generation M3 chip",
        images: ["/placeholder.jpg"],
        specifications: {
          processor: "Apple M3 chip",
          ram: "8GB",
          storage: "256GB SSD",
          display: "13.6 inch Liquid Retina",
          battery: "Up to 18 hours",
          weight: "1.24 kg"
        },
        stock: 12,
        rating: 4.9,
        reviews: 67,
        featured: true,
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date()
      },
      {
        name: "Samsung 55 4K Smart TV",
        category: "televisions",
        brand: "Samsung",
        price: 45999,
        originalPrice: 54999,
        discount: 16,
        description: "Crystal 4K UHD Smart TV with Tizen OS",
        images: ["/placeholder.jpg"],
        specifications: {
          screenSize: "55 inches",
          resolution: "3840 x 2160 (4K UHD)",
          smartTV: "Yes, Tizen OS",
          hdr: "HDR10+",
          connectivity: "3 HDMI, 2 USB, Wi-Fi, Bluetooth"
        },
        stock: 8,
        rating: 4.4,
        reviews: 45,
        featured: false,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date()
      },
      {
        name: "iPad Pro 12.9-inch M2",
        category: "tablets",
        brand: "Apple",
        price: 104900,
        originalPrice: 109900,
        discount: 5,
        description: "iPad Pro with the astonishing performance of the M2 chip",
        images: ["/placeholder.jpg"],
        specifications: {
          display: "12.9 inch Liquid Retina XDR",
          processor: "Apple M2 chip",
          storage: "128GB",
          camera: "12MP Wide + 10MP Ultra Wide",
          connectivity: "Wi-Fi 6E, Bluetooth 5.3"
        },
        stock: 15,
        rating: 4.7,
        reviews: 112,
        featured: true,
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date()
      }
    ]

    await db.collection('products').insertMany(products as any)

    // 2. ORDERS Collection - Customer orders
    const orders = [
      {
        _id: "order_1",
        orderNumber: "ORD-2024-001",
        customerId: "user_123",
        customerEmail: "john.doe@email.com",
        customerName: "John Doe",
        items: [
          {
            productId: "prod_1",
            productName: "Samsung Galaxy S24 Ultra",
            quantity: 1,
            price: 89999,
            total: 89999
          }
        ],
        totalAmount: 89999,
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "card",
        shippingAddress: {
          street: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India"
        },
        orderDate: new Date("2024-07-15"),
        deliveredDate: new Date("2024-07-18"),
        createdAt: new Date("2024-07-15"),
        updatedAt: new Date("2024-07-18")
      },
      {
        _id: "order_2",
        orderNumber: "ORD-2024-002",
        customerId: "user_456",
        customerEmail: "sarah.smith@email.com",
        customerName: "Sarah Smith",
        items: [
          {
            productId: "prod_3",
            productName: "Sony WH-1000XM5 Headphones",
            quantity: 1,
            price: 24990,
            total: 24990
          },
          {
            productId: "prod_6",
            productName: "iPad Pro 12.9-inch M2",
            quantity: 1,
            price: 104900,
            total: 104900
          }
        ],
        totalAmount: 129890,
        status: "shipped",
        paymentStatus: "paid",
        paymentMethod: "upi",
        shippingAddress: {
          street: "456 Oak Avenue",
          city: "Delhi",
          state: "Delhi",
          zipCode: "110001",
          country: "India"
        },
        orderDate: new Date("2024-07-20"),
        shippedDate: new Date("2024-07-21"),
        createdAt: new Date("2024-07-20"),
        updatedAt: new Date("2024-07-21")
      },
      {
        _id: "order_3",
        orderNumber: "ORD-2024-003",
        customerId: "user_789",
        customerEmail: "mike.johnson@email.com",
        customerName: "Mike Johnson",
        items: [
          {
            productId: "prod_4",
            productName: "MacBook Air M3",
            quantity: 1,
            price: 114900,
            total: 114900
          }
        ],
        totalAmount: 114900,
        status: "processing",
        paymentStatus: "paid",
        paymentMethod: "card",
        shippingAddress: {
          street: "789 Pine Road",
          city: "Bangalore",
          state: "Karnataka",
          zipCode: "560001",
          country: "India"
        },
        orderDate: new Date("2024-08-05"),
        createdAt: new Date("2024-08-05"),
        updatedAt: new Date("2024-08-05")
      },
      {
        _id: "order_4",
        orderNumber: "ORD-2024-004",
        customerId: "user_101",
        customerEmail: "priya.patel@email.com",
        customerName: "Priya Patel",
        items: [
          {
            productId: "prod_2",
            productName: "iPhone 15 Pro Max",
            quantity: 1,
            price: 134900,
            total: 134900
          }
        ],
        totalAmount: 134900,
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "card",
        shippingAddress: {
          street: "321 Garden Street",
          city: "Pune",
          state: "Maharashtra",
          zipCode: "411001",
          country: "India"
        },
        orderDate: new Date("2024-07-25"),
        deliveredDate: new Date("2024-07-28"),
        createdAt: new Date("2024-07-25"),
        updatedAt: new Date("2024-07-28")
      },
      {
        _id: "order_5",
        orderNumber: "ORD-2024-005",
        customerId: "user_202",
        customerEmail: "raj.kumar@email.com",
        customerName: "Raj Kumar",
        items: [
          {
            productId: "prod_5",
            productName: "Samsung 55 4K Smart TV",
            quantity: 1,
            price: 45999,
            total: 45999
          }
        ],
        totalAmount: 45999,
        status: "cancelled",
        paymentStatus: "refunded",
        paymentMethod: "upi",
        shippingAddress: {
          street: "654 Market Lane",
          city: "Chennai",
          state: "Tamil Nadu",
          zipCode: "600001",
          country: "India"
        },
        orderDate: new Date("2024-08-01"),
        cancelledDate: new Date("2024-08-02"),
        createdAt: new Date("2024-08-01"),
        updatedAt: new Date("2024-08-02")
      }
    ]

    await db.collection('orders').insertMany(orders as any)

    // 3. EXPENSES Collection - Business expenses
    const expenses = [
      {
        category: "inventory",
        description: "Product restocking - Samsung phones",
        amount: 2500000,
        date: new Date("2024-07-01"),
        vendor: "Samsung Electronics",
        invoiceNumber: "INV-SAM-001",
        createdAt: new Date("2024-07-01"),
        updatedAt: new Date("2024-07-01")
      },
      {
        category: "marketing",
        description: "Google Ads campaign - July",
        amount: 75000,
        date: new Date("2024-07-05"),
        vendor: "Google Ads",
        invoiceNumber: "GOOGLE-ADS-JUL",
        createdAt: new Date("2024-07-05"),
        updatedAt: new Date("2024-07-05")
      },
      {
        category: "shipping",
        description: "Courier charges - July deliveries",
        amount: 45000,
        date: new Date("2024-07-31"),
        vendor: "BlueDart Express",
        invoiceNumber: "BD-JUL-2024",
        createdAt: new Date("2024-07-31"),
        updatedAt: new Date("2024-07-31")
      },
      {
        category: "rent",
        description: "Office rent - August 2024",
        amount: 85000,
        date: new Date("2024-08-01"),
        vendor: "Property Management Co.",
        invoiceNumber: "RENT-AUG-2024",
        createdAt: new Date("2024-08-01"),
        updatedAt: new Date("2024-08-01")
      },
      {
        category: "utilities",
        description: "Electricity bill - July 2024",
        amount: 12500,
        date: new Date("2024-08-05"),
        vendor: "State Electricity Board",
        invoiceNumber: "EB-JUL-2024",
        createdAt: new Date("2024-08-05"),
        updatedAt: new Date("2024-08-05")
      },
      {
        category: "inventory",
        description: "Apple products restocking",
        amount: 1800000,
        date: new Date("2024-07-15"),
        vendor: "Apple India",
        invoiceNumber: "APPLE-INV-002",
        createdAt: new Date("2024-07-15"),
        updatedAt: new Date("2024-07-15")
      }
    ]

    await db.collection('expenses').insertMany(expenses as any)

    // 4. CATEGORIES Collection - Product categories
    const categories = [
      {
        _id: "cat_1",
        name: "smartphones",
        displayName: "Smartphones",
        description: "Latest smartphones from top brands",
        image: "/placeholder.jpg",
        featured: true,
        sortOrder: 1,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date()
      },
      {
        _id: "cat_2",
        name: "laptops",
        displayName: "Laptops",
        description: "High-performance laptops for work and gaming",
        image: "/placeholder.jpg",
        featured: true,
        sortOrder: 2,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date()
      },
      {
        _id: "cat_3",
        name: "headphones",
        displayName: "Headphones",
        description: "Premium audio devices and accessories",
        image: "/placeholder.jpg",
        featured: false,
        sortOrder: 3,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date()
      },
      {
        _id: "cat_4",
        name: "televisions",
        displayName: "Televisions",
        description: "Smart TVs and entertainment systems",
        image: "/placeholder.jpg",
        featured: true,
        sortOrder: 4,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date()
      },
      {
        _id: "cat_5",
        name: "tablets",
        displayName: "Tablets",
        description: "Tablets for productivity and entertainment",
        image: "/placeholder.jpg",
        featured: false,
        sortOrder: 5,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date()
      }
    ]

    await db.collection('categories').insertMany(categories as any)

    // 5. REVIEWS Collection - Product reviews
    const reviews = [
      {
        _id: "rev_1",
        productId: "prod_1",
        customerId: "user_123",
        customerName: "John Doe",
        rating: 5,
        title: "Excellent flagship phone!",
        comment: "The camera quality is outstanding and the S Pen is very useful for productivity.",
        verified: true,
        helpful: 12,
        createdAt: new Date("2024-07-20"),
        updatedAt: new Date("2024-07-20")
      },
      {
        _id: "rev_2",
        productId: "prod_2",
        customerId: "user_456",
        customerName: "Sarah Smith",
        rating: 5,
        title: "Best iPhone yet!",
        comment: "The titanium design feels premium and the camera is incredible for photography.",
        verified: true,
        helpful: 8,
        createdAt: new Date("2024-07-30"),
        updatedAt: new Date("2024-07-30")
      },
      {
        _id: "rev_3",
        productId: "prod_3",
        customerId: "user_789",
        customerName: "Mike Johnson",
        rating: 4,
        title: "Great noise cancellation",
        comment: "Perfect for travel and work. Battery life is excellent.",
        verified: true,
        helpful: 5,
        createdAt: new Date("2024-08-02"),
        updatedAt: new Date("2024-08-02")
      }
    ]

    await db.collection('reviews').insertMany(reviews as any)

    // 6. WISHLIST Collection - User wishlists
    const wishlists = [
      {
        _id: "wish_1",
        customerId: "user_123",
        products: [
          {
            productId: "prod_4",
            addedAt: new Date("2024-08-01")
          },
          {
            productId: "prod_6",
            addedAt: new Date("2024-08-03")
          }
        ],
        createdAt: new Date("2024-08-01"),
        updatedAt: new Date("2024-08-03")
      }
    ]

    await db.collection('wishlists').insertMany(wishlists as any)

    // 7. INVENTORY Collection - Stock management
    const inventory = [
      {
        _id: "inv_1",
        productId: "prod_1",
        currentStock: 25,
        reservedStock: 2,
        availableStock: 23,
        reorderLevel: 5,
        maxStock: 50,
        lastRestocked: new Date("2024-07-01"),
        supplier: "Samsung Electronics",
        costPrice: 75000,
        updatedAt: new Date()
      },
      {
        _id: "inv_2",
        productId: "prod_2",
        currentStock: 18,
        reservedStock: 1,
        availableStock: 17,
        reorderLevel: 3,
        maxStock: 30,
        lastRestocked: new Date("2024-07-15"),
        supplier: "Apple India",
        costPrice: 120000,
        updatedAt: new Date()
      }
    ]

    await db.collection('inventory').insertMany(inventory as any)

    // 8. PAYMENT_LOGS Collection - Payment tracking
    const paymentLogs = [
      {
        _id: "pay_1",
        orderId: "order_1",
        transactionId: "razorpay_ABC123",
        amount: 89999,
        currency: "INR",
        status: "captured",
        gateway: "razorpay",
        method: "card",
        createdAt: new Date("2024-07-15"),
        updatedAt: new Date("2024-07-15")
      },
      {
        _id: "pay_2",
        orderId: "order_2",
        transactionId: "razorpay_XYZ456",
        amount: 129890,
        currency: "INR",
        status: "captured",
        gateway: "razorpay",
        method: "upi",
        createdAt: new Date("2024-07-20"),
        updatedAt: new Date("2024-07-20")
      }
    ]

    await db.collection('payment_logs').insertMany(paymentLogs as any)

    // Get collection counts
    const collectionsList = await (db as any).listCollections({}).toArray()
    const counts: Record<string, number> = {}

    for (const collection of collectionsList) {
      counts[collection.name] = await db.collection(collection.name).countDocuments()
    }

    return NextResponse.json({
      success: true,
      message: "All required collections created successfully!",
      collectionsCreated: {
        products: products.length,
        orders: orders.length,
        expenses: expenses.length,
        categories: categories.length,
        reviews: reviews.length,
        wishlists: wishlists.length,
        inventory: inventory.length,
        payment_logs: paymentLogs.length
      },
      totalCollections: collectionsList.length,
      allCollections: counts,
      summary: {
        totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0),
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        totalProducts: products.length,
        totalOrders: orders.length
      }
    })

  } catch (error) {
    console.error('Error creating database collections:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create database collections',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
