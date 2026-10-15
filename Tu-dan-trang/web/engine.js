/* Tự dàn trang — bộ máy chạy trong trình duyệt (bản chuyển từ công cụ Python Tu-dan-trang).
   Đọc .pptx / .docx / .md / .txt -> mô hình nội dung -> bố cục theo mẫu (IR) -> PowerPoint + xem trước. */
(function (G) {
'use strict';

const SW = 13.333, SH = 7.5;

// ============================================================ màu
const hx = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
const toHex = a => a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((x, i) => x + (B[i] - x) * t)); };
const lum = h => hx(h).map(v => v / 255).map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function readable(bg, ...c) {
  for (const x of c) if (contrast(bg, x) >= 4.5) return x;
  return [...c, 'FFFFFF', '111111'].reduce((m, x) => contrast(bg, x) > contrast(bg, m) ? x : m);
}

// ============================================================ 10 mẫu (giống bản Python)
const THEMES = {
  'song-bien': { name: 'Sóng biển', desc: 'Xanh đại dương, sóng ở chân trang, bo tròn thân thiện — bài giảng sáng tạo.',
    bg: 'EEF7F9', bg2: 'FBF6EC', ink: '0B2E4F', body: '3A5068', muted: '5A6E82', accent: '1F6FB2', accent2: '5EC8D8', accent3: 'F2895B',
    card: 'FBFDFD', card_line: 'D5E8EE', inv: ['0B2E4F', '134A78', '1F6FB2'], inv_ink: 'F4FAFB', inv_body: 'CFE6EE', inv_accent: '8FD9E3',
    head: 'Candara', head_bold: true, body_font: 'Segoe UI', caps: false, decor: 'waves', title_mark: 'squiggle', bullet: '●',
    card_style: 'strip-top', radius: 0.16, transition: 'morph', effect: 'float' },
  'gradient': { name: 'Gradient chuyên nghiệp', desc: 'Tím than → tím → xanh, thẻ đầu gradient, quầng sáng mềm — báo cáo hiện đại.',
    bg: 'F5F4FA', bg2: 'FCFCFE', ink: '1A1446', body: '4B4868', muted: '6B6889', accent: '5A3FD1', accent2: '2C8FE0', accent3: '8E7CF0',
    card: 'FDFDFF', card_line: 'E3E0F2', inv: ['22165C', '4B2FB8', '2C8FE0'], inv_ink: 'FAF9FF', inv_body: 'DCD7F5', inv_accent: 'BFE9FA',
    head: 'Segoe UI Semibold', head_bold: false, body_font: 'Segoe UI', caps: false, decor: 'orbs', title_mark: 'bar', bullet: '●',
    card_style: 'header', radius: 0.12, transition: 'morph', effect: 'float' },
  'toi-gian': { name: 'Tối giản', desc: 'Nhiều khoảng trắng, chữ mảnh cỡ lớn, một màu nhấn san hô.',
    bg: 'FAFAF7', bg2: 'F2F1EC', ink: '1F1F1F', body: '4A4A4A', muted: '7A7A7A', accent: 'C8553D', accent2: '2D3142', accent3: 'BFC0C0',
    card: 'FFFFFF', card_line: 'E2E0DA', inv: ['2D3142', '2D3142'], inv_ink: 'FAFAF7', inv_body: 'D5D6DC', inv_accent: 'F2A48F',
    head: 'Segoe UI Light', head_bold: false, body_font: 'Segoe UI', caps: false, decor: 'minimal', title_mark: 'dot', bullet: '—',
    card_style: 'outline', radius: 0.02, transition: 'fade', effect: 'fade' },
  'nen-toi': { name: 'Nền tối neon', desc: 'Nền xanh đen, điểm sáng neon ngọc và tím, lưới mảnh — công nghệ, sự kiện.',
    bg: '0E0F1A', bg2: '13152A', ink: 'F2F3FA', body: 'C3C6DE', muted: '8A8FB0', accent: '00D9BD', accent2: '8B5CF6', accent3: 'F472B6',
    card: '1A1D33', card_line: '2C3150', inv: ['0A0B14', '1A1240', '0E2A3A'], inv_ink: 'F7F8FF', inv_body: 'C3C6DE', inv_accent: '00E5C7',
    head: 'Segoe UI Black', head_bold: false, body_font: 'Segoe UI', caps: false, decor: 'neon', title_mark: 'bar', bullet: '▸',
    card_style: 'outline', radius: 0.1, transition: 'morph', effect: 'zoom' },
  'thanh-lich': { name: 'Thanh lịch vàng kim', desc: 'Nền ngà, chữ có chân, khung viền mảnh và điểm vàng kim — trang trọng.',
    bg: 'FBF8F2', bg2: 'F4EEE3', ink: '1E1B16', body: '4D463C', muted: '7A7062', accent: '9A6F22', accent2: 'C9A96E', accent3: '7A6A55',
    card: 'FFFDF8', card_line: 'E3D6BD', inv: ['16130F', '2A241C'], inv_ink: 'F5ECD9', inv_body: 'D9CDB6', inv_accent: 'D9B76A',
    head: 'Palatino Linotype', head_bold: false, body_font: 'Segoe UI', caps: false, decor: 'frame', title_mark: 'rule', bullet: '◆',
    card_style: 'outline', radius: 0.0, transition: 'fade', effect: 'fade' },
  'co-dien': { name: 'Cổ điển · Vintage', desc: 'Giấy cũ, khung đôi, hoa văn góc, đỏ gạch và nâu — lịch sử, văn hóa.',
    bg: 'EFE6D2', bg2: 'E8DCC2', ink: '3B2A1E', body: '54402F', muted: '7A6550', accent: '8C2F1B', accent2: 'A67C52', accent3: '2F5D62',
    card: 'F6EFDF', card_line: 'CDB892', inv: ['3B2A1E', '5B3A29'], inv_ink: 'F3E9D2', inv_body: 'E2D3B5', inv_accent: 'E0B47A',
    head: 'Constantia', head_bold: true, body_font: 'Palatino Linotype', caps: false, decor: 'vintage', title_mark: 'ornament', bullet: '◆',
    card_style: 'outline', radius: 0.0, transition: 'fade', effect: 'wipe' },
  'de-thuong': { name: 'Dễ thương pastel', desc: 'Pastel ấm, mảng màu hữu cơ, góc bo lớn — lớp học, thiếu nhi, cộng đồng.',
    bg: 'FFF7EE', bg2: 'F2F6FF', ink: '3D405B', body: '55597A', muted: '7A7E98', accent: 'D9534F', accent2: '81B29A', accent3: 'F2CC8F',
    card: 'FFFDF9', card_line: 'F1DFCC', inv: ['FFE3D3', 'FFD6E0'], inv_ink: '3D405B', inv_body: '55597A', inv_accent: 'D9534F',
    head: 'Candara', head_bold: true, body_font: 'Candara', caps: false, decor: 'blobs', title_mark: 'dots', bullet: '●',
    card_style: 'solid', radius: 0.3, transition: 'morph', effect: 'zoom' },
  'nghe-thuat': { name: 'Nghệ thuật táo bạo', desc: 'Khối màu kiểu Matisse đỏ, lam, cam; tiêu đề in hoa đậm — sáng tạo, nổi bật.',
    bg: 'F5EBDD', bg2: 'FFF8EC', ink: '1D1D1B', body: '3B3A36', muted: '6A675F', accent: 'C62E3A', accent2: '1D4E89', accent3: 'F4A261',
    card: 'FFFDF7', card_line: 'E6D5BE', inv: ['1D4E89', '1D4E89'], inv_ink: 'FFF8EC', inv_body: 'E3EAF4', inv_accent: 'F4A261',
    head: 'Segoe UI Black', head_bold: false, body_font: 'Corbel', caps: true, decor: 'matisse', title_mark: 'block', bullet: '■',
    card_style: 'solid', radius: 0.0, transition: 'morph', effect: 'fly' },
  'thien-nhien': { name: 'Thiên nhiên', desc: 'Xanh lá, lá cây ở góc, chữ có chân ấm — môi trường, sức khỏe, giáo dục.',
    bg: 'F3F6EE', bg2: 'FAF7EF', ink: '1F3A2D', body: '41594A', muted: '62786A', accent: '2D6A4F', accent2: '95B46A', accent3: 'D4A373',
    card: 'FBFCF8', card_line: 'D6E2CC', inv: ['1F3A2D', '2D6A4F'], inv_ink: 'F3F6EE', inv_body: 'D3E3D4', inv_accent: 'C9DF9E',
    head: 'Cambria', head_bold: true, body_font: 'Corbel', caps: false, decor: 'leaves', title_mark: 'bar', bullet: '●',
    card_style: 'strip-top', radius: 0.14, transition: 'morph', effect: 'float' },
  'chuyen-nghiep': { name: 'Chuyên nghiệp xanh navy', desc: 'Navy và ngọc, dải màu bên trái, bố cục ngay ngắn — doanh nghiệp, cơ quan.',
    bg: 'F7F9FC', bg2: 'EEF2F8', ink: '0F2340', body: '425066', muted: '6A778C', accent: '0F62C9', accent2: '14B8A6', accent3: 'F59E0B',
    card: 'FFFFFF', card_line: 'DCE3EE', inv: ['0F2340', '163A6B'], inv_ink: 'F7F9FC', inv_body: 'CBD6E6', inv_accent: '5EEAD4',
    head: 'Segoe UI Semibold', head_bold: false, body_font: 'Segoe UI', caps: false, decor: 'sidebar', title_mark: 'bar', bullet: '■',
    card_style: 'border-left', radius: 0.04, transition: 'push', effect: 'wipe' },
  'truyen-tranh': { name: 'Truyện tranh · Comic', desc: 'Viền mực đen dày, chấm tram, tia nắng đỏ vàng xanh, thẻ bóng đổ khối — sinh động, thiếu nhi, ngoại khóa.',
    bg: 'FFF6DC', bg2: 'FFFBEF', ink: '111111', body: '2B2B2B', muted: '555555', accent: 'E63946', accent2: '1D4ED8', accent3: 'FFC300',
    card: 'FFFFFF', card_line: '111111', inv: ['1D4ED8', '1E3A8A'], inv_ink: 'FFFFFF', inv_body: 'E3EBFF', inv_accent: 'FFC300',
    head: 'Segoe UI Black', head_bold: false, body_font: 'Segoe UI', caps: true, decor: 'comic', title_mark: 'block', bullet: '■',
    card_style: 'comic', radius: 0.0, transition: 'push', effect: 'zoom' },
  'manga': { name: 'Manga đen trắng', desc: 'Trắng đen như trang truyện, đường tốc độ, chấm tram, một điểm đỏ — anime, manga, câu lạc bộ.',
    bg: 'FFFFFF', bg2: 'F5F5F5', ink: '0D0D0D', body: '2A2A2A', muted: '5C5C5C', accent: 'D62828', accent2: '1A1A1A', accent3: '8C8C8C',
    card: 'FFFFFF', card_line: '1A1A1A', inv: ['0D0D0D', '262626'], inv_ink: 'FFFFFF', inv_body: 'D9D9D9', inv_accent: 'FF4D4D',
    head: 'Segoe UI Black', head_bold: false, body_font: 'Segoe UI', caps: false, decor: 'manga', title_mark: 'bar', bullet: '▶',
    card_style: 'comic', radius: 0.0, transition: 'fade', effect: 'zoom' },
};
for (const k in THEMES) THEMES[k].id = k;

// Phong cách của thẻ trong bộ sưu tập -> mẫu nền gần nhất
const STYLE_BASE = { 'toi-gian': 'toi-gian', 'thanh-lich': 'thanh-lich', 'chuyen-nghiep': 'chuyen-nghiep', 'toi': 'nen-toi',
  'gradient': 'gradient', 'de-thuong': 'de-thuong', 'vintage': 'co-dien', 'nghe-thuat': 'nghe-thuat', 'thien-nhien': 'thien-nhien' };

/** Tạo mẫu từ một thẻ của bộ sưu tập: lấy kiểu dáng của mẫu gần nhất + bảng màu của thẻ. */
function themeFromCard(card) {
  let baseId = STYLE_BASE[card.style] || 'song-bien';
  if (/wave|sóng/i.test(card.name)) baseId = 'song-bien';
  const base = THEMES[baseId];
  const pal = card.pal.map(c => c.replace('#', '').toUpperCase());
  const sorted = [...pal].sort((a, b) => lum(b) - lum(a));
  const light = sorted[0], dark = sorted[2];
  let accent = pal[2];
  const th = Object.assign({}, base, { id: 'the-' + baseId, name: card.name, desc: 'Bảng màu của mẫu “' + card.name + '” trên kiểu dáng ' + base.name + '.' });
  if (base.id === 'nen-toi') {           // nền tối: nội dung trên nền tối
    const bg = lum(dark) < 0.06 ? dark : mix(dark, '0A0A12', 0.6);
    th.bg = bg; th.bg2 = mix(bg, accent, 0.08);
    th.ink = readable(bg, light, 'F5F5F7'); th.body = mix(th.ink, bg, 0.22); th.muted = mix(th.ink, bg, 0.45);
    th.accent = contrast(bg, accent) >= 3 ? accent : mix(accent, 'FFFFFF', 0.45);
    th.accent2 = pal[1] === dark ? mix(accent, 'FFFFFF', 0.3) : pal[1]; th.accent3 = mix(th.accent, th.accent2, 0.5);
    th.card = mix(bg, 'FFFFFF', 0.07); th.card_line = mix(bg, 'FFFFFF', 0.16);
    th.inv = [mix(bg, '000000', 0.3), mix(bg, accent, 0.25)]; th.inv_ink = th.ink; th.inv_body = th.body; th.inv_accent = th.accent;
    return th;
  }
  const bg = lum(light) > 0.75 ? light : mix(light, 'FFFFFF', 0.75);
  th.bg = bg; th.bg2 = mix(bg, accent, 0.06);
  const ink = lum(dark) < 0.1 ? dark : mix(dark, '101010', 0.55);
  th.ink = contrast(bg, ink) >= 7 ? ink : readable(bg, ink, '1A1A1A');
  th.body = mix(th.ink, bg, 0.22); th.muted = mix(th.ink, bg, 0.42);
  let a = accent; for (let i = 0; i < 6 && contrast(bg, a) < 3; i++) a = mix(a, th.ink, 0.25);
  th.accent = a;
  const mid = pal.find(c => c !== light && c !== dark) || accent;
  th.accent2 = mid === a ? mix(a, bg, 0.35) : mid; th.accent3 = mix(accent, mid, 0.5);
  th.card = mix(bg, 'FFFFFF', 0.6); th.card_line = mix(bg, th.ink, 0.12);
  th.inv = [ink, mix(ink, accent, 0.35)];
  th.inv_ink = readable(ink, bg, 'FFFFFF'); th.inv_body = mix(th.inv_ink, ink, 0.2);
  th.inv_accent = contrast(ink, accent) >= 3 ? accent : mix(accent, 'FFFFFF', 0.5);
  if (base.id === 'de-thuong') { th.inv = [mix(bg, accent, 0.18), mix(bg, mid, 0.22)]; th.inv_ink = th.ink; th.inv_body = th.body; th.inv_accent = th.accent; }
  return th;
}

