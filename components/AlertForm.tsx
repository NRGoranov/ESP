'use client'

import { useState, useEffect } from 'react'

type AlertFormProps = {
  onSubmit: (data: {
    email?: string
    minPrice: number
    timeWindowFrom?: string
    timeWindowTo?: string
    enablePush: boolean
  }) => Promise<void>
  onCancel?: () => void
}

export default function AlertForm({ onSubmit, onCancel }: AlertFormProps) {
  const [email, setEmail] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [timeWindowFrom, setTimeWindowFrom] = useState('')
  const [timeWindowTo, setTimeWindowTo] = useState('')
  const [enablePush, setEnablePush] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied' | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const price = parseFloat(minPrice)
    if (!minPrice || isNaN(price) || price <= 0) {
      setError('Моля, въведете валидна минимална цена')
      return
    }

    if (!email && !enablePush) {
      setError('Моля, изберете поне един метод за известия (имейл или браузър нотификации)')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        email: email || undefined,
        minPrice: price,
        timeWindowFrom: timeWindowFrom || undefined,
        timeWindowTo: timeWindowTo || undefined,
        enablePush,
      })
      // Reset form on success
      setEmail('')
      setMinPrice('')
      setTimeWindowFrom('')
      setTimeWindowTo('')
      setEnablePush(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при запазване на известието')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 rounded-2xl sm:rounded-3xl glass glass-light p-4 sm:p-5 md:p-6 transition-all duration-300 dark:glass-dark dark:glass-dark-light">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 transition-colors duration-300 dark:text-dark-text">Настройка на известие</h3>

      {error && (
        <div className="rounded-xl sm:rounded-2xl glass glass-light p-2.5 sm:p-3 text-xs sm:text-sm text-red-700 transition-all duration-300 dark:glass-dark dark:glass-dark-light dark:text-red-400 border-red-500/30 dark:border-red-400/30">{error}</div>
      )}

      <div>
        <label htmlFor="minPrice" className="block text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-dark-text">
          Минимална цена (EUR/MWh) *
        </label>
        <input
          type="number"
          id="minPrice"
          step="0.01"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          required
          className="mt-1 w-full rounded-xl sm:rounded-2xl glass-input px-3 py-2.5 sm:py-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:glass-input-dark dark:text-dark-text dark:focus:ring-blue-400/50 min-h-[44px]"
          placeholder="e.g. 100"
        />
        <p className="mt-1 text-xs text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">
          Известие ще се изпрати когато цената е поне толкова висока
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="timeWindowFrom" className="block text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-dark-text">
            От (HH:mm)
          </label>
          <input
            type="time"
            id="timeWindowFrom"
            value={timeWindowFrom}
            onChange={(e) => setTimeWindowFrom(e.target.value)}
            className="mt-1 w-full rounded-xl sm:rounded-2xl glass-input px-3 py-2.5 sm:py-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:glass-input-dark dark:text-dark-text dark:focus:ring-blue-400/50 min-h-[44px]"
          />
        </div>
        <div>
          <label htmlFor="timeWindowTo" className="block text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-dark-text">
            До (HH:mm)
          </label>
          <input
            type="time"
            id="timeWindowTo"
            value={timeWindowTo}
            onChange={(e) => setTimeWindowTo(e.target.value)}
            className="mt-1 w-full rounded-xl sm:rounded-2xl glass-input px-3 py-2.5 sm:py-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:glass-input-dark dark:text-dark-text dark:focus:ring-blue-400/50 min-h-[44px]"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">
        Опционално: Ограничете известията до определен часови диапазон
      </p>

      <div>
        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-dark-text">
          Имейл адрес
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl sm:rounded-2xl glass-input px-3 py-2.5 sm:py-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:glass-input-dark dark:text-dark-text dark:focus:ring-blue-400/50 min-h-[44px]"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enablePush}
            onChange={async (e) => {
              const shouldEnable = e.target.checked
              
              if (!shouldEnable) {
                setEnablePush(false)
                return
              }
              
              // Clear previous errors
              setError(null)
              
              // Check if notifications are supported
              if (typeof window === 'undefined' || !('Notification' in window)) {
                setError('Браузърът ви не поддържа нотификации')
                return
              }
              
              // Handle different permission states
              if (Notification.permission === 'denied') {
                setError('Разрешенията за нотификации са отказани. Моля, активирайте ги в настройките на браузъра.')
                return
              }
              
              if (Notification.permission === 'granted') {
                setEnablePush(true)
                setNotificationPermission('granted')
                return
              }
              
              // Request permission (must be called directly from user gesture)
              if (Notification.permission === 'default') {
                try {
                  const permission = await Notification.requestPermission()
                  setNotificationPermission(permission)
                  if (permission === 'granted') {
                    setEnablePush(true)
                  } else {
                    setError('Разрешенията за нотификации са отказани.')
                  }
                } catch (err) {
                  setError('Грешка при заявка за разрешение за нотификации')
                }
              }
            }}
            className="h-5 w-5 cursor-pointer rounded border-gray-300/50 text-blue-600 transition-colors duration-300 focus:ring-2 focus:ring-blue-500 dark:border-dark-bg-light/50 dark:text-dark-primary dark:focus:ring-dark-primary touch-manipulation"
          />
          <span className="text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-dark-text">Браузър нотификации</span>
        </label>
        {mounted && !enablePush && notificationPermission === 'default' && (
          <p className="mt-1 text-xs text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">
            Ще бъдете помолени за разрешение при запазване
          </p>
        )}
        {mounted && !enablePush && notificationPermission === 'denied' && (
          <p className="mt-1 text-xs text-red-500 transition-colors duration-300 dark:text-dark-accent">
            Разрешенията за нотификации са отказани. Моля, активирайте ги в настройките на браузъра.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl sm:rounded-2xl glass-button px-4 py-3 sm:py-2 text-sm sm:text-base font-semibold text-white transition-all duration-200 bg-blue-500/90 hover:bg-blue-600/90 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 dark:glass-button-dark dark:bg-blue-500/80 dark:text-white dark:hover:bg-blue-600/90 dark:focus:ring-blue-400/50 min-h-[44px] touch-manipulation"
        >
          {isSubmitting ? 'Запазване...' : 'Запази известие'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl sm:rounded-2xl glass-button px-4 py-3 sm:py-2 text-sm sm:text-base font-medium text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:glass-button-dark dark:text-dark-text dark:focus:ring-blue-400/50 min-h-[44px] touch-manipulation"
          >
            Отказ
          </button>
        )}
      </div>
    </form>
  )
}

