'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 text-5xl">⚠️</div>
      <h2 className="mb-2 text-lg font-bold text-white">Something went wrong</h2>
      <p className="mb-6 text-sm text-gray-400 max-w-sm">
        We hit an unexpected error. Please try refreshing — if the issue persists,
        contact us on WhatsApp.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
        >
          Try Again
        </button>
        <a
          href="/"
          className="rounded-full border border-gray-700 px-5 py-2 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-all"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
