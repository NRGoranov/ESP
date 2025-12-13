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
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 transition-all duration-300 dark:bg-matrix-dark-hover dark:border dark:border-matrix-green/30 dark:text-matrix-green">
          Известието е запазено успешно!
        </div>
      )}
      {submitError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 transition-all duration-300 dark:bg-matrix-dark-hover dark:border dark:border-matrix-yellow/30 dark:text-matrix-yellow">
          {submitError}
        </div>
      )}
      <AlertForm onSubmit={handleSubmit} />
    </div>
  )
}

