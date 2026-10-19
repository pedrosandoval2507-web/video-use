#!/bin/bash
# Low-disk render path. Rendering final/ directly makes HyperFrames extract every frame of the
# ProRes cut-out as PNG (~20 GB for 74 s), which doesn't fit the cloud disk. Instead:
#   1. HyperFrames renders final_bg/  (base + graphics, opaque MP4) and
#                         final_top/ (front + captions, transparent ProRes MOV)
#   2. FFmpeg stacks bg < cut-out (same zooms as base, origin 50% 40%) < top, and muxes the voice.
# Run ./build-final.sh first. Output: renders/reel.mp4 (then ./mix.sh).
set -e
cd "$(dirname "$0")"
rm -rf final_bg final_top
cp -r final final_bg && cp -r final final_top
sed -i -e '/id="l_presenter"/d' -e '/id="l_front"/d' -e '/id="l_captions"/d' final_bg/index.html
sed -i -e '/id="l_base"/d' -e '/id="l_graphics"/d' -e '/id="l_presenter"/d' \
  -e 's/html, body { width: 1080px; height: 1920px; overflow: hidden; background: #000; }/html, body { width: 1080px; height: 1920px; overflow: hidden; background: transparent; }/' final_top/index.html
mkdir -p renders out
npx hyperframes render final_bg -o out/bg.mp4 -q delivery --workers 2 --video-frame-format jpg --quiet
npx hyperframes render final_top -o out/top.mov --format mov --workers 2 --quiet
rm -rf /tmp/hyperframes-extract-cache-*

# The same zoom curve GSAP applies in build-layers.mjs, as an FFmpeg expression of t.
S=$(node --input-type=module -e '
  const src = (await import("node:fs")).readFileSync("build-layers.mjs", "utf8");
  const ZOOMS = eval(src.match(/const ZOOMS = (\[[\s\S]*?\]);/)[1]);
  const E = 0.3, inout = (u) => `if(lt(${u},0.5),2*pow(${u},2),1-pow(-2*${u}+2,2)/2)`;
  const win = (a, b, e) => `gte(t,${a.toFixed(4)})*lt(t,${b.toFixed(4)})*(${e}-1)`;
  const parts = ZOOMS.flatMap((z) => z.push ? [
    win(z.at, z.at + z.dur, `(${z.from}+${z.to - z.from}*(t-${z.at})/${z.dur})`),
    win(z.at + z.dur, z.at + z.dur + E, `(${z.to}-${z.to - 1}*${inout(`(t-${z.at + z.dur})/${E}`)})`),
  ] : [
    win(z.at, z.at + E, `(1+${z.to - 1}*(1-pow(1-(t-${z.at})/${E},3)))`),
    win(z.at + E, z.at + z.dur - E, `${z.to}`),
    win(z.at + z.dur - E, z.at + z.dur, `(${z.to}-${z.to - 1}*${inout(`(t-${z.at + z.dur - E})/${E}`)})`),
  ]);
  console.log(`1+${parts.join("+")}`);' | sed 's/,/\\,/g')

ffmpeg -nostdin -v error -y -i out/bg.mp4 -i cutout/presenter.mov -i out/top.mov -i source.mp4 -filter_complex \
  "[1:v]format=rgba,scale=w='trunc(1080*($S)/2)*2':h='trunc(1920*($S)/2)*2':eval=frame[p];
   [0:v][p]overlay=x='(main_w-overlay_w)/2':y='768-overlay_h*0.4':eval=frame:format=auto[a];
   [a][2:v]overlay=format=auto,format=yuv420p[v]" \
  -map "[v]" -map 3:a -c:v libx264 -crf 17 -preset medium -c:a aac -b:a 192k -shortest -movflags +faststart renders/reel.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 renders/reel.mp4
