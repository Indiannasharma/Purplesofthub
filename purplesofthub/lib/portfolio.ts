import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { PortfolioProject, PortfolioCategory, PortfolioIndustry, PortfolioService, PortfolioClient, PortfolioTestimonial, MediaItem } from '@/types/portfolio'

export const toSlug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().substring(0, 100)

// ── PROJECTS ──
export async function getPublishedProjects() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  if (error) { console.error('[portfolio] getPublishedProjects:', error.message); return [] }
  return (data || []) as PortfolioProject[]
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) { console.error('[portfolio] getProjectBySlug:', error.message); return null }
  return data as PortfolioProject | null
}

export async function getAdminProjects() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('[portfolio] getAdminProjects:', error.message); return [] }
  return (data || []) as PortfolioProject[]
}

export async function getFeaturedProjects() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6)
  if (error) { console.error('[portfolio] getFeaturedProjects:', error.message); return [] }
  return (data || []) as PortfolioProject[]
}

// ── CREATE Project (Admin) ──
export async function createProject(adminId: string, projectData: any) {
  const supabase = await createServerClient()
  
  const payload = {
    ...projectData,
    slug: projectData.slug || toSlug(projectData.title || ''),
    status: projectData.status || 'draft',
    featured: projectData.featured || false,
    view_count: 0,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('portfolio_projects')
    .insert(payload)
    .select()
    .single()
  
  if (error) { console.error('[portfolio] createProject:', error.message); return null }
  return data as PortfolioProject
}

// ── UPDATE Project (Admin) ──
export async function updateProject(projectId: string, projectData: any) {
  const supabase = await createServerClient()
  
  const payload = {
    ...projectData,
    slug: projectData.slug || toSlug(projectData.title || ''),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('portfolio_projects')
    .update(payload)
    .eq('id', projectId)
    .select()
    .single()
  
  if (error) { console.error('[portfolio] updateProject:', error.message); return null }
  return data as PortfolioProject
}

// ── DELETE / Archive Project (Admin) ──
export async function deleteProject(projectId: string, status: 'archived' = 'archived') {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single()
  
  if (error) { console.error('[portfolio] deleteProject:', error.message); return null }
  return data as PortfolioProject
}

// ── CATEGORIES ──
export async function getCategories() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('portfolio_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) { console.error('[portfolio] getCategories:', error.message); return [] }
  return (data || []) as PortfolioCategory[]
}

export async function createCategory(categoryData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_categories')
    .insert({
      ...categoryData,
      slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim(),
      sort_order: categoryData.sort_order ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) { console.error('[portfolio] createCategory:', error.message); return null }
  return data as PortfolioCategory
}

export async function updateCategory(categoryId: string, categoryData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_categories')
    .update({
      ...categoryData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', categoryId)
    .select()
    .single()
  
  if (error) { console.error('[portfolio] updateCategory:', error.message); return null }
  return data as PortfolioCategory
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('portfolio_categories')
    .delete()
    .eq('id', categoryId)
  
  if (error) { console.error('[portfolio] deleteCategory:', error.message); return false }
  return true
}

// ── INDUSTRIES ──
export async function getIndustries() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('portfolio_industries')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) { console.error('[portfolio] getIndustries:', error.message); return [] }
  return (data || []) as PortfolioIndustry[]
}

export async function createIndustry(industryData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_industries')
    .insert({
      ...industryData,
      slug: industryData.slug || industryData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim(),
      sort_order: industryData.sort_order ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) { console.error('[portfolio] createIndustry:', error.message); return null }
  return data as PortfolioIndustry
}

export async function updateIndustry(industryId: string, industryData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_industries')
    .update({
      ...industryData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', industryId)
    .select()
    .single()
  
  if (error) { console.error('[portfolio] updateIndustry:', error.message); return null }
  return data as PortfolioIndustry
}

export async function deleteIndustry(industryId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('portfolio_industries')
    .delete()
    .eq('id', industryId)
  
  if (error) { console.error('[portfolio] deleteIndustry:', error.message); return false }
  return true
}

// ── SERVICES ──
export async function getServices() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('portfolio_services')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) { console.error('[portfolio] getServices:', error.message); return [] }
  return (data || []) as PortfolioService[]
}

export async function createService(serviceData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_services')
    .insert({
      ...serviceData,
      slug: serviceData.slug || serviceData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim(),
      sort_order: serviceData.sort_order ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) { console.error('[portfolio] createService:', error.message); return null }
  return data as PortfolioService
}

export async function updateService(serviceId: string, serviceData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_services')
    .update({
      ...serviceData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceId)
    .select()
    .single()
  
  if (error) { console.error('[portfolio] updateService:', error.message); return null }
  return data as PortfolioService
}

export async function deleteService(serviceId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('portfolio_services')
    .delete()
    .eq('id', serviceId)
  
  if (error) { console.error('[portfolio] deleteService:', error.message); return false }
  return true
}

// ── CLIENTS ──
export async function getClients() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('portfolio_clients')
    .select('*')
    .order('name', { ascending: true })
  if (error) { console.error('[portfolio] getClients:', error.message); return [] }
  return (data || []) as PortfolioClient[]
}

export async function createClient(clientData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_clients')
    .insert({
      ...clientData,
      slug: clientData.slug || clientData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) { console.error('[portfolio] createClient:', error.message); return null }
  return data as PortfolioClient
}

export async function updateClient(clientId: string, clientData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_clients')
    .update({
      ...clientData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId)
    .select()
    .single()
  
  if (error) { console.error('[portfolio] updateClient:', error.message); return null }
  return data as PortfolioClient
}

export async function deleteClient(clientId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('portfolio_clients')
    .delete()
    .eq('id', clientId)
  
  if (error) { console.error('[portfolio] deleteClient:', error.message); return false }
  return true
}

// ── TESTIMONIALS ──
export async function getTestimonials() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('portfolio_testimonials')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('[portfolio] getTestimonials:', error.message); return [] }
  return (data || []) as PortfolioTestimonial[]
}

export async function createTestimonial(testimonialData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_testimonials')
    .insert({
      ...testimonialData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) { console.error('[portfolio] createTestimonial:', error.message); return null }
  return data as PortfolioTestimonial
}

export async function updateTestimonial(testimonialId: string, testimonialData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('portfolio_testimonials')
    .update({
      ...testimonialData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', testimonialId)
    .select()
    .single()
  
  if (error) { console.error('[portfolio] updateTestimonial:', error.message); return null }
  return data as PortfolioTestimonial
}

export async function deleteTestimonial(testimonialId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('portfolio_testimonials')
    .delete()
    .eq('id', testimonialId)
  
  if (error) { console.error('[portfolio] deleteTestimonial:', error.message); return false }
  return true
}

// ── MEDIA ──
export async function getMediaItems() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('[portfolio] getMediaItems:', error.message); return [] }
  return (data || []) as MediaItem[]
}

export async function uploadMedia(mediaData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('media_library')
    .insert({
      ...mediaData,
      created_by: mediaData.createdBy || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) { console.error('[portfolio] uploadMedia:', error.message); return null }
  return data as MediaItem
}

export async function updateMedia(mediaId: string, mediaData: any) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('media_library')
    .update({
      ...mediaData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mediaId)
    .select()
    .single()
  
  if (error) { console.error('[portfolio] updateMedia:', error.message); return null }
  return data as MediaItem
}

export async function deleteMedia(mediaId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('media_library')
    .delete()
    .eq('id', mediaId)
  
  if (error) { console.error('[portfolio] deleteMedia:', error.message); return false }
  return true
}