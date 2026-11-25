/* Tikfy Player: monta o vídeo (fotos + narração + legenda + CTA) em tempo real.
   Usado na página do MVP e na exportação para MP4 (mesmo código). Depende de story_lib (funções SVG). */
var TP=(function(){
const CSS=`.tp-stage{position:relative;width:720px;height:1280px;overflow:hidden;background:#000;font-family:Inter,system-ui,sans-serif;transform-origin:0 0}
.tp-stage *{box-sizing:border-box}
.tp-bg{position:absolute;inset:-60px;background-size:cover;background-position:center;filter:blur(34px) brightness(.48) saturate(1.2)}
.tp-main{position:absolute;left:0;top:0;width:720px;height:1280px;overflow:hidden}
.tp-main img{position:absolute;object-fit:contain;transform-origin:center}
.tp-cmpimg{position:absolute;object-fit:contain}
.tp-dopa{position:absolute;left:0;top:640px;width:720px;height:640px}
.tp-svg{position:absolute;left:0;top:0;width:720px;height:1280px}
.tp-box{position:absolute;left:50%;transform:translateX(-50%);text-align:center;font-weight:900;line-height:1.15;padding:10px 18px;border-radius:6px;white-space:nowrap}
.tp-hook{font-size:42px}
.tp-lab{font-size:40px;background:#7B3FE4;color:#fff;top:395px}
.tp-card{font-size:42px;background:#2DD4FF;color:#111;top:385px;padding:16px 22px}
.tp-cap{position:absolute;left:20px;right:20px;text-align:center;font-weight:900;font-size:56px;color:#fff;text-transform:uppercase;letter-spacing:-.5px;
  text-shadow:0 0 6px #000,0 0 6px #000,3px 3px 0 #000,-3px -3px 0 #000,3px -3px 0 #000,-3px 3px 0 #000,0 4px 10px rgba(0,0,0,.6);transform:translateY(-50%)}
.tp-cap b{color:#FFD54A}
.tp-capS{position:absolute;top:130px;left:30px;right:30px;text-align:center;font:600 56px/1.15 Inter,sans-serif;color:rgba(255,255,255,.55);letter-spacing:-.5px}
.tp-capS b{color:#fff;font-weight:900}.tp-capS b.hl{background:#fff;color:#111;border-radius:12px;padding:0 10px}
.tp-tag{position:absolute;left:40px;top:1090px;font-size:24px;font-weight:900;color:#fff;background:#303030;padding:6px 10px}
.tp-cta{font-size:40px;background:#FF4D6D;color:#fff;padding:16px 22px}
.tp-arrow{position:absolute;left:40px;width:0;height:0;border-left:30px solid transparent;border-right:30px solid transparent;border-top:45px solid #FF4D6D}
.tp-cmplab{position:absolute;left:40px;font-size:42px;font-weight:900;padding:12px 18px;border-radius:6px}`;
let cssDone=false;
function el(tag,cls,parent){const e=document.createElement(tag);if(cls)e.className=cls;parent.appendChild(e);return e}
function mount(host){
  if(!cssDone){const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);cssDone=true}
  host.innerHTML='';const st=el('div','tp-stage',host);
  const o={st,bg:el('div','tp-bg',st),main:el('div','tp-main',st)};
  o.img=el('img','',o.main);o.cmpimg=el('img','tp-cmpimg',st);o.cv=el('canvas','tp-dopa',st);o.cv.width=360;o.cv.height=320;
  o.svg=document.createElementNS('http://www.w3.org/2000/svg','svg');o.svg.setAttribute('class','tp-svg');o.svg.setAttribute('viewBox','0 0 720 1280');st.appendChild(o.svg);
  o.cmplabA=el('div','tp-cmplab',st);o.cmplabB=el('div','tp-cmplab',st);
  o.hook=el('div','tp-box tp-hook',st);o.lab=el('div','tp-box tp-lab',st);o.card=el('div','tp-box tp-card',st);
  o.cap=el('div','tp-cap',st);o.capS=el('div','tp-capS',st);o.tag=el('div','tp-tag',st);o.cta=el('div','tp-box tp-cta',st);o.arrow=el('div','tp-arrow',st);
  o.cta.innerHTML='ESTOQUE ACABANDO!<br>CLIQUE NO CARRINHO';return o}
const show=(e,v)=>{e.style.display=v?'':'none'};
const br=s=>String(s).replace(/\\N/g,'<br>').replace(/&/g,'&amp;').replace(/<(?!br>)/g,'&lt;');
const ease=x=>x<0?0:x>1?1:1-Math.pow(1-x,3);
const THEME={gummy:['#ff4fa3','#3a0a22'],aura:['#c9935a','#2a1608'],sg:['#4a4a58','#0b0b10'],jack:['#c62828','#2a0606'],dux:['#37474f','#05090b'],bold:['#1e3a8a','#081233']};
const SZ={};
function fit(img,box){const z=SZ[img._src]||{};const w=img.naturalWidth||z.w||1,h=img.naturalHeight||z.h||1,k=Math.min(box.w/w,box.h/h);return {w:w*k,h:h*k}}
function placeImg(e,src,box,z){if(e._src!==src){e.src=src;e._src=src}
  const f=fit(e,box);e.style.width=f.w+'px';e.style.height=f.h+'px';e.style.left=(box.x-f.w/2)+'px';e.style.top=(box.y-f.h/2)+'px';e.style.transform=`scale(${z})`}
function tunnel(cv,t){const c=cv.getContext('2d'),W=cv.width,H=cv.height;c.fillStyle='#000';c.fillRect(0,0,W,H);
  for(let k=22;k>=0;k--){const r=((k*26+t*70)%572);c.beginPath();c.ellipse(W/2,H/2,r*1.1,r*.95,t*.4,0,6.283);c.fillStyle=`hsl(${(k*28+t*90)%360},95%,${k%2?55:30}%)`;c.fill()}}
function life(cv,t){const c=cv.getContext('2d'),W=cv.width,H=cv.height;c.fillStyle='#120022';c.fillRect(0,0,W,H);
  for(let i=0;i<90;i++){const a=i*2.399,r=(i*7+t*40)%220;const x=W/2+Math.cos(a+t*.3)*r*1.4,y=H/2+Math.sin(a+t*.3)*r*.9;c.fillStyle=i%2?'#2DD4FF':'#FF4D6D';c.globalAlpha=1-r/240;c.fillRect(x,y,9,9)}c.globalAlpha=1}
function mandel(cv,t){const c=cv.getContext('2d'),W=cv.width,H=cv.height;const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,`hsl(${t*60%360},90%,50%)`);g.addColorStop(1,`hsl(${(t*60+180)%360},90%,45%)`);c.fillStyle=g;c.fillRect(0,0,W,H);
  for(let i=0;i<14;i++){c.beginPath();c.arc(W/2+Math.sin(t*1.3+i)*W*.35,H/2+Math.cos(t*1.1+i*1.7)*H*.35,20+i*3,0,6.283);c.fillStyle=`hsla(${(i*40+t*120)%360},100%,60%,.85)`;c.fill()}}
