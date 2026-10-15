"""Tự chọn bố cục cho từng slide theo nội dung, đo chữ để không tràn, tự tách trang khi quá dài."""
from __future__ import annotations

import re

from . import decor
from . import draw as D
from . import textfit as TF
from .animate import add_animations, add_transition
from .draw import H, W
from .model import Item, Slide

LABEL_RE = re.compile(r"^\s*([^:：]{2,48})\s*[:：]\s+(.{6,})$")
STAT_RE = re.compile(r"^\s*([<>~≈+\-]?\s?\d[\d.,]*\s?(?:%|‰|°C|°F|x|lần|triệu|tỷ|tỉ|nghìn|ngàn|km²|km|m²|m|ha|kg|tấn|k|K|M|B|USD|\$|đ|VNĐ|người|năm|giờ|ngày)?)\s*[:\-–—]\s*(.{4,})$|^\s*([<>~≈+\-]?\s?\d[\d.,]*\s?(?:%|‰|°C|lần|triệu|tỷ|tỉ|nghìn|km|ha|kg|tấn|USD|đ|người))\s+(.{4,})$")
STEP_RE = re.compile(r"^\s*(?:bước|step|giai đoạn|phase|stage)\s*\d+\s*[:.\-–—]?\s*", re.I)
CLOSING_RE = re.compile(r"(thank|cảm ơn|cám ơn|q\s*&\s*a|hỏi đáp|questions|xin chân thành)", re.I)


class Ctx:
    def __init__(self, prs, th, idx, kind, inv, opts):
        self.prs, self.th, self.idx, self.kind, self.inv, self.opts = prs, th, idx, kind, inv, opts
        self.slide = prs.slides.add_slide(prs.slide_layouts[6])
        self.info = decor.paint(self.slide, th, inv, idx, kind)
        bg = self.info["bg"]
        if inv:
            self.ink = D.readable_on(bg, th["inv_ink"], "FFFFFF")
            self.body = D.readable_on(bg, th["inv_body"], th["inv_ink"])
            self.accent = th["inv_accent"] if D.contrast(bg, th["inv_accent"]) >= 3 else self.ink
            self.muted = th["inv_body"]
        else:
            self.ink = D.readable_on(bg, th["ink"])
            self.body = D.readable_on(bg, th["body"], th["ink"])
            self.accent = th["accent"] if D.contrast(bg, th["accent"]) >= 3 else th["ink"]
            self.muted = D.readable_on(bg, th["muted"], th["body"])
        self.bg = bg
        self.head, self.font = th["head"], th["body_font"]
        self.hb = th["head_bold"]
        self.steps: list[list] = []
        self.eff = opts.get("effect") or th["effect"]

    # vùng nội dung
    @property
    def x0(self): return self.info["x0"]
    @property
    def x1(self): return self.info["x1"]
    @property
    def y0(self): return self.info["y0"]
    @property
    def y1(self): return self.info["y1"]

    def step(self, shapes, eff=None):
        shapes = [s for s in (shapes if isinstance(shapes, (list, tuple)) else [shapes]) if s is not None]
        if shapes:
            self.steps.append([(s, eff or self.eff) for s in shapes])

    def finish(self, notes=""):
        add_animations(self.slide, self.steps, self.opts.get("anim", "auto"))
        add_transition(self.slide, self.opts.get("transition") or self.th["transition"])
        if notes:
            self.slide.notes_slide.notes_text_frame.text = notes[:4000]


# ======================================================================
# phần dùng chung
# ======================================================================

def _title(ctx: Ctx, title: str, subtitle: str = "") -> float:
    th = ctx.th
    width = ctx.x1 - ctx.x0
    t = title.upper() if th["caps"] else title
    size = TF.fit_size(t, ctx.head, width, 1.6, [36, 34, 32, 30, 28, 26, 24, 22], ctx.hb, 1.12, max_lines=2) or 22
    lines = TF.n_lines(t, ctx.head, size, width, ctx.hb)
    h = lines * size * 1.12 / 72 + 0.08
    y = ctx.y0
    mark = th["title_mark"]
    if mark in ("block",):
        b = D.box(ctx.slide, ctx.x0, y, 1.1, 0.16, color=th["accent"], name="!!tmark")
        y += 0.32
    elif mark == "dot":
        b = D.box(ctx.slide, ctx.x0, y + 0.02, 0.42, 0.05, color=th["accent"], name="!!tmark")
        y += 0.22
    else:
        b = None
    tb = D.text(ctx.slide, ctx.x0, y, width, h, t, font=ctx.head, size=size, color=ctx.ink, bold=ctx.hb,
                spacing=1.12, name="Tiêu đề")
    y += h
    marks = []
    if mark == "bar":
        marks.append(D.box(ctx.slide, ctx.x0, y + 0.1, 0.75, 0.07, gradient=[th["accent"], th["accent2"]], angle=0,
                           kind="round", radius=0.5, name="!!tmark"))
        y += 0.17
    elif mark == "squiggle":
        pts = [(ctx.x0 + i * 0.05, y + 0.14 + 0.05 * __import__("math").sin(i * 0.55)) for i in range(29)]
        marks.append(D.poly(ctx.slide, pts, closed=False, line_color=th["accent3"], line_w=3, name="!!tmark"))
        y += 0.22
    elif mark == "rule":
        marks.append(D.box(ctx.slide, ctx.x0, y + 0.12, width, 0.012, color=th["accent2"], name="!!tmark"))
        y += 0.15
    elif mark == "ornament":
        marks.append(D.box(ctx.slide, ctx.x0, y + 0.16, 1.0, 0.014, color=th["accent2"], name="!!tmark"))
        marks.append(D.box(ctx.slide, ctx.x0 + 1.08, y + 0.11, 0.11, 0.11, kind="diamond", color=th["accent"],
                           name="!!tmark2"))
        marks.append(D.box(ctx.slide, ctx.x0 + 1.27, y + 0.16, 1.0, 0.014, color=th["accent2"], name="!!tmark3"))
        y += 0.24
    elif mark == "dots":
        for k, c in enumerate((th["accent"], th["accent2"], th["accent3"])):
            marks.append(D.box(ctx.slide, ctx.x0 + k * 0.2, y + 0.1, 0.11, 0.11, kind="ellipse", color=c,
                               name=f"!!tdot{k}"))
        y += 0.2
    ctx.step([tb] + marks + ([b] if b else []), "fade")
    if subtitle:
        ss = TF.fit_size(subtitle, ctx.font, width, 0.8, [20, 18, 17, 16], max_lines=2) or 16
        sh = TF.height_in(subtitle, ctx.font, ss, width) + 0.05
        st = D.text(ctx.slide, ctx.x0, y + 0.08, width, sh, subtitle, font=ctx.font, size=ss, color=ctx.accent,
                    bold=True)
        ctx.step(st, "fade")
        y += sh + 0.08
    return y + 0.32


