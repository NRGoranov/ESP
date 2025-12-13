'use client'

import { useState } from 'react'

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)

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
      
      // Show success message briefly
      setTimeout(() => {
        // Could show a toast notification here
        console.log('Prices refreshed:', data)
      }, 100)

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
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-matrix-green dark:text-matrix-dark dark:hover:bg-matrix-yellow dark:hover:text-matrix-dark dark:focus:ring-matrix-yellow"
      >
        {isRefreshing ? 'Обновяване...' : 'Обнови цените'}
      </button>
      {lastRefresh && (
        <p className="text-xs text-gray-500 transition-colors duration-300 dark:text-matrix-green/70">
          Последно обновяване: {lastRefresh.toLocaleTimeString('bg-BG')}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 transition-colors duration-300 dark:text-matrix-yellow">{error}</p>
      )}
    </div>
  )
}