function cmpIcon(kind){const P={'@capsula':'<rect x="-120" y="-50" width="240" height="100" rx="50" fill="#e0e0e0"/><rect x="0" y="-50" width="120" height="100" rx="0" fill="#9e9e9e"/><rect x="60" y="-50" width="60" height="100" rx="50" fill="#9e9e9e"/>',
 '@doce':'<circle r="80" fill="#ff7043"/><path d="M-80 0 L-150 -50 L-150 50Z M80 0 L150 -50 L150 50Z" fill="#ffab91"/>',
 '@frasco':'<rect x="-70" y="-60" width="140" height="190" rx="20" fill="#b0bec5"/><rect x="-30" y="-110" width="60" height="50" fill="#78909c"/>',
 '@pote':'<rect x="-120" y="-40" width="240" height="140" rx="30" fill="#cfd8dc"/><rect x="-130" y="-80" width="260" height="50" rx="16" fill="#90a4ae"/>',
 '@smart':'<rect x="-30" y="-170" width="60" height="340" rx="20" fill="#424242"/><rect x="-90" y="-100" width="180" height="200" rx="40" fill="#212121" stroke="#9e9e9e" stroke-width="8"/><text y="15" text-anchor="middle" font-size="44" font-weight="900" fill="#ff5252" font-family="Inter">2%</text>',
 '@generico':'<rect x="-28" y="-170" width="56" height="340" rx="14" fill="#8d6e63"/><circle r="100" fill="#bdbdbd" stroke="#757575" stroke-width="12"/>',
 '@chips':'<path d="M-110 -130 L110 -130 L130 130 L-130 130Z" fill="#fbc02d"/><text y="15" text-anchor="middle" font-size="40" font-weight="900" fill="#d84315" font-family="Inter">CHIPS</text>',
 '@barra':'<rect x="-170" y="-50" width="340" height="100" rx="18" fill="#8d6e63"/><path d="M-170 -50 L-200 -70 L-200 70 L-170 50Z M170 -50 L200 -70 L200 70 L170 50Z" fill="#bcaaa4"/>',
 '@marmita':'<ellipse rx="190" ry="70" fill="#eceff1"/><ellipse cx="-50" rx="70" ry="35" fill="#ffcc80"/><ellipse cx="60" rx="60" ry="30" fill="#ff8a65"/>',
 '@cafe':'<path d="M-90 -80 L90 -80 L75 100 Q70 120 50 120 L-50 120 Q-70 120 -75 100Z" fill="#f5f5f5"/><path d="M88 -40 Q150 -40 140 20 Q130 70 80 70" stroke="#f5f5f5" stroke-width="22" fill="none"/>'};
 return `<g transform="translate(360,330)">${P[kind]||P['@doce']}</g>`}
