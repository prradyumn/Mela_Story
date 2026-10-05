# Builds art_package/Mela_Character_Art_Plan.xlsx: scene breakdown, character bible, every sprite + its ChatGPT
# image prompt, animation specs, engine work. Prompts are assembled here from the blocks in BLOCKS, so change a
# block and re-run this script (needs openpyxl).
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule

OUT = os.path.join(os.path.dirname(__file__), '..', 'Mela_Character_Art_Plan.xlsx')

# ------------------------------------------------------------------ prompt blocks
BLOCKS = {
 'STYLE': "ART STYLE: hand-painted 2D children's storybook illustration that matches the attached reference exactly: clean, continuous dark-brown ink outlines of even medium weight, soft painterly cel shading with a subtle brush texture, a warm golden Indian-village palette, gentle light from the upper left, large expressive eyes, friendly rounded shapes. Lifelike acting: natural balance and body weight, believable anatomy, relaxed natural hands with five fingers each, clothes that fold and hang with gravity. Not photorealistic, not a 3D render, not anime, not flat vector art, no glossy plastic look.",
 'CANVAS_P': "CANVAS AND FRAMING (very important): portrait image, 1024x1536. Exactly ONE character in ONE pose. This is not a sprite sheet, a turnaround or a model sheet: no extra copies, views, insets or close-ups. Show the full body from the top of the head (including hair and headwear) to the soles of the feet, with nothing cropped. Centre the character horizontally. The character's height fills about 82% of the image height, leaving clear empty space on all four sides (at least 80 px). The soles of the feet rest on an invisible line about 92% of the way down the image. The camera is at the character's chest height, looking straight on, with no tilt and no wide-angle distortion.",
 'CANVAS_S': "CANVAS AND FRAMING (very important): square image, 1024x1024. Exactly ONE goat in ONE pose, not a sprite sheet, with no extra copies or views. The whole goat, including both ears, horns, tail and all four hooves, fits inside with at least 80 px of empty space on every side. Her body length fills about 78% of the image width. The hooves rest on an invisible line about 90% of the way down the image. The camera is at the goat's eye height, side-on three-quarter view, with no wide-angle distortion.",
 'CLEAN': "CLEAN SPRITE RULES: a true transparent background (alpha channel). Do not draw a checkerboard, white box, coloured backdrop, floor, ground line, cast shadow, contact shadow, scenery or vignette. No text, letters, numbers, logos, watermark, signature, border or frame. No speed lines, sparkles, hearts, sweat drops or other effects unless the pose asks for them. Crisp, clean edges with no white sticker outline, halo or glow. Limbs, hands, hair and props must not merge into each other, and natural gaps between the arms and body stay open. Every held prop stays fully inside the image.",
 'EDIT_TAIL': "Everything outside that area must stay pixel-identical: same pose, same size, same position in the frame, same colours, same line work, same transparent background. Do not redraw, move, crop, zoom, resize or re-colour anything else, and do not change the canvas size.",
 'NEXT_TAIL': "ALIGNMENT: match Image 2 exactly in character scale, camera angle, facing direction, line weight and colours. The body stays centred in the frame, and the top of the head and the ground line sit at the same heights as in Image 2 (unless this frame's action lifts or lowers the body). Change only the limbs, body and hair positions described above, and keep every costume detail identical.",
}

MOUTH = {
 'm0': "Close the mouth into a gentle closed-lip smile: the resting mouth between words.",
 'm1': "Open the mouth slightly, as if saying \"eh\" mid-word: lips parted with a small dark opening and a hint of the upper teeth.",
 'm2': "Open the mouth wide, as if saying \"aah\": jaw dropped, a rounded opening, upper teeth and a little tongue visible.",
 'blink': "Close both eyes in a natural, relaxed blink: upper eyelids fully down, the lid line curving gently downward, eyelashes along the lid, eyebrows unchanged. If the character wears glasses, keep the glasses exactly as they are.",
}

# ------------------------------------------------------------------ characters
CHARS = [
 # key, name, role, acting, identity, ref, stage height
 ('pari', 'Pari', 'Guide and estimation hero (girl, ~11)',
  'Calm and confident. Small, precise gestures. Stands with her weight on one leg. Nods while she explains. Her braids swing a little after every move.',
  "Pari, an Indian schoolgirl of about 11 with a calm, confident manner. Warm medium-brown skin, big round dark-brown eyes, thick dark eyebrows, a small friendly smile. Dark-brown hair parted in the middle and worn in two long plaits that reach her waist, each tied with a red ribbon bow at shoulder height. Light-blue short-sleeved collared school shirt; navy-blue knee-length pleated pinafore dress with a waistband and two buttons on the straps; a brown school backpack worn on both shoulders; white ankle socks; black Mary-Jane school shoes. Slim and upright, about 6 heads tall.",
  'refs/pari_idle.png', 540),
 ('aaru', 'Aaru', 'Excitable little friend (boy, ~8): "Correct-correct!"',
  'Bouncy and never still. Big arcs, quick starts and overshoots. Rises onto his toes when excited. Leans into every line.',
  "Aaru, an excitable Indian boy of about 8. Warm brown skin, a mop of messy curly dark-brown hair, big dark-brown eyes, a wide toothy grin, slightly big ears. A loose orange-and-white horizontally striped short-sleeved T-shirt; rolled-up mid-blue denim shorts above the knee; navy-blue rubber flip-flops. Small and wiry, about 5 heads tall.",
  'refs/aaru_run.png', 480),
 ('baba', 'Baba', 'Village elder who holds the Mela money',
  'Slow and gentle. Leans on his stick. Small nods. His free hand opens in soft, wide gestures.',
  "Baba, a kind Indian village elder of about 70. Warm tan skin with soft wrinkles, bushy grey eyebrows, a thick grey handlebar moustache, kind dark-brown eyes. A cream-white pagdi turban with faint pink stripes; a long, loose off-white kurta with a short buttoned placket; a white dhoti draped to mid-calf; a cream gamcha towel with thin red stripes over his right shoulder, hanging to the waist; a plain straight wooden walking stick held in his right hand; brown leather two-strap sandals. Tall, slightly stooped.",
  'refs/baba_ask.png', 620),
 ('guddu', 'Guddu Bhaiya', 'Panchayat accountant: slow, exact adder',
  'A little nervous and jittery. Hunches over his notebook, pushes his glasses up, glances at the sun. Comes alive with pride at the end.',
  "Guddu Bhaiya, an Indian man of about 25, the village Panchayat's careful, slow accountant. Warm brown skin, curly dark-brown hair, round thin wire-rimmed glasses, light stubble, worried eyebrows. A green-and-cream gingham check shirt with a collar, sleeves rolled to the elbow, tucked in; brown trousers; a brown leather belt with a silver buckle; brown thong sandals. Carries a navy-blue spiral-bound notebook and a pen. Lanky, about 7 heads tall.",
  'refs/guddu_write.png', 640),
 ('manju', 'Manju Mausi', 'Sweets-and-tea shopkeeper; teaches the rounding rule in L1',
  'Warm and teacherly. Raises a finger for the rule, puts a hand on her hip, tilts her head kindly when the child is wrong.',
  "Manju Mausi, a warm, wise Indian shopkeeper of about 60. Warm brown skin with soft wrinkles, kind smiling eyes, a small red bindi, small gold stud earrings. Grey hair pulled back into a low bun. A rose-pink cotton saree with a narrow beige-gold border, the pallu over her left shoulder; an olive-green short-sleeved blouse; a grey sleeveless vest worn over the saree with two patch pockets; a few red-and-gold bangles on each wrist; brown sandals.",
  'refs/manju_teach.png', 580),
 ('gudiya', 'Gudiya', 'Village pet goat; gentle "wrong answer" helper',
  'Springy. Head tilts, ear flicks and tail wags. Every landing has a little bounce. Bleats with her whole body.',
  "Gudiya, a baby goat and the village pet. Fluffy cream-white fur with soft light-brown patches on her head, back and legs; two short curved brown horns; large floppy ears with pink insides; huge glossy brown eyes with eyelashes; a small pink nose and a gentle smile. A red ribbon collar tied in a bow, with a small brass bell hanging under her chin. A short, fluffy, upturned tail and dark-brown hooves. Cute and round, about 1.2 times as long as she is tall.",
  'refs/gudiya_idle.png', 250),
 # ---- new characters (designs are suggestions; first generation becomes their reference) ----
 ('ramu', 'Ramu Kaka', 'NEW · Bazaar stall 1: fruit and vegetables', 'Brisk and cheerful, a seller who calls out to customers.',
  "Ramu Kaka, the fruit-and-vegetable seller, a wiry Indian man of about 55. Warm dark-brown skin, short grey hair and a neat grey moustache, cheerful crinkled eyes. An olive-green half-sleeve kurta, white pyjama trousers, a folded orange gamcha cloth wrapped on his head, brown sandals. Holds a bunch of yellow bananas in one hand.", 'incoming/ramu_idle.png', 560),
 ('farida', 'Farida Aapa', 'NEW · Bazaar stall 2: cloth', 'Graceful and chatty. Shows off her cloth proudly.',
  "Farida Aapa, the cloth seller, a cheerful Indian woman of about 45. Warm brown skin, black hair in a side plait, kind eyes. A teal salwar kameez with small white block-print flowers, a mustard-yellow dupatta over both shoulders, a yellow cloth measuring tape around her neck, brown sandals. Holds a folded bolt of bright red fabric.", 'incoming/farida_idle.png', 560),
 ('mohan', 'Mohan Chacha', 'NEW · Bazaar stall 3: clay pots', 'Slow and steady, with careful hands.',
  "Mohan Chacha, the potter, a sturdy Indian man of about 60. Warm brown skin, a short white stubbly beard, a bald head with white hair at the sides. A brown sleeveless vest over a cream half-sleeve kurta, a white dhoti, light clay smudges on his hands and forearms, bare feet. Holds a small round terracotta matka pot.", 'incoming/mohan_idle.png', 560),
 ('rani', 'Rani Didi', 'NEW · Bazaar stall 4: bangles', 'Lively and quick. Her bangles jingle.',
  "Rani Didi, the bangle seller, a lively young Indian woman of about 28. Warm brown skin, black hair in a long plait with a small string of jasmine, a red bindi. A purple cotton saree with a pink border, a magenta blouse, many colourful glass bangles on both wrists, brown sandals. Holds a wooden stick stacked with bright glass bangles.", 'incoming/rani_idle.png', 550),
 ('pappu', 'Pappu Bhaiya', 'NEW · Bazaar stall 6: toys', 'Playful. Always showing off a toy.',
  "Pappu Bhaiya, the toy seller, a playful Indian man of about 30. Warm brown skin, short black hair, a thin moustache. A sunny-yellow half-sleeve shirt, rolled blue jeans, a small red cap, brown sandals. Holds a red wooden toy train in one hand and a colourful paper pinwheel in the other.", 'incoming/pappu_idle.png', 570),
 ('lakshmi', 'Lakshmi Akka', 'NEW · Bazaar stall 7: flowers', 'Gentle and soft-spoken.',
  "Lakshmi Akka, the flower seller, a gentle Indian woman of about 35. Dark-brown skin, black hair in a bun wrapped with white jasmine, a small gold nose stud. A leaf-green cotton saree with an orange border, an orange blouse, brown sandals. Carries long marigold garlands draped over her forearm.", 'incoming/lakshmi_idle.png', 550),
 ('sarpanch', 'Sarpanch Kamla Devi', 'NEW · Village head who gives the gold badge (n4). Skip if Baba becomes the Sarpanch.', 'Dignified, warm and proud of the child.',
  "Sarpanch Kamla Devi, the respected village head, a confident Indian woman of about 50. Warm brown skin, black hair streaked with grey in a neat bun, small round black-rimmed glasses, a warm smile. A deep maroon cotton saree with a gold border, the pallu draped over her head and shoulder, a cream blouse, a light-brown shawl over one shoulder, simple gold bangles, brown sandals.", 'incoming/sarpanch_idle.png', 590),
 ('crowd', 'Mela crowd', 'NEW · Background villagers for the evening Mela (endA–endC)', 'Sways, points at the fireworks, bobs gently.',
  "Background villagers for the evening Mela, drawn in the same style but with slightly simpler detail, in everyday Indian village clothes in warm colours.", 'refs/pari_idle.png', 480),
]
CH = {c[0]: c for c in CHARS}

