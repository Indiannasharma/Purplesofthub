"use client";

import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-700/50 dark:bg-amber-900/20">
      <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
        Dashboard temporarily unavailable
      </h2>
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
        We could not load dashboard data right now. Please try again.
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-900 dark:text-amber-100"
        >
          Go Home
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">{error.message}</p>
      )}
    </div>
  );
}