// ============================================================ đo chữ
const _cv = document.createElement('canvas').getContext('2d');
const _fcache = new Map();
function textWidthPt(text, fam, size, bold) {
  const k = fam + '|' + (bold ? 1 : 0);
  if (_fcache.get('cur') !== k) { _cv.font = (bold ? '700 ' : '400 ') + '100px "' + fam + '", "Segoe UI", Arial, sans-serif'; _fcache.set('cur', k); }
  return _cv.measureText(text).width * size / 100;
}
function wrap(text, fam, size, widthIn, bold) {
  const maxw = widthIn * 72 * 0.965;
  const lines = [];
  for (const para of String(text).split('\n')) {
    let cur = '';
    for (let w of para.split(' ')) {
      const trial = cur ? cur + ' ' + w : w;
      if (textWidthPt(trial, fam, size, bold) <= maxw) { cur = trial; continue; }
      if (cur) lines.push(cur);
      while (textWidthPt(w, fam, size, bold) > maxw && w.length > 4) {
        let cut = w.length;
        while (cut > 1 && textWidthPt(w.slice(0, cut), fam, size, bold) > maxw) cut--;
        lines.push(w.slice(0, cut)); w = w.slice(cut);
      }
      cur = w;
    }
    lines.push(cur);
  }
  return lines;
}
const nLines = (t, f, s, w, b) => wrap(t, f, s, w, b).length;
const heightIn = (t, f, s, w, b, sp = 1.2) => nLines(t, f, s, w, b) * s * sp / 72;
function fitSize(text, fam, w, h, sizes, bold = false, spacing = 1.2, maxLines = 0) {
  for (const s of sizes) {
    const n = nLines(text, fam, s, w, bold);
    if (maxLines && n > maxLines) continue;
    if (n * s * spacing / 72 <= h) return s;
  }
  return null;
}

// ============================================================ mô hình nội dung
const BULLET_RE = /^\s*(?:[•●▪■◦○◆\-–—*·►▶✓✔→]|\d{1,2}[.)])\s+/u;
const LABEL_RE = /^\s*([^:：]{2,48})\s*[:：]\s+(.{6,})$/u;
const STAT_RE = /^\s*([<>~≈+\-]?\s?\d[\d.,]*\s?(?:%|‰|°C|°F|x|lần|triệu|tỷ|tỉ|nghìn|ngàn|km²|km|m²|m|ha|kg|tấn|k|K|M|B|USD|\$|đ|VNĐ|người|năm|giờ|ngày)?)\s*[:\-–—]\s*(.{4,})$|^\s*([<>~≈+\-]?\s?\d[\d.,]*\s?(?:%|‰|°C|lần|triệu|tỷ|tỉ|nghìn|km|ha|kg|tấn|USD|đ|người))\s+(.{4,})$/u;
const STEP_RE = /^\s*(?:bước|step|giai đoạn|phase|stage)\s*\d+\s*[:.\-–—]?\s*/iu;
const CLOSING_RE = /(thank|cảm ơn|cám ơn|q\s*&\s*a|hỏi đáp|questions|xin chân thành)/iu;
const CITE_RE = /(\(\s*(?:19|20)\d{2}[a-z]?\s*\)|et al\.|adapted from|nguồn\s*:|source\s*:|theo\s+[A-ZĐ])/iu;
const STEPTAG_RE = /^\s*(?:(?:step|bước|phần|part|giai đoạn|phase|stage|module|unit|bài|chương)\s*)?\d{1,2}[.:)]?\s*$/iu;

const Item = (text, kind = 'bullet', level = 0, label = '') => ({ text, kind, level, label });
const Slide = (o = {}) => Object.assign({ title: '', subtitle: '', items: [], images: [], table: null, notes: '', source: '', hint: '', cont: false }, o);
const clean = t => String(t || '').replace(/[\u000b ]/g, ' ').replace(/[ \t]+/g, ' ').trim();
const stripBullet = t => t.replace(BULLET_RE, '').trim();
const isUpper = t => t === t.toUpperCase() && t !== t.toLowerCase();
const isLowerChar = c => !!c && c === c.toLowerCase() && c !== c.toUpperCase();
const titleCase = t => t.replace(/\p{L}+/gu, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
const words = t => t.split(/\s+/).filter(Boolean);

// ---------- ảnh
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp',
  tif: 'image/tiff', tiff: 'image/tiff', emf: 'image/x-emf', wmf: 'image/x-wmf', svg: 'image/svg+xml' };
let _imgSeq = 0;
async function makeImg(data, ext, ratioHint, caption = '') {
  ext = (ext || 'png').toLowerCase().replace('jpeg', 'jpg');
  const img = { id: ++_imgSeq, data, ext, w: 0, h: 0, ratio: ratioHint || 1.5, diagram: true, caption, url: null };
  try {
    const blob = new Blob([data], { type: MIME[ext] || 'application/octet-stream' });
    const bmp = await createImageBitmap(blob);
    img.w = bmp.width; img.h = bmp.height; img.ratio = bmp.width / bmp.height;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); g.drawImage(bmp, 0, 0, 64, 64);
    const px = g.getImageData(0, 0, 64, 64).data;
    let light = 0; const cols = new Set();
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], gg = px[i + 1], b = px[i + 2];
      if (Math.min(r, gg, b) > 225 || px[i + 3] < 30) light++;
      cols.add((r >> 3) + ',' + (gg >> 3) + ',' + (b >> 3));
    }
    img.diagram = light / 4096 > 0.5 || cols.size < 260;
    const tooBig = data.length > (img.diagram ? 3e6 : 1.5e6);
    if (!['png', 'jpg', 'gif', 'bmp'].includes(ext) || tooBig) {
      // webp, svg… -> png cho PowerPoint nào cũng mở được; ảnh chụp quá nặng -> JPEG, cạnh dài tối đa 2400px
      const k = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
      const c2 = document.createElement('canvas'); c2.width = Math.round(bmp.width * k); c2.height = Math.round(bmp.height * k);
      const g2 = c2.getContext('2d');
      const asJpg = tooBig && !img.diagram;
      if (asJpg) { g2.fillStyle = '#fff'; g2.fillRect(0, 0, c2.width, c2.height); }
      g2.drawImage(bmp, 0, 0, c2.width, c2.height);
      const pb = await new Promise(r => c2.toBlob(r, asJpg ? 'image/jpeg' : 'image/png', 0.86));
      if (pb && (pb.size < data.length || !['png', 'jpg', 'gif', 'bmp'].includes(ext))) {
        img.data = new Uint8Array(await pb.arrayBuffer()); img.ext = asJpg ? 'jpg' : 'png';
      }
    }
    img.url = URL.createObjectURL(new Blob([img.data], { type: MIME[img.ext] }));
  } catch (e) { /* emf/wmf/tiff: giữ nguyên dữ liệu, dùng tỉ lệ khung gốc, đặt vừa khung */ }
  return img;
}

// ============================================================ đọc file
async function readFiles(files) {
  const list = [...files];
  const doc = list.find(f => /\.(pptx|docx|md|markdown|txt)$/i.test(f.name));
  if (!doc) throw new Error('Hãy chọn một file .pptx, .docx, .md hoặc .txt');
  const ext = doc.name.split('.').pop().toLowerCase();
  const extras = new Map(list.filter(f => f !== doc).map(f => [f.name.toLowerCase(), f]));
  let deck;
  if (ext === 'pptx') deck = await readPptx(await JSZip.loadAsync(await doc.arrayBuffer()));
  else if (ext === 'docx') deck = await readDocx(await JSZip.loadAsync(await doc.arrayBuffer()));
  else {
    const text = (await doc.text()).replace(/^﻿/, '');
    deck = ext === 'txt' ? readTxt(text) : await readMd(text, extras);
  }
  deck.fileName = doc.name.replace(/\.[^.]+$/, '');
  if (!deck.title) deck.title = deck.fileName;
  return deck;
}

const parseXml = s => new DOMParser().parseFromString(s, 'application/xml');
const kids = (el, ln) => el ? [...el.children].filter(c => c.localName === ln) : [];
const kid = (el, ln) => kids(el, ln)[0] || null;
const desc = (el, ln) => el ? [...el.getElementsByTagName('*')].filter(c => c.localName === ln) : [];
const path = (el, ...lns) => { for (const l of lns) { el = kid(el, l); if (!el) return null; } return el; };
const attr = (el, n) => el ? el.getAttribute(n) : null;

function resolve(base, target) {
  if (target.startsWith('/')) return target.slice(1);
  const parts = base.split('/'); parts.pop();
  for (const p of target.split('/')) { if (p === '..') parts.pop(); else if (p !== '.') parts.push(p); }
  return parts.join('/');
}
async function rels(zip, part) {
  const i = part.lastIndexOf('/');
  const rp = part.slice(0, i) + '/_rels/' + part.slice(i + 1) + '.rels';
  const f = zip.file(rp); const map = {};
  if (!f) return map;
  for (const r of desc(parseXml(await f.async('string')).documentElement, 'Relationship'))
    map[r.getAttribute('Id')] = { target: r.getAttribute('TargetMode') === 'External' ? null : resolve(part, r.getAttribute('Target')), type: r.getAttribute('Type') };
  return map;
}

// ---------- PowerPoint
async function readPptx(zip) {
  const presPath = 'ppt/presentation.xml';
  const pres = parseXml(await zip.file(presPath).async('string')).documentElement;
  const sz = desc(pres, 'sldSz')[0];
  const SWe = +attr(sz, 'cx') || 12192000, SHe = +attr(sz, 'cy') || 6858000;
  const prel = await rels(zip, presPath);
  const ids = desc(pres, 'sldId').map(e => e.getAttribute('r:id'));
  const deck = { title: '', subtitle: '', meta: [], slides: [], coverNotes: '' };
  const raw = [];
  for (let si = 0; si < ids.length; si++) {
    const sp = prel[ids[si]] && prel[ids[si]].target; if (!sp || !zip.file(sp)) continue;
    const sx = parseXml(await zip.file(sp).async('string')).documentElement;
    const srel = await rels(zip, sp);
    // bố cục & khuôn để lấy vị trí của placeholder không có xfrm
    const layPath = Object.values(srel).find(r => /slideLayout$/.test(r.type));
    let layDoc = null, masDoc = null;
    if (layPath && layPath.target && zip.file(layPath.target)) {
      layDoc = parseXml(await zip.file(layPath.target).async('string')).documentElement;
      const lrel = await rels(zip, layPath.target);
      const m = Object.values(lrel).find(r => /slideMaster$/.test(r.type));
      if (m && m.target && zip.file(m.target)) masDoc = parseXml(await zip.file(m.target).async('string')).documentElement;
    }
    const phXfrm = (type, idx) => {
      for (const d of [layDoc, masDoc]) {
        if (!d) continue;
        for (const s of desc(d, 'sp')) {
          const ph = desc(s, 'ph')[0]; if (!ph) continue;
          if ((idx && attr(ph, 'idx') === idx) || (type && (attr(ph, 'type') || 'body') === type)) {
            const x = path(s, 'spPr', 'xfrm'); if (x) return x;
          }
        }
      }
      return null;
    };
    const frames = [], imgs = []; let table = null;
    const tree = desc(sx, 'spTree')[0];
    const items = [];
    (function walk(container, tf) {
      for (const ch of container.children) {
        const ln = ch.localName;
        if (ln === 'grpSp') {
          const x = path(ch, 'grpSpPr', 'xfrm'); let t2 = tf;
          if (x) {
            const o = kid(x, 'off'), e = kid(x, 'ext'), co = kid(x, 'chOff'), ce = kid(x, 'chExt');
            const ox = +attr(o, 'x'), oy = +attr(o, 'y'), ex = +attr(e, 'cx'), ey = +attr(e, 'cy');
            const cx = +attr(co, 'x') || 0, cy = +attr(co, 'y') || 0, cex = +attr(ce, 'cx') || ex || 1, cey = +attr(ce, 'cy') || ey || 1;
            const sx_ = ex / cex, sy_ = ey / cey;
            t2 = (X, Y, W_, H_) => tf(ox + (X - cx) * sx_, oy + (Y - cy) * sy_, W_ * sx_, H_ * sy_);
          }
          walk(ch, t2);
        } else if (ln === 'sp' || ln === 'pic' || ln === 'graphicFrame') items.push([ch, tf]);
      }
    })(tree, (x, y, w, h) => [x, y, w, h]);

    for (const [el, tf] of items) {
      const ph = desc(el, 'ph')[0];
      const phType = ph ? (attr(ph, 'type') || 'body') : null;
      if (['sldNum', 'dt', 'ftr'].includes(phType)) continue;
      let xf = el.localName === 'graphicFrame' ? kid(el, 'xfrm') : path(el, 'spPr', 'xfrm');
      if (!xf || !kid(xf, 'off')) xf = ph ? phXfrm(phType, attr(ph, 'idx')) : null;
      let geo = [0, 0, 0, 0];
      if (xf && kid(xf, 'off')) geo = tf(+attr(kid(xf, 'off'), 'x'), +attr(kid(xf, 'off'), 'y'), +attr(kid(xf, 'ext'), 'cx'), +attr(kid(xf, 'ext'), 'cy'));
      const top = geo[1] / SHe, left = geo[0] / SWe, wid = geo[2] / SWe, hei = geo[3] / SHe;
      const blip = desc(el, 'blip')[0];
      if (el.localName === 'pic' && blip) {
        if (wid * 13.33 < 0.6 && hei * 7.5 < 0.6) continue;
        const r = srel[blip.getAttribute('r:embed')];
        if (r && r.target && zip.file(r.target)) {
          const data = await zip.file(r.target).async('uint8array');
          imgs.push([top, left, await makeImg(data, r.target.split('.').pop(), geo[3] ? geo[2] / geo[3] : 1.5)]);
        }
        continue;
      }
      const tbl = desc(el, 'tbl')[0];
      if (tbl) { table = desc(tbl, 'tr').map(tr => kids(tr, 'tc').map(tc => clean(desc(tc, 't').map(t => t.textContent).join(' ')))); continue; }
      const tx = kid(el, 'txBody'); if (!tx) continue;
      const paras = []; let maxsz = 0, bold = false;
      for (const p of kids(tx, 'p')) {
        let t = '';
        for (const c of p.children) {
          if (c.localName === 'r' || c.localName === 'fld') t += desc(c, 't').map(x => x.textContent).join('');
          else if (c.localName === 'br') t += ' ';
        }
        t = clean(t); if (!t) continue;
        for (const rp of desc(p, 'rPr')) { const s = +attr(rp, 'sz'); if (s) maxsz = Math.max(maxsz, s / 100); if (attr(rp, 'b') === '1') bold = true; }
        const pPr = kid(p, 'pPr');
        const lvl = +(attr(pPr, 'lvl') || 0);
        paras.push([t, lvl]);
      }
      if (!paras.length) continue;
      frames.push({ top, left, w: wid, h: hei, paras, size: maxsz || 18, bold, title: phType === 'title' || phType === 'ctrTitle', sub: phType === 'subTitle' });
    }
    let notes = '';
    const nr = Object.values(srel).find(r => /notesSlide$/.test(r.type));
    if (nr && nr.target && zip.file(nr.target)) {
      const nx = parseXml(await zip.file(nr.target).async('string')).documentElement;
      for (const s of desc(nx, 'sp')) {
        const ph = desc(s, 'ph')[0];
        if (ph && attr(ph, 'type') === 'body') notes = desc(s, 'p').map(p => desc(p, 't').map(t => t.textContent).join('')).join('\n').trim();
      }
    }
    const s = framesToSlide(frames, si);
    s.images = imgs.sort((a, b) => (Math.round(a[0] * 10) - Math.round(b[0] * 10)) || (a[1] - b[1])).map(x => x[2]);
    s.table = table; s.notes = notes;
    raw.push(s);
  }
  if (raw.length) {
    const first = raw[0];
    deck.title = first.title; deck.subtitle = first.subtitle;
    const meta = first.items.map(i => i.text);
    if (!deck.subtitle && meta.length && meta[0].length < 120) deck.subtitle = meta.shift();
    deck.meta = meta; deck.coverNotes = first.notes; deck.slides = raw.slice(1);
  }
  return deck;
}

