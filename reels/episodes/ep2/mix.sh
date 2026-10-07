#!/bin/bash
# Voice (original audio) + upbeat music that starts after the hook (~2.4 s), at ~12%, then loudness to -14 LUFS.
set -e
cd "$(dirname "$0")"
VID=${1:-renders/reel.mp4}
ffmpeg -v error -y -i "$VID" -i source.mp4 -i audio/music.mp3 -filter_complex \
 "[1:a]aresample=48000,highpass=f=70[v];
  [2:a]aresample=48000,atrim=0:53.6,asetpts=PTS-STARTPTS,volume=0.12,afade=t=in:d=0.6,afade=t=out:st=52.1:d=1.5,adelay=2350|2350[m];
  [v][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/reel_mix.mp4
echo "out/reel_mix.mp4"
