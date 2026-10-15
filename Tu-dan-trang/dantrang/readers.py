"""Đọc .pptx / .docx / .md / .txt thành mô hình Deck chung."""
from __future__ import annotations

import re
from pathlib import Path

from .model import BULLET_RE, Deck, Img, Item, Slide, clean, strip_bullet

STEPTAG_RE = re.compile(r"^\s*(?:(?:step|bước|phần|part|giai đoạn|phase|stage|module|unit|bài|chương)\s*)?\d{1,2}[.:)]?\s*$",
                        re.I)
CITE_RE = re.compile(r"(\(\s*(?:19|20)\d{2}[a-z]?\s*\)|et al\.|adapted from|nguồn\s*:|source\s*:|theo\s+[A-ZĐ])", re.I)


def read(path: str | Path) -> Deck:
    p = Path(path)
    ext = p.suffix.lower()
    if ext == ".pptx":
        return read_pptx(p)
    if ext == ".docx":
        return read_docx(p)
    if ext in (".md", ".markdown"):
        return read_md(p.read_text(encoding="utf-8-sig"), p.parent)
    if ext == ".txt":
        return read_txt(p.read_text(encoding="utf-8-sig"))
    raise ValueError(f"Chưa hỗ trợ loại file {ext} (dùng .pptx, .docx, .md, .txt)")


# ======================================================================
# PowerPoint
# ======================================================================

def _iter_shapes(shapes, dx=0, dy=0):
    from pptx.enum.shapes import MSO_SHAPE_TYPE
    for sh in shapes:
        if sh.shape_type == MSO_SHAPE_TYPE.GROUP:
            yield from _iter_shapes(sh.shapes)
        else:
            yield sh


def read_pptx(path: Path) -> Deck:
    from pptx import Presentation
    from pptx.enum.shapes import PP_PLACEHOLDER
    prs = Presentation(str(path))
    SW, SH = prs.slide_width or 12192000, prs.slide_height or 6858000
    deck = Deck()
    raw: list[Slide] = []
    for si, sl in enumerate(prs.slides):
        frames, imgs, table = [], [], None
        title = ""
        for sh in _iter_shapes(sl.shapes):
            ph = sh.placeholder_format.type if sh.is_placeholder else None
            if ph in (PP_PLACEHOLDER.SLIDE_NUMBER, PP_PLACEHOLDER.DATE, PP_PLACEHOLDER.FOOTER):
                continue
            top = (sh.top or 0) / SH
            left = (sh.left or 0) / SW
            wid = (sh.width or 0) / SW
            hei = (sh.height or 0) / SH
            blob = None
            try:
                if sh.shape_type == 13 or sh.is_placeholder:
                    blob = sh.image
            except (AttributeError, ValueError):
                blob = None
            if blob is not None:
                if wid * 13.33 < 0.6 and hei * 7.5 < 0.6:
                    continue
                im = Img.from_bytes(blob.blob, blob.ext)
                if im:
                    imgs.append((top, left, im))
                continue
            if getattr(sh, "has_table", False) and sh.has_table:
                table = [[clean(c.text) for c in r.cells] for r in sh.table.rows]
                continue
            if not getattr(sh, "has_text_frame", False) or not sh.has_text_frame:
                continue
            paras = []
            maxsz = 0
            bold = False
            for p in sh.text_frame.paragraphs:
                t = clean(p.text)
                if not t:
                    continue
                for r in p.runs:
                    if r.font.size:
                        maxsz = max(maxsz, r.font.size.pt)
                    bold = bold or bool(r.font.bold)
                paras.append((t, p.level))
            if not paras:
                continue
            is_title = ph in (PP_PLACEHOLDER.TITLE, PP_PLACEHOLDER.CENTER_TITLE)
            is_sub = ph == PP_PLACEHOLDER.SUBTITLE
            frames.append(dict(top=top, left=left, w=wid, h=hei, paras=paras, size=maxsz or 18, bold=bold,
                               title=is_title, sub=is_sub))
        notes = ""
        if sl.has_notes_slide:
            notes = sl.notes_slide.notes_text_frame.text.strip()
        s = _frames_to_slide(frames, si)
        s.images = [im for _, _, im in sorted(imgs, key=lambda t: (round(t[0], 1), t[1]))]
        s.table = table
        s.notes = notes
        raw.append(s)

    if raw:
        first = raw[0]
        deck.title = first.title
        deck.subtitle = first.subtitle
        meta = [i.text for i in first.items]
        if not deck.subtitle and meta and len(meta[0]) < 120:
            deck.subtitle = meta.pop(0)
        deck.meta = meta
        deck.cover_notes = first.notes
        deck.slides = raw[1:]
    return deck


