import test from 'node:test'
import assert from 'node:assert/strict'
import {editorialQuery,publishedParams,searchTerm} from '../../lib/blog/queries.ts'
test('the public feed is bounded, ordered and always published-only',()=>{
  const params=publishedParams({limit:3});assert.equal(params.get('status'),'eq.published');assert.equal(params.get('limit'),'3');
  assert.equal(params.get('offset'),'0');assert.ok(params.get('order').startsWith('published_at.desc'));assert.ok(!params.get('select').includes('read_time'))
  assert.equal(publishedParams({limit:999,page:2}).get('limit'),'12');assert.equal(publishedParams({limit:12,page:2}).get('offset'),'12')
})
test('search grammar cannot replace the public publication filter',()=>{
  const params=publishedParams({search:'hello),status.eq.draft,*'});assert.equal(params.get('status'),'eq.published');
  assert.ok(!searchTerm('hello),status.eq.draft,*').includes(')'));assert.equal(publishedParams({category:'Technology'}).get('category'),'eq.Technology')
})
test('editorial filters have safe defaults and bounded page/search inputs',()=>{
  assert.deepEqual(editorialQuery({}),{page:1,search:'',status:'all',category:'',author:'',sort:'newest'})
  assert.equal(editorialQuery({page:'NaN',status:'deleted',sort:'random'}).page,1)
  assert.equal(editorialQuery({q:'x'.repeat(400)}).search.length,100)
  assert.equal(editorialQuery({page:'2',status:'draft',sort:'updated'}).sort,'updated')
})
