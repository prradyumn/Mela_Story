import re, sys, glob, os, difflib
from faster_whisper import WhisperModel
TAKES, LINES = sys.argv[1], sys.argv[2]
want = dict(l.rstrip('\n').split('\t', 1) for l in open(LINES) if '\t' in l)
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace('’', "'").replace("'", "").replace('-', ' ')).split()
m = WhisperModel('small.en', device='cpu', compute_type='int8')
for f in sorted(glob.glob(f'{TAKES}/*.wav')):
    lid = os.path.basename(f).split('_')[0]
    segs, _ = m.transcribe(f, beam_size=5, language='en', vad_filter=False)
    hyp = ' '.join(s.text.strip() for s in segs)
    a, b = norm(want[lid]), norm(hyp)
    sm = difflib.SequenceMatcher(None, a, b); errs = sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal')
    print(f"{os.path.basename(f):18s} WER {errs/len(a):5.2f}  | {hyp}")
