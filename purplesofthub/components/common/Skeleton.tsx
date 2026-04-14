'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Skeleton loader component for creating loading placeholders
 * Uses shimmer animation for a premium loading experience
 */
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-purple-200/20 via-purple-200/40 to-purple-200/20 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] dark:from-purple-900/20 dark:via-purple-900/40 dark:to-purple-900/20 ${className}`}
      style={style}
    />
  );
}

/**
 * Card skeleton - for blog posts, service cards, etc.
 */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-purple-200/20 bg-white/70 p-6 backdrop-blur-sm dark:border-purple-500/20 dark:bg-purple-900/20">
      <Skeleton className="mb-4 h-40 w-full rounded-xl" />
      <Skeleton className="mb-3 h-5 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="mb-2 h-4 w-full" />
      ))}
      <Skeleton className="mt-4 h-8 w-32 rounded-full" />
    </div>
  );
}

/**
 * Text skeleton - for headings and paragraphs
 */
export function TextSkeleton({ lines = 1, width = '100%' }: { lines?: number; width?: string }) {
  return (
    <div style={{ width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`mb-2 h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * Dashboard stat card skeleton
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-purple-200/20 bg-white p-6 dark:border-purple-500/20 dark:bg-purple-900/20">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mb-2 h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/**
 * Blog post skeleton - featured image + content
 */
export function BlogPostSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-purple-200/20 bg-white/70 backdrop-blur-sm dark:border-purple-500/20 dark:bg-purple-900/20">
      <Skeleton className="h-48 w-full" />
      <div className="p-5">
        <Skeleton className="mb-3 h-5 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table skeleton - for admin tables
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-purple-200/20 dark:border-purple-500/20">
      <div className="border-b border-purple-200/20 p-4 dark:border-purple-500/20">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="border-b border-purple-200/10 p-4 dark:border-purple-500/10">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-4 w-24" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Chart skeleton - for dashboard charts
 */
export function ChartSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="rounded-2xl border border-purple-200/20 bg-white p-6 dark:border-purple-500/20 dark:bg-purple-900/20">
      <Skeleton className="mb-4 h-6 w-48" />
      <Skeleton className="h-[200px] w-full rounded-xl" style={{ height: `${height - 50}px` }} />
    </div>
  );
}