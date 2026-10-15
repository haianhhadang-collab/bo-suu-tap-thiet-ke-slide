/* Tự dàn trang — họa tiết theo chủ đề (cách mạng, Hồ Chí Minh, trống đồng Đông Sơn, hồi văn, hoa mai Tết).
   Vẽ chồng lên bất kỳ mẫu nào bằng hình vector của PowerPoint (sửa được trong PowerPoint, không dùng ảnh). */
(function (G) {
'use strict';
const T = G.TuDanTrang, SW = T.SW, SH = T.SH, mix = T.mix;
const RED = 'DA251D', GOLD = 'FFD500';            // màu cờ: nền đỏ, sao vàng
const TAU = Math.PI * 2;

// ---------- hình cơ bản (đơn vị inch)
const circle = (cx, cy, r, n = 48) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(TAU * i / n), cy + r * Math.sin(TAU * i / n)]);
function star(cx, cy, R, points = 5, inner = 0.382, rot = -Math.PI / 2) {
  const p = [];
  for (let i = 0; i < points * 2; i++) { const rr = i % 2 ? R * inner : R, a = rot + Math.PI * i / points; p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
  return p;
}
function rays(cx, cy, R, n = 40, phase = 0) {          // các tia nắng xen kẽ, gộp thành một hình
  const out = [];
  for (let i = 0; i < n; i += 2) { const a0 = phase + TAU * i / n, a1 = phase + TAU * (i + 1) / n; out.push([[cx, cy], [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], [cx + R * Math.cos(a1), cy + R * Math.sin(a1)]]); }
  return out;
}
const place = (pts, cx, cy, s, ang) => { const c = Math.cos(ang), d = Math.sin(ang); return pts.map(([x, y]) => [cx + s * (x * c - y * d), cy + s * (x * d + y * c)]); };
const quad = (a, c, b, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });

// cánh sen: gốc ở (0,0), mũi nhọn ở (1,0)
const PETAL = (() => { const p = [], n = 16; for (let i = 0; i <= n; i++) { const t = i / n; p.push([t, 0.32 * Math.pow(Math.sin(Math.PI * t), 0.85) * (1 - 0.3 * t)]); } for (let i = n - 1; i > 0; i--) { const t = i / n; p.push([t, -0.32 * Math.pow(Math.sin(Math.PI * t), 0.85) * (1 - 0.3 * t)]); } return p; })();
function lotus(cx, cy, h) {                            // gốc hoa ở (cx, cy), cao h
  const rings = [];
  [[0, 1], [0.36, 0.93], [0.72, 0.8], [1.08, 0.62]].forEach(([a, l], k) => (k ? [-a, a] : [0]).forEach(s => rings.push(place(PETAL, cx, cy, h * l, -Math.PI / 2 + s))));
  rings.push(quad([cx - h * 0.62, cy - h * 0.05], [cx, cy + h * 0.32], [cx + h * 0.62, cy - h * 0.05]).concat(quad([cx + h * 0.5, cy + h * 0.02], [cx, cy + h * 0.22], [cx - h * 0.5, cy + h * 0.02])));
  return rings;
}

// chim Lạc bay theo hướng +x (dáng giản lược trên mặt trống đồng)
const BIRD = [[1, 0], [0.72, -0.05], [0.68, -0.16], [0.58, -0.26], [0.62, -0.1], [0.5, -0.08], [0.3, -0.1], [0.1, -0.22], [-0.12, -0.3], [0, -0.12],
  [-0.16, -0.1], [0, -0.02], [-0.14, 0.08], [0.08, 0.06], [0.35, 0.08], [0.6, 0.04], [0.7, 0.03]];
function drum(ctx, cx, cy, R, col, a, tag) {
  const rings = [0.2, 0.235, 0.42, 0.455, 0.63, 0.665, 0.87, 0.905, 1].map(k => circle(cx, cy, R * k, 72));
  ctx.poly(rings, { closed: true, lineColor: col, lineW: 1.1, lineAlpha: a, name: '!!' + tag + 'vong' });
  ctx.poly(star(cx, cy, R * 0.17, 14, 0.45), { color: col, alpha: a, name: '!!' + tag + 'sao' });
  const ticks = [];                                    // vạch tia giữa hai vòng trong
  for (let i = 0; i < 48; i++) { const t = TAU * i / 48; ticks.push([[cx + R * 0.24 * Math.cos(t), cy + R * 0.24 * Math.sin(t)], [cx + R * 0.415 * Math.cos(t), cy + R * 0.415 * Math.sin(t)]]); }
  ctx.poly(ticks, { closed: false, lineColor: col, lineW: 0.75, lineAlpha: a * 0.8, name: '!!' + tag + 'tia' });
  const cir = [];                                      // vòng tròn tiếp tuyến có chấm giữa
  for (let i = 0; i < 22; i++) { const t = TAU * i / 22, x = cx + R * 0.543 * Math.cos(t), y = cy + R * 0.543 * Math.sin(t); cir.push(circle(x, y, R * 0.072, 20), circle(x, y, R * 0.018, 10)); }
  ctx.poly(cir, { closed: true, lineColor: col, lineW: 0.8, lineAlpha: a, name: '!!' + tag + 'tron' });
  const birds = [];
  for (let i = 0; i < 10; i++) { const t = TAU * i / 10; birds.push(place(BIRD, cx + R * 0.77 * Math.cos(t), cy + R * 0.77 * Math.sin(t), R * 0.2, t - Math.PI / 2)); }
  ctx.poly(birds, { color: col, alpha: a, name: '!!' + tag + 'chim' });
  const dots = [];
  for (let i = 0; i < 64; i++) { const t = TAU * i / 64; dots.push(circle(cx + R * 0.952 * Math.cos(t), cy + R * 0.952 * Math.sin(t), R * 0.014, 8)); }
  ctx.poly(dots, { color: col, alpha: a, name: '!!' + tag + 'cham' });
}

// dải hồi văn (chữ “hồi” vuông nối tiếp) từ x0 tới x1, cao h
function meander(x0, x1, y, h) {
  const u = h * 1.1, n = Math.max(1, Math.floor((x1 - x0) / u)), sx = x0 + (x1 - x0 - n * u) / 2, paths = [];
  paths.push([[x0, y], [x1, y]], [[x0, y + h], [x1, y + h]]);
  for (let i = 0; i < n; i++) {
    const X = sx + i * u, P = (a, b) => [X + a * u, y + b * h];
    paths.push([P(0.08, 1), P(0.08, 0.2), P(0.86, 0.2), P(0.86, 0.8), P(0.34, 0.8), P(0.34, 0.45), P(0.6, 0.45)]);
  }
  return paths;
}

const MAI = { wood: '4E342E', wood2: '5D4037', petal: 'FFC107', heart: 'E65100' };
const DAO = { wood: '4A3B36', wood2: '5D4A44', petal: 'F48FB1', heart: 'AD1457' };
// cành mai: gốc ở (ox, oy), mọc sang trái-xuống (dir = -1) hoặc phải-xuống (dir = 1), tỉ lệ s
function maiBranch(ctx, ox, oy, s, dir, tag, c = MAI) {
  const P = ([x, y]) => [ox + dir * x * s, oy + y * s];
  const main = quad([0, -0.1], [1.5, 0.25], [3.6, 1.45]).map(P);
  const subs = [quad([1.2, 0.27], [1.45, 0.9], [1.95, 1.35]).map(P), quad([2.45, 0.82], [2.85, 0.5], [2.95, 0.05]).map(P), quad([3.0, 1.15], [3.3, 1.7], [3.2, 2.0]).map(P)];
  ctx.poly(main, { closed: false, lineColor: c.wood, lineW: Math.max(1.5, 5 * s), name: '!!' + tag + 'canh' });
  ctx.poly(subs, { closed: false, lineColor: c.wood2, lineW: Math.max(1, 3 * s), name: '!!' + tag + 'canh2' });
  const flowers = [[0.85, 0.12, 0.24], [1.95, 1.33, 0.22], [2.95, 0.07, 0.2], [3.55, 1.45, 0.22], [2.25, 0.72, 0.17], [3.2, 1.98, 0.16]];
  const petals = [], hearts = [];
  flowers.forEach(([x, y, r], k) => {
    const [cx, cy] = P([x, y]), pr = r * s * 0.5, rot = k * 0.7;
    for (let j = 0; j < 5; j++) { const a = rot + TAU * j / 5; petals.push(circle(cx + pr * 0.95 * Math.cos(a), cy + pr * 0.95 * Math.sin(a), pr, 18)); }
    hearts.push(circle(cx, cy, pr * 0.5, 14));
  });
  [[1.4, 0.36], [0.4, 0.0], [3.1, 1.12], [2.6, 0.55]].forEach(([x, y]) => { const [cx, cy] = P([x, y]); petals.push(circle(cx, cy, 0.07 * s, 12)); });
  ctx.poly(petals, { color: c.petal, name: '!!' + tag + 'hoa' });
  ctx.poly(hearts, { color: c.heart, name: '!!' + tag + 'nhuy' });
}

