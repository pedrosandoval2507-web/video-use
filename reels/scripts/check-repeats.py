#!/usr/bin/env python3
"""QA for the "keep only the last take" rule: transcribes the finished cut again, in short pieces split at
pauses (whisper tends to merge a repeated phrase into one), and flags any phrase of 3+ words that is said
twice within a few seconds. Run it on every source.mp4 before rendering.
Usage: check-repeats.py <source.mp4>"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
src = sys.argv[1]; tmp = tempfile.mkdtemp(); wav = f"{tmp}/a.wav"
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
import wave
w = wave.open(wav); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
db = 20 * np.log10(np.array([np.sqrt((a[i:i + 160] ** 2).mean() + 1e-12) for i in range(0, len(a) - 160, 160)]))
quiet = db < np.percentile(db, 50) - 18
# pieces of ~2-6 s, split at the deepest dips
cuts = [0]; i = 0
while i < len(db):
    j = min(len(db), i + 600); k = i + 200
    if j - i > 250:
        seg = db[i + 200:j]; k = i + 200 + int(np.argmin(seg))
    else: k = j
    cuts.append(k); i = k
words = []; env = dict(os.environ, NODE_USE_ENV_PROXY="1")
for n, (s, e) in enumerate(zip(cuts, cuts[1:])):
    f = f"{tmp}/p{n}.wav"; d = f"{tmp}/d{n}"; os.makedirs(d)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(s / 100), "-to", str(e / 100), "-i", wav, f], check=True)
    subprocess.run(["hyperframes", "transcribe", f, "-d", d, "-m", "medium", "-l", "pt", "--timeout", "900000", "--json"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(f"{d}/transcript.json"):
        words += [(s / 100 + x["start"], re.sub(r"[^\wà-ú]", "", x["text"].lower())) for x in json.load(open(f"{d}/transcript.json"))]
words = [x for x in words if x[1]]
print(" ".join(w for _, w in words))
hits = []
for n in (5, 4, 3):   # 3+ words: two-word phrases ("a gente") repeat naturally
    for i in range(len(words) - n):
        g = [w for _, w in words[i:i + n]]
        for j in range(i + 1, min(len(words) - n + 1, i + 16)):
            if [w for _, w in words[j:j + n]] == g and words[j][0] - words[i][0] < 8 and not any(h[0] <= i < h[1] for h in hits):
                hits.append((i, j + n)); print(f"REPEAT at {words[i][0]:.2f}s and {words[j][0]:.2f}s: {' '.join(g)}")
print("no repeats" if not hits else f"{len(hits)} repeat(s)")
