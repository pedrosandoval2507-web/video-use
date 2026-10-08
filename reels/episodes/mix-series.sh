#!/bin/bash
# Voice + upbeat music that enters after the hook (~12%), loudness -14 LUFS.  usage: ./mix-series.sh ep3
set -e
cd "$(dirname "$0")"
EP=$1
HOOK=$(ffprobe -v error -show_entries format=duration -of csv=p=0 parts/hook_$EP.mov)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $EP/source.mp4)
MS=$(python3 -c "print(int(($HOOK-0.1)*1000))")
LEN=$(python3 -c "print(round($DUR-$HOOK+0.1,2))")
FO=$(python3 -c "print(round($DUR-$HOOK+0.1-1.5,2))")
ffmpeg -v error -y -i $EP/renders/reel.mp4 -i $EP/source.mp4 -i ep2/audio/music.mp3 -filter_complex \
 "[1:a]aresample=48000,highpass=f=70[v];
  [2:a]aresample=48000,atrim=0:$LEN,asetpts=PTS-STARTPTS,volume=0.12,afade=t=in:d=0.6,afade=t=out:st=$FO:d=1.5,adelay=$MS|$MS[m];
  [v][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest $EP/renders/reel_mix.mp4
echo "$EP/renders/reel_mix.mp4"
