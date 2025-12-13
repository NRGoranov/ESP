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
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-dark-primary dark:text-dark-bg dark:hover:bg-dark-accent dark:focus:ring-dark-accent"
      >
        {isRefreshing ? 'Обновяване...' : 'Обнови цените'}
      </button>
      {lastRefresh && (
        <p className="text-xs text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">
          Последно обновяване: {lastRefresh.toLocaleTimeString('bg-BG')}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 transition-colors duration-300 dark:text-dark-accent">{error}</p>
      )}
      {successMessage && (
        <p className="text-xs text-green-600 transition-colors duration-300 dark:text-green-400">{successMessage}</p>
      )}
    </div>
  )
}

