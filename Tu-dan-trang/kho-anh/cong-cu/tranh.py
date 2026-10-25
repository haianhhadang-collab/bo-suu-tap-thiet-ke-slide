"""Tranh minh họa vector cho kho ảnh trang trí: 24 tranh, 2 tranh mỗi gói chủ đề.

Mỗi tranh là danh sách hình trên khổ slide 13,333 × 7,5 inch. Một hình gồm:
  r  vai màu: chữ cái + phần trăm, vd "a40" = trộn 40% màu nhấn (inv_accent) vào màu nền trang bìa (inv[0]);
     a = inv_accent, b = accent2, c = accent3, k = inv_ink (màu chữ trên nền đậm), z = đen;
     hoặc mã màu cố định "#DA251D" (cờ, hoa phượng…)
  a  độ đục (1 = đặc)
  p  các vòng điểm [x1, y1, x2, y2, …] (một hình có thể có nhiều vòng: lỗ thủng)
  w  bề dày nét (pt) nếu là đường nét không khép kín; không có w = tô kín
Tranh được dựng một lần ở đây rồi lưu thành dữ liệu; bản web (kho-anh.js) và bản Python (khoanh.py) chỉ đọc dữ liệu
đó và vẽ, nên hai bản luôn khớp. Vật chính đặt ở nửa phải: nửa trái có lớp phủ màu để chữ dễ đọc.
"""
import math
import random

W, H = 13.333, 7.5
TAU = 2 * math.pi


class Tranh:
    def __init__(self):
        self.hinh = []

    def fill(self, r, rings, a=1.0):
        if rings and not isinstance(rings[0][0], (list, tuple)):
            rings = [rings]
        self.hinh.append(dict(r=r, a=round(a, 2), p=[[round(v, 2) for xy in ring for v in xy] for ring in rings]))

    def line(self, r, pts, w=2.0, a=1.0):
        self.hinh.append(dict(r=r, a=round(a, 2), p=[[round(v, 2) for xy in pts for v in xy]], w=round(w, 2)))


# ---------- hình cơ bản

def circle(cx, cy, r, n=48, ry=None):
    ry = r if ry is None else ry
    return [(cx + r * math.cos(TAU * i / n), cy + ry * math.sin(TAU * i / n)) for i in range(n)]


def arc(cx, cy, r, a0, a1, n=32, ry=None):
    ry = r if ry is None else ry
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + ry * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


def rect(x, y, w, h):
    return [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]


def star(cx, cy, R, n=5, inner=0.42, rot=-math.pi / 2):
    return [(cx + (R if i % 2 == 0 else R * inner) * math.cos(rot + math.pi * i / n),
             cy + (R if i % 2 == 0 else R * inner) * math.sin(rot + math.pi * i / n)) for i in range(2 * n)]


def ridge(rnd, y0, amp, x0=-0.2, x1=W + 0.2, n=90, bottom=H + 0.2, k=3):
    """Đường sống núi: tổng vài sóng sin ngẫu nhiên, khép xuống đáy."""
    ph = [(rnd.uniform(0.25, 1.4), rnd.uniform(0, TAU), rnd.uniform(0.3, 1.0)) for _ in range(k)]
    tot = sum(p[2] for p in ph)
    pts = [(x0, bottom)]
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        y = y0 - amp * sum(c * math.sin(f * x + p) for f, p, c in ph) / tot
        pts.append((x, y))
    pts.append((x1, bottom))
    return pts


def peaks(rnd, base, tops, x0=-0.2, x1=W + 0.2, bottom=H + 0.2):
    """Dãy núi nhọn: tops = [(x, y)…] đỉnh; giữa hai đỉnh là yên ngựa thấp hơn."""
    pts = [(x0, bottom), (x0, base)]
    for i, (x, y) in enumerate(tops):
        pts.append((x - rnd.uniform(0.5, 0.9), base - (base - y) * rnd.uniform(0.25, 0.45)))
        pts.append((x - 0.12, y + 0.05))
        pts.append((x, y))
        pts.append((x + 0.15, y + 0.08))
    pts += [(x1, base), (x1, bottom)]
    return pts


def blob(cx, cy, rx, ry, rnd, n=36, wob=0.12):
    k = [rnd.uniform(-wob, wob) for _ in range(4)]
    ph = [rnd.uniform(0, TAU) for _ in range(4)]
    return [(cx + rx * (1 + k[0] * math.sin(2 * t + ph[0]) + k[1] * math.cos(3 * t + ph[1])) * math.cos(t),
             cy + ry * (1 + k[2] * math.sin(2 * t + ph[2]) + k[3] * math.cos(5 * t + ph[3])) * math.sin(t))
            for t in (TAU * i / n for i in range(n))]


def rot(pts, cx, cy, ang):
    c, s = math.cos(ang), math.sin(ang)
    return [(cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c) for x, y in pts]


def sky(t, role='k', top=0.0, bot=H, n=6, t0=0, t1=8):
    """Bầu trời: các dải ngang nhạt dần (chỉ trộn vài % màu sáng)."""
    for i in range(n):
        y = top + (bot - top) * i / n
        t.fill(f'{role}{round(t0 + (t1 - t0) * i / max(n - 1, 1)):02d}', rect(-0.1, y, W + 0.2, (bot - top) / n + 0.02))


def dust(t, rnd, n, box, role='k60', rmin=0.015, rmax=0.045, a=0.8):
    x0, y0, x1, y1 = box
    for _ in range(n):
        t.fill(role, circle(rnd.uniform(x0, x1), rnd.uniform(y0, y1), rnd.uniform(rmin, rmax), 10), a * rnd.uniform(0.4, 1))


def tree(t, rnd, x, base, h, role='k12', crown=None):
    crown = crown or role
    t.fill(role, rect(x - 0.05 * h, base - h * 0.45, 0.1 * h, h * 0.45))
    for k in range(5):
        t.fill(crown, circle(x + rnd.uniform(-0.3, 0.3) * h, base - h * (0.55 + rnd.uniform(0, 0.35)), h * rnd.uniform(0.22, 0.32), 24))


def roof(cx, y, w, h, lift=0.35, thick=0.12):
    """Mái cong kiểu đình chùa: hai đầu đao cong vút."""
    l, r = cx - w / 2, cx + w / 2
    top = []
    for i in range(21):
        s = i / 20
        x = l + (r - l) * s
        d = abs(2 * s - 1)
        top.append((x, y - h + h * d * d * 0.25 - lift * max(0, d - 0.8) / 0.2 * 0.6))
    under = [(r + 0.05, y - h - lift * 0.55), (r - 0.25, y), (l + 0.25, y), (l - 0.05, y - h - lift * 0.55)]
    return [(l - 0.12, y - h - lift)] + top + [(r + 0.12, y - h - lift)] + under


def lantern(t, cx, cy, s, body, cap, a=1.0):
    t.line(cap, [(cx, cy - 1.2 * s - 0.6), (cx, cy - 0.62 * s)], 1.0, a * 0.7)
    t.fill(cap, rect(cx - 0.22 * s, cy - 0.68 * s, 0.44 * s, 0.12 * s), a)
    t.fill(body, circle(cx, cy, 0.55 * s, 36, 0.6 * s), a)
    for k in (-0.3, 0, 0.3):
        t.line(cap, [(cx + k * s * math.cos(u) * 1.6, cy + 0.6 * s * math.sin(u)) for u in (math.pi * (i / 12 - 0.5) for i in range(13))], 0.6, a * 0.35)
    t.fill(cap, rect(cx - 0.18 * s, cy + 0.56 * s, 0.36 * s, 0.1 * s), a)
    t.line(cap, [(cx, cy + 0.66 * s), (cx, cy + 1.1 * s)], 1.5, a * 0.8)


