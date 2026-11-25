/* Funções de desenho das cenas animadas (SVG) */
var IMG={};
const ease=x=>x<0?0:x>1?1:1-Math.pow(1-x,3);
const pop=(t,d=.35)=>{const x=Math.min(1,Math.max(0,t/d));return x<1?ease(x)*(1+.18*Math.sin(x*Math.PI)):1};
function rnd(i){const x=Math.sin(i*127.1)*43758.5453;return x-Math.floor(x)}
function bg(c1,c2,t,dots='#ffffff'){
  let s=`<defs><radialGradient id="g" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>
  <filter id="bl"><feGaussianBlur stdDeviation="8"/></filter><filter id="sh"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-opacity=".45"/></filter></defs>
  <rect width="720" height="1280" fill="url(#g)"/>`;
  for(let i=0;i<14;i++){const x=rnd(i)*720,y=200+rnd(i+30)*1000+Math.sin(t*.8+i)*14,r=6+rnd(i+60)*16;
    s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${dots}" opacity="${.06+rnd(i+90)*.12}" filter="url(#bl)"/>`}
  return s;
}
/* ---------- illustrations ---------- */
function arm(t,lift,shake){ // flexing arm + dumbbell
  const a=-55*lift+(shake?Math.sin(t*40)*3:0);
  return `<g transform="translate(120,700) scale(1.55)" filter="url(#sh)">
   <path d="M-120 140 Q-60 40 40 60 L60 140 Z" fill="#e8a77d"/>
   <g transform="rotate(${a} 40 70)">
     <path d="M20 40 Q90 -10 170 30 L180 100 Q100 110 40 100 Z" fill="#f0b48a"/>
     <ellipse cx="100" cy="30" rx="${46+lift*14}" ry="${30+lift*10}" fill="#f4bf98"/>
     <g transform="translate(190,60) rotate(${-a*.4})"><rect x="-14" y="-90" width="28" height="180" rx="10" fill="#2b2b33"/>
      <rect x="-60" y="-120" width="120" height="44" rx="14" fill="#3d3d48"/><rect x="-60" y="76" width="120" height="44" rx="14" fill="#3d3d48"/>
      <circle cx="0" cy="0" r="26" fill="#f0b48a"/></g>
   </g></g>`;
}
function battery(x,y,level,color,charging,t){
  const w=300,h=150;let s=`<g transform="translate(${x},${y}) scale(1.35) translate(${-w/2},${-h/2})" filter="url(#sh)"><rect width="${w}" height="${h}" rx="26" fill="#fff"/>
   <rect x="${w}" y="${h/2-30}" width="22" height="60" rx="8" fill="#fff"/>
   <rect x="16" y="16" width="${(w-32)*Math.max(0,Math.min(1,level))}" height="${h-32}" rx="16" fill="${color}"/>`;
  if(charging) s+=`<path d="M${w/2+10} 22 L${w/2-30} ${h/2+6} L${w/2} ${h/2+6} L${w/2-14} ${h-22} L${w/2+34} ${h/2-10} L${w/2+4} ${h/2-10} Z" fill="#fff" stroke="#111" stroke-width="5" opacity="${.6+.4*Math.sin(t*10)}"/>`;
  return s+`</g>`;
}
function muscle(cx,cy,glow,t){
  let s=`<g transform="translate(${cx},${cy})" filter="url(#sh)"><ellipse rx="230" ry="130" fill="#c43a4f"/>`;
  for(let i=-4;i<=4;i++) s+=`<path d="M${-210} ${i*24} Q0 ${i*24+(i%2?10:-10)} 210 ${i*24}" stroke="#e35a6d" stroke-width="9" fill="none" opacity=".8"/>`;
  s+=`<ellipse rx="230" ry="130" fill="none" stroke="#8e2236" stroke-width="10"/>`;
  if(glow>0) for(let i=0;i<18;i++){const a=rnd(i)*6.28,r=60+((t*120+rnd(i+5)*300)%200);
    s+=`<circle cx="${Math.cos(a)*r*1.4}" cy="${Math.sin(a)*r*.6}" r="9" fill="#7CFFB2" opacity="${glow*(1-r/260)}"/>`}
  return s+`</g>`;
}
function gummy(x,y,r,col,rot=0){return `<g transform="translate(${x},${y}) rotate(${rot})" filter="url(#sh)"><rect x="${-r}" y="${-r*.85}" width="${2*r}" height="${1.7*r}" rx="${r*.45}" fill="${col}"/>
  <rect x="${-r*.6}" y="${-r*.6}" width="${r*.5}" height="${r*.25}" rx="${r*.12}" fill="#fff" opacity=".45"/>
  ${Array.from({length:12},(_,i)=>`<circle cx="${(rnd(i+x)-.5)*1.6*r}" cy="${(rnd(i+y)-.5)*1.4*r}" r="${r*.05}" fill="#fff" opacity=".7"/>`).join('')}</g>`}
function card(img,x,y,w,h,t,rot=0){const k=pop(t,.4);return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${k})" filter="url(#sh)">
  <rect x="${-w/2-18}" y="${-h/2-18}" width="${w+36}" height="${h+36}" rx="30" fill="#fff"/><image href="${IMG[img]}" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 18px)"/></g>`}
function sparkles(cx,cy,R,t){let s='';for(let i=0;i<22;i++){const a=rnd(i)*6.28+t*.6,r=R*(.6+rnd(i+3)*.6),tw=.5+.5*Math.sin(t*6+i);
  s+=`<g transform="translate(${cx+Math.cos(a)*r},${cy+Math.sin(a)*r*.9}) scale(${.5+tw*.6})"><path d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4Z" fill="#fff" opacity="${.4+.6*tw}"/></g>`}return s}
function icon(kind,x,y,t,txt){const k=pop(t,.35);let g='';
  if(kind==='sugar') g=`<rect x="-34" y="-34" width="68" height="68" rx="10" fill="#fff"/><path d="M-50 50 L50 -50" stroke="#FE2C55" stroke-width="12" stroke-linecap="round"/>`;
  if(kind==='wheat') g=`<path d="M0 50 L0 -50" stroke="#ffd54a" stroke-width="10"/>${[-30,-10,10].map(yy=>`<ellipse cx="-16" cy="${yy}" rx="16" ry="9" fill="#ffd54a" transform="rotate(-30 -16 ${yy})"/><ellipse cx="16" cy="${yy}" rx="16" ry="9" fill="#ffd54a" transform="rotate(30 16 ${yy})"/>`).join('')}<path d="M-50 50 L50 -50" stroke="#FE2C55" stroke-width="12" stroke-linecap="round"/>`;
  if(kind==='milk') g=`<path d="M-26 -50 L26 -50 L26 -30 L36 -10 L36 50 L-36 50 L-36 -10 L-26 -30Z" fill="#fff"/><path d="M-50 50 L50 -50" stroke="#FE2C55" stroke-width="12" stroke-linecap="round"/>`;
  return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#sh)"><circle r="80" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="4"/>${g}
   <text y="125" text-anchor="middle" font-family="Inter" font-weight="900" font-size="25" fill="#fff">${txt}</text></g>`}
function cart(x,y,t){const b=Math.abs(Math.sin(t*5))*-30;return `<g transform="translate(${x},${y+b})" filter="url(#sh)">
  <circle r="140" fill="#FF7A00"/><path d="M-80 -50 L-55 -50 L-30 40 L60 40 L80 -20 L-45 -20" stroke="#fff" stroke-width="16" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="-20" cy="75" r="15" fill="#fff"/><circle cx="50" cy="75" r="15" fill="#fff"/></g>`}
function calendar(x,y,t,miss){let s=`<g transform="translate(${x},${y})" filter="url(#sh)"><rect x="-230" y="-200" width="460" height="400" rx="30" fill="#fff"/><rect x="-230" y="-200" width="460" height="80" rx="30" fill="#FE2C55"/><rect x="-230" y="-150" width="460" height="30" fill="#FE2C55"/>`;
  for(let i=0;i<15;i++){const cx=-180+(i%5)*90,cy=-70+Math.floor(i/5)*95;const shown=t*10>i;s+=`<rect x="${cx-34}" y="${cy-34}" width="68" height="68" rx="12" fill="#f1f1f4"/>`;
   if(shown) s+= (miss.includes(i)?`<path d="M${cx-18} ${cy-18} L${cx+18} ${cy+18} M${cx+18} ${cy-18} L${cx-18} ${cy+18}" stroke="#FE2C55" stroke-width="10" stroke-linecap="round"/>`:`<path d="M${cx-18} ${cy} L${cx-4} ${cy+14} L${cx+20} ${cy-14}" stroke="#25c26e" stroke-width="10" fill="none" stroke-linecap="round"/>`)}
  return s+`</g>`}
/* ---------- scenes ---------- */

function mug(x,y,t){let s=`<g transform="translate(${x},${y})" filter="url(#sh)">
  <path d="M-130 -110 L130 -110 L110 140 Q105 170 75 170 L-75 170 Q-105 170 -110 140 Z" fill="#f4efe8"/>
  <path d="M128 -60 Q215 -60 205 25 Q195 95 115 95" stroke="#f4efe8" stroke-width="30" fill="none"/>
  <ellipse cx="0" cy="-110" rx="130" ry="28" fill="#6b3d22"/><ellipse cx="0" cy="-112" rx="110" ry="18" fill="#8a5330"/></g>`;
  for(let i=0;i<3;i++){const o=(t*40+i*35)%110;s+=`<path d="M${x-50+i*50} ${y-150-o} q-22 -30 0 -60 q22 -30 0 -60" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="${.5*(1-o/110)}"/>`}
  return s}
function clock(x,y,t,spd,col='#fff'){const a=t*spd;return `<g transform="translate(${x},${y})" filter="url(#sh)"><circle r="95" fill="${col}"/><circle r="95" fill="none" stroke="#111" stroke-width="10"/>
  ${Array.from({length:12},(_,i)=>`<rect x="-4" y="-84" width="8" height="16" fill="#111" transform="rotate(${i*30})"/>`).join('')}
  <rect x="-5" y="-70" width="10" height="70" rx="5" fill="#111" transform="rotate(${a})"/><rect x="-5" y="-48" width="10" height="48" rx="5" fill="#FE2C55" transform="rotate(${a/12+40})"/><circle r="10" fill="#111"/></g>`}
function sleepy(x,y,t){return `<g transform="translate(${x},${y})" filter="url(#sh)"><circle r="120" fill="#ffd27a"/>
  <path d="M-62 -10 q22 18 44 0 M18 -10 q22 18 44 0" stroke="#3b2a12" stroke-width="10" fill="none" stroke-linecap="round"/>
  <ellipse cx="0" cy="55" rx="26" ry="${14+6*Math.sin(t*3)}" fill="#3b2a12"/></g>`+
  [0,1,2].map(i=>{const o=(t*0.8+i*.33)%1;return `<text x="${x+110+o*90}" y="${y-110-o*140}" font-family="Inter" font-weight="900" font-size="${34+i*12}" fill="#fff" opacity="${1-o}">z</text>`}).join('')}
function body(x,y,t,prog){ // silhouette with esophagus and stomach; drop follows path
  const P=[[0,-250],[0,-150],[0,-60],[10,20],[40,90]];
  const k=Math.min(.999,Math.max(0,prog))*(P.length-1),i=Math.floor(k),f=k-i,dx=P[i][0]+(P[i+1][0]-P[i][0])*f,dy=P[i][1]+(P[i+1][1]-P[i][1])*f;
  return `<g transform="translate(${x},${y})" filter="url(#sh)">
   <circle cx="0" cy="-330" r="95" fill="#1e4b5c"/><path d="M-200 360 L-170 -110 Q-160 -200 -60 -210 L60 -210 Q160 -200 170 -110 L200 360 Z" fill="#1e4b5c"/>
   <path d="M0 -270 L0 -60 Q0 0 30 40" stroke="#7fd3e8" stroke-width="22" fill="none" stroke-linecap="round" opacity=".9"/>
   <path d="M-20 30 Q-60 140 40 180 Q150 200 140 80 Q130 0 40 20 Q10 25 -20 30Z" fill="#e88aa0"/>
   <circle cx="${dx}" cy="${dy}" r="22" fill="#ffd54a" stroke="#fff" stroke-width="5"/></g>`}
function mouth(x,y,t){let s=`<g transform="translate(${x},${y})" filter="url(#sh)">
  <path d="M-230 0 Q-120 -120 0 -95 Q120 -120 230 0 Q120 150 0 140 Q-120 150 -230 0Z" fill="#d6324f"/>
  <path d="M-180 5 Q-90 -55 0 -45 Q90 -55 180 5 Q90 80 0 75 Q-90 80 -180 5Z" fill="#5a0f1f"/>
  <rect x="-150" y="-40" width="300" height="34" rx="12" fill="#fff"/>
  <ellipse cx="0" cy="45" rx="110" ry="34" fill="#ff7f95"/>
  <g transform="translate(${-20+Math.sin(t*3)*6},${30})"><rect x="-34" y="-20" width="68" height="40" rx="18" fill="#dff7ff" stroke="#7fd3e8" stroke-width="5"/></g></g>`;
  for(let i=0;i<26;i++){const a=rnd(i)*6.28,r=((t*260+rnd(i+9)*400)%420);s+=`<circle cx="${x+Math.cos(a)*r}" cy="${y+30+Math.sin(a)*r*.7}" r="10" fill="#ffd54a" opacity="${Math.max(0,1-r/420)}"/>`}
  return s}
function bolt(x,y,t,sc=1){return `<g transform="translate(${x},${y}) scale(${sc*(1+.08*Math.sin(t*12))})" filter="url(#sh)"><path d="M20 -110 L-60 20 L0 20 L-25 120 L70 -20 L10 -20 L40 -110Z" fill="#ffd54a" stroke="#111" stroke-width="7" stroke-linejoin="round"/></g>`}
function can(x,y,t){const k=pop(t);return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#sh)"><rect x="-80" y="-170" width="160" height="340" rx="26" fill="#e9eef3"/>
  <rect x="-80" y="-170" width="160" height="40" rx="18" fill="#c9d2da"/><rect x="-80" y="-40" width="160" height="90" fill="#FE2C55"/>
  <text y="20" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="#fff">ENERGY</text></g>`}
function leaf(x,y,t,txt){const k=pop(t,.35);return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#sh)"><circle r="80" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="4"/>
  <path d="M-40 40 Q-50 -40 40 -50 Q50 30 -40 40Z" fill="#5be08a"/><path d="M-40 40 L30 -40" stroke="#1f7a43" stroke-width="6"/>
  <text y="125" text-anchor="middle" font-family="Inter" font-weight="900" font-size="25" fill="#fff">${txt}</text></g>`}
function tooth(x,y,t,txt){const k=pop(t,.35);return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#sh)"><circle r="80" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="4"/>
  <path d="M-40 -45 Q-20 -60 0 -45 Q20 -60 40 -45 Q55 -10 35 15 L25 50 Q18 60 12 45 L0 15 L-12 45 Q-18 60 -25 50 L-35 15 Q-55 -10 -40 -45Z" fill="#fff"/>
  <path d="M45 -60 L50 -48 L62 -44 L50 -40 L45 -28 L40 -40 L28 -44 L40 -48Z" fill="#ffd54a"/>
  <text y="125" text-anchor="middle" font-family="Inter" font-weight="900" font-size="25" fill="#fff">${txt}</text></g>`}

function donut(x,y,t){const k=pop(t);return `<g transform="translate(${x},${y}) scale(${k}) rotate(${Math.sin(t*2)*6})" filter="url(#sh)">
  <circle r="150" fill="#e0a060"/><circle r="140" fill="#ff7fb0"/><circle r="55" fill="#2a0d1c"/>
  ${Array.from({length:16},(_,i)=>{const a=rnd(i+3)*6.28,r=75+rnd(i+7)*50;return `<rect x="${Math.cos(a)*r-10}" y="${Math.sin(a)*r-4}" width="20" height="8" rx="4" fill="${['#fff','#25F4EE','#ffd54a','#7CFFB2'][i%4]}" transform="rotate(${rnd(i)*180} ${Math.cos(a)*r} ${Math.sin(a)*r})"/>`}).join('')}</g>`}
function stomach(x,y,t,full,growl){let s=`<g transform="translate(${x},${y})" filter="url(#sh)">
  <path d="M-150 -120 Q-220 120 0 190 Q200 230 210 40 Q220 -120 60 -100 Q0 -95 -40 -150 Z" fill="#f2a1b3"/>
  <clipPath id="stc"><path d="M-150 -120 Q-220 120 0 190 Q200 230 210 40 Q220 -120 60 -100 Q0 -95 -40 -150 Z"/></clipPath>
  <rect x="-230" y="${200-380*full}" width="460" height="400" fill="#7CFFB2" opacity=".75" clip-path="url(#stc)"/></g>`;
  if(growl) for(let i=0;i<3;i++){const o=(t*2+i*.33)%1;s+=`<path d="M${x+170+o*60} ${y-140-o*60} q20 -20 0 -40 q-20 -20 0 -40" stroke="#fff" stroke-width="9" fill="none" opacity="${1-o}" stroke-linecap="round"/>`}
  return s}
function graph(x,y,t,mode){ // mode 'acucar' spike/crash, 'proteina' adds flat green line
  const W=520,H=300;let s=`<g transform="translate(${x-W/2},${y-H/2})" filter="url(#sh)"><rect x="-30" y="-30" width="${W+60}" height="${H+80}" rx="26" fill="#fff"/>
   <path d="M0 ${H} L${W} ${H}" stroke="#ccc" stroke-width="6"/><path d="M0 0 L0 ${H}" stroke="#ccc" stroke-width="6"/>`;
  const pts=[];const N=60,p=Math.min(1,t/2.2);
  for(let i=0;i<=N*p;i++){const u=i/N,v=u<.25?u/.25:u<.45?1:Math.max(0,1-(u-.45)/.25)*1-.15*(u>.7?1:0);pts.push(`${u*W},${H-20-(H-50)*Math.max(-.1,v)}`)}
  if(pts.length>1) s+=`<polyline points="${pts.join(' ')}" fill="none" stroke="#FE2C55" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(mode==='proteina'){const q=[];for(let i=0;i<=N*Math.min(1,t/2.2);i++){const u=i/N,v=u<.3?u/.3*.6:.6-.05*(u-.3);q.push(`${u*W},${H-20-(H-50)*v}`)}
    if(q.length>1) s+=`<polyline points="${q.join(' ')}" fill="none" stroke="#25c26e" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`}
  s+=`<text x="10" y="${H+40}" font-family="Inter" font-weight="800" font-size="26" fill="#FE2C55">açúcar</text>`;
  if(mode==='proteina') s+=`<text x="${W-10}" y="${H+40}" text-anchor="end" font-family="Inter" font-weight="800" font-size="26" fill="#25c26e">proteína + fibra</text>`;
  return s+`</g>`}
function badge(x,y,t,big,small,col='#ffd54a',fg='#111'){const k=pop(t,.35);return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#sh)"><circle r="105" fill="${col}"/><circle r="105" fill="none" stroke="#fff" stroke-width="6"/>
  <text y="10" text-anchor="middle" font-family="Inter" font-weight="900" font-size="58" fill="${fg}">${big}</text><text y="52" text-anchor="middle" font-family="Inter" font-weight="900" font-size="24" fill="${fg}">${small}</text></g>`}


function wrap2(txt){const w=txt.split(' ');if(txt.length<14)return [txt];let best=1,bd=1e9;for(let i=1;i<w.length;i++){const a=w.slice(0,i).join(' ').length,b=w.slice(i).join(' ').length;if(Math.abs(a-b)<bd){bd=Math.abs(a-b);best=i}}return [w.slice(0,best).join(' '),w.slice(best).join(' ')]}
function bubble(t,txt,y){const k=pop(t,.4),L=wrap2(txt),fs=L.some(l=>l.length>13)?54:64;
  return `<g transform="translate(360,${y}) scale(${k})" filter="url(#sh)"><rect x="-300" y="-130" width="600" height="${L.length>1?260:200}" rx="40" fill="#fff"/><path d="M-60 ${L.length>1?128:68} L-110 ${L.length>1?210:150} L0 ${L.length>1?128:68}Z" fill="#fff"/>
  ${L.map((l,i)=>`<text x="0" y="${(L.length>1?-25:-10)+i*75}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fs}" fill="#111">${l}</text>`).join('')}</g>`}
var STORY={
 pergunta:(t,txt,th)=>bg(th[0],th[1],t)+bubble(t,txt,600)+[0,1,2,3].map(i=>{const o=(t*0.7+i*.25)%1;return `<text x="${120+i*160}" y="${980-o*240}" font-family="Inter" font-weight="900" font-size="${70+i*10}" fill="#fff" opacity="${(1-o)*.8}">?</text>`}).join(''),
 relogio:(t,a,th)=>bg(th[0],th[1],t)+`<g transform="translate(360,640) scale(2.3) translate(-360,-640)">${clock(360,640,t,900)}</g>`,
 motivo:(t,txt,th)=>{const k=pop(t,.4),L=wrap2(txt);return bg(th[0],th[1],t)+`<g transform="translate(360,470) scale(${k})" filter="url(#sh)"><circle r="110" fill="#FFD54A"/><circle r="110" fill="none" stroke="#fff" stroke-width="8" opacity="${.4+.4*Math.sin(t*6)}"/><rect x="-45" y="95" width="90" height="60" rx="12" fill="#e0e0e0"/><path d="M-30 20 Q0 -40 30 20" stroke="#8a6d00" stroke-width="10" fill="none"/></g>`+
   (t>.35?`<g transform="translate(360,820) scale(${pop(t-.35)})" filter="url(#sh)"><rect x="-320" y="-${L.length>1?110:70}" width="640" height="${L.length>1?220:140}" rx="28" fill="#111" stroke="#fff" stroke-width="5"/>${L.map((l,i)=>`<text y="${(L.length>1?-12:16)+i*64}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${L.some(l=>l.length>16)?46:54}" fill="#fff">${l}</text>`).join('')}</g>`:'')},
 produto:(t,img,th,br)=>bg(th[0],th[1],t)+sparkles(360,650,300,t)+card(br+'/'+img,360,660,460,520,t,t<.4?-6:0),
 badges:(t,spec,th)=>{const B=spec.split(';').map(x=>x.split('|'));const n=B.length,cols=['#FFD54A','#2DD4FF','#7CFFB2','#FF8A80'];
   return bg(th[0],th[1],t)+B.map((b,i)=>{const x=n<=3?360+(i-(n-1)/2)*230:200+(i%2)*320,y=n<=3?640:520+Math.floor(i/2)*300;return t>i*.45?badge(x,y,t-i*.45,b[0],b[1],cols[i%4]):''}).join('')},
 cta:(t,img,th,br)=>bg(th[0],th[1],t)+card(br+'/'+img,360,520,400,440,t)+cart(360,960,t)+`<path d="M330 1150 L390 1150 L360 1195Z" fill="#fff" opacity="${.5+.5*Math.sin(t*8)}"/>`,
};
