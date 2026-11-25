"""Cortes de podcast da +Mu: podcast em cima, produto embaixo, legenda palavra a palavra, gancho e CTA narrado no fim."""
import json, re, os, sys, subprocess
sys.path.insert(0, "/home/user/unbox")
from make import tts, words, align, ts, col
W = "/home/user/mu/work"; os.makedirs(W, exist_ok=True)
OUT = "/home/user/video-use/tikfy-mvp/maismu"; os.makedirs(OUT, exist_ok=True)
IMG = "/home/user/brands/img/mu"
T = json.load(open("/home/user/mu/m4.json"))
WORDS = [(w[0], w[1], w[2].strip()) for s in T for w in s["w"] if w[2].strip()]
RED, YEL, WHITE, BLACK, CYAN, PUR = col("FE2C55"), col("FFD54A"), "&H00FFFFFF", "&H00000000", col("2DD4FF"), col("7C5CFF")
FIX = [(r"CHOCOEIFRES|CHOCOEIFERS?","CHOCOWHEYFER"),(r"BARRIGA DE PROTEÍNA","BARRINHA DE PROTEÍNA"),(r"HIPROTEIO|E-PROTEIA|EPROTEIA","WHEY PROTEIN"),(r"BÓLIC","BODY"),(r"DEGARAIS","DEGRAUS"),(r"IMEDADOS","DISPONIBILIZADOS"),(r"\bATO\b","OTTO"),(r"\bESQUETINHOS?\b","SKATE"),(r"SAÍMO\b","SAÍMOS"),(r"\bEI\b|\bWAY\b|\bE\b(?= NA GARRAFINHA)|\bUM E\b", "WHEY"), (r"MAISMU|MAIS MU|MAIS MOVER", "+MU"), (r"CHOCOIFRAS|CHOCOAFER|CHOCOWHEYFERS?", "CHOCOWHEYFER"),
       (r"\bESQUENTA\b", "EXQUENTA"), (r"\bOTTO\b|\bATO\b|\bOUTRO\b(?= TAMBÉM)", "OTTO"), (r"\bMUKA\b", "MUKA")]
CTA = "Gostou? A mais mu tá no carrinho laranja. Clica e garante a sua antes que acabe!"
C = [
 dict(id="mu01", s=110.48, e=130.18, score=96, title="O pré-treino que não acelera o coração", hook="O PRÉ-TREINO QUE\\NNÃO ACELERA O CORAÇÃO", imgs=["cesta_exquenta","cesta_top"]),
 dict(id="mu02", s=74.26, e=91.70, score=95, title="Chocolate gostoso e saudável", hook="CHOCOLATE GOSTOSO E\\NSAUDÁVEL EXISTE?", imgs=["chocolate","barras","display_wheyfer"]),
 dict(id="mu03", s=238.52, e=276.90, score=94, title="\"Filho, whey é bomba\"", hook="\"FILHO, ESSE WHEY\\NÉ BOMBA!\"", imgs=["protein_pacote","cesta_whey"]),
 dict(id="mu04", s=932.60, e=985.74, score=93, title="Por que a vaca da +Mu usa óculos", hook="POR QUE A VACA DA\\N+MU USA ÓCULOS?", imgs=["protein_pacote","cesta_whey","caixa_pacoca"]),
 dict(id="mu05", s=447.86, e=478.66, score=92, title="A proteína que não te assusta", hook="O POTE DE PROTEÍNA\\NQUE NÃO TE ASSUSTA", imgs=["protein_pacote","cesta_whey","cesta_cappuccino"]),
 dict(id="mu06", s=315.00, e=336.76, score=91, title="\"Vou tomar whey e ficar gigante?\"", hook="\"SE EU TOMAR WHEY\\NVOU FICAR GIGANTE?\"", imgs=["protein_pacote","cesta_mix"]),
 dict(id="mu07", s=861.36, e=889.48, score=90, title="Ninguém gostava do chocolate deles", hook="NINGUÉM GOSTAVA DO\\NCHOCOLATE DELES...", imgs=["chocolate","barras"]),
 dict(id="mu08", s=361.46, e=385.42, score=88, title="Proteína às 2 da manhã no posto", hook="PROTEÍNA ÀS 2 DA\\NMANHÃ NO POSTO?", imgs=["prateleira","gondola2"]),
 dict(id="mu09", s=775.40, e=818.58, score=86, title="Como nasceu o nome +Mu", hook="COMO NASCEU O\\NNOME +MU", imgs=["gondola_wheyfer","prateleira"]),
 dict(id="mu10", s=708.22, e=735.30, score=84, title="A ideia que veio de uma viagem", hook="A IDEIA QUE VEIO\\NDE UMA VIAGEM", imgs=["cesta_cappuccino","cesta_max"]),
 dict(id="mu11", s=434.24, e=445.58, score=82, title="Vida saudável não precisa ser chata", hook="VIDA SAUDÁVEL NÃO\\NPRECISA SER CHATA", imgs=["cesta_mix","barras"]),
]
def fix(t):
    t = t.upper()
    for a, b in FIX: t = re.sub(a, b, t)
    return t
