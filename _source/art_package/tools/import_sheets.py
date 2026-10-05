# Turns the ChatGPT sprite sheets (Mela_Sprite_Sheets/) into story assets in assets/story/:
#  * talking pairs -> a/<key>_<pose>_m.webp: a full-canvas overlay (same size as a/<key>_<pose>.webp) holding only the
#    alternate mouth, registered onto the existing pose and feathered, so lip-sync never moves anything but the mouth.
#  * cycles -> a/<name>_<i>.webp: frames steadied on the head (no sideways wobble), feet on the bottom edge, one shared
#    canvas per cycle. Prints the CH config (frame canvas height in stage px) for engine.js.
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))   # project root (this file is in _source/art_package/tools)
SH = os.path.join(ROOT, '_source', 'Mela_Sprite_Sheets', 'sheets')
A = os.path.join(ROOT, 'assets', 'story')
DEBUG = os.environ.get('DEBUG_DIR')

def cells(name, fw, fh):
    im = Image.open(os.path.join(SH, name + '.png')).convert('RGBA')
    return [im.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh)) for r in range(im.height // fh) for c in range(im.width // fw)]

def bbox(im, t=40):
    return im.split()[3].point(lambda v: 255 if v > t else 0).getbbox()

def place(src, s, dx, dy, size):
    """src scaled by s and moved by (dx, dy), on a transparent canvas of `size`."""
    w, h = round(src.width * s), round(src.height * s)
    c = Image.new('RGBA', size, (0, 0, 0, 0)); c.alpha_composite(src.resize((w, h), Image.LANCZOS), (0, 0)) if False else None
    c.paste(src.resize((w, h), Image.LANCZOS), (round(dx), round(dy)), src.resize((w, h), Image.LANCZOS))
    return c

def arr(im): return np.asarray(im).astype(np.float32)

def register(src, dst, region=None, s0=None, d0=None, rng=10, srng=(0.985, 1.015, 7)):
    """Find scale + translation so src lands on dst (premultiplied colour diff inside `region` of dst)."""
    best = None
    for s in np.linspace(s0 * srng[0], s0 * srng[1], srng[2]):
        w, h = round(src.width * s), round(src.height * s)
        rs = src.resize((w, h), Image.LANCZOS)
        for dy in range(-rng, rng + 1, 2):
            for dx in range(-rng, rng + 1, 2):
                c = Image.new('RGBA', dst.size, (0, 0, 0, 0)); c.alpha_composite(rs, (int(d0[0] + dx), int(d0[1] + dy))) if (d0[0] + dx >= 0 and d0[1] + dy >= 0) else c.paste(rs, (int(d0[0] + dx), int(d0[1] + dy)), rs)
                a, b = arr(c), arr(dst)
                if region: x0, y0, x1, y1 = region; a, b = a[y0:y1, x0:x1], b[y0:y1, x0:x1]
                pa = a[..., :3] * a[..., 3:] / 255; pb = b[..., :3] * b[..., 3:] / 255
                e = np.abs(pa - pb).mean()
                if best is None or e < best[0]: best = (e, s, d0[0] + dx, d0[1] + dy)
    return best

def put(src, s, x, y, size):
    w, h = round(src.width * s), round(src.height * s); rs = src.resize((w, h), Image.LANCZOS)
    c = Image.new('RGBA', size, (0, 0, 0, 0)); c.paste(rs, (int(x), int(y)), rs); return c

# ---------------------------------------------------------------- talking
TALK = ['pari_point', 'pari_happy', 'aaru_shout', 'aaru_jump', 'baba_ask', 'guddu_scratch', 'guddu_surprised', 'guddu_proud']
def talking(name):
    base = Image.open(os.path.join(A, name + '.webp')).convert('RGBA')
    f0, f1 = cells(name + '_talk', 1024, 1536)
    bb, b0 = bbox(base), bbox(f0)
    s = (bb[3] - bb[1]) / (b0[3] - b0[1])
    d = (bb[0] - b0[0] * s, bb[1] - b0[1] * s)
    head = (bb[0], bb[1], bb[2], bb[1] + int((bb[3] - bb[1]) * .32))
    # coarse on the whole figure, fine on the head (where the mouth lives)
    e, s, x, y = register(f0, base, None, s, d, rng=12)
    e, s, x, y = register(f0, base, head, s, (x, y), rng=4, srng=(0.995, 1.005, 5))
    A0 = put(f0, s, x, y, base.size)
    e1, s1, x1, y1 = register(f1, A0, head, s, (x, y), rng=10, srng=(0.99, 1.01, 5))
    A1 = put(f1, s1, x1, y1, base.size)
    # where does the mouth change? the strongest difference between the two frames inside the head
    a0, a1 = arr(A0), arr(A1)
    diff = np.abs(a0[..., :3] - a1[..., :3]).mean(-1) * (np.minimum(a0[..., 3], a1[..., 3]) / 255)
    m = np.zeros_like(diff); x0, y0, x2, y2 = head; m[y0:y2, x0:x2] = diff[y0:y2, x0:x2]
    m = np.asarray(Image.fromarray(np.clip(m, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32)
    cy, cx = np.unravel_index(np.argmax(m), m.shape)
    hw = bb[2] - bb[0]
    return dict(name=name, base=base, A0=A0, A1=A1, err=(e, e1), centre=(int(cx), int(cy)), hw=hw, s=s, head=head)

def mouth_overlay(r, cx, cy, rx, ry):
    W, H = r['base'].size
    F = 26   # the whole mouth stays fully opaque; the feather lives outside it
    mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).ellipse((cx - rx - F, cy - ry - F, cx + rx + F, cy + ry + F), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(F / 2))
    ov = r['A1'].copy(); al = np.asarray(ov.split()[3]).astype(np.float32) * np.asarray(mask).astype(np.float32) / 255
    # only where the base pose has the character too (never paint outside the silhouette)
    al *= np.asarray(r['base'].split()[3]).astype(np.float32) / 255
    ov.putalpha(Image.fromarray(al.astype(np.uint8)))
    return ov

if __name__ == '__main__':
    what = sys.argv[1]
    if what == 'probe':
        for n in TALK:
            r = talking(n); cx, cy = r['centre']
            print(n, 'err', [round(v, 2) for v in r['err']], 'mouth at', r['centre'], 'scale', round(r['s'], 4))
            if DEBUG:
                k = 150; box = (cx - k, cy - k, cx + k, cy + k)
                sheet = Image.new('RGB', (3 * 2 * k, 2 * k), 'white')
                for i, im in enumerate([r['base'], r['A0'], r['A1']]):
                    t = Image.new('RGBA', r['base'].size, (58, 95, 138, 255)); t.alpha_composite(im); sheet.paste(t.crop(box).convert('RGB'), (i * 2 * k, 0))
                sheet.save(os.path.join(DEBUG, f'mouth_{n}.png'))

def mouth_box(r):
    a0, a1 = arr(r['A0']), arr(r['A1'])
    diff = np.abs(a0[..., :3] - a1[..., :3]).mean(-1) * (np.minimum(a0[..., 3], a1[..., 3]) / 255)
    cx, cy = r['centre']; k = 130
    win = np.asarray(Image.fromarray(np.clip(diff, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32)[cy - k:cy + k, cx - k:cx + k]
    ys, xs = np.where(win > win.max() * .3)
    x0, x1, y0, y1 = xs.min() + cx - k, xs.max() + cx - k, ys.min() + cy - k, ys.max() + cy - k
    return (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2 + 22, (y1 - y0) / 2 + 18

def build_talk():
    out = {}
    for n in TALK:
        r = talking(n); cx, cy, rx, ry = mouth_box(r)
        rx, ry = min(rx, 130), min(ry, 130)
        ov = mouth_overlay(r, cx, cy, rx, ry)
        ov.save(os.path.join(A, n + '_m.webp'), 'WEBP', quality=92, alpha_quality=100, method=6)
        out[n] = (round(cx), round(cy), round(rx), round(ry))
        if DEBUG:
            k = 150; box = (int(cx) - k, int(cy) - k, int(cx) + k, int(cy) + k)
            sheet = Image.new('RGB', (4 * k, 2 * k))
            for i, im in enumerate([r['base'], Image.alpha_composite(r['base'], ov)]):
                t = Image.new('RGBA', r['base'].size, (58, 95, 138, 255)); t.alpha_composite(im); sheet.paste(t.crop(box).convert('RGB'), (i * 2 * k, 0))
            sheet.save(os.path.join(DEBUG, f'talk_{n}.png'))
    print(json.dumps(out))

if __name__ == '__main__' and sys.argv[1] == 'talk': build_talk()

# stage px per sheet px: sized so the moving figure matches the standing sprite (see the measurements in the notes)
CYCLES = {  # name: (cell w, cell h, scale to stage px, fps, stride in stage px per frame)
 'pari_walk':   (1024, 1536, 518.4 * .98 / 1436, 8, 26),
 'aaru_run':    (1024, 1536, 436.6 / 1222, 10, 44),
 'gudiya_trot': (1024, 1024, 245 * .92 / 887, 10, 34),
}
def build_cycles():
    cfg = {}
    for name, (fw, fh, f, fps, stride) in CYCLES.items():
        fr = cells(name, fw, fh); shifted = []
        for im in fr:
            a = np.asarray(im)[..., 3] > 40; ys = np.where(a.any(1))[0]; top, bot = ys[0], ys[-1]
            xs = np.where(a[top + 40:top + 160].any(0))[0]; hx = (xs[0] + xs[-1]) / 2
            shifted.append((im, fw / 2 - hx, fh - 1 - bot))   # head centre to the middle, feet to the bottom
        # refine: slide each frame sideways until its face matches frame 0's (the ears/curls fool the width measure)
        q = 4; ref, rdx, rdy = shifted[0]
        r0 = arr(ref.resize((fw // q, fh // q)));  b0 = bbox(ref); hy0, hy1 = b0[1] // q, (b0[1] + int((b0[3] - b0[1]) * .4)) // q
        hx0, hx1 = b0[0] // q, b0[2] // q
        for i in range(1, len(shifted)):
            im, dx, dy = shifted[i]; ri = arr(im.resize((fw // q, fh // q))); best = None
            for sx in range(-100 // q, 100 // q + 1):
                ox = int(round((dx - rdx) / q)) + sx; oy = int(round((dy - rdy) / q))
                sh = np.roll(np.roll(ri, ox, 1), oy, 0)
                a, b = sh[hy0:hy1, hx0:hx1], r0[hy0:hy1, hx0:hx1]
                e = np.abs(a[..., :3] * a[..., 3:] - b[..., :3] * b[..., 3:]).mean() / 255
                if best is None or e < best[0]: best = (e, sx)
            shifted[i] = (im, dx + best[1] * q, dy)
        # one canvas for the whole cycle, centred on the head
        boxes = [bbox(im) for im, _, _ in shifted]
        L = min(b[0] + dx for b, (_, dx, _) in zip(boxes, shifted)); R = max(b[2] + dx for b, (_, dx, _) in zip(boxes, shifted))
        T = min(b[1] + dy for b, (_, _, dy) in zip(boxes, shifted))
        half = max(fw / 2 - L, R - fw / 2) + 6
        W, H = int(2 * half), int(fh - T + 6)
        for i, (im, dx, dy) in enumerate(shifted):
            c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.paste(im, (int(round(dx + half - fw / 2)), int(round(dy - (fh - H)))), im)
            c.save(os.path.join(A, f'{name}_{i}.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
        cfg[name] = dict(n=len(fr), h=round(H * f, 1), fps=fps, stride=stride, size=(W, H))
        if DEBUG:   # onion skin of all frames to check the alignment
            on = Image.new('RGBA', (W, H), (58, 95, 138, 255))
            for i in range(len(fr)):
                im = Image.open(os.path.join(A, f'{name}_{i}.webp')).convert('RGBA'); im.putalpha(im.split()[3].point(lambda v: v * .45)); on.alpha_composite(im)
            on.convert('RGB').resize((W // 3, H // 3)).save(os.path.join(DEBUG, f'onion_{name}.png'))
    print(json.dumps(cfg))

if __name__ == '__main__' and sys.argv[1] == 'cycles': build_cycles()

# ---------------------------------------------------------------- Pari v2 (ludo.ai 6x6 sheets in _source/pari_sprites/)
# sheet_a = explaining (36 frames: 0-4 hands come apart, 5-30 explaining with the mouth moving, 31-35 hands back together)
# sheet_b = walking right (36 frames; 0-6 start from standing, frames 7..26 loop seamlessly: frame 27 ~ frame 7)
PARI2 = os.path.join(ROOT, '_source', 'pari_sprites')
def ludo_frames(sheet):
    base = os.path.join(PARI2, sheet, 'sprite-max-px-frames-36-rows-6-cols-6')
    d = json.load(open(base + '.json')); im = Image.open(base + '.png').convert('RGBA')
    return [im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])) for f in (d['frames'][k]['frame'] for k in sorted(d['frames']))]
FIG = 536   # Pari's standing figure height on stage (pari_point / pari_happy at scale 1)
def build_pari2():
    out = {}
    ex = ludo_frames('sheet_a')                        # already steady: feet fixed, only a gentle sway
    for i, im in enumerate(ex): im.save(os.path.join(A, f'pari_explain_{i}.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
    b = bbox(ex[0]); out['explain'] = dict(n=len(ex), h=round(ex[0].height * FIG / (b[3] - b[1]), 1), lift=round((ex[0].height - b[3]) * FIG / (b[3] - b[1]) * -1, 1))
    wk = ludo_frames('sheet_b')[7:27]                  # the seamless 20-frame loop
    sh = []
    for im in wk:
        a = np.asarray(im)[..., 3] > 40; ys = np.where(a.any(1))[0]; top, bot = ys[0], ys[-1]
        xs = np.where(a[top + 20:top + 120].any(0))[0]; sh.append((im, im.width / 2 - (xs[0] + xs[-1]) / 2, im.height - 1 - bot))
    boxes = [bbox(im) for im, _, _ in sh]; fw, fh = wk[0].size
    L = min(bx[0] + dx for bx, (_, dx, _) in zip(boxes, sh)); R = max(bx[2] + dx for bx, (_, dx, _) in zip(boxes, sh))
    T = min(bx[1] + dy for bx, (_, _, dy) in zip(boxes, sh)); half = max(fw / 2 - L, R - fw / 2) + 4
    W, H = int(2 * half), int(fh - T + 4)
    for i, (im, dx, dy) in enumerate(sh):
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.paste(im, (int(round(dx + half - fw / 2)), int(round(dy - (fh - H)))), im)
        c.save(os.path.join(A, f'pari_walk_{i}.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
    figh = np.mean([bx[3] - bx[1] for bx in boxes])
    out['walk'] = dict(n=len(wk), h=round(H * FIG * .98 / figh, 1), size=(W, H))
    print(json.dumps(out))
if __name__ == '__main__' and sys.argv[1] == 'pari2': build_pari2()

# ---------------------------------------------------------------- Aaru run v2 (ludo.ai 6x6 sheet in _source/aaru_sprites/walk/)
# 36 frames running right that loop as a whole (frame 35 -> 0 is a smaller change than an average frame step), so they're
# used as they are: same canvas, the running bob kept. Sized so his figure is ~95% of the standing shout pose.
def build_aaru2():
    base = os.path.join(ROOT, '_source', 'aaru_sprites', 'walk', 'sprite-max-px-frames-36-rows-6-cols-6')
    d = json.load(open(base + '.json')); im = Image.open(base + '.png').convert('RGBA')
    fr = [im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])) for f in (d['frames'][k]['frame'] for k in sorted(d['frames']))]
    for i, c in enumerate(fr): c.save(os.path.join(A, f'aaru_run_{i}.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
    boxes = [bbox(c) for c in fr]; figh = np.mean([b[3] - b[1] for b in boxes]); low = max(b[3] for b in boxes)
    f = 467 * .95 / figh                                  # stage px per sheet px (shout pose figure = 467 px)
    print(json.dumps(dict(n=len(fr), h=round(fr[0].height * f, 1), gap=round((fr[0].height - low) * f, 1))))
if __name__ == '__main__' and sys.argv[1] == 'aaru2': build_aaru2()

# ---------------------------------------------------------------- Manju + Guddu talking (ludo.ai 6x6 sheets)
# Front-facing, feet fixed; frame 0 = their resting pose. They don't loop 35 -> 0, so the engine plays them forward and
# back (ping-pong) and glides back to frame 0 when the line ends. Used as they are (same canvas per frame).
def build_talk2():
    out = {}
    for key, folder in (('manju', 'manju_sprites'), ('guddu', 'guddu_sprites')):
        base = os.path.join(ROOT, '_source', folder, 'talk', 'sprite-max-px-frames-36-rows-6-cols-6')
        d = json.load(open(base + '.json')); im = Image.open(base + '.png').convert('RGBA')
        fr = [im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])) for f in (d['frames'][k]['frame'] for k in sorted(d['frames']))]
        for i, c in enumerate(fr): c.save(os.path.join(A, f'{key}_talk_{i}.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
        b = [bbox(c) for c in fr]; fig = np.mean([x[3] - x[1] for x in b])
        out[key] = dict(n=len(fr), canvas=fr[0].size, figure=round(fig, 1), bottom_gap=fr[0].height - max(x[3] for x in b))
    print(json.dumps(out))
if __name__ == '__main__' and sys.argv[1] == 'talk2': build_talk2()
