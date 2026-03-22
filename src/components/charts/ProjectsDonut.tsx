'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ApexCharts = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
)

interface ProjectsDonutProps {
  data: {
    status: string
    count: number
  }[]
}

export default function ProjectsDonut({
  data
}: ProjectsDonutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const statusColors: Record<string, string> = {
    pending: '#facc15',
    in_progress: '#7c3aed',
    completed: '#10b981',
    cancelled: '#ef4444',
    on_hold: '#6b7280'
  }

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'Outfit, sans-serif',
    },
    theme: { mode: 'dark' },
    colors: data.map(d =>
      statusColors[d.status] || '#7c3aed'
    ),
    labels: data.map(d =>
      d.status.replace('_', ' ')
        .replace(/\b\w/g, l =>
          l.toUpperCase()
        )
    ),
    legend: {
      position: 'bottom',
      labels: { colors: '#9d8fd4' }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: '#9d8fd4',
              formatter: (w) =>
                w.globals.seriesTotals
                  .reduce((a: number, b: number) =>
                    a + b, 0
                  ).toString()
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark' }
  }

  if (!mounted) return (
    <div className="h-[280px] animate-pulse bg-white/5 rounded-lg" />
  )

  return (
    <ApexCharts
      options={options}
      series={data.map(d => d.count)}
      type="donut"
      height={280}
    />
  )
}
