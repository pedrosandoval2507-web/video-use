"""Vídeo explicativo animado (estilo 'stop motion') da Dot: cenas desenhadas em SVG, narração Piper, legenda no topo."""
import json, re, subprocess, os, sys, base64, io
sys.path.insert(0, "/home/user/unbox")
from make import tts, words, align
from PIL import Image

D = "/home/user/stop"; R = "/home/user/guday/raw"
OUT = "/home/user/video-use/tikfy-mvp/ia"
FPS = 12  # cara de stop motion

SENT = [
 ("cafe",     "Você toma café, espera, toma outro, e o sono continua do mesmo jeito."),
 ("sono",     "Não é falta de cafeína."),
 ("caminho",  "É o caminho que ela faz."),
 ("estomago", "No café e no energético, a cafeína desce até o estômago e demora pra começar a agir."),
 ("dot",      "Por isso tem tanta gente trocando pela Dot, a primeira bala energética do Brasil."),
 ("boca",     "Ela é absorvida pela mucosa da boca, então o efeito chega muito mais rápido."),
 ("lata",     "Um sachê tem oitenta miligramas de cafeína, a mesma energia de uma latinha."),
 ("icones",   "Zero açúcar, sabor menta, e não amarela os dentes."),
 ("cta",      "Se o carrinho laranja ainda tá aqui embaixo, é porque ainda tem. Clica e garante a sua."),
]
LABELS = {"estomago":[(0.9,"absorção lenta: 15 a 30 min",330)],"boca":[(0.4,"absorção rápida: 5 a 10 min",330)],"dot":[(0.6,"1ª bala energética do Brasil",1010)],"lata":[(0.2,"1 sachê = 1 latinha",330)]}
HL = {"sono","cafeína","caminho","estômago","demora","dot","bala","energética","boca","rápido","oitenta","miligramas","latinha","açúcar","menta","dentes","carrinho","laranja","garante"}
IMGS = {"box":"/home/user/stop/box.jpg","sachet":"/home/user/stop/sachet.jpg"}

def datauri(n):
    im = Image.open(n).convert("RGB"); b = io.BytesIO(); im.save(b, "JPEG", quality=88)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()

def main():
    text = " ".join(s for _, s in SENT)
    v = {"id": "stop_dot", "text": text, "ls": 0.7, "sil": 0.04}
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
    html = open(f"{D}/scenes_dot.html").read().replace("/*IMG*/{}", json.dumps({k: datauri(n) for k, n in IMGS.items()})).replace("/*DATA*/{}", json.dumps(data, ensure_ascii=False))
    open(f"{D}/built_dot.html", "w").write(html)
    os.makedirs(f"{D}/frames", exist_ok=True)
    for f in os.listdir(f"{D}/frames"): os.remove(f"{D}/frames/{f}")
    js = f"""
const {{chromium}}=require('playwright');
(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:720,height:1280}}}});
await p.goto('file://{D}/built_dot.html');await p.waitForTimeout(800);
const N=Math.ceil({dur}*{FPS});
for(let i=0;i<N;i++){{await p.evaluate(t=>render(t),i/{FPS});await p.screenshot({{path:'{D}/frames/'+String(i).padStart(5,'0')+'.png'}})}}
await b.close();}})();"""
    open(f"{D}/cap.js", "w").write(js)
    subprocess.run(["node", f"{D}/cap.js"], check=True)
    out = f"{OUT}/ia4.mp4"
    subprocess.run(["ffmpeg","-v","error","-y","-framerate",str(FPS),"-i",f"{D}/frames/%05d.png","-i",wav,
        "-filter_complex",f"[0:v]fps=30,format=yuv420p[v];[1:a]apad=pad_dur=0.5,loudnorm=I=-14:TP=-1.5,aresample=44100[a]",
        "-map","[v]","-map","[a]","-t",str(dur),"-c:v","libx264","-preset","medium","-crf","22","-c:a","aac","-b:a","128k","-movflags","+faststart",out], check=True)
    subprocess.run(["ffmpeg","-v","error","-y","-ss","2.0","-i",out,"-frames:v","1","-vf","scale=360:640","-q:v","4",f"{OUT}/ia4.jpg"])
    print("ok", out, dur)

if __name__ == "__main__":
    main()
