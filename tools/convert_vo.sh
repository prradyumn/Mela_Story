#!/bin/bash
# tools/convert_vo.sh — turns the Voice Studio .wav masters (_source/game_vo_masters) into the formats the game loads:
# trimmed, -16 LUFS, MP3 56k mono (fallback + single-file build) and Ogg Opus 48k mono (loaded first), into assets/game/vo.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; OUT="$ROOT/assets/game/vo"; mkdir -p "$OUT"
cd "$ROOT/_source/game_vo_masters" || exit 1
for f in *.wav; do b="${f%.wav}"
  ffmpeg -v error -y -i "$f" -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -ac 1 "/tmp/$b.wav"
  ffmpeg -v error -y -i "/tmp/$b.wav" -c:a libmp3lame -b:a 56k "$OUT/$b.mp3"
  ffmpeg -v error -y -i "/tmp/$b.wav" -c:a libopus -b:a 48k -vbr on -application audio "$OUT/$b.ogg"
done
echo "done: $(ls "$OUT"/*.ogg 2>/dev/null | wc -l) lines"
