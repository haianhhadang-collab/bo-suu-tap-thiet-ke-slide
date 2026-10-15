# Sửa chữ giao diện

Đổi chữ trên trang Bộ sưu tập (tiêu đề, đoạn giới thiệu, nút, tên và mô tả chủ đề, chân trang, chữ trong hộp thoại Tự dàn trang…) ngay trong trình duyệt, rồi lưu thẳng vào file.

## Cách dùng

1. Mở trang rồi thêm `#sua` vào cuối địa chỉ, vd `D:\SLide\Bo-suu-tap-thiet-ke-slide.html#sua`. Thanh **Sửa chữ** hiện ở chân màn hình.
2. Bấm vào chữ cần sửa, gõ chữ mới (trang đổi ngay khi gõ). **Enter** để xong, **Esc** để hủy.
   Chữ giống hệt nhau ở nhiều chỗ (vd “Xem & tải mẫu ↗” trên mọi thẻ) đổi cùng lúc.
3. Bấm **Lưu vào file**. Lần đầu, chọn file trang trên máy. Trình duyệt hỏi quyền ghi thì bấm cho phép.
   Muốn lưu cả bản đăng web: mở **Đã sửa** → **+ Thêm file** → chọn `_xuat-ban\bo-suu-tap-thiet-ke-slide\index.html`.
   Các lần sau chỉ cần bấm **Lưu vào file**: trình duyệt nhớ các file đã chọn.
4. Muốn sửa chữ trong hộp thoại Tự dàn trang: gạt **Đang sửa chữ** sang tắt, mở hộp thoại, gạt bật lại.

Lưu thẳng vào file cần Chrome hoặc Edge. Trình duyệt khác thì **Lưu vào file** tải về một file HTML mới để chép đè lên file cũ.

**Đã sửa** liệt kê mọi chữ đã đổi (gốc → mới). Bấm một dòng để tìm chữ đó trên trang, **↺ Về gốc** để bỏ một chữ, **Bỏ thay đổi chưa lưu** để quay về bản trong file.

Không sửa ở đây: tên và mô tả từng mẫu slide, các con số tự đếm, những gì Tự dàn trang vẽ ra, nhãn “Mới” trên thẻ (vẽ bằng CSS).

## Cách hoạt động

- Chữ đã sửa nằm trong khối `<script type="application/json" id="sua-chu-data">` trong `<head>` của trang, dạng `"chữ gốc": "chữ mới"`, mỗi chữ một dòng.
- `sua-chu.js` chạy ngay trong `<head>`. Nó thay chữ lúc trang đang tải, kể cả chữ do mã của trang vẽ ra sau (tên chủ đề, nút Thu gọn/Mở tất cả…).
- Khi lưu, công cụ đọc lại file trên máy và chỉ thay khối dữ liệu. Phần khác của file (mẫu mới thêm, mã Tự dàn trang…) không bị đụng.
- **Chú ý khi sửa mã nguồn trang:** chữ hiện ra có thể đến từ khối dữ liệu, không phải từ HTML. Nếu đổi chữ gốc trong mã, dòng sửa tương ứng không còn tác dụng (danh sách **Đã sửa** báo “không còn chữ gốc này trên trang”).

## Sửa mã công cụ

Sửa `sua-chu.js` rồi chạy:

```
python Sua-chu-giao-dien/gan-sua-chu.py
```

Script nhúng mã mới vào cả `Bo-suu-tap-thiet-ke-slide.html` lẫn `_xuat-ban/bo-suu-tap-thiet-ke-slide/index.html` và giữ nguyên chữ đã sửa của từng file. Chạy lại nhiều lần không sao. Sau đó chép thư mục này sang `_xuat-ban/bo-suu-tap-thiet-ke-slide/Sua-chu-giao-dien/` để hai bản giống nhau.