def flower5(t, cx, cy, r, petal, core, ang=0.0, a=1.0):
    for k in range(5):
        u = ang + TAU * k / 5
        t.fill(petal, circle(cx + 0.55 * r * math.cos(u), cy + 0.55 * r * math.sin(u), 0.48 * r, 16), a)
    t.fill(core, circle(cx, cy, 0.25 * r, 12), a)


def branch(rnd, x0, y0, ang, length, w0, depth, out):
    """Cành cây: đa giác thuôn dần, phân nhánh; trả về các đầu cành để gắn hoa."""
    x1, y1 = x0 + length * math.cos(ang), y0 + length * math.sin(ang)
    nx, ny = -math.sin(ang), math.cos(ang)
    w1 = w0 * 0.6
    poly = [(x0 + nx * w0, y0 + ny * w0), (x1 + nx * w1, y1 + ny * w1), (x1 - nx * w1, y1 - ny * w1), (x0 - nx * w0, y0 - ny * w0)]
    out['segs'].append(poly)
    out['tips'].append((x1, y1))
    if depth > 0:
        for d in (-1, 1):
            if rnd.random() < 0.85:
                branch(rnd, x1, y1, ang + d * rnd.uniform(0.35, 0.75), length * rnd.uniform(0.55, 0.75), w1, depth - 1, out)
        if rnd.random() < 0.5:
            branch(rnd, x1, y1, ang + rnd.uniform(-0.2, 0.2), length * 0.6, w1, depth - 1, out)


def skyline(t, rnd, x0, x1, base, hmin, hmax, role, win=None, wa=0.6):
    x = x0
    while x < x1:
        w = rnd.uniform(0.35, 0.9)
        h = rnd.uniform(hmin, hmax)
        t.fill(role, rect(x, base - h, w, h + 0.3))
        if win:
            for wy in range(int(h / 0.28)):
                for wx in range(int(w / 0.2)):
                    if rnd.random() < 0.35:
                        t.fill(win, rect(x + 0.07 + wx * 0.2, base - h + 0.15 + wy * 0.28, 0.08, 0.11), wa * rnd.uniform(0.5, 1))
        x += w + rnd.uniform(0.0, 0.08)


def wavesband(t, y, amp, freq, ph, role, a=1.0, bottom=H + 0.2):
    pts = [(-0.2, bottom)] + [(-0.2 + (W + 0.4) * i / 80, y + amp * math.sin(freq * (-0.2 + (W + 0.4) * i / 80) + ph)) for i in range(81)] + [(W + 0.2, bottom)]
    t.fill(role, pts, a)


# ======================================================================
# các tranh
# ======================================================================

def cot_co(rnd):
    t = Tranh()
    sky(t, 'c', t0=0, t1=14)
    t.fill('c40', circle(9.6, 2.6, 1.7, 64), 0.55)
    t.fill('c55', circle(9.6, 2.6, 1.2, 64), 0.6)
    t.fill('k10', ridge(rnd, 5.6, 0.35))
    # cột cờ: ba tầng đế bậc, thân lục giác thuôn, vọng lâu, cột cờ
    base_y, cx = 6.55, 9.9
    for i, (w, h) in enumerate([(3.6, 0.55), (2.7, 0.55), (1.9, 0.5)]):
        y = base_y - 0.55 * i
        t.fill(f'k{24 + i * 4}', [(cx - w / 2, y), (cx + w / 2, y), (cx + w / 2 - 0.12, y - h), (cx - w / 2 + 0.12, y - h)])
        t.fill('z30', rect(cx - 0.18, y - h + 0.12, 0.36, h - 0.12), 0.35)
    t.fill('k34', [(cx - 0.42, 4.95), (cx + 0.42, 4.95), (cx + 0.28, 1.75), (cx - 0.28, 1.75)])
    for k in range(6):
        t.fill('z30', rect(cx - 0.05, 4.6 - k * 0.48, 0.1, 0.16), 0.4)
    t.fill('k40', rect(cx - 0.42, 1.45, 0.84, 0.32))
    t.fill('k44', [(cx - 0.5, 1.47), (cx + 0.5, 1.47), (cx + 0.3, 1.3), (cx - 0.3, 1.3)])
    t.line('k60', [(cx, 1.3), (cx, 0.25)], 2.2)
    t.fill('#DA251D', [(cx, 0.28), (cx + 1.25, 0.28), (cx + 1.25, 1.08), (cx, 1.08)])
    t.fill('#FFDE00', star(cx + 0.62, 0.68, 0.27))
    t.fill('k16', [(-0.2, 6.55), (W + 0.2, 6.55), (W + 0.2, H + 0.2), (-0.2, H + 0.2)])
    for x, h in [(6.3, 1.6), (6.9, 1.2), (12.6, 1.8), (13.1, 1.3)]:
        tree(t, rnd, x, 6.6, h, 'k20')
    return t


def cong_thanh(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=12)
    for k in range(14):
        u = math.pi + math.pi * (k + 0.5) / 14
        t.fill('a30', [(9.4, 3.2), (9.4 + 9 * math.cos(u - 0.04), 3.2 + 9 * math.sin(u - 0.04)), (9.4 + 9 * math.cos(u + 0.04), 3.2 + 9 * math.sin(u + 0.04))], 0.18)
    t.fill('a50', circle(9.4, 3.2, 1.0, 64), 0.5)
    # tường thành và ba cửa vòm
    x0, x1, top, bot = 6.4, 12.6, 3.9, 6.7
    wall = rect(x0, top, x1 - x0, bot - top)
    holes = []
    for cxa in (7.9, 9.5, 11.1):
        hole = [(cxa - 0.48, bot)] + arc(cxa, top + 1.6, 0.48, math.pi, TAU, 16) + [(cxa + 0.48, bot)]
        holes.append(list(reversed(hole)))
    t.fill('k26', [wall] + holes)
    for i in range(int((x1 - x0) / 0.3)):
        t.fill('k26', rect(x0 + i * 0.3, top - 0.18, 0.18, 0.2))
    t.fill('z30', rect(x0, top + 0.35, x1 - x0, 0.06), 0.3)
    # lầu trên cửa
    t.fill('k32', rect(8.2, 2.85, 2.6, 1.05))
    t.fill('k40', roof(9.5, 2.9, 3.6, 0.55, 0.3))
    t.fill('k36', rect(8.6, 2.05, 1.8, 0.45))
    t.fill('k44', roof(9.5, 2.1, 2.6, 0.45, 0.25))
    for x in (8.5, 9.0, 10.0, 10.5):
        t.fill('z30', rect(x - 0.08, 3.1, 0.16, 0.55), 0.35)
    for x in (6.7, 12.3):
        t.line('k50', [(x, top - 0.15), (x, top - 1.4)], 1.4)
        t.fill('#DA251D', [(x, top - 1.4), (x + 0.5, top - 1.25), (x, top - 1.05)])
    t.fill('k14', [(-0.2, 6.7), (W + 0.2, 6.7), (W + 0.2, H + 0.2), (-0.2, H + 0.2)])
    for x, h in [(5.4, 1.5), (5.9, 1.1), (13.1, 1.4)]:
        tree(t, rnd, x, 6.75, h, 'k18')
    return t


