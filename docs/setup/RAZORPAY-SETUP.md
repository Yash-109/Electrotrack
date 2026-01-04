# Razorpay Payment Integration Guide

## 🎯 Overview

This guide provides complete setup instructions for the Razorpay payment system implemented in the Electrotrack application. The integration supports multiple payment methods including Credit/Debit Cards, UPI, Net Banking, and Digital Wallets.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Razorpay Account Setup](#razorpay-account-setup)
3. [Environment Configuration](#environment-configuration)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- Node.js 18+ 
- Next.js 15+
- MongoDB database
- SSL certificate (for production)

### Dependencies Already Installed
```json
{
  "razorpay": "^2.9.6",
  "mongodb": "^6.8.0",
  "next": "15.2.4"
}
```

## 🏦 Razorpay Account Setup

### 1. Create Razorpay Account
1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a new account or login
3. Complete KYC verification for live transactions

### 2. Get API Keys
1. Navigate to **Settings** → **API Keys**
2. Generate **Test Keys** for development
3. Note down:
   - `Key ID` (starts with `rzp_test_` for test mode)
   - `Key Secret`

### 3. Configure Webhooks (Important for Production)
1. Go to **Settings** → **Webhooks**
2. Create new webhook with URL: `https://yourdomain.com/api/payment/webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed` 
   - `order.paid`
   - `payment.authorized`
4. Copy the **Webhook Secret**

## ⚙️ Environment Configuration

Create or update `.env.local` file in your project root:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/electrotrack
MONGODB_DB=electrotrack

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Razorpay Configuration
# Test Keys (for development)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Production Keys (uncomment for production)
# RAZORPAY_KEY_ID=rzp_live_your_live_key_id
# RAZORPAY_KEY_SECRET=your_live_key_secret
# RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret

# Environment
NODE_ENV=development
```

### 🔑 Key Security Notes
- **Never commit API keys** to version control
- Use different keys for test and production
- Restrict API key permissions in Razorpay dashboard
- Enable IP restrictions for production keys

## 🔌 API Endpoints

### 1. Payment Order Creation
**Endpoint:** `POST /api/payment/razorpay`

**Request Body:**
```json
{
  "amount": 2999,
  "currency": "INR", 
  "userId": "user@example.com",
  "preferredMethod": "card",
  "customerInfo": {
    "name": "John Doe",
    "email": "user@example.com",
    "contact": "9876543210"
  },
  "orderDetails": {
    "items": [...],
    "subtotal": 2500,
    "tax": 450,
    "shipping": 49,
    "total": 2999
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_xyz123",
  "amount": 299900,
  "currency": "INR",
  "key": "rzp_test_...",
  "supportedMethods": {
    "card": ["visa", "mastercard", "amex", "rupay"],
    "netbanking": ["hdfc", "icici", "axis", "sbi"],
    "upi": ["upi"],
    "wallet": ["paytm", "phonepe", "googlepay"]
  }
}
```

### 2. Payment Verification
**Endpoint:** `PUT /api/payment/razorpay`

**Request Body:**
```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456", 
  "razorpay_signature": "signature_hash",
  "userId": "user@example.com"
}
```

### 3. Webhook Handler
**Endpoint:** `POST /api/payment/webhook`

Automatically handles payment status updates from Razorpay.

### 4. Order Details
**Endpoint:** `GET /api/orders/[orderId]`

Returns order details for order confirmation page.

## 🎨 Frontend Integration

### Payment Page Features

1. **Multiple Payment Methods**
   - Credit/Debit Cards
   - UPI (Google Pay, PhonePe, etc.)
   - Net Banking (All major banks)
   - Digital Wallets

2. **Enhanced User Experience**
   - Real-time payment processing
   - Error handling and user feedback
   - Secure payment indicators
   - Mobile-responsive design

### Key Components

#### Payment Processing Function
```javascript
const processRazorpayPayment = async () => {
  // Create order
  const response = await fetch('/api/payment/razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  // Initialize Razorpay
  const options = {
    key: data.key,
    amount: data.amount,
    currency: data.currency,
    name: 'Radhika Electronics',
    order_id: data.orderId,
    handler: function (response) {
      // Verify payment
      verifyPayment(response);
    }
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

## 🧪 Testing

### Test Mode Setup
1. Use test API keys in development
2. Razorpay provides test card numbers:

```
Success Test Cards:
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

UPI Test:
- VPA: success@razorpay
- VPA: failure@razorpay

Net Banking:
- Select any bank in test mode
- Use test credentials provided
```

### Test Payment Flow
1. Add items to cart
2. Proceed to checkout
3. Select payment method
4. Use test credentials
5. Verify order creation
6. Check webhook events (if configured)

### Testing Checklist
- [ ] Order creation works
- [ ] Payment processing completes
- [ ] Payment verification succeeds
- [ ] Order details are saved
- [ ] Cart is cleared after payment
- [ ] Order confirmation page displays
- [ ] Webhook events are received

## 🚀 Production Deployment

### 1. Switch to Live Mode
```bash
# Update .env.local with live keys
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
NODE_ENV=production
```

### 2. SSL Certificate
- Razorpay requires HTTPS for live transactions
- Configure SSL certificate on your server
- Update webhook URL to use HTTPS

### 3. Webhook Configuration
```bash
# Webhook URL for production
https://yourdomain.com/api/payment/webhook
```

### 4. Security Best Practices
- Enable IP restrictions for API keys
- Set up proper CORS policies
- Implement rate limiting
- Monitor transaction logs
- Set up alerts for failed payments

## 🔍 Monitoring & Analytics

### 1. Razorpay Dashboard
- Track payment success rates
- Monitor transaction volumes
- View settlement reports
- Analyze payment method preferences

### 2. Application Monitoring
```javascript
// Log payment events
console.log('Payment initiated:', orderId);
console.log('Payment completed:', paymentId);
console.log('Payment failed:', error);
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Payment gateway not configured"
**Solution:** Check if Razorpay keys are properly set in `.env.local`

#### 2. "Invalid payment signature" 
**Solution:** Verify webhook secret and signature generation logic

#### 3. "Order not found"
**Solution:** Check MongoDB connection and temporary order creation

#### 4. Payment succeeds but order not created
**Solution:** 
- Check webhook configuration
- Verify payment verification endpoint
- Check database permissions

### Debug Mode
```javascript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('Payment debug:', paymentData);
}
```

### Support Contacts
- **Razorpay Support:** [support.razorpay.com](https://support.razorpay.com)
- **Integration Issues:** Check Razorpay documentation
- **Webhook Testing:** Use ngrok for local testing

## 📚 Additional Resources

### Documentation
- [Razorpay API Documentation](https://razorpay.com/docs/)
- [Webhook Documentation](https://razorpay.com/docs/webhooks/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

### Integration Examples
- [Node.js Examples](https://razorpay.com/docs/server-integration/nodejs/)
- [Frontend Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/)

## 🔄 Migration Notes

### From COD to Razorpay
If migrating from Cash on Delivery:
1. Keep COD option available
2. Gradually promote online payments
3. Monitor payment success rates
4. Provide customer support for payment issues

### Database Schema Updates
```javascript
// Enhanced order schema
{
  orderId: "ORD1234567890",
  paymentId: "pay_abc123",
  paymentMethod: "card|upi|netbanking|wallet",
  paymentStatus: "completed|pending|failed",
  orderStatus: "processing|confirmed|shipped|delivered"
}
```

---

## ✅ Implementation Status

- [x] Razorpay SDK Integration
- [x] Payment API Endpoints
- [x] Frontend Payment UI
- [x] Order Management System
- [x] Webhook Integration
- [x] Error Handling
- [x] Order Success Page
- [x] Security Implementation

**Last Updated:** September 17, 2025

---

*For technical support or questions about this implementation, please refer to the troubleshooting section or contact the development team.*