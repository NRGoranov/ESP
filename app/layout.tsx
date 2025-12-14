import type { Metadata } from 'next'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeScript from '@/components/ThemeScript'
import { BackgroundPaths } from '@/components/ui/background-paths'
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider'

export const metadata: Metadata = {
  title: 'Цени Електроенергия – Продажби',
  description: 'Дневни цени на електроенергията за продажба в България',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <OnboardingProvider>
            <BackgroundPaths />
            <ServiceWorkerRegistration />
            {children}
          </OnboardingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

