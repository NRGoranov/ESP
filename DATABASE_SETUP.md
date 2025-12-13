# Database Setup for Production

This guide explains how to set up PostgreSQL for production on Vercel.

## Step 1: Create PostgreSQL Database

Choose one of these options:

### Option A: Vercel Postgres (Easiest - Recommended)

1. Go to your Vercel project dashboard
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., `bmssale-db`)
6. Select a region (closest to your users)
7. Click **Create**

Vercel will automatically:
- Create the database
- Add `POSTGRES_URL` environment variable
- Set up connection pooling

**Note:** Vercel Postgres uses `POSTGRES_URL` instead of `DATABASE_URL`. You'll need to map it (see Step 3).

---

### Option B: Supabase (Free tier available)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

---

### Option C: Railway (Simple setup)

1. Go to [railway.app](https://railway.app) and sign up
2. Click **New Project** → **Provision PostgreSQL**
3. Click on the PostgreSQL service
4. Go to **Variables** tab
5. Copy the `DATABASE_URL` value

---

### Option D: Neon (Serverless PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string from the dashboard

---

## Step 2: Update Prisma Schema

The schema has already been updated to use PostgreSQL. Verify `prisma/schema.prisma` has:

```prisma
datasource db {
  provider = "postgresql"  // ✅ Should be "postgresql", not "sqlite"
  url      = env("DATABASE_URL")
}
```

---

## Step 3: Set Environment Variable in Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**

2. **If using Vercel Postgres:**
   - Vercel automatically creates `POSTGRES_URL`
   - Add a new variable:
     - **Name:** `DATABASE_URL`
     - **Value:** Copy the value from `POSTGRES_URL` (or use `$POSTGRES_URL` if Vercel supports variable references)
     - **Environment:** Production, Preview, Development

3. **If using other providers:**
   - **Name:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string
   - **Environment:** Production, Preview, Development

**Connection string format:**
```
postgresql://user:password@host:5432/database?sslmode=require
```

---

## Step 4: Deploy and Run Migrations

### Automatic (Recommended)

The build script in `package.json` includes `prisma db push` which will:
1. Generate Prisma Client
2. Push schema to database (create tables)
3. Build Next.js app

Just deploy to Vercel and it will run automatically!

### Manual (If needed)

If you want to run migrations manually:

1. **Via Vercel CLI:**
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

2. **Via Vercel Dashboard:**
   - Go to your deployment
   - Open a shell/terminal
   - Run: `npx prisma db push`

---

## Step 5: Verify Database Setup

1. **Check Vercel logs:**
   - Go to your deployment → **Logs**
   - Look for: `✔ Generated Prisma Client` and `✔ Database synchronized`

2. **Test the app:**
   - Visit your Vercel URL
   - Click "Обнови цените" (Refresh prices)
   - Check if data is being saved

3. **View database (optional):**
   ```bash
   npx prisma studio
   ```
   Or use your database provider's dashboard.

---

## Troubleshooting

### Error: "P1001: Can't reach database server"

- Check your `DATABASE_URL` is correct
- Verify database is running and accessible
- Check firewall/network settings

### Error: "P1003: Database does not exist"

- Verify database name in connection string
- Create the database if it doesn't exist

### Error: "P1017: Server has closed the connection"

- Add `?connection_limit=1` to connection string
- Or use connection pooling (Vercel Postgres handles this automatically)

### Tables not created

- Check build logs for Prisma errors
- Manually run: `npx prisma db push`
- Verify `DATABASE_URL` is set correctly

---

## Migration vs Push

- **`prisma db push`** - Quick sync, good for development/prototyping
- **`prisma migrate`** - Production-ready migrations with history

For this app, `db push` is fine. For production apps with multiple developers, consider using migrations:

```bash
npx prisma migrate dev --name init
```

Then update build script:
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

---

## Quick Checklist

- [ ] Created PostgreSQL database (Vercel/Supabase/Railway/etc.)
- [ ] Updated `prisma/schema.prisma` to use `postgresql`
- [ ] Set `DATABASE_URL` in Vercel environment variables
- [ ] Deployed to Vercel
- [ ] Verified tables are created (check logs or Prisma Studio)
- [ ] Tested price fetching and data storage

---

## Cost Estimates

- **Vercel Postgres:** Free tier (256 MB), then $20/month for 10 GB
- **Supabase:** Free tier (500 MB), then $25/month for 8 GB
- **Railway:** Pay-as-you-go, ~$5-10/month for small apps
- **Neon:** Free tier (3 GB), then $19/month for 10 GB

For this app, the free tiers should be sufficient initially.

