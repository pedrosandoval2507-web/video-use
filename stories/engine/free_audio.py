#!/usr/bin/env python3
"""Free audio for the animated stories: no API keys, no credits.

  python3 stories/engine/free_audio.py sfx              # synthesize woosh + upbeat music -> stories/audio/
  python3 stories/engine/free_audio.py ep01 ep02 ...    # narrate with Microsoft neural voice (edge-tts)

Narration writes episodes/<ep>/voice.mp3 and voice.json (per-character start/end times,
the same format render.mjs reads), built from edge-tts word boundaries.
Voice: EDGE_VOICE (default pt-BR-AntonioNeural), rate: EDGE_RATE (default +18%).
"""
import asyncio, json, os, sys, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE = os.environ.get("EDGE_VOICE", "pt-BR-AntonioNeural")
RATE = os.environ.get("EDGE_RATE", "+18%")


async def narrate(ep: str) -> None:
    import edge_tts
    spec = json.loads((ROOT / "episodes" / f"{ep}.json").read_text())
    text = " ".join(s["say"].replace("*", "") for s in spec["scenes"])
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    comm = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary", proxy=proxy)
    audio, words = bytearray(), []
    async for ch in comm.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append((ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7, ch["text"]))
    out = ROOT / "episodes" / ep
    out.mkdir(parents=True, exist_ok=True)
    (out / "voice.mp3").write_bytes(bytes(audio))
    # map word boundaries onto the exact characters of `text`
    n = len(text)
    starts, ends = [None] * n, [None] * n
    pos = 0
    for s, e, w in words:
        i = text.find(w, pos)
        if i < 0:
            continue
        for k in range(i, i + len(w)):
            starts[k] = s + (e - s) * (k - i) / max(1, len(w))
            ends[k] = s + (e - s) * (k - i + 1) / max(1, len(w))
        pos = i + len(w)
    # fill gaps (spaces, punctuation, unmatched) with the previous end time
    last = 0.0
    for k in range(n):
        if starts[k] is None:
            starts[k] = ends[k] = last
        last = ends[k]
    (out / "voice.json").write_text(json.dumps({"text": text, "starts": starts, "ends": ends}))
    print(f"{ep}: {len(words)} words, {words[-1][1]:.1f}s")


def write_wav(path: Path, x, sr=44100):
    import numpy as np
    x = np.clip(x, -1, 1)
    st = (x * 32767).astype(np.int16)
    if st.ndim == 1:
        st = np.stack([st, st], axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(st.tobytes())


def synth_sfx() -> None:
    import numpy as np
    sr = 44100
    rng = np.random.default_rng(7)
    dst = ROOT / "audio"
    dst.mkdir(exist_ok=True)

    # --- woosh: band-passed noise with a rising-then-falling sweep
    dur = 0.55
    t = np.arange(int(sr * dur)) / sr
    noise = rng.standard_normal(len(t))
    spec = np.fft.rfft(noise)
    f = np.fft.rfftfreq(len(t), 1 / sr)
    spec *= np.exp(-((f - 2500) / 2200) ** 2)
    nz = np.fft.irfft(spec, len(t))
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2 * np.exp(-t * 2)
    # simple moving filter for motion: amplitude modulate with a sweep
    w = nz * env * (0.6 + 0.4 * np.sin(2 * np.pi * (3 + 18 * t) * t))
    w = w / np.abs(w).max() * 0.8
    pan = np.clip(t / dur, 0, 1)
    write_wav(dst / "woosh.wav", np.stack([w * (1 - 0.5 * pan), w * (0.5 + 0.5 * pan)], axis=1), sr)

    # --- upbeat music: 112 BPM, I-V-vi-IV in C major, pluck arp + bass + kick/hat/clap
    bpm, bars = 112, 16
    beat = 60 / bpm
    n = int(sr * beat * 4 * bars)
    mix = np.zeros((n, 2))
    midi = lambda m: 440 * 2 ** ((m - 69) / 12)

    def add(sig, start, gain=1.0, pan=0.0):
        i = int(start * sr)
        j = min(n, i + len(sig))
        if i >= n:
            return
        mix[i:j, 0] += sig[: j - i] * gain * (1 - max(0, pan))
        mix[i:j, 1] += sig[: j - i] * gain * (1 + min(0, pan))

    def pluck(freq, d, bright=1.0):
        tt = np.arange(int(sr * d)) / sr
        s = np.sign(np.sin(2 * np.pi * freq * tt)) * 0.25 + np.sin(2 * np.pi * freq * tt) * 0.75
        s += 0.3 * bright * np.sin(2 * np.pi * freq * 2 * tt)
        return s * np.exp(-tt * 7) * (1 - np.exp(-tt * 400))

    def kick():
        tt = np.arange(int(sr * 0.35)) / sr
        fr = 50 + 110 * np.exp(-tt * 30)
        return np.sin(2 * np.pi * np.cumsum(fr) / sr) * np.exp(-tt * 9)

    def hat(d=0.05):
        tt = np.arange(int(sr * d)) / sr
        s = rng.standard_normal(len(tt))
        s = np.diff(s, prepend=0)
        return s * np.exp(-tt * 60) * 0.5

    def clap():
        tt = np.arange(int(sr * 0.2)) / sr
        s = rng.standard_normal(len(tt))
        return s * (np.exp(-tt * 25) + 0.5 * np.exp(-((tt - 0.012) * 300) ** 2)) * 0.6

    prog = [(60, [60, 64, 67, 72]), (55, [59, 62, 67, 71]), (57, [57, 60, 64, 69]), (53, [57, 60, 65, 69])]
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    for b in range(bars):
        root, chord = prog[b % 4]
        t0 = b * 4 * beat
        intro = b < 2
        for k in range(8):  # eighth-note arpeggio
            note = chord[pattern[k]] + (12 if b % 8 >= 4 and k % 2 else 0)
            add(pluck(midi(note), beat * 0.9), t0 + k * beat / 2, 0.16, pan=0.3 if k % 2 else -0.3)
        for k in (0, 1.5, 2, 3.5):  # bass
            tt = np.arange(int(sr * beat * 0.45)) / sr
            add(np.sin(2 * np.pi * midi(root - 24) * tt) * np.exp(-tt * 4), t0 + k * beat, 0.45)
        if not intro:
            for k in range(4):
                add(kick(), t0 + k * beat, 0.7)
                add(hat(), t0 + k * beat + beat / 2, 0.25, pan=0.2)
            for k in (1, 3):
                add(clap(), t0 + k * beat, 0.35)
    # gentle sidechain pump on kicks + master limit
    tt = np.arange(n) / sr
    pump = 0.75 + 0.25 * np.clip((tt % beat) / (beat * 0.6), 0, 1)
    mix[:, 0] *= pump; mix[:, 1] *= pump
    mix /= np.abs(mix).max() / 0.85
    write_wav(dst / "music.wav", mix, sr)
    for name in ("woosh", "music"):
        os.system(f'ffmpeg -v error -y -i "{dst}/{name}.wav" -b:a 192k "{dst}/{name}.mp3" && rm "{dst}/{name}.wav"')
    print("audio/woosh.mp3, audio/music.mp3")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    if args[0] == "sfx":
        synth_sfx()
    else:
        for ep in args:
            asyncio.run(narrate(ep))
