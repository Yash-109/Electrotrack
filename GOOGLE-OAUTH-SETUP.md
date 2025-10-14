# Google OAuth Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**:
   - Click "Select a project" → "New Project"
   - Name: "Electrotrack" or any name
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" → Click "Create"
   - Fill required fields:
     - App name: "Electrotrack"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue" through all steps

5. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Electrotrack Web Client"
   - **Authorized redirect URIs** (IMPORTANT):
     ```
     http://localhost:3000/api/auth/callback/google
     http://localhost:3001/api/auth/callback/google
     ```
   - Click "Create"
   - **Copy the Client ID and Client Secret**

### Step 2: Update Environment Variables

Replace these values in your `.env.local` file:

```bash
# Replace with your actual credentials from Google Cloud Console
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here

# Make sure this matches your current port
NEXTAUTH_URL=http://localhost:3001

# This enables the Google button
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

### Step 3: Test the Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Go to login page**: http://localhost:3001/login

3. **You should see**: "Continue with Google" button

4. **Click it**: Should redirect to Google login

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid client_id" error**:
   - Double-check GOOGLE_CLIENT_ID in .env.local
   - Make sure there are no extra spaces

2. **"Redirect URI mismatch" error**:
   - Add your current localhost URL to Google Cloud Console
   - Check if you're using port 3000 or 3001

3. **"Access blocked" error**:
   - Make sure OAuth consent screen is configured
   - Add your test email to test users if needed

4. **Button not showing**:
   - Check NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
   - Restart development server after changing .env.local

### Quick Test Credentials (For Development Only):

If you need to test quickly, you can use these development credentials:
(Note: These are example format - replace with real ones)

```bash
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
```

## ✅ Success Indicators

When working correctly, you should see:
- ✅ Google button visible on login page
- ✅ Clicking redirects to Google login
- ✅ After Google login, redirects back to your app
- ✅ User is logged in and redirected to dashboard

## 🚀 Next Steps

After Google OAuth works:
1. Add production domain to Google Cloud Console
2. Update NEXTAUTH_URL for production
3. Test with different Google accounts
4. Consider adding other social logins (Facebook, Apple, etc.)
