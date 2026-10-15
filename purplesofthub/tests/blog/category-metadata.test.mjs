import test from 'node:test'
import assert from 'node:assert/strict'
import { archiveMetadata, categoryPresentation } from '../../lib/blog/category-metadata.ts'
import { publishedParams } from '../../lib/blog/queries.ts'
import { publishBlog } from '../../lib/blog/publishing.ts'

const categories=[{name:'Gaming',slug:'gaming'},{name:'How-To & Tutorials',slug:'how-to'}]

test('new category SEO has exact titles and stable canonicals independent of search/page',()=>{
  const titles=['Gaming News, Reviews & Updates | PurpleSoftHub Insights','How-To Guides & Tutorials | PurpleSoftHub Insights']
  for(const [i,category] of categories.entries()) {
    const metadata=archiveMetadata(category)
    const canonical='https://www.purplesofthub.com/blog?category='+category.slug
    assert.deepEqual(metadata.title,{absolute:titles[i]})
    assert.equal(metadata.alternates.canonical,canonical)
    assert.equal(metadata.openGraph.url,canonical)
    assert.equal(metadata.openGraph.title,titles[i])
    assert.equal(metadata.twitter.description,metadata.description)
    assert.ok(categoryPresentation(category).emptyDescription)
    assert.equal(publishedParams({category:category.name}).get('category'),'eq.'+category.name)
  }
})

test('default and existing category metadata retain their previous canonical and title',()=>{
  for(const category of [undefined,{name:'Technology',slug:'technology'},{name:'Unknown',slug:'__proto__'},{name:'Not Gaming',slug:'gaming'}]) {
    assert.equal(archiveMetadata(category).title,'Blog')
    assert.equal(archiveMetadata(category).alternates.canonical,'https://www.purplesofthub.com/blog')
    assert.equal(categoryPresentation(category),undefined)
  }
})

test('publisher accepts both canonical names and slugs with Organization identity',async()=>{
  const saved=[]
  const db={async categories(){return categories},async findBySlug(){return null},async insert(values){saved.push(values);return {...values,id:'test-id'} }}
  for(const category of categories) for(const input of [category.name,category.slug]) {
    const result=await publishBlog({title:'An editorial draft',category:input},db)
    assert.equal(result.post.category,category.name)
    assert.equal(result.post.author_name,'PurpleSoftHub')
    assert.equal(result.post.author_type,'Organization')
    assert.equal(result.post.status,'draft')
  }
  assert.equal(saved.length,4)
})
