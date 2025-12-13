'use client'

import type { BestInterval } from '@/lib/alerts'

type BestIntervalsPanelProps = {
  intervals: BestInterval[]
  onIntervalClick?: (interval: BestInterval) => void
  title?: string
}

export default function BestIntervalsPanel({
  intervals,
  onIntervalClick,
  title = 'Топ интервали за продажба',
}: BestIntervalsPanelProps) {
  if (intervals.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 dark:border-dark-bg-light dark:bg-dark-bg-hover dark:shadow-lg">
        <h3 className="mb-2 text-lg font-semibold transition-colors duration-300 dark:text-dark-text">{title}</h3>
        <p className="text-sm text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">Няма данни</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-dark-bg-light dark:bg-dark-bg-hover dark:shadow-lg">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 transition-colors duration-300 dark:text-dark-text">{title}</h3>
      <div className="space-y-2">
        {intervals.map((interval, index) => (
          <button
            key={`${interval.date}-${interval.startTime}-${index}`}
            type="button"
            onClick={() => onIntervalClick?.(interval)}
            className="w-full rounded-lg border border-gray-200 bg-gradient-to-r from-green-50 to-green-100 p-3 text-left transition-all duration-300 hover:border-green-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-dark-bg-light dark:from-dark-bg dark:to-dark-bg-hover dark:hover:border-dark-primary dark:hover:shadow-lg dark:focus:ring-dark-primary"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white transition-colors duration-300 dark:bg-dark-primary dark:text-dark-bg">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 transition-colors duration-300 dark:text-dark-text">
                    {interval.startTime} - {interval.endTime}
                  </div>
                  <div className="text-xs text-gray-600 transition-colors duration-300 dark:text-dark-text-muted">
                    {new Date(interval.date).toLocaleDateString('bg-BG', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-700 transition-colors duration-300 dark:text-dark-accent">
                  {interval.priceEurMwh.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">EUR/MWh</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

