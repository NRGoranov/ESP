'use client'

import { useState, useEffect, useCallback } from 'react'
import { TOUR_STEPS, TOUR_KEY, type Step } from './steps'

export function useOnboarding() {
  const [isActive, setIsActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const completed = localStorage.getItem(TOUR_KEY) === 'true'
    setHasCompleted(completed)
    
    // Auto-start if not completed
    if (!completed) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsActive(true)
        setCurrentStepIndex(0)
      }, 500)
    }
  }, [])

  const start = useCallback(() => {
    setIsActive(true)
    setCurrentStepIndex(0)
  }, [])

  const next = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      // Last step - finish
      finish()
    }
  }, [currentStepIndex])

  const back = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])

  const skip = useCallback(() => {
    finish()
  }, [])

  const finish = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_KEY, 'true')
    }
    setHasCompleted(true)
    setIsActive(false)
  }, [])

  return {
    isActive,
    currentStepIndex,
    currentStep: TOUR_STEPS[currentStepIndex] as Step | undefined,
    steps: TOUR_STEPS,
    hasCompleted,
    start,
    next,
    back,
    skip,
  }
}

