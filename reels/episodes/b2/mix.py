"""Final audio for a batch-2 episode: voice + upbeat music after the hook (~12%) + the SFX listed in
<ep>/sfx.json (local copies of Tella's presets in sfx/), loudness -14 LUFS. Also writes the <30 MB chat copy.
usage: python3 -I mix.py ep04"""
import json, subprocess, sys
from pathlib import Path
here = Path(__file__).resolve().parent
ep = here / sys.argv[1]
cfg = json.loads((ep / "sfx.json").read_text())
HOOK, DUR = cfg["HOOK"], cfg["DUR"]
music = here.parent / "ep2" / "audio" / "music.mp3"
ins = ["-i", str(ep / "renders" / "reel.mp4"), "-i", str(ep / "source.mp4"), "-i", str(music)]
f = ["[1:a]aresample=48000,highpass=f=70[v]"]
ms = int((HOOK - 0.1) * 1000)
ln = round(DUR - HOOK + 0.1, 2)
f.append(f"[2:a]aresample=48000,atrim=0:{ln},asetpts=PTS-STARTPTS,volume=0.12,afade=t=in:d=0.6,afade=t=out:st={max(0, ln - 1.5)}:d=1.5,adelay={ms}|{ms}[m]")
labels = ["[v]", "[m]"]
for k, (name, t, vol, d) in enumerate(cfg["sfx"]):
    if t >= DUR - 0.05:
        continue
    ins += ["-i", str(here / "sfx" / f"{name}.wav")]
    idx = 3 + len(labels) - 2
    trim = f"atrim=0:{d}," if d else ""
    dl = int(max(0, t) * 1000)
    f.append(f"[{idx}:a]aresample=48000,{trim}volume={vol},adelay={dl}|{dl}[s{k}]")
    labels.append(f"[s{k}]")
f.append(f"{''.join(labels)}amix=inputs={len(labels)}:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
out = ep / "renders" / "final.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(f), "-map", "0:v", "-map", "[a]", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "192k", "-t", f"{DUR}", "-movflags", "+faststart", str(out)], check=True)
chat = ep / "renders" / "chat.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-c:v", "libx264", "-crf", "23", "-preset", "slow", "-maxrate", "3.5M", "-bufsize", "7M",
                "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(chat)], check=True)
print(out, chat, f"{chat.stat().st_size / 1e6:.1f} MB")