def trong_dong(rnd):
    t = Tranh()
    sky(t, 'c', t0=0, t1=10)
    cx, cy = 10.6, 3.75
    radii = [4.6, 4.25, 3.65, 3.3, 2.75, 2.45, 1.95, 1.65, 1.1]
    for i, r in enumerate(radii):
        t.fill(f'c{30 + (i % 2) * 18 + i * 3}', circle(cx, cy, r, 96))
    # vành răng cưa
    for k in range(64):
        u = TAU * k / 64
        p = [(cx + 3.3 * math.cos(u - 0.035), cy + 3.3 * math.sin(u - 0.035)), (cx + 3.62 * math.cos(u), cy + 3.62 * math.sin(u)),
             (cx + 3.3 * math.cos(u + 0.035), cy + 3.3 * math.sin(u + 0.035))]
        t.fill('c78', p, 0.8)
    # đàn chim lạc bay quanh vành ngoài
    for k in range(10):
        u = TAU * k / 10
        bx, by = cx + 3.95 * math.cos(u), cy + 3.95 * math.sin(u)
        bird = [(0.42, 0), (0.12, -0.06), (-0.05, -0.28), (-0.12, -0.05), (-0.42, 0.02), (-0.1, 0.06), (0.05, 0.1)]
        t.fill('c85', rot([(bx + x, by + y) for x, y in bird], bx, by, u + math.pi / 2))
    # vành người, nhà sàn giản lược: vạch ngắn
    for k in range(40):
        u = TAU * k / 40
        t.line('c85', [(cx + 2.5 * math.cos(u), cy + 2.5 * math.sin(u)), (cx + 2.7 * math.cos(u), cy + 2.7 * math.sin(u))], 2.0, 0.8)
    for k in range(36):
        u = TAU * k / 36
        t.fill('c80', circle(cx + 1.8 * math.cos(u), cy + 1.8 * math.sin(u), 0.06, 10))
    t.fill('c95', star(cx, cy, 1.05, 14, 0.38))
    t.fill('c40', circle(cx, cy, 0.22, 24))
    return t


def mai_dinh(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=12)
    t.fill('a28', circle(11.0, 2.0, 1.3, 64), 0.5)
    t.fill('k10', ridge(rnd, 5.4, 0.4))
    # đình: nền, cột, mái hai tầng đao cong
    t.fill('k22', rect(6.4, 6.25, 6.6, 0.4))
    t.fill('k28', rect(7.0, 5.0, 5.4, 1.25))
    for x in [7.3 + 0.62 * i for i in range(9)]:
        t.fill('z30', rect(x, 5.1, 0.14, 1.15), 0.35)
    t.fill('k40', roof(9.7, 5.05, 6.6, 0.95, 0.45))
    t.fill('k34', rect(8.4, 3.35, 2.6, 0.75))
    t.fill('k48', roof(9.7, 3.45, 4.0, 0.75, 0.38))
    t.fill('k55', rect(9.55, 2.1, 0.3, 0.6))
    for x in range(0, 30):
        xx = 6.2 + x * 0.24
        if 6.3 < xx < 13.1:
            t.line('z30', [(xx, 4.4 + 0.02 * ((x % 2))), (xx + 0.05, 5.0)], 0.6, 0.25)
    # dây đèn lồng
    pts = [(6.0 + 7.6 * i / 40, 0.55 + 0.55 * math.sin(math.pi * i / 40)) for i in range(41)]
    t.line('k40', pts, 1.0, 0.7)
    for i in range(1, 8):
        x = 6.0 + 7.6 * i / 8
        y = 0.55 + 0.55 * math.sin(math.pi * i / 8)
        lantern(t, x, y + 0.75, 0.42, '#D7263D' if i % 2 else '#F2A541', 'k60')
    t.fill('k16', [(-0.2, 6.65), (W + 0.2, 6.65), (W + 0.2, H + 0.2), (-0.2, H + 0.2)])
    return t


def phao_hoa(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=10)
    bursts = [(10.2, 2.0, 1.7, '#FFD166'), (7.6, 1.5, 1.1, 'a80'), (12.2, 3.6, 1.0, '#FF6B6B'), (8.7, 3.6, 0.8, 'c75'), (5.4, 2.6, 0.6, 'k70')]
    for cx, cy, r, col in bursts:
        t.fill(col, circle(cx, cy, r * 0.5, 40), 0.08)
        n = 26
        for k in range(n):
            u = TAU * k / n + rnd.uniform(-0.04, 0.04)
            r0, r1 = r * 0.18, r * rnd.uniform(0.85, 1.05)
            pts = [(cx + (r0 + (r1 - r0) * s / 6) * math.cos(u), cy + (r0 + (r1 - r0) * s / 6) * math.sin(u) + 0.08 * (s / 6) ** 2) for s in range(7)]
            t.line(col, pts, 1.6, 0.85)
            t.fill(col, circle(pts[-1][0], pts[-1][1], 0.045, 8))
        t.line(col, [(cx + 0.05, 6.4), (cx - 0.02, cy + r * 0.3)], 0.8, 0.3)
    dust(t, rnd, 60, (4.5, 0.2, 13.2, 4.8), 'k70', 0.01, 0.03, 0.6)
    skyline(t, rnd, 4.6, 13.5, 6.35, 0.5, 1.6, 'k12', 'c70', 0.55)
    wavesband(t, 6.55, 0.05, 2.0, 0.5, 'a20')
    for k in range(18):
        x = 5 + rnd.uniform(0, 8.2)
        t.line('#FFD166', [(x, 6.75 + rnd.uniform(0, 0.4)), (x + rnd.uniform(0.3, 0.7), 6.75 + rnd.uniform(0, 0.4))], 1.2, 0.35)
    return t


def mai_long(rnd):
    t = Tranh()
    sky(t, 'c', t0=0, t1=12)
    t.fill('c30', circle(10.4, 4.3, 2.4, 64), 0.35)
    out = {'segs': [], 'tips': []}
    branch(rnd, 13.6, 0.2, 2.55, 2.2, 0.16, 4, out)
    branch(rnd, 13.6, 6.2, 3.55, 1.8, 0.12, 3, out)
    for seg in out['segs']:
        t.fill('k24', seg)
    for i, (x, y) in enumerate(out['tips']):
        if rnd.random() < 0.8:
            flower5(t, x, y, rnd.uniform(0.16, 0.28), '#F6C343', '#C2410C', rnd.uniform(0, TAU))
        if rnd.random() < 0.4:
            t.fill('#F6C343', circle(x + rnd.uniform(-0.3, 0.3), y + rnd.uniform(-0.3, 0.3), 0.06, 10))
    for x, y, s in [(7.6, 1.9, 0.75), (9.0, 2.9, 0.95), (6.4, 3.3, 0.55), (11.6, 4.7, 0.7)]:
        lantern(t, x, y, s, '#D7263D', '#F6C343')
    dust(t, rnd, 40, (5.0, 0.3, 13.0, 7.0), '#F6C343', 0.02, 0.05, 0.5)
    return t


def nui_rung(rnd):
    t = Tranh()
    sky(t, 'c', t0=0, t1=18)
    t.fill('c60', circle(9.9, 3.1, 1.15, 64), 0.85)
    t.fill('c40', circle(9.9, 3.1, 1.6, 64), 0.25)
    for i, (y, amp) in enumerate([(3.9, 0.9), (4.6, 0.8), (5.3, 0.7), (6.0, 0.55), (6.7, 0.4)]):
        t.fill(f'k{8 + i * 6}', ridge(rnd, y, amp, k=4))
    for k in range(5):
        x, y = 7.5 + rnd.uniform(0, 4.5), 1.2 + rnd.uniform(0, 1.6)
        s = rnd.uniform(0.12, 0.22)
        t.line('k45', [(x - s, y - s * 0.4), (x, y), (x + s, y - s * 0.4)], 1.4)
    # rừng thông lớp gần
    for k in range(26):
        x = 5.5 + k * 0.32 + rnd.uniform(-0.1, 0.1)
        h = rnd.uniform(0.7, 1.4)
        base = 7.0 + rnd.uniform(-0.05, 0.1)
        t.fill('k36', [(x, base - h), (x + 0.22, base), (x - 0.22, base)])
    return t


