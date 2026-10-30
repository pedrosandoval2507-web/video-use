#!/usr/bin/env python3
"""Sets the per-episode constants of the V1 pipeline in one go.
Usage: set-ep.py <ep dir> <config.json>
config: {"dur", "music_at", "cap_end", "emphasis": [...], "force_break": [...], "zooms": "<JS array body>"}"""
import json, re, sys
from pathlib import Path
ep = Path(sys.argv[1]); c = json.loads(Path(sys.argv[2]).read_text())
def sub(f, pat, rep):
    p = ep / f; s = p.read_text(); n = re.subn(pat, rep, s, flags=re.S)
    if n[1] == 0: sys.exit(f"{f}: no match for {pat}")
    p.write_text(n[0])
d = c["dur"]
sub("build-layers.mjs", r"DUR = [0-9.]+;", f"DUR = {d};")
sub("build-layers.mjs", r"const ZOOMS = \[.*?\];", "const ZOOMS = [\n" + c["zooms"] + "\n];")
sub("build-graphics.mjs", r"DUR = [0-9.]+;", f"DUR = {d};")
sub("build-captions.mjs", r"const TOTAL = [0-9.]+;", f"const TOTAL = {d};")
sub("build-captions.mjs", r"const EMPHASIS = new Set\(\[.*?\]\);", f"const EMPHASIS = new Set({json.dumps(c['emphasis'])});")
sub("build-captions.mjs", r"const FORCE_BREAK_AFTER = new Set\(\[.*?\]\);", f"const FORCE_BREAK_AFTER = new Set({json.dumps(c['force_break'])});")
sub("build-final.sh", r"\nDUR=[0-9.]+", f"\nDUR={d}")
sub("build-final.sh", r"CAP_END=[0-9.]+", f"CAP_END={c['cap_end']}")
m = c["music_at"]; ln = round(d - m, 2)
sub("mix.sh", r"atrim=0:[0-9.]+", f"atrim=0:{ln}")
sub("mix.sh", r"afade=t=out:st=[0-9.]+", f"afade=t=out:st={round(ln - 1.7, 2)}")
ms = int(m * 1000)
sub("mix.sh", r"adelay=\d+\|\d+", f"adelay={ms}|{ms}")
sub("mix.sh", r"after the hook \([0-9.]+ s\)", f"after the hook ({m} s)")
print(ep, "set: dur", d, "music", m, "cap_end", c["cap_end"])
if c.get("g_file"):
    g = (ep / c["g_file"]).read_text().strip()
    p = ep / "build-graphics.mjs"; s = p.read_text()
    i = s.index("const G = ["); j = s.index("\n];", i) + 3
    p.write_text(s[:i] + g + s[j:])
    print("graphics G replaced from", c["g_file"])
