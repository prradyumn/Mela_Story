"""python3 build.py  ->  dist/The_Mela_Before_Sunset.html: one self-contained file to share (images, fonts, audio, JS inlined).

Also regenerates layout.js from layout.json. The website itself (index.html + files next to it) needs no build:
Vercel serves this folder as it is.
"""
import base64, re, os, json
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()

lay = json.load(open('layout.json'))
open('layout.js', 'w').write('window.LAYOUT_DEFAULT = ' + json.dumps(lay) + ';\n')
html = open('index.html').read()
scripts = re.findall(r'<script src="([^"]+)"></script>', html)

css = open('style.css').read()
css = re.sub(r"url\(f/([^)]+)\)", lambda m: f"url(data:font/woff2;base64,{b64('f/' + m.group(1))})", css)
css = re.sub(r"url\(a/([^)]+)\)", lambda m: f"url(data:image/webp;base64,{b64('a/' + m.group(1))})", css)
emb = {}
for f in sorted(os.listdir('a')):
    if f.endswith('.webp'): emb[os.path.splitext(f)[0]] = 'data:image/webp;base64,' + b64('a/' + f)
# MP3 in the single file: it gets emailed/shared and must play everywhere, including iOS Safari (no Ogg decoding there)
for f in sorted(os.listdir('au')):
    if f.endswith('.mp3'): emb[os.path.splitext(f)[0]] = 'data:audio/mpeg;base64,' + b64('au/' + f)
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
html = html.replace('<link rel="icon" href="favicon.svg">', f'<link rel="icon" href="data:image/svg+xml;base64,{b64("favicon.svg")}">')
for js in scripts:
    pre = '<script>window.EMBED=' + json.dumps(emb) + ';</script>\n' if js == 'engine.js' else ''
    html = html.replace(f'<script src="{js}"></script>', pre + '<script>' + open(js).read() + '</script>')
os.makedirs('dist', exist_ok=True)
open('dist/The_Mela_Before_Sunset.html', 'w').write(html)
print('dist/The_Mela_Before_Sunset.html', round(len(html) / 1e6, 1), 'MB')
