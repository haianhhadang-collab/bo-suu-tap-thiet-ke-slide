"""Gắn tính năng "Tự dàn trang" (chạy trong trình duyệt) vào Bo-suu-tap-thiet-ke-slide.html.
Chạy lại bao nhiêu lần cũng được: các phần nằm giữa mốc TDT sẽ được thay mới.
    python gan-vao-bo-suu-tap.py [đường dẫn file html ...]
"""
import re
import sys
from pathlib import Path

WEB = Path(__file__).resolve().parent
# mặc định: index.html ở gốc kho (bản đăng web) và Bo-suu-tap-thiet-ke-slide.html cạnh thư mục Tu-dan-trang
DEFAULT = [p for p in (WEB.parent.parent / "index.html", WEB.parent.parent / "Bo-suu-tap-thiet-ke-slide.html") if p.exists()]


def block(text, start, end, content):
    """Thay nội dung giữa hai mốc; trả về (văn bản mới, có thay hay không)."""
    pat = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    if pat.search(text):
        return pat.sub(lambda m: start + content + end, text, count=1), True
    return text, False


def main(paths):
    css = (WEB / "ui.css").read_text(encoding="utf-8")
    dialog = (WEB / "ui.html").read_text(encoding="utf-8")
    kho = (WEB / "kho-anh.html").read_text(encoding="utf-8")
    len_dau = ('<button class="len-dau" id="len-dau" type="button" aria-label="Lên đầu trang" title="Lên đầu trang">'
               '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" '
               'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>')
    khung = (WEB / "khung.b64.txt").read_text(encoding="utf-8").strip()
    js = "\n".join((WEB / f).read_text(encoding="utf-8") for f in ("engine.js", "hoa-van.js", "kho-anh.js", "pptx.js", "preview.js", "giu-bo-cuc.js", "ui.js", "kho-anh-trang.js", "len-dau.js"))
    assert "</script" not in js.lower()
    head = ('\n<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>\n'
            '<script>window.JSZip||document.write(\'<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"><\\/script>\')</script>\n')
    cta = ('\n    <div class="tdt-cta">\n'
           '      <button class="btn-main" id="tdt-open">✦ Tự dàn trang file của bạn</button>\n'
           '      <p><b>Up file lên:</b> File chấp nhận: .pptx, .docx, .pdf, .md hoặc .txt<br>'
           '<b>Các chức năng tự động:</b> dàn trang, chọn màu chữ, màu nền theo chủ đề; file .pptx giữ nguyên bố cục gốc<br>'
           '<b>Các chức năng tùy chọn:</b> họa tiết, ảnh trang trí theo chủ đề (<a href="#kho-anh">xem kho ảnh</a>); tạo chuyển động</p>\n    </div>\n    ')
    # dữ liệu kho ảnh (~450 KB) nạp từ file riêng, ảnh chụp nạp từng ảnh khi cần (xem web/kho-anh.js)
    script = f'\n<script src="Tu-dan-trang/kho-anh/kho-anh.js"></script>\n<script>\nwindow.TU_DAN_TRANG_KHUNG="{khung}";\n{js}\n</script>\n'

    for p in paths:
        if not p.exists():
            print("bỏ qua (không có):", p)
            continue
        s = p.read_text(encoding="utf-8")
        # 1. thư viện JSZip trong <head>
        s, ok = block(s, "<!--TDT-HEAD-->", "<!--/TDT-HEAD-->", head)
        if not ok:
            s = s.replace("</head>", "<!--TDT-HEAD-->" + head + "<!--/TDT-HEAD-->\n</head>", 1)
        # 2. CSS
        s, ok = block(s, "/*TDT-CSS*/", "/*/TDT-CSS*/", "\n" + css)
        if not ok:
            s = s.replace("</style>", "/*TDT-CSS*/\n" + css + "/*/TDT-CSS*/\n</style>", 1)
        # 3. nút mở ở đầu trang (sau dãy số liệu)
        s, ok = block(s, "<!--TDT-CTA-->", "<!--/TDT-CTA-->", cta)
        if not ok:
            anchor = '<div class="stat"><b>3</b><span>nguồn tải miễn phí</span></div>\n    </div>'
            assert anchor in s, "không tìm thấy dãy số liệu ở đầu trang"
            s = s.replace(anchor, anchor + "\n    <!--TDT-CTA-->" + cta + "<!--/TDT-CTA-->", 1)
        # 4. nút "Áp dụng mẫu này" trên mỗi thẻ
        if 'class="apply"' not in s:
            old = '<a class="go" href="${url}" target="_blank" rel="noopener">Xem &amp; tải mẫu ↗</a>'
            assert old in s, "không tìm thấy liên kết trên thẻ"
            s = s.replace(old, '<div class="acts"><a class="go" href="${url}" target="_blank" rel="noopener">Xem &amp; tải mẫu ↗</a>'
                               '<button class="apply" data-url="${esc(url)}" title="Dàn trang file của bạn theo phong cách và bảng màu của mẫu này">✦ Áp dụng mẫu này</button></div>', 1)
        # 5. hộp thoại
        s, ok = block(s, "<!--TDT-DIALOG-->", "<!--/TDT-DIALOG-->", "\n" + dialog)
        if not ok:
            s = s.replace('<div class="toast" id="toast"></div>', '<div class="toast" id="toast"></div>\n<!--TDT-DIALOG-->\n' + dialog + '<!--/TDT-DIALOG-->', 1)
        # 6. mục Kho ảnh trang trí (sau danh sách mẫu)
        s, ok = block(s, "<!--KHO-ANH-->", "<!--/KHO-ANH-->", "\n" + kho)
        if not ok:
            assert "</main>" in s, "không tìm thấy </main>"
            s = s.replace("</main>", "</main>\n<div class=\"wrap\"><!--KHO-ANH-->\n" + kho + "<!--/KHO-ANH--></div>", 1)
        # 7. nút lên đầu trang (góc phải dưới, hiện khi đã cuộn xuống)
        s, ok = block(s, "<!--LEN-DAU-->", "<!--/LEN-DAU-->", len_dau)
        if not ok:
            s = s.replace('<div class="toast" id="toast"></div>', '<!--LEN-DAU-->' + len_dau + '<!--/LEN-DAU-->\n<div class="toast" id="toast"></div>', 1)
        # 8. bộ máy + giao diện (đặt sau script chính của trang)
        s, ok = block(s, "<!--TDT-JS-->", "<!--/TDT-JS-->", script)
        if not ok:
            i = s.rindex("</body>")
            s = s[:i] + "<!--TDT-JS-->" + script + "<!--/TDT-JS-->\n" + s[i:]
        p.write_text(s, encoding="utf-8", newline="\n")
        print(f"đã cập nhật {p}  ({len(s.encode('utf-8')) // 1024} KB)")


if __name__ == "__main__":
    main([Path(a) for a in sys.argv[1:]] or DEFAULT)
