# Generates the walk / run / trot frames with Gemini. Usage: python sprites.py <job> [<job> ...]
# Raw generations -> art_package/raw/, keyed transparent sprites -> art_package/sprites/.
import os, sys
from concurrent.futures import ThreadPoolExecutor
from gen import generate, key_out, on_bg, trim, ROOT, MAGENTA, GREEN
from PIL import Image

RAW, OUT, REFS = (os.path.join(ROOT, d) for d in ('raw', 'sprites', 'refs'))
os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)

LOOK = {
 'pari': "Pari: an Indian schoolgirl of about 11. Dark-brown hair in two long plaits with red ribbon bows at shoulder height; light-blue short-sleeved collared shirt; navy-blue knee-length pleated pinafore dress; brown school backpack on both shoulders; white ankle socks; black Mary-Jane shoes.",
 'aaru': "Aaru: a cheerful cartoon character from a children's storybook. Messy curly dark-brown hair; orange-and-white horizontally striped T-shirt; rolled-up blue denim shorts; navy-blue flip-flops.",
 'gudiya': "Gudiya: a baby goat. Fluffy cream-white fur with light-brown patches, short curved brown horns, floppy ears with pink insides, big brown eyes, red ribbon collar with a brass bell, short fluffy tail, dark-brown hooves.",
}
KEYC = {'gudiya': (GREEN, 'bright green (#00FF00)')}
RULES = ("Draw ONE new image of this exact same character: the same face, hair, outfit, colours and proportions, in exactly the same art style as Image 1 "
         "(hand-painted 2D children's storybook illustration, clean dark-brown ink outlines, soft painterly shading, warm colours; not 3D, not photorealistic, not anime).\n"
         "Exactly one character in one pose: not a sprite sheet, with no extra copies, views or close-ups.\n"
         "Show the full body from the top of the head to the soles of the feet, with nothing cropped. Centre the character, leave generous empty space on every side, and put the feet near the bottom of the image.\n"
         "BACKGROUND: a perfectly flat, solid {bgname} everywhere around the character: one uniform colour with no gradient, no floor, no ground shadow, no scenery and no text. The background colour must not tint, light or reflect on the character.")
SAME = ("Keep the character exactly the same size as in Image 2, in the same place in the frame, facing the same direction (to the right). Do NOT mirror or flip the image.")

def P(k, pose, prev=False):
    return (f"Image 1 is the official character design. {'Image 2 is the previous frame of the same animation. ' if prev else ''}{LOOK[k]}\n\n"
            f"POSE: {pose}\n\n{SAME if prev else ''}\n\n" + RULES.format(bgname=KEYC.get(k, (MAGENTA, 'magenta (#FF00FF)'))[1]))

JOBS = {  # name: (char, ref, previous-frame job or None, aspect, pose)
 'pari_walk_01': ('pari', 'pari_idle', None, '2:3', "Walking to the right in a three-quarter view, frame 1 of a 4-frame walk loop, CONTACT pose: the leading foot's heel touches the ground ahead of her, the back foot is behind her on its toes, the arms swing opposite to the legs, the plaits swing slightly back, a gentle smile, looking ahead to the right."),
 'pari_walk_02': ('pari', 'pari_idle', 'pari_walk_01', '2:3', "Frame 2 of the walk loop, PASSING pose: the leading foot from Image 2 is now flat on the ground directly under her body, and the other leg swings forward past it with the knee bent and that foot just off the ground. Both arms hang close to her sides. Her body is slightly more upright than in Image 2."),
 'pari_walk_03': ('pari', 'pari_idle', 'pari_walk_02', '2:3', "Frame 3 of the walk loop, CONTACT pose again but with the legs swapped compared to frame 1: the leg that was swinging in Image 2 is now in front with its heel touching down, the other foot behind on its toes, and the arms swing the opposite way."),
 'pari_walk_04': ('pari', 'pari_idle', 'pari_walk_03', '2:3', "Frame 4 of the walk loop, PASSING pose on the other leg: the front foot from Image 2 is now flat under her body, and the back leg swings forward past it with the knee bent. Both arms hang close to her sides."),
 'aaru_run_02': ('aaru', 'aaru_run', None, '2:3', "Frame 2 of a 4-frame run loop; Image 1 is frame 1. Keep the same size and the same direction as Image 1 (running to the right), and do not mirror it. PASSING pose: the leg that was in front in Image 2 is now planted on the ground under his hips with the knee bent, and the back leg swings forward past it with the knee bent and the foot lifted. The arms are bent and close to his body, a joyful open grin."),
 'aaru_run_03': ('aaru', 'aaru_run', 'aaru_run_02', '2:3', "Frame 3 of the run loop. The same kind of stride as the very first run frame, but with the legs SWAPPED: the other leg now reaches forward and the opposite arm swings forward, with both feet just off the ground."),
 'aaru_run_04': ('aaru', 'aaru_run', 'aaru_run_03', '2:3', "Frame 4 of the run loop. PASSING pose on the other leg: the front leg from Image 2 is now planted under his hips with the knee bent, and the back leg swings forward past it with the knee bent. The arms are bent and close to his body."),
 'gudiya_trot_01': ('gudiya', 'gudiya_idle', None, '4:3', "Trotting happily to the right, seen from the side (three-quarter view), frame 1 of a 4-frame trot loop. A natural goat trot: the legs move in diagonal pairs. Here the near front leg and the far back leg are stretched forward, and the far front leg and the near back leg are stretched back, so all four legs are clearly visible and spread apart. Her body is level, head up, ears flopping back, the bell swinging, a happy open-mouthed smile. Her fur is cream-white exactly like Image 1, not pink."),
 'gudiya_trot_02': ('gudiya', 'gudiya_idle', 'gudiya_trot_01', '4:3', "Frame 2 of the trot loop, PASSING pose: all four legs are gathered under her body with the knees softly bent, the reaching legs from Image 2 now planted and the other two swinging forward. Ears dropping a little."),
 'gudiya_trot_03': ('gudiya', 'gudiya_idle', 'gudiya_trot_02', '4:3', "Frame 3 of the trot loop: like frame 1 but with the leg pairs SWAPPED: now her front-right and back-left legs reach forward together while the other two push back."),
 'gudiya_trot_04': ('gudiya', 'gudiya_idle', 'gudiya_trot_03', '4:3', "Frame 4 of the trot loop, PASSING pose again: all four legs gathered under her body with the knees softly bent, the other pair now swinging forward."),
}

def bgc(k): return KEYC.get(k, (MAGENTA,))[0]
def ref_img(name, k):  # an existing sprite from refs/ or a frame already generated in raw/
    p = os.path.join(RAW, name + '.png')
    return Image.open(p).convert('RGB') if os.path.exists(p) else on_bg(os.path.join(REFS, name + '.png'), bgc(k))

def run(job):
    k, ref, prev, aspect, pose = JOBS[job]
    imgs = [on_bg(os.path.join(REFS, ref + '.png'), bgc(k))] + ([ref_img(prev, k)] if prev else [])
    img = generate(P(k, pose, bool(prev)), imgs, aspect=aspect)
    img.save(os.path.join(RAW, job + '.png'))
    trim(key_out(img), 4).save(os.path.join(OUT, job + '.png'))
    print('done', job, img.size, flush=True)

if __name__ == '__main__':
    jobs = sys.argv[1:]
    with ThreadPoolExecutor(4) as ex: list(ex.map(run, jobs))