function framesToSlide(frames, si) {
  const s = Slide();
  if (!frames.length) return s;
  const textOf = f => f.paras.map(p => p[0]).join(' ');
  let tf = frames.find(f => f.title) || null;
  if (!tf) {
    const cands = frames.filter(f => f.top < 0.42 && textOf(f).length <= 140);
    if (cands.length) {
      tf = cands.reduce((m, f) => (f.size > m.size || (f.size === m.size && f.top < m.top)) ? f : m);
      if (tf.size < 20 && si > 0 && Math.max(...frames.map(f => f.size)) > tf.size) tf = null;
    }
  }
  if (tf) { s.title = textOf(tf); frames = frames.filter(f => f !== tf); }
  const sub = frames.find(f => f.sub);
  if (sub) { s.subtitle = textOf(sub); frames = frames.filter(f => f !== sub); }
  const sizes = frames.map(f => f.size).sort((a, b) => a - b);
  const med = sizes.length ? sizes[Math.floor(sizes.length / 2)] : 18;
  const keep = [];
  for (const f of frames) {
    const t = textOf(f);
    if (f.top > 0.82 && (CITE_RE.test(t) || f.size < med - 2) && t.length < 260) s.source = (s.source + ' ' + t).trim();
    else keep.push(f);
  }
  frames = keep.sort((a, b) => (Math.round(a.top / 0.035) - Math.round(b.top / 0.035)) || (a.left - b.left));
  if (tf && !s.subtitle && frames.length) {
    const f0 = frames.reduce((m, f) => f.top < m.top ? f : m);
    const t = textOf(f0), gap = f0.top - (tf.top + tf.h);
    const alone = !frames.some(f => f !== f0 && Math.abs(f.top - f0.top) < 0.03);
    if (f0.paras.length === 1 && t.length < 90 && !isUpper(t) && gap > -0.02 && gap < 0.07 && Math.abs(f0.left - tf.left) < 0.03 && frames.length > 1 && alone) {
      s.subtitle = t; frames = frames.filter(f => f !== f0);
    }
  }
  const isShort = f => { const t = textOf(f); return f.paras.length === 1 && !isLowerChar(t[0]) && (words(t).length <= 4 || (isUpper(t) && t.length <= 32)); };
  const overlap = (f, g) => { const lo = Math.max(f.left, g.left), hi = Math.min(f.left + f.w, g.left + g.w); return Math.max(0, hi - lo) / Math.max(Math.min(f.w, g.w), 1e-6); };
  // 1) nhãn kiểu "STEP 1" + nhãn sát bên => gộp
  const merged = []; const skip = new Set();
  frames.forEach((f, i) => {
    if (skip.has(i)) return;
    if (isShort(f) && STEPTAG_RE.test(textOf(f))) {
      for (let k = i + 1; k < frames.length; k++) {
        const g = frames[k]; if (skip.has(k) || !isShort(g)) continue;
        const gx = g.left - (f.left + f.w);
        if (Math.abs(g.top - f.top) < 0.015 && gx >= 0 && gx < 0.04) {
          f = Object.assign({}, f, { paras: [[textOf(f) + ' · ' + textOf(g), 0]], w: g.left + g.w - f.left }); skip.add(k);
        }
      }
    }
    merged.push(f);
  });
  frames = merged;
  // 2) khối nội dung tìm nhãn ngắn gần nhất phía trên (hoặc bên trái cùng hàng)
  const labelOf = new Map(), taken = new Set();
  frames.forEach((bf, bi) => {
    if (isShort(bf)) return;
    let best = null, bestGap = 9;
    frames.forEach((lf, li) => {
      if (li === bi || taken.has(li) || !isShort(lf) || textOf(bf).length <= textOf(lf).length) return;
      const gap = bf.top - (lf.top + lf.h);
      if (gap >= -0.01 && gap <= 0.22 && overlap(lf, bf) >= 0.5) {
        const between = frames.some((g, k) => k !== li && k !== bi && overlap(g, bf) > 0.3 && lf.top + lf.h - 0.005 < g.top && g.top < bf.top - 0.005);
        if (!between && gap < bestGap) { best = li; bestGap = gap; }
      } else if (Math.abs(bf.top - lf.top) < 0.03 && bf.left - (lf.left + lf.w) >= 0 && bf.left - (lf.left + lf.w) < 0.1 && bestGap > 0.5) {
        best = li; bestGap = 0.5;
      }
    });
    if (best !== null) { labelOf.set(best, bi); taken.add(best); }
  });
  const consumed = new Set(labelOf.values());
  const items = [];
  frames.forEach((f, i) => {
    if (consumed.has(i)) return;
    const t = textOf(f);
    if (labelOf.has(i)) {
      const body = frames[labelOf.get(i)];
      const lab = isUpper(t) ? titleCase(t) : t;
      if (body.paras.length >= 4 || textOf(body).length > 320) {
        items.push(Item(lab, 'head'));
        for (const [bt, lvl] of mergeBroken(body.paras)) items.push(Item(stripBullet(bt), 'bullet', Math.min(lvl, 2)));
      } else items.push(Item(mergeBroken(body.paras).map(p => stripBullet(p[0])).join('\n'), 'card', 0, lab));
      return;
    }
    if (isShort(f)) { items.push(Item(isUpper(t) && t.includes('·') ? titleCase(t) : t, 'chip', Math.round(f.top / 0.04))); return; }
    if (f.paras.length === 1) { const p = f.paras[0][0]; items.push(Item(stripBullet(p), BULLET_RE.test(p) ? 'bullet' : 'para')); }
    else { const mp = mergeBroken(f.paras); for (const [bt, lvl] of mp) items.push(Item(stripBullet(bt), mp.length > 1 ? 'bullet' : 'para', Math.min(lvl, 2))); }
  });
  fixChips(items);
  items.forEach((it, k) => {
    if (k < items.length - 1 && it.kind === 'para' && words(it.text).length <= 8 && !/[.!;,]$/.test(it.text) && items[k + 1].kind === 'bullet') it.kind = 'head';
  });
  s.items = items;
  return s;
}
function mergeBroken(paras) {
  const out = [];
  for (const [t, lvl] of paras) {
    if (out.length && isLowerChar(t[0]) && !BULLET_RE.test(t) && !/[.!?;]$/.test(out[out.length - 1][0])) out[out.length - 1] = [out[out.length - 1][0] + ' ' + t, out[out.length - 1][1]];
    else out.push([t, lvl]);
  }
  return out;
}
function fixChips(items) {
  const rows = new Map();
  for (const it of items) if (it.kind === 'chip' && !it.text.includes('·')) { if (!rows.has(it.level)) rows.set(it.level, []); rows.get(it.level).push(it); }
  for (const row of rows.values()) if (row.length < 2) for (const it of row) it.kind = (/[?:]$/.test(it.text) || words(it.text).length >= 2) ? 'head' : 'para';
  for (const it of items) if (it.kind === 'chip') it.level = 0;
}

// ---------- Word
async function readDocx(zip) {
  const docPath = 'word/document.xml';
  const doc = parseXml(await zip.file(docPath).async('string')).documentElement;
  const styleNames = {};
  if (zip.file('word/styles.xml')) {
    const st = parseXml(await zip.file('word/styles.xml').async('string')).documentElement;
    for (const s of desc(st, 'style')) { const n = desc(s, 'name')[0]; styleNames[s.getAttribute('w:styleId')] = (n ? n.getAttribute('w:val') : s.getAttribute('w:styleId')).toLowerCase(); }
  }
  const rel = await rels(zip, docPath);
  const deck = { title: '', subtitle: '', meta: [], slides: [], coverNotes: '' };
  const slides = []; let cur = null, pendingLabel = '', h1Open = null;
  const nw = (title, hint = '') => { cur = Slide({ title, hint }); slides.push(cur); return cur; };
  const body = desc(doc, 'body')[0];
  for (const el of body.children) {
    if (el.localName === 'tbl') {
      const rows = kids(el, 'tr').map(tr => kids(tr, 'tc').map(tc => clean(desc(tc, 't').map(t => t.textContent).join(' ')))).filter(r => r.some(Boolean));
      if (rows.length) {
        if (!cur || cur.items.length || cur.table || cur.images.length) { const t = cur ? cur.title : deck.title; nw(t); cur.cont = !!t; }
        cur.table = rows;
      }
      continue;
    }
    if (el.localName !== 'p') continue;
    const pPr = kid(el, 'pPr');
    const sid = attr(path(pPr, 'pStyle'), 'w:val') || '';
    const style = styleNames[sid] || sid.toLowerCase();
    let txt = '';
    for (const n of el.getElementsByTagName('*')) { if (n.localName === 't') txt += n.textContent; else if (n.localName === 'tab' || n.localName === 'br') txt += ' '; }
    txt = clean(txt);
    for (const b of desc(el, 'blip')) {
      const r = rel[b.getAttribute('r:embed')];
      if (r && r.target && zip.file(r.target)) {
        const ext = desc(el, 'extent')[0];
        const ratio = ext ? (+attr(ext, 'cx')) / (+attr(ext, 'cy') || 1) : 1.5;
        const im = await makeImg(await zip.file(r.target).async('uint8array'), r.target.split('.').pop(), ratio);
        if (!cur) nw(deck.title || '');
        cur.images.push(im);
      }
    }
    if (!txt) continue;
    if (style === 'title') { deck.title = txt; continue; }
    if (style === 'subtitle') { deck.subtitle = txt; continue; }
    const m = style.match(/heading (\d)/) || style.match(/đề mục (\d)/);
    if (m) {
      const lvl = +m[1];
      if (lvl === 1) {
        if (!deck.title && !slides.length) { deck.title = txt; continue; }
        h1Open = nw(txt); pendingLabel = '';
      } else if (lvl === 2) {
        if (h1Open && h1Open === cur && !cur.items.length && !cur.images.length && !cur.table) h1Open.hint = 'section';
        nw(txt); pendingLabel = '';
      } else pendingLabel = txt;
      continue;
    }
    if (!cur) {
      if (!deck.title) { deck.title = txt; continue; }
      if (!deck.subtitle && txt.length < 140 && !slides.length) { deck.subtitle = txt; continue; }
      nw(deck.title);
    }
    const isList = style.includes('list') || !!path(pPr, 'numPr');
    const ilvl = isList ? +(attr(path(pPr, 'numPr', 'ilvl'), 'w:val') || 0) : 0;
    if (style.includes('quote') || style.includes('trích')) cur.items.push(Item(txt, 'quote'));
    else if (pendingLabel) { cur.items.push(Item(txt, 'card', 0, pendingLabel)); pendingLabel = ''; }
    else if (isList || BULLET_RE.test(txt)) cur.items.push(Item(stripBullet(txt), 'bullet', Math.min(ilvl, 2)));
    else cur.items.push(Item(txt, 'para'));
  }
  if (pendingLabel && cur) cur.items.push(Item(pendingLabel, 'para'));
  deck.slides = slides.filter(s => s.title || s.items.length || s.images.length || s.table);
  if (!deck.slides.some(s => s.title)) autoTitles(deck);
  return deck;
}

