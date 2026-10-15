"""Họa tiết theo chủ đề: 36 họa tiết chia 6 gói (lịch sử, văn hóa, lễ hội, thiên nhiên, giáo dục, anime) — xem PACKS.

Vẽ chồng lên bất kỳ mẫu nào bằng hình vector của PowerPoint (sửa được trong PowerPoint, không dùng ảnh).
Cùng hình học và màu với bản web (web/hoa-van.js). Đơn vị inch.
"""
from __future__ import annotations

import math

from . import draw as D
from .draw import H, W

RED, GOLD = "DA251D", "FFD500"            # màu cờ: nền đỏ, sao vàng
TAU = math.pi * 2


# ---------- hình cơ bản

def circle(cx, cy, r, n=48):
    return [(cx + r * math.cos(TAU * i / n), cy + r * math.sin(TAU * i / n)) for i in range(n)]


def star(cx, cy, R, points=5, inner=0.382, rot=-math.pi / 2):
    p = []
    for i in range(points * 2):
        rr = R * inner if i % 2 else R
        a = rot + math.pi * i / points
        p.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return p


def rays(cx, cy, R, n=40, phase=0.0):
    """Các tia nắng xen kẽ, gộp thành một hình."""
    out = []
    for i in range(0, n, 2):
        a0, a1 = phase + TAU * i / n, phase + TAU * (i + 1) / n
        out.append([(cx, cy), (cx + R * math.cos(a0), cy + R * math.sin(a0)), (cx + R * math.cos(a1), cy + R * math.sin(a1))])
    return out


def place(pts, cx, cy, s, ang):
    c, d = math.cos(ang), math.sin(ang)
    return [(cx + s * (x * c - y * d), cy + s * (x * d + y * c)) for x, y in pts]


def quad(a, c, b, n=18):
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        out.append((u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]))
    return out


def _petal():
    """Cánh sen: gốc ở (0,0), mũi nhọn ở (1,0)."""
    n = 16
    f = lambda t: 0.32 * math.sin(math.pi * t) ** 0.85 * (1 - 0.3 * t)
    return [(i / n, f(i / n)) for i in range(n + 1)] + [(i / n, -f(i / n)) for i in range(n - 1, 0, -1)]


PETAL = _petal()


def lotus(cx, cy, h):
    """Hoa sen nét mảnh: gốc hoa ở (cx, cy), cao h."""
    rings = []
    for k, (a, l) in enumerate(((0, 1), (0.36, 0.93), (0.72, 0.8), (1.08, 0.62))):
        for s in ((-a, a) if k else (0,)):
            rings.append(place(PETAL, cx, cy, h * l, -math.pi / 2 + s))
    rings.append(quad((cx - h * 0.62, cy - h * 0.05), (cx, cy + h * 0.32), (cx + h * 0.62, cy - h * 0.05))
                 + quad((cx + h * 0.5, cy + h * 0.02), (cx, cy + h * 0.22), (cx - h * 0.5, cy + h * 0.02)))
    return rings


# chim Lạc bay theo hướng +x (dáng giản lược trên mặt trống đồng)
BIRD = [(1, 0), (0.72, -0.05), (0.68, -0.16), (0.58, -0.26), (0.62, -0.1), (0.5, -0.08), (0.3, -0.1), (0.1, -0.22),
        (-0.12, -0.3), (0, -0.12), (-0.16, -0.1), (0, -0.02), (-0.14, 0.08), (0.08, 0.06), (0.35, 0.08), (0.6, 0.04),
        (0.7, 0.03)]


def drum(slide, cx, cy, R, col, a, tag):
    """Mặt trống đồng: sao giữa, vạch tia, vòng tròn tiếp tuyến, chim Lạc, viền chấm."""
    rings = [circle(cx, cy, R * k, 72) for k in (0.2, 0.235, 0.42, 0.455, 0.63, 0.665, 0.87, 0.905, 1)]
    D.paths(slide, rings, line_color=col, line_w=1.1, line_alpha=a, name=f"!!{tag}vong")
    D.paths(slide, star(cx, cy, R * 0.17, 14, 0.45), color=col, alpha=a, name=f"!!{tag}sao")
    ticks = []                                      # vạch tia giữa hai vòng trong
    for i in range(48):
        t = TAU * i / 48
        ticks.append([(cx + R * 0.24 * math.cos(t), cy + R * 0.24 * math.sin(t)),
                      (cx + R * 0.415 * math.cos(t), cy + R * 0.415 * math.sin(t))])
    D.paths(slide, ticks, closed=False, line_color=col, line_w=0.75, line_alpha=a * 0.8, name=f"!!{tag}tia")
    cir = []                                        # vòng tròn tiếp tuyến có chấm giữa
    for i in range(22):
        t = TAU * i / 22
        x, y = cx + R * 0.543 * math.cos(t), cy + R * 0.543 * math.sin(t)
        cir += [circle(x, y, R * 0.072, 20), circle(x, y, R * 0.018, 10)]
    D.paths(slide, cir, line_color=col, line_w=0.8, line_alpha=a, name=f"!!{tag}tron")
    birds = []
    for i in range(10):
        t = TAU * i / 10
        birds.append(place(BIRD, cx + R * 0.77 * math.cos(t), cy + R * 0.77 * math.sin(t), R * 0.2, t - math.pi / 2))
    D.paths(slide, birds, color=col, alpha=a, name=f"!!{tag}chim")
    dots = []
    for i in range(64):
        t = TAU * i / 64
        dots.append(circle(cx + R * 0.952 * math.cos(t), cy + R * 0.952 * math.sin(t), R * 0.014, 8))
    D.paths(slide, dots, color=col, alpha=a, name=f"!!{tag}cham")


