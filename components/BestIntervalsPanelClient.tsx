'use client'

import { useState, useEffect, useMemo } from 'react'
import BestIntervalsPanel from './BestIntervalsPanel'
import type { BestInterval } from '@/lib/alerts'
import type { PriceRecord } from '@/lib/fetchPrices'

export default function BestIntervalsPanelClient() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>([])
  const [highlightedInterval, setHighlightedInterval] = useState<{ date: string; startTime: string; endTime: string } | null>(null)

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

  // Listen for price data updates from PriceGridClient
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handlePriceDataUpdate = (e: CustomEvent) => {
      setPriceRecords(e.detail.records || [])
    }
    window.addEventListener('priceDataUpdate', handlePriceDataUpdate as EventListener)
    return () => {
      window.removeEventListener('priceDataUpdate', handlePriceDataUpdate as EventListener)
    }
  }, [])

  // Calculate top 5 intervals dynamically from current price data
  const topIntervals = useMemo<BestInterval[]>(() => {
    if (priceRecords.length === 0) return []
    
    // Sort by price descending and take top 5
    const sorted = [...priceRecords]
      .sort((a, b) => b.priceEurMwh - a.priceEurMwh)
      .slice(0, 5)
      .map(record => ({
        date: record.date,
        startTime: record.startTime,
        endTime: record.endTime,
        priceEurMwh: record.priceEurMwh,
      }))
    
    return sorted
  }, [priceRecords])

  // Listen for cell selection from PriceGrid
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleCellSelect = (e: CustomEvent) => {
      const records = e.detail.records || []
      if (records.length === 1) {
        const record = records[0]
        // Only highlight if this interval is in the top 5
        const isInTop5 = topIntervals.some(
          interval =>
            interval.date === record.date &&
            interval.startTime === record.startTime &&
            interval.endTime === record.endTime
        )
        if (isInTop5) {
          setHighlightedInterval({
            date: record.date,
            startTime: record.startTime,
            endTime: record.endTime,
          })
        } else {
          setHighlightedInterval(null)
        }
      } else {
        setHighlightedInterval(null)
      }
    }
    window.addEventListener('cellSelect', handleCellSelect as EventListener)
    return () => {
      window.removeEventListener('cellSelect', handleCellSelect as EventListener)
    }
  }, [topIntervals])

  const handleIntervalClick = (interval: BestInterval) => {
    // Toggle selection - if already highlighted, deselect it
    const isCurrentlyHighlighted = highlightedInterval &&
      highlightedInterval.date === interval.date &&
      highlightedInterval.startTime === interval.startTime &&
      highlightedInterval.endTime === interval.endTime

    if (isCurrentlyHighlighted) {
      // Deselect
      setHighlightedInterval(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('deselectInterval', {})
        )
      }
    } else {
      // Select
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('selectInterval', {
            detail: {
              date: interval.date,
              startTime: interval.startTime,
              endTime: interval.endTime,
            },
          })
        )
      }
      setHighlightedInterval({
        date: interval.date,
        startTime: interval.startTime,
        endTime: interval.endTime,
      })
    }
  }

  return (
    <BestIntervalsPanel
      intervals={topIntervals}
      onIntervalClick={handleIntervalClick}
      highlightedInterval={highlightedInterval}
      title={`Топ интервали за ${new Date(selectedDate).toLocaleDateString('bg-BG', {
        day: 'numeric',
        month: 'long',
      })}`}
    />
  )
}

