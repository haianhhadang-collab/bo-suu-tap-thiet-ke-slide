# Tự dàn trang slide

Công cụ nhận một file **.pptx, .docx, .pdf, .md hoặc .txt**, tự dàn lại thành bộ slide PowerPoint theo một trong **12 mẫu thiết kế**. Bộ slide được thêm sẵn **animation** và **hiệu ứng chuyển trang** của PowerPoint. Nội dung, ảnh và ghi chú thuyết trình được giữ nguyên.

**File PowerPoint (.pptx) được giữ nguyên bố cục gốc**: bảng, ảnh, hộp chữ, hình khối vẫn đúng vị trí và kích thước, công cụ chỉ đổi màu, phông, nền và trang trí theo mẫu (xem [Giữ bố cục file PowerPoint](#giữ-bố-cục-file-powerpoint)). Muốn dàn lại từ đầu như file Word thì bỏ chọn ô "giữ nguyên bố cục gốc" trong cửa sổ, thêm `--dan-lai` ở dòng lệnh, hoặc đặt `"giu_bo_cuc_pptx": false` trong `cau-hinh.json`.

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

Có **61 họa tiết chia 12 gói**. Họa tiết vẽ chồng lên **bất kỳ mẫu nào** bằng hình vector của PowerPoint, nên sửa màu, kéo, xóa được như hình thường (không dùng ảnh). Hình và màu giống hệt họa tiết của bản web.

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

**Gói Trường học · Lễ nghi học đường**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `khai-giang` | Khai giảng · Trống trường | Trống trường đỏ đai vàng, dùi bắt chéo, chùm bóng bay trên nền trời xanh | riêng | Lễ khai giảng, ngày hội đến trường, sự kiện đầu năm học |
| `hoa-phuong` | Hoa phượng · Mùa chia tay | Cành phượng đỏ, lá kép lông chim, cánh hoa rơi trên nền xanh ngọc | riêng | Tổng kết, chia tay cuối cấp, tuổi học trò, mùa hè |
| `tot-nghiep` | Tốt nghiệp · Mũ cử nhân | Mũ cử nhân tua vàng, cuộn bằng thắt nơ đỏ, giấy kim tuyến | riêng | Lễ tốt nghiệp, trao bằng, bảo vệ khóa luận |
| `vo-o-ly` | Vở ô ly · Tiểu học | Trang vở ô ly kẻ tím, lề đỏ, gáy lò xo, bút chì; trang bìa cũng là trang vở sáng màu | riêng | Tiểu học, luyện chữ, bài giảng lớp 1 đến lớp 5, họp phụ huynh |
| `bang-den` | Bảng đen · Phấn trắng | Cả bộ slide thành bảng xanh khung gỗ, chữ phấn, máng phấn và công thức viết tay | riêng | Lớp học, ôn tập, toán, khoa học tự nhiên |

**Gói Di sản · Kiến trúc Việt**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `khue-van-cac` | Văn Miếu · Khuê Văn Các | Khuê Văn Các nét vàng kim, cửa sổ tròn tỏa tia, hai tầng mái cong, nền đỏ son | riêng | Khuyến học, 20/11, truyền thống hiếu học, Hà Nội |
| `chua-mot-cot` | Chùa Một Cột · Hà Nội | Chùa Một Cột trên hồ sen vuông, mái cong, lưỡng long chầu nguyệt, tông chàm | riêng | Hà Nội, văn hóa, di tích, du lịch |
| `mai-dinh` | Mái đình · Ngói vảy cá | Dải mái ngói vảy cá, diềm mái, hai đầu đao cong vút ở đầu trang | riêng | Đình làng, lễ hội, văn hóa làng xã, kiến trúc cổ |
| `non-la` | Nón lá · Hồn Việt | Nón lá màu rơm với vành nan, quai hồng, nền xanh lúa non | riêng | Văn hóa Việt Nam, phụ nữ Việt Nam, giới thiệu quê hương |

**Gói Y tế · Sức khỏe**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `nhip-tim` | Nhịp tim · Tim mạch | Trái tim đỏ có đường điện tim, dải nhịp tim chạy ngang chân trang | riêng | Y khoa, tim mạch, sức khỏe cộng đồng, 27/2 |
| `adn` | Chuỗi xoắn ADN · Sinh học | Chuỗi xoắn kép nghiêng, bậc nối bốn màu, nền xanh đêm | riêng | Sinh học, di truyền, y sinh, nghiên cứu |
| `te-bao` | Tế bào · Vi sinh | Tế bào nhân tím, ti thể, lưới nội chất và vài tế bào nhỏ | riêng | Sinh học, vi sinh, y học, phòng dịch |
| `chu-thap` | Chữ thập xanh · Y tế | Chữ thập xanh lá trong vòng tròn, viên thuốc, giọt nước, trái tim | riêng | Bệnh viện, trạm y tế, y tế học đường, nhà thuốc |

**Gói Vũ trụ · Khám phá**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `hanh-tinh` | Hành tinh · Vũ trụ | Hành tinh có vành đai, mặt trăng, bầu trời đầy sao | riêng | Thiên văn, khoa học tự nhiên, ngoại khóa STEM |
| `chom-sao` | Chòm sao · Bắc Đẩu | Chòm sao Bắc Đẩu nối nét sáng, đường dẫn tới sao Bắc Cực | riêng | Thiên văn, định hướng, mục tiêu |
| `ten-lua` | Tên lửa · Khởi hành | Tên lửa phóng chéo, lửa cam, vệt khói, trời tím có sao | riêng | Khởi động dự án, khởi nghiệp, STEM |
| `ve-tinh` | Vệ tinh · Viễn thông | Vệ tinh cánh pin xanh phát sóng xuống vầng Trái Đất | riêng | Viễn thông, chuyển đổi số, công nghệ, địa lý |

**Gói Thể thao · Thi đua**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `cup-vang` | Cúp vàng · Vinh danh | Cúp vàng giữa cành nguyệt quế, huy chương, giấy kim tuyến | riêng | Tổng kết thi đua, khen thưởng, vinh danh |
| `san-bong` | Sân bóng · Hội khỏe | Sân cỏ kẻ sọc, vạch giữa sân, vòng cấm, quả bóng | riêng | Hội khỏe Phù Đổng, giải bóng đá, thể dục thể thao |
| `duong-chay` | Đường chạy · Về đích | Đường chạy sáu làn đánh số, khúc cua, vạch đích ca-rô | riêng | Điền kinh, lộ trình, mục tiêu, nước rút cuối năm |
| `co-vua` | Cờ vua · Chiến lược | Quân mã vàng đồng trên nền đen than, dải bàn cờ | riêng | Chiến lược, tư duy, ra quyết định, câu lạc bộ cờ vua |

**Gói Hữu nghị · Đối ngoại**

| Mã | Tên | Hình vẽ | Màu | Hợp với |
|---|---|---|---|---|
| `bo-cau` | Bồ câu · Hòa bình | Bồ câu trắng ngậm cành ô liu trên nền xanh dương | riêng | Hòa bình, hữu nghị, đối ngoại, 21/9 |
| `viet-lao` | Hữu nghị Việt Nam – Lào | Cờ Việt Nam và cờ Lào bắt chéo, chùm hoa chăm pa | riêng | Quan hệ đặc biệt Việt Nam – Lào, kỷ niệm 5/9 và 18/7 |
| `ket-noi` | Kết nối toàn cầu · Hội nhập | Quả cầu chấm điểm, cung nối sáng giữa các nút mạng | riêng | Hội nhập quốc tế, hợp tác đa phương, chuyển đổi số |
| `nhip-cau` | Nhịp cầu · Hợp tác | Cầu vòm thép qua mặt nước, mặt trời hoàng hôn phía sau | riêng | Hợp tác, kết nối, giao thông, phát triển vùng |

- **Trang bìa, trang chương, trang kết**: họa tiết lớn thay cho trang trí của mẫu. Riêng `hoi-van`, `may-cuon`, `sach-but`, `nguyen-tu`, `hinh-hoc` giữ trang trí của mẫu và vẽ thêm lên trên. Họa tiết dạng biểu tượng (búa liềm, vòng lúa, cờ, đầm sen, Trái Đất, sách bút, nguyên tử, trống trường, mũ cử nhân, Khuê Văn Các, chùa Một Cột, nón lá, trái tim, ADN, tế bào, chữ thập, tên lửa, vệ tinh, cúp vàng, quân mã, bồ câu, cờ Việt – Lào, quả cầu kết nối) nằm to bên phải trang bìa, trang chương và chìm mờ giữa trang kết. Riêng `vo-o-ly` và `bang-den` đổi cả nền mọi trang thành trang vở hoặc bảng đen. Chữ tự lùi vào để không đè lên họa tiết; tên bài dài quá thì cỡ chữ tự nhỏ lại.
- **Trang nội dung**: chỉ thêm dải màu, họa tiết nhỏ hoặc hình chìm rất nhạt ở góc, trang trí của mẫu vẫn giữ.
- **Ký hiệu đầu dòng theo chủ đề**: nhiều họa tiết đổi dấu đầu dòng cho hợp (★ cách mạng, siêu anh hùng, cúp vàng, tốt nghiệp, Việt – Lào; ✿ hoa mai, hoa đào, hoa phượng; ❀ sen; ◆ trống đồng, hồi văn, thổ cẩm, di sản kiến trúc; ✦ pháo hoa, Trung thu, hành tinh, chòm sao…; ▶ tốc độ, khung truyện, mạch điện, tên lửa, vệ tinh; ♥ nhịp tim; ♞ cờ vua; ✎ vở ô ly, bảng đen), kể cả khi giữ màu của mẫu.
- **Bảng màu của họa tiết**: với họa tiết có màu **riêng**, mặc định đổi cả màu nền, màu chữ, màu nhấn sang bảng màu của họa tiết (ví dụ trống đồng dùng tông đồng thau). Muốn giữ màu của mẫu thì bỏ chọn "Dùng bảng màu của họa tiết" trong cửa sổ, đặt `"dung_mau_hoa_van": false` trong `cau-hinh.json`, hoặc thêm `--giu-mau` ở dòng lệnh. Họa tiết **theo mẫu** luôn dùng màu của mẫu.
- Tên file kết quả ghi cả họa tiết, ví dụ `bai-giang - Cổ điển · Vintage + Trống đồng.pptx`.

Cách chọn họa tiết:
- **Cửa sổ**: dưới danh sách mẫu, chọn gói ở ô thứ nhất (hoặc "Tất cả các gói"), rồi chọn họa tiết ở ô thứ hai.
- **Hộp thư**: thư mục `Hop-thu-vao\<họa-tiết>\` hoặc `Hop-thu-vao\<mẫu>+<họa-tiết>\` (xem trên).
- **Dòng lệnh**: `python tu_dan_trang.py bai-giang.md -m co-dien+dong-son`, hoặc `-m co-dien -v dong-son`. Xem danh sách theo gói bằng `--ds`.
- **Mặc định cho mọi file**: `"hoa_van": "dong-son"` trong `cau-hinh.json` (`"khong"` = không dùng). Thư mục hộp thư hoặc `-m mẫu+khong` vẫn ghi đè được.

## Ảnh trang trí theo chủ đề

Kho có 36 ảnh chụp và 24 tranh vẽ, chia theo 12 gói như họa tiết (lịch sử, văn hóa, lễ hội, thiên nhiên, giáo dục,
anime, trường học, di sản, y tế, vũ trụ, thể thao, đối ngoại). Ảnh làm nền trang bìa, trang chương và trang kết; trang
nội dung giữ trang trí của mẫu. Một lớp phủ màu nền của mẫu đậm dần sang trái để chữ luôn dễ đọc.
- **Ảnh chụp**: ảnh thật lấy từ Wikimedia Commons (giấy phép CC0, phạm vi công cộng, CC BY, CC BY-SA). Mỗi trang có
  ảnh in một dòng nhỏ ghi tác giả và giấy phép ở góc phải dưới, đừng xóa dòng này. Danh sách nguồn: `kho-anh\README.md`.
- **Tranh vẽ**: tranh vector tự vẽ, đổi màu theo mẫu đang chọn.
- **Chọn gói**: mặc định tự đoán theo nội dung. Thứ tự ưu tiên: gói của họa tiết đang dùng, rồi từ khóa trong tên bài, tên
  trang, nội dung (vd "Tết", "bệnh viện", "ASEAN"), rồi theo mẫu (Cổ điển → lịch sử, Thiên nhiên → thiên nhiên…). Muốn
  chắc chắn thì chọn gói cụ thể.
- Trang bìa và trang kết dùng ảnh đầu của gói, các trang chương lần lượt dùng những ảnh còn lại.
- File .pptx đang giữ bố cục gốc thì không chèn ảnh (bố cục là của bạn).

Cách chọn:
- **Trang web**: bước 4 "Ảnh trang trí" trong hộp thoại. Xem cả kho, lọc theo gói và tải từng ảnh ở mục "Kho ảnh
  trang trí theo chủ đề" cuối trang.
- **Cửa sổ**: hai ô "Ảnh trang trí" và "Chủ đề" cạnh ô chuyển trang.
- **Dòng lệnh**: `python tu_dan_trang.py bai-giang.docx --anh anh` (ảnh chụp) hoặc `--anh tranh`; thêm
  `--chu-de-anh di-san` để chọn gói. Danh sách gói: `--ds`.
- **Mặc định cho mọi file** (cả hộp thư): `"anh_trang_tri": "anh"` và `"chu_de_anh": "tu-dong"` trong `cau-hinh.json`
  (`"khong"` = không dùng ảnh).

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

**Word (.docx)**: nội dung được **tách trang theo Heading**. Xem `vi-du\tai-lieu-nhieu-cap.docx`.
- Title: tên bài. Subtitle: phụ đề. Vài dòng ngắn trước heading đầu tiên (người soạn, đơn vị, ngày) lên trang bìa. Không có Title thì heading đầu tiên bao cả bài làm tên bài.
- **Mỗi heading mở một trang**, ở mọi cấp (Heading 1, 2, 3…). Tên heading là tiêu đề trang, nội dung ngay dưới heading là nội dung trang. Nội dung dài tự sang trang "(tiếp)".
- Heading cấp ngoài cùng (thường là Heading 1) có mục con thành **trang chương** (01, 02…). Nếu dưới nó có một hai câu dẫn ngắn thì câu dẫn hiện dưới tên chương.
- Heading cấp trong chỉ có tên, không có nội dung riêng (ví dụ "1.2. Vòng đời dự án" rồi đến ngay các Heading 3): không thành trang riêng, tên của nó hiện làm phụ đề trên các trang con.
- Các mục con từ Heading 3 trở xuống mà mục nào cũng ngắn (tối đa 4 ý, khoảng 300 ký tự, không có bảng, ảnh) thì gộp thành **thẻ** trên trang mục cha. Các mục con chỉ có tên thì thành danh sách gạch đầu dòng.
- Kiểu heading tự đặt (ví dụ kiểu "Chương", "Mục") được nhận theo cấp đề cương (Outline level) của kiểu, hoặc theo kiểu Heading mà nó dựa vào.
- Văn bản không dùng kiểu Heading nào: dòng in đậm cả dòng, ngắn, không kết thúc bằng dấu chấm được coi là heading. Cấp xếp theo cỡ chữ rồi theo cách đánh số (I. → 1. → 1.1. → a)).
- Mục lục của Word được bỏ qua. List Bullet: gạch đầu dòng. Bảng và ảnh chèn trong văn bản đều được giữ lại.

**PDF (.pdf)**: chỉ đọc PDF có lớp chữ (PDF xuất từ Word, PowerPoint, Google Docs…, bôi đen được chữ). Xem `vi-du	ai-lieu-nhieu-cap.pdf`.
- PDF không lưu đoạn văn hay heading, chỉ lưu từng dòng chữ và vị trí, nên công cụ dựng lại: nối dòng thành đoạn, nhận gạch đầu dòng, bảng (các cột thẳng hàng), ảnh; bỏ đầu trang, chân trang, số trang, mục lục.
- **Heading** lấy từ mục lục điều hướng (bookmark) của file nếu có. Khi lưu PDF trong Word, bấm *Options…* (Tùy chọn) và bật tạo bookmark theo *Headings* thì kết quả gần như đọc thẳng file Word. Không có bookmark thì công cụ đoán heading theo cỡ chữ và chữ in đậm.
- Sau đó tách trang theo Heading như file Word. Khác một chút: PDF không giữ được cấp Heading gốc, nên các mục con ngắn từ cấp 2 trở xuống đã gộp thành thẻ.
- PDF trang ngang không có bookmark (thường xuất từ PowerPoint): mỗi trang một slide, dòng chữ to trên cùng là tiêu đề, trang đầu là trang bìa. Bố cục gốc không giữ được vì PDF không còn hộp chữ; muốn giữ bố cục thì dùng file .pptx.
- **Chưa đọc được**: PDF scan hoặc ảnh chụp (không có lớp chữ, cần nhận dạng chữ OCR), PDF có mật khẩu. Công cụ báo lỗi rõ ràng. PDF dùng phông cũ (VNI, TCVN3) có thể ra chữ lỗi; trang chia hai cột có thể bị đọc lẫn cột.
- Bản web nạp thư viện đọc PDF (pdf.js) từ mạng ở lần đầu mở file PDF. Bản Python cần thêm gói `pymupdf`.

**Văn bản (.txt)**: xem `vi-du\ghi-chu-nhanh.txt`. Khối đầu tiên là tên bài, phụ đề và thông tin. Mỗi khối cách nhau một dòng trống là một trang; dòng đầu ngắn của khối là tiêu đề trang.

**PowerPoint (.pptx)**: mặc định giữ nguyên bố cục (mục dưới). Khi chọn dàn lại (`--dan-lai`), công cụ đọc tiêu đề, khối chữ, nhãn đi kèm nội dung, ảnh, bảng và ghi chú. Slide gốc có sơ đồ vẽ tay phức tạp (hình tròn nối nhau, mũi tên…) sẽ được chuyển thành thẻ hoặc danh sách. Nên xem lại các trang đó.

## Giữ bố cục file PowerPoint

Với file .pptx, công cụ mở chính file gốc và khoác mẫu lên, không dàn lại trang:
- **Giữ nguyên**: vị trí, kích thước, thứ tự lớp của mọi hộp chữ, bảng, ảnh, hình khối, nhóm hình, biểu đồ; nội dung chữ; ghi chú thuyết trình; animation có sẵn trong file.
- **Đổi theo mẫu**:
  - Nền trang. Trang bìa, trang chương (trang nền tối hoặc nền màu đậm, trang chỉ có tiêu đề) và trang kết dùng nền đậm của mẫu.
  - Màu chữ, màu hình khối, đường kẻ, ô bảng. Màu xám đổi theo độ đậm nhạt so với nền. Màu có sắc độ đổi sang màu nhấn của mẫu; màu dùng nhiều nhất trong file thành màu nhấn chính. Chữ luôn đủ tương phản với nền ngay dưới nó.
  - Phông chữ: tiêu đề và chữ cỡ lớn dùng phông tiêu đề của mẫu, còn lại dùng phông nội dung. Bảng màu và phông của theme cũng đổi theo, nên biểu đồ, SmartArt đổi màu theo.
- **Trang trí, họa tiết** của mẫu nằm ở lớp dưới cùng. Phần nào chạm vào chữ hoặc ảnh thì được làm mờ, để không che nội dung. Hình trang trí của mẫu cũ (trong slide master) được ẩn đi.
- **Không vỡ dòng**: phông mới rộng hơn làm chữ xuống thêm dòng thì cỡ chữ nhỏ lại vừa đủ (tối đa 30%) để giữ số dòng như bản gốc.
- **Những chỗ giữ nguyên để an toàn**:
  - Chữ nằm trên ảnh giữ màu gốc.
  - Phông máy không cài (không đo được) và phông ký hiệu (Wingdings, Symbol…) giữ nguyên.
  - Ảnh, kể cả ảnh nền phủ kín trang, không bị thay.
- **Animation**: trang chưa có animation được thêm hiệu ứng xuất hiện cho từng khối nội dung, theo thứ tự đọc từ trên xuống, trái sang. Chuyển trang theo lựa chọn như thường.

## Cài đặt (chỉ một lần)

Cần Python 3.10 trở lên và ba thư viện:

```
pip install python-pptx python-docx pillow pymupdf
```

Cấu hình trong `cau-hinh.json` (file tự tạo ở lần chạy đầu):
- `mau_mac_dinh`: mẫu mặc định
- `animation`: `tu-chay` | `nhap-chuot` | `khong`
- `chuyen_trang`: `theo-mau` | `morph` | `fade` | `push` | `wipe` | `khong`
- `thu_muc_ket_qua`: thư mục lưu kết quả
- `chu_ky_quet_giay`: chu kỳ quét hộp thư, tính bằng giây
- `hoa_van`: họa tiết mặc định, `khong` hoặc một mã trong bảng họa tiết ở trên (vd `dong-son`, `trung-thu`, `sach-but`)
- `dung_mau_hoa_van`: `true` dùng bảng màu của họa tiết, `false` giữ màu của mẫu
- `giu_bo_cuc_pptx`: `true` (mặc định) file .pptx giữ nguyên bố cục gốc, `false` dàn lại từ đầu

## Kiểm tra kết quả

`kiem-tra.ps1` mở file bằng PowerPoint (ẩn), xuất ảnh từng trang và đếm animation, để xem nhanh không cần mở tay:

```
powershell -ExecutionPolicy Bypass -File kiem-tra.ps1 "Ket-qua\ten-file.pptx" "Ket-qua\anh"
```