def vinh(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=14, bot=5.0)
    t.fill('a35', circle(11.2, 1.7, 0.75, 48), 0.6)
    t.fill('a10', rect(-0.2, 5.0, W + 0.4, 2.7))
    for i, (cx, w, h, role) in enumerate([(6.2, 1.0, 1.6, 'k10'), (7.6, 1.6, 2.5, 'k14'), (12.4, 1.8, 3.1, 'k16'), (10.0, 1.3, 3.6, 'k22'), (8.7, 0.9, 1.9, 'k26'), (11.3, 0.8, 1.6, 'k30')]):
        pts = [(cx - w / 2 - 0.1, 5.02)]
        for s in range(21):
            u = math.pi * s / 20
            pts.append((cx - w / 2 * math.cos(u) + 0.08 * math.sin(3 * u + i), 5.0 - h * (math.sin(u) ** 0.6) * (1 - 0.1 * math.sin(5 * u + i))))
        pts.append((cx + w / 2 + 0.1, 5.02))
        t.fill(role, pts)
        refl = [(x, 10.04 - y) for x, y in pts]
        t.fill(role, refl, 0.25)
    for k in range(16):
        y = 5.3 + k * 0.14
        x = 4.5 + rnd.uniform(0, 7.5)
        t.line('k40', [(x, y), (x + rnd.uniform(0.4, 1.4), y)], 0.8, 0.35)
    # thuyền buồm
    bx, by = 9.2, 6.0
    t.fill('k45', [(bx - 0.9, by), (bx + 0.9, by), (bx + 0.6, by + 0.3), (bx - 0.7, by + 0.3)])
    for dx, hh in [(-0.35, 1.3), (0.25, 1.6)]:
        sail = [(bx + dx, by - 0.05), (bx + dx, by - hh), (bx + dx + 0.62, by - hh * 0.92), (bx + dx + 0.7, by - 0.1)]
        t.fill('c70', sail)
        for j in range(1, 5):
            yy = by - hh * j / 5
            t.line('c45', [(bx + dx, yy), (bx + dx + 0.66, yy + 0.02)], 0.7, 0.6)
    return t


def sach_chong(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=10)
    t.fill('a22', circle(10.0, 3.5, 3.0, 64), 0.35)
    y = 6.9
    cols = ['a70', 'c70', 'k60', 'a50', 'c55', 'k45', 'a85']
    for i, c in enumerate(cols):
        h = rnd.uniform(0.32, 0.5)
        w = rnd.uniform(3.2, 4.2)
        x = 9.9 - w / 2 + rnd.uniform(-0.35, 0.35)
        t.fill(c, rect(x, y - h, w, h))
        t.fill('k85', rect(x + w - 0.12, y - h + 0.05, 0.1, h - 0.1), 0.8)
        t.fill('z30', rect(x + 0.35, y - h, 0.12, h), 0.3)
        t.fill('z30', rect(x + 0.55, y - h, 0.05, h), 0.3)
        y -= h
    # chậu cây trên chồng sách
    t.fill('c60', [(9.5, y), (10.5, y), (10.35, y - 0.7), (9.65, y - 0.7)])
    for k in range(7):
        u = -math.pi / 2 + (k - 3) * 0.32
        L = 1.2 + 0.25 * (3 - abs(k - 3))
        tip = (10.0 + L * math.cos(u), y - 0.7 + L * math.sin(u))
        mid = (10.0 + L * 0.5 * math.cos(u) + 0.18 * math.cos(u + math.pi / 2), y - 0.7 + L * 0.5 * math.sin(u) + 0.18 * math.sin(u + math.pi / 2))
        mid2 = (10.0 + L * 0.5 * math.cos(u) - 0.18 * math.cos(u + math.pi / 2), y - 0.7 + L * 0.5 * math.sin(u) - 0.18 * math.sin(u + math.pi / 2))
        t.fill('k40' if k % 2 else 'a60', [(10.0, y - 0.7), mid, tip, mid2])
    # bóng đèn ý tưởng
    t.fill('#FFD166', circle(12.1, 1.6, 0.55, 40), 0.9)
    t.fill('k60', rect(11.88, 2.1, 0.44, 0.35))
    for k in range(9):
        u = math.pi + math.pi * k / 8
        t.line('#FFD166', [(12.1 + 0.75 * math.cos(u), 1.6 + 0.75 * math.sin(u)), (12.1 + 1.05 * math.cos(u), 1.6 + 1.05 * math.sin(u))], 2.0, 0.8)
    dust(t, rnd, 30, (6.5, 0.5, 13.0, 5.0), 'k60', 0.015, 0.04, 0.6)
    return t


def sach_mo(rnd):
    t = Tranh()
    sky(t, 'c', t0=0, t1=12)
    cx, cy = 9.6, 6.1
    # quỹ đạo nguyên tử
    for k in range(3):
        e = rot(circle(10.2, 2.4, 1.7, 64, 0.55), 10.2, 2.4, k * math.pi / 3)
        t.line('a60', e + [e[0]], 1.6, 0.8)
    t.fill('a80', circle(10.2, 2.4, 0.22, 24))
    for k in range(3):
        u = k * math.pi / 3
        t.fill('c80', circle(10.2 + 1.7 * math.cos(u + 0.6) * math.cos(u) - 0.55 * math.sin(u + 0.6) * math.sin(u),
                             2.4 + 1.7 * math.cos(u + 0.6) * math.sin(u) + 0.55 * math.sin(u + 0.6) * math.cos(u), 0.1, 16))
    # tia sáng từ trang sách
    for k in range(11):
        u = -math.pi + math.pi * (k + 0.5) / 11
        t.fill('k40', [(cx, cy - 0.6), (cx + 5 * math.cos(u - 0.05), cy - 0.6 + 5 * math.sin(u - 0.05)), (cx + 5 * math.cos(u + 0.05), cy - 0.6 + 5 * math.sin(u + 0.05))], 0.08)
    dust(t, rnd, 70, (6.0, 0.4, 13.0, 5.4), 'k70', 0.015, 0.05, 0.7)
    for side in (-1, 1):
        page = [(cx, cy - 0.55)]
        for s in range(21):
            x = cx + side * 3.0 * s / 20
            page.append((x, cy - 0.55 - 0.35 * math.sin(math.pi * s / 20) + 0.12 * (s / 20)))
        page += [(cx + side * 3.0, cy + 0.15), (cx, cy + 0.05)]
        t.fill('k70' if side < 0 else 'k78', page)
        for j in range(6):
            yy = cy - 0.3 + j * 0.06
            t.line('z30', [(cx + side * (0.3 + 2.4 * s / 10), yy - 0.3 * math.sin(math.pi * (0.1 + 0.8 * s / 10)) + 0.1 * s / 10 + j * 0.04) for s in range(11)], 0.5, 0.25)
    t.fill('k50', [(cx - 3.1, cy + 0.15), (cx + 3.1, cy + 0.15), (cx + 3.2, cy + 0.32), (cx - 3.2, cy + 0.32)])
    return t


