import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Mark as dynamic route (uses params)
export const dynamic = 'force-dynamic'

/**
 * API route to fetch price records for a specific date.
 * Returns all 15-minute intervals for the given date, ordered by time.
 */
export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const date = params.date

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const records = await db.priceRecord.findMany({
      where: {
        date,
      },
      orderBy: [
        { startTime: 'asc' },
      ],
    })

    return NextResponse.json({
      date,
      count: records.length,
      records: records.map(record => ({
        id: record.id,
        date: record.date,
        startTime: record.startTime,
        endTime: record.endTime,
        intervalMinutes: record.intervalMinutes,
        priceEurMwh: record.priceEurMwh,
        createdAt: record.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

