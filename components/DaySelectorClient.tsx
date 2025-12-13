'use client'

import { useState, useEffect } from 'react'
import DaySelector from './DaySelector'

export default function DaySelectorClient() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showTomorrow, setShowTomorrow] = useState(false)

  // Update parent components when date changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // This will trigger a re-fetch in PriceGridClient via the date state
    // We'll use a custom event or context to communicate between components
    window.dispatchEvent(
      new CustomEvent('dateChange', {
        detail: { date: selectedDate.toISOString().split('T')[0] },
      })
    )
  }, [selectedDate])

  return (
    <DaySelector
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      showTomorrow={showTomorrow}
      onTomorrowToggle={setShowTomorrow}
    />
  )
}

