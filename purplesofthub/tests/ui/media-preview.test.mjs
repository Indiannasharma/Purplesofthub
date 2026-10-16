import test from 'node:test'
import assert from 'node:assert/strict'
import {createPreviewController,previewVideoUrl,portfolioPreview,optimizedPreviewUrl,portfolioVideoValues} from '../../lib/media-preview.ts'

const clip='https://res.cloudinary.com/approved/video/upload/v123/preview.mp4'
function fixture({hover=true,reduced=false,reject=false}={}) {
 const states=[],errors=[],tasks=new Map();let next=0,plays=0
 const video={muted:false,currentTime:8,pause(){},async play(){plays++;if(reject)throw new Error('blocked')}}
 const controller=createPreviewController(video,{hoverAllowed:()=>hover,reducedMotion:()=>reduced,playing:v=>states.push(v),failed:()=>errors.push(true)},{set:fn=>{tasks.set(++next,fn);return next},clear:id=>tasks.delete(id)})
 return {video,controller,states,errors,tasks,get plays(){return plays},async fire(){for(const [id,fn] of tasks){tasks.delete(id);fn()}await Promise.resolve();await Promise.resolve()}}
}
test('preview sources require native Cloudinary uploads, not YouTube or arbitrary URLs',()=>{
 assert.equal(previewVideoUrl(clip),clip)
 for(const value of [null,'', 'https://youtu.be/M7lc1UVf-VE','https://evil.test/preview.mp4','https://res.cloudinary.com/approved/image/upload/x.mp4',clip+'?redirect=x','https://res.cloudinary.com.evil.test/a/video/upload/x.mp4'])assert.equal(previewVideoUrl(value),null)
 assert.equal(portfolioPreview({promo:'https://youtu.be/M7lc1UVf-VE'}),null)
 assert.equal(portfolioPreview({promo:clip}),clip)
 assert.equal(optimizedPreviewUrl(clip),'https://res.cloudinary.com/approved/video/upload/so_0,du_6,w_720,c_limit,q_auto/v123/preview.mp4')
})
test('fine-pointer hover waits for intent, mutes and plays; exit pauses and resets',async()=>{
 const f=fixture();f.controller.hover();assert.equal(f.plays,0);assert.equal(f.tasks.size,1);await f.fire();assert.equal(f.plays,1);assert.equal(f.video.muted,true);assert.equal(f.states.at(-1),true);f.controller.stop();assert.equal(f.video.currentTime,0);assert.equal(f.states.at(-1),false);f.controller.dispose()
})
test('leaving before the hover delay prevents loading or playback',async()=>{
 const f=fixture();f.controller.hover();f.controller.stop();await f.fire();assert.equal(f.plays,0);f.controller.dispose()
})
test('Portfolio editing preserves existing video slots while assigning or clearing a preview',()=>{
 const existing={promo:'https://youtu.be/M7lc1UVf-VE',tiktok:'https://www.tiktok.com/@example/video/1234567890',preview:clip};
 assert.deepEqual(portfolioVideoValues(existing,'https://youtu.be/M7lc1UVf-VE',clip),{...existing,youtube:'https://youtu.be/M7lc1UVf-VE'});
 const cleared=portfolioVideoValues(existing,'','');assert.equal(cleared.promo,existing.promo);assert.equal(cleared.tiktok,existing.tiktok);assert.equal(cleared.preview,undefined);
 assert.equal(portfolioPreview({...existing,preview:clip}),clip);
})
test('touch and reduced motion require explicit accessible play',async()=>{
 for(const options of [{hover:false},{reduced:true}]){const f=fixture(options);f.controller.hover();await f.fire();assert.equal(f.plays,0);await f.controller.play();assert.equal(f.plays,1);f.controller.dispose()}
})
test('starting a second preview stops and resets the previous one',async()=>{
 const a=fixture(),b=fixture();await a.controller.play();a.video.currentTime=4;await b.controller.play();assert.equal(a.video.currentTime,0);assert.equal(a.states.at(-1),false);assert.equal(b.states.at(-1),true);a.controller.dispose();b.controller.dispose()
})
test('failed native play restores the poster and reports a readable fallback',async()=>{
 const f=fixture({reject:true});await f.controller.play();assert.equal(f.states.at(-1),false);assert.equal(f.errors.length,1);assert.equal(f.video.currentTime,0);f.controller.dispose()
})
test('an obsolete play promise cannot reactivate a preview after exit',async()=>{
 let resolve;const states=[];const video={muted:false,currentTime:5,pause(){},play(){return new Promise(r=>{resolve=r})}};const c=createPreviewController(video,{hoverAllowed:()=>true,reducedMotion:()=>false,playing:v=>states.push(v),failed(){}});const play=c.play();c.stop();resolve();await play;assert.equal(states.at(-1),false);c.dispose()
})
