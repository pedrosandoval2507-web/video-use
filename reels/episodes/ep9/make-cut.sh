#!/bin/bash
# Cuts the raw iPhone recording (4K HLG HEVC, 60 fps) into the jump-cut edit from edl.tsv:
# each segment is tone-mapped to SDR bt709, scaled to 1080x1920 at 30 fps, with 15 ms audio
# fades at each cut, then all segments are joined into source.mp4 (the input of the ep2 pipeline).
# Usage: ./make-cut.sh <raw.mov>
set -e
cd "$(dirname "$0")"
RAW=$1
mkdir -p out/seg
VF="zscale=w=1080:h=1920:f=spline36:t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,fps=30"
i=0; list=""
while read -r s n; do
  d=$(awk -v n="$n" 'BEGIN { printf "%.4f", n / 30 }')
  f=out/seg/$(printf %02d $i).mov
  ffmpeg -nostdin -v error -y -ss "$s" -t "$(awk -v d="$d" 'BEGIN { printf "%.4f", d + 0.2 }')" -i "$RAW" -map 0:v:0 -map 0:a:0 -vf "$VF" -frames:v "$n" \
    -af "aresample=48000,apad,atrim=0:$d,afade=t=in:d=0.015,afade=t=out:st=$(awk -v d="$d" 'BEGIN { printf "%.4f", d - 0.015 }'):d=0.015" \
    -c:v libx264 -crf 16 -preset fast -c:a pcm_s16le "$f" &
  list+="file 'seg/$(printf %02d $i).mov'"$'\n'
  i=$((i + 1))
  (( i % 3 == 0 )) && wait
done < edl.tsv
wait
printf "%s" "$list" > out/segs.txt
ffmpeg -v error -y -f concat -safe 0 -i out/segs.txt -c:v copy -c:a aac -b:a 192k -movflags +faststart source.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 source.mp4
