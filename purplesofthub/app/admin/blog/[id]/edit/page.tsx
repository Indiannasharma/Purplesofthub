import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditBlogPostForm from './EditBlogPostForm'

export default async function EditBlogPost({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!post) redirect('/admin/blog')

  return <EditBlogPostForm post={post} />
}