# ------------------------------------------------------------------ sprite rows
# (id, prio, char, asset, type, file, canvas, method, attach, used, desc, notes)
R = []
def add(*a): R.append(a)
P, S = 'Portrait 1024x1536', 'Square 1024x1024'
SQ = 'Square 1024x1024'

# existing art (for completeness)
for k, poses in [('pari', ['idle', 'point', 'happy']), ('aaru', ['run', 'shout', 'jump']), ('baba', ['idle', 'ask']),
                 ('guddu', ['write', 'scratch', 'surprised', 'proud']), ('manju', ['teach']), ('gudiya', ['idle', 'hop'])]:
    for p in poses:
        add(f'{k[:3].upper()}-{p.upper()}', '-', k, f'{p} (existing)', 'Existing pose', f'a/{k}_{p}.webp', '-', 'Exists', f'refs/{k}_{p}.png', '', '', 'Already in the story. Use it as the reference for new art.' + (' NB: "happy" is actually the namaste pose.' if (k, p) == ('pari', 'happy') else ''))

# ---- Pari
add('PAR-01', 'P1', 'pari', 'explain', 'New pose', 'pari_explain.png', P, 'New pose', 'refs/pari_idle.png', 'hookD',
    "Explaining patiently to a child: her body is turned slightly to her right, and her left arm is stretched out to the side with the palm open and facing up, presenting something beside her. Her right hand is raised at chest height, counting on her fingers (index finger touching the thumb). Head tilted slightly, warm encouraging smile, mouth slightly open as if mid-sentence, eyes looking toward her open palm.", 'Replaces "point" for the long p2 explanation in the close-up.')
add('PAR-02', 'P1', 'pari', 'cheer', 'New pose', 'pari_cheer.png', P, 'New pose', 'refs/pari_idle.png', 'bridge1, game (correct answers)',
    "Celebrating: both fists raised happily at shoulder height, elbows bent, up on her toes, braids swinging outward, eyes squeezed into happy crescents, big open-mouthed smile.", '')
add('PAR-03', 'P2', 'pari', 'thumbsup', 'New pose', 'pari_thumbsup.png', P, 'New pose', 'refs/pari_idle.png', 'game (correct answers)',
    "Giving an encouraging thumbs-up with her right hand held forward at chest height, left hand resting on the backpack strap, a proud warm smile, a small head tilt.", '')
add('PAR-04', 'P2', 'pari', 'think', 'New pose', 'pari_think.png', P, 'New pose', 'refs/pari_idle.png', 'game (hints)',
    "Thinking it through: right index finger resting on her chin, left arm folded across her waist supporting the right elbow, eyes looking up and to the side, a small thoughtful smile, weight on one leg.", 'For "let\'s look at the hundreds digit…" hint moments.')
walk = [
 "Walking toward the right in a three-quarter front view, mid-stride CONTACT pose: the front foot's heel just touching the ground ahead, the back foot behind on its toes, the arms swinging opposite to the legs, the braids swinging slightly behind, the backpack visible, a gentle smile.",
 "DOWN pose: the front foot from Image 2 is now flat under her body with the knee slightly bent (her body is at its lowest, about 2% lower), the back foot lifting off the ground, the arms passing close to her sides.",
 "PASSING/UP pose: the planted leg straightens (her body is at its highest, about 2% higher than frame 1), the other leg swings forward past it with the knee bent and the foot just off the ground, the arms passing her sides, the braids lifting slightly.",
 "CONTACT pose with the legs SWAPPED: the OTHER foot is now forward with its heel touching down and the first foot behind on its toes, and the arms swing the other way. Do not mirror the image: she still faces the same direction and her braids and backpack are unchanged.",
 "DOWN pose with the legs swapped (same as frame 2 but on the other leg).",
 "PASSING/UP pose with the legs swapped (same as frame 3 but on the other leg). The next frame loops back to frame 1.",
]
for i, d in enumerate(walk):
    add(f'PAR-W{i+1}', 'P2', 'pari', f'walk frame {i+1}/6', 'Anim frame', f'pari_walk_{i+1:02d}.png', P,
        'New pose' if i == 0 else 'Next frame', 'refs/pari_idle.png' if i == 0 else f'refs/pari_idle.png + incoming/pari_walk_{i:02d}.png', 'title (walk in), hookE/bridges (walk out)', d, 'Animation A-01')
for base, src, need, prio, used in [('point', 'refs/pari_point.png', ['blink', 'm0', 'm2'], 'P1', 'hookC, hookE, bridge1, bridge2, levels'),
                                    ('happy', 'refs/pari_happy.png', ['blink', 'm1', 'm2'], 'P1', 'title, endB (p6)'),
                                    ('explain', 'incoming/pari_explain.png', ['blink', 'm0', 'm2'], 'P1', 'hookD (p2)'),
                                    ('idle', 'refs/pari_idle.png', ['blink'], 'P2', 'hookC, bridge2')]:
    for n in need:
        add(f'PAR-{base[:2].upper()}{n.upper()}', prio, 'pari', f'{base} · {n}', 'Face variant', f'pari_{base}_{n}.png', P, 'Region edit', src, used, MOUTH[n],
            'Lip-sync set: m0 closed · m1 slightly open · m2 wide. The base pose already shows the missing one.' if n != 'blink' else 'Blink: shown for ~90 ms every 2.5–5 s.')

# ---- Aaru
add('AAR-01', 'P1', 'aaru', 'idle', 'New pose', 'aaru_idle.png', P, 'New pose', 'refs/aaru_shout.png', 'hookE, endC, levels (listening)',
    "Standing and listening eagerly: hands on his hips, chest puffed out, weight bouncing on the balls of his feet, a big closed-mouth grin, eyes bright and looking slightly to his left.", 'He has no standing pose today, so hookE uses "shout" while Pari talks.')
add('AAR-02', 'P1', 'aaru', 'oops', 'New pose', 'aaru_oops.png', P, 'New pose', 'refs/aaru_shout.png', 'hookC (after the red ✕)',
    "Sheepish after a silly mistake: one hand rubbing the back of his curly head, shoulders hunched up, a lopsided embarrassed grin showing teeth, eyes glancing to the side, one foot turned inward.", 'His reaction to the wild-guess ✕. Gives the scene a laugh.')
add('AAR-03', 'P2', 'aaru', 'cheer', 'New pose', 'aaru_cheer.png', P, 'New pose', 'refs/aaru_jump.png', 'bridge1 (r2), game',
    "A big fist-pump: right fist pulled down hard at his side, left fist punched up high, knees bent, mouth wide open shouting with joy, eyes squeezed shut.", '"Correct-correct!" moments.')
add('AAR-04', 'P2', 'aaru', 'jalebi', 'New pose', 'aaru_jalebi.png', P, 'New pose', 'refs/aaru_jump.png', 'endC (r3)',
    "Holding a round steel plate piled with bright orange glossy jalebis in his left hand, taking a big happy bite of one jalebi held in his right hand, cheeks full, eyes closed in delight.", '')
add('AAR-05', 'P3', 'aaru', 'think', 'New pose', 'aaru_think.png', P, 'New pose', 'refs/aaru_shout.png', 'game',
    "Puzzled: scratching his cheek with one finger, head tilted, lips pushed to one side, eyes looking up, the other hand on his hip.", '')
