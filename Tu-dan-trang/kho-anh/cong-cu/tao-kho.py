"""Dựng kho ảnh trang trí cho Tự dàn trang.

    python tao-kho.py                      dựng lại dữ liệu (kho-anh.json, kho-anh.js, anh-b64/) từ nguon-anh.json + tranh.py
    python tao-kho.py --tai <thư mục>      cắt, nén ảnh gốc đã tải (<gói>-<số>.jpg + ../meta.json của tai.py) vào anh/ và thu-nho/,
                                           ghi nguon-anh.json, rồi dựng lại dữ liệu như trên

Ảnh chụp: khổ 16:9, 1600×900 (thu-nho/ 480×270). Tranh vector: xem tranh.py.
Thêm ảnh: thêm một dòng vào ANH bên dưới (khóa = tên file đã tải), chạy với --tai, rồi chạy lại gan-vao-bo-suu-tap.py.
"""
import base64
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
KHO = HERE.parent
sys.path.insert(0, str(HERE))
import tranh  # noqa: E402

GOI = [
    dict(id='lich-su', ten='Lịch sử · Cách mạng', tu_khoa=['lịch sử', 'cách mạng', 'kháng chiến', 'chiến thắng', 'độc lập', 'đảng',
         'bác hồ', 'hồ chí minh', 'chiến tranh', 'triều đại', 'giải phóng', 'thống nhất', 'cổ đại', 'trung đại', 'cận đại', 'anh hùng']),
    dict(id='van-hoa', ten='Văn hóa · Truyền thống', tu_khoa=['văn hóa', 'nghệ thuật', 'truyền thống', 'dân gian', 'phong tục', 'ẩm thực',
         'âm nhạc', 'làng nghề', 'bản sắc', 'dân tộc', 'tín ngưỡng', 'tranh dân gian', 'văn học', 'thơ']),
    dict(id='le-hoi', ten='Lễ hội · Mùa xuân', tu_khoa=['lễ hội', 'tết', 'mùa xuân', 'trung thu', 'giáng sinh', 'năm mới', 'kỷ niệm',
         'chúc mừng', 'liên hoan', 'mừng xuân', 'nguyên đán', 'tất niên', 'sự kiện']),
    dict(id='thien-nhien', ten='Thiên nhiên · Môi trường', tu_khoa=['thiên nhiên', 'môi trường', 'khí hậu', 'rừng', 'biển', 'sông',
         'núi', 'sinh thái', 'nông nghiệp', 'cây xanh', 'động vật', 'du lịch', 'đa dạng sinh học', 'biến đổi khí hậu']),
    dict(id='giao-duc', ten='Giáo dục · Khoa học', tu_khoa=['giáo dục', 'khoa học', 'nghiên cứu', 'học tập', 'thư viện', 'đọc sách',
         'tri thức', 'đại học', 'luận án', 'luận văn', 'giảng dạy', 'bài giảng', 'tiến sĩ', 'thạc sĩ', 'kỹ năng', 'phương pháp', 'đào tạo']),
    dict(id='anime', ten='Anime · Comic · Manga', tu_khoa=['anime', 'manga', 'truyện tranh', 'nhật bản', 'comic', 'hoạt hình', 'game',
         'cosplay', 'tokyo', 'otaku']),
    dict(id='truong-hoc', ten='Trường học · Học đường', tu_khoa=['trường học', 'nhà trường', 'học sinh', 'lớp học', 'giáo viên', 'thầy cô',
         'khai giảng', 'tổng kết', 'tiểu học', 'trung học', 'mầm non', 'phụ huynh', 'chủ nhiệm', 'sinh hoạt lớp', 'năm học', 'học kỳ']),
    dict(id='di-san', ten='Di sản · Kiến trúc', tu_khoa=['di sản', 'di tích', 'kiến trúc', 'đền', 'chùa', 'đình', 'cố đô', 'phố cổ',
         'bảo tàng', 'unesco', 'văn miếu', 'huế', 'hội an', 'thăng long', 'cổ vật']),
    dict(id='y-te', ten='Y tế · Sức khỏe', tu_khoa=['y tế', 'sức khỏe', 'bệnh', 'bệnh viện', 'bác sĩ', 'thuốc', 'dinh dưỡng', 'phòng chống',
         'dịch bệnh', 'điều dưỡng', 'y học', 'xét nghiệm', 'vắc xin', 'sơ cứu', 'tâm lý']),
    dict(id='vu-tru', ten='Vũ trụ · Khám phá', tu_khoa=['vũ trụ', 'thiên văn', 'hành tinh', 'ngôi sao', 'mặt trăng', 'không gian',
         'vệ tinh', 'tên lửa', 'trái đất', 'thiên hà', 'khám phá', 'công nghệ', 'trí tuệ nhân tạo', 'chuyển đổi số']),
    dict(id='the-thao', ten='Thể thao · Thi đua', tu_khoa=['thể thao', 'bóng đá', 'thi đấu', 'giải đấu', 'vận động', 'rèn luyện', 'thể dục',
         'olympic', 'cờ vua', 'điền kinh', 'sea games', 'huy chương', 'thi đua', 'vô địch']),
    dict(id='doi-ngoai', ten='Hữu nghị · Đối ngoại', tu_khoa=['đối ngoại', 'hợp tác', 'quốc tế', 'hữu nghị', 'ngoại giao', 'asean', 'lào',
         'đoàn kết', 'hội nhập', 'quan hệ', 'song phương', 'đa phương', 'toàn cầu', 'đối tác', 'campuchia']),
]

