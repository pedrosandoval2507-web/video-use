set -e
cd /home/user/fan/src
mk(){ # name src start dur
 ffmpeg -v error -y -ss $3 -t $4 -i $2.mp4 -filter_complex "[0:v]crop=328:470:28:72,split[a][b];[a]scale=576:1024:force_original_aspect_ratio=increase,crop=576:1024,boxblur=20:2,eq=brightness=-0.25[bg];[b]scale=560:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2+20,fps=30,setsar=1" -an -c:v libx264 -preset veryfast -crf 18 $1.mp4
}
mk F1 v1 0.2 2.6; mk F2 v1 3.6 2.2; mk F3 v1 7.0 1.2
mk F4 v2 0.5 4.0; mk F5 v2 5.0 4.0; mk F6 v2 9.0 5.0; mk F7 v2 15.0 4.0; mk F8 v2 19.0 6.5
mk F9 v3 0.0 4.0; mk F10 v3 4.0 4.5; mk F11 v3 9.0 3.0; mk F12 v3 13.0 4.5; mk F13 v3 18.0 2.5
