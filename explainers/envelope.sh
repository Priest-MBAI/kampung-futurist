#!/bin/zsh
# Print voice-band RMS (dB) every 0.25s as a text bar chart: ./envelope.sh clip.mp4
ffmpeg -hide_banner -loglevel error -i "$1" -af "pan=mono|c0=c0+c1,highpass=f=250,lowpass=f=3500,asetnsamples=12000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" -f null - \
 | paste - - | sed -E 's/.*pts_time:([0-9.]+).*RMS_level=(-?[0-9.inf]+).*/\1 \2/' \
 | awk '{n=int(($2+45)/1); if(n<0)n=0; b=""; for(i=0;i<n;i++)b=b "#"; printf "%5.2f %6.1f %s\n",$1,$2,b}'
