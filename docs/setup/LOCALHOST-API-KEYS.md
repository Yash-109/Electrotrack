# Razorpay API Key Generation Guide for Localhost

## 🌐 Website URL Setup for Razorpay Registration

### ❌ Common Issue: "Enter a valid website link"

**Problem:** Razorpay shows "Enter a valid website link" when you try to use `https://localhost:3000`

**Why:** Razorpay doesn't accept localhost URLs as valid business websites

### ✅ Solutions for Development:

#### Option 1: Use Placeholder URL (Recommended)
```
Website URL: https://example.com
```
- This is a standard placeholder that Razorpay accepts
- You can change it later when you have a real domain

#### Option 2: Use Future Domain Name
```
Website URL: https://radhikaelectronics.com
Website URL: https://electrotrack.vercel.app
Website URL: https://mystore.netlify.app
```
- Use a domain you plan to register/deploy to
- Can be updated later in Razorpay dashboard

#### Option 3: Skip During Initial Setup
- Leave website field empty initially
- Add it later from Razorpay dashboard settings
- Focus on getting test keys first

### 🔧 Step-by-Step Fix:

1. **Go to Razorpay Registration**
2. **When asked "Where do you want to accept payments?"**
   - Select: **Website**
3. **For "Add your website link":**
   - Enter: `https://example.com`
   - ✅ This will be accepted
4. **Continue with registration**
5. **Get your test API keys**
6. **Start development on localhost**

### 📝 Important Notes:
- **Test keys work regardless of website URL**
- **Localhost development is not affected**
- **You can update website URL anytime later**
- **This only affects account registration, not functionality**

## 🔑 Step-by-Step Guide to Generate Razorpay API Keys

### 1. Create Razorpay Account

