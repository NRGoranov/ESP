'use client'

import { useState } from 'react'
import AlertForm from './AlertForm'

export default function AlertFormClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (data: {
    email?: string
    minPrice: number
    timeWindowFrom?: string
    timeWindowTo?: string
    enablePush: boolean
  }) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create alert')
      }

      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unknown error')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {submitSuccess && (
        <div className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl glass glass-light p-2.5 sm:p-3 text-xs sm:text-sm text-green-700 transition-all duration-300 dark:glass-dark dark:glass-dark-light dark:text-green-400 border-green-500/30 dark:border-green-400/30">
          Известието е запазено успешно!
        </div>
      )}
      {submitError && (
        <div className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl glass glass-light p-2.5 sm:p-3 text-xs sm:text-sm text-red-700 transition-all duration-300 dark:glass-dark dark:glass-dark-light dark:text-red-400 border-red-500/30 dark:border-red-400/30">
          {submitError}
        </div>
      )}
      <AlertForm onSubmit={handleSubmit} />
    </div>
  )
}

