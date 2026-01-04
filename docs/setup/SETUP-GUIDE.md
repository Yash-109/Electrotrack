# Complete Setup Guide for Radhika Electronics E-commerce Platform

## Overview
This is a complete e-commerce platform built with Next.js 15, MongoDB, and Razorpay payment integration.

## ✅ Completed Features
- ✅ MongoDB backend with user authentication
- ✅ User registration and login system
- ✅ Persistent cart tied to user ID (removed default items)
- ✅ Shipping address storage and retrieval
- ✅ Razorpay payment gateway integration
- ✅ React performance optimization (fixed infinite loops)
- ✅ Real-time cart synchronization between components

## 🔧 Required Setup

### 1. MongoDB Database Setup

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and new cluster
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

#### Option B: Local MongoDB
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/your-database-name`

### 2. Environment Variables Setup

Create a `.env.local` file in the root directory with:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here
DATABASE_NAME=radhika_electronics

# Razorpay Configuration (for payment processing)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# Optional: JWT Secret for enhanced security
JWT_SECRET=your_random_jwt_secret_here
```

### 3. Razorpay Payment Gateway Setup

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create an account and complete KYC verification
3. Go to Settings → API Keys
4. Generate Test/Live API keys
5. Copy Key ID and Key Secret to your `.env.local` file

#### Test Mode vs Live Mode
- **Test Mode**: Use test API keys for development
  - Test cards: 4111 1111 1111 1111 (any CVV, future date)
- **Live Mode**: Use live API keys for production (requires business verification)

### 4. Database Collections Structure

The application automatically creates these MongoDB collections:
- `users` - User accounts with authentication
- `carts` - User shopping carts with items
- `orders` - Completed order records
- `products` - Product catalog (you can add manually or via admin)

## 🚀 Running the Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - API Health Check: http://localhost:3000/api/health

## 🧪 Testing the System

### Test User Registration & Login
1. Go to http://localhost:3000/signup
2. Create a test account
3. Login at http://localhost:3000/login

### Test Cart Functionality
1. Login with your test account
2. Go to Dashboard/Products
3. Add items to cart
4. Check cart count in header
5. Visit cart page to verify items

### Test Payment Process
1. Add items to cart
2. Proceed to shipping address
3. Go to payment page
4. Use Razorpay test card: 4111 1111 1111 1111
5. Complete payment flow

### Test Data Persistence
1. Add items to cart
2. Logout and login again
3. Verify cart items and shipping address are remembered

## 🔑 Key Features Explained

### Authentication System
- Secure password hashing with bcryptjs
- Session management via localStorage
- Automatic login state persistence

### Cart Management
- User-specific cart storage in MongoDB
- Real-time cart count updates
- Event-driven synchronization between components

### Payment Integration
- Razorpay order creation
- Payment verification
- Order confirmation system

### Admin Features
- Admin login at `/admin/login`
- Transaction management at `/admin/transactions`
- Analytics dashboard at `/admin/analytics`

## 🛠️ Troubleshooting

### MongoDB Connection Issues
- Verify MONGODB_URI in `.env.local`
- Check network access (whitelist IP in Atlas)
- Ensure database user has read/write permissions

### Razorpay Payment Issues
- Verify API keys in `.env.local`
- Check if using correct test/live mode
- Ensure webhook URLs are configured (for production)

### Cart Not Updating
- Check browser console for errors
- Verify user is logged in
- Clear browser localStorage if needed

### Performance Issues
- React infinite loops have been fixed
- If issues persist, check browser developer tools
- Monitor network tab for excessive API calls

## 📁 Important Files

- `lib/mongodb.ts` - Database connection utility
- `lib/user-auth.ts` - Authentication helper
- `app/api/` - All API endpoints
- `components/header.tsx` - Navigation with cart count
- `app/dashboard/page.tsx` - Product catalog
- `app/cart/page.tsx` - Shopping cart
- `app/payment/page.tsx` - Payment processing

## 🚀 Deployment Considerations

### Environment Variables for Production
- Set secure MongoDB connection string
- Use live Razorpay API keys
- Add proper JWT secret
- Configure CORS for your domain

### Performance Optimizations
- Enable MongoDB connection pooling
- Implement caching for product data
- Optimize images and assets
- Use CDN for static files

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check MongoDB connection and permissions

The system is now fully functional with all requested features implemented!