// ---------- Markdown / văn bản
const mdInline = t => clean(t.replace(/\*\*(.+?)\*\*|__(.+?)__/g, (_, a, b) => a || b).replace(/(^|[^\w])[*_](.+?)[*_](?!\w)/g, '$1$2')
  .replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'));

async function readMd(text, extras) {
  const deck = { title: '', subtitle: '', meta: [], slides: [], coverNotes: '' };
  const slides = []; let cur = null, label = '', paraBuf = [], tableBuf = [];
  const nw = (title, hint = '') => { cur = Slide({ title, hint }); slides.push(cur); };
  const flush = () => {
    if (paraBuf.length) {
      const t = paraBuf.join(' ');
      if (!cur) { if (!deck.subtitle) deck.subtitle = t; else deck.meta.push(t); }
      else if (label) { cur.items.push(Item(t, 'card', 0, label)); label = ''; }
      else cur.items.push(Item(t, 'para'));
      paraBuf = [];
    }
    if (tableBuf.length) {
      const rows = tableBuf.filter(r => !r.filter(c => c.trim()).every(c => /^:?-{2,}:?$/.test(c.trim())));
      if (!cur) nw(deck.title);
      cur.table = rows; tableBuf = [];
    }
  };
  const pending = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, ''), st = line.trim();
    if (!st) { flush(); continue; }
    if (st.startsWith('|') && st.endsWith('|')) { if (paraBuf.length) flush(); tableBuf.push(st.slice(1, -1).split('|').map(clean)); continue; }
    else if (tableBuf.length) flush();
    let m = st.match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      flush(); const lvl = m[1].length, t = clean(m[2]);
      if (lvl === 1) { if (!deck.title && !slides.length) deck.title = t; else nw(t, 'section'); }
      else if (lvl === 2) nw(t);
      else label = t;
      continue;
    }
    if (['---', '***', '___'].includes(st)) { flush(); if (cur && (cur.items.length || cur.images.length)) { nw(cur.title); cur.cont = true; } continue; }
    m = st.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (m) {
      flush();
      const name = m[2].split(' ')[0].split(/[\\/]/).pop().toLowerCase();
      const f = extras.get(name);
      if (!cur) nw(deck.title);
      if (f) cur.images.push(await makeImg(new Uint8Array(await f.arrayBuffer()), name.split('.').pop(), 1.5, m[1]));
      else pending.push(name);
      continue;
    }
    const low = st.toLowerCase();
    if (/^(ghi chú:|notes?:|\?\?\?)/.test(low)) {
      flush(); const v = st.includes(':') ? st.slice(st.indexOf(':') + 1).trim() : st.replace(/^\?+/, '').trim();
      if (cur) cur.notes = (cur.notes + '\n' + v).trim(); else deck.coverNotes = v;
      continue;
    }
    if (st.startsWith('>')) { flush(); if (!cur) nw(deck.title); cur.items.push(Item(clean(st.replace(/^>\s*/, '')), 'quote')); continue; }
    if (BULLET_RE.test(st)) {
      flush();
      const indent = line.length - line.replace(/^[ \t]+/, '').length;
      const t = mdInline(stripBullet(st));
      if (!cur) { if (deck.title) { deck.meta.push(t); continue; } nw(''); }
      if (label) { cur.items.push(Item(t, 'card', 0, label)); label = ''; }
      else cur.items.push(Item(t, 'bullet', Math.min(Math.floor(indent / 2), 2)));
      continue;
    }
    paraBuf.push(mdInline(st));
  }
  flush();
  if (label && cur) cur.items.push(Item(label, 'para'));
  deck.slides = slides.filter(s => s.title || s.items.length || s.images.length || s.table);
  if (!deck.title) deck.title = deck.slides.length ? deck.slides[0].title : 'Bài trình bày';
  deck.missingImages = pending;
  return deck;
}

function readTxt(text) {
  const blocks = text.trim().split(/\n\s*\n/).filter(b => b.trim());
  const deck = { title: '', subtitle: '', meta: [], slides: [], coverNotes: '' };
  if (!blocks.length) return deck;
  const head = blocks[0].split('\n').filter(l => l.trim()).map(clean);
  deck.title = head[0];
  if (head.length > 1) { deck.subtitle = head[1]; deck.meta = head.slice(2); }
  for (const b of blocks.slice(1)) {
    let lines = b.split('\n').map(l => l.replace(/\s+$/, '')).filter(l => l.trim());
    const first = clean(lines[0]);
    const s = Slide();
    if (lines.length > 1 && words(first).length <= 12 && !/[.!?:;,]$/.test(first) && !BULLET_RE.test(first)) { s.title = first; lines = lines.slice(1); }
    for (const l of lines) {
      const t = clean(l);
      if (BULLET_RE.test(l.trim())) s.items.push(Item(stripBullet(t), 'bullet', Math.min(Math.floor((l.length - l.trimStart().length) / 2), 2)));
      else s.items.push(Item(t, 'para'));
    }
    if (lines.length === 1 && !s.title && words(first).length <= 8) { s.title = first; s.items = []; }
    deck.slides.push(s);
  }
  if (!deck.slides.some(s => s.title)) autoTitles(deck);
  return deck;
}
function autoTitles(deck) {
  for (const s of deck.slides) {
    if (!s.title && s.items.length) {
      const first = s.items[0].text.split(/(?<=[.!?:])\s/)[0];
      if (first.length <= 70 && s.items.length > 1) { s.title = first.replace(/[.:]+$/, ''); s.items = s.items.slice(1); }
    }
  }
}

// ============================================================ IR: trang slide và các phần tử
// Mỗi slide: {bg, els[], steps[[{el,eff}]], transition, notes}. Đơn vị: inch.
const KIND = { rect: 'rect', round: 'roundRect', ellipse: 'ellipse', chevron: 'chevron', arrow: 'rightArrow', diamond: 'diamond', triangle: 'triangle' };

class Ctx {
  constructor(out, th, idx, kind, inv, opts) {
    this.th = th; this.idx = idx; this.kind = kind; this.inv = inv; this.opts = opts;
    this.sl = { bg: null, els: [], steps: [], transition: null, notes: '' };
    out.push(this.sl);
    this.info = paint(this, th, inv, idx, kind);
    const bg = this.info.bg;
    if (inv) {
      this.ink = readable(bg, th.inv_ink, 'FFFFFF'); this.body = readable(bg, th.inv_body, th.inv_ink);
      this.accent = contrast(bg, th.inv_accent) >= 3 ? th.inv_accent : this.ink; this.muted = th.inv_body;
    } else {
      this.ink = readable(bg, th.ink); this.body = readable(bg, th.body, th.ink);
      this.accent = contrast(bg, th.accent) >= 3 ? th.accent : th.ink; this.muted = readable(bg, th.muted, th.body);
    }
    this.bg = bg; this.head = th.head; this.font = th.body_font; this.hb = th.head_bold;
    this.eff = opts.effect || th.effect;
  }
  get x0() { return this.info.x0; } get x1() { return this.info.x1; } get y0() { return this.info.y0; } get y1() { return this.info.y1; }
  add(el) { this.sl.els.push(el); return el; }
  background(colors, angle = 135, radial = false) { this.sl.bg = colors.length === 1 ? { color: colors[0] } : { grad: colors, angle, radial }; }
  box(x, y, w, h, o = {}) {
    const fill = o.gradient ? { grad: o.gradient, angle: o.angle == null ? 90 : o.angle, radial: !!o.radial, alphas: o.galphas }
      : (o.color ? { color: o.color, alpha: o.alpha } : null);
    return this.add({ t: 'shape', x, y, w: Math.max(w, 0.01), h: Math.max(h, 0.01), geom: KIND[o.kind || 'rect'],
      adj: o.kind === 'round' ? Math.max(0, Math.min(0.5, o.radius == null ? 0.12 : o.radius)) : null,
      fill, line: o.lineColor ? { color: o.lineColor, w: o.lineW || 1, alpha: o.lineAlpha } : null,
      shadow: o.shadow ? { color: o.shadow, alpha: 0.14, blur: 14, dist: 4 } : null,
      glow: o.glow ? { color: o.glow, pt: o.glowPt || 12, alpha: o.glowAlpha == null ? 0.5 : o.glowAlpha } : null,
      rot: o.rotation || 0, name: o.name || '' });
  }
  poly(pts, o = {}) {
    return this.add({ t: 'poly', pts, closed: o.closed !== false, fill: o.closed === false ? null : (o.color ? { color: o.color, alpha: o.alpha } : null),
      line: o.lineColor ? { color: o.lineColor, w: o.lineW || 1, alpha: o.lineAlpha } : null, name: o.name || '' });
  }
  text(x, y, w, h, content, o = {}) {
    const size = o.size || 18, spacing = o.spacing || 1.15;
    const paras = (typeof content === 'string' ? content.split('\n') : content).map(para => {
      const runs = (typeof para === 'string' ? [[para, {}]] : para).map(([t, st]) => ({
        t: (st.caps != null ? st.caps : o.caps) ? t.toUpperCase() : t, font: st.font || o.font || 'Segoe UI', size: st.size || size,
        bold: st.bold != null ? st.bold : !!o.bold, italic: st.italic != null ? st.italic : !!o.italic, color: st.color || o.color || '222222' }));
      return { runs, align: o.align || 'l', ln: Math.round(Math.max(...runs.map(r => r.size)) * spacing * 10) / 10, after: o.after || 0,
        bullet: o.bullet ? { char: o.bullet, color: o.bulletColor || o.color || '222222', indent: o.indent || 0 } : null };
    });
    const spec = { paras, anchor: o.anchor || 't', margin: o.margin || 0 };
    if (o.shape) { o.shape.text = spec; return o.shape; }
    return this.add({ t: 'text', x, y, w, h, text: spec, name: o.name || '' });
  }
  picture(img, x, y, w, h, mode = 'cover', radius = 0) {
    const rImg = img.ratio, rBox = w / h; const el = { t: 'pic', img, x, y, w, h, crop: null, radius, name: '' };
    if (mode === 'contain') {
      let nw_, nh_; if (rImg > rBox) { nw_ = w; nh_ = w / rImg; } else { nw_ = h * rImg; nh_ = h; }
      Object.assign(el, { x: x + (w - nw_) / 2, y: y + (h - nh_) / 2, w: nw_, h: nh_ });
    } else if (rImg > rBox) { const c = (1 - rBox / rImg) / 2; el.crop = { l: c, r: c, t: 0, b: 0 }; }
    else { const c = (1 - rImg / rBox) / 2; el.crop = { l: 0, r: 0, t: c * 0.6, b: c * 1.4 }; }
    return this.add(el);
  }
  step(els, eff) { els = (Array.isArray(els) ? els : [els]).filter(Boolean); if (els.length) this.sl.steps.push(els.map(e => ({ el: e, eff: eff || this.eff }))); }
  finish(notes) { this.sl.transition = this.opts.transition || this.th.transition; this.sl.anim = this.opts.anim || 'auto'; this.sl.notes = (notes || '').slice(0, 4000); }
}

// ============================================================ trang trí (giống bản Python)
function rng(seed) { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const uni = (r, a, b) => a + (b - a) * r();

function paint(ctx, th, inv, idx, kind) {
  const r = rng(idx * 7919 + th.id.length);
  const bgc = idx % 2 ? th.bg : th.bg2;
  if (inv) ctx.background(th.inv, 135); else ctx.background([bgc]);
  const info = { x0: 0.8, y0: 0.62, x1: SW - 0.8, y1: SH - 0.72, foot: inv ? th.inv_body : th.muted, bg: inv ? th.inv[0] : bgc };
  // họa tiết theo chủ đề (hoa-van.js): vẽ chồng lên trang trí của mẫu, hoặc thay hẳn ở trang bìa/chương/kết
  const motif = th.motif && G.TuDanTrang && G.TuDanTrang.MOTIFS ? G.TuDanTrang.MOTIFS[th.motif] : null;
  if (!(motif && inv && motif.ownInv)) (DECOR[th.decor] || DECOR.minimal)(ctx, th, inv, idx, kind, r, info);
  if (motif) motif.draw(ctx, th, inv, idx, kind, info);
  return info;
}
const wavePts = (top, amp, ph, freq) => { const p = [[-0.05, SH + 0.05]]; for (let i = 0; i <= 60; i++) { const x = -0.05 + (SW + 0.1) * i / 60; p.push([x, top + amp * Math.sin(freq * x + ph) + amp * 0.35 * Math.sin(2.3 * freq * x + ph * 1.7)]); } p.push([SW + 0.05, SH + 0.05]); return p; };
function blobPts(cx, cy, rad, r, n = 28, wob = 0.18) { const k = [0, 1, 2, 3, 4].map(() => uni(r, -wob, wob)); const p = []; for (let i = 0; i < n; i++) { const t = 2 * Math.PI * i / n; const rr = rad * (1 + k[0] * Math.sin(2 * t + k[1] * 5) + k[2] * Math.cos(3 * t + k[3] * 5) + k[4] * Math.sin(t)); p.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t)]); } return p; }
function leafPts(cx, cy, len, wid, ang) { const p = [], n = 14; for (let i = 0; i <= n; i++) { const t = i / n; p.push([t * len, wid * Math.sin(Math.PI * t) * (1 - 0.25 * t)]); } for (let i = n; i >= 0; i--) { const t = i / n; p.push([t * len, -wid * Math.sin(Math.PI * t) * (1 - 0.25 * t) * 0.85]); } const c = Math.cos(ang), s = Math.sin(ang); return p.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]); }