def _footer(ctx: Ctx, page: int | None, source: str = ""):
    y = ctx.info.get("foot_y", H - 0.5)
    col = ctx.info["foot"]
    if source:
        D.text(ctx.slide, ctx.x0, y, W - ctx.x0 - 1.6, 0.3, source, font=ctx.font, size=11, color=col, italic=True,
               anchor="m")
    if page:
        D.text(ctx.slide, W - 1.4, y, 0.6, 0.3, str(page), font=ctx.head, size=12, color=col, bold=True,
               align="r", anchor="m", name="Số trang")


def _tint(c, bg, t=0.84):
    return D.mix(c, bg, t)


def _palette(th):
    return [th["accent"], th["accent2"], th["accent3"]]


# ======================================================================
# chuẩn hóa nội dung
# ======================================================================

def normalize(items: list[Item]) -> list[Item]:
    items = [i for i in items if i.text.strip() or i.label]
    plain = [i for i in items if i.kind in ("bullet", "para") and not i.label]
    if plain and (sum(1 for i in plain if STAT_RE.match(i.text)) >= max(2, len(plain) - 0)
                  or sum(1 for i in plain if STEP_RE.match(i.text)) >= max(3, len(plain) - 1)):
        return items
    hits = [LABEL_RE.match(i.text) for i in plain]
    if len(plain) >= 2 and sum(1 for m in hits if m and len(m.group(1).split()) <= 6) >= max(2, 0.6 * len(plain)):
        out = []
        for i in items:
            m = LABEL_RE.match(i.text) if i in plain else None
            if m and len(m.group(1).split()) <= 6:
                out.append(Item(text=m.group(2).strip(), kind="card", label=m.group(1).strip()))
            else:
                out.append(i)
        return out
    return items


def classify(s: Slide, items: list[Item]) -> str:
    if s.table:
        return "table"
    texts = [i for i in items if i.kind in ("bullet", "para", "quote", "head")]
    cards = [i for i in items if i.kind == "card"]
    chips = [i for i in items if i.kind == "chip"]
    if s.images and not texts and not cards and not chips:
        return "images"
    if s.images:
        return "split"
    if cards:
        return "cards"
    if chips and not texts:
        return "chips"
    if not texts:
        return "empty"
    if any(i.kind == "head" for i in texts):
        return "list"
    if len(texts) == 1 and len(texts[0].text) <= 260 and texts[0].kind in ("para", "quote"):
        return "statement"
    if 2 <= len(texts) <= 4 and all(STAT_RE.match(i.text) and len(i.text) < 140 for i in texts):
        return "stats"
    if 3 <= len(texts) <= 6 and (sum(1 for i in texts if STEP_RE.match(i.text)) >= len(texts) - 1):
        return "process"
    if 3 <= len(texts) <= 4 and all(i.level == 0 and 25 <= len(i.text) <= 120 for i in texts) \
            and not any(i.kind == "quote" for i in texts):
        return "cardlist"
    return "list"


# ======================================================================
# các bố cục
# ======================================================================

def _ih(ctx, it, size, colw):
    """Chiều cao (inch) của một ý trong danh sách."""
    if it.kind == "head":
        return TF.n_lines(it.text, ctx.head, size + 2, colw, True) * (size + 2) * 1.15 / 72
    ind = 0.34 + 0.38 * it.level if it.kind == "bullet" else 0
    txt = (it.label + ": " + it.text) if it.label else it.text
    return TF.n_lines(txt, ctx.font, size, colw - ind - 0.05) * size * 1.2 / 72


def _col_h(ctx, its, size, colw, gap):
    tot = 0.0
    for k, it in enumerate(its):
        tot += _ih(ctx, it, size, colw) + (gap if k else 0) + (gap * 0.8 if it.kind == "head" and k else 0)
    return tot


