"""Vídeo explicativo animado (estilo 'stop motion') da Guday: cenas desenhadas em SVG, narração Piper, legenda no topo."""
import json, re, subprocess, os, sys, base64, io
sys.path.insert(0, "/home/user/unbox")
from make import tts, words, align
from PIL import Image

D = "/home/user/stop"; R = "/home/user/guday/raw"
OUT = "/home/user/video-use/tikfy-mvp/guday"
FPS = 12  # cara de stop motion

SENT = [
 ("treino",  "Você treina, se esforça, chega na última série e a força acaba antes."),
 ("vontade", "Não é falta de vontade."),
 ("energia", "É que a energia rápida do músculo acaba em poucos segundos."),
 ("creatina","A creatina ajuda o músculo a recarregar essa energia mais rápido."),
 ("forca",   "E isso ajuda a ganhar mais força nos treinos."),
 ("po",      "Só que creatina em pó tem gosto de areia,"),
 ("esquece", "e quase todo mundo esquece de tomar."),
 ("guday",   "Por isso tem tanta gente usando a creatina em gummy da Guday."),
 ("dose",    "Duas gummies têm três gramas de creatina, sem açúcar, sem glúten e sem lactose."),
 ("mastiga", "É só mastigar e ir treinar."),
 ("cta",     "Se o carrinho laranja ainda tá aqui embaixo, é porque ainda tem. Clica e garante a sua."),
]
LABELS = {"energia":[(1.0,"energia rápida do músculo",330)],"creatina":[(0.6,"recarga mais rápida",330)],"forca":[(0.5,"mais força por série",330)],
          "esquece":[(0.4,"dias sem tomar",420)],"guday":[(0.8,"creatina em gummies",1010)]}
HL = {"força","vontade","energia","segundos","recarregar","rápido","areia","esquece","gummy","guday","três","gramas","açúcar","glúten","lactose","mastigar","treinar","carrinho","laranja","garante","creatina"}
IMGS = {"po":30,"pote":3,"pote2":7,"gomas":23}

def datauri(n):
    im = Image.open(f"{R}/{n:02d}.png").convert("RGB"); b = io.BytesIO(); im.save(b, "JPEG", quality=88)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()

def main():
    text = " ".join(s for _, s in SENT)
    v = {"id": "stop_guday", "text": text, "ls": 0.7, "sil": 0.04}
    wav = tts(v); ws, dur = words(wav); ws = align(text, ws); dur = round(dur + 0.5, 2)
    # scene starts = first word of each sentence
    idx = 0; scenes = []
    for name, s in SENT:
        n = len(s.split())
        st = 0 if not scenes else ws[idx][0] - 0.05
        scenes.append({"name": name, "start": max(0, st), "labels": [{"t": ws[idx][0] + a, "txt": t, "y": y} for a, t, y in LABELS.get(name, [])]})
        idx += n
    W = []
    for a, b, w in ws:
        clean = re.sub(r"[.,!?;:]", "", w)
        W.append([a, b, clean, re.sub(r"\W", "", clean.lower()) in HL])
    groups = []; cur = []
    for i, (a, b, w) in enumerate(ws):
        if cur and (len(cur) >= 3 or re.search(r"[.,!?:]$", ws[cur[-1]][2])):
            groups.append(cur); cur = []
        cur.append(i)
    if cur: groups.append(cur)
    G = []
    for gi, g in enumerate(groups):
        e = ws[groups[gi + 1][0]][0] if gi + 1 < len(groups) else dur
        G.append({"s": ws[g[0]][0], "e": e, "w": g})
    data = {"scenes": scenes, "words": W, "groups": G}
    html = open(f"{D}/scenes.html").read().replace("/*IMG*/{}", json.dumps({k: datauri(n) for k, n in IMGS.items()})).replace("/*DATA*/{}", json.dumps(data, ensure_ascii=False))
    open(f"{D}/built.html", "w").write(html)
    os.makedirs(f"{D}/frames", exist_ok=True)
    for f in os.listdir(f"{D}/frames"): os.remove(f"{D}/frames/{f}")
    js = f"""
const {{chromium}}=require('playwright');
(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:720,height:1280}}}});
await p.goto('file://{D}/built.html');await p.waitForTimeout(800);
const N=Math.ceil({dur}*{FPS});
for(let i=0;i<N;i++){{await p.evaluate(t=>render(t),i/{FPS});await p.screenshot({{path:'{D}/frames/'+String(i).padStart(5,'0')+'.png'}})}}
await b.close();}})();"""
    open(f"{D}/cap.js", "w").write(js)
    subprocess.run(["node", f"{D}/cap.js"], check=True)
    out = f"{OUT}/g11.mp4"
    subprocess.run(["ffmpeg","-v","error","-y","-framerate",str(FPS),"-i",f"{D}/frames/%05d.png","-i",wav,
        "-filter_complex",f"[0:v]fps=30,format=yuv420p[v];[1:a]apad=pad_dur=0.5,loudnorm=I=-14:TP=-1.5,aresample=44100[a]",
        "-map","[v]","-map","[a]","-t",str(dur),"-c:v","libx264","-preset","medium","-crf","22","-c:a","aac","-b:a","128k","-movflags","+faststart",out], check=True)
    subprocess.run(["ffmpeg","-v","error","-y","-ss","2.0","-i",out,"-frames:v","1","-vf","scale=360:640","-q:v","4",f"{OUT}/g11.jpg"])
    print("ok", out, dur)

if __name__ == "__main__":
    main()
