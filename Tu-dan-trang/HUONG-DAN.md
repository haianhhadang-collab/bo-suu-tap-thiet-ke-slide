# Tự dàn trang slide

Công cụ nhận một file **.pptx, .docx, .md hoặc .txt**, tự dàn lại thành bộ slide PowerPoint theo một trong **12 mẫu thiết kế**. Bộ slide được thêm sẵn **animation** và **hiệu ứng chuyển trang** của PowerPoint. Nội dung, ảnh và ghi chú thuyết trình được giữ nguyên.

## Ba cách dùng

| Cách | Làm gì | Hợp khi |
|---|---|---|
| **Kéo thả** | Kéo file thả lên `Tu-dan-trang.bat`, hoặc nhấp đúp để mở cửa sổ. Chọn mẫu ở cửa sổ, xem trước màu và bấm **Dàn trang**. | Làm từng file, muốn chọn mẫu |
| **Hộp thư tự động** | Nhấp đúp `Theo-doi-hop-thu.bat` rồi để cửa sổ chạy. File nào thả vào `Hop-thu-vao` sẽ tự được dàn trang, kết quả nằm trong `Ket-qua`. | Nhận file thường xuyên, xử lý hàng loạt |
| **Dòng lệnh** | `python tu_dan_trang.py "bai-giang.docx" -m gradient -a nhap-chuot` | Tự động hóa, gọi từ script khác |

