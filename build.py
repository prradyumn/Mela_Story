"""Build the story from this folder.

  python3 build.py          -> dist/The_Mela_Before_Sunset.html: one self-contained file (images, fonts, audio, JS inlined)
  python3 build.py --web    -> ../web/: static site for Vercel (Ogg Opus audio + MP3 fallback, no layout editor)

Both regenerate layout.js from layout.json first.
"""
import base64, re, os, json, shutil, sys, hashlib
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()

lay = json.load(open('layout.json'))
open('layout.js', 'w').write('window.LAYOUT_DEFAULT = ' + json.dumps(lay) + ';\n')
html = open('index.html').read()
scripts = re.findall(r'<script src="([^"]+)"></script>', html)

if '--web' in sys.argv:
    OUT = os.path.join(HERE, '..', 'web')
    shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
    for d, keep in (('a', ('.webp',)), ('f', ('.woff2',)), ('au', ('.ogg', '.mp3'))):
        os.makedirs(os.path.join(OUT, d))
        for f in sorted(os.listdir(d)):
            if f.endswith(keep): shutil.copy2(os.path.join(d, f), os.path.join(OUT, d, f))
    web_scripts = [s for s in scripts if s != 'editor.js']          # the layout editor is a dev tool; keep it out of production
    for f in ['style.css', 'favicon.svg'] + web_scripts: shutil.copy2(f, os.path.join(OUT, f))
    # cache-bust css/js so a new deploy is never mixed with an old cached file
    ver = lambda f: hashlib.md5(open(f, 'rb').read()).hexdigest()[:8]
    page = html.replace('<script src="editor.js"></script>\n', '')
    for f in ['style.css'] + web_scripts: page = page.replace(f'"{f}"', f'"{f}?v={ver(f)}"')
    open(os.path.join(OUT, 'index.html'), 'w').write(page)
    n = sum(len(fs) for _, _, fs in os.walk(OUT)); size = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(OUT) for f in fs)
    print('web/', n, 'files', round(size / 1e6, 1), 'MB')
    sys.exit()

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
