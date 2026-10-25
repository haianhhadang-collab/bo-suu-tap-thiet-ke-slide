"""Trang trí nền cho từng mẫu. Hình trang trí đặt tên "!!..." để hiệu ứng Morph
làm chúng trôi nhẹ giữa các slide (vị trí đổi theo số thứ tự slide)."""
from __future__ import annotations

import math
import random

from . import draw as D
from . import hoavan, khoanh
from .draw import H, W


def paint(slide, th, inv: bool, idx: int, kind: str, art=None) -> dict:
    """Vẽ nền + trang trí. Trả về vùng nội dung an toàn {x0,y0,x1,y1} và màu chân trang."""
    rnd = random.Random(idx * 7919 + len(th["id"]))
    fn = globals().get("_" + th["decor"], _minimal)
    if inv:
        D.background(slide, th["inv"], angle=135)
    else:
        bg = th["bg"] if idx % 2 else th["bg2"]
        D.background(slide, [bg])
    info = dict(x0=0.8, y0=0.62, x1=W - 0.8, y1=H - 0.72, foot=th["muted"] if not inv else th["inv_body"],
                bg=(th["inv"][0] if inv else (th["bg"] if idx % 2 else th["bg2"])))
    # ảnh trang trí theo chủ đề (khoanh.py): thay trang trí của mẫu và họa tiết ở trang bìa/chương/kết
    if art:
        khoanh.draw(slide, th, kind, art)
        return info
    # họa tiết theo chủ đề (hoavan.py): vẽ chồng lên trang trí của mẫu, hoặc thay hẳn ở trang bìa/chương/kết
    motif = hoavan.MOTIFS.get(th.get("motif") or "")
    if not (motif and inv and motif["own_inv"]):
        fn(slide, th, inv, idx, kind, rnd, info)
    if motif:
        motif["draw"](slide, th, inv, idx, kind, info)
    return info


# ---------- sóng ----------

def _wave_pts(top, amp, phase, freq, bottom=H + 0.05):
    pts = [(-0.05, bottom)]
    steps = 60
    for i in range(steps + 1):
        x = -0.05 + (W + 0.1) * i / steps
        y = top + amp * math.sin(freq * x + phase) + amp * 0.35 * math.sin(2.3 * freq * x + phase * 1.7)
        pts.append((x, y))
    pts.append((W + 0.05, bottom))
    return pts


def _waves(slide, th, inv, idx, kind, rnd, info):
    big = kind in ("cover", "closing")
    base = H - (1.75 if big else (1.25 if inv else 0.95))
    ph = idx * 0.85
    if inv:
        layers = [(th["accent2"], 0.35), (th["inv_accent"], 0.5), (th["bg"], 1.0)]
    else:
        layers = [(th["accent2"], 0.45), (th["accent"], 0.75), (th["ink"], 1.0)]
    for k, (col, al) in enumerate(layers):
        top = base + k * (0.32 if big else 0.22)
        D.poly(slide, _wave_pts(top, 0.13 + 0.03 * (2 - k), ph + k * 1.3, 0.55 + 0.12 * k),
               color=col, alpha=al if al < 1 else None, name=f"!!wave{k}")
    info["y1"] = base - (0.35 if not inv else 0.4)
    info["foot"] = th["inv_body"] if not inv else th["ink"]
    info["foot_y"] = H - 0.42


# ---------- quầng sáng gradient ----------

def _orbs(slide, th, inv, idx, kind, rnd, info):
    if inv:
        cx = 10.6 + rnd.uniform(-0.4, 0.4)
        cy = 2.2 + rnd.uniform(-0.3, 0.3)
        D.box(slide, cx - 3.4, cy - 3.4, 6.8, 6.8, kind="ellipse", radial=True,
              gradient=["FFFFFF", "FFFFFF"], galphas=[0.18, 0.0], name="!!orb1")
        for k, r in enumerate((2.8, 1.9, 1.1)):
            D.box(slide, cx - r, cy - r, 2 * r, 2 * r, kind="ellipse", color=None, line_color="FFFFFF",
                  line_w=1.25, line_alpha=0.16 + 0.04 * k, name=f"!!ring{k}")
        D.box(slide, -2.2 + rnd.uniform(-0.3, 0.3), H - 2.6, 4.6, 4.6, kind="ellipse", radial=True,
              gradient=[th["inv_accent"], th["inv_accent"]], galphas=[0.22, 0.0], name="!!orb2")
        D.box(slide, 0, H - 0.1, W, 0.1, gradient=[th["accent3"], th["inv_accent"]], angle=0, name="!!bar")
        info["y1"] = H - 0.8
    else:
        D.box(slide, 0, 0, W, 0.12, gradient=[th["inv"][0], th["accent"], th["accent2"]], angle=0, name="!!bar")
        ox = W - 3.6 + rnd.uniform(-0.5, 0.3)
        D.box(slide, ox, -2.4 + rnd.uniform(-0.3, 0.3), 5.2, 5.2, kind="ellipse", radial=True,
              gradient=[th["accent"], th["accent"]], galphas=[0.16, 0.0], name="!!orb1")
        D.box(slide, -1.8 + rnd.uniform(-0.3, 0.3), H - 1.9, 3.8, 3.8, kind="ellipse", radial=True,
              gradient=[th["accent2"], th["accent2"]], galphas=[0.12, 0.0], name="!!orb2")


