import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Mark as dynamic route
export const dynamic = 'force-dynamic'

/**
 * GET: Fetch all active alerts
 * POST: Create a new alert
 */
export async function GET() {
  try {
    const alerts = await db.userAlert.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      count: alerts.length,
      alerts: alerts.map(alert => ({
        id: alert.id,
        email: alert.email,
        pushToken: alert.pushToken ? '***' : null, // Don't expose full token
        minPrice: alert.minPrice,
        timeWindowFrom: alert.timeWindowFrom,
        timeWindowTo: alert.timeWindowTo,
        isActive: alert.isActive,
        createdAt: alert.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, minPrice, timeWindowFrom, timeWindowTo, enablePush } = body

    // Validate required fields
    if (!minPrice || typeof minPrice !== 'number' || minPrice <= 0) {
      return NextResponse.json(
        { error: 'minPrice is required and must be a positive number' },
        { status: 400 }
      )
    }

    if (!email && !enablePush) {
      return NextResponse.json(
        { error: 'Either email or push notifications must be enabled' },
        { status: 400 }
      )
    }

    // Get push token if push is enabled (from service worker registration)
    let pushToken: string | null = null
    if (enablePush) {
      // TODO: Get push token from request or service worker registration
      // For now, we'll store a placeholder
      pushToken = 'pending_registration'
    }

    const alert = await db.userAlert.create({
      data: {
        email: email || null,
        pushToken: pushToken,
        minPrice,
        timeWindowFrom: timeWindowFrom || null,
        timeWindowTo: timeWindowTo || null,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      alert: {
        id: alert.id,
        email: alert.email,
        minPrice: alert.minPrice,
        timeWindowFrom: alert.timeWindowFrom,
        timeWindowTo: alert.timeWindowTo,
        isActive: alert.isActive,
        createdAt: alert.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

