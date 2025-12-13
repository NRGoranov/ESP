# Setup Guide

## Quick Start

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
OFFICIAL_PRICE_SOURCE_URL=""
```

3. **Initialize the database**:
```bash
npx prisma generate
npx prisma db push
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## Production Deployment on Vercel

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Configure Environment Variables**:
   In Vercel dashboard → Settings → Environment Variables, add:
   - `DATABASE_URL`: Your PostgreSQL connection string (for production)
   - `OFFICIAL_PRICE_SOURCE_URL`: The URL to fetch price data from
   - Optional: `CRON_SECRET` for securing cron endpoints

4. **Database Setup**:
   - For production, use a PostgreSQL database (e.g., Vercel Postgres, Supabase, or Railway)
   - Update `DATABASE_URL` with your production connection string
   - Run migrations: `npx prisma db push` (or use Prisma Migrate)

5. **Cron Jobs**:
   - Vercel will automatically detect the `vercel.json` configuration
   - Cron jobs will run at the scheduled times (8 AM and 9 AM UTC by default)
   - You can test them manually by visiting:
     - `/api/cron/fetch-prices`
     - `/api/cron/send-alerts`

## Configuring the Price Source

1. **Update `OFFICIAL_PRICE_SOURCE_URL`** in your `.env` file

2. **Customize the parser** in `lib/fetchPrices.ts`:
   - The `parseRawPricesToRecords` function handles JSON, CSV, and HTML formats
   - Adjust the field mappings based on your actual data source
   - Test with sample data to ensure correct parsing

## Setting Up Notifications

### Email Notifications

1. Choose an email service (e.g., Resend, SendGrid, AWS SES)
2. Add your API key to environment variables
3. Update `sendEmailAlert` in `lib/alerts.ts` with your service integration

Example with Resend:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailAlert(alert: UserAlert, records: PriceRecord[]): Promise<void> {
  await resend.emails.send({
    from: 'alerts@yourdomain.com',
    to: alert.email!,
    subject: `Ценово известие: ${records.length} интервала над ${alert.minPrice} EUR/MWh`,
    html: generateEmailHtml(alert, records),
  })
}
```

### Push Notifications

1. Choose a push service (e.g., OneSignal, Firebase Cloud Messaging)
2. Add your service keys to environment variables
3. Update `sendPushAlert` in `lib/alerts.ts`
4. Update the service worker in `public/sw.js` with your push service integration
5. Update the alert creation flow to register push tokens

## Testing

### Manual Price Refresh
Click the "Обнови цените" button in the UI, or visit:
```
GET /api/cron/fetch-prices
```

### Test Alerts
1. Create an alert via the UI form
2. Manually trigger alert checking:
```
GET /api/cron/send-alerts
```

### Database Management
```bash
# Open Prisma Studio to view/edit data
npm run db:studio
```

## Troubleshooting

### Database Issues
- Ensure `DATABASE_URL` is correctly set
- Run `npx prisma generate` after schema changes
- For SQLite: ensure the database file is writable

### Price Fetching Issues
- Check `OFFICIAL_PRICE_SOURCE_URL` is set correctly
- Verify the parser matches your data format
- Check browser console and server logs for errors

### Cron Job Issues
- Verify `vercel.json` is in the root directory
- Check Vercel dashboard → Settings → Cron Jobs
- Test endpoints manually first
- Add authentication if needed (uncomment CRON_SECRET checks)

## Next Steps

1. Configure your actual price data source
2. Set up email/push notification services
3. Customize UI colors and styling if needed
4. Add authentication if you want user accounts
5. Set up monitoring and error tracking (e.g., Sentry)

