import { db } from './db'

export const OFFICIAL_PRICE_SOURCE_URL = process.env.OFFICIAL_PRICE_SOURCE_URL || ''

export type PriceRecord = {
  id: string
  date: string // 'YYYY-MM-DD'
  startTime: string // 'HH:mm'
  endTime: string // 'HH:mm'
  intervalMinutes: number
  priceEurMwh: number
  createdAt: Date
}

/**
 * Fetches raw price data from IBEX (Bulgarian Energy Exchange) for a given date.
 * Source: https://ibex.bg/sdac-pv-en/
 * @param date - Date to fetch prices for (defaults to today)
 * @returns Raw response as string or parsed object
 */
export async function fetchRawPricesFromSource(date?: Date): Promise<string | any> {
  const targetDate = date || new Date()
  const dateStr = targetDate.toISOString().split('T')[0] // YYYY-MM-DD

  if (!OFFICIAL_PRICE_SOURCE_URL) {
    throw new Error('OFFICIAL_PRICE_SOURCE_URL is not configured')
  }

  // IBEX URL format - may need date parameters or query strings
  // Common patterns: ?date=YYYY-MM-DD or /YYYY-MM-DD or static page with date selector
  let url = OFFICIAL_PRICE_SOURCE_URL
  
  // If URL contains {date} placeholder, replace it
  if (url.includes('{date}')) {
    url = url.replace('{date}', dateStr)
  }
  // Otherwise, try adding date as query parameter
  else if (!url.includes('?')) {
    url = `${url}?date=${dateStr}`
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html, application/json, text/csv, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; BMSSale/1.0)',
      },
      next: { revalidate: 0 }, // Always fetch fresh data
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch prices from IBEX: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      return await response.json()
    } else if (contentType.includes('text/csv')) {
      return await response.text()
    } else {
      // HTML page (most likely for IBEX)
      return await response.text()
    }
  } catch (error) {
    console.error('Error fetching raw prices from IBEX:', error)
    throw error
  }
}

/**
 * Parses raw price data into normalized PriceRecord format.
 * This is a pluggable parser - adjust based on actual data format.
 * 
 * @param raw - Raw response from fetchRawPricesFromSource
 * @param date - Date string in YYYY-MM-DD format
 * @returns Array of normalized PriceRecord objects
 */
