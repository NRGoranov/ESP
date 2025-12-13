'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Helper to get initial theme safely
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }
  
  // Check if theme is already set in HTML (from script tag)
  const htmlClass = document.documentElement.classList.contains('dark')
  if (htmlClass) {
    return 'dark'
  }
  
  // Check localStorage
  const savedTheme = localStorage.getItem('theme') as Theme | null
  if (savedTheme) {
    return savedTheme
  }
  
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with 'light' to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Sync with any changes that might have happened
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return
    
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    if (!mounted) return
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Always provide context value, even before mount
  const contextValue: ThemeContextType = { 
    theme: mounted ? theme : 'light', 
    toggleTheme 
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

