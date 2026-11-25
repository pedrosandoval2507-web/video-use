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
const SC={
 /* história 1: fome depois do doce */
 lanche:(t)=>bg('#c2185b','#2a0614',t,'#ffd1e3')+donut(330,700,t)+clock(560,430,t,900),
 vontade:(t)=>bg('#5a1a2b','#16060c',t)+stomach(360,700,t,.08,true),
 grafico:(t)=>bg('#3b3b45','#101014',t)+graph(360,680,t,'acucar'),
 saciedade:(t)=>bg('#0f6b4c','#04221a',t,'#7CFFB2')+graph(360,560,t,'proteina')+`<g transform="translate(0,0)">${stomach(360,960,t,Math.min(.85,t*.4),false).replace('translate(360,960)','translate(360,960) scale(.55)')}</g>`,
 boldA:(t)=>bg('#1e3a8a','#081233',t)+sparkles(360,650,300,t)+card('mix',360,660,460,460,t,t<.4?-6:0),
 macrosA:(t)=>bg('#1e3a8a','#081233',t)+badge(190,560,t,'20g','PROTEÍNA')+(t>.7?badge(530,560,t-.7,'5g','FIBRAS','#25F4EE'):'')+(t>1.4?icon('sugar',360,900,t-1.4,'SEM ADIÇÃO DE AÇÚCAR'):''),
 ctaA:(t)=>bg('#1e3a8a','#081233',t)+card('caixa',360,520,380,420,t)+cart(360,960,t)+`<path d="M330 1150 L390 1150 L360 1195Z" fill="#fff" opacity="${.5+.5*Math.sin(t*8)}"/>`,
 /* história 2: músculo não cresce */
 treinoB:(t)=>bg('#1d6b7a','#06222b',t)+arm(t,.5+.5*Math.sin(t*3.2),t>1.8),
 naoB:(t)=>bg('#5a1a2b','#16060c',t)+arm(t,.3,true)+[0,1,2].map(i=>`<path d="M${420+i*50} ${700+((t*220+i*80)%160)} q10 18 0 28 q-10 -10 0 -28Z" fill="#9fe7ff" opacity=".9"/>`).join(''),
 reconstroi:(t)=>bg('#0f6b4c','#04221a',t,'#7CFFB2')+muscle(360,760,Math.min(1,t*.8),t)+(t>.8?badge(360,420,t-.8,'+P','PROTEÍNA','#7CFFB2'):''),
 metade:(t)=>bg('#5a1a2b','#16060c',t)+muscle(360,800,0,t)+battery(360,450,Math.max(.45,.9-t*.3),'#ffd54a',false,t),
 boldB:(t)=>bg('#b71c1c','#2b0505',t,'#ffd1d1')+sparkles(360,640,300,t)+card('bombom',360,620,520,210,t,-4)+(t>.6?badge(360,900,t-.6,'20g','PROTEÍNA'):''),
 saborB:(t)=>bg('#1565c0','#061a33',t)+card('cookies',360,560,520,210,t,3)+(t>.6?icon('sugar',360,880,t-.6,'SEM ADIÇÃO DE AÇÚCAR'):''),
 ctaB:(t)=>bg('#b71c1c','#2b0505',t)+card('caixa',360,520,380,420,t)+cart(360,960,t)+`<path d="M330 1150 L390 1150 L360 1195Z" fill="#fff" opacity="${.5+.5*Math.sin(t*8)}"/>`,
};
