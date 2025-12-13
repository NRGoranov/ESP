import { NextResponse } from 'next/server'
import { getTopIntervalsForDay } from '@/lib/alerts'

// Mark as dynamic route (uses request.url)
export const dynamic = 'force-dynamic'

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

