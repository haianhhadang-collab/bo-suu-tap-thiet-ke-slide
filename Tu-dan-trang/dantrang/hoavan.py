"""Họa tiết theo chủ đề: 61 họa tiết chia 12 gói (lịch sử, văn hóa, lễ hội, thiên nhiên, giáo dục, anime,
trường học, di sản, y tế, vũ trụ, thể thao, đối ngoại) — xem PACKS.

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


def emblem_draw(emblem, wm=None, halo=True, alpha=None, ca=None, inv=None, page=None, k=None, under=None, closing=None):
    """Họa tiết dạng “biểu tượng”: to ở bên phải trang bìa/chương, chìm giữa trang kết, chìm ở góc trang nội dung.
    emblem(slide, cx, cy, s, màu, độ đậm, màu phụ, th, tag) vẽ gọn trong hình vuông tâm (cx, cy), nửa cạnh s;
    độ đậm < 0.3 nghĩa là đang vẽ chìm (chỉ dùng một màu). k: phóng to/thu nhỏ biểu tượng; under: vẽ trước biểu tượng
    (nền sao, Trái Đất…); closing: vẽ riêng trang kết thay cho hình chìm."""
    def draw(slide, th, is_inv, idx, kind, info):
        if is_inv:
            col, c2 = th["inv_accent"], th["inv_ink"]
            if under:
                under(slide, th, kind, info)
            if kind == "closing":
                if closing:
                    closing(slide, th, info)
                else:
                    emblem(slide, W / 2, H / 2, 3.0, col, wm or 0.13, c2, th, "em-")
            else:
                big = kind == "cover"
                cx, s = W - (3.0 if big else 2.5), (2.5 if big else 1.95) * (k or 1)
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


# ============================================================ 6 gói mở rộng: trường học, di sản, y tế, vũ trụ, thể thao, đối ngoại

def ell_arc(cx, cy, rx, ry, rot, a0, a1, n=30):
    out = []
    for i in range(n + 1):
        t = a0 + (a1 - a0) * i / n
        x, y = rx * math.cos(t), ry * math.sin(t)
        out.append((cx + x * math.cos(rot) - y * math.sin(rot), cy + x * math.sin(rot) + y * math.cos(rot)))
    return out


def rect(x, y, w, h):
    return [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]


SMALL = [(0.5 + 0.5 * math.cos(TAU * i / 8), 0.2 * math.sin(TAU * i / 8)) for i in range(8)]   # lá chét nhỏ, ít điểm cho file nhẹ
WIDE = [(x, y * 1.45) for x, y in PETAL]


def glow(slide, cx, cy, r, color, a, name):
    D.box(slide, cx - r, cy - r, 2 * r, 2 * r, kind="ellipse", radial=True, gradient=[color, color], galphas=[a, 0],
          name=name)


def palw(o):
    return {"card": "FFFFFF", **o}


def _mono(a, col):
    """Độ đậm < 0.3 = đang vẽ chìm: mọi màu đổi thành một màu col."""
    return (lambda k: col) if a < 0.3 else (lambda k: k)


def confetti(slide, x0, y0, w, h, n, seed, cols, tag, a=0.9):
    r, by = seeded(seed), [[] for _ in cols]
    for i in range(n):
        by[i % len(cols)].append(rot_rect(x0 + w * r(), y0 + h * r(), 0.08 + 0.08 * r(), 0.035 + 0.03 * r(), TAU * r()))
    for k, g in enumerate(by):
        _p(slide, g, color=cols[k], alpha=a, name=f"!!{tag}giay{k}")


def starfield(slide, x0, y0, w, h, n, seed, col, a, tag):
    r, dots = seeded(seed), []
    for _ in range(n):
        dots.append(circle(x0 + w * r(), y0 + h * r(), 0.008 + 0.022 * r() ** 2, 8))
    D.paths(slide, dots, color=col, alpha=a, name=f"!!{tag}sao")


def sparkle(cx, cy, r):
    return star(cx, cy, r, 4, 0.2)


# ---------- Gói 1. Trường học · Lễ nghi học đường
PACKS.append(dict(id="truong-hoc", name="Trường học · Lễ nghi học đường",
                  desc="Trống trường, hoa phượng, mũ cử nhân, vở ô ly, bảng đen phấn trắng"))


def school_drum(slide, cx, cy, s, col, a, c2, th, tag):
    P, mono, C = U(cx, cy, s), a < 0.3, _mono(a, col)
    yt, yb, rx, ry, bul = -0.36, 0.6, 0.66, 0.19, 0.07
    body = []
    for i in range(13):
        t = i / 12
        body.append((-(rx + bul * math.sin(math.pi * t)), yt + (yb - yt) * t))
    for i in range(21):
        q = math.pi - math.pi * i / 20
        body.append((rx * math.cos(q), yb + ry * math.sin(q)))
    for i in range(12, -1, -1):
        t = i / 12
        body.append((rx + bul * math.sin(math.pi * t), yt + (yb - yt) * t))
    for i in range(21):
        q = math.pi * i / 20
        body.append((rx * math.cos(q), yt + ry * math.sin(q)))
    D.paths(slide, map_r([[(-0.42, 0.72), (-0.64, 0.98)], [(0.42, 0.72), (0.64, 0.98)]], P), closed=False,
            line_color=C("5D4037"), line_w=max(1.5, 5 * s), line_alpha=a, name=f"!!{tag}chan")
    D.paths(slide, [P(p) for p in body], color=C("C62828"), alpha=a, name=f"!!{tag}than")

    def band(yy):
        return [((rx + 0.035) * math.cos(math.pi * i / 20), yy + ry * math.sin(math.pi * i / 20)) for i in range(21)]
    D.paths(slide, map_r([band(-0.22), band(0.44)], P), closed=False, line_color=C("F2B705"), line_w=max(1.2, 4.5 * s),
            line_alpha=a, name=f"!!{tag}dai")
    if not mono:
        studs = []
        for yy in (-0.22, 0.44):
            for i in range(9):
                q = math.pi * (i + 0.5) / 9
                studs.append(circle(rx * math.cos(q), yy + ry * math.sin(q), 0.022, 8))
        D.paths(slide, map_r(studs, P), color="7A4B00", alpha=a, name=f"!!{tag}dinh")
        D.paths(slide, star(*P((0, 0.12)), 0.15 * s), color="F2B705", alpha=a, name=f"!!{tag}sao")
    D.paths(slide, [P(p) for p in ell(0, yt, rx, ry, 0, 48)], color=C("F3E2C0"), alpha=a * 0.5 if mono else a,
            line_color=C("8D2A1E"), line_w=1, line_alpha=a, name=f"!!{tag}mat")
    D.paths(slide, [P(p) for p in ell(0, yt, rx * 0.68, ry * 0.68, 0, 40)], line_color=C("C9A66B"), line_w=1,
            line_alpha=a * 0.6, name=f"!!{tag}mat2")
    sticks = [rot_rect(-0.16, -0.7, 1.2, 0.065, rad(28)), rot_rect(0.16, -0.7, 1.2, 0.065, rad(-28))]
    knobs = [circle(0.37, -0.42, 0.06, 14), circle(-0.37, -0.42, 0.06, 14)]
    D.paths(slide, map_r(sticks + knobs, P), color=C("6D4C41"), alpha=a, name=f"!!{tag}dui")


def balloon(slide, x, y, r, color, tag, sway=0.15):
    D.paths(slide, quad((x, y + r * 1.12), (x + sway, y + r * 2.2), (x - sway * 0.5, y + r * 3.3), 16), closed=False,
            line_color="8A8A8A", line_w=0.9, name=f"!!{tag}day")
    D.paths(slide, ell(x, y, r * 0.84, r, 0, 40), color=color, name=f"!!{tag}bong")
    D.paths(slide, [(x, y + r * 0.98), (x - r * 0.13, y + r * 1.14), (x + r * 0.13, y + r * 1.14)], color=color,
            name=f"!!{tag}nut")
    D.paths(slide, ell(x - r * 0.32, y - r * 0.38, r * 0.12, r * 0.24, rad(30), 20), color="FFFFFF", alpha=0.5,
            name=f"!!{tag}bong-sang")


BALLOON_COLS = ["E53935", "FFC107", "1E88E5", "43A047", "EC407A"]


def fern(x, y, length, ang, bend):
    """Lá kép lông chim (lá phượng): trả về (gân, các lá chét)."""
    c, d = math.cos(ang), math.sin(ang)
    tip = (x + length * c, y + length * d)
    ctrl = (x + length * 0.5 * c - bend * length * d, y + length * 0.5 * d + bend * length * c)
    rib, lf = quad((x, y), ctrl, tip, 16), []
    for i in range(2, len(rib)):
        t = i / 16
        (px, py), (qx, qy) = rib[i], rib[i - 1]
        dr, L = math.atan2(py - qy, px - qx), length * 0.15 * (1 - 0.5 * t)
        lf += [place(SMALL, px, py, L, dr + 1.2), place(SMALL, px, py, L, dr - 1.2)]
    return rib, lf


def phuong_branch(slide, ox, oy, s, dir_, tag, mono=False, col=None, a=1, rot=0.0):
    """Cành phượng: chùm hoa đỏ cam năm cánh (một cánh nhạt), lá kép lông chim."""
    cr, sr = math.cos(rot), math.sin(rot)
    P = lambda p: (ox + dir_ * (p[0] * cr - p[1] * sr) * s, oy + (p[0] * sr + p[1] * cr) * s)
    C = (lambda k: col) if mono else (lambda k: k)
    main = quad((0, -0.1), (1.6, 0.2), (3.7, 1.3))
    subs = [quad((1.3, 0.22), (1.6, 0.85), (2.15, 1.4)), quad((2.6, 0.7), (3.0, 0.35), (3.15, -0.05)),
            quad((3.1, 1.05), (3.45, 1.6), (3.3, 2.05))]
    ribs, leaves = [], []
    for x, y, l, g, b in ((0.5, 0.0, 1.35, -58, 0.12), (0.85, 0.1, 1.45, 80, -0.12), (1.6, 0.4, 1.3, -35, 0.1),
                          (1.9, 1.15, 1.2, 125, 0.1), (2.9, 0.3, 1.15, -100, -0.1), (3.45, 1.15, 1.2, 15, 0.1),
                          (3.3, 1.6, 1.05, 150, -0.1), (2.35, 0.65, 1.1, 68, 0.12), (1.3, 0.25, 1.1, 105, 0.1),
                          (3.2, 2.0, 0.9, 85, -0.1)):
        r, lf = fern(x, y, l, rad(g), b)
        ribs.append(r)
        leaves += lf
    D.paths(slide, [P(p) for p in main], closed=False, line_color=C("4E342E"), line_w=max(1.5, 5 * s), line_alpha=a,
            name=f"!!{tag}canh")
    D.paths(slide, map_r(subs, P), closed=False, line_color=C("5D4037"), line_w=max(1, 3 * s), line_alpha=a,
            name=f"!!{tag}canh2")
    D.paths(slide, map_r(ribs, P), closed=False, line_color=C("558B2F"), line_w=max(0.75, 1.2 * s), line_alpha=a,
            name=f"!!{tag}gan")
    D.paths(slide, map_r(leaves, P), color=C("43A047"), alpha=a * 0.8 if mono else a * 0.92, name=f"!!{tag}la")
    petals, flags, stamens, hearts = [[], [], []], [], [], []
    for k, (fx, fy) in enumerate(((1.95, 1.4), (3.15, -0.05), (3.7, 1.3), (3.3, 2.05), (1.1, 0.18), (2.6, 0.72))):
        for j, (dx, dy) in enumerate(((0, 0), (0.28, 0.16), (-0.16, 0.28), (0.12, -0.26))[:3 + k % 2]):
            cx, cy, pr, rt = fx + dx, fy + dy, 0.135, k * 1.3 + j * 0.9
            for m in range(5):
                t = rt + TAU * m / 5
                p = circle(cx + pr * 0.95 * math.cos(t), cy + pr * 0.95 * math.sin(t), pr, 12)
                (flags if m == 0 else petals[(k + j + m) % 3]).append(p)
            for m in range(6):
                t = rt + 0.5 + TAU * m / 6
                stamens.append(quad((cx, cy), (cx + pr * 1.3 * math.cos(t + 0.3), cy + pr * 1.3 * math.sin(t + 0.3)),
                                    (cx + pr * 2.0 * math.cos(t), cy + pr * 2.0 * math.sin(t)), 4))
            hearts.append(circle(cx, cy, pr * 0.35, 8))
    for k, c in enumerate(("E53935", "F4511E", "D84315")):
        D.paths(slide, map_r(petals[k], P), color=C(c), alpha=a, name=f"!!{tag}hoa{k}")
    D.paths(slide, map_r(flags, P), color=C("FFB74D"), alpha=a, name=f"!!{tag}hoaco")
    D.paths(slide, map_r(stamens, P), closed=False, line_color=C("B71C1C"), line_w=0.8, line_alpha=a, name=f"!!{tag}nhuy")
    D.paths(slide, map_r(hearts, P), color=C("B71C1C"), alpha=a, name=f"!!{tag}tam")


def falling_petals(slide, x0, y0, w, h, n, seed, tag):
    r, ps = seeded(seed), []
    for _ in range(n):
        ps.append(ell(x0 + w * r(), y0 + h * r(), 0.11 + 0.05 * r(), 0.075, TAU * r(), 20))
    D.paths(slide, ps, color="FF7043", alpha=0.9, name=f"!!{tag}roi")


def grad_cap(slide, cx, cy, s, col, a, c2, th, tag):
    P, C, ang = U(cx, cy, s), _mono(a, col), rad(-14)
    c, d = math.cos(ang), math.sin(ang)
    at = lambda t: (-0.1 + t * c, 0.66 + t * d)
    D.paths(slide, [P(p) for p in rot_rect(-0.1, 0.66, 1.3, 0.22, ang)], color=C("FFF8E7"), alpha=a,
            line_color=C("C9A227"), line_w=1.2, line_alpha=a, name=f"!!{tag}bang")
    D.paths(slide, map_r([ell(*at(0.65), 0.045, 0.11, ang, 20), ell(*at(-0.65), 0.045, 0.11, ang, 20)], P),
            color=C("EFE2C0"), alpha=a, line_color=C("C9A227"), line_w=1, line_alpha=a, name=f"!!{tag}bang2")
    rx, ry = at(0.05)
    D.paths(slide, map_r([rot_rect(rx, ry, 0.13, 0.26, ang),
                          [(rx - 0.03, ry + 0.1), (rx - 0.12, ry + 0.38), (rx - 0.02, ry + 0.33), (rx + 0.03, ry + 0.4),
                           (rx + 0.04, ry + 0.1)]], P), color=C("C62828"), alpha=a, name=f"!!{tag}no")
    skull = [(-0.5, -0.12), (-0.5, 0.26)] + quad((-0.5, 0.26), (0, 0.48), (0.5, 0.26), 14) + [(0.5, -0.12)]
    D.paths(slide, [P(p) for p in skull], color=C("141B33"), alpha=a, name=f"!!{tag}mu")
    D.paths(slide, [P(p) for p in ((-1.0, -0.3), (0, 0.08), (1.0, -0.3), (1.0, -0.23), (0, 0.15), (-1.0, -0.23))],
            color=C("0B1022"), alpha=a, name=f"!!{tag}day")
    D.paths(slide, [P(p) for p in ((-1.0, -0.3), (0, -0.68), (1.0, -0.3), (0, 0.08))], color=C("263159"), alpha=a,
            line_color=C("3B4A80"), line_w=1, line_alpha=a, name=f"!!{tag}mat")
    D.paths(slide, [P(p) for p in circle(0, -0.3, 0.05, 14)], color=C("F2B705"), alpha=a, name=f"!!{tag}nut")
    D.paths(slide, [P(p) for p in ((0, -0.3), (0.7, -0.33), (0.72, 0.12))], closed=False, line_color=C("F2B705"),
            line_w=max(1, 2.4 * s), line_alpha=a, name=f"!!{tag}day-tua")
    D.paths(slide, map_r([[(0.67, 0.1), (0.77, 0.1), (0.83, 0.52), (0.61, 0.52)], rect(0.65, 0.08, 0.14, 0.07)], P),
            color=C("F2B705"), alpha=a, name=f"!!{tag}tua")


def pencil(slide, x, y, length, w, ang, tag):
    """Bút chì: đầu chì ở (x, y), thân hướng theo ang."""
    c, d = math.cos(ang), math.sin(ang)
    at = lambda t: (x + t * c, y + t * d)
    nx, ny = -d, c
    side = lambda p, k: (p[0] + nx * k, p[1] + ny * k)
    tip_l, h = w * 1.7, w / 2
    e1, e2 = length - w * 1.3, length - w * 0.75
    D.paths(slide, [at(0), side(at(tip_l), h), side(at(tip_l), -h)], color="F3D2A2", name=f"!!{tag}go")
    D.paths(slide, [at(0), side(at(tip_l * 0.38), h * 0.38), side(at(tip_l * 0.38), -h * 0.38)], color="37474F",
            name=f"!!{tag}chi")
    D.paths(slide, [side(at(tip_l), h), side(at(e1), h), side(at(e1), -h), side(at(tip_l), -h)], color="F9C80E",
            name=f"!!{tag}than")
    D.paths(slide, [side(at(tip_l), h * 0.33), side(at(e1), h * 0.33), side(at(e1), -h * 0.33), side(at(tip_l), -h * 0.33)],
            color="E0A800", alpha=0.6, name=f"!!{tag}canh")
    D.paths(slide, [side(at(e1), h), side(at(e2), h), side(at(e2), -h), side(at(e1), -h)], color="B0BEC5",
            name=f"!!{tag}dai")
    D.paths(slide, [side(at(e2), h), side(at(length), h * 0.9), side(at(length), -h * 0.9), side(at(e2), -h)],
            color="F48FB1", name=f"!!{tag}tay")


def notebook_grid(slide, a, xm, tag):
    """Vở ô ly: ô vuông 0,4 inch, mỗi ô chia 4 dòng ly, lề đỏ ở xm."""
    thin, thick = [], []
    k = 1
    while k * 0.1 < H:
        (thin if k % 4 else thick).append([(0, k * 0.1), (W, k * 0.1)])
        k += 1
    x = xm + 0.4
    while x < W:
        thick.append([(x, 0), (x, H)])
        x += 0.4
    D.paths(slide, thin, closed=False, line_color="8E7CC3", line_w=0.5, line_alpha=a * 0.55, name=f"!!{tag}ly")
    D.paths(slide, thick, closed=False, line_color="7E57C2", line_w=0.9, line_alpha=a, name=f"!!{tag}o")
    D.paths(slide, [[(xm, 0), (xm, H)]], closed=False, line_color="E53935", line_w=1.4, line_alpha=0.8, name=f"!!{tag}le")


def board_frame(slide, w, tag):
    D.box(slide, w / 2, w / 2, W - w, H - w, line_color="8B5A2B", line_w=w * 72, name=f"!!{tag}khung")
    D.box(slide, w, w, W - 2 * w, H - 2 * w, line_color="5D3A1A", line_w=1.5, line_alpha=0.8, name=f"!!{tag}khung2")
    D.box(slide, w * 0.25, w * 0.25, W - w * 0.5, H - w * 0.5, line_color="B07A45", line_w=1, line_alpha=0.7,
          name=f"!!{tag}khung3")


CHALK = dict(font="Segoe Print", align="l", anchor="m")     # chữ phấn viết tay


def _kg_inv(slide, th, kind, info):
    if kind == "closing":
        balloon(slide, 1.2, 1.1, 0.42, BALLOON_COLS[0], "kg1-")
        balloon(slide, 1.9, 1.6, 0.34, BALLOON_COLS[1], "kg2-")
        balloon(slide, W - 1.3, 1.2, 0.42, BALLOON_COLS[2], "kg3-")
        balloon(slide, W - 2.0, 1.7, 0.32, BALLOON_COLS[3], "kg4-")
    elif kind == "cover":
        balloon(slide, W - 0.8, 1.05, 0.45, BALLOON_COLS[0], "kg1-")
        balloon(slide, W - 1.55, 0.75, 0.36, BALLOON_COLS[1], "kg2-", -0.12)
        balloon(slide, W - 5.35, 0.95, 0.38, BALLOON_COLS[3], "kg3-")
        balloon(slide, W - 4.8, 0.6, 0.3, BALLOON_COLS[4], "kg4-", -0.1)
    else:
        balloon(slide, W - 0.75, 1.0, 0.36, BALLOON_COLS[0], "kg1-")


def _kg_page(slide, th, info):
    balloon(slide, W - 0.55, 0.42, 0.17, BALLOON_COLS[0], "kg1-", 0.05)
    balloon(slide, W - 0.95, 0.5, 0.14, BALLOON_COLS[1], "kg2-", -0.04)


def _hoa_phuong(slide, th, inv, idx, kind, info):
    if inv:
        if kind == "closing":
            phuong_branch(slide, W + 0.05, -0.1, 1.0, -1, "ph1-")
            phuong_branch(slide, -0.05, H - 2.6, 0.85, 1, "ph2-")
            falling_petals(slide, W / 2 - 2, H - 1.4, 4, 1.0, 8, 5, "ph-")
        else:
            big = kind == "cover"
            phuong_branch(slide, W + 0.1, -0.15, 1.45 if big else 1.15, -1, "ph1-", False, None, 1, rad(32))
            falling_petals(slide, W - 4.4, H - 1.9, 3.9, 1.5, 10 if big else 7, 3 + idx, "ph-")
            info["x1"] = min(info["x1"], W - (4.6 if big else 3.7))
    else:
        phuong_branch(slide, W + 0.05, 0.02, 0.42, -1, "ph-")


def _tn_inv(slide, th, kind, info):
    cl = kind == "closing"
    confetti(slide, 0.6 if cl else W - 6.2, 0.3, W - 1.2 if cl else 5.9, 1.6 if cl else 2.0, 40 if cl else 26, 9,
             ["F2C94C", "FFFFFF", "E57373"], "tn-", 0.85)


def _tn_page(slide, th, info):
    confetti(slide, W - 1.6, 0.15, 1.4, 0.45, 9, 4, ["C9A227", "1F3A93", "C62828"], "tn-", 0.8)


def _vo_o_ly(slide, th, inv, idx, kind, info):
    xm = 1.05
    notebook_grid(slide, 0.45 if inv else 0.3, xm, "ol-")
    info["x0"] = max(info["x0"], xm + 0.35)
    if inv:
        rings, holes = [], []
        y = 0.4
        while y < H - 0.2:
            holes.append(circle(0.42, y, 0.075, 16))
            rings.append(quad((0.06, y + 0.04), (0.2, y - 0.16), (0.44, y - 0.02), 10))
            y += 0.48
        D.paths(slide, holes, color="CFC8B8", name="!!ol-lo")
        D.paths(slide, rings, closed=False, line_color="6B6B6B", line_w=3, name="!!ol-xoan")
        if kind != "closing":
            pencil(slide, W - 3.6, H - 0.75, 3.1, 0.26, rad(-12), "ol-but-")
            info["y1"] = min(info["y1"], H - 1.4)


def _bang_den(slide, th, inv, idx, kind, info):
    w = 0.26 if inv else 0.16
    D.paths(slide, [ell(W * 0.3, H * 0.35, 2.6, 0.9, rad(-8), 40), ell(W * 0.72, H * 0.7, 2.2, 0.7, rad(6), 40)],
            color="FFFFFF", alpha=0.035, name="!!bd-vet")
    board_frame(slide, w, "bd-")
    D.box(slide, W * 0.55, H - w - 0.16, W * 0.4, 0.16, color="6D4422", name="!!bd-mang")
    D.paths(slide, [rot_rect(W * 0.62, H - w - 0.21, 0.42, 0.09, rad(-4)), rot_rect(W * 0.69, H - w - 0.2, 0.3, 0.09, rad(3))],
            color="FFFFFF", alpha=0.9, name="!!bd-phan")
    D.paths(slide, [rot_rect(W * 0.74, H - w - 0.2, 0.34, 0.09, rad(-2))], color="F6E58D", name="!!bd-phan2")
    D.paths(slide, [rot_rect(W * 0.79, H - w - 0.2, 0.26, 0.09, rad(5))], color="F8A5C2", name="!!bd-phan3")
    D.box(slide, W * 0.84, H - w - 0.3, 0.62, 0.2, color="C8B89A", name="!!bd-lau")
    D.box(slide, W * 0.84, H - w - 0.14, 0.62, 0.05, color="3E3E3E", name="!!bd-lau2")
    info.update(x0=max(info["x0"], w + 0.55), y0=max(info["y0"], w + 0.4), x1=min(info["x1"], W - w - 0.55),
                y1=min(info["y1"], H - w - 0.55))
    if inv and kind != "closing":
        x = W - 4.4
        D.text(slide, x, 0.75, 3.8, 0.8, "a² + b² = c²", size=30, color="E8EEE4", name="!!bd-ct1", **CHALK)
        D.text(slide, x + 0.4, 1.7, 3.4, 0.7, "S = π · r²", size=24, color="F6E58D", name="!!bd-ct2", **CHALK)
        D.text(slide, x + 0.1, 2.55, 3.6, 0.7, "H₂O  →  H₂ + O₂", size=22, color="9AD0EC", name="!!bd-ct3", **CHALK)
        D.paths(slide, quad((x + 0.1, 1.48), (x + 1.8, 1.62), (x + 3.4, 1.45), 16), closed=False, line_color="E8EEE4",
                line_w=2, line_alpha=0.7, name="!!bd-gach")
        D.paths(slide, star(W - 1.4, 4.3, 0.5, 5, 0.42), line_color="F8A5C2", line_w=2.5, line_alpha=0.85, name="!!bd-sao")
        sun = [circle(W - 3.3, 4.6, 0.32, 24)]
        for i in range(10):
            t = TAU * i / 10
            sun.append([(W - 3.3 + 0.45 * math.cos(t), 4.6 + 0.45 * math.sin(t)),
                        (W - 3.3 + 0.65 * math.cos(t), 4.6 + 0.65 * math.sin(t))])
        D.paths(slide, sun, closed=False, line_color="F6E58D", line_w=2, line_alpha=0.75, name="!!bd-mattroi")
        info["x1"] = min(info["x1"], x - 0.4)


# ---------- Gói 2. Di sản · Kiến trúc Việt
PACKS.append(dict(id="di-san", name="Di sản · Kiến trúc Việt", desc="Khuê Văn Các, chùa Một Cột, mái đình ngói vảy cá, nón lá"))


def curved_roof(cx, y, w, h, k):
    """Mái cong kiểu đình chùa: đáy mái ở y, nửa rộng w, cao h, đầu đao vểnh lên k."""
    return (quad((cx - w - k * 0.6, y - k), (cx - w * 0.78, y + h * 0.1), (cx - w * 0.45, y), 10)
            + quad((cx + w * 0.45, y), (cx + w * 0.78, y + h * 0.1), (cx + w + k * 0.6, y - k), 10)
            + quad((cx + w + k * 0.6, y - k), (cx + w * 0.62, y - h * 0.5), (cx + w * 0.5, y - h), 10)
            + quad((cx - w * 0.5, y - h), (cx - w * 0.62, y - h * 0.5), (cx - w - k * 0.6, y - k), 10))


def ridge_curls(cx, y, w, h):
    return [spiral(cx - w * 0.5 - 0.02, y - h - 0.05, 0.06, 1.1, -1, 0, 16),
            spiral(cx + w * 0.5 + 0.02, y - h - 0.05, 0.06, 1.1, 1, math.pi, 16)]


def khue_van_cac(slide, cx, cy, s, col, a, c2, th, tag):
    P, lw = U(cx, cy, s), max(1, 1.8 * s)
    F = dict(color=col, alpha=a * 0.16, line_color=col, line_w=lw, line_alpha=a)
    R = dict(color=col, alpha=a * 0.5, line_color=col, line_w=lw, line_alpha=a)
    D.paths(slide, map_r([rect(-0.84, 0.86, 1.68, 0.08), rect(-0.66, 0.22, 0.26, 0.64), rect(0.4, 0.22, 0.26, 0.64),
                          rect(-0.7, 0.16, 0.34, 0.07), rect(0.36, 0.16, 0.34, 0.07)], P), name=f"!!{tag}tru", **F)
    D.paths(slide, map_r([[(-0.6, 0.4), (-0.46, 0.4)], [(0.46, 0.4), (0.6, 0.4)], [(-0.6, 0.62), (-0.46, 0.62)],
                          [(0.46, 0.62), (0.6, 0.62)]], P), closed=False, line_color=col, line_w=1, line_alpha=a * 0.7,
            name=f"!!{tag}gach")
    D.paths(slide, [P(p) for p in curved_roof(0, 0.17, 0.8, 0.19, 0.12)], name=f"!!{tag}mai1", **R)
    D.paths(slide, [P(p) for p in rect(-0.42, -0.45, 0.84, 0.47)], name=f"!!{tag}gac", **F)
    lat = [[(-0.3, -0.45), (-0.3, -0.02)], [(0.3, -0.45), (0.3, -0.02)], [(-0.42, -0.09), (0.42, -0.09)]]
    x = -0.38
    while x <= 0.39:
        lat.append([(x, -0.09), (x, -0.02)])
        x += 0.08
    D.paths(slide, map_r(lat, P), closed=False, line_color=col, line_w=1, line_alpha=a * 0.8, name=f"!!{tag}lan")
    win = [circle(0, -0.27, 0.15, 36)]
    for i in range(16):
        t = TAU * i / 16
        win.append([(0.045 * math.cos(t), -0.27 + 0.045 * math.sin(t)), (0.14 * math.cos(t), -0.27 + 0.14 * math.sin(t))])
    D.paths(slide, map_r(win, P), closed=False, line_color=col, line_w=max(1, 1.3 * s), line_alpha=a, name=f"!!{tag}cuaso")
    D.paths(slide, [P(p) for p in circle(0, -0.27, 0.04, 14)], color=col, alpha=a, name=f"!!{tag}tam")
    D.paths(slide, [P(p) for p in curved_roof(0, -0.43, 0.64, 0.25, 0.13)], name=f"!!{tag}mai2", **R)
    D.paths(slide, map_r(ridge_curls(0, -0.43, 0.64, 0.25), P), closed=False, line_color=col, line_w=lw, line_alpha=a,
            name=f"!!{tag}dau")
    D.paths(slide, [P(p) for p in circle(0, -0.74, 0.04, 14)], color=col, alpha=a, name=f"!!{tag}ngoc")


def chua_mot_cot(slide, cx, cy, s, col, a, c2, th, tag):
    P, lw = U(cx, cy, s), max(1, 1.8 * s)
    F = dict(color=col, alpha=a * 0.16, line_color=col, line_w=lw, line_alpha=a)
    R = dict(color=col, alpha=a * 0.5, line_color=col, line_w=lw, line_alpha=a)
    D.paths(slide, [P(p) for p in rect(-0.98, 0.74, 1.96, 0.2)], color=col, alpha=a * 0.14, name=f"!!{tag}ho")
    waves = []
    for x, y in ((-0.7, 0.82), (-0.2, 0.88), (0.35, 0.81), (0.7, 0.89)):
        waves.append([(x + 0.28 * (i / 12), y + 0.015 * math.sin((i / 12) * TAU * 1.5)) for i in range(13)])
    D.paths(slide, map_r(waves, P), closed=False, line_color=col, line_w=1, line_alpha=a * 0.7, name=f"!!{tag}song")
    D.paths(slide, map_r([ell(-0.62, 0.79, 0.15, 0.04, 0, 24), ell(0.6, 0.85, 0.12, 0.035, 0, 24)], P), color=col,
            alpha=a * 0.55, name=f"!!{tag}lasen")
    D.paths(slide, [P(p) for p in rect(-0.085, 0.13, 0.17, 0.64)], name=f"!!{tag}cot", **F)
    D.paths(slide, map_r([[(0, 0.44), (-0.5, 0.15)], [(0, 0.44), (0.5, 0.15)], [(0, 0.3), (-0.3, 0.15)],
                          [(0, 0.3), (0.3, 0.15)]], P), closed=False, line_color=col, line_w=lw, line_alpha=a,
            name=f"!!{tag}xa")
    D.paths(slide, [P(p) for p in rect(-0.56, 0.09, 1.12, 0.07)], name=f"!!{tag}san", **F)
    D.paths(slide, [P(p) for p in rect(-0.36, -0.22, 0.72, 0.31)], name=f"!!{tag}tuong", **F)
    rail = [[(-0.5, 0.0), (0.5, 0.0)]]
    x = -0.48
    while x <= 0.49:
        rail.append([(x, 0.0), (x, 0.09)])
        x += 0.12
    x = -0.27
    while x <= 0.28:
        rail.append([(x, -0.2), (x, -0.03)])
        x += 0.09
    D.paths(slide, map_r(rail, P), closed=False, line_color=col, line_w=1, line_alpha=a * 0.85, name=f"!!{tag}lan")
    D.paths(slide, [P(p) for p in curved_roof(0, -0.2, 0.62, 0.3, 0.17)], name=f"!!{tag}mai", **R)
    D.paths(slide, map_r([quad((-0.33, -0.52), (-0.22, -0.7), (-0.08, -0.6), 10),
                          quad((0.33, -0.52), (0.22, -0.7), (0.08, -0.6), 10)], P), closed=False, line_color=col,
            line_w=lw, line_alpha=a, name=f"!!{tag}rong")
    D.paths(slide, [P(p) for p in circle(0, -0.62, 0.05, 16)], color=col, alpha=a, name=f"!!{tag}trang")


def roof_band(slide, hh, col, a, tag):
    """Dải mái đình ngói vảy cá chạy ngang đầu trang, hai đầu đao vểnh; cao hh ở giữa. Trả về mép dưới."""
    edge = 1.7 * hh / 1.2

    def eave(x):
        dd = max(0, abs(x - W / 2) - (W / 2 - edge)) / edge
        return hh - hh * 0.5 * dd * dd
    r, bw = max(0.07, hh * 0.11), max(0.05, hh * 0.11)
    scales = []
    k, y = 0, -r * 0.4
    while y < hh:
        x = r if k % 2 else 0
        while x < W + r:
            if y + r * 0.85 < eave(x):
                scales.append(arc(x, y, r, 0, math.pi, 7))
            x += 2 * r
        k += 1
        y += r * 0.82
    _p(slide, scales, color=col, alpha=a * 0.28, line_color=col, line_w=0.75, line_alpha=a * 0.8, name=f"!!{tag}ngoi")
    top, bot = [], []
    for i in range(61):
        x = W * i / 60
        top.append((x, eave(x)))
        bot.insert(0, (x, eave(x) + bw))
    D.paths(slide, top + bot, color=col, alpha=a, name=f"!!{tag}diem")
    tri = []
    x = 0.35
    while x < W - 0.2:
        y = eave(x) + bw
        tri.append([(x - 0.07, y), (x + 0.07, y), (x, y + bw * 1.1)])
        x += 0.3
    D.paths(slide, tri, color=col, alpha=a * 0.6, name=f"!!{tag}rua")
    horns = [quad((edge * 0.9, eave(edge * 0.9) + bw * 0.5), (edge * 0.25, eave(edge * 0.25)),
                  (hh * 0.12, max(0.05, eave(0) - hh * 0.55)), 14),
             quad((W - edge * 0.9, eave(W - edge * 0.9) + bw * 0.5), (W - edge * 0.25, eave(W - edge * 0.25)),
                  (W - hh * 0.12, max(0.05, eave(W) - hh * 0.55)), 14)]
    D.paths(slide, horns, closed=False, line_color=col, line_w=max(2, hh * 9), line_alpha=a, name=f"!!{tag}dao")
    ty, rr = max(0.05, eave(0) - hh * 0.55), max(0.06, hh * 0.17)
    D.paths(slide, [spiral(hh * 0.12 + rr * 0.9, ty + rr * 0.2, rr, 1.2, 1, math.pi, 18),
                    spiral(W - hh * 0.12 - rr * 0.9, ty + rr * 0.2, rr, 1.2, -1, 0, 18)], closed=False, line_color=col,
            line_w=max(1.5, hh * 5), line_alpha=a, name=f"!!{tag}cuon")
    return hh + bw * 2.2


def non_la(slide, cx, cy, s, col, a, c2, th, tag):
    mono, C, rot = a < 0.3, _mono(a, col), rad(-9)
    c, d = math.cos(rot), math.sin(rot)
    P = lambda p: (cx + (p[0] * c - p[1] * d) * s, cy + (p[0] * d + p[1] * c) * s)
    w, base, apex, ry = 1.0, 0.22, -0.72, 0.17
    lower = []
    for i in range(25):
        q = math.pi - math.pi * i / 24
        lower.append((w * math.cos(q), base + ry * math.sin(q)))
    left = quad((0, apex), (-w * 0.56, apex + 0.42), (-w, base), 12)[1:]
    right = quad((w, base), (w * 0.56, apex + 0.42), (0, apex), 12)[1:]
    hat = [(0, apex)] + left + lower + right
    D.paths(slide, [P(p) for p in quad((-0.52, base + 0.1), (-0.05, 1.12), (0.5, base + 0.1), 18)], closed=False,
            line_color=C("D81B60"), line_w=max(1.5, 4 * s), line_alpha=a, name=f"!!{tag}quai")
    D.paths(slide, [P(p) for p in hat], color=C("EAD49B"), alpha=a * 0.6 if mono else a, line_color=C("8A6A2F"),
            line_w=1.2, line_alpha=a, name=f"!!{tag}non")
    if not mono:
        D.paths(slide, [P(p) for p in [(0, apex)] + lower[12:] + right], color="B8934A", alpha=a * 0.45,
                name=f"!!{tag}bong")
    ribs = []
    for f in (0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92):
        y = apex + (base - apex) * f
        ribs.append([(w * f * math.cos(math.pi * i / 16), y + ry * f * math.sin(math.pi * i / 16)) for i in range(17)])
    D.paths(slide, map_r(ribs, P), closed=False, line_color=C("8A6A2F"), line_w=0.9, line_alpha=a * 0.75,
            name=f"!!{tag}vanh")
    D.paths(slide, [P(p) for p in lower], closed=False, line_color=C("7A5A22"), line_w=max(1.2, 3 * s), line_alpha=a,
            name=f"!!{tag}vien")


def _kvc_inv(slide, th, kind, info):
    D.box(slide, 0.45, 0.45, W - 0.9, H - 0.9, line_color=th["inv_accent"], line_w=0.75, line_alpha=0.4, name="!!kvc-khung")


def _kvc_page(slide, th, info):
    D.box(slide, 0, 0, W, 0.07, color=th["accent"], name="!!kvc-bang")


def _cmc_page(slide, th, info):
    D.box(slide, 0, H - 0.07, W, 0.07, color=th["accent"], name="!!cmc-bang")


def _mai_dinh(slide, th, inv, idx, kind, info):
    if inv:
        h = roof_band(slide, 1.0 if kind == "closing" else 1.25, th["inv_accent"], 0.75, "md-")
        D.box(slide, 0.6, H - 0.42, W - 1.2, 0.035, color=th["inv_accent"], alpha=0.6, name="!!md-nen")
        info["y0"] = max(info["y0"], h + 0.3)
        info["y1"] = min(info["y1"], H - 0.65)
    else:
        h = roof_band(slide, 0.42, th["accent"], 0.55, "md-")
        info["y0"] = max(info["y0"], h + 0.15)


# ---------- Gói 3. Y tế · Sức khỏe
PACKS.append(dict(id="y-te", name="Y tế · Sức khỏe", desc="Nhịp tim, chuỗi ADN, tế bào, chữ thập y tế xanh"))


def heart_pts(cx, cy, s, n=64):
    out = []
    for i in range(n):
        t = TAU * i / n
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        out.append((cx + x / 17 * s, cy - (y + 2) / 17 * s))
    return out


BEAT = [(0, 0), (0.16, 0), (0.2, -0.12), (0.24, 0), (0.31, 0), (0.34, 0.16), (0.39, -1), (0.44, 0.42), (0.48, 0),
        (0.6, 0), (0.68, -0.22), (0.76, 0), (1, 0)]


def ecg(x0, x1, y, amp, period):
    """Đường điện tim lặp lại từ x0 tới x1."""
    pts, x = [], x0
    while x < x1:
        for u, v in BEAT:
            xx = x + u * period
            if xx <= x1 + 1e-6:
                pts.append((xx, y + v * amp))
        x += period
    return pts


def heart_beat(slide, cx, cy, s, col, a, c2, th, tag):
    P, mono, C = U(cx, cy, s), a < 0.3, _mono(a, col)
    D.paths(slide, [P(p) for p in heart_pts(0, 0, 0.85)], color=C("E63950"), alpha=a * 0.6 if mono else a,
            line_color=C("B0173A"), line_w=max(1, 2 * s), line_alpha=a, name=f"!!{tag}tim")
    if not mono:
        D.paths(slide, [P(p) for p in ell(-0.38, -0.32, 0.12, 0.22, rad(35), 24)], color="FFFFFF", alpha=0.35,
                name=f"!!{tag}sang")
    D.paths(slide, [P(p) for p in ecg(-1.15, 1.15, 0.02, 0.5, 1.15)], closed=False, line_color=C("FFFFFF"),
            line_w=max(1.5, 3.5 * s), line_alpha=a, name=f"!!{tag}nhip")


def helix(slide, cx, cy, s, col, a, c2, th, tag):
    rot = rad(22)
    c, d = math.cos(rot), math.sin(rot)
    P = lambda p: (cx + (p[0] * c - p[1] * d) * s, cy + (p[0] * d + p[1] * c) * s)
    mono, k, amp = a < 0.3, 3.3, 0.42
    front, back, rungs = [[], []], [[], []], [[], [], [], []]
    sx = lambda y, ph: amp * math.sin(k * y + ph)
    dz = lambda y, ph: math.cos(k * y + ph)
    for j, ph in enumerate((0, math.pi)):
        cur, cur_f = None, None
        for i in range(121):
            y = -1 + 2 * i / 120
            f = dz(y, ph) > 0
            if cur_f != f:
                cur = []
                (front if f else back)[j].append(cur)
                if i:
                    cur.append((sx(y - 2 / 120, ph), y - 2 / 120))
                cur_f = f
            cur.append((sx(y, ph), y))
    for i in range(18):
        y = -0.94 + i * 0.11
        rungs[i % 4].append([(sx(y, 0), y), (sx(y, math.pi), y)])
    cols = [col] * 4 if mono else ["EF476F", "FFD166", "06D6A0", "4CC9F0"]
    lw = max(2, 7 * s)
    strand = col if mono else (th.get("inv_ink") or "FFFFFF")
    for j in (0, 1):
        _p(slide, map_r(back[j], P), closed=False, line_color=strand, line_w=lw, line_alpha=a * 0.45, name=f"!!{tag}sau{j}")
    for i, g in enumerate(rungs):
        D.paths(slide, map_r(g, P), closed=False, line_color=cols[i], line_w=max(1.5, 4 * s), line_alpha=a * 0.9,
                name=f"!!{tag}bac{i}")
    for j in (0, 1):
        _p(slide, map_r(front[j], P), closed=False, line_color=strand if j else (col if mono else "7FDBFF"), line_w=lw,
           line_alpha=a, name=f"!!{tag}truoc{j}")


def blob(cx, cy, r, seed, n=40, wob=0.08):
    rr = seeded(seed)
    k = [(v - 0.5) * 2 * wob for v in (rr(), rr(), rr())]
    out = []
    for i in range(n):
        t = TAU * i / n
        q = r * (1 + k[0] * math.sin(2 * t) + k[1] * math.cos(3 * t + 1) + k[2] * math.sin(5 * t))
        out.append((cx + q * math.cos(t), cy + q * math.sin(t)))
    return out


def cells(slide, cx, cy, s, col, a, c2, th, tag):
    P, C = U(cx, cy, s), _mono(a, col)
    small = ((0.66, -0.62, 0.2, 3), (0.74, 0.58, 0.16, 5), (-0.78, -0.72, 0.12, 8), (-0.8, 0.72, 0.1, 2))
    D.paths(slide, [[P(p) for p in blob(x, y, r, sd)] for x, y, r, sd in small], color=C("80CBC4"), alpha=a * 0.45,
            line_color=C("26A69A"), line_w=max(1, 1.6 * s), line_alpha=a, name=f"!!{tag}nho")
    D.paths(slide, [[P(p) for p in circle(x + r * 0.15, y - r * 0.1, r * 0.33, 16)] for x, y, r, _ in small],
            color=C("7E57C2"), alpha=a * 0.8, name=f"!!{tag}nho-nhan")
    D.paths(slide, [P(p) for p in blob(-0.08, 0.05, 0.66, 11, 56)], color=C("B2DFDB"), alpha=a * 0.55,
            line_color=C("26A69A"), line_w=max(1.5, 4 * s), line_alpha=a, name=f"!!{tag}mang")
    er = [[(x + 0.012 * math.sin(i * 1.4), y) for i, (x, y) in enumerate(arc(-0.02, 0.0, r, rad(110), rad(250), 20))]
          for r in (0.3, 0.38, 0.46)]
    D.paths(slide, map_r(er, P), closed=False, line_color=C("4DB6AC"), line_w=1.2, line_alpha=a * 0.8, name=f"!!{tag}luoi")
    D.paths(slide, [P(p) for p in circle(0.02, -0.02, 0.24, 40)], color=C("9575CD"), alpha=a * 0.85,
            line_color=C("5E35B1"), line_w=1.2, line_alpha=a, name=f"!!{tag}nhan")
    D.paths(slide, [P(p) for p in circle(0.08, -0.07, 0.08, 20)], color=C("4527A0"), alpha=a, name=f"!!{tag}hachnhan")
    mito = ((0.36, 0.3, rad(30)), (-0.42, 0.25, rad(-50)), (0.3, -0.38, rad(70)))
    D.paths(slide, [[P(p) for p in ell(x, y, 0.12, 0.055, g, 24)] for x, y, g in mito], color=C("FF8A65"), alpha=a,
            line_color=C("E64A19"), line_w=1, line_alpha=a, name=f"!!{tag}ti")
    zz = []
    for x, y, g in mito:
        ring = []
        for i in range(7):
            u, v = -0.09 + 0.03 * i, (0.03 if i % 2 else -0.03)
            ring.append(P((x + u * math.cos(g) - v * math.sin(g), y + u * math.sin(g) + v * math.cos(g))))
        zz.append(ring)
    D.paths(slide, zz, closed=False, line_color=C("BF360C"), line_w=0.8, line_alpha=a, name=f"!!{tag}ti2")
    ves = [circle(x, y, r, 12) for x, y, r in ((-0.35, -0.32, 0.04), (0.48, -0.05, 0.035), (-0.2, 0.48, 0.045),
                                               (0.12, 0.5, 0.03), (-0.52, -0.05, 0.03))]
    D.paths(slide, map_r(ves, P), color=C("FFD54F"), alpha=a, name=f"!!{tag}bong")


def capsule(cx, cy, length, w, ang):
    r = w / 2
    L = length / 2 - r
    half1 = arc(-L, 0, r, rad(90), rad(270), 12) + [(0, -r), (0, r)]
    half2 = arc(L, 0, r, rad(-90), rad(90), 12) + [(0, r), (0, -r)]
    return [place(hh, cx, cy, 1, ang) for hh in (half1, half2)]


def plus_shape(cx, cy, L, Wd):
    return [(cx - Wd, cy - L), (cx + Wd, cy - L), (cx + Wd, cy - Wd), (cx + L, cy - Wd), (cx + L, cy + Wd),
            (cx + Wd, cy + Wd), (cx + Wd, cy + L), (cx - Wd, cy + L), (cx - Wd, cy + Wd), (cx - L, cy + Wd),
            (cx - L, cy - Wd), (cx - Wd, cy - Wd)]


def med_cross(slide, cx, cy, s, col, a, c2, th, tag):
    P, mono, C = U(cx, cy, s), a < 0.3, _mono(a, col)
    D.paths(slide, [P(p) for p in circle(0, 0, 0.9, 64)], color=C("FFFFFF"), alpha=a * 0.3 if mono else a * 0.12,
            line_color=C("0FA3A3"), line_w=max(1.5, 4 * s), line_alpha=a, name=f"!!{tag}vong")
    D.paths(slide, [P(p) for p in circle(0, 0, 0.78, 64)], line_color=C("7FE0D5"), line_w=1, line_alpha=a * 0.6,
            name=f"!!{tag}vong2")
    D.paths(slide, [P(p) for p in plus_shape(0, 0, 0.42, 0.15)], color=C("12B886"), alpha=a, name=f"!!{tag}chuthap")
    caps = capsule(0.5, -0.5, 0.36, 0.13, rad(-45))
    D.paths(slide, [P(p) for p in caps[0]], color=C("FF6B6B"), alpha=a, name=f"!!{tag}thuoc1")
    D.paths(slide, [P(p) for p in caps[1]], color=C("FFFFFF"), alpha=a, line_color=C("FF6B6B"), line_w=1, line_alpha=a,
            name=f"!!{tag}thuoc2")
    D.paths(slide, [P(p) for p in circle(-0.5, 0.5, 0.11, 24)], color=C("FFD166"), alpha=a, name=f"!!{tag}vien")
    D.paths(slide, [P(p) for p in ((-0.58, 0.5), (-0.42, 0.5))], closed=False, line_color=C("E0A100"), line_w=1.2,
            line_alpha=a, name=f"!!{tag}vien2")
    drop = quad((-0.5, -0.66), (-0.66, -0.4), (-0.5, -0.36), 10) + quad((-0.5, -0.36), (-0.34, -0.4), (-0.5, -0.66), 10)
    D.paths(slide, [P(p) for p in drop], color=C("4CC9F0"), alpha=a, name=f"!!{tag}giot")
    D.paths(slide, [P(p) for p in heart_pts(0.5, 0.48, 0.12, 32)], color=C("E63950"), alpha=a, name=f"!!{tag}tim")


def plus_field(slide, x, y, cols, rows, step, size, col, a, tag):
    """Lưới dấu cộng nhỏ dần về bên trái-dưới, neo ở góc trên phải (x, y)."""
    out = []
    for i in range(cols):
        for j in range(rows):
            t = 1 - math.hypot(i / cols, j / rows) / 1.1
            if t > 0.1:
                out.append(plus_shape(x - i * step, y + j * step, size * t, size * t * 0.32))
    D.paths(slide, out, color=col, alpha=a, name=f"!!{tag}cong")


MED = dict(bg="F4FAFA", bg2="ECF6F6", ink="0F2D3A", body="2E4A57", muted="5E7885", card="FFFFFF", card_line="D2E8EA")


def _nt_inv(slide, th, kind, info):
    y = H - 1.2 if kind == "closing" else H - 1.05
    pts = ecg(-0.3, W + 0.3, y, 0.55, 2.7)
    D.paths(slide, pts, closed=False, line_color=th["inv_accent"], line_w=9, line_alpha=0.15, name="!!nt-sang")
    D.paths(slide, pts, closed=False, line_color=th["inv_accent"], line_w=2.25, line_alpha=0.9, name="!!nt-duong")
    info["y1"] = min(info["y1"], y - 0.8)


def _nt_page(slide, th, info):
    D.paths(slide, ecg(W - 3.3, W - 0.35, 0.45, 0.22, 1.5), closed=False, line_color=th["accent2"], line_w=1.5,
            line_alpha=0.75, name="!!nt-duong")


def _ct_page(slide, th, info):
    plus_field(slide, W - 0.35, 0.3, 7, 3, 0.26, 0.07, th["accent2"], 0.45, "ct-")


# ---------- Gói 4. Vũ trụ · Khám phá
PACKS.append(dict(id="vu-tru", name="Vũ trụ · Khám phá", desc="Hành tinh vành đai, chòm sao Bắc Đẩu, tên lửa, vệ tinh"))


def planet(slide, cx, cy, R, a, tag, mono, col=None):
    rot, rx, ry, lw = rad(-16), R * 2.05, R * 0.48, max(1.2, R * 8)
    ring = col if mono else "FFE8B0"
    D.paths(slide, ell_arc(cx, cy, rx, ry, rot, math.pi, TAU, 36), closed=False, line_color=ring, line_w=lw,
            line_alpha=a * 0.75, name=f"!!{tag}vanh-sau")
    D.paths(slide, ell_arc(cx, cy, rx * 1.12, ry * 1.12, rot, math.pi, TAU, 36), closed=False, line_color=ring,
            line_w=lw * 0.3, line_alpha=a * 0.5, name=f"!!{tag}vanh-sau2")
    if mono:
        D.box(slide, cx - R, cy - R, 2 * R, 2 * R, kind="ellipse", color=col, alpha=a, name=f"!!{tag}cau")
    else:
        D.box(slide, cx - R, cy - R, 2 * R, 2 * R, kind="ellipse", gradient=["F6BD60", "E76F51"], angle=60,
              name=f"!!{tag}cau")
    bands = [ell_arc(cx, cy + k * R, math.sqrt(1 - k * k) * R * 0.98, R * 0.1, 0, 0, math.pi, 20) for k in (-0.45, -0.1, 0.3)]
    D.paths(slide, bands, closed=False, line_color=col if mono else "B5513A", line_w=max(1, R * 5),
            line_alpha=a * 0.5 if mono else 0.35, name=f"!!{tag}soc")
    D.paths(slide, ell_arc(cx, cy, rx, ry, rot, 0, math.pi, 36), closed=False, line_color=ring, line_w=lw,
            line_alpha=a * 0.9, name=f"!!{tag}vanh")
    D.paths(slide, ell_arc(cx, cy, rx * 1.12, ry * 1.12, rot, 0, math.pi, 36), closed=False, line_color=ring,
            line_w=lw * 0.3, line_alpha=a * 0.6, name=f"!!{tag}vanh2")


def moon(slide, x, y, r, tag):
    D.box(slide, x - r, y - r, 2 * r, 2 * r, kind="ellipse", color="D9DCE6", name=f"!!{tag}trang")
    D.paths(slide, [circle(x - r * 0.3, y - r * 0.2, r * 0.22, 14), circle(x + r * 0.35, y + r * 0.25, r * 0.16, 12),
                    circle(x + r * 0.1, y - r * 0.5, r * 0.1, 10)], color="AEB3C2", name=f"!!{tag}ho")


DIPPER = [(0.0, 0.3), (0.24, 0.18), (0.45, 0.2), (0.66, 0.28), (0.7, 0.52), (1.0, 0.55), (1.02, 0.25)]


def dipper(slide, ox, oy, s, col, a, tag, big):
    """Chòm sao Bắc Đẩu và đường dẫn tới sao Bắc Cực."""
    P = lambda p: (ox + p[0] * s, oy + p[1] * s)
    pts, polaris = [P(p) for p in DIPPER], P((1.09, -0.72))
    D.paths(slide, [pts[:5] + [pts[5], pts[6], pts[3]]], closed=False, line_color=col, line_w=1.5 if big else 1,
            line_alpha=a * 0.6, name=f"!!{tag}net")
    guide = []
    for i in range(9):
        t0, t1 = i / 9, (i + 0.5) / 9
        guide.append([(pts[6][0] + (polaris[0] - pts[6][0]) * t0, pts[6][1] + (polaris[1] - pts[6][1]) * t0),
                      (pts[6][0] + (polaris[0] - pts[6][0]) * t1, pts[6][1] + (polaris[1] - pts[6][1]) * t1)])
    D.paths(slide, guide, closed=False, line_color=col, line_w=0.9, line_alpha=a * 0.35, name=f"!!{tag}dan")
    if big:
        for i, (x, y) in enumerate(pts + [polaris]):
            glow(slide, x, y, 0.45 if i == 7 else 0.28, col, 0.35, f"!!{tag}hao{i}")
    D.paths(slide, [sparkle(x, y, (0.11 if big else 0.05) * (1.2 if i in (5, 6) else 1)) for i, (x, y) in enumerate(pts)],
            color=col, alpha=a, name=f"!!{tag}sao")
    D.paths(slide, sparkle(*polaris, 0.2 if big else 0.08), color="FFFFFF" if big else col, alpha=a, name=f"!!{tag}bacdau")


def rocket(slide, cx, cy, s, col, a, c2, th, tag):
    mono, C, g = a < 0.3, _mono(a, col), rad(-45)
    c, d = math.cos(g), math.sin(g)
    P = lambda p: (cx + (p[0] * c - p[1] * d) * s, cy + (p[0] * d + p[1] * c) * s)
    if not mono:
        D.paths(slide, [[P(p) for p in circle(x, y, r, 20)] for x, y, r in ((-1.28, 0.06, 0.15), (-1.5, -0.06, 0.18),
                                                                           (-1.78, 0.08, 0.22))],
                color="FFFFFF", alpha=a * 0.45, name=f"!!{tag}khoi")
        D.paths(slide, [P(p) for p in quad((-0.58, -0.15), (-0.85, -0.12), (-1.2, 0), 10) + quad((-1.2, 0), (-0.85, 0.12), (-0.58, 0.15), 10)],
                color="FB8500", alpha=a, name=f"!!{tag}lua")
        D.paths(slide, [P(p) for p in quad((-0.58, -0.08), (-0.75, -0.06), (-0.95, 0), 8) + quad((-0.95, 0), (-0.75, 0.06), (-0.58, 0.08), 8)],
                color="FFD166", alpha=a, name=f"!!{tag}lua2")
    fins = [[(-0.3, -0.21), (-0.72, -0.5), (-0.62, -0.17)], [(-0.3, 0.21), (-0.72, 0.5), (-0.62, 0.17)]]
    D.paths(slide, map_r(fins, P), color=C("E63946"), alpha=a, name=f"!!{tag}canh")
    body = ([(-0.62, -0.17), (0.32, -0.22)] + quad((0.32, -0.22), (0.62, -0.16), (0.78, 0), 10)
            + quad((0.78, 0), (0.62, 0.16), (0.32, 0.22), 10) + [(-0.62, 0.17)])
    D.paths(slide, [P(p) for p in body], color=C("F1F5F9"), alpha=a * 0.7 if mono else a, line_color=C("94A3B8"),
            line_w=1, line_alpha=a, name=f"!!{tag}than")
    nose = [(0.42, -0.205)] + quad((0.42, -0.205), (0.64, -0.15), (0.78, 0), 8) + quad((0.78, 0), (0.64, 0.15), (0.42, 0.205), 8)
    D.paths(slide, [P(p) for p in nose], color=C("E63946"), alpha=a, name=f"!!{tag}mui")
    D.paths(slide, map_r([rect(-0.62, -0.17, 0.08, 0.34)], P), color=C("94A3B8"), alpha=a, name=f"!!{tag}duoi")
    D.paths(slide, [P(p) for p in circle(0.12, 0, 0.11, 24)], color=C("1D3557"), alpha=a, line_color=C("A8DADC"),
            line_w=max(1.5, 3 * s), line_alpha=a, name=f"!!{tag}cuaso")
    if not mono:
        D.paths(slide, [P(p) for p in rot_rect(-0.15, 0, 0.5, 0.07, 0)], color="E63946", alpha=a, name=f"!!{tag}soc")


def satellite(slide, cx, cy, s, col, a, c2, th, tag):
    mono, C, g = a < 0.3, _mono(a, col), rad(-28)
    c, d = math.cos(g), math.sin(g)
    P = lambda p: (cx + (p[0] * c - p[1] * d) * s, cy + (p[0] * d + p[1] * c) * s)
    D.paths(slide, map_r([[(-0.62, 0), (0.62, 0)]], P), closed=False, line_color=C("9AA5B1"), line_w=max(1.2, 3 * s),
            line_alpha=a, name=f"!!{tag}truc")
    D.paths(slide, map_r([rect(-1.0, -0.17, 0.52, 0.34), rect(0.48, -0.17, 0.52, 0.34)], P), color=C("1E4FA3"), alpha=a,
            line_color=C("A9C4F5"), line_w=1, line_alpha=a, name=f"!!{tag}pin")
    grid = []
    for x0 in (-1.0, 0.48):
        for i in range(1, 4):
            grid.append([(x0 + 0.13 * i, -0.17), (x0 + 0.13 * i, 0.17)])
        grid.append([(x0, 0), (x0 + 0.52, 0)])
    D.paths(slide, map_r(grid, P), closed=False, line_color=C("A9C4F5"), line_w=0.8, line_alpha=a * 0.8, name=f"!!{tag}luoi")
    D.paths(slide, [P(p) for p in rect(-0.2, -0.24, 0.4, 0.48)], color=C("D4A017"), alpha=a, line_color=C("8C6A0A"),
            line_w=1, line_alpha=a, name=f"!!{tag}than")
    if not mono:
        D.paths(slide, map_r([[(-0.2, -0.08), (0.2, -0.02)], [(-0.2, 0.1), (0.2, 0.14)]], P), closed=False,
                line_color="FFE38A", line_w=1, line_alpha=a * 0.8, name=f"!!{tag}giay")
    D.paths(slide, [P(p) for p in ell_arc(0, 0.42, 0.2, 0.09, 0, 0, math.pi, 16) + [(0.2, 0.42)]], color=C("E5E7EB"),
            alpha=a, line_color=C("9AA5B1"), line_w=1, line_alpha=a, name=f"!!{tag}chao")
    D.paths(slide, map_r([[(0, 0.24), (0, 0.42)], [(0, 0.42), (0, 0.58)]], P), closed=False, line_color=C("9AA5B1"),
            line_w=1.2, line_alpha=a, name=f"!!{tag}anten")
    D.paths(slide, map_r([arc(0, 0.62, r, rad(55), rad(125), 12) for r in (0.18, 0.3, 0.42)], P), closed=False,
            line_color=C("7DF9FF"), line_w=max(1, 2.2 * s), line_alpha=a * 0.8, name=f"!!{tag}song")


SPACE = dict(bg="F6F7FC", bg2="EEF0F9", ink="141A3A", body="363D63", muted="666C8E", card="FFFFFF", card_line="DDE0EF")


def _hanh_tinh(slide, th, inv, idx, kind, info):
    if inv:
        starfield(slide, 0, 0, W, H, 140 if kind == "closing" else 110, 7 + idx, "FFFFFF", 0.7, "ht-")
        D.paths(slide, [sparkle(W - 5.6, 2.3, 0.12), sparkle(W - 0.7, 5.9, 0.1), sparkle(1.2, 6.6, 0.08),
                        sparkle(W - 2.0, 0.6, 0.09)], color="FFFFFF", alpha=0.9, name="!!ht-lap")
        if kind == "closing":
            planet(slide, W / 2, H / 2, 1.6, 0.14, "ht-", True, th["inv_accent"])
            return
        big = kind == "cover"
        R, cx, cy = (1.25 if big else 0.95), W - (2.9 if big else 2.6), (3.4 if big else H / 2)
        glow(slide, cx, cy, R * 2.2, "F6BD60", 0.18, "!!ht-hao")
        planet(slide, cx, cy, R, 1, "ht-", False)
        if big:
            moon(slide, W - 5.0, 1.35, 0.28, "ht-")
        else:
            moon(slide, W - 1.0, 1.0, 0.2, "ht-")
        info["x1"] = min(info["x1"], W - (5.6 if big else 4.8))
    else:
        planet(slide, W - 0.95, 0.48, 0.17, 1, "ht-", False)
        D.paths(slide, [sparkle(W - 1.6, 0.32, 0.06), sparkle(W - 0.4, 0.95, 0.05)], color=th["accent3"], name="!!ht-lap")


def _chom_sao(slide, th, inv, idx, kind, info):
    if inv:
        starfield(slide, 0, 0, W, H, 170, 3 + idx, "FFFFFF", 0.65, "cs-")
        if kind == "closing":
            dipper(slide, W / 2 - 1.7, 1.6, 3.4, th["inv_accent"], 0.5, "cs-", False)
            return
        big = kind == "cover"
        dipper(slide, W - (4.65 if big else 4.0), 3.45 if big else 3.6, 3.4 if big else 2.8, th["inv_accent"], 0.95, "cs-", True)
        info["x1"] = min(info["x1"], W - (5.2 if big else 4.5))
    else:
        dipper(slide, W - 1.75, 0.2, 1.25, th["accent"], 0.6, "cs-", False)


def _tl_closing(slide, th, info):
    rocket(slide, W - 1.6, 1.5, 0.95, th["inv_accent"], 1, th["inv_ink"], th, "em-")
    rocket(slide, 1.4, H - 1.2, 0.5, th["inv_accent"], 1, th["inv_ink"], th, "em2-")


def _tl_under(slide, th, kind, info):
    starfield(slide, 0, 0, W, H, 70, 11, "FFFFFF", 0.55, "tl-")
    D.paths(slide, [sparkle(W - 1.0, 1.0, 0.12), sparkle(W - 5.2, 0.8, 0.09), sparkle(W - 0.8, 4.8, 0.08)], color="FFFFFF",
            alpha=0.9, name="!!tl-lap")


def _tl_page(slide, th, info):
    D.paths(slide, [sparkle(W - 0.6, 0.42, 0.08), sparkle(W - 1.1, 0.25, 0.05)], color=th["accent3"], name="!!tl-lap")


def _vt_under(slide, th, kind, info):
    starfield(slide, 0, 0, W, H, 90, 21, "FFFFFF", 0.55, "vt-")
    if kind == "closing":
        return
    cx, cy, R = W - 2.2, H + 3.3, 4.55
    D.box(slide, cx - R - 0.3, cy - R - 0.3, 2 * R + 0.6, 2 * R + 0.6, kind="ellipse", radial=True,
          gradient=["7EC8FF", "7EC8FF"], galphas=[0.55, 0], name="!!vt-khiquyen")
    D.box(slide, cx - R, cy - R, 2 * R, 2 * R, kind="ellipse", gradient=["1E88E5", "0D47A1"], angle=90, name="!!vt-traidat")
    D.paths(slide, [blob(cx - 0.5, H - 0.75, 0.42, 4), blob(cx + 1.1, H - 0.5, 0.3, 9), blob(cx - 1.9, H - 0.3, 0.28, 6)],
            color="66BB6A", alpha=0.75, name="!!vt-dat")
    info["y1"] = min(info["y1"], H - 1.2)


# ---------- Gói 5. Thể thao · Thi đua
PACKS.append(dict(id="the-thao", name="Thể thao · Thi đua", desc="Cúp vàng, sân bóng, đường chạy, cờ vua"))


def trophy(slide, cx, cy, s, col, a, c2, th, tag):
    P, mono, C = U(cx, cy, s), a < 0.3, _mono(a, col)
    lw, leaves, stems = max(1.5, 6 * s), [], []
    for sg in (-1, 1):
        path = quad((sg * 0.12, 0.86), (sg * 0.95, 0.6), (sg * 0.82, -0.32), 16)
        stems.append(path)
        for i in range(3, 16, 2):
            (x, y), (qx, qy) = path[i], path[i - 1]
            dr = math.atan2(y - qy, x - qx)
            leaves += [place(PETAL, x, y, 0.22, dr + sg * 0.7), place(PETAL, x, y, 0.2, dr - sg * 0.6)]
    D.paths(slide, map_r(stems, P), closed=False, line_color=C("C98A00"), line_w=max(1, 2 * s), line_alpha=a,
            name=f"!!{tag}cong")
    D.paths(slide, map_r(leaves, P), color=C("E6B422"), alpha=a * 0.9, name=f"!!{tag}la")
    D.paths(slide, map_r([quad((-0.42, -0.6), (-0.88, -0.6), (-0.3, -0.12), 14), quad((0.42, -0.6), (0.88, -0.6), (0.3, -0.12), 14)], P),
            closed=False, line_color=C("C98A00"), line_w=lw, line_alpha=a, name=f"!!{tag}quai")
    bowl = quad((-0.5, -0.72), (-0.52, -0.05), (-0.1, 0.08), 14) + quad((0.1, 0.08), (0.52, -0.05), (0.5, -0.72), 14)
    D.paths(slide, [P(p) for p in bowl], color=C("F2B705"), alpha=a, name=f"!!{tag}cup")
    if not mono:
        shine = quad((-0.36, -0.62), (-0.38, -0.2), (-0.12, -0.02), 10) + quad((-0.18, -0.06), (-0.3, -0.24), (-0.27, -0.62), 10)
        D.paths(slide, [P(p) for p in shine], color="FFE27A", alpha=a * 0.8, name=f"!!{tag}sang")
    D.paths(slide, [P(p) for p in ell(0, -0.72, 0.5, 0.08, 0, 40)], color=C("C98A00"), alpha=a, name=f"!!{tag}mieng")
    D.paths(slide, map_r([rect(-0.07, 0.06, 0.14, 0.3), ell(0, 0.2, 0.13, 0.05, 0, 20),
                          [(-0.32, 0.36), (0.32, 0.36), (0.4, 0.52), (-0.4, 0.52)]], P), color=C("E0A100"), alpha=a,
            name=f"!!{tag}chan")
    D.paths(slide, [P(p) for p in rect(-0.47, 0.52, 0.94, 0.2)], color=C("6D4C41"), alpha=a, name=f"!!{tag}de")
    D.paths(slide, [P(p) for p in rect(-0.25, 0.57, 0.5, 0.1)], color=C("F2B705"), alpha=a, name=f"!!{tag}bien")
    D.paths(slide, star(*P((0, -0.4)), 0.15 * s), color=C("FFFFFF"), alpha=a * 0.6 if mono else a, name=f"!!{tag}sao")


def medal(slide, x, y, r, col, rib, tag):
    D.paths(slide, [[(x - r * 0.9, y - r * 2.6), (x - r * 0.25, y - r * 2.6), (x + r * 0.15, y - r * 0.8), (x - r * 0.45, y - r * 0.8)],
                    [(x + r * 0.9, y - r * 2.6), (x + r * 0.25, y - r * 2.6), (x - r * 0.15, y - r * 0.8), (x + r * 0.45, y - r * 0.8)]],
            color=rib, name=f"!!{tag}day")
    D.paths(slide, circle(x, y, r, 36), color=col, line_color="FFFFFF", line_w=1, line_alpha=0.5, name=f"!!{tag}mat")
    D.paths(slide, star(x, y, r * 0.5), color="FFFFFF", alpha=0.85, name=f"!!{tag}sao")


def football(slide, x, y, r, tag):
    D.box(slide, x - r, y - r, 2 * r, 2 * r, kind="ellipse", color="FFFFFF", line_color="222222", line_w=1, name=f"!!{tag}bong")
    pent = lambda cx, cy, rr, g: star(cx, cy, rr, 5, 0.81, g)
    seams, patches = [], [pent(x, y, r * 0.3, -math.pi / 2)]
    for i in range(5):
        t = -math.pi / 2 + TAU * i / 5
        vx, vy = x + r * 0.3 * math.cos(t), y + r * 0.3 * math.sin(t)
        seams.append([(vx, vy), (x + r * 0.62 * math.cos(t), y + r * 0.62 * math.sin(t))])
        patches.append(pent(x + r * 0.86 * math.cos(t + rad(36)), y + r * 0.86 * math.sin(t + rad(36)), r * 0.2,
                            t + rad(36) + math.pi / 2))
    D.paths(slide, seams, closed=False, line_color="222222", line_w=1, name=f"!!{tag}duong")
    D.paths(slide, patches, color="222222", name=f"!!{tag}mieng")


def pitch(slide, cx, col, a, tag, small=False):
    """Vạch sân bóng: đường giữa sân ở x = cx, vòng cấm bên phải."""
    m, lw = 0.25, (1.2 if small else 2)
    lines = [rect(m, m, W - 2 * m, H - 2 * m) + [(m, m)], [(cx, m), (cx, H - m)], circle(cx, H / 2, 1.45, 60) + [(cx + 1.45, H / 2)]]
    px, gx, sp = W - m - 1.9, W - m - 0.65, W - m - 1.3
    lines += [[(W - m, H / 2 - 2.0), (px, H / 2 - 2.0), (px, H / 2 + 2.0), (W - m, H / 2 + 2.0)],
              [(W - m, H / 2 - 0.9), (gx, H / 2 - 0.9), (gx, H / 2 + 0.9), (W - m, H / 2 + 0.9)]]
    lines += [arc(sp, H / 2, 1.0, rad(127), rad(233), 16), arc(m, m, 0.3, 0, rad(90), 8), arc(m, H - m, 0.3, rad(-90), 0, 8),
              arc(W - m, m, 0.3, rad(90), rad(180), 8), arc(W - m, H - m, 0.3, rad(180), rad(270), 8)]
    D.paths(slide, lines, closed=False, line_color=col, line_w=lw, line_alpha=a, name=f"!!{tag}vach")
    D.paths(slide, [circle(cx, H / 2, 0.06, 10), circle(sp, H / 2, 0.05, 10)], color=col, alpha=a, name=f"!!{tag}cham")


def track(slide, cx, cy, r0, lanes, lw, xl, xt, surf, line_c, tag, nums):
    """Đường chạy: khúc cua phải quanh (cx, cy), thẳng sang trái tới xl (dưới) và xt (trên)."""
    r_out = r0 + lanes * lw
    path = lambda r: [(xl, cy + r)] + arc(cx, cy, r, rad(90), rad(-90), 40) + [(xt, cy - r)]
    D.paths(slide, path(r_out) + path(r0)[::-1], color=surf, name=f"!!{tag}mat")
    D.paths(slide, [path(r0 + k * lw) for k in range(lanes + 1)], closed=False, line_color=line_c, line_w=1.25,
            name=f"!!{tag}lan")
    fx, sq = max(xl + 1.5, W * 0.42), lw / 2
    chk = [rect(fx + c * sq, cy + r0 + k * sq, sq, sq) for k in range(lanes * 2) for c in range(2) if (k + c) % 2 == 0]
    D.paths(slide, chk, color=line_c, name=f"!!{tag}dich")
    if nums:
        for k in range(lanes):
            D.text(slide, xl + 0.55, cy + r0 + k * lw, 0.4, lw, str(k + 1), size=jsround(lw * 40), bold=True, color=line_c,
                   align="c", anchor="m", name=f"!!{tag}so{k}")


KNIGHT = [(-0.38, 0.6), (-0.3, 0.12), (-0.46, -0.02), (-0.62, -0.12), (-0.6, -0.3), (-0.38, -0.5), (-0.2, -0.62),
          (-0.06, -0.86), (0.04, -0.66), (0.22, -0.62), (0.4, -0.38), (0.48, -0.04), (0.42, 0.36), (0.36, 0.6)]


def knight(slide, cx, cy, s, col, a, c2, th, tag):
    P, mono = U(cx, cy, s), a < 0.3
    D.paths(slide, map_r([rect(-0.56, 0.74, 1.12, 0.16), rect(-0.44, 0.6, 0.88, 0.14)], P), color=col, alpha=a,
            name=f"!!{tag}de")
    D.paths(slide, [P(p) for p in KNIGHT], color=col, alpha=a, name=f"!!{tag}ma")
    dark = col if mono else (th["inv"][0] if th.get("inv") else "111111")
    D.paths(slide, map_r([circle(-0.18, -0.36, 0.05, 12)], P), color=dark, alpha=0 if mono else a, name=f"!!{tag}mat")
    mane = []
    for i in range(5):
        t = i / 5
        mane.append([(0.06 + 0.36 * t, -0.6 + 0.5 * t), (0.0 + 0.36 * t, -0.52 + 0.5 * t)])
    D.paths(slide, map_r(mane, P), closed=False, line_color=dark, line_w=max(1, 2 * s), line_alpha=0 if mono else a * 0.6,
            name=f"!!{tag}bom")


def checker(slide, x, y, cols, rows, sq, col, a, tag):
    out = [rect(x + i * sq, y + j * sq, sq, sq) for i in range(cols) for j in range(rows) if (i + j) % 2 == 0]
    D.paths(slide, out, color=col, alpha=a, name=f"!!{tag}o")


def _cv_inv(slide, th, kind, info):
    if kind == "closing":
        confetti(slide, 0.5, 0.3, W - 1, 1.5, 36, 3, ["F5C542", "FFFFFF", "E57373"], "cv-", 0.8)
        return
    confetti(slide, W - 6.0, 0.25, 5.7, 1.6, 24, 5, ["F5C542", "FFFFFF", "E57373"], "cv-", 0.8)
    if kind == "cover":
        medal(slide, W - 5.15, H - 1.0, 0.32, "C0C0C0", "C62828", "cv-m1-")
        medal(slide, W - 0.85, H - 1.0, 0.32, "CD7F32", "1E88E5", "cv-m2-")


def _cv_page(slide, th, info):
    D.paths(slide, [star(W - 0.55, 0.42, 0.14), star(W - 0.95, 0.42, 0.1), star(W - 1.28, 0.42, 0.07)], color=th["accent2"],
            name="!!cv-sao")


def _san_bong(slide, th, inv, idx, kind, info):
    if inv:
        st, x = [], 0
        while x < W:
            st.append(rect(x, 0, 0.9, H))
            x += 1.8
        D.paths(slide, st, color="FFFFFF", alpha=0.06, name="!!sb-soc")
        if kind == "closing":
            pitch(slide, W / 2, "FFFFFF", 0.45, "sb-")
            return
        cx = W - 3.6
        pitch(slide, cx, "FFFFFF", 0.75, "sb-")
        football(slide, cx, H / 2, 0.55 if kind == "cover" else 0.45, "sb-")
        info["x1"] = min(info["x1"], cx - 1.9)
        info.update(x0=max(info["x0"], 0.75), y0=max(info["y0"], 0.7), y1=min(info["y1"], H - 0.7))
    else:
        D.paths(slide, [arc(W, 0, 0.55, rad(90), rad(180), 12)], closed=False, line_color=th["accent"], line_w=1.5,
                line_alpha=0.7, name="!!sb-goc")
        D.paths(slide, [[(W - 0.25, 0.25), (W - 0.25, 0.95)]], closed=False, line_color="6B6B6B", line_w=1.5, name="!!sb-cot")
        D.paths(slide, [(W - 0.25, 0.25), (W - 0.65, 0.38), (W - 0.25, 0.52)], color=th["accent3"], name="!!sb-co")
        football(slide, W - 1.1, 0.42, 0.16, "sb-")


def _duong_chay(slide, th, inv, idx, kind, info):
    if inv:
        if kind == "closing":
            y0, lw = H - 1.6, 0.24
            D.box(slide, -0.1, y0, W + 0.2, lw * 6, color="C8553D", name="!!dc-mat")
            D.paths(slide, [[(-0.1, y0 + k * lw), (W + 0.1, y0 + k * lw)] for k in range(7)], closed=False,
                    line_color="FFFFFF", line_w=1.25, name="!!dc-lan")
            checker(slide, W / 2 - 0.12, y0, 2, 12, lw / 2, "FFFFFF", 1, "dc-")
            info["y1"] = min(info["y1"], y0 - 0.4)
            return
        cy, r0 = 3.75, 2.0
        track(slide, W - 2.6, cy, r0, 6, 0.24, -0.2, W - 5.2, "C8553D", "FFFFFF", "dc-", True)
        info["y1"] = min(info["y1"], cy + r0 - 0.3)
        info["x1"] = min(info["x1"], W - 2.6 - r0 - 0.4)
    else:
        ls = [[(W * 0.55, H - d), (W, H - d)] for d in (0.36, 0.25, 0.14)]
        D.box(slide, W * 0.55, H - 0.36, W * 0.45, 0.33, color=th["accent"], alpha=0.15, name="!!dc-mat")
        D.paths(slide, ls, closed=False, line_color=th["accent"], line_w=1, line_alpha=0.7, name="!!dc-lan")
        checker(slide, W - 0.9, H - 0.36, 2, 6, 0.055, th["ink"], 0.7, "dc-")


def _cvua_inv(slide, th, kind, info):
    checker(slide, 0, H - 0.7, math.ceil(W / 0.35), 2, 0.35, th["inv_accent"], 0.22, "cv-")
    if kind == "closing":
        checker(slide, 0, 0, math.ceil(W / 0.35), 2, 0.35, th["inv_accent"], 0.22, "cv2-")
    info["y1"] = min(info["y1"], H - 1.0)
    if kind == "closing":
        info["y0"] = max(info["y0"], 1.0)


def _cvua_page(slide, th, info):
    checker(slide, W - 1.9, 0.2, 10, 2, 0.16, th["ink"], 0.5, "cv-")


# ---------- Gói 6. Hữu nghị · Đối ngoại
PACKS.append(dict(id="doi-ngoai", name="Hữu nghị · Đối ngoại",
                  desc="Bồ câu hòa bình, hữu nghị Việt Nam – Lào, mạng lưới kết nối, nhịp cầu"))


def dove(slide, cx, cy, s, col, a, c2, th, tag):
    P, C = U(cx, cy, s), _mono(a, col)
    edge = dict(line_color=C("9DB7D5"), line_w=1, line_alpha=a)
    wing_b = [(-0.05, 0.02), (-0.45, -0.52), (-0.3, -0.5), (-0.32, -0.72), (-0.15, -0.6), (-0.08, -0.8), (0.04, -0.58),
              (0.12, -0.7), (0.18, -0.35), (0.18, 0.02)]
    D.paths(slide, [P((x + 0.12, y + 0.04)) for x, y in wing_b], color=C("DCE8F5"), alpha=a, name=f"!!{tag}canh2", **edge)
    tail = [(-0.42, 0.18), (-0.95, 0.06), (-0.9, 0.2), (-1.0, 0.3), (-0.88, 0.36), (-0.92, 0.48), (-0.4, 0.34)]
    D.paths(slide, [P(p) for p in tail], color=C("F4F8FC"), alpha=a, name=f"!!{tag}duoi", **edge)
    D.paths(slide, [P(p) for p in ell(0.02, 0.18, 0.55, 0.2, rad(-12), 48)], color=C("FFFFFF"), alpha=a, name=f"!!{tag}than", **edge)
    D.paths(slide, [P(p) for p in circle(0.52, -0.06, 0.16, 32)], color=C("FFFFFF"), alpha=a, name=f"!!{tag}dau", **edge)
    D.paths(slide, [P(p) for p in ((0.66, -0.1), (0.84, -0.04), (0.66, 0.0))], color=C("F2A541"), alpha=a, name=f"!!{tag}mo")
    D.paths(slide, [P(p) for p in circle(0.56, -0.1, 0.025, 10)], color=C("1D3557"), alpha=a, name=f"!!{tag}mat")
    wing = [(-0.2, 0.08), (-0.62, -0.62), (-0.42, -0.56), (-0.46, -0.84), (-0.24, -0.66), (-0.18, -0.94), (-0.02, -0.66),
            (0.06, -0.82), (0.16, -0.5), (0.22, -0.56), (0.24, -0.2), (0.14, 0.06)]
    D.paths(slide, [P(p) for p in wing], color=C("FFFFFF"), alpha=a, name=f"!!{tag}canh", **edge)
    twig, lv = quad((0.76, -0.03), (0.92, 0.14), (0.98, 0.42), 12), []
    for i, g in ((3, 0.9), (5, -0.9), (7, 0.9), (9, -0.9), (11, 0.5)):
        (x, y), (qx, qy) = twig[i], twig[i - 1]
        lv.append(place(NARROW, x, y, 0.24, math.atan2(y - qy, x - qx) + g))
    D.paths(slide, [P(p) for p in twig], closed=False, line_color=C("5B7F3A"), line_w=max(1, 1.6 * s), line_alpha=a,
            name=f"!!{tag}canh-la")
    D.paths(slide, map_r(lv, P), color=C("7CB342"), alpha=a, name=f"!!{tag}la")


def flag(slide, px, py, w, h, dir_, kind, a, tag, mono=False, col=None):
    """Cờ bay: cán ở (px, py), cờ bay sang trái (dir_=-1) hoặc phải (dir_=1); kind 'vn' hoặc 'lao'."""
    yt = lambda x: 0.06 * h * math.sin(5.5 * abs(x - px) / w + 0.4) * min(1, abs(x - px) / (w * 0.3))
    xs = [px + dir_ * w * i / 20 for i in range(21)]
    band = lambda f0, f1: [(x, py + yt(x) + h * f0) for x in xs] + [(x, py + yt(x) + h * f1) for x in reversed(xs)]
    mid = px + dir_ * w / 2
    cy = py + yt(mid) + h / 2
    if mono:
        D.paths(slide, band(0, 1), color=col, alpha=a, name=f"!!{tag}co")
        return
    if kind == "vn":
        D.paths(slide, band(0, 1), color="DA251D", alpha=a, name=f"!!{tag}nen")
        D.paths(slide, star(mid, cy, h * 0.3), color="FFDD00", alpha=a, name=f"!!{tag}sao")
    else:
        D.paths(slide, [band(0, 0.25), band(0.75, 1)], color="CE1126", alpha=a, name=f"!!{tag}do")
        D.paths(slide, band(0.25, 0.75), color="002868", alpha=a, name=f"!!{tag}xanh")
        D.paths(slide, circle(mid, cy, h * 0.2, 32), color="FFFFFF", alpha=a, name=f"!!{tag}trang")


def champa(slide, x, y, r, rot, tag, mono=False, col=None, a=1):
    """Hoa chăm pa (hoa sứ, hoa đại): năm cánh xoắn chong chóng, tâm vàng."""
    ps = []
    for i in range(5):
        t = rot + TAU * i / 5
        ps.append(place(WIDE, x + r * 0.12 * math.cos(t + 1.4), y + r * 0.12 * math.sin(t + 1.4), r, t))
    D.paths(slide, ps, color=col if mono else "FFFFFF", alpha=a, line_color=col if mono else "E8D9A8", line_w=0.75,
            line_alpha=a, name=f"!!{tag}canh")
    if not mono:
        D.box(slide, x - r * 0.45, y - r * 0.45, r * 0.9, r * 0.9, kind="ellipse", radial=True,
              gradient=["FFC93C", "FFC93C"], galphas=[1, 0], name=f"!!{tag}tam")


def viet_lao(slide, cx, cy, s, col, a, c2, th, tag):
    P, mono, C = U(cx, cy, s), a < 0.3, _mono(a, col)
    D.paths(slide, map_r([[(0.32, 0.95), (-0.42, -0.8)], [(-0.32, 0.95), (0.42, -0.8)]], P), closed=False,
            line_color=C("C9A227"), line_w=max(1.5, 4 * s), line_alpha=a, name=f"!!{tag}can")
    (vx, vy), (lx, ly) = P((-0.42, -0.8)), P((0.42, -0.8))
    flag(slide, vx, vy, 0.66 * s, 0.44 * s, -1, "vn", a, tag + "vn-", mono, col)
    flag(slide, lx, ly, 0.66 * s, 0.44 * s, 1, "lao", a, tag + "lao-", mono, col)
    D.paths(slide, map_r([circle(-0.42, -0.82, 0.045, 12), circle(0.42, -0.82, 0.045, 12)], P), color=C("F2C200"),
            alpha=a, name=f"!!{tag}dauc")
    champa(slide, *P((-0.16, 0.62)), 0.27 * s, 0.3, tag + "h1-", mono, col, a)
    champa(slide, *P((0.2, 0.74)), 0.22 * s, 1.1, tag + "h2-", mono, col, a)
    champa(slide, *P((0.02, 0.38)), 0.17 * s, 2.0, tag + "h3-", mono, col, a)


def net_globe(slide, cx, cy, s, col, a, c2, th, tag):
    P, mono, R, tilt = U(cx, cy, s), a < 0.3, 0.86, rad(18)
    D.paths(slide, [P(p) for p in circle(0, 0, R, 72)], color=col, alpha=a * 0.1, line_color=col, line_w=max(1, 1.8 * s),
            line_alpha=a, name=f"!!{tag}cau")

    def proj(lat, lon):
        x = math.cos(lat) * math.sin(lon)
        y0, z0 = -math.sin(lat), math.cos(lat) * math.cos(lon)
        y, z = y0 * math.cos(tilt) - z0 * math.sin(tilt), y0 * math.sin(tilt) + z0 * math.cos(tilt)
        return (x * R, y * R, z)
    dots, la = [], -75
    while la <= 75:
        lo = -180
        while lo < 180:
            x, y, z = proj(rad(la), rad(lo))
            if z > 0.05:
                dots.append(circle(x, y, 0.012 + 0.016 * z, 8))
            lo += 12
        la += 12.5
    D.paths(slide, map_r(dots, P), color=col, alpha=a * 0.75, name=f"!!{tag}cham")
    nodes = [proj(rad(la_), rad(lo_)) for la_, lo_ in ((20, -40), (35, 25), (-10, 60), (-30, -10), (5, 10), (50, -5), (-15, -65))]
    arcs = []
    for i, j in ((0, 4), (4, 1), (4, 2), (4, 3), (1, 5), (3, 6), (0, 5), (2, 3)):
        A, B = nodes[i], nodes[j]
        m = ((A[0] + B[0]) / 2, (A[1] + B[1]) / 2)
        k = 1.12 + 0.22 * math.hypot(A[0] - B[0], A[1] - B[1]) / R
        arcs.append(quad((A[0], A[1]), (m[0] * k, m[1] * k - 0.06), (B[0], B[1]), 18))
    ac = col if mono else (th.get("inv_ink") or "FFFFFF")
    D.paths(slide, map_r(arcs, P), closed=False, line_color=ac, line_w=max(1, 1.6 * s), line_alpha=a * 0.85, name=f"!!{tag}cung")
    if not mono:
        for i, (x, y, _) in enumerate(nodes):
            glow(slide, *P((x, y)), 0.1 * s, col, 0.6, f"!!{tag}hao{i}")
    D.paths(slide, [[P(p) for p in circle(x, y, 0.035, 12)] for x, y, _ in nodes], color=ac, alpha=a, name=f"!!{tag}nut")


def bridge(slide, x0, x1, deck, rise, col, a, tag, sun=None):
    """Cầu vòm qua mặt nước: vòm từ x0 tới x1, mặt cầu ở deck; sun = màu mặt trời phía sau (hoặc None)."""
    mid, half = (x0 + x1) / 2, (x1 - x0) / 2
    arch_y = lambda x: deck - rise * (1 - ((x - mid) / half) ** 2)
    if sun:
        D.box(slide, mid - 1.4, deck - 1.4, 2.8, 2.8, kind="ellipse", radial=True, gradient=[sun, sun], galphas=[0.45, 0],
              name=f"!!{tag}hao")
        D.paths(slide, arc(mid, deck, 0.85, math.pi, TAU, 30), color=sun, alpha=0.9, name=f"!!{tag}mattroi")
    a1, a2, hang = [], [], []
    for i in range(51):
        x = x0 + (x1 - x0) * i / 50
        a1.append((x, arch_y(x)))
        a2.append((x, arch_y(x) + 0.09))
    x = x0 + 0.35
    while x < x1 - 0.2:
        hang.append([(x, arch_y(x) + 0.09), (x, deck)])
        x += 0.35
    D.paths(slide, a1 + a2[::-1], color=col, alpha=a, name=f"!!{tag}vom")
    D.paths(slide, hang, closed=False, line_color=col, line_w=1, line_alpha=a * 0.8, name=f"!!{tag}day")
    D.box(slide, -0.1, deck, W + 0.2, 0.1, color=col, alpha=a, name=f"!!{tag}mat")
    D.paths(slide, [rect(x0 - 0.12, deck, 0.24, H - deck), rect(x1 - 0.12, deck, 0.24, H - deck)], color=col,
            alpha=a * 0.85, name=f"!!{tag}tru")
    r, wv = seeded(5), []
    for _ in range(26):
        y = deck + 0.25 + (H - deck - 0.3) * r()
        x = W * r()
        L = 0.25 + 0.6 * r()
        wv.append([(x, y), (x + L, y)])
    D.paths(slide, wv, closed=False, line_color=col, line_w=1, line_alpha=a * 0.45, name=f"!!{tag}nuoc")


def _vl_page(slide, th, info):
    flag(slide, W - 1.05, 0.22, 0.42, 0.28, -1, "vn", 1, "vl-vn-", False)
    flag(slide, W - 0.95, 0.22, 0.42, 0.28, 1, "lao", 1, "vl-lao-", False)
    D.paths(slide, [[(W - 1.0, 0.18), (W - 1.0, 0.68)]], closed=False, line_color="C9A227", line_w=1.5, name="!!vl-can")


def _nhip_cau(slide, th, inv, idx, kind, info):
    if inv:
        deck = H - 1.35
        cl = kind == "closing"
        bridge(slide, 1.2 if cl else W * 0.36, W - 1.2 if cl else W - 0.6, deck, 1.7 if cl else 2.2, th["inv_ink"],
               0.35 if cl else 0.8, "nc-", None if cl else th["inv_accent"])
        info["y1"] = min(info["y1"], deck - (1.9 if cl else 0.3))
        if not cl:
            info["x1"] = min(info["x1"], W - 2.2)
    else:
        x0, x1, deck = W - 3.2, W - 0.4, H - 0.35
        mid, half = (x0 + x1) / 2, (x1 - x0) / 2
        pts = []
        for i in range(31):
            x = x0 + (x1 - x0) * i / 30
            pts.append((x, deck - 0.75 * (1 - ((x - mid) / half) ** 2)))
        hang = [[pts[i], (pts[i][0], deck)] for i in range(2, 30, 3)]
        D.paths(slide, [pts, [(x0 - 0.3, deck), (x1 + 0.3, deck)]] + hang, closed=False, line_color=th["accent"],
                line_w=1.2, line_alpha=0.45, name="!!nc-cau")


MOTIFS.update({
    # ----- Trường học · Lễ nghi học đường
    "khai-giang": dict(
        pack="truong-hoc", name="Khai giảng · Trống trường", short="Trống trường",
        desc="Chiếc trống trường đỏ đai vàng, dùi trống bắt chéo và chùm bóng bay trên nền trời xanh — lễ khai giảng, ngày hội đến trường, sự kiện đầu năm học.",
        own_inv=True, draw=emblem_draw(school_drum, inv=_kg_inv, page=_kg_page),
        palette=palw(dict(bg="FFF9F0", bg2="FDF2E3", ink="2A1A12", body="4D3426", muted="7C6455", accent="C62828",
                          accent2="1E88E5", accent3="F2B705", card_line="F1D9C4", inv=["0F3D6E", "1565A8", "1E88E5"],
                          inv_ink="FFFFFF", inv_body="DCEBFA", inv_accent="FFD54F"))),
    "hoa-phuong": dict(
        pack="truong-hoc", name="Hoa phượng · Mùa chia tay", short="Hoa phượng",
        desc="Cành phượng đỏ rực với lá kép lông chim và cánh hoa rơi trên nền xanh ngọc — lễ tổng kết, chia tay cuối cấp, kỷ niệm tuổi học trò, mùa hè.",
        own_inv=True, draw=_hoa_phuong,
        palette=palw(dict(bg="FFF8F2", bg2="FCEFE6", ink="2B1A14", body="4E3329", muted="7E6257", accent="D32F2F",
                          accent2="2E7D32", accent3="F57C00", card_line="F2D6C8", inv=["0E3B3A", "17504D", "1F6360"],
                          inv_ink="FFF8F0", inv_body="D5E8E2", inv_accent="FF8A65"))),
    "tot-nghiep": dict(
        pack="truong-hoc", name="Tốt nghiệp · Mũ cử nhân", short="Mũ cử nhân",
        desc="Mũ cử nhân tua vàng, cuộn bằng thắt nơ đỏ và giấy kim tuyến trên nền xanh than — lễ tốt nghiệp, trao bằng, bảo vệ khóa luận, vinh danh.",
        own_inv=True, draw=emblem_draw(grad_cap, inv=_tn_inv, page=_tn_page),
        palette=palw(dict(bg="F7F6F1", bg2="EFEEE6", ink="141B33", body="363E5C", muted="676E88", accent="1F3A93",
                          accent2="B8860B", accent3="C62828", card_line="DEDCD0", inv=["10162E", "1A2340", "24305E"],
                          inv_ink="FFFDF5", inv_body="D9DDEB", inv_accent="F2C94C"))),
    "vo-o-ly": dict(
        pack="truong-hoc", name="Vở ô ly · Tiểu học", short="Vở ô ly",
        desc="Trang vở ô ly kẻ tím có lề đỏ, gáy lò xo và cây bút chì, chữ xanh như mực học trò — tiểu học, luyện chữ, bài giảng lớp 1 đến lớp 5, phụ huynh.",
        own_inv=True, draw=_vo_o_ly,
        palette=palw(dict(bg="FFFEF8", bg2="FFFDF4", ink="1E2A78", body="2F3A80", muted="6870A8", accent="D32F2F",
                          accent2="7E57C2", accent3="F9A825", card_line="D9D2F0", inv=["FFFDF6", "FBF7EB"],
                          inv_ink="1E2A78", inv_body="3A4590", inv_accent="D32F2F"))),
    "bang-den": dict(
        pack="truong-hoc", name="Bảng đen · Phấn trắng", short="Bảng đen",
        desc="Cả bộ slide như tấm bảng xanh khung gỗ, chữ phấn trắng, phấn màu và công thức viết tay — lớp học, ôn tập, toán, khoa học tự nhiên.",
        own_inv=True, draw=_bang_den,
        palette=palw(dict(bg="264D3B", bg2="23473A", ink="F4F4EC", body="DCE3D6", muted="A9B8AA", accent="F6E58D",
                          accent2="F8A5C2", accent3="9AD0EC", card="2F5A47", card_line="4A7462", inv=["1F3B2D", "24443A"],
                          inv_ink="F5F5EE", inv_body="D8E0D5", inv_accent="F6E58D"))),
    # ----- Di sản · Kiến trúc Việt
    "khue-van-cac": dict(
        pack="di-san", name="Văn Miếu · Khuê Văn Các", short="Khuê Văn Các",
        desc="Khuê Văn Các nét vàng kim với cửa sổ tròn tỏa tia, hai tầng mái cong trên nền đỏ son — khuyến học, ngày Nhà giáo, truyền thống hiếu học, Hà Nội.",
        own_inv=True, draw=emblem_draw(khue_van_cac, inv=_kvc_inv, page=_kvc_page),
        palette=palw(dict(bg="FBF6EA", bg2="F6EEDC", ink="3A1D10", body="5A3A2A", muted="84685A", accent="8E2A1F",
                          accent2="B8892E", accent3="2F5D50", card="FFFCF5", card_line="EAD8B4", inv=["4A0E0E", "6B1717", "7A1F1F"],
                          inv_ink="FFF6E0", inv_body="F1DCB2", inv_accent="E8C26A"))),
    "chua-mot-cot": dict(
        pack="di-san", name="Chùa Một Cột · Hà Nội", short="Chùa Một Cột",
        desc="Chùa Một Cột nét mảnh trên hồ sen vuông, mái cong đầu đao, lưỡng long chầu nguyệt; tông chàm và vàng nhạt — Hà Nội, văn hóa, di tích, du lịch.",
        own_inv=True, draw=emblem_draw(chua_mot_cot, page=_cmc_page),
        palette=palw(dict(bg="F6F3EA", bg2="EEEADF", ink="16243F", body="364763", muted="67748C", accent="24406B",
                          accent2="B08D3C", accent3="9C3D27", card="FFFDF7", card_line="DDD7C6", inv=["121D33", "1C3254", "24406B"],
                          inv_ink="F8F4E8", inv_body="D5DCE8", inv_accent="E9D8A6"))),
    "mai-dinh": dict(
        pack="di-san", name="Mái đình · Ngói vảy cá", short="Mái đình",
        desc="Dải mái đình lợp ngói vảy cá, diềm mái và hai đầu đao cong vút chạy ngang đầu trang — đình làng, lễ hội, văn hóa làng xã, kiến trúc cổ.",
        own_inv=True, draw=_mai_dinh,
        palette=palw(dict(bg="F8F1E5", bg2="F2E9DA", ink="3B2416", body="5A3F2C", muted="86705C", accent="9C3D27",
                          accent2="C9A227", accent3="4E6B3A", card="FFFBF3", card_line="E7D5BC", inv=["3B1D12", "5A2A18", "6E3520"],
                          inv_ink="FFF4E2", inv_body="EBD3B5", inv_accent="E6B85C"))),
    "non-la": dict(
        pack="di-san", name="Nón lá · Hồn Việt", short="Nón lá",
        desc="Chiếc nón lá màu rơm với các vành nan và quai hồng trên nền xanh lúa non — văn hóa Việt Nam, phụ nữ Việt Nam, du lịch, giới thiệu quê hương.",
        own_inv=True, draw=emblem_draw(non_la, ca=0.14),
        palette=palw(dict(bg="FBF7EE", bg2="F5EFE1", ink="2E2416", body="4F4330", muted="7D705B", accent="B23A48",
                          accent2="B8892E", accent3="3B6F4C", card="FFFDF7", card_line="E8DCC2", inv=["1F3D2B", "2E5A3E", "3B6F4C"],
                          inv_ink="FFFBEF", inv_body="DCE8D2", inv_accent="F2D27A"))),
    # ----- Y tế · Sức khỏe
    "nhip-tim": dict(
        pack="y-te", name="Nhịp tim · Tim mạch", short="Nhịp tim",
        desc="Trái tim đỏ có đường điện tim trắng, dải nhịp tim xanh ngọc chạy ngang chân trang — y khoa, tim mạch, sức khỏe cộng đồng, ngày Thầy thuốc 27/2.",
        own_inv=True, draw=emblem_draw(heart_beat, k=0.85, halo=False, inv=_nt_inv, page=_nt_page),
        palette=palw({**MED, "accent": "D7263D", "accent2": "0FA3A3", "accent3": "3D7DD8", "inv": ["0B3142", "0F4C5C", "11616F"],
                      "inv_ink": "F2FBFB", "inv_body": "CDE6EA", "inv_accent": "5EEAD4"})),
    "adn": dict(
        pack="y-te", name="Chuỗi xoắn ADN · Sinh học", short="ADN",
        desc="Chuỗi xoắn kép ADN nghiêng với các bậc nối bốn màu trên nền xanh đêm — sinh học, di truyền, y sinh, công nghệ sinh học, nghiên cứu khoa học.",
        own_inv=True, draw=emblem_draw(helix, halo=True, ca=0.14),
        palette=palw({**MED, "bg": "F5F8FC", "bg2": "EDF2F9", "ink": "0E2240", "body": "33465F", "muted": "62738A",
                      "card_line": "D6E0EE", "accent": "1565C0", "accent2": "06A77D", "accent3": "EF476F",
                      "inv": ["0A1F3A", "102C52", "133B66"], "inv_ink": "F3F8FF", "inv_body": "CFDDF0", "inv_accent": "7FDBFF"})),
    "te-bao": dict(
        pack="y-te", name="Tế bào · Vi sinh", short="Tế bào",
        desc="Tế bào nhân tím, ti thể cam, lưới nội chất và vài tế bào nhỏ quanh đó, nét mềm như hình vẽ sách giáo khoa — sinh học, vi sinh, y học, phòng dịch.",
        own_inv=True, draw=emblem_draw(cells, ca=0.14),
        palette=palw({**MED, "accent": "00897B", "accent2": "7E57C2", "accent3": "FF7043", "inv": ["0E3B3A", "154C49", "1C5F5B"],
                      "inv_ink": "F2FBF9", "inv_body": "CFE7E2", "inv_accent": "B2DFDB"})),
    "chu-thap": dict(
        pack="y-te", name="Chữ thập xanh · Y tế", short="Chữ thập",
        desc="Chữ thập y tế xanh lá trong vòng tròn cùng viên thuốc, giọt nước, trái tim, lưới dấu cộng ở góc trang — bệnh viện, trạm y tế, y tế học đường, nhà thuốc.",
        own_inv=True, draw=emblem_draw(med_cross, halo=True, page=_ct_page),
        palette=palw({**MED, "bg": "F4F8FC", "bg2": "EBF2FA", "card_line": "D3E1EF", "accent": "0B8A6A", "accent2": "1565C0",
                      "accent3": "FF6B6B", "inv": ["0B2E59", "0F4C81", "1565C0"], "inv_ink": "F4F9FF", "inv_body": "D3E3F5",
                      "inv_accent": "8FE3CF"})),
    # ----- Vũ trụ · Khám phá
    "hanh-tinh": dict(
        pack="vu-tru", name="Hành tinh · Vũ trụ", short="Hành tinh",
        desc="Hành tinh cam có vành đai, mặt trăng nhỏ và bầu trời đầy sao trên nền xanh tím thẫm — thiên văn, khoa học tự nhiên, khám phá, ngoại khóa STEM.",
        own_inv=True, draw=_hanh_tinh,
        palette=palw({**SPACE, "accent": "E76F51", "accent2": "3D5A80", "accent3": "F4A261", "inv": ["070B1F", "111A3E", "1C1F4A"],
                      "inv_ink": "F5F6FF", "inv_body": "D3D7F0", "inv_accent": "FFE8B0"})),
    "chom-sao": dict(
        pack="vu-tru", name="Chòm sao · Bắc Đẩu", short="Chòm sao",
        desc="Chòm sao Bắc Đẩu nối nét sáng, đường dẫn tới sao Bắc Cực giữa trời sao xanh đêm — thiên văn, định hướng, mục tiêu, lớp học khoa học.",
        own_inv=True, draw=_chom_sao,
        palette=palw({**SPACE, "accent": "2B59C3", "accent2": "6C8CD5", "accent3": "F2C14E", "inv": ["060B1A", "0C1631", "13234A"],
                      "inv_ink": "F4F7FF", "inv_body": "CCD7EE", "inv_accent": "BFD7FF"})),
    "ten-lua": dict(
        pack="vu-tru", name="Tên lửa · Khởi hành", short="Tên lửa",
        desc="Tên lửa trắng mũi đỏ phóng chéo lên trời, lửa cam và vệt khói giữa trời tím có sao — khởi động dự án, khởi nghiệp, STEM, mục tiêu năm học.",
        own_inv=True, draw=emblem_draw(rocket, halo=False, k=0.9, closing=_tl_closing, under=_tl_under, page=_tl_page),
        palette=palw({**SPACE, "bg": "F7F6FF", "bg2": "EFEDFB", "accent": "5B3FD1", "accent2": "E63946", "accent3": "FFB703",
                      "inv": ["1B1446", "2B1B6B", "3C2A8F"], "inv_ink": "FFFFFF", "inv_body": "DCD6F7", "inv_accent": "FFB703"})),
    "ve-tinh": dict(
        pack="vu-tru", name="Vệ tinh · Viễn thông", short="Vệ tinh",
        desc="Vệ tinh cánh pin xanh, thân vàng phát sóng xuống vầng Trái Đất xanh ở chân trang — viễn thông, chuyển đổi số, công nghệ, địa lý, bản đồ số.",
        own_inv=True, draw=emblem_draw(satellite, halo=False, k=0.95, under=_vt_under),
        palette=palw({**SPACE, "bg": "F4F8FB", "bg2": "EAF1F7", "ink": "0D2233", "body": "304759", "muted": "5F7686",
                      "card_line": "D3E1EC", "accent": "1565C0", "accent2": "00A6C8", "accent3": "D4A017",
                      "inv": ["06121F", "0A1C30", "0D2740"], "inv_ink": "F2F8FF", "inv_body": "CADCEC", "inv_accent": "7DF9FF"})),
    # ----- Thể thao · Thi đua
    "cup-vang": dict(
        pack="the-thao", name="Cúp vàng · Vinh danh", short="Cúp vàng",
        desc="Cúp vàng giữa cành nguyệt quế, huy chương và giấy kim tuyến trên nền xanh hoàng gia — tổng kết thi đua, khen thưởng, vinh danh, giải thưởng.",
        own_inv=True, draw=emblem_draw(trophy, inv=_cv_inv, page=_cv_page),
        palette=palw(dict(bg="F7F5EE", bg2="F0EDE2", ink="142347", body="35436A", muted="666F8D", accent="1B3A7A",
                          accent2="C99700", accent3="C62828", card_line="E1DCCB", inv=["0E1C3D", "14295A", "1B3A7A"],
                          inv_ink="FFFFFF", inv_body="D6DEF0", inv_accent="F5C542"))),
    "san-bong": dict(
        pack="the-thao", name="Sân bóng · Hội khỏe", short="Sân bóng",
        desc="Mặt sân cỏ kẻ sọc với vạch giữa sân, vòng tròn trung tâm, vòng cấm và quả bóng — hội khỏe Phù Đổng, giải bóng đá, thể dục thể thao, tinh thần đồng đội.",
        own_inv=True, draw=_san_bong,
        palette=palw(dict(bg="F4F8F2", bg2="EBF3E8", ink="15301F", body="35503E", muted="637A69", accent="1E8E3E",
                          accent2="E0A100", accent3="E53935", card_line="D5E5D3", inv=["1E6B34", "23803D"],
                          inv_ink="FFFFFF", inv_body="E3F2E3", inv_accent="FFE66D"))),
    "duong-chay": dict(
        pack="the-thao", name="Đường chạy · Về đích", short="Đường chạy",
        desc="Đường chạy điền kinh màu gạch với sáu làn đánh số, khúc cua và vạch đích ca-rô trên nền xanh sân vận động — điền kinh, lộ trình, mục tiêu, nước rút cuối năm.",
        own_inv=True, draw=_duong_chay,
        palette=palw(dict(bg="F7F4EF", bg2="F1ECE4", ink="1A2433", body="3A4656", muted="6A7482", accent="C8553D",
                          accent2="1D4E89", accent3="E9A23B", card_line="E4DACB", inv=["13294B", "1D3C6E", "23497F"],
                          inv_ink="FFFFFF", inv_body="D6E0EE", inv_accent="FFB37A"))),
    "co-vua": dict(
        pack="the-thao", name="Cờ vua · Chiến lược", short="Cờ vua",
        desc="Quân mã vàng đồng trên nền đen than, dải bàn cờ ca-rô ở chân trang — chiến lược, tư duy, ra quyết định, câu lạc bộ cờ vua.",
        own_inv=True, draw=emblem_draw(knight, halo=True, k=0.92, inv=_cvua_inv, page=_cvua_page),
        palette=palw(dict(bg="F6F3EE", bg2="EFEBE4", ink="1C1C1C", body="3D3D3D", muted="6E6E6E", accent="9A6B2F",
                          accent2="1C1C1C", accent3="B23A48", card_line="DED8CE", inv=["141414", "262626"],
                          inv_ink="F5F0E6", inv_body="D6D0C4", inv_accent="D4A85A"))),
    # ----- Hữu nghị · Đối ngoại
    "bo-cau": dict(
        pack="doi-ngoai", name="Bồ câu · Hòa bình", short="Bồ câu",
        desc="Chim bồ câu trắng ngậm cành ô liu bay trên nền xanh dương — hòa bình, hữu nghị, đối ngoại, hợp tác quốc tế, Ngày Quốc tế Hòa bình 21/9.",
        own_inv=True, draw=emblem_draw(dove, ca=0.16),
        palette=palw(dict(bg="F3F8FC", bg2="EAF2FA", ink="0F2747", body="2F4766", muted="5F7590", accent="1565A8",
                          accent2="5B9E3A", accent3="F2A541", card_line="D3E2F0", inv=["0B3C6E", "1565A8", "1E7CC8"],
                          inv_ink="FFFFFF", inv_body="DCEBF8", inv_accent="BFE3FF"))),
    "viet-lao": dict(
        pack="doi-ngoai", name="Hữu nghị Việt Nam – Lào", short="Việt – Lào",
        desc="Cờ Việt Nam và cờ Lào bắt chéo, dưới là chùm hoa chăm pa trắng nhụy vàng trên nền xanh thẫm — quan hệ đặc biệt Việt Nam – Lào, kỷ niệm 5/9 và 18/7, giao lưu hữu nghị.",
        own_inv=True, draw=emblem_draw(viet_lao, halo=True, wm=0.12, page=_vl_page),
        palette=palw(dict(bg="FBF8F2", bg2="F4F0E6", ink="1D2240", body="3D4262", muted="6B6F8A", accent="C8102E",
                          accent2="1B3A86", accent3="D4A017", card_line="E4DFD2", inv=["0E1F4D", "15306E", "1B3A86"],
                          inv_ink="FFFFFF", inv_body="D8E0F2", inv_accent="FFD54F"))),
    "ket-noi": dict(
        pack="doi-ngoai", name="Kết nối toàn cầu · Hội nhập", short="Kết nối",
        desc="Quả cầu chấm điểm với các cung nối sáng giữa nhiều nút mạng trên nền xanh đêm — hội nhập quốc tế, hợp tác đa phương, chuyển đổi số, chuỗi cung ứng.",
        own_inv=True, draw=emblem_draw(net_globe, halo=True, ca=0.16),
        palette=palw(dict(bg="F3F7FB", bg2="EAF1F8", ink="0E2240", body="2F4664", muted="5F7490", accent="0F6CBD",
                          accent2="0FA3A3", accent3="F2A541", card_line="D2DFEC", inv=["0A1A3A", "0F2A5A", "143A73"],
                          inv_ink="FFFFFF", inv_body="D0DDF0", inv_accent="4FD1C5"))),
    "nhip-cau": dict(
        pack="doi-ngoai", name="Nhịp cầu · Hợp tác", short="Nhịp cầu",
        desc="Cây cầu vòm thép vươn qua mặt nước, mặt trời hoàng hôn phía sau trên nền xanh thép — hợp tác, kết nối, hữu nghị, giao thông, hạ tầng, phát triển vùng.",
        own_inv=True, draw=_nhip_cau,
        palette=palw(dict(bg="F5F7FA", bg2="ECF0F5", ink="15233A", body="36465E", muted="66748A", accent="25507F",
                          accent2="E07A3F", accent3="2A9D8F", card_line="D7DEE8", inv=["12263F", "1C3A5E", "25507F"],
                          inv_ink="FFFFFF", inv_body="D6E0EE", inv_accent="F4A261"))),
})


# ============================================================ ký hiệu đầu dòng theo chủ đề
# ký tự đầu dòng theo họa tiết (cần phông Segoe UI Symbol — draw._bullet tự chọn)
BULLET = {"cach-mang": "★", "bua-liem": "★", "vong-lua": "★", "co-bay": "★", "sieu-anh-hung": "★", "ho-chi-minh": "❀",
          "tet": "✿", "hoa-dao": "✿", "dam-sen": "❀", "dong-son": "◆", "hoi-van": "◆", "tho-cam": "◆", "gach-bong": "❖",
          "phao-hoa": "✦", "trung-thu": "✦", "nang-luong": "✦", "hai-tac": "✦", "toc-do": "▶", "khung-truyen": "▶",
          "mach-dien": "▶", "bum": "★",
          "hoa-phuong": "✿", "tot-nghiep": "★", "cup-vang": "★", "viet-lao": "★", "khue-van-cac": "◆", "chua-mot-cot": "◆",
          "mai-dinh": "◆", "non-la": "◆", "hanh-tinh": "✦", "chom-sao": "✦", "ten-lua": "▶", "ve-tinh": "▶", "nhip-tim": "♥",
          "co-vua": "♞", "bo-cau": "❖", "vo-o-ly": "✎", "bang-den": "✎"}

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
