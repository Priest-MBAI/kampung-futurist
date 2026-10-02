#!/bin/zsh
# Stitch two Flow clips into the 15s Kampung Futurist sizzle reel.
# Usage: ./edit.sh <clip1_in> <clip1_len> <clip2_in> <clip2_len>
#   *_in  = start offset (s) inside each source clip
#   *_len = seconds kept from each clip; clip1_len + clip2_len - XF must equal 15
set -euo pipefail
cd "${0:A:h}"

C1=clips/clip1-voiddeck.mp4
C2=clips/clip2-kopitiam.mp4
OUT=final/kampung-futurist-15s.mp4
S1=${1:-0}; L1=${2:-7.6}; S2=${3:-0}; L2=${4:-7.6}
XF=0.2                                  # video/audio crossfade length
OFF=$(echo "$L1 - $XF" | bc)            # where clip 2 starts overlapping
CARD=13.6                               # end-card fade-in time
CARDPNG=assets/endcard.png                # rendered by assets/endcard.swift

# Shared "real camera" look: gentle warmth, fine grain, 24fps, 1080p.
LOOK="scale=1920:1080:flags=lanczos,fps=24,eq=saturation=0.95:gamma=1.02,colorbalance=rm=0.03:bm=-0.03,noise=alls=6:allf=t,format=yuv420p"

ffmpeg -y -loglevel error \
  -ss $S1 -t $L1 -i $C1 \
  -ss $S2 -t $L2 -i $C2 \
  -loop 1 -t 15 -i $CARDPNG \
  -filter_complex "
    [0:v]$LOOK,setpts=PTS-STARTPTS[v0];
    [1:v]$LOOK,setpts=PTS-STARTPTS[v1];
    [v0][v1]xfade=transition=fade:duration=$XF:offset=${OFF}[vx];
    [2:v]format=rgba,fade=t=in:st=${CARD}:d=0.4:alpha=1[card];
    [vx][card]overlay=0:0:format=auto,format=yuv420p[v];
    [0:a]asetpts=PTS-STARTPTS[a0];[1:a]asetpts=PTS-STARTPTS[a1];
    [a0][a1]acrossfade=d=${XF},loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=14.75:d=0.25[a]" \
  -map "[v]" -map "[a]" -t 15 -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -ar 48000 -movflags +faststart $OUT

echo "wrote $OUT"
