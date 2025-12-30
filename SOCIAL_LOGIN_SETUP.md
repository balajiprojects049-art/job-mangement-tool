# Social Login Setup Guide

This guide will help you set up Google and Facebook OAuth for social login.

## 🔵 Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it (e.g., "JobFit Pro") and click "Create"

### Step 2: Enable Google+ API
1. In the sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure consent screen:
   - Choose "External" (for testing)
   - Fill in app name: "JobFit Pro"
   - Add your email
   - Skip optional fields, click "Save and Continue"
4. Back to Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "JobFit Pro Web"
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

### Step 4: Copy Credentials
1. Copy the **Client ID** and **Client Secret**
2. Paste them in `.env` file:
```env
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxx"
```

---

## 🔵 Facebook OAuth Setup

### Step 1: Create Facebook Developer Account
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Log in with your Facebook account
3. Click "My Apps" → "Create App"

### Step 2: Configure App
1. Choose app type: **Consumer**
2. App name: "JobFit Pro"
3. App contact email: Your email
4. Click "Create App"

### Step 3: Add Facebook Login Product
1. In the dashboard, find **Facebook Login**
2. Click "Set Up"
3. Choose platform: **Web**
4. Site URL: `http://localhost:3000`
5. Click "Save" and "Continue"

### Step 4: Configure OAuth Settings
1. In sidebar, go to **Facebook Login** → **Settings**
2. Add to **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/facebook
   ```
3. Click "Save Changes"

### Step 5: Get App Credentials
1. Go to **Settings** → **Basic**
2. Copy **App ID** and **App Secret**
3. Paste them in `.env` file:
```env
FACEBOOK_CLIENT_ID="your-app-id"
FACEBOOK_CLIENT_SECRET="your-app-secret"
```

---

## 🔐 Generate NextAuth Secret

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Or use this Node.js command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste in `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

---

## ✅ Final `.env` File

Your `.env` should look like:
```env
DATABASE_URL="your-database-url"

# NextAuth Configuration
NEXTAUTH_SECRET="generated-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxx"

# Facebook OAuth
FACEBOOK_CLIENT_ID="1234567890"
FACEBOOK_CLIENT_SECRET="xxxxxxxxxxxxxx"
```

---

## 🚀 Testing

1. Restart your dev server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. You should see "Continue with Google" and "Continue with Facebook" buttons
4. Click to test!

---

## ⚠️ Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure redirect URIs match exactly in OAuth console
- Check that URLs include `/api/auth/callback/google` or `/api/auth/callback/facebook`

### Google login not working
- Make sure Google+ API is enabled
- Check OAuth consent screen is configured

### Facebook login not working
- Make sure app is not in "Development" mode restriction
- Add test users if needed in Facebook app settings

---

## 📝 For Production

When deploying to production:

1. **Update NEXTAUTH_URL**:
```env
NEXTAUTH_URL="https://your-production-domain.com"
```

2. **Add production URLs to OAuth consoles**:
   - Google: Add `https://your-domain.com` and `https://your-domain.com/api/auth/callback/google`
   - Facebook: Add `https://your-domain.com/api/auth/callback/facebook`

3. **Make Facebook app live**:
   - Go to App Review
   - Submit for review if needed

---

## 🎉 That's it!

Your social login should now be working! Users can sign up / log in with Google or Facebook.
