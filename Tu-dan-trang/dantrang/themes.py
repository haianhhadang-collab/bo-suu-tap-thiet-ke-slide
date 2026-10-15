"""10 mẫu thiết kế dựng sẵn. Có thể thêm mẫu bằng file JSON trong thư mục `mau/`.

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
#   card_style   strip-top | border-left | outline | solid | header
#   radius       độ bo góc thẻ (0–0.5);  transition  morph | fade | push | wipe;  effect  float | fade | wipe | zoom | fly

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
