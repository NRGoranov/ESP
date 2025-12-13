'use client'

import { useState } from 'react'

type DaySelectorProps = {
  selectedDate: Date
  onDateChange: (date: Date) => void
  showTomorrow?: boolean
  onTomorrowToggle?: (show: boolean) => void
}

export default function DaySelector({
  selectedDate,
  onDateChange,
  showTomorrow = false,
  onTomorrowToggle,
}: DaySelectorProps) {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('bg-BG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(e.target.value)
    if (!isNaN(inputDate.getTime())) {
      onDateChange(inputDate)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Date navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goToPreviousDay}
          className="rounded-lg bg-gray-100 px-4 py-2 text-lg font-semibold transition-all duration-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg-hover dark:text-dark-text dark:hover:bg-dark-bg-light dark:hover:text-dark-primary dark:focus:ring-dark-primary"
          aria-label="Предишен ден"
        >
          ←
        </button>
        
        <div className="flex flex-col items-center gap-1">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateInputChange}
            className="rounded-lg border border-gray-300 px-3 py-2 text-center text-lg font-semibold transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-bg-light dark:bg-dark-bg-hover dark:text-dark-text dark:focus:border-dark-primary dark:focus:ring-dark-primary"
          />
          <div className="text-sm text-gray-600 transition-colors duration-300 dark:text-dark-text-muted">{formatDate(selectedDate)}</div>
        </div>

        <button
          type="button"
          onClick={goToNextDay}
          className="rounded-lg bg-gray-100 px-4 py-2 text-lg font-semibold transition-all duration-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg-hover dark:text-dark-text dark:hover:bg-dark-bg-light dark:hover:text-dark-primary dark:focus:ring-dark-primary"
          aria-label="Следващ ден"
        >
          →
        </button>

        <button
          type="button"
          onClick={goToToday}
          className="ml-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-300 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-primary/20 dark:text-dark-primary dark:hover:bg-dark-primary/30 dark:hover:text-dark-accent dark:focus:ring-dark-primary"
        >
          Днес
        </button>
      </div>

      {/* Tomorrow toggle */}
      {onTomorrowToggle && (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showTomorrow}
            onChange={(e) => onTomorrowToggle(e.target.checked)}
            className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 transition-colors duration-300 focus:ring-2 focus:ring-blue-500 dark:border-dark-bg-light dark:text-dark-primary dark:focus:ring-dark-primary"
          />
          <span className="text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-dark-text">Ден напред</span>
        </label>
      )}
    </div>
  )
}

