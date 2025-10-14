import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()

    // Create indexes for better performance

    // Users collection indexes
    const users = db.collection('users')
    await (users as any).createIndex({ email: 1 }, { unique: true })
    await (users as any).createIndex({ createdAt: -1 })

    // Products collection indexes
    const products = db.collection('products')
    await (products as any).createIndex({ category: 1 })
    await (products as any).createIndex({ name: 'text', description: 'text', brand: 'text' })
    await (products as any).createIndex({ price: 1 })
    await (products as any).createIndex({ stock: 1 })
    await (products as any).createIndex({ isActive: 1, isFeatured: 1 })
    await (products as any).createIndex({ sku: 1 }, { unique: true, sparse: true })

    // Orders collection indexes
    const orders = db.collection('orders')
    await (orders as any).createIndex({ userEmail: 1 })
    await (orders as any).createIndex({ orderId: 1 }, { unique: true })
    await (orders as any).createIndex({ status: 1 })
    await (orders as any).createIndex({ createdAt: -1 })

    // Carts collection indexes
    const carts = db.collection('carts')
    await (carts as any).createIndex({ userId: 1 }, { unique: true })
    await (carts as any).createIndex({ updatedAt: -1 })

    // Categories collection indexes
    const categories = db.collection('categories')
    await (categories as any).createIndex({ slug: 1 }, { unique: true })
    await (categories as any).createIndex({ parentCategory: 1 })
    await (categories as any).createIndex({ sortOrder: 1 })

    // Reviews collection indexes
    const reviews = db.collection('reviews')
    await (reviews as any).createIndex({ productId: 1 })
    await (reviews as any).createIndex({ userEmail: 1 })
    await (reviews as any).createIndex({ rating: 1 })
    await (reviews as any).createIndex({ createdAt: -1 })
    await (reviews as any).createIndex({ productId: 1, userEmail: 1 }, { unique: true })

    // Inventory collection indexes
    const inventory = db.collection('inventory')
    await inventory.createIndex({ productId: 1 })
    await inventory.createIndex({ createdAt: -1 })

    // Stock alerts collection indexes
    const stockAlerts = db.collection('stock_alerts')
    await stockAlerts.createIndex({ productId: 1 }, { unique: true })

    // Insert sample data if collections are empty

    // Sample categories
    const categoryCount = await categories.countDocuments()
    if (categoryCount === 0) {
      await categories.insertMany([
        {
          name: 'Electronics',
          slug: 'electronics',
          description: 'All electronic items',
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Smartphones',
          slug: 'smartphones',
          description: 'Mobile phones and accessories',
          parentCategory: 'electronics',
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Laptops',
          slug: 'laptops',
          description: 'Laptops and computers',
          parentCategory: 'electronics',
          isActive: true,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Home Appliances',
          slug: 'home-appliances',
          description: 'Home appliances and gadgets',
          isActive: true,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'TVs',
          slug: 'tvs',
          description: 'Televisions and entertainment',
          parentCategory: 'home-appliances',
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Air Conditioners',
          slug: 'air-conditioners',
          description: 'Air conditioners and cooling',
          parentCategory: 'home-appliances',
          isActive: true,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    }

    // Sample products
    const productCount = await products.countDocuments()
    if (productCount === 0) {
      await products.insertMany([
        {
          name: 'iPhone 15 Pro',
          description: 'Latest iPhone with advanced features',
          price: 119999,
          originalPrice: 129999,
          category: 'smartphones',
          brand: 'Apple',
          sku: 'IPH15PRO001',
          stock: 25,
          images: ['/placeholder.jpg'],
          specifications: {
            'Screen Size': '6.1 inches',
            'Storage': '128GB',
            'RAM': '8GB',
            'Camera': '48MP'
          },
          features: ['Face ID', 'Wireless Charging', 'Water Resistant'],
          isActive: true,
          isFeatured: true,
          salesCount: 0,
          viewCount: 0,
          minStock: 5,
          maxStock: 100,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Samsung Galaxy S24',
          description: 'Premium Samsung smartphone',
          price: 89999,
          originalPrice: 99999,
          category: 'smartphones',
          brand: 'Samsung',
          sku: 'SAM24001',
          stock: 30,
          images: ['/placeholder.jpg'],
          specifications: {
            'Screen Size': '6.2 inches',
            'Storage': '256GB',
            'RAM': '8GB',
            'Camera': '50MP'
          },
          features: ['Fingerprint Scanner', 'Fast Charging', 'AMOLED Display'],
          isActive: true,
          isFeatured: true,
          salesCount: 0,
          viewCount: 0,
          minStock: 5,
          maxStock: 100,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'MacBook Air M3',
          description: 'Latest MacBook Air with M3 chip',
          price: 134999,
          originalPrice: 144999,
          category: 'laptops',
          brand: 'Apple',
          sku: 'MBA13M3001',
          stock: 15,
          images: ['/placeholder.jpg'],
          specifications: {
            'Screen Size': '13.6 inches',
            'Storage': '512GB SSD',
            'RAM': '16GB',
            'Processor': 'Apple M3'
          },
          features: ['Touch ID', 'Retina Display', 'All-day battery'],
          isActive: true,
          isFeatured: true,
          salesCount: 0,
          viewCount: 0,
          minStock: 3,
          maxStock: 50,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Samsung 65" QLED TV',
          description: '4K QLED Smart TV with premium features',
          price: 89999,
          originalPrice: 99999,
          category: 'tvs',
          brand: 'Samsung',
          sku: 'SAM65QLED001',
          stock: 8,
          images: ['/placeholder.jpg'],
          specifications: {
            'Screen Size': '65 inches',
            'Resolution': '4K Ultra HD',
            'Display': 'QLED',
            'Smart TV': 'Yes'
          },
          features: ['HDR10+', 'Voice Control', 'Gaming Mode'],
          isActive: true,
          isFeatured: false,
          salesCount: 0,
          viewCount: 0,
          minStock: 2,
          maxStock: 20,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'LG 1.5 Ton Inverter AC',
          description: 'Energy efficient split air conditioner',
          price: 45999,
          originalPrice: 52999,
          category: 'air-conditioners',
          brand: 'LG',
          sku: 'LG15INV001',
          stock: 12,
          images: ['/placeholder.jpg'],
          specifications: {
            'Capacity': '1.5 Ton',
            'Type': 'Inverter',
            'Energy Rating': '5 Star',
            'Cooling': 'Dual Cool'
          },
          features: ['Copper Condenser', 'Wi-Fi Control', 'Virus Protection'],
          isActive: true,
          isFeatured: false,
          salesCount: 0,
          viewCount: 0,
          minStock: 3,
          maxStock: 30,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      collections: [
        'users',
        'products',
        'orders',
        'carts',
        'categories',
        'reviews',
        'inventory',
        'stock_alerts'
      ],
      sampleDataCreated: categoryCount === 0 && productCount === 0
    })

  } catch (error: any) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      error: 'Database setup failed',
      details: error.message
    }, { status: 500 })
  }
}
