'use client'

import type { BestInterval } from '@/lib/alerts'

type BestIntervalsPanelProps = {
  intervals: BestInterval[]
  onIntervalClick?: (interval: BestInterval) => void
  title?: string
  highlightedInterval?: { date: string; startTime: string; endTime: string } | null
}

export default function BestIntervalsPanel({
  intervals,
  onIntervalClick,
  title = 'Топ интервали за продажба',
  highlightedInterval,
}: BestIntervalsPanelProps) {
  if (intervals.length === 0) {
    return (
      <div className="rounded-2xl sm:rounded-3xl glass glass-light p-3 sm:p-4 transition-all duration-300 dark:glass-dark dark:glass-dark-light">
        <h3 className="mb-2 text-base sm:text-lg font-semibold transition-colors duration-300 dark:text-dark-text">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">Няма данни</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl glass glass-light p-3 sm:p-4 transition-all duration-300 dark:glass-dark dark:glass-dark-light">
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-800 transition-colors duration-300 dark:text-dark-text">{title}</h3>
      <div className="space-y-2">
        {intervals.map((interval, index) => {
          const isHighlighted = highlightedInterval && 
            interval.date === highlightedInterval.date &&
            interval.startTime === highlightedInterval.startTime &&
            interval.endTime === highlightedInterval.endTime
          
          return (
          <button
            key={`${interval.date}-${interval.startTime}-${index}`}
            type="button"
            onClick={() => onIntervalClick?.(interval)}
            className={`w-full rounded-xl sm:rounded-2xl glass glass-light p-2.5 sm:p-3 text-left transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:glass-dark dark:glass-dark-light dark:hover:shadow-2xl dark:focus:ring-green-400/50 active:scale-[0.98] min-h-[60px] sm:min-h-[70px] touch-manipulation ${
              isHighlighted
                ? 'border-blue-500/60 bg-gradient-to-r from-blue-50/60 to-blue-100/60 ring-2 ring-blue-400/30 dark:border-blue-400/50 dark:from-blue-500/20 dark:to-blue-600/20 dark:ring-blue-400/20'
                : 'border-white/30 bg-gradient-to-r from-green-50/60 to-green-100/60 hover:border-green-400/50 dark:border-white/10 dark:from-green-500/50 dark:to-green-600/50 dark:hover:border-green-400/60'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-500 text-xs sm:text-sm font-bold text-white transition-colors duration-300 dark:bg-green-500 dark:text-white flex-shrink-0">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm sm:text-base text-gray-800 transition-colors duration-300 dark:text-dark-text truncate">
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
              <div className="text-right flex-shrink-0">
                <div className="text-lg sm:text-xl font-bold text-green-700 transition-colors duration-300 dark:text-green-400">
                  {interval.priceEurMwh.toFixed(2)}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">EUR/MWh</div>
              </div>
            </div>
          </button>
        )})}
      </div>
    </div>
  )
}

