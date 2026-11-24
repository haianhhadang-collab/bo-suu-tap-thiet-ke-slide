"""25 mẫu thiết kế dựng sẵn (6 mẫu gradient dùng kiểu trang trí "aurora"). Có thể thêm mẫu bằng file JSON trong thư mục `mau/`.

Mọi phông dùng ở đây đều có sẵn trên Windows và đủ dấu tiếng Việt
(Trebuchet MS, Georgia, Impact thiếu chữ ơ, ư, ạ… nên không dùng).
"""
from __future__ import annotations

import json
from pathlib import Path

# Khóa của một mẫu:
#   bg, bg2      nền trang nội dung (xen kẽ)        ink   màu tiêu đề
#   body, muted  màu chữ nội dung / chữ phụ          card  nền thẻ, card_line viền thẻ
#   accent       màu nhấn chính (đủ tương phản để làm chữ)   accent2, accent3 màu trang trí
#   inv          dải màu nền trang bìa / chương / kết (1–3 màu)
#   inv_ink, inv_body, inv_accent   màu chữ trên nền inv
#   head, body_font  phông tiêu đề / nội dung;   head_bold, caps (tiêu đề viết hoa)
#   decor        kiểu trang trí;  title_mark  dấu dưới tiêu đề;  bullet  ký tự đầu dòng
#   card_style   strip-top | border-left | outline | solid | header | comic
#   radius       độ bo góc thẻ (0–0.5);  transition  morph | fade | push | wipe;  effect  float | fade | wipe | zoom | fly
#   title_grad, inv_title_grad   (không bắt buộc) dải màu chữ tiêu đề trên nền sáng / trên nền bìa, chương, kết

