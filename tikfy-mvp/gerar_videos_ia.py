import json, re, subprocess, os, wave, sys
import numpy as np
sys.path.insert(0, "/home/user/dot-src")
SRC = "/home/user/dot-src/dot.mp4"
W = "/home/user/unbox"
OUT = "/home/user/video-use/tikfy-mvp/ia"
os.makedirs(OUT, exist_ok=True)

# shots: (start, dur, crop_x, zoom_dir)
SH = {
 "reveal": (96.0, 1.6, 640, 1),
 "boxes1": (97.0, 1.8, 680, 1),
 "boxes2": (98.9, 1.1, 560, -1),
 "display": (100.1, 0.8, 820, 1),
 "can": (101.2, 2.6, 660, 1),
 "can2": (103.8, 2.2, 660, -1),
 "table": (170.0, 2.4, 700, 1),
 "ingr1": (70.2, 2.4, 660, 1),
 "ingr2": (72.8, 2.6, 740, -1),
}
V = [
 {"id": "ia1",
  "hook": "PARA DE TOMAR CAFÉ\\NPRA AGUENTAR O DIA",
  "text": "Se você ainda toma café pra aguentar o dia, para tudo. Essa é a Dot, a primeira bala energética do Brasil. Um sachê tem a mesma energia de uma latinha de energético: oitenta miligramas de cafeína, taurina, vitaminas B6 e B12, e zero açúcar. E como ela é absorvida pela boca, o efeito vem muito mais rápido. Clica no carrinho laranja e garante a sua, porque esse desconto é por pouco tempo!",
  "shots": ["reveal","boxes1","boxes2","display","can","ingr1","ingr2","can2","table","boxes1"],
  "title": "Para de tomar café pra aguentar o dia", "score": 96},
 {"id": "ia2",
  "hook": "OS TUBARÕES BRIGARAM\\NPOR ESSA BALA",
  "text": "Essa bala apareceu no Shark Tank e os tubarões brigaram por ela. É a Dot. Cabe no bolso, tem sabor de menta e cada sachê equivale a uma latinha de energético. Zero açúcar e só seis calorias. Sem gosto ruim e sem amarelar os dentes. Clica no carrinho laranja agora, porque essa promoção acaba rápido!",
  "shots": ["display","table","boxes2","can","can2","boxes1","ingr2","table","reveal"],
  "title": "Os tubarões brigaram por essa bala", "score": 94},
 {"id": "ia3",
  "hook": "POV: 15H, MORRENDO DE\\NSONO E AINDA TEM PROVA",
  "text": "POV: são três da tarde, você tá morrendo de sono e ainda tem prova. Aí você abre a Dot, coloca uma bala na boca, e pronto. Oitenta miligramas de cafeína, a mesma energia de um energético, só que numa bala de menta, com zero açúcar. A caixinha vem com cinco doses e cabe em qualquer bolso. Clica no carrinho laranja antes que o desconto acabe!",
  "shots": ["table","reveal","boxes1","can","ingr1","boxes2","can2","display","table","boxes1"],
  "title": "POV: 15h, morrendo de sono e tem prova", "score": 93},
]

def col(h): return f"&H00{h[4:6]}{h[2:4]}{h[0:2]}".upper()
RED, YEL, WHITE, BLACK = col("FE2C55"), col("FFD54A"), "&H00FFFFFF", "&H00000000"
def ts(x): x=max(0,x); return f"{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}"

def tts(v):
    wav = f"{W}/{v['id']}.wav"
    subprocess.run(["python3","-m","piper","-m","/home/user/piper/pt_BR-faber-medium.onnx","--length-scale",str(v.get("ls",0.86)),"--sentence-silence",str(v.get("sil",0.12)),"-f",wav],input=v["text"],text=True,check=True,capture_output=True)
    return wav

def words(wav):
    from faster_whisper import WhisperModel
    global _M
    if "_M" not in globals(): _M = WhisperModel("/home/user/whisper-small", device="cpu", compute_type="int8")
    wf = wave.open(wav); sr = wf.getframerate()
    a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32)/32768
    if sr != 16000:
        a = np.interp(np.arange(0, len(a), sr/16000), np.arange(len(a)), a).astype(np.float32)
    segs,_ = _M.transcribe(a, language="pt", word_timestamps=True)
    return [(w.start, w.end, w.word.strip()) for s in segs for w in s.words if w.word.strip()], len(a)/16000

