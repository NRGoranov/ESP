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
      <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 dark:border-matrix-green/20 dark:bg-matrix-dark-hover dark:shadow-[0_0_20px_rgba(0,255,65,0.1)]">
        <h3 className="mb-2 text-lg font-semibold transition-colors duration-300 dark:text-matrix-green">{title}</h3>
        <p className="text-sm text-gray-500 transition-colors duration-300 dark:text-matrix-green/60">Няма данни</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-matrix-green/20 dark:bg-matrix-dark-hover dark:shadow-[0_0_20px_rgba(0,255,65,0.1)]">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 transition-colors duration-300 dark:text-matrix-green">{title}</h3>
      <div className="space-y-2">
        {intervals.map((interval, index) => (
          <button
            key={`${interval.date}-${interval.startTime}-${index}`}
            type="button"
            onClick={() => onIntervalClick?.(interval)}
            className="w-full rounded-lg border border-gray-200 bg-gradient-to-r from-green-50 to-green-100 p-3 text-left transition-all duration-300 hover:border-green-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-matrix-green/20 dark:from-matrix-dark dark:to-matrix-dark-hover dark:hover:border-matrix-green dark:hover:shadow-[0_0_10px_rgba(0,255,65,0.3)] dark:focus:ring-matrix-green"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white transition-colors duration-300 dark:bg-matrix-green dark:text-matrix-dark">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 transition-colors duration-300 dark:text-matrix-green">
                    {interval.startTime} - {interval.endTime}
                  </div>
                  <div className="text-xs text-gray-600 transition-colors duration-300 dark:text-matrix-green/70">
                    {new Date(interval.date).toLocaleDateString('bg-BG', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-700 transition-colors duration-300 dark:text-matrix-yellow">
                  {interval.priceEurMwh.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 transition-colors duration-300 dark:text-matrix-green/60">EUR/MWh</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

