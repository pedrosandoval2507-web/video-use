"""Gera 10 vídeos da Guday a partir das fotos: narração (Piper), legenda alinhada ao roteiro, gancho e CTA."""
import json, re, subprocess, os, sys
sys.path.insert(0, "/home/user/unbox")
from make import tts, words, align, ts, col  # reaproveita o motor dos vídeos da Dot

R = "/home/user/guday/raw"
W = "/home/user/guday/work"; os.makedirs(W, exist_ok=True)
OUT = "/home/user/video-use/tikfy-mvp/guday"; os.makedirs(OUT, exist_ok=True)
RED, CYAN, YEL, WHITE, BLACK = col("FE2C55"), col("25F4EE"), col("FFD54A"), "&H00FFFFFF", "&H00000000"
PURPLE = col("7B3FE4")

V = [
 dict(id="g01", fmt="DOPA", score=97, title="Creatina com gosto de bala?",
  hook="CREATINA COM\\NGOSTO DE BALA?", imgs=[30,4,5,7,1,2,20,13],
  text="Você ainda toma creatina em pó com gosto de areia? Para tudo. Essa é a Guday, creatina em gummy. Duas gominhas por dia te dão três gramas de creatina, sem açúcar, sem glúten e sem lactose. É só mastigar e ir treinar. Clica no carrinho laranja agora, porque essa promoção é por pouco tempo!"),
 dict(id="g02", fmt="POV", score=95, title="POV: achou uma creatina que dá vontade de tomar",
  hook="POV: VOCÊ ACHOU UMA\\NCREATINA QUE DÁ\\NVONTADE DE TOMAR", imgs=[21,11,12,15,17,5,16],
  text="POV: você finalmente achou uma creatina que dá vontade de tomar. Abre o pote, pega duas gummies e pronto: três gramas de creatina. Sem misturar, sem copo, sem gosto ruim. Leva na bolsa, na mochila, pro trabalho. Clica no carrinho laranja e garante a sua com desconto, porque é por pouco tempo!"),
 dict(id="g03", fmt="DADOS", score=94, title="3 motivos pra trocar o pó pela gummy",
  hook="3 MOTIVOS PRA TROCAR\\NO PÓ PELA GUMMY", imgs=[5,26,4,24,22,20],
  cards=[("Um:",  "3 G DE CREATINA\\N= 2 GUMMIES"),("Dois:","SEM AÇÚCAR · SEM\\NGLÚTEN · SEM LACTOSE"),("Três:","SABOR DE BALA")],
  text="Três motivos pra trocar a creatina em pó pela gummy. Um: são três gramas de creatina em só duas gummies. Dois: sem açúcar, sem glúten e sem lactose. Três: sabor de bala, então você não esquece nenhum dia. E constância é o que dá resultado. Clica no carrinho laranja e garante a sua antes que o estoque acabe!"),
 dict(id="g04", fmt="COMPARA", score=93, title="Creatina em pó ou em gummy?",
  hook="PÓ OU GUMMY?\\NOLHA A DIFERENÇA", imgs=[22,4,29,16,13], cmp=(30,7),
  text="Creatina em pó ou em gummy? Olha a diferença. No pó: tem que misturar, sujar copo e aguentar o gosto. Na gummy da Guday: duas gominhas, três gramas de creatina, sabor de bala e zero açúcar. Cabe na bolsa e vai com você pra qualquer lugar. Clica no carrinho laranja e garante a sua, porque essa oferta acaba rápido!"),
 dict(id="g05", fmt="DOPA", score=92, title="Ninguém te conta isso sobre creatina",
  hook="NINGUÉM TE CONTA ISSO\\NSOBRE CREATINA", imgs=[28,10,30,3,22,24,15], bg="life",
  text="Ninguém te conta isso sobre creatina. Ela é um dos suplementos mais estudados do mundo e ajuda no aumento de força nos treinos. O problema é que quase ninguém aguenta tomar pó todo dia. Por isso a Guday colocou a creatina numa gummy: duas por dia e pronto. Clica no carrinho laranja antes que acabe o estoque!"),
 dict(id="g06", fmt="DEPO", score=91, title="Eu odiava tomar creatina",
  hook="EU ODIAVA TOMAR\\NCREATINA...", imgs=[18,30,21,15,16,7],
  text="Eu era a pessoa que odiava creatina. Gosto de areia, pó grudando no copo, e eu sempre esquecia. Aí eu conheci a Guday. Agora são duas gummies por dia, com gosto de bala, e eu não falho mais nenhum dia. Sério, muda tudo. Clica no carrinho laranja e testa você também, que tá com desconto por pouco tempo!"),
 dict(id="g07", fmt="SLIDE", score=90, title="Os 4 sabores que viraram febre",
  hook="OS 4 SABORES DE CREATINA\\NQUE VIRARAM FEBRE", imgs=[23,4,12,3,2,1,24,6,20,13],
  labels={23:"MAÇÃ VERDE",4:"MAÇÃ VERDE",12:"FRUTAS VERMELHAS",3:"FRUTAS VERMELHAS",2:"LARANJA",1:"OAKBERRY",24:"OAKBERRY"},
  text="Os quatro sabores de creatina que viraram febre. Maçã verde. Frutas vermelhas. Laranja. Oakberry. Todos com três gramas de creatina em duas gummies, sem açúcar e sem glúten. Qual é o seu favorito? Comenta aí e clica no carrinho laranja pra garantir o seu, que o desconto é por pouco tempo!"),
 dict(id="g08", fmt="POV", score=88, title="POV: 6 da manhã e esqueceu a creatina",
  hook="POV: 6H DA MANHÃ E VOCÊ\\NESQUECEU A CREATINA", imgs=[19,4,23,6,29,13,10],
  text="POV: são seis da manhã e você esqueceu a creatina de novo. Com a Guday isso não acontece mais. São duas gominhas por dia, que você leva pra qualquer lugar. Mastigou, foi treinar. Sabor de bala e sem açúcar. Clica no carrinho laranja agora, antes que acabe!"),
 dict(id="g09", fmt="DADOS", score=86, title="Como tomar creatina em gummy",
  hook="COMO TOMAR CREATINA\\NEM GUMMY DO JEITO CERTO", imgs=[19,17,10,28,29,5],
  cards=[("um:","1. DUAS GUMMIES\\NPOR DIA"),("dois:","2. VÁ TREINAR"),("três:","3. DESCANSE E VEJA\\NOS RESULTADOS")],
  text="Como tomar creatina em gummy do jeito certo. Passo um: mastigue duas gummies por dia. Passo dois: vá treinar ou faça suas atividades. Passo três: descanse e veja os resultados a longo prazo. Simples assim. Clica no carrinho laranja e começa hoje, porque esse desconto é por tempo limitado!"),
 dict(id="g10", fmt="SLIDE", score=84, title="Tudo muda na primeira mordida",
  hook="TUDO MUDA NA\\NPRIMEIRA MORDIDA", imgs=[11,13,7,16,20,29,15,2,21],
  text="Tudo muda na primeira mordida. A Guday transformou a creatina numa gummy deliciosa. Duas por dia, três gramas de creatina, zero açúcar. Mais praticidade pra sua rotina de treino. Clica no carrinho laranja e garante o seu pote de sessenta gummies, porque essa promoção acaba rápido!"),
]
FMTNAME = {"DOPA":"Dopamina","POV":"POV","DADOS":"Dados do produto","COMPARA":"Comparação","DEPO":"Depoimento","SLIDE":"Slideshow"}
HOOKBOX = {"DOPA":(BLACK,YEL),"POV":(BLACK,WHITE),"DADOS":(BLACK,CYAN),"COMPARA":(WHITE,RED),"DEPO":(WHITE,PURPLE),"SLIDE":(WHITE,RED)}

