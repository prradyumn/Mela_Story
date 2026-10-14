// tools/gen_narr_el.mjs: re-voices the NARRATOR (t0 title, n1–n4, x1 badge) with ElevenLabs (Oct 2026 feedback: "the narrator's
// accent needs to be Indianized"). Voice "Tripti – Kids Moral & Folk Tale Voice" (Indian storyteller; picked by an accent classifier
// from 12 Indian narrator voices), model eleven_multilingual_v2 (keeps the voice's own Indian accent).
// Writes _source/narr_el_masters/<id>.mp3 and assets/audio/<id>.mp3 + .ogg (same trim + -16 LUFS + codecs as the story voices).
//   ELEVENLABS_API_KEY=... node tools/gen_narr_el.mjs [id ...]        (key from the environment only, never a file here)
// After n1 changes, re-time the hookA montage cuts to its word times (story.js, hookA).
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { execFileSync } from 'child_process'; import { fileURLToPath } from 'url'; import { indic } from './indic_words.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('set ELEVENLABS_API_KEY'); process.exit(1); }
const VOICE = process.env.NARR_VOICE || 'AENoBp8y6Xe7vGqG1oj4', MODEL = 'eleven_multilingual_v2';
const MAST = path.join(ROOT, '_source/narr_el_masters'); fs.mkdirSync(MAST, { recursive: true });
const story = fs.readFileSync(path.join(ROOT, 'js/story/story.js'), 'utf8');
const TXT = eval('(' + story.match(/const TXT = (\{[\s\S]*?\n\});/)[1] + ')');
const win = {}; vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/game/data/level1.js'), 'utf8'), { window: win });
const LINES = { t0: 'The Mela Before Sunset.', n1: TXT.n1, n2: TXT.n2, n3: TXT.n3, n4: TXT.n4, x1: 'You are Apnapur’s Smart Guess Star!' };
const say = t => indic(win.LEVEL1.spoken(t.replace(/[’‘]/g, "'"))).replace(/\bsix लाख rupees\b/, 'सिक्स लाख रुपीज़');   // same Indian number style as Pari   // Indian names/words in Devanagari (Mela, Panchayat…)
const FILT = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5:LRA=11';
const TAKES = +(process.env.TAKES || 0);   // TAKES=n: n alternative takes per id into _source/narr_el_masters/_takes/<id>_<k>.mp3 (no conversion)
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(LINES);
/* SENTENCES=1 (used for n1, user's pick Oct 2026): long lines are recorded sentence by sentence — each with its neighbours as
   previous_text / next_text so the joins flow — trimmed and joined with 0.45 s pauses. Read in one go, the 5-sentence n1 came out
   in a different "audiobook" rhythm than her short lines. Writes the joined master + converts. */
if (process.env.SENTENCES) {
  for (const id of ids) {
    const S = say(LINES[id]).match(/[^.!?]+[.!?]+/g).map(x => x.trim()), parts = [];
    for (let i = 0; i < S.length; i++) {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_192`, { method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: S[i], model_id: MODEL, previous_text: S.slice(0, i).join(' ') || undefined, next_text: S.slice(i + 1).join(' ') || undefined,
          voice_settings: { stability: 0.55, similarity_boost: 0.9, style: 0.25, use_speaker_boost: true } }) });
      if (!r.ok) { console.error(id, r.status, (await r.text()).slice(0, 200)); process.exit(1); }
      const raw = path.join(MAST, `_${id}_s${i}.mp3`), wav = path.join(MAST, `_${id}_s${i}.wav`); fs.writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse', '-ar', '44100', '-ac', '1', wav]);
      parts.push(wav); fs.unlinkSync(raw);
    }
    const gap = path.join(MAST, '_gap.wav'); execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-t', '0.45', '-i', 'anullsrc=r=44100:cl=mono', gap]);
    const ins = parts.flatMap((p, i) => i ? ['-i', gap, '-i', p] : ['-i', p]), n = parts.length * 2 - 1;
    execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', `concat=n=${n}:v=0:a=1`, '-c:a', 'libmp3lame', '-b:a', '192k', path.join(MAST, id + '.mp3')]);
    [...parts, gap].forEach(f => fs.unlinkSync(f));
    const src = path.join(MAST, id + '.mp3'), tmp = path.join(MAST, `_${id}.wav`), out = path.join(ROOT, 'assets/audio', id);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-af', FILT, '-ar', '44100', '-ac', '1', tmp]);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '48k', out + '.mp3']);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libopus', '-b:a', '32k', '-vbr', 'on', '-application', 'voip', out + '.ogg']);
    fs.unlinkSync(tmp); console.log('ok (sentence by sentence)', id);
  }
  process.exit(0);
}
if (TAKES) { const T = path.join(MAST, '_takes'); fs.mkdirSync(T, { recursive: true });
  for (const id of ids) for (let k = 1; k <= TAKES; k++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_192`, { method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: say(LINES[id]), model_id: MODEL, voice_settings: { stability: 0.55, similarity_boost: 0.9, style: 0.25, use_speaker_boost: true } }) });
    if (!r.ok) { console.error(id, r.status, (await r.text()).slice(0, 200)); process.exit(1); }
    fs.writeFileSync(path.join(T, `${id}_${k}.mp3`), Buffer.from(await r.arrayBuffer())); console.log('take', id, k);
  }
  process.exit(0); }
for (const id of ids) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_192`, { method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: say(LINES[id]), model_id: MODEL, voice_settings: { stability: 0.55, similarity_boost: 0.9, style: 0.25, use_speaker_boost: true } }) });
  if (!r.ok) { console.error(id, r.status, (await r.text()).slice(0, 200)); process.exit(1); }
  const src = path.join(MAST, id + '.mp3'), tmp = path.join(MAST, `_${id}.wav`), out = path.join(ROOT, 'assets/audio', id);
  fs.writeFileSync(src, Buffer.from(await r.arrayBuffer()));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-af', FILT, '-ar', '44100', '-ac', '1', tmp]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '48k', out + '.mp3']);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libopus', '-b:a', '32k', '-vbr', 'on', '-application', 'voip', out + '.ogg']);
  fs.unlinkSync(tmp); console.log('ok', id, '—', say(LINES[id]).slice(0, 60));
}
