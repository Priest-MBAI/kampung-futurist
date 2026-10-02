#!/usr/bin/env python3
"""Synthesize the Kampung Futurist SFX kit (original, royalty-free) -> audio/sfx/*.wav

pop    bubbly sticker pop-in (pitch-dropping sine + click transient)
whoosh scene -> graphic transition (band-swept noise, rise then fall)
ding   step / bullet highlight (soft two-partial bell, pitched per index)
thock  card slam (low body thump + bright tick)
"""
from pathlib import Path
import wave
import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parent / "audio/sfx"


def env(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay)


def save(name, x, gain_db=-6.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (gain_db / 20)
    st = np.stack([x, x], axis=1)
    pcm = (st * 32767).astype(np.int16)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def bandpass_noise(n, f_lo, f_hi, seed=0):
    """Noise whose passband sweeps from f_lo to f_hi and back (crude STFT-free sweep)."""
    rng = np.random.default_rng(seed)
    out = np.zeros(n)
    hop = 512
    win = np.hanning(hop * 2)
    for i in range(0, n - hop * 2, hop):
        p = i / n
        fc = f_lo + (f_hi - f_lo) * np.sin(np.pi * p)  # up then down
        seg = rng.standard_normal(hop * 2)
        spec = np.fft.rfft(seg)
        freqs = np.fft.rfftfreq(hop * 2, 1 / SR)
        spec *= np.exp(-((freqs - fc) / (fc * 0.6)) ** 2)
        out[i:i + hop * 2] += np.fft.irfft(spec) * win
    return out


def pop():
    n = int(0.16 * SR); t = np.arange(n) / SR
    f = 1250 * np.exp(-t / 0.035) + 320            # fast downward chirp = "bloop"
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.05)
    click = np.random.default_rng(1).standard_normal(n) * env(n, 0.0005, 0.004) * 0.4
    return body + click


def whoosh():
    n = int(0.55 * SR)
    x = bandpass_noise(n, 400, 3200, seed=2)
    t = np.arange(n) / SR
    shape = np.sin(np.pi * np.clip(t / 0.55, 0, 1)) ** 1.6
    return x * shape


def ding(semitone=0):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f0 = 880 * 2 ** (semitone / 12)
    x = np.sin(2 * np.pi * f0 * t) + 0.35 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t / 0.06)
    return x * env(n, 0.003, 0.16)


def thock():
    n = int(0.22 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (140 * np.exp(-t / 0.05) + 70) * t) * env(n, 0.001, 0.07)
    tick = np.sin(2 * np.pi * 2400 * t) * env(n, 0.0005, 0.012) * 0.5
    return body + tick


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    save("pop", pop(), -5)
    save("whoosh", whoosh(), -8)
    save("thock", thock(), -6)
    for i, st in enumerate([0, 3, 5, 7, 10, 12, 15]):  # rising pentatonic, one per step
        save(f"ding{i + 1}", ding(st), -9)
    print(sorted(p.name for p in OUT.iterdir()))
