import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

console.log('Env check:')
console.log('  SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET ✅' : 'MISSING ❌')
console.log('  SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET ✅' : 'MISSING ❌')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Test blog_posts table
const { data: posts, error: postsError } = 
  await supabase
    .from('blog_posts')
    .select('id')
    .limit(1)

console.log('blog_posts table:', 
  postsError 
    ? '❌ ERROR: ' + postsError.message
    : '✅ EXISTS'
)

// Test blog_categories table
const { data: cats, error: catsError } = 
  await supabase
    .from('blog_categories')
    .select('name')
    .limit(10)

console.log('blog_categories table:', 
  catsError 
    ? '❌ ERROR: ' + catsError.message
    : '✅ EXISTS'
)

console.log('Categories found:', 
  cats?.map(c => c.name) || []
)

// Test insert to blog_posts
const { data: testInsert, error: insertError } = 
  await supabase
    .from('blog_posts')
    .insert({
      title: 'TEST POST - DELETE ME',
      slug: `test-${Date.now()}`,
      status: 'draft',
      content: 'test',
      excerpt: 'test',
    })
    .select('id')
    .single()

console.log('blog_posts insert test:', 
  insertError 
    ? '❌ ERROR: ' + insertError.message
    : '✅ SUCCESS - ID: ' + testInsert?.id
)

// Clean up test post
if (testInsert?.id) {
  await supabase
    .from('blog_posts')
    .delete()
    .eq('id', testInsert.id)
  console.log('Test post cleaned up ✅')
}