def toc_do(rnd):
    t = Tranh()
    sky(t, 'k', t0=0, t1=6)
    cx, cy = 9.8, 3.6
    t.fill('#E63946', circle(cx, cy, 2.0, 72), 0.9)
    for k in range(72):
        u = TAU * k / 72 + rnd.uniform(-0.02, 0.02)
        w = rnd.uniform(0.006, 0.02)
        r0 = rnd.uniform(2.3, 3.4)
        t.fill('k70', [(cx + r0 * math.cos(u), cy + r0 * math.sin(u)), (cx + 12 * math.cos(u - w), cy + 12 * math.sin(u - w)),
                       (cx + 12 * math.cos(u + w), cy + 12 * math.sin(u + w))], 0.55)
    # chấm tram
    for i in range(22):
        for j in range(12):
            x, y = 5.2 + i * 0.38 + (j % 2) * 0.19, 0.3 + j * 0.62
            d = math.hypot(x - cx, y - cy)
            r = 0.13 * max(0, 1 - d / 6.5)
            if r > 0.02:
                t.fill('a60', circle(x, y, r, 12), 0.7)
    t.fill('k80', star(cx, cy, 1.2, 8, 0.45, 0.2), 0.9)
    t.fill('#E63946', star(cx, cy, 0.62, 8, 0.45, 0.2))
    return t


def pho_dem(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=14)
    t.fill('k75', circle(10.4, 2.3, 1.45, 72), 0.9)
    t.fill('k60', circle(10.4, 2.3, 1.9, 72), 0.15)
    for k in range(5):
        t.fill('k60', circle(10.0 + rnd.uniform(-0.8, 0.8), 2.1 + rnd.uniform(-0.8, 0.8), rnd.uniform(0.08, 0.22), 20), 0.12)
    dust(t, rnd, 50, (4.5, 0.2, 13.2, 3.5), 'k80', 0.01, 0.025, 0.7)
    skyline(t, rnd, 4.2, 13.6, 5.6, 0.6, 1.9, 'k14', 'c75', 0.6)
    skyline(t, rnd, 4.8, 13.6, 6.5, 0.4, 1.4, 'k22', '#FFD166', 0.5)
    t.fill('k28', rect(-0.2, 6.5, W + 0.4, 1.2))
    for k in range(45):
        x, y = rnd.uniform(5.0, 13.2), rnd.uniform(0.2, 7.2)
        pet = rot([(x, y - 0.08), (x + 0.07, y), (x, y + 0.09), (x - 0.07, y)], x, y, rnd.uniform(0, TAU))
        t.fill('#F4A6C0', pet, rnd.uniform(0.55, 0.95))
    return t


def ngoi_truong(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=12)
    t.fill('k10', ridge(rnd, 5.5, 0.3))
    x0, x1, top, bot = 6.6, 12.8, 3.6, 6.4
    t.fill('k30', rect(x0, top, x1 - x0, bot - top))
    for row in range(3):
        for c in range(9):
            if c == 4:
                continue
            t.fill('a60', rect(x0 + 0.3 + c * 0.66, top + 0.3 + row * 0.85, 0.42, 0.5), 0.85)
    t.fill('k38', [(x0 - 0.25, top), (x1 + 0.25, top), (x1, top - 0.3), (x0, top - 0.3)])
    t.fill('k44', rect(9.15, 2.4, 1.0, 4.0))
    t.fill('k50', [(8.95, 2.45), (10.35, 2.45), (9.65, 1.75)])
    t.fill('k60', circle(9.65, 2.85, 0.2, 24))
    t.fill('z30', rect(9.35, 5.5, 0.6, 0.9), 0.5)
    t.line('k60', [(9.65, 1.75), (9.65, 0.55)], 1.6)
    t.fill('#DA251D', rect(9.65, 0.55, 0.85, 0.55))
    t.fill('#FFDE00', star(10.07, 0.82, 0.17))
    t.fill('k18', rect(-0.2, 6.4, W + 0.4, 1.3))
    # cây phượng
    out = {'segs': [], 'tips': []}
    branch(rnd, 5.6, 6.5, -1.45, 1.6, 0.16, 3, out)
    for s in out['segs']:
        t.fill('k24', s)
    for x, y in out['tips']:
        t.fill('k28', blob(x, y, 0.55, 0.38, rnd), 0.9)
        for k in range(5):
            t.fill('#E63946', circle(x + rnd.uniform(-0.5, 0.5), y + rnd.uniform(-0.35, 0.3), rnd.uniform(0.07, 0.16), 12), 0.95)
    for k in range(25):
        t.fill('#E63946', circle(rnd.uniform(4.5, 8.5), rnd.uniform(6.5, 7.3), 0.05, 8), 0.7)
    return t


def but_chi(rnd):
    t = Tranh()
    sky(t, 'k', t0=0, t1=6)
    # trang vở kẻ ô li
    page = rot(rect(6.4, 0.6, 6.8, 7.4), 9.8, 4.3, -0.12)
    t.fill('k80', page, 0.92)
    for k in range(1, 18):
        y = 0.6 + k * 0.4
        ln = rot([(6.4, y), (13.2, y)], 9.8, 4.3, -0.12)
        t.line('a40', ln, 0.7, 0.6)
    t.line('#E63946', rot([(7.3, 0.6), (7.3, 8.0)], 9.8, 4.3, -0.12), 1.0, 0.7)
    # bút chì chéo
    for i, (col, dx) in enumerate([('#F6C343', 0.0), ('#2EC4B6', 0.75), ('#E63946', 1.5)]):
        x0, y0, L, ang = 13.8 + dx, 5.4 + dx * 0.6, 5.6, math.pi + 0.55
        nx, ny = -math.sin(ang) * 0.24, math.cos(ang) * 0.24
        ex, ey = x0 + L * math.cos(ang), y0 + L * math.sin(ang)
        tx, ty = x0 + (L + 0.75) * math.cos(ang), y0 + (L + 0.75) * math.sin(ang)
        t.fill(col, [(x0 + nx, y0 + ny), (ex + nx, ey + ny), (ex - nx, ey - ny), (x0 - nx, y0 - ny)])
        t.fill('z30', [(x0 + nx * 0.3, y0 + ny * 0.3), (ex + nx * 0.3, ey + ny * 0.3), (ex - nx * 0.1, ey - ny * 0.1), (x0 - nx * 0.1, y0 - ny * 0.1)], 0.18)
        t.fill('#F1D3A1', [(ex + nx, ey + ny), (tx, ty), (ex - nx, ey - ny)])
        t.fill('#333333', [(ex + (tx - ex) * 0.7 + nx * 0.3, ey + (ty - ey) * 0.7 + ny * 0.3), (tx, ty), (ex + (tx - ex) * 0.7 - nx * 0.3, ey + (ty - ey) * 0.7 - ny * 0.3)])
    # máy bay giấy
    t.fill('k90', [(7.6, 2.0), (9.4, 1.2), (8.4, 2.3)])
    t.fill('k70', [(8.4, 2.3), (9.4, 1.2), (8.6, 2.7)])
    t.line('k60', [(5.6, 3.2), (6.4, 2.6), (7.2, 2.4), (7.6, 2.0)], 1.0, 0.5)
    return t


