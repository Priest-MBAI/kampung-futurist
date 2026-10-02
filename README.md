# The Kampung Futurist: a virtual influencer built with Claude Code

**Marcus Goh**, 38, is an ex-hardware engineer who tests the newest AI on Singapore's toughest critics: void-deck uncles, kopitiam aunties and hawkers. He is not real. He was built for a class exercise in the SMU MBAI module **AI-Powered Marketing (MKTG 644)**, end to end, by **Claude Code**: planning, browser automation in Google Flow, editing, motion graphics, sound and QA.

▶ **Presentation (live):** **https://priest-mbai.github.io/kampung-futurist/docs/presentation/** (← → to move between pages, F for fullscreen, `#2` jumps to page 2). Source: [`docs/presentation/index.html`](docs/presentation/index.html).

| Episode | Length | What it is |
|---|---|---|
| [EP0: sizzle reel](ep0-sizzle/final/kampung-futurist-15s.mp4) | 15s | Marcus introduces himself: void deck → kopitiam |
| [EP1: "How Alan built me"](explainers/final/kampung-futurist-ep1.mp4) | 40s | Claude Code vs Claude Chat, and the workflow behind Marcus |
| [EP2: "Type /init first"](explainers/final/kampung-futurist-ep2.mp4) | 33s | Why `/init` (CLAUDE.md / AGENTS.md) is the first command to run |

## How it was made

1. **Plan mode.** One brief; Claude Code interviewed me one question at a time (look, voice, hook, location), then wrote the [persona bible](docs/persona.md) and [storyboard](docs/STORYBOARD.md).
2. **Generate.** Claude Code drove **Google Flow** in Chrome: a reusable *character* (portrait + voice), 19 real-location clips with **Omni 1.1 Flash**, and an original theme song in **Flow Music**. I approved every credit spend and download.
3. **Edit as code.** `edit.py` / `edit.sh` cut, grade and mix with **ffmpeg**; **Remotion** renders the pop-ups and explainer graphics; SFX are synthesized in Python.
4. **QA.** **Whisper** word timestamps sync every pop-up and SFX hit to the spoken word, and they caught garbled AI speech ("ffmpeg", "kakis"). Frame contact sheets catch fake signage and faces covered by graphics.
5. **Refine.** My timestamped review notes → re-shoots and re-cuts until approved.

## Repo layout

```
docs/
  persona.md, STORYBOARD.md     persona, scripts, as-built notes
  presentation/                 2-page interactive deck + archify workflow diagram
ep0-sizzle/
  edit.sh                       15s reel edit (ffmpeg); assets/endcard.swift draws the end card
  clips/  final/  assets/       source clips, final video, end card, EP0 summary slide.html
explainers/
  edit.py                       builds EP1 + EP2 (trims, inserts, cutaways, overlays, SFX, ducked theme)
  graphics/                     Remotion project: src/*.tsx, overlays.json, fullframe.json, render.py
  sfx.py                        synthesizes the SFX kit → audio/sfx/
  transcribe.py                 Whisper word timings → qa/words/
  envelope.sh                   quick voice-band speech map for a clip
  watch-downloads.sh            copies finished Chrome downloads into clips/
  audio/  clips/  final/        theme song + SFX, source clips, final episodes
```

## Rebuild the videos

Requirements: macOS, `ffmpeg`, Python 3, Node 22+.

```bash
# 1. Graphics (Remotion) -> explainers/graphics/out/
cd explainers/graphics && npm install && python3 render.py && cd ..

# 2. EP1 + EP2 -> explainers/final/
python3 sfx.py          # optional: regenerate the SFX kit
python3 edit.py all

# 3. EP0 -> ep0-sizzle/final/
cd ../ep0-sizzle && ./edit.sh 1.2 7.5 2.3 7.7
```

`transcribe.py` needs `pip install faster-whisper` (downloads the ~460 MB `small.en` model on first run).

## Lessons for the class

- **Start with `/init` and plan mode.** Claude Code is strongest when it has project memory and a plan you approved.
- **Chat thinks, Code does.** The same model, but Claude Code can work on your files, terminal and browser.
- **Make the AI check itself.** Transcripts and contact sheets turned "looks fine to me" into verifiable checks.
- **Flow tip:** the Flow agent dropped my `@Me` avatar; generating in **direct mode** (agent off → Video → Ingredients) kept it. Test with a free image first.

## Credits

Video & voice: Google Flow (Omni 1.1 Flash, Nano Banana) · Music: Google Flow Music · Graphics: Remotion · Diagrams: archify · Edit: ffmpeg · Transcripts: faster-whisper. Marcus is a fictional AI character; "Alan" appears via his own Flow avatar. Not affiliated with SMU, Google or Anthropic.
