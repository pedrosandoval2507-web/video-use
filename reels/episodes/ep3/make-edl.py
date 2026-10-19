# Builds the jump-cut edit from the raw recording: keeps only the words in raw_words.tsv
# (best take of each line), snaps every cut to the quietest point of the audio, and writes
#   edl.tsv   -> source in-point (s) and length (frames at 30 fps) of each kept segment
#   words.tsv -> word timings on the edited timeline (start_ms, end_ms, word), for the captions
# Usage: python3 make-edl.py <voice.raw: mono s16le 16 kHz of the source audio>
import sys
import numpy as np

SR = 16000
GAP_SPLIT = 0.35          # a silence longer than this between kept words becomes a cut
LEAD, TAIL = 0.06, 0.10   # breath kept before the first / after the last word of a segment

a = np.fromfile(sys.argv[1], dtype=np.int16).astype(float) / 32768
hop = int(0.01 * SR)
rms = np.array([np.sqrt((a[i:i + hop] ** 2).mean() + 1e-12) for i in range(0, len(a) - hop, hop)])
db = 20 * np.log10(rms)

def quietest(t0, t1):
    i0, i1 = max(0, int(t0 * 100)), int(t1 * 100)
    return (i0 + int(np.argmin(db[i0:i1]))) / 100

def speech_end(t, cap):
    # first 60 ms run below -50 dB after t, or None
    i = int(t * 100)
    while i < int(cap * 100):
        if (db[i:i + 6] < -50).all():
            return i / 100
        i += 1
    return None

words = []
for line in open("raw_words.tsv", encoding="utf8"):
    idx, s, e, w = line.rstrip("\n").split("\t")
    words.append((int(idx), int(s) / 1000, int(e) / 1000, w))

segs, cur = [], [words[0]]
for prev, w in zip(words, words[1:]):
    if w[0] != prev[0] + 1 or w[1] - prev[2] > GAP_SPLIT:
        segs.append(cur); cur = []
    cur.append(w)
segs.append(cur)

edl, out, t = [], [], 0.0
for seg in segs:
    s = quietest(seg[0][1] - 0.22, seg[0][1] + 0.02) - LEAD
    e = speech_end(seg[-1][2] - 0.08, seg[-1][2] + 0.4)
    # no silence after the word (next word runs on): cut at the quietest dip instead
    e = e + TAIL if e is not None else quietest(seg[-1][2] - 0.05, seg[-1][2] + 0.3)
    s, e = round(s * 30) / 30, round(e * 30) / 30   # whole frames, so the cut stays in sync at 30 fps
    edl.append((s, e))
    for _, ws, we, w in seg:
        out.append((round((t + ws - s) * 1000), round((t + min(we, e) - s) * 1000), w))
    t += e - s

with open("edl.tsv", "w") as f:
    for s, e in edl:
        f.write(f"{s:.4f}\t{round((e - s) * 30)}\n")
with open("words.tsv", "w", encoding="utf8") as f:
    for s, e, w in out:
        f.write(f"{s}\t{e}\t{w}\n")
print(f"{len(edl)} segments, {t:.2f}s")
for s, e in edl:
    print(f"  {s:8.3f} -> {e:8.3f}  ({e - s:.2f}s)")
