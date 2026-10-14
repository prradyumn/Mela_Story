// tools/gen_pari_el.mjs: re-voices every PARI line (game L1–L3 + story p1–p6) with ElevenLabs (Oct 2026, user's pick:
// voice "Gudiya – Innocent Kid Narrator", model eleven_v3, number words spelled in Devanagari so they sound Indian).
// Writes the ElevenLabs mp3 to _source/pari_el_masters/<id>.mp3, then game lines → assets/game/vo/<id>.mp3/.ogg and
// story lines → assets/audio/<id>.mp3/.ogg (same trim + -16 LUFS + codecs as convert_vo.sh). Skips masters that exist.
//   ELEVENLABS_API_KEY=... node tools/gen_pari_el.mjs [--force] [id ...]     (key from the environment only, never a file here)
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { execFileSync } from 'child_process'; import { fileURLToPath } from 'url'; import { indic } from './indic_words.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('set ELEVENLABS_API_KEY'); process.exit(1); }
// WHO=baba (feedback Oct 2026: Baba asks the L3 questions) re-voices every Baba line (story b1 + L3) with "Dr. Sahni" (elderly Indian
// male, warm; eleven_multilingual_v2 keeps his own accent), same Devanagari numbers/words. Default WHO=pari.
const WHO = process.env.WHO || 'pari';
const CFG = { pari: { voice: 'e3FEEanj39p8QCSMe8iV', model: 'eleven_v3', settings: { stability: 0.5 }, story: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], dir: 'pari_el_masters' },
              baba: { voice: 'LuN0fbpldemhhWn9yLaT', model: 'eleven_multilingual_v2', settings: { stability: 0.55, similarity_boost: 0.9, style: 0.25, use_speaker_boost: true }, story: ['b1'], dir: 'baba_el_masters' } }[WHO];
if (process.env.STAB) CFG.settings = { ...CFG.settings, stability: +process.env.STAB };   // e.g. STAB=1 (v3 'Robust') for steadier retakes
const VOICE = CFG.voice, MODEL = CFG.model;
const MAST = path.join(ROOT, '_source', CFG.dir); fs.mkdirSync(MAST, { recursive: true });

const win = {}, ctx = vm.createContext({ window: win });
for (const f of ['level1.js', 'level2.js', 'level3.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/game/data', f), 'utf8'), ctx);
const D = win.LEVEL1;
const story = fs.readFileSync(path.join(ROOT, 'js/story/story.js'), 'utf8');
const TXT = eval('(' + story.match(/const TXT = (\{[\s\S]*?\n\});/)[1] + ')');
const ALL = [...D.allLines(), ...win.LEVEL2.allLines(), ...win.LEVEL3.allLines()].filter(l => l.who === WHO).map(l => ({ id: l.id, text: l.text, game: true }))
  .concat(CFG.story.map(id => ({ id, text: TXT[id], game: false })));

// number words → Devanagari (Indian pronunciation); only the words that came from numbers are touched
const DEV = { zero: 'ज़ीरो', one: 'वन', two: 'टू', three: 'थ्री', four: 'फ़ोर', five: 'फ़ाइव', six: 'सिक्स', seven: 'सेवन', eight: 'एट', nine: 'नाइन', ten: 'टेन',
  eleven: 'इलेवन', twelve: 'ट्वेल्व', thirteen: 'थर्टीन', fourteen: 'फ़ोर्टीन', fifteen: 'फ़िफ़्टीन', sixteen: 'सिक्सटीन', seventeen: 'सेवेंटीन', eighteen: 'एटीन',
  nineteen: 'नाइनटीन', twenty: 'ट्वेंटी', thirty: 'थर्टी', forty: 'फ़ोर्टी', fifty: 'फ़िफ़्टी', sixty: 'सिक्सटी', seventy: 'सेवेंटी', eighty: 'एटी', ninety: 'नाइंटी',
  hundred: 'हंड्रेड', thousand: 'थाउज़ेंड', lakh: 'लाख', lakhs: 'लाख', crore: 'करोड़', rupees: 'रुपीज़', and: 'and' };
const dev = w => w.replace(/[A-Za-z]+/g, x => DEV[x.toLowerCase()] || x);
const U = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
  TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const small = n => n >= 100 ? U[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + small(n % 100) : '') : n < 20 ? U[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + U[n % 10] : '');
