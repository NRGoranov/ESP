'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import BestIntervalsPanel from './BestIntervalsPanel'
import type { BestInterval } from '@/lib/alerts'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch best intervals')
  }
  return res.json()
}

export default function BestIntervalsPanelClient() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

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

  // Fetch best intervals for the selected date
  const { data, error } = useSWR<{ intervals: BestInterval[] }>(
    `/api/best-intervals?date=${selectedDate}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const handleIntervalClick = (interval: BestInterval) => {
    // Scroll to or highlight the corresponding cell in the grid
    console.log('Interval clicked:', interval)
    // Could emit an event to PriceGrid to highlight the cell
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 dark:border-dark-bg-light dark:bg-dark-bg-hover">
        <p className="text-sm text-red-600 transition-colors duration-300 dark:text-dark-accent">Грешка при зареждане</p>
      </div>
    )
  }

  return (
    <BestIntervalsPanel
      intervals={data?.intervals || []}
      onIntervalClick={handleIntervalClick}
      title={`Топ интервали за ${new Date(selectedDate).toLocaleDateString('bg-BG', {
        day: 'numeric',
        month: 'long',
      })}`}
    />
  )
}

