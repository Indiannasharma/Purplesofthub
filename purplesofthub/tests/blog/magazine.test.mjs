import test from 'node:test'
import assert from 'node:assert/strict'
import {storyLayout,categoryGroups,readingMinutes,relatedStories,articleMarkdown} from '../../lib/blog/editorial.ts'
import {exhaustedPublishedPage} from '../../lib/blog/queries.ts'
const post=(id,category='Technology',tags=[])=>({id,slug:id,title:id,category,tags})
test('lead stories are unique and excluded from the next latest section',()=>{const layout=storyLayout([post('a'),post('a'),post('b'),post('c'),post('d')]);assert.equal(layout.lead.id,'a');assert.deepEqual(layout.secondary.map(p=>p.id),['b','c']);assert.deepEqual(layout.latest.map(p=>p.id),['d']);assert.equal(storyLayout([]).lead,undefined)})
test('small publications retain a latest story without fake secondary stories',()=>{assert.deepEqual(storyLayout([post('a'),post('b')]).latest.map(p=>p.id),['b']);assert.equal(storyLayout([post('a')]).secondary.length,0)})
test('category blocks contain only real nonempty categories and are bounded',()=>{const groups=categoryGroups([post('a'),post('a'),post('b'),post('c'),post('d'),post('e','Design'),post('f',null)]);assert.equal(groups.length,2);assert.equal(groups[0].stories.length,3);assert.ok(groups.every(g=>g.name&&g.stories.length))})
test('related stories prioritize category and tags and exclude current/duplicate stories',()=>{const current=post('a','Technology',['AI']);const result=relatedStories([post('a'),post('b','Business'),post('c','Technology'),post('d','Design',['ai']),post('c','Technology')],current);assert.deepEqual(result.map(p=>p.id),['c','d','b'])})
test('reading time derives from content, never a database field',()=>{assert.equal(readingMinutes(''),1);assert.equal(readingMinutes('word '.repeat(401)),3);assert.equal(readingMinutes('# Hello https://example.com/source'),1)})

test('out-of-range publication pages retain the real total without masking other errors',()=>{assert.equal(exhaustedPublishedPage(416,'*/4'),4);assert.equal(exhaustedPublishedPage(416,'*/0'),0);assert.equal(exhaustedPublishedPage(401,'*/4'),null);assert.equal(exhaustedPublishedPage(416,null),null);assert.equal(exhaustedPublishedPage(416,'0-3/4'),null);assert.equal(exhaustedPublishedPage(416,'*/999999999999999999999'),null)})

test('article presentation suppresses only an exact opening duplicate title',()=>{const original='# A title\n\nThe introduction.\n\n## Details\nBody';assert.equal(articleMarkdown(original,'A title'),'The introduction.\n\n## Details\nBody');assert.equal(articleMarkdown(original,'Different title'),original);assert.equal(articleMarkdown('## A title\nBody','A title'),'## A title\nBody');assert.equal(articleMarkdown('An intro\n# A title\nBody','A title'),'An intro\n# A title\nBody')})