def lay_list(ctx: Ctx, items: list[Item], x, y, w, h) -> list[Item]:
    """Danh sách: mỗi ý một khối riêng (để hiện lần lượt). Nhiều nhóm có tiêu đề => chia cột.
    Trả lại phần chưa vừa để sang trang sau."""
    heads = [k for k, it in enumerate(items) if it.kind == "head"]
    cols_items = None
    if 2 <= len(heads) <= 3 and heads[0] == 0 and w > 8:
        cuts = heads + [len(items)]
        cols_items = [items[cuts[k]:cuts[k + 1]] for k in range(len(heads))]
    elif len(items) >= 7 and all(len(i.text) <= 80 for i in items) and w > 8:
        half = (len(items) + 1) // 2
        cols_items = [items[:half], items[half:]]
    if cols_items:
        n = len(cols_items)
        colw = (w - 0.5 * (n - 1)) / n
        for size in (22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12):
            gap = size * 0.6 / 72
            if max(_col_h(ctx, c, size, colw, gap) for c in cols_items) <= h:
                for k, c in enumerate(cols_items):
                    _draw_list(ctx, c, x + k * (colw + 0.5), y, colw, size, gap)
                return []
    top_sizes = (26, 24, 22) if len(items) <= 5 else (22,)
    for size in top_sizes + (21, 20, 19, 18, 17, 16, 15, 14, 13):
        gap = size * 0.6 / 72
        tot = _col_h(ctx, items, size, w, gap)
        if tot <= h:
            free = h - tot
            if len(items) > 1 and free > 0:
                ng = min(gap * 2.2, gap + free / (len(items) - 1) * 0.5)
                free -= (ng - gap) * (len(items) - 1)
                gap = ng
            _draw_list(ctx, items, x, y + max(0.0, free) * 0.3, w, size, gap)
            return []
    # không vừa: lấy bao nhiêu vừa bấy nhiêu ở cỡ 16, phần còn lại sang trang sau
    size, gap = 16, 16 * 0.6 / 72
    k = 1
    while k < len(items) and _col_h(ctx, items[:k + 1], size, w, gap) <= h:
        k += 1
    if k < len(items) and items[k - 1].kind == "head" and k > 1:
        k -= 1  # không để tiêu đề nhóm mồ côi cuối trang
    _draw_list(ctx, items[:k], x, y, w, size, gap)
    return items[k:]


def _draw_list(ctx, items, x, y, colw, size, gap):
    th = ctx.th
    for k, it in enumerate(items):
        hh = _ih(ctx, it, size, colw)
        if it.kind == "head":
            if k:
                y += gap * 0.8
            tb = D.text(ctx.slide, x, y, colw, hh + 0.04, it.text, font=ctx.head, size=size + 2, color=ctx.accent,
                        bold=True, spacing=1.1)
            ctx.step(tb)
            y += hh + gap
            continue
        ind = 0.34 + 0.38 * it.level if it.kind == "bullet" else 0
        if it.label:
            content = [[(it.label + ": ", {"bold": True, "color": ctx.ink}), (it.text, {})]]
        else:
            content = it.text
        tb = D.text(ctx.slide, x, y, colw, hh + 0.04, content, font=ctx.font, size=size - (1 if it.level else 0),
                    color=ctx.body, italic=it.kind == "quote", spacing=1.2,
                    bullet=(th["bullet"] if it.kind == "bullet" and it.level == 0 else ("–" if it.kind == "bullet" else None)),
                    bullet_color=ctx.accent, indent=ind)
        ctx.step(tb)
        y += hh + gap


def lay_lead(ctx: Ctx, items: list[Item], x, y, w, maxh) -> float:
    """Đoạn dẫn ở đầu trang (trước các thẻ)."""
    used = 0.0
    for it in [i for i in items if i.text]:
        if it.kind == "head":
            size = TF.fit_size(it.text, ctx.head, w, maxh - used, [24, 22, 20, 18], True) or 18
            hh = TF.height_in(it.text, ctx.head, size, w, True, 1.1)
            ctx.step(D.text(ctx.slide, x, y + used, w, hh + 0.05, it.text, font=ctx.head, size=size, color=ctx.accent,
                            bold=True, spacing=1.1))
        else:
            sizes = [22, 21, 20, 19, 18, 17, 16] if len(it.text) < 110 else [20, 19, 18, 17, 16]
            size = TF.fit_size(it.text, ctx.head, w, maxh - used, sizes, False) or 16
            hh = TF.height_in(it.text, ctx.head, size, w, False, 1.18)
            ctx.step(D.text(ctx.slide, x, y + used, w, hh + 0.05, it.text, font=ctx.head, size=size, color=ctx.ink,
                            spacing=1.18, italic=it.kind == "quote"))
        used += hh + 0.18
    return used


def _lead_h(ctx, items, w):
    tot = 0.0
    for it in items:
        if it.kind == "head":
            tot += TF.height_in(it.text, ctx.head, 22, w, True, 1.1) + 0.18
        else:
            sz = 21 if len(it.text) < 110 else 19
            tot += TF.height_in(it.text, ctx.head, sz, w, False, 1.18) + 0.18
    return tot


def lay_stack(ctx: Ctx, items: list[Item], x, y, w, y1) -> list[Item]:
    """Trang có thẻ: xếp các khối theo đúng thứ tự gốc — đoạn dẫn, hàng chip, lưới thẻ, câu chốt."""
    blocks: list[list] = []
    for it in items:
        k = {"card": "cards", "chip": "chips"}.get(it.kind, "text")
        if blocks and blocks[-1][0] == k:
            blocks[-1][1].append(it)
        else:
            blocks.append([k, [it]])
    first_card = next(i for i, b in enumerate(blocks) if b[0] == "cards")
    need, plan = 0.0, []
    for bi, (k, its) in enumerate(blocks):
        if k == "chips":
            hh = 0.97
        elif k == "text":
            if bi < first_card:
                hh = _lead_h(ctx, its, w)
            elif sum(len(i.text) for i in its) <= 260:
                hh = 1.1
            else:
                hh = None  # đoạn dài sau thẻ: sang trang sau
        else:
            hh = 0.0
        plan.append(hh)
        need += hh or 0
    n_cards = sum(1 for b in blocks if b[0] == "cards")
    avail = (y1 - y) - need - 0.3 * max(0, n_cards - 1)
    if avail < 1.5 and len(blocks) > first_card + 1:
        keep = blocks[:first_card + 1]
        rest = [i for _, its in blocks[first_card + 1:] for i in its]
        return lay_stack(ctx, [i for _, its in keep for i in its], x, y, w, y1) + rest
    per = max(avail, 1.2) / max(1, n_cards)
    rest: list[Item] = []
    for bi, ((k, its), hh) in enumerate(zip(blocks, plan)):
        if k == "chips":
            y += lay_chips_row(ctx, its[:5], x, y, w) + 0.35
        elif k == "text":
            if hh is None:
                rest += its
            elif bi < first_card:
                y += lay_lead(ctx, its, x, y, w, hh + 0.4)
            else:
                y += lay_banner(ctx, its, x, y + 0.05, w, hh) + 0.3
        else:
            rest += lay_cards(ctx, its, x, y, w, per)
            y += ctx.info.get("_last_cards_h", per) + 0.3
    return rest