const TAU_ = Math.PI * 2;
/** Chấm tram: lưới chấm to dần về một góc/cạnh. (x, y) là góc neo; dir: 'bl' | 'tr' | 'b' */
function dotField(x, y, w, h, step, rmax, dir) {
  const out = [];
  for (let i = 0; i * step <= w + 0.01; i++) for (let j = 0; j * step <= h + 0.01; j++) {
    const off = j % 2 ? step / 2 : 0, dx = i * step + off, dy = j * step;
    const t = dir === 'b' ? 1 - dy / h : 1 - Math.hypot(dx / w, dy / h) / 1.15;
    if (t <= 0.05) continue;
    const rr = rmax * t, px = dir === 'tr' ? x - dx : x + dx, py = dir === 'tr' ? y + dy : y - dy;
    out.push(Array.from({ length: 10 }, (_, k) => [px + rr * Math.cos(TAU_ * k / 10), py + rr * Math.sin(TAU_ * k / 10)]));
  }
  return out;
}
const DECOR = {
  waves(ctx, th, inv, idx, kind, r, info) {
    const big = kind === 'cover' || kind === 'closing';
    const base = SH - (big ? 1.75 : (inv ? 1.25 : 0.95)), ph = idx * 0.85;
    const layers = inv ? [[th.accent2, 0.35], [th.inv_accent, 0.5], [th.bg, 1]] : [[th.accent2, 0.45], [th.accent, 0.75], [th.ink, 1]];
    layers.forEach(([c, a], k) => ctx.poly(wavePts(base + k * (big ? 0.32 : 0.22), 0.13 + 0.03 * (2 - k), ph + k * 1.3, 0.55 + 0.12 * k), { color: c, alpha: a < 1 ? a : null, name: '!!wave' + k }));
    info.y1 = base - (inv ? 0.4 : 0.35); info.foot = inv ? th.ink : th.inv_body; info.foot_y = SH - 0.42;
  },
  orbs(ctx, th, inv, idx, kind, r, info) {
    if (inv) {
      const cx = 10.6 + uni(r, -0.4, 0.4), cy = 2.2 + uni(r, -0.3, 0.3);
      ctx.box(cx - 3.4, cy - 3.4, 6.8, 6.8, { kind: 'ellipse', radial: true, gradient: ['FFFFFF', 'FFFFFF'], galphas: [0.18, 0], name: '!!orb1' });
      [2.8, 1.9, 1.1].forEach((rr, k) => ctx.box(cx - rr, cy - rr, 2 * rr, 2 * rr, { kind: 'ellipse', lineColor: 'FFFFFF', lineW: 1.25, lineAlpha: 0.16 + 0.04 * k, name: '!!ring' + k }));
      ctx.box(-2.2 + uni(r, -0.3, 0.3), SH - 2.6, 4.6, 4.6, { kind: 'ellipse', radial: true, gradient: [th.inv_accent, th.inv_accent], galphas: [0.22, 0], name: '!!orb2' });
      ctx.box(0, SH - 0.1, SW, 0.1, { gradient: [th.accent3, th.inv_accent], angle: 0, name: '!!bar' });
      info.y1 = SH - 0.8;
    } else {
      ctx.box(0, 0, SW, 0.12, { gradient: [th.inv[0], th.accent, th.accent2], angle: 0, name: '!!bar' });
      ctx.box(SW - 3.6 + uni(r, -0.5, 0.3), -2.4 + uni(r, -0.3, 0.3), 5.2, 5.2, { kind: 'ellipse', radial: true, gradient: [th.accent, th.accent], galphas: [0.16, 0], name: '!!orb1' });
      ctx.box(-1.8 + uni(r, -0.3, 0.3), SH - 1.9, 3.8, 3.8, { kind: 'ellipse', radial: true, gradient: [th.accent2, th.accent2], galphas: [0.12, 0], name: '!!orb2' });
    }
  },
  minimal(ctx, th, inv, idx, kind, r, info) {
    const col = inv ? th.inv_accent : th.accent;
    if (inv) {
      ctx.box(SW - 2.6 + uni(r, -0.2, 0.2), 1.0, 1.6, 1.6, { kind: 'ellipse', lineColor: col, lineW: 1, lineAlpha: 0.6, name: '!!circle' });
      ctx.box(SW - 2.0, SH - 0.55, 1.2, 0.03, { color: col, name: '!!line' });
    } else {
      ctx.box(SW - 0.95, 0.66, 0.13, 0.13, { kind: 'ellipse', color: col, name: '!!dot' });
      ctx.box(0.8, SH - 0.62, SW - 1.6, 0.012, { color: th.card_line, name: '!!line' });
      info.y1 = SH - 0.85;
    }
  },
  neon(ctx, th, inv, idx, kind, r, info) {
    if (!inv) ctx.background([th.bg, mix(th.bg, th.accent2, 0.12)], 120);
    const a = th.accent, b = th.accent2;
    ctx.box(SW - 4.2 + uni(r, -0.6, 0.4), -2.6 + uni(r, -0.4, 0.4), 6, 6, { kind: 'ellipse', radial: true, gradient: [b, b], galphas: [inv ? 0.32 : 0.22, 0], name: '!!glow1' });
    ctx.box(-2.4 + uni(r, -0.4, 0.6), SH - 2.8 + uni(r, -0.3, 0.3), 5, 5, { kind: 'ellipse', radial: true, gradient: [a, a], galphas: [inv ? 0.22 : 0.14, 0], name: '!!glow2' });
    if (inv) {
      for (let i = 1; i < 12; i++) ctx.box(i * SW / 12, 0, 0.008, SH, { color: 'FFFFFF', alpha: 0.05, name: '!!gv' + i });
      for (let j = 1; j < 7; j++) ctx.box(0, j * SH / 7, SW, 0.008, { color: 'FFFFFF', alpha: 0.05, name: '!!gh' + j });
    }
    ctx.box(0.8, 0.36, 0.9, 0.04, { color: a, glow: a, glowPt: 6, glowAlpha: 0.6, name: '!!neonline' });
  },
  frame(ctx, th, inv, idx, kind, r, info) {
    const col = inv ? th.inv_accent : th.accent2;
    ctx.box(0.3, 0.3, SW - 0.6, SH - 0.6, { lineColor: col, lineW: 0.9, lineAlpha: 0.7, name: '!!frame' });
    if (inv) {
      ctx.box(0.42, 0.42, SW - 0.84, SH - 0.84, { lineColor: col, lineW: 0.5, lineAlpha: 0.45, name: '!!frame2' });
      ctx.box(SW / 2 - 0.09, 0.21, 0.18, 0.18, { kind: 'diamond', color: col, name: '!!orn1' });
      ctx.box(SW / 2 - 0.09, SH - 0.39, 0.18, 0.18, { kind: 'diamond', color: col, name: '!!orn2' });
    }
    Object.assign(info, { x0: 0.95, x1: SW - 0.95, y0: 0.72, y1: SH - 0.85 });
  },
  vintage(ctx, th, inv, idx, kind, r, info) {
    if (!inv) { const bg = idx % 2 ? th.bg : th.bg2; ctx.background([bg, mix(bg, th.accent2, 0.28)], 0, true); }
    const col = inv ? th.inv_accent : th.accent2;
    ctx.box(0.25, 0.25, SW - 0.5, SH - 0.5, { lineColor: col, lineW: 2.2, lineAlpha: 0.75, name: '!!frame' });
    ctx.box(0.36, 0.36, SW - 0.72, SH - 0.72, { lineColor: col, lineW: 0.7, lineAlpha: 0.75, name: '!!frame2' });
    [[0.25, 0.25], [SW - 0.25, 0.25], [0.25, SH - 0.25], [SW - 0.25, SH - 0.25]].forEach(([x, y], k) => ctx.box(x - 0.13, y - 0.13, 0.26, 0.26, { kind: 'diamond', color: col, name: '!!corner' + k }));
    Object.assign(info, { x0: 0.95, x1: SW - 0.95, y0: 0.72, y1: SH - 0.85 });
  },
  blobs(ctx, th, inv, idx, kind, r, info) {
    const big = inv;
    ctx.poly(blobPts(SW - (big ? 0.6 : 0.2), -0.1, big ? 2.3 : 1.25, r), { color: th.accent3, alpha: 0.6, name: '!!blob1' });
    ctx.poly(blobPts(0.1, SH + 0.05, big ? 2.0 : 1.1, r), { color: th.accent2, alpha: 0.5, name: '!!blob2' });
    if (big) ctx.poly(blobPts(SW - 1.4, SH - 0.6, 0.9, r), { color: th.accent, alpha: 0.25, name: '!!blob3' });
    for (let k = 0; k < (big ? 4 : 3); k++) {
      const rr = uni(r, 0.07, 0.14);
      const x = k % 2 ? uni(r, SW * 0.55, SW - 0.6) : uni(r, 0.6, SW * 0.4);
      const y = k % 2 ? uni(r, 0.25, 0.5) : uni(r, SH - 0.55, SH - 0.3);
      ctx.box(x, y, rr * 2, rr * 2, { kind: 'ellipse', color: [th.accent, th.accent2, th.accent3][k % 3], alpha: 0.8, name: '!!dot' + k });
    }
  },
  matisse(ctx, th, inv, idx, kind, r, info) {
    if (inv) {
      ctx.box(SW - 4.6 + uni(r, -0.3, 0.3), -1.6, 5.2, 5.2, { kind: 'ellipse', color: th.accent3, name: '!!m1' });
      ctx.box(SW - 3.0, SH - 3.1 + uni(r, -0.2, 0.2), 2.6, 3.8, { color: th.accent, rotation: -12, name: '!!m2' });
      ctx.poly(blobPts(SW - 1.2, SH - 0.2, 0.8, r, 28, 0.3), { color: th.bg, alpha: 0.9, name: '!!m3' });
      info.x1 = SW - 4.9;
    } else {
      ctx.box(SW - 0.75 + uni(r, -0.15, 0.1), -0.9, 1.8, 1.8, { kind: 'ellipse', color: th.accent3, name: '!!m1' });
      ctx.box(SW - 0.55, SH - 1.9 + uni(r, -0.2, 0.2), 0.95, 1.8, { color: th.accent2, rotation: -12, name: '!!m2' });
      ctx.poly(blobPts(-0.15, SH - 0.2, 0.55, r, 28, 0.3), { color: th.accent, alpha: 0.95, name: '!!m3' });
      info.x1 = SW - 1.05;
    }
  },
  leaves(ctx, th, inv, idx, kind, r, info) {
    const cols = [th.accent, th.accent2, inv ? th.inv_accent : mix(th.accent2, th.bg, 0.35)];
    const s = inv ? 1 : 0.62, sway = uni(r, -0.12, 0.12);
    let specs = [[SW + 0.2, -0.3, 2.8, 0.55, 2.35], [SW + 0.1, 0.4, 2.3, 0.45, 2.75], [SW - 0.6, -0.4, 2.0, 0.4, 1.95], [-0.3, SH + 0.3, 2.6, 0.5, -0.75], [-0.2, SH - 0.5, 2.0, 0.42, -0.25]];
    if (inv) specs = specs.slice(0, 3).concat(specs.slice(3).map(([x, y, l, w, a]) => [SW - x, y, l, w, Math.PI - a]));
    specs.forEach(([x, y, l, w, a], k) => ctx.poly(leafPts(x, y, l * s, w * s, a + sway), { color: cols[k % 3], alpha: inv ? 0.9 : 0.75, name: '!!leaf' + k }));
    if (!inv) info.x1 = SW - 1.0;
  },
  comic(ctx, th, inv, idx, kind, r, info) {
    const ink = th.ink;
    if (inv) {
      const cx = kind === 'closing' ? SW / 2 : SW * 0.8, cy = kind === 'closing' ? SH / 2 : SH * 0.45, wedges = [];
      for (let i = 0; i < 36; i += 2) { const a0 = TAU_ * i / 36, a1 = TAU_ * (i + 1) / 36; wedges.push([[cx, cy], [cx + 16 * Math.cos(a0), cy + 16 * Math.sin(a0)], [cx + 16 * Math.cos(a1), cy + 16 * Math.sin(a1)]]); }
      ctx.poly(wedges, { color: th.inv_accent, alpha: 0.16, name: '!!cm-tia' });
      ctx.poly(dotField(0, SH, 3.4, 2.4, 0.24, 0.1, 'bl'), { color: '000000', alpha: 0.25, name: '!!cm-tram' });
      ctx.box(0.16, 0.16, SW - 0.32, SH - 0.32, { lineColor: '111111', lineW: 6, name: '!!cm-khung' });
      Object.assign(info, { x0: 0.95, y0: 0.8, x1: SW - 0.95, y1: SH - 0.85 });
    } else {
      ctx.poly(dotField(SW, 0, 2.6, 1.6, 0.2, 0.08, 'tr'), { color: th.accent3, alpha: 0.9, name: '!!cm-tram' });
      ctx.box(0.16, 0.16, SW - 0.32, SH - 0.32, { lineColor: ink, lineW: 4.5, name: '!!cm-khung' });
      Object.assign(info, { x0: 0.9, y0: 0.72, x1: SW - 0.9, y1: SH - 0.85 });
    }
  },
  manga(ctx, th, inv, idx, kind, r, info) {
    if (inv) {
      const cx = kind === 'closing' ? SW / 2 : SW * 0.36, cy = SH / 2, lines = [];
      for (let i = 0; i < 90; i++) {
        const a = TAU_ * i / 90 + uni(r, -0.02, 0.02), rin = uni(r, 3.6, 5.2), w = uni(r, 0.012, 0.035);
        lines.push([[cx + rin * Math.cos(a), cy + rin * Math.sin(a) * 0.7], [cx + 12 * Math.cos(a - w), cy + 12 * Math.sin(a - w) * 0.7], [cx + 12 * Math.cos(a + w), cy + 12 * Math.sin(a + w) * 0.7]]);
      }
      ctx.poly(lines, { color: 'FFFFFF', alpha: 0.22, name: '!!mg-tocdo' });
      ctx.box(0.22, 0.22, SW - 0.44, SH - 0.44, { lineColor: 'FFFFFF', lineW: 1.5, lineAlpha: 0.6, name: '!!mg-khung' });
      Object.assign(info, { x0: 0.95, y0: 0.8, x1: SW - 0.95, y1: SH - 0.85 });
    } else {
      ctx.poly(dotField(0, SH, SW, 0.9, 0.16, 0.06, 'b'), { color: th.ink, alpha: 0.18, name: '!!mg-tram' });
      ctx.box(0.22, 0.22, SW - 0.44, SH - 0.44, { lineColor: th.ink, lineW: 2.25, name: '!!mg-khung' });
      ctx.box(0.22, 0.22, 0.22, SH - 0.44, { color: th.accent, name: '!!mg-gay' });
      Object.assign(info, { x0: 0.95, y0: 0.72, x1: SW - 0.85, y1: SH - 1.0 });
    }
  },
  sidebar(ctx, th, inv, idx, kind, r, info) {
    if (inv) {
      ctx.poly([[SW * 0.62, 0], [SW, 0], [SW, SH], [SW * 0.48, SH]], { color: th.accent, alpha: 0.25, name: '!!side' });
      ctx.poly([[SW * 0.74, 0], [SW, 0], [SW, SH], [SW * 0.64, SH]], { color: th.inv_accent, alpha: 0.12, name: '!!side2' });
      ctx.box(0.8, 0.7, 1.0, 0.06, { color: th.inv_accent, name: '!!tick' });
      info.x1 = SW * 0.6;
    } else {
      ctx.box(0, 0, 0.28, SH, { gradient: [th.inv[0], th.accent], angle: 90, name: '!!side' });
      ctx.box(0.28, 0, 0.06, SH, { color: th.accent2, name: '!!side2' });
      info.x0 = 1.0;
    }
  },
};

