import { db } from './db'
import type { PriceRecord } from './fetchPrices'
import type { UserAlert as PrismaUserAlert } from '@prisma/client'

export type UserAlert = PrismaUserAlert

export type BestInterval = {
  date: string
  startTime: string
  endTime: string
  priceEurMwh: number
}

export type AlertTriggerResult = {
  alertId: string
  alert: {
    email?: string | null
    pushToken?: string | null
    minPrice: number
    timeWindowFrom?: string | null
    timeWindowTo?: string | null
  }
  triggeredRecords: PriceRecord[]
}

/**
 * Get top N intervals with highest prices for a given day
 */
export async function getTopIntervalsForDay(date: string, limit = 5): Promise<BestInterval[]> {
  const records = await db.priceRecord.findMany({
    where: {
      date,
    },
    orderBy: {
      priceEurMwh: 'desc',
    },
    take: limit,
  })

  return records.map(record => ({
    date: record.date,
    startTime: record.startTime,
    endTime: record.endTime,
    priceEurMwh: record.priceEurMwh,
  }))
}

/**
 * Check if a time string (HH:mm) is within a time window
 */
function isTimeInWindow(time: string, from?: string | null, to?: string | null): boolean {
  if (!from && !to) return true

  const timeMinutes = timeToMinutes(time)
  const fromMinutes = from ? timeToMinutes(from) : 0
  const toMinutes = to ? timeToMinutes(to) : 24 * 60

  return timeMinutes >= fromMinutes && timeMinutes < toMinutes
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Get all alerts that should be triggered for a given date
 */
export async function getTriggeredAlerts(date: string): Promise<AlertTriggerResult[]> {
  const activeAlerts = await db.userAlert.findMany({
    where: {
      isActive: true,
    },
  })

  const priceRecords = await db.priceRecord.findMany({
    where: {
      date,
    },
  })

  const results: AlertTriggerResult[] = []

  for (const alert of activeAlerts) {
    const triggeredRecords = priceRecords.filter(record => {
      const priceMatches = record.priceEurMwh >= alert.minPrice
      const timeMatches = isTimeInWindow(
        record.startTime,
        alert.timeWindowFrom,
        alert.timeWindowTo
      )
      return priceMatches && timeMatches
    })

    if (triggeredRecords.length > 0) {
      results.push({
        alertId: alert.id,
        alert: {
          email: alert.email,
          pushToken: alert.pushToken,
          minPrice: alert.minPrice,
          timeWindowFrom: alert.timeWindowFrom,
          timeWindowTo: alert.timeWindowTo,
        },
        triggeredRecords: triggeredRecords.map(record => ({
          id: record.id,
          date: record.date,
          startTime: record.startTime,
          endTime: record.endTime,
          intervalMinutes: record.intervalMinutes,
          priceEurMwh: record.priceEurMwh,
          createdAt: record.createdAt,
        })),
      })
    }
  }

  return results
}

/**
 * Send email alert via Resend
 */
export async function sendEmailAlert(alert: UserAlert, records: PriceRecord[]): Promise<void> {
  if (!alert.email) {
    throw new Error('Email address is required for email alerts')
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email alert')
    return
  }

  try {
    // Dynamic import to avoid loading Resend in environments where it's not needed
    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)

    // Generate email HTML
    const emailHtml = generateEmailHtml(alert, records)

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev', // Use your verified domain in production
      to: alert.email,
      subject: `Ценово известие: ${records.length} интервала над ${alert.minPrice} EUR/MWh`,
      html: emailHtml,
    })

    console.log(`[EMAIL ALERT] Sent to ${alert.email}, ID: ${result.data?.id}`)
  } catch (error) {
    console.error(`[EMAIL ALERT] Failed to send to ${alert.email}:`, error)
    throw error
  }
}

/**
 * Generate HTML email content for price alerts
 */
function generateEmailHtml(alert: UserAlert, records: PriceRecord[]): string {
  const dateStr = records[0]?.date 
    ? new Date(records[0].date).toLocaleDateString('bg-BG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'днес'

  const recordsList = records
    .sort((a, b) => b.priceEurMwh - a.priceEurMwh) // Sort by price descending
    .map(
      (r) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; font-weight: 600;">${r.startTime} - ${r.endTime}</td>
        <td style="padding: 8px; text-align: right; color: #059669; font-weight: 600;">
          ${r.priceEurMwh.toFixed(2)} EUR/MWh
        </td>
      </tr>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="bg">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ценово известие</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 24px;">⚡ Ценово известие</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Намерени са ${records.length} интервала с цена над вашия праг</p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <div style="background: white; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
            <strong>Дата:</strong> ${dateStr}
          </p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            <strong>Минимален праг:</strong> ${alert.minPrice.toFixed(2)} EUR/MWh
          </p>
          ${alert.timeWindowFrom && alert.timeWindowTo
            ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
                <strong>Часови диапазон:</strong> ${alert.timeWindowFrom} - ${alert.timeWindowTo}
              </p>`
            : ''}
        </div>

        <div style="background: white; padding: 16px; border-radius: 6px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Намерени интервали:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 10px; text-align: left; font-size: 14px; color: #374151;">Време</th>
                <th style="padding: 10px; text-align: right; font-size: 14px; color: #374151;">Цена</th>
              </tr>
            </thead>
            <tbody>
              ${recordsList}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 20px; padding: 12px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #1e40af;">
            <strong>💡 Съвет:</strong> По-високите цени са най-добри за продажба на електроенергия.
          </p>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Това е автоматично известие от системата за цени на електроенергията.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Send push notification alert (placeholder - to be integrated with push service)
 */
export async function sendPushAlert(alert: UserAlert, records: PriceRecord[]): Promise<void> {
  // TODO: Integrate with push notification service (e.g. OneSignal, FCM, etc.)
  // Example:
  // await oneSignal.post('/notifications', {
  //   app_id: process.env.ONESIGNAL_APP_ID,
  //   include_player_ids: [alert.pushToken!],
  //   contents: { en: `Намерени ${records.length} интервала над ${alert.minPrice} EUR/MWh` },
  // })

  console.log(`[PUSH ALERT] Would send to token ${alert.pushToken}:`, {
    minPrice: alert.minPrice,
    recordCount: records.length,
    records: records.map(r => `${r.startTime}-${r.endTime}: ${r.priceEurMwh} EUR/MWh`),
  })
}

