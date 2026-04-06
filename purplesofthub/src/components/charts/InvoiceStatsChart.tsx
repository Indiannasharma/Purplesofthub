'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const ApexCharts = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
)

interface InvoiceStatsProps {
  data: {
    month: string
    paid: number
    pending: number
    overdue: number
  }[]
}

export default function InvoiceStatsChart({
  data
}: InvoiceStatsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 220,
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Outfit, sans-serif',
      stacked: true
    },
    theme: { mode: 'dark' },
    colors: ['#10b981', '#facc15', '#ef4444'],
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
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%'
      }
    },
    legend: {
      labels: { colors: '#9d8fd4' }
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

  const series = [
    {
      name: 'Paid',
      data: data.map(d => d.paid)
    },
    {
      name: 'Pending',
      data: data.map(d => d.pending)
    },
    {
      name: 'Overdue',
      data: data.map(d => d.overdue)
    }
  ]

  if (!mounted) return (
    <div className="h-[220px] animate-pulse bg-white/5 rounded-lg" />
  )

  return (
    <ApexCharts
      options={options}
      series={series}
      type="bar"
      height={220}
    />
  )
}
