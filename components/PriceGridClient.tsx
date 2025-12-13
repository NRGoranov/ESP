'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import PriceGrid from './PriceGrid'
import type { PriceRecord } from '@/lib/fetchPrices'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch' }))
    throw new Error(error.error || 'Failed to fetch prices')
  }
  return res.json()
}

export default function PriceGridClient() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRecords, setSelectedRecords] = useState<PriceRecord[]>([])

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

  const handleCellClick = (record: PriceRecord) => {
    // Could scroll to cell or highlight it
    console.log('Cell clicked:', record)
  }

  const handleCellSelect = (records: PriceRecord[]) => {
    setSelectedRecords(records)
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-700 transition-colors duration-300 dark:bg-dark-bg-hover dark:text-dark-accent dark:border dark:border-dark-accent/30">
          <p className="font-semibold">Грешка при зареждане на данни</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">Зареждане на данни...</div>
      </div>
    )
  }

  return (
    <div>
      <PriceGrid
        records={data?.records || []}
        onCellClick={handleCellClick}
        onCellSelect={handleCellSelect}
      />
    </div>
  )
}