run = [
 None,
 "PASSING pose: the leg that was in front in Image 2 is now planted under his hips, the knee bent to absorb the landing (his body is at its lowest, about 3% lower), the back leg swinging forward past it with the knee bent and the foot lifted, the arms passing close to his body, a joyful open-mouthed grin.",
 "PUSH-OFF pose: the planted leg straightens behind him, pushing off; the swinging leg drives forward with the knee high; both feet are just off the ground (his body is at its highest, about 3% higher than frame 1); the arms are swapping; his curls bounce up.",
 "STRIDE pose with the legs SWAPPED: like frame 1, but now the OTHER leg reaches forward and the other arm is forward. Do not mirror the image: he still faces the same direction, and the stripes and hair are unchanged.",
 "PASSING pose with the legs swapped (same as frame 2 on the other leg).",
 "PUSH-OFF pose with the legs swapped (same as frame 3 on the other leg). The next frame loops back to frame 1.",
]
add('AAR-R1', '-', 'aaru', 'run frame 1/6', 'Anim frame', 'aaru_run_01 = a/aaru_run.webp', P, 'Exists', 'refs/aaru_run.png', 'hookC, title', '', 'The existing run pose is frame 1.')
for i in range(1, 6):
    prev = 'refs/aaru_run.png' if i == 1 else f'incoming/aaru_run_{i:02d}.png'
    add(f'AAR-R{i+1}', 'P1', 'aaru', f'run frame {i+1}/6', 'Anim frame', f'aaru_run_{i+1:02d}.png', P, 'Next frame', f'refs/aaru_run.png + {prev}', 'hookC (run in), title', run[i], 'Animation A-02')
add('AAR-J0', 'P2', 'aaru', 'jump · crouch', 'Anim frame', 'aaru_jump_crouch.png', P, 'New pose', 'refs/aaru_jump.png', 'hookE, bridge1, endC',
    "Anticipation crouch just before a big jump: knees deeply bent, body low (the top of his head about 15% lower than standing), arms swung back behind him, leaning forward, an eager grin, both flip-flops flat on the ground.", 'Animation A-03, shown ~0.12 s before take-off.')
add('AAR-J2', 'P2', 'aaru', 'jump · land', 'Anim frame', 'aaru_jump_land.png', P, 'New pose', 'refs/aaru_jump.png', 'hookE, bridge1, endC',
    "Landing squash: knees bent and wide, arms flung out to the sides for balance, the body slightly compressed, a delighted open-mouthed grin, both flip-flops flat on the ground.", 'Animation A-03, shown ~0.15 s after landing.')
for base, src, need, prio, used in [('shout', 'refs/aaru_shout.png', ['m0', 'm1', 'blink'], 'P1', 'hookC (r1)'),
                                    ('jump', 'refs/aaru_jump.png', ['m0', 'm1'], 'P1', 'bridge1 (r2), endC (r3)'),
                                    ('idle', 'incoming/aaru_idle.png', ['blink', 'm1', 'm2'], 'P2', 'hookE, endC')]:
    for n in need:
        add(f'AAR-{base[:2].upper()}{n.upper()}', prio, 'aaru', f'{base} · {n}', 'Face variant', f'aaru_{base}_{n}.png', P, 'Region edit', src, used, MOUTH[n],
            'For "shout", keep his cupped hands exactly where they are; only the mouth between them changes.' if base == 'shout' and n != 'blink' else '')

# ---- Baba
add('BAB-01', 'P1', 'baba', 'give money', 'New pose', 'baba_give.png', P, 'New pose', 'refs/baba_ask.png', 'level3 (paying each shopkeeper)',
    "Handing over money: still leaning on his walking stick with his right hand, his left arm stretched forward holding out a bulging red cloth potli money bag tied with a gold drawstring, a kind generous smile, a slight bow of the head.", 'L3: "Baba has the money".')
add('BAB-02', 'P2', 'baba', 'bless', 'New pose', 'baba_bless.png', P, 'New pose', 'refs/baba_ask.png', 'endB, endC',
    "Proud and blessing the children: his left hand raised gently at shoulder height with the palm facing forward in a blessing, his right hand on his stick, eyes crinkled with joy, a wide moustached smile.", '')
for base, src, need, prio, used in [('ask', 'refs/baba_ask.png', ['m0', 'm2', 'blink'], 'P1', 'hookA (b1)'),
                                    ('idle', 'refs/baba_idle.png', ['blink'], 'P2', 'hookA, level3, endB')]:
    for n in need:
        add(f'BAB-{base[:2].upper()}{n.upper()}', prio, 'baba', f'{base} · {n}', 'Face variant', f'baba_{base}_{n}.png', P, 'Region edit', src, used, MOUTH[n], 'His moustache covers the upper lip, so only the lower lip and the opening change.' if n != 'blink' else '')

# ---- Guddu
add('GUD-01', 'P2', 'guddu', 'worried', 'New pose', 'guddu_worried.png', P, 'New pose', 'refs/guddu_write.png', 'hookB (the sun sinks)',
    "Panicking quietly: hunched over his open notebook, writing furiously with the pen, his head turned to glance anxiously up at the sky, eyebrows high, a single sweat drop on his temple, glasses slipping down his nose.", 'The sweat drop is the only effect allowed here.')
add('GUD-02', 'P3', 'guddu', 'finished', 'New pose', 'guddu_finished.png', P, 'New pose', 'refs/guddu_proud.png', 'endB (g3 "I finished!")',
    "Exhausted but triumphant: holding up a very long sheet of notebook paper covered in tiny illegible scribbled squiggles (no real numbers or letters) that unrolls in loops down to his feet, hair messy, glasses crooked, a tired proud grin.", 'Funnier alternative to "proud" for g3.')
wr = [None,
 "The pen has moved to the middle of the line on the notebook page; his head tilts very slightly, following the pen; his lips are pressed together in concentration.",
 "The pen is near the right edge of the page; his eyebrows are scrunched; his tongue pokes slightly out of the corner of his mouth in concentration.",
 "The pen is lifted a little off the page, and his eyes glance up nervously for a moment (as if checking the sun) while his head stays down."]
add('GUD-W1', '-', 'guddu', 'write frame 1/4', 'Anim frame', 'guddu_write_01 = a/guddu_write.webp', P, 'Exists', 'refs/guddu_write.png', 'hookA, hookB, level2', '', 'The existing write pose is frame 1.')
for i in range(1, 4):
    add(f'GUD-W{i+1}', 'P1', 'guddu', f'write frame {i+1}/4', 'Anim frame', f'guddu_write_{i+1:02d}.png', P, 'Region edit', 'refs/guddu_write.png',
        'hookA, hookB, level2', wr[i] + ' Only his writing hand, pen and face may change.', 'Animation A-05. Use a Region edit on the existing pose (select the hand + pen + face) so the body never moves.')
sc = [None,
 "The scratching hand has moved slightly forward on his scalp with the fingers bent, the curls ruffled a bit more, and his eyes look up and to the left.",
 "The scratching hand has moved slightly back on his scalp, and his eyes look up and to the right, puzzled."]
add('GUD-S1', '-', 'guddu', 'scratch frame 1/3', 'Anim frame', 'guddu_scratch_01 = a/guddu_scratch.webp', P, 'Exists', 'refs/guddu_scratch.png', 'hookA (g1)', '', 'The existing scratch pose is frame 1.')
for i in range(1, 3):
    add(f'GUD-S{i+1}', 'P2', 'guddu', f'scratch frame {i+1}/3', 'Anim frame', f'guddu_scratch_{i+1:02d}.png', P, 'Region edit', 'refs/guddu_scratch.png',
        'hookA (g1)', sc[i] + ' Only the raised hand, the hair under it and the eyes may change.', 'Animation A-06')
for base, src, need, prio, used in [('scratch', 'refs/guddu_scratch.png', ['m0', 'm2', 'blink'], 'P1', 'hookA (g1)'),
                                    ('surprised', 'refs/guddu_surprised.png', ['m0', 'm1'], 'P1', 'bridge2 (g2)'),
                                    ('proud', 'refs/guddu_proud.png', ['m1', 'm2', 'blink'], 'P1', 'endB (g3)')]:
    for n in need:
        add(f'GUD-{base[:2].upper()}{n.upper()}', prio, 'guddu', f'{base} · {n}', 'Face variant', f'guddu_{base}_{n}.png', P, 'Region edit', src, used, MOUTH[n], '')

# ---- Manju
add('MAN-01', 'P1', 'manju', 'idle', 'New pose', 'manju_idle.png', P, 'New pose', 'refs/manju_teach.png', 'level1',
    "Standing relaxed and welcoming beside her stall: hands loosely clasped in front of her waist, a kind closed-mouth smile, her head turned slightly to her right as if watching a child work.", '')
add('MAN-02', 'P1', 'manju', 'happy', 'New pose', 'manju_happy.png', P, 'New pose', 'refs/manju_teach.png', 'level1 (correct)',
    "Delighted: clapping her hands together in front of her chest, her bangles slipping down her wrists, eyes crinkled, a big open smile.", '')
add('MAN-03', 'P1', 'manju', 'hint', 'New pose', 'manju_hint.png', P, 'New pose', 'refs/manju_teach.png', 'level1 (wrong → retry with a hint)',
    "A gentle, kind hint after a mistake: her head tilted to one side, her left hand on her hip, her right hand held out palm-up as if saying \"look again\", eyebrows raised softly, a reassuring smile, never cross.", 'No fail state: this is the "try again" face.')
for base, src, need, prio in [('teach', 'refs/manju_teach.png', ['m1', 'm2', 'blink'], 'P1'),
                              ('hint', 'incoming/manju_hint.png', ['m0', 'm2'], 'P1'),
                              ('idle', 'incoming/manju_idle.png', ['blink'], 'P2')]:
    for n in need:
        add(f'MAN-{base[:2].upper()}{n.upper()}', prio, 'manju', f'{base} · {n}', 'Face variant', f'manju_{base}_{n}.png', P, 'Region edit', src, 'level1', MOUTH[n], 'Manju has no voice lines yet; L1 needs new voice lines for her.' if base == 'teach' and n == 'm1' else '')