// ---------- bộ họa tiết
// palette: bảng màu gợi ý (áp khi bật “dùng màu của họa tiết”); ownInv: tự vẽ trang bìa/chương/kết thay cho trang trí của mẫu
const MOTIFS = {
  'cach-mang': { pack: 'lich-su',
    name: 'Cách mạng · Cờ đỏ sao vàng', short: 'Cách mạng',
    desc: 'Nền đỏ, sao vàng năm cánh và tia nắng kiểu tranh cổ động — kỷ niệm, lịch sử Đảng, ngày lễ lớn.',
    sw: ['9E1410', RED, GOLD, 'FFF7E0'], ownInv: true,
    palette: { bg: 'FFF9F0', bg2: 'FBF0E2', ink: '2B1210', body: '4E2A24', muted: '7A5A52', accent: 'C8161D', accent2: 'E0A100', accent3: '9E1410',
      card: 'FFFFFF', card_line: 'F0D6C6', inv: ['8E0E0B', 'C8161D', RED], inv_ink: 'FFF7E0', inv_body: 'FDE6B0', inv_accent: GOLD },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const [cx, cy, R] = kind === 'cover' ? [SW - 3.1, SH / 2 - 0.25, 1.55] : kind === 'section' ? [SW - 2.5, SH / 2, 1.2] : [SW / 2, 0.98, 0.42];
        ctx.poly(rays(cx, cy, 16, 44, idx * 0.05), { color: GOLD, alpha: kind === 'closing' ? 0.07 : 0.11, name: '!!cm-tia' });
        ctx.box(cx - R * 1.9, cy - R * 1.9, R * 3.8, R * 3.8, { kind: 'ellipse', radial: true, gradient: [GOLD, GOLD], galphas: [0.32, 0], name: '!!cm-hao' });
        ctx.poly(star(cx, cy, R), { color: GOLD, name: '!!cm-sao' });
        ctx.box(0, SH - 0.2, SW, 0.07, { color: GOLD, name: '!!cm-dai' });
        ctx.box(0, SH - 0.1, SW, 0.1, { color: '6E0B08', alpha: 0.6, name: '!!cm-dai2' });
        if (kind === 'cover') info.x1 = SW - 5.3; else if (kind === 'section') info.x1 = SW - 4.3; else info.y0 = 1.75;
        info.y1 = Math.min(info.y1, SH - 0.55);
      } else {
        ctx.box(0, 0, SW, 0.15, { color: RED, name: '!!cm-bang' });
        ctx.box(0, 0.15, SW, 0.035, { color: GOLD, name: '!!cm-vien' });
        ctx.poly(star(SW - 0.55, 0.43, 0.16), { color: RED, name: '!!cm-sao' });
        ctx.poly(star(SW - 1.3, SH - 1.15, 1.75, 5, 0.382, -Math.PI / 2 + 0.12), { color: RED, alpha: 0.05, name: '!!cm-saochim' });
      }
    },
  },
  'ho-chi-minh': { pack: 'lich-su',
    name: 'Hồ Chí Minh · Sen vàng', short: 'Sen vàng',
    desc: 'Đỏ son, vàng kim, hoa sen nét mảnh và ngôi sao — học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh.',
    sw: ['5E0B0B', 'A51E1E', 'D9A62E', 'FBF4E4'], ownInv: true,
    palette: { bg: 'FBF6EA', bg2: 'F6EEDC', ink: '3A1D10', body: '5A3A2A', muted: '84685A', accent: 'A51E1E', accent2: 'C9932A', accent3: '7A1F1F',
      card: 'FFFCF5', card_line: 'EAD8B4', inv: ['4E0909', '8C1A1A', 'A82A20'], inv_ink: 'FFF6E0', inv_body: 'F1DCB2', inv_accent: 'F2C14E' },
    draw(ctx, th, inv, idx, kind, info) {
      const gold = 'E8B54A';
      if (inv) {
        if (kind === 'closing') {
          ctx.poly(lotus(SW / 2, SH - 0.45, 1.5), { closed: true, lineColor: gold, lineW: 1.25, lineAlpha: 0.7, name: '!!hcm-sen' });
          ctx.poly(star(SW / 2, SH - 2.25, 0.2), { color: gold, name: '!!hcm-sao' });
          info.y1 = SH - 2.5;
        } else {
          const big = kind === 'cover', cx = SW - (big ? 3.0 : 2.4), base = SH - (big ? 0.75 : 1.0), h = big ? 3.6 : 2.8;
          ctx.box(cx - h * 0.85, base - h * 1.25, h * 1.7, h * 1.7, { kind: 'ellipse', radial: true, gradient: [gold, gold], galphas: [0.22, 0], name: '!!hcm-hao' });
          ctx.poly(lotus(cx, base, h), { closed: true, lineColor: gold, lineW: 1.5, lineAlpha: 0.85, name: '!!hcm-sen' });
          ctx.poly(star(cx, base - h * 1.18, h * 0.12), { color: gold, name: '!!hcm-sao' });
          info.x1 = SW - (big ? 5.6 : 4.6);
        }
        ctx.box(0.45, 0.45, SW - 0.9, SH - 0.9, { lineColor: gold, lineW: 0.75, lineAlpha: 0.45, name: '!!hcm-khung' });
        Object.assign(info, { x0: Math.max(info.x0, 0.95), y0: Math.max(info.y0, 0.8) });
      } else {
        ctx.box(0, 0, SW, 0.08, { color: 'A51E1E', name: '!!hcm-bang' });
        ctx.box(0, 0.08, SW, 0.025, { color: 'D9A62E', name: '!!hcm-vien' });
        ctx.poly(lotus(SW - 1.6, SH - 0.2, 2.3), { color: 'D9A62E', alpha: 0.12, name: '!!hcm-senchim' });
      }
    },
  },
  'dong-son': { pack: 'lich-su',
    name: 'Lịch sử · Trống đồng Đông Sơn', short: 'Trống đồng',
    desc: 'Mặt trống đồng với sao giữa, vòng chim Lạc, hoa văn tròn; tông đồng thau — lịch sử, văn hóa Việt Nam.',
    sw: ['2B1D0E', '6B4A22', 'E0B060', 'F5EEDF'], ownInv: true,
    palette: { bg: 'F5EEDF', bg2: 'EFE5D0', ink: '2E2112', body: '4F3D27', muted: '7A6648', accent: '9A5B13', accent2: 'C08A3E', accent3: '5E7D6B',
      card: 'FBF6EA', card_line: 'DCCBA8', inv: ['24180B', '3F2A13', '6B4A22'], inv_ink: 'F6E7C8', inv_body: 'E3CFA6', inv_accent: 'E0B060' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const col = th.inv_accent;
        if (kind === 'closing') drum(ctx, SW / 2, SH / 2, 4.4, col, 0.16, 'ds-');
        else {
          const R = kind === 'cover' ? 4.7 : 4.1;
          drum(ctx, SW - 1.25, SH / 2, R, col, 0.55, 'ds-');
          info.x1 = SW - 1.25 - R - 0.4;
        }
      } else {
        drum(ctx, SW + 0.2, SH + 0.25, 2.9, th.accent, 0.11, 'ds-');
        ctx.box(0.8, 0.3, SW - 1.6, 0.012, { color: th.accent2, alpha: 0.7, name: '!!ds-ke' });
      }
    },
  },
  'hoi-van': { pack: 'van-hoa',
    name: 'Truyền thống · Viền hồi văn', short: 'Hồi văn',
    desc: 'Dải hoa văn chữ “hồi” vuông ở mép trang và góc khung — giữ màu của mẫu, hợp văn hóa, truyền thống, lễ kỷ niệm.',
    sw: ['3D0C0C', '9B2226', 'CA8A04', 'FBF3E4'], ownInv: false, palette: null,
    draw(ctx, th, inv, idx, kind, info) {
      const col = inv ? th.inv_accent : th.accent;
      ctx.poly(meander(0.5, SW - 0.5, 0.16, 0.24), { closed: false, lineColor: col, lineW: 1.5, lineAlpha: inv ? 0.75 : 0.6, name: '!!hv-tren' });
      if (inv) {
        ctx.poly(meander(0.5, SW - 0.5, SH - 0.4, 0.24), { closed: false, lineColor: col, lineW: 1.5, lineAlpha: 0.75, name: '!!hv-duoi' });
        info.y0 = Math.max(info.y0, 0.8); info.y1 = Math.min(info.y1, SH - 0.75);
      } else info.y0 = Math.max(info.y0, 0.66);
    },
  },
  'tet': { pack: 'le-hoi',
    name: 'Mùa xuân · Hoa mai ngày Tết', short: 'Hoa mai',
    desc: 'Cành mai vàng trên nền đỏ son và kem ấm — chúc Tết, mừng Xuân, ngoại khóa, văn hóa truyền thống.',
    sw: ['8B0000', 'C62828', 'FFC107', 'FFF8EE'], ownInv: true,
    palette: { bg: 'FFF8EE', bg2: 'FFF1E0', ink: '3B1E12', body: '5B3A2B', muted: '8A6A5A', accent: 'C62828', accent2: 'E09A00', accent3: '2E7D32',
      card: 'FFFFFF', card_line: 'F3D9C2', inv: ['7A0A0A', 'B71C1C', 'C62828'], inv_ink: 'FFF8E1', inv_body: 'FFE0A3', inv_accent: 'FFD54F' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        if (kind === 'closing') { maiBranch(ctx, SW + 0.05, 0.1, 0.95, -1, 'mai1-'); maiBranch(ctx, -0.05, SH - 2.35, 0.75, 1, 'mai2-'); }
        else { const big = kind === 'cover'; maiBranch(ctx, SW + 0.05, 0.05, big ? 1.25 : 1.05, -1, 'mai1-'); info.x1 = Math.min(info.x1, SW - (big ? 4.8 : 1.4)); }
        ctx.box(0, SH - 0.14, SW, 0.06, { color: 'FFD54F', alpha: 0.85, name: '!!mai-dai' });
      } else {
        maiBranch(ctx, SW + 0.05, 0.02, 0.42, -1, 'mai-');
        ctx.box(0, SH - 0.06, SW, 0.06, { color: 'C62828', alpha: 0.85, name: '!!mai-dai' });
      }
    },
  },
};
// ============================================================ các gói họa tiết mở rộng
const PACKS = [
  { id: 'lich-su', name: 'Lịch sử · Cách mạng', desc: 'Cờ đỏ sao vàng, Bác Hồ, Đảng, chiến thắng, trống đồng' },
  { id: 'van-hoa', name: 'Văn hóa · Hoa văn truyền thống', desc: 'Hồi văn, mây cuộn, thổ cẩm, gạch bông, sóng nước, lũy tre, núi sông' },
  { id: 'le-hoi', name: 'Lễ hội · Mùa xuân', desc: 'Hoa mai, hoa đào, đèn lồng, Trung thu, pháo hoa' },
  { id: 'thien-nhien', name: 'Thiên nhiên · Môi trường', desc: 'Đầm sen, ruộng bậc thang, lá nhiệt đới, Trái Đất xanh' },
  { id: 'giao-duc', name: 'Giáo dục · Khoa học', desc: 'Sách bút, nguyên tử, mạch điện tử, hình học' },
];

