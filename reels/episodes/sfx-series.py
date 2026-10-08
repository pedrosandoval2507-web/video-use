#!/usr/bin/env python3
"""Prints the Tella apply_video_edits sound-effect operations for an episode (times from words.tsv).
usage: python3 sfx-series.py ep3 <clipId>"""
import json, re, subprocess, sys
ep, clip = sys.argv[1], sys.argv[2]
hook = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"parts/hook_{ep}.mov"]))
W = []
for l in open(f"{ep}/words.tsv"):
    s, e, t = l.rstrip("\n").split("\t")
    W.append((int(s) / 1000, re.sub(r"[.,!?…]", "", t.lower())))
def w(word, n=1, body=True):
    hits = [s for s, k in W if k == word and (s >= hook - 0.05 or not body)]
    return hits[n - 1]
HOOKS = {
    "ep3": lambda: [("press", w("trabalho", body=False) + 0.4, 0.6), ("ui-reveal", w("começou", body=False), 0.5)],
    "ep4": lambda: [("press", w("científico", body=False), 0.6), ("error", w("preguiça", body=False) + 0.35, 0.5)],
    "ep5": lambda: [("ui-reveal", w("pela", body=False), 0.5), ("error", w("travando", body=False), 0.5)],
}
fx = [("suspense-riser", 0.0, 0.5, hook), ("heartbeat", 0.0, 0.6, hook), ("impact-boom", hook - 0.15, 0.55, 1.6)]
fx += [(n, t, v, None) for n, t, v in HOOKS[ep]()]
body = [("deep-woosh", w("olhando") - 0.1, 0.4), ("press", w("trabalho"), 0.6), ("press", w("faculdade"), 0.6), ("press", w("conteúdo"), 0.6),
        ("press", w("outras"), 0.6), ("ui-reveal", w("exausto"), 0.5), ("deep-woosh", w("entendi") - 0.1, 0.4), ("press", w("estudo"), 0.6),
        ("ui-reveal", w("efeito"), 0.5), ("impact-boom", w("zeigarnik"), 0.45), ("deep-woosh", w("tarefa") - 0.1, 0.4), ("alert-ding", w("alarme"), 0.5),
        ("tick", w("cada"), 0.6), ("tick", w("momento"), 0.6), ("tick", w("passa"), 0.6), ("ui-reveal", w("pesquisadora"), 0.5),
        ("error", w("piora"), 0.45), ("press", w("troca"), 0.6), ("press", w("tarefa", 2), 0.6), ("ui-reveal", w("chamou"), 0.5),
        ("deep-woosh", w("junta") - 0.1, 0.4), ("press", w("duas"), 0.6), ("countdown-tick", w("projetos"), 0.45), ("alert-ding", w("alarmes"), 0.55),
        ("notification-chime", w("nunca") - 0.2, 0.5)]
fx += [(n, t, v, None) for n, t, v in body]
DUR = {"suspense-riser": 6024, "heartbeat": 4512, "impact-boom": 2040, "press": 168, "ui-reveal": 2112, "error": 384, "deep-woosh": 2040,
       "alert-ding": 1224, "tick": 144, "countdown-tick": 1032, "notification-chime": 1032}
ops = [{"type": "add_layout", "operationId": "base", "clipId": clip, "layout": {"kind": "fullscreen"}}]
for k, (n, t, v, d) in enumerate(fx):
    ops.append({"type": "add_sound_effect", "operationId": f"s{k}", "clipId": clip, "presetId": n,
                "startTimeMs": max(0, int(t * 1000)), "durationMs": int(d * 1000) if d else DUR[n], "volume": v})
print(json.dumps(ops, ensure_ascii=False))