# ---- Gudiya
trot = [
 "Trotting toward the right in a three-quarter side view: the front-left and back-right legs reach forward together while the other diagonal pair pushes back, the ears flopping back, the bell swinging, a happy open-mouthed smile.",
 "PASSING pose: the reaching diagonal pair from Image 2 is now planted under her body (her body is at its lowest, about 3% lower), the other diagonal pair swings forward with bent knees, the ears dropping.",
 "SUSPENSION pose: all four hooves just off the ground (her body is at its highest, about 4% higher than frame 1), the legs tucked, the ears flipping up, the tail up, the bell swinging the other way.",
 "Like frame 1 but with the diagonal pairs SWAPPED: now the front-right and back-left legs reach forward. Do not mirror the image: she still faces the same direction.",
 "PASSING pose with the pairs swapped (same as frame 2 on the other diagonal).",
 "SUSPENSION pose with the pairs swapped (same as frame 3). The next frame loops back to frame 1.",
]
for i, d in enumerate(trot):
    add(f'GOA-T{i+1}', 'P1', 'gudiya', f'trot frame {i+1}/6', 'Anim frame', f'gudiya_trot_{i+1:02d}.png', SQ, 'New pose' if i == 0 else 'Next frame',
        'refs/gudiya_idle.png' if i == 0 else f'refs/gudiya_idle.png + incoming/gudiya_trot_{i:02d}.png', 'title, hookC (runs in)', d, 'Animation A-04')
add('GOA-01', 'P1', 'gudiya', 'bleat', 'New pose', 'gudiya_bleat.png', SQ, 'New pose', 'refs/gudiya_idle.png', 'title (tap her), wrong answers',
    "Bleating happily: her head lifted and stretched forward, mouth open in a round \"maa\" shape, eyes half-closed, ears flicked back, front legs braced, tail up.", 'Pairs with sfx_goat.')
add('GOA-02', 'P1', 'gudiya', 'tilt', 'New pose', 'gudiya_tilt.png', SQ, 'New pose', 'refs/gudiya_idle.png', 'game (gentle wrong answer)',
    "Curious head tilt: her head tilted about 25 degrees to one side, one ear up and one ear flopped down, big questioning eyes, mouth closed, standing still on all four hooves.", 'The gentle "hmm?" reaction for a wrong answer.')
add('GOA-BL', 'P2', 'gudiya', 'idle · blink', 'Face variant', 'gudiya_idle_blink.png', SQ, 'Region edit', 'refs/gudiya_idle.png', 'all scenes with Gudiya', MOUTH['blink'], '')
add('GOA-TL1', 'P3', 'gudiya', 'tail wag A', 'Anim frame', 'gudiya_tail_01.png', SQ, 'Region edit', 'refs/gudiya_idle.png', 'idle (wag)', "Flick the short fluffy tail up and to the left (toward her back) mid-wag. Only the tail changes.", 'Animation A-07')
add('GOA-TL2', 'P3', 'gudiya', 'tail wag B', 'Anim frame', 'gudiya_tail_02.png', SQ, 'Region edit', 'refs/gudiya_idle.png', 'idle (wag)', "Flick the short fluffy tail down and to the right mid-wag. Only the tail changes.", 'Animation A-07')
add('GOA-CH1', 'P3', 'gudiya', 'chew A', 'Anim frame', 'gudiya_chew_01.png', SQ, 'Region edit', 'refs/gudiya_idle.png', 'endC (jalebi)', "Mouth closed and chewing with her cheeks slightly puffed, a small piece of orange jalebi poking out of the side of her mouth, eyes half-closed in bliss.", 'Animation A-08')
add('GOA-CH2', 'P3', 'gudiya', 'chew B', 'Anim frame', 'gudiya_chew_02.png', SQ, 'Region edit', 'incoming/gudiya_chew_01.png', 'endC (jalebi)', "Same as the attached image, but her lower jaw is shifted sideways mid-chew and the jalebi piece moves with it.", 'Animation A-08')

# ---- Shopkeepers (bazaar stalls 1-4, 6, 7; stall 5 sweets & tea = Manju)
for k in ['ramu', 'farida', 'mohan', 'rani', 'pappu', 'lakshmi']:
    pr = 'her' if k in ('farida', 'rani', 'lakshmi') else 'his'; nm = CH[k][1]; item = {'ramu': 'bananas', 'farida': 'red cloth', 'mohan': 'clay pot', 'rani': 'bangle stick', 'pappu': 'toy train and pinwheel', 'lakshmi': 'marigold garlands'}[k]
    add(f'SHP-{k[:3].upper()}1', 'P2', k, 'idle (design)', 'New character', f'{k}_idle.png', P, 'New character', 'refs/pari_idle.png (style only)', 'level1 (at their stall), level3 (being paid)',
        f"Standing relaxed and friendly, holding {pr} {item}, smiling warmly, turned slightly to {pr} right toward a customer.", 'The first good result becomes this character\'s reference.')
    add(f'SHP-{k[:3].upper()}2', 'P2', k, 'happy · paid', 'New pose', f'{k}_happy.png', P, 'New pose', f'incoming/{k}_idle.png', 'level1 (correct), level3 (receiving payment)',
        f"Beaming with joy after being paid: palms pressed together in a grateful namaste at chest height, {pr} {item} tucked safely in the crook of one arm, eyes crinkled, a big smile.", '')
    add(f'SHP-{k[:3].upper()}B', 'P3', k, 'idle · blink', 'Face variant', f'{k}_idle_blink.png', P, 'Region edit', f'incoming/{k}_idle.png', 'level1, level3', MOUTH['blink'], '')

# ---- Sarpanch
add('SAR-01', 'P2', 'sarpanch', 'idle (design)', 'New character', 'sarpanch_idle.png', P, 'New character', 'refs/manju_teach.png (style only)', 'endC, badge',
    "Standing tall and dignified, hands gently folded in front of her waist, a warm proud smile.", 'Decision: create her, OR make Baba the Sarpanch and re-voice n4 ("Baba gives you a gold badge").')
add('SAR-02', 'P2', 'sarpanch', 'give badge', 'New pose', 'sarpanch_give.png', P, 'New pose', 'incoming/sarpanch_idle.png', 'endC (n4), badge',
    "Proudly presenting a shining round gold medal on a red ribbon, held out with both hands toward her right (the viewer's left), leaning forward slightly, a beaming smile.", '')
add('SAR-BL', 'P3', 'sarpanch', 'idle · blink', 'Face variant', 'sarpanch_idle_blink.png', P, 'Region edit', 'incoming/sarpanch_idle.png', 'endC', MOUTH['blink'], '')

# ---- Crowd
for i, d in enumerate([
 "A village father carrying his small daughter on his shoulders, both looking up and pointing at the sky with delighted open mouths (watching fireworks). The father wears a white kurta and a brown shawl; the girl wears a yellow frock.",
 "Two village children of about 7 (a girl in a pink frock and a boy in a blue shirt and shorts) laughing together, one holding a red balloon on a string and the other holding pink candyfloss on a stick.",
 "An elderly village couple smiling side by side: the grandmother in a simple green cotton saree, the grandfather in a cream kurta with a brown shawl, holding hands.",
 "A young village mother in an orange salwar kameez holding a baby on her hip, pointing up at something exciting and smiling.",
]):
    add(f'CRW-0{i+1}', 'P3', 'crowd', f'crowd group {i+1}', 'New character', f'crowd_{i+1:02d}.png', P, 'New character', 'refs/pari_idle.png (style only)', 'endA, endB, endC (evening Mela)', d,
        'Shown smaller, dimmer and slightly blurred behind the main cast. The engine adds dusk lighting.')

# ---- Props
for pid, nm, d, used in [
 ('PRP-01', 'money potli', "A bulging red cloth potli money bag tied at the neck with a gold drawstring, a few plain generic paper banknotes peeking out of the top (no real currency design, no text, no numbers).", 'level3, Baba'),
 ('PRP-02', 'blank bill', "A single blank paper bill/receipt: cream paper, a torn perforated top edge, faint blue ruled lines, one slightly curled corner, absolutely no writing (the numbers are added in code).", 'level2, level3'),
 ('PRP-03', 'price tag', "A blank cream cardboard price tag with a reinforced punched hole and a short loop of brown string, slightly tilted, no writing (the price is added in code).", 'level1'),
 ('PRP-04', 'jalebi plate', "A round shiny steel thali plate piled with bright orange, glossy, spiral jalebis.", 'endC'),
]:
    add(pid, 'P2', 'prop', nm, 'Prop', f'prop_{nm.replace(" ", "_")}.png', SQ, 'Prop', 'refs/pari_idle.png (style only)', used, d, '')

# ---- Scene elements: the giant wheel that "starts to turn" (n3)
for sid, nm, ref, d in [
 ('SCN-01', 'wheel ring · day', 'refs/mela_wheel_crop_day.png', "The attached image is a close crop of the giant wheel from the Mela background. Redraw ONLY the wheel's rotating part as a separate cut-out: the circular rim, all the spokes and the centre hub, viewed perfectly front-on as a true circle. Leave out the cabins (gondolas), the A-frame support legs, the light strings and the background. Keep the same colours (blue rim, orange-yellow spokes, blue-and-gold hub) and the same painted style. Centre the hub exactly in the middle of the image; the rim fills about 90% of the image width."),
 ('SCN-02', 'wheel ring · dusk', 'refs/mela_wheel_crop_dusk.png', "The attached image is a close crop of the giant wheel at dusk. Redraw ONLY the wheel's rotating part as a separate cut-out: the circular rim, all the spokes and the centre hub, viewed perfectly front-on as a true circle, with the warm glowing bulbs along the rim and spokes exactly as in the crop. Leave out the cabins, the support legs and the background. Centre the hub exactly in the middle of the image; the rim fills about 90% of the image width."),
 ('SCN-03', 'wheel cabin', 'refs/mela_wheel_crop_day.png', "From the attached crop, draw ONE giant-wheel cabin (gondola) as a separate cut-out, front view, hanging straight down from its small top hook: the scalloped canopy roof and the open box seat, same painted style. Colour it red and yellow (code makes the other colours)."),
 ('SCN-04', 'clean plate · day', 'refs/mela_wheel_crop_day.png', "Edit the attached crop: remove the wheel's rotating rim, spokes and all the cabins, but keep the A-frame support legs, the centre axle and everything in front (tents, fence, light strings). Fill the space behind with sky, clouds, hills and buildings that continue naturally, in the same painted style and light. Keep the canvas size and everything else identical."),
 ('SCN-05', 'clean plate · dusk', 'refs/mela_wheel_crop_dusk.png', "Edit the attached dusk crop: remove the wheel's rotating rim, spokes and all the cabins, but keep the A-frame support legs, the centre axle and everything in front (tents, fence, glowing light strings). Fill the space behind with the dusk sky, clouds, hills and buildings that continue naturally, in the same painted style and light. Keep the canvas size and everything else identical."),
]:
    add(sid, 'P1' if sid in ('SCN-01', 'SCN-02', 'SCN-04', 'SCN-05') else 'P2', 'scene', nm, 'Scene element', f'mela_{nm.replace(" · ", "_").replace(" ", "_")}.png', SQ,
        'Scene edit', ref, 'hookA (wheel shot), level3, endA (n3: "the giant wheel starts to turn")', d, 'Animation A-11. Claude pastes it back into the 3838x2160 background. The painted wheel is slightly angled; at story scale a flat front-on rotation reads fine.')