export function parseRawPricesToRecords(raw: string | any, date: string): Omit<PriceRecord, 'id' | 'createdAt'>[] {
  const records: Omit<PriceRecord, 'id' | 'createdAt'>[] = []

  // Placeholder parser - adjust based on actual data format
  // Example formats to handle:

  // Format 1: JSON array
  if (typeof raw === 'object' && Array.isArray(raw)) {
    for (const item of raw) {
      // Adjust field mapping based on actual API response
      records.push({
        date,
        startTime: item.startTime || item.start_time || item.time,
        endTime: item.endTime || item.end_time || calculateEndTime(item.startTime || item.start_time || item.time),
        intervalMinutes: item.intervalMinutes || item.interval_minutes || 15,
        priceEurMwh: parseFloat(item.priceEurMwh || item.price_eur_mwh || item.price || item.value || '0'),
      })
    }
  }
  // Format 2: CSV
  else if (typeof raw === 'string' && raw.includes(',')) {
    const lines = raw.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((header, idx) => {
        row[header] = values[idx] || ''
      })

      // Adjust CSV column mapping based on actual format
      const startTime = row['time'] || row['starttime'] || row['start_time'] || row['hour'] || ''
      const price = parseFloat(row['price'] || row['priceeurmwh'] || row['price_eur_mwh'] || row['value'] || '0')

      if (startTime && !isNaN(price)) {
        records.push({
          date,
          startTime: formatTime(startTime),
          endTime: calculateEndTime(formatTime(startTime)),
          intervalMinutes: 15,
          priceEurMwh: price,
        })
      }
    }
  }
  // Format 3: HTML table (IBEX format)
  else if (typeof raw === 'string' && raw.includes('<table')) {
    // Enhanced HTML table parsing for IBEX format
    // IBEX typically shows prices in tables with time intervals and prices
    
    // Try to find all tables in the page
    const tableMatches = raw.match(/<table[^>]*>([\s\S]*?)<\/table>/gi) || []
    
    for (const tableHtml of tableMatches) {
      // Extract rows from table
      const rows = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || []
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        // Extract cells (td or th)
        const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || []
        
        if (cells.length >= 2) {
          // Clean cell content - remove HTML tags and whitespace
          const cleanCells = cells.map(cell => 
            cell.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
          )
          
          // Try different column patterns:
          // Pattern 1: Time column, Price column
          // Pattern 2: Hour column, Price column
          // Pattern 3: Interval column (e.g., "00:00-00:15"), Price column
          
          let timeText = ''
          let priceText = ''
          
          // Look for time-like patterns in first few columns
          for (let colIdx = 0; colIdx < Math.min(3, cleanCells.length); colIdx++) {
            const cellText = cleanCells[colIdx]
            // Check if it looks like a time (HH:mm or HH:mm-HH:mm)
            if (/\d{1,2}:\d{2}/.test(cellText)) {
              timeText = cellText
              // If we found time, price is likely in next column
              if (colIdx + 1 < cleanCells.length) {
                priceText = cleanCells[colIdx + 1]
              }
              break
            }
          }
          
          // If no time found in first columns, try last column for price
          if (!timeText && cleanCells.length >= 2) {
            // Assume first column is time, last column is price
            timeText = cleanCells[0]
            priceText = cleanCells[cleanCells.length - 1]
          }
          
          // Extract time from interval format (e.g., "00:00-00:15" -> "00:00")
          if (timeText.includes('-')) {
            timeText = timeText.split('-')[0].trim()
          }
          
          // Extract numeric price (handle various formats)
          const priceMatch = priceText.match(/[\d,]+\.?\d*/)
          const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : NaN
          
          if (timeText && !isNaN(price) && price > 0) {
            const formattedTime = formatTime(timeText)
            if (formattedTime) {
              records.push({
                date,
                startTime: formattedTime,
                endTime: calculateEndTime(formattedTime),
                intervalMinutes: 15,
                priceEurMwh: price,
              })
            }
          }
        }
      }
    }
    
    // If no records found, log for debugging
    if (records.length === 0) {
      console.warn('No price records parsed from HTML. Page structure may have changed.')
      console.warn('First 500 chars of HTML:', raw.substring(0, 500))
    }
  }
  // Format 4: Mock data for development (if no URL configured)
  else if (!OFFICIAL_PRICE_SOURCE_URL) {
    // Generate mock data for development
    console.warn('OFFICIAL_PRICE_SOURCE_URL not configured, generating mock data')
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        records.push({
          date,
          startTime,
          endTime: calculateEndTime(startTime),
          intervalMinutes: 15,
          priceEurMwh: 50 + Math.random() * 100, // Mock price between 50-150
        })
      }
    }
  }

  return records
}

/**
 * Helper to format time string to HH:mm
 */
function formatTime(timeStr: string): string {
  // Handle various time formats
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (timeMatch) {
    return `${String(parseInt(timeMatch[1])).padStart(2, '0')}:${timeMatch[2]}`
  }
  return timeStr
}

/**
 * Calculate end time from start time (assuming 15-minute intervals)
 */
function calculateEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + 15
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

/**
 * Upsert price records into the database (idempotent)
 */
export async function upsertPriceRecords(records: Omit<PriceRecord, 'id' | 'createdAt'>[]): Promise<number> {
  let upserted = 0

  for (const record of records) {
    try {
      await db.priceRecord.upsert({
        where: {
          date_startTime: {
            date: record.date,
            startTime: record.startTime,
          },
        },
        update: {
          endTime: record.endTime,
          intervalMinutes: record.intervalMinutes,
          priceEurMwh: record.priceEurMwh,
        },
        create: {
          date: record.date,
          startTime: record.startTime,
          endTime: record.endTime,
          intervalMinutes: record.intervalMinutes,
          priceEurMwh: record.priceEurMwh,
        },
      })
      upserted++
    } catch (error) {
      console.error(`Error upserting record for ${record.date} ${record.startTime}:`, error)
    }
  }

  return upserted
}

