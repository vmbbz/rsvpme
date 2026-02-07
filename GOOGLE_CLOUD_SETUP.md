# Google Cloud Console Gmail API Setup Guide

## Overview
Switched from Gmail SMTP to Google Cloud Console Gmail API for more reliable email delivery.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Select "Web application"
4. Fill in:
   - **Name**: Wedding RSVP App
   - **Authorized redirect URIs**: `http://localhost:3001/auth/callback`
5. Click "Create"

## Step 3: Get Credentials

After creating OAuth client, you'll get:
- **Client ID** (copy this)
- **Client Secret** (copy this)

## Step 4: Get Refresh Token

1. Open this URL in browser (replace YOUR_CLIENT_ID):
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3001/auth/callback&response_type=code&scope=https://www.googleapis.com/auth/gmail.send&access_type=offline
```

2. Authorize the application
3. Copy the `code` from redirect URL
4. Exchange code for refresh token using this endpoint:
```
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

code=YOUR_CODE&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&redirect_uri=http://localhost:3001/auth/callback&grant_type=authorization_code
```

## Step 5: Update Environment Variables

Edit your `.env.local` file:

```env
# Google Cloud Console Gmail API Configuration
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REFRESH_TOKEN=your-actual-refresh-token
RSVP_EMAIL=mutsekwatb@gmail.com
```

## Step 6: Deploy to Vercel

Add these same environment variables to your Vercel dashboard:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` 
- `GOOGLE_REFRESH_TOKEN`
- `RSVP_EMAIL`

## Benefits of Gmail API over SMTP

✅ More reliable delivery
✅ Better error handling
✅ No app password issues
✅ Professional API integration
✅ Better logging and debugging

## Testing

After setup:
1. Restart your server: `npm run server`
2. Submit a test RSVP
3. Check console for detailed logging
4. Verify email arrives at `mutsekwatb@gmail.com`

The Gmail API is more robust and should resolve any email delivery issues! 🚀
