/* Tự dàn trang — ảnh trang trí theo chủ đề (giống dantrang/khoanh.py).
   Dữ liệu: kho-anh/kho-anh.js (TuDanTrang.KHO_ANH, sinh bởi kho-anh/cong-cu/tao-kho.py).
   Ảnh chụp hoặc tranh vector làm nền trang bìa, trang chương, trang kết; lớp phủ màu mẫu giữ chữ dễ đọc. */
(function (G) {
'use strict';
const T = G.TuDanTrang;
const SW = T.SW, SH = T.SH;
// mẫu dựng sẵn -> gói ảnh khi nội dung không gợi ý chủ đề nào
const THEME_GOI = { 'song-bien': 'thien-nhien', 'gradient': 'vu-tru', 'toi-gian': 'giao-duc', 'nen-toi': 'vu-tru', 'thanh-lich': 'di-san',
  'co-dien': 'lich-su', 'de-thuong': 'truong-hoc', 'nghe-thuat': 'van-hoa', 'thien-nhien': 'thien-nhien', 'chuyen-nghiep': 'doi-ngoai',
  'truyen-tranh': 'anime', 'manga': 'anime' };
// lớp phủ trái -> phải: [độ đục ở mép trái, giữa, mép phải]
const PHU = { anh: { cover: [0.9, 0.7, 0.2], section: [0.92, 0.75, 0.15], closing: [0.8, 0.8, 0.8] },
  tranh: { cover: [0.88, 0.6, 0], section: [0.9, 0.65, 0], closing: [0.72, 0.72, 0.72] } };
// file .pptx giữ bố cục gốc: chữ có thể nằm bất kỳ đâu nên phủ đều cả trang
const PHU_GIU = { anh: [0.8, 0.8, 0.8], tranh: [0.62, 0.62, 0.62] };
const cache = {};

const data = () => T.KHO_ANH || null;
const norm = s => ' ' + String(s || '').normalize('NFC').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean).join(' ') + ' ';
const count = (text, kw) => text.split(' ' + kw + ' ').length - 1;

/** Gói ảnh tự đoán: họa tiết đang dùng > từ khóa trong nội dung > mẫu thiết kế > thiên nhiên. */
function goiTuDong(deck, th) {
  const D = data();
  if (th.motif && T.MOTIFS && T.MOTIFS[th.motif]) return T.MOTIFS[th.motif].pack;
  const parts = [[norm((deck.title || '') + ' ' + (deck.subtitle || '')), 3], [norm(deck.slides.map(s => s.title || '').join(' . ')), 2],
    [norm(deck.slides.map(s => s.items.map(i => i.text).join(' . ')).join(' . ')), 1]];
  let best = null, bestScore = 0;
  for (const g of D.goi) {
    let sc = 0;
    for (const kw of g.tu_khoa) for (const [txt, w] of parts) sc += w * count(txt, kw);
    if (sc > bestScore) { best = g.id; bestScore = sc; }
  }
  return best || THEME_GOI[th.id] || THEME_GOI[th.base] || 'thien-nhien';
}

/** Kế hoạch ảnh cho một bộ slide: opts.khoAnh = { loai: 'khong' | 'anh' | 'tranh' | 'tu-chon', goi: 'tu-dong' | mã gói, dau: mã ảnh bìa (tùy chọn),
    anh: danh sách ảnh của người dùng (loai 'tu-chon', đọc bằng docRieng) }.
    giu = khung trang (rộng/cao) khi khoác lên file .pptx giữ bố cục gốc. */
function plan(deck, th, opts, giu) {
  const D = data(), cfg = (opts && opts.khoAnh) || {};
  if (cfg.loai === 'tu-chon') {   // ảnh người dùng gửi: dùng như một gói ảnh chụp, đúng thứ tự đã chọn, không có dòng ghi nguồn
    const mine = (cfg.anh || []).map(img => ({ id: img.id, loai: 'anh', ghi_cong: '', img }));
    return mine.length ? { loai: 'tu-chon', goi: '', items: mine, n: 0, giu: giu || null } : null;
  }
  if (!D || !['anh', 'tranh'].includes(cfg.loai)) return null;
  const goi = cfg.goi && cfg.goi !== 'tu-dong' ? cfg.goi : goiTuDong(deck, th);
  const items = D.muc.filter(m => m.goi === goi && m.loai === cfg.loai);
  const k = items.findIndex(m => m.id === cfg.dau);
  if (k > 0) items.unshift(items.splice(k, 1)[0]);   // ảnh được bấm "Áp dụng" làm ảnh bìa
  return items.length ? { loai: cfg.loai, goi, items, n: 0, giu: giu || null } : null;
}

/** Ảnh cho trang kế tiếp: bìa và trang kết dùng ảnh đầu, các trang chương lần lượt dùng những ảnh còn lại. */
function next(p, kind) {
  if (!p || !['cover', 'section', 'closing'].includes(kind)) return null;
  let it = p.items[0];
  if (kind === 'section' && p.items.length > 1) it = p.items[1 + (p.n++ % (p.items.length - 1))];
  if (it.loai === 'anh' && !it.img && !cache[it.id]) return null;   // ảnh chưa nạp được: dùng trang trí thường
  return p.giu ? Object.assign({}, it, { giu: p.giu }) : it;
}

function color(th, role) {
  if (role[0] === '#') return role.slice(1);
  const base = { a: th.inv_accent, b: th.accent2, c: th.accent3, k: th.inv_ink, z: '000000' }[role[0]];
  return T.mix(th.inv[0], base, +role.slice(1) / 100);
}

/** Vẽ ảnh/tranh nền và lớp phủ; gọi từ paint() thay cho trang trí của mẫu. */
function draw(ctx, th, kind, it) {
  const c0 = th.inv[0], c1 = th.inv[th.inv.length - 1];
  if (it.loai === 'anh') {
    const img = it.img || cache[it.id], el = ctx.picture(img, 0, 0, SW, SH);
    if (it.giu) {   // trang gốc khác 16:9 (vd 4:3): khung ảnh sẽ kéo theo khổ trang, nên cắt ảnh theo khổ thật cho khỏi méo
      const r = img.ratio, c = r > it.giu ? (1 - it.giu / r) / 2 : (1 - r / it.giu) / 2;
      el.crop = r > it.giu ? { l: c, r: c, t: 0, b: 0 } : { l: 0, r: 0, t: c * 0.6, b: c * 1.4 };
    }
  } else {
    for (const s of it.hinh) {
      const rings = s.p.map(r => { const pts = []; for (let i = 0; i < r.length; i += 2) pts.push([r[i], r[i + 1]]); return pts; });
      const col = color(th, s.r), a = s.a < 1 ? s.a : null;
      if (s.w) ctx.poly(rings[0], { closed: false, lineColor: col, lineW: s.w, lineAlpha: a });
      else ctx.poly(rings.length > 1 ? rings : rings[0], { color: col, alpha: a });
    }
  }
  const deu = it.giu || kind === 'closing';
  ctx.box(0, 0, SW, SH, { gradient: deu ? [c0, c0, c0] : [c0, c0, c1], angle: 0, galphas: it.giu ? PHU_GIU[it.loai] : PHU[it.loai][kind], name: '!!phu-anh' });
  if (it.loai === 'anh' && it.ghi_cong) ctx.text(SW - 6.4, SH - 0.36, 6.1, 0.28, it.ghi_cong, { font: th.body_font, size: 8, color: th.inv_body, align: 'r', anchor: 'b', name: '!!nguon-anh' });
}

// ---------- nạp ảnh chụp (anh-b64/<mã>.js) — chỉ khi cần dựng trang có ảnh
const goc = () => G.TU_DAN_TRANG_KHO_ANH || 'Tu-dan-trang/kho-anh/';
const waiting = {};
function nhan(id, b64) {
  const bin = atob(b64), data_ = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) data_[i] = bin.charCodeAt(i);
  cache[id] = { id: 'kho-' + id, data: data_, ext: 'jpg', w: 1600, h: 900, ratio: 1600 / 900, diagram: false, caption: '',
    url: URL.createObjectURL(new Blob([data_], { type: 'image/jpeg' })) };
  if (waiting[id]) { waiting[id].forEach(f => f()); delete waiting[id]; }
}
function load1(id) {
  if (cache[id]) return Promise.resolve();
  return new Promise((ok, fail) => {
    const first = !waiting[id];
    (waiting[id] = waiting[id] || []).push(ok);
    if (!first) return;
    const s = document.createElement('script');
    s.src = goc() + 'anh-b64/' + id + '.js';
    s.onerror = () => { delete waiting[id]; s.remove(); fail(new Error('không tải được ảnh ' + id)); };
    s.onload = () => s.remove();
    document.head.appendChild(s);
  });
}
// ---------- ảnh người dùng gửi
/** Hướng xoay EXIF của ảnh JPEG (1 = đúng chiều; ảnh chụp điện thoại thường khác 1). */
function exifXoay(b) {
  const u16 = (i, le) => le ? b[i] | b[i + 1] << 8 : b[i] << 8 | b[i + 1];
  for (let i = 2; i + 10 < b.length && b[i] === 0xFF;) {
    const m = b[i + 1];
    if (m === 0xDA) break;
    if (m === 0xE1 && String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]) === 'Exif') {
      const t = i + 10, le = b[t] === 0x49;
      const ifd = t + (le ? u16(t + 4, true) + u16(t + 6, true) * 65536 : u16(t + 4, false) * 65536 + u16(t + 6, false));
      for (let k = 0, n = u16(ifd, le); k < n && ifd + 14 + k * 12 <= b.length; k++) {
        const e = ifd + 2 + k * 12;
        if (u16(e, le) === 0x112) { const o = u16(e + 8, le); return o >= 2 && o <= 8 ? o : 1; }
      }
      return 1;
    }
    i += 2 + u16(i + 2, false);
  }
  return 1;
}
let soRieng = 0;
/** Đọc một ảnh người dùng gửi thành ảnh dùng được trong slide (giống khoanh.doc_rieng).
    JPEG, PNG giữ nguyên; ảnh xoay bằng EXIF được xoay thật; định dạng khác đổi sang PNG. Ảnh trình duyệt không đọc được thì báo lỗi. */
