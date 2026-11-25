"""Gera narração + especificação (timeline) de cada vídeo. Saída: specs/<id>.json, audio/<id>.wav e audio/<id>.mp3"""
import json, re, os, sys, subprocess
sys.path.insert(0, "/home/user/unbox"); sys.path.insert(0, "/home/user/brands")
from make import tts, words, align
from scripts import B

D = "/home/user/brands"; os.makedirs(f"{D}/specs", exist_ok=True); os.makedirs(f"{D}/audio", exist_ok=True)
HOOKCOL = {"SLIDE":("#ffffff","#7C5CFF"),"POV":("#111111","#ffffff"),"DOPA":("#111111","#FFD54A"),"DADOS":("#111111","#2DD4FF"),"COMPARA":("#ffffff","#FF4D6D"),"STORY":("#111111","#ffffff")}
FMTNAME = {"SLIDE":"Slideshow","POV":"POV","DOPA":"Dopamina","DADOS":"Dados do produto","COMPARA":"Comparação","STORY":"Explicativo animado"}
WHY = {"SLIDE":"Fotos passando rápido com narração prendem o olhar.","POV":"POV gera identificação imediata.","DOPA":"Tela partida com animação satisfatória segura a atenção.",
       "DADOS":"Benefícios claros em cards na tela.","COMPARA":"Comparação direta quebra a objeção.","STORY":"Explica o porquê com cenas animadas e educa antes de vender."}
norm = lambda w: re.sub(r"[^\wà-ú]", "", w.lower())

def spec(brand, v):
    out = f"{D}/specs/{v['id']}.json"
    if os.path.exists(out) and "--force" not in sys.argv: return json.load(open(out))
    vv = dict(v, ls=v.get("ls",0.7), sil=v.get("sil",0.04))
    wav = tts(vv); ws, dur = words(wav); ws = align(v["text"], ws); dur = round(dur + 0.45, 2)
    subprocess.run(["cp", wav, f"{D}/audio/{v['id']}.wav"])
    subprocess.run(["ffmpeg","-v","error","-y","-i",wav,"-af","loudnorm=I=-15:TP=-1.5","-ac","1","-ar","22050","-b:a","24k",f"{D}/audio/{v['id']}.mp3"])
    W = [[round(a,3), round(b,3), w] for a,b,w in ws]
    # grupos de legenda
    groups=[]; cur=[]
    for i,(a,b,w) in enumerate(W):
        if cur and (len(cur)>=3 or a-W[cur[-1]][1]>0.35 or re.search(r"[.,!?:]$", W[cur[-1]][2])): groups.append(cur); cur=[]
        cur.append(i)
    if cur: groups.append(cur)
    G=[{"s":W[g[0]][0],"e":(W[groups[k+1][0]][0] if k+1<len(groups) else dur),"w":g} for k,g in enumerate(groups)]
    ctaT = next((a for a,b,w in W if norm(w) in ("clica","corre") and a > dur*0.45), None)
    if v["fmt"] == "STORY":
        ctaT = next((a for a,b,w in W if norm(w)=="se" and a > dur*0.6), dur-4)
    if ctaT is None: ctaT = dur - 3.5
    S = {"id":v["id"],"brand":brand,"fmt":v["fmt"],"dur":dur,"ctaT":round(ctaT,3),"words":W,"groups":G,"title":v["title"],"score":v["score"],
         "hook":v.get("hook",""),"hookCol":HOOKCOL[v["fmt"]],"tag":B[brand]["tag"],"bg":v.get("bg","tunnel")}
    if v["fmt"] == "STORY":
        idx=0; sc=[]
        for (kind,arg),sent in zip(v["scenes"], v["sents"]):
            st = 0 if not sc else W[idx][0]-0.05
            sc.append({"kind":kind,"arg":arg,"t0":round(max(0,st),3)}); idx += len(sent.split())
        for i in range(len(sc)): sc[i]["t1"] = sc[i+1]["t0"] if i+1 < len(sc) else dur
        S["scenes"] = sc
    else:
        imgs = v["imgs"]; tl=[]
        if v["fmt"] == "SLIDE":
            per = 0.9; t=0; i=0
            while t < dur-0.01: tl.append({"img":imgs[i%len(imgs)],"t0":round(t,3),"t1":round(min(dur,t+per),3)}); t+=per; i+=1
        else:
            t=0
            if v["fmt"] == "COMPARA":
                # fase de comparação até o início da 3ª frase
                sents=[]; cnt=0
                for sent in re.split(r"(?<=[.!?])\s+", v["text"]): sents.append(cnt); cnt+=len(sent.split())
                mid = W[sents[3]][0] if len(sents) > 3 else dur*0.5
                tl.append({"img":"@cmp","t0":0,"t1":round(mid,3),"cmp":v["cmp"]}); t = mid
            per = (dur - t)/len(imgs)
            for im in imgs: tl.append({"img":im,"t0":round(t,3),"t1":round(t+per,3)}); t += per
        S["tl"] = tl
        S["labels"] = [{"t0":x["t0"],"t1":x["t1"],"txt":v["labels"][x["img"]]} for x in tl if v.get("labels",{}).get(x["img"])]
        cards=[]
        for trig, txt in v.get("cards", []):
            st = next((a for a,b,w in W if w.lower()==trig.lower()), None)
            if st is None: st = next((a for a,b,w in W if norm(w)==norm(trig)), None)
            if st is not None: cards.append({"t0":round(st,3),"t1":round(min(ctaT, st+3.0),3),"txt":txt})
        S["cards"] = cards
    json.dump(S, open(out,"w"), ensure_ascii=False)
    return S

if __name__ == "__main__":
    only = sys.argv[1:]; only = [o for o in only if not o.startswith("--")]
    meta = []
    for k, br in B.items():
        for v in br["videos"]:
            if only and v["id"] not in only and k not in only: continue
            s = spec(k, v); print("ok", v["id"], s["dur"], flush=True)
            meta.append({"id":v["id"],"brand":k,"score":v["score"],"format":FMTNAME[v["fmt"]],"title":v["title"],"dur":s["dur"],"why":WHY[v["fmt"]],
                         "caption":f"{v['title']} ✨ {br['name']}: clica no carrinho laranja 🛒 #tiktokshop #{k} #achadinhos"})
    if not only:
        for x in meta:
            if x["id"]=="gummy21": x["format"]="História com personagens"; x["why"]="Storytelling com personagem: prende até o fim e gera identificação antes do CTA."
        json.dump(meta, open(f"{D}/meta.json","w"), ensure_ascii=False, indent=1)
