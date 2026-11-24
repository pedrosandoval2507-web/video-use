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
s=s.replace('/*LOGOS*/{}',json.dumps(L)).replace('/*CLIPS*/[]',json.dumps(clips,ensure_ascii=False)).replace('LOGO_DOT',L['dot'])
open(f'{D}/index.html','w').write(s); print('index.html',len(s)//1024,'KB',len(clips),'cortes')