// ---------- hình phụ
const D = d => d * Math.PI / 180;
const ell = (cx, cy, rx, ry, rot = 0, n = 48) => Array.from({ length: n }, (_, i) => { const t = TAU * i / n, x = rx * Math.cos(t), y = ry * Math.sin(t); return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
const arc = (cx, cy, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; });
function rotRect(cx, cy, len, wid, ang) { const c = Math.cos(ang), d = Math.sin(ang), l = len / 2, w = wid / 2; return [[-l, -w], [l, -w], [l, w], [-l, w]].map(([x, y]) => [cx + x * c - y * d, cy + x * d + y * c]); }
const U = (cx, cy, s) => ([x, y]) => [cx + x * s, cy + y * s];
const mapR = (rings, f) => rings.map(r => r.map(f));
function spiral(cx, cy, r, turns, dir = 1, a0 = 0, n = 40) { return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, a = a0 + dir * TAU * turns * t, rr = r * (1 - 0.8 * t); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; }); }
function seeded(seed) { let a = seed >>> 0; return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const NARROW = PETAL.map(([x, y]) => [x, y * 0.45]);       // lá hẹp (tre)
const LEAFLET = PETAL.map(([x, y]) => [x, y * 0.28]);      // lá chét dừa

/** Họa tiết dạng “biểu tượng”: to ở bên phải trang bìa/chương, chìm giữa trang kết, chìm ở góc trang nội dung.
    emblem(ctx, cx, cy, s, màu, độ đậm, màu phụ, th, tag) vẽ gọn trong hình vuông tâm (cx, cy), nửa cạnh s. */
function emblemDraw(emblem, o = {}) {
  return function (ctx, th, inv, idx, kind, info) {
    if (inv) {
      const col = th.inv_accent, c2 = th.inv_ink;
      if (kind === 'closing') emblem(ctx, SW / 2, SH / 2, 3.0, col, o.wm || 0.13, c2, th, 'em-');
      else {
        const big = kind === 'cover', cx = SW - (big ? 3.0 : 2.5), s = big ? 2.5 : 1.95;
        if (o.halo !== false) ctx.box(cx - s * 1.3, SH / 2 - s * 1.3, s * 2.6, s * 2.6, { kind: 'ellipse', radial: true, gradient: [col, col], galphas: [0.2, 0], name: '!!em-hao' });
        emblem(ctx, cx, SH / 2, s, col, o.alpha || 0.92, c2, th, 'em-');
        info.x1 = Math.min(info.x1, cx - s - 0.45);
      }
      if (o.inv) o.inv(ctx, th, kind, info);
    } else {
      emblem(ctx, SW - 1.45, SH - 1.4, 1.2, th.accent, o.ca || 0.11, th.accent2, th, 'em-');
      if (o.page) o.page(ctx, th, info);
    }
  };
}

// ---------- vẽ từng biểu tượng / mảng
function hammerSickle(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s);
  const blade = arc(0, 0, 0.78, D(-80), D(-235), 30).concat(arc(0.1, -0.08, 0.66, D(-235), D(-80), 30));
  const rings = [blade, rotRect(-0.54, 0.73, 0.5, 0.17, D(135)), rotRect(0.21, 0.37, 1.18, 0.13, D(45)), rotRect(-0.27, -0.11, 0.64, 0.24, D(-45))];
  ctx.poly(mapR(rings, P), { color: col, alpha: a, name: '!!' + tag + 'bualiem' });
}
function riceWreath(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), grains = [], stems = [];
  [[D(100), D(250)], [D(80), D(-70)]].forEach(([a0, a1]) => {
    stems.push(arc(0, 0.05, 0.85, a0, a1, 30));
    const sg = Math.sign(a1 - a0);
    for (let i = 2; i <= 10; i++) {
      const t = a0 + (a1 - a0) * i / 11, x = 0.85 * Math.cos(t), y = 0.05 + 0.85 * Math.sin(t);
      const dir = Math.atan2(Math.cos(t) * sg, -Math.sin(t) * sg);
      grains.push(place(PETAL, x, y, 0.26, dir + 0.55), place(PETAL, x, y, 0.24, dir - 0.5));
    }
    const t = a1, x = 0.85 * Math.cos(t), y = 0.05 + 0.85 * Math.sin(t);
    grains.push(place(PETAL, x, y, 0.28, Math.atan2(Math.cos(t) * sg, -Math.sin(t) * sg)));
  });
  ctx.poly(mapR(stems, P), { closed: false, lineColor: col, lineW: Math.max(1, 2.2 * s), lineAlpha: a, name: '!!' + tag + 'cong' });
  ctx.poly(mapR(grains, P), { color: col, alpha: a, name: '!!' + tag + 'hat' });
  ctx.poly(star(...P([0, -0.02]), 0.42 * s), { color: col, alpha: a, name: '!!' + tag + 'sao' });
}
function wavingFlag(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), top = [], bot = [], yT = x => -0.88 + 0.09 * Math.sin(2.7 * (x + 0.72));
  for (let i = 0; i <= 24; i++) { const x = -0.72 + 1.67 * i / 24; top.push([x, yT(x)]); bot.unshift([x, yT(x) + 1.05 + 0.04 * Math.sin(2.7 * x)]); }
  ctx.poly(rotRect(-0.75, 0.03, 1.98, 0.06, D(90)).map(P), { color: col, alpha: a, name: '!!' + tag + 'can' });
  ctx.poly(top.concat(bot).map(P), { color: RED, alpha: a, name: '!!' + tag + 'co' });
  ctx.poly(star(...P([0.11, yT(0.11) + 0.54]), 0.3 * s), { color: GOLD, alpha: a, name: '!!' + tag + 'sao' });
}
function hills(ctx, color, alpha, top, tag) {
  const pts = [[-0.1, SH + 0.1]];
  for (let i = 0; i <= 40; i++) { const x = -0.1 + (SW + 0.2) * i / 40; pts.push([x, top + 0.28 * Math.sin(x * 0.9 + 0.6) + 0.16 * Math.sin(x * 2.1)]); }
  pts.push([SW + 0.1, SH + 0.1]);
  ctx.poly(pts, { color, alpha, name: '!!' + tag });
}
function cloud(cx, cy, s, flip = 1) {
  const P = ([x, y]) => [cx + flip * x * s, cy + y * s];
  return [arc(-0.4, 0.05, 0.3, Math.PI * 0.95, Math.PI * 2, 18), arc(0.05, -0.1, 0.4, Math.PI * 1.05, Math.PI * 1.95, 18), arc(0.48, 0.05, 0.28, Math.PI, Math.PI * 2.05, 18),
    quad([-0.75, 0.12], [0, 0.32], [0.78, 0.1]), spiral(-0.7, 0.18, 0.16, 1.4, -1, 0), spiral(0.78, 0.16, 0.14, 1.4, 1, Math.PI)].map(r => r.map(P));
}
function brocade(ctx, y, h, tag) {
  const n = Math.ceil(SW / h) + 1, dia = [], inner = [], zig = [[], []];
  for (let i = 0; i < n; i++) {
    const x = i * h + h / 2 - 0.1, c = y + h / 2;
    dia.push([[x, c - h * 0.34], [x + h * 0.34, c], [x, c + h * 0.34], [x - h * 0.34, c]]);
    inner.push([[x, c - h * 0.13], [x + h * 0.13, c], [x, c + h * 0.13], [x - h * 0.13, c]]);
  }
  for (let i = 0; i <= n * 4; i++) { const x = i * h / 4 - 0.1; zig[0].push([x, y + h * (i % 2 ? 0.05 : 0.14)]); zig[1].push([x, y + h * (i % 2 ? 0.95 : 0.86)]); }
  ctx.box(-0.05, y, SW + 0.1, h, { color: 'B3202A', name: '!!' + tag + 'nen' });
  ctx.poly(dia, { color: 'F2B705', name: '!!' + tag + 'thoi' });
  ctx.poly(inner, { color: '1F1A3D', name: '!!' + tag + 'thoi2' });
  ctx.poly(zig, { closed: false, lineColor: 'FFFFFF', lineW: 1.25, name: '!!' + tag + 'rang' });
}
function tiles(ctx, x0, y0, cols, rows, size, col, a, tag) {
  const lines = [], fills = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = x0 + i * size, y = y0 + j * size, c = [x + size / 2, y + size / 2];
    lines.push([[x, y], [x + size, y], [x + size, y + size], [x, y + size]], circle(c[0], c[1], size * 0.3, 32));
    [[x, y, 0], [x + size, y, 1], [x + size, y + size, 2], [x, y + size, 3]].forEach(([qx, qy, k]) => lines.push(arc(qx, qy, size * 0.2, D(k * 90), D(k * 90 + 90), 8).concat([[qx, qy]])));
    for (let k = 0; k < 4; k++) fills.push(place(PETAL, c[0], c[1], size * 0.5, D(45 + k * 90)));
    fills.push([[c[0], c[1] - size * 0.08], [c[0] + size * 0.08, c[1]], [c[0], c[1] + size * 0.08], [c[0] - size * 0.08, c[1]]]);
  }
  ctx.poly(fills, { color: col, alpha: a * 0.55, name: '!!' + tag + 'canh' });
  ctx.poly(lines, { closed: true, lineColor: col, lineW: 0.9, lineAlpha: a, name: '!!' + tag + 'net' });
}
function scales(ctx, x0, x1, y0, rows, r, col, a, tag) {
  for (let j = 0; j < rows; j++) {
    const fills = [], arcs = [], cy = y0 + j * r * 0.55 + r;
    for (let x = x0 - (j % 2 ? r : 0); x < x1 + r; x += 2 * r) {
      fills.push(arc(x, cy, r, Math.PI, TAU, 20));
      [0.72, 0.46, 0.2].forEach(k => arcs.push(arc(x, cy, r * k, Math.PI, TAU, 14)));
    }
    ctx.poly(fills, { color: col, alpha: a * 0.22, lineColor: col, lineW: 1, lineAlpha: a, name: '!!' + tag + 'vay' + j });
    ctx.poly(arcs, { closed: false, lineColor: col, lineW: 0.75, lineAlpha: a * 0.85, name: '!!' + tag + 'vong' + j });
  }
}
function bamboo(ctx, x, yb, h, w, lean, col, a, tag, seed) {
  const r = seeded(seed), segs = [], nodes = [], leaves = [], n = Math.max(3, Math.round(h / (w * 6)));
  for (let k = 0; k < n; k++) {
    const y1 = yb - h * k / n, y2 = yb - h * (k + 1) / n + 0.03, xc = x + lean * (yb - (y1 + y2) / 2);
    segs.push(rotRect(xc, (y1 + y2) / 2, y1 - y2, w, D(90) + Math.atan(lean)));
    nodes.push([[xc - w * 0.62, y2 - 0.015], [xc + w * 0.62, y2 - 0.015]]);
    if (k > 0 && r() < 0.65) {
      const side = r() < 0.5 ? -1 : 1;
      for (let m = 0; m < 3; m++) leaves.push(place(NARROW, xc, y2, w * (5.5 + 2 * r()), side < 0 ? D(150 + m * 18 + r() * 10) : D(30 - m * 18 - r() * 10)));
    }
  }
  ctx.poly(segs, { color: col, alpha: a, name: '!!' + tag + 'than' });
  ctx.poly(nodes, { closed: false, lineColor: col, lineW: 2, lineAlpha: Math.min(1, a + 0.2), name: '!!' + tag + 'dot' });
  ctx.poly(leaves, { color: col, alpha: a * 0.9, name: '!!' + tag + 'la' });
}
function mountains(ctx, col, alphas, tops, seed, tag) {
  const r = seeded(seed);
  tops.forEach((top, k) => {
    const ph = [r() * 6, r() * 6, r() * 6], pts = [[-0.1, SH + 0.1]];
    for (let i = 0; i <= 70; i++) {
      const x = -0.1 + (SW + 0.2) * i / 70;
      pts.push([x, top + 0.55 * (1 - Math.abs(Math.sin(0.55 * x + ph[0]))) * -1 + 0.25 * Math.sin(1.3 * x + ph[1]) + 0.1 * Math.sin(3.1 * x + ph[2])]);
    }
    pts.push([SW + 0.1, SH + 0.1]);
    ctx.poly(pts, { color: col, alpha: alphas[k], name: '!!' + tag + k });
  });
}
function lantern(ctx, cx, ytop, len, h, color, tag, glow) {
  const w = h * 0.78, cy = ytop + len + h / 2;
  ctx.poly([[cx, ytop], [cx, ytop + len]], { closed: false, lineColor: '3E2723', lineW: 1, name: '!!' + tag + 'day' });
  if (glow) ctx.box(cx - w * 1.4, cy - h * 1.2, w * 2.8, h * 2.4, { kind: 'ellipse', radial: true, gradient: [color, color], galphas: [0.35, 0], name: '!!' + tag + 'sang' });
  ctx.box(cx - w / 2, cy - h / 2, w, h, { kind: 'ellipse', color, name: '!!' + tag + 'than' });
  ctx.poly([ell(cx, cy, w * 0.18, h / 2, 0, 32), ell(cx, cy, w * 0.36, h / 2, 0, 32)], { closed: true, lineColor: '7F1D1D', lineW: 0.8, lineAlpha: 0.45, name: '!!' + tag + 'gong' });
  ctx.box(cx - w * 0.28, cy - h / 2 - h * 0.06, w * 0.56, h * 0.12, { color: '4E2A0C', name: '!!' + tag + 'nap' });
  ctx.box(cx - w * 0.28, cy + h / 2 - h * 0.06, w * 0.56, h * 0.12, { color: '4E2A0C', name: '!!' + tag + 'day2' });
  ctx.poly([-0.12, -0.04, 0, 0.04, 0.12].map(d => [[cx + d * w, cy + h / 2 + h * 0.06], [cx + d * w * 1.3, cy + h / 2 + h * 0.42]]), { closed: false, lineColor: 'F2C14E', lineW: 1, name: '!!' + tag + 'tua' });
}
function starLantern(ctx, cx, cy, r, ang, tag) {
  const s = star(cx, cy, r, 5, 0.42, -Math.PI / 2 + ang);
  ctx.poly([[cx + r * 0.3, cy - r * 0.2], [cx + r * 2.0, cy - r * 1.9]], { closed: false, lineColor: '8D6E63', lineW: 2.5, name: '!!' + tag + 'can' });
  ctx.poly(s, { color: 'E63946', alpha: 0.95, lineColor: 'FFD166', lineW: 2.5, name: '!!' + tag + 'sao' });
  ctx.poly(star(cx, cy, r * 0.42, 5, 0.42, -Math.PI / 2 + ang), { color: 'FFD166', name: '!!' + tag + 'sao2' });
  const tip = s[5];
  ctx.poly([-0.1, 0, 0.1].map(d => [[tip[0], tip[1]], [tip[0] + d * r, tip[1] + r * 0.7]]), { closed: false, lineColor: 'FFD166', lineW: 1.2, name: '!!' + tag + 'tua' });
}
function burst(ctx, cx, cy, r, color, tag, n = 18) {
  const rays = [], dots = [];
  for (let i = 0; i < n; i++) {
    const t = TAU * i / n + 0.1, k = i % 2 ? 0.78 : 1;
    rays.push([[cx + r * 0.28 * Math.cos(t), cy + r * 0.28 * Math.sin(t)], [cx + r * k * 0.88 * Math.cos(t), cy + r * k * 0.88 * Math.sin(t)]]);
    dots.push(circle(cx + r * k * Math.cos(t), cy + r * k * Math.sin(t), Math.max(0.025, r * 0.045), 10));
  }
  ctx.poly(rays, { closed: false, lineColor: color, lineW: Math.max(1, r * 2.2), name: '!!' + tag + 'tia' });
  ctx.poly(dots, { color, name: '!!' + tag + 'cham' });
}
function lotusPond(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), leaf = [], veins = [];
  [[0.42, 0.55, 0.62, D(-60)], [-0.6, 0.72, 0.42, D(-120)]].forEach(([x, y, r, notch]) => {
    leaf.push(arc(x, y, r, notch + 0.22, notch + TAU - 0.22, 40).concat([[x, y]]));
    for (let k = 1; k < 9; k++) { const t = notch + 0.22 + (TAU - 0.44) * k / 9; veins.push([[x, y], [x + r * 0.92 * Math.cos(t), y + r * 0.92 * Math.sin(t)]]); }
  });
  ctx.poly(mapR(leaf, P), { color: '2E7D32', alpha: a * 0.9, name: '!!' + tag + 'la' });
  ctx.poly(mapR(veins, P), { closed: false, lineColor: 'A5D6A7', lineW: 0.8, lineAlpha: a, name: '!!' + tag + 'gan' });
  ctx.poly([[0, 0.3], [0.05, 0.95]].map(P), { closed: false, lineColor: '558B2F', lineW: Math.max(1, 3 * s), lineAlpha: a, name: '!!' + tag + 'cuong' });
  const fl = lotus(0, 0.32, 0.95);
  ctx.poly(mapR(fl.slice(0, -1), P), { color: 'F48FB1', alpha: a, lineColor: 'C2185B', lineW: 0.9, lineAlpha: a, name: '!!' + tag + 'hoa' });
  ctx.poly(mapR([fl[fl.length - 1]], P), { color: '7CB342', alpha: a, name: '!!' + tag + 'dai' });
  ctx.poly(mapR([place(PETAL, -0.62, 0.15, 0.5, D(-100))], P), { color: 'F8BBD0', alpha: a, lineColor: 'C2185B', lineW: 0.8, lineAlpha: a, name: '!!' + tag + 'bup' });
}
function terraces(ctx, cx, cy, r0, r1, n, alpha, tag) {
  const cols = ['8BC34A', 'CDDC39', '689F38', 'AED581', 'F9A825', '7CB342'];
  for (let k = 0; k < n; k++) {
    const ra = r0 + (r1 - r0) * k / n, rb = r0 + (r1 - r0) * (k + 1) / n, wob = t => 0.06 * Math.sin(5 * t + k);
    const outer = Array.from({ length: 33 }, (_, i) => { const t = Math.PI + Math.PI / 2 * i / 32; return [cx + (rb + wob(t)) * Math.cos(t), cy + (rb + wob(t)) * Math.sin(t)]; });
    const inner = Array.from({ length: 33 }, (_, i) => { const t = Math.PI * 1.5 - Math.PI / 2 * i / 32; return [cx + (ra + wob(t)) * Math.cos(t), cy + (ra + wob(t)) * Math.sin(t)]; });
    ctx.poly(outer.concat(inner), { color: cols[k % cols.length], alpha, lineColor: 'FFFFFF', lineW: 0.75, lineAlpha: alpha * 0.6, name: '!!' + tag + k });
  }
}
function frond(ctx, x, y, len, ang, bend, col, a, tag) {
  const c = Math.cos(ang), d = Math.sin(ang), tip = [x + len * c, y + len * d], ctrl = [x + len * 0.5 * c - bend * len * d, y + len * 0.5 * d + bend * len * c];
  const rib = quad([x, y], ctrl, tip, 24), leaflets = [];
  for (let i = 3; i < rib.length - 1; i++) {
    const t = i / 24, [px, py] = rib[i], [qx, qy] = rib[i + 1], dir = Math.atan2(qy - py, qx - px), L = len * (0.5 * (1 - 0.7 * t) + 0.06);
    leaflets.push(place(LEAFLET, px, py, L, dir + 0.62 + 0.15 * t), place(LEAFLET, px, py, L, dir - 0.62 - 0.15 * t));
  }
  ctx.poly(leaflets, { color: col, alpha: a, name: '!!' + tag + 'la' });
  ctx.poly(rib, { closed: false, lineColor: col, lineW: 1.8, lineAlpha: Math.min(1, a + 0.15), name: '!!' + tag + 'gan' });
}
function globe(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s);
  ctx.poly(circle(0, 0.1, 0.78, 60).map(P), { color: col, alpha: a * 0.25, lineColor: col, lineW: 1.6, lineAlpha: a, name: '!!' + tag + 'cau' });
  const lines = [ell(0, 0.1, 0.32, 0.78, 0, 48), ell(0, 0.1, 0.6, 0.78, 0, 48)];
  [-0.38, 0, 0.38].forEach(y => { const w = Math.sqrt(0.78 * 0.78 - y * y); lines.push([[-w, 0.1 + y], [w, 0.1 + y]]); });
  lines.push([[0, -0.68], [0, 0.88]]);
  ctx.poly(mapR(lines, P), { closed: false, lineColor: col, lineW: 1, lineAlpha: a * 0.8, name: '!!' + tag + 'kinh' });
  ctx.poly([[0, -0.68], [0.02, -0.9]].map(P), { closed: false, lineColor: col, lineW: Math.max(1, 2 * s), lineAlpha: a, name: '!!' + tag + 'mam' });
  ctx.poly(mapR([place(PETAL, 0.02, -0.88, 0.42, D(-35)), place(PETAL, 0.02, -0.86, 0.34, D(-150))], P), { color: col, alpha: a, name: '!!' + tag + 'la' });
}
function bookPen(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), pages = [], lines = [];
  [-1, 1].forEach(k => {
    pages.push(quad([0, -0.45], [k * 0.45, -0.62], [k * 0.95, -0.5]).concat(quad([k * 0.95, 0.45], [k * 0.45, 0.35], [0, 0.6])));
    for (let i = 1; i <= 5; i++) { const dy = i * 0.15; lines.push(quad([k * 0.12, -0.45 + dy + 0.04], [k * 0.47, -0.6 + dy], [k * 0.83, -0.5 + dy])); }
  });
  ctx.poly(mapR(pages, P), { color: col, alpha: a * 0.2, lineColor: col, lineW: 1.6, lineAlpha: a, name: '!!' + tag + 'sach' });
  ctx.poly(mapR(lines.concat([[[0, -0.45], [0, 0.6]]]), P), { closed: false, lineColor: col, lineW: 0.9, lineAlpha: a * 0.7, name: '!!' + tag + 'dong' });
  const ang = D(-52), body = rotRect(0.62, -0.18, 1.1, 0.16, ang), c = Math.cos(ang), d = Math.sin(ang);
  const tipB = [0.62 - 0.55 * c, -0.18 - 0.55 * d], tip = [tipB[0] - 0.2 * c, tipB[1] - 0.2 * d];
  ctx.poly(mapR([body, [[tipB[0] - 0.08 * d, tipB[1] + 0.08 * c], [tipB[0] + 0.08 * d, tipB[1] - 0.08 * c], tip]], P), { color: c2, alpha: a, name: '!!' + tag + 'but' });
}
function atom(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), orbits = [0, 60, 120].map(k => ell(0, 0, 0.95, 0.34, D(k), 60));
  ctx.poly(mapR(orbits, P), { closed: true, lineColor: col, lineW: 1.6, lineAlpha: a, name: '!!' + tag + 'quydao' });
  const e = [0, 60, 120].map((k, i) => { const t = D(40 + i * 110), x = 0.95 * Math.cos(t), y = 0.34 * Math.sin(t), r = D(k); return circle(x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r), 0.07, 16); });
  ctx.poly(mapR(e, P), { color: c2, alpha: a, name: '!!' + tag + 'e' });
  ctx.poly(circle(0, 0, 0.16, 24).map(P), { color: col, alpha: a, name: '!!' + tag + 'nhan' });
}
function circuit(ctx, x0, y0, x1, y1, n, col, a, seed, tag) {
  const r = seeded(seed), paths = [], nodes = [];
  for (let k = 0; k < n; k++) {
    let x = x1 + 0.1, y = y0 + (y1 - y0) * (k + 0.5) / n; const p = [[x, y]];
    for (let seg = 0; seg < 3 && x > x0; seg++) {
      x -= 0.4 + r() * 1.1; p.push([x, y]);
      if (seg < 2) { const dy = (r() < 0.5 ? -1 : 1) * (0.15 + r() * 0.3); x -= Math.abs(dy); y += dy; p.push([x, y]); }
    }
    paths.push(p); nodes.push(circle(x, y, 0.07, 14), circle(x, y, 0.03, 8));
  }
  ctx.poly(paths, { closed: false, lineColor: col, lineW: 1.5, lineAlpha: a, name: '!!' + tag + 'mach' });
  ctx.poly(nodes, { closed: true, lineColor: col, lineW: 1.2, lineAlpha: a, name: '!!' + tag + 'nut' });
}
function geoSet(ctx, items, cols, a, tag) {        // items: [loại, x, y, cỡ, xoay, màu]
  items.forEach(([t, x, y, sz, rot, ci], k) => {
    const col = cols[ci % cols.length], o = { closed: true, lineColor: col, lineW: 2, lineAlpha: a, name: '!!' + tag + k };
    if (t === 'tri') ctx.poly([0, 1, 2].map(i => [x + sz * Math.cos(rot + TAU * i / 3 - Math.PI / 2), y + sz * Math.sin(rot + TAU * i / 3 - Math.PI / 2)]), o);
    else if (t === 'sq') ctx.poly(rotRect(x, y, sz * 1.4, sz * 1.4, rot), o);
    else if (t === 'ci') ctx.poly(circle(x, y, sz, 40), o);
    else if (t === 'dot') { const d = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) d.push(circle(x + i * sz, y + j * sz, sz * 0.12, 8)); ctx.poly(d, { color: col, alpha: a, name: '!!' + tag + k }); }
    else if (t === 'zig') { const p = []; for (let i = 0; i <= 6; i++) p.push([x + i * sz * 0.3, y + (i % 2 ? -sz * 0.2 : sz * 0.2)]); ctx.poly(p, Object.assign(o, { closed: false })); }
    else if (t === 'fill') ctx.poly(circle(x, y, sz, 32), { color: col, alpha: a * 0.85, name: '!!' + tag + k });
  });
}

