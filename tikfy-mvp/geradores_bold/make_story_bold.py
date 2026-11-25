"""Vídeo explicativo animado (estilo 'stop motion') da Dot: cenas desenhadas em SVG, narração Piper, legenda no topo."""
import json, re, subprocess, os, sys, base64, io
sys.path.insert(0, "/home/user/unbox")
from make import tts, words, align
from PIL import Image

D = "/home/user/stop"; R = "/home/user/guday/raw"
OUT = "/home/user/video-use/tikfy-mvp/bold"
FPS = 12  # cara de stop motion

STORIES = {
 "b19": dict(title="Por que a fome volta 1h depois do lanche", sent=[
   ("lanche","Você come um lanche doce e uma hora depois já tá com fome de novo."),
   ("vontade","Não é falta de força de vontade."),
   ("grafico","É que o açúcar sobe rápido e cai rápido."),
   ("saciedade","Proteína e fibra fazem você ficar saciado por mais tempo."),
   ("boldA","Por isso tanta gente trocou o docinho pela Bold."),
   ("macrosA","Até vinte gramas de proteína, cinco de fibras e sem adição de açúcar."),
   ("ctaA","Se o carrinho laranja ainda tá aqui embaixo, é porque ainda tem. Clica e garante a sua.")],
   labels={"grafico":[(0.3,"pico e queda de energia",330)],"saciedade":[(0.3,"saciedade por mais tempo",330)],"boldA":[(0.5,"proteína real, sabor surreal",1010)]}),
 "b20": dict(title="Por que o músculo não cresce mesmo treinando", sent=[
   ("treinoB","Você treina pesado, mas o músculo não aparece."),
   ("naoB","Não é falta de treino."),
   ("reconstroi","É que o músculo se reconstrói depois do treino, e pra isso ele precisa de proteína."),
   ("metade","Se falta proteína no dia, a recuperação fica pela metade."),
   ("boldB","Uma Bold tem até vinte gramas de proteína e cabe no bolso."),
   ("saborB","Sabor de sobremesa, sem adição de açúcar."),
   ("ctaB","Se o carrinho laranja ainda tá aqui embaixo, é porque ainda tem. Clica e garante a sua.")],
   labels={"reconstroi":[(1.2,"recuperação muscular",330)],"metade":[(0.4,"recuperação pela metade",330)]}),
}
SID = sys.argv[1]
SENT = STORIES[SID]["sent"]; LABELS = STORIES[SID]["labels"]
HL = {"fome","doce","vontade","açúcar","rápido","proteína","fibra","saciado","bold","vinte","gramas","fibras","carrinho","laranja","garante","músculo","treino","reconstrói","metade","bolso","sobremesa"}
IMGS = {"mix":"/home/user/bold/img/mix_azul.png","caixa":"/home/user/bold/img/caixa_mix.png","bombom":"/home/user/bold/img/bombom.png","cookies":"/home/user/bold/img/cookies_cream.png"}

def datauri(n):
    im = Image.open(n).convert("RGB"); b = io.BytesIO(); im.save(b, "JPEG", quality=88)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()

def main():
    text = " ".join(s for _, s in SENT)
    v = {"id": "stop_"+SID, "text": text, "ls": 0.7, "sil": 0.04}
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
    html = open(f"{D}/scenes_bold.html").read().replace("/*IMG*/{}", json.dumps({k: datauri(n) for k, n in IMGS.items()})).replace("/*DATA*/{}", json.dumps(data, ensure_ascii=False))
    open(f"{D}/built_bold_{SID}.html", "w").write(html)
    os.makedirs(f"{D}/frames_"+SID, exist_ok=True)
    for f in os.listdir(f"{D}/frames_"+SID): os.remove(f"{D}/frames_{SID}/{f}")
    js = f"""
const {{chromium}}=require('playwright');
(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:720,height:1280}}}});
await p.goto('file://{D}/built_bold_{SID}.html');await p.waitForTimeout(800);
const N=Math.ceil({dur}*{FPS});
for(let i=0;i<N;i++){{await p.evaluate(t=>render(t),i/{FPS});await p.screenshot({{path:'{D}/frames_{SID}/'+String(i).padStart(5,'0')+'.png'}})}}
await b.close();}})();"""
    open(f"{D}/cap_{SID}.js", "w").write(js)
    subprocess.run(["node", f"{D}/cap_{SID}.js"], check=True)
    out = f"{OUT}/{SID}.mp4"
    subprocess.run(["ffmpeg","-v","error","-y","-framerate",str(FPS),"-i",f"{D}/frames_{SID}/%05d.png","-i",wav,
        "-filter_complex",f"[0:v]fps=30,format=yuv420p[v];[1:a]apad=pad_dur=0.5,loudnorm=I=-14:TP=-1.5,aresample=44100[a]",
        "-map","[v]","-map","[a]","-t",str(dur),"-c:v","libx264","-preset","medium","-crf","22","-c:a","aac","-b:a","128k","-movflags","+faststart",out], check=True)
    subprocess.run(["ffmpeg","-v","error","-y","-ss","2.0","-i",out,"-frames:v","1","-vf","scale=360:640","-q:v","4",f"{OUT}/{SID}.jpg"])
    print("ok", out, dur)

if __name__ == "__main__":
    main()
