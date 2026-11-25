"""Gera 18 vídeos da Bold (cortes narrados, dopamina, slideshow, POV, comparação, dados) misturando
trechos curtos (sem rosto, sem texto na tela) e fotos do produto. Roteiro original + narração + legenda."""
import json, re, subprocess, os, sys
sys.path.insert(0, "/home/user/unbox"); sys.path.insert(0, "/home/user/guday"); sys.path.insert(0, "/home/user/fan/tools")
from make import tts, words, align, ts
from guday import build_ass, HOOKBOX, FMTNAME
import guday
from lib import box
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageFont

B = "/home/user/fan"; W = f"{B}/work"; os.makedirs(W, exist_ok=True)
OUT = "/home/user/video-use/tikfy-mvp/fan"; os.makedirs(OUT, exist_ok=True)
FMTNAME = dict(FMTNAME, CORTE="Corte narrado")
HOOKBOX = dict(HOOKBOX, CORTE=HOOKBOX["SLIDE"])
guday.HOOKBOX.update(HOOKBOX)

def img(name):
    return f"{B}/img/{name}.png" if not name.startswith("/") else name

CTA = ["Clica no carrinho laranja e garante o seu antes que acabe!","Clica no carrinho laranja agora, porque esse desconto é por pouco tempo!","Corre no carrinho laranja, que essa promoção acaba rápido!","Clica no carrinho laranja e aproveita enquanto tem estoque!"]
V = [
 dict(id="f01", fmt="CORTE", score=97, title="Ventilador e luz no mesmo bocal", hook="VENTILADOR E LUZ\\NNO MESMO BOCAL?!", seq=["F9","F11","F2","F1","F3"],
  text="Esse ventilador é rosqueado no bocal da lâmpada. Isso mesmo: você tira a lâmpada, rosqueia ele no lugar e pronto, ganha ventilador e luz ao mesmo tempo. Sem eletricista e sem obra. "+CTA[0]),
 dict(id="f02", fmt="CORTE", score=96, title="Instala em 1 minuto, sem eletricista", hook="INSTALA EM 1 MINUTO\\NSEM ELETRICISTA", seq=["F4","F5","F6","F11","F2"],
  text="Chegou, abriu a caixa, rosqueou no bocal e já tá funcionando. Esse ventilador de teto com luz LED instala em um minuto, sem eletricista, sem furar o teto. "+CTA[1]),
 dict(id="f03", fmt="DOPA", score=95, title="O quarto quente nunca mais", hook="SEU QUARTO É UM\\NFORNO À NOITE?", bg="tunnel", seq=["F2","F9","F12","F3"],
  text="Seu quarto é um forno à noite? Esse ventilador vai direto no bocal da lâmpada, ventila e ilumina, e tem três velocidades. Dormir no calor nunca mais. "+CTA[2]),
 dict(id="f04", fmt="SLIDE", score=94, title="Antes e depois do quarto", hook="ANTES E DEPOIS\\nDO QUARTO".replace("\\n","\\N"), seq=["img:p4","img:p5","img:p8","img:p2","img:p6"],
  text="Olha o antes e depois. Antes, uma lâmpada pendurada. Depois, ventilador de teto com luz LED, moderno e bonito. Combina com quarto, sala e cozinha. "+CTA[0]),
 dict(id="f05", fmt="DADOS", score=93, title="Tudo que esse ventilador faz", hook="OLHA TUDO QUE ESSE\\NVENTILADOR FAZ", seq=["img:p2","F2","img:p8","F1"],
  cards=[("ventila","VENTILA E ILUMINA"),("controle","CONTROLE REMOTO"),("três","3 VELOCIDADES"),("bocal","INSTALAÇÃO NO\\NBOCAL E27")],
  text="Olha tudo que esse ventilador faz. Ele ventila e ilumina, vem com controle remoto, tem três velocidades e instala direto no bocal E27. "+CTA[3]),
 dict(id="f06", fmt="POV", score=92, title="POV: desligou a luz sem levantar", hook="POV: VOCÊ DESLIGA TUDO\\NSEM SAIR DA CAMA", seq=["F1","F3","F2","img:p1"],
  text="POV: você deita, pega o controle e desliga a luz sem sair da cama. Esse ventilador de teto vem com controle remoto pra luz e pra velocidade. Preguiça liberada. "+CTA[1]),
 dict(id="f07", fmt="CORTE", score=91, title="Unboxing do ventilador de bocal", hook="ABRINDO O VENTILADOR\\NQUE VIRALIZOU", seq=["F4","F5","F6","F7","F8"],
  text="Abrindo o ventilador que viralizou. Vem o ventilador com luminária e o controle remoto. As pás encaixam fácil e a base rosqueia no bocal. Simples assim. "+CTA[2]),
 dict(id="f08", fmt="COMPARA", score=90, title="Ventilador comum ou de bocal?", hook="VENTILADOR COMUM OU\\NDE BOCAL?", cmp=("@fan","p6"), seq=["F9","F2","img:p8","F11"],
  text="Ventilador comum ou ventilador de bocal? O comum ocupa espaço no chão e faz barulho perto de você. O de bocal fica no teto, ventila de cima, e ainda ilumina o cômodo inteiro. "+CTA[0]),
 dict(id="f09", fmt="SLIDE", score=89, title="Serve em qualquer cômodo", hook="SERVE EM QUALQUER\\NCÔMODO DA CASA", seq=["img:p5","img:p4","img:p8","img:p7","img:p2"],
  labels={"img:p5":"QUARTO, SALA E COZINHA","img:p4":"ANTES E DEPOIS","img:p7":"52 CM DE DIÂMETRO"},
  text="Serve em qualquer cômodo da casa. No quarto, na sala, na cozinha ou no escritório. Onde tiver um bocal de lâmpada, ele funciona. "+CTA[3]),
 dict(id="f10", fmt="DOPA", score=88, title="100W de luz + vento", hook="100W DE LUZ\\N+ VENTO NO TETO", bg="life", seq=["img:p8","F2","F3","F12"],
  text="Cem watts de luminosidade e vento no mesmo aparelho. Esse ventilador de teto tem cinquenta e dois centímetros de ponta a ponta e ilumina o cômodo todo. "+CTA[1]),
 dict(id="f11", fmt="POV", score=87, title="POV: aluguel que não pode furar", hook="POV: VOCÊ MORA DE\\NALUGUEL E NÃO PODE FURAR", seq=["F11","F12","F2","img:p4"],
  text="POV: você mora de aluguel e não pode fazer obra. Esse ventilador não precisa: rosqueia no bocal da lâmpada e pronto. Na mudança, é só desrosquear e levar junto. "+CTA[2]),
 dict(id="f12", fmt="DADOS", score=86, title="3 motivos pra comprar", hook="3 MOTIVOS PRA TER\\NESSE VENTILADOR", seq=["img:p6","F2","img:p3","F1"],
  cards=[("Um:","SEM OBRA,\\NSEM ELETRICISTA"),("Dois:","VENTILA E ILUMINA"),("Três:","CONTROLE REMOTO")],
  text="Três motivos pra ter esse ventilador. Um: sem obra e sem eletricista. Dois: ventila e ilumina ao mesmo tempo. Três: tudo pelo controle remoto. "+CTA[0]),
 dict(id="f13", fmt="CORTE", score=85, title="Testei o ventilador de bocal", hook="TESTEI O VENTILADOR\\NDE BOCAL. VALE?", seq=["F8","F9","F10","F2","F13"],
  text="Testei o ventilador de bocal e vou te contar. A instalação é muito fácil, as pás são leves e a luz é bem forte. Pelo preço, vale muito a pena. "+CTA[3]),
 dict(id="f14", fmt="SLIDE", score=84, title="O que vem na caixa", hook="O QUE VEM\\NNA CAIXA", seq=["img:p6","img:p1","img:p3","img:p7","img:p2"],
  labels={"img:p6":"VENTILADOR + CONTROLE","img:p1":"CONTROLE REMOTO","img:p3":"ENCAIXE E27","img:p7":"52 CM"},
  text="O que vem na caixa: o ventilador com luminária e o controle remoto. Encaixe padrão E27 e cinquenta e dois centímetros de diâmetro. "+CTA[1]),
 dict(id="f15", fmt="DOPA", score=83, title="O achadinho do verão", hook="O ACHADINHO\\NDO VERÃO", bg="mandel", seq=["F9","F2","img:p8","F11"],
  text="Esse é o achadinho do verão. Ventilador de teto com luz LED que instala no bocal. Barato, prático e resolve o calor. "+CTA[2]),
 dict(id="f16", fmt="POV", score=82, title="POV: o calor chegou", hook="POV: O CALOR CHEGOU\\NE VOCÊ TÁ PREPARADO", seq=["F2","F3","F12","img:p5"],
  text="POV: o calor chegou e você já tá preparado. Ventilador de teto rosqueado no bocal, três velocidades e luz LED. Agora é só curtir o fresquinho. "+CTA[0]),
 dict(id="f17", fmt="CORTE", score=81, title="Olha o tamanho dele", hook="OLHA O TAMANHO\\NDESSE VENTILADOR", seq=["F10","F12","F13","F9"],
  text="Olha o tamanho desse ventilador. São cinquenta e dois centímetros de uma ponta à outra, com seis pás e luz no centro. E mesmo assim é leve. "+CTA[3]),
 dict(id="f18", fmt="COMPARA", score=80, title="Lâmpada comum ou ventilador LED?", hook="LÂMPADA COMUM OU\\NVENTILADOR LED?", cmp=("@lamp","p8"), seq=["img:p4","F2","F3","img:p5"],
  text="Lâmpada comum ou ventilador com luz LED? A lâmpada só ilumina. Esse aqui ocupa o mesmo bocal, ilumina com cem watts e ainda ventila. "+CTA[1]),
 dict(id="f19", fmt="SLIDE", score=79, title="Ventilador de bocal em 10 segundos", hook="VENTILADOR DE BOCAL\\NEM 10 SEGUNDOS", seq=["img:p8","img:p2","img:p1","img:p4","img:p6"],
  text="Ventilador de bocal em dez segundos. Rosqueia no lugar da lâmpada. Ventila e ilumina. Controle remoto. Três velocidades. "+CTA[2]),
 dict(id="f20", fmt="DADOS", score=78, title="Como instalar em 3 passos", hook="COMO INSTALAR\\nEM 3 PASSOS".replace("\\n","\\N"), seq=["F11","F6","F7","F2"],
  cards=[("um:","1. TIRE A LÂMPADA"),("dois:","2. ROSQUEIE NO BOCAL"),("três:","3. LIGUE PELO\\NCONTROLE")],
  text="Como instalar em três passos. Passo um: tire a lâmpada. Passo dois: rosqueie o ventilador no bocal. Passo três: ligue pelo controle. "+CTA[3]),
]
def frame_img(path, out, size=(1080,1920), fit_w=1000, fit_h=1300, dark=0.5):
    im = Image.open(path).convert("RGB"); W_, H_ = size
    s = max(W_/im.width, H_/im.height); bg = im.resize((int(im.width*s)+1, int(im.height*s)+1))
    bg = bg.crop(((bg.width-W_)//2, (bg.height-H_)//2, (bg.width-W_)//2+W_, (bg.height-H_)//2+H_))
    bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(40))).enhance(dark)
    k = min(fit_w/im.width, fit_h/im.height); fg = im.resize((int(im.width*k), int(im.height*k)), Image.LANCZOS)
    bg.paste(fg, ((W_-fg.width)//2, (H_-fg.height)//2 + (40 if H_ > 1500 else 0))); bg.save(out, quality=92)

def choco_img(out, kind="@fan"):
    c = Image.new("RGB", (900, 820), (43, 43, 51)); d = ImageDraw.Draw(c)
    f = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Black.otf", 58)
    if kind == "@fan":  # ventilador de chão
        d.ellipse((260, 110, 640, 490), outline=(190,190,200), width=14)
        for k in range(3):
            import math; a0 = k*2.094
            d.ellipse((450+int(math.cos(a0)*95)-70, 300+int(math.sin(a0)*95)-45, 450+int(math.cos(a0)*95)+70, 300+int(math.sin(a0)*95)+45), fill=(150,150,165))
        d.ellipse((420, 270, 480, 330), fill=(90,90,100)); d.rectangle((435, 490, 465, 690), fill=(120,120,130)); d.rounded_rectangle((330, 680, 570, 720), 14, fill=(120,120,130))
        d.text((450, 770), "VENTILADOR DE CHÃO", font=f, fill=(220,220,230), anchor="mm")
    else:  # lâmpada comum
        d.ellipse((330, 150, 570, 400), fill=(255, 236, 150)); d.rectangle((400, 390, 500, 470), fill=(170,170,180))
        for y in (410, 435, 460): d.line((400, y, 500, y), fill=(120,120,130), width=6)
        d.line((450, 40, 450, 150), fill=(90,90,90), width=8)
        d.text((450, 600), "LÂMPADA COMUM", font=f, fill=(220,220,230), anchor="mm")
    c.save(out, quality=92)

def render(v):
    v = dict(v, ls=0.7, sil=0.04)
    wav = tts(v); ws, dur = words(wav); ws = align(v["text"], ws); dur = round(dur+0.4, 2)
    split = v["fmt"] == "DOPA"
    L, cta = build_ass(v, ws, dur, None, split)
    L = [l.replace("GUDAY · CREATINA EM GUMMIES", "VENTILADOR DE TETO · LUZ LED") for l in L]
    seq = list(v["seq"])
    if v["fmt"] == "SLIDE":
        per = 0.9; s2 = []; t = 0; i = 0
        while t < dur - 0.01: s2.append((seq[i % len(seq)], min(per, dur-t))); t += per; i += 1
    elif v["fmt"] == "COMPARA":
        sidx=[];cnt=0
        for sent in re.split(r"(?<=[.!?])\s+", v["text"]): sidx.append(cnt); cnt+=len(sent.split())
        mid = ws[sidx[2]][0] if len(sidx)>2 else dur*0.45
        per = (dur-mid)/len(seq); s2 = [("CMP", mid)] + [(x, per) for x in seq]
    else:
        per = dur/len(seq); s2 = [(x, per) for x in seq]
    if v.get("labels"):
        t = 0
        for x, d in s2:
            if x in v["labels"]: L.append(f"Dialogue: 4,{ts(t)},{ts(t+d)},Lab,,0,0,0,,{{\\pos(360,420)}}{v['labels'][x]}")
            t += d
    if v["fmt"] == "COMPARA":
        L.append(f"Dialogue: 4,{ts(0)},{ts(s2[0][1])},Card,,0,0,0,,{{\\pos(190,330)\\c&H00FFFFFF&\\3c&H00552CFE&\\4c&H00552CFE&}}COMUM")
        L.append(f"Dialogue: 4,{ts(0)},{ts(s2[0][1])},Card,,0,0,0,,{{\\pos(150,790)}}ESTE")
    ass = f"{W}/{v['id']}.ass"; open(ass, "w").write("\n".join(L)+"\n")
    cmd = ["ffmpeg","-v","error","-y"]; fc = ""; n = 0
    osz = (720,640) if split else (720,1280)
    for k,(x,d) in enumerate(s2):
        fr = max(1,int(d*30)); zin = k % 2 == 0
        z = f"1+0.06*on/{fr}" if zin else f"1.06-0.06*on/{fr}"
        if x == "CMP":
            a = f"{W}/{v['id']}_a.jpg"; b = f"{W}/{v['id']}_b.jpg"; ch = f"{W}/cmp_{v['id']}.jpg"; choco_img(ch, v["cmp"][0])
            frame_img(ch, a, size=(1080,960), fit_w=820, fit_h=760, dark=0.45); frame_img(img(v["cmp"][1]), b, size=(1080,960), fit_w=900, fit_h=760, dark=0.45)
            c = Image.new("RGB",(1080,1920)); c.paste(Image.open(a),(0,0)); c.paste(Image.open(b),(0,960)); f = f"{W}/{v['id']}_{k}.jpg"; c.save(f, quality=92)
            cmd += ["-loop","1","-t",f"{d+0.05:.3f}","-i",f]
            fc += f"[{k}:v]fps=30,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={osz[0]}x{osz[1]}:fps=30,trim=duration={d:.3f},setpts=PTS-STARTPTS,setsar=1[s{k}];"
        elif x.startswith("img:"):
            f = f"{W}/{v['id']}_{k}.jpg"
            if split: frame_img(img(x[4:]), f, size=(1080,960), fit_w=1000, fit_h=880, dark=0.45)
            else: frame_img(img(x[4:]), f)
            cmd += ["-loop","1","-t",f"{d+0.05:.3f}","-i",f]
            fc += f"[{k}:v]fps=30,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={osz[0]}x{osz[1]}:fps=30,trim=duration={d:.3f},setpts=PTS-STARTPTS,setsar=1[s{k}];"
        else:
            vv,a0,b0,cx,cy,cw,chh = box(x); src = f"{B}/src/{vv}.mp4"; avail = b0-a0
            if split:  # recorte 9:8 para a metade de cima
                chh2 = int(cw*8/9); cy2 = cy + chh//2 - chh2//2 - 40; cy2 = max(0, min(1024-chh2, cy2)); crop = f"crop={cw}:{chh2}:{cx}:{cy2}"
            else: crop = f"crop={cw}:{chh}:{cx}:{cy}"
            speed = min(1.0, avail/d)
            cmd += ["-ss",f"{a0}","-t",f"{avail}","-i",src]
            fc += f"[{k}:v]setpts=PTS/{speed:.4f}-STARTPTS,fps=30,{crop},scale={osz[0]}:{osz[1]},eq=saturation=1.12:contrast=1.04,trim=duration={d:.3f},setpts=PTS-STARTPTS,setsar=1[s{k}];"
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
    why = {"DOPA":"Tela partida com vídeo satisfatório segura a atenção.","POV":"POV gera identificação imediata.","DADOS":"Benefícios claros em cards na tela.","COMPARA":"Comparação direta quebra a objeção.","SLIDE":"Cortes rápidos de imagem prendem o olhar.","CORTE":"Trechos reais de avaliações + narração original."}[v["fmt"]]
    return {"id":v["id"],"score":v["score"],"format":FMTNAME[v["fmt"]],"title":v["title"],"dur":dur,"why":why,
            "file":f"fan/{v['id']}.mp4","thumb":f"fan/{v['id']}.jpg",
            "caption":f"{v['title']} 🌀 Ventilador de teto com luz LED que instala no bocal. Clica no carrinho laranja 🛒 #tiktokshop #achadinhos #ventilador #casa"}

if __name__ == "__main__":
    only = sys.argv[1:]
    res = [render(v) for v in V if not only or v["id"] in only]
    if not only: json.dump([r for r in res if r], open(f"{OUT}/fan.json","w"), ensure_ascii=False, indent=1)
