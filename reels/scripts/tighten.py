"""Tight cut of a single talking-head take from its word timings.
Keeps every word; any pause longer than MAXGAP becomes ~KEEP s of air. Writes <out>/source.mp4
(1080x1920 30fps, 30 ms audio fades at cuts), <out>/words.tsv (ms on the cut timeline) and <out>/segs.json.
usage: python3 -I tighten.py src.mp4 words.tsv outdir [drop_from_s drop_to_s ...]"""
import json, subprocess, sys
from pathlib import Path

PRE, POST, MAXGAP = 0.08, 0.12, 0.30
src, wfile, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
drops = [(float(a), float(b)) for a, b in zip(sys.argv[4::2], sys.argv[5::2])]
W = []
for l in wfile.read_text().splitlines():
    s, e, t = l.split("\t")
    s, e = float(s), float(e)
    if any(a <= s < b for a, b in drops):
        continue
    W.append((s, e, t))
q = lambda t: round(t * 30) / 30
segs = []
for s, e, _ in W:
    a, b = max(0, s - PRE), e + POST
    if segs and a - segs[-1][1] < MAXGAP - PRE - POST:
        segs[-1][1] = max(segs[-1][1], b)
    else:
        segs.append([a, b])
segs = [[q(a), q(b)] for a, b in segs]
out.mkdir(parents=True, exist_ok=True)
tmp = out / ".segs"; tmp.mkdir(exist_ok=True)
lst = []
for i, (a, b) in enumerate(segs):
    d = b - a
    f = tmp / f"{i:03d}.mov"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a}", "-i", str(src), "-t", f"{d:.3f}", "-vf", "scale=1080:1920,setsar=1,fps=30",
                    "-af", f"afade=t=in:d=0.03,afade=t=out:st={max(0, d - 0.03):.3f}:d=0.03", "-c:v", "libx264", "-crf", "16", "-preset", "fast",
                    "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", str(f)], check=True)
    lst.append(f"file '{f.resolve()}'\n")
(tmp / "list.txt").write_text("".join(lst))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(tmp / "list.txt"), "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-movflags", "+faststart", str(out / "source.mp4")], check=True)
subprocess.run(["rm", "-rf", str(tmp)])
rows, base = [], 0.0
bounds = []
for a, b in segs:
    bounds.append((a, b, base)); base += b - a
for s, e, t in W:
    for a, b, o in bounds:
        if a <= s < b:
            rows.append(f"{round((o + s - a) * 1000)}\t{round((o + min(e, b) - a) * 1000)}\t{t}\n"); break
(out / "words.tsv").write_text("".join(rows))
(out / "segs.json").write_text(json.dumps(segs))
raw = W[-1][1] - W[0][0]
print(f"{out.name}: {len(segs)} segs, {base:.2f}s (speech span {raw:.2f}s), {len(rows)} words")
