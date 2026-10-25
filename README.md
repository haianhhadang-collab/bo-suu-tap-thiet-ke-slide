# Bộ sưu tập thiết kế slide + Tự dàn trang

**Xem trực tuyến:** https://haianhhadang-collab.github.io/bo-suu-tap-thiet-ke-slide/

Trang web gồm hai phần:

1. **Bộ sưu tập 463 mẫu slide** (SlidesCarnival, Slidesgo, PresentationGO). Lọc theo chủ đề, phong cách, mẫu ấn tượng, mẫu miễn phí; bấm ô màu để chép mã màu.
2. **✦ Tự dàn trang**: thả một file **.pptx, .docx, .pdf, .md hoặc .txt** vào trang, chọn một trong 12 mẫu dựng sẵn hoặc bấm **“Áp dụng mẫu này”** trên bất kỳ thẻ nào để dùng bảng màu của thẻ đó, rồi thêm nếu muốn một trong **61 họa tiết theo chủ đề** (12 gói: lịch sử, văn hóa, lễ hội, thiên nhiên, giáo dục, anime, trường học, di sản, y tế, vũ trụ, thể thao, đối ngoại). Bạn xem trước tức thì rồi tải về file PowerPoint đã có sẵn **animation** và **chuyển trang (Morph)**.
   - Mọi xử lý chạy ngay trong trình duyệt, file không gửi đi đâu.
   - **File .pptx giữ nguyên bố cục gốc** (bảng, ảnh, hộp chữ, hình khối đúng vị trí, kích thước). Công cụ chỉ đổi màu, phông, nền, trang trí theo mẫu. Bỏ chọn ô "Giữ nguyên bố cục" nếu muốn dàn lại từ đầu.
   - Chữ, ảnh, bảng và ghi chú thuyết trình được giữ nguyên.
   - Bố cục tự chọn theo nội dung: danh sách, thẻ, số liệu lớn, quy trình, trích dẫn, bảng, ảnh. Nội dung quá dài tự sang trang.
   - Chỉ dùng phông có sẵn trên Windows và đủ dấu tiếng Việt.

## Công cụ chạy trên máy (Python)

Thư mục [`Tu-dan-trang`](Tu-dan-trang/HUONG-DAN.md) có bản Python của cùng bộ máy, gồm:
- kéo thả file lên `Tu-dan-trang.bat`;
- **hộp thư tự động**: thả file vào thư mục là có ngay bộ slide;
- dòng lệnh, để xử lý hàng loạt.

Hướng dẫn chi tiết và cách viết file nguồn có trong [`HUONG-DAN.md`](Tu-dan-trang/HUONG-DAN.md).

```
pip install python-pptx python-docx pillow pymupdf
python Tu-dan-trang/tu_dan_trang.py "bai-giang.docx" -m gradient -a nhap-chuot
```

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `index.html` | Trang bộ sưu tập, đã nhúng sẵn tính năng tự dàn trang |
| `Tu-dan-trang/web/` | Mã nguồn bản trình duyệt: `engine.js` (đọc file, dàn trang), `pptx.js` (ghi .pptx), `giu-bo-cuc.js` (file .pptx: giữ bố cục gốc, khoác mẫu lên), `preview.js` (xem trước), `ui.*` (giao diện) |
| `Tu-dan-trang/web/gan-vao-bo-suu-tap.py` | Nhúng lại mã nguồn vào `index.html` sau khi sửa (chạy lại nhiều lần không sao) |
| `Sua-chu-giao-dien/` | Công cụ sửa chữ trên trang: mở trang với `#sua`, bấm vào chữ để sửa, lưu thẳng vào file ([hướng dẫn](Sua-chu-giao-dien/HUONG-DAN.md)) |
| `Tu-dan-trang/dantrang/` | Bộ máy bản Python (`giubocuc.py`: giữ bố cục file .pptx, làm cùng các bước như `giu-bo-cuc.js`) |
| `Tu-dan-trang/vi-du/` | File mẫu để thử (.md, .docx, .pdf, .txt) |

Trạng thái miễn phí/Premium của các mẫu được ghi lại tại thời điểm sưu tập (10/2026) và có thể thay đổi. Bản quyền mẫu thuộc về các trang nguồn; khi dùng bản miễn phí, hãy giữ trang ghi công theo điều khoản của từng trang.
