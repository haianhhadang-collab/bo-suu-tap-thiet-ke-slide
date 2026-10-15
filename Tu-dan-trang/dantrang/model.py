"""Mô hình nội dung chung cho mọi loại file đầu vào."""
from __future__ import annotations

import io
import re
from dataclasses import dataclass, field

from PIL import Image


@dataclass
class Item:
    text: str
    kind: str = "bullet"   # bullet | para | head | chip | card | quote
    level: int = 0
    label: str = ""         # tiêu đề nhỏ của thẻ (card)


@dataclass
class Img:
    data: bytes
    ext: str = "png"
    w: int = 0
    h: int = 0
    caption: str = ""
    diagram: bool = False   # sơ đồ/ảnh nền trắng: đặt vừa khung thay vì cắt

    @classmethod
    def from_bytes(cls, data: bytes, ext: str = "", caption: str = "") -> "Img | None":
        try:
            im = Image.open(io.BytesIO(data))
            im.load()
        except Exception:
            return None
        fmt = (im.format or ext or "png").lower()
        if fmt in ("wmf", "emf", "tiff", "bmp", "gif", "mpo") or fmt not in ("png", "jpeg", "jpg"):
            out = io.BytesIO()
            im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB").save(out, "PNG")
            data, fmt = out.getvalue(), "png"
        w, h = im.size
        small = im.convert("RGB").resize((64, 64))
        px = list(small.getdata())
        light = sum(1 for p in px if min(p) > 225) / len(px)
        colors = len(set((r // 8, g // 8, b // 8) for r, g, b in px))
        # sơ đồ, mã QR, hình vẽ: ít màu hoặc nền trắng => không được cắt xén
        return cls(data=data, ext="jpg" if fmt == "jpeg" else fmt, w=w, h=h,
                   caption=caption, diagram=light > 0.5 or colors < 260)

    @property
    def ratio(self) -> float:
        return (self.w / self.h) if self.w and self.h else 1.5


@dataclass
class Slide:
    title: str = ""
    subtitle: str = ""
    items: list[Item] = field(default_factory=list)
    images: list[Img] = field(default_factory=list)
    table: list[list[str]] | None = None
    notes: str = ""
    source: str = ""
    hint: str = ""          # cover | section | closing | "" (tự nhận diện)
    cont: bool = False      # trang tiếp theo của một trang bị tách


@dataclass
class Deck:
    title: str = ""
    subtitle: str = ""
    meta: list[str] = field(default_factory=list)
    slides: list[Slide] = field(default_factory=list)
    cover_notes: str = ""


BULLET_RE = re.compile(r"^\s*(?:[•●▪■◦○◆\-–—\*·►▶✓✔→]|\d{1,2}[\.\)])\s+")


def clean(text: str) -> str:
    text = text.replace("\u000b", " ").replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def strip_bullet(text: str) -> str:
    return BULLET_RE.sub("", text, count=1).strip()
