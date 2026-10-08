// tools/gen_story_vo.mjs: re-voices story lines (TXT in js/story/story.js) with Gemini TTS, in the story voices
// (narrator Sulafat, Baba Algenib, Guddu Fenrir, Pari Leda, Aaru Puck). Writes _source/story_vo_masters/<id>.wav,
// strips the TTS end burst, then makes assets/audio/<id>.mp3 (48k mono) + .ogg (Opus 32k) at -16 LUFS.
//   GEMINI_API_KEY=... node tools/gen_story_vo.mjs n1 n2 …      (key from the environment only)
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { execFileSync } from 'child_process'; import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('set GEMINI_API_KEY'); process.exit(1); }
const story = fs.readFileSync(path.join(ROOT, 'js/story/story.js'), 'utf8');
const TXT = eval('(' + story.match(/const TXT = (\{[\s\S]*?\n\});/)[1] + ')');
const win = {}; vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/game/data/level1.js'), 'utf8'), { window: win });
const spoken = win.LEVEL1.spoken;
const P = {
  n: { voice: 'Sulafat', name: 'Narrator', persona: 'A warm storyteller narrating an animated story for Grade 6 children in an Indian village.', style: 'Warm, clear and friendly, gently excited, natural Indian English accent, unhurried; a smile in the voice.' },
  b: { voice: 'Algenib', name: 'Baba', persona: 'A kind, wise village elder of Apnapur who looks after the Mela money.', style: 'Warm, slow and grandfatherly, deep and steady, Indian English accent.' },
  g: { voice: 'Fenrir', name: 'Guddu Bhaiya', persona: 'A kind but slow young clerk at the village Panchayat office who adds every number digit by digit in his big notebook.', style: 'Flustered and a little comic, Indian English accent; amazed when surprised, proud when he finishes.' },
  p: { voice: 'Leda', name: 'Pari', persona: 'A cheerful, clever 11-year-old girl from a village in India who is helping get the Mela ready before sunset.', style: 'Warm, bright and encouraging, natural Indian English accent, clear and a little slower on numbers.' },
  r: { voice: 'Puck', name: 'Aaru', persona: 'An excitable 8-year-old boy who loves the Mela.', style: 'Bouncy, gleeful and fast, Indian English accent. "Yayy!" is his happy cheer — say it with a big grin.' }
};
const OUTW = path.join(ROOT, '_source/story_vo_masters'); fs.mkdirSync(OUTW, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
function strip(pcm, rate) { const s = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1), w = Math.round(rate / 100), n = Math.floor(s.length / w);
  const db = i => { let e = 0; for (let k = i * w; k < (i + 1) * w; k++) e += (s[k] / 32768) ** 2; return 10 * Math.log10(Math.max(1e-12, e / w)); };
  let k = n - 1, b = 0, g = 0; while (k >= 0 && db(k) > -40) { b++; k--; } while (k >= 0 && db(k) <= -40) { g++; k--; }
  return (b > 0 && b <= 30 && g >= 15) ? pcm.subarray(0, (n - b) * w * 2) : pcm; }
const wav = (pcm, rate) => { const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40); return Buffer.concat([h, pcm]); };
for (const id of process.argv.slice(2)) {
  const p = P[id[0]], text = spoken(TXT[id].replace(/[’‘]/g, "'"));
  const prompt = `# AUDIO PROFILE: ${p.name}\n${p.persona}\n### DIRECTOR'S NOTES\nStyle: ${p.style}\n#### TRANSCRIPT\n${text}`;
  const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: p.voice } } } } };
  for (let a = 0; a < 8; a++) {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({})); const part = j.candidates?.[0]?.content?.parts?.find(x => x.inlineData);
    if (!part) { console.log(`  ${id}: ${r.status} retry`); await sleep(5000 * (a + 1)); continue; }
    const rate = parseInt((part.inlineData.mimeType.match(/rate=(\d+)/) || [])[1] || '24000', 10);
    const f = path.join(OUTW, id + '.wav'); fs.writeFileSync(f, wav(strip(Buffer.from(part.inlineData.data, 'base64'), rate), rate));
    const tmp = path.join(OUTW, '_n.wav');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', f, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '1', tmp]);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '48k', path.join(ROOT, 'assets/audio', id + '.mp3')]);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libopus', '-b:a', '32k', '-vbr', 'on', '-application', 'voip', path.join(ROOT, 'assets/audio', id + '.ogg')]);
    fs.unlinkSync(tmp); console.log('ok', id, '—', text.slice(0, 70)); break;
  }
}
