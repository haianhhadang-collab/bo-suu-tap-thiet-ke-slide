# Tự dàn trang slide

Công cụ nhận một file **.pptx, .docx, .md hoặc .txt**, tự dàn lại thành bộ slide PowerPoint theo một trong **10 mẫu thiết kế**. Bộ slide được thêm sẵn **animation** và **hiệu ứng chuyển trang** của PowerPoint. Nội dung, ảnh và ghi chú thuyết trình được giữ nguyên.

## Ba cách dùng

| Cách | Làm gì | Hợp khi |
|---|---|---|
| **Kéo thả** | Kéo file thả lên `Tu-dan-trang.bat`, hoặc nhấp đúp để mở cửa sổ. Chọn mẫu ở cửa sổ, xem trước màu và bấm **Dàn trang**. | Làm từng file, muốn chọn mẫu |
| **Hộp thư tự động** | Nhấp đúp `Theo-doi-hop-thu.bat` rồi để cửa sổ chạy. File nào thả vào `Hop-thu-vao` sẽ tự được dàn trang, kết quả nằm trong `Ket-qua`. | Nhận file thường xuyên, xử lý hàng loạt |
| **Dòng lệnh** | `python tu_dan_trang.py "bai-giang.docx" -m gradient -a nhap-chuot` | Tự động hóa, gọi từ script khác |