Object.assign(MOTIFS, {
  // ----- Lịch sử · Cách mạng
  'bua-liem': { pack: 'lich-su', name: 'Đảng · Búa liềm', short: 'Búa liềm',
    desc: 'Búa liềm vàng trên nền đỏ cờ Đảng — sinh hoạt chi bộ, lịch sử Đảng, nghị quyết, kỷ niệm ngày thành lập Đảng.',
    sw: ['8E0E0B', 'C8161D', GOLD, 'FFF7E0'], ownInv: true,
    palette: { bg: 'FFF9F0', bg2: 'FBF0E2', ink: '2B1210', body: '4E2A24', muted: '7A5A52', accent: 'C8161D', accent2: 'E0A100', accent3: '9E1410',
      card: 'FFFFFF', card_line: 'F0D6C6', inv: ['7A0C09', 'B3141A', 'D0201E'], inv_ink: 'FFF7E0', inv_body: 'FDE6B0', inv_accent: GOLD },
    draw: emblemDraw(hammerSickle, { inv: (ctx, th, kind) => ctx.box(0, SH - 0.14, SW, 0.06, { color: GOLD, name: '!!bl-dai' }),
      page: ctx => { ctx.box(0, 0, SW, 0.12, { color: 'C8161D', name: '!!bl-bang' }); ctx.box(0, 0.12, SW, 0.03, { color: GOLD, name: '!!bl-vien' }); } }) },
  'vong-lua': { pack: 'lich-su', name: 'Vòng lúa · Ngôi sao', short: 'Vòng lúa',
    desc: 'Hai bông lúa vàng ôm ngôi sao giữa nền đỏ — nông nghiệp, nông thôn mới, thi đua, khen thưởng, ngày lễ lớn.',
    sw: ['7A0C09', 'B71C1C', 'F5C518', 'FFF8E7'], ownInv: true,
    palette: { bg: 'FFFAF0', bg2: 'FBF2DF', ink: '2E1A0E', body: '503526', muted: '7D6352', accent: 'B71C1C', accent2: 'D4A20B', accent3: '6D8B3A',
      card: 'FFFFFF', card_line: 'EFD9BE', inv: ['6B0A08', 'A3161A', 'C62828'], inv_ink: 'FFF8E1', inv_body: 'FBE3AE', inv_accent: 'F5C518' },
    draw: emblemDraw(riceWreath) },
  'co-bay': { pack: 'lich-su', name: 'Chiến thắng · Cờ bay', short: 'Cờ bay',
    desc: 'Lá cờ đỏ sao vàng tung bay trên đồi, tông xanh bộ đội — chiến thắng lịch sử, quân đội, ngày 22/12, 30/4.',
    sw: ['1E3318', '3B5E2B', RED, 'F7F3E3'], ownInv: true,
    palette: { bg: 'F7F4E8', bg2: 'F0ECDA', ink: '1E2A16', body: '3D4A33', muted: '6A7560', accent: 'B3261E', accent2: '5B7F3A', accent3: 'C9A227',
      card: 'FFFFFF', card_line: 'DDD8C0', inv: ['16260F', '2C4720', '3E5F2C'], inv_ink: 'FFF8E1', inv_body: 'DCE6C8', inv_accent: 'F1D27A' },
    draw: emblemDraw(wavingFlag, { halo: false, inv: (ctx, th, kind, info) => { if (kind !== 'closing') { hills(ctx, '0E1A09', 0.55, SH - 0.75, 'cb-doi'); info.y1 = Math.min(info.y1, SH - 1.0); } } }) },

  // ----- Văn hóa · Hoa văn truyền thống
  'may-cuon': { pack: 'van-hoa', name: 'Mây cuộn · Mây lành', short: 'Mây cuộn',
    desc: 'Những dải mây cuộn nét mảnh ở góc trang, giữ màu của mẫu — văn hóa, mỹ thuật cổ, đình chùa, lễ hội truyền thống.',
    sw: ['2B2118', '6B4A2E', 'D8B26E', 'F7F0E1'], ownInv: false, palette: null,
    draw(ctx, th, inv, idx, kind, info) {
      const col = inv ? th.inv_accent : th.accent, a = inv ? 0.7 : 0.45;
      const cl = inv ? cloud(SW - 1.9, 1.05, 1.75, -1).concat(cloud(SW - 4.1, SH - 0.95, 1.3), kind === 'closing' ? cloud(1.8, 1.1, 1.2) : []) : cloud(SW - 1.0, 0.4, 0.55, -1);
      ctx.poly(cl, { closed: false, lineColor: col, lineW: inv ? 2.2 : 1.4, lineAlpha: a, name: '!!mc-may' });
      if (inv && kind !== 'closing') info.x1 = Math.min(info.x1, SW - 3.0);
    } },
  'tho-cam': { pack: 'van-hoa', name: 'Thổ cẩm · Dân tộc', short: 'Thổ cẩm',
    desc: 'Dải thổ cẩm đỏ, vàng, chàm hoa văn hình thoi và răng cưa — văn hóa các dân tộc, du lịch, vùng cao.',
    sw: ['1E1B3A', 'B3202A', 'F2B705', 'FAF4EA'], ownInv: true,
    palette: { bg: 'FAF5EC', bg2: 'F4ECDD', ink: '1E1B3A', body: '3E3A5A', muted: '6D6985', accent: 'B3202A', accent2: '2F4B8A', accent3: 'E0A100',
      card: 'FFFFFF', card_line: 'E6DCCB', inv: ['17142E', '2A2450'], inv_ink: 'FFF6E5', inv_body: 'E3DCF0', inv_accent: 'F2B705' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) { brocade(ctx, 0, 0.5, 'tc-tren-'); brocade(ctx, SH - 0.5, 0.5, 'tc-duoi-'); info.y0 = Math.max(info.y0, 0.95); info.y1 = Math.min(info.y1, SH - 0.85); }
      else brocade(ctx, 0, 0.3, 'tc-');
    } },
  'gach-bong': { pack: 'van-hoa', name: 'Gạch bông · Hoài cổ', short: 'Gạch bông',
    desc: 'Mảng gạch bông hoa bốn cánh kiểu nhà phố xưa, giữ màu của mẫu — hoài niệm, kiến trúc, văn hóa đô thị.',
    sw: ['1F3B4D', '3C6E71', 'E0A458', 'F6F1E7'], ownInv: true, palette: null,
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        if (kind === 'closing') { tiles(ctx, 0, 0, 1, 6, 1.25, th.inv_accent, 0.5, 'gb-t-'); tiles(ctx, SW - 1.25, 0, 1, 6, 1.25, th.inv_accent, 0.5, 'gb-p-'); info.x0 = Math.max(info.x0, 1.7); info.x1 = Math.min(info.x1, SW - 1.7); }
        else { tiles(ctx, SW - 3.75, 0, 3, 6, 1.25, th.inv_accent, 0.5, 'gb-'); info.x1 = Math.min(info.x1, SW - 4.2); }
      } else tiles(ctx, SW - 1.0, 0, 2, 1, 0.5, th.accent, 0.55, 'gb-');
    } },
  'song-nuoc': { pack: 'van-hoa', name: 'Sóng nước · Vảy cá', short: 'Sóng nước',
    desc: 'Lớp sóng hình vảy cá xếp chồng ở chân trang, giữ màu của mẫu — sông nước, biển đảo, văn hóa vùng ven biển.',
    sw: ['0B3C5D', '1D6996', '9AD1D4', 'F2F7F8'], ownInv: true, palette: null,
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) { scales(ctx, -0.2, SW, SH - 1.75, 4, 0.42, th.inv_accent, 0.55, 'sn-'); info.y1 = Math.min(info.y1, SH - 1.85); }
      else scales(ctx, -0.2, SW, SH - 0.5, 2, 0.2, th.accent, 0.35, 'sn-');
    } },
  'luy-tre': { pack: 'van-hoa', name: 'Lũy tre làng', short: 'Lũy tre',
    desc: 'Khóm tre xanh mọc bên mép trang — làng quê Việt Nam, văn học, đức tính con người Việt Nam.',
    sw: ['16301F', '2E5D3E', 'A8C686', 'F5F7EC'], ownInv: true,
    palette: { bg: 'F6F8EE', bg2: 'EEF2E1', ink: '1C2B1E', body: '3C4D3E', muted: '687A69', accent: '2E6B3F', accent2: '8DB46A', accent3: 'C49A45',
      card: 'FFFFFF', card_line: 'D7E2CA', inv: ['132A1B', '23452F', '2F5A3C'], inv_ink: 'F4F8EC', inv_body: 'D3E2C6', inv_accent: 'A8C686' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const col = th.inv_accent, xs = kind === 'closing' ? [[0.5, 0.06], [1.1, 0.02], [SW - 0.5, -0.06], [SW - 1.1, -0.03]] : [[SW - 0.5, -0.05], [SW - 1.15, -0.02], [SW - 1.8, 0.03]];
        xs.forEach(([x, lean], k) => bamboo(ctx, x, SH + 0.1, SH + 0.4, 0.17 - k * 0.012, lean, col, 0.8 - k * 0.1, 'lt' + k + '-', 7 + k));
        if (kind === 'closing') { info.x0 = Math.max(info.x0, 2.0); info.x1 = Math.min(info.x1, SW - 2.0); } else info.x1 = Math.min(info.x1, SW - 2.6);
      } else {
        bamboo(ctx, SW - 0.35, SH + 0.1, SH + 0.3, 0.1, -0.03, th.accent2, 0.5, 'lt0-', 3);
        bamboo(ctx, SW - 0.75, SH + 0.1, SH - 1.2, 0.08, 0.02, th.accent2, 0.35, 'lt1-', 5);
        info.x1 = Math.min(info.x1, SW - 1.15);
      }
    } },
  'non-nuoc': { pack: 'van-hoa', name: 'Non nước · Thủy mặc', short: 'Non nước',
    desc: 'Lớp núi mờ kiểu tranh thủy mặc và vầng mặt trời đỏ như con dấu — địa lý, văn chương, quê hương, du lịch.',
    sw: ['1F2A30', '34454D', 'C9D6DF', 'F4F1EA'], ownInv: true,
    palette: { bg: 'F4F1EA', bg2: 'ECE8DE', ink: '1F2A30', body: '3D4A50', muted: '6B767A', accent: 'A33B2B', accent2: '5C7480', accent3: '9AA9B0',
      card: 'FFFDF8', card_line: 'DCD7CB', inv: ['1A2328', '2C3A41', '3A4B53'], inv_ink: 'F4F1EA', inv_body: 'D4DBDE', inv_accent: 'C9D6DF' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        mountains(ctx, th.inv_accent, [0.14, 0.24, 0.4], [SH - 2.6, SH - 1.9, SH - 1.15], 11, 'nn-nui');
        if (kind !== 'closing') { ctx.box(SW - 1.9, 0.6, 0.85, 0.85, { kind: 'ellipse', color: 'C0392B', alpha: 0.9, name: '!!nn-troi' }); info.x1 = Math.min(info.x1, SW - 2.4); }
        info.y1 = Math.min(info.y1, SH - 2.1);
      } else mountains(ctx, th.ink, [0.05, 0.08], [SH - 1.15, SH - 0.65], 11, 'nn-nui');
    } },

  // ----- Lễ hội · Mùa xuân
  'hoa-dao': { pack: 'le-hoi', name: 'Hoa đào · Xuân miền Bắc', short: 'Hoa đào',
    desc: 'Cành đào hồng thắm trên nền mận chín — Tết miền Bắc, mừng Xuân, ngày 8/3, chủ đề phụ nữ.',
    sw: ['5E1530', 'A8325E', 'F48FB1', 'FFF5F7'], ownInv: true,
    palette: { bg: 'FFF6F8', bg2: 'FCEDF1', ink: '3A1424', body: '5C3343', muted: '8A6170', accent: 'C2185B', accent2: 'E57399', accent3: '6A994E',
      card: 'FFFFFF', card_line: 'F3D3DE', inv: ['5A1230', '8E2550', 'A8325E'], inv_ink: 'FFF3F6', inv_body: 'F8D5E1', inv_accent: 'F8BBD0' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        if (kind === 'closing') { maiBranch(ctx, SW + 0.05, 0.1, 0.95, -1, 'dao1-', DAO); maiBranch(ctx, -0.05, SH - 2.35, 0.75, 1, 'dao2-', DAO); }
        else { const big = kind === 'cover'; maiBranch(ctx, SW + 0.05, 0.05, big ? 1.25 : 1.05, -1, 'dao1-', DAO); info.x1 = Math.min(info.x1, SW - (big ? 4.8 : 1.4)); }
      } else maiBranch(ctx, SW + 0.05, 0.02, 0.42, -1, 'dao-', DAO);
    } },
  'den-long': { pack: 'le-hoi', name: 'Đèn lồng · Phố Hội', short: 'Đèn lồng',
    desc: 'Chùm đèn lồng đỏ, cam, vàng tỏa sáng trên nền đêm — lễ hội, phố cổ Hội An, Tết, văn hóa đêm rằm.',
    sw: ['1C1030', '3A1F4D', 'F18F01', 'FFF6E8'], ownInv: true,
    palette: { bg: 'FFF8EE', bg2: 'FCEFDD', ink: '2A1230', body: '4D3550', muted: '7B667C', accent: 'C0392B', accent2: 'F18F01', accent3: '6C3483',
      card: 'FFFFFF', card_line: 'F0DCC6', inv: ['160C27', '2D1842', '40205A'], inv_ink: 'FFF6E8', inv_body: 'EED9C8', inv_accent: 'F6C445' },
    draw(ctx, th, inv, idx, kind, info) {
      const cols = ['D7263D', 'F18F01', 'F6C445', 'C73E1D', 'E85D04'];
      if (inv) {
        const set = kind === 'closing' ? [[0.9, 0.2, 1.0], [1.9, 0.9, 0.8], [SW - 0.9, 0.3, 1.0], [SW - 1.9, 1.0, 0.8]] : [[SW - 0.85, 0.2, 1.3], [SW - 2.0, 1.1, 1.05], [SW - 3.1, 0.35, 1.2], [SW - 4.15, 1.4, 0.9]];
        set.forEach(([x, len, h], k) => lantern(ctx, x, 0, len, h, cols[k % cols.length], 'dl' + k + '-', true));
        if (kind === 'closing') info.y0 = Math.max(info.y0, 2.2); else info.x1 = Math.min(info.x1, SW - 4.8);
      } else {
        lantern(ctx, SW - 0.55, 0, 0.04, 0.4, cols[0], 'dl0-', false); lantern(ctx, SW - 1.05, 0, 0.12, 0.34, cols[1], 'dl1-', false);
        info.x1 = Math.min(info.x1, SW - 1.4);
      }
    } },
  'trung-thu': { pack: 'le-hoi', name: 'Trung thu · Trăng rằm', short: 'Trung thu',
    desc: 'Vầng trăng tròn, đèn ông sao và mây bay trên nền đêm xanh — Tết Trung thu, thiếu nhi, hoạt động ngoại khóa.',
    sw: ['0F1C3F', '1F3A6B', 'FFD166', 'FFF8EA'], ownInv: true,
    palette: { bg: 'FFF9EC', bg2: 'F8F1E0', ink: '15213F', body: '384463', muted: '67718C', accent: 'D1495B', accent2: '2D5DA1', accent3: 'EDAE49',
      card: 'FFFFFF', card_line: 'EADFC8', inv: ['0B1633', '17305C', '1F3A6B'], inv_ink: 'FFF8EA', inv_body: 'D8DFF0', inv_accent: 'FFD166' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const big = kind === 'cover', [mx, my, mr] = kind === 'closing' ? [SW / 2, 1.25, 0.6] : [SW - 2.5, 2.0, big ? 1.15 : 0.95];
        ctx.box(mx - mr * 2, my - mr * 2, mr * 4, mr * 4, { kind: 'ellipse', radial: true, gradient: ['FFE8A3', 'FFE8A3'], galphas: [0.35, 0], name: '!!tt-hao' });
        ctx.box(mx - mr, my - mr, mr * 2, mr * 2, { kind: 'ellipse', color: 'FFE08A', name: '!!tt-trang' });
        ctx.poly(cloud(mx - mr * 0.6, my + mr * 0.75, mr * 0.9).concat(cloud(mx + mr * 1.3, my - mr * 0.2, mr * 0.6, -1)), { closed: false, lineColor: 'FFFFFF', lineW: 1.6, lineAlpha: 0.75, name: '!!tt-may' });
        if (kind === 'closing') info.y0 = Math.max(info.y0, 2.3);
        else { starLantern(ctx, SW - 4.3, SH - 1.9, big ? 0.7 : 0.55, 0.25, 'tt-'); info.x1 = Math.min(info.x1, SW - 5.2); }
      } else {
        ctx.box(SW - 0.82, 0.2, 0.44, 0.44, { kind: 'ellipse', color: 'FFD166', name: '!!tt-trang' });
        ctx.poly(star(SW - 1.25, 0.3, 0.09), { color: th.accent, name: '!!tt-sao' });
      }
    } },
  'phao-hoa': { pack: 'le-hoi', name: 'Pháo hoa · Mừng lễ', short: 'Pháo hoa',
    desc: 'Những chùm pháo hoa vàng, hồng, xanh trên nền đêm — mừng năm mới, lễ kỷ niệm, tổng kết, khai giảng.',
    sw: ['0B0B2B', '2A1B5C', 'FFD166', 'EF476F'], ownInv: true,
    palette: { bg: 'FBF8F3', bg2: 'F3EEF7', ink: '1A1538', body: '3E3960', muted: '6D6890', accent: 'D6336C', accent2: '118AB2', accent3: 'E0A100',
      card: 'FFFFFF', card_line: 'E5DFEE', inv: ['0A0A26', '1C1446', '2A1B5C'], inv_ink: 'FFFFFF', inv_body: 'DCD8F0', inv_accent: 'FFD166' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const set = kind === 'closing' ? [[1.6, 1.4, 1.0, 'FFD166'], [SW - 1.7, 1.2, 1.1, 'EF476F'], [SW - 2.6, SH - 1.4, 0.7, '06D6A0'], [2.4, SH - 1.2, 0.6, '73C2FB']]
          : [[SW - 2.2, 1.6, 1.3, 'FFD166'], [SW - 4.0, 2.7, 0.9, 'EF476F'], [SW - 1.4, 4.4, 0.85, '06D6A0'], [SW - 3.5, 0.75, 0.5, '73C2FB'], [SW - 3.0, 5.6, 0.45, 'FFD166']];
        set.forEach(([x, y, r, c], k) => burst(ctx, x, y, r, c, 'ph' + k + '-'));
        if (kind !== 'closing') info.x1 = Math.min(info.x1, SW - 5.0);
      } else { burst(ctx, SW - 0.62, 0.42, 0.26, th.accent, 'ph0-', 14); burst(ctx, SW - 1.18, 0.3, 0.15, th.accent2, 'ph1-', 12); }
    } },

  // ----- Thiên nhiên · Môi trường
  'dam-sen': { pack: 'thien-nhien', name: 'Đầm sen', short: 'Đầm sen',
    desc: 'Hoa sen hồng, nụ sen và lá sen xanh — quốc hoa, thiên nhiên, văn hóa Việt, chủ đề thanh cao, môi trường nước.',
    sw: ['0E3B2E', '1F5C46', 'F48FB1', 'F5F8F2'], ownInv: true,
    palette: { bg: 'F5F8F2', bg2: 'EDF3EA', ink: '17332A', body: '38544A', muted: '667E74', accent: 'C2185B', accent2: '2E7D32', accent3: 'E7A33E',
      card: 'FFFFFF', card_line: 'D6E3D6', inv: ['0C3328', '17503D', '1F5C46'], inv_ink: 'F5FAF6', inv_body: 'D2E6DA', inv_accent: 'F8BBD0' },
    draw: emblemDraw(lotusPond, { ca: 0.16, wm: 0.16 }) },
  'bac-thang': { pack: 'thien-nhien', name: 'Ruộng bậc thang', short: 'Bậc thang',
    desc: 'Những thửa ruộng bậc thang xanh vàng uốn lượn ở góc trang — nông nghiệp, vùng cao, du lịch, mùa lúa chín.',
    sw: ['1B4332', '2D6A4F', 'CDDC39', 'F7F9EF'], ownInv: true,
    palette: { bg: 'F7F9EF', bg2: 'EFF3E2', ink: '1B2E22', body: '3B5042', muted: '687C6C', accent: '2D6A4F', accent2: '9BBF3B', accent3: 'E0A100',
      card: 'FFFFFF', card_line: 'DCE5CC', inv: ['16362A', '24543F', '2D6A4F'], inv_ink: 'F5F9EE', inv_body: 'D5E5C9', inv_accent: 'CDDC39' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        if (kind === 'closing') terraces(ctx, SW + 0.6, SH + 0.6, 0.6, 3.6, 7, 0.55, 'bt-');
        else { terraces(ctx, SW + 0.6, SH + 0.6, 0.8, kind === 'cover' ? 5.6 : 4.6, 10, 0.8, 'bt-'); info.x1 = Math.min(info.x1, SW - 3.4); info.y1 = Math.min(info.y1, SH - 0.9); }
      } else terraces(ctx, SW + 0.4, SH + 0.4, 0.4, 1.9, 5, 0.35, 'bt-');
    } },
  'la-nhiet-doi': { pack: 'thien-nhien', name: 'Lá nhiệt đới', short: 'Lá dừa',
    desc: 'Tàu lá dừa, lá cọ xanh vươn ra từ góc trang — miền Tây, biển đảo, môi trường, du lịch, mùa hè.',
    sw: ['081C15', '1B4332', '95D5B2', 'F1F7F2'], ownInv: true,
    palette: { bg: 'F1F7F2', bg2: 'E7F1E9', ink: '0F2A20', body: '2F4A3E', muted: '5E776B', accent: '2D6A4F', accent2: '52B788', accent3: 'E9C46A',
      card: 'FFFFFF', card_line: 'D1E5D7', inv: ['06170F', '12362A', '1B4332'], inv_ink: 'F1F8F3', inv_body: 'CDE6D8', inv_accent: '95D5B2' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const c = th.inv_accent;
        frond(ctx, SW + 0.2, -0.3, 4.2, D(150), 0.18, c, 0.85, 'ld0-'); frond(ctx, SW + 0.3, 1.2, 3.4, D(185), -0.15, mix(c, th.inv[0], 0.25), 0.8, 'ld1-');
        frond(ctx, SW + 0.2, SH + 0.3, 3.6, D(215), -0.12, mix(c, 'FFFFFF', 0.2), 0.75, 'ld2-');
        if (kind === 'closing') frond(ctx, -0.2, SH + 0.3, 3.2, D(-35), 0.12, c, 0.7, 'ld3-'); else info.x1 = Math.min(info.x1, SW - 4.6);
      } else frond(ctx, SW + 0.15, -0.2, 1.8, D(152), 0.15, th.accent2, 0.3, 'ld0-');
    } },
  'trai-dat': { pack: 'thien-nhien', name: 'Trái Đất xanh', short: 'Trái Đất',
    desc: 'Quả địa cầu kinh tuyến nét mảnh nảy mầm xanh — bảo vệ môi trường, biến đổi khí hậu, phát triển bền vững.',
    sw: ['0B3D2E', '146C54', '7ED9A8', 'F2F8F5'], ownInv: true,
    palette: { bg: 'F2F8F5', bg2: 'E8F2EE', ink: '0F2E25', body: '2E4D44', muted: '5E7A71', accent: '138A63', accent2: '2A9DCE', accent3: 'F2A541',
      card: 'FFFFFF', card_line: 'D2E6DE', inv: ['0A3226', '115A45', '146C54'], inv_ink: 'F2FAF6', inv_body: 'CFE9DE', inv_accent: '7ED9A8' },
    draw: emblemDraw(globe) },

  // ----- Giáo dục · Khoa học
  'sach-but': { pack: 'giao-duc', name: 'Sách vở · Bút chì', short: 'Sách bút',
    desc: 'Cuốn sách mở và cây bút chì nét mảnh, giữ màu của mẫu — bài giảng, ngày Nhà giáo 20/11, khuyến học, thư viện.',
    sw: ['22303C', '3D5A80', 'EE6C4D', 'F7F9FB'], ownInv: false, palette: null, draw: emblemDraw(bookPen) },
  'nguyen-tu': { pack: 'giao-duc', name: 'Nguyên tử · Khoa học', short: 'Nguyên tử',
    desc: 'Mô hình nguyên tử với ba quỹ đạo electron, giữ màu của mẫu — vật lý, hóa học, STEM, nghiên cứu khoa học.',
    sw: ['13233A', '1F4E79', '4FC3F7', 'F4F8FB'], ownInv: false, palette: null, draw: emblemDraw(atom) },
  'mach-dien': { pack: 'giao-duc', name: 'Mạch điện tử · Công nghệ', short: 'Mạch điện',
    desc: 'Đường mạch in và nút hàn chạy từ mép trang trên nền xanh đêm — tin học, chuyển đổi số, AI, kỹ thuật.',
    sw: ['0A1F2E', '0F3A4F', '35E0C2', 'F4F8FA'], ownInv: true,
    palette: { bg: 'F4F8FA', bg2: 'EAF2F5', ink: '0D2230', body: '2F4655', muted: '5F7583', accent: '0E7C86', accent2: '3A86FF', accent3: 'F4A259',
      card: 'FFFFFF', card_line: 'D3E2E8', inv: ['07161F', '0C2C3C', '0F3A4F'], inv_ink: 'EFFAFB', inv_body: 'C7E3E8', inv_accent: '35E0C2' },
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        if (kind === 'closing') { circuit(ctx, SW - 3.2, 0.4, SW, SH - 0.4, 9, th.inv_accent, 0.35, 21, 'md-'); }
        else { circuit(ctx, SW - 5.2, 0.3, SW, SH - 0.3, 12, th.inv_accent, 0.6, 21, 'md-'); info.x1 = Math.min(info.x1, SW - 5.3); }
      } else circuit(ctx, SW - 2.6, SH - 1.6, SW, SH - 0.55, 4, th.accent, 0.25, 21, 'md-');
    } },
  'hinh-hoc': { pack: 'giao-duc', name: 'Hình học · Toán học', short: 'Hình học',
    desc: 'Tam giác, hình tròn, hình vuông và lưới chấm nhiều màu, giữ màu của mẫu — toán học, tư duy, lớp học sáng tạo.',
    sw: ['1D3557', '457B9D', 'E63946', 'F1FAEE'], ownInv: false, palette: null,
    draw(ctx, th, inv, idx, kind, info) {
      const cols = inv ? [th.inv_accent, mix(th.inv_accent, 'FFFFFF', 0.4), th.inv_ink] : [th.accent, th.accent2, th.accent3];
      if (inv) {
        const items = kind === 'closing'
          ? [['ci', 1.4, 1.3, 0.7, 0, 0], ['tri', SW - 1.6, SH - 1.4, 0.8, 0.3, 1], ['dot', SW - 2.4, 0.8, 0.28, 0, 2], ['zig', 0.9, SH - 1.0, 0.9, 0, 1]]
          : [['ci', SW - 2.6, 2.3, 1.35, 0, 0], ['tri', SW - 4.1, 4.6, 0.95, 0.35, 1], ['sq', SW - 1.4, 5.3, 0.6, 0.5, 2], ['dot', SW - 3.9, 0.7, 0.3, 0, 2], ['zig', SW - 2.2, 6.6, 1.2, 0, 1], ['fill', SW - 1.3, 1.1, 0.22, 0, 1]];
        geoSet(ctx, items, cols, 0.75, 'hh-');
        if (kind === 'closing') { info.x0 = Math.max(info.x0, 1.6); info.x1 = Math.min(info.x1, SW - 1.6); } else info.x1 = Math.min(info.x1, SW - 4.9);
      } else geoSet(ctx, [['tri', SW - 1.35, 0.4, 0.17, 0.2, 0], ['ci', SW - 0.85, 0.38, 0.13, 0, 1], ['fill', SW - 0.5, 0.42, 0.06, 0, 2]], cols, 0.8, 'hh-');
    } },
});

