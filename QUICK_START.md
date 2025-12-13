# Quick Start Guide - Deploy to Vercel

## Step-by-Step Deployment

### 1. Create Database (2 minutes)

1. Go to your Vercel project dashboard
2. Click **Storage** tab
3. Click **Create Database** or **Browse Storage**
4. In Marketplace, find and click **Neon** (green 'N' logo)
5. Click **Continue**
6. Choose database name: `bmssale-db`
7. Select region: **Europe** (closest to Bulgaria)
8. Click **Create**

✅ Neon automatically sets `DATABASE_URL` - no manual configuration needed!

---

### 2. Set Other Environment Variables (1 minute)

Go to **Settings** → **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `OFFICIAL_PRICE_SOURCE_URL` | `https://ibex.bg/sdac-pv-en/` |
| `RESEND_API_KEY` | `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...` (your key) |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` |

**Note:** `DATABASE_URL` is already set by Neon - don't change it!

---

### 3. Deploy (Automatic)

1. Push your code to GitHub (already done ✅)
2. Vercel will automatically:
   - Detect the push
   - Run `prisma generate`
   - Run `prisma db push` (creates tables)
   - Build Next.js app
   - Deploy

3. Wait for deployment to complete (~2-3 minutes)

---

### 4. Verify Everything Works

1. Visit your Vercel URL
2. Click **"Обнови цените"** (Refresh prices)
3. Check if prices load
4. Create a test alert with your email
5. Check Vercel logs for any errors

---

## Troubleshooting

### Database connection error?
- Check `DATABASE_URL` exists in Environment Variables
- Verify Neon database is running (check Neon dashboard)
- Check Vercel build logs for Prisma errors

### Tables not created?
- Check build logs - should see "✔ Database synchronized"
- Manually trigger: Go to deployment → Functions → Run `prisma db push`

### Email not working?
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for email logs
- Test with a simple alert

---

## That's It! 🎉

Your app is now live with:
- ✅ PostgreSQL database (Neon)
- ✅ Automatic price fetching
- ✅ Email notifications (Resend)
- ✅ Cron jobs running daily

