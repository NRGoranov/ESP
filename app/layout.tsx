import type { Metadata } from 'next'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Цени Електроенергия – Продажби',
  description: 'Дневни цени на електроенергията за продажба в България',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ServiceWorkerRegistration />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

