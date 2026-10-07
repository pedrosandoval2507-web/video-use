#!/bin/bash
# Cuts the AI cut-out of the person into the windows where images/cards are on screen,
# scaled to 1080x1920 with the same punch-in zoom as the base video (zoom origin 50% 40%).
set -e
cd "$(dirname "$0")"
IN=cutout/presenter.mov
seg() { # index start end [zoomStartLocal zoomEndLocal scale]
  local i=$1 s=$2 e=$3 zs=$4 ze=$5 k=$6
  local S="1"
  if [ -n "$zs" ]; then
    local a b d
    a=$(echo "$zs+0.3" | bc); b=$(echo "$ze-0.3" | bc); d=$(echo "$k-1" | bc)
    # GSAP power3.out in, hold, power2.inOut out
    S="if(lt(t\,$zs)\,1\,if(lt(t\,$a)\,1+$d*(1-pow(1-(t-$zs)/0.3\,3))\,if(lt(t\,$b)\,$k\,if(lt(t\,$ze)\,$k-$d*if(lt((t-$b)/0.3\,0.5)\,2*pow((t-$b)/0.3\,2)\,1-pow(-2*(t-$b)/0.3+2\,2)/2)\,1))))"
  fi
  local dur
  dur=$(echo "$e-$s" | bc)
  ffmpeg -v error -y -ss "$s" -t "$dur" -i "$IN" -f lavfi -t "$dur" -i "color=c=black@0.0:s=1080x1920:r=30,format=rgba" -filter_complex \
    "[0:v]setpts=PTS-STARTPTS,scale=1080:1920,format=rgba,scale=w='trunc(1080*($S)/2)*2':h='trunc(1920*($S)/2)*2':eval=frame[p];[1:v][p]overlay=x='540-540*($S)':y='768-768*($S)':eval=frame:format=auto[v]" \
    -map "[v]" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le "out/pres-$i.mov"
  echo "pres-$i $s-$e $(du -h "out/pres-$i.mov" | cut -f1)"
}
seg 0 4.90 10.35
seg 1 16.90 25.65
seg 2 26.30 29.08 0.80 2.70 1.3
seg 3 34.40 38.20
seg 4 43.05 45.75
