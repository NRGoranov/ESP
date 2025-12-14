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
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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
    <div className="rounded-2xl sm:rounded-3xl glass glass-light p-3 sm:p-4 transition-all duration-300 dark:glass-dark dark:glass-dark-light">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Date navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={goToPreviousDay}
            className="rounded-xl sm:rounded-2xl glass-button px-3 py-2 sm:px-4 text-base sm:text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:glass-button-dark dark:text-dark-text dark:focus:ring-blue-400/50 min-h-[44px] min-w-[44px] touch-manipulation"
            aria-label="Предишен ден"
          >
            ←
          </button>
          
          <div className="flex flex-col items-center gap-0.5 sm:gap-1 flex-1">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateInputChange}
              className="date-input-theme rounded-xl sm:rounded-2xl glass-input px-2 py-2 sm:px-3 text-center text-sm sm:text-base md:text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:glass-input-dark dark:text-dark-text dark:focus:ring-blue-400/50 w-full min-h-[44px]"
            />
            <div className="text-xs sm:text-sm text-gray-600 transition-colors duration-300 dark:text-dark-text-muted">{formatDate(selectedDate)}</div>
          </div>

          <button
            type="button"
            onClick={goToNextDay}
            className="rounded-xl sm:rounded-2xl glass-button px-3 py-2 sm:px-4 text-base sm:text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:glass-button-dark dark:text-dark-text dark:focus:ring-blue-400/50 min-h-[44px] min-w-[44px] touch-manipulation"
            aria-label="Следващ ден"
          >
            →
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="rounded-xl sm:rounded-2xl glass-button px-2.5 py-2 sm:px-4 text-xs sm:text-sm font-medium text-blue-700 transition-all duration-200 bg-blue-100/60 hover:bg-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:glass-button-dark dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 dark:focus:ring-blue-400/50 min-h-[44px] touch-manipulation"
          >
            Днес
          </button>
        </div>

        {/* Tomorrow toggle */}
        {onTomorrowToggle && (
          <label className="flex cursor-pointer items-center gap-2 mt-2 sm:mt-0">
            <input
              type="checkbox"
              checked={showTomorrow}
              onChange={(e) => onTomorrowToggle(e.target.checked)}
              className="h-5 w-5 sm:h-5 sm:w-5 cursor-pointer rounded border-gray-300/50 text-blue-600 transition-colors duration-300 focus:ring-2 focus:ring-blue-500 dark:border-dark-bg-light/50 dark:text-dark-primary dark:focus:ring-dark-primary touch-manipulation"
            />
            <span className="text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-dark-text">Ден напред</span>
          </label>
        )}
      </div>
    </div>
  )
}

