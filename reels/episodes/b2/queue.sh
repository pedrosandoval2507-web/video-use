#!/bin/bash
# Build -> render -> mix each episode in order (waits for its cut-outs).  usage: ./queue.sh ep02 ep03 ...
cd "$(dirname "$0")"
for EP in "$@"; do
  n=$(python3 -c "import json;print(len(json.load(open('$EP/plan.json'))['clips']))")
  for k in $(seq 0 $((n-1))); do while [ ! -s $EP/cutout/w$k.mov ] || ! grep -q -i "removed\|done\|wrote" $EP/cutout/w$k.log 2>/dev/null; do sleep 20; done; done
  node build.mjs $EP > $EP/build.log 2>&1 || { echo "$EP build failed"; continue; }
  mkdir -p $EP/renders
  (cd $EP/final && npx --prefix ../../../ep2 hyperframes render . -o ../renders/reel.mp4 -q delivery --workers 2 > ../renders/render.log 2>&1)
  rm -rf /tmp/hyperframes-extract-cache-0
  python3 -I mix.py $EP >> queue.log 2>&1 && echo "$EP done $(date +%T)" >> queue.log
done