def meander(x0, x1, y, h):
    """Dải hồi văn (chữ “hồi” vuông nối tiếp) từ x0 tới x1, cao h."""
    u = h * 1.1
    n = max(1, int((x1 - x0) // u))
    sx = x0 + (x1 - x0 - n * u) / 2
    out = [[(x0, y), (x1, y)], [(x0, y + h), (x1, y + h)]]
    for i in range(n):
        X = sx + i * u
        P = lambda a, b: (X + a * u, y + b * h)
        out.append([P(0.08, 1), P(0.08, 0.2), P(0.86, 0.2), P(0.86, 0.8), P(0.34, 0.8), P(0.34, 0.45), P(0.6, 0.45)])
    return out


MAI = dict(wood="4E342E", wood2="5D4037", petal="FFC107", heart="E65100")
DAO = dict(wood="4A3B36", wood2="5D4A44", petal="F48FB1", heart="AD1457")


def mai_branch(slide, ox, oy, s, dir_, tag, c=MAI):
    """Cành mai (hoặc đào, c=DAO): gốc ở (ox, oy), mọc sang trái-xuống (dir_=-1) hoặc phải-xuống (dir_=1), tỉ lệ s."""
    P = lambda p: (ox + dir_ * p[0] * s, oy + p[1] * s)
    main = [P(p) for p in quad((0, -0.1), (1.5, 0.25), (3.6, 1.45))]
    subs = [[P(p) for p in quad(*abc)] for abc in (((1.2, 0.27), (1.45, 0.9), (1.95, 1.35)),
                                                    ((2.45, 0.82), (2.85, 0.5), (2.95, 0.05)),
                                                    ((3.0, 1.15), (3.3, 1.7), (3.2, 2.0)))]
    D.paths(slide, main, closed=False, line_color=c["wood"], line_w=max(1.5, 5 * s), name=f"!!{tag}canh")
    D.paths(slide, subs, closed=False, line_color=c["wood2"], line_w=max(1.0, 3 * s), name=f"!!{tag}canh2")
    flowers = [(0.85, 0.12, 0.24), (1.95, 1.33, 0.22), (2.95, 0.07, 0.2), (3.55, 1.45, 0.22), (2.25, 0.72, 0.17),
               (3.2, 1.98, 0.16)]
    petals, hearts = [], []
    for k, (x, y, r) in enumerate(flowers):
        cx, cy = P((x, y))
        pr, rot = r * s * 0.5, k * 0.7
        for j in range(5):
            a = rot + TAU * j / 5
            petals.append(circle(cx + pr * 0.95 * math.cos(a), cy + pr * 0.95 * math.sin(a), pr, 18))
        hearts.append(circle(cx, cy, pr * 0.5, 14))
    for x, y in ((1.4, 0.36), (0.4, 0.0), (3.1, 1.12), (2.6, 0.55)):    # nụ
        cx, cy = P((x, y))
        petals.append(circle(cx, cy, 0.07 * s, 12))
    D.paths(slide, petals, color=c["petal"], name=f"!!{tag}hoa")
    D.paths(slide, hearts, color=c["heart"], name=f"!!{tag}nhuy")


# ---------- vẽ từng họa tiết: (slide, th, inv, idx, kind, info) — info là vùng nội dung an toàn, được thu hẹp lại

def _cach_mang(slide, th, inv, idx, kind, info):
    if inv:
        cx, cy, R = {"cover": (W - 3.1, H / 2 - 0.25, 1.55), "section": (W - 2.5, H / 2, 1.2)}.get(kind, (W / 2, 0.98, 0.42))
        D.paths(slide, rays(cx, cy, 16, 44, idx * 0.05), color=GOLD, alpha=0.07 if kind == "closing" else 0.11,
                name="!!cm-tia")
        D.box(slide, cx - R * 1.9, cy - R * 1.9, R * 3.8, R * 3.8, kind="ellipse", radial=True, gradient=[GOLD, GOLD],
              galphas=[0.32, 0.0], name="!!cm-hao")
        D.paths(slide, star(cx, cy, R), color=GOLD, name="!!cm-sao")
        D.box(slide, 0, H - 0.2, W, 0.07, color=GOLD, name="!!cm-dai")
        D.box(slide, 0, H - 0.1, W, 0.1, color="6E0B08", alpha=0.6, name="!!cm-dai2")
        if kind == "cover":
            info["x1"] = W - 5.3
        elif kind == "section":
            info["x1"] = W - 4.3
        else:
            info["y0"] = 1.75
        info["y1"] = min(info["y1"], H - 0.55)
    else:
        D.box(slide, 0, 0, W, 0.15, color=RED, name="!!cm-bang")
        D.box(slide, 0, 0.15, W, 0.035, color=GOLD, name="!!cm-vien")
        D.paths(slide, star(W - 0.55, 0.43, 0.16), color=RED, name="!!cm-sao")
        D.paths(slide, star(W - 1.3, H - 1.15, 1.75, 5, 0.382, -math.pi / 2 + 0.12), color=RED, alpha=0.05,
                name="!!cm-saochim")


def _ho_chi_minh(slide, th, inv, idx, kind, info):
    gold = "E8B54A"
    if inv:
        if kind == "closing":
            D.paths(slide, lotus(W / 2, H - 0.45, 1.5), line_color=gold, line_w=1.25, line_alpha=0.7, name="!!hcm-sen")
            D.paths(slide, star(W / 2, H - 2.25, 0.2), color=gold, name="!!hcm-sao")
            info["y1"] = H - 2.5
        else:
            big = kind == "cover"
            cx, base, h = W - (3.0 if big else 2.4), H - (0.75 if big else 1.0), (3.6 if big else 2.8)
            D.box(slide, cx - h * 0.85, base - h * 1.25, h * 1.7, h * 1.7, kind="ellipse", radial=True,
                  gradient=[gold, gold], galphas=[0.22, 0.0], name="!!hcm-hao")
            D.paths(slide, lotus(cx, base, h), line_color=gold, line_w=1.5, line_alpha=0.85, name="!!hcm-sen")
            D.paths(slide, star(cx, base - h * 1.18, h * 0.12), color=gold, name="!!hcm-sao")
            info["x1"] = W - (5.6 if big else 4.6)
        D.box(slide, 0.45, 0.45, W - 0.9, H - 0.9, line_color=gold, line_w=0.75, line_alpha=0.45, name="!!hcm-khung")
        info["x0"] = max(info["x0"], 0.95)
        info["y0"] = max(info["y0"], 0.8)
    else:
        D.box(slide, 0, 0, W, 0.08, color="A51E1E", name="!!hcm-bang")
        D.box(slide, 0, 0.08, W, 0.025, color="D9A62E", name="!!hcm-vien")
        D.paths(slide, lotus(W - 1.6, H - 0.2, 2.3), color="D9A62E", alpha=0.12, name="!!hcm-senchim")


def _dong_son(slide, th, inv, idx, kind, info):
    if inv:
        col = th["inv_accent"]
        if kind == "closing":
            drum(slide, W / 2, H / 2, 4.4, col, 0.16, "ds-")
        else:
            R = 4.7 if kind == "cover" else 4.1
            drum(slide, W - 1.25, H / 2, R, col, 0.55, "ds-")
            info["x1"] = W - 1.25 - R - 0.4
    else:
        drum(slide, W + 0.2, H + 0.25, 2.9, th["accent"], 0.11, "ds-")
        D.box(slide, 0.8, 0.3, W - 1.6, 0.012, color=th["accent2"], alpha=0.7, name="!!ds-ke")


def _hoi_van(slide, th, inv, idx, kind, info):
    col = th["inv_accent"] if inv else th["accent"]
    D.paths(slide, meander(0.5, W - 0.5, 0.16, 0.24), closed=False, line_color=col, line_w=1.5,
            line_alpha=0.75 if inv else 0.6, name="!!hv-tren")
    if inv:
        D.paths(slide, meander(0.5, W - 0.5, H - 0.4, 0.24), closed=False, line_color=col, line_w=1.5,
                line_alpha=0.75, name="!!hv-duoi")
        info["y0"] = max(info["y0"], 0.8)
        info["y1"] = min(info["y1"], H - 0.75)
    else:
        info["y0"] = max(info["y0"], 0.66)


def _tet(slide, th, inv, idx, kind, info):
    if inv:
        if kind == "closing":
            mai_branch(slide, W + 0.05, 0.1, 0.95, -1, "mai1-")
            mai_branch(slide, -0.05, H - 2.35, 0.75, 1, "mai2-")
        else:
            big = kind == "cover"
            mai_branch(slide, W + 0.05, 0.05, 1.25 if big else 1.05, -1, "mai1-")
            info["x1"] = min(info["x1"], W - (4.8 if big else 1.4))
        D.box(slide, 0, H - 0.14, W, 0.06, color="FFD54F", alpha=0.85, name="!!mai-dai")
    else:
        mai_branch(slide, W + 0.05, 0.02, 0.42, -1, "mai-")
        D.box(slide, 0, H - 0.06, W, 0.06, color="C62828", alpha=0.85, name="!!mai-dai")


# ---------- bộ họa tiết
# palette: bảng màu gợi ý (áp khi dùng màu của họa tiết); own_inv: tự vẽ trang bìa/chương/kết thay cho trang trí của mẫu
MOTIFS: dict[str, dict] = {
    "cach-mang": dict(
        pack="lich-su", name="Cách mạng · Cờ đỏ sao vàng", short="Cách mạng",
        desc="Nền đỏ, sao vàng năm cánh và tia nắng kiểu tranh cổ động — kỷ niệm, lịch sử Đảng, ngày lễ lớn.",
        own_inv=True, draw=_cach_mang,
        palette=dict(bg="FFF9F0", bg2="FBF0E2", ink="2B1210", body="4E2A24", muted="7A5A52", accent="C8161D",
                     accent2="E0A100", accent3="9E1410", card="FFFFFF", card_line="F0D6C6",
                     inv=["8E0E0B", "C8161D", RED], inv_ink="FFF7E0", inv_body="FDE6B0", inv_accent=GOLD)),
    "ho-chi-minh": dict(
        pack="lich-su", name="Hồ Chí Minh · Sen vàng", short="Sen vàng",
        desc="Đỏ son, vàng kim, hoa sen nét mảnh và ngôi sao — học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh.",
        own_inv=True, draw=_ho_chi_minh,
        palette=dict(bg="FBF6EA", bg2="F6EEDC", ink="3A1D10", body="5A3A2A", muted="84685A", accent="A51E1E",
                     accent2="C9932A", accent3="7A1F1F", card="FFFCF5", card_line="EAD8B4",
                     inv=["4E0909", "8C1A1A", "A82A20"], inv_ink="FFF6E0", inv_body="F1DCB2", inv_accent="F2C14E")),
    "dong-son": dict(
        pack="lich-su", name="Lịch sử · Trống đồng Đông Sơn", short="Trống đồng",
        desc="Mặt trống đồng với sao giữa, vòng chim Lạc, hoa văn tròn; tông đồng thau — lịch sử, văn hóa Việt Nam.",
        own_inv=True, draw=_dong_son,
        palette=dict(bg="F5EEDF", bg2="EFE5D0", ink="2E2112", body="4F3D27", muted="7A6648", accent="9A5B13",
                     accent2="C08A3E", accent3="5E7D6B", card="FBF6EA", card_line="DCCBA8",
                     inv=["24180B", "3F2A13", "6B4A22"], inv_ink="F6E7C8", inv_body="E3CFA6", inv_accent="E0B060")),
    "hoi-van": dict(
        pack="van-hoa", name="Truyền thống · Viền hồi văn", short="Hồi văn",
        desc="Dải hoa văn chữ “hồi” vuông ở mép trang và góc khung — giữ màu của mẫu, hợp văn hóa, truyền thống, lễ kỷ niệm.",
        own_inv=False, draw=_hoi_van, palette=None),
    "tet": dict(
        pack="le-hoi", name="Mùa xuân · Hoa mai ngày Tết", short="Hoa mai",
        desc="Cành mai vàng trên nền đỏ son và kem ấm — chúc Tết, mừng Xuân, ngoại khóa, văn hóa truyền thống.",
        own_inv=True, draw=_tet,
        palette=dict(bg="FFF8EE", bg2="FFF1E0", ink="3B1E12", body="5B3A2B", muted="8A6A5A", accent="C62828",
                     accent2="E09A00", accent3="2E7D32", card="FFFFFF", card_line="F3D9C2",
                     inv=["7A0A0A", "B71C1C", "C62828"], inv_ink="FFF8E1", inv_body="FFE0A3", inv_accent="FFD54F")),
}


# ============================================================ các gói họa tiết mở rộng
PACKS = [
    dict(id="lich-su", name="Lịch sử · Cách mạng", desc="Cờ đỏ sao vàng, Bác Hồ, Đảng, chiến thắng, trống đồng"),
    dict(id="van-hoa", name="Văn hóa · Hoa văn truyền thống",
         desc="Hồi văn, mây cuộn, thổ cẩm, gạch bông, sóng nước, lũy tre, núi sông"),
    dict(id="le-hoi", name="Lễ hội · Mùa xuân", desc="Hoa mai, hoa đào, đèn lồng, Trung thu, pháo hoa"),
    dict(id="thien-nhien", name="Thiên nhiên · Môi trường", desc="Đầm sen, ruộng bậc thang, lá nhiệt đới, Trái Đất xanh"),
    dict(id="giao-duc", name="Giáo dục · Khoa học", desc="Sách bút, nguyên tử, mạch điện tử, hình học"),
]


# ---------- hình phụ

def rad(d):
    return d * math.pi / 180


def jsround(x):
    """Làm tròn như Math.round của JavaScript (0.5 lên), để khớp bản web."""
    return math.floor(x + 0.5)


def ell(cx, cy, rx, ry, rot=0.0, n=48):
    out = []
    for i in range(n):
        t = TAU * i / n
        x, y = rx * math.cos(t), ry * math.sin(t)
        out.append((cx + x * math.cos(rot) - y * math.sin(rot), cy + x * math.sin(rot) + y * math.cos(rot)))
    return out


def arc(cx, cy, r, a0, a1, n=24):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


def rot_rect(cx, cy, length, wid, ang):
    c, d, l, w = math.cos(ang), math.sin(ang), length / 2, wid / 2
    return [(cx + x * c - y * d, cy + x * d + y * c) for x, y in ((-l, -w), (l, -w), (l, w), (-l, w))]


def U(cx, cy, s):
    return lambda p: (cx + p[0] * s, cy + p[1] * s)


def map_r(rings, f):
    return [[f(p) for p in r] for r in rings]


def spiral(cx, cy, r, turns, dir_=1, a0=0.0, n=40):
    out = []
    for i in range(n + 1):
        t = i / n
        a, rr = a0 + dir_ * TAU * turns * t, r * (1 - 0.8 * t)
        out.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return out


def seeded(seed):
    """Số ngẫu nhiên cố định theo seed (mulberry32, giống hệt bản web) — hình “ngẫu nhiên” luôn ra như nhau."""
    M = 0xFFFFFFFF
    st = [seed & M]

    def imul(a, b):
        return (a * b) & M

    def r():
        st[0] = (st[0] + 0x6D2B79F5) & M
        t = st[0]
        t = imul(t ^ (t >> 15), t | 1)
        t = (t ^ ((t + imul(t ^ (t >> 7), t | 61)) & M)) & M
        return ((t ^ (t >> 14)) & M) / 4294967296
    return r


NARROW = [(x, y * 0.45) for x, y in PETAL]      # lá hẹp (tre)
LEAFLET = [(x, y * 0.28) for x, y in PETAL]     # lá chét dừa


def _p(slide, rings, **kw):
    """D.paths, bỏ qua khi không có nét nào."""
    if rings:
        D.paths(slide, rings, **kw)


def emblem_draw(emblem, wm=None, halo=True, alpha=None, ca=None, inv=None, page=None):
    """Họa tiết dạng “biểu tượng”: to ở bên phải trang bìa/chương, chìm giữa trang kết, chìm ở góc trang nội dung.
    emblem(slide, cx, cy, s, màu, độ đậm, màu phụ, th, tag) vẽ gọn trong hình vuông tâm (cx, cy), nửa cạnh s."""
    def draw(slide, th, is_inv, idx, kind, info):
        if is_inv:
            col, c2 = th["inv_accent"], th["inv_ink"]
            if kind == "closing":
                emblem(slide, W / 2, H / 2, 3.0, col, wm or 0.13, c2, th, "em-")
            else:
                big = kind == "cover"
                cx, s = W - (3.0 if big else 2.5), (2.5 if big else 1.95)
                if halo:
                    D.box(slide, cx - s * 1.3, H / 2 - s * 1.3, s * 2.6, s * 2.6, kind="ellipse", radial=True,
                          gradient=[col, col], galphas=[0.2, 0.0], name="!!em-hao")
                emblem(slide, cx, H / 2, s, col, alpha or 0.92, c2, th, "em-")
                info["x1"] = min(info["x1"], cx - s - 0.45)
            if inv:
                inv(slide, th, kind, info)
        else:
            emblem(slide, W - 1.45, H - 1.4, 1.2, th["accent"], ca or 0.11, th["accent2"], th, "em-")
            if page:
                page(slide, th, info)
    return draw


# ---------- vẽ từng biểu tượng / mảng

def hammer_sickle(slide, cx, cy, s, col, a, c2, th, tag):
    P = U(cx, cy, s)
    blade = arc(0, 0, 0.78, rad(-80), rad(-235), 30) + arc(0.1, -0.08, 0.66, rad(-235), rad(-80), 30)
    rings = [blade, rot_rect(-0.54, 0.73, 0.5, 0.17, rad(135)), rot_rect(0.21, 0.37, 1.18, 0.13, rad(45)),
             rot_rect(-0.27, -0.11, 0.64, 0.24, rad(-45))]
    D.paths(slide, map_r(rings, P), color=col, alpha=a, name=f"!!{tag}bualiem")


def rice_wreath(slide, cx, cy, s, col, a, c2, th, tag):
    P, grains, stems = U(cx, cy, s), [], []
    for a0, a1 in ((rad(100), rad(250)), (rad(80), rad(-70))):
        stems.append(arc(0, 0.05, 0.85, a0, a1, 30))
        sg = math.copysign(1, a1 - a0)
        for i in range(2, 11):
            t = a0 + (a1 - a0) * i / 11
            x, y = 0.85 * math.cos(t), 0.05 + 0.85 * math.sin(t)
            d = math.atan2(math.cos(t) * sg, -math.sin(t) * sg)
            grains += [place(PETAL, x, y, 0.26, d + 0.55), place(PETAL, x, y, 0.24, d - 0.5)]
        t = a1
        x, y = 0.85 * math.cos(t), 0.05 + 0.85 * math.sin(t)
        grains.append(place(PETAL, x, y, 0.28, math.atan2(math.cos(t) * sg, -math.sin(t) * sg)))
    D.paths(slide, map_r(stems, P), closed=False, line_color=col, line_w=max(1, 2.2 * s), line_alpha=a,
            name=f"!!{tag}cong")
    D.paths(slide, map_r(grains, P), color=col, alpha=a, name=f"!!{tag}hat")
    D.paths(slide, star(*P((0, -0.02)), 0.42 * s), color=col, alpha=a, name=f"!!{tag}sao")


def waving_flag(slide, cx, cy, s, col, a, c2, th, tag):
    P, top, bot = U(cx, cy, s), [], []
    yT = lambda x: -0.88 + 0.09 * math.sin(2.7 * (x + 0.72))
    for i in range(25):
        x = -0.72 + 1.67 * i / 24
        top.append((x, yT(x)))
        bot.insert(0, (x, yT(x) + 1.05 + 0.04 * math.sin(2.7 * x)))
    D.paths(slide, [P(p) for p in rot_rect(-0.75, 0.03, 1.98, 0.06, rad(90))], color=col, alpha=a, name=f"!!{tag}can")
    D.paths(slide, [P(p) for p in top + bot], color=RED, alpha=a, name=f"!!{tag}co")
    D.paths(slide, star(*P((0.11, yT(0.11) + 0.54)), 0.3 * s), color=GOLD, alpha=a, name=f"!!{tag}sao")


def hills(slide, color, alpha, top, tag):
    pts = [(-0.1, H + 0.1)]
    for i in range(41):
        x = -0.1 + (W + 0.2) * i / 40
        pts.append((x, top + 0.28 * math.sin(x * 0.9 + 0.6) + 0.16 * math.sin(x * 2.1)))
    pts.append((W + 0.1, H + 0.1))
    D.paths(slide, pts, color=color, alpha=alpha, name="!!" + tag)


def cloud(cx, cy, s, flip=1):
    P = lambda p: (cx + flip * p[0] * s, cy + p[1] * s)
    pi = math.pi
    return map_r([arc(-0.4, 0.05, 0.3, pi * 0.95, pi * 2, 18), arc(0.05, -0.1, 0.4, pi * 1.05, pi * 1.95, 18),
                  arc(0.48, 0.05, 0.28, pi, pi * 2.05, 18), quad((-0.75, 0.12), (0, 0.32), (0.78, 0.1)),
                  spiral(-0.7, 0.18, 0.16, 1.4, -1, 0), spiral(0.78, 0.16, 0.14, 1.4, 1, pi)], P)


def brocade(slide, y, h, tag):
    n = math.ceil(W / h) + 1
    dia, inner, zig = [], [], [[], []]
    for i in range(n):
        x, c = i * h + h / 2 - 0.1, y + h / 2
        dia.append([(x, c - h * 0.34), (x + h * 0.34, c), (x, c + h * 0.34), (x - h * 0.34, c)])
        inner.append([(x, c - h * 0.13), (x + h * 0.13, c), (x, c + h * 0.13), (x - h * 0.13, c)])
    for i in range(n * 4 + 1):
        x = i * h / 4 - 0.1
        zig[0].append((x, y + h * (0.05 if i % 2 else 0.14)))
        zig[1].append((x, y + h * (0.95 if i % 2 else 0.86)))
    D.box(slide, -0.05, y, W + 0.1, h, color="B3202A", name=f"!!{tag}nen")
    D.paths(slide, dia, color="F2B705", name=f"!!{tag}thoi")
    D.paths(slide, inner, color="1F1A3D", name=f"!!{tag}thoi2")
    D.paths(slide, zig, closed=False, line_color="FFFFFF", line_w=1.25, name=f"!!{tag}rang")


def tiles(slide, x0, y0, cols, rows, size, col, a, tag):
    lines, fills = [], []
    for i in range(cols):
        for j in range(rows):
            x, y = x0 + i * size, y0 + j * size
            c = (x + size / 2, y + size / 2)
            lines += [[(x, y), (x + size, y), (x + size, y + size), (x, y + size)], circle(c[0], c[1], size * 0.3, 32)]
            for qx, qy, k in ((x, y, 0), (x + size, y, 1), (x + size, y + size, 2), (x, y + size, 3)):
                lines.append(arc(qx, qy, size * 0.2, rad(k * 90), rad(k * 90 + 90), 8) + [(qx, qy)])
            for k in range(4):
                fills.append(place(PETAL, c[0], c[1], size * 0.5, rad(45 + k * 90)))
            fills.append([(c[0], c[1] - size * 0.08), (c[0] + size * 0.08, c[1]), (c[0], c[1] + size * 0.08),
                          (c[0] - size * 0.08, c[1])])
    D.paths(slide, fills, color=col, alpha=a * 0.55, name=f"!!{tag}canh")
    D.paths(slide, lines, line_color=col, line_w=0.9, line_alpha=a, name=f"!!{tag}net")


def scales(slide, x0, x1, y0, rows, r, col, a, tag):
    for j in range(rows):
        fills, arcs, cy = [], [], y0 + j * r * 0.55 + r
        x = x0 - (r if j % 2 else 0)
        while x < x1 + r:
            fills.append(arc(x, cy, r, math.pi, TAU, 20))
            arcs += [arc(x, cy, r * k, math.pi, TAU, 14) for k in (0.72, 0.46, 0.2)]
            x += 2 * r
        D.paths(slide, fills, color=col, alpha=a * 0.22, line_color=col, line_w=1, line_alpha=a, name=f"!!{tag}vay{j}")
        D.paths(slide, arcs, closed=False, line_color=col, line_w=0.75, line_alpha=a * 0.85, name=f"!!{tag}vong{j}")


def bamboo(slide, x, yb, h, w, lean, col, a, tag, seed):
    r, segs, nodes, leaves = seeded(seed), [], [], []
    n = max(3, jsround(h / (w * 6)))
    for k in range(n):
        y1, y2 = yb - h * k / n, yb - h * (k + 1) / n + 0.03
        xc = x + lean * (yb - (y1 + y2) / 2)
        segs.append(rot_rect(xc, (y1 + y2) / 2, y1 - y2, w, rad(90) + math.atan(lean)))
        nodes.append([(xc - w * 0.62, y2 - 0.015), (xc + w * 0.62, y2 - 0.015)])
        if k > 0 and r() < 0.65:
            side = -1 if r() < 0.5 else 1
            for m in range(3):
                size = w * (5.5 + 2 * r())
                ang = rad(150 + m * 18 + r() * 10) if side < 0 else rad(30 - m * 18 - r() * 10)
                leaves.append(place(NARROW, xc, y2, size, ang))
    D.paths(slide, segs, color=col, alpha=a, name=f"!!{tag}than")
    D.paths(slide, nodes, closed=False, line_color=col, line_w=2, line_alpha=min(1, a + 0.2), name=f"!!{tag}dot")
    _p(slide, leaves, color=col, alpha=a * 0.9, name=f"!!{tag}la")


def mountains(slide, col, alphas, tops, seed, tag):
    r = seeded(seed)
    for k, top in enumerate(tops):
        ph = [r() * 6, r() * 6, r() * 6]
        pts = [(-0.1, H + 0.1)]
        for i in range(71):
            x = -0.1 + (W + 0.2) * i / 70
            pts.append((x, top - 0.55 * (1 - abs(math.sin(0.55 * x + ph[0]))) + 0.25 * math.sin(1.3 * x + ph[1])
                        + 0.1 * math.sin(3.1 * x + ph[2])))
        pts.append((W + 0.1, H + 0.1))
        D.paths(slide, pts, color=col, alpha=alphas[k], name=f"!!{tag}{k}")


def lantern(slide, cx, ytop, length, h, color, tag, glow):
    w, cy = h * 0.78, ytop + length + h / 2
    D.paths(slide, [(cx, ytop), (cx, ytop + length)], closed=False, line_color="3E2723", line_w=1, name=f"!!{tag}day")
    if glow:
        D.box(slide, cx - w * 1.4, cy - h * 1.2, w * 2.8, h * 2.4, kind="ellipse", radial=True, gradient=[color, color],
              galphas=[0.35, 0.0], name=f"!!{tag}sang")
    D.box(slide, cx - w / 2, cy - h / 2, w, h, kind="ellipse", color=color, name=f"!!{tag}than")
    D.paths(slide, [ell(cx, cy, w * 0.18, h / 2, 0, 32), ell(cx, cy, w * 0.36, h / 2, 0, 32)], line_color="7F1D1D",
            line_w=0.8, line_alpha=0.45, name=f"!!{tag}gong")
    D.box(slide, cx - w * 0.28, cy - h / 2 - h * 0.06, w * 0.56, h * 0.12, color="4E2A0C", name=f"!!{tag}nap")
    D.box(slide, cx - w * 0.28, cy + h / 2 - h * 0.06, w * 0.56, h * 0.12, color="4E2A0C", name=f"!!{tag}day2")
    D.paths(slide, [[(cx + d * w, cy + h / 2 + h * 0.06), (cx + d * w * 1.3, cy + h / 2 + h * 0.42)]
                    for d in (-0.12, -0.04, 0, 0.04, 0.12)], closed=False, line_color="F2C14E", line_w=1,
            name=f"!!{tag}tua")


def star_lantern(slide, cx, cy, r, ang, tag):
    s = star(cx, cy, r, 5, 0.42, -math.pi / 2 + ang)
    D.paths(slide, [(cx + r * 0.3, cy - r * 0.2), (cx + r * 2.0, cy - r * 1.9)], closed=False, line_color="8D6E63",
            line_w=2.5, name=f"!!{tag}can")
    D.paths(slide, s, color="E63946", alpha=0.95, line_color="FFD166", line_w=2.5, name=f"!!{tag}sao")
    D.paths(slide, star(cx, cy, r * 0.42, 5, 0.42, -math.pi / 2 + ang), color="FFD166", name=f"!!{tag}sao2")
    tip = s[5]
    D.paths(slide, [[tip, (tip[0] + d * r, tip[1] + r * 0.7)] for d in (-0.1, 0, 0.1)], closed=False,
            line_color="FFD166", line_w=1.2, name=f"!!{tag}tua")


def burst(slide, cx, cy, r, color, tag, n=18):
    rays_, dots = [], []
    for i in range(n):
        t, k = TAU * i / n + 0.1, (0.78 if i % 2 else 1)
        rays_.append([(cx + r * 0.28 * math.cos(t), cy + r * 0.28 * math.sin(t)),
                      (cx + r * k * 0.88 * math.cos(t), cy + r * k * 0.88 * math.sin(t))])
        dots.append(circle(cx + r * k * math.cos(t), cy + r * k * math.sin(t), max(0.025, r * 0.045), 10))
    D.paths(slide, rays_, closed=False, line_color=color, line_w=max(1, r * 2.2), name=f"!!{tag}tia")
    D.paths(slide, dots, color=color, name=f"!!{tag}cham")


def lotus_pond(slide, cx, cy, s, col, a, c2, th, tag):
    P, leaf, veins = U(cx, cy, s), [], []
    for x, y, r, notch in ((0.42, 0.55, 0.62, rad(-60)), (-0.6, 0.72, 0.42, rad(-120))):
        leaf.append(arc(x, y, r, notch + 0.22, notch + TAU - 0.22, 40) + [(x, y)])
        for k in range(1, 9):
            t = notch + 0.22 + (TAU - 0.44) * k / 9
            veins.append([(x, y), (x + r * 0.92 * math.cos(t), y + r * 0.92 * math.sin(t))])
    D.paths(slide, map_r(leaf, P), color="2E7D32", alpha=a * 0.9, name=f"!!{tag}la")
    D.paths(slide, map_r(veins, P), closed=False, line_color="A5D6A7", line_w=0.8, line_alpha=a, name=f"!!{tag}gan")
    D.paths(slide, [P((0, 0.3)), P((0.05, 0.95))], closed=False, line_color="558B2F", line_w=max(1, 3 * s),
            line_alpha=a, name=f"!!{tag}cuong")
    fl = lotus(0, 0.32, 0.95)
    D.paths(slide, map_r(fl[:-1], P), color="F48FB1", alpha=a, line_color="C2185B", line_w=0.9, line_alpha=a,
            name=f"!!{tag}hoa")
    D.paths(slide, map_r(fl[-1:], P), color="7CB342", alpha=a, name=f"!!{tag}dai")
    D.paths(slide, map_r([place(PETAL, -0.62, 0.15, 0.5, rad(-100))], P), color="F8BBD0", alpha=a,
            line_color="C2185B", line_w=0.8, line_alpha=a, name=f"!!{tag}bup")


def terraces(slide, cx, cy, r0, r1, n, alpha, tag):
    cols = ["8BC34A", "CDDC39", "689F38", "AED581", "F9A825", "7CB342"]
    for k in range(n):
        ra, rb = r0 + (r1 - r0) * k / n, r0 + (r1 - r0) * (k + 1) / n
        wob = lambda t: 0.06 * math.sin(5 * t + k)
        outer = [(cx + (rb + wob(t)) * math.cos(t), cy + (rb + wob(t)) * math.sin(t))
                 for t in (math.pi + math.pi / 2 * i / 32 for i in range(33))]
        inner = [(cx + (ra + wob(t)) * math.cos(t), cy + (ra + wob(t)) * math.sin(t))
                 for t in (math.pi * 1.5 - math.pi / 2 * i / 32 for i in range(33))]
        D.paths(slide, outer + inner, color=cols[k % len(cols)], alpha=alpha, line_color="FFFFFF", line_w=0.75,
                line_alpha=alpha * 0.6, name=f"!!{tag}{k}")


def frond(slide, x, y, length, ang, bend, col, a, tag):
    c, d = math.cos(ang), math.sin(ang)
    tip = (x + length * c, y + length * d)
    ctrl = (x + length * 0.5 * c - bend * length * d, y + length * 0.5 * d + bend * length * c)
    rib, leaflets = quad((x, y), ctrl, tip, 24), []
    for i in range(3, len(rib) - 1):
        t = i / 24
        (px, py), (qx, qy) = rib[i], rib[i + 1]
        dr, L = math.atan2(qy - py, qx - px), length * (0.5 * (1 - 0.7 * t) + 0.06)
        leaflets += [place(LEAFLET, px, py, L, dr + 0.62 + 0.15 * t), place(LEAFLET, px, py, L, dr - 0.62 - 0.15 * t)]
    D.paths(slide, leaflets, color=col, alpha=a, name=f"!!{tag}la")
    D.paths(slide, rib, closed=False, line_color=col, line_w=1.8, line_alpha=min(1, a + 0.15), name=f"!!{tag}gan")


def globe(slide, cx, cy, s, col, a, c2, th, tag):
    P = U(cx, cy, s)
    D.paths(slide, [P(p) for p in circle(0, 0.1, 0.78, 60)], color=col, alpha=a * 0.25, line_color=col, line_w=1.6,
            line_alpha=a, name=f"!!{tag}cau")
    lines = [ell(0, 0.1, 0.32, 0.78, 0, 48), ell(0, 0.1, 0.6, 0.78, 0, 48)]
    for y in (-0.38, 0, 0.38):
        w = math.sqrt(0.78 * 0.78 - y * y)
        lines.append([(-w, 0.1 + y), (w, 0.1 + y)])
    lines.append([(0, -0.68), (0, 0.88)])
    D.paths(slide, map_r(lines, P), closed=False, line_color=col, line_w=1, line_alpha=a * 0.8, name=f"!!{tag}kinh")
    D.paths(slide, [P((0, -0.68)), P((0.02, -0.9))], closed=False, line_color=col, line_w=max(1, 2 * s),
            line_alpha=a, name=f"!!{tag}mam")
    D.paths(slide, map_r([place(PETAL, 0.02, -0.88, 0.42, rad(-35)), place(PETAL, 0.02, -0.86, 0.34, rad(-150))], P),
            color=col, alpha=a, name=f"!!{tag}la")


def book_pen(slide, cx, cy, s, col, a, c2, th, tag):
    P, pages, lines = U(cx, cy, s), [], []
    for k in (-1, 1):
        pages.append(quad((0, -0.45), (k * 0.45, -0.62), (k * 0.95, -0.5)) + quad((k * 0.95, 0.45), (k * 0.45, 0.35), (0, 0.6)))
        for i in range(1, 6):
            dy = i * 0.15
            lines.append(quad((k * 0.12, -0.45 + dy + 0.04), (k * 0.47, -0.6 + dy), (k * 0.83, -0.5 + dy)))
    D.paths(slide, map_r(pages, P), color=col, alpha=a * 0.2, line_color=col, line_w=1.6, line_alpha=a,
            name=f"!!{tag}sach")
    D.paths(slide, map_r(lines + [[(0, -0.45), (0, 0.6)]], P), closed=False, line_color=col, line_w=0.9,
            line_alpha=a * 0.7, name=f"!!{tag}dong")
    ang = rad(-52)
    body, c, d = rot_rect(0.62, -0.18, 1.1, 0.16, ang), math.cos(ang), math.sin(ang)
    tb = (0.62 - 0.55 * c, -0.18 - 0.55 * d)
    tip = (tb[0] - 0.2 * c, tb[1] - 0.2 * d)
    D.paths(slide, map_r([body, [(tb[0] - 0.08 * d, tb[1] + 0.08 * c), (tb[0] + 0.08 * d, tb[1] - 0.08 * c), tip]], P),
            color=c2, alpha=a, name=f"!!{tag}but")


def atom(slide, cx, cy, s, col, a, c2, th, tag):
    P = U(cx, cy, s)
    D.paths(slide, map_r([ell(0, 0, 0.95, 0.34, rad(k), 60) for k in (0, 60, 120)], P), line_color=col, line_w=1.6,
            line_alpha=a, name=f"!!{tag}quydao")
    e = []
    for i, k in enumerate((0, 60, 120)):
        t, r = rad(40 + i * 110), rad(k)
        x, y = 0.95 * math.cos(t), 0.34 * math.sin(t)
        e.append(circle(x * math.cos(r) - y * math.sin(r), x * math.sin(r) + y * math.cos(r), 0.07, 16))
    D.paths(slide, map_r(e, P), color=c2, alpha=a, name=f"!!{tag}e")
    D.paths(slide, [P(p) for p in circle(0, 0, 0.16, 24)], color=col, alpha=a, name=f"!!{tag}nhan")


def circuit(slide, x0, y0, x1, y1, n, col, a, seed, tag):
    r, paths_, nodes = seeded(seed), [], []
    for k in range(n):
        x, y = x1 + 0.1, y0 + (y1 - y0) * (k + 0.5) / n
        p = [(x, y)]
        for seg in range(3):
            if not x > x0:
                break
            x -= 0.4 + r() * 1.1
            p.append((x, y))
            if seg < 2:
                dy = (-1 if r() < 0.5 else 1) * (0.15 + r() * 0.3)
                x -= abs(dy)
                y += dy
                p.append((x, y))
        paths_.append(p)
        nodes += [circle(x, y, 0.07, 14), circle(x, y, 0.03, 8)]
    D.paths(slide, paths_, closed=False, line_color=col, line_w=1.5, line_alpha=a, name=f"!!{tag}mach")
    D.paths(slide, nodes, line_color=col, line_w=1.2, line_alpha=a, name=f"!!{tag}nut")


def geo_set(slide, items, cols, a, tag):
    """items: (loại, x, y, cỡ, xoay, màu)."""
    for k, (t, x, y, sz, rot, ci) in enumerate(items):
        col = cols[ci % len(cols)]
        o = dict(line_color=col, line_w=2, line_alpha=a, name=f"!!{tag}{k}")
        if t == "tri":
            D.paths(slide, [(x + sz * math.cos(rot + TAU * i / 3 - math.pi / 2), y + sz * math.sin(rot + TAU * i / 3 - math.pi / 2))
                            for i in range(3)], **o)
        elif t == "sq":
            D.paths(slide, rot_rect(x, y, sz * 1.4, sz * 1.4, rot), **o)
        elif t == "ci":
            D.paths(slide, circle(x, y, sz, 40), **o)
        elif t == "dot":
            D.paths(slide, [circle(x + i * sz, y + j * sz, sz * 0.12, 8) for i in range(4) for j in range(3)], color=col,
                    alpha=a, name=f"!!{tag}{k}")
        elif t == "zig":
            D.paths(slide, [(x + i * sz * 0.3, y + (-sz * 0.2 if i % 2 else sz * 0.2)) for i in range(7)], closed=False, **o)
        elif t == "fill":
            D.paths(slide, circle(x, y, sz, 32), color=col, alpha=a * 0.85, name=f"!!{tag}{k}")


# ---------- vẽ từng họa tiết mới

def _bl_inv(slide, th, kind, info):
    D.box(slide, 0, H - 0.14, W, 0.06, color=GOLD, name="!!bl-dai")


def _bl_page(slide, th, info):
    D.box(slide, 0, 0, W, 0.12, color="C8161D", name="!!bl-bang")
    D.box(slide, 0, 0.12, W, 0.03, color=GOLD, name="!!bl-vien")


def _cb_inv(slide, th, kind, info):
    if kind != "closing":
        hills(slide, "0E1A09", 0.55, H - 0.75, "cb-doi")
        info["y1"] = min(info["y1"], H - 1.0)


def _may_cuon(slide, th, inv, idx, kind, info):
    col, a = (th["inv_accent"], 0.7) if inv else (th["accent"], 0.45)
    if inv:
        cl = cloud(W - 1.9, 1.05, 1.75, -1) + cloud(W - 4.1, H - 0.95, 1.3) + (cloud(1.8, 1.1, 1.2) if kind == "closing" else [])
    else:
        cl = cloud(W - 1.0, 0.4, 0.55, -1)
    D.paths(slide, cl, closed=False, line_color=col, line_w=2.2 if inv else 1.4, line_alpha=a, name="!!mc-may")
    if inv and kind != "closing":
        info["x1"] = min(info["x1"], W - 3.0)


def _tho_cam(slide, th, inv, idx, kind, info):
    if inv:
        brocade(slide, 0, 0.5, "tc-tren-")
        brocade(slide, H - 0.5, 0.5, "tc-duoi-")
        info["y0"] = max(info["y0"], 0.95)
        info["y1"] = min(info["y1"], H - 0.85)
    else:
        brocade(slide, 0, 0.3, "tc-")


def _gach_bong(slide, th, inv, idx, kind, info):
    if inv:
        if kind == "closing":
            tiles(slide, 0, 0, 1, 6, 1.25, th["inv_accent"], 0.5, "gb-t-")
            tiles(slide, W - 1.25, 0, 1, 6, 1.25, th["inv_accent"], 0.5, "gb-p-")
            info["x0"] = max(info["x0"], 1.7)
            info["x1"] = min(info["x1"], W - 1.7)
        else:
            tiles(slide, W - 3.75, 0, 3, 6, 1.25, th["inv_accent"], 0.5, "gb-")
            info["x1"] = min(info["x1"], W - 4.2)
    else:
        tiles(slide, W - 1.0, 0, 2, 1, 0.5, th["accent"], 0.55, "gb-")


def _song_nuoc(slide, th, inv, idx, kind, info):
    if inv:
        scales(slide, -0.2, W, H - 1.75, 4, 0.42, th["inv_accent"], 0.55, "sn-")
        info["y1"] = min(info["y1"], H - 1.85)
    else:
        scales(slide, -0.2, W, H - 0.5, 2, 0.2, th["accent"], 0.35, "sn-")


def _luy_tre(slide, th, inv, idx, kind, info):
    if inv:
        col = th["inv_accent"]
        xs = ([(0.5, 0.06), (1.1, 0.02), (W - 0.5, -0.06), (W - 1.1, -0.03)] if kind == "closing"
              else [(W - 0.5, -0.05), (W - 1.15, -0.02), (W - 1.8, 0.03)])
        for k, (x, lean) in enumerate(xs):
            bamboo(slide, x, H + 0.1, H + 0.4, 0.17 - k * 0.012, lean, col, 0.8 - k * 0.1, f"lt{k}-", 7 + k)
        if kind == "closing":
            info["x0"] = max(info["x0"], 2.0)
            info["x1"] = min(info["x1"], W - 2.0)
        else:
            info["x1"] = min(info["x1"], W - 2.6)
    else:
        bamboo(slide, W - 0.35, H + 0.1, H + 0.3, 0.1, -0.03, th["accent2"], 0.5, "lt0-", 3)
        bamboo(slide, W - 0.75, H + 0.1, H - 1.2, 0.08, 0.02, th["accent2"], 0.35, "lt1-", 5)
        info["x1"] = min(info["x1"], W - 1.15)


def _non_nuoc(slide, th, inv, idx, kind, info):
    if inv:
        mountains(slide, th["inv_accent"], [0.14, 0.24, 0.4], [H - 2.6, H - 1.9, H - 1.15], 11, "nn-nui")
        if kind != "closing":
            D.box(slide, W - 1.9, 0.6, 0.85, 0.85, kind="ellipse", color="C0392B", alpha=0.9, name="!!nn-troi")
            info["x1"] = min(info["x1"], W - 2.4)
        info["y1"] = min(info["y1"], H - 2.1)
    else:
        mountains(slide, th["ink"], [0.05, 0.08], [H - 1.15, H - 0.65], 11, "nn-nui")


def _hoa_dao(slide, th, inv, idx, kind, info):
    if inv:
        if kind == "closing":
            mai_branch(slide, W + 0.05, 0.1, 0.95, -1, "dao1-", DAO)
            mai_branch(slide, -0.05, H - 2.35, 0.75, 1, "dao2-", DAO)
        else:
            big = kind == "cover"
            mai_branch(slide, W + 0.05, 0.05, 1.25 if big else 1.05, -1, "dao1-", DAO)
            info["x1"] = min(info["x1"], W - (4.8 if big else 1.4))
    else:
        mai_branch(slide, W + 0.05, 0.02, 0.42, -1, "dao-", DAO)


def _den_long(slide, th, inv, idx, kind, info):
    cols = ["D7263D", "F18F01", "F6C445", "C73E1D", "E85D04"]
    if inv:
        st = ([(0.9, 0.2, 1.0), (1.9, 0.9, 0.8), (W - 0.9, 0.3, 1.0), (W - 1.9, 1.0, 0.8)] if kind == "closing"
              else [(W - 0.85, 0.2, 1.3), (W - 2.0, 1.1, 1.05), (W - 3.1, 0.35, 1.2), (W - 4.15, 1.4, 0.9)])
        for k, (x, ln, h) in enumerate(st):
            lantern(slide, x, 0, ln, h, cols[k % len(cols)], f"dl{k}-", True)
        if kind == "closing":
            info["y0"] = max(info["y0"], 2.2)
        else:
            info["x1"] = min(info["x1"], W - 4.8)
    else:
        lantern(slide, W - 0.55, 0, 0.04, 0.4, cols[0], "dl0-", False)
        lantern(slide, W - 1.05, 0, 0.12, 0.34, cols[1], "dl1-", False)
        info["x1"] = min(info["x1"], W - 1.4)


def _trung_thu(slide, th, inv, idx, kind, info):
    if inv:
        big = kind == "cover"
        mx, my, mr = (W / 2, 1.25, 0.6) if kind == "closing" else (W - 2.5, 2.0, 1.15 if big else 0.95)
        D.box(slide, mx - mr * 2, my - mr * 2, mr * 4, mr * 4, kind="ellipse", radial=True, gradient=["FFE8A3", "FFE8A3"],
              galphas=[0.35, 0.0], name="!!tt-hao")
        D.box(slide, mx - mr, my - mr, mr * 2, mr * 2, kind="ellipse", color="FFE08A", name="!!tt-trang")
        D.paths(slide, cloud(mx - mr * 0.6, my + mr * 0.75, mr * 0.9) + cloud(mx + mr * 1.3, my - mr * 0.2, mr * 0.6, -1),
                closed=False, line_color="FFFFFF", line_w=1.6, line_alpha=0.75, name="!!tt-may")
        if kind == "closing":
            info["y0"] = max(info["y0"], 2.3)
        else:
            star_lantern(slide, W - 4.3, H - 1.9, 0.7 if big else 0.55, 0.25, "tt-")
            info["x1"] = min(info["x1"], W - 5.2)
    else:
        D.box(slide, W - 0.82, 0.2, 0.44, 0.44, kind="ellipse", color="FFD166", name="!!tt-trang")
        D.paths(slide, star(W - 1.25, 0.3, 0.09), color=th["accent"], name="!!tt-sao")


def _phao_hoa(slide, th, inv, idx, kind, info):
    if inv:
        st = ([(1.6, 1.4, 1.0, "FFD166"), (W - 1.7, 1.2, 1.1, "EF476F"), (W - 2.6, H - 1.4, 0.7, "06D6A0"),
               (2.4, H - 1.2, 0.6, "73C2FB")] if kind == "closing"
              else [(W - 2.2, 1.6, 1.3, "FFD166"), (W - 4.0, 2.7, 0.9, "EF476F"), (W - 1.4, 4.4, 0.85, "06D6A0"),
                    (W - 3.5, 0.75, 0.5, "73C2FB"), (W - 3.0, 5.6, 0.45, "FFD166")])
        for k, (x, y, r, c) in enumerate(st):
            burst(slide, x, y, r, c, f"ph{k}-")
        if kind != "closing":
            info["x1"] = min(info["x1"], W - 5.0)
    else:
        burst(slide, W - 0.62, 0.42, 0.26, th["accent"], "ph0-", 14)
        burst(slide, W - 1.18, 0.3, 0.15, th["accent2"], "ph1-", 12)


def _bac_thang(slide, th, inv, idx, kind, info):
    if inv:
        if kind == "closing":
            terraces(slide, W + 0.6, H + 0.6, 0.6, 3.6, 7, 0.55, "bt-")
        else:
            terraces(slide, W + 0.6, H + 0.6, 0.8, 5.6 if kind == "cover" else 4.6, 10, 0.8, "bt-")
            info["x1"] = min(info["x1"], W - 3.4)
            info["y1"] = min(info["y1"], H - 0.9)
    else:
        terraces(slide, W + 0.4, H + 0.4, 0.4, 1.9, 5, 0.35, "bt-")


def _la_nhiet_doi(slide, th, inv, idx, kind, info):
    if inv:
        c = th["inv_accent"]
        frond(slide, W + 0.2, -0.3, 4.2, rad(150), 0.18, c, 0.85, "ld0-")
        frond(slide, W + 0.3, 1.2, 3.4, rad(185), -0.15, D.mix(c, th["inv"][0], 0.25), 0.8, "ld1-")
        frond(slide, W + 0.2, H + 0.3, 3.6, rad(215), -0.12, D.mix(c, "FFFFFF", 0.2), 0.75, "ld2-")
        if kind == "closing":
            frond(slide, -0.2, H + 0.3, 3.2, rad(-35), 0.12, c, 0.7, "ld3-")
        else:
            info["x1"] = min(info["x1"], W - 4.6)
    else:
        frond(slide, W + 0.15, -0.2, 1.8, rad(152), 0.15, th["accent2"], 0.3, "ld0-")


def _mach_dien(slide, th, inv, idx, kind, info):
    if inv:
        if kind == "closing":
            circuit(slide, W - 3.2, 0.4, W, H - 0.4, 9, th["inv_accent"], 0.35, 21, "md-")
        else:
            circuit(slide, W - 5.2, 0.3, W, H - 0.3, 12, th["inv_accent"], 0.6, 21, "md-")
            info["x1"] = min(info["x1"], W - 5.3)
    else:
        circuit(slide, W - 2.6, H - 1.6, W, H - 0.55, 4, th["accent"], 0.25, 21, "md-")


def _hinh_hoc(slide, th, inv, idx, kind, info):
    cols = [th["inv_accent"], D.mix(th["inv_accent"], "FFFFFF", 0.4), th["inv_ink"]] if inv else \
        [th["accent"], th["accent2"], th["accent3"]]
    if inv:
        items = ([("ci", 1.4, 1.3, 0.7, 0, 0), ("tri", W - 1.6, H - 1.4, 0.8, 0.3, 1), ("dot", W - 2.4, 0.8, 0.28, 0, 2),
                  ("zig", 0.9, H - 1.0, 0.9, 0, 1)] if kind == "closing"
                 else [("ci", W - 2.6, 2.3, 1.35, 0, 0), ("tri", W - 4.1, 4.6, 0.95, 0.35, 1), ("sq", W - 1.4, 5.3, 0.6, 0.5, 2),
                       ("dot", W - 3.9, 0.7, 0.3, 0, 2), ("zig", W - 2.2, 6.6, 1.2, 0, 1), ("fill", W - 1.3, 1.1, 0.22, 0, 1)])
        geo_set(slide, items, cols, 0.75, "hh-")
        if kind == "closing":
            info["x0"] = max(info["x0"], 1.6)
            info["x1"] = min(info["x1"], W - 1.6)
        else:
            info["x1"] = min(info["x1"], W - 4.9)
    else:
        geo_set(slide, [("tri", W - 1.35, 0.4, 0.17, 0.2, 0), ("ci", W - 0.85, 0.38, 0.13, 0, 1),
                        ("fill", W - 0.5, 0.42, 0.06, 0, 2)], cols, 0.8, "hh-")


MOTIFS.update({
    # ----- Lịch sử · Cách mạng
    "bua-liem": dict(
        pack="lich-su", name="Đảng · Búa liềm", short="Búa liềm",
        desc="Búa liềm vàng trên nền đỏ cờ Đảng — sinh hoạt chi bộ, lịch sử Đảng, nghị quyết, kỷ niệm ngày thành lập Đảng.",
        own_inv=True, draw=emblem_draw(hammer_sickle, inv=_bl_inv, page=_bl_page),
        palette=dict(bg="FFF9F0", bg2="FBF0E2", ink="2B1210", body="4E2A24", muted="7A5A52", accent="C8161D",
                     accent2="E0A100", accent3="9E1410", card="FFFFFF", card_line="F0D6C6",
                     inv=["7A0C09", "B3141A", "D0201E"], inv_ink="FFF7E0", inv_body="FDE6B0", inv_accent=GOLD)),
    "vong-lua": dict(
        pack="lich-su", name="Vòng lúa · Ngôi sao", short="Vòng lúa",
        desc="Hai bông lúa vàng ôm ngôi sao giữa nền đỏ — nông nghiệp, nông thôn mới, thi đua, khen thưởng, ngày lễ lớn.",
        own_inv=True, draw=emblem_draw(rice_wreath),
        palette=dict(bg="FFFAF0", bg2="FBF2DF", ink="2E1A0E", body="503526", muted="7D6352", accent="B71C1C",
                     accent2="D4A20B", accent3="6D8B3A", card="FFFFFF", card_line="EFD9BE",
                     inv=["6B0A08", "A3161A", "C62828"], inv_ink="FFF8E1", inv_body="FBE3AE", inv_accent="F5C518")),
    "co-bay": dict(
        pack="lich-su", name="Chiến thắng · Cờ bay", short="Cờ bay",
        desc="Lá cờ đỏ sao vàng tung bay trên đồi, tông xanh bộ đội — chiến thắng lịch sử, quân đội, ngày 22/12, 30/4.",
        own_inv=True, draw=emblem_draw(waving_flag, halo=False, inv=_cb_inv),
        palette=dict(bg="F7F4E8", bg2="F0ECDA", ink="1E2A16", body="3D4A33", muted="6A7560", accent="B3261E",
                     accent2="5B7F3A", accent3="C9A227", card="FFFFFF", card_line="DDD8C0",
                     inv=["16260F", "2C4720", "3E5F2C"], inv_ink="FFF8E1", inv_body="DCE6C8", inv_accent="F1D27A")),

    # ----- Văn hóa · Hoa văn truyền thống
    "may-cuon": dict(
        pack="van-hoa", name="Mây cuộn · Mây lành", short="Mây cuộn",
        desc="Những dải mây cuộn nét mảnh ở góc trang, giữ màu của mẫu — văn hóa, mỹ thuật cổ, đình chùa, lễ hội truyền thống.",
        own_inv=False, draw=_may_cuon, palette=None),
    "tho-cam": dict(
        pack="van-hoa", name="Thổ cẩm · Dân tộc", short="Thổ cẩm",
        desc="Dải thổ cẩm đỏ, vàng, chàm hoa văn hình thoi và răng cưa — văn hóa các dân tộc, du lịch, vùng cao.",
        own_inv=True, draw=_tho_cam,
        palette=dict(bg="FAF5EC", bg2="F4ECDD", ink="1E1B3A", body="3E3A5A", muted="6D6985", accent="B3202A",
                     accent2="2F4B8A", accent3="E0A100", card="FFFFFF", card_line="E6DCCB",
                     inv=["17142E", "2A2450"], inv_ink="FFF6E5", inv_body="E3DCF0", inv_accent="F2B705")),
    "gach-bong": dict(
        pack="van-hoa", name="Gạch bông · Hoài cổ", short="Gạch bông",
        desc="Mảng gạch bông hoa bốn cánh kiểu nhà phố xưa, giữ màu của mẫu — hoài niệm, kiến trúc, văn hóa đô thị.",
        own_inv=True, draw=_gach_bong, palette=None),
    "song-nuoc": dict(
        pack="van-hoa", name="Sóng nước · Vảy cá", short="Sóng nước",
        desc="Lớp sóng hình vảy cá xếp chồng ở chân trang, giữ màu của mẫu — sông nước, biển đảo, văn hóa vùng ven biển.",
        own_inv=True, draw=_song_nuoc, palette=None),
    "luy-tre": dict(
        pack="van-hoa", name="Lũy tre làng", short="Lũy tre",
        desc="Khóm tre xanh mọc bên mép trang — làng quê Việt Nam, văn học, đức tính con người Việt Nam.",
        own_inv=True, draw=_luy_tre,
        palette=dict(bg="F6F8EE", bg2="EEF2E1", ink="1C2B1E", body="3C4D3E", muted="687A69", accent="2E6B3F",
                     accent2="8DB46A", accent3="C49A45", card="FFFFFF", card_line="D7E2CA",
                     inv=["132A1B", "23452F", "2F5A3C"], inv_ink="F4F8EC", inv_body="D3E2C6", inv_accent="A8C686")),
    "non-nuoc": dict(
        pack="van-hoa", name="Non nước · Thủy mặc", short="Non nước",
        desc="Lớp núi mờ kiểu tranh thủy mặc và vầng mặt trời đỏ như con dấu — địa lý, văn chương, quê hương, du lịch.",
        own_inv=True, draw=_non_nuoc,
        palette=dict(bg="F4F1EA", bg2="ECE8DE", ink="1F2A30", body="3D4A50", muted="6B767A", accent="A33B2B",
                     accent2="5C7480", accent3="9AA9B0", card="FFFDF8", card_line="DCD7CB",
                     inv=["1A2328", "2C3A41", "3A4B53"], inv_ink="F4F1EA", inv_body="D4DBDE", inv_accent="C9D6DF")),

    # ----- Lễ hội · Mùa xuân
    "hoa-dao": dict(
        pack="le-hoi", name="Hoa đào · Xuân miền Bắc", short="Hoa đào",
        desc="Cành đào hồng thắm trên nền mận chín — Tết miền Bắc, mừng Xuân, ngày 8/3, chủ đề phụ nữ.",
        own_inv=True, draw=_hoa_dao,
        palette=dict(bg="FFF6F8", bg2="FCEDF1", ink="3A1424", body="5C3343", muted="8A6170", accent="C2185B",
                     accent2="E57399", accent3="6A994E", card="FFFFFF", card_line="F3D3DE",
                     inv=["5A1230", "8E2550", "A8325E"], inv_ink="FFF3F6", inv_body="F8D5E1", inv_accent="F8BBD0")),
    "den-long": dict(
        pack="le-hoi", name="Đèn lồng · Phố Hội", short="Đèn lồng",
        desc="Chùm đèn lồng đỏ, cam, vàng tỏa sáng trên nền đêm — lễ hội, phố cổ Hội An, Tết, văn hóa đêm rằm.",
        own_inv=True, draw=_den_long,
        palette=dict(bg="FFF8EE", bg2="FCEFDD", ink="2A1230", body="4D3550", muted="7B667C", accent="C0392B",
                     accent2="F18F01", accent3="6C3483", card="FFFFFF", card_line="F0DCC6",
                     inv=["160C27", "2D1842", "40205A"], inv_ink="FFF6E8", inv_body="EED9C8", inv_accent="F6C445")),
    "trung-thu": dict(
        pack="le-hoi", name="Trung thu · Trăng rằm", short="Trung thu",
        desc="Vầng trăng tròn, đèn ông sao và mây bay trên nền đêm xanh — Tết Trung thu, thiếu nhi, hoạt động ngoại khóa.",
        own_inv=True, draw=_trung_thu,
        palette=dict(bg="FFF9EC", bg2="F8F1E0", ink="15213F", body="384463", muted="67718C", accent="D1495B",
                     accent2="2D5DA1", accent3="EDAE49", card="FFFFFF", card_line="EADFC8",
                     inv=["0B1633", "17305C", "1F3A6B"], inv_ink="FFF8EA", inv_body="D8DFF0", inv_accent="FFD166")),
    "phao-hoa": dict(
        pack="le-hoi", name="Pháo hoa · Mừng lễ", short="Pháo hoa",
        desc="Những chùm pháo hoa vàng, hồng, xanh trên nền đêm — mừng năm mới, lễ kỷ niệm, tổng kết, khai giảng.",
        own_inv=True, draw=_phao_hoa,
        palette=dict(bg="FBF8F3", bg2="F3EEF7", ink="1A1538", body="3E3960", muted="6D6890", accent="D6336C",
                     accent2="118AB2", accent3="E0A100", card="FFFFFF", card_line="E5DFEE",
                     inv=["0A0A26", "1C1446", "2A1B5C"], inv_ink="FFFFFF", inv_body="DCD8F0", inv_accent="FFD166")),

    # ----- Thiên nhiên · Môi trường
    "dam-sen": dict(
        pack="thien-nhien", name="Đầm sen", short="Đầm sen",
        desc="Hoa sen hồng, nụ sen và lá sen xanh — quốc hoa, thiên nhiên, văn hóa Việt, chủ đề thanh cao, môi trường nước.",
        own_inv=True, draw=emblem_draw(lotus_pond, ca=0.16, wm=0.16),
        palette=dict(bg="F5F8F2", bg2="EDF3EA", ink="17332A", body="38544A", muted="667E74", accent="C2185B",
                     accent2="2E7D32", accent3="E7A33E", card="FFFFFF", card_line="D6E3D6",
                     inv=["0C3328", "17503D", "1F5C46"], inv_ink="F5FAF6", inv_body="D2E6DA", inv_accent="F8BBD0")),
    "bac-thang": dict(
        pack="thien-nhien", name="Ruộng bậc thang", short="Bậc thang",
        desc="Những thửa ruộng bậc thang xanh vàng uốn lượn ở góc trang — nông nghiệp, vùng cao, du lịch, mùa lúa chín.",
        own_inv=True, draw=_bac_thang,
        palette=dict(bg="F7F9EF", bg2="EFF3E2", ink="1B2E22", body="3B5042", muted="687C6C", accent="2D6A4F",
                     accent2="9BBF3B", accent3="E0A100", card="FFFFFF", card_line="DCE5CC",
                     inv=["16362A", "24543F", "2D6A4F"], inv_ink="F5F9EE", inv_body="D5E5C9", inv_accent="CDDC39")),
    "la-nhiet-doi": dict(
        pack="thien-nhien", name="Lá nhiệt đới", short="Lá dừa",
        desc="Tàu lá dừa, lá cọ xanh vươn ra từ góc trang — miền Tây, biển đảo, môi trường, du lịch, mùa hè.",
        own_inv=True, draw=_la_nhiet_doi,
        palette=dict(bg="F1F7F2", bg2="E7F1E9", ink="0F2A20", body="2F4A3E", muted="5E776B", accent="2D6A4F",
                     accent2="52B788", accent3="E9C46A", card="FFFFFF", card_line="D1E5D7",
                     inv=["06170F", "12362A", "1B4332"], inv_ink="F1F8F3", inv_body="CDE6D8", inv_accent="95D5B2")),
    "trai-dat": dict(
        pack="thien-nhien", name="Trái Đất xanh", short="Trái Đất",
        desc="Quả địa cầu kinh tuyến nét mảnh nảy mầm xanh — bảo vệ môi trường, biến đổi khí hậu, phát triển bền vững.",
        own_inv=True, draw=emblem_draw(globe),
        palette=dict(bg="F2F8F5", bg2="E8F2EE", ink="0F2E25", body="2E4D44", muted="5E7A71", accent="138A63",
                     accent2="2A9DCE", accent3="F2A541", card="FFFFFF", card_line="D2E6DE",
                     inv=["0A3226", "115A45", "146C54"], inv_ink="F2FAF6", inv_body="CFE9DE", inv_accent="7ED9A8")),

    # ----- Giáo dục · Khoa học
    "sach-but": dict(
        pack="giao-duc", name="Sách vở · Bút chì", short="Sách bút",
        desc="Cuốn sách mở và cây bút chì nét mảnh, giữ màu của mẫu — bài giảng, ngày Nhà giáo 20/11, khuyến học, thư viện.",
        own_inv=False, draw=emblem_draw(book_pen), palette=None),
    "nguyen-tu": dict(
        pack="giao-duc", name="Nguyên tử · Khoa học", short="Nguyên tử",
        desc="Mô hình nguyên tử với ba quỹ đạo electron, giữ màu của mẫu — vật lý, hóa học, STEM, nghiên cứu khoa học.",
        own_inv=False, draw=emblem_draw(atom), palette=None),
    "mach-dien": dict(
        pack="giao-duc", name="Mạch điện tử · Công nghệ", short="Mạch điện",
        desc="Đường mạch in và nút hàn chạy từ mép trang trên nền xanh đêm — tin học, chuyển đổi số, AI, kỹ thuật.",
        own_inv=True, draw=_mach_dien,
        palette=dict(bg="F4F8FA", bg2="EAF2F5", ink="0D2230", body="2F4655", muted="5F7583", accent="0E7C86",
                     accent2="3A86FF", accent3="F4A259", card="FFFFFF", card_line="D3E2E8",
                     inv=["07161F", "0C2C3C", "0F3A4F"], inv_ink="EFFAFB", inv_body="C7E3E8", inv_accent="35E0C2")),
    "hinh-hoc": dict(
        pack="giao-duc", name="Hình học · Toán học", short="Hình học",
        desc="Tam giác, hình tròn, hình vuông và lưới chấm nhiều màu, giữ màu của mẫu — toán học, tư duy, lớp học sáng tạo.",
        own_inv=False, draw=_hinh_hoc, palette=None),
})


# ============================================================ gói Anime · Comic · Manga
# Hình tự vẽ theo ngôn ngữ của thể loại (đường tốc độ, chấm tram, tiếng nổ, bong bóng thoại…),
# không dùng nhân vật, logo hay biểu tượng riêng của bộ truyện/phim nào.
PACKS.append(dict(id="anime", name="Anime · Comic · Manga",
                  desc="Đường tốc độ, chấm tram, BÙM!, bong bóng thoại, hào quang, hải tặc, mạng nhện, siêu anh hùng, HUD, khung truyện"))
COMIC = dict(bg="FFF6DC", bg2="FFFBEF", ink="111111", body="2B2B2B", muted="555555", accent="E63946", accent2="1D4ED8",
             accent3="FFC300", card="FFFFFF", card_line="111111")
MANGA = dict(bg="FFFFFF", bg2="F5F5F5", ink="0D0D0D", body="2A2A2A", muted="5C5C5C", accent="D62828", accent2="1A1A1A",
             accent3="8C8C8C", card="FFFFFF", card_line="1A1A1A",
             inv=["0D0D0D", "222222"], inv_ink="FFFFFF", inv_body="D9D9D9", inv_accent="FF4D4D")
BOLT = [(0, 0), (0.4, -0.15), (0.34, -0.03), (1, 0.03), (0.58, 0.17), (0.64, 0.06), (0.05, 0.13)]
SHIELD = [(-0.78, -0.82), (0.78, -0.82), (0.78, -0.05)] + quad((0.78, -0.05), (0.72, 0.6), (0, 0.98), 14) \
    + quad((0, 0.98), (-0.72, 0.6), (-0.78, -0.05), 14)
SAYS = dict(font="Segoe UI Black", align="c", anchor="m")     # chữ tiếng động / lời thoại


def pal(base, **o):
    return dict(base, **o)


def dot_field(x, y, w, h, step, rmax, dir_):
    """Chấm tram: lưới chấm to dần về một góc/cạnh. (x, y) là góc neo; dir_: 'bl' | 'tr' | 'b'."""
    out = []
    i = 0
    while i * step <= w + 0.01:
        j = 0
        while j * step <= h + 0.01:
            off = step / 2 if j % 2 else 0
            dx, dy = i * step + off, j * step
            t = 1 - dy / h if dir_ == "b" else 1 - math.hypot(dx / w, dy / h) / 1.15
            if t > 0.05:
                rr = rmax * t
                px, py = (x - dx, y + dy) if dir_ == "tr" else (x + dx, y - dy)
                out.append([(px + rr * math.cos(TAU * k / 10), py + rr * math.sin(TAU * k / 10)) for k in range(10)])
            j += 1
        i += 1
    return out


def jagged(cx, cy, R, r, n, seed, rot=0.0):
    rr, p = seeded(seed), []
    for i in range(n * 2):
        a = rot + math.pi * i / n
        k = r * (0.85 + 0.3 * rr()) if i % 2 else R * (0.85 + 0.3 * rr())
        p.append((cx + k * math.cos(a), cy + k * math.sin(a)))
    return p


def focus_lines(cx, cy, rin, rout, n, seed, sy=0.7):
    r, out = seeded(seed), []
    for i in range(n):
        a = TAU * i / n + (r() - 0.5) * 0.03
        ri = rin * (1 + r() * 0.45)
        w = 0.008 + r() * 0.022
        out.append([(cx + ri * math.cos(a), cy + ri * math.sin(a) * sy),
                    (cx + rout * math.cos(a - w), cy + rout * math.sin(a - w) * sy),
                    (cx + rout * math.cos(a + w), cy + rout * math.sin(a + w) * sy)])
    return out


def streaks(x1, y0, y1, n, length, seed):
    """Vệt tốc độ nằm ngang, nhọn về bên trái."""
    r, out = seeded(seed), []
    for _ in range(n):
        y = y0 + (y1 - y0) * r()
        L = length * (0.4 + 0.6 * r())
        w = 0.012 + 0.02 * r()
        out.append([(x1 + 0.1, y - w), (x1 + 0.1, y + w), (x1 - L, y)])
    return out


def bubble(cx, cy, rx, ry, tx, ty):
    """Bong bóng thoại có đuôi nhọn chỉ tới (tx, ty)."""
    ang, n = math.atan2((ty - cy) / ry, (tx - cx) / rx), 60
    p = [(cx + rx * math.cos(ang + 0.2 + (TAU - 0.4) * i / (n - 1)), cy + ry * math.sin(ang + 0.2 + (TAU - 0.4) * i / (n - 1)))
         for i in range(n)]
    return p + [(tx, ty)]


def skyline(x0, x1, yb, hmin, hmax, seed):
    r, out, x = seeded(seed), [], x0
    while x < x1:
        w = 0.3 + 0.55 * r()
        h = hmin + (hmax - hmin) * r()
        out.append([(x, yb), (x, yb - h), (x + w, yb - h), (x + w, yb)])
        if r() < 0.3:
            out.append(rot_rect(x + w / 2, yb - h - 0.18, 0.36, 0.03, rad(90)))
        x += w + 0.04
    return out


def web(cx, cy, R, a0, a1, spokes, rings):
    sp, rg = [], []
    for i in range(spokes + 1):
        a = a0 + (a1 - a0) * i / spokes
        sp.append([(cx, cy), (cx + R * math.cos(a), cy + R * math.sin(a))])
    for k in range(1, rings + 1):
        rk, ring = R * k / rings, []
        for i in range(spokes):
            a, b = a0 + (a1 - a0) * i / spokes, a0 + (a1 - a0) * (i + 1) / spokes
            m = (a + b) / 2
            seg = quad((cx + rk * math.cos(a), cy + rk * math.sin(a)), (cx + rk * 0.86 * math.cos(m), cy + rk * 0.86 * math.sin(m)),
                       (cx + rk * math.cos(b), cy + rk * math.sin(b)), 8)
            ring += seg[1:] if i else seg
        rg.append(ring)
    return sp + rg


def dashes(pts, on=2, off=2):
    out, i = [], 0
    while i + on < len(pts):
        out.append(pts[i:i + on + 1])
        i += on + off
    return out


def compass(slide, cx, cy, R, col, a, tag):
    D.paths(slide, [circle(cx, cy, R * 0.72, 60), circle(cx, cy, R * 0.8, 60)], line_color=col, line_w=1.5, line_alpha=a,
            name=f"!!{tag}vong")
    ticks = []
    for i in range(32):
        t, k = TAU * i / 32, (0.72 if i % 4 else 0.64)
        ticks.append([(cx + R * k * math.cos(t), cy + R * k * math.sin(t)), (cx + R * 0.8 * math.cos(t), cy + R * 0.8 * math.sin(t))])
    D.paths(slide, ticks, closed=False, line_color=col, line_w=1, line_alpha=a, name=f"!!{tag}vach")
    D.paths(slide, star(cx, cy, R * 0.62, 4, 0.22, rad(-45)), color=col, alpha=a * 0.55, name=f"!!{tag}phu")
    D.paths(slide, star(cx, cy, R, 4, 0.2), color=col, alpha=a, name=f"!!{tag}chinh")


def hud(slide, cx, cy, s, col, a, c2, th, tag):
    P, segs, ticks = U(cx, cy, s), [], []
    for i in range(6):
        segs.append(arc(0, 0, 0.95, rad(i * 60 + 8), rad(i * 60 + 52), 12))
    for i in range(48):
        t, k = TAU * i / 48, (0.74 if i % 4 else 0.68)
        ticks.append([(k * math.cos(t), k * math.sin(t)), (0.78 * math.cos(t), 0.78 * math.sin(t))])
    D.paths(slide, map_r(segs, P), closed=False, line_color=col, line_w=max(1.5, 4 * s), line_alpha=a, name=f"!!{tag}cung")
    D.paths(slide, map_r(ticks, P), closed=False, line_color=col, line_w=1, line_alpha=a * 0.8, name=f"!!{tag}vach")
    D.paths(slide, map_r([circle(0, 0, 0.55, 48), circle(0, 0, 0.42, 48)], P), line_color=col, line_w=1.2, line_alpha=a,
            name=f"!!{tag}vong")
    tri = [(0, -0.07), (0.12, 0), (0, 0.07)]
    D.paths(slide, map_r([place(tri, 1.08 * math.cos(rad(d)), 1.08 * math.sin(rad(d)), 1, rad(d + 180)) for d in (0, 90, 180, 270)], P),
            color=col, alpha=a, name=f"!!{tag}ngam")
    D.box(slide, *P((-0.6, -0.6)), 1.2 * s, 1.2 * s, kind="ellipse", radial=True, gradient=["7DF9FF", "7DF9FF"],
          galphas=[min(1, a * 0.7), 0.0], name=f"!!{tag}sang")
    D.paths(slide, [P(p) for p in circle(0, 0, 0.26, 40)], color="E0FFFF", alpha=a, line_color="7DF9FF",
            line_w=max(1, 3 * s), line_alpha=a, name=f"!!{tag}loi")


def aura(slide, cx, cy, R, a, tag, seed):
    """Hào quang lửa bốc lên quanh quả cầu sáng."""
    def flame(k, sd):
        r, p = seeded(sd), []
        for i in range(44):
            t = TAU * i / 44
            up = 1 + 0.9 * -math.sin(t) if math.sin(t) < 0 else 1
            kk = (0.86 if i % 2 else 1 + 0.25 * r()) * k
            p.append((cx + R * kk * math.cos(t) * 0.85, cy + R * kk * math.sin(t) * up))
        return p
    D.paths(slide, flame(1.25, seed), color="F77F00", alpha=a * 0.75, name=f"!!{tag}lua1")
    D.paths(slide, flame(0.95, seed + 1), color="FFB703", alpha=a * 0.85, name=f"!!{tag}lua2")
    D.box(slide, cx - R * 0.75, cy - R * 0.75, R * 1.5, R * 1.5, kind="ellipse", radial=True, gradient=["FFFFFF", "FFE066"],
          galphas=[a, a * 0.9], name=f"!!{tag}cau")


def hero_shield(slide, cx, cy, s, a, tag):
    P = U(cx, cy, s)
    D.paths(slide, [P(p) for p in SHIELD], color="D62828", alpha=a, line_color="FFD60A", line_w=max(2, 6 * s), line_alpha=a,
            name=f"!!{tag}khien")
    D.paths(slide, [P((x * 0.78, y * 0.78 - 0.02)) for x, y in SHIELD], line_color="FFD60A", line_w=max(1, 2 * s),
            line_alpha=a, name=f"!!{tag}khien2")
    D.paths(slide, place(BOLT, *P((-0.42, -0.42)), 1.05 * s, rad(52)), color="FFD60A", alpha=a, line_color="111111",
            line_w=1.5, line_alpha=a, name=f"!!{tag}set")


def comic_frame(slide, info, w=6):
    D.box(slide, 0.16, 0.16, W - 0.32, H - 0.32, line_color="111111", line_w=w, name="!!ac-khung")
    info.update(x0=max(info["x0"], 0.95), y0=max(info["y0"], 0.8), y1=min(info["y1"], H - 0.85))


def _say_text(slide, x, y, w, h, word, size, color, name):
    D.text(slide, x, y, w, h, word, size=size, color=color, name=name, **SAYS)


def _toc_do(slide, th, inv, idx, kind, info):
    if inv:
        cx = W / 2 if kind == "closing" else W * 0.34
        D.paths(slide, focus_lines(cx, H / 2, 3.9, 14, 150, 5 + idx), color=th["inv_ink"], alpha=0.3, name="!!td-tia")
        if kind != "closing":
            D.paths(slide, rot_rect(W - 1.1, 0.85, 3.0, 0.2, rad(-28)), color=th["inv_accent"], name="!!td-vach")
            info["x1"] = min(info["x1"], W - 2.7)
    else:
        D.paths(slide, streaks(W - 0.3, 0.2, 0.55, 14, 2.6, 9), color=th["ink"], alpha=0.5, name="!!td-vet")


def _cham_tram(slide, th, inv, idx, kind, info):
    if inv:
        D.paths(slide, rays(W * 0.82, H * 0.42, 16, 40, 0), color=th["inv_accent"], alpha=0.2, name="!!ct-tia")
        D.paths(slide, dot_field(0, H, 4.4, 3.0, 0.3, 0.13, "bl"), color="000000", alpha=0.28, name="!!ct-tram1")
        D.paths(slide, dot_field(W, 0, 4.2, 2.6, 0.28, 0.12, "tr"), color=th["inv_accent"], alpha=0.6, name="!!ct-tram2")
        comic_frame(slide, info)
    else:
        D.paths(slide, dot_field(W, 0, 2.6, 1.5, 0.2, 0.085, "tr"), color=th["accent3"], alpha=0.95, name="!!ct-tram2")
        D.paths(slide, dot_field(0, H, 2.2, 1.1, 0.18, 0.07, "bl"), color=th["accent"], alpha=0.5, name="!!ct-tram1")


def _bum(slide, th, inv, idx, kind, info):
    def boom(cx, cy, R, word, size, tag, seed):
        D.paths(slide, jagged(cx, cy, R * 1.22, R * 0.85, 14, seed), color="E63946", line_color="111111", line_w=3,
                name=f"!!{tag}no1")
        D.paths(slide, jagged(cx, cy, R, R * 0.68, 12, seed + 3, 0.2), color="FFD60A", line_color="111111", line_w=2.5,
                name=f"!!{tag}no2")
        _say_text(slide, cx - R, cy - R * 0.5, 2 * R, R, word, size, "E63946", f"!!{tag}chu")
    if inv:
        D.paths(slide, rays(W - 3.0, H / 2, 16, 36, 0.1), color="FFFFFF", alpha=0.1, name="!!bum-tia")
        if kind == "closing":
            boom(1.6, 1.35, 0.95, "WOW!", 30, "bum1-", 3)
            boom(W - 1.7, H - 1.35, 0.9, "YEAH!", 26, "bum2-", 7)
        else:
            cover = kind == "cover"
            boom(W - 3.0, H / 2 - 0.1, 1.9 if cover else 1.55, "BÙM!" if cover else "POW!", 64 if cover else 52, "bum-", 11)
            info["x1"] = min(info["x1"], W - 5.6)
        comic_frame(slide, info)
    else:
        boom(W - 0.72, 0.45, 0.3, "!", 20, "bum-", 11)


def _bong_thoai(slide, th, inv, idx, kind, info):
    def say(cx, cy, rx, ry, tx, ty, word, size, tag):
        D.paths(slide, bubble(cx, cy, rx, ry, tx, ty), color="FFFFFF", line_color="111111", line_w=3, name=f"!!{tag}bong")
        _say_text(slide, cx - rx * 0.8, cy - ry * 0.7, rx * 1.6, ry * 1.4, word, size, "111111", f"!!{tag}chu")

    def think(cx, cy, rx, ry, word, size, tag):
        D.paths(slide, [ell(cx, cy, rx, ry, 0, 48), circle(cx - rx * 0.9, cy + ry * 1.05, ry * 0.22, 20),
                        circle(cx - rx * 1.2, cy + ry * 1.5, ry * 0.12, 16)], color="FFFFFF", line_color="111111",
                line_w=2.5, name=f"!!{tag}nghi")
        _say_text(slide, cx - rx * 0.8, cy - ry * 0.7, rx * 1.6, ry * 1.4, word, size, "111111", f"!!{tag}chu")
    if inv:
        if kind == "closing":
            say(2.0, 1.25, 1.2, 0.6, 2.8, 1.95, "Hay quá!", 22, "bt1-")
            think(W - 2.0, H - 1.5, 1.1, 0.55, "Hẹn gặp lại!", 18, "bt2-")
        else:
            big = kind == "cover"
            say(W - 3.0, 2.15, 2.1 if big else 1.8, 1.15 if big else 0.95, W - 4.4, 3.75 if big else 3.45,
                "Bắt đầu nào!" if big else "Tiếp nào!", 34 if big else 30, "bt1-")
            think(W - 1.75, H - 1.6, 1.15, 0.6, "Hmm…", 26, "bt2-")
            info["x1"] = min(info["x1"], W - 5.4)
        comic_frame(slide, info, 5)
    else:
        say(W - 0.95, 0.4, 0.5, 0.25, W - 1.4, 0.6, "!", 16, "bt-")


def _nang_luong(slide, th, inv, idx, kind, info):
    if inv:
        if kind == "closing":
            aura(slide, W / 2, H / 2 + 0.4, 2.2, 0.22, "nl-", 4)
        else:
            cx, cy, R = W - 2.5, H / 2 + 0.55, (1.25 if kind == "cover" else 1.05)
            aura(slide, cx, cy, R, 0.95, "nl-", 4)
            D.paths(slide, [place(BOLT, cx - R * 1.75, cy - R * 1.9, R * 0.9, rad(35)),
                            place(BOLT, cx + R * 0.95, cy - R * 2.0, R * 0.8, rad(110))], color="FFE066",
                    line_color="FFFFFF", line_w=1, name="!!nl-set")
            r, sp = seeded(9), []
            for _ in range(18):
                t = TAU * r()
                d = R * (1.4 + 1.1 * r())
                sp.append(star(cx + d * math.cos(t), cy + d * math.sin(t) * 0.9, 0.05 + 0.07 * r(), 4, 0.3))
            D.paths(slide, sp, color="FFF3B0", alpha=0.9, name="!!nl-tialua")
            info["x1"] = min(info["x1"], W - 5.9)
    else:
        D.box(slide, W - 0.9, 0.22, 0.42, 0.42, kind="ellipse", radial=True, gradient=["FFE066", "F77F00"], name="!!nl-cau")
        D.paths(slide, place(BOLT, W - 1.55, 0.25, 0.5, rad(35)), color=th["accent"], name="!!nl-set")


def _hai_tac(slide, th, inv, idx, kind, info):
    def X(x, y, s, tag):
        D.paths(slide, [rot_rect(x, y, s, s * 0.22, rad(45)), rot_rect(x, y, s, s * 0.22, rad(-45))], color="C1121F",
                name=f"!!{tag}x")
    if inv:
        if kind == "closing":
            compass(slide, W / 2, H / 2, 2.6, th["inv_accent"], 0.13, "ht-")
        else:
            cx, cy, R = W - 2.6, H / 2 - 0.3, (2.0 if kind == "cover" else 1.6)
            compass(slide, cx, cy, R, th["inv_accent"], 0.85, "ht-")
            route = quad((cx - R * 0.4, cy + R * 0.9), (cx - R * 2.2, cy + R * 1.6), (cx - R * 1.9, H - 0.7), 30)
            D.paths(slide, dashes(route), closed=False, line_color=th["inv_ink"], line_w=2.5, line_alpha=0.8,
                    name="!!ht-duong")
            X(cx - R * 1.9, H - 0.65, 0.42, "ht-")
            info["x1"] = min(info["x1"], cx - R - 0.5)
    else:
        compass(slide, W - 1.4, H - 1.4, 1.1, th["accent2"], 0.13, "ht-")
        X(W - 0.65, 0.42, 0.26, "ht-")


def _mang_nhen(slide, th, inv, idx, kind, info):
    if inv:
        D.paths(slide, skyline(-0.1, W + 0.1, H + 0.02, 0.5, 1.4 if kind == "closing" else 2.0, 13), color="050B18",
                alpha=0.85, name="!!mn-pho")
        if kind == "closing":
            D.paths(slide, web(W + 0.1, -0.1, 3.0, rad(90), rad(180), 6, 5), closed=False, line_color="FFFFFF", line_w=1,
                    line_alpha=0.5, name="!!mn-mang1")
            D.paths(slide, web(-0.1, -0.1, 3.0, 0, rad(90), 6, 5), closed=False, line_color="FFFFFF", line_w=1,
                    line_alpha=0.5, name="!!mn-mang2")
        else:
            D.paths(slide, web(W + 0.15, -0.15, 5.4 if kind == "cover" else 4.6, rad(90), rad(180), 8, 7), closed=False,
                    line_color="FFFFFF", line_w=1.25, line_alpha=0.6, name="!!mn-mang1")
            info["x1"] = min(info["x1"], W - (5.0 if kind == "cover" else 4.3))
        D.box(slide, 0, H - 0.08, W, 0.08, color=th["inv_accent"], name="!!mn-dai")
        info["y1"] = min(info["y1"], H - 2.1)
    else:
        D.paths(slide, web(W + 0.05, -0.05, 1.25, rad(90), rad(180), 6, 5), closed=False, line_color=th["ink"], line_w=0.9,
                line_alpha=0.4, name="!!mn-mang1")


def _sieu_anh_hung(slide, th, inv, idx, kind, info):
    if inv:
        closing = kind == "closing"
        cx = W / 2 if closing else W - 3.0
        s = 2.6 if closing else (2.2 if kind == "cover" else 1.8)
        D.paths(slide, rays(cx, H / 2, 16, 36, 0.05), color=th["inv_accent"], alpha=0.08 if closing else 0.16,
                name="!!sah-tia")
        D.paths(slide, skyline(-0.1, W + 0.1, H + 0.02, 0.4, 1.3, 17), color="0A1A40", alpha=0.7, name="!!sah-pho")
        hero_shield(slide, cx, H / 2 - 0.1, s, 0.13 if closing else 1, "sah-")
        if not closing:
            info["x1"] = min(info["x1"], cx - s - 0.5)
        comic_frame(slide, info, 5)
    else:
        hero_shield(slide, W - 1.45, H - 1.4, 1.1, 0.12, "sah-")


def _khung_truyen(slide, th, inv, idx, kind, info):
    if inv:
        if kind == "closing":
            D.paths(slide, focus_lines(W / 2, H / 2, 4.2, 14, 110, 3), color="FFFFFF", alpha=0.18, name="!!kt-tia")
            return
        x0 = W - 5.4
        A = [(x0, 0.5), (W - 0.5, 0.5), (W - 0.5, 3.35), (x0, 3.75)]
        B = [(x0, 4.0), (x0 + 2.6, 3.7), (x0 + 2.25, H - 0.5), (x0, H - 0.5)]
        C = [(x0 + 2.85, 3.67), (W - 0.5, 3.6), (W - 0.5, H - 0.5), (x0 + 2.5, H - 0.5)]
        D.paths(slide, dot_field(x0, 3.75, 4.9, 3.25, 0.2, 0.075, "bl"), color="FFFFFF", alpha=0.35, name="!!kt-tram")
        D.paths(slide, streaks(x0 + 2.4, 4.2, H - 0.8, 12, 2.0, 21), color="FFFFFF", alpha=0.6, name="!!kt-vet")
        D.paths(slide, C, color=th["inv_accent"], alpha=0.9, name="!!kt-do")
        D.paths(slide, [A, B, C], line_color="FFFFFF", line_w=3, name="!!kt-khung")
        info["x1"] = min(info["x1"], x0 - 0.45)
    else:
        D.paths(slide, [[(W - 1.45, 0.22), (W - 0.95, 0.22), (W - 1.0, 0.58), (W - 1.45, 0.58)],
                        [(W - 0.85, 0.22), (W - 0.3, 0.22), (W - 0.3, 0.58), (W - 0.9, 0.58)]], line_color=th["ink"],
                line_w=1.5, name="!!kt-khung")


MOTIFS.update({
    "toc-do": dict(
        pack="anime", name="Manga · Đường tốc độ", short="Tốc độ",
        desc="Chùm đường tập trung trắng đen kiểu khung hình cao trào trong manga, điểm một vạch đỏ — câu lạc bộ anime, thể thao, hành động.",
        own_inv=True, draw=_toc_do, palette=MANGA),
    "cham-tram": dict(
        pack="anime", name="Comic · Chấm tram & tia nắng", short="Chấm tram",
        desc="Nền đỏ tia nắng vàng, mảng chấm tram ở góc và khung mực dày như bìa truyện tranh Mỹ — sinh động, thiếu nhi, ngoại khóa.",
        own_inv=True, draw=_cham_tram,
        palette=pal(COMIC, inv=["D62839", "A4161A"], inv_ink="FFFFFF", inv_body="FFE3E3", inv_accent="FFD60A")),
    "bum": dict(
        pack="anime", name="Comic · BÙM! POW!", short="BÙM!",
        desc="Vụ nổ răng cưa vàng đỏ viền mực với chữ BÙM!, POW! trên nền xanh — mở màn, câu đố, trò chơi, khoảnh khắc bất ngờ.",
        own_inv=True, draw=_bum,
        palette=pal(COMIC, inv=["1D4ED8", "1E3A8A"], inv_ink="FFFFFF", inv_body="E3EBFF", inv_accent="FFD60A")),
    "bong-thoai": dict(
        pack="anime", name="Bong bóng thoại", short="Bóng thoại",
        desc="Bong bóng lời thoại và bong bóng suy nghĩ viền mực trên nền xanh ngọc — hội thoại, tình huống, tiếng Anh giao tiếp, kể chuyện.",
        own_inv=True, draw=_bong_thoai,
        palette=pal(COMIC, accent="0369A1", accent2="E63946", inv=["0EA5E9", "0369A1"], inv_ink="FFFFFF", inv_body="E0F4FF",
                    inv_accent="FFD60A")),
    "nang-luong": dict(
        pack="anime", name="Shōnen · Hào quang năng lượng", short="Năng lượng",
        desc="Quả cầu sáng giữa hào quang lửa cam vàng, tia sét và tia lửa trên nền tím đêm — sôi động, thi đua, khởi động, chinh phục thử thách.",
        own_inv=True, draw=_nang_luong,
        palette=pal(COMIC, accent="E85D04", accent2="6A0DAD", accent3="FFB703", inv=["14072E", "2E0B52", "3B0F5C"],
                    inv_ink="FFFFFF", inv_body="E9DDF7", inv_accent="FFB703")),
    "hai-tac": dict(
        pack="anime", name="Phiêu lưu · Hải tặc & bản đồ", short="Hải tặc",
        desc="La bàn, đường đi nét đứt và dấu X kho báu trên nền gỗ sẫm, nội dung trên giấy da cũ — phiêu lưu, khám phá, trò chơi tìm kho báu.",
        own_inv=True, draw=_hai_tac,
        palette=dict(bg="F6E9C9", bg2="F1E0B8", ink="2B1D0E", body="4A3520", muted="7A6046", accent="A4161A",
                     accent2="1D3557", accent3="C9A227", card="FFF8E7", card_line="C8A971",
                     inv=["24170A", "3D2A14", "4A3216"], inv_ink="F6E9C9", inv_body="E8D5A8", inv_accent="E9C46A")),
    "mang-nhen": dict(
        pack="anime", name="Mạng nhện · Đô thị về đêm", short="Mạng nhện",
        desc="Mạng nhện giăng từ góc trang trên nền thành phố đêm xanh thẫm, điểm đỏ — hành động, khoa học về loài nhện, chủ đề thành phố.",
        own_inv=True, draw=_mang_nhen,
        palette=pal(COMIC, accent="C1121F", accent2="1D3557", accent3="457B9D", inv=["0A1830", "12305C", "1B3F73"],
                    inv_ink="FFFFFF", inv_body="D6E2F5", inv_accent="E63946")),
    "sieu-anh-hung": dict(
        pack="anime", name="Siêu anh hùng · Khiên tia sét", short="Siêu anh hùng",
        desc="Tấm khiên đỏ viền vàng có tia sét, tia nắng kiểu bìa truyện và phố xá phía dưới — phẩm chất, lòng dũng cảm, tấm gương người tốt việc tốt.",
        own_inv=True, draw=_sieu_anh_hung,
        palette=pal(COMIC, accent="D62828", accent2="1D4ED8", accent3="FFC300", inv=["1E3A8A", "1D4ED8"], inv_ink="FFFFFF",
                    inv_body="E3EBFF", inv_accent="FFD60A")),
    "giap-hud": dict(
        pack="anime", name="Giáp công nghệ · HUD", short="HUD",
        desc="Vòng HUD vàng kim quanh lõi năng lượng xanh lam phát sáng trên nền đỏ sẫm — công nghệ, robot, kỹ thuật, khoa học viễn tưởng.",
        own_inv=True, draw=emblem_draw(hud, halo=True, ca=0.14),
        palette=dict(bg="F7F4F2", bg2="EFEAE6", ink="1A0F0F", body="3D2B2B", muted="6E5A5A", accent="B3121B",
                     accent2="C9A227", accent3="2EC4E6", card="FFFFFF", card_line="E2D6D0",
                     inv=["140606", "3D0B0B", "5C0F12"], inv_ink="FFF6E8", inv_body="F0D9C8", inv_accent="FFC857")),
    "khung-truyen": dict(
        pack="anime", name="Manga · Khung truyện", short="Khung truyện",
        desc="Ba ô khung truyện nét trắng với chấm tram, vệt tốc độ và mảng đỏ trên nền đen — giới thiệu truyện, kể chuyện bằng tranh, câu lạc bộ manga.",
        own_inv=True, draw=_khung_truyen, palette=MANGA),
})


# ============================================================ ký hiệu đầu dòng theo chủ đề
# ký tự đầu dòng theo họa tiết (cần phông Segoe UI Symbol — draw._bullet tự chọn)
BULLET = {"cach-mang": "★", "bua-liem": "★", "vong-lua": "★", "co-bay": "★", "sieu-anh-hung": "★", "ho-chi-minh": "❀",
          "tet": "✿", "hoa-dao": "✿", "dam-sen": "❀", "dong-son": "◆", "hoi-van": "◆", "tho-cam": "◆", "gach-bong": "❖",
          "phao-hoa": "✦", "trung-thu": "✦", "nang-luong": "✦", "hai-tac": "✦", "toc-do": "▶", "khung-truyen": "▶",
          "mach-dien": "▶", "bum": "★"}

for _mid, _b in BULLET.items():
    MOTIFS[_mid]["bullet"] = _b


def by_pack() -> list[tuple[dict, list[str]]]:
    """Danh sách (gói, [mã họa tiết…]) theo thứ tự gói — để cửa sổ/dòng lệnh liệt kê theo gói."""
    return [(pk, [mid for mid, m in MOTIFS.items() if m["pack"] == pk["id"]]) for pk in PACKS]


def check(motif_id: str) -> str:
    """Chuẩn hóa mã họa tiết ('' / 'khong' = không dùng); báo lỗi rõ ràng nếu sai mã."""
    m = (motif_id or "").strip().lower()
    if m in ("", "khong", "không", "none"):
        return ""
    if m not in MOTIFS:
        raise KeyError(f"Không có họa tiết '{motif_id}'. Các họa tiết: {', '.join(MOTIFS)}")
    return m


def apply(th: dict, motif_id: str, use_palette: bool = True) -> dict:
    """Trả về mẫu mới = mẫu gốc + họa tiết (bảng màu của họa tiết nếu use_palette, ký tự đầu dòng theo họa tiết)."""
    mid = check(motif_id)
    if not mid:
        return th
    m = MOTIFS[mid]
    out = dict(th)
    if use_palette and m["palette"]:
        out.update({k: (list(v) if isinstance(v, list) else v) for k, v in m["palette"].items()})
    if m.get("bullet"):
        out["bullet"] = m["bullet"]
    out["motif"] = mid
    out["name"] = f"{th['name']} + {m['short']}"
    return out
