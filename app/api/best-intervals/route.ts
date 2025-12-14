import { NextResponse } from 'next/server'
import { getTopIntervalsForDay } from '@/lib/alerts'
import type { BestInterval } from '@/lib/alerts'

// Mark as dynamic route (uses request.url)
export const dynamic = 'force-dynamic'

/**
 * Generate placeholder best intervals for demonstration
 */
function generatePlaceholderBestIntervals(date: string): BestInterval[] {
  // Top 5 intervals with highest prices (typically midday hours)
  const topIntervals = [
    { startTime: '12:00', endTime: '12:15', price: 82.45 },
    { startTime: '12:15', endTime: '12:30', price: 81.90 },
    { startTime: '13:00', endTime: '13:15', price: 80.75 },
    { startTime: '11:45', endTime: '12:00', price: 79.60 },
    { startTime: '13:15', endTime: '13:30', price: 78.20 },
  ]

  return topIntervals.map(interval => ({
    date,
    startTime: interval.startTime,
    endTime: interval.endTime,
    priceEurMwh: interval.price,
  }))
}

/**
 * API route to get top intervals for a given date
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const intervals = await getTopIntervalsForDay(date, 5)

    // If no intervals found, return placeholder data
    if (intervals.length === 0) {
      const placeholderIntervals = generatePlaceholderBestIntervals(date)
      return NextResponse.json({
        date,
        intervals: placeholderIntervals,
      })
    }

    return NextResponse.json({
      date,
      intervals,
    })
  } catch (error) {
    console.error('Error fetching best intervals:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