def lay_chips_row(ctx: Ctx, chips: list[Item], x, y, w, big=False) -> float:
    th = ctx.th
    n = len(chips)
    arrow_w = 0.42
    for size in ((26, 24, 22, 20, 18) if big else (20, 18, 17, 16, 15, 14)):
        widths = [TF.text_width_pt(c.text, ctx.head, size, True) / 72 + 0.6 for c in chips]
        total = sum(widths) + arrow_w * (n - 1)
        if total <= w:
            break
    hgt = size * 1.9 / 72
    cx = x + (w - total) / 2
    pal = _palette(th)
    shapes = []
    for k, (c, cw) in enumerate(zip(chips, widths)):
        col = pal[k % 3]
        fillc = col if D.contrast(col, "FFFFFF") >= 3 else D.mix(col, th["ink"], 0.35)
        pill = D.box(ctx.slide, cx, y, cw, hgt, color=fillc, kind="round", radius=0.5, name=f"chip{k}")
        D.text(ctx.slide, 0, 0, 0, 0, c.text, font=ctx.head, size=size, color=D.readable_on(fillc, "FFFFFF", th["ink"]),
               bold=True, align="c", anchor="m", shape=pill)
        ctx.step(pill, "zoom")
        cx += cw
        if k < n - 1:
            ar = D.box(ctx.slide, cx + 0.1, y + hgt / 2 - 0.1, arrow_w - 0.2, 0.2, kind="arrow", color=th["accent3"])
            ctx.step(ar, "fade")
            cx += arrow_w
    return hgt


