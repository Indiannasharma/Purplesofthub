'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiUsers, FiBox, FiFileText, FiDollarSign, FiArrowUpRight, FiTrendingUp } from 'react-icons/fi'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)' }}>
              <div className="h-4 bg-gradient-to-r from-purple-900/30 to-transparent rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gradient-to-r from-purple-900/20 to-transparent rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 border border-red-900/50" style={{ background: 'rgba(239,68,68,0.1)' }}>
        <p className="text-red-400 font-medium">Failed to load dashboard data. Please try again.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-2xl p-6 border border-yellow-900/50" style={{ background: 'rgba(202,138,4,0.1)' }}>
        <p className="text-yellow-400 font-medium">No data available.</p>
      </div>
    )
  }

  const { role, stats, recentClients, recentProjects, recentInvoices, recentMusicCampaigns } = data

  const statCards = role === 'admin'
    ? [
        { label: 'Total Clients', value: stats.totalClients, icon: FiUsers, color: '#a855f7', gradient: 'from-purple-600 to-purple-900' },
        { label: 'Total Projects', value: stats.totalProjects, icon: FiBox, color: '#06b6d4', gradient: 'from-cyan-600 to-cyan-900' },
        { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: '#10b981', gradient: 'from-green-600 to-green-900' },
        { label: 'Active Projects', value: stats.totalProjects, icon: FiTrendingUp, color: '#f59e0b', gradient: 'from-amber-600 to-amber-900' },
      ]
    : [
        { label: 'Total Projects', value: stats.totalProjects, icon: FiBox, color: '#a855f7', gradient: 'from-purple-600 to-purple-900' },
        { label: 'Active Projects', value: stats.activeProjects, icon: FiTrendingUp, color: '#06b6d4', gradient: 'from-cyan-600 to-cyan-900' },
        { label: 'Total Invoices', value: stats.totalInvoices, icon: FiFileText, color: '#10b981', gradient: 'from-green-600 to-green-900' },
        { label: 'Pending Invoices', value: stats.pendingInvoices, icon: FiArrowUpRight, color: '#ef4444', gradient: 'from-red-600 to-red-900' },
      ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {role === 'admin' ? 'Admin Dashboard' : 'Welcome Back'}
            </h1>
            <p className="text-gray-400">Manage your projects, invoices, and more</p>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-6 py-3 rounded-full font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff' }}
          >
            {role === 'admin' ? '👑 Administrator' : '👤 Client'}
          </motion.div>
        </div>
      </FadeInUp>

      {/* Stats Grid */}
      <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <StaggerItem key={idx}>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl p-6 border border-purple-900/30 group cursor-pointer overflow-hidden relative"
                style={{
                  background: `linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.05))`,
                }}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, rgba(${parseInt(stat.color.slice(1, 3), 16)},${parseInt(stat.color.slice(3, 5), 16)},${parseInt(stat.color.slice(5, 7), 16)},0.05), transparent)` }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                    <div className="p-3 rounded-lg" style={{ background: `rgba(${parseInt(stat.color.slice(1, 3), 16)},${parseInt(stat.color.slice(3, 5), 16)},${parseInt(stat.color.slice(5, 7), 16)},0.15)` }}>
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <FiArrowUpRight className="w-3 h-3" />
                    <span>+12% from last month</span>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {role === 'admin' ? (
          <>
            {/* Recent Clients */}
            <FadeInUp delay={0.2}>
              <motion.div
                className="rounded-2xl p-6 border border-purple-900/30"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.05))' }}
              >
                <h3 className="text-lg font-semibold text-white mb-6">Recent Clients</h3>
                <div className="space-y-4">
                  {recentClients.map((client: any) => (
                    <div key={client.id} className="flex justify-between items-center pb-4 border-b border-purple-900/20 last:border-b-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-white">{client.full_name || client.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{client.email}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>Client</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </FadeInUp>

            {/* Recent Projects */}
            <FadeInUp delay={0.3}>
              <motion.div
                className="rounded-2xl p-6 border border-purple-900/30"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.05))' }}
              >
                <h3 className="text-lg font-semibold text-white mb-6">Recent Projects</h3>
                <div className="space-y-4">
                  {recentProjects.map((project: any) => (
                    <div key={project.id} className="flex justify-between items-center pb-4 border-b border-purple-900/20 last:border-b-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-white">{project.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{project.status}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>{project.progress}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </FadeInUp>
          </>
        ) : (
          <>
            {/* Recent Projects */}
            <FadeInUp delay={0.2}>
              <motion.div
                className="rounded-2xl p-6 border border-purple-900/30"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.05))' }}
              >
                <h3 className="text-lg font-semibold text-white mb-6">Recent Projects</h3>
                <div className="space-y-4">
                  {recentProjects.map((project: any) => (
                    <div key={project.id} className="flex justify-between items-center pb-4 border-b border-purple-900/20 last:border-b-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-white">{project.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{project.service_type}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: project.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(168,85,247,0.2)', color: project.status === 'completed' ? '#10b981' : '#a855f7' }}>
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </FadeInUp>

            {/* Recent Invoices */}
            <FadeInUp delay={0.3}>
              <motion.div
                className="rounded-2xl p-6 border border-purple-900/30"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.05))' }}
              >
                <h3 className="text-lg font-semibold text-white mb-6">Recent Invoices</h3>
                <div className="space-y-4">
                  {recentInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex justify-between items-center pb-4 border-b border-purple-900/20 last:border-b-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-white">${invoice.amount}</p>
                        <p className="text-xs text-gray-400 mt-1">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: invoice.status === 'paid' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: invoice.status === 'paid' ? '#10b981' : '#ef4444' }}>
                        {invoice.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </FadeInUp>

            {/* Music Campaigns */}
            {recentMusicCampaigns.length > 0 && (
              <FadeInUp delay={0.4} className="lg:col-span-2">
                <motion.div
                  className="rounded-2xl p-6 border border-purple-900/30"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.05))' }}
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Music Campaigns</h3>
                  <div className="space-y-4">
                    {recentMusicCampaigns.map((campaign: any) => (
                      <div key={campaign.id} className="flex justify-between items-center pb-4 border-b border-purple-900/20 last:border-b-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-white">{campaign.track_title}</p>
                          <p className="text-xs text-gray-400 mt-1">by {campaign.artist_name}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
                          {campaign.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeInUp>
            )}
          </>
        )}
      </div>
    </div>
  )
}
