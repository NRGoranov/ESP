# Bulgarian Electricity Selling Prices App

A production-ready Next.js web application for tracking and displaying day-ahead electricity market prices in Bulgaria, optimized for sellers to identify the best times to sell.

## Features

- **Excel-like Price Grid**: Interactive heatmap showing 15-minute interval prices with color coding
- **Best Intervals Panel**: Automatically identifies top selling opportunities
- **Alert System**: Email and push notifications when prices exceed thresholds
- **Automatic Data Fetching**: Vercel Cron jobs for daily price updates
- **Bulgarian UI**: User-friendly interface in Bulgarian language
- **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (dev) / PostgreSQL (production) via Prisma
- **Data Fetching**: SWR for client-side, React Server Components for server-side
- **Deployment**: Vercel

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="file:./dev.db"
OFFICIAL_PRICE_SOURCE_URL=""
```

3. **Initialize database**:
```bash
npx prisma generate
npx prisma db push
```

4. **Run development server**:
```bash
npm run dev
```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Configuration

### Price Source URL

The app is configured to work with **IBEX (Bulgarian Energy Exchange)** at:
- Source: https://ibex.bg/sdac-pv-en/

Set `OFFICIAL_PRICE_SOURCE_URL` in your `.env` file:
```env
OFFICIAL_PRICE_SOURCE_URL="https://ibex.bg/sdac-pv-en/"
```

The parser in `lib/fetchPrices.ts` automatically handles:
- HTML tables (IBEX format)
- JSON arrays
- CSV files
- Mock data (if URL not configured, for development)

The parser extracts time intervals and prices from HTML tables. If IBEX changes their page structure, you may need to adjust the HTML parsing logic in `parseRawPricesToRecords`.

### Vercel Cron Jobs

Configure in `vercel.json` (create if needed):
```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-prices",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/send-alerts",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Email Notifications

✅ **Resend is already integrated!**

Just add your Resend API key to environment variables:
```env
RESEND_API_KEY="your_resend_api_key"
RESEND_FROM_EMAIL="alerts@yourdomain.com"  # Optional: use your verified domain
```

The `sendEmailAlert` function in `lib/alerts.ts` is already configured to use Resend. For production, verify your domain in Resend and update `RESEND_FROM_EMAIL`.

### Push Notifications

TODO: Integrate with push service (OneSignal, FCM, etc.):
- Update service worker in `public/sw.js`
- Update `sendPushAlert` in `lib/alerts.ts`
- Add service keys to environment variables

## Project Structure

```
/app
  /api
    /cron
      fetch-prices/route.ts    # Daily price fetching
      send-alerts/route.ts     # Daily alert notifications
    /alerts
      route.ts                 # CRUD for alerts
      [id]/route.ts            # Delete alert
    /prices
      [date]/route.ts          # Get prices for date
    /best-intervals/route.ts   # Get top intervals
  page.tsx                     # Main page
  layout.tsx                   # Root layout
  globals.css                  # Global styles

/components
  PriceGrid.tsx                # Excel-like heatmap grid
  PriceGridClient.tsx          # Client wrapper with SWR
  DaySelector.tsx              # Date navigation
  DaySelectorClient.tsx        # Client wrapper
  BestIntervalsPanel.tsx       # Top intervals display
  BestIntervalsPanelClient.tsx # Client wrapper
  AlertForm.tsx                # Alert configuration form
  AlertFormClient.tsx          # Client wrapper
  RefreshButton.tsx            # Manual refresh button

/lib
  db.ts                        # Prisma client
  fetchPrices.ts               # Data fetching & parsing
  alerts.ts                    # Alert logic & notifications

/prisma
  schema.prisma                # Database schema
```

## Database Schema

### PriceRecord
- `id`: UUID
- `date`: Date string (YYYY-MM-DD)
- `startTime`: Time string (HH:mm)
- `endTime`: Time string (HH:mm)
- `intervalMinutes`: 15
- `priceEurMwh`: Price in EUR/MWh
- Unique constraint on `(date, startTime)`

### UserAlert
- `id`: UUID
- `email`: Optional email address
- `pushToken`: Optional push notification token
- `minPrice`: Minimum price threshold
- `timeWindowFrom`: Optional start time (HH:mm)
- `timeWindowTo`: Optional end time (HH:mm)
- `isActive`: Boolean flag

## Development

- **Database Studio**: `npm run db:studio`
- **Type checking**: Built into Next.js
- **Linting**: `npm run lint`

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Configure cron jobs in `vercel.json`
5. Deploy!

## License

MIT