def khue_van_cac(rnd):
    t = Tranh()
    sky(t, 'c', t0=0, t1=12)
    t.fill('c35', circle(10.0, 2.2, 1.9, 64), 0.4)
    cx = 10.0
    t.fill('k18', rect(5.0, 5.3, 8.6, 1.2))
    for i in range(29):
        t.fill('k22', rect(5.0 + i * 0.3, 5.15, 0.2, 0.18))
    t.fill('k24', rect(cx - 1.9, 6.3, 3.8, 0.3))
    for x in (cx - 1.35, cx - 0.45, cx + 0.45, cx + 1.35):
        t.fill('k34', rect(x - 0.22, 4.25, 0.44, 2.05))
    t.fill('k36', rect(cx - 1.75, 4.05, 3.5, 0.25))
    t.fill('k42', roof(cx, 4.05, 4.4, 0.4, 0.38))
    t.fill('k40', rect(cx - 1.2, 2.45, 2.4, 1.25))
    t.fill('a50', circle(cx, 3.08, 0.42, 36), 0.9)
    for k in range(8):
        u = TAU * k / 8
        t.line('k40', [(cx, 3.08), (cx + 0.42 * math.cos(u), 3.08 + 0.42 * math.sin(u))], 1.4)
    t.fill('k48', roof(cx, 2.5, 3.4, 0.45, 0.4))
    t.fill('k55', rect(cx - 0.12, 1.55, 0.24, 0.45))
    for x, h in [(6.0, 1.9), (6.7, 1.5), (13.0, 2.1), (12.4, 1.4)]:
        tree(t, rnd, x, 5.4, h, 'k22')
    t.fill('a18', rect(-0.2, 6.6, W + 0.4, 1.1))
    for k in range(10):
        y = 6.75 + k * 0.08
        x = 6 + rnd.uniform(0, 6.5)
        t.line('k40', [(x, y), (x + rnd.uniform(0.4, 1.2), y)], 0.7, 0.3)
    return t


def chua_mot_cot(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=12)
    t.fill('a30', circle(9.8, 2.9, 2.2, 64), 0.35)
    t.fill('a16', rect(-0.2, 5.1, W + 0.4, 2.6))
    for k in range(12):
        y = 5.3 + k * 0.17
        x = 5.5 + rnd.uniform(0, 7)
        t.line('k35', [(x, y), (x + rnd.uniform(0.3, 1.0), y)], 0.7, 0.35)
    cx = 9.8
    t.fill('k30', rect(cx - 0.22, 4.2, 0.44, 1.6))
    t.fill('k30', rect(cx - 0.22, 5.8, 0.44, 0.6), 0.25)
    t.fill('k36', [(cx - 1.4, 4.25), (cx + 1.4, 4.25), (cx + 0.3, 4.6), (cx - 0.3, 4.6)])
    t.fill('k38', rect(cx - 1.1, 3.15, 2.2, 1.1))
    for x in (cx - 0.9, cx - 0.3, cx + 0.3, cx + 0.9):
        t.fill('z30', rect(x - 0.06, 3.25, 0.12, 0.95), 0.35)
    t.fill('k46', roof(cx, 3.2, 3.0, 0.6, 0.45))
    t.fill('k52', circle(cx, 2.15, 0.14, 16))
    # lá sen, hoa sen
    for k in range(9):
        x, y = 6.2 + k * 0.85 + rnd.uniform(-0.2, 0.2), 6.0 + rnd.uniform(-0.3, 0.9)
        r = rnd.uniform(0.35, 0.6)
        leaf = circle(x, y, r, 30, r * 0.35)
        t.fill('k24' if k % 2 else 'k30', leaf)
    for x, y in [(7.2, 5.6), (11.4, 5.75), (12.6, 6.4), (8.2, 6.6)]:
        for k in range(5):
            u = -math.pi / 2 + (k - 2) * 0.42
            pet = rot([(x, y), (x - 0.12, y - 0.25), (x, y - 0.5), (x + 0.12, y - 0.25)], x, y, u + math.pi / 2)
            t.fill('#F28CB1', pet, 0.95)
    return t


def nhip_tim(rnd):
    t = Tranh()
    sky(t, 'k', t0=0, t1=6)
    # lưới giấy điện tim
    for k in range(34):
        t.line('a30', [(4.5 + k * 0.27, 0), (4.5 + k * 0.27, H)], 0.5, 0.35)
    for k in range(28):
        t.line('a30', [(4.5, k * 0.27), (W, k * 0.27)], 0.5, 0.35)
    pts, x = [], -0.2
    beat = [(0, 0), (0.25, -0.1), (0.4, 0), (0.55, 0.15), (0.65, -1.6), (0.78, 0.9), (0.9, 0), (1.25, -0.25), (1.45, 0)]
    while x < W + 0.2:
        for dx, dy in beat:
            pts.append((x + dx, 4.6 + dy))
        x += 2.1
    t.line('a80', pts, 3.0)
    t.line('a60', pts, 8.0, 0.2)
    # chữ thập y tế
    cx, cy = 10.4, 2.1
    t.fill('k80', circle(cx, cy, 1.15, 64), 0.92)
    t.fill('#E63946', [(cx - 0.25, cy - 0.8), (cx + 0.25, cy - 0.8), (cx + 0.25, cy - 0.25), (cx + 0.8, cy - 0.25), (cx + 0.8, cy + 0.25), (cx + 0.25, cy + 0.25),
                       (cx + 0.25, cy + 0.8), (cx - 0.25, cy + 0.8), (cx - 0.25, cy + 0.25), (cx - 0.8, cy + 0.25), (cx - 0.8, cy - 0.25), (cx - 0.25, cy - 0.25)])
    for k in range(9):
        x, y, r = rnd.uniform(6.0, 13.0), rnd.uniform(5.4, 7.3), rnd.uniform(0.15, 0.4)
        t.fill('c50', circle(x, y, r, 30), 0.45)
        t.fill('c75', circle(x + r * 0.2, y - r * 0.1, r * 0.35, 16), 0.6)
    return t


def adn(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=10)
    ang = -0.5
    cx, cy = 9.8, 3.75
    n = 60
    A, B = [], []
    for i in range(n + 1):
        s = -4.6 + 9.2 * i / n
        A.append((s, 0.75 * math.sin(1.6 * s)))
        B.append((s, -0.75 * math.sin(1.6 * s)))
    tr = lambda p: (cx + p[0] * math.cos(ang) - p[1] * math.sin(ang), cy + p[0] * math.sin(ang) + p[1] * math.cos(ang))
    for i in range(0, n + 1, 2):
        a, b = tr(A[i]), tr(B[i])
        t.line('k50' if i % 4 else 'c70', [a, b], 2.6, 0.85)
    t.line('a80', [tr(p) for p in A], 5.0)
    t.line('c80', [tr(p) for p in B], 5.0)
    for i in range(0, n + 1, 4):
        for p in (A[i], B[i]):
            x, y = tr(p)
            t.fill('k80', circle(x, y, 0.09, 16))
    # phân tử lục giác
    for hx, hy, r in [(6.0, 1.4, 0.45), (6.78, 1.85, 0.45), (12.4, 6.3, 0.5), (11.6, 6.75, 0.5)]:
        hexa = [(hx + r * math.cos(TAU * k / 6), hy + r * math.sin(TAU * k / 6)) for k in range(7)]
        t.line('k45', hexa, 1.4, 0.7)
    dust(t, rnd, 40, (5.0, 0.3, 13.2, 7.2), 'k60', 0.02, 0.05, 0.5)
    return t


