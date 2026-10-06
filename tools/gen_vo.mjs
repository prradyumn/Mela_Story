// tools/gen_vo.mjs: makes every game voice line with Gemini TTS from the terminal (the same requests as voice_studio.html:
// same model, voices, prompt format and spoken number words). Writes _source/game_vo_masters/<id>.wav, skipping files already there.
//   GEMINI_API_KEY=... node tools/gen_vo.mjs [--force] [id ...]      then: tools/convert_vo.sh
// The key comes only from the environment; never write it into a file in this folder.
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_source/game_vo_masters');   // .wav masters (not part of the app); tools/convert_vo.sh makes the ogg/mp3
const KEY = process.env.GEMINI_API_KEY; if (!KEY) { console.error('set GEMINI_API_KEY'); process.exit(1); }
const MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-tts';

// voices + director's notes: keep in step with tools/voice_studio.html
const studio = fs.readFileSync(path.join(ROOT, 'tools/voice_studio.html'), 'utf8');
const VOICE = eval('(' + studio.match(/const DEFAULT = (\{[^}]*\})/)[1] + ')');
const PROFILE = eval('(' + studio.match(/const PROFILE = (\{[\s\S]*?\n\});/)[1] + ')');

// every game level's lines (same list as the Voice Studio: L1 + L2 …); numbers are spoken with LEVEL1.spoken()
const win = {}, ctx = vm.createContext({ window: win });
for (const f of ['level1.js', 'level2.js']) { const p = path.join(ROOT, 'js/game/data', f); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx); }
const D = win.LEVEL1;
const ALL = [...D.allLines(), ...(win.LEVEL2 ? win.LEVEL2.allLines() : [])];
const args = process.argv.slice(2), force = args.includes('--force'), only = args.filter(a => !a.startsWith('--'));
const lines = ALL.filter(l => !only.length || only.includes(l.id));

const prompt = l => { const p = PROFILE[l.who]; return `# AUDIO PROFILE: ${p.name}\n${p.persona}\n### DIRECTOR'S NOTES\nStyle: ${p.style}\n#### TRANSCRIPT\n${D.spoken(l.text)}`; };
const wav = (pcm, rate) => { const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40); return Buffer.concat([h, pcm]); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Gemini TTS ends every clip with a ~120-190 ms loud, DC-offset burst after the speech (heard as a "thud" when a line ends).
// Cut it, and the silence before it stays: a final loud run of <= 300 ms that follows >= 150 ms of silence (10 ms windows, -40 dB).
function stripEndBurst(pcm, rate) {
  const s = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1), win = Math.round(rate / 100), nW = Math.floor(s.length / win);
  const db = i => { let e = 0; for (let j = i * win; j < (i + 1) * win; j++) e += (s[j] / 32768) ** 2; return 10 * Math.log10(Math.max(1e-12, e / win)); };
  let k = nW - 1, b = 0, g = 0;
  while (k >= 0 && db(k) > -40) { b++; k--; }
  while (k >= 0 && db(k) <= -40) { g++; k--; }
  return (b > 0 && b <= 30 && g >= 15) ? pcm.subarray(0, (nW - b) * win * 2) : pcm;
}

async function tts(l) {
  const body = { contents: [{ parts: [{ text: prompt(l) }] }],
    generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE[l.who] } } } } };
  for (let a = 0; a < 8; a++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY }, body: JSON.stringify(body) }).catch(e => ({ ok: false, status: 0, json: async () => ({ error: { message: String(e) } }) }));
    const j = await r.json().catch(() => ({}));
    if (r.status === 429 || r.status >= 500 || r.status === 0) {
      const d = (j.error?.details || []).find(x => x.retryDelay); const w = d ? (parseFloat(d.retryDelay) + 1) * 1000 : 6000 * (a + 1);
      console.log(`  ${l.id}: ${r.status} ${j.error?.message?.slice(0, 80) || ''}, retry in ${Math.round(w / 1000)} s`); await sleep(w); continue;
    }
    if (!r.ok) throw new Error(`${l.id}: ${j.error?.message || r.status}`);
    const part = j.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part) { console.log(`  ${l.id}: no audio (${j.candidates?.[0]?.finishReason}), retrying`); await sleep(3000); continue; }
    const rate = parseInt((part.inlineData.mimeType.match(/rate=(\d+)/) || [])[1] || '24000', 10);
    return wav(stripEndBurst(Buffer.from(part.inlineData.data, 'base64'), rate), rate);
  }
  throw new Error(`${l.id}: gave up after 8 tries`);
}

fs.mkdirSync(OUT, { recursive: true });
const todo = lines.filter(l => force || !fs.existsSync(path.join(OUT, l.id + '.wav')));
console.log(`${lines.length} lines, ${todo.length} to make (model ${MODEL}, voices ${JSON.stringify(VOICE)})`);
let i = 0, fail = [];
await Promise.all([0, 1, 2].map(async () => {
  while (i < todo.length) { const l = todo[i++];
    try { fs.writeFileSync(path.join(OUT, l.id + '.wav'), await tts(l)); console.log(`ok ${l.id}  (${l.who}) ${D.spoken(l.text).slice(0, 70)}`); }
    catch (e) { fail.push(l.id); console.log('FAIL', e.message); }
  }
}));
console.log(fail.length ? 'failed: ' + fail.join(' ') : 'all done');
