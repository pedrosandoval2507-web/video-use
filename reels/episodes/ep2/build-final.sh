#!/bin/bash
# Assembles final/: one master HyperFrames composition stacking
#   base (zoomed recording) < graphics (titles, icons, cards) < presenter (AI cut-out, same zooms) < captions
set -e
cd "$(dirname "$0")"
node build-layers.mjs && node build-captions.mjs > /dev/null && node build-graphics.mjs > /dev/null
rm -rf final && mkdir -p final/compositions/fonts
for c in base presenter graphics captions; do cp $c/index.html final/compositions/$c.html; done
for d in final final/compositions; do cp graphics/gsap.min.js $d/; done
mkdir -p final/fonts && cp fonts/InstrumentSerif-Italic.woff2 final/fonts/ && cp fonts/InstrumentSerif-Italic.woff2 final/compositions/fonts/
for d in final final/compositions; do ln -s "$PWD/source.mp4" $d/source.mp4; ln -s "$PWD/cutout/presenter.mov" $d/presenter.mov; done
DUR=55.966
cat > final/index.html <<HTML
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; }
      .layer { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
      #l_captions { top: 1075px; height: 440px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="reel" data-start="0" data-duration="$DUR" data-width="1080" data-height="1920">
      <div class="layer" id="l_base" data-composition-id="base" data-composition-src="compositions/base.html" data-start="0" data-duration="$DUR" data-track-index="0"></div>
      <div class="layer" id="l_graphics" data-composition-id="graphics" data-composition-src="compositions/graphics.html" data-start="0" data-duration="$DUR" data-track-index="1"></div>
      <div class="layer" id="l_presenter" data-composition-id="presenter" data-composition-src="compositions/presenter.html" data-start="0" data-duration="$DUR" data-track-index="2"></div>
      <div class="layer" id="l_captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-track-kind="captions" data-start="0" data-duration="$DUR" data-track-index="3"></div>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.set({}, {}, $DUR);
      window.__timelines = window.__timelines || {};
      window.__timelines["reel"] = tl;
    </script>
  </body>
</html>
HTML
echo "final/ ready"
