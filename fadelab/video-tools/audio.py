import json, math
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
SP = "/tmp/claude-0/-home-user-jeselrosario/328cade7-023f-543b-bf3e-a6002aa693af/scratchpad/"


def mix(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i]
    buf[i:i + len(sig)] += sig * gain


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)


def marimba(m, dur=0.5):
    t = np.arange(int(SR * dur)) / SR
    f = hz(m)
    env = np.exp(-t * 9)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30) + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 55)
    return s * env * (1 - np.exp(-t * 900))


def bass(m, dur=0.3):
    t = np.arange(int(SR * dur)) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return s * np.exp(-t * 7) * (1 - np.exp(-t * 400))


def pluck(m, dur=0.35):  # bouncy "boing" synth
    t = np.arange(int(SR * dur)) / SR
    f = hz(m) * (1 + 0.04 * np.exp(-t * 25))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sign(np.sin(ph)) * 0.3 + np.sin(ph)
    sos = butter(2, 2800, "low", fs=SR, output="sos")
    return sosfilt(sos, s) * np.exp(-t * 10) * (1 - np.exp(-t * 600))


def kick(dur=0.28):
    t = np.arange(int(SR * dur)) / SR
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)


def noise(dur):
    return rng.standard_normal(int(SR * dur))


def band(x, lo, hi):
    sos = butter(2, [lo, hi], "band", fs=SR, output="sos")
    return sosfilt(sos, x)


def hat(dur=0.06):
    t = np.arange(int(SR * dur)) / SR
    sos = butter(2, 6500, "high", fs=SR, output="sos")
    return sosfilt(sos, noise(dur)) * np.exp(-t * 70)


def snap(dur=0.12):
    t = np.arange(int(SR * dur)) / SR
    return band(noise(dur), 1500, 6000) * np.exp(-t * 35)


music = np.zeros(N)
BPM = 118
beat = 60.0 / BPM
# C - Am - F - G, one bar each (MIDI)
prog = [
    dict(root=36, mel=[72, 76, 79, 76, 74, 77, 79, 84]),
    dict(root=33, mel=[69, 72, 76, 72, 71, 74, 76, 81]),
    dict(root=29, mel=[72, 77, 81, 77, 76, 79, 81, 84]),
    dict(root=31, mel=[74, 79, 83, 79, 77, 81, 83, 86]),
]
bars = int(DUR / (4 * beat)) + 1
for b in range(bars):
    t0 = b * 4 * beat
    ch = prog[b % 4]
    full = t0 >= 4.6  # music opens up when we land on the site
    for k in range(8):  # 8th notes with a little swing
        tt = t0 + k * beat / 2 + (0.035 if k % 2 else 0)
        if tt >= DUR: break
        # bass on 8ths, bouncing octave
        mix(music, bass(ch["root"] + (12 if k % 4 == 3 else 0)), tt, 0.5)
        if full or k % 2 == 0:
            mix(music, marimba(ch["mel"][k]), tt, 0.33 if full else 0.2)
        if full and k in (2, 5, 7):
            mix(music, pluck(ch["mel"][k] - 12), tt + 0.02, 0.16)
    for k in range(4):
        tt = t0 + k * beat
        if k % 2 == 0: mix(music, kick(), tt, 0.55 if full else 0.35)
        else: mix(music, snap(), tt, 0.25 if full else 0.12)
    for k in range(16):
        mix(music, hat(), t0 + k * beat / 4, 0.12 if k % 2 else 0.07)
    # little "boop" fill on the last beat of every 4th bar
    if full and b % 4 == 3:
        for j, m in enumerate([84, 88, 91, 96]):
            mix(music, marimba(m, 0.3), t0 + 3 * beat + j * beat / 4, 0.28)

# --- sound effects ---
fx = np.zeros(N)


def whoosh(t0, dur, f0, f1, gain, peak=0.5):
    t = np.arange(int(SR * dur)) / SR
    x = noise(dur)
    out = np.zeros_like(x)
    # sweep the filter centre with a few overlapping slices
    seg = 24
    L = len(x) // seg
    for k in range(seg):
        fc = f0 * (f1 / f0) ** (k / (seg - 1))
        sl = x[k * L:(k + 1) * L + 1]
        sos = butter(2, [fc * 0.6, min(fc * 1.6, SR / 2 - 100)], "band", fs=SR, output="sos")
        out[k * L:k * L + len(sl)] = sosfilt(sos, sl)[: len(out[k * L:k * L + len(sl)])]
    p = t / dur
    env = np.sin(np.pi * np.clip(p / (2 * peak) if p.max() else p, 0, 1)) if False else np.where(p < peak, (p / peak) ** 1.5, ((1 - p) / (1 - peak)) ** 1.5)
    mix(fx, out / (np.abs(out).max() + 1e-9) * env, t0, gain)


whoosh(0.7, 3.1, 300, 2500, 0.55, 0.5)       # camera barrel roll
whoosh(3.8, 1.3, 600, 5200, 0.7, 0.85)       # fall into the screen
t = np.arange(int(SR * 0.5)) / SR
mix(fx, np.sin(2 * np.pi * (70 + 40 * np.exp(-t * 14)) * t) * np.exp(-t * 7), 4.85, 0.7)  # landing thump

clicks = json.load(open(SP + "clicks.json"))["clicks"]


def click(t0, g=1.0):
    d = 0.05
    tt = np.arange(int(SR * d)) / SR
    tick = band(noise(d), 2500, 9000) * np.exp(-tt * 190)
    body = np.sin(2 * np.pi * 1600 * tt) * np.exp(-tt * 110)
    mix(fx, tick * 0.9 + body * 0.5, t0, 0.8 * g)
    mix(fx, (band(noise(0.03), 1800, 7000) * np.exp(-np.arange(int(SR * 0.03)) / SR * 260)), t0 + 0.09, 0.3 * g)  # release


for _, tc in clicks:
    click(tc)
for k in range(9):  # typing ticks
    tt = 14.85 + 0.1 * k
    d = 0.03
    x = np.arange(int(SR * d)) / SR
    mix(fx, band(noise(d), 1200, 5000) * np.exp(-x * 200), tt, 0.35)
for ts in (7.05, 10.0, 13.4):  # soft scroll swishes
    whoosh(ts, 0.9, 500, 1800, 0.18, 0.45)


def bell(m, t0, g=0.4):
    d = 1.4
    x = np.arange(int(SR * d)) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x * 4) + 0.2 * np.sin(2 * np.pi * f * 5.4 * x) * np.exp(-x * 8)
    mix(fx, s * np.exp(-x * 3.2) * (1 - np.exp(-x * 500)), t0, g)


for j, m in enumerate([84, 88, 91, 96]):  # success chime
    bell(m, 17.38 + 0.09 * j)

# duck the music a little under the fx, master + fade
duck = np.ones(N)
for _, tc in clicks:
    i = int(tc * SR); duck[i:i + int(0.15 * SR)] *= 0.7
out = music * 0.55 * duck + fx
env = np.ones(N)
f_in, f_out = int(0.4 * SR), int(1.2 * SR)
env[:f_in] = np.linspace(0, 1, f_in)
env[-f_out:] = np.linspace(1, 0, f_out)
out *= env
out = np.tanh(out * 0.9) / np.tanh(0.9)
out = out / np.abs(out).max() * 0.85
wavfile.write(SP + "sound.wav", SR, (out * 32767).astype(np.int16))
print("ok", len(out) / SR)