THEMES: dict[str, dict] = {
    "song-bien": dict(
        name="Sóng biển", desc="Xanh đại dương, sóng ở chân trang, bo tròn thân thiện — bài giảng sáng tạo.",
        bg="EEF7F9", bg2="FBF6EC", ink="0B2E4F", body="3A5068", muted="5A6E82",
        accent="1F6FB2", accent2="5EC8D8", accent3="F2895B", card="FBFDFD", card_line="D5E8EE",
        inv=["0B2E4F", "134A78", "1F6FB2"], inv_ink="F4FAFB", inv_body="CFE6EE", inv_accent="8FD9E3",
        head="Candara", head_bold=True, body_font="Segoe UI", caps=False,
        decor="waves", title_mark="squiggle", bullet="●", card_style="strip-top", radius=0.16,
        transition="morph", effect="float"),
    "gradient": dict(
        name="Gradient chuyên nghiệp", desc="Tím than → tím → xanh, thẻ đầu gradient, quầng sáng mềm — báo cáo hiện đại.",
        bg="F5F4FA", bg2="FCFCFE", ink="1A1446", body="4B4868", muted="6B6889",
        accent="5A3FD1", accent2="2C8FE0", accent3="8E7CF0", card="FDFDFF", card_line="E3E0F2",
        inv=["22165C", "4B2FB8", "2C8FE0"], inv_ink="FAF9FF", inv_body="DCD7F5", inv_accent="BFE9FA",
        head="Segoe UI Semibold", head_bold=False, body_font="Segoe UI", caps=False,
        decor="orbs", title_mark="bar", bullet="●", card_style="header", radius=0.12,
        transition="morph", effect="float"),
    "toi-gian": dict(
        name="Tối giản", desc="Nhiều khoảng trắng, chữ mảnh cỡ lớn, một màu nhấn san hô.",
        bg="FAFAF7", bg2="F2F1EC", ink="1F1F1F", body="4A4A4A", muted="7A7A7A",
        accent="C8553D", accent2="2D3142", accent3="BFC0C0", card="FFFFFF", card_line="E2E0DA",
        inv=["2D3142", "2D3142"], inv_ink="FAFAF7", inv_body="D5D6DC", inv_accent="F2A48F",
        head="Segoe UI Light", head_bold=False, body_font="Segoe UI", caps=False,
        decor="minimal", title_mark="dot", bullet="—", card_style="outline", radius=0.02,
        transition="fade", effect="fade"),
    "nen-toi": dict(
        name="Nền tối neon", desc="Nền xanh đen, điểm sáng neon ngọc và tím, lưới mảnh — công nghệ, sự kiện.",
        bg="0E0F1A", bg2="13152A", ink="F2F3FA", body="C3C6DE", muted="8A8FB0",
        accent="00D9BD", accent2="8B5CF6", accent3="F472B6", card="1A1D33", card_line="2C3150",
        inv=["0A0B14", "1A1240", "0E2A3A"], inv_ink="F7F8FF", inv_body="C3C6DE", inv_accent="00E5C7",
        head="Segoe UI Black", head_bold=False, body_font="Segoe UI", caps=False,
        decor="neon", title_mark="bar", bullet="▸", card_style="outline", radius=0.1,
        transition="morph", effect="zoom"),
    "thanh-lich": dict(
        name="Thanh lịch vàng kim", desc="Nền ngà, chữ có chân, khung viền mảnh và điểm vàng kim — trang trọng.",
        bg="FBF8F2", bg2="F4EEE3", ink="1E1B16", body="4D463C", muted="7A7062",
        accent="9A6F22", accent2="C9A96E", accent3="7A6A55", card="FFFDF8", card_line="E3D6BD",
        inv=["16130F", "2A241C"], inv_ink="F5ECD9", inv_body="D9CDB6", inv_accent="D9B76A",
        head="Palatino Linotype", head_bold=False, body_font="Segoe UI", caps=False,
        decor="frame", title_mark="rule", bullet="◆", card_style="outline", radius=0.0,
        transition="fade", effect="fade"),
    "co-dien": dict(
        name="Cổ điển · Vintage", desc="Giấy cũ, khung đôi, hoa văn góc, đỏ gạch và nâu — lịch sử, văn hóa.",
        bg="EFE6D2", bg2="E8DCC2", ink="3B2A1E", body="54402F", muted="7A6550",
        accent="8C2F1B", accent2="A67C52", accent3="2F5D62", card="F6EFDF", card_line="CDB892",
        inv=["3B2A1E", "5B3A29"], inv_ink="F3E9D2", inv_body="E2D3B5", inv_accent="E0B47A",
        head="Constantia", head_bold=True, body_font="Palatino Linotype", caps=False,
        decor="vintage", title_mark="ornament", bullet="◆", card_style="outline", radius=0.0,
        transition="fade", effect="wipe"),
    "de-thuong": dict(
        name="Dễ thương pastel", desc="Pastel ấm, mảng màu hữu cơ, góc bo lớn — lớp học, thiếu nhi, cộng đồng.",
        bg="FFF7EE", bg2="F2F6FF", ink="3D405B", body="55597A", muted="7A7E98",
        accent="D9534F", accent2="81B29A", accent3="F2CC8F", card="FFFDF9", card_line="F1DFCC",
        inv=["FFE3D3", "FFD6E0"], inv_ink="3D405B", inv_body="55597A", inv_accent="D9534F",
        head="Candara", head_bold=True, body_font="Candara", caps=False,
        decor="blobs", title_mark="dots", bullet="●", card_style="solid", radius=0.3,
        transition="morph", effect="zoom"),
    "nghe-thuat": dict(
        name="Nghệ thuật táo bạo", desc="Khối màu kiểu Matisse đỏ, lam, cam; tiêu đề in hoa đậm — sáng tạo, nổi bật.",
        bg="F5EBDD", bg2="FFF8EC", ink="1D1D1B", body="3B3A36", muted="6A675F",
        accent="C62E3A", accent2="1D4E89", accent3="F4A261", card="FFFDF7", card_line="E6D5BE",
        inv=["1D4E89", "1D4E89"], inv_ink="FFF8EC", inv_body="E3EAF4", inv_accent="F4A261",
        head="Segoe UI Black", head_bold=False, body_font="Corbel", caps=True,
        decor="matisse", title_mark="block", bullet="■", card_style="solid", radius=0.0,
        transition="morph", effect="fly"),
    "thien-nhien": dict(
        name="Thiên nhiên", desc="Xanh lá, lá cây ở góc, chữ có chân ấm — môi trường, sức khỏe, giáo dục.",
        bg="F3F6EE", bg2="FAF7EF", ink="1F3A2D", body="41594A", muted="62786A",
        accent="2D6A4F", accent2="95B46A", accent3="D4A373", card="FBFCF8", card_line="D6E2CC",
        inv=["1F3A2D", "2D6A4F"], inv_ink="F3F6EE", inv_body="D3E3D4", inv_accent="C9DF9E",
        head="Cambria", head_bold=True, body_font="Corbel", caps=False,
        decor="leaves", title_mark="bar", bullet="●", card_style="strip-top", radius=0.14,
        transition="morph", effect="float"),
    "chuyen-nghiep": dict(
        name="Chuyên nghiệp xanh navy", desc="Navy và ngọc, dải màu bên trái, bố cục ngay ngắn — doanh nghiệp, cơ quan.",
        bg="F7F9FC", bg2="EEF2F8", ink="0F2340", body="425066", muted="6A778C",
        accent="0F62C9", accent2="14B8A6", accent3="F59E0B", card="FFFFFF", card_line="DCE3EE",
        inv=["0F2340", "163A6B"], inv_ink="F7F9FC", inv_body="CBD6E6", inv_accent="5EEAD4",
        head="Segoe UI Semibold", head_bold=False, body_font="Segoe UI", caps=False,
        decor="sidebar", title_mark="bar", bullet="■", card_style="border-left", radius=0.04,
        transition="push", effect="wipe"),
    "truyen-tranh": dict(
        name="Truyện tranh · Comic",
        desc="Viền mực đen dày, chấm tram, tia nắng đỏ vàng xanh, thẻ bóng đổ khối — sinh động, thiếu nhi, ngoại khóa.",
        bg="FFF6DC", bg2="FFFBEF", ink="111111", body="2B2B2B", muted="555555",
        accent="E63946", accent2="1D4ED8", accent3="FFC300", card="FFFFFF", card_line="111111",
        inv=["1D4ED8", "1E3A8A"], inv_ink="FFFFFF", inv_body="E3EBFF", inv_accent="FFC300",
        head="Segoe UI Black", head_bold=False, body_font="Segoe UI", caps=True,
        decor="comic", title_mark="block", bullet="■", card_style="comic", radius=0.0,
        transition="push", effect="zoom"),
    "manga": dict(
        name="Manga đen trắng",
        desc="Trắng đen như trang truyện, đường tốc độ, chấm tram, một điểm đỏ — anime, manga, câu lạc bộ.",
        bg="FFFFFF", bg2="F5F5F5", ink="0D0D0D", body="2A2A2A", muted="5C5C5C",
        accent="D62828", accent2="1A1A1A", accent3="8C8C8C", card="FFFFFF", card_line="1A1A1A",
        inv=["0D0D0D", "262626"], inv_ink="FFFFFF", inv_body="D9D9D9", inv_accent="FF4D4D",
        head="Segoe UI Black", head_bold=False, body_font="Segoe UI", caps=False,
        decor="manga", title_mark="bar", bullet="▶", card_style="comic", radius=0.0,
        transition="fade", effect="zoom"),
    # ---- bổ sung 23/11/2026: 7 bộ màu, 6 bộ gradient (kiểu trang trí aurora) — giống bản web
    "do-son": dict(
        name="Đỏ son vàng kim", desc="Đỏ son, vàng kim, chữ có chân, khung viền mảnh — lễ kỷ niệm, chính trị, truyền thống.",
        bg="FFFAF2", bg2="FBF1E2", ink="4A0D0D", body="5B3A32", muted="7D6157", accent="B3191E", accent2="D4A017", accent3="7A1F1F", card="FFFDF8", card_line="EBD9BC",
        inv=["7A0C0C", "B3191E"], inv_ink="FFF6E0", inv_body="F3DCC0", inv_accent="FFD166",
        head="Cambria", head_bold=True, body_font="Segoe UI", caps=False, decor="frame", title_mark="rule", bullet="◆",
        card_style="border-left", radius=0.0, transition="fade", effect="wipe"),
    "bac-ha": dict(
        name="Bạc hà tươi mát", desc="Xanh bạc hà và san hô nhạt, sóng mềm ở chân trang — y tế, đời sống, kỹ năng.",
        bg="F1FAF7", bg2="FBFDF9", ink="0F3D3A", body="35595A", muted="5B7A79", accent="0F7F72", accent2="7DD3C0", accent3="F28C7A", card="FFFFFF", card_line="CFEBE3",
        inv=["0F3D3A", "127369", "0F7F72"], inv_ink="F2FBF8", inv_body="CDEDE6", inv_accent="A8EBDD",
        head="Candara", head_bold=True, body_font="Segoe UI", caps=False, decor="waves", title_mark="squiggle", bullet="●",
        card_style="strip-top", radius=0.16, transition="morph", effect="float"),
    "hong-dao": dict(
        name="Hồng đào dịu nhẹ", desc="Hồng đào, kem và xanh xám, mảng màu tròn mềm — mầm non, tiểu học, sự kiện nhẹ nhàng.",
        bg="FFF6F3", bg2="FFF9EF", ink="4A2C3A", body="6A4A58", muted="856874", accent="B83A62", accent2="F4A7B9", accent3="8FB8C9", card="FFFDFC", card_line="F4D9DF",
        inv=["FADADD", "FDE7D6"], inv_ink="4A2C3A", inv_body="6A4A58", inv_accent="B83A62",
        head="Candara", head_bold=True, body_font="Candara", caps=False, decor="blobs", title_mark="dots", bullet="●",
        card_style="solid", radius=0.28, transition="morph", effect="zoom"),
    "oai-huong": dict(
        name="Oải hương", desc="Tím oải hương nhạt, xám bạc, chữ mảnh, nhiều khoảng trắng — văn học, nghệ thuật, tâm lý.",
        bg="FAF8FD", bg2="F3F0FA", ink="2E2546", body="4F4766", muted="726B8B", accent="7650B8", accent2="B9A6E3", accent3="9AA5B1", card="FFFFFF", card_line="E4DDF2",
        inv=["3B2E5E", "5B4A8B"], inv_ink="FAF8FD", inv_body="DCD5EE", inv_accent="CDBDF2",
        head="Segoe UI Light", head_bold=False, body_font="Segoe UI", caps=False, decor="minimal", title_mark="dot", bullet="—",
        card_style="outline", radius=0.06, transition="fade", effect="fade"),
    "ca-phe": dict(
        name="Cà phê sữa", desc="Nâu cà phê, kem sữa, chữ có chân ấm — ẩm thực, khởi nghiệp, chia sẻ kinh nghiệm.",
        bg="F8F2EA", bg2="FDF9F3", ink="3B2618", body="5A4232", muted="7A6352", accent="945329", accent2="C89B6D", accent3="6B8F71", card="FFFCF7", card_line="E6D6C1",
        inv=["3B2618", "5C3D29"], inv_ink="F8EFE2", inv_body="E5D4BF", inv_accent="E3B784",
        head="Constantia", head_bold=True, body_font="Corbel", caps=False, decor="minimal", title_mark="rule", bullet="◆",
        card_style="strip-top", radius=0.08, transition="fade", effect="fade"),
    "luc-bao": dict(
        name="Ngọc lục bảo", desc="Xanh ngọc lục bảo và vàng đồng, dải màu bên trái — tài chính, quản trị, báo cáo trang trọng.",
        bg="F5F9F7", bg2="EDF4F0", ink="0B2B22", body="3A5249", muted="5F756C", accent="0B7A5A", accent2="C59B45", accent3="2E5E8C", card="FFFFFF", card_line="D5E5DD",
        inv=["0B2B22", "0F4A3A"], inv_ink="F3F8F5", inv_body="C9DDD3", inv_accent="E2C27A",
        head="Segoe UI Semibold", head_bold=False, body_font="Segoe UI", caps=False, decor="sidebar", title_mark="bar", bullet="■",
        card_style="border-left", radius=0.04, transition="push", effect="wipe"),
    "than-cam": dict(
        name="Than chì & cam", desc="Xám than, trắng và một màu cam mạnh, tiêu đề in hoa đậm — kỹ thuật, thể thao, khởi động dự án.",
        bg="F7F7F5", bg2="EFEFEC", ink="1C1C1E", body="3D3D42", muted="66666C", accent="C2410C", accent2="2B2D33", accent3="F59F00", card="FFFFFF", card_line="DDDDD8",
        inv=["1C1C1E", "2B2D33"], inv_ink="FFFFFF", inv_body="D0D0D4", inv_accent="FF8A3D",
        head="Segoe UI Black", head_bold=False, body_font="Segoe UI", caps=True, decor="matisse", title_mark="block", bullet="■",
        card_style="solid", radius=0.0, transition="morph", effect="fly"),
    "gradient-hoang-hon": dict(
        name="Gradient hoàng hôn", desc="Tím đêm → hồng → cam, quầng sáng loang như mesh gradient — truyền cảm hứng, sự kiện, giới thiệu.",
        bg="FFF7F4", bg2="FDF4FA", ink="2E1338", body="553A5C", muted="79617E", accent="B8325F", accent2="F07B4F", accent3="8E44AD", card="FFFFFF", card_line="F3DDE3",
        inv=["2E1338", "8A2C6E", "D9534F"], inv_ink="FFF8F5", inv_body="F6D9E2", inv_accent="FFC48C",
        head="Segoe UI Semibold", head_bold=False, body_font="Segoe UI", caps=False, decor="aurora", title_mark="bar", bullet="●",
        card_style="header", radius=0.14, transition="morph", effect="float",
        title_grad=["A4286A", "C2471F"], inv_title_grad=["FFFFFF", "FFC48C"]),
    "gradient-dai-duong": dict(
        name="Gradient đại dương", desc="Xanh đêm → lam → ngọc, quầng sáng loang — công nghệ, khoa học, báo cáo hiện đại.",
        bg="F3F8FC", bg2="F7FBFD", ink="0B1F3A", body="3A5068", muted="5C7086", accent="1565C0", accent2="00ACC1", accent3="5C6BC0", card="FFFFFF", card_line="D8E6F2",
        inv=["0B1F4D", "1458A8", "0A8FA6"], inv_ink="F5FAFF", inv_body="CFE3F5", inv_accent="7FE3F0",
        head="Segoe UI Semibold", head_bold=False, body_font="Segoe UI", caps=False, decor="aurora", title_mark="bar", bullet="●",
        card_style="header", radius=0.12, transition="morph", effect="float",
        title_grad=["0D47A1", "00737D"], inv_title_grad=["FFFFFF", "8FE9F5"]),
    "gradient-cuc-quang": dict(
        name="Gradient cực quang", desc="Nền đêm, dải sáng xanh ngọc và tím như cực quang — công nghệ, vũ trụ, sự kiện buổi tối.",
        bg="0D1224", bg2="101830", ink="F1F5FF", body="C5CCE4", muted="8C95B5", accent="2EE6A8", accent2="7C5CFF", accent3="22B8F0", card="171F3A", card_line="2A3558",
        inv=["070B18", "10224A", "0E4A4A"], inv_ink="F5F8FF", inv_body="C5CCE4", inv_accent="5CF2C0",
        head="Segoe UI Black", head_bold=False, body_font="Segoe UI", caps=False, decor="aurora", title_mark="bar", bullet="▸",
        card_style="outline", radius=0.1, transition="morph", effect="zoom",
        title_grad=["5CF2C0", "A08CFF"], inv_title_grad=["7DF5CF", "B8A6FF"]),
    "gradient-keo-ngot": dict(
        name="Gradient kẹo ngọt", desc="Tím → hồng tươi, nền hồng lila nhạt, góc bo lớn — giới trẻ, câu lạc bộ, ngoại khóa.",
        bg="FCF6FF", bg2="FFF5FA", ink="34164F", body="5A4170", muted="7C6890", accent="9B27C9", accent2="FF6FA8", accent3="6C8CFF", card="FFFFFF", card_line="EEDDF6",
        inv=["5B21B6", "A62FD6", "D63384"], inv_ink="FFFFFF", inv_body="F3E3FF", inv_accent="FFD1E6",
        head="Candara", head_bold=True, body_font="Segoe UI", caps=False, decor="aurora", title_mark="dots", bullet="●",
        card_style="solid", radius=0.24, transition="morph", effect="zoom",
        title_grad=["7B1FA2", "C2185B"], inv_title_grad=["FFFFFF", "FFC2DD"]),
    "gradient-do-son": dict(
        name="Gradient đỏ son – vàng", desc="Đỏ thẫm → đỏ son → cam, điểm vàng kim, quầng sáng ấm — ngày lễ, Tết, kỷ niệm.",
        bg="FFF8F1", bg2="FFF3EA", ink="3D0C0C", body="5E3A30", muted="7F5F55", accent="B3191E", accent2="F2A33A", accent3="E0603A", card="FFFFFF", card_line="F2DCCB",
        inv=["4A0A0A", "A3161A", "C8441B"], inv_ink="FFF8EC", inv_body="F6DCC8", inv_accent="FFD166",
        head="Cambria", head_bold=True, body_font="Segoe UI", caps=False, decor="aurora", title_mark="rule", bullet="◆",
        card_style="header", radius=0.08, transition="fade", effect="wipe",
        title_grad=["8E0E12", "C2410C"], inv_title_grad=["FFF1C2", "FFC46B"]),
    "gradient-la-non": dict(
        name="Gradient lá non", desc="Xanh rừng → xanh lá → lục tươi, quầng sáng vàng chanh — môi trường, nông nghiệp, phát triển bền vững.",
        bg="F4FAF2", bg2="FAFCF3", ink="12331F", body="3B5A44", muted="5D7B65", accent="1E7A46", accent2="8CC63F", accent3="2BAE9A", card="FFFFFF", card_line="D8EBD3",
        inv=["0F3B24", "1E7A46", "2F8A35"], inv_ink="F6FBF2", inv_body="D6EBD0", inv_accent="D4F18A",
        head="Cambria", head_bold=True, body_font="Corbel", caps=False, decor="aurora", title_mark="bar", bullet="●",
        card_style="strip-top", radius=0.14, transition="morph", effect="float",
        title_grad=["1B5E20", "00796B"], inv_title_grad=["FFFFFF", "D4F18A"]),
}

DEFAULTS = dict(THEMES["song-bien"])


def load_custom(folder: Path) -> None:
    """Nạp thêm mẫu từ các file JSON: {"id": "...", "base": "song-bien", ...các khóa muốn đổi}."""
    if not folder.is_dir():
        return
    for f in sorted(folder.glob("*.json")):
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
            tid = d.pop("id", f.stem)
            base = dict(THEMES.get(d.pop("base", ""), DEFAULTS))
            base.update(d)
            base.setdefault("name", tid)
            THEMES[tid] = base
        except Exception as e:  # mẫu hỏng không làm dừng công cụ
            print(f"[!] Bỏ qua mẫu {f.name}: {e}")


def get(theme_id: str) -> dict:
    if theme_id not in THEMES:
        raise KeyError(f"Không có mẫu '{theme_id}'. Các mẫu: {', '.join(THEMES)}")
    th = dict(DEFAULTS)
    th.update(THEMES[theme_id])
    th["id"] = theme_id
    return th
