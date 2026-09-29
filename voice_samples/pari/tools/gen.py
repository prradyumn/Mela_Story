import json, sys, time, urllib.request
BASE = 'https://ai4bharat-indic-parler-tts.hf.space/gradio_api'
OUT = sys.argv[1]; name = sys.argv[2]; text = sys.argv[3]; tag = sys.argv[4]
desc = (f"{name} speaks in a high-pitched, bright and cheerful voice like a young girl, with an expressive, playful tone "
        "at a moderately fast pace. The recording is very high quality with no background noise.")
def post(u, d): return json.load(urllib.request.urlopen(urllib.request.Request(u, data=json.dumps(d).encode(), headers={'Content-Type': 'application/json'}), timeout=60))
eid = post(f'{BASE}/call/generate_finetuned', {'data': [text, desc]})['event_id']
ev = None
for line in urllib.request.urlopen(f'{BASE}/call/generate_finetuned/{eid}', timeout=300):
    line = line.decode().strip()
    if line.startswith('event:'): ev = line[6:].strip()
    elif line.startswith('data:') and ev in ('complete', 'error'):
        data = json.loads(line[5:])
        if ev == 'error': print(name, 'ERROR', data); sys.exit(1)
        f = data[0]; url = f"{BASE}/file={f['path']}"
        fn = f'{OUT}/{tag}_{name.lower()}.wav'; open(fn, 'wb').write(urllib.request.urlopen(url, timeout=60).read()); print('saved', fn); break