// ============================================================ bố cục (giống bản Python)
const palette = th => [th.accent, th.accent2, th.accent3];
const tint = (c, bg, t = 0.84) => mix(c, bg, t);

function drawTitle(ctx, title, subtitle) {
  const th = ctx.th, width = ctx.x1 - ctx.x0;
  const t = th.caps ? title.toUpperCase() : title;
  const size = fitSize(t, ctx.head, width, 1.6, [36, 34, 32, 30, 28, 26, 24, 22], ctx.hb, 1.12, 2) || 22;
  const h = nLines(t, ctx.head, size, width, ctx.hb) * size * 1.12 / 72 + 0.08;
  let y = ctx.y0, b = null; const mark = th.title_mark;
  if (mark === 'block') { b = ctx.box(ctx.x0, y, 1.1, 0.16, { color: th.accent, name: '!!tmark' }); y += 0.32; }
  else if (mark === 'dot') { b = ctx.box(ctx.x0, y + 0.02, 0.42, 0.05, { color: th.accent, name: '!!tmark' }); y += 0.22; }
  const tb = ctx.text(ctx.x0, y, width, h, t, { font: ctx.head, size, color: ctx.ink, bold: ctx.hb, spacing: 1.12, name: 'Tiêu đề' });
  y += h; const marks = [];
  if (mark === 'bar') { marks.push(ctx.box(ctx.x0, y + 0.1, 0.75, 0.07, { gradient: [th.accent, th.accent2], angle: 0, kind: 'round', radius: 0.5, name: '!!tmark' })); y += 0.17; }
  else if (mark === 'squiggle') { const pts = []; for (let i = 0; i < 29; i++) pts.push([ctx.x0 + i * 0.05, y + 0.14 + 0.05 * Math.sin(i * 0.55)]); marks.push(ctx.poly(pts, { closed: false, lineColor: th.accent3, lineW: 3, name: '!!tmark' })); y += 0.22; }
  else if (mark === 'rule') { marks.push(ctx.box(ctx.x0, y + 0.12, width, 0.012, { color: th.accent2, name: '!!tmark' })); y += 0.15; }
  else if (mark === 'ornament') {
    marks.push(ctx.box(ctx.x0, y + 0.16, 1.0, 0.014, { color: th.accent2, name: '!!tmark' }));
    marks.push(ctx.box(ctx.x0 + 1.08, y + 0.11, 0.11, 0.11, { kind: 'diamond', color: th.accent, name: '!!tmark2' }));
    marks.push(ctx.box(ctx.x0 + 1.27, y + 0.16, 1.0, 0.014, { color: th.accent2, name: '!!tmark3' })); y += 0.24;
  } else if (mark === 'dots') { [th.accent, th.accent2, th.accent3].forEach((c, k) => marks.push(ctx.box(ctx.x0 + k * 0.2, y + 0.1, 0.11, 0.11, { kind: 'ellipse', color: c, name: '!!tdot' + k }))); y += 0.2; }
  ctx.step([tb, ...marks, b], 'fade');
  if (subtitle) {
    const ss = fitSize(subtitle, ctx.font, width, 0.8, [20, 18, 17, 16], false, 1.2, 2) || 16;
    const sh = heightIn(subtitle, ctx.font, ss, width) + 0.05;
    ctx.step(ctx.text(ctx.x0, y + 0.08, width, sh, subtitle, { font: ctx.font, size: ss, color: ctx.accent, bold: true }), 'fade');
    y += sh + 0.08;
  }
  return y + 0.32;
}
function footer(ctx, page, source) {
  const y = ctx.info.foot_y || SH - 0.5, col = ctx.info.foot;
  if (source) ctx.text(ctx.x0, y, SW - ctx.x0 - 1.6, 0.3, source, { font: ctx.font, size: 11, color: col, italic: true, anchor: 'm' });
  if (page) ctx.text(SW - 1.4, y, 0.6, 0.3, String(page), { font: ctx.head, size: 12, color: col, bold: true, align: 'r', anchor: 'm', name: 'Số trang' });
}

function normalize(items) {
  items = items.filter(i => i.text.trim() || i.label);
  const plain = items.filter(i => (i.kind === 'bullet' || i.kind === 'para') && !i.label);
  if (plain.length && (plain.filter(i => STAT_RE.test(i.text)).length >= Math.max(2, plain.length)
    || plain.filter(i => STEP_RE.test(i.text)).length >= Math.max(3, plain.length - 1))) return items;
  const hits = plain.map(i => i.text.match(LABEL_RE));
  if (plain.length >= 2 && hits.filter(m => m && words(m[1]).length <= 6).length >= Math.max(2, 0.6 * plain.length)) {
    return items.map(i => {
      const m = plain.includes(i) ? i.text.match(LABEL_RE) : null;
      return m && words(m[1]).length <= 6 ? Item(m[2].trim(), 'card', 0, m[1].trim()) : i;
    });
  }
  return items;
}
function classify(s, items) {
  if (s.table) return 'table';
  const texts = items.filter(i => ['bullet', 'para', 'quote', 'head'].includes(i.kind));
  const cards = items.filter(i => i.kind === 'card'), chips = items.filter(i => i.kind === 'chip');
  if (s.images.length && !texts.length && !cards.length && !chips.length) return 'images';
  if (s.images.length) return 'split';
  if (cards.length) return 'cards';
  if (chips.length && !texts.length) return 'chips';
  if (!texts.length) return 'empty';
  if (texts.some(i => i.kind === 'head')) return 'list';
  if (texts.length === 1 && texts[0].text.length <= 260 && (texts[0].kind === 'para' || texts[0].kind === 'quote')) return 'statement';
  if (texts.length >= 2 && texts.length <= 4 && texts.every(i => STAT_RE.test(i.text) && i.text.length < 140)) return 'stats';
  if (texts.length >= 3 && texts.length <= 6 && texts.filter(i => STEP_RE.test(i.text)).length >= texts.length - 1) return 'process';
  if (texts.length >= 3 && texts.length <= 4 && texts.every(i => i.level === 0 && i.text.length >= 25 && i.text.length <= 120) && !texts.some(i => i.kind === 'quote')) return 'cardlist';
  return 'list';
}

function ih(ctx, it, size, colw) {
  if (it.kind === 'head') return nLines(it.text, ctx.head, size + 2, colw, true) * (size + 2) * 1.15 / 72;
  const ind = it.kind === 'bullet' ? 0.34 + 0.38 * it.level : 0;
  const t = it.label ? it.label + ': ' + it.text : it.text;
  return nLines(t, ctx.font, size, colw - ind - 0.05) * size * 1.2 / 72;
}
const colH = (ctx, its, size, colw, gap) => its.reduce((s, it, k) => s + ih(ctx, it, size, colw) + (k ? gap : 0) + (it.kind === 'head' && k ? gap * 0.8 : 0), 0);

function layList(ctx, items, x, y, w, h) {
  const heads = items.map((it, k) => it.kind === 'head' ? k : -1).filter(k => k >= 0);
  let cols = null;
  if (heads.length >= 2 && heads.length <= 3 && heads[0] === 0 && w > 8) { const cuts = [...heads, items.length]; cols = heads.map((_, k) => items.slice(cuts[k], cuts[k + 1])); }
  else if (items.length >= 7 && items.every(i => i.text.length <= 80) && w > 8) { const half = Math.ceil(items.length / 2); cols = [items.slice(0, half), items.slice(half)]; }
  if (cols) {
    const n = cols.length, colw = (w - 0.5 * (n - 1)) / n;
    for (const size of [22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12]) {
      const gap = size * 0.6 / 72;
      if (Math.max(...cols.map(c => colH(ctx, c, size, colw, gap))) <= h) { cols.forEach((c, k) => drawList(ctx, c, x + k * (colw + 0.5), y, colw, size, gap)); return []; }
    }
  }
  const tops = items.length <= 5 ? [26, 24, 22] : [22];
  for (const size of [...tops, 21, 20, 19, 18, 17, 16, 15, 14, 13]) {
    let gap = size * 0.6 / 72; const tot = colH(ctx, items, size, w, gap);
    if (tot <= h) {
      let free = h - tot;
      if (items.length > 1 && free > 0) { const ng = Math.min(gap * 2.2, gap + free / (items.length - 1) * 0.5); free -= (ng - gap) * (items.length - 1); gap = ng; }
      drawList(ctx, items, x, y + Math.max(0, free) * 0.3, w, size, gap); return [];
    }
  }
  const size = 16, gap = 16 * 0.6 / 72; let k = 1;
  while (k < items.length && colH(ctx, items.slice(0, k + 1), size, w, gap) <= h) k++;
  if (k < items.length && items[k - 1].kind === 'head' && k > 1) k--;
  drawList(ctx, items.slice(0, k), x, y, w, size, gap);
  return items.slice(k);
}
function drawList(ctx, items, x, y, colw, size, gap) {
  const th = ctx.th;
  items.forEach((it, k) => {
    const hh = ih(ctx, it, size, colw);
    if (it.kind === 'head') {
      if (k) y += gap * 0.8;
      ctx.step(ctx.text(x, y, colw, hh + 0.04, it.text, { font: ctx.head, size: size + 2, color: ctx.accent, bold: true, spacing: 1.1 }));
      y += hh + gap; return;
    }
    const ind = it.kind === 'bullet' ? 0.34 + 0.38 * it.level : 0;
    const content = it.label ? [[[it.label + ': ', { bold: true, color: ctx.ink }], [it.text, {}]]] : it.text;
    ctx.step(ctx.text(x, y, colw, hh + 0.04, content, { font: ctx.font, size: size - (it.level ? 1 : 0), color: ctx.body, italic: it.kind === 'quote', spacing: 1.2,
      bullet: it.kind === 'bullet' ? (it.level === 0 ? th.bullet : '–') : null, bulletColor: ctx.accent, indent: ind }));
    y += hh + gap;
  });
}
function layLead(ctx, items, x, y, w, maxh) {
  let used = 0;
  for (const it of items.filter(i => i.text)) {
    let hh;
    if (it.kind === 'head') {
      const size = fitSize(it.text, ctx.head, w, maxh - used, [24, 22, 20, 18], true) || 18;
      hh = heightIn(it.text, ctx.head, size, w, true, 1.1);
      ctx.step(ctx.text(x, y + used, w, hh + 0.05, it.text, { font: ctx.head, size, color: ctx.accent, bold: true, spacing: 1.1 }));
    } else {
      const sizes = it.text.length < 110 ? [22, 21, 20, 19, 18, 17, 16] : [20, 19, 18, 17, 16];
      const size = fitSize(it.text, ctx.head, w, maxh - used, sizes, false) || 16;
      hh = heightIn(it.text, ctx.head, size, w, false, 1.18);
      ctx.step(ctx.text(x, y + used, w, hh + 0.05, it.text, { font: ctx.head, size, color: ctx.ink, spacing: 1.18, italic: it.kind === 'quote' }));
    }
    used += hh + 0.18;
  }
  return used;
}
const leadH = (ctx, items, w) => items.reduce((t, it) => t + (it.kind === 'head' ? heightIn(it.text, ctx.head, 22, w, true, 1.1) : heightIn(it.text, ctx.head, it.text.length < 110 ? 21 : 19, w, false, 1.18)) + 0.18, 0);

