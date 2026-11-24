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
    s=s.replace('/*INLINE*/',"for(const c of CLIPS){if(c.v){try{const b=atob(c.v),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);c.file=URL.createObjectURL(new Blob([a],{type:'video/mp4'}))}catch(e){}delete c.v}}")
s=s.replace('/*LOGOS*/{}',json.dumps(L)).replace('/*CLIPS*/[]',json.dumps(clips,ensure_ascii=False)).replace('LOGO_DOT',L['dot'])
open(f'{D}/'+('tikfy-mvp-completo.html' if INL else 'index.html'),'w').write(s); print('index.html',len(s)//1024,'KB',len(clips),'cortes')
