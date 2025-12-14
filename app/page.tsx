import { Suspense } from 'react'
import PriceGridClient from '@/components/PriceGridClient'
import DaySelectorClient from '@/components/DaySelectorClient'
import BestIntervalsPanelClient from '@/components/BestIntervalsPanelClient'
import AlertFormClient from '@/components/AlertFormClient'
import RefreshButton from '@/components/RefreshButton'
import ThemeToggle from '@/components/ThemeToggle'
import HelpButton from '@/components/HelpButton'

// Mark as dynamic to avoid static generation issues with client components
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8">
        {/* Header */}
        <header className="mb-4 sm:mb-5 md:mb-6" data-tour="header">
          <div className="glass glass-light rounded-2xl p-4 sm:rounded-3xl sm:p-5 md:p-6 transition-all duration-300 dark:glass-dark dark:glass-dark-light">
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 transition-colors duration-300 dark:text-dark-text">
                  Цени Електроенергия – Продажби
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-600 transition-colors duration-300 dark:text-dark-text-muted">
                  Дневни цени на дневния пазар за продажба на електроенергия
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <Suspense fallback={<div className="h-10 w-28 sm:w-32 animate-pulse rounded glass"></div>}>
                  <RefreshButton />
                </Suspense>
              </div>
            </div>
          </div>
        </header>

        {/* Day Selector */}
        <div className="mb-4 sm:mb-5 md:mb-6" data-tour="day-selector">
          <Suspense fallback={<div className="h-20 animate-pulse rounded glass transition-colors duration-300"></div>}>
            <DaySelectorClient />
          </Suspense>
        </div>

        {/* Main Content Grid - Mobile First */}
        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:grid lg:grid-cols-3">
          {/* Best Intervals Panel - First on mobile, in sidebar on desktop */}
          <div className="order-1 lg:col-start-3 lg:row-start-1" data-tour="best-intervals">
            <Suspense fallback={<div className="h-64 animate-pulse rounded glass transition-colors duration-300"></div>}>
              <BestIntervalsPanelClient />
            </Suspense>
          </div>

          {/* Price Grid - Second on mobile, main content on desktop */}
          <div className="order-2 lg:order-none lg:col-span-2 lg:row-span-2" data-tour="price-grid">
            <div className="glass glass-light rounded-2xl p-3 sm:rounded-3xl sm:p-4 md:p-5 transition-all duration-300 dark:glass-dark dark:glass-dark-light">
              <Suspense fallback={<div className="h-96 animate-pulse rounded glass transition-colors duration-300"></div>}>
                <PriceGridClient />
              </Suspense>
            </div>
          </div>

          {/* Alert Form - Third on mobile, in sidebar on desktop */}
          <div className="order-3 lg:col-start-3 lg:row-start-2" data-tour="alert-form">
            <Suspense fallback={<div className="h-96 animate-pulse rounded glass transition-colors duration-300"></div>}>
              <AlertFormClient />
            </Suspense>
          </div>
        </div>
      </div>
      <HelpButton />
    </main>
  )
}

