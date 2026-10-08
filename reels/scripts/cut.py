#!/usr/bin/env python3
"""Cuts raw takes into tight edits from an EDL (cuts.json) and remaps the transcript.

cuts.json: {"hooks": {ep: {src, segs, words}}, "body": {src, segs, words}}
  segs  = [[start_s, end_s], ...] on the raw file
  words = "start_ms end_ms text|..." on the same raw timeline

Writes, per episode, <ep>/source.mp4 (hook + body, 1080x1920 30 fps, 30 ms audio
fades at every cut) and <ep>/words.tsv (start_ms, end_ms, word on the cut timeline).
The body and each hook are also kept as parts/ so the AI cut-out can run on the
shared body only once.

usage: python3 cut.py <episodes_dir> [ep ...]
"""
import json
import subprocess
import sys
from pathlib import Path

FADE = 0.03


VENC = ["-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", "-r", "30"]
# PCM in the intermediates: AAC priming would add ~21 ms per joined segment and drift the audio.
ENC = VENC + ["-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2"]
FINAL = VENC + ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"]


def q(t):
    """Snap to the 30 fps frame grid so video and audio cuts land on the same instant."""
    return round(t * 30) / 30


def render(src: Path, segs, out: Path):
    """Encode each segment on its own (one trim graph per file keeps memory low), then join losslessly."""
    tmp = out.parent / f".{out.stem}"
    tmp.mkdir(parents=True, exist_ok=True)
    listing = []
    for i, (s, e) in enumerate(segs):
        s, e = q(s), q(e)
        d = e - s
        seg = tmp / f"{i:02d}.mov"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s}", "-i", str(src), "-t", f"{d:.3f}",
                        "-vf", "scale=1080:1920,setsar=1,fps=30",
                        "-af", f"afade=t=in:d={FADE},afade=t=out:st={d - FADE:.3f}:d={FADE}", *ENC, str(seg)], check=True)
        listing.append(f"file '{seg.resolve()}'\n")
    (tmp / "list.txt").write_text("".join(listing))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(tmp / "list.txt"),
                    "-c", "copy", str(out)], check=True)


def remap(words: str, segs, offset: float):
    """Map raw-timeline words onto the cut timeline; words outside kept segments are dropped."""
    out, t0 = [], offset
    bounds = []
    for s, e in segs:
        s, e = q(s), q(e)
        bounds.append((s, e, t0))
        t0 += e - s
    for item in words.split("|"):
        a, b, text = item.split(" ", 2)
        a, b = int(a) / 1000, int(b) / 1000
        for s, e, base in bounds:
            if s <= a < e:
                a2, b2 = base + a - s, base + min(b, e) - s
                out.append((round(a2 * 1000), round(max(b2, a2 + 0.06) * 1000), text))
                break
    return out, t0


def main():
    root = Path(sys.argv[1])
    cfg = json.loads((root / "cuts.json").read_text())
    eps = sys.argv[2:] or list(cfg["hooks"])
    body = cfg["body"]
    body_mp4 = root / "parts" / "body.mov"
    if not body_mp4.exists():
        render(root / body["src"], body["segs"], body_mp4)
    for ep in eps:
        hk = cfg["hooks"][ep]
        hook_mp4 = root / "parts" / f"hook_{ep}.mov"
        render(root / hk["src"], hk["segs"], hook_mp4)
        hw, hook_len = remap(hk["words"], hk["segs"], 0.0)
        bw, total = remap(body["words"], body["segs"], hook_len)
        d = root / ep
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(hook_mp4), "-i", str(body_mp4), "-filter_complex",
                        "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]", "-map", "[v]", "-map", "[a]",
                        *FINAL, str(d / "source.mp4")], check=True)
        (d / "words.tsv").write_text("".join(f"{a}\t{b}\t{t}\n" for a, b, t in hw + bw))
        print(f"{ep}: hook {hook_len:.2f}s + body {total - hook_len:.2f}s = {total:.2f}s, {len(hw) + len(bw)} words")


if __name__ == "__main__":
    main()
