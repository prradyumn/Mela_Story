# Gemini image generation + magenta-key background removal for the Mela sprites.
# Key: env GEMINI_API_KEY (never stored in this folder).
import base64, io, json, os, sys, time, urllib.request
import numpy as np
from PIL import Image

MODEL = os.environ.get('GEMINI_IMAGE_MODEL', 'gemini-3-pro-image')
KEY = os.environ['GEMINI_API_KEY']
MAGENTA, GREEN = (255, 0, 255), (0, 255, 0)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def on_bg(path_or_img, bg=MAGENTA, pad_to=None):
    """Flatten a transparent sprite onto the key colour (optionally padded to an aspect ratio w/h)."""
    im = path_or_img if isinstance(path_or_img, Image.Image) else Image.open(path_or_img)
    im = im.convert('RGBA')
    if pad_to:
        w, h = im.size
        if w / h < pad_to: W, H = round(h * pad_to), h
        else: W, H = w, round(w / pad_to)
        c = Image.new('RGBA', (W, H), bg + (255,)); c.alpha_composite(im, ((W - w) // 2, H - h)); im = c
    out = Image.new('RGB', im.size, bg); out.paste(im, mask=im.split()[3]); return out

def png_b64(img):
    b = io.BytesIO(); img.save(b, 'PNG'); return base64.b64encode(b.getvalue()).decode()

def generate(prompt, images=(), aspect='2:3', size='2K', tries=4):
    parts = [{'inline_data': {'mime_type': 'image/png', 'data': png_b64(i)}} for i in images] + [{'text': prompt}]
    body = {'contents': [{'parts': parts}],
            'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': aspect, 'imageSize': size}}}
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'
    for k in range(tries):
        try:
            req = urllib.request.Request(url, json.dumps(body).encode(), {'Content-Type': 'application/json', 'x-goog-api-key': KEY})
            d = json.load(urllib.request.urlopen(req, timeout=300))
            for c in d.get('candidates', []):
                for p in c.get('content', {}).get('parts', []):
                    if 'inlineData' in p or 'inline_data' in p:
                        x = p.get('inlineData') or p.get('inline_data')
                        return Image.open(io.BytesIO(base64.b64decode(x['data']))).convert('RGB')
            print('no image in response:', json.dumps(d)[:600], file=sys.stderr)
        except Exception as e:
            msg = e.read().decode()[:600] if hasattr(e, 'read') else str(e)
            print(f'try {k+1} failed: {msg}', file=sys.stderr)
        time.sleep(4 + 6 * k)
    raise RuntimeError('generation failed')

def key_out(img, lo=60, hi=150):
    """Magenta key -> RGBA with a soft edge and the magenta spill removed from the edge pixels."""
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(-1))   # distance from the key colour
    alpha = np.clip((d - lo) / (hi - lo), 0, 1)
    # un-mix the key colour from partly transparent pixels, then clamp any leftover magenta tint
    am = np.maximum(alpha, 1e-3)[..., None]
    rgb = np.clip((a - (1 - am) * bg) / am, 0, 255)
    # edge pixels sit on the dark-brown ink outline, so any strong red+blue there is leftover key colour
    edge = alpha < .98
    if bg[1] > bg[0]:   # green key: clamp green on the edge
        rgb[..., 1] = np.where(edge, np.minimum(rgb[..., 1], (rgb[..., 0] + rgb[..., 2]) / 2 + 30), rgb[..., 1])
    else:               # magenta key: clamp red + blue on the edge
        for ch in (0, 2):
            rgb[..., ch] = np.where(edge, np.minimum(rgb[..., ch], rgb[..., 1] + 40), rgb[..., ch])
    return Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA')

def trim(im, pad=0):
    bb = im.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
    return im.crop((bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad)) if bb else im