// very short lines have no context and the Devanagari number can drift ("Tap 35,000" came out "putty five"): English words there.
// (Oct 2026 feedback "Pari's numbers before level 1 don't sound Indian": L1_teach_nudge is now a Devanagari take picked from --takes, so PLAIN is empty.)
const PLAIN = new Set([]);
// Plain-English lines (no numbers / Indian words) drifted to a different delivery than the Devanagari-number lines (speaker-similarity
// audit, feedback "the girl's VO changes"). Spelling the whole line in Devanagari keeps her one consistent Indian voice.
const FULL_DEVA = {
  L1_oops: 'ऊप्स! ट्राय अगेन. लुक वेयर द रेड ऐरो इज़ ऑन द लाइन.',
  L1_howto_2: 'टैप द नंबर दैट द प्राइस इज़ क्लोज़ेस्ट टू.',
  L3_howto_3: 'चूज़ अबाउट हाउ मच मनी इज़ लेफ़्ट.',
  L3_idle: 'राउंड द बिल फ़र्स्ट. देन टेक इट अवे फ़्रॉम द मनी.',
  L3_oops: 'ऊप्स! ट्राय अगेन. वी आर पेइंग, सो द मनी गेट्स लेस.',
  L3_teach_oops: 'ऊप्स! ट्राय अगेन. वी आर पेइंग, सो द मनी गेट्स लेस.',
  L2_teach_idle: 'ऐड द टू राउंड नंबर्स.',
  L3_teach_idle: 'टेक द राउंड नंबर अवे फ़्रॉम द मनी.',
  L2_howto_3: 'चूज़ द आंसर क्लोज़ेस्ट टू द टोटल.',
  L2_idle: 'थिंक ऑफ़ द राउंड नंबर्स. देन ऐड देम.',
  p4: 'वेल डन! द शॉपकीपर्स सेंट देयर बिल्स टू द पंचायत ऑफ़िस. लेट्स चेक देम.',
  p3: 'कम! लेट्स गो टू द बाज़ार.',
  L3_howto_2: 'ईच टाइम वी पे, द मनी गेट्स लेस. मेक द बिल अ राउंड नंबर इन योर हेड. देन टेक इट अवे.',
  L2_howto_1: 'लुक! सेवन बिल्स ऑन गुड्डू भैयाज़ डेस्क. ईच बिल हैज़ टू प्राइसेज़.',
  L2_oops: 'ऊप्स! ट्राय अगेन. फ़र्स्ट, मेक ईच प्राइस अ राउंड नंबर इन योर हेड.',
};
function say(text, id) {
  if (WHO === 'pari' && FULL_DEVA[id]) return FULL_DEVA[id];
  if (PLAIN.has(id) && !process.argv.includes('--deva')) return indic(D.spoken(text));
  let t = text.replace(/[’‘]/g, "'").replace(/→/g, 'means');
  t = t.replace(/₹\s?([\d,]+)/g, (_, d) => '\u0001' + dev(D.spoken('₹' + d)) + '\u0002');            // amounts: words + rupees
  t = t.replace(/\b\d{1,3}(?:,\d{2,3})+\b/g, d => '\u0001' + dev(D.spoken(d)) + '\u0002');             // 34,000 …
  t = t.replace(/\b\d{1,3}\b/g, d => '\u0001' + dev(small(+d)) + '\u0002');                              // the hundreds digit 8, 22 and 43 …
  t = t.replace(/\u0002 thousand\b/g, ' थाउज़ेंड\u0002').replace(/[\u0001\u0002]/g, '');            // 200 thousand
  return indic(t.replace(/(^|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase()));   // + Indian names/words in Devanagari
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function tts(l) {
  for (let a = 0; a < 6; a++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_192`, { method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: say(l.text, l.id), model_id: MODEL, voice_settings: CFG.settings }) })
      .catch(e => ({ ok: false, status: 0, text: async () => String(e) }));
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    const msg = (await r.text()).slice(0, 160); console.log(`  ${l.id}: ${r.status} ${msg}`);
    if (r.status === 401 || r.status === 402 || r.status === 400) throw new Error(msg);
    await sleep(4000 * (a + 1));
  }
  throw new Error(l.id + ': gave up');
}
const FILT = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5:LRA=11';
function convert(l) {
  const src = path.join(MAST, l.id + '.mp3'), tmp = path.join(MAST, `_${l.id}.wav`), out = path.join(ROOT, l.game ? 'assets/game/vo' : 'assets/audio', l.id);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-af', FILT, '-ar', '44100', '-ac', '1', tmp]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '48k', out + '.mp3']);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libopus', '-b:a', '32k', '-vbr', 'on', '-application', 'voip', out + '.ogg']);
  fs.unlinkSync(tmp);
}

const args = process.argv.slice(2), force = args.includes('--force'), only = args.filter(a => !a.startsWith('--'));
if (args.includes('--list')) { for (const l of ALL) console.log(l.id, '|', say(l.text, l.id)); process.exit(0); }
// --takes N id…: N alternative takes per line into _source/pari_el_masters/_takes/<id>_<k>.mp3 (nothing converted) — pick the most
// Indian-sounding take that transcribes clean, then --use id=k promotes it to the master + game files.
const takesN = +(args.find(a => a.startsWith('--takes='))?.split('=')[1] || 0);
if (takesN) { const T = path.join(MAST, '_takes'); fs.mkdirSync(T, { recursive: true });
  for (const l of ALL.filter(l => only.includes(l.id))) for (let k = 1; k <= takesN; k++) { fs.writeFileSync(path.join(T, `${l.id}_${k}.mp3`), await tts(l)); console.log('take', l.id, k); }
  process.exit(0); }
const uses = args.filter(a => a.startsWith('--use=')).map(a => a.slice(6).split('='));
if (uses.length) { for (const [id, k] of uses) { const l = ALL.find(x => x.id === id); fs.copyFileSync(path.join(MAST, '_takes', `${id}_${k}.mp3`), path.join(MAST, id + '.mp3')); convert(l); console.log('use', id, k); } process.exit(0); }
const todo = ALL.filter(l => (!only.length || only.includes(l.id)) && (force || !fs.existsSync(path.join(MAST, l.id + '.mp3'))));
console.log(`${todo.length} of ${ALL.length} Pari lines`);
let next = 0;
await Promise.all([0, 1, 2].map(async () => { while (next < todo.length) { const l = todo[next++];
  fs.writeFileSync(path.join(MAST, l.id + '.mp3'), await tts(l)); convert(l); console.log('ok', l.id); } }));
