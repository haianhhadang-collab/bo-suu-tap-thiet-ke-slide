"""TỰ DÀN TRANG — biến .pptx / .docx / .pdf / .md / .txt thành bộ slide đẹp theo mẫu, có sẵn animation.
File .pptx được giữ nguyên bố cục gốc (bảng, ảnh, hộp chữ…), chỉ đổi màu, phông, nền, trang trí theo mẫu.

Cách dùng:
  python tu_dan_trang.py                      mở cửa sổ chọn file
  python tu_dan_trang.py <file> [tùy chọn]    dàn trang ngay
  python tu_dan_trang.py --theo-doi           tự xử lý mọi file thả vào thư mục Hop-thu-vao
  python tu_dan_trang.py --ds                 xem danh sách mẫu

Tùy chọn:
  -m, --mau <mã>          mẫu thiết kế (mặc định: theo cau-hinh.json), hoặc "tat-ca" để xuất mọi mẫu;
                          ghép họa tiết bằng dấu +, vd: co-dien+dong-son
  -v, --hoa-van <mã>      họa tiết theo chủ đề: cach-mang | ho-chi-minh | dong-son | hoi-van | tet | khong
  --giu-mau               giữ màu của mẫu (không dùng bảng màu của họa tiết)
  -a, --animation <kiểu>  tu-chay | nhap-chuot | khong
  -c, --chuyen <kiểu>     theo-mau | morph | fade | push | wipe | khong
  -o, --ra <thư mục>      nơi lưu kết quả (mặc định: Ket-qua)
  --dan-lai               file .pptx: dàn lại từ đầu theo nội dung thay vì giữ bố cục gốc
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import threading
import time
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from dantrang import build as B  # noqa: E402
from dantrang import hoavan, khoanh  # noqa: E402
from dantrang import themes  # noqa: E402

INBOX = ROOT / "Hop-thu-vao"
OUTBOX = ROOT / "Ket-qua"
DONE = INBOX / "Da-xu-ly"
ERR = INBOX / "Loi"
CONFIG = ROOT / "cau-hinh.json"
EXTS = {".pptx", ".docx", ".pdf", ".md", ".markdown", ".txt"}

ANIM = {"tu-chay": "auto", "nhap-chuot": "click", "khong": "none"}
TRANS = {"theo-mau": None, "morph": "morph", "fade": "fade", "push": "push", "wipe": "wipe", "khong": "none"}

DEFAULT_CFG = {
    "mau_mac_dinh": "song-bien",
    "animation": "tu-chay",
    "chuyen_trang": "theo-mau",
    "thu_muc_ket_qua": "Ket-qua",
    "chu_ky_quet_giay": 3,
    "hoa_van": "khong",
    "dung_mau_hoa_van": True,
    "giu_bo_cuc_pptx": True,
    "anh_trang_tri": "khong",
    "chu_de_anh": "tu-dong",
}


def load_cfg() -> dict:
    cfg = dict(DEFAULT_CFG)
    if CONFIG.exists():
        try:
            cfg.update(json.loads(CONFIG.read_text(encoding="utf-8")))
        except Exception as e:
            print(f"[!] cau-hinh.json lỗi, dùng mặc định: {e}")
    else:
        CONFIG.write_text(json.dumps(DEFAULT_CFG, ensure_ascii=False, indent=2), encoding="utf-8")
    themes.load_custom(ROOT / "mau")
    return cfg


def make_opts(anim: str, trans: str, motif: str = "", palette: bool = True, keep: bool = True,
              anh: str = "khong", chu_de_anh: str = "tu-dong") -> dict:
    return {"anim": ANIM.get(anim, anim), "transition": TRANS.get(trans, trans),
            "motif": hoavan.check(motif), "motif_palette": palette, "keep_layout": keep,
            "kho_anh": khoanh.check({"loai": anh, "goi": chu_de_anh})}


def resolve(name: str, default_theme: str) -> tuple[str, str | None]:
    """Tách "mẫu+họa-tiết" (vd co-dien+dong-son, tat-ca+tet). Chỉ ghi họa tiết (vd dong-son) => mẫu mặc định.
    Trả về (mẫu, họa tiết hoặc None nếu không ghi)."""
    theme, motif = "", None
    for part in (x.strip() for x in name.split("+") if x.strip()):
        if part in hoavan.MOTIFS or part == "khong":
            motif = hoavan.check(part)
        elif not theme:
            theme = part
        else:
            raise KeyError(f"'{part}' không phải mã họa tiết. Các họa tiết: {', '.join(hoavan.MOTIFS)}")
    if theme and theme != "tat-ca":
        themes.get(theme)  # báo lỗi rõ ràng nếu sai mã mẫu
    return theme or default_theme, motif


def run(src: Path, theme: str, out: Path, opts: dict, default: str = "song-bien") -> list[Path]:
    theme, motif = resolve(theme, default)
    if motif is not None:
        opts = dict(opts, motif=motif)
    if theme == "tat-ca":
        return B.build_all(src, out, opts)
    return [B.build(src, theme, out, opts)]


# ---------------------------------------------------------------- theo dõi thư mục

def watch(cfg: dict):
    out = ROOT / cfg["thu_muc_ket_qua"]
    for d in (INBOX, out, DONE, ERR):
        d.mkdir(parents=True, exist_ok=True)
    for tid in list(themes.THEMES) + ["tat-ca"] + list(hoavan.MOTIFS):
        (INBOX / tid).mkdir(exist_ok=True)
    print(f"Đang theo dõi: {INBOX}")
    print(f"  • Thả file vào thư mục gốc  -> dùng mẫu mặc định '{cfg['mau_mac_dinh']}'")
    print("  • Thả vào thư mục con theo tên mẫu (vd song-bien, gradient, tat-ca) -> dùng mẫu đó")
    print("  • Thư mục tên họa tiết (vd dong-son) -> mẫu mặc định + họa tiết; tự tạo thư mục ghép"
          " mẫu+họa-tiết (vd co-dien+dong-son) để chọn cả hai")
    print(f"  • Kết quả lưu ở: {out}      (Ctrl+C để dừng)\n")
    sizes: dict[Path, int] = {}
    opts = make_opts(cfg["animation"], cfg["chuyen_trang"], cfg["hoa_van"], cfg["dung_mau_hoa_van"],
                     cfg["giu_bo_cuc_pptx"], cfg["anh_trang_tri"], cfg["chu_de_anh"])
    while True:
        for f in list(INBOX.glob("*")) + list(INBOX.glob("*/*")):
            if not f.is_file() or f.suffix.lower() not in EXTS or f.name.startswith(("~$", ".")):
                continue
            if f.parent in (DONE, ERR):
                continue
            sz = f.stat().st_size
            if sizes.get(f) != sz:      # đợi file chép xong (kích thước đứng yên)
                sizes[f] = sz
                continue
            theme = f.parent.name if f.parent != INBOX else cfg["mau_mac_dinh"]
            t0 = time.time()
            try:
                theme, motif = resolve(theme, cfg["mau_mac_dinh"])
                outs = run(f, theme + (f"+{motif}" if motif else ""), out, opts)
                dest = DONE / f.name
                if dest.exists():
                    dest = DONE / f"{f.stem}-{int(time.time())}{f.suffix}"
                shutil.move(str(f), str(dest))
                for o in outs:
                    print(f"[✓] {f.name} -> {o.name}  ({time.time() - t0:.1f}s)")
            except Exception as e:
                print(f"[x] {f.name}: {e}")
                traceback.print_exc()
                try:
                    shutil.move(str(f), str(ERR / f.name))
                except Exception:
                    pass
            sizes.pop(f, None)
        time.sleep(cfg.get("chu_ky_quet_giay", 3))


# ---------------------------------------------------------------- giao diện

def gui(cfg: dict, preset: str | None = None):
    import os
    import tkinter as tk
    from tkinter import filedialog, messagebox, ttk

    root = tk.Tk()
    root.title("Tự dàn trang slide")
    root.geometry("860x600")
    root.minsize(760, 540)
    try:
        root.tk.call("tk", "scaling", 1.25)
    except Exception:
        pass
    style = ttk.Style()
    try:
        style.theme_use("vista")
    except Exception:
        pass
    F = ("Segoe UI", 10)
    FB = ("Segoe UI Semibold", 11)

    src = tk.StringVar(value=preset or "")
    out = tk.StringVar(value=str(ROOT / cfg["thu_muc_ket_qua"]))
    anim = tk.StringVar(value=cfg["animation"])
    trans = tk.StringVar(value=cfg["chuyen_trang"])
    all_themes = tk.BooleanVar(value=False)
    motif_pal = tk.BooleanVar(value=bool(cfg["dung_mau_hoa_van"]))
    keep = tk.BooleanVar(value=bool(cfg["giu_bo_cuc_pptx"]))
    motif_names = {"": "Không"} | {mid: m["name"] for mid, m in hoavan.MOTIFS.items()}
    status = tk.StringVar(value="Chọn file, chọn mẫu rồi bấm “Dàn trang”.")
    last_out: list[Path] = []

    top = ttk.Frame(root, padding=14)
    top.pack(fill="both", expand=True)

    ttk.Label(top, text="1. File cần dàn trang (.pptx, .docx, .pdf, .md, .txt)", font=FB).grid(row=0, column=0, columnspan=3, sticky="w")
    ttk.Entry(top, textvariable=src, font=F).grid(row=1, column=0, columnspan=2, sticky="ew", pady=(4, 10))

    def pick():
        f = filedialog.askopenfilename(filetypes=[("Tài liệu", "*.pptx *.docx *.pdf *.md *.txt"), ("Tất cả", "*.*")])
        if f:
            src.set(f)
    ttk.Button(top, text="Chọn file…", command=pick).grid(row=1, column=2, sticky="e", padx=(8, 0), pady=(4, 10))

    ttk.Label(top, text="2. Mẫu thiết kế", font=FB).grid(row=2, column=0, sticky="w")
    ids = list(themes.THEMES)
    lb = tk.Listbox(top, height=11, font=F, exportselection=False, activestyle="none")
    for tid in ids:
        lb.insert("end", f"  {themes.THEMES[tid]['name']}")
    lb.grid(row=3, column=0, sticky="nsew", pady=4)
    start = ids.index(cfg["mau_mac_dinh"]) if cfg["mau_mac_dinh"] in ids else 0
    lb.selection_set(start)

    cv = tk.Canvas(top, width=400, height=225, highlightthickness=1, highlightbackground="#ccc")
    cv.grid(row=3, column=1, columnspan=2, sticky="n", padx=(12, 0), pady=4)
    desc = tk.StringVar()
    ttk.Label(top, textvariable=desc, wraplength=400, font=F, foreground="#555").grid(
        row=4, column=1, columnspan=2, sticky="nw", padx=(12, 0))

    mf = ttk.Frame(top)
    mf.grid(row=4, column=0, sticky="nw")
    ttk.Label(mf, text="Họa tiết theo chủ đề (chọn gói, rồi họa tiết):", font=F).grid(row=0, column=0, sticky="w")
    packs = hoavan.by_pack()
    pcb = ttk.Combobox(mf, values=["Tất cả các gói"] + [f"{pk['name']} ({len(mids)})" for pk, mids in packs],
                       state="readonly", width=34)
    pcb.grid(row=1, column=0, sticky="w", pady=(2, 0))
    mcb = ttk.Combobox(mf, state="readonly", width=34)
    mcb.grid(row=2, column=0, sticky="w", pady=(2, 0))
    ttk.Checkbutton(mf, text="Dùng bảng màu của họa tiết", variable=motif_pal).grid(row=3, column=0, sticky="w")
    cur_motif = lambda: next((k for k, v in motif_names.items() if v == mcb.get()), "")

    def fill_motifs():
        """Gói đang chọn -> danh sách họa tiết (luôn có “Không” ở đầu); giữ họa tiết đang chọn nếu còn trong gói."""
        k, keep = pcb.current(), cur_motif()
        mids = list(hoavan.MOTIFS) if k <= 0 else packs[k - 1][1]
        mcb["values"] = ["Không"] + [motif_names[m] for m in mids]
        mcb.set(motif_names[keep] if keep in mids else "Không")
    m0 = hoavan.check(cfg["hoa_van"])
    pcb.current(next((i + 1 for i, (pk, mids) in enumerate(packs) if m0 in mids), 0))
    mcb.set(motif_names.get(m0, "Không"))
    fill_motifs()

    def preview(*_):
        sel = lb.curselection()
        th = hoavan.apply(themes.get(ids[sel[0] if sel else start]), cur_motif(), motif_pal.get())
        cv.delete("all")
        c0 = "#" + th["inv"][0]
        c1 = "#" + th["inv"][-1]
        # nền dải màu (giả lập gradient)
        for i in range(40):
            t = i / 39
            r = [int(int(c0[k:k + 2], 16) * (1 - t) + int(c1[k:k + 2], 16) * t) for k in (1, 3, 5)]
            cv.create_rectangle(i * 5, 0, i * 5 + 5, 225, fill="#%02x%02x%02x" % tuple(r), width=0)
        cv.create_rectangle(200, 0, 400, 225, fill="#" + th["bg"], width=0)
        cv.create_text(16, 80, anchor="w", text="Tên bài trình bày", fill="#" + th["inv_ink"],
                       font=(th["head"], 13, "bold" if th["head_bold"] else "normal"))
        cv.create_text(16, 104, anchor="w", text="Phụ đề", fill="#" + th["inv_accent"], font=(th["body_font"], 10))
        cv.create_rectangle(16, 60, 46, 63, fill="#" + th["inv_accent"], width=0)
        cv.create_text(214, 26, anchor="w", text="Tiêu đề trang", fill="#" + th["ink"],
                       font=(th["head"], 11, "bold" if th["head_bold"] else "normal"))
        for k, col in enumerate((th["accent"], th["accent2"], th["accent3"])):
            x = 214 + k * 60
            cv.create_rectangle(x, 60, x + 52, 150, fill="#" + th["card"], outline="#" + th["card_line"])
            cv.create_rectangle(x + 6, 66, x + 26, 69, fill="#" + col, width=0)
            cv.create_text(x + 6, 82, anchor="w", text="Ý chính", fill="#" + th["accent"], font=(th["head"], 7, "bold"))
            for j in range(3):
                cv.create_rectangle(x + 6, 94 + j * 9, x + 44 - j * 6, 97 + j * 9, fill="#" + th["muted"], width=0)
        for k, col in enumerate((th["accent"], th["accent2"], th["accent3"], th["ink"])):
            cv.create_rectangle(214 + k * 26, 180, 236 + k * 26, 202, fill="#" + col, width=0)
        mdesc = hoavan.MOTIFS[th["motif"]]["desc"] + "\n" if th.get("motif") else ""
        desc.set(f"{mdesc}{th['desc']}\nPhông: {th['head']} / {th['body_font']}  ·  Chuyển trang: {th['transition']}  ·  Hiệu ứng: {th['effect']}")
    lb.bind("<<ListboxSelect>>", preview)
    mcb.bind("<<ComboboxSelected>>", preview)
    pcb.bind("<<ComboboxSelected>>", lambda e: (fill_motifs(), preview()))
    motif_pal.trace_add("write", preview)
    preview()

    ttk.Checkbutton(top, text="Xuất cùng lúc tất cả các mẫu (để so sánh)", variable=all_themes).grid(
        row=5, column=0, sticky="w", pady=(6, 0))
    ttk.Checkbutton(top, text="File .pptx: giữ nguyên bố cục gốc (chỉ đổi màu, phông, nền, trang trí)",
                    variable=keep).grid(row=5, column=1, columnspan=2, sticky="w", padx=(12, 0), pady=(6, 0))

    ttk.Label(top, text="3. Animation và chuyển trang", font=FB).grid(row=6, column=0, sticky="w", pady=(12, 2))
    af = ttk.Frame(top)
    af.grid(row=7, column=0, columnspan=3, sticky="w")
    for v, t in (("tu-chay", "Tự chạy khi vào trang"), ("nhap-chuot", "Hiện từng ý khi nhấp chuột"), ("khong", "Không animation")):
        ttk.Radiobutton(af, text=t, value=v, variable=anim).pack(side="left", padx=(0, 14))
    tf_ = ttk.Frame(top)
    tf_.grid(row=8, column=0, columnspan=3, sticky="w", pady=(6, 0))
    ttk.Label(tf_, text="Chuyển trang:").pack(side="left")
    names = {"theo-mau": "Theo mẫu", "morph": "Morph (trôi mượt)", "fade": "Mờ dần", "push": "Đẩy lên",
             "wipe": "Quét ngang", "khong": "Không"}
    cb = ttk.Combobox(tf_, values=list(names.values()), state="readonly", width=20)
    cb.set(names.get(trans.get(), "Theo mẫu"))
    cb.pack(side="left", padx=8)
    # ảnh trang trí theo chủ đề (kho-anh/): nền trang bìa, trang chương, trang kết
    ttk.Label(tf_, text="Ảnh trang trí:").pack(side="left", padx=(10, 0))
    acb = ttk.Combobox(tf_, values=list(khoanh.LOAI.values()), state="readonly", width=20)
    acb.set(khoanh.LOAI.get(cfg["anh_trang_tri"], "Không dùng"))
    acb.pack(side="left", padx=8)
    goi_names = {"tu-dong": "Chủ đề: tự đoán"} | {g["id"]: g["ten"] for g in khoanh.goi_list()}
    gcb = ttk.Combobox(tf_, values=list(goi_names.values()), state="readonly", width=26)
    gcb.set(goi_names.get(cfg["chu_de_anh"], "Chủ đề: tự đoán"))
    gcb.pack(side="left")

    ttk.Label(top, text="4. Lưu vào", font=FB).grid(row=9, column=0, sticky="w", pady=(12, 2))
    ttk.Entry(top, textvariable=out, font=F).grid(row=10, column=0, columnspan=2, sticky="ew")

    def pick_out():
        d = filedialog.askdirectory()
        if d:
            out.set(d)
    ttk.Button(top, text="Đổi…", command=pick_out).grid(row=10, column=2, sticky="e", padx=(8, 0))

    bar = ttk.Frame(top)
    bar.grid(row=11, column=0, columnspan=3, sticky="ew", pady=(16, 0))
    go = ttk.Button(bar, text="Dàn trang", style="Accent.TButton")
    go.pack(side="left")
    open_btn = ttk.Button(bar, text="Mở kết quả", state="disabled")
    open_btn.pack(side="left", padx=8)
    ttk.Button(bar, text="Mở thư mục", command=lambda: os.startfile(out.get())).pack(side="left")
    ttk.Label(top, textvariable=status, font=F, foreground="#0B5", wraplength=800).grid(
        row=12, column=0, columnspan=3, sticky="w", pady=(10, 0))

    top.columnconfigure(0, weight=1)
    top.columnconfigure(1, weight=1)
    top.rowconfigure(3, weight=1)

    def work():
        f = Path(src.get().strip().strip('"'))
        if not f.is_file():
            messagebox.showwarning("Thiếu file", "Hãy chọn một file .pptx, .docx, .pdf, .md hoặc .txt.")
            return
        sel = lb.curselection()
        theme = "tat-ca" if all_themes.get() else ids[sel[0] if sel else start]
        tr = next((k for k, v in names.items() if v == cb.get()), "theo-mau")
        anh_ = next((k for k, v in khoanh.LOAI.items() if v == acb.get()), "khong")
        goi_ = next((k for k, v in goi_names.items() if v == gcb.get()), "tu-dong")
        opts = make_opts(anim.get(), tr, cur_motif(), motif_pal.get(), keep.get(), anh_, goi_)
        go.config(state="disabled")
        status.set("Đang dàn trang… (mẫu “tất cả” mất khoảng 10–30 giây)")

        def job():
            try:
                outs = run(f, theme, Path(out.get()), opts)
                last_out[:] = outs
                msg = "Xong: " + ", ".join(o.name for o in outs[:3]) + (f" … ({len(outs)} file)" if len(outs) > 3 else "")
                root.after(0, lambda: (status.set(msg), open_btn.config(state="normal"), go.config(state="normal")))
            except Exception as e:
                err = f"Lỗi: {e}"
                traceback.print_exc()
                root.after(0, lambda: (status.set(err), go.config(state="normal")))
        threading.Thread(target=job, daemon=True).start()

    go.config(command=work)
    open_btn.config(command=lambda: last_out and os.startfile(str(last_out[0])))
    root.mainloop()


# ---------------------------------------------------------------- dòng lệnh

def main():
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
        except Exception:
            pass
    cfg = load_cfg()
    ap = argparse.ArgumentParser(description="Tự dàn trang slide theo mẫu, có animation.")
    ap.add_argument("file", nargs="?")
    ap.add_argument("-m", "--mau", default=None)
    ap.add_argument("-a", "--animation", default=None, choices=list(ANIM))
    ap.add_argument("-c", "--chuyen", default=None, choices=list(TRANS))
    ap.add_argument("-o", "--ra", default=None)
    ap.add_argument("-v", "--hoa-van", default=None, choices=list(hoavan.MOTIFS) + ["khong"])
    ap.add_argument("--anh", default=None, choices=list(khoanh.LOAI), help="ảnh trang trí: khong, anh (ảnh chụp), tranh")
    ap.add_argument("--chu-de-anh", default=None, help="gói ảnh (xem --ds), mặc định tu-dong = đoán theo nội dung")
    ap.add_argument("--giu-mau", action="store_true")
    ap.add_argument("--dan-lai", action="store_true")
    ap.add_argument("--theo-doi", action="store_true")
    ap.add_argument("--gui", action="store_true")
    ap.add_argument("--ds", action="store_true")
    a = ap.parse_args()

    if a.ds:
        for tid, th in themes.THEMES.items():
            print(f"{tid:15s} {th['name']:26s} {th['desc']}")
        print(f"\nHọa tiết theo chủ đề — {len(hoavan.MOTIFS)} họa tiết, {len(hoavan.PACKS)} gói"
              " (-v <mã> hoặc mẫu+mã, vd co-dien+dong-son):")
        for pk, mids in hoavan.by_pack():
            print(f"\n[{pk['name']}] {pk['desc']}")
            for mid in mids:
                print(f"  {mid:15s} {hoavan.MOTIFS[mid]['name']:30s} {hoavan.MOTIFS[mid]['desc']}")
        print("\nẢnh trang trí (--anh anh|tranh, --chu-de-anh <gói>, mặc định tu-dong):")
        for g in khoanh.goi_list():
            n = [m["loai"] for m in khoanh.data()["muc"] if m["goi"] == g["id"]]
            print(f"  {g['id']:15s} {g['ten']:30s} {n.count('anh')} ảnh chụp, {n.count('tranh')} tranh")
        return
    if a.theo_doi:
        watch(cfg)
        return
    if a.gui or not a.file:
        gui(cfg, a.file)
        return
    theme = a.mau or cfg["mau_mac_dinh"]
    out = Path(a.ra) if a.ra else ROOT / cfg["thu_muc_ket_qua"]
    opts = make_opts(a.animation or cfg["animation"], a.chuyen or cfg["chuyen_trang"],
                     a.hoa_van or cfg["hoa_van"], cfg["dung_mau_hoa_van"] and not a.giu_mau,
                     cfg["giu_bo_cuc_pptx"] and not a.dan_lai, a.anh or cfg["anh_trang_tri"],
                     a.chu_de_anh or cfg["chu_de_anh"])
    for o in run(Path(a.file), theme, out, opts, cfg["mau_mac_dinh"]):
        print(o)


if __name__ == "__main__":
    main()
