import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Mark as dynamic route (uses params)
export const dynamic = 'force-dynamic'

/**
 * DELETE: Deactivate an alert
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const alert = await db.userAlert.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: 'Alert deactivated',
    })
  } catch (error) {
    console.error('Error deactivating alert:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

