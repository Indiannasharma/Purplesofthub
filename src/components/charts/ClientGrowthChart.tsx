'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ApexCharts = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
)

interface ClientGrowthProps {
  data: {
    month: string
    count: number
  }[]
}

export default function ClientGrowthChart({
  data
}: ClientGrowthProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: 220,
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Outfit, sans-serif',
    },
    theme: { mode: 'dark' },
    colors: ['#a855f7'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 4,
      colors: ['#a855f7'],
      strokeColors: '#0a0618',
      strokeWidth: 2
    },
    xaxis: {
      categories: data.map(d => d.month),
      labels: {
        style: { colors: '#9d8fd4' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#9d8fd4' }
      }
    },
    grid: {
      borderColor: 'rgba(124,58,237,0.1)',
      strokeDashArray: 4
    },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark' }
  }

  const series = [{
    name: 'New Clients',
    data: data.map(d => d.count)
  }]

  if (!mounted) return (
    <div className="h-[220px] animate-pulse bg-white/5 rounded-lg" />
  )

  return (
    <ApexCharts
      options={options}
      series={series}
      type="line"
      height={220}
    />
  )
}
