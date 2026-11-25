# Monta index.html a partir de src.html: embute logos e a lista de cortes.
import base64, io, json, os
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))
s=open(f'{D}/src.html').read()
L={}
for f in sorted(os.listdir(f'{D}/logos')):
    b=io.BytesIO(); Image.open(f'{D}/logos/{f}').convert('RGB').resize((160,160),Image.LANCZOS).save(b,'JPEG',quality=88)
    L[f[:-4]]='data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
clips=json.load(open(f'{D}/clips/clips.json')) if os.path.exists(f'{D}/clips/clips.json') else []
import sys
INL='--inline' in sys.argv
if INL:
    for c in clips:
        c['v']=base64.b64encode(open(f'/home/user/dot-src/lite/{c["n"]:02d}.mp4','rb').read()).decode()
        c['thumb']='data:image/jpeg;base64,'+base64.b64encode(open(f'{D}/clips/{c["n"]:02d}.jpg','rb').read()).decode()
    s=s.replace('/*INLINE*/',"for(const c of [...CLIPS,...IA,...GUDAY,...BOLD,...FAN,...MAISMU]){if(c.v){try{const b=atob(c.v),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);c.file=URL.createObjectURL(new Blob([a],{type:'video/mp4'}))}catch(e){}delete c.v}}")
ia=json.load(open(f'{D}/ia/ia.json')) if os.path.exists(f'{D}/ia/ia.json') else []
if INL:
    for v in ia:
        v['v']=base64.b64encode(open(f'/home/user/unbox/lite/{v["id"]}.mp4','rb').read()).decode()
        v['thumb']='data:image/jpeg;base64,'+base64.b64encode(open(f'{D}/ia/{v["id"]}.jpg','rb').read()).decode()
s=s.replace('/*IA*/[]',json.dumps(ia,ensure_ascii=False))
gd=json.load(open(f'{D}/guday/guday.json')) if os.path.exists(f'{D}/guday/guday.json') else []
if INL:
    for v in gd:
        v['v']=base64.b64encode(open(f'/home/user/guday/lite/{v["id"]}.mp4','rb').read()).decode()
        v['thumb']='data:image/jpeg;base64,'+base64.b64encode(open(f'{D}/guday/{v["id"]}.jpg','rb').read()).decode()
s=s.replace('/*GUDAY*/[]',json.dumps(gd,ensure_ascii=False))
bd=json.load(open(f'{D}/bold/bold.json')) if os.path.exists(f'{D}/bold/bold.json') else []
if INL:
    for v in bd:
        v['v']=base64.b64encode(open(f'/home/user/bold/lite/{v["id"]}.mp4','rb').read()).decode()
        v['thumb']='data:image/jpeg;base64,'+base64.b64encode(open(f'{D}/bold/{v["id"]}.jpg','rb').read()).decode()
s=s.replace('/*BOLD*/[]',json.dumps(bd,ensure_ascii=False))
for KEY,folder,jn,lite in [('FAN','fan','fan.json','/home/user/fan/lite'),('MAISMU','maismu','maismu.json','/home/user/mu/lite')]:
    L2=json.load(open(f'{D}/{folder}/{jn}')) if os.path.exists(f'{D}/{folder}/{jn}') else []
    if INL:
        for v in L2:
            v['v']=base64.b64encode(open(f'{lite}/{v["id"]}.mp4','rb').read()).decode()
            v['thumb']='data:image/jpeg;base64,'+base64.b64encode(open(f'{D}/{folder}/{v["id"]}.jpg','rb').read()).decode()
    s=s.replace('/*'+KEY+'*/[]',json.dumps(L2,ensure_ascii=False))
# ---- marcas com player embutido (fotos + narração) ----
BR='/home/user/brands'
meta=json.load(open(f'{BR}/meta.json')) if os.path.exists(f'{BR}/meta.json') else []
specs={};baud={};bimg={}
for m in meta:
    sp=json.load(open(f'{BR}/specs/{m["id"]}.json')); specs[m['id']]=sp
    baud[m['id']]='data:audio/mpeg;base64,'+base64.b64encode(open(f'{BR}/audio/{m["id"]}.mp3','rb').read()).decode()
    th=f'{BR}/out/{m["id"]}.jpg'
    m['thumb']='data:image/jpeg;base64,'+base64.b64encode(open(th,'rb').read()).decode() if os.path.exists(th) else ''
for b in sorted({m['brand'] for m in meta}):
    for f in sorted(os.listdir(f'{BR}/img/{b}')):
        im=Image.open(f'{BR}/img/{b}/{f}').convert('RGB'); im.thumbnail((520,520)); bb=io.BytesIO(); im.save(bb,'JPEG',quality=80)
        bimg[b+'/'+f[:-4]]='data:image/jpeg;base64,'+base64.b64encode(bb.getvalue()).decode()
s=s.replace('/*SPECS*/{}',json.dumps(specs,ensure_ascii=False)).replace('/*BIMG*/{}',json.dumps(bimg)).replace('/*BAUD*/{}',json.dumps(baud)).replace('/*BMETA*/[]',json.dumps(meta,ensure_ascii=False))
s=s.replace('/*TPLIB*/',open(f'{BR}/story_lib.js').read()+'\n'+open(f'{BR}/player.js').read())
s=s.replace('/*LOGOS*/{}',json.dumps(L)).replace('/*CLIPS*/[]',json.dumps(clips,ensure_ascii=False)).replace('LOGO_DOT',L['dot'])
open(f'{D}/'+('tikfy-mvp-completo.html' if INL else 'index.html'),'w').write(s); print('index.html',len(s)//1024,'KB',len(clips),'cortes')
