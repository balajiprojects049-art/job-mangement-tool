# 🚀 Deployment Guide for JobFit Pro (USA Client)

## 📌 Phase 1: Preparation (Switching to Cloud Database)
Since you are currently using SQLite, you must switch to PostgreSQL for production.

1. **Delete Migrations Folder**: Delete the `prisma/migrations` folder locally.
2. **Update Schema**: Open `prisma/schema.prisma` and change:
   ```prisma
   datasource db {
     provider = "postgresql" // Changed from sqlite to postgresql
     url      = env("DATABASE_URL") // Will point to cloud DB
   }
   ```
3. **Commit Changes**: Push this change to GitHub.

---

## 📌 Phase 2: Setting up Vercel (Hosting)

**Vercel** is recommended because it is created by Next.js developers and has servers in the USA (perfect for your client).

1. **Create Account**: Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2. **Import Project**:
   - Click **"Add New"** -> **"Project"**.
   - Select your `job-management-tool` repository.
   - Click **Import**.

---

## 📌 Phase 3: Setting up the Database

1. On the Vercel Project import screen (or Storage tab), locate **"Storage"**.
2. Click **"Connect Store"** -> Select **PosterSQL** (Vercel Postgres).
3. Accept the terms and click **Create**.
4. Choose a region: **Washington, D.C. (iad1)** (Best for USA East) or **San Francisco (sfo1)** (Best for USA West).
5. Vercel will automatically add the `DATABASE_URL` and other secrets to your environment variables.

---

## 📌 Phase 4: Environment Variables
You need to add your other secrets to Vercel.

1. Go to **Settings** -> **Environment Variables** in Vercel.
2. Add the following (copy values from your local `.env`):
   - `NEXTAUTH_SECRET`: (Generate a long random string)
   - `NEXTAUTH_URL`: `https://your-project-name.vercel.app` (Vercel will provide the domain)
   - `GEMINI_API_KEY`: Your AI API Key.
   - `ADMIN_PASSWORD`: Using for admin login.

---

## 📌 Phase 5: Final Deployment

1. **Deploy**: Click **"Deploy"**.
2. **Database Push**: Since it's a new database, you might see an error. You need to push the schema.
   - **Option A (Vercel CLI - Recommended):**
     1. Install Vercel CLI: `npm i -g vercel`
     2. Login: `vercel login`
     3. Link project: `vercel link`
     4. Push Schema: `vercel env pull .env.local` then `npx prisma db push`
   - **Option B (Build Command):**
     - Go to Settings -> General.
     - Change Build Command to: `npx prisma generate && npx prisma db push && next build`
     - Redeploy.

3. **Verify**: Open your new Vercel URL.

---

## 💡 Which CLI is best?
You don't need to manually run a CLI to deploy every time. 
**The Best Workflow:**
1. Work locally -> `git push` to GitHub.
2. Vercel detects the push -> **Automatically Deploys**.

If you need to debug or run database commands, use the **Vercel CLI**:
- `vercel logs`: See server logs.
- `vercel env pull`: Download production env vars to local.

---

## ⚠️ Important Note for Client
Since this is a "Job Management Tool" handling resumes (files):
- Your current code stores Profile Pictures as **Base64 strings** in the DB. This is **okay** for small scale (Postgres).
- If they upload thousands of resumes, you might eventually need **AWS S3** or **Vercel Blob** for file storage, but for now, the database approach will work for a start.
