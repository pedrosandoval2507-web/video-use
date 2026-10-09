"""Face track for a vertical 1080x1920 clip: samples every STEP s, Haar face detection.
Writes JSON [{t, x0, y0, x1, y1}] in 1080x1920 coords, where the box is grown to cover
hair (top) and chin (bottom). usage: python3 -I facetrack.py in.mp4 out.json"""
import json, sys
import cv2

STEP = 0.2
src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
res, i, every = [], 0, max(1, round(STEP * fps))
while True:
    ok, fr = cap.read()
    if not ok:
        break
    if i % every == 0:
        if fr.shape[1] > 400:
            fr = cv2.resize(fr, (360, round(fr.shape[0] * 360 / fr.shape[1])))
        h, w = fr.shape[:2]
        k = 1920 / h
        g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
        f = casc.detectMultiScale(g, 1.1, 5, minSize=(w // 6, w // 6))
        if len(f):
            x, y, fw, fh = max(f, key=lambda r: r[2] * r[3])
            res.append({"t": round(i / fps, 2), "x0": round((x - 0.12 * fw) * k), "y0": round((y - 0.26 * fw) * k),
                        "x1": round((x + 1.12 * fw) * k), "y1": round((y + 1.05 * fh) * k)})
    i += 1
json.dump(res, open(out, "w"))
ys = sorted(r["y1"] for r in res)
print(src, len(res), "/", n // every, "chin p50/p95/max", ys[len(ys) // 2], ys[int(len(ys) * .95)], ys[-1],
      "top min", min(r["y0"] for r in res), "x", min(r["x0"] for r in res), max(r["x1"] for r in res))
