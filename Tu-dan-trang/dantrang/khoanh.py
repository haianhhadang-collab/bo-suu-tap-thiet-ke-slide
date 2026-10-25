"""Ảnh trang trí theo chủ đề (giống web/kho-anh.js).

Dữ liệu: kho-anh/kho-anh.json (sinh bởi kho-anh/cong-cu/tao-kho.py), ảnh chụp trong kho-anh/anh/.
Ảnh chụp hoặc tranh vector làm nền trang bìa, trang chương, trang kết; lớp phủ màu mẫu giữ chữ dễ đọc.
opts["kho_anh"] = {"loai": "khong" | "anh" | "tranh", "goi": "tu-dong" | mã gói}.
"""
from __future__ import annotations

import json
import unicodedata
from pathlib import Path

from . import draw as D
from . import hoavan
from .draw import H, W
from .model import Img

KHO = Path(__file__).resolve().parent.parent / "kho-anh"
# mẫu dựng sẵn -> gói ảnh khi nội dung không gợi ý chủ đề nào
THEME_GOI = {"song-bien": "thien-nhien", "gradient": "vu-tru", "toi-gian": "giao-duc", "nen-toi": "vu-tru", "thanh-lich": "di-san",
             "co-dien": "lich-su", "de-thuong": "truong-hoc", "nghe-thuat": "van-hoa", "thien-nhien": "thien-nhien",
             "chuyen-nghiep": "doi-ngoai", "truyen-tranh": "anime", "manga": "anime"}
# lớp phủ trái -> phải: [độ đục ở mép trái, giữa, mép phải]
PHU = {"anh": {"cover": [0.9, 0.7, 0.2], "section": [0.92, 0.75, 0.15], "closing": [0.8, 0.8, 0.8]},
       "tranh": {"cover": [0.88, 0.6, 0], "section": [0.9, 0.65, 0], "closing": [0.72, 0.72, 0.72]}}
# file .pptx giữ bố cục gốc: chữ có thể nằm bất kỳ đâu nên phủ đều cả trang
PHU_GIU = {"anh": [0.8, 0.8, 0.8], "tranh": [0.62, 0.62, 0.62]}
LOAI = {"khong": "Không dùng", "anh": "Ảnh chụp", "tranh": "Tranh vẽ theo màu mẫu"}
_data = None
_imgs: dict[str, Img] = {}


def data() -> dict | None:
    global _data
    if _data is None:
        f = KHO / "kho-anh.json"
        _data = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    return _data or None


def goi_list() -> list[dict]:
    return (data() or {}).get("goi", [])


def _norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s or "").lower()
    return " " + " ".join("".join(c if c.isalnum() else " " for c in s).split()) + " "


def goi_tu_dong(deck, th) -> str:
    """Gói ảnh tự đoán: họa tiết đang dùng > từ khóa trong nội dung > mẫu thiết kế > thiên nhiên."""
    if th.get("motif") and th["motif"] in hoavan.MOTIFS:
        return hoavan.MOTIFS[th["motif"]]["pack"]
    parts = [(_norm((deck.title or "") + " " + (deck.subtitle or "")), 3), (_norm(" . ".join(s.title or "" for s in deck.slides)), 2),
             (_norm(" . ".join(" . ".join(i.text for i in s.items) for s in deck.slides)), 1)]
    best, best_score = None, 0
    for g in data()["goi"]:
        sc = sum(w * txt.count(" " + kw + " ") for kw in g["tu_khoa"] for txt, w in parts)
        if sc > best_score:
            best, best_score = g["id"], sc
    return best or THEME_GOI.get(th.get("id")) or THEME_GOI.get(th.get("base")) or "thien-nhien"


def check(cfg) -> dict:
    """Chuẩn hóa cấu hình kho ảnh; báo lỗi rõ ràng nếu sai mã."""
    cfg = dict(cfg or {})
    loai = (cfg.get("loai") or "khong").strip().lower()
    if loai not in LOAI:
        raise KeyError(f"Ảnh trang trí '{loai}' không có. Chọn: {', '.join(LOAI)}")
    goi = (cfg.get("goi") or "tu-dong").strip().lower()
    if goi != "tu-dong" and goi not in {g["id"] for g in goi_list()}:
        raise KeyError(f"Không có gói ảnh '{goi}'. Các gói: tu-dong, {', '.join(g['id'] for g in goi_list())}")
    return {"loai": loai, "goi": goi, "dau": cfg.get("dau") or ""}