# ---------- tối giản ----------

def _minimal(slide, th, inv, idx, kind, rnd, info):
    col = th["inv_accent"] if inv else th["accent"]
    if inv:
        D.box(slide, W - 2.6 + rnd.uniform(-0.2, 0.2), 1.0, 1.6, 1.6, kind="ellipse", line_color=col,
              line_w=1.0, line_alpha=0.6, name="!!circle")
        D.box(slide, W - 2.0, H - 0.55, 1.2, 0.03, color=col, name="!!line")
    else:
        D.box(slide, W - 0.95, 0.66, 0.13, 0.13, kind="ellipse", color=col, name="!!dot")
        D.box(slide, 0.8, H - 0.62, W - 1.6, 0.012, color=th["card_line"], name="!!line")
        info["y1"] = H - 0.85


# ---------- neon tối ----------

def _neon(slide, th, inv, idx, kind, rnd, info):
    if not inv:
        D.background(slide, [th["bg"], mix_dark(th)], angle=120)
    a, b = th["accent"], th["accent2"]
    D.box(slide, W - 4.2 + rnd.uniform(-0.6, 0.4), -2.6 + rnd.uniform(-0.4, 0.4), 6.0, 6.0, kind="ellipse",
          radial=True, gradient=[b, b], galphas=[0.32 if inv else 0.22, 0.0], name="!!glow1")
    D.box(slide, -2.4 + rnd.uniform(-0.4, 0.6), H - 2.8 + rnd.uniform(-0.3, 0.3), 5.0, 5.0, kind="ellipse",
          radial=True, gradient=[a, a], galphas=[0.22 if inv else 0.14, 0.0], name="!!glow2")
    if inv:
        for i in range(1, 12):
            D.box(slide, i * W / 12, 0, 0.008, H, color="FFFFFF", alpha=0.05, name=f"!!gv{i}")
        for j in range(1, 7):
            D.box(slide, 0, j * H / 7, W, 0.008, color="FFFFFF", alpha=0.05, name=f"!!gh{j}")
    D.box(slide, 0.8, 0.36, 0.9, 0.04, color=a, glow=a, glow_pt=6, glow_alpha=0.6, name="!!neonline")


def mix_dark(th):
    return D.mix(th["bg"], th["accent2"], 0.12)


# ---------- khung thanh lịch ----------

def _frame(slide, th, inv, idx, kind, rnd, info):
    col = th["inv_accent"] if inv else th["accent2"]
    D.box(slide, 0.3, 0.3, W - 0.6, H - 0.6, line_color=col, line_w=0.9, line_alpha=0.7, name="!!frame")
    if inv:
        D.box(slide, 0.42, 0.42, W - 0.84, H - 0.84, line_color=col, line_w=0.5, line_alpha=0.45, name="!!frame2")
        D.box(slide, W / 2 - 0.09, 0.21, 0.18, 0.18, kind="diamond", color=col, name="!!orn1")
        D.box(slide, W / 2 - 0.09, H - 0.39, 0.18, 0.18, kind="diamond", color=col, name="!!orn2")
    info.update(x0=0.95, x1=W - 0.95, y0=0.72, y1=H - 0.85)


# ---------- cổ điển ----------

def _vintage(slide, th, inv, idx, kind, rnd, info):
    if not inv:
        bg = th["bg"] if idx % 2 else th["bg2"]
        D.background(slide, [bg, D.mix(bg, th["accent2"], 0.28)], radial=True)
    col = th["inv_accent"] if inv else th["accent2"]
    D.box(slide, 0.25, 0.25, W - 0.5, H - 0.5, line_color=col, line_w=2.2, line_alpha=0.75, name="!!frame")
    D.box(slide, 0.36, 0.36, W - 0.72, H - 0.72, line_color=col, line_w=0.7, line_alpha=0.75, name="!!frame2")
    for k, (x, y) in enumerate(((0.25, 0.25), (W - 0.25, 0.25), (0.25, H - 0.25), (W - 0.25, H - 0.25))):
        D.box(slide, x - 0.13, y - 0.13, 0.26, 0.26, kind="diamond", color=col, name=f"!!corner{k}")
    info.update(x0=0.95, x1=W - 0.95, y0=0.72, y1=H - 0.85)