# ------------------------------------------------------------------ prompt assembly
B = BLOCKS
def prompt(r):
    rid, prio, k, asset, typ, fn, canvas, method, attach, used, d, notes = r
    if method == 'Exists': return '(already made; no prompt needed)'
    canv = B['CANVAS_S'] if (k == 'gudiya') else B['CANVAS_P']
    if k in CH: name, ident = CH[k][1], CH[k][4]
    if method == 'New pose':
        return (f"Image 1 (attached) is the official design of {name}. Draw this SAME character in a new pose. Keep the face, hairstyle, body proportions, outfit, colours and every costume detail exactly as in Image 1.\n\n"
                f"CHARACTER (must match): {ident}\n\nPOSE AND ACTING: {d}\n\n{B['STYLE']}\n\n{canv}\n\n{B['CLEAN']}")
    if method == 'Region edit':
        area = 'eyes' if 'blink' in fn else ('mouth' if any(m in fn for m in ('_m0', '_m1', '_m2')) else 'the selected area')
        return f"Edit the attached image of {name}. Change ONLY the {area}:\n{d}\n\n{B['EDIT_TAIL']}"
    if method == 'Next frame':
        anim = fn.rsplit('_', 1)[0]; n = int(fn.rsplit('_', 1)[1][:2])
        tot = {'pari_walk': 6, 'aaru_run': 6, 'gudiya_trot': 6}[anim]
        return (f"Image 1 is the official design of {name}. Image 2 is the previous frame of a looping {anim.split('_')[1]} cycle. Draw frame {n} of {tot}, the very next moment after Image 2.\n\n"
                f"THIS FRAME: {d}\n\n{B['NEXT_TAIL']}\n\nCHARACTER (must match): {ident}\n\n{B['STYLE']}\n\n{canv}\n\n{B['CLEAN']}")
    if method == 'New character':
        return (f"Design a NEW character for the same children's storybook as the attached image. The attached image shows the ART STYLE ONLY, so do not copy that person. Match its style exactly (line weight, shading, palette warmth, eye style, proportion system) so the new character clearly belongs in the same story.\n\n"
                f"CHARACTER: {ident}\n\nPOSE AND ACTING: {d}\n\n{B['STYLE']}\n\n{canv}\n\n{B['CLEAN']}")
    if method == 'Prop':
        return (f"Draw a single prop for a children's storybook, matching the art style of the attached image (line weight, shading, warm palette). The attached image shows the style only, so do not draw the person.\n\nPROP: {d}\n\n{B['STYLE'].split(' Lifelike acting')[0].replace(', large expressive eyes, friendly rounded shapes', ', friendly rounded shapes')} Not photorealistic, not a 3D render, not flat vector art.\n\n"
                "CANVAS AND FRAMING: square image, 1024x1024. ONE object only, centred, filling about 70% of the image, with at least 100 px of empty space on every side, fully visible, viewed straight on.\n\n" + B['CLEAN'])
    if method == 'Scene edit':
        tail = "OUTPUT: a square 1024x1024 image." + (" A true transparent background around the cut-out: no sky, no checkerboard, no shadow, no text." if 'clean plate' not in asset else " A full painted image with no transparency, no text and no border.")
        return f"{d}\n\nSTYLE: match the attached painting exactly: same brushwork, outline weight, colours and lighting. Not photorealistic, not 3D.\n\n{tail}"
    raise ValueError(method)

HOW = {
 'Exists': 'Nothing to do.',
 'New pose': '1) Open (or continue) this character\'s chat. 2) Attach the file(s) listed. 3) Paste the prompt. 4) If it asks, pick Portrait (Square for Gudiya). 5) Download the PNG and save it as the File name.',
 'Region edit': '1) Attach the base image listed and send "edit this image", or open it in ChatGPT\'s image editor. 2) Click Select and paint ONLY over the area named in the prompt, with a small margin. 3) Paste the prompt. 4) Save as the File name. If the whole picture changes, undo and select a smaller area.',
 'Next frame': '1) Attach Image 1 = the reference and Image 2 = the previous frame, IN THAT ORDER. 2) Paste the prompt. 3) Make the frames in order (frame 3 needs frame 2). 4) Save as the File name.',
 'New character': '1) Start a NEW chat for this character. 2) Attach the style reference. 3) Paste the prompt. 4) Regenerate until you love the design. That image becomes their reference for every later pose.',
 'Prop': 'Attach the style reference, paste the prompt, choose Square, save as the File name.',
 'Scene edit': '1) Attach the crop listed from art_package/refs. 2) Paste the prompt. 3) Choose Square. 4) Save as the File name. Claude scales it back into the full background.',
}

# ------------------------------------------------------------------ scenes
SCENES = [
 (1, 'title', 'Village gate', 'Pari, Aaru, Gudiya', 'Pari (namaste) and Aaru slide in from the left; Gudiya slides in from the right and hops; tap Gudiya to make her bleat; t0 spoken; Play button.',
  'pari_happy (namaste), aaru_shout, gudiya_idle/hop', 'Characters glide in without moving their legs. Aaru shouts with no one talking. Nobody blinks. Gudiya bleats with her mouth shut.',
  'Pari walks in and turns into her namaste. Aaru runs in, lands in idle and waves. Gudiya trots in. Tapping her plays the bleat pose. Everyone blinks.', 'PAR-W1–W6, AAR-R2–R6, AAR-01, GOA-T1–T6, GOA-01, PAR-HABLINK', 'E-01, E-02, E-05, E-08', 'P1'),
 (2, 'hookA', 'Gate → Mela dusk → bazaar sweets → Mela → chaupal', 'Baba, Guddu', 'Opening montage under n1; MELA MONEY board counts to ₹6,00,000; Baba asks (b1); Guddu muddles the sum (g1), scratching his head, then writes.',
  'baba_idle/ask, guddu_write/scratch', 'Mouths never move on b1/g1. Guddu\'s scratch and write are frozen stills. The Mela shots are empty of people, and the giant wheel stands still.',
  'Lip-sync for Baba and Guddu. Scratch and write loops. Blinks. Crowd silhouettes in the Mela shots. The wheel turns slowly in the wheel shot.', 'BAB-ASM0/M2/BLINK, GUD-SCM0/M2/BLINK, GUD-S2–S3, GUD-W2–W4, SCN-01, SCN-03, SCN-04', 'E-01, E-02, E-03, E-09', 'P1'),
 (3, 'hookB', 'Chaupal', 'Guddu', 'Guddu writes alone, pages fly, the sun sinks (n2).',
  'guddu_write', 'One frozen write pose for ~9 s.', 'Write loop, then switch to "worried" (glancing at the sun, sweat drop) as the sun drops.', 'GUD-W2–W4, GUD-01', 'E-01, E-08', 'P1'),
 (4, 'hookC', 'Chaupal', 'Aaru, Gudiya, Pari', 'Aaru and Gudiya run in; Aaru: "ten crore!" (r1); Pari: wild guess ✕ (p1).',
  'aaru_run/shout, gudiya_hop/idle, pari_idle/point', 'The run is a single frame bobbing up and down (it reads as sliding). No lip-sync. Aaru doesn\'t react to the ✕.',
  'Real run and trot cycles with foot planting. Lip-sync on r1/p1. When the ✕ stamps, Aaru switches to "oops".', 'AAR-R2–R6, GOA-T1–T6, AAR-SHM0/M1, PAR-POM0/M2, AAR-02', 'E-01, E-03, E-05', 'P1'),
 (5, 'hookD', 'Chaupal (blurred close-up)', 'Pari', 'Rounding card 42,538→43,000 + 23,184→23,000 = 66,000; "Smart guess = Estimate" (p2).',
  'pari_point at 1.3× scale', 'Close-up on the longest line with a frozen face and a pointing pose aimed at nothing.', 'The "explain" pose presents the card with her open palm while counting on her fingers. Lip-sync and blinks are most visible here.', 'PAR-01, PAR-EXBLINK/M0/M2', 'E-02, E-03, E-07', 'P1'),
 (6, 'hookE', 'Chaupal', 'Aaru, Gudiya, Pari', 'Pari: "Let\'s go to the bazaar" (p3); Aaru jumps; the sign drops.',
  'aaru_shout→jump, gudiya_idle/hop, pari_point', 'Aaru stands in his "shouting" pose while Pari talks. The jump has no crouch or landing.', 'Aaru listens in "idle", then crouch → jump → land. They walk or run off toward the bazaar.', 'AAR-01, AAR-J0, AAR-J2, PAR-W*, AAR-R*', 'E-01, E-05, E-07', 'P1'),
 (7, 'level1', 'Aakoli Bazaar (7 stalls, pans)', 'Pari, Manju Mausi (+ 6 stall keepers)', 'GAME L1: round 7 price tags.',
  'pari_point, manju_teach', 'Manju has one pose and no voice. The 7 stalls have no one at them.', 'Manju teaches the rule (teach + lip-sync), reacts with "happy"/"hint". Each stall has its keeper idling and blinking, and the keeper cheers when their tag is rounded.', 'MAN-01–03, MAN-TE*, MAN-HI*, SHP-*, PAR-02/03/04, GOA-02, PRP-03', 'E-02, E-03, E-08, E-12', 'P1'),
 (8, 'bridge1', 'Bazaar', 'Pari, Aaru', 'Aaru celebrates (r2); Pari sends us to the office (p4).',
  'pari_happy/point, aaru_jump', 'No lip-sync; the cheer is a stock jump.', 'Aaru fist-pumps on "Correct-correct!", Pari cheers, lip-sync on both lines.', 'AAR-03, PAR-02, AAR-JUM0/M1, PAR-POM0/M2', 'E-03, E-07', 'P2'),
 (9, 'level2', 'Panchayat office', 'Guddu (behind counter), Pari', 'GAME L2: estimate the total of 7 bills.',
  'guddu_write, pari_point', 'Guddu frozen behind the counter.', 'Guddu\'s write loop runs the whole level (he is still adding); Pari reacts with thumbs-up/think.', 'GUD-W2–W4, PAR-03, PAR-04, PRP-02', 'E-01, E-08', 'P1'),
 (10, 'bridge2', 'Panchayat office', 'Guddu, Pari', 'Guddu amazed (g2); Pari: off to the Mela (p5).',
  'guddu_surprised, pari_idle/point', 'No lip-sync on g2/p5.', 'Lip-sync on both lines. Guddu glances at his notebook, then back up.', 'GUD-SUM0/M1, PAR-POM0/M2, PAR-IDBLINK', 'E-03', 'P2'),
 (11, 'level3', 'Mela Ground', 'Baba, Pari (+ 7 shopkeepers)', 'GAME L3: pay 7 shopkeepers from ₹6,00,000.',
  'baba_idle, pari_point', 'Nobody is paid on screen; there are no shopkeepers.', 'Each shopkeeper walks up; Baba holds out the money potli; the keeper does a "happy" namaste on payment (sfx coins).', 'BAB-01, SHP-*, PRP-01, PRP-02, SCN-01/03/04', 'E-01, E-05, E-09', 'P1'),
 (12, 'endA', 'Mela → dusk', '(none) + crowd', 'Sun sets, 7 bulbs, fireworks (n3).',
  'backgrounds only', 'n3 says "the giant wheel starts to turn", but it doesn\'t. The Mela is empty.', 'The wheel starts turning slowly as the lights come on. Crowd groups fade in, look up and point at the fireworks.', 'SCN-02, SCN-03, SCN-05, CRW-01–04', 'E-09, E-10, E-06', 'P1'),
 (13, 'endB', 'Mela dusk', 'Pari, Guddu, Baba', 'Guddu: exactly ₹83,380 (g3); Pari: about ₹84,000 (p6); ≈ banner.',
  'pari_happy, guddu_proud, baba_idle', 'Daylight-lit characters on a dusk background look pasted on. No lip-sync.', 'Dusk grade and rim light on the characters. Lip-sync. Guddu "finished" with his long scroll. Baba blesses.', 'GUD-PRM1/M2/BLINK, GUD-02, PAR-HAM1/M2, BAB-02, CRW-*', 'E-03, E-06', 'P1'),
 (14, 'endC', 'Mela dusk', 'Aaru, Gudiya (+ Sarpanch)', 'Aaru: jalebi for everyone (r3); jalebi rain; n4: the Sarpanch gives you a gold badge.',
  'aaru_jump, gudiya_idle/hop', 'The Sarpanch is mentioned but never shown. Nobody eats a jalebi.', 'Aaru bites a jalebi; Gudiya chews one; the Sarpanch steps in holding out the badge on n4.', 'AAR-04, GOA-CH1/CH2, SAR-01/02, PRP-04', 'E-01, E-06', 'P2'),
 (15, 'badge', 'Blurred Mela dusk', '(none)', 'Badge card, x1 voice, Play again.',
  '-', 'Empty apart from the card.', 'Optional: Pari, Aaru and Gudiya cheer around the card, reusing their cheer poses.', 'PAR-02, AAR-03, GOA-01', 'E-01', 'P3'),
]

