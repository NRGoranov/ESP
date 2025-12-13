import { Suspense } from 'react'
import PriceGridClient from '@/components/PriceGridClient'
import DaySelectorClient from '@/components/DaySelectorClient'
import BestIntervalsPanelClient from '@/components/BestIntervalsPanelClient'
import AlertFormClient from '@/components/AlertFormClient'
import RefreshButton from '@/components/RefreshButton'
import ThemeToggle from '@/components/ThemeToggle'

// Mark as dynamic to avoid static generation issues with client components
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50/60 backdrop-blur-sm transition-colors duration-300 dark:bg-dark-bg/60">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 transition-colors duration-300 dark:text-dark-text">
                Цени Електроенергия – Продажби
              </h1>
              <p className="mt-1 text-sm text-gray-600 transition-colors duration-300 dark:text-dark-text-muted">
                Дневни цени на дневния пазар за продажба на електроенергия
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Suspense fallback={<div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-dark-bg-hover"></div>}>
                <RefreshButton />
              </Suspense>
            </div>
          </div>
        </header>

        {/* Day Selector */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-20 animate-pulse rounded bg-gray-200 transition-colors duration-300 dark:bg-dark-bg-hover"></div>}>
            <DaySelectorClient />
          </Suspense>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Price Grid - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-dark-bg-light dark:bg-dark-bg-hover dark:shadow-lg">
              <Suspense fallback={<div className="h-96 animate-pulse rounded bg-gray-200 transition-colors duration-300 dark:bg-dark-bg"></div>}>
                <PriceGridClient />
              </Suspense>
            </div>
          </div>

          {/* Sidebar - Best Intervals & Alerts */}
          <div className="space-y-6">
            <Suspense fallback={<div className="h-64 animate-pulse rounded bg-gray-200 transition-colors duration-300 dark:bg-dark-bg-hover"></div>}>
              <BestIntervalsPanelClient />
            </Suspense>

            <Suspense fallback={<div className="h-96 animate-pulse rounded bg-gray-200 transition-colors duration-300 dark:bg-dark-bg-hover"></div>}>
              <AlertFormClient />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}

