#!/usr/bin/env python3
"""Re-transcribes the chosen speech chunks with the more accurate whisper model and writes raw_words.tsv.
Usage: pick-takes.py <ep dir> <chunk,chunk,...> [start-end ...extra ranges in seconds]
Chunks are the numbered speech chunks chunk-transcribe.py printed (raw/chunks.log)."""
import json, os, re, subprocess, sys, tempfile
ep = sys.argv[1]; keep = [int(c) for c in sys.argv[2].split(",")]
ranges = {int(m.group(1)): (float(m.group(2)), float(m.group(3))) for m in re.finditer(r"^chunk (\d+): ([0-9.]+)-([0-9.]+)", open(f"{ep}/raw/chunks.log").read(), re.M)}
extra = [tuple(map(float, r.split("-"))) for r in sys.argv[3:]]
spans = [ranges[c] for c in keep] + extra
tmp = tempfile.mkdtemp(); out = []
env = dict(os.environ, NODE_USE_ENV_PROXY="1")
for k, (s, e) in enumerate(sorted(spans)):
    f = f"{tmp}/c{k}.wav"; d = f"{tmp}/d{k}"; os.makedirs(d)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(s), "-to", str(e), "-i", f"{ep}/raw/take.wav", f], check=True)
    subprocess.run(["hyperframes", "transcribe", f, "-d", d, "-m", "medium", "-l", "pt", "--timeout", "900000", "--json"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    ws = json.load(open(f"{d}/transcript.json")) if os.path.exists(f"{d}/transcript.json") else []
    for x in ws:
        t = x["text"].strip()
        m = re.match(r"^E(como|aí|o|por|pode|se|já|ela|não|claro)(\W*)$", t)
        parts = ["E", m.group(1) + m.group(2)] if m else [t]
        for p in parts: out.append((int((s + x["start"]) * 1000), int((s + x["end"]) * 1000), p))
    print(f"{s:.2f}-{e:.2f}: {' '.join(x['text'] for x in ws)}", flush=True)
open(f"{ep}/raw_words.tsv", "w").write("".join(f"{i}\t{a}\t{b}\t{w}\n" for i, (a, b, w) in enumerate(out)))
print(len(out), "words")
