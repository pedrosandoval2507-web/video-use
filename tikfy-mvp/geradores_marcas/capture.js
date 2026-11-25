// node capture.js id1 id2 ... → out/<id>.mp4 + out/<id>.jpg
const {chromium}=require('playwright');const fs=require('fs');const {execFileSync}=require('child_process');
const D='/home/user/brands',FPS=24;
const NAMES={gummy:'GUMMY HAIR',aura:'AURA',sg:'SAINT GERMAIN',jack:"JACK LINK'S",dux:'DUX'};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:720,height:1280}});
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto('file://'+D+'/capture.html');
 for(const id of process.argv.slice(2)){
  const S=JSON.parse(fs.readFileSync(`${D}/specs/${id}.json`,'utf8'));S.brandName=NAMES[S.brand];
  const imgs={};for(const f of fs.readdirSync(`${D}/img/${S.brand}`)) imgs[S.brand+'/'+f.replace('.png','')]='file://'+D+'/img/'+S.brand+'/'+f;
  await p.evaluate(([s,i])=>setup(s,i),[S,imgs]);
  const dir=`${D}/frames/${id}`;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const N=Math.ceil(S.dur*FPS);
  for(let i=0;i<N;i++){await p.evaluate(t=>frame(t),i/FPS);await p.screenshot({path:`${dir}/${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:88})}
  execFileSync('ffmpeg',['-v','error','-y','-framerate',String(FPS),'-i',`${dir}/%05d.jpg`,'-i',`${D}/audio/${id}.wav`,'-filter_complex','[0:v]fps=30,format=yuv420p[v];[1:a]apad=pad_dur=0.5,loudnorm=I=-14:TP=-1.5,aresample=44100[a]','-map','[v]','-map','[a]','-t',String(S.dur),'-c:v','libx264','-preset','medium','-crf','23','-c:a','aac','-b:a','128k','-movflags','+faststart',`${D}/out/${id}.mp4`]);
  execFileSync('ffmpeg',['-v','error','-y','-i',`${dir}/${String(Math.min(N-1,30)).padStart(5,'0')}.jpg`,'-vf','scale=180:320','-q:v','5',`${D}/out/${id}.jpg`]);
  fs.rmSync(dir,{recursive:true,force:true});console.log('ok',id,S.dur);
 }
 await b.close();})();
