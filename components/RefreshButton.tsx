'use client'

import { useState } from 'react'

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/cron/fetch-prices', {
        method: 'GET',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to refresh prices')
      }

      const data = await response.json()
      setLastRefresh(new Date())
      
      // Show detailed success message
      if (data.results && Array.isArray(data.results)) {
        const totalFetched = data.results.reduce((sum: number, r: any) => sum + (r.fetched || 0), 0)
        const totalUpserted = data.results.reduce((sum: number, r: any) => sum + (r.upserted || 0), 0)
        const errors = data.results.filter((r: any) => r.error)
        
        if (errors.length > 0) {
          setError(`Частичен успех: ${totalUpserted} записа, но има грешки. Проверете конзолата.`)
        } else if (totalFetched === 0) {
          setError('Не са намерени данни. Проверете дали IBEX има данни за днес.')
        } else {
          setSuccessMessage(`Успешно: ${totalUpserted} записа заредени`)
        }
      }

      // Trigger a revalidation of all SWR caches
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshPrices'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5 sm:gap-2">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 text-xs sm:text-sm md:text-base font-semibold text-white transition-all duration-200 bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 shadow-lg hover:shadow-xl active:scale-95 min-h-[44px] touch-manipulation whitespace-nowrap"
      >
        {isRefreshing ? 'Обновяване...' : 'Обнови цените'}
      </button>
      {lastRefresh && (
        <p className="text-[10px] sm:text-xs text-gray-500 transition-colors duration-300 dark:text-dark-text-muted text-right">
          Последно: {lastRefresh.toLocaleTimeString('bg-BG')}
        </p>
      )}
      {error && (
        <p className="text-[10px] sm:text-xs text-red-600 transition-colors duration-300 dark:text-dark-accent text-right max-w-[150px] sm:max-w-none">{error}</p>
      )}
      {successMessage && (
        <p className="text-[10px] sm:text-xs text-green-600 transition-colors duration-300 dark:text-green-400 text-right">{successMessage}</p>
      )}
    </div>
  )
}

