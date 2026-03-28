'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] =
    useState<Theme>('dark')
  const [mounted, setMounted] =
    useState(false)

  // Only run on client side
  useEffect(() => {
    setMounted(true)

    // Get saved theme from localStorage
    try {
      const saved = localStorage
        .getItem('theme') as Theme | null
      const preferred = saved || 'dark'
      setThemeState(preferred)

      // Apply to document
      if (preferred === 'dark') {
        document.documentElement
          .classList.add('dark')
      } else {
        document.documentElement
          .classList.remove('dark')
      }
    } catch {
      // localStorage not available
      setThemeState('dark')
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(
        'theme', newTheme
      )
      if (newTheme === 'dark') {
        document.documentElement
          .classList.add('dark')
      } else {
        document.documentElement
          .classList.remove('dark')
      }
    } catch {}
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark'
      ? 'light' : 'dark'
    )
  }

  // Provide context value even
  // before mounted to prevent
  // "must be used within" errors
  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Safe useTheme hook that never crashes
export function useTheme():
  ThemeContextType {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    // Return safe defaults instead
    // of throwing an error
    // This prevents the crash
    return {
      theme: 'dark',
      toggleTheme: () => {},
      setTheme: () => {},
    }
  }

  return context
}

// Also export as default
export default ThemeProvider
