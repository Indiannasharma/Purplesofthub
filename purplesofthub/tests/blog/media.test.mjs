import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url), root=path.resolve(import.meta.dirname,'../..');
function loader(overrides={}){
 const cache=new Map();
 function load(file){if(cache.has(file))return cache.get(file);const loaded={exports:{}};
  const local=name=>{if(Object.hasOwn(overrides,name))return overrides[name];if(name.endsWith('.css'))return {__esModule:true,default:{}};
   if(name.startsWith('@/')||name.startsWith('.')){const base=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);return load(existsSync(path.join(root,base+'.ts'))?base+'.ts':base+'.tsx')}
   return require(name)};
  const code=ts.transpileModule(readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',code)(local,loaded,loaded.exports);cache.set(file,loaded.exports);return loaded.exports;}
 return load;
}
const load=loader(), {recognizeMedia,serializeMedia,validateMediaBlock,mediaDocument}=load('lib/blog/media.ts');
const {articleSegments,editMedia}=load('lib/blog/media-content.ts');
const cases=[
 ['youtube','https://youtu.be/M7lc1UVf-VE?si=secret','https://www.youtube-nocookie.com/embed/M7lc1UVf-VE'],
 ['youtube','https://www.youtube.com/shorts/M7lc1UVf-VE',null],
 ['tiktok','https://www.tiktok.com/@scout2015/video/6718335390845095173',null],
 ['facebook','https://www.facebook.com/example/videos/10152454700553553/',null],
 ['facebook','https://www.facebook.com/example/posts/1234567890',null],
 ['facebook','https://www.facebook.com/watch/?v=1234567890',null],
 ['x','https://twitter.com/example/status/1234567890?s=20',null],
 ['threads','https://www.threads.com/@example/post/C8H1eEbRQ0X',null],
 ['reddit','https://www.reddit.com/r/technology/comments/abc123/example/',null],
 ['spotify','https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=secret',null],
 ...['album','playlist','artist'].map(t=>['spotify','https://open.spotify.com/'+t+'/4uLU6hMCjMI75M1A2tKUQC',null]),
 ...['song','album','playlist'].map(t=>['audiomack','https://audiomack.com/example/'+t+'/example-title',null]),
 ['apple-music','https://music.apple.com/us/album/example/1234567890?i=1234567891',null],
 ['apple-music','https://music.apple.com/us/song/example/1234567890',null],
 ['apple-music','https://music.apple.com/us/playlist/example/pl.1234567890abcdef',null],
];
test('explicit registry recognizes supported content formats and canonicalizes URLs',()=>{
 for(const [provider,url,frame] of cases){const spec=recognizeMedia(url,'Caption');assert.ok(spec,url);assert.equal(spec.provider,provider);assert.equal(spec.caption,'Caption');assert.ok(!spec.sourceUrl.includes('secret'));if(frame)assert.equal(spec.frameUrl,frame);assert.deepEqual(validateMediaBlock(JSON.parse(JSON.stringify(spec))),JSON.parse(serializeMedia(spec).split('\n')[3]));}
 assert.equal(recognizeMedia(cases[1][1]).variant,'vertical');
 assert.ok(recognizeMedia('https://www.facebook.com/example/posts/pfbid0123456789ABCDEFGHIJ'));
 assert.ok(recognizeMedia('https://music.apple.com/us/album/caf%C3%A9/1234567890'));
 assert.equal(recognizeMedia('https://music.apple.com/us/artist/example/1234567890').frameUrl,undefined);
});
test('untrusted HTML, protocols, spoofed hosts, credentials, redirects and malformed IDs are rejected',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,x','http://youtube.com/watch?v=M7lc1UVf-VE','https://youtube.com.evil.test/watch?v=M7lc1UVf-VE','https://evil.test','https://user:pass@youtube.com/watch?v=M7lc1UVf-VE','https://youtube.com:8443/watch?v=M7lc1UVf-VE','https://youtube.com/redirect?q=https://evil.test','https://youtu.be/invalid','https://vm.tiktok.com/short','https://open.spotify.com/track/short','https://youtube.com/%2fwatch','<iframe src="https://youtube.com"></iframe>','https://www.youtube.com\\@evil.test/watch?v=M7lc1UVf-VE'])assert.equal(recognizeMedia(url),null,url);
 const item=recognizeMedia(cases[0][1]);assert.equal(validateMediaBlock({...item,provider:'x'}),null);assert.equal(validateMediaBlock({...item,variant:'audio'}),null);assert.equal(validateMediaBlock({...item,contentId:'other'}),null);
});
test('structured blocks round-trip and reject forged player attributes',()=>{
 const item=recognizeMedia(cases[0][1],'Caption </script>');const source='## Before\n\nText\n'+serializeMedia({...item,frameUrl:'https://evil.test'})+'## After\n\nEnd';
 const segments=articleSegments(source);assert.equal(segments.filter(s=>s.type==='media').length,1);assert.equal(segments[1].block.caption,'Caption </script>');assert.ok(!serializeMedia(item).includes('frameUrl'));assert.ok(!source.includes('evil.test'));
 const malformed='```psh-media\n{"sourceUrl":"javascript:x"}\n```';assert.equal(articleSegments(malformed)[0].type,'markdown');
 assert.equal(articleSegments('````\n'+serializeMedia(item)+'\n````').some(s=>s.type==='media'),false);
});
test('editor insert, replace, reorder and removal preserve surrounding Markdown and reference definitions',()=>{
 const a=recognizeMedia(cases[0][1],'First'),b=recognizeMedia(cases[9][1],'Second');
 const source='[ref]: https://example.com\n\n## Heading\n'+serializeMedia(a)+'Between\n'+serializeMedia(b)+'End';
 const parts=articleSegments(source).filter(s=>s.type==='media');assert.equal(source.slice(parts[0].start,parts[0].end).includes('First'),true);
 const moved=editMedia(source,1,'up');assert.ok(moved.indexOf('Second')<moved.indexOf('First'));assert.ok(moved.includes('Between'));assert.ok(moved.startsWith('[ref]:'));
 const replaced=editMedia(source,0,'replace',b);assert.equal(articleSegments(replaced).filter(s=>s.type==='media')[0].block.provider,'spotify');
 const removed=editMedia(source,0,'remove');assert.equal(articleSegments(removed).filter(s=>s.type==='media').length,1);assert.ok(removed.includes('## Heading'));assert.equal(editMedia(source,0,'up'),source);
 const windows=source.replace(/\n/g,'\r\n');assert.equal(articleSegments(windows).filter(s=>s.type==='media').length,2);assert.equal(articleSegments(editMedia(windows,0,'remove')).filter(s=>s.type==='media').length,1);
 for(const legacy of ['# Existing\n\n**Copy** with [link](https://example.com).','<script>alert(1)</script>','Text\n\n```js\nconsole.log(1)\n```'])assert.deepEqual(articleSegments(legacy),[{type:'markdown',text:legacy}]);
});
test('initial SSR contains readable content and local placeholders, never provider frames, SDKs or thumbnails',()=>{
 const Render=loader({react:{...React,useEffect:()=>{},useState:()=>['idle',()=>{}]}})('components/blog/ArticleBody.tsx').default;
 const html=renderToStaticMarkup(React.createElement(Render,{content:'## Readable article\n\nVisible text'+cases.map(([,url])=>serializeMedia(recognizeMedia(url))).join('')}));
 assert.match(html,/Readable article/);assert.match(html,/Visible text/);assert.match(html,/Load YouTube media/);assert.match(html,/Open original/);assert.doesNotMatch(html,/<iframe|<script|<img|srcdoc=/i);
 const referenced=renderToStaticMarkup(React.createElement(Render,{content:'[source]: https://example.com/source\n\n'+serializeMedia(recognizeMedia(cases[0][1]))+'Read the [source].'}));assert.match(referenced,/href="https:\/\/example.com\/source"/);
});
test('activated frames are reconstructed and sandboxed; scripts are isolated in generated documents',()=>{
 const Render=loader({react:{...React,useEffect:()=>{},useState:()=>['loading',()=>{}]}})('components/blog/RichMediaEmbed.tsx').default;
 const html=renderToStaticMarkup(React.createElement(Render,{block:recognizeMedia(cases[0][1])}));assert.match(html,/<iframe/);assert.match(html,/youtube-nocookie.com/);assert.match(html,/referrerPolicy="strict-origin-when-cross-origin"/i);assert.match(html,/enablejsapi=1/);assert.match(html,/sandbox="allow-scripts/);assert.match(html,/Close media/);assert.doesNotMatch(html,/allow-top-navigation|allow-forms/);
 const tiktok=renderToStaticMarkup(React.createElement(Render,{block:recognizeMedia(cases[2][1])}));assert.match(tiktok,/referrerPolicy="no-referrer"/i);
 const document=mediaDocument(recognizeMedia(cases[6][1]));assert.match(document,/platform.twitter.com\/widgets.js/);assert.doesNotMatch(document,/<script>alert|parent\./);
 const xhtml=renderToStaticMarkup(React.createElement(Render,{block:recognizeMedia(cases[6][1])}));assert.match(xhtml,/srcDoc=/i);assert.doesNotMatch(xhtml,/allow-same-origin/);
});
test('unavailable and unsupported player states retain a safe original link',()=>{
 const Render=loader({react:{...React,useEffect:()=>{},useState:()=>['unavailable',()=>{}]}})('components/blog/RichMediaEmbed.tsx').default;
 const html=renderToStaticMarkup(React.createElement(Render,{block:recognizeMedia(cases[0][1])}));assert.match(html,/could not be loaded/);assert.match(html,/Try again/);assert.match(html,/Open original/);assert.doesNotMatch(html,/<iframe/);
 const artist=renderToStaticMarkup(React.createElement(Render,{block:recognizeMedia('https://music.apple.com/us/artist/example/1234567890')}));assert.match(artist,/does not offer a supported player/);assert.doesNotMatch(artist,/<iframe|Try again/);
});

test('Instagram and native clips retain the versioned media contract; provider pages never become previews',()=>{
 const {articlePreviewVideo}=load('lib/blog/media-content.ts');
 const clip='https://res.cloudinary.com/approved/video/upload/v123/editorial/preview.mp4';
 const spec=recognizeMedia(clip,'Approved preview');assert.equal(spec.provider,'cloudinary');
 assert.equal(articlePreviewVideo('Text'+serializeMedia(spec)),clip);
 assert.equal(articlePreviewVideo(serializeMedia(recognizeMedia(cases[0][1]))),null);
 const instagram=recognizeMedia('https://www.instagram.com/reel/ABC_def123/?utm_source=x');
 assert.equal(instagram.frameUrl,'https://www.instagram.com/reel/ABC_def123/embed/');
 assert.equal(recognizeMedia('https://instagram.com/accounts/login/'),null);
 assert.equal(recognizeMedia('https://res.cloudinary.com/approved/image/upload/picture.mp4'),null);
 const Native=loader({react:{...React,useEffect:()=>{},useState:()=>['loading',()=>{}]}})('components/blog/RichMediaEmbed.tsx').default;
 const html=renderToStaticMarkup(React.createElement(Native,{block:spec}));assert.match(html,/<video/);assert.match(html,/controls=""/);assert.doesNotMatch(html,/<iframe/);
});

test('only authenticated TikTok frame messages can report readiness, playback or failure',()=>{
 const {tiktokPlayerEvent}=load('lib/blog/player-events.ts');
 const msg={'x-tiktok-player':true,type:'onPlayerReady'};
 assert.equal(tiktokPlayerEvent('https://www.tiktok.com',true,msg),'ready');
 assert.equal(tiktokPlayerEvent('https://evil.test',true,msg),null);
 assert.equal(tiktokPlayerEvent('https://www.tiktok.com',false,msg),null);
 assert.equal(tiktokPlayerEvent('https://www.tiktok.com',true,{...msg,'x-tiktok-player':false}),null);
 assert.equal(tiktokPlayerEvent('https://www.tiktok.com',true,{...msg,type:'onPlayerError'}),'error');
 assert.equal(tiktokPlayerEvent('https://www.tiktok.com',true,{...msg,type:'onStateChange',value:1}),'playing');
});

test('long social posts offer expansion and a frame load never claims playback',()=>{
 const Render=loader({react:{...React,useEffect:()=>{},useState:()=>['loaded',()=>{}]}})('components/blog/RichMediaEmbed.tsx').default;
 const html=renderToStaticMarkup(React.createElement(Render,{block:recognizeMedia(cases[6][1])}));
 assert.match(html,/content availability is not confirmed/);assert.match(html,/post height|Expand post/);assert.doesNotMatch(html,/Playback started/);
 const css=readFileSync(path.join(root,'components/blog/media.module.css'),'utf8');assert.match(css,/\.post\.expanded/);assert.match(css,/@media\(max-width:640px\)/);
});

test('image-only cards have no player; eligible preview SSR has controls but no video source',()=>{
 const Preview=load('components/media/CardVideoPreview.tsx').default;
 assert.equal(renderToStaticMarkup(React.createElement(Preview,{title:'Existing image-only card'})),'');
 const html=renderToStaticMarkup(React.createElement(Preview,{title:'Approved clip',src:'https://res.cloudinary.com/approved/video/upload/v123/preview.mp4'}));
 assert.match(html,/Play muted preview/);assert.match(html,/preload="none"/);assert.match(html,/playsInline|playsinline/);assert.doesNotMatch(html,/<video[^>]*\bsrc=/);
});

test('YouTube API loads once after activation, uses identification and resets after a script failure',async()=>{
 const originalWindow=globalThis.window,originalDocument=globalThis.document;
 const appended=[];const timers=new Map();let next=0;
 try {
  globalThis.window={setTimeout(fn){timers.set(++next,fn);return next}};
  globalThis.document={createElement(){return {remove(){this.removed=true}}},head:{appendChild(script){appended.push(script)}}};
  const {youtubeApi}=loader()('lib/blog/youtube-client.ts');
  assert.equal(appended.length,0);
  const first=youtubeApi(),second=youtubeApi();assert.equal(first,second);assert.equal(appended.length,1);
  assert.equal(appended[0].src,'https://www.youtube.com/iframe_api');assert.equal(appended[0].referrerPolicy,'strict-origin-when-cross-origin');
  appended[0].onerror();await assert.rejects(first,/unavailable/);assert.equal(appended[0].removed,true);
  const retry=youtubeApi();assert.equal(appended.length,2);const api={Player:class {}};window.YT=api;window.onYouTubeIframeAPIReady();assert.equal(await retry,api);assert.equal(await youtubeApi(),api);
 } finally {globalThis.window=originalWindow;globalThis.document=originalDocument}
});

test('homepage preview lookup sends only the derived URL to cards; normal feeds keep their small projection',async()=>{
 const previousFetch=globalThis.fetch,previousBase=process.env.NEXT_PUBLIC_SUPABASE_URL,previousKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 const urls=[];const clip='https://res.cloudinary.com/approved/video/upload/v123/preview.mp4';
 try {
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.test';process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='test-public-key';
  globalThis.fetch=async url=>{urls.push(new URL(url));return new Response(JSON.stringify([{id:'published',title:'Story',content:'Article text'+serializeMedia(recognizeMedia(clip))}]),{headers:{'content-range':'0-0/1'}})};
  const {publishedArticles}=loader({'server-only':{}})('lib/blog/public-feed.ts');
  const preview=await publishedArticles({limit:3,previews:true});assert.equal(preview.posts[0].preview_video,clip);assert.equal('content' in preview.posts[0],false);assert.match(urls[0].searchParams.get('select'),/,content$/);
  await publishedArticles({limit:3});assert.doesNotMatch(urls[1].searchParams.get('select'),/content/);
 } finally {globalThis.fetch=previousFetch;if(previousBase===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=previousBase;if(previousKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY=previousKey}
});