def hanh_tinh(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=8)
    dust(t, rnd, 140, (0.2, 0.1, 13.2, 7.4), 'k80', 0.008, 0.03, 0.8)
    for k in range(6):
        x, y = rnd.uniform(5, 13), rnd.uniform(0.3, 7)
        t.fill('k85', star(x, y, rnd.uniform(0.06, 0.12), 4, 0.25), 0.9)
    cx, cy, R = 10.0, 3.9, 1.9
    ring_out, ring_in = circle(cx, cy, 3.6, 96, 0.95), circle(cx, cy, 2.5, 96, 0.62)
    back = [ring_out[48:] + [ring_out[0]], list(reversed(ring_in[48:] + [ring_in[0]]))]
    t.fill('c60', [p for ring in back for p in ring], 0.85)
    t.fill('a55', circle(cx, cy, R, 80))
    for k in range(5):
        y = cy - R + (k + 0.6) * 2 * R / 5.4
        hw = math.sqrt(max(0.0, R * R - (y - cy) ** 2))
        t.fill('a70' if k % 2 else 'a42', rect(cx - hw, y, 2 * hw, 0.22), 0.55)
    t.fill('z30', circle(cx + 0.55, cy + 0.45, R * 0.95, 80), 0.25)
    front = ring_out[:49] + list(reversed(ring_in[:49]))
    t.fill('c75', front, 0.9)
    t.fill('k55', circle(6.9, 1.6, 0.42, 40))
    t.fill('z30', circle(7.02, 1.7, 0.38, 40), 0.3)
    return t


def ten_lua(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=8)
    dust(t, rnd, 110, (0.2, 0.1, 13.2, 7.4), 'k80', 0.008, 0.03, 0.8)
    t.fill('c50', circle(12.6, 9.2, 3.4, 96))
    t.fill('c35', circle(12.6, 9.2, 3.7, 96), 0.3)
    traj = [(5.0 + 6.0 * s / 30, 6.6 - 5.0 * (s / 30) ** 0.8) for s in range(31)]
    for i in range(0, 30, 2):
        t.line('k60', traj[i:i + 2], 1.4, 0.6)
    ang = -0.95
    cx, cy = 10.6, 2.4
    body = [(0, -0.85), (0.32, -0.45), (0.32, 0.75), (-0.32, 0.75), (-0.32, -0.45)]
    top = [(0, -1.35), (0.32, -0.45), (-0.32, -0.45)]
    fins = [[(0.32, 0.25), (0.65, 0.95), (0.32, 0.75)], [(-0.32, 0.25), (-0.65, 0.95), (-0.32, 0.75)]]
    flame = [(-0.22, 0.75), (0, 1.9), (0.22, 0.75)]
    flame2 = [(-0.12, 0.75), (0, 1.4), (0.12, 0.75)]
    T = lambda pts: rot([(cx + x, cy + y) for x, y in pts], cx, cy, ang + math.pi / 2)
    t.fill('#FF9F1C', T(flame), 0.9)
    t.fill('#FFD166', T(flame2))
    t.fill('k85', T(body))
    t.fill('#E63946', T(top))
    for f in fins:
        t.fill('#E63946', T(f))
    t.fill('a60', T(circle(0, -0.1, 0.16, 24)))
    t.line('k40', T([(0.16 * math.cos(u), -0.1 + 0.16 * math.sin(u)) for u in (TAU * i / 24 for i in range(25))]), 1.4)
    return t


def san_van_dong(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=10)
    cx = 9.6
    for lx, d in ((6.6, 1), (12.6, -1)):
        t.fill('k60', [(lx, 1.05), (lx + d * 7.5, 6.8), (lx + d * 4.2, 6.8)], 0.07)
        t.fill('k40', rect(lx - 0.05, 1.2, 0.1, 3.4))
        t.fill('k85', rect(lx - 0.35, 0.8, 0.7, 0.42))
        for i in range(3):
            for j in range(2):
                t.fill('#FFF3B0', circle(lx - 0.24 + i * 0.24, 0.92 + j * 0.18, 0.06, 10))
    # khán đài hình bầu dục
    for k, (rx, ry, role) in enumerate([(4.4, 1.9, 'k14'), (4.0, 1.6, 'k22'), (3.6, 1.35, 'k30'), (3.2, 1.1, 'k20')]):
        t.fill(role, circle(cx, 5.3, rx, 80, ry))
    for k in range(70):
        u = TAU * k / 70
        t.fill('c60' if k % 3 else 'a60', circle(cx + 3.85 * math.cos(u), 5.3 + 1.48 * math.sin(u), 0.05, 8), 0.7)
    t.fill('#3FA34D', circle(cx, 5.3, 2.8, 80, 0.88))
    t.line('k85', circle(cx, 5.3, 2.4, 80, 0.62) + [circle(cx, 5.3, 2.4, 80, 0.62)[0]], 1.2, 0.8)
    t.line('k85', [(cx, 4.68), (cx, 5.92)], 1.2, 0.8)
    t.line('k85', circle(cx, 5.3, 0.45, 40, 0.17) + [circle(cx, 5.3, 0.45, 40, 0.17)[0]], 1.2, 0.8)
    return t


def duong_chay(rnd):
    t = Tranh()
    sky(t, 'c', t0=0, t1=10)
    cx, cy = 13.6, 8.4
    cols = ['#C8553D', '#D96C4E']
    for k in range(7):
        r0, r1 = 3.2 + k * 0.62, 3.2 + (k + 1) * 0.62
        outer = arc(cx, cy, r1, math.pi, 1.5 * math.pi, 40)
        inner = list(reversed(arc(cx, cy, r0, math.pi, 1.5 * math.pi, 40)))
        t.fill(cols[k % 2], outer + inner)
        t.line('k90', arc(cx, cy, r1, math.pi, 1.5 * math.pi, 40), 1.4, 0.9)
    t.fill('#3FA34D', arc(cx, cy, 3.2, math.pi, 1.5 * math.pi, 40) + [(cx, cy)])
    for k in range(8):
        r = 3.2 + k * 0.62
        u = math.pi + 0.9
        t.line('k90', [(cx + 3.2 * math.cos(u), cy + 3.2 * math.sin(u)), (cx + 7.54 * math.cos(u), cy + 7.54 * math.sin(u))], 2.0, 0.9)
    # cúp vàng
    x, y = 9.2, 2.0
    G = '#F6C343'
    t.fill(G, [(x - 0.9, y - 0.9), (x + 0.9, y - 0.9), (x + 0.75, y), (x + 0.35, y + 0.55), (x - 0.35, y + 0.55), (x - 0.75, y)])
    for d in (-1, 1):
        t.line(G, [(x + d * 0.85, y - 0.7), (x + d * 1.3, y - 0.6), (x + d * 1.25, y - 0.1), (x + d * 0.7, y + 0.15)], 4.0)
    t.fill(G, rect(x - 0.12, y + 0.55, 0.24, 0.55))
    t.fill(G, rect(x - 0.55, y + 1.1, 1.1, 0.22))
    t.fill('k30', rect(x - 0.7, y + 1.32, 1.4, 0.32))
    t.fill('#FFF3B0', [(x - 0.55, y - 0.8), (x - 0.35, y - 0.8), (x - 0.42, y + 0.1)], 0.6)
    t.fill('k90', star(x, y - 0.25, 0.3), 0.9)
    for k in range(12):
        u = math.pi + math.pi * k / 11
        t.line(G, [(x + 1.6 * math.cos(u), y - 0.2 + 1.6 * math.sin(u)), (x + 2.0 * math.cos(u), y - 0.2 + 2.0 * math.sin(u))], 1.8, 0.6)
    dust(t, rnd, 35, (6.0, 0.3, 13.0, 4.0), G, 0.02, 0.05, 0.6)
    return t


