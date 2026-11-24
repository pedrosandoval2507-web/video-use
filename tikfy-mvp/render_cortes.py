import json, re, subprocess, os, sys
from concurrent.futures import ThreadPoolExecutor

SRC = "/home/user/dot-src/dot.mp4"
OUT = "/home/user/video-use/tikfy-mvp/clips"
TMP = "/home/user/dot-src/ass"
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
T = json.load(open("/home/user/dot-src/transcript.json"))
WORDS = [(w[0], w[1], w[2].strip()) for s in T for w in s["w"] if w[2].strip()]

# fmt: CORTE | VENDA | DADOS | SPLIT
# (score, fmt, segments, hook, title, why, cards[(src_t, text)], bg)
C = [
 (97,"VENDA",[(97.35,124.49)],"1 BALINHA = 1 LATA\\NDE ENERGÉTICO","1 balinha = 1 lata de energético","Gancho de comparação + todos os benefícios em 27s.",[],None),
 (96,"SPLIT",[(61.87,110.77)],"ESSA BALINHA TÁ\\NVENDENDO MUITO.\\NGARANTA A SUA!","Essa balinha tá vendendo muito","Tela partida segura a atenção; pitch completo do produto.",[],"tunnel"),
 (95,"DADOS",[(97.35,110.77)],"QUANTA CAFEÍNA TEM\\NNESSA BALA?","Quanta cafeína tem nessa bala?","Pergunta no gancho + dados reais na tela.",[(100.9,"80 MG DE CAFEÍNA"),(103.6,"600 MG DE TAURINA"),(105.0,"ZERO AÇÚCAR"),(106.4,"SÓ 6 CALORIAS")],None),
 (94,"CORTE",[(69.17,100.81)],"POV: SÃO 15H E\\NVOCÊ SEM TEMPO\\NPRO CAFÉ","POV: 15h e sem tempo pro café","POV que gera identificação + solução no final.",[],None),
 (93,"SPLIT",[(110.97,124.49)],"POR QUE ELA BATE\\NMAIS RÁPIDO\\NQUE O CAFÉ?","Por que bate mais rápido que café?","Curiosidade + benefício claro em 13s.",[],"life"),
 (92,"VENDA",[(552.88,560.70),(61.87,69.17),(97.35,110.77)],"OS TUBARÕES BRIGARAM\\NPOR ESSA BALA","Os tubarões brigaram por essa bala","Abre com o conflito e depois apresenta o produto.",[],None),
 (91,"CORTE",[(504.50,524.48)],"ELA PROVOU A BALA\\NE OLHA O QUE\\NACONTECEU","Ela provou a bala e olha no que deu","Reação real gera curiosidade e comentários.",[],None),
 (90,"DADOS",[(92.97,110.77)],"ZERO AÇÚCAR E\\NSÓ 6 CALORIAS","Zero açúcar e só 6 calorias","Benefício de saúde direto + cards de dados.",[(97.4,"1 BALA = 1 LATINHA"),(100.9,"80 MG DE CAFEÍNA"),(105.0,"ZERO AÇÚCAR"),(106.4,"6 KCAL"),(108.6,"SABOR MENTA")],None),
 (89,"VENDA",[(225.38,241.86),(173.61,181.13)],"QUANTO CUSTA 1 DOSE\\NDE ENERGIA?","Quanto custa 1 dose de energia?","Preço no gancho; quebra objeção de custo.",[],None),
 (88,"SPLIT",[(442.90,469.42)],"O TUBARÃO FEZ\\NPROPOSTA NA HORA","O tubarão fez proposta na hora","História emocional + proposta ao vivo.",[],"mandel"),
 (87,"CORTE",[(46.26,69.17)],"3 JOVENS CRIARAM A\\N1ª BALA ENERGÉTICA\\NDO BRASIL","3 jovens criaram a 1ª bala energética","História de origem que gera conexão.",[],None),
 (86,"VENDA",[(680.64,714.36)],"FECHARAM NEGÓCIO\\NNO SHARK TANK","Fecharam negócio no Shark Tank","Final feliz = prova social do produto.",[],None),
 (85,"DADOS",[(79.21,92.73),(113.73,124.49)],"CAFÉ OU DOT?","Café ou Dot?","Comparação direta com o café.",[(117.1,"ABSORVE PELA BOCA"),(120.0,"EFEITO MAIS RÁPIDO"),(122.3,"NÃO AMARELA OS DENTES")],None),
 (84,"SPLIT",[(280.78,318.20)],"O TUBARÃO DISSE QUE\\NPARECE REMÉDIO","O tubarão disse que parece remédio","Polêmica no gancho = muitos comentários.",[],"tunnel"),
 (83,"CORTE",[(192.28,224.72)],"VOCÊ TOMA CAFÉ\\NSÓ PELA ENERGIA?","Você toma café só pela energia?","Pergunta direta que filtra o público certo.",[],None),
 (82,"VENDA",[(170.37,184.71)],"1 CAIXINHA =\\N5 ENERGÉTICOS","1 caixinha = 5 energéticos","Oferta clara e fácil de entender.",[],None),
 (81,"SPLIT",[(552.88,590.46)],"OS TUBARÕES BRIGARAM\\NAO VIVO","Os tubarões brigaram ao vivo","Caos e disputa prendem até o final.",[],"life"),
 (80,"CORTE",[(333.44,346.04)],"ESSE PRODUTO\\NÉ VIRAL","Esse produto é viral","Prova social rápida em 12s.",[],None),
 (79,"DADOS",[(252.62,280.32)],"QUANTO CUSTA FAZER\\N1 BALA DESSAS?","Quanto custa fazer 1 bala?","Bastidor de negócio desperta curiosidade.",[(253.5,"CUSTO: R$ 1 A R$ 1,30"),(264.0,"LOJA: R$ 3 O SACHÊ"),(272.0,"ONLINE: R$ 4,24 A R$ 5")],None),
 (78,"VENDA",[(149.21,165.85)],"OS TUBARÕES FICARAM\\NIMPRESSIONADOS","Os tubarões ficaram impressionados","Reação positiva dos jurados = confiança.",[],None),
 (77,"SPLIT",[(640.60,677.28)],"300 MIL POR 20%:\\NVOCÊ ACEITARIA?","300 mil por 20%: você aceitaria?","Pergunta no gancho puxa comentários.",[],"mandel"),
 (76,"CORTE",[(491.88,502.58)],"ELE SAIU DO NEGÓCIO\\NPOR ISSO","Ele saiu do negócio por isso","Curto e com tensão; bom pra repost.",[],None),
 (75,"CORTE",[(186.94,207.52)],"A IDEIA NASCEU\\NNA FACULDADE","A ideia nasceu na faculdade","História de origem, gera identificação.",[],None),
 (74,"SPLIT",[(124.49,147.83)],"ELES PEDIRAM 300 MIL\\NNO SHARK TANK","Eles pediram 300 mil no Shark Tank","Números grandes chamam atenção.",[],"tunnel"),
 (73,"VENDA",[(486.30,502.58)],"\"SE QUISER FECHAR\\NAGORA, JÁ ASSINA\"","\"Se quiser fechar agora, já assina\"","Frase forte do tubarão no gancho.",[],None),
 (72,"DADOS",[(208.90,224.72)],"INSPIRADA NOS EUA,\\NFEITA PRO BRASIL","Inspirada nos EUA, feita pro Brasil","Diferencial de sabor explicado.",[(211.0,"NOS EUA: TIPO REMÉDIO"),(219.7,"AQUI: SABOR BRASILEIRO")],None),
 (71,"CORTE",[(155.15,165.85)],"GERAÇÃO Z NO\\NSHARK TANK","Geração Z no Shark Tank","Curto, bom pra testar público jovem.",[],None),
 (71,"SPLIT",[(392.06,416.94)],"ELES INVESTIRAM\\N200 MIL EM 2 ANOS","Investiram 200 mil em 2 anos","Bastidor com números, menos apelo de venda.",[],"life"),
 (70,"VENDA",[(685.18,704.74)],"O BRILHO NO OLHO\\NVENCEU","O brilho no olho venceu","Emocional, mas pouco sobre o produto.",[],None),
 (70,"CORTE",[(333.44,359.50)],"COMO ELES VÃO\\NVENDER NO\\NBRASIL TODO","Como vão vender no Brasil todo","Mais institucional; bom pra variar o feed.",[],None),
]

