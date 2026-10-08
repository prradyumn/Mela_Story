"""tools/optimize_webp.py — WebP size pass (Oct 2026, run 2). Re-encodes from the originals where they exist; keeps a file only
when the new one is smaller. Masters: _source/asset_masters (story/game), _source/l3_asset_pack (L3), the sprite sheets in _source.
  frames  : max on-screen height × ~1.1, q70        backgrounds : 1.5× (1620 tall), q78 (from the 2× originals)
  L3 art  : lanes q76, sprite sheets q74, rest q80  poses, mouths, L1/L2 art : same size, q76
Poses and their *_m mouth overlays keep identical sizes, so lip-sync stays aligned. Needs Pillow."""
import io, os, glob, re
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); os.chdir(ROOT)
def enc(im, q, aq=80): b = io.BytesIO(); im.save(b, 'WEBP', quality=q, alpha_quality=aq, method=6); return b.getvalue()
def fit(im, H): return im.resize((round(im.width * H / im.height), H), Image.LANCZOS) if H and im.height > H else im
def put(path, data, force=False):
    if force or len(data) < os.path.getsize(path): open(path, 'wb').write(data); return len(data)
    return os.path.getsize(path)
FR = {'pari_explain': 720, 'pari_cheer': 600, 'baba_talk': 690, 'manju_talk': 640, 'guddu_talk': 820, 'pari_walk': 600, 'aaru_run': 520, 'gudiya_trot': None}
before = after = 0
for k, H in FR.items():
    for f in glob.glob(f'assets/story/{k}_*.webp'):
        before += os.path.getsize(f); after += put(f, enc(fit(Image.open(f).convert('RGBA'), H), 70))
for m in glob.glob('_source/asset_masters/story/bg_*.webp'):
    f = 'assets/story/' + os.path.basename(m); before += os.path.getsize(f)
    after += put(f, enc(fit(Image.open(m).convert('RGB'), 1620), 78), force=True)        # 1.5×: always replace (size changes)
for m in glob.glob('_source/l3_asset_pack/*.webp'):
    n = os.path.basename(m); f = 'assets/game/l3/' + n; im = Image.open(m); im = im.convert('RGBA') if im.mode != 'RGB' else im
    before += os.path.getsize(f); after += put(f, enc(im, 76 if 'lane' in n else 74 if 'sheet' in n else 80))
for f in [x for x in glob.glob('assets/story/*.webp') if not re.search(r'_\d+\.webp$', x) and not os.path.basename(x).startswith('bg_')] + glob.glob('assets/game/*.webp'):
    before += os.path.getsize(f); after += put(f, enc(Image.open(f).convert('RGBA'), 76))
print(f'WebP {before/1e6:.2f} MB -> {after/1e6:.2f} MB')
