# Neon Database Setup - Quick Reference

## ✅ What You Need to Add to Vercel

**Only add this ONE variable:**

### DATABASE_URL
```
postgresql://neondb_owner:npg_BuYjc2XDkw6e@ep-holy-flower-a4mw9y38-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Why this one?**
- ✅ This is the **pooled connection** (recommended for serverless)
- ✅ Prisma uses `DATABASE_URL` by default
- ✅ Connection pooling handles multiple requests efficiently
- ✅ Perfect for Vercel's serverless functions

---

## ❌ What You DON'T Need

You can ignore all the other variables:
- `DATABASE_URL_UNPOOLED` - Only needed for migrations or direct connections
- `PGHOST`, `PGUSER`, etc. - Individual connection parameters (not needed)
- `POSTGRES_URL`, `POSTGRES_*` - For Vercel Postgres templates (not Neon)
- `NEXT_PUBLIC_STACK_*` - For Neon's auth features (not used in this app)

---

## How to Add to Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Enter:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://neondb_owner:npg_BuYjc2XDkw6e@ep-holy-flower-a4mw9y38-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - **Environment:** Select **Production**, **Preview**, and **Development**
4. Click **Save**

---

## Verify It Works

After adding `DATABASE_URL` and deploying:

1. Check Vercel build logs - should see:
   ```
   ✔ Generated Prisma Client
   ✔ Database synchronized
   ```

2. Visit your app and click "Обнови цените"
3. Check if prices are being saved

---

## Security Note

⚠️ **Important:** The connection string contains your database password. 

- ✅ It's safe in Vercel environment variables (encrypted)
- ❌ Never commit it to Git (already in `.gitignore`)
- ✅ Neon automatically sets it if you connected through Vercel Marketplace

If Neon already set `DATABASE_URL` automatically, you might not need to add it manually - check your Environment Variables first!

---

## Troubleshooting

### "Can't reach database server"
- Verify `DATABASE_URL` is set correctly
- Check Neon dashboard - database should be "Active"
- Ensure you're using the **pooled** connection (with `-pooler` in hostname)

### "Database does not exist"
- Database name should be `neondb` (already in your connection string)
- If changed, update the connection string

### Connection timeouts
- Use the pooled connection (you're already using it ✅)
- Add `?connect_timeout=15` if needed (optional)

