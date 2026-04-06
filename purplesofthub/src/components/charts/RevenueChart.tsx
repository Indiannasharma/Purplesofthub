'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ApexCharts = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
)

interface RevenueChartProps {
  data: {
    month: string
    revenue: number
  }[]
}

export default function RevenueChart({
  data
}: RevenueChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 310,
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Outfit, sans-serif',
    },
    theme: { mode: 'dark' },
    colors: ['#7c3aed'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100]
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: ['#7c3aed']
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
        style: { colors: '#9d8fd4' },
        formatter: (val) =>
          `₦${(val/1000).toFixed(0)}k`
      }
    },
    grid: {
      borderColor: 'rgba(124,58,237,0.1)',
      strokeDashArray: 4
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val) =>
          `₦${val.toLocaleString()}`
      }
    }
  }

  const series = [{
    name: 'Revenue',
    data: data.map(d => d.revenue)
  }]

  if (!mounted) return (
    <div className="h-[310px] animate-pulse bg-white/5 rounded-lg" />
  )

  return (
    <ApexCharts
      options={options}
      series={series}
      type="area"
      height={310}
    />
  )
}