1. **Visit Razorpay Website**
   - Go to [https://razorpay.com/](https://razorpay.com/)
   - Click on "Sign Up" or "Get Started"

2. **Register Your Account**
   ```
   Required Information:
   - Business Name: Your business/project name
   - Email Address: Your email
   - Mobile Number: Your phone number
   - Password: Create a strong password
   ```

3. **Verify Email and Phone**
   - Check your email for verification link
   - Enter OTP received on your phone

### 2. Complete Basic Setup

1. **Login to Dashboard**
   - Go to [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
   - Use your login credentials

2. **Business Information** (Can be filled later for testing)
   ```
   - Business Type: Select appropriate type
   - Business Category: Choose your category
   - Website URL: Use one of these options for development:
     
     Option 1 (Recommended): Use a placeholder URL
     - https://example.com
     - https://radhikaelectronics.com (you can register later)
     - https://electrotrack.vercel.app (if you plan to deploy)
     
     Option 2: Skip this field initially
     - You can add website URL later when you have a live domain
   
   - Business Name: Radhika Electronics (or your business name)
   ```

   **For Development Setup:**
   ```
   ⚠️  IMPORTANT: Razorpay doesn't accept localhost URLs
   
   ✅ Use instead:
   - Website URL: https://example.com (temporary placeholder)
   - Business Name: Radhika Electronics
   - Business Type: E-commerce/Retail
   - Category: Electronics
   
   Note: You can update this later when you have a real domain
   ```

### 3. Generate Test API Keys (For Development)

1. **Navigate to API Keys**
   ```
   Dashboard → Settings → API Keys
   ```

2. **Download Test Keys**
   - You'll see "Test Keys" section
   - Click "Download Test Keys" or "Generate Test Keys"
   - **Important**: These are automatically generated

3. **Copy Your Keys**
   ```
   Test Key ID: rzp_test_xxxxxxxxxxxxxxxxxx
   Test Key Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 4. Configure Your Localhost Environment

1. **Update .env.local file**
   ```bash
   # Replace with your actual test keys
   RAZORPAY_KEY_ID=rzp_test_your_actual_test_key_id
   RAZORPAY_KEY_SECRET=your_actual_test_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_for_testing
   ```

2. **Example .env.local Configuration**
   ```bash
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/electrotrack
   MONGODB_DB=electrotrack
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_key_here
   
   # Razorpay Test Configuration
   RAZORPAY_KEY_ID=rzp_test_1234567890abcdef
   RAZORPAY_KEY_SECRET=abcdef1234567890abcdef1234567890
   RAZORPAY_WEBHOOK_SECRET=webhook_secret_for_testing
   
   # Environment
   NODE_ENV=development
   ```

### 5. Test API Keys Setup

1. **Restart Your Development Server**
   ```bash
   cd d:\git\Electrotrack
   npm run dev
   ```

2. **Verify Integration**
   - Go to payment page on localhost
   - Try making a test payment
   - Use Razorpay test card numbers

## 🧪 Testing with Test Keys

### Test Card Numbers (Always Use These for Testing)

1. **Successful Payment Test Cards**
   ```
   Card Number: 4111 1111 1111 1111
   Expiry: Any future date (e.g., 12/25)
   CVV: Any 3 digits (e.g., 123)
   Name: Any name
   ```

2. **Failed Payment Test Cards**
   ```
   Card Number: 4000 0000 0000 0002
   Expiry: Any future date
   CVV: Any 3 digits
   ```

3. **UPI Testing**
   ```
   Success VPA: success@razorpay
   Failure VPA: failure@razorpay
   ```

4. **Net Banking Testing**
   ```
   - Select any bank in test mode
   - Use "success" as username and password
   ```

## 🔧 Webhook Setup for Localhost (Optional for Testing)

### Your Local Website Details
```
⚠️  Important: For Razorpay Registration Use:
Website URL: https://example.com (placeholder for development)
Alternative: https://radhikaelectronics.com (future domain)

🖥️  Your Actual Development URLs:
Local Development: http://localhost:3000
Alternative Port: http://localhost:3001
Business Name: Radhika Electronics
Application: Electrotrack E-commerce Platform

Note: The localhost URLs are for your development only.
Razorpay requires a valid public domain for registration.
```

### Using ngrok for Local Webhook Testing

1. **Install ngrok**
   ```bash
   # Download from https://ngrok.com/
   # Or install via npm
   npm install -g ngrok
   ```

2. **Expose Localhost**
   ```bash
   ngrok http 3000
   ```

3. **Configure Webhook in Razorpay**
   ```
   Webhook URL: https://your-ngrok-url.ngrok.io/api/payment/webhook
   Events: payment.captured, payment.failed, order.paid
   
   Example:
   - If ngrok gives you: https://abc123.ngrok.io
   - Use webhook URL: https://abc123.ngrok.io/api/payment/webhook
   ```

### Your Application URLs
```
Local Development: http://localhost:3000
Payment Page: http://localhost:3000/payment
Order Success: http://localhost:3000/order-success
Admin Panel: http://localhost:3000/admin
```

## ⚠️ Important Notes for Test Keys

### Test Mode Limitations
- **No Real Money**: Test keys don't process real payments
- **Test Data Only**: All transactions are simulated
- **Limited Features**: Some production features may not work

### Security Best Practices
```bash
# Never expose keys in client-side code
# ❌ Wrong - Don't do this
const razorpayKey = 'rzp_test_1234567890abcdef';

# ✅ Correct - Use environment variables
const razorpayKey = process.env.RAZORPAY_KEY_ID;
```

### Switching to Production Later
1. **Complete KYC Verification**
   - Upload business documents
   - Verify bank account details
   - Complete Razorpay's verification process

2. **Generate Live Keys**
   ```
   Live Key ID: rzp_live_xxxxxxxxxxxxxxxxxx
   Live Key Secret: Different from test keys
   ```

3. **Update Environment**
   ```bash
   # For production
   RAZORPAY_KEY_ID=rzp_live_your_live_key_id
   RAZORPAY_KEY_SECRET=your_live_key_secret
   NODE_ENV=production
   ```

## 🔍 Troubleshooting Common Issues

### 1. "Keys not working"
**Solution:**
- Ensure you're using the correct test keys
- Check if keys are properly set in .env.local
- Restart your development server

### 2. "Razorpay not loading"
**Solution:**
```javascript
// Add this to your page head
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 3. "Environment variables not loading"
**Solution:**
- Check .env.local file is in root directory
- Restart Next.js development server
- Verify no typos in variable names

## 📱 Quick Test Checklist

- [ ] Razorpay account created
- [ ] Test API keys generated
- [ ] Keys added to .env.local
- [ ] Development server restarted
- [ ] Payment page loads
- [ ] Test payment with 4111 1111 1111 1111
- [ ] Payment success page shows
- [ ] Order created in database

## 🆘 Get Help

### Razorpay Support
- **Documentation**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Support**: [https://razorpay.com/support/](https://razorpay.com/support/)
- **Test Integration**: [https://razorpay.com/docs/payments/payments/test-card-upi-details/](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

### Integration Support
- Check browser console for errors
- Verify API responses in Network tab
- Use test card numbers only
- Monitor Razorpay dashboard for test transactions

---

**Remember**: Test keys are for development only. Never use them in production!