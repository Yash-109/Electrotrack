# Google OAuth Setup Instructions

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - **IMPORTANT**: In "Authorized JavaScript origins" add:
     - `http://localhost:3000` (for development - NO trailing slash)
     - `https://yourdomain.com` (for production - NO trailing slash)
   - **IMPORTANT**: In "Authorized redirect URIs" add:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Copy the Client ID and Client Secret

## Common Error Fixes

### "Invalid origin: URIs must not contain a path or end with '/'"
This error means you have incorrect URIs in your Google OAuth configuration:

**❌ WRONG (will cause error):**
- `http://localhost:3000/` (has trailing slash)
- `http://localhost:3000/login` (has path)

**✅ CORRECT:**
- `http://localhost:3000` (no trailing slash, no path)

**Steps to fix:**
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Click on your OAuth 2.0 Client ID
3. In "Authorized JavaScript origins":
   - Remove any URIs with trailing slashes or paths
   - Add `http://localhost:3000` exactly (no trailing slash)
4. Save the changes

## Step 2: Update Environment Variables

Update your `.env.local` file with the actual Google OAuth credentials:

```bash
# Google OAuth (Replace with your actual credentials)
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here

# NextAuth Secret (Generate a random secret)
NEXTAUTH_SECRET=your_nextauth_secret_here
```

To generate a secure NEXTAUTH_SECRET, you can run:
```bash
openssl rand -base64 32
```

## Step 3: Test the Implementation

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Click on the "Continue with Google" button
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your dashboard

## Features Implemented

✅ Google OAuth integration with NextAuth.js
✅ Seamless integration with existing user authentication system
✅ User session stored in localStorage (compatible with existing system)
✅ Google user profile data (name, email, picture) stored
✅ Error handling for failed authentication
✅ Loading states and user feedback
✅ Automatic redirect to dashboard after successful login

## Next Steps

- Update logout functionality to handle Google sign-out
- Add user profile display with Google profile picture
- Implement user management for Google-authenticated users
- Add admin panel features for managing Google OAuth users