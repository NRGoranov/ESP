import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTriggeredAlerts, sendEmailAlert, sendPushAlert } from '@/lib/alerts'

// Mark as dynamic route (uses headers)
export const dynamic = 'force-dynamic'

/**
 * API route for checking and sending alert notifications.
 * Called by Vercel Cron (e.g., once per day after prices are fetched).
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
    const allResults: {
      date: string
      triggeredAlerts: number
      sentEmails: number
      sentPushes: number
      errors: string[]
    }[] = []

    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0]
      const errors: string[] = []

      try {
        // Get all triggered alerts for this date
        const triggeredAlerts = await getTriggeredAlerts(dateStr)

        let sentEmails = 0
        let sentPushes = 0

        for (const trigger of triggeredAlerts) {
          try {
            // Fetch the full alert record for sending
            const fullAlert = await db.userAlert.findUnique({
              where: { id: trigger.alertId },
            })

            if (!fullAlert) continue

            // Send email if configured
            if (fullAlert.email) {
              await sendEmailAlert(fullAlert, trigger.triggeredRecords)
              sentEmails++
            }

            // Send push if configured
            if (fullAlert.pushToken) {
              await sendPushAlert(fullAlert, trigger.triggeredRecords)
              sentPushes++
            }
          } catch (error) {
            const errorMessage = `Alert ${trigger.alertId}: ${error instanceof Error ? error.message : 'Unknown error'}`
            errors.push(errorMessage)
            console.error(errorMessage, error)
          }
        }

        allResults.push({
          date: dateStr,
          triggeredAlerts: triggeredAlerts.length,
          sentEmails,
          sentPushes,
          errors,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(errorMessage)
        console.error(`Error processing alerts for ${dateStr}:`, error)
        allResults.push({
          date: dateStr,
          triggeredAlerts: 0,
          sentEmails: 0,
          sentPushes: 0,
          errors,
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: allResults,
    })
  } catch (error) {
    console.error('Error in send-alerts cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