// ============================================================ gói Anime · Comic · Manga
// Hình tự vẽ theo ngôn ngữ của thể loại (đường tốc độ, chấm tram, tiếng nổ, bong bóng thoại…),
// không dùng nhân vật, logo hay biểu tượng riêng của bộ truyện/phim nào.
PACKS.push({ id: 'anime', name: 'Anime · Comic · Manga', desc: 'Đường tốc độ, chấm tram, BÙM!, bong bóng thoại, hào quang, hải tặc, mạng nhện, siêu anh hùng, HUD, khung truyện' });
const COMIC = { bg: 'FFF6DC', bg2: 'FFFBEF', ink: '111111', body: '2B2B2B', muted: '555555', accent: 'E63946', accent2: '1D4ED8', accent3: 'FFC300', card: 'FFFFFF', card_line: '111111' };
const MANGA = { bg: 'FFFFFF', bg2: 'F5F5F5', ink: '0D0D0D', body: '2A2A2A', muted: '5C5C5C', accent: 'D62828', accent2: '1A1A1A', accent3: '8C8C8C', card: 'FFFFFF', card_line: '1A1A1A',
  inv: ['0D0D0D', '222222'], inv_ink: 'FFFFFF', inv_body: 'D9D9D9', inv_accent: 'FF4D4D' };
