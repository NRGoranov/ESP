'use client'

import { useState } from 'react'

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

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined') return
    
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setEnablePush(true)
      }
    } else if (window.Notification && Notification.permission === 'granted') {
      setEnablePush(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 transition-all duration-300 dark:border-matrix-green/20 dark:bg-matrix-dark-hover dark:shadow-[0_0_20px_rgba(0,255,65,0.1)]">
      <h3 className="text-xl font-semibold text-gray-800 transition-colors duration-300 dark:text-matrix-green">Настройка на известие</h3>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 transition-all duration-300 dark:bg-matrix-dark dark:border dark:border-matrix-yellow/30 dark:text-matrix-yellow">{error}</div>
      )}

      <div>
        <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-matrix-green">
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
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-matrix-green/30 dark:bg-matrix-dark dark:text-matrix-green dark:focus:border-matrix-green dark:focus:ring-matrix-green"
          placeholder="например 100"
        />
        <p className="mt-1 text-xs text-gray-500 transition-colors duration-300 dark:text-matrix-green/60">
          Известие ще се изпрати когато цената е поне толкова висока
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="timeWindowFrom" className="block text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-matrix-green">
            От (HH:mm)
          </label>
          <input
            type="time"
            id="timeWindowFrom"
            value={timeWindowFrom}
            onChange={(e) => setTimeWindowFrom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-matrix-green/30 dark:bg-matrix-dark dark:text-matrix-green dark:focus:border-matrix-green dark:focus:ring-matrix-green"
          />
        </div>
        <div>
          <label htmlFor="timeWindowTo" className="block text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-matrix-green">
            До (HH:mm)
          </label>
          <input
            type="time"
            id="timeWindowTo"
            value={timeWindowTo}
            onChange={(e) => setTimeWindowTo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-matrix-green/30 dark:bg-matrix-dark dark:text-matrix-green dark:focus:border-matrix-green dark:focus:ring-matrix-green"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 transition-colors duration-300 dark:text-matrix-green/60">
        Опционално: Ограничете известията до определен часови диапазон
      </p>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-matrix-green">
          Имейл адрес
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-matrix-green/30 dark:bg-matrix-dark dark:text-matrix-green dark:focus:border-matrix-green dark:focus:ring-matrix-green"
          placeholder="ваш@имейл.com"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enablePush}
            onChange={(e) => {
              if (e.target.checked) {
                requestNotificationPermission()
              } else {
                setEnablePush(false)
              }
            }}
            className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 transition-colors duration-300 focus:ring-2 focus:ring-blue-500 dark:border-matrix-green/30 dark:text-matrix-green dark:focus:ring-matrix-green"
          />
          <span className="text-sm font-medium text-gray-700 transition-colors duration-300 dark:text-matrix-green">Браузър нотификации</span>
        </label>
        {typeof window !== 'undefined' && !enablePush && 'Notification' in window && Notification.permission === 'default' && (
          <p className="mt-1 text-xs text-gray-500 transition-colors duration-300 dark:text-matrix-green/60">
            Ще бъдете помолени за разрешение при запазване
          </p>
        )}
        {typeof window !== 'undefined' && !enablePush && 'Notification' in window && Notification.permission === 'denied' && (
          <p className="mt-1 text-xs text-red-500 transition-colors duration-300 dark:text-matrix-yellow">
            Разрешенията за нотификации са отказани. Моля, активирайте ги в настройките на браузъра.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-matrix-green dark:text-matrix-dark dark:hover:bg-matrix-yellow dark:hover:text-matrix-dark dark:focus:ring-matrix-yellow"
        >
          {isSubmitting ? 'Запазване...' : 'Запази известие'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-matrix-green/30 dark:text-matrix-green dark:hover:bg-matrix-dark-hover dark:focus:ring-matrix-green"
          >
            Отказ
          </button>
        )}
      </div>
    </form>
  )
}

