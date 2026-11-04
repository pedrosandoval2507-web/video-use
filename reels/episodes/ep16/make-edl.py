# Builds the jump-cut edit from the raw recording: keeps only the words in raw_words.tsv
# (best take of each line), removes every silence longer than MAX_SIL (also inside a sentence,
# where the transcript stretches a word over the pause), snaps cuts to whole frames and writes
#   edl.tsv   -> source in-point (s) and length (frames at 30 fps) of each kept segment
#   words.tsv -> word timings on the edited timeline (start_ms, end_ms, word), for the captions
# Usage: python3 make-edl.py <voice.raw: mono s16le 16 kHz of the source audio>
import sys
import numpy as np

SR = 16000
GAP_SPLIT = 0.35          # a gap longer than this between kept words starts a new segment
MAX_SIL = 0.10            # silences longer than this are cut out (creator: "even 0.1 s")
KEEP = 0.03               # ...keeping this much air on each side
LEAD, TAIL = 0.03, 0.05   # air before the first / after the last word of a segment

a = np.fromfile(sys.argv[1], dtype=np.int16).astype(float) / 32768
hop = SR // 100
db = 20 * np.log10(np.array([np.sqrt((a[i:i + hop] ** 2).mean() + 1e-12) for i in range(0, len(a) - hop, hop)]))
FLOOR = float(np.percentile(db, 10))
SIL_DB = FLOOR + (34 if FLOOR < -55 else 12)   # quiet room: 34 dB over the floor (cuts every pause >= 0.1 s); noisy room: 12 dB

def quiet(i0, i1):
    return db[max(0, i0):i1] < SIL_DB

def onset(t0, t1):
    # first 30 ms of sound in [t0, t1], else t0
    for i in range(int(t0 * 100), int(t1 * 100)):
        if not quiet(i, i + 3).all():
            return i / 100
    return t0

def offset(t0, t1):
    # last 30 ms of sound in [t0, t1], else t1
    for i in range(int(t1 * 100), int(t0 * 100), -1):
        if not quiet(i - 3, i).all():
            return i / 100
    return t1

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

# Each segment: from the first sound of its first word to the last sound of its last word,
# then split wherever a long silence sits inside it.
keep = []
for seg in segs:
    s = onset(seg[0][1] - 0.15, seg[-1][2]) - LEAD
    e = offset(seg[0][1], seg[-1][2] + 0.25) + TAIL
    i, run = int(s * 100), None
    start = s
    while i < int(e * 100):
        if quiet(i, i + 1)[0] if i < len(db) else True:
            run = i if run is None else run
        else:
            if run is not None and (i - run) / 100 > MAX_SIL:
                keep.append((start, run / 100 + KEEP)); start = i / 100 - KEEP
            run = None
        i += 1
    keep.append((start, e))
keep = [(round(s * 30) / 30, round(e * 30) / 30) for s, e in keep if e - s > 0.1]

def edited(t):
    # source time -> edited time (a time inside a removed gap maps to the next kept piece)
    acc = 0.0
    for s, e in keep:
        if t < s:
            return acc
        if t <= e:
            return acc + t - s
        acc += e - s
    return acc

out = []
for _, ws, we, w in words:
    a_, b_ = edited(ws), edited(we)
    out.append((round(a_ * 1000), round(max(b_, a_ + 0.08) * 1000), w))

with open("edl.tsv", "w") as f:
    for s, e in keep:
        f.write(f"{s:.4f}\t{round((e - s) * 30)}\n")
with open("words.tsv", "w", encoding="utf8") as f:
    for s, e, w in out:
        f.write(f"{s}\t{e}\t{w}\n")
total = sum(e - s for s, e in keep)
print(f"silence < {SIL_DB:.0f} dB; {len(keep)} pieces, {total:.2f}s")
