"""python3 tools/build.py  ->  dist/The_Mela_Before_Sunset.html: one self-contained file to share
(story + game: CSS, fonts, images, audio and JS all inlined).

Also regenerates js/story/layout.js from js/story/layout.json. The website itself (index.html + the folders next to it)
needs no build: Vercel serves the project folder as it is.
"""
import base64, re, os, json
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); os.chdir(ROOT)
def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
MIME = {'.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg'}
def data_uri(p): return f"data:{MIME[os.path.splitext(p)[1]]};base64,{b64(p)}"

# layout editor defaults
lay = json.load(open('js/story/layout.json'))
open('js/story/layout.js', 'w').write('window.LAYOUT_DEFAULT = ' + json.dumps(lay) + ';\n')

html = open('index.html').read()

# CSS: inline every url(../assets/...) as a data URI
def inline_css(path):
    css = open(path).read()
    return re.sub(r"url\(\.\./(assets/[^)]+)\)", lambda m: f"url({data_uri(m.group(1))})", css)
for href in re.findall(r'<link rel="stylesheet" href="([^"]+)">', html):
    html = html.replace(f'<link rel="stylesheet" href="{href}">', '<style>' + inline_css(href) + '</style>')
html = html.replace('<link rel="icon" href="favicon.svg">', f'<link rel="icon" href="{data_uri("favicon.svg")}">')

# window.EMBED: story images/audio by bare name (engine.js imgURL/auURL), game files as 'game/<path>' (GA() in markup.js)
emb = {}
for f in sorted(os.listdir('assets/story')):
    if f.endswith('.webp'): emb[os.path.splitext(f)[0]] = data_uri('assets/story/' + f)
# MP3 in the single file: it gets emailed/shared and must play everywhere, including iOS Safari (no Ogg decoding there)
for f in sorted(os.listdir('assets/audio')):
    if f.endswith('.mp3'): emb[os.path.splitext(f)[0]] = data_uri('assets/audio/' + f)
for f in sorted(os.listdir('assets/game')):
    if os.path.splitext(f)[1] in ('.webp', '.png'): emb['game/' + f] = data_uri('assets/game/' + f)
vo = 'assets/game/vo'
if os.path.isdir(vo):
    for f in sorted(os.listdir(vo)):
        if f.endswith('.mp3'): emb['game/vo/' + f] = data_uri(f'{vo}/{f}')

scripts = re.findall(r'<script src="([^"]+)"></script>', html)
for js in scripts:
    pre = '<script>window.EMBED=' + json.dumps(emb) + ';</script>\n' if js.endswith('story/engine.js') else ''
    html = html.replace(f'<script src="{js}"></script>', pre + '<script>' + open(js).read().replace('</script', '<\\/script') + '</script>')
os.makedirs('dist', exist_ok=True)
open('dist/The_Mela_Before_Sunset.html', 'w').write(html)
print('dist/The_Mela_Before_Sunset.html', round(len(html) / 1e6, 1), 'MB ·', len(emb), 'embedded files')
