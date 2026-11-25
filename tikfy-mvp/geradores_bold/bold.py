"""Gera 18 vídeos da Bold (cortes narrados, dopamina, slideshow, POV, comparação, dados) misturando
trechos curtos (sem rosto, sem texto na tela) e fotos do produto. Roteiro original + narração + legenda."""
import json, re, subprocess, os, sys
sys.path.insert(0, "/home/user/unbox"); sys.path.insert(0, "/home/user/guday"); sys.path.insert(0, "/home/user/bold/tools")
from make import tts, words, align, ts
from guday import build_ass, HOOKBOX, FMTNAME
import guday
from lib import box
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageFont

B = "/home/user/bold"; W = f"{B}/work"; os.makedirs(W, exist_ok=True)
OUT = "/home/user/video-use/tikfy-mvp/bold"; os.makedirs(OUT, exist_ok=True)
FMTNAME = dict(FMTNAME, CORTE="Corte narrado")
HOOKBOX = dict(HOOKBOX, CORTE=HOOKBOX["SLIDE"])
guday.HOOKBOX.update(HOOKBOX)

def img(name):
    return f"{B}/img/{name}.png" if not name.startswith("/") else name

V = [
 dict(id="b01", fmt="CORTE", score=97, title="A barrinha de proteína que parece sobremesa", hook="ACHEI A BARRINHA DE\\NPROTEÍNA QUE PARECE\\NSOBREMESA",
  seq=["L4","L5","L9","L12","L19","L20"],
  text="Achei a barrinha de proteína que parece sobremesa. Essa é a Bold: até vinte gramas de proteína, recheio cremoso e sem adição de açúcar. Tem cookies and cream, bombom crocante, doce de leite, paçoca. Pra quem treina e não quer abrir mão do doce, é perfeita. Clica no carrinho laranja e garante a sua antes que acabe!"),
 dict(id="b02", fmt="CORTE", score=96, title="Barrinha de proteína no micro-ondas?", hook="VOCÊ JÁ ESQUENTOU\\NBARRINHA DE PROTEÍNA?",
  seq=["L14","L15","L16","L21","L20"],
  text="Você já esquentou barrinha de proteína no micro-ondas? Coloca a Bold por alguns segundos e ela vira um bolinho de chocolate quente, com o recheio derretendo. E continua sendo proteína. Testa e me conta. Clica no carrinho laranja e garante a sua, porque esse desconto é por pouco tempo!"),
 dict(id="b03", fmt="DOPA", score=95, title="Proteína com gosto de sobremesa existe", hook="PROTEÍNA COM GOSTO DE\\NSOBREMESA EXISTE", bg="tunnel",
  seq=["L21","L5","L16","L12","L19"],
  text="Proteína com gosto de sobremesa existe, e se chama Bold. Recheio cremoso, cobertura de chocolate e sem adição de açúcar. Sério, parece bombom. Clica no carrinho laranja agora, porque essa promoção acaba rápido!"),
 dict(id="b04", fmt="CORTE", score=94, title="Não compra barrinha antes de ver isso", hook="NÃO COMPRA BARRINHA DE\\NPROTEÍNA ANTES DE VER ISSO",
  seq=["L1","L2","L9","L19","L21"],
  text="Não compra barrinha de proteína antes de ver isso. A maioria tem gosto de papelão. A Bold não: é macia, tem recheio e cobertura de chocolate, e ainda entrega até vinte gramas de proteína com cinco gramas de fibras. Clica no carrinho laranja e prova você mesmo!"),
 dict(id="b05", fmt="POV", score=93, title="POV: um doce que ajuda no treino", hook="POV: VOCÊ DESCOBRIU UM\\NDOCE QUE AJUDA NO TREINO",
  seq=["L2","L5","L19","L21"],
  text="POV: você descobriu um doce que ajuda no seu treino. Abre a embalagem, morde, e é recheio cremoso com chocolate. Mas é proteína. Pode comer sem culpa depois da academia. Clica no carrinho laranja e garante a sua com desconto!"),
 dict(id="b06", fmt="SLIDE", score=92, title="Os sabores da Bold que viraram febre", hook="OS SABORES DA BOLD\\NQUE VIRARAM FEBRE",
  seq=["img:pilha_sabores","img:cookies_cream","img:bombom","img:doce_leite","img:cookies_black","img:maracuja","img:wafer","img:caixa_mix"],
  labels={"img:cookies_cream":"COOKIES & CREAM","img:bombom":"BOMBOM CROCANTE","img:doce_leite":"DOCE DE LEITE","img:cookies_black":"COOKIES BLACK","img:maracuja":"MOUSSE DE MARACUJÁ","img:wafer":"WAFER"},
  text="Os sabores da Bold que viraram febre. Cookies and cream. Bombom crocante. Doce de leite. Cookies black. Mousse de maracujá. Wafer. Qual você escolhe? Comenta e clica no carrinho laranja, que o desconto é por pouco tempo!"),
 dict(id="b07", fmt="DOPA", score=91, title="Se você treina, precisa saber disso", hook="SE VOCÊ TREINA,\\NPRECISA SABER DISSO", bg="life",
  seq=["img:/home/user/guday/raw/28.png","L4","L19","L9","L20"],
  text="Se você treina, precisa saber disso. O músculo precisa de proteína pra se recuperar depois do treino, e nem sempre dá tempo de fazer uma refeição. Uma barrinha Bold tem até vinte gramas de proteína e cabe no bolso. Clica no carrinho laranja e garante a sua!"),
 dict(id="b08", fmt="CORTE", score=90, title="Todos os sabores em um só vídeo", hook="TODOS OS SABORES DA\\NBOLD EM UM SÓ VÍDEO",
  seq=["L13","L12","L11","L10","L6","L7"],
  text="Todos os sabores da Bold em um só vídeo. Cookies and cream, bombom crocante, doce de leite, paçoca com chocolate, trufa, cookies black, e ainda tem wafer. Qual é o seu favorito? Comenta aí e clica no carrinho laranja pra garantir a caixa mista!"),
 dict(id="b09", fmt="DADOS", score=89, title="3 motivos pra ter uma Bold na bolsa", hook="3 MOTIVOS PRA TER\\NUMA BOLD NA BOLSA",
  seq=["img:rotina","img:bombom","img:cookies_cream","L19","img:caixa_cookies"],
  cards=[("Um:","ATÉ 20 G DE\\NPROTEÍNA"),("Dois:","SEM ADIÇÃO DE AÇÚCAR\\N· SEM GLÚTEN"),("Três:","MATA A VONTADE\\NDE DOCE")],
  text="Três motivos pra ter sempre uma Bold na bolsa. Um: até vinte gramas de proteína em uma barrinha. Dois: sem adição de açúcar e sem glúten. Três: mata a vontade de doce na hora. Clica no carrinho laranja e garante a sua!"),
 dict(id="b10", fmt="POV", score=88, title="POV: vontade de doce na dieta", hook="POV: BATEU VONTADE DE\\NDOCE E VOCÊ TÁ DE DIETA",
  seq=["L17","L19","L20","L16"],
  text="POV: bateu aquela vontade de doce e você tá de dieta. Em vez de um chocolate, você pega uma Bold. Mesma sensação de sobremesa, com proteína e sem adição de açúcar. Problema resolvido. Clica no carrinho laranja antes que acabe!"),
 dict(id="b11", fmt="DOPA", score=87, title="Wafer com proteína? Sim", hook="WAFER COM PROTEÍNA?\\NSIM, EXISTE", bg="mandel",
  seq=["L4","L5","L6","L7","L8"],
  text="Wafer com proteína? Sim, existe. A Bold tem wafer crocante com dez gramas de proteína, em sabores como chocolate ao leite e avelã. É o lanche perfeito pra matar a vontade de doce. Clica no carrinho laranja e garante o seu!"),
 dict(id="b12", fmt="COMPARA", score=86, title="Chocolate comum ou Bold?", hook="CHOCOLATE COMUM OU\\NBARRINHA BOLD?", cmp=("@choco","bombom"),
  seq=["img:bombom","L21","img:cookies_cream","L19","img:caixa_mix"],
  text="Chocolate comum ou barrinha Bold? Olha a diferença. O chocolate comum é cheio de açúcar e quase não tem proteína. A Bold tem até vinte gramas de proteína, sem adição de açúcar, e o mesmo gosto de doce. Clica no carrinho laranja e faz a troca!"),
 dict(id="b13", fmt="SLIDE", score=85, title="Parece chocolate de verdade", hook="ESSA BARRINHA PARECE\\NCHOCOLATE DE VERDADE",
  seq=["img:mix_azul","img:bombom_caixa","img:caixa_pacoca","img:chocomalte_caixa","img:crunch_caixa","img:caixa_cookies","img:rotina","img:pilha_sabores"],
  text="Essa barrinha de proteína parece chocolate de verdade. É a Bold: até vinte gramas de proteína, cinco de fibras, sem adição de açúcar e sem glúten. Proteína real, sabor surreal. Clica no carrinho laranja e garante a sua!"),
 dict(id="b14", fmt="CORTE", score=84, title="O lanche que salva a dieta às 15h", hook="O LANCHE QUE SALVA\\NSUA DIETA ÀS 15H",
  seq=["L17","L18","L19","L20","L3"],
  text="O lanche que salva sua dieta às três da tarde. Bateu a fome, você pega uma Bold: proteína, sabor de doce e sem adição de açúcar. Cabe na bolsa, na mochila e na gaveta do trabalho. Clica no carrinho laranja e deixa sempre uma na bolsa!"),
 dict(id="b15", fmt="SLIDE", score=83, title="Monte sua caixa da semana", hook="MONTE SUA CAIXA DE\\NLANCHES DA SEMANA",
  seq=["img:caixa_mix","img:cookies_cream","img:bombom","img:doce_leite","img:wafer","img:cookies_black","img:pilha_sabores"],
  labels={"img:cookies_cream":"SEGUNDA","img:bombom":"TERÇA","img:doce_leite":"QUARTA","img:wafer":"QUINTA","img:cookies_black":"SEXTA"},
  text="Monte sua caixa de lanches da semana. Segunda, cookies and cream. Terça, bombom crocante. Quarta, doce de leite. Quinta, wafer. Sexta, cookies black. Uma por dia, sem enjoar. Clica no carrinho laranja e garante a caixa mista!"),
 dict(id="b16", fmt="CORTE", score=82, title="Abrindo a caixa mista da Bold", hook="ABRINDO A CAIXA\\NMISTA DA BOLD",
  seq=["L11","L12","L13","L9"],
  text="Abrindo a caixa mista da Bold. Olha isso: várias barrinhas, um sabor de cada, pra você descobrir o seu favorito sem precisar comprar a caixa fechada. É o melhor jeito de começar. Clica no carrinho laranja e garante a sua caixa mista antes que acabe!"),
 dict(id="b17", fmt="DADOS", score=80, title="Tudo que tem numa barrinha Bold", hook="OLHA TUDO QUE TEM\\NNUMA BARRINHA BOLD",
  seq=["img:pilha_sabores","L9","img:doce_leite","L12","img:chocomalte_caixa"],
  cards=[("proteína.","ATÉ 20 G DE PROTEÍNA"),("fibras.","5 G DE FIBRAS"),("Colágeno.","COM COLÁGENO"),("açúcar.","ZERO ADIÇÃO\\NDE AÇÚCAR")],
  text="Olha tudo o que tem numa barrinha Bold. Até vinte gramas de proteína. Cinco gramas de fibras. Colágeno. Zero adição de açúcar. E sem glúten. Tudo isso com gosto de sobremesa. Clica no carrinho laranja e prova!"),
 dict(id="b18", fmt="DOPA", score=79, title="Testei várias e essa ganhou", hook="TESTEI VÁRIAS BARRINHAS\\NE ESSA GANHOU", bg="tunnel",
  seq=["L13","L14","L16","L20"],
  text="Testei várias barrinhas de proteína e essa ganhou disparado. A Bold é macia, tem sabor de verdade e não deixa aquele gosto estranho. Ainda tem até vinte gramas de proteína. Clica no carrinho laranja e garante a sua antes que acabe o estoque!"),
]

