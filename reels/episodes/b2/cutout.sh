#!/bin/bash
# AI cut-out of the presenter only inside the windows listed in <ep>/plan.json.  usage: ./cutout.sh ep04 [ep05 ...]
cd "$(dirname "$0")"
for EP in "$@"; do
  mkdir -p $EP/cutout
  python3 -c "import json;[print(k,a,d) for k,(a,d) in enumerate(json.load(open('$EP/plan.json'))['clips'])]" | while read k a d; do
    [ -s $EP/cutout/w$k.mov ] && continue
    ffmpeg -nostdin -v error -y -ss $a -i $EP/source.mp4 -t $d -an -c:v libx264 -crf 14 -preset fast $EP/cutout/w$k.mp4
    npx --prefix ../ep2 hyperframes remove-background $EP/cutout/w$k.mp4 -o $EP/cutout/w$k.mov > $EP/cutout/w$k.log 2>&1 < /dev/null
    echo "$EP w$k $(tail -1 $EP/cutout/w$k.log)"
  done
done
