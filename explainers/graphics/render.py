#!/usr/bin/env python3
"""Render every graphic edit.py needs into out/: python3 render.py [name ...]

overlays.json  -> transparent ProRes 4444 overlays (Overlay composition, one per entry)
fullframe.json -> full-frame H.264 cutaways (Workflow, InitTerminal)
Times inside the JSON are synced to Whisper word timings; edit.py fires SFX on the same beats.
"""
import json, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
ALPHA = ["--codec=prores", "--prores-profile=4444", "--pixel-format=yuva444p10le", "--image-format=png"]

jobs = [(n, "Overlay", f"out/{n}.mov", p, ALPHA) for n, p in json.loads((HERE / "overlays.json").read_text()).items()]
jobs += [(n, n, f"out/{n}.mp4", p, ["--codec=h264", "--crf=16"]) for n, p in json.loads((HERE / "fullframe.json").read_text()).items()]
if sys.argv[1:]:
    jobs = [j for j in jobs if j[0] in sys.argv[1:]]


def render(job):
    name, comp, out, props, codec = job
    cmd = ["npx", "remotion", "render", "src/index.ts", comp, out, "--props", json.dumps(props), "--log=error", *codec]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    return name, "ok" if r.returncode == 0 else r.stderr[-400:]


(HERE / "out").mkdir(exist_ok=True)
with ThreadPoolExecutor(3) as ex:
    for name, status in ex.map(render, jobs):
        print(f"{name:14} {status}")