import difflib, unicodedata
def _n(t):
    t=unicodedata.normalize("NFD",t.lower()); t="".join(c for c in t if unicodedata.category(c)!="Mn")
    return re.sub(r"[^a-z0-9]","",t)
def align(script, ws):
    st=script.split()
    a=[_n(x) for x in st]; b=[_n(w) for _,_,w in ws]
    tm=[None]*len(st)
    for blk in difflib.SequenceMatcher(None,a,b,autojunk=False).get_matching_blocks():
        for k in range(blk.size): tm[blk.a+k]=(ws[blk.b+k][0],ws[blk.b+k][1])
    # interpolate gaps
    i=0
    while i<len(st):
        if tm[i] is None:
            j=i
            while j<len(st) and tm[j] is None: j+=1
            t0=tm[i-1][1] if i>0 else 0.0
            t1=tm[j][0] if j<len(st) else (ws[-1][1] if ws else t0+0.4*(j-i))
            step=(t1-t0)/(j-i)
            for k in range(i,j): tm[k]=(t0+step*(k-i), t0+step*(k-i+1))
            i=j
        else: i+=1
    return [(tm[k][0],tm[k][1],st[k]) for k in range(len(st))]
def fix(t):
    t = t.upper()
    t = re.sub(r"\bDOTT?(E)?\b", "DOT", t).replace("D6","B6").replace("D12","B12").replace("BE6","B6").replace("BE12","B12")
    return t

