"use client"

import React, { createContext, useContext, useMemo } from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

export type ThemeMode = "light" | "dark" | "system"
type ThemeResolved = "light" | "dark"

interface ThemeContextType {
  theme: ThemeResolved
  resolvedTheme: ThemeResolved
  mode: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function ThemeContextBridge({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme, setTheme } = useNextTheme()

  const value = useMemo<ThemeContextType>(() => {
    const currentResolvedTheme =
      (resolvedTheme as ThemeResolved | undefined) ||
      (theme === "dark" ? "dark" : "light")

    const toggleTheme = () => {
      setTheme(currentResolvedTheme === "dark" ? "light" : "dark")
    }

    return {
      theme: currentResolvedTheme,
      resolvedTheme: currentResolvedTheme,
      mode: (theme as ThemeMode) || "system",
      setTheme: (nextTheme: ThemeMode) => setTheme(nextTheme),
      toggleTheme,
    }
  }, [resolvedTheme, setTheme, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="purplesofthub-theme"
    >
      <ThemeContextBridge>{children}</ThemeContextBridge>
    </NextThemesProvider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)

  if (context) return context

  return {
    theme: "dark",
    resolvedTheme: "dark",
    mode: "system",
    setTheme: () => {},
    toggleTheme: () => {},
  }
}

export default ThemeProvider
