"use client"

import React, { createContext, useContext, useMemo, useSyncExternalStore } from "react"
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
const subscribeToHydration = () => () => {}
const clientHydrationSnapshot = () => true
const serverHydrationSnapshot = () => false

function ThemeContextBridge({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme, setTheme } = useNextTheme()
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrationSnapshot, serverHydrationSnapshot)

  const value = useMemo<ThemeContextType>(() => {
    // All consumers must share the server fallback during initial hydration.
    const currentResolvedTheme = hydrated
      ? (resolvedTheme as ThemeResolved | undefined) || (theme === "dark" ? "dark" : "light")
      : "light"

    const toggleTheme = () => {
      setTheme(currentResolvedTheme === "dark" ? "light" : "dark")
    }

    return {
      theme: currentResolvedTheme,
      resolvedTheme: currentResolvedTheme,
      mode: hydrated ? (theme as ThemeMode) || "system" : "system",
      setTheme: (nextTheme: ThemeMode) => setTheme(nextTheme),
      toggleTheme,
    }
  }, [hydrated, resolvedTheme, setTheme, theme])

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