# ---------- mảng màu hữu cơ ----------

def _blob_pts(cx, cy, r, rnd, n=28, wob=0.18):
    ks = [rnd.uniform(-wob, wob) for _ in range(5)]
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        rr = r * (1 + ks[0] * math.sin(2 * t + ks[1] * 5) + ks[2] * math.cos(3 * t + ks[3] * 5) + ks[4] * math.sin(t))
        pts.append((cx + rr * math.cos(t), cy + rr * math.sin(t)))
    return pts


def _blobs(slide, th, inv, idx, kind, rnd, info):
    big = inv
    D.poly(slide, _blob_pts(W - (0.6 if big else 0.2), -0.1, 2.3 if big else 1.25, rnd),
           color=th["accent3"], alpha=0.6, name="!!blob1")
    D.poly(slide, _blob_pts(0.1, H + 0.05, 2.0 if big else 1.1, rnd), color=th["accent2"], alpha=0.5, name="!!blob2")
    if big:
        D.poly(slide, _blob_pts(W - 1.4, H - 0.6, 0.9, rnd), color=th["accent"], alpha=0.25, name="!!blob3")
    for k in range(4 if big else 3):
        r = rnd.uniform(0.07, 0.14)
        x = rnd.uniform(W * 0.55, W - 0.6) if k % 2 else rnd.uniform(0.6, W * 0.4)
        y = rnd.uniform(0.25, 0.5) if k % 2 else rnd.uniform(H - 0.55, H - 0.3)
        D.box(slide, x, y, r * 2, r * 2, kind="ellipse",
              color=(th["accent"], th["accent2"], th["accent3"])[k % 3], alpha=0.8, name=f"!!dot{k}")


# ---------- kiểu Matisse ----------

def _matisse(slide, th, inv, idx, kind, rnd, info):
    if inv:
        D.box(slide, W - 4.6 + rnd.uniform(-0.3, 0.3), -1.6, 5.2, 5.2, kind="ellipse", color=th["accent3"],
              name="!!m1")
        D.box(slide, W - 3.0, H - 3.1 + rnd.uniform(-0.2, 0.2), 2.6, 3.8, color=th["accent"], rotation=-12,
              name="!!m2")
        D.poly(slide, _blob_pts(W - 1.2, H - 0.2, 0.8, rnd, wob=0.3), color=th["bg"], alpha=0.9, name="!!m3")
        info["x1"] = W - 4.9
    else:
        D.box(slide, W - 0.75 + rnd.uniform(-0.15, 0.1), -0.9, 1.8, 1.8, kind="ellipse", color=th["accent3"],
              name="!!m1")
        D.box(slide, W - 0.55, H - 1.9 + rnd.uniform(-0.2, 0.2), 0.95, 1.8, color=th["accent2"], rotation=-12,
              name="!!m2")
        D.poly(slide, _blob_pts(-0.15, H - 0.2, 0.55, rnd, wob=0.3), color=th["accent"], alpha=0.95, name="!!m3")
        info["x1"] = W - 1.05


# ---------- lá cây ----------

def _leaf_pts(cx, cy, length, width, ang):
    pts = []
    n = 14
    for i in range(n + 1):
        t = i / n
        pts.append((t * length, width * math.sin(math.pi * t) * (1 - 0.25 * t)))
    for i in range(n, -1, -1):
        t = i / n
        pts.append((t * length, -width * math.sin(math.pi * t) * (1 - 0.25 * t) * 0.85))
    ca, sa = math.cos(ang), math.sin(ang)
    return [(cx + x * ca - y * sa, cy + x * sa + y * ca) for x, y in pts]


def _leaves(slide, th, inv, idx, kind, rnd, info):
    cols = [th["accent"], th["accent2"], th["inv_accent"] if inv else D.mix(th["accent2"], th["bg"], 0.35)]
    s = 1.0 if inv else 0.62
    sway = rnd.uniform(-0.12, 0.12)
    specs = [(W + 0.2, -0.3, 2.8, 0.55, 2.35), (W + 0.1, 0.4, 2.3, 0.45, 2.75), (W - 0.6, -0.4, 2.0, 0.4, 1.95),
             (-0.3, H + 0.3, 2.6, 0.5, -0.75), (-0.2, H - 0.5, 2.0, 0.42, -0.25)]
    if inv:  # trang bìa/chương: chữ thông tin nằm góc dưới trái => dời cụm lá dưới sang phải
        specs = specs[:3] + [(W - x, y, ln, wd, math.pi - a) for x, y, ln, wd, a in specs[3:]]
    for k, (x, y, ln, wd, a) in enumerate(specs):
        D.poly(slide, _leaf_pts(x, y, ln * s, wd * s, a + sway), color=cols[k % 3], alpha=0.9 if inv else 0.75,
               name=f"!!leaf{k}")
    if not inv:
        info["x1"] = W - 1.0


