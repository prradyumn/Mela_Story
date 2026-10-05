#!/bin/bash
# Makes small .ogg + .mp3 copies of the Voice Studio .wav files (the game prefers them; .wav still works).
cd "$(dirname "$0")/../assets/vo" || exit 1
for f in *.wav; do b="${f%.wav}"
  ffmpeg -loglevel error -y -i "$f" -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5" -ar 44100 -c:a libvorbis -q:a 5 "$b.ogg"
  ffmpeg -loglevel error -y -i "$b.ogg" -c:a libmp3lame -q:a 4 "$b.mp3"
done
echo "done: $(ls *.ogg | wc -l) lines"
