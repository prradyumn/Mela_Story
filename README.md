# The Mela Before Sunset

Interactive motion-graphic story + estimation game for Grade 6 (round to the nearest thousand, then add / subtract).

```bash
python3 -m http.server 8123      # then open http://localhost:8123/
```

- Full story: `/`  ·  Level 1 game only: `/?scene=level1`  ·  faster: add `&speed=3`  ·  start at a shop: `&shop=4`
- Share as one file: `python3 tools/build.py` → `dist/The_Mela_Before_Sunset.html`
- Game voices: open `tools/voice_studio.html`, paste a Gemini key (stays in the browser), generate, then `tools/convert_vo.sh`

Project map, rules and next steps for developers / Claude sessions: **CLAUDE.md**.