# ---------- dải bên chuyên nghiệp ----------

def _sidebar(slide, th, inv, idx, kind, rnd, info):
    if inv:
        D.poly(slide, [(W * 0.62, 0), (W, 0), (W, H), (W * 0.48, H)], color=th["accent"], alpha=0.25, name="!!side")
        D.poly(slide, [(W * 0.74, 0), (W, 0), (W, H), (W * 0.64, H)], color=th["inv_accent"], alpha=0.12,
               name="!!side2")
        D.box(slide, 0.8, 0.7, 1.0, 0.06, color=th["inv_accent"], name="!!tick")
        info["x1"] = W * 0.6
    else:
        D.box(slide, 0, 0, 0.28, H, gradient=[th["inv"][0], th["accent"]], angle=90, name="!!side")
        D.box(slide, 0.28, 0, 0.06, H, color=th["accent2"], name="!!side2")
        info["x0"] = 1.0


# ---------- truyện tranh (comic) ----------

def _comic(slide, th, inv, idx, kind, rnd, info):
    if inv:
        cx, cy = (W / 2, H / 2) if kind == "closing" else (W * 0.8, H * 0.45)
        wedges = []
        for i in range(0, 36, 2):
            a0, a1 = 2 * math.pi * i / 36, 2 * math.pi * (i + 1) / 36
            wedges.append([(cx, cy), (cx + 16 * math.cos(a0), cy + 16 * math.sin(a0)),
                           (cx + 16 * math.cos(a1), cy + 16 * math.sin(a1))])
        D.paths(slide, wedges, color=th["inv_accent"], alpha=0.16, name="!!cm-tia")
        D.paths(slide, hoavan.dot_field(0, H, 3.4, 2.4, 0.24, 0.1, "bl"), color="000000", alpha=0.25, name="!!cm-tram")
        D.box(slide, 0.16, 0.16, W - 0.32, H - 0.32, line_color="111111", line_w=6, name="!!cm-khung")
        info.update(x0=0.95, y0=0.8, x1=W - 0.95, y1=H - 0.85)
    else:
        D.paths(slide, hoavan.dot_field(W, 0, 2.6, 1.6, 0.2, 0.08, "tr"), color=th["accent3"], alpha=0.9,
                name="!!cm-tram")
        D.box(slide, 0.16, 0.16, W - 0.32, H - 0.32, line_color=th["ink"], line_w=4.5, name="!!cm-khung")
        info.update(x0=0.9, y0=0.72, x1=W - 0.9, y1=H - 0.85)


# ---------- manga đen trắng ----------

def _manga(slide, th, inv, idx, kind, rnd, info):
    if inv:
        # số ngẫu nhiên cùng dãy với bản web (mulberry32) để đường tốc độ ra y hệt
        r = hoavan.seeded(idx * 7919 + len(th["id"]))
        u = lambda a, b: a + (b - a) * r()
        cx, cy = (W / 2 if kind == "closing" else W * 0.36), H / 2
        lines = []
        for i in range(90):
            a = 2 * math.pi * i / 90 + u(-0.02, 0.02)
            rin, w = u(3.6, 5.2), u(0.012, 0.035)
            lines.append([(cx + rin * math.cos(a), cy + rin * math.sin(a) * 0.7),
                          (cx + 12 * math.cos(a - w), cy + 12 * math.sin(a - w) * 0.7),
                          (cx + 12 * math.cos(a + w), cy + 12 * math.sin(a + w) * 0.7)])
        D.paths(slide, lines, color="FFFFFF", alpha=0.22, name="!!mg-tocdo")
        D.box(slide, 0.22, 0.22, W - 0.44, H - 0.44, line_color="FFFFFF", line_w=1.5, line_alpha=0.6, name="!!mg-khung")
        info.update(x0=0.95, y0=0.8, x1=W - 0.95, y1=H - 0.85)
    else:
        D.paths(slide, hoavan.dot_field(0, H, W, 0.9, 0.16, 0.06, "b"), color=th["ink"], alpha=0.18, name="!!mg-tram")
        D.box(slide, 0.22, 0.22, W - 0.44, H - 0.44, line_color=th["ink"], line_w=2.25, name="!!mg-khung")
        D.box(slide, 0.22, 0.22, 0.22, H - 0.44, color=th["accent"], name="!!mg-gay")
        info.update(x0=0.95, y0=0.72, x1=W - 0.85, y1=H - 1.0)