function layStack(ctx, items, x, y, w, y1) {
  const blocks = [];
  for (const it of items) { const k = it.kind === 'card' ? 'cards' : it.kind === 'chip' ? 'chips' : 'text'; if (blocks.length && blocks[blocks.length - 1][0] === k) blocks[blocks.length - 1][1].push(it); else blocks.push([k, [it]]); }
  const firstCard = blocks.findIndex(b => b[0] === 'cards');
  let need = 0; const plan = [];
  blocks.forEach(([k, its], bi) => {
    let hh;
    if (k === 'chips') hh = 0.97;
    else if (k === 'text') hh = bi < firstCard ? leadH(ctx, its, w) : (its.reduce((s, i) => s + i.text.length, 0) <= 260 ? 1.1 : null);
    else hh = 0;
    plan.push(hh); need += hh || 0;
  });
  const nCards = blocks.filter(b => b[0] === 'cards').length;
  const avail = (y1 - y) - need - 0.3 * Math.max(0, nCards - 1);
  if (avail < 1.5 && blocks.length > firstCard + 1) {
    const keep = blocks.slice(0, firstCard + 1).flatMap(b => b[1]);
    const rest = blocks.slice(firstCard + 1).flatMap(b => b[1]);
    return layStack(ctx, keep, x, y, w, y1).concat(rest);
  }
  const per = Math.max(avail, 1.2) / Math.max(1, nCards);
  let rest = [];
  blocks.forEach(([k, its], bi) => {
    const hh = plan[bi];
    if (k === 'chips') y += layChipsRow(ctx, its.slice(0, 5), x, y, w) + 0.35;
    else if (k === 'text') {
      if (hh === null) rest = rest.concat(its);
      else if (bi < firstCard) y += layLead(ctx, its, x, y, w, hh + 0.4);
      else y += layBanner(ctx, its, x, y + 0.05, w, hh) + 0.3;
    } else { rest = rest.concat(layCards(ctx, its, x, y, w, per)); y += (ctx.info._lastCardsH || per) + 0.3; }
  });
  return rest;
}
function layChipsRow(ctx, chips, x, y, w, big = false) {
  const th = ctx.th, n = chips.length, aw = 0.42;
  let size, widths, total;
  for (size of (big ? [26, 24, 22, 20, 18] : [20, 18, 17, 16, 15, 14])) {
    widths = chips.map(c => textWidthPt(c.text, ctx.head, size, true) / 72 + 0.6);
    total = widths.reduce((a, b) => a + b, 0) + aw * (n - 1);
    if (total <= w) break;
  }
  const hgt = size * 1.9 / 72; let cx = x + (w - total) / 2;
  const pal = palette(th);
  chips.forEach((c, k) => {
    const col = pal[k % 3], fillc = contrast(col, 'FFFFFF') >= 3 ? col : mix(col, th.ink, 0.35);
    const pill = ctx.box(cx, y, widths[k], hgt, { color: fillc, kind: 'round', radius: 0.5, name: 'chip' + k });
    ctx.text(0, 0, 0, 0, c.text, { font: ctx.head, size, color: readable(fillc, 'FFFFFF', th.ink), bold: true, align: 'c', anchor: 'm', shape: pill });
    ctx.step(pill, 'zoom'); cx += widths[k];
    if (k < n - 1) { ctx.step(ctx.box(cx + 0.1, y + hgt / 2 - 0.1, aw - 0.2, 0.2, { kind: 'arrow', color: th.accent3 }), 'fade'); cx += aw; }
  });
  return hgt;
}
function layCards(ctx, cards, x, y, w, h, numbered = false) {
  const th = ctx.th; let n = cards.length, rest = [];
  if (n > 8) { rest = cards.slice(8); cards = cards.slice(0, 8); n = 8; }
  const cols = n <= 4 ? n : ([5, 6, 9].includes(n) ? 3 : 4), rows = Math.ceil(n / cols);
  const gap = 0.3, cw = (w - gap * (cols - 1)) / cols, pad = 0.26, iw = cw - 2 * pad, style = th.card_style;
  let headH = 0, chosen = null;
  const labH = ls => Math.max(...cards.map(c => c.label ? heightIn(c.label, ctx.head, ls, iw, true, 1.1) : 0));
  const txtH = ts => Math.max(...cards.map(c => heightIn(c.text, ctx.font, ts, iw, false, 1.2)));
  for (const ts of [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12]) {
    const ls = Math.min(ts + 3, 28), lh = labH(ls), tH = txtH(ts), numH = numbered ? 0.55 : 0;
    const extra = (style === 'strip-top' || style === 'border-left') ? 0.2 : 0;
    let cardH;
    if (style === 'header' && lh) { headH = lh + 0.36; cardH = headH + pad + tH + pad; }
    else cardH = pad + extra + numH + (lh ? lh + 0.12 : 0) + tH + pad;
    if (rows * cardH + gap * (rows - 1) <= h) { chosen = [ts, ls, lh, tH, cardH, numH]; break; }
  }
  if (!chosen) {
    if (n > 2) { const k = Math.max(2, Math.floor(n / 2)); return layCards(ctx, cards.slice(0, k), x, y, w, h, numbered).concat(cards.slice(k), rest); }
    chosen = [12, 14, labH(14), txtH(12), h, numbered ? 0.55 : 0];
  }
  let [ts, ls, lh, tH, cardH, numH] = chosen;
  if (rows === 1 && cardH < h * 0.6) cardH = Math.min(h * 0.7, cardH + 0.7);
  if (rows * cardH + gap * (rows - 1) < h) y += (h - (rows * cardH + gap * (rows - 1))) * 0.25;
  ctx.info._lastCardsH = rows * cardH + gap * (rows - 1);
  const pal = palette(th);
  cards.forEach((c, k) => {
    const r = Math.floor(k / cols), ci = k % cols, inRow = Math.min(cols, n - r * cols);
    const off = (w - (inRow * cw + gap * (inRow - 1))) / 2;
    const cx = x + off + ci * (cw + gap), cy = y + r * (cardH + gap), col = pal[k % 3];
    const shapes = [];
    let bgc = ctx.inv ? mix(ctx.bg, 'FFFFFF', 0.12) : th.card;
    if (style === 'solid') bgc = ctx.inv ? mix(ctx.bg, 'FFFFFF', 0.12) : tint(col, ctx.bg, 0.8);
    const kind = th.radius > 0.03 ? 'round' : 'rect';
    const rad = Math.min(th.radius * (1.6 / Math.max(Math.min(cw, cardH), 0.8)), 0.3);
    if (style === 'comic') shapes.push(ctx.box(cx + 0.09, cy + 0.09, cw, cardH, { color: ctx.inv ? '000000' : th.ink, alpha: ctx.inv ? 0.45 : null, kind, radius: rad }));
    shapes.push(ctx.box(cx, cy, cw, cardH, { color: style !== 'outline' ? bgc : (ctx.inv ? null : th.card), kind, radius: rad,
      lineColor: ['strip-top', 'border-left', 'header'].includes(style) ? th.card_line : (style === 'outline' ? th.accent2 : (style === 'comic' ? th.ink : null)),
      lineW: style === 'comic' ? 2.5 : (style !== 'outline' ? 1 : 1.25), shadow: ['strip-top', 'header', 'border-left'].includes(style) && !ctx.inv ? th.ink : null, name: 'card' + k }));
    let ty = cy + pad;
    if (style === 'strip-top') { shapes.push(ctx.box(cx + pad, cy + 0.16, 0.55, 0.07, { color: col, kind: 'round', radius: 0.5 })); ty += 0.2; }
    else if (style === 'border-left') { shapes.push(ctx.box(cx, cy, 0.08, cardH, { color: col })); ty += 0.05; }
    const labColor = style !== 'solid' ? ctx.accent : readable(bgc, th.ink);
    if (style === 'header' && c.label) {
      shapes.push(ctx.box(cx, cy, cw, headH, { gradient: [mix(th.inv[0], col, 0.35), col], angle: 0 }));
      shapes.push(ctx.text(cx + pad, cy, iw, headH, c.label, { font: ctx.head, size: ls, color: contrast(col, 'FFFFFF') >= 3 ? 'FFFFFF' : th.ink, bold: true, anchor: 'm', spacing: 1.05 }));
      ty = cy + headH + pad;
    } else {
      if (numbered) { shapes.push(ctx.text(cx + pad, ty, iw, numH, String(k + 1).padStart(2, '0'), { font: ctx.head, size: 30, color: readable(bgc, col, th.accent, th.ink), bold: true })); ty += numH; }
      if (c.label) { shapes.push(ctx.text(cx + pad, ty, iw, lh + 0.05, c.label, { font: ctx.head, size: ls, color: contrast(bgc, labColor) >= 3 ? labColor : th.ink, bold: true, spacing: 1.08 })); ty += lh + 0.12; }
    }
    const bodyCol = readable(bgc, ctx.inv ? ctx.body : th.body, th.ink, ctx.body);
    shapes.push(ctx.text(cx + pad, ty, iw, tH + 0.1, c.text, { font: ctx.font, size: ts, color: bodyCol, spacing: 1.2 }));
    ctx.step(shapes);
  });
  return rest;
}
function layBanner(ctx, items, x, y, w, maxh) {
  const th = ctx.th, txt = items.map(i => i.text).join(' ');
  const size = fitSize(txt, ctx.head, w - 0.7, maxh - 0.3, [22, 20, 19, 18, 17, 16, 15, 14]) || 14;
  const hh = heightIn(txt, ctx.head, size, w - 0.7) + 0.32;
  const bgc = ctx.inv ? mix(ctx.bg, 'FFFFFF', 0.12) : tint(th.accent, ctx.bg, 0.86);
  const b = ctx.box(x, y, w, hh, { color: bgc, kind: 'round', radius: th.radius > 0.03 ? 0.25 : 0 });
  const bar = ctx.box(x, y, 0.08, hh, { color: th.accent });
  const t = ctx.text(x + 0.35, y, w - 0.6, hh, txt, { font: ctx.head, size, color: readable(bgc, th.ink, ctx.ink), anchor: 'm', spacing: 1.2 });
  ctx.step([b, bar, t], 'fade');
  return hh;
}
function layStats(ctx, items, x, y, w, h) {
  const th = ctx.th, n = items.length, gap = 0.4, cw = (w - gap * (n - 1)) / n, pal = palette(th);
  y += Math.max(0, (h - 3.2) * 0.35); h = Math.min(h, 3.4);
  items.forEach((it, k) => {
    const m = it.text.match(STAT_RE); const num = (m[1] || m[3]).trim(), d = (m[2] || m[4]).trim();
    const ns = fitSize(num, ctx.head, cw, 1.4, [72, 64, 56, 48, 40, 34], true, 1.2, 1) || 34;
    const ds = fitSize(d, ctx.font, cw, h - 1.8, [20, 18, 17, 16, 15, 14]) || 14;
    const cx = x + k * (cw + gap), col = pal[k % 3], numc = readable(ctx.bg, col, th.accent, ctx.ink);
    const a = ctx.text(cx, y + 0.2, cw, ns * 1.2 / 72, num, { font: ctx.head, size: ns, color: numc, bold: true });
    const ln = ctx.box(cx, y + 0.3 + ns * 1.2 / 72, 0.6, 0.06, { color: col });
    const b = ctx.text(cx, y + 0.5 + ns * 1.2 / 72, cw, h - 1.2, d, { font: ctx.font, size: ds, color: ctx.body, spacing: 1.15 });
    ctx.step([a, ln, b], 'zoom');
  });
}
function layProcess(ctx, items, x, y, w, h) {
  const th = ctx.th, n = items.length, cw = w / n, r = 0.36;
  y += Math.max(0, (h - 3.4) * 0.3); h = Math.min(h, 3.6);
  const cy = y + 0.25;
  ctx.step(ctx.box(x + cw / 2, cy + r - 0.02, w - cw, 0.05, { color: ctx.inv ? ctx.muted : th.card_line }), 'wipe');
  const pal = palette(th), texts = items.map(i => i.text.replace(STEP_RE, '')), labels = items.map(i => i.label), iw = cw - 0.3;
  let ts = 18;
  for (const s of [19, 18, 17, 16, 15, 14, 13, 12]) {
    if (Math.max(...texts.map((t, k) => heightIn(t, ctx.font, s, iw) + (labels[k] ? heightIn(labels[k], ctx.head, s + 2, iw, true) + 0.1 : 0))) <= h - 1.2) { ts = s; break; }
  }
  texts.forEach((t, k) => {
    const cx = x + k * cw + cw / 2, col = pal[k % 3], fillc = contrast(col, 'FFFFFF') >= 3 ? col : mix(col, th.ink, 0.4);
    const circ = ctx.box(cx - r, cy, 2 * r, 2 * r, { kind: 'ellipse', color: fillc, name: 'step' + k });
    ctx.text(0, 0, 0, 0, String(k + 1), { font: ctx.head, size: 22, color: 'FFFFFF', bold: true, align: 'c', anchor: 'm', shape: circ });
    let ty = cy + 2 * r + 0.25; const shapes = [circ];
    if (labels[k]) { const lh = heightIn(labels[k], ctx.head, ts + 2, iw, true) + 0.05; shapes.push(ctx.text(cx - iw / 2, ty, iw, lh, labels[k], { font: ctx.head, size: ts + 2, color: ctx.ink, bold: true, align: 'c' })); ty += lh + 0.08; }
    shapes.push(ctx.text(cx - iw / 2, ty, iw, h - (ty - y), t, { font: ctx.font, size: ts, color: ctx.body, align: 'c', spacing: 1.2 }));
    ctx.step(shapes, 'float');
  });
}
function layStatement(ctx, item, x, y, w, h) {
  const th = ctx.th, quote = item.kind === 'quote' || '“"«'.includes(item.text[0]);
  const txt = item.text.trim().replace(/^[“”"«»]+|[“”"«»]+$/g, ''), tw = w * 0.9;
  const size = fitSize(txt, ctx.head, tw, h - 0.4, [40, 36, 34, 32, 30, 28, 26, 24, 22, 20], ctx.hb) || 20;
  const th_ = heightIn(txt, ctx.head, size, tw, ctx.hb, 1.2), ty = y + Math.max(0, (h - th_) / 2 - 0.2);
  const shapes = [];
  if (quote) shapes.push(ctx.text(x - 0.1, ty - 1.0, 1.2, 1.3, '“', { font: 'Palatino Linotype', size: 110, color: ctx.inv ? ctx.accent : th.accent3, bold: true }));
  else shapes.push(ctx.box(x, ty - 0.35, 0.9, 0.08, { color: th.accent }));
  shapes.push(ctx.text(x, ty, tw, th_ + 0.2, quote ? '“' + txt + '”' : txt, { font: ctx.head, size, color: ctx.ink, bold: ctx.hb && !quote, italic: quote, spacing: 1.2 }));
  ctx.step(shapes, 'fade');
}
function layImages(ctx, imgs, x, y, w, h) {
  const th = ctx.th, n = imgs.length, rad = th.radius > 0.03 ? 0.06 : 0;
  if (n === 1) {
    const img = imgs[0];
    if (img.diagram) {
      let bw = w; const bh = h; if (bw / bh > img.ratio) bw = bh * img.ratio;
      const bx = x + (w - bw) / 2;
      const panel = ctx.box(bx - 0.15, y - 0.1, bw + 0.3, bh + 0.2, { color: 'FFFFFF', kind: 'round', radius: 0.04, lineColor: th.card_line });
      ctx.step([panel, ctx.picture(img, bx, y, bw, bh, 'contain')], 'fade');
    } else ctx.step(ctx.picture(img, x, y, w, h, 'cover', rad), 'fade');
    return;
  }
  let boxes;
  if (n === 2) boxes = [[x, y, (w - 0.3) / 2, h], [x + (w + 0.3) / 2, y, (w - 0.3) / 2, h]];
  else if (n === 3) boxes = [[x, y, w * 0.58, h], [x + w * 0.58 + 0.3, y, w * 0.42 - 0.3, (h - 0.3) / 2], [x + w * 0.58 + 0.3, y + (h + 0.3) / 2, w * 0.42 - 0.3, (h - 0.3) / 2]];
  else { const gw = (w - 0.3) / 2, gh = (h - 0.3) / 2; boxes = [[x, y, gw, gh], [x + gw + 0.3, y, gw, gh], [x, y + gh + 0.3, gw, gh], [x + gw + 0.3, y + gh + 0.3, gw, gh]]; }
  imgs.forEach((img, k) => {
    const [bx, by, bw, bh] = boxes[k];
    if (img.diagram) ctx.step([ctx.box(bx, by, bw, bh, { color: 'FFFFFF', kind: 'round', radius: 0.04, lineColor: th.card_line }), ctx.picture(img, bx + 0.1, by + 0.1, bw - 0.2, bh - 0.2, 'contain')], 'zoom');
    else ctx.step(ctx.picture(img, bx, by, bw, bh, 'cover', rad), 'zoom');
  });
}
function layTable(ctx, rows, x, y, w, h) {
  const th = ctx.th, ncol = Math.max(...rows.map(r => r.length));
  rows = rows.map(r => r.concat(Array(ncol - r.length).fill('')));
  const lens = [...Array(ncol).keys()].map(c => Math.max(...rows.map(r => Math.min(r[c].length, 60))) + 4);
  const tot = lens.reduce((a, b) => a + b, 0), widths = lens.map(l => w * l / tot);
  let size, rh;
  for (size of [24, 22, 20, 18, 17, 16, 15, 14, 13, 12, 11]) {
    rh = rows.map((r, i) => Math.max(...r.map((c, j) => heightIn(c, ctx.font, size, widths[j] - 0.2, i === 0))) + size / 72 * 0.9);
    if (rh.reduce((a, b) => a + b, 0) <= h * (rows.length <= 8 ? 0.8 : 1)) break;
  }
  const sum = () => rh.reduce((a, b) => a + b, 0);
  if (sum() < h * 0.6) { const extra = (h * 0.6 - sum()) / rh.length; rh = rh.map(v => v + Math.min(extra, 0.25)); }
  let rest = [];
  if (sum() > h) { let acc = 0, k = 0; while (k < rows.length && acc + rh[k] <= h) { acc += rh[k]; k++; } k = Math.max(k, 2); rest = [rows[0], ...rows.slice(k)]; rows = rows.slice(0, k); rh = rh.slice(0, k); }
  const headBg = ctx.inv ? th.inv_accent : th.accent;
  const el = ctx.add({ t: 'table', x, y, w, cols: widths, name: 'Bảng', rows: rows.map((r, i) => ({ h: rh[i], cells: r.map(c => {
    const bgc = i === 0 ? headBg : (i % 2 ? th.card : tint(th.accent, th.card, 0.92));
    return { text: c, fill: bgc, font: i === 0 ? ctx.head : ctx.font, size, bold: i === 0, color: i === 0 ? readable(bgc, 'FFFFFF', th.ink) : th.body };
  }) })) });
  ctx.step(el, 'fade');
  return rest;
}

