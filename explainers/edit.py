#!/usr/bin/env python3
"""Build the two Kampung Futurist explainers: python3 edit.py [ep1|ep2|all]

Per segment: trim the Flow clip, grade it, blur AI-garbled text, drop in a full-frame
cutaway graphic or same-clip insert (dialogue keeps running underneath) and composite Remotion\noverlays, with synthesized SFX hits on each reveal.
Then concat the segments and lay the Flow Music theme under the dialogue, ducked by a
sidechain compressor so the voice always wins.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CLIPS, GFX, OUT, TMP = ROOT / "clips", ROOT / "graphics/out", ROOT / "final", ROOT / "qa/segments"
THEME = ROOT / "audio/theme.m4a"
LOOK = ("scale=1920:1080:flags=lanczos,fps=24,eq=saturation=0.96:gamma=1.01,"
        "colorbalance=rm=0.025:bm=-0.025,noise=alls=4:allf=t,format=yuv420p")

# Step times baked into graphics/out/Workflow.mp4 (seconds into the graphic); dings fire on the same beats.
WF_STEPS = json.loads((ROOT / "graphics/fullframe.json").read_text())["Workflow"]["stepTimes"]

# Per segment: src clip, t=(in, out); ov=[(overlay, at)]; cut=(full-frame graphic, at);
# ins=[(src_in, at, dur)] video-only insert from the same clip (audio keeps running);
# blur=[(x, y, w, h)]; sfx=[(name, at)]. All `at` values are seconds into the segment.
EPISODES = {
    "ep1": [
        dict(src="ep1-a-confession", t=(2.55, 8.65), ov=[("ep1-intro", 0.0), ("ep1-notreal", 1.65)],
             sfx=[("thock", 0.05), ("pop", 1.7)]),
        dict(src="ep1-b-alan-v4", t=(0.70, 9.00), ov=[("ep1-plan", 0.2)], ins=[(8.35, 1.65, 0.9)],
             cut=("Workflow.mp4", 2.55),
             sfx=[("thock", 0.2), ("whoosh", 2.4)] + [(f"ding{i + 1}", 2.55 + t) for i, t in enumerate(WF_STEPS)]),
        dict(src="ep1-c-hawker-v2", t=(1.45, 9.60), ov=[("ep1-ticks", 0.95)],
             sfx=[(f"ding{i + 1}", 0.95 + t) for i, t in enumerate([0.28, 1.5, 3.04])]),
        dict(src="ep1-d-busstop-v2", t=(0.55, 9.70), ov=[("ep1-split", 3.4)],
             sfx=[("pop", 3.4 + t) for t in (0.24, 2.22, 4.54)]),
        dict(src="ep1-e-verdict-v2", t=(0.75, 9.00), ov=[("ep1-end", 6.0)], sfx=[("thock", 6.0)]),
    ],
    "ep2": [
        dict(src="ep2-f-coworking", t=(0.75, 7.75), ov=[("ep2-intro", 0.0), ("ep2-init", 5.05)],
             sfx=[("thock", 0.05), ("pop", 5.1)]),
        dict(src="ep2-g-library", t=(1.85, 8.40), cut=("InitTerminal.mp4", 1.55),
             sfx=[("whoosh", 1.4), ("ding1", 1.95), ("ding3", 3.75), ("ding5", 4.65)]),
        dict(src="ep2-h-auntie", t=(1.50, 8.60), ov=[("ep2-auntie", 3.25)], sfx=[("pop", 3.3)]),
        dict(src="ep2-i-pantry", t=(2.70, 8.10), ov=[("ep2-stack", 0.3)], blur=[(0, 160, 260, 260)],
             sfx=[(f"ding{i + 1}", 0.3 + t) for i, t in enumerate([0.1, 3.68, 4.5])]),
        dict(src="ep2-j-cta-v2", t=(1.80, 9.00), ov=[("ep2-cta", 3.0)], sfx=[("thock", 3.0), ("pop", 4.0)]),
    ],
}
SFX_DIR, SFX_GAIN = ROOT / "audio/sfx", 0.55


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"ffmpeg failed:\n{' '.join(map(str, cmd))}\n{r.stderr[-2000:]}")


def render_segment(seg, path):
    t0, t1 = seg["t"]
    dur = round(t1 - t0, 3)
    args = ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(t0), "-t", str(dur), "-i", CLIPS / f"{seg['src']}.mp4"]
    f = [f"[0:v]{LOOK},setpts=PTS-STARTPTS[v0]"]
    last, n = "v0", 1
    for i, (x, y, w, h) in enumerate(seg.get("blur", [])):
        f.append(f"[{last}]split[bs{i}][bb{i}];[bb{i}]crop={w}:{h}:{x}:{y},boxblur=22:3[bk{i}];"
                 f"[bs{i}][bk{i}]overlay={x}:{y}[vb{i}]")
        last = f"vb{i}"
    for k, (src_in, at, d) in enumerate(seg.get("ins", [])):
        args += ["-ss", str(src_in), "-t", str(d), "-i", CLIPS / f"{seg['src']}.mp4"]
        f.append(f"[{n}:v]{LOOK},setpts=PTS-STARTPTS+{at}/TB[in{k}];"
                 f"[{last}][in{k}]overlay=0:0:eof_action=pass:enable='between(t,{at},{at + d})'[vi{k}]")
        last, n = f"vi{k}", n + 1
    for j, (name, at) in enumerate(seg.get("ov", [])):
        args += ["-i", GFX / f"{name}.mov"]
        f.append(f"[{n}:v]format=yuva420p,setpts=PTS-STARTPTS+{at}/TB[o{j}];"
                 f"[{last}][o{j}]overlay=0:0:format=auto:eof_action=pass[vo{j}]")
        last, n = f"vo{j}", n + 1
    if seg.get("cut"):
        file, at = seg["cut"]
        args += ["-i", GFX / file]
        f.append(f"[{n}:v]fps=24,format=yuv420p,setpts=PTS-STARTPTS+{at}/TB[cw];"
                 f"[{last}][cw]overlay=0:0:eof_action=pass:enable='gte(t,{at})'[vc]")
        last, n = "vc", n + 1
    f.append(f"[{last}]format=yuv420p[v]")
    f.append(f"[0:a]asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,"
             f"afade=t=in:d=0.04,afade=t=out:st={dur - 0.07}:d=0.07[a]")
    args += ["-filter_complex", ";".join(f), "-map", "[v]", "-map", "[a]", "-t", str(dur),
             "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-c:a", "pcm_s16le", path]
    run(args)
    return dur


def build(ep):
    TMP.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(exist_ok=True)
    segs, total, events = [], 0.0, []
    for k, seg in enumerate(EPISODES[ep]):
        p = TMP / f"{ep}-{k}.mov"
        events += [(name, total + at) for name, at in seg.get("sfx", [])]
        total += render_segment(seg, p)
        segs.append(p)
    ins = sum([["-i", s] for s in segs], [])
    m = len(segs)
    concat = "".join(f"[{i}:v][{i}:a]" for i in range(m)) + f"concat=n={m}:v=1:a=1[v][dlg]"
    # Theme: start a beat in, bed it ~12 dB under the voice, duck gently under speech, fade out at the end.
    mix = (f"[{m}:a]atrim=start=1.5,asetpts=PTS-STARTPTS,aresample=48000,volume=0.6,"
           f"afade=t=in:d=0.6,afade=t=out:st={total - 1.6:.2f}:d=1.6[mus];"
           f"[dlg]asplit[dlg1][key];"
           f"[mus][key]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=400[duck];"
           + "".join(f"[{m + 1 + i}:a]adelay={int(t * 1000)}|{int(t * 1000)},volume={SFX_GAIN}[s{i}];"
                     for i, (_, t) in enumerate(events))
           + "".join(f"[s{i}]" for i in range(len(events))) + f"amix=inputs={len(events)}:normalize=0[sfx];"
           f"[dlg1][duck][sfx]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    out = OUT / f"kampung-futurist-{ep}.mp4"
    sfx_ins = sum([["-i", SFX_DIR / f"{name}.wav"] for name, _ in events], [])
    run(["ffmpeg", "-y", "-loglevel", "error", *ins, "-i", THEME, *sfx_ins,
         "-filter_complex", f"{concat};{mix}", "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}",
         "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out])
    print(f"{out.name}: {total:.2f}s from {m} segments, {len(events)} SFX hits")


if __name__ == "__main__":
    for ep in (["ep1", "ep2"] if len(sys.argv) < 2 or sys.argv[1] == "all" else [sys.argv[1]]):
        build(ep)
