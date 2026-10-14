'use client'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'
import { useTheme } from '@/context/ThemeContext'
import styles from './analytics.module.css'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false, loading: () => <div className={styles.chartLoading} role="status">Preparing chart…</div> })

export default function TrendChart({ title, labels, series, bars = false }: { title: string; labels: string[]; series: { name: string; data: number[] }[]; bars?: boolean }) {
  const { resolvedTheme } = useTheme()
  const token = (name: string, fallback: string) => {
    if (typeof document === 'undefined') return fallback
    const root = document.querySelector('.cc-root')
    return root ? getComputedStyle(root).getPropertyValue(name).trim() || fallback : fallback
  }
  const options: ApexOptions = {
    chart: { toolbar: { show: false }, animations: { enabled: false }, background: 'transparent', fontFamily: 'inherit', foreColor: token('--cc-text-muted', '#716b80'), zoom: { enabled: false } },
    colors: [token('--cc-chart-1', '#7c3aed'), token('--cc-chart-2', '#14b8a6'), token('--cc-chart-3', '#f59e0b')],
    xaxis: { categories: labels, tickAmount: Math.min(5, labels.length), labels: { rotate: 0, trim: true, formatter: value => String(value).slice(5) }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { min: 0, forceNiceScale: true, decimalsInFloat: 0, labels: { formatter: value => Math.round(value).toLocaleString('en-US') } },
    grid: { borderColor: token('--cc-border', '#e8e8ef'), strokeDashArray: 4, padding: { left: 8, right: 15 } },
    stroke: { curve: 'straight', width: bars ? 0 : 2.5 }, fill: { opacity: bars ? .85 : .12, type: 'solid' },
    plotOptions: { bar: { borderRadius: 3, columnWidth: '55%' } }, dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 4 } }, tooltip: { theme: resolvedTheme === 'dark' ? 'dark' : 'light', x: { formatter: (_value, opts) => typeof opts?.dataPointIndex === 'number' ? labels[opts.dataPointIndex] || '' : '' } }, legend: { show: series.length > 1, position: 'top', horizontalAlign: 'left' },
  }
  return <div><div role="img" aria-label={title + '. Daily values available in the table below.'} className={styles.chart}><Chart options={options} series={series} type={bars ? 'bar' : 'area'} height={245} /></div><details className={styles.dataDetails}><summary>View accessible data table</summary><div className={styles.tableWrap}><table><caption>{title} · daily values</caption><thead><tr><th scope="col">Date</th>{series.map(s => <th scope="col" key={s.name}>{s.name}</th>)}</tr></thead><tbody>{labels.map((date, index) => <tr key={date}><th scope="row">{date}</th>{series.map(s => <td key={s.name}>{s.data[index].toLocaleString('en-US')}</td>)}</tr>)}</tbody></table></div></details></div>
}