ANIMS = [
 ('A-01', 'pari', 'Walk cycle', 'pari_walk_01 … 06', 6, 10, 'Loop', 'Even timing. Move her 22 px per frame at stage scale so her feet don\'t slide.', 'title, exits'),
 ('A-02', 'aaru', 'Run cycle', 'aaru_run_01 (existing) … 06', 6, 12, 'Loop', 'Even timing; ~38 px travel per frame.', 'title, hookC'),
 ('A-03', 'aaru', 'Jump', 'aaru_jump_crouch → aaru_jump (existing) → aaru_jump_land → idle', 3, 0, 'Once', 'Crouch 0.12 s, then air for the whole flight (engine jump()), then land 0.15 s.', 'hookE, bridge1, endC'),
 ('A-04', 'gudiya', 'Trot cycle', 'gudiya_trot_01 … 06', 6, 12, 'Loop', 'Even timing; ~30 px travel per frame.', 'title, hookC'),
 ('A-05', 'guddu', 'Writing loop', 'guddu_write_01, 02, 03, 02, 01 … (04 every few loops)', 4, 6, 'Ping-pong', 'Frame 04 (glance up) is inserted randomly every 3–6 s.', 'hookA, hookB, level2'),
 ('A-06', 'guddu', 'Head scratch', 'guddu_scratch_01, 02, 03, 02', 3, 8, 'Ping-pong', 'Only while g1 plays.', 'hookA'),
 ('A-07', 'gudiya', 'Tail wag', 'gudiya_idle → tail_01 → idle → tail_02', 3, 10, 'Occasional burst', '2–3 wags every 4–7 s.', 'all Gudiya scenes'),
 ('A-08', 'gudiya', 'Chew', 'gudiya_chew_01, 02', 2, 5, 'Loop', '', 'endC'),
 ('A-09', 'all', 'Blink', '<pose> → <pose>_blink → <pose>', 2, 0, 'Random', 'Closed for ~90 ms, every 2.5–5 s at random; sometimes a double blink.', 'everywhere'),
 ('A-10', 'all talking', 'Lip-sync', '<pose>_m0 / m1 / m2', 3, 30, 'Driven by voice', 'Code reads the voice loudness 30×/s: quiet → m0, medium → m1, loud → m2, with smoothing so it never flickers.', 'every spoken line'),
 ('A-11', 'scene', 'Giant wheel turning', 'mela_wheel_ring_* + mela_wheel_cabin', 1, 0, 'Code rotation', 'The ring rotates once every ~40 s; the cabins hang from rim points and counter-rotate so they stay upright.', 'hookA, level3, endA'),
]

ENGINE = [
 ('E-01', 'Frame-sequence animator', 'A small anim(o, name, fps, mode) in engine.js that swaps frames of a character (loop, once, ping-pong) using the same img stack char() already builds.', 'All frame animations', 'P1'),
 ('E-02', 'Auto-blink', 'A per-character timer shows <pose>_blink for ~90 ms every 2.5–5 s (random, sometimes double). Pauses while the character jumps or turns.', 'All scenes', 'P1'),
 ('E-03', 'Lip-sync from the voice', 'An AnalyserNode on voiceBus reads the loudness of the current line and switches the speaker\'s mouth m0/m1/m2. It is hooked into say(), so every line gets it with no timing work.', 'Every spoken line', 'P1'),
 ('E-04', 'Face-patch overlays', 'Build step: diff each face variant against its base pose and cut just the eyes/mouth patch with its offset, so only that patch is layered and there is no full-image ghosting or drift. Run by the asset pipeline (E-11).', 'Blink + lip-sync', 'P1'),
 ('E-05', 'Walk/run-in with planted feet', 'Replace the sliding fromTo(x) entrances with cycle + travel speed matched per frame, and an ease into the final pose.', 'title, hookC, hookE, level3', 'P1'),
 ('E-06', 'Per-scene character lighting', 'Grade the characters to match each plate: warm in the office, dusk orange rim light + darker body at the evening Mela, cooler shade under the banyan. CSS filters + a rim-light overlay.', 'level2, endA–endC', 'P1'),
 ('E-07', 'Better pose changes', 'Anticipation (a small dip) before a pose change, a little overshoot after. Instant swap for matched frames instead of the 0.14 s crossfade, which ghosts two poses.', 'All scenes', 'P2'),
 ('E-08', 'Idle variety', 'Weight shifts, turning to look at whoever is speaking, occasional micro-gestures; Guddu pushes his glasses up and checks the sun.', 'All scenes', 'P2'),
 ('E-09', 'Giant wheel rig', 'Layer the clean plate, rotating ring and upright cabins over bg_05_mela / dusk, with the bulb glow pulsing at dusk.', 'hookA, level3, endA–endC', 'P1'),
 ('E-10', 'Ambient life', 'Banyan leaves and marigold garlands sway (shader-free wobble on cut-outs), bunting flutter, steam over the sweets kadhai, the crowd bobbing.', 'hookA–hookE, endA–endC', 'P3'),
 ('E-11', 'Asset pipeline (Claude runs it)', 'incoming/*.png → defringe the alpha, trim, align to the base pose (feet baseline + head), scale to 1350 px tall, WebP; build the face patches (E-04); make preview GIFs and animated WebPs.', 'All new art', 'P1'),
 ('E-12', 'Shopkeepers in the bazaar', 'Place the 6 keepers + Manju at their stalls on the panning bazaar (children of the .bg so they pan with it) at ~0.6 scale with depth blur.', 'level1, bridge1', 'P2'),
]

# ------------------------------------------------------------------ write workbook
F = 'Arial'
INK, CREAM, SAFF, GREEN, RED = '3A220F', 'FFFAF0', 'E8870E', '1F6B3A', 'B5361D'
hfont = Font(name=F, bold=True, color=CREAM, size=11)
hfill = PatternFill('solid', fgColor=INK)
base = Font(name=F, size=10)
bold = Font(name=F, size=10, bold=True)
wrap = Alignment(wrap_text=True, vertical='top')
thin = Side(style='thin', color='D9CBB0')
box = Border(left=thin, right=thin, top=thin, bottom=thin)
PRIO_FILL = {'P1': 'F8D7CF', 'P2': 'FDEBC8', 'P3': 'E3EEDB'}