const pal = (base, o) => Object.assign({}, base, o);
const BOLT = [[0, 0], [0.4, -0.15], [0.34, -0.03], [1, 0.03], [0.58, 0.17], [0.64, 0.06], [0.05, 0.13]];
const SHIELD = [[-0.78, -0.82], [0.78, -0.82], [0.78, -0.05]].concat(quad([0.78, -0.05], [0.72, 0.6], [0, 0.98], 14), quad([0, 0.98], [-0.72, 0.6], [-0.78, -0.05], 14));
const SAYS = { font: 'Segoe UI Black', align: 'c', anchor: 'm' };

function jagged(cx, cy, R, r, n, seed, rot = 0) {
  const rr = seeded(seed), p = [];
  for (let i = 0; i < n * 2; i++) { const a = rot + Math.PI * i / n, k = i % 2 ? r * (0.85 + 0.3 * rr()) : R * (0.85 + 0.3 * rr()); p.push([cx + k * Math.cos(a), cy + k * Math.sin(a)]); }
  return p;
}
function focusLines(cx, cy, rin, rout, n, seed, sy = 0.7) {
  const r = seeded(seed), out = [];
  for (let i = 0; i < n; i++) {
    const a = TAU * i / n + (r() - 0.5) * 0.03, ri = rin * (1 + r() * 0.45), w = 0.008 + r() * 0.022;
    out.push([[cx + ri * Math.cos(a), cy + ri * Math.sin(a) * sy], [cx + rout * Math.cos(a - w), cy + rout * Math.sin(a - w) * sy], [cx + rout * Math.cos(a + w), cy + rout * Math.sin(a + w) * sy]]);
  }
  return out;
}
function streaks(x1, y0, y1, n, len, seed) {             // vệt tốc độ nằm ngang, nhọn về bên trái
  const r = seeded(seed), out = [];
  for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * r(), L = len * (0.4 + 0.6 * r()), w = 0.012 + 0.02 * r(); out.push([[x1 + 0.1, y - w], [x1 + 0.1, y + w], [x1 - L, y]]); }
  return out;
}
function bubble(cx, cy, rx, ry, tx, ty) {                // bong bóng thoại có đuôi nhọn chỉ tới (tx, ty)
  const ang = Math.atan2((ty - cy) / ry, (tx - cx) / rx), n = 60, p = [];
  for (let i = 0; i < n; i++) { const t = ang + 0.2 + (TAU - 0.4) * i / (n - 1); p.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); }
  p.push([tx, ty]); return p;
}
function skyline(x0, x1, yb, hmin, hmax, seed) {
  const r = seeded(seed), out = []; let x = x0;
  while (x < x1) { const w = 0.3 + 0.55 * r(), h = hmin + (hmax - hmin) * r(); out.push([[x, yb], [x, yb - h], [x + w, yb - h], [x + w, yb]]); if (r() < 0.3) out.push(rotRect(x + w / 2, yb - h - 0.18, 0.36, 0.03, D(90))); x += w + 0.04; }
  return out;
}
function web(cx, cy, R, a0, a1, spokes, rings) {
  const sp = [], rg = [];
  for (let i = 0; i <= spokes; i++) { const a = a0 + (a1 - a0) * i / spokes; sp.push([[cx, cy], [cx + R * Math.cos(a), cy + R * Math.sin(a)]]); }
  for (let k = 1; k <= rings; k++) {
    const rk = R * k / rings, ring = [];
    for (let i = 0; i < spokes; i++) {
      const a = a0 + (a1 - a0) * i / spokes, b = a0 + (a1 - a0) * (i + 1) / spokes, m = (a + b) / 2;
      const seg = quad([cx + rk * Math.cos(a), cy + rk * Math.sin(a)], [cx + rk * 0.86 * Math.cos(m), cy + rk * 0.86 * Math.sin(m)], [cx + rk * Math.cos(b), cy + rk * Math.sin(b)], 8);
      ring.push(...(i ? seg.slice(1) : seg));
    }
    rg.push(ring);
  }
  return sp.concat(rg);
}
function dashes(pts, on = 2, off = 2) { const out = []; for (let i = 0; i + on < pts.length; i += on + off) out.push(pts.slice(i, i + on + 1)); return out; }
function compass(ctx, cx, cy, R, col, a, tag) {
  ctx.poly([circle(cx, cy, R * 0.72, 60), circle(cx, cy, R * 0.8, 60)], { closed: true, lineColor: col, lineW: 1.5, lineAlpha: a, name: '!!' + tag + 'vong' });
  const ticks = []; for (let i = 0; i < 32; i++) { const t = TAU * i / 32, k = i % 4 ? 0.72 : 0.64; ticks.push([[cx + R * k * Math.cos(t), cy + R * k * Math.sin(t)], [cx + R * 0.8 * Math.cos(t), cy + R * 0.8 * Math.sin(t)]]); }
  ctx.poly(ticks, { closed: false, lineColor: col, lineW: 1, lineAlpha: a, name: '!!' + tag + 'vach' });
  ctx.poly(star(cx, cy, R * 0.62, 4, 0.22, D(-45)), { color: col, alpha: a * 0.55, name: '!!' + tag + 'phu' });
  ctx.poly(star(cx, cy, R, 4, 0.2), { color: col, alpha: a, name: '!!' + tag + 'chinh' });
}
function hud(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), segs = [], ticks = [];
  for (let i = 0; i < 6; i++) segs.push(arc(0, 0, 0.95, D(i * 60 + 8), D(i * 60 + 52), 12));
  for (let i = 0; i < 48; i++) { const t = TAU * i / 48, k = i % 4 ? 0.74 : 0.68; ticks.push([[k * Math.cos(t), k * Math.sin(t)], [0.78 * Math.cos(t), 0.78 * Math.sin(t)]]); }
  ctx.poly(mapR(segs, P), { closed: false, lineColor: col, lineW: Math.max(1.5, 4 * s), lineAlpha: a, name: '!!' + tag + 'cung' });
  ctx.poly(mapR(ticks, P), { closed: false, lineColor: col, lineW: 1, lineAlpha: a * 0.8, name: '!!' + tag + 'vach' });
  ctx.poly(mapR([circle(0, 0, 0.55, 48), circle(0, 0, 0.42, 48)], P), { closed: true, lineColor: col, lineW: 1.2, lineAlpha: a, name: '!!' + tag + 'vong' });
  ctx.poly(mapR([0, 90, 180, 270].map(d => place([[0, -0.07], [0.12, 0], [0, 0.07]], 1.08 * Math.cos(D(d)), 1.08 * Math.sin(D(d)), 1, D(d + 180))), P), { color: col, alpha: a, name: '!!' + tag + 'ngam' });
  ctx.box(...P([-0.6, -0.6]), 1.2 * s, 1.2 * s, { kind: 'ellipse', radial: true, gradient: ['7DF9FF', '7DF9FF'], galphas: [Math.min(1, a * 0.7), 0], name: '!!' + tag + 'sang' });
  ctx.poly(circle(0, 0, 0.26, 40).map(P), { color: 'E0FFFF', alpha: a, lineColor: '7DF9FF', lineW: Math.max(1, 3 * s), lineAlpha: a, name: '!!' + tag + 'loi' });
}
function aura(ctx, cx, cy, R, a, tag, seed) {               // hào quang lửa bốc lên quanh quả cầu sáng
  const flame = (k, sd) => { const r = seeded(sd), p = []; for (let i = 0; i < 44; i++) { const t = TAU * i / 44, up = Math.sin(t) < 0 ? 1 + 0.9 * -Math.sin(t) : 1, kk = (i % 2 ? 0.86 : 1 + 0.25 * r()) * k; p.push([cx + R * kk * Math.cos(t) * 0.85, cy + R * kk * Math.sin(t) * up]); } return p; };
  ctx.poly(flame(1.25, seed), { color: 'F77F00', alpha: a * 0.75, name: '!!' + tag + 'lua1' });
  ctx.poly(flame(0.95, seed + 1), { color: 'FFB703', alpha: a * 0.85, name: '!!' + tag + 'lua2' });
  ctx.box(cx - R * 0.75, cy - R * 0.75, R * 1.5, R * 1.5, { kind: 'ellipse', radial: true, gradient: ['FFFFFF', 'FFE066'], galphas: [a, a * 0.9], name: '!!' + tag + 'cau' });
}
function heroShield(ctx, cx, cy, s, a, tag) {
  const P = U(cx, cy, s);
  ctx.poly(SHIELD.map(P), { color: 'D62828', alpha: a, lineColor: 'FFD60A', lineW: Math.max(2, 6 * s), lineAlpha: a, name: '!!' + tag + 'khien' });
  ctx.poly(SHIELD.map(([x, y]) => P([x * 0.78, y * 0.78 - 0.02])), { closed: true, lineColor: 'FFD60A', lineW: Math.max(1, 2 * s), lineAlpha: a, name: '!!' + tag + 'khien2' });
  ctx.poly(place(BOLT, ...P([-0.42, -0.42]), 1.05 * s, D(52)), { color: 'FFD60A', alpha: a, lineColor: '111111', lineW: 1.5, lineAlpha: a, name: '!!' + tag + 'set' });
}
function comicFrame(ctx, info, w = 6) {
  ctx.box(0.16, 0.16, SW - 0.32, SH - 0.32, { lineColor: '111111', lineW: w, name: '!!ac-khung' });
  Object.assign(info, { x0: Math.max(info.x0, 0.95), y0: Math.max(info.y0, 0.8), y1: Math.min(info.y1, SH - 0.85) });
}

