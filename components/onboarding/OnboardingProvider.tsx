'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useOnboarding } from './useOnboarding'
import OnboardingOverlay from './OnboardingOverlay'

type OnboardingContextType = ReturnType<typeof useOnboarding>

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function useOnboardingContext() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider')
  }
  return context
}

type OnboardingProviderProps = {
  children: ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const onboarding = useOnboarding()

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
      <OnboardingOverlay />
    </OnboardingContext.Provider>
  )
}

