import math, os, json
from playwright.sync_api import sync_playwright

SP = "/tmp/claude-0/-home-user-jeselrosario/328cade7-023f-543b-bf3e-a6002aa693af/scratchpad/"
OUT = SP + "site/"
os.makedirs(OUT, exist_ok=True)
FPS = 30
T0, T1 = 4.9, 20.0


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def eio(x):
    x = clamp(x)
    return x * x * x * (x * (6 * x - 15) + 10)


def eo(x):
    return 1 - (1 - clamp(x)) ** 3


S_SERV, S_GAL, S_RES = 1251, 2150, 3930
CLICKS = {}  # name -> time (filled below, also exported for the audio script)


def build(pg):
    def rect(sel, nth=0):
        r = pg.evaluate("""([s,n])=>{const e=document.querySelectorAll(s)[n].getBoundingClientRect();
            return [e.left+scrollX,e.top+scrollY,e.width,e.height]}""", [sel, nth])
        return r

    def center(sel, nth=0, scroll=0, dx=0, dy=0):
        x, y, w, h = rect(sel, nth)
        return (x + w / 2 + dx, y + h / 2 - scroll + dy)

    nav = {k: center(f'.links a[data-t="{k}"]') for k in ["servicios", "galeria", "reserva"]}
    card2 = center(".svc", 1, S_SERV, 0, -40)
    tile2 = center(".t2", 0, S_GAL)
    tile3 = center(".t3", 0, S_GAL)
    inp = center("#name", 0, S_RES, 120)
    chip = center(".chip", 1, S_RES)
    conf = center("#confirm", 0, S_RES, 60)
    # (t_start, t_end, target)
    moves = [
        (5.5, 5.5, (1150, 640)),
        (5.85, 6.85, nav["servicios"]),
        (7.5, 8.45, card2),
        (9.0, 9.8, nav["galeria"]),
        (10.45, 11.35, tile2),
        (11.55, 12.25, tile3),
        (12.45, 13.2, nav["reserva"]),
        (13.9, 14.6, inp),
        (15.35, 16.1, chip),
        (16.45, 17.2, conf),
    ]
    clicks = [("nav_serv", 6.95), ("card", 8.6), ("nav_gal", 9.9), ("nav_res", 13.3), ("input", 14.7), ("chip", 16.2), ("confirm", 17.3)]
    return moves, clicks


def cursor_at(t, moves):
    x, y = moves[0][2]
    for i in range(1, len(moves)):
        a, b, tgt = moves[i]
        if t >= b:
            x, y = tgt
            continue
        if t > a:
            p = eio((t - a) / (b - a))
            dist = math.hypot(tgt[0] - x, tgt[1] - y)
            nx, ny = -(tgt[1] - y), tgt[0] - x
            n = math.hypot(nx, ny) or 1
            arc = math.sin(math.pi * p) * 0.07 * dist
            x = x + (tgt[0] - x) * p + nx / n * arc
            y = y + (tgt[1] - y) * p + ny / n * arc
        break
    return x, y


def scroll_at(t):
    s = 0.0
    s = lerp(0, S_SERV, eio((t - 7.05) / 0.9))
    if t > 9.99:
        s = lerp(S_SERV, S_GAL, eio((t - 10.0) / 0.9))
    if t > 13.39:
        s = lerp(S_GAL, S_RES, eio((t - 13.4) / 0.95))
    return s


def lerp(a, b, t):
    return a + (b - a) * t


TYPE_START, TYPE_STEP, NAME = 14.85, 0.1, "Carlos R."

if __name__ == "__main__":
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--no-sandbox"])
        pg = b.new_page(viewport={"width": 1920, "height": 1080})
        pg.goto("file:///home/user/jeselrosario/fadelab/index.html")
        pg.wait_for_timeout(800)
        pg.evaluate("window.__nav=()=>{}")  # scrolling is driven by the recording script
        moves, clicks = build(pg)
        json.dump({"clicks": clicks}, open(SP + "clicks.json", "w"))
        pending = sorted(clicks, key=lambda c: c[1])
        typed = 0
        down_until = -1
        last_click = -9
        n0, n1 = int(T0 * FPS), int(T1 * FPS)
        for i in range(n0, n1):
            t = i / FPS
            x, y = cursor_at(t, moves)
            sc = scroll_at(t)
            pg.mouse.move(x, y)
            # real clicks
            while pending and t >= pending[0][1]:
                name, tc = pending.pop(0)
                pg.mouse.down()
                pg.mouse.up()
                last_click = tc
                down_until = tc + 0.09
                if name == "confirm":
                    pass
            # real typing
            while typed < len(NAME) and t >= TYPE_START + TYPE_STEP * typed:
                pg.keyboard.type(NAME[typed])
                typed += 1
            pm = eo((t - 17.35) / 0.6)
            ck = eo((t - 17.7) / 0.5)
            o = dict(x=x, y=y, cv=t >= 5.5, press=last_click <= t < down_until, rip=clamp((t - last_click) / 0.45) if t - last_click < 0.45 else 0,
                     scroll=sc, p=pm, ck=ck, cf=max(0, t - 17.4))
            pg.evaluate("o=>window.F(o)", o)
            pg.screenshot(path=OUT + "s%04d.jpg" % i, type="jpeg", quality=93)
        b.close()
    print("done")
