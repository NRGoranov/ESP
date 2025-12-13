# Vercel Environment Variables

Copy and paste these into your Vercel project settings.

## Required Variables

### 1. DATABASE_URL
**Value:** Your PostgreSQL connection string
**Example:**
```
postgresql://user:password@host:5432/database?sslmode=require
```

**How to get it:**
- **Vercel Postgres:** Go to Vercel Dashboard → Storage → Create Database → Copy connection string
- **Supabase:** Project Settings → Database → Connection String (URI)
- **Railway:** Database → Connect → Copy PostgreSQL URL
- **Other:** Your PostgreSQL provider's connection string

**Note:** For production, you MUST use PostgreSQL. SQLite won't work on Vercel.

---

### 2. OFFICIAL_PRICE_SOURCE_URL
**Value:**
```
https://ibex.bg/sdac-pv-en/
```

**Description:** The IBEX website URL for fetching Bulgarian electricity prices.

---

### 3. RESEND_API_KEY
**Value:**
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZjlkZGYzOWI3NDA1NGQ1NzU5N2UxMDQ2YTdhZTY3OGQ1ODg4ZmQ2Mjg5ZDM3NmE1NGUzYzQ2M2JkZmIyMzdiY2Q2NmY3OGQwNjBkYmQ2NzUiLCJpYXQiOjE3NjU2NDYzNzAuMzg2NjI2LCJuYmYiOjE3NjU2NDYzNzAuMzg2NjI5LCJleHAiOjQ5MjEzMTk5NzAuMzgxOTMzLCJzdWIiOiIxOTk4NDk3Iiwic2NvcGVzIjpbXX0.KcntIL9sU9QTsnKEHUZVEYtW0z4JJxkxTtYx-E-2DhyzJpK8u4M7u1eJcRhJNyIlapABzzPjKgftn5_f6_R0Bzsgb206ZOM1r8CdUiSUF_Ma1P1XM2_hBTimkLvnnKwvm0_jlWKAmgWW_l9Towp5ujh_Sob6cE6ZXN3WBYsIOvCRhyvpsWFDn4Im4YibWe0LxM7AXlRoO0Nm0KZytStqnD7pMhidJYU8vTWsNndGXWHLXUmPdl5Zq6lIy4s6BtNo6zI_T5QJp7IS89RhDn0kdd6DvZPVjG5a7hunhb_CWoLAuviOBlrrH5m018M4b66sUheSS4sju5lQSPRujkmsw_bswBp2IfM8BOgLl3TEXncycAabbsO8kdXVYY-X-OW6nCjbsYi-ijV5vNcqDiAzoeW4fdT8WSBcsAEE4gaHJtd8uelTbT8lmj8Ft25P9_havzwAjX3-OLlAURdw65eNInvshcBeHqlRVgZzIIOFY2qAQBWEAG7y_JK6OMcsh9I1gp7b1_wDZ7kdK0CM3AnRzjm_Ujim5Db77HFnIL0nH2uuq5gfew03fJsbvzGq2ykF4JR7zvJ_13IFva_1sn60b5vicHZHf3Wsqjbz0GwtzCNC-nS727L1bk9kyaS05GMU3cFM4aONPK6FaXfLzsADCnX4m9GRPmPKn2jPuZfwjqo
```

**Description:** Your Resend API key for sending email notifications.

---

## Optional Variables

### 4. RESEND_FROM_EMAIL (Optional)
**Value:**
```
onboarding@resend.dev
```

**Or (if you verified your domain in Resend):**
```
alerts@yourdomain.com
```

**Description:** The "from" email address for notifications. Defaults to `onboarding@resend.dev` if not set.

**Note:** For production, verify your domain in Resend and use your own domain email.

---

### 5. CRON_SECRET (Optional - Recommended for Production)
**Value:** A random secret string (e.g., generate with `openssl rand -hex 32`)

**Example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Description:** Secret key to secure your cron endpoints. Currently commented out in code, but recommended for production.

**To enable:** Uncomment the authentication checks in:
- `app/api/cron/fetch-prices/route.ts`
- `app/api/cron/send-alerts/route.ts`

---

## Quick Setup Checklist

1. ✅ **DATABASE_URL** - PostgreSQL connection string
2. ✅ **OFFICIAL_PRICE_SOURCE_URL** - `https://ibex.bg/sdac-pv-en/`
3. ✅ **RESEND_API_KEY** - Your Resend API key (provided above)
4. ⚠️ **RESEND_FROM_EMAIL** - Optional (defaults to onboarding@resend.dev)
5. ⚠️ **CRON_SECRET** - Optional but recommended

---

## Important Notes

### Database Migration
After setting `DATABASE_URL` with PostgreSQL, you need to:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Run migrations on Vercel (via build command or manually):
   ```bash
   npx prisma migrate deploy
   ```
   
   Or add to `package.json`:
   ```json
   "build": "prisma migrate deploy && prisma generate && next build"
   ```

### Environment Scope
In Vercel, you can set variables for:
- **Production** - Live site
- **Preview** - Preview deployments
- **Development** - Local development (if using Vercel CLI)

Set all variables for **Production** at minimum.

---

## Testing After Deployment

1. Visit your Vercel URL
2. Click "Обнови цените" to test price fetching
3. Create an alert with your email to test notifications
4. Check Vercel logs for any errors

