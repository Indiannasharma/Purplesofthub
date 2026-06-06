'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { CurrencyProvider } from '@/context/CurrencyContext'

const queryClient = new QueryClient()

export function Providers({
  children,
  initialCountry,
}: {
  children: ReactNode
  initialCountry?: string | null
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider initialCountry={initialCountry}>
        {children}
      </CurrencyProvider>
    </QueryClientProvider>
  )
}