def frame(img, out, size=(1080,1920), fit_w=1000, fit_h=1300, dark=0.55):
    """Fundo desfocado + imagem inteira no centro (funciona pra qualquer proporção)."""
    from PIL import Image, ImageFilter, ImageEnhance
    im = Image.open(f"{R}/{img:02d}.png").convert("RGB")
    W_, H_ = size
    s = max(W_/im.width, H_/im.height); bg = im.resize((int(im.width*s)+1, int(im.height*s)+1))
    bg = bg.crop(((bg.width-W_)//2, (bg.height-H_)//2, (bg.width-W_)//2+W_, (bg.height-H_)//2+H_))
    bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(40))).enhance(dark)
    k = min(fit_w/im.width, fit_h/im.height); fg = im.resize((int(im.width*k), int(im.height*k)), Image.LANCZOS)
    bg.paste(fg, ((W_-fg.width)//2, (H_-fg.height)//2 + (40 if H_>1500 else 0)))
    bg.save(out, quality=92)

def build_ass(v, ws, dur, path, split=False):
    fg, box = HOOKBOX[v["fmt"]]
    capy = 640 if split else 1010
    L = ["[Script Info]","ScriptType: v4.00+","PlayResX: 720","PlayResY: 1280","WrapStyle: 2","",
         "[V4+ Styles]","Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
         f"Style: Hook,Inter Black,42,{fg},{fg},{box},{box},0,0,0,0,100,100,0,0,3,14,0,8,40,40,{70 if split else 140},1",
         f"Style: Cap,Inter Black,56,{WHITE},{WHITE},{BLACK},&H80000000,0,0,0,0,100,100,0,0,1,6,2,5,30,30,0,1",
         f"Style: Card,Inter Black,42,{BLACK},{BLACK},{CYAN},{CYAN},0,0,0,0,100,100,0,0,3,16,0,5,40,40,0,1",
         f"Style: Lab,Inter Black,40,{WHITE},{WHITE},{PURPLE},{PURPLE},0,0,0,0,100,100,0,0,3,12,0,5,40,40,0,1",
         f"Style: Cta,Inter Black,40,{WHITE},{WHITE},{RED},{RED},0,0,0,0,100,100,0,0,3,16,0,5,40,40,0,1",
         f"Style: Arrow,Inter Black,40,{RED},{RED},{WHITE},&H00000000,0,0,0,0,100,100,0,0,1,4,0,7,0,0,0,1",
         f"Style: Tag,Inter Black,24,{WHITE},{WHITE},&H00303030,&H00303030,0,0,0,0,100,100,0,0,3,9,0,7,0,0,0,1",
         "","[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    cta = next((a for a,b,w in ws if w.lower().startswith("clica")), dur-4)
    L.append(f"Dialogue: 2,{ts(0)},{ts(cta)},Hook,,0,0,0,,{{\\fad(100,0)\\t(0,160,\\fscx107\\fscy107)\\t(160,300,\\fscx100\\fscy100)}}{v['hook']}")
    if not split: L.append(f"Dialogue: 2,{ts(0)},{ts(dur)},Tag,,0,0,0,,{{\\pos(40,1100)}}GUDAY · CREATINA EM GUMMIES")
    L.append(f"Dialogue: 3,{ts(cta)},{ts(dur)},Cta,,0,0,0,,{{\\pos(360,{330 if split else 250})\\fad(120,0)\\t(0,200,\\fscx108\\fscy108)\\t(200,350,\\fscx100\\fscy100)}}ESTOQUE ACABANDO!\\NCLIQUE NO CARRINHO")
    t = cta
    while t < dur:
        e = min(t+0.6, dur)
        L.append(f"Dialogue: 3,{ts(t)},{ts(e)},Arrow,,0,0,0,,{{\\move(70,1120,70,1160)\\p1}}m 0 0 l 60 0 l 30 45{{\\p0}}"); t = e
    # data cards triggered by a spoken word
    for trig, txt in v.get("cards", []):
        st = next((a for a,b,w in ws if w.lower()==trig.lower()), None)
        if st is None: continue
        en = min(cta, st+3.2)
        L.append(f"Dialogue: 4,{ts(st)},{ts(en)},Card,,0,0,0,,{{\\pos(360,420)\\fad(80,120)\\fscx70\\fscy70\\t(0,140,\\fscx104\\fscy104)\\t(140,240,\\fscx100\\fscy100)}}{txt}")
    groups=[]; cur=[]
    for a,b,w in ws:
        if cur and (len(cur)>=3 or a-cur[-1][1]>0.35 or re.search(r"[.,!?:]$",cur[-1][2])): groups.append(cur); cur=[]
        cur.append((a,b,w))
    if cur: groups.append(cur)
    for gi,g in enumerate(groups):
        nxt = groups[gi+1][0][0] if gi+1<len(groups) else dur
        for j,(a,b,w) in enumerate(g):
            end = g[j+1][0] if j+1<len(g) else min(b+0.3, nxt, dur)
            if end<=a: end=a+0.08
            parts=[]
            for k,(_,_,ww) in enumerate(g):
                tt = re.sub(r"[.,!?;:]","",ww).upper()
                parts.append(f"{{\\c{YEL}}}{tt}{{\\c{WHITE}}}" if k==j else tt)
            pop = "\\fscx112\\fscy112\\t(0,90,\\fscx100\\fscy100)" if j==0 else ""
            L.append(f"Dialogue: 1,{ts(a)},{ts(end)},Cap,,0,0,0,,{{\\pos(360,{capy}){pop}}}"+" ".join(parts))
    return L, cta

def render(v):
    wav = tts(v); ws, dur = words(wav); ws = align(v["text"], ws); dur = round(dur+0.4, 2)
    split = v["fmt"] == "DOPA"
    L, cta = build_ass(v, ws, dur, None, split)
    imgs = list(v["imgs"])
    # timeline of images
    if v["fmt"] == "SLIDE":
        per = 0.85; seq = []; t = 0; i = 0
        while t < dur: seq.append((imgs[i % len(imgs)], min(per, dur-t))); t += per; i += 1
    elif v["fmt"] == "COMPARA":
        mid = next((a for a,b,w in ws if w.lower().startswith("na")), dur*0.45)
        rest = dur - mid; per = rest/len(imgs)
        seq = [("CMP", mid)] + [(im, per) for im in imgs]
    else:
        per = dur/len(imgs); seq = [(im, per) for im in imgs]
    # label events for slideshow flavors
    if v.get("labels"):
        t = 0
        for im, d in seq:
            if im in v["labels"]:
                L.append(f"Dialogue: 4,{ts(t)},{ts(t+d)},Lab,,0,0,0,,{{\\pos(360,{420})}}{v['labels'][im]}")
            t += d
    if v["fmt"] == "COMPARA":
        L.append(f"Dialogue: 4,{ts(0)},{ts(seq[0][1])},Card,,0,0,0,,{{\\pos(150,330)\\c{WHITE}\\3c{RED}\\4c{RED}}}PÓ")
        L.append(f"Dialogue: 4,{ts(0)},{ts(seq[0][1])},Card,,0,0,0,,{{\\pos(150,790)}}GUMMY")
    ass = f"{W}/{v['id']}.ass"; open(ass,"w").write("\n".join(L)+"\n")
    cmd = ["ffmpeg","-v","error","-y"]; fc = ""; n = 0
    for k,(im,d) in enumerate(seq):
        f = f"{W}/{v['id']}_{k}.jpg"
        if im == "CMP":
            from PIL import Image
            a = f"{W}/{v['id']}_a.jpg"; b = f"{W}/{v['id']}_b.jpg"
            frame(v["cmp"][0], a, size=(1080,960), fit_w=900, fit_h=820, dark=0.45)
            frame(v["cmp"][1], b, size=(1080,960), fit_w=900, fit_h=820, dark=0.45)
            c = Image.new("RGB",(1080,1920)); c.paste(Image.open(a),(0,0)); c.paste(Image.open(b),(0,960)); c.save(f, quality=92)
        else:
            frame(im, f, dark=0.5 if not split else 0.5, fit_h=1300 if not split else 1700)
        if split:
            from PIL import Image
            frame(im, f, size=(1080,960), fit_w=1040, fit_h=900, dark=0.45)
        cmd += ["-loop","1","-t",f"{d+0.05:.3f}","-i",f]
        zin = k % 2 == 0
        fr = max(1,int(d*30))
        z = f"1+0.07*on/{fr}" if zin else f"1.07-0.07*on/{fr}"
        osz = "720x640" if split else "720x1280"
        fc += f"[{k}:v]fps=30,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={osz}:fps=30,trim=duration={d:.3f},setpts=PTS-STARTPTS,setsar=1[s{k}];"
        n += 1
    fc += "".join(f"[s{k}]" for k in range(n)) + f"concat=n={n}:v=1:a=0[cv];"
    ai = n
    if split:
        cmd += ["-stream_loop","-1","-i",f"/home/user/dot-src/bg/{v.get('bg','tunnel')}.mp4"]; ai = n+1
        fc += f"[{n}:v]trim=duration={dur},setpts=PTS-STARTPTS,fps=30[bot];[cv][bot]vstack,setsar=1[cv2];[cv2]ass={ass}[vo];"
    else:
        fc += f"[cv]ass={ass}[vo];"
    cmd += ["-i", wav]
    fc += f"[{ai}:a]apad=pad_dur=0.4,loudnorm=I=-14:TP=-1.5,aresample=44100[ao]"
    out = f"{OUT}/{v['id']}.mp4"
    cmd += ["-filter_complex",fc,"-map","[vo]","-map","[ao]","-t",f"{dur}","-c:v","libx264","-preset","medium","-crf","24","-pix_fmt","yuv420p","-c:a","aac","-b:a","128k","-movflags","+faststart",out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print("ERR", v["id"], r.stderr[-1500:], flush=True); return None
    subprocess.run(["ffmpeg","-v","error","-y","-ss","1.0","-i",out,"-frames:v","1","-vf","scale=360:640","-q:v","4",f"{OUT}/{v['id']}.jpg"])
    print("ok", v["id"], dur, flush=True)
    return {"id":v["id"],"score":v["score"],"format":FMTNAME[v["fmt"]],"title":v["title"],"dur":dur,
            "why":{"DOPA":"Tela partida com vídeo satisfatório segura a atenção.","POV":"POV gera identificação imediata.","DADOS":"Benefícios claros em cards na tela.","COMPARA":"Comparação direta quebra a objeção do pó.","DEPO":"Depoimento em 1ª pessoa gera confiança.","SLIDE":"Cortes rápidos de imagem prendem o olhar."}[v["fmt"]],
            "file":f"guday/{v['id']}.mp4","thumb":f"guday/{v['id']}.jpg",
            "caption":f"{v['title']} 🍏 Guday: creatina em gummies, 3 g em 2 gomas, sem açúcar. Clica no carrinho laranja 🛒 #tiktokshop #guday #creatina #creatinagummy #treino"}

if __name__ == "__main__":
    only = sys.argv[1:]
    res = [render(v) for v in V if not only or v["id"] in only]
    if not only: json.dump([r for r in res if r], open(f"{OUT}/guday.json","w"), ensure_ascii=False, indent=1)
