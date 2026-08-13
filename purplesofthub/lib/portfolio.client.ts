import { createClient } from '@/lib/supabase/client'
import type { PortfolioProject, PortfolioCategory, PortfolioIndustry, PortfolioService, PortfolioClient, PortfolioTestimonial, MediaItem } from '@/types/portfolio'

export function getBrowserClient() { return createClient() }

export async function fetchPublishedProjectsClient() {
  const supabase = createClient()
  const { data, error } = await supabase.from('portfolio_projects').select('*').eq('status', 'published').order('created_at', { ascending: false })
  if (error) { console.error('[portfolio] fetchPublishedProjectsClient:', error.message); return [] }
  return (data || []) as PortfolioProject[]
}

export async function fetchFeaturedProjectsClient() {
  const supabase = createClient()
  const { data, error } = await supabase.from('portfolio_projects').select('*').eq('status', 'published').eq('featured', true).order('created_at', { ascending: false }).limit(6)
  if (error) { console.error('[portfolio] fetchFeaturedProjectsClient:', error.message); return [] }
  return (data || []) as PortfolioProject[]
}

export async function fetchCategoriesClient() {
  const supabase = createClient()
  const { data, error } = await supabase.from('portfolio_categories').select('*').order('sort_order', { ascending: true })
  if (error) { console.error('[portfolio] fetchCategoriesClient:', error.message); return [] }
  return (data || []) as PortfolioCategory[]
}

export async function fetchIndustriesClient() {
  const supabase = createClient()
  const { data, error } = await supabase.from('portfolio_industries').select('*').order('sort_order', { ascending: true })
  if (error) { console.error('[portfolio] fetchIndustriesClient:', error.message); return [] }
  return (data || []) as PortfolioIndustry[]
}

export async function fetchServicesClient() {
  const supabase = createClient()
  const { data, error } = await supabase.from('portfolio_services').select('*').order('sort_order', { ascending: true })
  if (error) { console.error('[portfolio] fetchServicesClient:', error.message); return [] }
  return (data || []) as PortfolioService[]
}

export async function fetchClientsClient() {
  const supabase = createClient()
  const { data, error } = await supabase.from('portfolio_clients').select('*').order('name', { ascending: true })
  if (error) { console.error('[portfolio] fetchClientsClient:', error.message); return [] }
  return (data || []) as PortfolioClient[]
}

export async function fetchTestimonialsClient() {
  const supabase = createClient()
  const { data, error } = await supabase.from('portfolio_testimonials').select('*').order('created_at', { ascending: false })
  if (error) { console.error('[portfolio] fetchTestimonialsClient:', error.message); return [] }
  return (data || []) as PortfolioTestimonial[]
}

export async function fetchMediaItemsClient() {
  const supabase = createClient()
  const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false })
  if (error) { console.error('[portfolio] fetchMediaItemsClient:', error.message); return [] }
  return (data || []) as MediaItem[]
}