def nhip_cau(rnd):
    t = Tranh()
    sky(t, 'c', t0=0, t1=14, bot=5.2)
    t.fill('c55', circle(9.6, 4.6, 1.5, 72), 0.7)
    t.fill('a18', rect(-0.2, 5.2, W + 0.4, 2.6))
    for k in range(14):
        y = 5.35 + k * 0.15
        x = 5.0 + rnd.uniform(0, 7.5)
        t.line('c60', [(x, y), (x + rnd.uniform(0.3, 1.2), y)], 0.8, 0.4)
    t.fill('k16', [(-0.2, 5.2), (4.6, 5.2), (5.4, 4.6), (5.4, H + 0.2), (-0.2, H + 0.2)])
    t.fill('k16', [(W + 0.2, 5.2), (13.0, 5.2), (12.6, 4.6), (12.6, H + 0.2), (W + 0.2, H + 0.2)])
    deck = 4.55
    t.fill('k40', rect(5.0, deck, 8.0, 0.18))
    for x0, x1 in [(5.4, 9.0), (9.0, 12.6)]:
        top = arc((x0 + x1) / 2, deck + 0.18, (x1 - x0) / 2, math.pi, TAU, 30, 1.6)
        inner = list(reversed(arc((x0 + x1) / 2, deck + 0.18, (x1 - x0) / 2 - 0.16, math.pi, TAU, 30, 1.45)))
        t.fill('k48', top + inner)
        for s in range(1, 10):
            x = x0 + (x1 - x0) * s / 10
            yy = deck + 0.18 - 1.6 * math.sqrt(max(0.0, 1 - ((x - (x0 + x1) / 2) / ((x1 - x0) / 2)) ** 2))
            t.line('k48', [(x, yy), (x, deck)], 1.0, 0.8)
        refl = [(x, 2 * (deck + 0.18) - y + 0.5) for x, y in top]
        t.line('k35', refl, 2.0, 0.25)
    t.fill('k44', rect(8.85, deck + 0.18, 0.3, 1.0))
    for x in (6.0, 7.5, 10.5, 12.0):
        t.fill('#DA251D' if x < 9 else '#1E50A2', [(x, deck - 0.75), (x + 0.36, deck - 0.65), (x, deck - 0.55)])
        t.line('k60', [(x, deck), (x, deck - 0.78)], 0.9)
    return t


def bo_cau(rnd):
    t = Tranh()
    sky(t, 'a', t0=0, t1=12)
    cx, cy, R = 10.2, 4.3, 2.6
    t.fill('a35', circle(cx, cy, R, 96), 0.7)
    for k in range(1, 6):
        y = cy - R + k * 2 * R / 6
        hw = math.sqrt(max(0.0, R * R - (y - cy) ** 2))
        t.line('k45', [(cx - hw, y), (cx + hw, y)], 1.0, 0.6)
    for k in range(-3, 4):
        e = circle(cx, cy, abs(k) * R / 3.6 + 0.001, 64, R)
        t.line('k45', e[16:49], 1.0, 0.6)
    t.line('k55', circle(cx, cy, R, 96) + [circle(cx, cy, R, 96)[0]], 1.6, 0.7)
    # mạng lưới kết nối
    nodes = [(cx + R * 0.9 * math.cos(u), cy + R * 0.9 * math.sin(u)) for u in (rnd.uniform(0, TAU) for _ in range(9))]
    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            if rnd.random() < 0.3:
                t.line('c70', [nodes[i], nodes[j]], 1.0, 0.5)
    for x, y in nodes:
        t.fill('c85', circle(x, y, 0.08, 12))
    # bồ câu
    bx, by, s = 8.1, 2.3, 1.15
    dove = [(1.2, -0.15), (0.95, -0.3), (0.7, -0.28), (0.45, -0.1), (-0.1, -0.05), (-0.55, -0.35), (-1.1, -0.95), (-1.2, -0.45),
            (-0.9, 0.05), (-1.25, 0.25), (-0.75, 0.3), (-0.2, 0.32), (0.35, 0.2), (0.8, 0.05)]
    t.fill('k90', [(bx + x * s, by + y * s) for x, y in dove])
    wing = [(0.1, -0.05), (-0.3, -0.75), (0.15, -1.25), (0.35, -0.6), (0.4, -0.12)]
    t.fill('k75', [(bx + x * s, by + y * s) for x, y in wing])
    t.fill('z30', circle(bx + 0.95 * s, by - 0.2 * s, 0.035, 10))
    t.fill('#F2A541', [(bx + 1.2 * s, by - 0.17 * s), (bx + 1.42 * s, by - 0.1 * s), (bx + 1.2 * s, by - 0.06 * s)])
    t.line('#4C9A2A', [(bx + 1.3 * s, by - 0.1 * s), (bx + 1.9 * s, by + 0.15 * s)], 1.6)
    for k in range(5):
        lx, ly = bx + (1.4 + 0.11 * k) * s, by + (-0.06 + 0.045 * k) * s
        d = 1 if k % 2 else -1
        t.fill('#4C9A2A', rot([(lx, ly), (lx + 0.12, ly - 0.05), (lx + 0.24, ly), (lx + 0.12, ly + 0.05)], lx, ly, d * 0.9))
    return t


SCENES = [
    ('lich-su', 'cot-co', 'Cột cờ', cot_co), ('lich-su', 'cong-thanh', 'Cổng thành cổ', cong_thanh),
    ('van-hoa', 'trong-dong', 'Mặt trống đồng', trong_dong), ('van-hoa', 'mai-dinh', 'Mái đình, đèn lồng', mai_dinh),
    ('le-hoi', 'phao-hoa', 'Pháo hoa đêm hội', phao_hoa), ('le-hoi', 'mai-long', 'Hoa mai, đèn lồng', mai_long),
    ('thien-nhien', 'nui-rung', 'Núi rừng bình minh', nui_rung), ('thien-nhien', 'vinh', 'Vịnh đá vôi', vinh),
    ('giao-duc', 'sach-chong', 'Chồng sách, ý tưởng', sach_chong), ('giao-duc', 'sach-mo', 'Sách mở, nguyên tử', sach_mo),
    ('anime', 'toc-do', 'Đường tốc độ', toc_do), ('anime', 'pho-dem', 'Phố đêm, hoa anh đào', pho_dem),
    ('truong-hoc', 'ngoi-truong', 'Ngôi trường, hoa phượng', ngoi_truong), ('truong-hoc', 'but-chi', 'Vở ô li, bút chì', but_chi),
    ('di-san', 'khue-van-cac', 'Khuê Văn Các', khue_van_cac), ('di-san', 'chua-mot-cot', 'Chùa Một Cột, đầm sen', chua_mot_cot),
    ('y-te', 'nhip-tim', 'Nhịp tim, chữ thập', nhip_tim), ('y-te', 'adn', 'Chuỗi ADN', adn),
    ('vu-tru', 'hanh-tinh', 'Hành tinh vành đai', hanh_tinh), ('vu-tru', 'ten-lua', 'Tên lửa', ten_lua),
    ('the-thao', 'san-van-dong', 'Sân vận động', san_van_dong), ('the-thao', 'duong-chay', 'Đường chạy, cúp vàng', duong_chay),
    ('doi-ngoai', 'nhip-cau', 'Nhịp cầu hữu nghị', nhip_cau), ('doi-ngoai', 'bo-cau', 'Bồ câu, địa cầu', bo_cau),
]


def build_all():
    out = []
    for i, (pack, sid, ten, fn) in enumerate(SCENES):
        t = fn(random.Random(1000 + i))
        out.append(dict(id=f'tranh-{sid}', goi=pack, loai='tranh', ten=ten, hinh=t.hinh))
    return out