def frame_img(path, out, size=(1080,1920), fit_w=1000, fit_h=1300, dark=0.5):
    im = Image.open(path).convert("RGB"); W_, H_ = size
    s = max(W_/im.width, H_/im.height); bg = im.resize((int(im.width*s)+1, int(im.height*s)+1))
    bg = bg.crop(((bg.width-W_)//2, (bg.height-H_)//2, (bg.width-W_)//2+W_, (bg.height-H_)//2+H_))
    bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(40))).enhance(dark)
    k = min(fit_w/im.width, fit_h/im.height); fg = im.resize((int(im.width*k), int(im.height*k)), Image.LANCZOS)
    bg.paste(fg, ((W_-fg.width)//2, (H_-fg.height)//2 + (40 if H_ > 1500 else 0))); bg.save(out, quality=92)

def choco_img(out):
    """Ilustração simples de 'chocolate comum' para a comparação."""
    c = Image.new("RGB", (900, 820), (60, 30, 20)); d = ImageDraw.Draw(c)
    d.rounded_rectangle((180, 200, 720, 640), 30, fill=(92, 52, 30))
    for i in range(3):
        for j in range(4): d.rounded_rectangle((200+j*130, 220+i*140, 310+j*130, 340+i*140), 14, fill=(115, 66, 38))
    d.rounded_rectangle((120, 470, 780, 700), 26, fill=(200, 200, 205))
    f = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Black.otf", 62)
    d.text((450, 585), "CHOCOLATE", font=f, fill=(60, 60, 70), anchor="mm"); c.save(out, quality=92)

def render(v):
    v = dict(v, ls=0.7, sil=0.04)
    wav = tts(v); ws, dur = words(wav); ws = align(v["text"], ws); dur = round(dur+0.4, 2)
    split = v["fmt"] == "DOPA"
    L, cta = build_ass(v, ws, dur, None, split)
    L = [l.replace("GUDAY · CREATINA EM GUMMIES", "BOLD · BARRA DE PROTEÍNA") for l in L]
    seq = list(v["seq"])
    if v["fmt"] == "SLIDE":
        per = 0.9; s2 = []; t = 0; i = 0
        while t < dur - 0.01: s2.append((seq[i % len(seq)], min(per, dur-t))); t += per; i += 1
    elif v["fmt"] == "COMPARA":
        mid = next((a for a,b,w in ws if w.lower().startswith("bold") and a > 3), dur*0.45)
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
        L.append(f"Dialogue: 4,{ts(0)},{ts(s2[0][1])},Card,,0,0,0,,{{\\pos(150,790)}}BOLD")
    ass = f"{W}/{v['id']}.ass"; open(ass, "w").write("\n".join(L)+"\n")
    cmd = ["ffmpeg","-v","error","-y"]; fc = ""; n = 0
    osz = (720,640) if split else (720,1280)
    for k,(x,d) in enumerate(s2):
        fr = max(1,int(d*30)); zin = k % 2 == 0
        z = f"1+0.06*on/{fr}" if zin else f"1.06-0.06*on/{fr}"
        if x == "CMP":
            a = f"{W}/{v['id']}_a.jpg"; b = f"{W}/{v['id']}_b.jpg"; ch = f"{W}/choco.jpg"; choco_img(ch)
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
    why = {"DOPA":"Tela partida com vídeo satisfatório segura a atenção.","POV":"POV gera identificação imediata.","DADOS":"Benefícios claros em cards na tela.","COMPARA":"Comparação direta com o chocolate comum.","SLIDE":"Cortes rápidos de imagem prendem o olhar.","CORTE":"Trechos reais do produto + narração original."}[v["fmt"]]
    return {"id":v["id"],"score":v["score"],"format":FMTNAME[v["fmt"]],"title":v["title"],"dur":dur,"why":why,
            "file":f"bold/{v['id']}.mp4","thumb":f"bold/{v['id']}.jpg",
            "caption":f"{v['title']} 🍫 Bold: até 20 g de proteína e sem adição de açúcar. Clica no carrinho laranja 🛒 #tiktokshop #bold #barradeproteina #treino"}

if __name__ == "__main__":
    only = sys.argv[1:]
    res = [render(v) for v in V if not only or v["id"] in only]
    if not only: json.dump([r for r in res if r], open(f"{OUT}/bold.json","w"), ensure_ascii=False, indent=1)