def plan(deck, th, opts, giu=None) -> dict | None:
    """giu = khung trang (rộng/cao) khi khoác lên file .pptx giữ bố cục gốc; cfg["dau"] = mã ảnh bìa (tùy chọn)."""
    cfg = (opts or {}).get("kho_anh") or {}
    if not data() or cfg.get("loai") not in ("anh", "tranh"):
        return None
    goi = cfg["goi"] if cfg.get("goi") and cfg["goi"] != "tu-dong" else goi_tu_dong(deck, th)
    items = [m for m in data()["muc"] if m["goi"] == goi and m["loai"] == cfg["loai"]]
    k = next((i for i, m in enumerate(items) if m["id"] == cfg.get("dau")), -1)
    if k > 0:
        items.insert(0, items.pop(k))
    return {"loai": cfg["loai"], "goi": goi, "items": items, "n": 0, "giu": giu} if items else None


def _img(aid: str) -> Img | None:
    if aid not in _imgs:
        f = KHO / "anh" / f"{aid}.jpg"
        _imgs[aid] = Img.from_bytes(f.read_bytes(), "jpg") if f.exists() else None
    return _imgs[aid]


def next_art(p, kind):
    """Ảnh cho trang kế tiếp: bìa và trang kết dùng ảnh đầu, các trang chương lần lượt dùng những ảnh còn lại."""
    if not p or kind not in ("cover", "section", "closing"):
        return None
    it = p["items"][0]
    if kind == "section" and len(p["items"]) > 1:
        it = p["items"][1 + p["n"] % (len(p["items"]) - 1)]
        p["n"] += 1
    if it["loai"] == "anh" and _img(it["id"]) is None:  # thiếu file ảnh: dùng trang trí thường
        return None
    return dict(it, giu=p["giu"]) if p.get("giu") else it


def color(th, role: str) -> str:
    if role[0] == "#":
        return role[1:]
    base = {"a": th["inv_accent"], "b": th["accent2"], "c": th["accent3"], "k": th["inv_ink"], "z": "000000"}[role[0]]
    return D.mix(th["inv"][0], base, int(role[1:]) / 100)


def draw(slide, th, kind, it):
    """Vẽ ảnh/tranh nền và lớp phủ; gọi từ decor.paint() thay cho trang trí của mẫu."""
    c0, c1 = th["inv"][0], th["inv"][-1]
    if it["loai"] == "anh":
        img = _img(it["id"])
        pic = D.picture(slide, img, 0, 0, W, H)
        if it.get("giu"):  # trang gốc khác 16:9 (vd 4:3): khung ảnh kéo theo khổ trang, nên cắt ảnh theo khổ thật cho khỏi méo
            r, g = img.ratio, it["giu"]
            c = (1 - g / r) / 2 if r > g else (1 - r / g) / 2
            pic.crop_left, pic.crop_right, pic.crop_top, pic.crop_bottom = (c, c, 0, 0) if r > g else (0, 0, c * 0.6, c * 1.4)
    else:
        for s in it["hinh"]:
            rings = [[(r[i], r[i + 1]) for i in range(0, len(r), 2)] for r in s["p"]]
            col, a = color(th, s["r"]), (s["a"] if s["a"] < 1 else None)
            if s.get("w"):
                D.paths(slide, rings[0], closed=False, line_color=col, line_w=s["w"], line_alpha=a)
            else:
                D.paths(slide, rings if len(rings) > 1 else rings[0], color=col, alpha=a)
    deu = it.get("giu") or kind == "closing"
    D.box(slide, 0, 0, W, H, gradient=[c0, c0, c0] if deu else [c0, c0, c1], angle=0,
          galphas=PHU_GIU[it["loai"]] if it.get("giu") else PHU[it["loai"]][kind], name="!!phu-anh")
    if it["loai"] == "anh":
        D.text(slide, W - 6.4, H - 0.36, 6.1, 0.28, it["ghi_cong"], font=th["body_font"], size=8, color=th["inv_body"],
               align="r", anchor="b", name="!!nguon-anh")