def lay_cards(ctx: Ctx, cards: list[Item], x, y, w, h, numbered=False) -> list[Item]:
    th = ctx.th
    n = len(cards)
    if n > 8:
        rest, cards, n = cards[8:], cards[:8], 8
    else:
        rest = []
    cols = n if n <= 4 else (3 if n in (5, 6, 9) else 4)
    rows = (n + cols - 1) // cols
    gap = 0.3
    cw = (w - gap * (cols - 1)) / cols
    pad = 0.26
    iw = cw - 2 * pad
    style = th["card_style"]
    head_h = 0.0
    chosen = None
    for ts in (24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12):
        ls = min(ts + 3, 28)
        lab_h = max((TF.height_in(c.label, ctx.head, ls, iw, True, 1.1) if c.label else 0) for c in cards)
        txt_h = max(TF.height_in(c.text, ctx.font, ts, iw, False, 1.2) for c in cards)
        num_h = 0.55 if numbered else 0
        extra = 0.2 if style in ("strip-top", "border-left") else 0.0
        if style == "header" and lab_h:
            head_h = lab_h + 0.36
            card_h = head_h + pad + txt_h + pad
        else:
            card_h = pad + extra + num_h + (lab_h + 0.12 if lab_h else 0) + txt_h + pad
        if rows * card_h + gap * (rows - 1) <= h:
            chosen = (ts, ls, lab_h, txt_h, card_h, num_h)
            break
    if not chosen:
        if n > 2:
            k = max(2, n // 2)
            return lay_cards(ctx, cards[:k], x, y, w, h, numbered) + cards[k:] + rest
        ts, ls = 12, 14
        lab_h = max((TF.height_in(c.label, ctx.head, ls, iw, True, 1.1) if c.label else 0) for c in cards)
        txt_h = max(TF.height_in(c.text, ctx.font, ts, iw, False, 1.2) for c in cards)
        num_h = 0.55 if numbered else 0
        card_h = h
        chosen = (ts, ls, lab_h, txt_h, card_h, num_h)
    ts, ls, lab_h, txt_h, card_h, num_h = chosen
    # thẻ thấp thì kéo giãn một chút cho cân
    if rows == 1 and card_h < h * 0.6:
        card_h = min(h * 0.7, card_h + 0.7)
    if rows * card_h + gap * (rows - 1) < h:
        y += (h - (rows * card_h + gap * (rows - 1))) * 0.25
    pal = _palette(th)
    total_h = rows * card_h + gap * (rows - 1)
    ctx.info["_last_cards_h"] = total_h
    y0 = y
    for k, c in enumerate(cards):
        r, cidx = divmod(k, cols)
        in_row = min(cols, n - r * cols)
        off = (w - (in_row * cw + gap * (in_row - 1))) / 2
        cx = x + off + cidx * (cw + gap)
        cy = y0 + r * (card_h + gap)
        col = pal[k % 3]
        shapes = []
        bgc = th["card"] if not ctx.inv else D.mix(ctx.bg, "FFFFFF", 0.12)
        if style == "solid":
            bgc = _tint(col, ctx.bg, 0.8) if not ctx.inv else D.mix(ctx.bg, "FFFFFF", 0.12)
        kind = "round" if th["radius"] > 0.03 else "rect"
        rad = th["radius"] * (1.6 / max(min(cw, card_h), 0.8))
        card = D.box(ctx.slide, cx, cy, cw, card_h, color=bgc if style != "outline" else (th["card"] if not ctx.inv else None),
                     kind=kind, radius=min(rad, 0.3),
                     line_color=(th["card_line"] if style in ("strip-top", "border-left", "header") else
                                 (th["accent2"] if style == "outline" else None)),
                     line_w=1.0 if style != "outline" else 1.25,
                     shadow=(th["ink"] if style in ("strip-top", "header", "border-left") and not ctx.inv else None),
                     alpha=None, name=f"card{k}")
        shapes.append(card)
        ty = cy + pad
        if style == "strip-top":
            shapes.append(D.box(ctx.slide, cx + pad, cy + 0.16, 0.55, 0.07, color=col, kind="round", radius=0.5))
            ty += 0.2
        elif style == "border-left":
            shapes.append(D.box(ctx.slide, cx, cy, 0.08, card_h, color=col))
            ty += 0.05
        lab_color = ctx.accent if style != "solid" else D.readable_on(bgc, th["ink"])
        if style == "header" and c.label:
            hd = D.box(ctx.slide, cx, cy, cw, head_h, gradient=[D.mix(th["inv"][0], col, 0.35), col], angle=0,
                       kind="rect")
            shapes.append(hd)
            shapes.append(D.text(ctx.slide, cx + pad, cy, iw, head_h, c.label, font=ctx.head, size=ls,
                                 color="FFFFFF" if D.contrast(col, "FFFFFF") >= 3 else th["ink"], bold=True,
                                 anchor="m", spacing=1.05))
            ty = cy + head_h + pad
        else:
            if numbered:
                shapes.append(D.text(ctx.slide, cx + pad, ty, iw, num_h, f"{k + 1:02d}", font=ctx.head, size=30,
                                     color=D.readable_on(bgc, col, th["accent"], th["ink"]), bold=True))
                ty += num_h
            if c.label:
                shapes.append(D.text(ctx.slide, cx + pad, ty, iw, lab_h + 0.05, c.label, font=ctx.head, size=ls,
                                     color=lab_color if D.contrast(bgc, lab_color) >= 3 else th["ink"],
                                     bold=True, spacing=1.08))
                ty += lab_h + 0.12
        body_col = D.readable_on(bgc, th["body"] if not ctx.inv else ctx.body, th["ink"], ctx.body)
        shapes.append(D.text(ctx.slide, cx + pad, ty, iw, txt_h + 0.1, c.text, font=ctx.font, size=ts,
                             color=body_col, spacing=1.2))
        ctx.step(shapes)
    return rest


def lay_banner(ctx: Ctx, items: list[Item], x, y, w, maxh) -> float:
    """Một câu chốt trong dải màu nhạt ở cuối slide."""
    th = ctx.th
    txt = " ".join(i.text for i in items)
    size = TF.fit_size(txt, ctx.head, w - 0.7, maxh - 0.3, [22, 20, 19, 18, 17, 16, 15, 14], bold=False) or 14
    hh = TF.height_in(txt, ctx.head, size, w - 0.7) + 0.32
    bgc = _tint(th["accent"], ctx.bg, 0.86) if not ctx.inv else D.mix(ctx.bg, "FFFFFF", 0.12)
    b = D.box(ctx.slide, x, y, w, hh, color=bgc, kind="round", radius=0.25 if th["radius"] > 0.03 else 0.0)
    bar = D.box(ctx.slide, x, y, 0.08, hh, color=th["accent"])
    t = D.text(ctx.slide, x + 0.35, y, w - 0.6, hh, txt, font=ctx.head, size=size,
               color=D.readable_on(bgc, th["ink"], ctx.ink), anchor="m", spacing=1.2)
    ctx.step([b, bar, t], "fade")
    return hh


def lay_stats(ctx: Ctx, items: list[Item], x, y, w, h):
    th = ctx.th
    n = len(items)
    gap = 0.4
    cw = (w - gap * (n - 1)) / n
    pal = _palette(th)
    y += max(0.0, (h - 3.2) * 0.35)
    h = min(h, 3.4)
    for k, it in enumerate(items):
        m = STAT_RE.match(it.text)
        num = (m.group(1) or m.group(3)).strip()
        desc = (m.group(2) or m.group(4)).strip()
        ns = TF.fit_size(num, ctx.head, cw, 1.4, [72, 64, 56, 48, 40, 34], True, max_lines=1) or 34
        ds = TF.fit_size(desc, ctx.font, cw, h - 1.8, [20, 18, 17, 16, 15, 14]) or 14
        cx = x + k * (cw + gap)
        col = pal[k % 3]
        numc = D.readable_on(ctx.bg, col, th["accent"], ctx.ink)
        a = D.text(ctx.slide, cx, y + 0.2, cw, ns * 1.2 / 72, num, font=ctx.head, size=ns, color=numc, bold=True)
        ln = D.box(ctx.slide, cx, y + 0.3 + ns * 1.2 / 72, 0.6, 0.06, color=col)
        b = D.text(ctx.slide, cx, y + 0.5 + ns * 1.2 / 72, cw, h - 1.2, desc, font=ctx.font, size=ds, color=ctx.body,
                   spacing=1.15)
        ctx.step([a, ln, b], "zoom")


def lay_process(ctx: Ctx, items: list[Item], x, y, w, h):
    th = ctx.th
    n = len(items)
    cw = w / n
    r = 0.36
    y += max(0.0, (h - 3.4) * 0.3)
    h = min(h, 3.6)
    cy = y + 0.25
    D_line = D.box(ctx.slide, x + cw / 2, cy + r - 0.02, w - cw, 0.05, color=th["card_line"] if not ctx.inv else ctx.muted)
    ctx.step(D_line, "wipe")
    pal = _palette(th)
    texts = [STEP_RE.sub("", i.text) for i in items]
    labels = [i.label for i in items]
    iw = cw - 0.3
    ts = 18
    for s in (19, 18, 17, 16, 15, 14, 13, 12):
        if max(TF.height_in(t, ctx.font, s, iw) + (TF.height_in(l, ctx.head, s + 2, iw, True) + 0.1 if l else 0)
               for t, l in zip(texts, labels)) <= h - 1.2:
            ts = s
            break
    for k, (t, lab) in enumerate(zip(texts, labels)):
        cx = x + k * cw + cw / 2
        col = pal[k % 3]
        fillc = col if D.contrast(col, "FFFFFF") >= 3 else D.mix(col, th["ink"], 0.4)
        circ = D.box(ctx.slide, cx - r, cy, 2 * r, 2 * r, kind="ellipse", color=fillc, name=f"step{k}")
        D.text(ctx.slide, 0, 0, 0, 0, str(k + 1), font=ctx.head, size=22, color="FFFFFF", bold=True, align="c",
               anchor="m", shape=circ)
        ty = cy + 2 * r + 0.25
        shapes = [circ]
        if lab:
            lh = TF.height_in(lab, ctx.head, ts + 2, iw, True) + 0.05
            shapes.append(D.text(ctx.slide, cx - iw / 2, ty, iw, lh, lab, font=ctx.head, size=ts + 2, color=ctx.ink,
                                 bold=True, align="c"))
            ty += lh + 0.08
        shapes.append(D.text(ctx.slide, cx - iw / 2, ty, iw, h - (ty - y), t, font=ctx.font, size=ts, color=ctx.body,
                             align="c", spacing=1.2))
        ctx.step(shapes, "float")


def lay_statement(ctx: Ctx, item: Item, x, y, w, h):
    th = ctx.th
    quote = item.kind == "quote" or item.text[:1] in "“\"«"
    txt = item.text.strip().strip("“”\"«»")
    tw = w * 0.9
    size = TF.fit_size(txt, ctx.head, tw, h - 0.4, [40, 36, 34, 32, 30, 28, 26, 24, 22, 20], ctx.hb) or 20
    th_ = TF.height_in(txt, ctx.head, size, tw, ctx.hb, 1.2)
    ty = y + max(0, (h - th_) / 2 - 0.2)
    shapes = []
    if quote:
        q = D.text(ctx.slide, x - 0.1, ty - 1.0, 1.2, 1.3, "“", font="Palatino Linotype", size=110,
                   color=th["accent3"] if not ctx.inv else ctx.accent, bold=True)
        shapes.append(q)
    else:
        shapes.append(D.box(ctx.slide, x, ty - 0.35, 0.9, 0.08, color=th["accent"]))
    t = D.text(ctx.slide, x, ty, tw, th_ + 0.2, (("“" + txt + "”") if quote else txt), font=ctx.head, size=size,
               color=ctx.ink, bold=ctx.hb and not quote, italic=quote, spacing=1.2)
    ctx.step(shapes + [t], "fade")


def _img_mode(img):
    return "contain" if img.diagram else "cover"


def lay_images(ctx: Ctx, imgs, x, y, w, h):
    th = ctx.th
    n = len(imgs)
    rad = 0.06 if th["radius"] > 0.03 else 0.0
    if n == 1:
        img = imgs[0]
        bw, bh = w, h
        if img.diagram:
            r = img.ratio
            if bw / bh > r:
                bw = bh * r
            bx = x + (w - bw) / 2
            panel = D.box(ctx.slide, bx - 0.15, y - 0.1, bw + 0.3, bh + 0.2, color="FFFFFF", kind="round", radius=0.04,
                          line_color=th["card_line"])
            p = D.picture(ctx.slide, img, bx, y, bw, bh, "contain")
            ctx.step([panel, p], "fade")
        else:
            p = D.picture(ctx.slide, img, x, y, w, h, "cover", radius=rad)
            ctx.step(p, "fade")
        return
    if n == 2:
        boxes = [(x, y, (w - 0.3) / 2, h), (x + (w + 0.3) / 2, y, (w - 0.3) / 2, h)]
    elif n == 3:
        boxes = [(x, y, w * 0.58, h), (x + w * 0.58 + 0.3, y, w * 0.42 - 0.3, (h - 0.3) / 2),
                 (x + w * 0.58 + 0.3, y + (h + 0.3) / 2, w * 0.42 - 0.3, (h - 0.3) / 2)]
    else:
        gw, gh = (w - 0.3) / 2, (h - 0.3) / 2
        boxes = [(x, y, gw, gh), (x + gw + 0.3, y, gw, gh), (x, y + gh + 0.3, gw, gh), (x + gw + 0.3, y + gh + 0.3, gw, gh)]
    for img, (bx, by, bw, bh) in zip(imgs, boxes):
        if img.diagram:
            panel = D.box(ctx.slide, bx, by, bw, bh, color="FFFFFF", kind="round", radius=0.04, line_color=th["card_line"])
            p = D.picture(ctx.slide, img, bx + 0.1, by + 0.1, bw - 0.2, bh - 0.2, "contain")
            ctx.step([panel, p], "zoom")
        else:
            ctx.step(D.picture(ctx.slide, img, bx, by, bw, bh, "cover", radius=rad), "zoom")


def lay_table(ctx: Ctx, rows: list[list[str]], x, y, w, h) -> list[list[str]]:
    th = ctx.th
    ncol = max(len(r) for r in rows)
    rows = [r + [""] * (ncol - len(r)) for r in rows]
    # độ rộng cột theo độ dài chữ
    lens = [max(min(len(r[c]), 60) for r in rows) + 4 for c in range(ncol)]
    tot = sum(lens)
    widths = [w * l / tot for l in lens]
    for size in (24, 22, 20, 18, 17, 16, 15, 14, 13, 12, 11):
        rh = [max(TF.height_in(r[c], ctx.font, size, widths[c] - 0.2, i == 0) for c in range(ncol)) + size / 72 * 0.9
              for i, r in enumerate(rows)]
        if sum(rh) <= h * (0.8 if len(rows) <= 8 else 1.0):
            break
    if sum(rh) < h * 0.6:
        extra = (h * 0.6 - sum(rh)) / len(rh)
        rh = [v + min(extra, 0.25) for v in rh]
    rest = []
    if sum(rh) > h:
        acc, k = 0, 0
        while k < len(rows) and acc + rh[k] <= h:
            acc += rh[k]
            k += 1
        k = max(k, 2)
        rest = [rows[0]] + rows[k:]
        rows, rh = rows[:k], rh[:k]
    gf = ctx.slide.shapes.add_table(len(rows), ncol, D.E(x), D.E(y), D.E(w), D.E(sum(rh)))
    tbl = gf.table
    for c in range(ncol):
        tbl.columns[c].width = D.E(widths[c])
    head_bg = th["accent"] if not ctx.inv else th["inv_accent"]
    for i, r in enumerate(rows):
        tbl.rows[i].height = D.E(rh[i])
        for c in range(ncol):
            cell = tbl.cell(i, c)
            cell.fill.solid()
            bgc = head_bg if i == 0 else (th["card"] if i % 2 else _tint(th["accent"], th["card"], 0.92))
            cell.fill.fore_color.rgb = D.rgb(bgc)
            cell.margin_left = cell.margin_right = D.E(0.1)
            cell.margin_top = cell.margin_bottom = D.E(0.06)
            D.text(ctx.slide, 0, 0, 0, 0, r[c], font=ctx.head if i == 0 else ctx.font, size=size,
                   color=D.readable_on(bgc, "FFFFFF", th["ink"]) if i == 0 else th["body"], bold=(i == 0),
                   shape=cell, anchor="m", margin=0.08)
    ctx.step(gf, "fade")
    return rest


# ======================================================================
# các loại trang đặc biệt
# ======================================================================

def cover(prs, th, deck, opts):
    ctx = Ctx(prs, th, 0, "cover", True, opts)
    x, w = ctx.x0, ctx.x1 - ctx.x0
    t = deck.title.upper() if th["caps"] else deck.title
    size = TF.fit_size(t, ctx.head, min(w, 10.8), 2.6, [60, 56, 52, 48, 44, 40, 36, 32], ctx.hb, 1.1, 3) or 32
    th_ = TF.height_in(t, ctx.head, size, min(w, 10.8), ctx.hb, 1.1)
    sub = deck.subtitle
    ss = (TF.fit_size(sub, ctx.font, min(w, 10.5), 1.2, [28, 26, 24, 22, 20, 18], False, 1.15, 3) or 18) if sub else 0
    sh = TF.height_in(sub, ctx.font, ss, min(w, 10.5), False, 1.15) if sub else 0
    meta = [m for m in deck.meta if m.strip()][:5]
    ms = 17
    mh = sum(TF.height_in(m, ctx.font, ms, w - 0.4) for m in meta) + 0.1 * len(meta)
    top = max(ctx.y0 + 0.4, (ctx.y1 - mh - 0.6 - (th_ + 0.35 + sh)) / 2 + 0.2)
    bar = D.box(ctx.slide, x, top - 0.38, 1.1, 0.09, color=ctx.accent, kind="round", radius=0.5, name="!!tmark")
    tt = D.text(ctx.slide, x, top, min(w, 10.8), th_ + 0.1, t, font=ctx.head, size=size, color=ctx.ink, bold=ctx.hb,
                spacing=1.1, name="Tiêu đề")
    ctx.step([bar, tt], "float")
    y = top + th_ + 0.3
    if sub:
        st = D.text(ctx.slide, x, y, min(w, 10.5), sh + 0.1, sub, font=ctx.font, size=ss, color=ctx.accent, spacing=1.15)
        ctx.step(st, "float")
    if meta:
        my = ctx.y1 - mh
        shapes = []
        line_ = D.box(ctx.slide, x, my - 0.12, 0.05, mh + 0.05, color=th["accent3"])
        yy = my
        for k, m in enumerate(meta):
            hh = TF.height_in(m, ctx.font, ms, w - 0.4) + 0.1
            shapes.append(D.text(ctx.slide, x + 0.25, yy, w - 0.4, hh, m, font=ctx.head if k == 0 else ctx.font,
                                 size=ms + (3 if k == 0 else 0), color=ctx.ink if k == 0 else ctx.body,
                                 bold=(k == 0)))
            yy += hh + (0.05 if k == 0 else 0)
        ctx.step([line_] + shapes, "fade")
    ctx.finish(deck.cover_notes)


def section(prs, th, s: Slide, idx, num, opts):
    ctx = Ctx(prs, th, idx, "section", True, opts)
    x, w = ctx.x0, min(ctx.x1 - ctx.x0, 10.5)
    n = D.text(ctx.slide, x, ctx.y0 + 0.6, 4, 1.6, f"{num:02d}", font=ctx.head, size=96, color=ctx.accent,
               bold=True, name="!!secnum")
    t = s.title.upper() if th["caps"] else s.title
    size = TF.fit_size(t, ctx.head, w, 2.2, [48, 44, 40, 36, 32, 28], ctx.hb, 1.08, 3) or 28
    hh = TF.height_in(t, ctx.head, size, w, ctx.hb, 1.08)
    tt = D.text(ctx.slide, x, ctx.y0 + 2.3, w, hh + 0.1, t, font=ctx.head, size=size, color=ctx.ink, bold=ctx.hb,
                spacing=1.08, name="Tiêu đề")
    ctx.step([n], "zoom")
    ctx.step([tt], "float")
    y = ctx.y0 + 2.45 + hh
    extra = s.subtitle or " · ".join(i.text for i in s.items[:3])
    if extra:
        es = TF.fit_size(extra, ctx.font, w, 1.2, [22, 20, 18, 16]) or 16
        ctx.step(D.text(ctx.slide, x, y, w, 1.3, extra, font=ctx.font, size=es, color=ctx.body), "fade")
    ctx.finish(s.notes)


def closing(prs, th, s: Slide, idx, opts):
    ctx = Ctx(prs, th, idx, "closing", True, opts)
    x, w = ctx.x0, ctx.x1 - ctx.x0
    t = s.title.upper() if th["caps"] else s.title
    size = TF.fit_size(t, ctx.head, w, 2.0, [60, 54, 48, 44, 40, 36, 32], ctx.hb, 1.05, 2) or 32
    hh = TF.height_in(t, ctx.head, size, w, ctx.hb, 1.05)
    lines = [s.subtitle] if s.subtitle else []
    lines += [i.text for i in s.items[:4]]
    lh = sum(TF.height_in(l, ctx.font, 20, w) + 0.1 for l in lines)
    top = (ctx.y0 + ctx.y1 - hh - 0.4 - lh) / 2
    tt = D.text(ctx.slide, x, top, w, hh + 0.1, t, font=ctx.head, size=size, color=ctx.ink, bold=ctx.hb, align="c",
                spacing=1.05, name="Tiêu đề")
    bar = D.box(ctx.slide, W / 2 - 0.6, top + hh + 0.15, 1.2, 0.08, color=ctx.accent, kind="round", radius=0.5,
                name="!!tmark")
    ctx.step([tt, bar], "zoom")
    y = top + hh + 0.45
    for l in lines:
        lhh = TF.height_in(l, ctx.font, 20, w) + 0.1
        ctx.step(D.text(ctx.slide, x, y, w, lhh, l, font=ctx.font, size=20, color=ctx.body, align="c"), "fade")
        y += lhh
    ctx.finish(s.notes)


# ======================================================================
# trang nội dung
# ======================================================================

def content(prs, th, s: Slide, idx, page, opts) -> Slide | None:
    """Vẽ một trang nội dung. Nếu không đủ chỗ, trả về Slide chứa phần còn lại."""
    items = normalize(s.items)
    kind = classify(s, items)
    if kind == "statement" and not s.title and not s.images:
        pass
    ctx = Ctx(prs, th, idx, "content", False, opts)
    y = _title(ctx, s.title, s.subtitle) if s.title else ctx.y0 + 0.1
    x, w = ctx.x0, ctx.x1 - ctx.x0
    h = ctx.y1 - y
    rest = None

    if kind == "table":
        texts = [i for i in items if i.kind != "chip"]
        th_ = h - (0.9 if texts else 0)
        left = lay_table(ctx, s.table, x, y, w, th_)
        if texts:
            lay_banner(ctx, texts[:2], x, ctx.y1 - 0.75, w, 0.75)
        if len(left) > 1:
            rest = Slide(title=s.title, table=left, cont=True, source=s.source)
    elif kind == "images":
        imgs = s.images[:4]
        lay_images(ctx, imgs, x, y, w, h)
        if s.images[4:]:
            rest = Slide(title=s.title, images=s.images[4:], cont=True)
        cap = next((i.caption for i in imgs if i.caption), "")
        if cap:
            pass
    elif kind == "split":
        img_w = w * 0.44
        left_side = idx % 2 == 0
        tx = x + (img_w + 0.45 if left_side else 0)
        tw = w - img_w - 0.45
        ix = x if left_side else x + w - img_w
        imgs = s.images[:2]
        if len(imgs) == 1:
            im = imgs[0]
            ih = min(h, img_w / im.ratio) if im.diagram else h
            iy = y + (h - ih) / 2 if im.diagram else y
            lay_images(ctx, [im], ix, iy, img_w, ih)
        else:
            gh = (h - 0.3) / 2
            for k, im in enumerate(imgs):
                lay_images(ctx, [im], ix, y + k * (gh + 0.3), img_w, gh)
        texts = []
        for i in items:
            if i.kind == "card":
                texts.append(Item(text=i.label, kind="head"))
                texts += [Item(text=t, kind="bullet") for t in i.text.split("\n") if t.strip()]
            else:
                texts.append(Item(text=i.text, kind=("bullet" if i.kind == "chip" else i.kind), level=i.level))
        left = lay_list(ctx, texts, tx, y, tw, h)
        if left or s.images[2:]:
            rest = Slide(title=s.title, items=left, images=s.images[2:], cont=True, source=s.source)
    elif kind == "cards":
        left = lay_stack(ctx, items, x, y, w, ctx.y1)
        if left:
            rest = Slide(title=s.title, items=left, cont=True, source=s.source)
    elif kind == "chips":
        chips = [i for i in items if i.kind == "chip"]
        lay_chips_row(ctx, chips[:5], x, y + h / 2 - 0.5, w, big=True)
        if chips[5:]:
            rest = Slide(title=s.title, items=chips[5:], cont=True)
    elif kind == "statement":
        t = [i for i in items if i.kind in ("para", "quote", "bullet")][0]
        lay_statement(ctx, t, x, y, w, h)
    elif kind == "stats":
        lay_stats(ctx, items, x, y, w, h)
    elif kind == "process":
        lay_process(ctx, items, x, y, w, h)
    elif kind == "cardlist":
        cards = [Item(text=i.text, kind="card") for i in items]
        left = lay_cards(ctx, cards, x, y, w, h, numbered=True)
        if left:
            rest = Slide(title=s.title, items=left, cont=True, source=s.source)
    elif kind == "list":
        tail = []
        if any(i.kind == "head" for i in items):
            while items and items[-1].kind == "para" and len(items) > 2 and items[-2].kind != "head":
                tail.insert(0, items.pop())
            if sum(len(t.text) for t in tail) > 260:
                items, tail = items + tail, []
        if tail:
            bh = 1.05
            lay_banner(ctx, tail, x, ctx.y1 - bh + 0.05, w, bh)
            h -= bh + 0.2
        left = lay_list(ctx, items, x, y, w, h)
        if left:
            rest = Slide(title=s.title, items=left, cont=True, source=s.source)

    _footer(ctx, page, s.source)
    ctx.finish(s.notes)
    return rest
