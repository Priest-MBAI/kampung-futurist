#!/usr/bin/env python3
"""Word-level transcripts for Flow clips (faster-whisper small.en, local CPU).
Usage: ../../OpenMontage/.venv/bin/python transcribe.py clips/ep1-*.mp4  -> qa/words/<clip>.json + printed timeline
"""
import json, sys
from pathlib import Path
from faster_whisper import WhisperModel

out = Path(__file__).resolve().parent / "qa/words"
out.mkdir(parents=True, exist_ok=True)
model = WhisperModel("small.en", device="cpu", compute_type="int8")
for clip in sys.argv[1:]:
    segs, _ = model.transcribe(clip, word_timestamps=True, vad_filter=False, beam_size=5)
    words = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
    (out / f"{Path(clip).stem}.json").write_text(json.dumps(words, indent=1))
    print(f"== {Path(clip).name}\n   " + " ".join(f"{x['w']}@{x['s']}" for x in words))
