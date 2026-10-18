import math, os, sys
import numpy as np
from PIL import Image, ImageFilter
from multiprocessing import Pool

UP = "/root/.claude/uploads/328cade7-023f-543b-bf3e-a6002aa693af/"
SP = "/tmp/claude-0/-home-user-jeselrosario/328cade7-023f-543b-bf3e-a6002aa693af/scratchpad/"
OUT = SP + "final/"
W, H, FPS, DUR = 1920, 1080, 30, 20
os.makedirs(OUT, exist_ok=True)
BG = np.array([250, 252, 250], float)
NAVY = np.array([5, 13, 32], float)
PAD = 1100

desk_orig = Image.open(UP + "ac0ce6e0-image.jpg").convert("RGB")
desk = np.array(desk_orig).astype(float)
X0, X1, Y0, Y1 = 1555, 2625, 815, 1110
base = desk.copy()
base[Y0:Y1, X0:X1] = BG
mask = np.zeros(desk.shape[:2]); mask[Y0:Y1, X0:X1] = 1
mask = np.array(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))) / 255.0
base = desk * (1 - mask[..., None]) + base * mask[..., None]
base = np.clip(base, 0, 255).astype(np.uint8)
padded = np.pad(base, ((PAD, PAD), (PAD, PAD), (0, 0)), mode="reflect")
BASE_FULL = Image.fromarray(padded)
BASE_HALF = BASE_FULL.resize((BASE_FULL.width // 2, BASE_FULL.height // 2), Image.LANCZOS)


def letter_layer(x0, x1):
    pad = 14
    c = np.array(desk_orig.crop((x0 - pad, Y0, x1 + pad, Y1))).astype(float)
    c = np.clip(c * 255.0 / BG * 255.0 / 238.0, 0, 255)
    return Image.fromarray(c.astype(np.uint8)), (x0 - pad, Y0)


SEGS = {"s": (1921, 2030), "c1": (2031, 2152), "e": (2153, 2284), "n": (2285, 2410), "t": (2411, 2505), "c2": (2506, 2610)}
LAYERS = {k: letter_layer(*v) for k, v in SEGS.items()}

logo = Image.open(UP + "2c658d90-image.png").convert("RGB")
lg = np.array(logo).astype(int)
ys, xs = np.where((250 - lg.min(2)) > 60)
LB = (xs.min(), ys.min(), xs.max(), ys.max())
LCX, LCY = (LB[0] + LB[2]) / 2, (LB[1] + LB[3]) / 2
LW = LB[2] - LB[0]
ys2, xs2 = np.where((250 - desk[Y0:Y1, 1572:1921].min(2)) > 60)
A_C = (1572 + (xs2.min() + xs2.max()) / 2, Y0 + (ys2.min() + ys2.max()) / 2)
K_A = (xs2.max() - xs2.min()) / LW

SCREEN_C = (1932, 985)
STEM = (806, 816)
T_ROLL0, T_ROLL1, T_DIVE1 = 0.7, 3.8, 5.0


def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def lerp(a, b, t): return a + (b - a) * t
def eio(x):
    x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10)
def eo(x): return 1 - (1 - clamp(x)) ** 3
def ei(x): return clamp(x) ** 3


def camera(t):
    """cx, cy, s, roll(deg). The camera barrel-rolls like a plane, then drops into the screen."""
    if t < T_ROLL0:
        p = t / T_ROLL0
        return 1920 + 40 * (1 - p), 1080, lerp(0.56, 0.60, p), 0.0
    if t < T_ROLL1:
        q = eio((t - T_ROLL0) / (T_ROLL1 - T_ROLL0))
        lin = clamp((t - T_ROLL0) / (T_ROLL1 - T_ROLL0))
        s = lerp(0.60, 0.95, eio(lin) ** 1.2)
        cx = lerp(1920, SCREEN_C[0], eio(lin)) + 430 * math.sin(2 * math.pi * lin) * (1 - lin * 0.4)
        cy = lerp(1080, SCREEN_C[1], eio(lin)) - 170 * math.sin(math.pi * lin) + 90 * math.sin(2 * math.pi * lin)
        return cx, cy, s, 360.0 * q
    p = clamp((t - T_ROLL1) / (T_DIVE1 - T_ROLL1))
    e = ei(p) * 0.85 + p * 0.15
    s = 0.95 * (26.0 / 0.95) ** e
    tx = SCREEN_C[0] + K_A * 1.7 * (STEM[0] - LCX)
    ty = SCREEN_C[1] + K_A * 1.7 * (STEM[1] - LCY)
    qq = eio(clamp(p * 1.3))
    return lerp(SCREEN_C[0], tx, qq), lerp(SCREEN_C[1], ty, qq), s, 0.0


def coeffs(cam, anchor_src, anchor_world, k, ang):
    cx, cy, s, roll = cam
    def R(d):
        r = math.radians(d); return np.array([[math.cos(r), -math.sin(r)], [math.sin(r), math.cos(r)]])
    M = R(roll - ang) / (s * k)
    v = R(-ang) @ (np.array([cx, cy]) - np.array(anchor_world)) / k
    c0 = anchor_src[0] + v[0] - (M[0, 0] * W / 2 + M[0, 1] * H / 2)
    f0 = anchor_src[1] + v[1] - (M[1, 0] * W / 2 + M[1, 1] * H / 2)
    return (M[0, 0], M[0, 1], c0, M[1, 0], M[1, 1], f0)


def place(img, cam, anchor_src, anchor_world, k, ang, opacity=1.0, fill=(255, 255, 255)):
    o = img.transform((W, H), Image.AFFINE, coeffs(cam, anchor_src, anchor_world, k, ang), resample=Image.BICUBIC, fillcolor=fill)
    arr = np.array(o).astype(float)
    if opacity < 1: arr = 255 - opacity * (255 - arr)
    return arr


def desk_sample(t):
    cam = camera(t)
    s = cam[2]
    if s < 0.72:
        frame = place(BASE_HALF, cam, (PAD / 2, PAD / 2), (0, 0), 2.0, 0.0, fill=(0, 0, 0))
    else:
        frame = place(BASE_FULL, cam, (PAD, PAD), (0, 0), 1.0, 0.0, fill=(0, 0, 0))
    # base is placed with world origin at the desk's top-left: shift anchor so world == desk coords
    return frame, cam


def desk_render(t):
    cam = camera(t)
    s = cam[2]
    if s < 0.72:
        frame = place(BASE_HALF, cam, (PAD / 2, PAD / 2), (0, 0), 2.0, 0.0, fill=(0, 0, 0))
    else:
        frame = place(BASE_FULL, cam, (PAD, PAD), (0, 0), 1.0, 0.0, fill=(0, 0, 0))
    mul = np.ones_like(frame)
    for key, (img, org) in LAYERS.items():
        cxl = (SEGS[key][0] + SEGS[key][1]) / 2
        cyl = (Y0 + Y1) / 2
        mul *= place(img, cam, (cxl - org[0], cyl - org[1]), (cxl, cyl), 1.0, 0.0) / 255.0
    mul *= place(logo, cam, (LCX, LCY), A_C, K_A, 0.0) / 255.0
    return frame * mul


def zoom_blur(arr, strength, n=7):
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    acc = np.zeros_like(arr)
    for i in range(n):
        z = 1 + strength * i / (n - 1)
        hw, hh = W / (2 * z), H / (2 * z)
        acc += np.array(img.resize((W, H), Image.BILINEAR, box=(W / 2 - hw, H / 2 - hh, W / 2 + hw, H / 2 + hh))).astype(float)
    return acc / n


def frame_at(i):
    t = i / FPS
    if t < 5.0:
        if T_ROLL0 < t < T_ROLL1:  # rotational motion blur
            arr = sum(desk_render(t + (j - 1.5) * 0.0105) for j in range(4)) / 4
        else:
            arr = desk_render(t)
        if t > T_ROLL1:
            p = clamp((t - T_ROLL1) / (T_DIVE1 - T_ROLL1))
            arr = zoom_blur(arr, 0.22 * ei(p) + 0.04 * p)
        if t > 4.5:
            q = eio((t - 4.5) / 0.5)
            arr = arr * (1 - q) + NAVY * q
    else:
        sf = Image.open(SP + "site/s%04d.jpg" % i).convert("RGB")
        kb = lerp(1.18, 1.0, eo((t - 4.9) / 1.3))
        if kb > 1.0005:
            hw, hh = W / (2 * kb), H / (2 * kb)
            sf = sf.resize((W, H), Image.BICUBIC, box=(W / 2 - hw, H / 2 - hh, W / 2 + hw, H / 2 + hh))
        arr = np.array(sf).astype(float)
        if t < 5.55:
            q = 1 - eio((t - 4.9) / 0.65)
            arr = arr * (1 - q) + NAVY * q
    if t < 0.4:
        arr = arr * eo(t / 0.4)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(OUT + "c%04d.jpg" % i, quality=95)
    return i


if __name__ == "__main__":
    frames = list(range(FPS * DUR)) if len(sys.argv) == 1 else [int(x) for x in sys.argv[1:]]
    with Pool(4) as p:
        for _ in p.imap_unordered(frame_at, frames, chunksize=2):
            pass
    print("done", len(frames))
