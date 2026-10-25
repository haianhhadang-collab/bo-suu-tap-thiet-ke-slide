# Kho ảnh trang trí theo chủ đề

Ảnh dùng làm nền trang bìa, trang chương, trang kết khi dàn trang (bước 4 "Ảnh trang trí" trên web, `--anh` hoặc
`"anh_trang_tri"` ở bản Python). Mỗi gói chủ đề có 3 ảnh chụp và 2 tranh vẽ.

| Thư mục, file | Nội dung |
|---|---|
| `anh/` | Ảnh chụp đã cắt khổ 16:9, 1600×900, JPEG |
| `thu-nho/` | Ảnh thu nhỏ 480×270 cho mục Kho ảnh trên trang |
| `anh-b64/` | Ảnh chụp dạng script, để bản web nạp được cả khi mở trang từ ổ đĩa (file://) |
| `kho-anh.json`, `kho-anh.js` | Dữ liệu chung của hai bản: gói, từ khóa, nguồn ảnh, hình vẽ của tranh |
| `nguon-anh.json` | Nguồn, tác giả, giấy phép từng ảnh chụp (ghi khi tải ảnh) |
| `cong-cu/tranh.py` | Vẽ 24 tranh vector (hình đa giác, màu theo vai trò trong mẫu) |
| `cong-cu/tao-kho.py` | Cắt, nén ảnh và dựng lại dữ liệu; đọc đầu file để biết cách thêm ảnh |

Dựng lại dữ liệu sau khi sửa `tranh.py` hoặc thêm ảnh: `python kho-anh/cong-cu/tao-kho.py`, rồi chạy
`web/gan-vao-bo-suu-tap.py` và bộ so khớp `kho_anh_js.js` + `kho_anh_py.py`.

## Ảnh chụp: nguồn và giấy phép

Tất cả lấy từ Wikimedia Commons ngày 25/10/2026, chỉ nhận giấy phép CC0, phạm vi công cộng (Public domain), CC BY
hoặc CC BY-SA. Ảnh đã được cắt khổ 16:9 và thu nhỏ. Slide nào dùng ảnh đều có dòng ghi nguồn nhỏ ở góc phải dưới;
khi dùng lại ảnh ở nơi khác, giữ ghi công tác giả và giấy phép như bảng dưới. Ảnh CC BY-SA: nếu chỉnh sửa ảnh rồi
chia sẻ lại thì chia sẻ theo cùng giấy phép.

| Mã | Gói | Ảnh | Tác giả | Giấy phép | Nguồn |
|---|---|---|---|---|---|
| `cot-co-ha-noi` | Lịch sử · Cách mạng | Cột cờ Hà Nội | Gary Todd from Xinzheng, China | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Hanoi_Flag_Tower_(9735454512).jpg) |
| `doan-mon-thang-long` | Lịch sử · Cách mạng | Đoan Môn, Hoàng thành Thăng Long | katiebordner | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Central_Sector_of_the_Imperial_Citadel_of_Thang_Long_-_Hanoi.jpg) |
| `sai-gon-1896` | Lịch sử · Cách mạng | Phủ Toàn quyền ở Sài Gòn, năm 1896 | Salles, André (1860-1929) | Public domain | [trang ảnh](https://commons.wikimedia.org/wiki/File:1896_-_Cochinchine_-_Sa%C3%AFgon_-_Palais_du_Gouvernement_G%C3%A9n%C3%A9ral.jpg) |
| `tranh-dong-ho` | Văn hóa · Truyền thống | Tranh Đông Hồ “Đám cưới chuột” | Daderot | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Mice%27s_wedding,_Dong_Ho_picture,_paper_-_Vietnam_National_Museum_of_Fine_Arts_-_Hanoi,_Vietnam_-_DSC05290.JPG) |
| `pho-co-hoi-an` | Văn hóa · Truyền thống | Phố cổ Hội An | Steffen Schmitz | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:H%E1%BB%99i_An,_Ancient_Town,_2020-01_CN-10.jpg) |
| `den-long-giay` | Văn hóa · Truyền thống | Đèn lồng giấy ở Hà Nội | Alphacolor 13 duck58cth | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Hanging_paper_lanterns_(Unsplash).jpg) |
| `phao-hoa` | Lễ hội · Mùa xuân | Pháo hoa trên mặt nước | Adam Whitlock devlife411 | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Fireworks_over_water_(Unsplash).jpg) |
| `hoa-dang-hoi-an` | Lễ hội · Mùa xuân | Hoa đăng ở Hội An | Peter Hershey peterhershey | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Glowing_Paper_Lanterns_(Unsplash).jpg) |
| `cho-mai-tet` | Lễ hội · Mùa xuân | Chợ hoa mai ngày Tết | Casablanca1911 at vi.wikipedia | Public domain | [trang ảnh](https://commons.wikimedia.org/wiki/File:Mai_v%C3%A0ng.jpg) |
| `vinh-ha-long` | Thiên nhiên · Môi trường | Vịnh Hạ Long | Jakub Hałun | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:View_of_sea_from_Titov_Island,_Ha_Long_Bay,_Vietnam,_20240128_1337_3732.jpg) |
| `ruong-bac-thang` | Thiên nhiên · Môi trường | Ruộng bậc thang Mù Cang Chải | Doan Tuan danny_pham93 | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Terraces_in_Che_Cu_Nha_commune,_Mu_Cang_Chai_(Unsplash).jpg) |
| `dong-phong-nha` | Thiên nhiên · Môi trường | Cửa động Phong Nha | Andre Hospers | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Dong_Hoi_Phong_Nha_grotten.jpg) |
| `tu-sach-co` | Giáo dục · Khoa học | Tủ sách cũ | Clem Onojeghuo clemono2 | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Old_books_on_bookshelf._(Unsplash).jpg) |
| `trang-sach-mo` | Giáo dục · Khoa học | Trang sách mở | Ben White benwhitephotography | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Open_book_(Unsplash).jpg) |
| `le-tot-nghiep` | Giáo dục · Khoa học | Lễ tốt nghiệp đại học | Faustin Tuyambaze tfaustin | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:University_graduation_(Unsplash).jpg) |
| `tokyo-ve-dem` | Anime · Comic · Manga | Tokyo về đêm | David Kernan | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Tokyo_Tower,_Minato_City.jpg) |
| `den-long-nhat` | Anime · Comic · Manga | Đèn lồng giấy Nhật Bản | Fancy Crave fancycrave | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Two_Japanese_lanterns_(Unsplash).jpg) |
| `hoa-anh-dao` | Anime · Comic · Manga | Đường ray giữa hai hàng hoa anh đào | 掬茶 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Rail_tracks_and_cherry_trees_in_Ashino_Park.jpg) |
| `cay-phuong` | Trường học · Học đường | Cây phượng nở hoa | Robin Taylor from Bamako, Mali | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Flame_tree_mali.jpg) |
| `lop-hoc` | Trường học · Học đường | Lớp học | Martin Kraft | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Klassenraum_Grundschule.jpg) |
| `but-chi-mau` | Trường học · Học đường | Bút chì màu | Joe Shillington joeshillington | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Colored_Pencils_(Unsplash).jpg) |
| `khue-van-cac` | Di sản · Kiến trúc | Khuê Văn Các, Văn Miếu – Quốc Tử Giám | Daderot | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Constellation_of_Literature_pavilion_-_Temple_of_Literature,_Hanoi_-_DSC04557.JPG) |
| `ngo-mon-hue` | Di sản · Kiến trúc | Ngọ Môn, Hoàng thành Huế | Supanut Arunoprayote. Feel free to use any of my images, but please mention me as the author and may send me a message. (สามารถใช้ภาพได้อิสระ แต่กรุณาใส่เครดิตผู้ถ่ายและอาจส่งข้อความบอกกล่าวด้วย) Please do not upload an updated image here without consultation with the Author. The author would like to make corrections only at his own source. This ensures that the changes are preserved.Please if you think that any changes should be required, please inform the author.Otherwise you can upload a new image with a new name. Please use one of the templates derivative or extract. | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Meridian_Gate,_Hue_(I).jpg) |
| `chua-mot-cot` | Di sản · Kiến trúc | Chùa Một Cột | norchas | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:One_Pillar_Pagoda_(6598025103).jpg) |
| `dung-cu-thi-nghiem` | Y tế · Sức khỏe | Dụng cụ thí nghiệm | Belikov Maxim | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Equipment_and_glassware.jpg) |
| `hanh-lang-benh-vien` | Y tế · Sức khỏe | Hành lang bệnh viện | W.carter | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Corridor_on_the_second_level_-_N%C3%84L_hospital_1.jpg) |
| `kinh-hien-vi` | Y tế · Sức khỏe | Kính hiển vi điện tử | Tadeáš Bednarz | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Scanning_electron_microscope_-_UFCH_JH_(2020)_01.jpg) |
| `trai-dat-ban-dem` | Vũ trụ · Khám phá | Trái Đất ban đêm nhìn từ trạm ISS | NASA | Public domain | [trang ảnh](https://commons.wikimedia.org/wiki/File:ISS-46_Northern_India_at_night.jpg) |
| `tam-ngan-ha` | Vũ trụ · Khám phá | Vùng trung tâm dải Ngân Hà | NASA/JPL-Caltech/ESA/CXC/STScI | Public domain | [trang ảnh](https://commons.wikimedia.org/wiki/File:Center_of_the_Milky_Way_Galaxy_IV_%E2%80%93_Composite.jpg) |
| `dai-ngan-ha` | Vũ trụ · Khám phá | Dải Ngân Hà | ESO/S. Guisard | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Guisard_-_Milky_Way.jpg) |
| `san-van-dong` | Thể thao · Thi đua | Sân vận động về đêm | Mario Klassen marioklassen | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Well_lit_soccer_stadium_(Unsplash).jpg) |
| `duong-chay` | Thể thao · Thi đua | Đường chạy 800 m | Tirza van Dijk tirzavandijk | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:800_meter_line_(Unsplash).jpg) |
| `co-vua` | Thể thao · Thi đua | Bàn cờ vua | Wilfredor | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Chess_game_Staunton_No._6_perfil_view_8.jpg) |
| `pha-that-luang` | Hữu nghị · Đối ngoại | Pha That Luang, Viêng Chăn | Jakub Hałun | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:20171118_Pha_That_Luang_in_Vientiane_3169_DxO.jpg) |
| `co-asean` | Hữu nghị · Đối ngoại | Cờ các nước ASEAN bên sông Sài Gòn | Nat4Eben | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Flags_of_ASEAN_Nations_fly_by_Saigon_River.jpg) |
| `patuxai` | Hữu nghị · Đối ngoại | Khải hoàn môn Patuxai, Viêng Chăn | yeowatzup | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [trang ảnh](https://commons.wikimedia.org/wiki/File:Patuxai,_Vientiane,_Laos_(5248396160).jpg) |

## Tranh vẽ

Tranh vector vẽ riêng cho Tự dàn trang (`cong-cu/tranh.py`), không dựa trên ảnh của ai, dùng tự do. Màu tranh lấy
theo mẫu đang chọn, nên một tranh hợp với cả mẫu sáng lẫn mẫu tối.

| Mã | Gói | Tranh |
|---|---|---|
| `tranh-cot-co` | Lịch sử · Cách mạng | Cột cờ |
| `tranh-cong-thanh` | Lịch sử · Cách mạng | Cổng thành cổ |
| `tranh-trong-dong` | Văn hóa · Truyền thống | Mặt trống đồng |
| `tranh-mai-dinh` | Văn hóa · Truyền thống | Mái đình, đèn lồng |
| `tranh-phao-hoa` | Lễ hội · Mùa xuân | Pháo hoa đêm hội |
| `tranh-mai-long` | Lễ hội · Mùa xuân | Hoa mai, đèn lồng |
| `tranh-nui-rung` | Thiên nhiên · Môi trường | Núi rừng bình minh |
| `tranh-vinh` | Thiên nhiên · Môi trường | Vịnh đá vôi |
| `tranh-sach-chong` | Giáo dục · Khoa học | Chồng sách, ý tưởng |
| `tranh-sach-mo` | Giáo dục · Khoa học | Sách mở, nguyên tử |
| `tranh-toc-do` | Anime · Comic · Manga | Đường tốc độ |
| `tranh-pho-dem` | Anime · Comic · Manga | Phố đêm, hoa anh đào |
| `tranh-ngoi-truong` | Trường học · Học đường | Ngôi trường, hoa phượng |
| `tranh-but-chi` | Trường học · Học đường | Vở ô li, bút chì |
| `tranh-khue-van-cac` | Di sản · Kiến trúc | Khuê Văn Các |
| `tranh-chua-mot-cot` | Di sản · Kiến trúc | Chùa Một Cột, đầm sen |
| `tranh-nhip-tim` | Y tế · Sức khỏe | Nhịp tim, chữ thập |
| `tranh-adn` | Y tế · Sức khỏe | Chuỗi ADN |
| `tranh-hanh-tinh` | Vũ trụ · Khám phá | Hành tinh vành đai |
| `tranh-ten-lua` | Vũ trụ · Khám phá | Tên lửa |
| `tranh-san-van-dong` | Thể thao · Thi đua | Sân vận động |
| `tranh-duong-chay` | Thể thao · Thi đua | Đường chạy, cúp vàng |
| `tranh-nhip-cau` | Hữu nghị · Đối ngoại | Nhịp cầu hữu nghị |
| `tranh-bo-cau` | Hữu nghị · Đối ngoại | Bồ câu, địa cầu |