def _frames_to_slide(frames: list[dict], si: int) -> Slide:
    s = Slide()
    if not frames:
        return s
    # tiêu đề: placeholder tiêu đề, nếu không có thì chữ cỡ lớn nhất ở nửa trên
    tf = next((f for f in frames if f["title"]), None)
    if tf is None:
        cands = [f for f in frames if f["top"] < 0.42 and len(" ".join(t for t, _ in f["paras"])) <= 140]
        if cands:
            tf = max(cands, key=lambda f: (f["size"], -f["top"]))
            if tf["size"] < 20 and si > 0 and max(f["size"] for f in frames) > tf["size"]:
                tf = None
    if tf:
        s.title = " ".join(t for t, _ in tf["paras"])
        frames = [f for f in frames if f is not tf]
    sub = next((f for f in frames if f["sub"]), None)
    if sub:
        s.subtitle = " ".join(t for t, _ in sub["paras"])
        frames = [f for f in frames if f is not sub]

    # nguồn trích dẫn: chữ nhỏ ở đáy slide có dạng trích dẫn
    body_sizes = sorted(f["size"] for f in frames) or [18]
    med = body_sizes[len(body_sizes) // 2]
    keep = []
    for f in frames:
        txt = " ".join(t for t, _ in f["paras"])
        if f["top"] > 0.82 and (CITE_RE.search(txt) or f["size"] < med - 2) and len(txt) < 260:
            s.source = (s.source + " " + txt).strip()
        else:
            keep.append(f)
    frames = sorted(keep, key=lambda f: (round(f["top"] / 0.035), f["left"]))

    # phụ đề: dòng ngắn sát ngay dưới tiêu đề, cùng lề trái, đứng một mình trên hàng
    if tf and not s.subtitle and frames:
        f0 = min(frames, key=lambda f: f["top"])
        txt = " ".join(t for t, _ in f0["paras"])
        gap = f0["top"] - (tf["top"] + tf["h"])
        alone = not any(f is not f0 and abs(f["top"] - f0["top"]) < 0.03 for f in frames)
        if (len(f0["paras"]) == 1 and len(txt) < 90 and not txt.isupper() and -0.02 < gap < 0.07
                and abs(f0["left"] - tf["left"]) < 0.03 and len(frames) > 1 and alone):
            s.subtitle = txt
            frames = [f for f in frames if f is not f0]

    def text_of(f):
        return " ".join(t for t, _ in f["paras"])

    def is_short(f):
        t = text_of(f)
        return (len(f["paras"]) == 1 and not t[:1].islower()
                and (len(t.split()) <= 4 or (t.isupper() and len(t) <= 32)))

    def overlap(f, g):
        lo, hi = max(f["left"], g["left"]), min(f["left"] + f["w"], g["left"] + g["w"])
        return max(0.0, hi - lo) / max(min(f["w"], g["w"]), 1e-6)

    # 1) nhãn ngắn đứng sát nhau trên cùng một hàng => gộp (vd "STEP 1" + "NOTICE")
    merged = []
    skip = set()
    for i, f in enumerate(frames):
        if i in skip:
            continue
        if is_short(f) and STEPTAG_RE.match(text_of(f)):
            for k in range(i + 1, len(frames)):
                g = frames[k]
                if k in skip or not is_short(g):
                    continue
                if abs(g["top"] - f["top"]) < 0.015 and 0 <= g["left"] - (f["left"] + f["w"]) < 0.04:
                    f = dict(f, paras=[(text_of(f) + " · " + text_of(g), 0)],
                             w=g["left"] + g["w"] - f["left"])
                    skip.add(k)
        merged.append(f)
    frames = merged

    # 2) mỗi khối nội dung tìm nhãn ngắn gần nhất ngay phía trên (hoặc bên trái cùng hàng)
    label_of: dict[int, int] = {}
    taken = set()
    for bi, bf in enumerate(frames):
        if is_short(bf):
            continue
        best, best_gap = None, 9.0
        for li, lf in enumerate(frames):
            if li == bi or li in taken or not is_short(lf) or len(text_of(bf)) <= len(text_of(lf)):
                continue
            gap = bf["top"] - (lf["top"] + lf["h"])
            if -0.01 <= gap <= 0.22 and overlap(lf, bf) >= 0.5:
                between = any(k not in (li, bi) and overlap(frames[k], bf) > 0.3
                              and lf["top"] + lf["h"] - 0.005 < frames[k]["top"] < bf["top"] - 0.005
                              for k in range(len(frames)))
                if not between and gap < best_gap:
                    best, best_gap = li, gap
            elif (abs(bf["top"] - lf["top"]) < 0.03 and 0 <= bf["left"] - (lf["left"] + lf["w"]) < 0.1
                  and 0.5 < best_gap):
                best, best_gap = li, 0.5
        if best is not None:
            label_of[best] = bi
            taken.add(best)

    items: list[Item] = []
    consumed = set(label_of.values())
    for i, f in enumerate(frames):
        if i in consumed:
            continue
        paras = f["paras"]
        txt = text_of(f)
        if i in label_of:
            body = frames[label_of[i]]
            lab = txt.title() if txt.isupper() else txt
            if len(body["paras"]) >= 4 or len(text_of(body)) > 320:
                items.append(Item(text=lab, kind="head"))
                for t, lvl in _merge_broken(body["paras"]):
                    items.append(Item(text=strip_bullet(t), kind="bullet", level=min(lvl, 2)))
            else:
                items.append(Item(text=_join_lines(_merge_broken(body["paras"])), kind="card", label=lab))
            continue
        if is_short(f):
            items.append(Item(text=txt.title() if txt.isupper() and "·" in txt else txt, kind="chip",
                              level=round(f["top"] / 0.04)))
            continue
        if len(paras) == 1:
            t = paras[0][0]
            items.append(Item(text=strip_bullet(t), kind="bullet" if BULLET_RE.match(t) else "para"))
        else:
            mp = _merge_broken(paras)
            for t, lvl in mp:
                items.append(Item(text=strip_bullet(t), kind="bullet" if len(mp) > 1 else "para", level=min(lvl, 2)))
    _fix_chips(items)
    # đoạn ngắn kiểu tiêu đề con, theo sau là gạch đầu dòng => tiêu đề nhóm
    for k, it in enumerate(items[:-1]):
        if (it.kind == "para" and len(it.text.split()) <= 8 and not it.text.endswith((".", "!", ";", ","))
                and items[k + 1].kind == "bullet"):
            it.kind = "head"
    s.items = items
    return s


def _merge_broken(paras):
    """Nối các dòng bị ngắt giữa câu (dòng sau bắt đầu bằng chữ thường)."""
    out = []
    for t, lvl in paras:
        if out and t[:1].islower() and not BULLET_RE.match(t) and not out[-1][0].endswith((".", "!", "?", ";")):
            out[-1] = (out[-1][0] + " " + t, out[-1][1])
        else:
            out.append((t, lvl))
    return out


def _fix_chips(items: list[Item]):
    """Chip chỉ giữ khi có ít nhất 2 chip cùng hàng; chip lẻ thành tiêu đề con hoặc đoạn văn."""
    rows: dict[int, list[Item]] = {}
    for it in items:
        if it.kind == "chip" and "·" not in it.text:
            rows.setdefault(it.level, []).append(it)
    for row in rows.values():
        if len(row) < 2:
            for it in row:
                it.kind = "head" if it.text.endswith(("?", ":")) or len(it.text.split()) >= 2 else "para"
    for it in items:
        if it.kind == "chip":
            it.level = 0


def _join_lines(paras) -> str:
    ts = [strip_bullet(t) for t, _ in paras]
    return ts[0] if len(ts) == 1 else "\n".join(ts)


# ======================================================================
# Word
# ======================================================================

def read_docx(path: Path) -> Deck:
    import docx
    from docx.oxml.ns import qn
    doc = docx.Document(str(path))
    deck = Deck()
    slides: list[Slide] = []
    cur: Slide | None = None
    pending_label = ""
    h1_open: Slide | None = None

    def new(title, hint=""):
        nonlocal cur
        cur = Slide(title=title, hint=hint)
        slides.append(cur)
        return cur

    body = doc.element.body
    rels = doc.part.related_parts
    for el in body.iterchildren():
        tag = el.tag.split("}")[1]
        if tag == "tbl":
            tbl = docx.table.Table(el, doc)
            rows = [[clean(c.text) for c in r.cells] for r in tbl.rows]
            rows = [r for r in rows if any(r)]
            if rows:
                if cur is None or cur.items or cur.table or cur.images:
                    new(cur.title if cur else deck.title)
                    cur.cont = bool(cur.title)
                cur.table = rows
            continue
        if tag != "p":
            continue
        para = docx.text.paragraph.Paragraph(el, doc)
        style = (para.style.name if para.style is not None else "").lower()
        txt = clean(para.text)
        # ảnh trong đoạn
        for blip in el.iter(qn("a:blip")):
            rid = blip.get(qn("r:embed"))
            part = rels.get(rid)
            if part is not None:
                im = Img.from_bytes(part.blob)
                if im:
                    if cur is None:
                        new(deck.title or "")
                    cur.images.append(im)
        if not txt:
            continue
        if style == "title":
            deck.title = txt
            continue
        if style == "subtitle":
            deck.subtitle = txt
            continue
        m = re.match(r"heading (\d)", style) or re.match(r"đề mục (\d)", style)
        if m:
            lvl = int(m.group(1))
            if lvl == 1:
                if not deck.title and not slides:
                    deck.title = txt
                    continue
                h1_open = new(txt)
                pending_label = ""
            elif lvl == 2:
                if h1_open is not None and h1_open is cur and not cur.items and not cur.images and not cur.table:
                    h1_open.hint = "section"
                new(txt)
                pending_label = ""
            else:
                pending_label = txt
            continue
        if cur is None:
            if not deck.title:
                deck.title = txt
                continue
            if not deck.subtitle and len(txt) < 140 and not slides:
                deck.subtitle = txt
                continue
            new(deck.title)
        is_list = "list" in style or el.find(qn("w:pPr")) is not None and el.find(qn("w:pPr")).find(qn("w:numPr")) is not None
        lvl = 0
        if is_list:
            ilvl = el.find(f".//{qn('w:ilvl')}")
            lvl = int(ilvl.get(qn("w:val"))) if ilvl is not None else 0
        if "quote" in style or "trích" in style:
            cur.items.append(Item(text=txt, kind="quote"))
        elif pending_label:
            cur.items.append(Item(text=txt, kind="card", label=pending_label))
            pending_label = ""
        elif is_list or BULLET_RE.match(txt):
            cur.items.append(Item(text=strip_bullet(txt), kind="bullet", level=min(lvl, 2)))
        else:
            cur.items.append(Item(text=txt, kind="para"))
    if pending_label and cur is not None:
        cur.items.append(Item(text=pending_label, kind="para"))
    if not deck.title:
        deck.title = path.stem
    deck.slides = [s for s in slides if s.title or s.items or s.images or s.table]
    if not any(s.title for s in deck.slides):
        _auto_titles(deck)
    return deck


# ======================================================================
# Markdown / văn bản
# ======================================================================

def read_md(text: str, base: Path | None = None) -> Deck:
    deck = Deck()
    slides: list[Slide] = []
    cur: Slide | None = None
    label = ""
    para_buf: list[str] = []
    table_buf: list[list[str]] = []

    def flush():
        nonlocal para_buf, table_buf
        if para_buf:
            t = " ".join(para_buf)
            if cur is None:
                if not deck.subtitle:
                    deck.subtitle = t
                else:
                    deck.meta.append(t)
            elif label_used(t):
                pass
            else:
                cur.items.append(Item(text=t, kind="para"))
            para_buf = []
        if table_buf:
            rows = [r for r in table_buf if not all(re.fullmatch(r":?-{2,}:?", c.strip()) for c in r if c.strip())]
            if cur is None:
                new(deck.title)
            cur.table = rows
            table_buf = []

    def label_used(t):
        nonlocal label
        if label:
            cur.items.append(Item(text=t, kind="card", label=label))
            label = ""
            return True
        return False

    def new(title, hint=""):
        nonlocal cur
        cur = Slide(title=title, hint=hint)
        slides.append(cur)

    for raw in text.splitlines():
        line = raw.rstrip()
        st = line.strip()
        if not st:
            flush()
            continue
        if st.startswith("|") and st.endswith("|"):
            if para_buf:
                flush()
            table_buf.append([clean(c) for c in st.strip("|").split("|")])
            continue
        elif table_buf:
            flush()
        m = re.match(r"^(#{1,6})\s+(.*)$", st)
        if m:
            flush()
            lvl, t = len(m.group(1)), clean(m.group(2))
            if lvl == 1:
                if not deck.title and not slides:
                    deck.title = t
                else:
                    new(t, "section")
            elif lvl == 2:
                new(t)
            else:
                label = t
            continue
        if st in ("---", "***", "___"):
            flush()
            if cur is not None and (cur.items or cur.images):
                new(cur.title)
                cur.cont = True
            continue
        mi = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)", st)
        if mi:
            flush()
            src = mi.group(2).split(" ")[0]
            fp = (base / src) if base else Path(src)
            if fp.exists():
                im = Img.from_bytes(fp.read_bytes(), fp.suffix.lstrip("."), mi.group(1))
                if im:
                    if cur is None:
                        new(deck.title)
                    cur.images.append(im)
            continue
        low = st.lower()
        if low.startswith(("ghi chú:", "notes:", "note:", "???")):
            flush()
            if cur is not None:
                cur.notes = (cur.notes + "\n" + st.split(":", 1)[-1].strip()).strip()
            else:
                deck.cover_notes = st.split(":", 1)[-1].strip()
            continue
        if st.startswith(">"):
            flush()
            if cur is None:
                new(deck.title)
            cur.items.append(Item(text=clean(st.lstrip("> ")), kind="quote"))
            continue
        if BULLET_RE.match(st):
            flush()
            indent = len(line) - len(line.lstrip(" \t"))
            lvl = min(indent // 2, 2)
            t = _md_inline(strip_bullet(st))
            if cur is None:
                if deck.title:
                    deck.meta.append(t)
                    continue
                new("")
            if label:
                cur.items.append(Item(text=t, kind="card", label=label))
                label = ""
            else:
                cur.items.append(Item(text=t, kind="bullet", level=lvl))
            continue
        para_buf.append(_md_inline(st))
    flush()
    if label and cur is not None:
        cur.items.append(Item(text=label, kind="para"))
    deck.slides = [s for s in slides if s.title or s.items or s.images or s.table]
    if not deck.title:
        deck.title = deck.slides[0].title if deck.slides else "Bài trình bày"
    return deck


def _md_inline(t: str) -> str:
    t = re.sub(r"\*\*(.+?)\*\*|__(.+?)__", lambda m: m.group(1) or m.group(2), t)
    t = re.sub(r"(?<!\w)[*_](.+?)[*_](?!\w)", r"\1", t)
    t = re.sub(r"`([^`]+)`", r"\1", t)
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    return clean(t)


def read_txt(text: str) -> Deck:
    """Văn bản trơn: dòng đầu là tên bài; mỗi khối cách nhau dòng trống là một trang
    (dòng đầu khối ngắn, không có dấu chấm cuối = tiêu đề trang)."""
    blocks = [b.strip("\n") for b in re.split(r"\n\s*\n", text.strip()) if b.strip()]
    deck = Deck()
    if not blocks:
        return deck
    head = [clean(l) for l in blocks[0].splitlines() if l.strip()]
    deck.title = head[0]
    if len(head) > 1:
        deck.subtitle = head[1]
        deck.meta = head[2:]
    for b in blocks[1:]:
        lines = [l.rstrip() for l in b.splitlines() if l.strip()]
        first = clean(lines[0])
        s = Slide()
        if len(lines) > 1 and len(first.split()) <= 12 and not first.endswith((".", "!", "?", ":", ";", ",")) \
                and not BULLET_RE.match(first):
            s.title = first
            lines = lines[1:]
        for l in lines:
            t = clean(l)
            if BULLET_RE.match(l.strip()):
                lvl = min((len(l) - len(l.lstrip())) // 2, 2)
                s.items.append(Item(text=strip_bullet(t), kind="bullet", level=lvl))
            else:
                s.items.append(Item(text=t, kind="para"))
        if len(lines) == 1 and not s.title and len(first.split()) <= 8:
            s.title, s.items = first, []
        deck.slides.append(s)
    if not any(s.title for s in deck.slides):
        _auto_titles(deck)
    return deck


def _auto_titles(deck: Deck):
    """Không có tiêu đề nào: lấy câu đầu (rút gọn) làm tiêu đề."""
    for s in deck.slides:
        if not s.title and s.items:
            t = s.items[0].text
            first = re.split(r"(?<=[.!?:])\s", t)[0]
            if len(first) <= 70 and len(s.items) > 1:
                s.title = first.rstrip(".:")
                s.items = s.items[1:]
