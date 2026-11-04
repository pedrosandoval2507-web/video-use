#!/usr/bin/env python3
"""Local transcription that keeps word times honest on retake-heavy recordings.
Whisper stretches words across long pauses, so the audio is first split into speech
chunks by energy (pauses >= 0.35 s), each chunk is transcribed on its own with
`hyperframes transcribe` (whisper, pt), and word times are offset back to the source.
Usage: chunk-transcribe.py <voice.wav 16k mono> <out all_words.tsv> [model]
Writes: index, start_ms, end_ms, word, chunk  (one line per word)"""
import json, os, subprocess, sys, tempfile, wave
import numpy as np

src, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "small"
with wave.open(src) as w:
    sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
hop = sr // 100
db = 20 * np.log10(np.array([np.sqrt((a[i:i + hop] ** 2).mean() + 1e-12) for i in range(0, len(a) - hop, hop)]))
floor = float(np.percentile(db, 10)); thr = floor + (20 if floor < -55 else 10)
speech = db > thr
chunks, i, n = [], 0, len(speech)
while i < n:
    if not speech[i]: i += 1; continue
    j = i; last = i
    while j < n:
        if speech[j]: last = j
        elif j - last > 35: break
        j += 1
    if last - i >= 15: chunks.append((max(0, i - 10) / 100, min(n, last + 15) / 100))
    i = j
env = dict(os.environ, NODE_USE_ENV_PROXY="1")
rows, k = [], 0
tmp = tempfile.mkdtemp()
for c, (s, e) in enumerate(chunks):
    f = os.path.join(tmp, f"c{c}.wav")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{s}", "-to", f"{e}", "-i", src, "-ac", "1", "-ar", "16000", f], check=True)
    d = os.path.join(tmp, f"d{c}"); os.makedirs(d, exist_ok=True)
    subprocess.run(["hyperframes", "transcribe", f, "-d", d, "-m", model, "-l", "pt", "--json"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    tp = os.path.join(d, "transcript.json")
    words = json.load(open(tp)) if os.path.exists(tp) else []
    for x in words:
        ws = s + min(max(x["start"], 0), e - s); we = s + min(max(x["end"], x["start"]), e - s)
        rows.append(f"{k}\t{int(ws * 1000)}\t{int(we * 1000)}\t{x['text'].strip()}\t{c}"); k += 1
    print(f"chunk {c}: {s:.2f}-{e:.2f} {' '.join(x['text'] for x in words)}", flush=True)
open(out, "w").write("\n".join(rows) + "\n")
print(f"{len(chunks)} chunks, {k} words -> {out}")
