#!/bin/bash
# tools/convert_vo.sh — turns the Voice Studio .wav files in assets/game/vo into the same formats as the story voices:
# trimmed, -16 LUFS, MP3 80k mono (+ single-file build) and Ogg Opus 48k mono (loaded first). The .wav files can stay.
cd "$(dirname "$0")/../assets/game/vo" || exit 1
for f in *.wav; do b="${f%.wav}"
  ffmpeg -v error -y -i "$f" -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -ac 1 "/tmp/$b.wav"
  ffmpeg -v error -y -i "/tmp/$b.wav" -c:a libmp3lame -b:a 80k "$b.mp3"
  ffmpeg -v error -y -i "/tmp/$b.wav" -c:a libopus -b:a 48k -vbr on -application audio "$b.ogg"
done
echo "done: $(ls *.ogg 2>/dev/null | wc -l) lines"
