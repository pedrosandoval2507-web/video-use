#!/usr/bin/env python3
"""Moves the body spec's times from an old body cut to a new one by aligning the two word lists
(words removed from the new cut map to the next kept word). Usage: remap.py old_words.tsv new_words.tsv"""
import difflib, json, re, sys
from pathlib import Path
old = [l.split("\t") for l in open(sys.argv[1]) if l.strip()]; new = [l.split("\t") for l in open(sys.argv[2]) if l.strip()]
ow = [w[2].strip().lower().strip(".,?!") for w in old]; nw = [w[2].strip().lower().strip(".,?!") for w in new]
pairs = []
for a, b, n in difflib.SequenceMatcher(None, ow, nw, autojunk=False).get_matching_blocks():
    pairs += [(int(old[a + k][0]) / 1000, int(new[b + k][0]) / 1000) for k in range(n)]
def T(t):
    best = max([p for p in pairs if p[0] <= t + 1e-6], default=pairs[0])
    nxt = [p for p in pairs if p[0] > best[0]]
    # inside a removed stretch, snap to the next kept word
    if nxt and t > best[0] + 1.2 and nxt[0][1] - best[1] < nxt[0][0] - best[0] - 0.5: return round(nxt[0][1], 2)
    return round(best[1] + (t - best[0]), 2)
idx_map = {}
for a, b, n in difflib.SequenceMatcher(None, ow, nw, autojunk=False).get_matching_blocks():
    for k in range(n): idx_map[a + k] = b + k
d = Path(__file__).parent; spec = json.loads((d / "spec.json").read_text())
b = spec["body"]
b["emph"] = [idx_map[i] for i in b["emph"] if i in idx_map]
b["zooms"] = [[T(z[0]), z[1], z[2]] for z in b["zooms"]]; b["cap_end"] = T(b["cap_end"]); b["cold"] = [T(x) for x in b["cold"]]
b["punch"] = [[T(p[0]), p[1]] for p in b["punch"]]
spec["body_v2"] = [[T(s[0])] + s[1:] for s in spec["body_v2"]]
spec["body_v3"] = [{**it, "t": T(it["t"]), "d": round(T(it["t"] + it["d"]) - T(it["t"]), 2)} for it in spec["body_v3"]]
(d / "spec.json").write_text(json.dumps(spec, indent=1, ensure_ascii=False))
g = (d / "body_g.js").read_text()
def fix(m):
    s, du = float(m.group(2)), float(m.group(3)); ns = T(s); nd = round(T(s + du) - ns, 2)
    return f"{m.group(1)}{ns}, {nd},"
g = re.sub(r'^(  \["[^"]+", )([0-9.]+), ([0-9.]+),', fix, g, flags=re.M)
(d / "body_g.js").write_text(g)
print("remapped; emph", len(b["emph"]), "cap_end", b["cap_end"], "cold", b["cold"])
for s in spec["body_v2"]: pass
