"""Gắn công cụ "Sửa chữ giao diện" (sua-chu.js) vào trang Bộ sưu tập.
Chạy lại bao nhiêu lần cũng được: mã nằm giữa hai mốc SUA-CHU được thay mới,
còn chữ người dùng đã sửa (khối sua-chu-data) của từng file được giữ nguyên.
    python gan-sua-chu.py [đường dẫn file html ...]
Không ghi đường dẫn: cập nhật mọi bản có sẵn (bản làm việc và bản đăng web).

Lưu chữ đã sửa người dùng chép ra từ trang (nút “Chép chữ đã sửa”, dạng {"v":1,"chu":{...}}):
    python gan-sua-chu.py --du-lieu du-lieu.json [đường dẫn file html ...]
    (--du-lieu - : đọc từ đầu vào chuẩn). Dữ liệu này thay hẳn khối sua-chu-data của mọi file đích.
"""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DEFAULT = [p for p in (ROOT / "Bo-suu-tap-thiet-ke-slide.html", ROOT / "index.html",
                       ROOT / "_xuat-ban" / "bo-suu-tap-thiet-ke-slide" / "index.html") if p.exists()]
START, END = "<!--SUA-CHU-->", "<!--/SUA-CHU-->"
OPEN = '<script type="application/json" id="sua-chu-data">'
DATA_RE = re.compile(re.escape(OPEN) + r"(.*?)</script>", re.S)
BLOCK_RE = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
EMPTY = '{"v":1,"chu":{}}'


def format_data(raw):
    """Kiểm tra và viết lại dữ liệu như trang tự ghi: mỗi chữ một dòng, '<' viết thành \\u003c."""
    d = json.loads(raw)
    chu = d.get("chu") if isinstance(d, dict) else None
    assert isinstance(chu, dict) and all(isinstance(k, str) and isinstance(v, str) for k, v in chu.items()), \
        'dữ liệu phải có dạng {"v":1,"chu":{"chữ gốc":"chữ mới", ...}}'
    rows = ",".join("\n" + json.dumps(k, ensure_ascii=False) + ":" + json.dumps(v, ensure_ascii=False) for k, v in chu.items())
    return ('{"v":1,"chu":{' + rows + ("\n" if chu else "") + "}}").replace("<", "\\u003c")


def main(paths, new_data=None):
    js = (HERE / "sua-chu.js").read_text(encoding="utf-8")
    assert "</script" not in js.lower() and "<!--" not in js, "sua-chu.js không được chứa </script hoặc <!--"
    seen = {}
    for p in paths:
        if not p.exists():
            print("bỏ qua (không có):", p)
            continue
        s = p.read_text(encoding="utf-8")
        m = DATA_RE.search(s)
        data = new_data or (m.group(1).strip() if m else EMPTY)
        n = len(json.loads(data).get("chu", {}))   # dữ liệu hỏng thì dừng, không ghi đè
        block = f"{START}\n{OPEN}{data}</script>\n<script>\n{js}</script>\n{END}"
        if BLOCK_RE.search(s):
            s = BLOCK_RE.sub(lambda _: block, s, count=1)
        else:
            assert "</head>" in s, f"không tìm thấy </head> trong {p}"
            s = s.replace("</head>", block + "\n</head>", 1)
        p.write_text(s, encoding="utf-8", newline="\n")
        seen[p] = data
        print(f"đã cập nhật {p}  ({len(s.encode('utf-8')) // 1024} KB, {n} chữ đã sửa)")
    if len(set(seen.values())) > 1:
        print("CHÚ Ý: chữ đã sửa ở các bản không giống nhau — mở trang với #sua, bấm Lưu và chọn đủ các file để đồng bộ.")


if __name__ == "__main__":
    args, new_data = sys.argv[1:], None
    if "--du-lieu" in args:
        i = args.index("--du-lieu")
        src = args[i + 1]
        new_data = format_data(sys.stdin.read() if src == "-" else Path(src).read_text(encoding="utf-8"))
        del args[i:i + 2]
    main([Path(a) for a in args] or DEFAULT, new_data)