Object.assign(MOTIFS, {
  'toc-do': { pack: 'anime', name: 'Manga · Đường tốc độ', short: 'Tốc độ',
    desc: 'Chùm đường tập trung trắng đen kiểu khung hình cao trào trong manga, điểm một vạch đỏ — câu lạc bộ anime, thể thao, hành động.',
    sw: ['0D0D0D', '222222', 'FFFFFF', 'D62828'], ownInv: true, palette: MANGA,
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const cx = kind === 'closing' ? SW / 2 : SW * 0.34;
        ctx.poly(focusLines(cx, SH / 2, 3.9, 14, 150, 5 + idx), { color: th.inv_ink, alpha: 0.3, name: '!!td-tia' });
        if (kind !== 'closing') { ctx.poly(rotRect(SW - 1.1, 0.85, 3.0, 0.2, D(-28)), { color: th.inv_accent, name: '!!td-vach' }); info.x1 = Math.min(info.x1, SW - 2.7); }
      } else ctx.poly(streaks(SW - 0.3, 0.2, 0.55, 14, 2.6, 9), { color: th.ink, alpha: 0.5, name: '!!td-vet' });
    } },
  'cham-tram': { pack: 'anime', name: 'Comic · Chấm tram & tia nắng', short: 'Chấm tram',
    desc: 'Nền đỏ tia nắng vàng, mảng chấm tram ở góc và khung mực dày như bìa truyện tranh Mỹ — sinh động, thiếu nhi, ngoại khóa.',
    sw: ['A4161A', 'D62839', 'FFD60A', 'FFF6DC'], ownInv: true, palette: pal(COMIC, { inv: ['D62839', 'A4161A'], inv_ink: 'FFFFFF', inv_body: 'FFE3E3', inv_accent: 'FFD60A' }),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        ctx.poly(rays(SW * 0.82, SH * 0.42, 16, 40, 0), { color: th.inv_accent, alpha: 0.2, name: '!!ct-tia' });
        ctx.poly(T.dotField(0, SH, 4.4, 3.0, 0.3, 0.13, 'bl'), { color: '000000', alpha: 0.28, name: '!!ct-tram1' });
        ctx.poly(T.dotField(SW, 0, 4.2, 2.6, 0.28, 0.12, 'tr'), { color: th.inv_accent, alpha: 0.6, name: '!!ct-tram2' });
        comicFrame(ctx, info);
      } else {
        ctx.poly(T.dotField(SW, 0, 2.6, 1.5, 0.2, 0.085, 'tr'), { color: th.accent3, alpha: 0.95, name: '!!ct-tram2' });
        ctx.poly(T.dotField(0, SH, 2.2, 1.1, 0.18, 0.07, 'bl'), { color: th.accent, alpha: 0.5, name: '!!ct-tram1' });
      }
    } },
  'bum': { pack: 'anime', name: 'Comic · BÙM! POW!', short: 'BÙM!',
    desc: 'Vụ nổ răng cưa vàng đỏ viền mực với chữ BÙM!, POW! trên nền xanh — mở màn, câu đố, trò chơi, khoảnh khắc bất ngờ.',
    sw: ['1E3A8A', '1D4ED8', 'FFD60A', 'E63946'], ownInv: true, palette: pal(COMIC, { inv: ['1D4ED8', '1E3A8A'], inv_ink: 'FFFFFF', inv_body: 'E3EBFF', inv_accent: 'FFD60A' }),
    draw(ctx, th, inv, idx, kind, info) {
      const boom = (cx, cy, R, word, size, tag, seed) => {
        ctx.poly(jagged(cx, cy, R * 1.22, R * 0.85, 14, seed), { color: 'E63946', lineColor: '111111', lineW: 3, name: '!!' + tag + 'no1' });
        ctx.poly(jagged(cx, cy, R, R * 0.68, 12, seed + 3, 0.2), { color: 'FFD60A', lineColor: '111111', lineW: 2.5, name: '!!' + tag + 'no2' });
        ctx.text(cx - R, cy - R * 0.5, 2 * R, R, word, Object.assign({ size, color: 'E63946', name: '!!' + tag + 'chu' }, SAYS));
      };
      if (inv) {
        ctx.poly(rays(SW - 3.0, SH / 2, 16, 36, 0.1), { color: 'FFFFFF', alpha: 0.1, name: '!!bum-tia' });
        if (kind === 'closing') { boom(1.6, 1.35, 0.95, 'WOW!', 30, 'bum1-', 3); boom(SW - 1.7, SH - 1.35, 0.9, 'YEAH!', 26, 'bum2-', 7); }
        else { boom(SW - 3.0, SH / 2 - 0.1, kind === 'cover' ? 1.9 : 1.55, kind === 'cover' ? 'BÙM!' : 'POW!', kind === 'cover' ? 64 : 52, 'bum-', 11); info.x1 = Math.min(info.x1, SW - 5.6); }
        comicFrame(ctx, info);
      } else boom(SW - 0.72, 0.45, 0.3, '!', 20, 'bum-', 11);
    } },
  'bong-thoai': { pack: 'anime', name: 'Bong bóng thoại', short: 'Bóng thoại',
    desc: 'Bong bóng lời thoại và bong bóng suy nghĩ viền mực trên nền xanh ngọc — hội thoại, tình huống, tiếng Anh giao tiếp, kể chuyện.',
    sw: ['0369A1', '0EA5E9', 'FFFFFF', 'FFD60A'], ownInv: true, palette: pal(COMIC, { accent: '0369A1', accent2: 'E63946', inv: ['0EA5E9', '0369A1'], inv_ink: 'FFFFFF', inv_body: 'E0F4FF', inv_accent: 'FFD60A' }),
    draw(ctx, th, inv, idx, kind, info) {
      const say = (cx, cy, rx, ry, tx, ty, word, size, tag) => {
        ctx.poly(bubble(cx, cy, rx, ry, tx, ty), { color: 'FFFFFF', lineColor: '111111', lineW: 3, name: '!!' + tag + 'bong' });
        ctx.text(cx - rx * 0.8, cy - ry * 0.7, rx * 1.6, ry * 1.4, word, Object.assign({ size, color: '111111', name: '!!' + tag + 'chu' }, SAYS));
      };
      const think = (cx, cy, rx, ry, word, size, tag) => {
        ctx.poly([ell(cx, cy, rx, ry, 0, 48), circle(cx - rx * 0.9, cy + ry * 1.05, ry * 0.22, 20), circle(cx - rx * 1.2, cy + ry * 1.5, ry * 0.12, 16)], { color: 'FFFFFF', lineColor: '111111', lineW: 2.5, name: '!!' + tag + 'nghi' });
        ctx.text(cx - rx * 0.8, cy - ry * 0.7, rx * 1.6, ry * 1.4, word, Object.assign({ size, color: '111111', name: '!!' + tag + 'chu' }, SAYS));
      };
      if (inv) {
        if (kind === 'closing') { say(2.0, 1.25, 1.2, 0.6, 2.8, 1.95, 'Hay quá!', 22, 'bt1-'); think(SW - 2.0, SH - 1.5, 1.1, 0.55, 'Hẹn gặp lại!', 18, 'bt2-'); }
        else {
          const big = kind === 'cover';
          say(SW - 3.0, 2.15, big ? 2.1 : 1.8, big ? 1.15 : 0.95, SW - 4.4, big ? 3.75 : 3.45, big ? 'Bắt đầu nào!' : 'Tiếp nào!', big ? 34 : 30, 'bt1-');
          think(SW - 1.75, SH - 1.6, 1.15, 0.6, 'Hmm…', 26, 'bt2-');
          info.x1 = Math.min(info.x1, SW - 5.4);
        }
        comicFrame(ctx, info, 5);
      } else say(SW - 0.95, 0.4, 0.5, 0.25, SW - 1.4, 0.6, '!', 16, 'bt-');
    } },
  'nang-luong': { pack: 'anime', name: 'Shōnen · Hào quang năng lượng', short: 'Năng lượng',
    desc: 'Quả cầu sáng giữa hào quang lửa cam vàng, tia sét và tia lửa trên nền tím đêm — sôi động, thi đua, khởi động, chinh phục thử thách.',
    sw: ['1B0B3A', '3B0F5C', 'FFB703', 'F77F00'], ownInv: true,
    palette: pal(COMIC, { accent: 'E85D04', accent2: '6A0DAD', accent3: 'FFB703', inv: ['14072E', '2E0B52', '3B0F5C'], inv_ink: 'FFFFFF', inv_body: 'E9DDF7', inv_accent: 'FFB703' }),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        if (kind === 'closing') aura(ctx, SW / 2, SH / 2 + 0.4, 2.2, 0.22, 'nl-', 4);
        else {
          const cx = SW - 2.5, cy = SH / 2 + 0.55, R = kind === 'cover' ? 1.25 : 1.05;
          aura(ctx, cx, cy, R, 0.95, 'nl-', 4);
          ctx.poly([place(BOLT, cx - R * 1.75, cy - R * 1.9, R * 0.9, D(35)), place(BOLT, cx + R * 0.95, cy - R * 2.0, R * 0.8, D(110))], { color: 'FFE066', lineColor: 'FFFFFF', lineW: 1, name: '!!nl-set' });
          const r = seeded(9), sp = []; for (let i = 0; i < 18; i++) { const t = TAU * r(), d = R * (1.4 + 1.1 * r()); sp.push(star(cx + d * Math.cos(t), cy + d * Math.sin(t) * 0.9, 0.05 + 0.07 * r(), 4, 0.3)); }
          ctx.poly(sp, { color: 'FFF3B0', alpha: 0.9, name: '!!nl-tialua' });
          info.x1 = Math.min(info.x1, SW - 5.9);
        }
      } else {
        ctx.box(SW - 0.9, 0.22, 0.42, 0.42, { kind: 'ellipse', radial: true, gradient: ['FFE066', 'F77F00'], name: '!!nl-cau' });
        ctx.poly(place(BOLT, SW - 1.55, 0.25, 0.5, D(35)), { color: th.accent, name: '!!nl-set' });
      }
    } },
  'hai-tac': { pack: 'anime', name: 'Phiêu lưu · Hải tặc & bản đồ', short: 'Hải tặc',
    desc: 'La bàn, đường đi nét đứt và dấu X kho báu trên nền gỗ sẫm, nội dung trên giấy da cũ — phiêu lưu, khám phá, trò chơi tìm kho báu.',
    sw: ['2B1D0E', '4A3216', 'E9C46A', 'A4161A'], ownInv: true,
    palette: { bg: 'F6E9C9', bg2: 'F1E0B8', ink: '2B1D0E', body: '4A3520', muted: '7A6046', accent: 'A4161A', accent2: '1D3557', accent3: 'C9A227',
      card: 'FFF8E7', card_line: 'C8A971', inv: ['24170A', '3D2A14', '4A3216'], inv_ink: 'F6E9C9', inv_body: 'E8D5A8', inv_accent: 'E9C46A' },
    draw(ctx, th, inv, idx, kind, info) {
      const X = (x, y, s, tag) => ctx.poly([rotRect(x, y, s, s * 0.22, D(45)), rotRect(x, y, s, s * 0.22, D(-45))], { color: 'C1121F', name: '!!' + tag + 'x' });
      if (inv) {
        if (kind === 'closing') { compass(ctx, SW / 2, SH / 2, 2.6, th.inv_accent, 0.13, 'ht-'); }
        else {
          const cx = SW - 2.6, cy = SH / 2 - 0.3, R = kind === 'cover' ? 2.0 : 1.6;
          compass(ctx, cx, cy, R, th.inv_accent, 0.85, 'ht-');
          const route = quad([cx - R * 0.4, cy + R * 0.9], [cx - R * 2.2, cy + R * 1.6], [cx - R * 1.9, SH - 0.7], 30);
          ctx.poly(dashes(route), { closed: false, lineColor: th.inv_ink, lineW: 2.5, lineAlpha: 0.8, name: '!!ht-duong' });
          X(cx - R * 1.9, SH - 0.65, 0.42, 'ht-');
          info.x1 = Math.min(info.x1, cx - R - 0.5);
        }
      } else { compass(ctx, SW - 1.4, SH - 1.4, 1.1, th.accent2, 0.13, 'ht-'); X(SW - 0.65, 0.42, 0.26, 'ht-'); }
    } },
  'mang-nhen': { pack: 'anime', name: 'Mạng nhện · Đô thị về đêm', short: 'Mạng nhện',
    desc: 'Mạng nhện giăng từ góc trang trên nền thành phố đêm xanh thẫm, điểm đỏ — hành động, khoa học về loài nhện, chủ đề thành phố.',
    sw: ['0B1D3A', '12305C', 'E63946', 'FFFFFF'], ownInv: true,
    palette: pal(COMIC, { accent: 'C1121F', accent2: '1D3557', accent3: '457B9D', inv: ['0A1830', '12305C', '1B3F73'], inv_ink: 'FFFFFF', inv_body: 'D6E2F5', inv_accent: 'E63946' }),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        ctx.poly(skyline(-0.1, SW + 0.1, SH + 0.02, 0.5, kind === 'closing' ? 1.4 : 2.0, 13), { color: '050B18', alpha: 0.85, name: '!!mn-pho' });
        if (kind === 'closing') {
          ctx.poly(web(SW + 0.1, -0.1, 3.0, D(90), D(180), 6, 5), { closed: false, lineColor: 'FFFFFF', lineW: 1, lineAlpha: 0.5, name: '!!mn-mang1' });
          ctx.poly(web(-0.1, -0.1, 3.0, 0, D(90), 6, 5), { closed: false, lineColor: 'FFFFFF', lineW: 1, lineAlpha: 0.5, name: '!!mn-mang2' });
        } else {
          ctx.poly(web(SW + 0.15, -0.15, kind === 'cover' ? 5.4 : 4.6, D(90), D(180), 8, 7), { closed: false, lineColor: 'FFFFFF', lineW: 1.25, lineAlpha: 0.6, name: '!!mn-mang1' });
          info.x1 = Math.min(info.x1, SW - (kind === 'cover' ? 5.0 : 4.3));
        }
        ctx.box(0, SH - 0.08, SW, 0.08, { color: th.inv_accent, name: '!!mn-dai' });
        info.y1 = Math.min(info.y1, SH - 2.1);
      } else ctx.poly(web(SW + 0.05, -0.05, 1.25, D(90), D(180), 6, 5), { closed: false, lineColor: th.ink, lineW: 0.9, lineAlpha: 0.4, name: '!!mn-mang1' });
    } },
  'sieu-anh-hung': { pack: 'anime', name: 'Siêu anh hùng · Khiên tia sét', short: 'Siêu anh hùng',
    desc: 'Tấm khiên đỏ viền vàng có tia sét, tia nắng kiểu bìa truyện và phố xá phía dưới — phẩm chất, lòng dũng cảm, tấm gương người tốt việc tốt.',
    sw: ['1E3A8A', '1D4ED8', 'D62828', 'FFD60A'], ownInv: true,
    palette: pal(COMIC, { accent: 'D62828', accent2: '1D4ED8', accent3: 'FFC300', inv: ['1E3A8A', '1D4ED8'], inv_ink: 'FFFFFF', inv_body: 'E3EBFF', inv_accent: 'FFD60A' }),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const closing = kind === 'closing', cx = closing ? SW / 2 : SW - 3.0, s = closing ? 2.6 : (kind === 'cover' ? 2.2 : 1.8);
        ctx.poly(rays(cx, SH / 2, 16, 36, 0.05), { color: th.inv_accent, alpha: closing ? 0.08 : 0.16, name: '!!sah-tia' });
        ctx.poly(skyline(-0.1, SW + 0.1, SH + 0.02, 0.4, 1.3, 17), { color: '0A1A40', alpha: 0.7, name: '!!sah-pho' });
        heroShield(ctx, cx, SH / 2 - 0.1, s, closing ? 0.13 : 1, 'sah-');
        if (!closing) info.x1 = Math.min(info.x1, cx - s - 0.5);
        comicFrame(ctx, info, 5);
      } else heroShield(ctx, SW - 1.45, SH - 1.4, 1.1, 0.12, 'sah-');
    } },
  'giap-hud': { pack: 'anime', name: 'Giáp công nghệ · HUD', short: 'HUD',
    desc: 'Vòng HUD vàng kim quanh lõi năng lượng xanh lam phát sáng trên nền đỏ sẫm — công nghệ, robot, kỹ thuật, khoa học viễn tưởng.',
    sw: ['140606', '5C0F12', 'FFC857', '7DF9FF'], ownInv: true,
    palette: { bg: 'F7F4F2', bg2: 'EFEAE6', ink: '1A0F0F', body: '3D2B2B', muted: '6E5A5A', accent: 'B3121B', accent2: 'C9A227', accent3: '2EC4E6',
      card: 'FFFFFF', card_line: 'E2D6D0', inv: ['140606', '3D0B0B', '5C0F12'], inv_ink: 'FFF6E8', inv_body: 'F0D9C8', inv_accent: 'FFC857' },
    draw: emblemDraw(hud, { halo: true, ca: 0.14 }) },
  'khung-truyen': { pack: 'anime', name: 'Manga · Khung truyện', short: 'Khung truyện',
    desc: 'Ba ô khung truyện nét trắng với chấm tram, vệt tốc độ và mảng đỏ trên nền đen — giới thiệu truyện, kể chuyện bằng tranh, câu lạc bộ manga.',
    sw: ['0D0D0D', '262626', 'FFFFFF', 'FF4D4D'], ownInv: true, palette: MANGA,
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        if (kind === 'closing') { ctx.poly(focusLines(SW / 2, SH / 2, 4.2, 14, 110, 3), { color: 'FFFFFF', alpha: 0.18, name: '!!kt-tia' }); return; }
        const x0 = SW - 5.4, A = [[x0, 0.5], [SW - 0.5, 0.5], [SW - 0.5, 3.35], [x0, 3.75]], B = [[x0, 4.0], [x0 + 2.6, 3.7], [x0 + 2.25, SH - 0.5], [x0, SH - 0.5]], C = [[x0 + 2.85, 3.67], [SW - 0.5, 3.6], [SW - 0.5, SH - 0.5], [x0 + 2.5, SH - 0.5]];
        ctx.poly(T.dotField(x0, 3.75, 4.9, 3.25, 0.2, 0.075, 'bl'), { color: 'FFFFFF', alpha: 0.35, name: '!!kt-tram' });
        ctx.poly(streaks(x0 + 2.4, 4.2, SH - 0.8, 12, 2.0, 21), { color: 'FFFFFF', alpha: 0.6, name: '!!kt-vet' });
        ctx.poly(C, { color: th.inv_accent, alpha: 0.9, name: '!!kt-do' });
        ctx.poly([A, B, C], { closed: true, lineColor: 'FFFFFF', lineW: 3, name: '!!kt-khung' });
        info.x1 = Math.min(info.x1, x0 - 0.45);
      } else ctx.poly([[[SW - 1.45, 0.22], [SW - 0.95, 0.22], [SW - 1.0, 0.58], [SW - 1.45, 0.58]], [[SW - 0.85, 0.22], [SW - 0.3, 0.22], [SW - 0.3, 0.58], [SW - 0.9, 0.58]]], { closed: true, lineColor: th.ink, lineW: 1.5, name: '!!kt-khung' });
    } },
});

for (const k in MOTIFS) MOTIFS[k].id = k;

/** Trả về mẫu mới = mẫu gốc + họa tiết (và bảng màu của họa tiết nếu usePalette). */
function withMotif(th, id, usePalette = true) {
  const m = MOTIFS[id]; if (!m) return th;
  return Object.assign({}, th, usePalette && m.palette ? m.palette : {}, { motif: id, name: th.name + ' + ' + m.short });
}

T.MOTIFS = MOTIFS;
T.PACKS = PACKS;
T.withMotif = withMotif;
})(window);