### Hộp thư tự động chọn mẫu theo thư mục
- Thả vào `Hop-thu-vao\`: dùng mẫu mặc định (`mau_mac_dinh` trong `cau-hinh.json`).
- Thả vào `Hop-thu-vao\gradient\`, `Hop-thu-vao\co-dien\`…: dùng đúng mẫu đó.
- Thả vào `Hop-thu-vao\tat-ca\`: xuất cùng lúc cả 10 mẫu để so sánh.
- File đã xử lý được chuyển sang `Hop-thu-vao\Da-xu-ly`. File lỗi được chuyển sang `Hop-thu-vao\Loi`.

## 10 mẫu có sẵn

| Mã | Tên | Hợp với |
|---|---|---|
| `song-bien` | Sóng biển | Bài giảng sáng tạo; sóng ở chân trang trôi nhẹ giữa các trang |
| `gradient` | Gradient chuyên nghiệp | Báo cáo, thực tập, hội thảo |
| `toi-gian` | Tối giản | Hội đồng, học thuật, nội dung nhiều chữ |
| `nen-toi` | Nền tối neon | Công nghệ, sự kiện, phòng tối |
| `thanh-lich` | Thanh lịch vàng kim | Lễ, báo cáo trang trọng |
| `co-dien` | Cổ điển · Vintage | Lịch sử, văn hóa, văn học |
| `de-thuong` | Dễ thương pastel | Lớp học, thiếu nhi, cộng đồng |
| `nghe-thuat` | Nghệ thuật táo bạo | Sáng tạo, truyền thông, muốn gây ấn tượng mạnh |
| `thien-nhien` | Thiên nhiên | Môi trường, sức khỏe, giáo dục |
| `chuyen-nghiep` | Chuyên nghiệp xanh navy | Doanh nghiệp, cơ quan nhà nước |

Mọi mẫu chỉ dùng phông có sẵn trên Windows và **đủ dấu tiếng Việt**: Segoe UI, Candara, Constantia, Corbel, Palatino Linotype, Cambria. Trebuchet MS, Georgia và Impact không được dùng vì thiếu chữ ơ, ư, ạ…

**Thêm mẫu riêng:** xem `mau\vi-du-mau-rieng.json.txt`. Chỉ cần đổi màu, phông, kiểu trang trí rồi lưu thành `.json` trong thư mục `mau`.

## Công cụ tự làm gì

- **Nhận diện nội dung** để chọn bố cục phù hợp:
  - danh sách → các ý hiện lần lượt
  - "Nhãn: nội dung" → lưới thẻ
  - con số ("70%: …", "3.260 km: …") → số lớn nổi bật
  - "Bước 1, Bước 2…" → sơ đồ quy trình
  - một câu ngắn → trang nhấn mạnh
  - trích dẫn, bảng, ảnh kèm chữ, nhiều ảnh, nhiều nhóm có tiêu đề → chia cột
- **Trang đặc biệt**: tự tạo trang bìa. Mục chỉ có tiêu đề thành trang chương (01, 02…). Câu "Cảm ơn / Thank you / Q&A" ở cuối thành trang kết.
- **Không tràn chữ**: đo chữ bằng chính file phông của Windows để chọn cỡ chữ. Nội dung quá dài tự sang trang "(tiếp)".
- **Animation**: chọn một trong ba chế độ.
  - Tự chạy khi vào trang (mặc định)
  - Hiện từng ý khi nhấp chuột: hợp khi giảng
  - Không có animation
- **Chuyển trang**: Morph với các mẫu có hình trang trí (sóng, quầng sáng, lá… trôi mượt giữa các trang), Mờ dần hoặc Đẩy với các mẫu còn lại. Có thể đổi trong cửa sổ hoặc `cau-hinh.json`.
- **Giữ nguyên**: chữ, ảnh, bảng, ghi chú thuyết trình. Nguồn trích dẫn chữ nhỏ ở đáy slide gốc được đưa xuống chân trang.

## Viết file nguồn để dàn trang đẹp nhất

**Markdown (.md)**: xem `vi-du\bai-giang-mau.md`.

```
# Tên bài trình bày          ← trang bìa (dòng đầu)
Phụ đề                        ← đoạn đầu sau tên bài
- Tác giả / đơn vị / ngày     ← các dòng thông tin trên trang bìa
# Phần 1. Bối cảnh            ← trang chương
## Tiêu đề trang              ← mỗi ## là một trang
- Ý gạch đầu dòng
### Nhãn thẻ                  ← dòng tiếp theo thành nội dung thẻ
70%: mô tả                    ← số liệu lớn
Bước 1: …                     ← sơ đồ quy trình
> Trích dẫn
| bảng | markdown |
![chú thích](anh.jpg)
Ghi chú: lời thuyết trình     ← vào ghi chú (notes) của trang
---                           ← ép sang trang mới
```

**Word (.docx)**: dùng các kiểu có sẵn của Word.
- Title: tên bài. Subtitle: phụ đề.
- Heading 1/2: tiêu đề trang. Heading 1 đứng ngay trước Heading 2 thành trang chương.
- Heading 3: nhãn thẻ.
- List Bullet: gạch đầu dòng.
- Bảng và ảnh chèn trong văn bản đều được giữ lại.

**Văn bản (.txt)**: xem `vi-du\ghi-chu-nhanh.txt`. Khối đầu tiên là tên bài, phụ đề và thông tin. Mỗi khối cách nhau một dòng trống là một trang; dòng đầu ngắn của khối là tiêu đề trang.

**PowerPoint (.pptx)**: công cụ đọc tiêu đề, khối chữ, nhãn đi kèm nội dung, ảnh, bảng và ghi chú. Slide gốc có sơ đồ vẽ tay phức tạp (hình tròn nối nhau, mũi tên…) sẽ được chuyển thành thẻ hoặc danh sách. Nên xem lại các trang đó.

## Cài đặt (chỉ một lần)

Cần Python 3.10 trở lên và ba thư viện:

```
pip install python-pptx python-docx pillow
```

Cấu hình trong `cau-hinh.json` (file tự tạo ở lần chạy đầu):
- `mau_mac_dinh`: mẫu mặc định
- `animation`: `tu-chay` | `nhap-chuot` | `khong`
- `chuyen_trang`: `theo-mau` | `morph` | `fade` | `push` | `wipe` | `khong`
- `thu_muc_ket_qua`: thư mục lưu kết quả
- `chu_ky_quet_giay`: chu kỳ quét hộp thư, tính bằng giây

## Kiểm tra kết quả

`kiem-tra.ps1` mở file bằng PowerPoint (ẩn), xuất ảnh từng trang và đếm animation, để xem nhanh không cần mở tay:

```
powershell -ExecutionPolicy Bypass -File kiem-tra.ps1 "Ket-qua\ten-file.pptx" "Ket-qua\anh"
```
