'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import PriceGrid from './PriceGrid'
import type { PriceRecord } from '@/lib/fetchPrices'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    let errorMessage = 'Failed to fetch prices'
    try {
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await res.json()
        errorMessage = error.error || errorMessage
      } else {
        const text = await res.text()
        errorMessage = text || errorMessage
      }
    } catch {
      errorMessage = `HTTP ${res.status}: ${res.statusText}`
    }
    throw new Error(errorMessage)
  }
  
  try {
    return await res.json()
  } catch (jsonError) {
    throw new Error('Invalid JSON response from server')
  }
}

export default function PriceGridClient() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRecords, setSelectedRecords] = useState<PriceRecord[]>([])
  const [highlightedInterval, setHighlightedInterval] = useState<{ date: string; startTime: string; endTime: string } | null>(null)

  const { data, error, isLoading, mutate } = useSWR<{
    date: string
    count: number
    records: PriceRecord[]
  }>(`/api/prices/${selectedDate}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 300000, // Refresh every 5 minutes
  })

  // Listen for date changes from DaySelector
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleDateChange = (e: CustomEvent) => {
      setSelectedDate(e.detail.date)
      // Clear selection and highlighted interval when date changes
      setHighlightedInterval(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('cellSelect', {
            detail: { records: [] },
          })
        )
        window.dispatchEvent(
          new CustomEvent('deselectInterval', {})
        )
      }
    }
    window.addEventListener('dateChange', handleDateChange as EventListener)
    return () => {
      window.removeEventListener('dateChange', handleDateChange as EventListener)
    }
  }, [])

  // Listen for refresh events
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleRefresh = () => {
      // Trigger SWR revalidation
      mutate()
    }
    window.addEventListener('refreshPrices', handleRefresh)
    return () => {
      window.removeEventListener('refreshPrices', handleRefresh)
    }
  }, [mutate])

  // Broadcast price data updates to BestIntervalsPanelClient
  useEffect(() => {
    if (typeof window === 'undefined' || !data?.records) return
    
    window.dispatchEvent(
      new CustomEvent('priceDataUpdate', {
        detail: { records: data.records },
      })
    )
  }, [data?.records])

  // Listen for interval selection from BestIntervalsPanel
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleIntervalSelect = (e: CustomEvent) => {
      setHighlightedInterval(e.detail)
    }
    
    const handleIntervalDeselect = () => {
      setHighlightedInterval(null)
    }
    
    window.addEventListener('selectInterval', handleIntervalSelect as EventListener)
    window.addEventListener('deselectInterval', handleIntervalDeselect)
    return () => {
      window.removeEventListener('selectInterval', handleIntervalSelect as EventListener)
      window.removeEventListener('deselectInterval', handleIntervalDeselect)
    }
  }, [])

  const handleCellClick = (record: PriceRecord) => {
    // Could scroll to cell or highlight it
    console.log('Cell clicked:', record)
  }

  const handleCellSelect = (records: PriceRecord[]) => {
    setSelectedRecords(records)
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8 text-center">
        <div className="rounded-xl sm:rounded-2xl glass glass-light p-3 sm:p-4 text-xs sm:text-sm text-red-700 transition-colors duration-300 dark:glass-dark dark:glass-dark-light dark:text-red-400 border-red-500/30 dark:border-red-400/30">
          <p className="font-semibold">Грешка при зареждане на данни</p>
          <p className="mt-1 text-xs sm:text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 text-center">
        <div className="text-xs sm:text-sm text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">Зареждане на данни...</div>
      </div>
    )
  }

  return (
    <div>
      <PriceGrid
        records={data?.records || []}
        onCellClick={handleCellClick}
        onCellSelect={handleCellSelect}
        highlightedInterval={highlightedInterval}
      />
    </div>
  )
}

