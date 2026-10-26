#!/usr/bin/env python3
"""Mix sound effects into a finished reel (Tella's SFX catalog isn't reachable from here).
Usage: add-sfx.py <ep dir> <variant v1|v2|v3> <in.mp4> <out.mp4> <hook end s>
Cues: hook = heartbeat + riser into an impact (all quiet, creator asked); then
  v1: woosh on every graphics group, v2: woosh on every photo cut (impact on full-screen shots),
  v3: plim on every card, woosh + impact on full-screen items."""
import json, re, subprocess, sys
from pathlib import Path

SFX = Path(__file__).resolve().parent.parent / "assets/sfx"
ep, var, src, dst, hook = Path(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5])
cues = [(0.25, "heartbeat", 0.2), (max(0, hook - 2.5), "riser", 0.15), (hook, "impact", 0.25)]
if var == "v1":
    g = (ep / "build-graphics.mjs").read_text()
    for t in sorted({float(m) for m in re.findall(r'^\s*\["\w+", ([0-9.]+),', g, re.M)}):
        if t > hook + 0.2: cues.append((t, "woosh", 0.22))
elif var == "v2":
    for s in json.loads((ep / "v2.json").read_text())["shots"]:
        if s["t"] > hook + 0.2: cues.append((s["t"], "woosh", 0.22))
        if s.get("full") and s["t"] > hook + 0.2: cues.append((s["t"], "impact", 0.18))
else:
    for i, it in enumerate(json.loads((ep / "v3.json").read_text())["items"]):
        t = it["t"]
        if t <= hook + 0.2: cues.append((t + 0.05, "plim", 0.18)); continue
        if it["type"] == "full": cues += [(t, "woosh", 0.25), (t + 0.08, "impact", 0.2)]
        else: cues.append((t + 0.05, "plim" if i % 2 else "plim2", 0.28))
ins, chains = ["-i", src], []
for k, (t, name, vol) in enumerate(cues):
    ins += ["-i", str(SFX / f"{name}.wav")]
    d = int(t * 1000)
    chains.append(f"[{k+1}:a]aresample=48000,volume={vol},adelay={d}|{d}[s{k}]")
mix = "".join(f"[s{k}]" for k in range(len(cues)))
fc = ";".join(chains) + f";[0:a]aresample=48000[a0];[a0]{mix}amix=inputs={len(cues)+1}:normalize=0:duration=first,alimiter=limit=0.95[a]"
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "0:v", "-map", "[a]",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", dst], check=True)
print(f"{dst}: {len(cues)} sfx")