### Hộp thư tự động chọn mẫu theo thư mục
- Thả vào `Hop-thu-vao\`: dùng mẫu mặc định (`mau_mac_dinh` trong `cau-hinh.json`).
- Thả vào `Hop-thu-vao\gradient\`, `Hop-thu-vao\co-dien\`…: dùng đúng mẫu đó.
- Thả vào `Hop-thu-vao\tat-ca\`: xuất cùng lúc cả 12 mẫu để so sánh.
- Thả vào `Hop-thu-vao\dong-son\`, `Hop-thu-vao\tet\`… (thư mục mang tên họa tiết): dùng mẫu mặc định kèm họa tiết đó.
- Muốn chọn cả mẫu lẫn họa tiết: tự tạo thư mục tên `mẫu+họa-tiết`, ví dụ `Hop-thu-vao\co-dien+dong-son\` hoặc `Hop-thu-vao\tat-ca+cach-mang\`.
- File đã xử lý được chuyển sang `Hop-thu-vao\Da-xu-ly`. File lỗi được chuyển sang `Hop-thu-vao\Loi`.

## 12 mẫu có sẵn

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
| `truyen-tranh` | Truyện tranh · Comic | Thiếu nhi, ngoại khóa; viền mực đen dày, chấm tram, tia nắng, thẻ có bóng đổ khối |
| `manga` | Manga đen trắng | Câu lạc bộ anime, manga; trắng đen như trang truyện, đường tốc độ, một điểm đỏ |

Mọi mẫu chỉ dùng phông có sẵn trên Windows và **đủ dấu tiếng Việt**: Segoe UI, Candara, Constantia, Corbel, Palatino Linotype, Cambria. Trebuchet MS, Georgia và Impact không được dùng vì thiếu chữ ơ, ư, ạ…

**Thêm mẫu riêng:** xem `mau\vi-du-mau-rieng.json.txt`. Chỉ cần đổi màu, phông, kiểu trang trí rồi lưu thành `.json` trong thư mục `mau`. Muốn mẫu riêng luôn có họa tiết, thêm khóa `"motif": "dong-son"` (họa tiết đi kèm nhưng giữ màu của mẫu).

## Họa tiết theo chủ đề

Có **36 họa tiết chia 6 gói**. Họa tiết vẽ chồng lên **bất kỳ mẫu nào** bằng hình vector của PowerPoint, nên sửa màu, kéo, xóa được như hình thường (không dùng ảnh). Hình và màu giống hệt họa tiết của bản web.

Cột "Màu": **riêng** = có bảng màu riêng (bỏ được, xem dưới); **theo mẫu** = luôn dùng màu của mẫu.

**Gói Lịch sử · Cách mạng**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `cach-mang` | Cách mạng · Cờ đỏ sao vàng | Nền đỏ, sao vàng năm cánh, tia nắng kiểu tranh cổ động | riêng | Kỷ niệm, lịch sử Đảng, ngày lễ lớn |
| `ho-chi-minh` | Hồ Chí Minh · Sen vàng | Đỏ son, vàng kim, hoa sen nét mảnh và ngôi sao | riêng | Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh |
| `dong-son` | Lịch sử · Trống đồng Đông Sơn | Mặt trống đồng: sao giữa, vòng chim Lạc, hoa văn tròn | riêng | Lịch sử, văn hóa Việt Nam |
| `bua-liem` | Đảng · Búa liềm | Búa liềm vàng trên nền đỏ cờ Đảng | riêng | Sinh hoạt chi bộ, lịch sử Đảng, nghị quyết, ngày thành lập Đảng |
| `vong-lua` | Vòng lúa · Ngôi sao | Hai bông lúa vàng ôm ngôi sao | riêng | Nông nghiệp, nông thôn mới, thi đua, khen thưởng |
| `co-bay` | Chiến thắng · Cờ bay | Cờ đỏ sao vàng tung bay trên đồi, tông xanh bộ đội | riêng | Chiến thắng lịch sử, quân đội, 22/12, 30/4 |

**Gói Văn hóa · Hoa văn truyền thống**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `hoi-van` | Truyền thống · Viền hồi văn | Dải hoa văn chữ "hồi" ở mép trang | theo mẫu | Văn hóa, truyền thống, lễ kỷ niệm |
| `may-cuon` | Mây cuộn · Mây lành | Dải mây cuộn nét mảnh ở góc trang | theo mẫu | Mỹ thuật cổ, đình chùa, lễ hội truyền thống |
| `tho-cam` | Thổ cẩm · Dân tộc | Dải thổ cẩm đỏ, vàng, chàm, hoa văn hình thoi và răng cưa | riêng | Văn hóa các dân tộc, du lịch, vùng cao |
| `gach-bong` | Gạch bông · Hoài cổ | Mảng gạch bông hoa bốn cánh kiểu nhà phố xưa | theo mẫu | Hoài niệm, kiến trúc, văn hóa đô thị |
| `song-nuoc` | Sóng nước · Vảy cá | Lớp sóng hình vảy cá ở chân trang | theo mẫu | Sông nước, biển đảo, vùng ven biển |
| `luy-tre` | Lũy tre làng | Khóm tre xanh bên mép trang | riêng | Làng quê, văn học, con người Việt Nam |
| `non-nuoc` | Non nước · Thủy mặc | Lớp núi mờ kiểu thủy mặc, mặt trời đỏ như con dấu | riêng | Địa lý, văn chương, quê hương, du lịch |

**Gói Lễ hội · Mùa xuân**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `tet` | Mùa xuân · Hoa mai ngày Tết | Cành mai vàng trên nền đỏ son và kem ấm | riêng | Chúc Tết, mừng Xuân, ngoại khóa |
| `hoa-dao` | Hoa đào · Xuân miền Bắc | Cành đào hồng trên nền mận chín | riêng | Tết miền Bắc, 8/3, chủ đề phụ nữ |
| `den-long` | Đèn lồng · Phố Hội | Chùm đèn lồng đỏ, cam, vàng tỏa sáng trên nền đêm | riêng | Lễ hội, phố cổ Hội An, đêm rằm |
| `trung-thu` | Trung thu · Trăng rằm | Trăng tròn, đèn ông sao, mây bay trên nền đêm xanh | riêng | Tết Trung thu, thiếu nhi, ngoại khóa |
| `phao-hoa` | Pháo hoa · Mừng lễ | Chùm pháo hoa vàng, hồng, xanh trên nền đêm | riêng | Năm mới, lễ kỷ niệm, tổng kết, khai giảng |

**Gói Thiên nhiên · Môi trường**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `dam-sen` | Đầm sen | Hoa sen hồng, nụ sen, lá sen xanh | riêng | Quốc hoa, thiên nhiên, chủ đề thanh cao |
| `bac-thang` | Ruộng bậc thang | Thửa ruộng xanh vàng uốn lượn ở góc trang | riêng | Nông nghiệp, vùng cao, mùa lúa chín |
| `la-nhiet-doi` | Lá nhiệt đới | Tàu lá dừa, lá cọ vươn ra từ góc trang | riêng | Miền Tây, biển đảo, môi trường, mùa hè |
| `trai-dat` | Trái Đất xanh | Quả địa cầu kinh tuyến nảy mầm xanh | riêng | Bảo vệ môi trường, biến đổi khí hậu, phát triển bền vững |

**Gói Giáo dục · Khoa học**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `sach-but` | Sách vở · Bút chì | Sách mở và bút chì nét mảnh | theo mẫu | Bài giảng, 20/11, khuyến học, thư viện |
| `nguyen-tu` | Nguyên tử · Khoa học | Nguyên tử với ba quỹ đạo electron | theo mẫu | Vật lý, hóa học, STEM |
| `mach-dien` | Mạch điện tử · Công nghệ | Đường mạch in và nút hàn trên nền xanh đêm | riêng | Tin học, chuyển đổi số, AI, kỹ thuật |
| `hinh-hoc` | Hình học · Toán học | Tam giác, hình tròn, hình vuông, lưới chấm nhiều màu | theo mẫu | Toán học, tư duy, lớp học sáng tạo |

**Gói Anime · Comic · Manga** (hình tự vẽ theo ngôn ngữ của thể loại, không dùng nhân vật hay logo của bộ truyện, phim nào)

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `toc-do` | Manga · Đường tốc độ | Chùm đường tập trung trắng đen, một vạch đỏ | riêng | Câu lạc bộ anime, thể thao, hành động |
| `cham-tram` | Comic · Chấm tram & tia nắng | Nền đỏ tia nắng vàng, chấm tram, khung mực dày | riêng | Thiếu nhi, ngoại khóa |
| `bum` | Comic · BÙM! POW! | Vụ nổ răng cưa có chữ BÙM!, POW!, WOW! | riêng | Mở màn, câu đố, trò chơi |
| `bong-thoai` | Bong bóng thoại | Bong bóng lời thoại, bong bóng suy nghĩ có chữ | riêng | Hội thoại, tiếng Anh giao tiếp, kể chuyện |
| `nang-luong` | Shōnen · Hào quang năng lượng | Quả cầu sáng, hào quang lửa, tia sét | riêng | Thi đua, khởi động, thử thách |
| `hai-tac` | Phiêu lưu · Hải tặc & bản đồ | La bàn, đường nét đứt, dấu X kho báu | riêng | Khám phá, trò chơi tìm kho báu |
| `mang-nhen` | Mạng nhện · Đô thị về đêm | Mạng nhện ở góc, phố đêm | riêng | Hành động, chủ đề thành phố |
| `sieu-anh-hung` | Siêu anh hùng · Khiên tia sét | Khiên đỏ viền vàng có tia sét, tia nắng | riêng | Lòng dũng cảm, tấm gương người tốt |
| `giap-hud` | Giáp công nghệ · HUD | Vòng HUD vàng quanh lõi sáng xanh | riêng | Công nghệ, robot, khoa học viễn tưởng |
| `khung-truyen` | Manga · Khung truyện | Ba ô khung truyện, chấm tram, vệt tốc độ | riêng | Kể chuyện bằng tranh, câu lạc bộ manga |

- **Trang bìa, trang chương, trang kết**: họa tiết lớn thay cho trang trí của mẫu. Riêng `hoi-van`, `may-cuon`, `sach-but`, `nguyen-tu`, `hinh-hoc` giữ trang trí của mẫu và vẽ thêm lên trên. Họa tiết dạng biểu tượng (búa liềm, vòng lúa, cờ, đầm sen, Trái Đất, sách bút, nguyên tử) nằm to bên phải trang bìa, trang chương và chìm mờ giữa trang kết. Chữ tự lùi vào để không đè lên họa tiết; tên bài dài quá thì cỡ chữ tự nhỏ lại.
- **Trang nội dung**: chỉ thêm dải màu, họa tiết nhỏ hoặc hình chìm rất nhạt ở góc, trang trí của mẫu vẫn giữ.
- **Ký hiệu đầu dòng theo chủ đề**: nhiều họa tiết đổi dấu đầu dòng cho hợp (★ cách mạng, siêu anh hùng; ✿ hoa mai, hoa đào; ❀ sen; ◆ trống đồng, hồi văn, thổ cẩm; ✦ pháo hoa, Trung thu…; ▶ tốc độ, khung truyện, mạch điện), kể cả khi giữ màu của mẫu.
- **Bảng màu của họa tiết**: với họa tiết có màu **riêng**, mặc định đổi cả màu nền, màu chữ, màu nhấn sang bảng màu của họa tiết (ví dụ trống đồng dùng tông đồng thau). Muốn giữ màu của mẫu thì bỏ chọn "Dùng bảng màu của họa tiết" trong cửa sổ, đặt `"dung_mau_hoa_van": false` trong `cau-hinh.json`, hoặc thêm `--giu-mau` ở dòng lệnh. Họa tiết **theo mẫu** luôn dùng màu của mẫu.
- Tên file kết quả ghi cả họa tiết, ví dụ `bai-giang - Cổ điển · Vintage + Trống đồng.pptx`.

Cách chọn họa tiết:
- **Cửa sổ**: dưới danh sách mẫu, chọn gói ở ô thứ nhất (hoặc "Tất cả các gói"), rồi chọn họa tiết ở ô thứ hai.
- **Hộp thư**: thư mục `Hop-thu-vao\<họa-tiết>\` hoặc `Hop-thu-vao\<mẫu>+<họa-tiết>\` (xem trên).
- **Dòng lệnh**: `python tu_dan_trang.py bai-giang.md -m co-dien+dong-son`, hoặc `-m co-dien -v dong-son`. Xem danh sách theo gói bằng `--ds`.
- **Mặc định cho mọi file**: `"hoa_van": "dong-son"` trong `cau-hinh.json` (`"khong"` = không dùng). Thư mục hộp thư hoặc `-m mẫu+khong` vẫn ghi đè được.

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
- `hoa_van`: họa tiết mặc định, `khong` hoặc một mã trong bảng họa tiết ở trên (vd `dong-son`, `trung-thu`, `sach-but`)
- `dung_mau_hoa_van`: `true` dùng bảng màu của họa tiết, `false` giữ màu của mẫu

## Kiểm tra kết quả

`kiem-tra.ps1` mở file bằng PowerPoint (ẩn), xuất ảnh từng trang và đếm animation, để xem nhanh không cần mở tay:

```
powershell -ExecutionPolicy Bypass -File kiem-tra.ps1 "Ket-qua\ten-file.pptx" "Ket-qua\anh"
```
