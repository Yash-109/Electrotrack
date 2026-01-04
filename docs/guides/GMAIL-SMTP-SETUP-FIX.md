# Gmail SMTP Setup Guide for Email Verification

## 🚨 Current Error Fix
**Error:** `535-5.7.8 Username and Password not accepted`
**Cause:** Gmail SMTP authentication failure

## 📧 Step-by-Step Gmail SMTP Setup

### Step 1: Use a Real Gmail Account
```
❌ Current: radhika.electronics@gmail.com (may not exist)
✅ Use: your_actual_gmail@gmail.com
```

### Step 2: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" → "2-Step Verification"
3. Follow the setup process
4. **REQUIRED**: 2FA must be enabled to use App Passwords

### Step 3: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (custom name)"
3. Enter name: "Electrotrack Email Service"
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 4: Update .env.local
```bash
# Replace with your actual Gmail
GMAIL_USER=your_actual_gmail@gmail.com
# Use the 16-character App Password (remove spaces)
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### Step 5: Test Configuration
```bash
# Restart your development server
npm run dev
```

## 🔧 Quick Fix Options

### Option A: Use Your Personal Gmail
1. Use your existing Gmail account
2. Enable 2FA and create App Password
3. Update .env.local with your credentials

### Option B: Create New Business Gmail
1. Create: `electrotrack.business@gmail.com`
2. Enable 2FA on the new account
3. Generate App Password
4. Update .env.local

### Option C: Use Test Mode (Development Only)
```bash
# Disable email sending for testing
GMAIL_ENABLED=false
```

## 📝 Updated .env.local Template
```bash
# Gmail SMTP Configuration
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
GMAIL_ENABLED=true

# Example (replace with your actual credentials):
# GMAIL_USER=john.doe@gmail.com
# GMAIL_APP_PASSWORD=abcdefghijklmnop
```

## 🔍 Troubleshooting Checklist

- [ ] Gmail account exists and you can log in to it
- [ ] 2-Factor Authentication is enabled
- [ ] App Password is correctly generated
- [ ] App Password copied without spaces
- [ ] .env.local file is saved and server restarted
- [ ] No typos in email address or password

## 🚀 Next Steps
1. Choose Option A, B, or C above
2. Update your .env.local file
3. Restart the development server
4. Test the signup verification flow

## 💡 Pro Tips
- App Passwords are device/app specific
- Never share your App Password
- You can revoke and regenerate App Passwords anytime
- Use a dedicated business Gmail for production