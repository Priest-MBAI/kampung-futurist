#!/bin/zsh
# Copy each newly completed Flow download (Chrome leaves them as .com.google.Chrome.* temp names)
# into clips/incoming/, once ffprobe confirms it's a playable video. Runs for up to 90 minutes.
setopt nullglob
IN="${0:A:h}/clips/incoming"; SEEN="$IN/.seen"; touch "$SEEN"
end=$((SECONDS + 5400))
while (( SECONDS < end )); do
  for f in ~/Downloads/.com.google.Chrome.* ~/Downloads/*.mp4; do
    grep -qxF "$f:$(stat -f %z "$f")" "$SEEN" && continue
    d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)
    v=$(ffprobe -v error -select_streams v -show_entries stream=width -of csv=p=0 "$f" 2>/dev/null)
    if [[ -n "$v" && "${d%.*}" -ge 5 ]]; then
      out="$IN/$(date +%H%M%S)-${v}w.mp4"; cp "$f" "$out"; echo "$f:$(stat -f %z "$f")" >> "$SEEN"; echo "saved $out ($d s)"
    fi
  done
  sleep 5
done