// ---------- trang đặc biệt
function cover(out, th, deck, opts) {
  const ctx = new Ctx(out, th, 0, 'cover', true, opts), x = ctx.x0, w = ctx.x1 - ctx.x0;
  const t = th.caps ? deck.title.toUpperCase() : deck.title, tw = Math.min(w, 10.8);
  const size = fitSize(t, ctx.head, tw, 2.6, [60, 56, 52, 48, 44, 40, 36, 32], ctx.hb, 1.1, 3) || 32;
  const thh = heightIn(t, ctx.head, size, tw, ctx.hb, 1.1);
  const sub = deck.subtitle, sw_ = Math.min(w, 10.5);
  const ss = sub ? (fitSize(sub, ctx.font, sw_, 1.2, [28, 26, 24, 22, 20, 18], false, 1.15, 3) || 18) : 0;
  const sh = sub ? heightIn(sub, ctx.font, ss, sw_, false, 1.15) : 0;
  const meta = deck.meta.filter(m => m.trim()).slice(0, 5), ms = 17;
  const mh = meta.reduce((s, m) => s + heightIn(m, ctx.font, ms, w - 0.4), 0) + 0.1 * meta.length;
  const top = Math.max(ctx.y0 + 0.4, (ctx.y1 - mh - 0.6 - (thh + 0.35 + sh)) / 2 + 0.2);
  const bar = ctx.box(x, top - 0.38, 1.1, 0.09, { color: ctx.accent, kind: 'round', radius: 0.5, name: '!!tmark' });
  const tt = ctx.text(x, top, tw, thh + 0.1, t, { font: ctx.head, size, color: ctx.ink, bold: ctx.hb, spacing: 1.1, name: 'Tiêu đề' });
  ctx.step([bar, tt], 'float');
  if (sub) ctx.step(ctx.text(x, top + thh + 0.3, sw_, sh + 0.1, sub, { font: ctx.font, size: ss, color: ctx.accent, spacing: 1.15 }), 'float');
  if (meta.length) {
    const my = ctx.y1 - mh, shapes = [ctx.box(x, my - 0.12, 0.05, mh + 0.05, { color: th.accent3 })];
    let yy = my;
    meta.forEach((m, k) => {
      const hh = heightIn(m, ctx.font, ms, w - 0.4) + 0.1;
      shapes.push(ctx.text(x + 0.25, yy, w - 0.4, hh, m, { font: k === 0 ? ctx.head : ctx.font, size: ms + (k === 0 ? 3 : 0), color: k === 0 ? ctx.ink : ctx.body, bold: k === 0 }));
      yy += hh + (k === 0 ? 0.05 : 0);
    });
    ctx.step(shapes, 'fade');
  }
  ctx.finish(deck.coverNotes);
}
function section(out, th, s, idx, num, opts) {
  const ctx = new Ctx(out, th, idx, 'section', true, opts), x = ctx.x0, w = Math.min(ctx.x1 - ctx.x0, 10.5);
  const n = ctx.text(x, ctx.y0 + 0.6, 4, 1.6, String(num).padStart(2, '0'), { font: ctx.head, size: 96, color: ctx.accent, bold: true, name: '!!secnum' });
  const t = th.caps ? s.title.toUpperCase() : s.title;
  const size = fitSize(t, ctx.head, w, 2.2, [48, 44, 40, 36, 32, 28], ctx.hb, 1.08, 3) || 28;
  const hh = heightIn(t, ctx.head, size, w, ctx.hb, 1.08);
  const tt = ctx.text(x, ctx.y0 + 2.3, w, hh + 0.1, t, { font: ctx.head, size, color: ctx.ink, bold: ctx.hb, spacing: 1.12, name: 'Tiêu đề' });
  ctx.step([n], 'zoom'); ctx.step([tt], 'float');
  const extra = s.subtitle || s.items.slice(0, 3).map(i => i.text).join(' · ');
  if (extra) { const es = fitSize(extra, ctx.font, w, 1.2, [22, 20, 18, 16]) || 16; ctx.step(ctx.text(x, ctx.y0 + 2.45 + hh, w, 1.3, extra, { font: ctx.font, size: es, color: ctx.body }), 'fade'); }
  ctx.finish(s.notes);
}
function closing(out, th, s, idx, opts) {
  const ctx = new Ctx(out, th, idx, 'closing', true, opts), x = ctx.x0, w = ctx.x1 - ctx.x0;
  const t = th.caps ? s.title.toUpperCase() : s.title;
  const size = fitSize(t, ctx.head, w, 2.0, [60, 54, 48, 44, 40, 36, 32], ctx.hb, 1.1, 2) || 32;
  const hh = heightIn(t, ctx.head, size, w, ctx.hb, 1.1);
  const lines = (s.subtitle ? [s.subtitle] : []).concat(s.items.slice(0, 4).map(i => i.text));
  const lh = lines.reduce((a, l) => a + heightIn(l, ctx.font, 20, w) + 0.1, 0);
  const top = (ctx.y0 + ctx.y1 - hh - 0.4 - lh) / 2;
  const tt = ctx.text(x, top, w, hh + 0.1, t, { font: ctx.head, size, color: ctx.ink, bold: ctx.hb, align: 'c', spacing: 1.1, name: 'Tiêu đề' });
  const bar = ctx.box(x + w / 2 - 0.6, top + hh + 0.15, 1.2, 0.08, { color: ctx.accent, kind: 'round', radius: 0.5, name: '!!tmark' });
  ctx.step([tt, bar], 'zoom');
  let y = top + hh + 0.45;
  for (const l of lines) { const lhh = heightIn(l, ctx.font, 20, w) + 0.1; ctx.step(ctx.text(x, y, w, lhh, l, { font: ctx.font, size: 20, color: ctx.body, align: 'c' }), 'fade'); y += lhh; }
  ctx.finish(s.notes);
}
function content(out, th, s, idx, page, opts) {
  let items = normalize(s.items); const kind = classify(s, items);
  const ctx = new Ctx(out, th, idx, 'content', false, opts);
  let y = s.title ? drawTitle(ctx, s.title, s.subtitle) : ctx.y0 + 0.1;
  const x = ctx.x0, w = ctx.x1 - ctx.x0; let h = ctx.y1 - y, rest = null;
  const cont = o => Slide(Object.assign({ title: s.title, cont: true, source: s.source }, o));
  if (kind === 'table') {
    const texts = items.filter(i => i.kind !== 'chip');
    const left = layTable(ctx, s.table, x, y, w, h - (texts.length ? 0.9 : 0));
    if (texts.length) layBanner(ctx, texts.slice(0, 2), x, ctx.y1 - 0.75, w, 0.75);
    if (left.length > 1) rest = cont({ table: left });
  } else if (kind === 'images') {
    layImages(ctx, s.images.slice(0, 4), x, y, w, h);
    if (s.images.length > 4) rest = cont({ images: s.images.slice(4) });
  } else if (kind === 'split') {
    const iw = w * 0.44, leftSide = idx % 2 === 0, tx = x + (leftSide ? iw + 0.45 : 0), tw = w - iw - 0.45, ix = leftSide ? x : x + w - iw;
    const imgs = s.images.slice(0, 2);
    if (imgs.length === 1) { const im = imgs[0], ihh = im.diagram ? Math.min(h, iw / im.ratio) : h; layImages(ctx, [im], ix, im.diagram ? y + (h - ihh) / 2 : y, iw, ihh); }
    else { const gh = (h - 0.3) / 2; imgs.forEach((im, k) => layImages(ctx, [im], ix, y + k * (gh + 0.3), iw, gh)); }
    const texts = [];
    for (const i of items) {
      if (i.kind === 'card') { texts.push(Item(i.label, 'head')); i.text.split('\n').filter(t => t.trim()).forEach(t => texts.push(Item(t, 'bullet'))); }
      else texts.push(Item(i.text, i.kind === 'chip' ? 'bullet' : i.kind, i.level));
    }
    const left = layList(ctx, texts, tx, y, tw, h);
    if (left.length || s.images.length > 2) rest = cont({ items: left, images: s.images.slice(2) });
  } else if (kind === 'cards') {
    const left = layStack(ctx, items, x, y, w, ctx.y1); if (left.length) rest = cont({ items: left });
  } else if (kind === 'chips') {
    const chips = items.filter(i => i.kind === 'chip'); layChipsRow(ctx, chips.slice(0, 5), x, y + h / 2 - 0.5, w, true);
    if (chips.length > 5) rest = cont({ items: chips.slice(5) });
  } else if (kind === 'statement') layStatement(ctx, items.filter(i => ['para', 'quote', 'bullet'].includes(i.kind))[0], x, y, w, h);
  else if (kind === 'stats') layStats(ctx, items, x, y, w, h);
  else if (kind === 'process') layProcess(ctx, items, x, y, w, h);
  else if (kind === 'cardlist') { const left = layCards(ctx, items.map(i => Item(i.text, 'card')), x, y, w, h, true); if (left.length) rest = cont({ items: left }); }
  else if (kind === 'list') {
    let tail = [];
    if (items.some(i => i.kind === 'head')) {
      items = items.slice();
      while (items.length > 2 && items[items.length - 1].kind === 'para' && items[items.length - 2].kind !== 'head') tail.unshift(items.pop());
      if (tail.reduce((a, t) => a + t.text.length, 0) > 260) { items = items.concat(tail); tail = []; }
    }
    if (tail.length) { layBanner(ctx, tail, x, ctx.y1 - 1.0, w, 1.05); h -= 1.25; }
    const left = layList(ctx, items, x, y, w, h); if (left.length) rest = cont({ items: left });
  }
  footer(ctx, page, s.source);
  ctx.finish(s.notes);
  return rest;
}

// ============================================================ dựng cả bộ
const isSection = s => s.hint === 'section' || (!!s.title && !s.items.length && !s.images.length && !s.table);
function splitClosing(deck) {
  if (!deck.slides.length) return;
  const last = deck.slides[deck.slides.length - 1];
  if (CLOSING_RE.test(last.title || '') && last.items.length <= 4 && !last.images.length && !last.table) { last.hint = 'closing'; return; }
  const hits = last.items.filter(i => CLOSING_RE.test(i.text) && i.text.length < 80);
  if (hits.length && !last.title && last.items.length === hits.length) { last.title = hits[0].text; last.items = hits.slice(1); last.hint = 'closing'; return; }
  if (hits.length && last.items.length > hits.length) {
    last.items = last.items.filter(i => !hits.includes(i));
    deck.slides.push(Slide({ title: hits[0].text, hint: 'closing', items: hits.slice(1).map(h => Item(h.text, 'para')) }));
  }
}
function cloneDeck(d) { return Object.assign({}, d, { meta: [...d.meta], slides: d.slides.map(s => Object.assign({}, s, { items: s.items.map(i => Object.assign({}, i)), images: [...s.images], table: s.table ? s.table.map(r => [...r]) : null })) }); }

function build(deckIn, th, opts = {}) {
  const deck = cloneDeck(deckIn); splitClosing(deck);
  const out = [];
  cover(out, th, deck, opts);
  const queue = deck.slides.slice();
  let idx = 1, page = 2, secnum = 0, guard = 0;
  while (queue.length && guard++ < 400) {
    const s = queue.shift();
    if (s.hint === 'closing' || (!queue.length && isSection(s) && CLOSING_RE.test(s.title || ''))) closing(out, th, s, idx, opts);
    else if (isSection(s) && queue.length) section(out, th, s, idx, ++secnum, opts);
    else {
      const rest = content(out, th, s, idx, page, opts);
      if (rest && (rest.items.length || rest.images.length || rest.table)) { if (rest.title && !rest.title.endsWith('(tiếp)')) rest.title += ' (tiếp)'; queue.unshift(rest); }
    }
    idx++; page++;
  }
  return { title: deck.title, fileName: deck.fileName, theme: th, slides: out };
}

G.TuDanTrang = Object.assign(G.TuDanTrang || {}, { THEMES, themeFromCard, readFiles, build, mix, contrast, readable, dotField, SW, SH });
})(window);
