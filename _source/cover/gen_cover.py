# Generates the cover illustration with Gemini (same painted storybook style as the story). Key from GEMINI_API_KEY only.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'art_package', 'tools'))
from gen import generate
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
def ref(n, h=900):
    im = Image.open(os.path.join(ROOT, 'assets/story', n + '.webp')).convert('RGBA'); im.thumbnail((h * 3, h))
    bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[3]); return bg
refs = [ref('bg_05_mela_dusk', 800), ref('bg_01_gate', 800), ref('pari_happy'), ref('aaru_jump'), ref('gudiya_idle'), ref('guddu_proud'), ref('baba_idle')]
PROMPT = """Create the COVER ILLUSTRATION (key art) for a children's educational story-game called "The Mela Before Sunset", set in an Indian village called Apnapur.

Use EXACTLY the same art style as the attached images: hand-painted 2D children's storybook illustration, clean dark-brown ink outlines, soft painterly shading, warm glowing colours. The characters must look exactly like the attached character images (same faces, hair, outfits, colours, proportions):
- Image 3: Pari, an 11-year-old girl in a light-blue shirt and navy pinafore with two plaits and red ribbons.
- Image 4: Aaru, an 8-year-old boy in an orange-and-white striped T-shirt and denim shorts.
- Image 5: Gudiya, a cute cream-white baby goat with a red collar and a brass bell.
- Image 6: Guddu Bhaiya, a young man with round glasses and a green gingham shirt holding a notebook.
- Image 7: Baba, a kind village elder with a white turban, white kurta and a walking stick.

SCENE: a magical golden-hour village Mela at sunset (like Image 1), seen from a slightly low, wide cinematic angle. In the middle distance, a big giant wheel with glowing bulbs, a carousel, colourful stalls with striped awnings, strings of warm fairy lights and marigold garlands and bunting across the sky. A huge warm orange sun is low on the horizon, just about to set, with a soft glow. The sky blends from deep violet at the top to rose and orange near the horizon.

FOREGROUND (lower third, on a warm dusty path): Pari in the centre-left, cheerful and confident, pointing toward the Mela; Aaru beside her jumping with joy, arms raised; Gudiya the goat hopping happily at their feet; Baba smiling with his stick on the far left; Guddu Bhaiya on the right, looking at his notebook in surprise. Everyone faces the viewer or the Mela, full of excitement. A few floating rupee coins and marigold petals sparkle in the air.

COMPOSITION: 16:9 landscape. Keep the TOP-CENTRE third of the image calm and uncluttered (soft sky with gentle glow, no objects) — a title will be placed there in code. Strong depth, clear silhouettes, characters sharply readable. Visually stunning, joyful, premium game cover quality.

ABSOLUTELY NO TEXT anywhere: no letters, no title, no words, no numbers, no signs with writing, no logos, no watermark, no border."""
out = sys.argv[1]
img = generate(PROMPT, refs, aspect='16:9', size='4K' if '--4k' in sys.argv else '2K')
img.save(out); print('saved', out, img.size)