# khóa (tên file tải về) -> (mã, tên tiếng Việt, tâm cắt dọc 0..1)
ANH = {
    'lich-su-1': ('cot-co-ha-noi', 'Cột cờ Hà Nội', 0.3),
    'lich-su-2': ('doan-mon-thang-long', 'Đoan Môn, Hoàng thành Thăng Long', 0.5),
    'lich-su-3': ('sai-gon-1896', 'Phủ Toàn quyền ở Sài Gòn, năm 1896', 0.5),
    'van-hoa-1': ('tranh-dong-ho', 'Tranh Đông Hồ “Đám cưới chuột”', 0.5),
    'van-hoa-2': ('pho-co-hoi-an', 'Phố cổ Hội An', 0.45),
    'van-hoa-3': ('den-long-giay', 'Đèn lồng giấy ở Hà Nội', 0.5),
    'le-hoi-1': ('phao-hoa', 'Pháo hoa trên mặt nước', 0.4),
    'le-hoi-2': ('hoa-dang-hoi-an', 'Hoa đăng ở Hội An', 0.5),
    'le-hoi-3': ('cho-mai-tet', 'Chợ hoa mai ngày Tết', 0.45),
    'thien-nhien-1': ('vinh-ha-long', 'Vịnh Hạ Long', 0.4),
    'thien-nhien-2': ('ruong-bac-thang', 'Ruộng bậc thang Mù Cang Chải', 0.5),
    'thien-nhien-3': ('dong-phong-nha', 'Cửa động Phong Nha', 0.5),
    'giao-duc-1': ('tu-sach-co', 'Tủ sách cũ', 0.5),
    'giao-duc-2': ('trang-sach-mo', 'Trang sách mở', 0.55),
    'giao-duc-3': ('le-tot-nghiep', 'Lễ tốt nghiệp đại học', 0.5),
    'anime-1': ('tokyo-ve-dem', 'Tokyo về đêm', 0.5),
    'anime-2': ('den-long-nhat', 'Đèn lồng giấy Nhật Bản', 0.5),
    'anime-3': ('hoa-anh-dao', 'Đường ray giữa hai hàng hoa anh đào', 0.5),
    'truong-hoc-1': ('cay-phuong', 'Cây phượng nở hoa', 0.45),
    'truong-hoc-2': ('lop-hoc', 'Lớp học', 0.5),
    'truong-hoc-3': ('but-chi-mau', 'Bút chì màu', 0.4),
    'di-san-1': ('khue-van-cac', 'Khuê Văn Các, Văn Miếu – Quốc Tử Giám', 0.35),
    'di-san-2': ('ngo-mon-hue', 'Ngọ Môn, Hoàng thành Huế', 0.5),
    'di-san-3': ('chua-mot-cot', 'Chùa Một Cột', 0.5),
    'y-te-1': ('dung-cu-thi-nghiem', 'Dụng cụ thí nghiệm', 0.5),
    'y-te-2': ('hanh-lang-benh-vien', 'Hành lang bệnh viện', 0.5),
    'y-te-3': ('kinh-hien-vi', 'Kính hiển vi điện tử', 0.45),
    'vu-tru-1': ('trai-dat-ban-dem', 'Trái Đất ban đêm nhìn từ trạm ISS', 0.5),
    'vu-tru-2': ('tam-ngan-ha', 'Vùng trung tâm dải Ngân Hà', 0.5),
    'vu-tru-3': ('dai-ngan-ha', 'Dải Ngân Hà', 0.5),
    'the-thao-1': ('san-van-dong', 'Sân vận động về đêm', 0.5),
    'the-thao-2': ('duong-chay', 'Đường chạy 800 m', 0.5),
    'the-thao-3': ('co-vua', 'Bàn cờ vua', 0.5),
    'doi-ngoai-1': ('pha-that-luang', 'Pha That Luang, Viêng Chăn', 0.55),
    'doi-ngoai-2': ('co-asean', 'Cờ các nước ASEAN bên sông Sài Gòn', 0.35),
    'doi-ngoai-3': ('patuxai', 'Khải hoàn môn Patuxai, Viêng Chăn', 0.5),
}


