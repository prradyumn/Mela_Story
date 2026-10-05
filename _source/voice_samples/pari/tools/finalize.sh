#!/bin/zsh
# finalize.sh <in.wav> <id> <outdir>: Riya +2 semitones, -16 LUFS, then MP3 (80k mono, like the other voices) + Ogg Opus (48k mono)
in=$1; id=$2; out=$3
r=$(python3 -c "print(2**(2/12))"); t=$(python3 -c "print(1/$r)")
sr=$(ffprobe -v error -show_entries stream=sample_rate -of csv=p=0 "$in")
ffmpeg -v error -y -i "$in" -af "asetrate=$sr*$r,aresample=44100,atempo=$t,silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -ac 1 "$out/$id.wav"
ffmpeg -v error -y -i "$out/$id.wav" -c:a libmp3lame -b:a 80k "$out/$id.mp3"
ffmpeg -v error -y -i "$out/$id.wav" -c:a libopus -b:a 48k -vbr on -application audio "$out/$id.ogg"
printf "%s  %.2fs\n" $id $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/$id.mp3")