def sheet(wb, title, headers, rows, widths, freeze='B2', heights=None):
    ws = wb.create_sheet(title)
    ws.append(headers)
    for c in ws[1]: c.font, c.fill, c.alignment, c.border = hfont, hfill, Alignment(wrap_text=True, vertical='center'), box
    ws.row_dimensions[1].height = 30
    for r in rows:
        ws.append(list(r))
    for row in ws.iter_rows(min_row=2):
        for c in row: c.font, c.alignment, c.border = base, wrap, box
    for i, w in enumerate(widths): ws.column_dimensions[chr(65 + i) if i < 26 else 'A' + chr(65 + i - 26)].width = w
    ws.freeze_panes = freeze
    ws.auto_filter.ref = ws.dimensions
    return ws

def est_h(texts, widths, minh=30, maxh=400):
    lines = 1
    for t, w in zip(texts, widths):
        if not t: continue
        s = str(t); per = max(8, int(w * 1.15))
        lines = max(lines, sum(len(p) // per + 1 for p in s.split('\n')))
    return max(minh, min(maxh, lines * 13 + 6))

wb = Workbook(); wb.remove(wb.active)

# Start Here
ws = wb.create_sheet('Start Here')
ws.column_dimensions['A'].width = 4; ws.column_dimensions['B'].width = 26; ws.column_dimensions['C'].width = 110
rows = [
 ('title', 'The Mela Before Sunset: character & scene art plan'),
 ('sub', 'Everything needed to make the characters and scenes feel alive, plus a ready-to-paste ChatGPT image prompt for every sprite and animation frame.'),
 ('', ''),
 ('h', 'What "real to life" means here'),
 ('What we keep', 'The current hand-painted storybook style. Every background, the existing 16 poses and the dialogue boxes are painted this way; a photo-real character would look cut out against them and would mean redrawing every scene.'),
 ('What we add', 'Life and acting: blinking, mouths that move with the voice, real walk/run/trot cycles instead of sliding, reaction poses (oops, cheer, hint), characters lit to match each scene, people at the stalls and the Mela, and a giant wheel that actually turns.'),
 ('If you want a more realistic render', 'Tell Claude and it will change the ART STYLE block on "Prompt Rules" and rebuild every prompt (art_package/tools/build_art_sheet.py). The backgrounds would then need repainting too.'),
 ('', ''),
 ('h', 'Tabs'),
 ('Scenes', 'All 15 screens: who is on screen, what looks fake now, the lifelike upgrade, and the sprite/engine IDs it needs.'),
 ('Characters', 'Character bible: role, how each one moves, and the IDENTITY LOCK text that goes into every prompt so the outfit never drifts.'),
 ('Sprites', 'THE WORK LIST. One row = one ChatGPT image. Copy the PROMPT column. Track progress in the Status column.'),
 ('Animations', 'How the frames are played: order, fps, loop type, plus the GIF/WebP preview commands.'),
 ('Prompt Rules', 'The prompt building blocks, the ChatGPT step-by-step, and fixes for the common ChatGPT failures (overlaps, cropping, checkerboards…).'),
 ('Engine Work', 'Code jobs Claude does (blink, lip-sync, cycles, lighting, wheel rig, asset pipeline). No art needed.'),
 ('Summary', 'Live counts by character, priority and status.'),
 ('', ''),
 ('h', 'How to make the sprites (short version)'),
 ('1. Work by character', 'One ChatGPT chat per character, so the design stays consistent. Filter the Sprites tab by Character.'),
 ('2. Always attach the reference', 'Every prompt names the files to attach. They are in art_package/refs/ (PNG copies of the current art). For new characters, the first image you approve becomes their reference.'),
 ('3. One image per prompt', 'Never ask for several poses or frames in one image. That is what makes ChatGPT overlap figures and change their size. The prompts already forbid sprite sheets.'),
 ('4. Edits for faces', 'Blinks, mouths and small loops use ChatGPT\'s image edit with Select: paint only the eyes or mouth. Everything else stays put, so the frames line up.'),
 ('5. Save exactly as named', 'Download as PNG, rename to the File name column, put it in art_package/incoming/. Don\'t resize, crop or upscale; the pipeline does that.'),
 ('6. Mark the status', 'Set Status to Done (or Needs redo). Then tell Claude "process incoming": it aligns, cleans and converts everything and wires it into the story.'),
 ('', ''),
 ('h', 'About GIFs'),
 ('Use GIFs for previews only', 'A GIF has only 256 colours and hard on/off transparency, so painted shading bands and the edges turn jagged against moving backgrounds. The story itself will use clean PNG/WebP frame strips with real transparency. GIFs (and animated WebPs, which look much better) are made from the same frames for reviewing and sharing. The commands are on the Animations tab.'),
 ('', ''),
 ('h', 'Priority and status'),
 ('P1', 'Biggest lifelike gain for the effort: lip-sync and blinks for the talking cast, run/trot/write cycles, Pari explain, Aaru idle/oops, Manju\'s L1 set, the turning wheel.'),
 ('P2', 'Important polish: more poses, walk cycle, shopkeepers, Sarpanch, props.'),
 ('P3', 'Nice to have: crowd, tail wag, chewing, extra blinks.'),
 ('Status values', 'To do · Generating · Needs redo · Done · Exists (already in the story).'),
 ('', ''),
 ('h', 'Open decisions'),
 ('Sarpanch', 'n4 says "The Sarpanch gives you a gold badge", but no Sarpanch appears. Either design one (SAR rows) or make Baba the Sarpanch and re-voice n4.'),
 ('Shopkeepers', 'p4/p5 say the same shopkeepers send bills and are paid. The plan uses the 7 bazaar stalls: 6 new keepers + Manju Mausi (sweets & tea). Names and looks are suggestions.'),
 ('Manju\'s voice', 'She teaches the L1 rule but has no voice lines yet. New lines need new Gemini TTS voices (CLAUDE.md §9).'),
]
r = 1
for k, v in rows:
    if k == 'title': ws.cell(r, 2, v).font = Font(name=F, size=18, bold=True, color=INK)
    elif k == 'sub': ws.cell(r, 2, v).font = Font(name=F, size=11, italic=True, color='6B4A2B')
    elif k == 'h':
        c = ws.cell(r, 2, v); c.font = Font(name=F, size=12, bold=True, color=CREAM); c.fill = PatternFill('solid', fgColor=SAFF)
        ws.cell(r, 3).fill = PatternFill('solid', fgColor=SAFF)
    elif k:
        a = ws.cell(r, 2, k); a.font = bold; a.alignment = wrap
        b = ws.cell(r, 3, v); b.font = base; b.alignment = wrap
        ws.row_dimensions[r].height = est_h([v], [110], 16)
    r += 1
ws.sheet_view.showGridLines = False

# Scenes
sw = [5, 10, 22, 22, 40, 28, 40, 44, 34, 18, 8]
ws = sheet(wb, 'Scenes', ['#', 'Screen id', 'Location', 'Characters', 'What happens', 'Art used now', 'What looks fake now', 'Lifelike upgrade', 'Sprites needed (IDs)', 'Engine work', 'Priority'], SCENES, sw, 'C2')
for i, s in enumerate(SCENES, start=2):
    ws.row_dimensions[i].height = est_h(s, sw)
    ws.cell(i, 11).fill = PatternFill('solid', fgColor=PRIO_FILL.get(s[10], 'FFFFFF'))

# Characters
cw = [10, 18, 30, 40, 90, 24, 10]
crow = [(c[0], c[1], c[2], c[3], c[4], c[5], c[6]) for c in CHARS]
ws = sheet(wb, 'Characters', ['Key', 'Name', 'Role', 'How they move (acting)', 'IDENTITY LOCK (pasted into every prompt)', 'Reference image', 'Stage height (px)'], crow, cw, 'C2')
for i, c in enumerate(crow, start=2): ws.row_dimensions[i].height = est_h(c, cw)

# Sprites
spw = [11, 7, 10, 20, 14, 30, 16, 14, 30, 42, 26, 46, 100, 12, 34]
srows = []
for rr in R:
    rid, prio, k, asset, typ, fn, canvas, method, attach, used, d, notes = rr
    srows.append([rid, prio, CH[k][1] if k in CH else k.capitalize(), asset, typ, fn, canvas, method, attach, HOW[method], used, d, prompt(rr),
                  'Exists' if method == 'Exists' else 'To do', notes])
ws = sheet(wb, 'Sprites', ['ID', 'Priority', 'Character', 'Asset', 'Type', 'File name (save as)', 'Canvas', 'Method', 'Attach in ChatGPT (from art_package/)', 'How', 'Used in', 'Pose / change (the part that differs)', 'PROMPT: copy this into ChatGPT', 'Status', 'Notes'], srows, spw, 'D2')
for i, s in enumerate(srows, start=2):
    ws.row_dimensions[i].height = est_h([s[12], s[9], s[11]], [spw[12], spw[9], spw[11]], 30, 409)
    pc = ws.cell(i, 2); pc.fill = PatternFill('solid', fgColor=PRIO_FILL.get(s[1], 'EEEEEE')); pc.font = bold
    ws.cell(i, 1).font = bold
    ws.cell(i, 13).font = Font(name='Arial', size=9)
dv = DataValidation(type='list', formula1='"To do,Generating,Needs redo,Done,Exists"', allow_blank=True)
ws.add_data_validation(dv); dv.add(f'N2:N{len(srows) + 1}')
n = len(srows) + 1
for txt, col in [('Done', 'C6E7C1'), ('Needs redo', 'F4B6A8'), ('Generating', 'FFE7A3'), ('Exists', 'E2E2E2')]:
    ws.conditional_formatting.add(f'N2:N{n}', FormulaRule(formula=[f'$N2="{txt}"'], fill=PatternFill('solid', fgColor=col)))

# Animations
aw = [7, 12, 18, 40, 9, 7, 14, 46, 22, 70, 70]
arows = []
for a in ANIMS:
    aid, k, nm, frames, cnt, fps, loop, timing, used = a
    if fps and 'pose' not in frames and 'code' not in loop.lower() and 'voice' not in loop.lower() and aid not in ('A-03', 'A-05', 'A-06', 'A-07'):
        stem = frames.split(' ')[0].rsplit('_', 1)[0]
        gif = f'ffmpeg -framerate {fps} -i art_package/processed/{stem}_%02d.png -filter_complex "[0]scale=-2:540:flags=lanczos,split[a][b];[a]palettegen=reserve_transparent=1[p];[b][p]paletteuse=alpha_threshold=128" -loop 0 art_package/previews/{stem}.gif'
        webp = f'ffmpeg -framerate {fps} -i art_package/processed/{stem}_%02d.png -vf scale=-2:540:flags=lanczos -c:v libwebp_anim -lossless 0 -q:v 88 -loop 0 art_package/previews/{stem}.webp'
    else:
        gif = webp = 'Played by the engine (ping-pong, random or code-driven order). Claude renders a preview clip on request.'
    arows.append([aid, k, nm, frames, cnt, fps or '-', loop, timing, used, gif, webp])
ws = sheet(wb, 'Animations', ['ID', 'Character', 'Animation', 'Frames, in play order', 'Frames', 'FPS', 'Loop', 'Timing notes', 'Used in', 'GIF preview command (after "process incoming")', 'Animated WebP preview (better quality)'], arows, aw, 'C2')
for i, a in enumerate(arows, start=2): ws.row_dimensions[i].height = est_h(a, aw)

# Prompt Rules
ws = wb.create_sheet('Prompt Rules')
ws.column_dimensions['A'].width = 28; ws.column_dimensions['B'].width = 120
def hdr(r, t):
    c = ws.cell(r, 1, t); c.font = Font(name=F, size=12, bold=True, color=CREAM); c.fill = PatternFill('solid', fgColor=SAFF); ws.cell(r, 2).fill = PatternFill('solid', fgColor=SAFF)
def kv(r, k, v):
    a = ws.cell(r, 1, k); a.font = bold; a.alignment = wrap; b = ws.cell(r, 2, v); b.font = base; b.alignment = wrap; b.border = box
    ws.row_dimensions[r].height = est_h([v], [120], 18)
r = 1
ws.cell(r, 1, 'Prompt building blocks').font = Font(name=F, size=16, bold=True, color=INK); r += 1
ws.cell(r, 1, 'Every prompt on the Sprites tab is assembled from these blocks plus the character\'s identity lock and the pose text. To change them all, edit the blocks in tools/build_art_sheet.py and re-run it (or ask Claude).').font = Font(name=F, size=10, italic=True); r += 2
hdr(r, 'Blocks'); r += 1
for k, lab in [('STYLE', 'Art style'), ('CANVAS_P', 'Canvas: people (portrait)'), ('CANVAS_S', 'Canvas: Gudiya (square)'), ('CLEAN', 'Clean-sprite rules'), ('EDIT_TAIL', 'Region-edit lock'), ('NEXT_TAIL', 'Next-frame alignment')]:
    kv(r, lab, B[k]); r += 1
for k, lab in [('m0', 'Mouth m0 (closed)'), ('m1', 'Mouth m1 (slightly open)'), ('m2', 'Mouth m2 (wide)'), ('blink', 'Blink')]:
    kv(r, lab, MOUTH[k]); r += 1
r += 1; hdr(r, 'ChatGPT step by step'); r += 1
for k, v in [
 ('Before you start', 'Use ChatGPT with image generation (GPT-4o / gpt-image). Have art_package/refs/ open so you can drag files in.'),
 ('One chat per character', 'Start a new chat per character and keep all of that character\'s poses in it. Start a fresh chat if the style starts drifting after ~15 images.'),
 ('Order of work', 'Within a character: 1) new poses, 2) animation frames in order, 3) face variants (blink/mouths) last, because they edit the finished poses.'),
 ('Attaching', 'Attach images in the order the prompt names them (Image 1, Image 2). Then paste the whole prompt as one message.'),
 ('Region edits', 'Click the image → Edit (or the brush/Select icon) → paint ONLY the eyes or mouth (or the hand + pen for writing frames), leaving a small margin → paste the prompt.'),
 ('Check before saving', 'Use the QA checklist below. If anything fails, regenerate (don\'t fix it by hand): nothing cropped, one figure, transparent background, outfit matches, five fingers, feet on the same line as the other frames.'),
 ('Saving', 'Download the PNG (not a screenshot). Rename it to the File name and save it to art_package/incoming/. Don\'t resize or crop.'),
]: kv(r, k, v); r += 1
r += 1; hdr(r, 'QA checklist (every image)'); r += 1
for k, v in [
 ('One figure', 'Exactly one character, one pose. No second copy, no inset, no turnaround.'),
 ('Not cropped', 'Head, hair/turban, hands, props, feet/hooves all fully inside, with empty space on every side.'),
 ('Clean background', 'Real transparency (it looks like a grey/white checkerboard only in the viewer, not baked into the picture). No floor, shadow or scenery.'),
 ('On-model', 'Compare with the reference: face shape, hair, colours, stripes, ribbons, glasses, bell, backpack.'),
 ('Hands and limbs', 'Five fingers, nothing fused, arms clearly separate from the body where they should be.'),
 ('Lines and colour', 'Same outline weight and warm palette as the reference. No glossy 3D look, no sticker outline.'),
 ('Frames line up', 'For animation/face edits: same size and position as the previous frame or base image. Flip between them quickly to check.'),
]: kv(r, k, v); r += 1
r += 1; hdr(r, 'When ChatGPT goes wrong → what to say'); r += 1
for k, v in [
 ('Draws a checkerboard pattern', '"The background must be truly transparent (alpha), not a drawn checkerboard." If it still happens, ask for "a plain flat pure-white #FFFFFF background, nothing else". Claude can key white out cleanly because the outlines are dark brown.'),
 ('Feet or head cut off', '"Zoom out. The entire body must fit with at least 80 px of empty space below the feet and above the head."'),
 ('Two characters / a sprite sheet', '"Only ONE character in ONE pose in the whole image. Remove all other copies." Then regenerate from the original prompt.'),
 ('Outfit or face drifts', 'Re-attach the reference and name the exact detail: "Keep the orange-and-white stripes the same width as Image 1", "the ribbons are red bows at shoulder height". Start a fresh chat if it keeps drifting.'),
 ('Turns 3D / glossy / anime', '"Flat 2D storybook painting exactly like Image 1: same ink outlines and soft painterly shading. Not 3D."'),
 ('Size changes between frames', '"Same scale as Image 2: the top of the head and the soles of the feet at the same height as Image 2." (Claude\'s pipeline also normalises size, but big jumps hurt the animation.)'),
 ('Extra or fused fingers', 'Region-edit the hand: select only the hand → "Redraw this hand naturally with five separate fingers, same pose."'),
 ('Adds a shadow or floor', '"No ground, no floor, no shadow under the feet."'),
 ('Region edit changes the whole face', 'Undo and select a smaller area (just the eyes or just the mouth), then try again.'),
 ('White halo around the edges', 'Ignore it if it\'s faint; the pipeline defringes edges. If it\'s thick: "no white outline or sticker border".'),
 ('Mirrored instead of swapping legs', '"Do not flip the image. The character still faces the same direction; only the legs change."'),
]: kv(r, k, v); r += 1

# Engine Work
ew = [7, 30, 90, 30, 9]
ws = sheet(wb, 'Engine Work', ['ID', 'Task', 'What it does', 'Scenes', 'Priority'], ENGINE, ew, 'C2')
for i, e in enumerate(ENGINE, start=2):
    ws.row_dimensions[i].height = est_h(e, ew)
    ws.cell(i, 5).fill = PatternFill('solid', fgColor=PRIO_FILL.get(e[4], 'FFFFFF'))

# Summary (live formulas)
ws = wb.create_sheet('Summary')
ws.column_dimensions['A'].width = 24
for col in 'BCDEFG': ws.column_dimensions[col].width = 13
ws['A1'] = 'Sprite progress (live: counts the Sprites tab)'; ws['A1'].font = Font(name=F, size=14, bold=True, color=INK)
heads = ['Character', 'P1', 'P2', 'P3', 'To make', 'Done', 'Left']
for j, h in enumerate(heads, 1):
    c = ws.cell(3, j, h); c.font, c.fill, c.border = hfont, hfill, box
names = []
for rr in R:
    nm = CH[rr[2]][1] if rr[2] in CH else rr[2].capitalize()
    if nm not in names: names.append(nm)
rng = lambda col: f"Sprites!${col}$2:${col}${len(R) + 1}"
for i, nm in enumerate(names, start=4):
    ws.cell(i, 1, nm)
    for j, p in enumerate(['P1', 'P2', 'P3'], start=2):
        ws.cell(i, j, f'=COUNTIFS({rng("C")},$A{i},{rng("B")},"{p}")')
    ws.cell(i, 5, f'=SUM(B{i}:D{i})')
    ws.cell(i, 6, f'=COUNTIFS({rng("C")},$A{i},{rng("N")},"Done")')
    ws.cell(i, 7, f'=E{i}-F{i}')
last = 3 + len(names); t = last + 1
ws.cell(t, 1, 'TOTAL')
for j in range(2, 8):
    L = chr(64 + j); ws.cell(t, j, f'=SUM({L}4:{L}{last})')
for row in ws.iter_rows(min_row=4, max_row=t, max_col=7):
    for c in row: c.font, c.border = (bold if c.row == t else base), box
s0 = t + 2
ws.cell(s0, 1, 'By status').font = Font(name=F, size=12, bold=True, color=INK)
for k, st in enumerate(['To do', 'Generating', 'Needs redo', 'Done', 'Exists']):
    ws.cell(s0 + 1 + k, 1, st).font = base
    c = ws.cell(s0 + 1 + k, 2, f'=COUNTIF({rng("N")},A{s0 + 1 + k})'); c.font = base; c.border = box
ws.cell(s0 + 7, 1, 'Counts recalculate when the file is opened in Excel, Google Sheets or Numbers.').font = Font(name=F, size=9, italic=True, color='6B4A2B')

wb.calculation.fullCalcOnLoad = True
order = ['Start Here', 'Scenes', 'Characters', 'Sprites', 'Animations', 'Prompt Rules', 'Engine Work', 'Summary']
wb._sheets = [wb[s] for s in order]
wb.save(OUT)
print('rows', len(R), 'to make', sum(1 for x in R if x[7] != 'Exists'), '->', os.path.abspath(OUT))