function render(o,S,t,IM){
  const dopa=S.fmt==='DOPA',story=S.fmt==='STORY';
  // captions
  const capEl=story?o.capS:o.cap;show(o.cap,!story);show(o.capS,story);
  let gi=-1;for(let i=0;i<S.groups.length;i++) if(t>=S.groups[i].s) gi=i;
  if(gi<0||t>S.groups[gi].e) capEl.innerHTML='';
  else{const g=S.groups[gi],W=S.words;capEl.innerHTML=g.w.map((i,j)=>{const w=W[i];const txt=w[2].replace(/[.,!?;:]/g,'');
    if(story){if(t<w[0])return `<span style="opacity:0">${txt}</span>`;const on=(j===g.w.length-1)||t<W[g.w[j+1]][0];return on?`<b>${txt}</b>`:`<span>${txt}</span>`}
    const on=t>=w[0]&&((j===g.w.length-1)||t<W[g.w[j+1]][0]);return on?`<b>${txt}</b>`:txt}).join(' ');
    if(!story){const p=Math.min(1,(t-g.s)/0.09);capEl.style.transform=`translateY(-50%) scale(${1.12-0.12*ease(p)})`}}
  if(!story) capEl.style.top=(dopa?640:1010)+'px';
  if(story){
    show(o.bg,false);show(o.main,false);show(o.cmpimg,false);show(o.cv,false);show(o.svg,true);[o.hook,o.lab,o.card,o.tag,o.cta,o.arrow,o.cmplabA,o.cmplabB].forEach(e=>show(e,false));
    window.IMG=IM;let cur=S.scenes[0];for(const s of S.scenes) if(t>=s.t0) cur=s;
    const lt=t-cur.t0,fr=Math.floor(t*12),jx=(rnd(fr)-.5)*5,jy=(rnd(fr+7)-.5)*5,jr=(rnd(fr+13)-.5)*.6;
    o.svg.innerHTML=`<g transform="translate(${jx},${jy}) rotate(${jr} 360 640)">${STORY[cur.kind](lt,cur.arg,THEME[S.brand]||THEME.bold,S.brand)}</g>`;return}
  show(o.svg,false);show(o.capS,false);
  // timeline
  let seg=S.tl[0],k=0;for(let i=0;i<S.tl.length;i++) if(t>=S.tl[i].t0){seg=S.tl[i];k=i}
  const p=Math.min(1,Math.max(0,(t-seg.t0)/Math.max(.01,seg.t1-seg.t0))),z=k%2?1.06-0.06*p:1+0.06*p;
  if(seg.img==='@cmp'){
    show(o.bg,false);show(o.main,false);show(o.cv,false);show(o.svg,true);show(o.cmpimg,true);
    o.svg.innerHTML=`<rect width="720" height="640" fill="#2b2b33"/>${cmpIcon(seg.cmp)}`;
    const first=S.tl.find(x=>x.img!=='@cmp');const src=IM[S.brand+'/'+first.img];if(o.cmpimg._src!==src){o.cmpimg.src=src;o.cmpimg._src=src}
    const f=fit(o.cmpimg,{w:600,h:520});Object.assign(o.cmpimg.style,{width:f.w+'px',height:f.h+'px',left:(360-f.w/2)+'px',top:(960-f.h/2)+'px',transform:`scale(${z})`});
    o.st.style.background='#14141f';o.st.insertBefore(o.svg,o.cmpimg);show(o.cmplabA,true);show(o.cmplabB,true);Object.assign(o.cmplabA.style,{top:'560px',background:'#FF4D6D',color:'#fff'});o.cmplabA.textContent='COMUM';
    Object.assign(o.cmplabB.style,{top:'1180px',background:'#2DD4FF',color:'#111'});o.cmplabB.textContent=S.brandName||'ESTE';
  }else{
    show(o.svg,false);show(o.cmpimg,false);show(o.cmplabA,false);show(o.cmplabB,false);show(o.bg,true);show(o.main,true);
    const src=IM[S.brand+'/'+seg.img];if(o.bg._src!==src){o.bg.style.backgroundImage=`url("${src}")`;o.bg._src=src}
    o.bg.style.bottom=dopa?'580px':'-60px';
    placeImg(o.img,src,dopa?{x:360,y:320,w:666,h:585}:{x:360,y:667,w:666,h:866},z);
    show(o.cv,dopa);if(dopa)({tunnel,life,mandel}[S.bg]||tunnel)(o.cv,t);
  }
  // overlays
  const pre=t<S.ctaT;show(o.hook,pre&&!!S.hook);
  if(pre&&S.hook){o.hook.innerHTML=br(S.hook);o.hook.style.color=S.hookCol[0];o.hook.style.background=S.hookCol[1];o.hook.style.top=(dopa?60:130)+'px';
    const hp=Math.min(1,t/0.3);o.hook.style.transform=`translateX(-50%) scale(${t<.16?1+0.07*t/.16:1.07-0.07*Math.min(1,(t-.16)/.14)})`}
  const lb=(S.labels||[]).find(l=>t>=l.t0&&t<l.t1),cd=(S.cards||[]).find(c=>t>=c.t0&&t<c.t1);
  show(o.card,!!cd&&pre);if(cd){o.card.innerHTML=br(cd.txt);const q=Math.min(1,(t-cd.t0)/.24);o.card.style.transform=`translateX(-50%) scale(${.7+.34*ease(q)-(q>=1?.04:0)})`;o.card.style.top=(dopa?470:385)+'px'}
  show(o.lab,!!lb&&!cd&&pre);if(lb){o.lab.innerHTML=br(lb.txt);o.lab.style.top=(dopa?480:395)+'px'}
  show(o.tag,!dopa);o.tag.textContent=S.tag;
  show(o.cta,!pre);show(o.arrow,!pre);
  if(!pre){const q=Math.min(1,(t-S.ctaT)/.35);o.cta.style.top=(dopa?300:220)+'px';o.cta.style.transform=`translateX(-50%) scale(${q<.57?1+.08*q/.57:1.08-.08*(q-.57)/.43})`;
    const b=((t-S.ctaT)%0.6)/0.6;o.arrow.style.top=(1120+40*b)+'px'}
}
function preload(IM){return Promise.all(Object.values(IM).map(src=>SZ[src]?0:new Promise(r=>{const i=new Image();i.onload=()=>{SZ[src]={w:i.naturalWidth,h:i.naturalHeight};r()};i.onerror=r;i.src=src})))}
return {mount,render,preload,SZ};
})();
