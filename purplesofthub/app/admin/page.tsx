'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const ReactApexChart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
)

interface DashboardStats {
  totalClients: number
  activeProjects: number
  pendingInvoices: number
  totalLeads: number
  newsletterSubs: number
  recoveryRequests: number
  musicCampaigns: number
  blogPosts: number
  newClientsThisMonth: number
  revenueThisMonth: number
}

interface RecentLead {
  id: string
  full_name?: string
  name?: string
  email: string
  service: string
  created_at: string
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeProjects: 0,
    pendingInvoices: 0,
    totalLeads: 0,
    newsletterSubs: 0,
    recoveryRequests: 0,
    musicCampaigns: 0,
    blogPosts: 0,
    newClientsThisMonth: 0,
    revenueThisMonth: 0,
  })
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [monthlyData, setMonthlyData] = useState<number[]>(
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  )
  const [serviceData, setServiceData] = useState({
    labels: ['Web Dev', 'Marketing', 'Music', 'Recovery', 'Design', 'Other'],
    series: [35, 25, 15, 10, 10, 5],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    const supabase = createClient()

    try {
      const [
        clientsRes,
        projectsRes,
        invoicesRes,
        leadsRes,
        newsletterRes,
        recoveryRes,
        musicRes,
        blogRes,
      ] = await Promise.allSettled([
        supabase.from('profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('projects').select('id, status', { count: 'exact' }).eq('status', 'active'),
        supabase.from('invoices').select('id, status, amount', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('chat_leads').select('id, full_name, email, service, created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact' }),
        supabase.from('account_recovery_requests').select('id', { count: 'exact' }),
        supabase.from('music_campaigns').select('id', { count: 'exact' }),
        supabase.from('blog_posts').select('id', { count: 'exact' }),
      ])

      // Build monthly signups chart data
      if (clientsRes.status === 'fulfilled' && clientsRes.value.data) {
        const monthly = new Array(12).fill(0)
        const currentYear = new Date().getFullYear()

        clientsRes.value.data.forEach((client: any) => {
          const date = new Date(client.created_at)
          if (date.getFullYear() === currentYear) {
            monthly[date.getMonth()]++
          }
        })
        setMonthlyData(monthly)
      }

      // Build service breakdown from leads
      if (leadsRes.status === 'fulfilled' && leadsRes.value.data) {
        setRecentLeads(leadsRes.value.data as RecentLead[])

        const serviceCounts: Record<string, number> = {}
        leadsRes.value.data.forEach((lead: any) => {
          const s = lead.service || 'Other'
          serviceCounts[s] = (serviceCounts[s] || 0) + 1
        })

        if (Object.keys(serviceCounts).length > 0) {
          setServiceData({
            labels: Object.keys(serviceCounts),
            series: Object.values(serviceCounts),
          })
        }
      }

      setStats({
        totalClients: clientsRes.status === 'fulfilled' ? clientsRes.value.count || 0 : 0,
        activeProjects: projectsRes.status === 'fulfilled' ? projectsRes.value.count || 0 : 0,
        pendingInvoices: invoicesRes.status === 'fulfilled' ? invoicesRes.value.count || 0 : 0,
        totalLeads: leadsRes.status === 'fulfilled' ? leadsRes.value.data?.length || 0 : 0,
        newsletterSubs: newsletterRes.status === 'fulfilled' ? newsletterRes.value.count || 0 : 0,
        recoveryRequests: recoveryRes.status === 'fulfilled' ? recoveryRes.value.count || 0 : 0,
        musicCampaigns: musicRes.status === 'fulfilled' ? musicRes.value.count || 0 : 0,
        blogPosts: blogRes.status === 'fulfilled' ? blogRes.value.count || 0 : 0,
        newClientsThisMonth: monthlyData[new Date().getMonth()],
        revenueThisMonth: 0,
      })
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── CHART CONFIGS ──

  const clientGrowthChart = {
    series: [{
      name: 'New Clients',
      data: monthlyData,
    }],
    options: {
      chart: {
        type: 'area' as const,
        height: 280,
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'inherit',
      },
      colors: ['#7c3aed'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      stroke: {
        curve: 'smooth' as const,
        width: 3,
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: {
            colors: '#9d8fd4',
            fontSize: '12px',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#9d8fd4',
            fontSize: '12px',
          },
        },
      },
      grid: {
        borderColor: 'rgba(124,58,237,0.1)',
        strokeDashArray: 4,
      },
      dataLabels: { enabled: false },
      tooltip: {
        theme: 'dark',
        style: { fontSize: '12px' },
      },
    },
  }

  const serviceBreakdownChart = {
    series: serviceData.series,
    options: {
      chart: {
        type: 'donut' as const,
        background: 'transparent',
        fontFamily: 'inherit',
      },
      colors: ['#7c3aed', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
      labels: serviceData.labels,
      legend: {
        position: 'bottom' as const,
        labels: { colors: '#9d8fd4' },
        fontSize: '12px',
      },
      dataLabels: {
        style: { fontSize: '11px' },
      },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Leads',
                color: '#9d8fd4',
                fontSize: '13px',
                formatter: () => String(stats.totalLeads),
              },
            },
          },
        },
      },
      tooltip: { theme: 'dark' },
    },
  }

  const revenueBarChart = {
    series: [{
      name: 'Revenue (₦)',
      data: [1200000, 1800000, 1400000, 2200000, 1900000, 2800000, 2100000, 3200000, 2700000, 3500000, 3100000, 4200000],
    }],
    options: {
      chart: {
        type: 'bar' as const,
        height: 280,
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'inherit',
      },
      colors: ['#a855f7'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '55%',
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: {
            colors: '#9d8fd4',
            fontSize: '12px',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#9d8fd4',
            fontSize: '12px',
          },
          formatter: (val: number) => `₦${(val / 1000000).toFixed(1)}M`,
        },
      },
      grid: {
        borderColor: 'rgba(124,58,237,0.1)',
        strokeDashArray: 4,
      },
      dataLabels: { enabled: false },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val: number) => `₦${val.toLocaleString()}`,
        },
      },
    },
  }

  // ── STAT CARDS ──
  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: '👥', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', change: '+12%', up: true, href: '/admin/clients' },
    { label: 'Active Projects', value: stats.activeProjects, icon: '📁', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', change: '+5%', up: true, href: '/admin/projects' },
    { label: 'Pending Invoices', value: stats.pendingInvoices, icon: '💳', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', change: '-3%', up: false, href: '/admin/invoices' },
    { label: 'Contact Leads', value: stats.totalLeads, icon: '📩', color: '#10b981', bg: 'rgba(16,185,129,0.12)', change: '+18%', up: true, href: '/admin/leads' },
    { label: 'Newsletter Subs', value: stats.newsletterSubs, icon: '📧', color: '#ec4899', bg: 'rgba(236,72,153,0.12)', change: '+24%', up: true, href: '/admin/subscribers' },
    { label: 'Music Campaigns', value: stats.musicCampaigns, icon: '🎵', color: '#f97316', bg: 'rgba(249,115,22,0.12)', change: '+8%', up: true, href: '/admin/music' },
    { label: 'Recovery Requests', value: stats.recoveryRequests, icon: '🔐', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', change: '+2', up: true, href: '/admin/recovery' },
    { label: 'Blog Posts', value: stats.blogPosts, icon: '✍️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', change: 'Published', up: true, href: '/admin/blog' },
  ]

  const clientLocations = [
    { country: 'Nigeria 🇳🇬', clients: 45, pct: 45 },
    { country: 'United Kingdom 🇬🇧', clients: 18, pct: 18 },
    { country: 'United States 🇺🇸', clients: 15, pct: 15 },
    { country: 'Canada 🇨🇦', clients: 10, pct: 10 },
    { country: 'Ghana 🇬🇭', clients: 8, pct: 8 },
    { country: 'Germany 🇩🇪', clients: 4, pct: 4 },
  ]

  return (
    <div style={{
      padding: 'clamp(16px, 2.5vw, 28px)',
      maxWidth: '1400px',
      width: '100%',
    }}>

      {/* ── PAGE HEADER ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(20px, 2.5vw, 28px)',
            fontWeight: 900,
            margin: '0 0 4px',
            color: 'var(--admin-h, #1a1a1a)',
          }}>
            Admin Overview 🛠️
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--admin-b, #6b5fa0)',
            margin: 0,
          }}>
            Welcome back! Here's your business snapshot.
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '10px',
        }}>
          <Link href="/admin/blog/new" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            padding: '9px 18px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
          }}>
            ✍️ New Blog Post
          </Link>
          <Link href="/admin/clients" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.25)',
            color: '#7c3aed',
            padding: '9px 18px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 700,
          }}>
            👥 View Clients
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--admin-card, #ffffff)',
              border: '1px solid var(--admin-border, rgba(124,58,237,0.1))',
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.25s',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = card.color
              el.style.transform = 'translateY(-3px)'
              el.style.boxShadow = `0 8px 24px ${card.color}20`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = 'var(--admin-border, rgba(124,58,237,0.1))'
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: card.bg,
                opacity: 0.6,
              }}/>

              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '14px',
                position: 'relative',
              }}>
                {card.icon}
              </div>

              <p style={{
                fontSize: 'clamp(22px, 2.5vw, 30px)',
                fontWeight: 900,
                color: card.color,
                margin: '0 0 4px',
                lineHeight: 1,
              }}>
                {loading ? (
                  <span style={{
                    display: 'inline-block',
                    width: '40px',
                    height: '28px',
                    background: 'rgba(124,58,237,0.1)',
                    borderRadius: '6px',
                    animation: 'shimmer 1.5s infinite',
                  }}/>
                ) : card.value}
              </p>

              <p style={{
                fontSize: '12px',
                color: 'var(--admin-b, #6b5fa0)',
                margin: '0 0 8px',
                fontWeight: 500,
              }}>
                {card.label}
              </p>

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: card.up ? '#10b981' : '#ef4444',
                background: card.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                padding: '2px 8px',
                borderRadius: '100px',
              }}>
                {card.up ? '↑' : '↓'} {card.change}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '20px',
        marginBottom: '20px',
      }} className="admin-chart-row">

        {/* Client Growth Chart */}
        <div style={{
          background: 'var(--admin-card, #ffffff)',
          border: '1px solid var(--admin-border, rgba(124,58,237,0.1))',
          borderRadius: '20px',
          padding: '24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--admin-h, #1a1a1a)',
                margin: '0 0 4px',
              }}>
                Client Growth
              </h3>
              <p style={{
                fontSize: '12px',
                color: 'var(--admin-b, #6b5fa0)',
                margin: 0,
              }}>
                New clients per month — {new Date().getFullYear()}
              </p>
            </div>
          </div>
          <ReactApexChart
            options={clientGrowthChart.options}
            series={clientGrowthChart.series}
            type="area"
            height={250}
          />
        </div>

        {/* Service Breakdown Donut */}
        <div style={{
          background: 'var(--admin-card, #ffffff)',
          border: '1px solid var(--admin-border, rgba(124,58,237,0.1))',
          borderRadius: '20px',
          padding: '24px',
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--admin-h, #1a1a1a)',
              margin: '0 0 4px',
            }}>
              Service Breakdown
            </h3>
            <p style={{
              fontSize: '12px',
              color: 'var(--admin-b, #6b5fa0)',
              margin: 0,
            }}>
              Leads by service type
            </p>
          </div>
          <ReactApexChart
            options={serviceBreakdownChart.options}
            series={serviceBreakdownChart.series}
            type="donut"
            height={250}
          />
        </div>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px',
      }} className="admin-chart-row">

        {/* Revenue Chart */}
        <div style={{
          background: 'var(--admin-card, #ffffff)',
          border: '1px solid var(--admin-border, rgba(124,58,237,0.1))',
          borderRadius: '20px',
          padding: '24px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--admin-h, #1a1a1a)',
                margin: '0 0 4px',
              }}>
                Revenue Overview
              </h3>
              <p style={{
                fontSize: '12px',
                color: 'var(--admin-b, #6b5fa0)',
                margin: 0,
              }}>
                Monthly revenue projection (₦)
              </p>
            </div>
          </div>
          <ReactApexChart
            options={revenueBarChart.options}
            series={revenueBarChart.series}
            type="bar"
            height={230}
          />
        </div>

        {/* Client Locations */}
        <div style={{
          background: 'var(--admin-card, #ffffff)',
          border: '1px solid var(--admin-border, rgba(124,58,237,0.1))',
          borderRadius: '20px',
          padding: '24px',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--admin-h, #1a1a1a)',
              margin: '0 0 4px',
            }}>
              Client Demographics
            </h3>
            <p style={{
              fontSize: '12px',
              color: 'var(--admin-b, #6b5fa0)',
              margin: 0,
            }}>
              Clients by country
            </p>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {clientLocations.map(loc => (
              <div key={loc.country} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--admin-h, #1a1a1a)',
                  minWidth: '160px',
                  whiteSpace: 'nowrap',
                }}>
                  {loc.country}
                </span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  background: 'rgba(124,58,237,0.1)',
                  borderRadius: '100px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${loc.pct}%`,
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    borderRadius: '100px',
                    transition: 'width 1s ease',
                  }}/>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#7c3aed',
                  minWidth: '36px',
                  textAlign: 'right',
                }}>
                  {loc.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT LEADS TABLE ── */}
      <div style={{
        background: 'var(--admin-card, #ffffff)',
        border: '1px solid var(--admin-border, rgba(124,58,237,0.1))',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '20px',
        overflowX: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--admin-h, #1a1a1a)',
              margin: '0 0 4px',
            }}>
              Recent Contact Leads 📩
            </h3>
            <p style={{
              fontSize: '12px',
              color: 'var(--admin-b, #6b5fa0)',
              margin: 0,
            }}>
              Latest enquiries from website
            </p>
          </div>
          <Link href="/admin/leads" style={{
            fontSize: '13px',
            color: '#7c3aed',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            View all →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 20px',
          }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>
              📭
            </p>
            <p style={{
              fontSize: '14px',
              color: 'var(--admin-b, #6b5fa0)',
              margin: 0,
            }}>
              No leads yet — they will appear here when people fill the contact form
            </p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            minWidth: '500px',
          }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--admin-border, rgba(124,58,237,0.1))',
              }}>
                {['Name', 'Email', 'Service', 'Date'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--admin-b, #9d8fd4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLeads.map(lead => (
                <tr key={lead.id} style={{
                  borderBottom: '1px solid var(--admin-border, rgba(124,58,237,0.06))',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(124,58,237,0.04)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                }}>
                  <td style={{
                    padding: '12px',
                    fontWeight: 600,
                    color: 'var(--admin-h, #1a1a1a)',
                  }}>
                    {lead.full_name || lead.name}
                  </td>
                  <td style={{
                    padding: '12px',
                    color: 'var(--admin-b, #6b5fa0)',
                  }}>
                    {lead.email}
                  </td>
                  <td style={{
                    padding: '12px',
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      background: 'rgba(124,58,237,0.1)',
                      color: '#7c3aed',
                      padding: '3px 10px',
                      borderRadius: '100px',
                    }}>
                      {lead.service || 'General'}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px',
                    color: 'var(--admin-b, #6b5fa0)',
                    whiteSpace: 'nowrap',
                    fontSize: '12px',
                  }}>
                    {new Date(lead.created_at).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── QUICK ACTIONS GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '12px',
      }}>
        {[
          { icon: '✍️', label: 'New Blog Post', href: '/admin/blog/new', color: '#7c3aed' },
          { icon: '👤', label: 'Add Client', href: '/admin/clients', color: '#3b82f6' },
          { icon: '📁', label: 'New Project', href: '/admin/projects/new', color: '#10b981' },
          { icon: '💳', label: 'Create Invoice', href: '/admin/invoices/new', color: '#f59e0b' },
          { icon: '📧', label: 'Subscribers', href: '/admin/subscribers', color: '#ec4899' },
          { icon: '🔐', label: 'Recovery Queue', href: '/admin/recovery', color: '#ef4444' },
        ].map(action => (
          <Link key={action.label} href={action.href} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '20px 16px',
            background: 'var(--admin-card, #ffffff)',
            border: '1px solid var(--admin-border, rgba(124,58,237,0.1))',
            borderRadius: '16px',
            textDecoration: 'none',
            transition: 'all 0.2s',
            textAlign: 'center',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.borderColor = action.color
            el.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.borderColor = 'var(--admin-border, rgba(124,58,237,0.1))'
            el.style.transform = 'translateY(0)'
          }}>
            <span style={{ fontSize: '24px' }}>
              {action.icon}
            </span>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: action.color,
            }}>
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      <style>{`
        :root {
          --admin-h: #1a1a1a;
          --admin-b: #6b5fa0;
          --admin-card: #ffffff;
          --admin-border: rgba(124,58,237,0.1);
        }
        .dark {
          --admin-h: #ffffff;
          --admin-b: #9d8fd4;
          --admin-card: #1a1f2e;
          --admin-border: rgba(124,58,237,0.15);
        }
        @keyframes shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @media (max-width: 900px) {
          .admin-chart-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