def tac_gia(s):
    s = re.sub(r'^This Photo was taken by\s+', '', s or '')
    s = re.sub(r'\s*\((more photos|www\.[^)]*)\)', '', s)
    if len(s) > 60:  # tên kèm lời nhắn của tác giả (vd "Tên. Feel free to use…"): giữ phần tên
        s = re.split(r'\.\s|\s\(', s)[0]
    return s.strip() or 'không rõ'


def xu_ly_anh(tai: Path):
    from PIL import Image
    meta = json.loads((tai.parent / 'meta.json').read_text(encoding='utf-8'))
    (KHO / 'anh').mkdir(exist_ok=True)
    (KHO / 'thu-nho').mkdir(exist_ok=True)
    nguon = []
    for key, (aid, ten, fy) in ANH.items():
        m = meta[key]
        im = Image.open(tai / f'{key}.jpg').convert('RGB')
        w, h = im.size
        if w / h > 16 / 9:  # rộng hơn 16:9: cắt hai bên, giữ giữa
            nw = round(h * 16 / 9)
            box = ((w - nw) // 2, 0, (w - nw) // 2 + nw, h)
        else:
            nh = round(w * 9 / 16)
            top = min(max(0, round(fy * h - nh / 2)), h - nh)
            box = (0, top, w, top + nh)
        im = im.crop(box)
        im.resize((1600, 900), Image.LANCZOS).save(KHO / 'anh' / f'{aid}.jpg', quality=72, optimize=True, progressive=True)
        im.resize((480, 270), Image.LANCZOS).save(KHO / 'thu-nho' / f'{aid}.jpg', quality=78, optimize=True)
        nguon.append(dict(id=aid, goi=key.rsplit('-', 1)[0], ten=ten, tac_gia=tac_gia(m['author']), giay_phep=m['license'],
                          giay_phep_url=m['license_url'], nguon=m['page'], file_goc=m['file'], mo_ta=m['desc']))
        print(aid, (KHO / 'anh' / f'{aid}.jpg').stat().st_size // 1024, 'KB')
    (KHO / 'nguon-anh.json').write_text(json.dumps(nguon, ensure_ascii=False, indent=1), encoding='utf-8')


def dung_du_lieu():
    nguon = json.loads((KHO / 'nguon-anh.json').read_text(encoding='utf-8'))
    order = {g['id']: i for i, g in enumerate(GOI)}
    anh = sorted([dict(a, loai='anh', ghi_cong=f"Ảnh: {a['tac_gia']} · {a['giay_phep']} · Wikimedia Commons") for a in nguon],
                 key=lambda a: order[a['goi']])
    data = dict(goi=GOI, muc=anh + sorted(tranh.build_all(), key=lambda t: order[t['goi']]))
    txt = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    (KHO / 'kho-anh.json').write_text(txt, encoding='utf-8')
    (KHO / 'kho-anh.js').write_text('/* Kho ảnh trang trí — dữ liệu sinh bởi kho-anh/cong-cu/tao-kho.py, đừng sửa tay. */\n'
                                    '(window.TuDanTrang = window.TuDanTrang || {}).KHO_ANH = ' + txt + ';\n', encoding='utf-8')
    out = KHO / 'anh-b64'
    out.mkdir(exist_ok=True)
    for a in nguon:
        b64 = base64.b64encode((KHO / 'anh' / f"{a['id']}.jpg").read_bytes()).decode()
        (out / f"{a['id']}.js").write_text(f'window.TuDanTrang&&TuDanTrang.khoAnhNhan("{a["id"]}","{b64}");\n', encoding='utf-8')
    n_tranh = sum(1 for m in data['muc'] if m['loai'] == 'tranh')
    print(f'kho-anh.json: {len(anh)} ảnh chụp, {n_tranh} tranh, {len(txt) // 1024} KB')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    if '--tai' in sys.argv:
        xu_ly_anh(Path(sys.argv[sys.argv.index('--tai') + 1]))
    dung_du_lieu()
