import { NextResponse } from 'next/server'
import { fetchRawPricesFromSource, parseRawPricesToRecords, upsertPriceRecords } from '@/lib/fetchPrices'

// Mark as dynamic route (uses headers)
export const dynamic = 'force-dynamic'

/**
 * API route for fetching and storing price data.
 * Called by Vercel Cron or manually via "Refresh prices" button.
 * 
 * Fetches prices for today and tomorrow (day-ahead market).
 * Idempotent - safe to call multiple times.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    // Optional: Add cron secret check for security
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dates = [today, tomorrow]
    const results: { date: string; fetched: number; upserted: number; error?: string }[] = []

    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0]
      
      try {
        // Fetch raw data
        const raw = await fetchRawPricesFromSource(date)
        
        // Parse to normalized records
        const records = parseRawPricesToRecords(raw, dateStr)
        
        // Upsert to database
        const upserted = await upsertPriceRecords(records)
        
        results.push({
          date: dateStr,
          fetched: records.length,
          upserted,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error processing date ${dateStr}:`, error)
        results.push({
          date: dateStr,
          fetched: 0,
          upserted: 0,
          error: errorMessage,
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error('Error in fetch-prices cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

