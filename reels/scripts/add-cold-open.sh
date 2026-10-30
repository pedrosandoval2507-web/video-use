#!/bin/bash
# Variation 4: a cold open. Copies a strong moment of the finished edit (start..end, in seconds)
# to the front as a second hook, then a white flash + woosh and the whole video from the start,
# so the moment plays twice. The body is identical to the input, so V4 vs. the input is a clean A/B
# test of the hook. Usage: add-cold-open.sh <in.mp4> <start> <end> <out.mp4>
set -e
IN=$1; A=$2; B=$3; OUT=$4
SFX=$(dirname "$0")/../assets/sfx
D=$(awk -v a="$A" -v b="$B" 'BEGIN { printf "%.3f", b - a }')
VF=$(awk -v d="$D" 'BEGIN { printf "%.3f", d - 0.08 }')
AF=$(awk -v d="$D" 'BEGIN { printf "%.3f", d - 0.05 }')
W=$(awk -v d="$D" 'BEGIN { printf "%d", (d - 0.3) * 1000 }')
ffmpeg -nostdin -v error -y -ss "$A" -t "$D" -i "$IN" -i "$IN" -i "$SFX/woosh.wav" -filter_complex "
  [0:v]setpts=PTS-STARTPTS,fade=t=out:st=$VF:d=0.08:color=white[hv];
  [0:a]asetpts=PTS-STARTPTS,afade=t=out:st=$AF:d=0.05[ha];
  [1:v]fade=t=in:st=0:d=0.12:color=white[bv];
  [hv][ha][bv][1:a]concat=n=2:v=1:a=1[v][ca];
  [2:a]aresample=48000,volume=0.3,adelay=$W|$W[w];
  [ca][w]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