def col(hexrgb): r,g,b=hexrgb[0:2],hexrgb[2:4],hexrgb[4:6]; return f"&H00{b}{g}{r}".upper()
RED,CYAN,YEL,WHITE,BLACK=col("FE2C55"),col("25F4EE"),col("FFD54A"),"&H00FFFFFF","&H00000000"
HOOKSTY={"CORTE":(BLACK,WHITE),"VENDA":(WHITE,RED),"DADOS":(BLACK,CYAN),"SPLIT":(BLACK,YEL)}
FMTNAME={"CORTE":"Corte","VENDA":"Chamada de venda","DADOS":"Dados do produto","SPLIT":"Tela partida"}

def fix(t):
    t=t.upper()
    t=re.sub(r"\bDOTT?(IE|E)?\b|\bDOTE\b","DOT",t)
    t=t.replace("CAÍTO","CAITO").replace("CAÍTA","CAITO").replace("TILLY BENZ","CHILLI BEANS").replace("MUNIQUE","MONIQUE")
    t=t.replace("TU BARÕES","TUBARÕES")
    return t

def ts(x):
    x=max(0,x); h=int(x//3600); m=int(x%3600//60); s=x%60
    return f"{h}:{m:02d}:{s:05.2f}"

def build_ass(spec, path, dur):
    score,fmt,segs,hook,title,why,cards,bg=spec
    fg,box=HOOKSTY[fmt]
    split=fmt=="SPLIT"
    capy=640 if split else 965
    hooky=70 if split else 150
    L=["[Script Info]","ScriptType: v4.00+","PlayResX: 720","PlayResY: 1280","WrapStyle: 2","",
       "[V4+ Styles]","Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       f"Style: Hook,Inter Black,44,{fg},{fg},{box},{box},0,0,0,0,100,100,0,0,3,14,0,8,40,40,{hooky},1",
       f"Style: Cap,Inter Black,56,{WHITE},{WHITE},{BLACK},&H80000000,0,0,0,0,100,100,0,0,1,6,2,5,30,30,0,1",
       f"Style: Card,Inter Black,44,{BLACK},{BLACK},{CYAN},{CYAN},0,0,0,0,100,100,0,0,3,16,0,5,40,40,0,1",
       f"Style: Tag,Inter Black,26,{WHITE},{WHITE},&H00303030,&H00303030,0,0,0,0,100,100,0,0,3,10,0,2,40,40,150,1",
       f"Style: Cta,Inter Black,36,{WHITE},{WHITE},{RED},{RED},0,0,0,0,100,100,0,0,3,14,0,2,40,40,120,1",
       "","[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    # hook: pop-in
    L.append(f"Dialogue: 2,{ts(0)},{ts(dur)},Hook,,0,0,0,,{{\\fad(120,0)\\t(0,180,\\fscx106\\fscy106)\\t(180,320,\\fscx100\\fscy100)}}{hook}")
    if not split:
        L.append(f"Dialogue: 2,{ts(0)},{ts(max(0,dur-3.2))},Tag,,0,0,0,,DOT · BALA ENERGÉTICA · 80 MG DE CAFEÍNA")
    # CTA last 3.2s
    L.append(f"Dialogue: 3,{ts(max(0,dur-3.2))},{ts(dur)},Cta,,0,0,0,,{{\\fad(150,0)}}GARANTA A SUA NO CARRINHO LARANJA")
    # captions
    off=0; mapped=[]
    for s,e in segs:
        for ws,we,w in WORDS:
            if ws>=s-0.05 and ws<e-0.05:
                mapped.append([ws-s+off, min(we,e)-s+off, w])
        off+=e-s
    groups=[]; cur=[]
    for i,(a,b,w) in enumerate(mapped):
        if cur and (len(cur)>=3 or a-cur[-1][1]>0.45 or re.search(r"[.,!?]$",cur[-1][2])):
            groups.append(cur); cur=[]
        cur.append([a,b,w])
    if cur: groups.append(cur)
    for gi,g in enumerate(groups):
        nxt=groups[gi+1][0][0] if gi+1<len(groups) else dur
        for j,(a,b,w) in enumerate(g):
            end=g[j+1][0] if j+1<len(g) else min(b+0.35,dur,nxt)
            if end<=a: end=a+0.08
            parts=[]
            for k,(_,_,ww) in enumerate(g):
                t=fix(re.sub(r"[.,!?;:]","",ww))
                parts.append(f"{{\\c{YEL}}}{t}{{\\c{WHITE}}}" if k==j else t)
            pop="\\fscx112\\fscy112\\t(0,90,\\fscx100\\fscy100)" if j==0 else ""
            L.append(f"Dialogue: 1,{ts(a)},{ts(end)},Cap,,0,0,0,,{{\\pos(360,{capy}){pop}}}"+" ".join(parts))
    # data cards
    for st,txt in cards:
        off=0; tt=None
        for s,e in segs:
            if s<=st<e: tt=st-s+off
            off+=e-s
        if tt is None: continue
        L.append(f"Dialogue: 4,{ts(tt)},{ts(min(tt+2.6,dur-3.3 if tt+2.6>dur-3.3 and dur-3.3>tt+0.8 else tt+2.6))},Card,,0,0,0,,{{\\pos(360,345)\\fad(80,120)\\fscx70\\fscy70\\t(0,140,\\fscx104\\fscy104)\\t(140,240,\\fscx100\\fscy100)}}{txt}")
    open(path,"w").write("\n".join(L)+"\n")

def render(idx, spec):
    n=idx+1
    score,fmt,segs,hook,title,why,cards,bg=spec
    dur=sum(e-s for s,e in segs)
    ass=f"{TMP}/{n:02d}.ass"; build_ass(spec,ass,dur)
    out=f"{OUT}/{n:02d}.mp4"
    cmd=["ffmpeg","-v","error","-y"]
    for s,e in segs: cmd+=["-ss",f"{s}","-t",f"{e-s}","-i",SRC]
    k=len(segs)
    fc="".join(f"[{i}:v]fps=30,setpts=PTS-STARTPTS[v{i}];[{i}:a]asetpts=PTS-STARTPTS[a{i}];" for i in range(k))
    fc+="".join(f"[v{i}][a{i}]" for i in range(k))+f"concat=n={k}:v=1:a=1[v][a];"
    if fmt=="SPLIT":
        cmd+=["-stream_loop","-1","-i",f"/home/user/dot-src/bg/{bg}.mp4"]
        fc+=f"[v]scale=1138:640,crop=720:640[top];[{k}:v]trim=duration={dur:.3f},setpts=PTS-STARTPTS,fps=30[bot];[top][bot]vstack,setsar=1,ass={ass}[vo]"
    else:
        dark="-0.32" if fmt=="VENDA" else "-0.18"
        fc+=f"[v]split[a1][b1];[a1]scale=180:320:force_original_aspect_ratio=increase,crop=180:320,boxblur=8:2,scale=720:1280,eq=brightness={dark}:saturation=1.2[bgv];[b1]crop=1080:1080,scale=720:720[fg];[bgv][fg]overlay=0:280,setsar=1,ass={ass}[vo]"
    cmd+=["-filter_complex",fc,"-map","[vo]","-map","[a]","-t",f"{dur:.3f}","-c:v","libx264","-preset","veryfast","-crf","27","-pix_fmt","yuv420p","-c:a","aac","-b:a","112k","-movflags","+faststart",out]
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode: print("ERR",n,r.stderr[-800:],flush=True); return None
    subprocess.run(["ffmpeg","-v","error","-y","-ss","1.2","-i",out,"-frames:v","1","-vf","scale=360:640","-q:v","5",f"{OUT}/{n:02d}.jpg"])
    print("ok",n,f"{dur:.1f}s",flush=True)
    cap_hook=title.rstrip("?!.")
    return {"n":n,"score":score,"format":FMTNAME[fmt],"title":title,"why":why,"dur":round(dur,1),
            "file":f"clips/{n:02d}.mp4","thumb":f"clips/{n:02d}.jpg",
            "caption":f"{title} 👀 A primeira bala energética do Brasil: 80 mg de cafeína, zero açúcar. Garanta a sua no carrinho laranja 🛒 #tiktokshop #dot #balaenergetica #energia #sharktankbrasil"}

if __name__=="__main__":
    only=[int(x) for x in sys.argv[1:]]
    jobs=[(i,s) for i,s in enumerate(C) if not only or i+1 in only]
    with ThreadPoolExecutor(2) as ex: res=list(ex.map(lambda a:render(*a),jobs))
    if not only:
        json.dump([r for r in res if r],open(f"{OUT}/clips.json","w"),ensure_ascii=False,indent=1)
        print("DONE",len([r for r in res if r]))
