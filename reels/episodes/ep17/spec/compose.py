#!/usr/bin/env python3
"""Builds the five hook variants of ep17 (one recording of the body + five recorded hooks).
Each variant episodes/ep17hN = hook N + the same body: source.mp4 is the two cuts joined,
words/graphics/V2/V3 are the hook's plus the body's shifted by the hook length.
Usage: compose.py [--presenter]   (--presenter also joins the cut-outs once they exist)"""
import json, shutil, subprocess, sys
from pathlib import Path
E17 = Path(__file__).resolve().parent.parent; EPS = E17.parent; SCR = EPS.parent / "scripts"
spec = json.loads((E17 / "spec/spec.json").read_text()); body_g = (E17 / "spec/body_g.js").read_text()
body = spec["body"]
def dur(p): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))
def words(p): return [l.rstrip("\n").split("\t") for l in open(p, encoding="utf8") if l.strip()]
def shift_g(src, d):
    # shift the start time (2nd field) of every top-level group line by d
    import re
    return re.sub(r'^(  \["[^"]+", )([0-9.]+)', lambda m: f"{m.group(1)}{float(m.group(2)) + d:.2f}", src, flags=re.M)
BD = dur(E17 / "body/source.mp4"); bw = words(E17 / "body/words.tsv")
only = [a for a in sys.argv[1:] if a.startswith("h")]
for n, (hk, h) in enumerate(spec["hooks"].items(), 1):
    if only and hk not in only: continue
    out = EPS / f"ep17{hk}"; out.mkdir(exist_ok=True)
    D = round(dur(E17 / hk / "source.mp4"), 3); hw = words(E17 / hk / "words.tsv")
    if "--presenter" in sys.argv:
        (out / "cutout").mkdir(exist_ok=True)
        lst = out / "cutout/list.txt"; lst.write_text(f"file '{E17 / hk / 'cutout/presenter.mov'}'\nfile '{E17 / 'body/cutout/presenter.mov'}'\n")
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(out / "cutout/presenter.mov")], check=True)
        print(out.name, "presenter joined"); continue
    for f in ["build-captions.mjs", "build-cards.mjs", "build-final.sh", "build-graphics.mjs", "build-layers.mjs", "composite.sh", "mix.sh"]:
        shutil.copy(EPS / "ep16" / f, out / f)
    for d in ["fonts", "audio"]:
        shutil.rmtree(out / d, ignore_errors=True); shutil.copytree(EPS / "ep16" / d, out / d)
    g = (out / "build-graphics.mjs").read_text()
    import re
    g = re.sub(r"^const FB = [0-9]+;.*$", "const FB = 1010;   // wide standing shot: title boxes sit on the chest", g, flags=re.M)
    (out / "build-graphics.mjs").write_text(g)
    lst = out / "srclist.txt"; lst.write_text(f"file '{E17 / hk / 'source.mp4'}'\nfile '{E17 / 'body/source.mp4'}'\n")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", "-movflags", "+faststart", str(out / "source.mp4")], check=True)
    ms = int(D * 1000)
    rows = [f"{w[0]}\t{w[1]}\t{w[2]}" for w in hw] + [f"{int(w[0]) + ms}\t{int(w[1]) + ms}\t{w[2]}" for w in bw]
    (out / "words.tsv").write_text("\n".join(rows) + "\n")
    T = round(D + BD, 2); nh = len(hw)
    zooms = [f"  {{ at: 0, dur: {D - 0.1:.2f}, from: 1.0, to: 1.1, push: true }},"] + [f"  {{ at: {D + z[0]:.2f}, dur: {z[1]}, to: {z[2]} }}," for z in body["zooms"]]
    cfg = {"dur": T, "music_at": round(D + 0.1, 2), "cap_end": round(D + body["cap_end"], 2), "emphasis": h["emph"] + [i + nh for i in body["emph"]],
           "force_break": [], "zooms": "\n".join(zooms), "g_file": "g.js"}
    (out / "cfg.json").write_text(json.dumps(cfg, indent=1))
    hook_g = f'  ["hook_k", 0.1, {D - 0.1:.2f}, kicker("hk", "{h["kicker"]}"), [rise("#hk", 0.0, 0.3)], true],\n  ' + h["g"].replace("{D2}", "0") 
    # hook box lasts until the hook ends
    start = float(re.search(r'\["hook_t", ([0-9.]+)', h["g"]).group(1)); hook_g = hook_g.replace(", 0, fbox", f", {D - start:.2f}, fbox")
    (out / "g.js").write_text("const G = [\n" + hook_g + "\n" + shift_g(body_g, D) + "];\n")
    def shot(t, txt, img=None, full=False):
        if img: return {"t": round(t, 2), "img": img, "label": txt.replace("<b>", "").replace("</b>", "").replace("<i>", "").replace("</i>", ""), **({"pos": "50% 20%"} if img.startswith("perfil") else {})}
        return {"t": round(t, 2), "text": txt, **({"full": True} if full else {})}
    shots = [shot(*s) for s in h["v2"]] + [shot(s[0] + D, *s[1:]) for s in spec["body_v2"]]
    (out / "v2.json").write_text(json.dumps({"videoTop": -250, "shots": shots}, indent=1, ensure_ascii=False))
    items = [{"t": 0.1, "d": round(D - 0.15, 2), "type": "news", "kicker": h["kicker"], "title": h["title"]}] + [{**it, "t": round(it["t"] + D, 2)} for it in spec["body_v3"]]
    punch = [[0, 1.0], [round(D * 0.55, 2), 1.12], [round(D, 2), 1.0]] + [[round(p[0] + D, 2), p[1]] for p in body["punch"]]
    (out / "v3.json").write_text(json.dumps({"capEnd": cfg["cap_end"], "capTop": 1150, "lowerTop": 1570, "punch": punch, "items": items}, indent=1, ensure_ascii=False))
    (out / "cold.txt").write_text(f"{D + body['cold'][0]:.2f} {D + body['cold'][1]:.2f}\n")
    subprocess.run(["python3", str(SCR / "set-ep.py"), str(out), str(out / "cfg.json")], check=True, stdout=subprocess.DEVNULL)
    for b in ["build-v2-split.mjs", "build-v3-tarik.mjs"]:
        pass
    print(out.name, "hook", D, "total", T)
