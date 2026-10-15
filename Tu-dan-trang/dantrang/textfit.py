"""Đo chữ bằng chính file phông của Windows để chọn cỡ chữ vừa khung, không tràn."""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from PIL import ImageFont

_DIRS = [Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts",
         Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft/Windows/Fonts"]

# (họ phông, đậm) -> tên file
_FILES = {
    ("segoe ui", False): "segoeui.ttf", ("segoe ui", True): "segoeuib.ttf",
    ("segoe ui black", False): "seguibl.ttf", ("segoe ui black", True): "seguibl.ttf",
    ("segoe ui semibold", False): "seguisb.ttf", ("segoe ui semibold", True): "segoeuib.ttf",
    ("segoe ui light", False): "segoeuil.ttf", ("segoe ui light", True): "seguisb.ttf",
    ("segoe ui semilight", False): "segoeuisl.ttf", ("segoe ui semilight", True): "seguisb.ttf",
    ("candara", False): "Candara.ttf", ("candara", True): "Candarab.ttf",
    ("constantia", False): "constan.ttf", ("constantia", True): "constanb.ttf",
    ("corbel", False): "corbel.ttf", ("corbel", True): "corbelb.ttf",
    ("palatino linotype", False): "pala.ttf", ("palatino linotype", True): "palab.ttf",
    ("cambria", False): "cambria.ttc", ("cambria", True): "cambriab.ttf",
    ("calibri", False): "calibri.ttf", ("calibri", True): "calibrib.ttf",
    ("verdana", False): "verdana.ttf", ("verdana", True): "verdanab.ttf",
    ("tahoma", False): "tahoma.ttf", ("tahoma", True): "tahomabd.ttf",
    ("arial", False): "arial.ttf", ("arial", True): "arialbd.ttf",
    ("times new roman", False): "times.ttf", ("times new roman", True): "timesbd.ttf",
}
_UNIT = 100  # đo ở cỡ 100pt rồi quy đổi


@lru_cache(maxsize=64)
def _font(family: str, bold: bool):
    name = _FILES.get((family.lower(), bold)) or _FILES.get((family.lower(), False))
    cands = [name] if name else []
    cands += [f"{family}.ttf", f"{family.replace(' ', '')}.ttf"]
    for d in _DIRS:
        for c in cands:
            if c and (d / c).exists():
                try:
                    return ImageFont.truetype(str(d / c), _UNIT), 1.0
                except OSError:
                    pass
    # Phông lạ: đo bằng Segoe UI và cộng 8% cho an toàn
    return ImageFont.truetype(str(_DIRS[0] / ("segoeuib.ttf" if bold else "segoeui.ttf")), _UNIT), 1.08


def text_width_pt(text: str, family: str, size: float, bold: bool = False) -> float:
    f, k = _font(family, bold)
    return f.getlength(text) * size / _UNIT * k


def wrap(text: str, family: str, size: float, width_in: float, bold: bool = False) -> list[str]:
    """Ngắt dòng như PowerPoint (theo khoảng trắng). Trả về các dòng."""
    maxw = width_in * 72 * 0.965  # chừa 3,5%: PowerPoint xuống dòng sớm hơn phép đo một chút
    lines: list[str] = []
    for para in text.split("\n"):
        words = para.split(" ")
        cur = ""
        for w in words:
            trial = (cur + " " + w) if cur else w
            if text_width_pt(trial, family, size, bold) <= maxw:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                # từ dài hơn cả dòng: để nguyên (PowerPoint sẽ bẻ)
                while text_width_pt(w, family, size, bold) > maxw and len(w) > 4:
                    cut = len(w)
                    while cut > 1 and text_width_pt(w[:cut], family, size, bold) > maxw:
                        cut -= 1
                    lines.append(w[:cut])
                    w = w[cut:]
                cur = w
        lines.append(cur)
    return lines


def n_lines(text: str, family: str, size: float, width_in: float, bold: bool = False) -> int:
    return len(wrap(text, family, size, width_in, bold))


def height_in(text: str, family: str, size: float, width_in: float, bold: bool = False,
              spacing: float = 1.2) -> float:
    return n_lines(text, family, size, width_in, bold) * size * spacing / 72


def fit_size(text: str, family: str, width_in: float, height: float, sizes, bold=False,
             spacing=1.2, max_lines: int | None = None) -> float | None:
    for s in sizes:
        n = n_lines(text, family, s, width_in, bold)
        if max_lines and n > max_lines:
            continue
        if n * s * spacing / 72 <= height:
            return s
    return None


def longest_word_fits(text: str, family: str, size: float, width_in: float, bold=False) -> bool:
    return all(text_width_pt(w, family, size, bold) <= width_in * 72 for w in text.split())
