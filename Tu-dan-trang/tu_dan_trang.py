"""TỰ DÀN TRANG — biến .pptx / .docx / .md / .txt thành bộ slide đẹp theo mẫu, có sẵn animation.

Cách dùng:
  python tu_dan_trang.py                      mở cửa sổ chọn file
  python tu_dan_trang.py <file> [tùy chọn]    dàn trang ngay
  python tu_dan_trang.py --theo-doi           tự xử lý mọi file thả vào thư mục Hop-thu-vao
  python tu_dan_trang.py --ds                 xem danh sách mẫu

Tùy chọn:
  -m, --mau <mã>          mẫu thiết kế (mặc định: theo cau-hinh.json), hoặc "tat-ca" để xuất mọi mẫu
  -a, --animation <kiểu>  tu-chay | nhap-chuot | khong
  -c, --chuyen <kiểu>     theo-mau | morph | fade | push | wipe | khong
  -o, --ra <thư mục>      nơi lưu kết quả (mặc định: Ket-qua)
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
from dantrang import themes  # noqa: E402

INBOX = ROOT / "Hop-thu-vao"
OUTBOX = ROOT / "Ket-qua"
DONE = INBOX / "Da-xu-ly"
ERR = INBOX / "Loi"
CONFIG = ROOT / "cau-hinh.json"
EXTS = {".pptx", ".docx", ".md", ".markdown", ".txt"}

ANIM = {"tu-chay": "auto", "nhap-chuot": "click", "khong": "none"}
TRANS = {"theo-mau": None, "morph": "morph", "fade": "fade", "push": "push", "wipe": "wipe", "khong": "none"}

DEFAULT_CFG = {
    "mau_mac_dinh": "song-bien",
    "animation": "tu-chay",
    "chuyen_trang": "theo-mau",
    "thu_muc_ket_qua": "Ket-qua",
    "chu_ky_quet_giay": 3,
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


def make_opts(anim: str, trans: str) -> dict:
    return {"anim": ANIM.get(anim, anim), "transition": TRANS.get(trans, trans)}


def run(src: Path, theme: str, out: Path, opts: dict) -> list[Path]:
    if theme == "tat-ca":
        return B.build_all(src, out, opts)
    return [B.build(src, theme, out, opts)]


# ---------------------------------------------------------------- theo dõi thư mục

def watch(cfg: dict):
    out = ROOT / cfg["thu_muc_ket_qua"]
    for d in (INBOX, out, DONE, ERR):
        d.mkdir(parents=True, exist_ok=True)
    for tid in list(themes.THEMES) + ["tat-ca"]:
        (INBOX / tid).mkdir(exist_ok=True)
    print(f"Đang theo dõi: {INBOX}")
    print(f"  • Thả file vào thư mục gốc  -> dùng mẫu mặc định '{cfg['mau_mac_dinh']}'")
    print("  • Thả vào thư mục con theo tên mẫu (vd song-bien, gradient, tat-ca) -> dùng mẫu đó")
    print(f"  • Kết quả lưu ở: {out}      (Ctrl+C để dừng)\n")
    sizes: dict[Path, int] = {}
    opts = make_opts(cfg["animation"], cfg["chuyen_trang"])
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
                outs = run(f, theme, out, opts)
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
    status = tk.StringVar(value="Chọn file, chọn mẫu rồi bấm “Dàn trang”.")
    last_out: list[Path] = []

    top = ttk.Frame(root, padding=14)
    top.pack(fill="both", expand=True)

    ttk.Label(top, text="1. File cần dàn trang (.pptx, .docx, .md, .txt)", font=FB).grid(row=0, column=0, columnspan=3, sticky="w")
    ttk.Entry(top, textvariable=src, font=F).grid(row=1, column=0, columnspan=2, sticky="ew", pady=(4, 10))

    def pick():
        f = filedialog.askopenfilename(filetypes=[("Tài liệu", "*.pptx *.docx *.md *.txt"), ("Tất cả", "*.*")])
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

    def preview(*_):
        sel = lb.curselection()
        th = themes.get(ids[sel[0] if sel else start])
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
        desc.set(f"{th['desc']}\nPhông: {th['head']} / {th['body_font']}  ·  Chuyển trang: {th['transition']}  ·  Hiệu ứng: {th['effect']}")
    lb.bind("<<ListboxSelect>>", preview)
    preview()

    ttk.Checkbutton(top, text="Xuất cùng lúc tất cả các mẫu (để so sánh)", variable=all_themes).grid(
        row=5, column=0, sticky="w", pady=(6, 0))

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
            messagebox.showwarning("Thiếu file", "Hãy chọn một file .pptx, .docx, .md hoặc .txt.")
            return
        sel = lb.curselection()
        theme = "tat-ca" if all_themes.get() else ids[sel[0] if sel else start]
        tr = next((k for k, v in names.items() if v == cb.get()), "theo-mau")
        opts = make_opts(anim.get(), tr)
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
    ap.add_argument("--theo-doi", action="store_true")
    ap.add_argument("--gui", action="store_true")
    ap.add_argument("--ds", action="store_true")
    a = ap.parse_args()

    if a.ds:
        for tid, th in themes.THEMES.items():
            print(f"{tid:15s} {th['name']:26s} {th['desc']}")
        return
    if a.theo_doi:
        watch(cfg)
        return
    if a.gui or not a.file:
        gui(cfg, a.file)
        return
    theme = a.mau or cfg["mau_mac_dinh"]
    out = Path(a.ra) if a.ra else ROOT / cfg["thu_muc_ket_qua"]
    opts = make_opts(a.animation or cfg["animation"], a.chuyen or cfg["chuyen_trang"])
    for o in run(Path(a.file), theme, out, opts):
        print(o)


if __name__ == "__main__":
    main()