def build(c, cw, D1, dur, path):
    L = ["[Script Info]","ScriptType: v4.00+","PlayResX: 720","PlayResY: 1280","WrapStyle: 2","",
         "[V4+ Styles]","Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
         f"Style: Hook,Inter Black,42,{WHITE},{WHITE},{PUR},{PUR},0,0,0,0,100,100,0,0,3,14,0,8,40,40,110,1",
         f"Style: Cap,Inter Black,52,{WHITE},{WHITE},{BLACK},&H80000000,0,0,0,0,100,100,0,0,1,6,2,5,30,30,0,1",
         f"Style: Pod,Inter Black,24,{BLACK},{BLACK},{CYAN},{CYAN},0,0,0,0,100,100,0,0,3,8,0,7,0,0,0,1",
         f"Style: Cta,Inter Black,40,{WHITE},{WHITE},{RED},{RED},0,0,0,0,100,100,0,0,3,16,0,5,40,40,0,1",
         f"Style: Arrow,Inter Black,40,{RED},{RED},{WHITE},&H00000000,0,0,0,0,100,100,0,0,1,4,0,7,0,0,0,1",
         "","[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    L.append(f"Dialogue: 2,{ts(0)},{ts(D1)},Hook,,0,0,0,,{{\\fad(100,0)\\t(0,160,\\fscx107\\fscy107)\\t(160,300,\\fscx100\\fscy100)}}{c['hook']}")
    L.append(f"Dialogue: 2,{ts(0)},{ts(D1)},Pod,,0,0,0,,{{\\pos(28,282)}}🎙 PODCAST COM OS FUNDADORES")
    L.append(f"Dialogue: 3,{ts(D1)},{ts(dur)},Cta,,0,0,0,,{{\\pos(360,180)\\fad(120,0)}}ESTOQUE ACABANDO!\\NCLIQUE NO CARRINHO")
    t = D1
    while t < dur:
        e = min(t+.6, dur); L.append(f"Dialogue: 3,{ts(t)},{ts(e)},Arrow,,0,0,0,,{{\\move(70,1150,70,1190)\\p1}}m 0 0 l 60 0 l 30 45{{\\p0}}"); t = e
    groups=[]; cur=[]
    for a,b,w in cw:
        if cur and (len(cur)>=3 or a-cur[-1][1]>0.45 or re.search(r"[.,!?:]$",cur[-1][2])): groups.append(cur); cur=[]
        cur.append((a,b,w))
    if cur: groups.append(cur)
    for gi,g in enumerate(groups):
        nxt = groups[gi+1][0][0] if gi+1<len(groups) else dur
        for j,(a,b,w) in enumerate(g):
            end = g[j+1][0] if j+1<len(g) else min(b+0.3, nxt, dur)
            if end<=a: end=a+0.08
            parts=[]
            for k,(_,_,ww) in enumerate(g):
                tt = fix(re.sub(r"[.,!?;:–\-]","",ww))
                parts.append(f"{{\\c{YEL}}}{tt}{{\\c{WHITE}}}" if k==j else tt)
            L.append(f"Dialogue: 1,{ts(a)},{ts(end)},Cap,,0,0,0,,{{\\pos(360,1100)}}"+" ".join(parts))
    open(path,"w").write("\n".join(L)+"\n")
def render(c):
    s, e = c["s"], c["e"]; D1 = round(e-s, 3)
    pw = [(a-s, b-s, w) for a,b,w in WORDS if a >= s-0.05 and a < e-0.05]
    v = {"id": c["id"]+"_cta", "text": CTA, "ls": 0.72, "sil": 0.04}
    wav = tts(v); ws, cd = words(wav); ws = align(CTA, ws)
    dur = round(D1 + cd + 0.4, 2)
    cw = pw + [(a+D1, b+D1, w) for a,b,w in ws]
    ass = f"{W}/{c['id']}.ass"; build(c, cw, D1, dur, ass)
    imgs = c["imgs"]; per = 3.0; seq=[]; t=0; i=0
    while t < dur: seq.append((imgs[i%len(imgs)], min(per, dur-t))); t+=per; i+=1
    cmd = ["ffmpeg","-v","error","-y","-ss",str(s),"-t",str(D1),"-i","/home/user/mu/src/m4.mp4","-i",wav,"-loop","1","-i",f"{IMG}/{imgs[0]}.png"]
    for im,d in seq: cmd += ["-loop","1","-t",f"{d:.3f}","-i",f"{IMG}/{im}.png"]
    n=len(seq); fc = "[2:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,boxblur=30:3,eq=brightness=-0.35,trim=duration=%s,fps=30,setsar=1[bg];" % dur
    for k in range(n):
        fc += f"[{3+k}:v]scale=620:400:force_original_aspect_ratio=decrease,pad=640:420:(ow-iw)/2:(oh-ih)/2:white,fps=30,setsar=1[p{k}];"
    fc += "".join(f"[p{k}]" for k in range(n)) + f"concat=n={n}:v=1:a=0[pr];"
    fc += "[0:v]scale=720:405:flags=lanczos,unsharp=5:5:0.8,setpts=PTS-STARTPTS,fps=30[pod];"
    fc += f"[bg][pod]overlay=0:300:enable='lt(t,{D1})':eof_action=pass[b1];[b1][pr]overlay=40:'if(lt(t,{D1}),725,330)'[b2];"
    fc += f"[b2]ass={ass}[vo];[0:a]asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=mono[a0];[1:a]aresample=44100,aformat=channel_layouts=mono[a1];[a0][a1]concat=n=2:v=0:a=1,apad=pad_dur=0.4,loudnorm=I=-14:TP=-1.5[ao]"
    out = f"{OUT}/{c['id']}.mp4"
    cmd += ["-filter_complex",fc,"-map","[vo]","-map","[ao]","-t",str(dur),"-c:v","libx264","-preset","medium","-crf","24","-pix_fmt","yuv420p","-c:a","aac","-b:a","128k","-movflags","+faststart",out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print("ERR", c["id"], r.stderr[-1500:], flush=True); return None
    subprocess.run(["ffmpeg","-v","error","-y","-ss","2.0","-i",out,"-frames:v","1","-vf","scale=360:640","-q:v","4",f"{OUT}/{c['id']}.jpg"])
    print("ok", c["id"], dur, flush=True)
    return {"id":c["id"],"score":c["score"],"format":"Corte de podcast","title":c["title"],"dur":dur,"why":"Corte do podcast com os fundadores: prova social e história que geram confiança.",
            "file":f"maismu/{c['id']}.mp4","thumb":f"maismu/{c['id']}.jpg",
            "caption":f"{c['title']} 🐮 +Mu: proteína gostosa de verdade. Clica no carrinho laranja 🛒 #tiktokshop #maismu #proteina #podcast"}
if __name__ == "__main__":
    only = sys.argv[1:]
    res = [render(c) for c in C if not only or c["id"] in only]
    if not only: json.dump([r for r in res if r], open(f"{OUT}/maismu.json","w"), ensure_ascii=False, indent=1)