async function docRieng(file) {
  let data = new Uint8Array(await file.arrayBuffer());
  const kieu = data[0] === 0xFF && data[1] === 0xD8 ? 'jpg' : data[0] === 0x89 && data[1] === 0x50 ? 'png' : '';
  if (!kieu || (kieu === 'jpg' && exifXoay(data) > 1)) {
    const bmp = await createImageBitmap(new Blob([data], { type: file.type || '' }));   // tự xoay theo EXIF
    const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
    c.getContext('2d').drawImage(bmp, 0, 0);
    const blob = await new Promise(ok => c.toBlob(ok, kieu ? 'image/jpeg' : 'image/png', 0.92));
    data = new Uint8Array(await blob.arrayBuffer());
  }
  const img = await T.makeImg(data, kieu || 'png', null, '');
  if (!img.url || !img.w) throw new Error('không đọc được ảnh ' + file.name);
  img.id = 'anh-rieng-' + (++soRieng); img.ten = file.name;
  return img;
}

/** Mã các ảnh chụp mà bộ slide cần nhưng chưa nạp. */
function need(deck, th, opts) {
  const p = plan(deck, th, opts, null);
  return p && p.loai === 'anh' ? p.items.map(i => i.id).filter(id => !cache[id]) : [];
}

Object.assign(T, { khoAnhPlan: plan, khoAnhNext: next, khoAnhVe: draw, khoAnhGoi: goiTuDong, khoAnhCan: need,
  khoAnhTai: ids => Promise.all(ids.map(load1)), khoAnhNhan: nhan, khoAnhMau: color, khoAnhDocRieng: docRieng });
})(window);
