# Pari voice: Indic Parler-TTS "Riya", +2 semitones (chosen, not yet swapped in)

Status: p1 and p2 are done and staged in `../final/`, and Whisper confirmed both match the script word for word.
p3 to p6 are still to generate. Until all six exist, the story keeps the Gemini "Leda" voice.

1. `gen.py <outdir> Riya "<text>" <id>_t1` generates a take through the public AI4Bharat Space
   (anonymous users get about 90s of ZeroGPU a day; a Hugging Face login gives more). You can also run it locally,
   but the model is gated: accept the terms at huggingface.co/ai4bharat/indic-parler-tts and run `hf auth login`.
   Text for every line is in `lines.tsv`. p6 spells out "eighty-four thousand rupees".
2. `pick.py <takesdir> lines.tsv` uses faster-whisper small.en to score each take against the script. Keep the lowest-WER take.
3. `finalize.sh <take.wav> <id> <outdir>` applies +2 semitones, trims silence, normalises to -16 LUFS,
   and writes the `.mp3` (80k) and `.ogg` (Opus 48k).
4. Back up the current `au/p1..p6.{mp3,ogg}`, copy in the new files, update CLAUDE.md §9
   (Pari = Indic Parler-TTS Riya +2st), then run `python3 build.py` (the website needs no build).