def ass(v, ws, dur, path):
    L = ["[Script Info]","ScriptType: v4.00+","PlayResX: 720","PlayResY: 1280","WrapStyle: 2","",
         "[V4+ Styles]","Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
         f"Style: Hook,Inter Black,44,{BLACK},{BLACK},{WHITE},{WHITE},0,0,0,0,100,100,0,0,3,14,0,8,40,40,150,1",
         f"Style: Cap,Inter Black,58,{WHITE},{WHITE},{BLACK},&H80000000,0,0,0,0,100,100,0,0,1,6,2,5,30,30,0,1",
         f"Style: Cta,Inter Black,40,{WHITE},{WHITE},{RED},{RED},0,0,0,0,100,100,0,0,3,16,0,5,40,40,0,1",
         f"Style: Arrow,Inter Black,40,{RED},{RED},{WHITE},&H00000000,0,0,0,0,100,100,0,0,1,4,0,7,0,0,0,1",
         f"Style: Tag,Inter Black,24,{WHITE},{WHITE},&H00303030,&H00303030,0,0,0,0,100,100,0,0,3,9,0,7,0,0,0,1",
         "","[Events]","Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    # find CTA start: word 'CLICA'
    cta = next((a for a,b,w in ws if w.lower().startswith("clica")), dur-4)
    L.append(f"Dialogue: 2,{ts(0)},{ts(cta)},Hook,,0,0,0,,{{\\fad(100,0)\\t(0,160,\\fscx107\\fscy107)\\t(160,300,\\fscx100\\fscy100)}}{v['hook']}")
    L.append(f"Dialogue: 2,{ts(0)},{ts(dur)},Tag,,0,0,0,,{{\\pos(40,1090)}}DOT · BALA ENERGÉTICA")
    # CTA block + bouncing arrow
    L.append(f"Dialogue: 3,{ts(cta)},{ts(dur)},Cta,,0,0,0,,{{\\pos(360,250)\\fad(120,0)\\t(0,200,\\fscx108\\fscy108)\\t(200,350,\\fscx100\\fscy100)}}ESTOQUE ACABANDO!\\NCLIQUE NO CARRINHO")
    t = cta
    while t < dur:
        e = min(t+0.6, dur)
        L.append(f"Dialogue: 3,{ts(t)},{ts(e)},Arrow,,0,0,0,,{{\\move(70,1110,70,1150)\\p1}}m 0 0 l 60 0 l 30 45{{\\p0}}")
        t = e
    groups=[]; cur=[]
    for a,b,w in ws:
        if cur and (len(cur)>=3 or a-cur[-1][1]>0.35 or re.search(r"[.,!?:]$",cur[-1][2])):
            groups.append(cur); cur=[]
        cur.append((a,b,w))
    if cur: groups.append(cur)
    for gi,g in enumerate(groups):
        nxt = groups[gi+1][0][0] if gi+1<len(groups) else dur
        for j,(a,b,w) in enumerate(g):
            end = g[j+1][0] if j+1<len(g) else min(b+0.3, nxt, dur)
            if end<=a: end=a+0.08
            parts=[]
            for k,(_,_,ww) in enumerate(g):
                tt = fix(re.sub(r"[.,!?;:]","",ww))
                parts.append(f"{{\\c{YEL}}}{tt}{{\\c{WHITE}}}" if k==j else tt)
            pop = "\\fscx112\\fscy112\\t(0,90,\\fscx100\\fscy100)" if j==0 else ""
            L.append(f"Dialogue: 1,{ts(a)},{ts(end)},Cap,,0,0,0,,{{\\pos(360,900){pop}}}"+" ".join(parts))
    open(path,"w").write("\n".join(L)+"\n")
    return cta

def render(v):
    wav = tts(v)
    ws, dur = words(wav)
    ws = align(v["text"], ws)
    dur = round(dur + 0.4, 2)
    a = f"{W}/{v['id']}.ass"; cta = ass(v, ws, dur, a)
    # distribute shots across duration, cutting faster at start
    n = len(v["shots"]); base = [SH[s][1] for s in v["shots"]]
    scale = dur / sum(base)
    cmd = ["ffmpeg","-v","error","-y"]; fc = ""; k = 0; tot = 0
    for i,s in enumerate(v["shots"]):
        st, d0, cx, zd = SH[s]
        d = round(d0*scale, 3) if i < n-1 else round(dur - tot, 3)
        tot += d
        srcd = min(d0, d)
        speed = srcd / d  # slow down source if needed
        cmd += ["-ss", f"{st}", "-t", f"{srcd+0.1}", "-i", SRC]
        z = f"1+0.08*on/{int(d*30)}" if zd>0 else f"1.08-0.08*on/{int(d*30)}"
        fc += (f"[{i}:v]setpts=PTS/{speed:.4f}-STARTPTS,fps=30,trim=duration={d},setpts=PTS-STARTPTS,"
               f"crop=608:1080:{cx}:0,scale=1080:1920,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=720x1280:fps=30,"
               f"eq=saturation=1.15:contrast=1.05,setsar=1[s{i}];")
        k += 1
    cmd += ["-i", wav]
    fc += "".join(f"[s{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[cv];[cv]ass={a}[vo];[{n}:a]apad=pad_dur=0.4,loudnorm=I=-14:TP=-1.5,aresample=44100[ao]"
    out = f"{OUT}/{v['id']}.mp4"
    cmd += ["-filter_complex", fc, "-map", "[vo]", "-map", "[ao]", "-t", f"{dur}", "-c:v","libx264","-preset","medium","-crf","24","-pix_fmt","yuv420p","-c:a","aac","-b:a","128k","-movflags","+faststart", out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print("ERR", v["id"], r.stderr[-1500:]); return None
    subprocess.run(["ffmpeg","-v","error","-y","-ss","1.0","-i",out,"-frames:v","1","-vf","scale=360:640","-q:v","4",f"{OUT}/{v['id']}.jpg"])
    print("ok", v["id"], dur, "cta@", round(cta,2), flush=True)
    return {"id": v["id"], "title": v["title"], "score": v["score"], "dur": dur, "file": f"ia/{v['id']}.mp4", "thumb": f"ia/{v['id']}.jpg", "script": v["text"]}

if __name__ == "__main__":
    only = sys.argv[1:]
    res = [render(v) for v in V if not only or v["id"] in only]
    if not only: json.dump(res, open(f"{OUT}/ia.json","w"), ensure_ascii=False, indent=1)
