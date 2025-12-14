'use client'

import { useOnboardingContext } from './onboarding/OnboardingProvider'

export default function HelpButton() {
  const { start } = useOnboardingContext()

  return (
    <button
      onClick={start}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-12 w-12 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-blue-500 dark:hover:bg-blue-600 touch-manipulation"
      aria-label="Помощ - Стартирай тура"
      title="Помощ"
    >
      <span className="text-xl font-bold">?</span>
    </button>
  )
}

