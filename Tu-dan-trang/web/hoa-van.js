/* Tự dàn trang — họa tiết theo chủ đề: 61 họa tiết chia 12 gói (lịch sử, văn hóa, lễ hội, thiên nhiên, giáo dục, anime,
   trường học, di sản, y tế, vũ trụ, thể thao, đối ngoại) — xem PACKS.
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
    emblem(ctx, cx, cy, s, màu, độ đậm, màu phụ, th, tag) vẽ gọn trong hình vuông tâm (cx, cy), nửa cạnh s;
    độ đậm < 0.3 nghĩa là đang vẽ chìm (chỉ dùng một màu). Tùy chọn: k (phóng to/thu nhỏ), under, inv, closing, page. */
function emblemDraw(emblem, o = {}) {
  return function (ctx, th, inv, idx, kind, info) {
    if (inv) {
      const col = th.inv_accent, c2 = th.inv_ink;
      if (o.under) o.under(ctx, th, kind, info);           // vẽ trước biểu tượng: nền sao, Trái Đất…
      if (kind === 'closing') { if (o.closing) o.closing(ctx, th, info); else emblem(ctx, SW / 2, SH / 2, 3.0, col, o.wm || 0.13, c2, th, 'em-'); }
      else {
        const big = kind === 'cover', cx = SW - (big ? 3.0 : 2.5), s = (big ? 2.5 : 1.95) * (o.k || 1);
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

// ============================================================ 6 gói mở rộng: trường học, di sản, y tế, vũ trụ, thể thao, đối ngoại
const ellArc = (cx, cy, rx, ry, rot, a0, a1, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const t = a0 + (a1 - a0) * i / n, x = rx * Math.cos(t), y = ry * Math.sin(t); return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const SMALL = Array.from({ length: 8 }, (_, i) => { const t = TAU * i / 8; return [0.5 + 0.5 * Math.cos(t), 0.2 * Math.sin(t)]; });   // lá chét nhỏ, ít điểm cho file nhẹ
const WIDE = PETAL.map(([x, y]) => [x, y * 1.45]);
const glow = (ctx, cx, cy, r, color, a, name) => ctx.box(cx - r, cy - r, 2 * r, 2 * r, { kind: 'ellipse', radial: true, gradient: [color, color], galphas: [a, 0], name });
const palW = o => Object.assign({ card: 'FFFFFF' }, o);
function confetti(ctx, x0, y0, w, h, n, seed, cols, tag, a = 0.9) {
  const r = seeded(seed), by = cols.map(() => []);
  for (let i = 0; i < n; i++) by[i % cols.length].push(rotRect(x0 + w * r(), y0 + h * r(), 0.08 + 0.08 * r(), 0.035 + 0.03 * r(), TAU * r()));
  by.forEach((g, k) => ctx.poly(g, { color: cols[k], alpha: a, name: '!!' + tag + 'giay' + k }));
}
function starfield(ctx, x0, y0, w, h, n, seed, col, a, tag) {
  const r = seeded(seed), dots = [];
  for (let i = 0; i < n; i++) dots.push(circle(x0 + w * r(), y0 + h * r(), 0.008 + 0.022 * Math.pow(r(), 2), 8));
  ctx.poly(dots, { color: col, alpha: a, name: '!!' + tag + 'sao' });
}
const sparkle = (cx, cy, r) => star(cx, cy, r, 4, 0.2);

// ============================================================ Gói 1. Trường học · Lễ nghi học đường
PACKS.push({ id: 'truong-hoc', name: 'Trường học · Lễ nghi học đường', desc: 'Trống trường, hoa phượng, mũ cử nhân, vở ô ly, bảng đen phấn trắng' });

function schoolDrum(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, C = k => mono ? col : k;
  const yt = -0.36, yb = 0.6, rx = 0.66, ry = 0.19, bul = 0.07, body = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; body.push([-(rx + bul * Math.sin(Math.PI * t)), yt + (yb - yt) * t]); }
  for (let i = 0; i <= 20; i++) { const q = Math.PI - Math.PI * i / 20; body.push([rx * Math.cos(q), yb + ry * Math.sin(q)]); }
  for (let i = 12; i >= 0; i--) { const t = i / 12; body.push([rx + bul * Math.sin(Math.PI * t), yt + (yb - yt) * t]); }
  for (let i = 0; i <= 20; i++) { const q = Math.PI * i / 20; body.push([rx * Math.cos(q), yt + ry * Math.sin(q)]); }
  ctx.poly(mapR([[[-0.42, 0.72], [-0.64, 0.98]], [[0.42, 0.72], [0.64, 0.98]]], P), { closed: false, lineColor: C('5D4037'), lineW: Math.max(1.5, 5 * s), lineAlpha: a, name: '!!' + tag + 'chan' });
  ctx.poly(body.map(P), { color: C('C62828'), alpha: a, name: '!!' + tag + 'than' });
  const band = yy => Array.from({ length: 21 }, (_, i) => { const q = Math.PI * i / 20; return [(rx + 0.035) * Math.cos(q), yy + ry * Math.sin(q)]; });
  ctx.poly([band(-0.22), band(0.44)].map(r => r.map(P)), { closed: false, lineColor: C('F2B705'), lineW: Math.max(1.2, 4.5 * s), lineAlpha: a, name: '!!' + tag + 'dai' });
  if (!mono) {
    const studs = [];
    [-0.22, 0.44].forEach(yy => { for (let i = 0; i < 9; i++) { const q = Math.PI * (i + 0.5) / 9; studs.push(circle(rx * Math.cos(q), yy + ry * Math.sin(q), 0.022, 8)); } });
    ctx.poly(mapR(studs, P), { color: '7A4B00', alpha: a, name: '!!' + tag + 'dinh' });
    ctx.poly(star(...P([0, 0.12]), 0.15 * s), { color: 'F2B705', alpha: a, name: '!!' + tag + 'sao' });
  }
  ctx.poly(ell(0, yt, rx, ry, 0, 48).map(P), { color: C('F3E2C0'), alpha: mono ? a * 0.5 : a, lineColor: C('8D2A1E'), lineW: 1, lineAlpha: a, name: '!!' + tag + 'mat' });
  ctx.poly(ell(0, yt, rx * 0.68, ry * 0.68, 0, 40).map(P), { closed: true, lineColor: C('C9A66B'), lineW: 1, lineAlpha: a * 0.6, name: '!!' + tag + 'mat2' });
  const sticks = [rotRect(-0.16, -0.7, 1.2, 0.065, D(28)), rotRect(0.16, -0.7, 1.2, 0.065, D(-28))];
  const knobs = [circle(0.37, -0.42, 0.06, 14), circle(-0.37, -0.42, 0.06, 14)];
  ctx.poly(mapR(sticks.concat(knobs), P), { color: C('6D4C41'), alpha: a, name: '!!' + tag + 'dui' });
}
function balloon(ctx, x, y, r, color, tag, sway = 0.15) {
  ctx.poly(quad([x, y + r * 1.12], [x + sway, y + r * 2.2], [x - sway * 0.5, y + r * 3.3], 16), { closed: false, lineColor: '8A8A8A', lineW: 0.9, name: '!!' + tag + 'day' });
  ctx.poly(ell(x, y, r * 0.84, r, 0, 40), { color, name: '!!' + tag + 'bong' });
  ctx.poly([[x, y + r * 0.98], [x - r * 0.13, y + r * 1.14], [x + r * 0.13, y + r * 1.14]], { color, name: '!!' + tag + 'nut' });
  ctx.poly(ell(x - r * 0.32, y - r * 0.38, r * 0.12, r * 0.24, D(30), 20), { color: 'FFFFFF', alpha: 0.5, name: '!!' + tag + 'bong-sang' });
}
const BALLOON_COLS = ['E53935', 'FFC107', '1E88E5', '43A047', 'EC407A'];

// hoa phượng: chùm hoa đỏ cam năm cánh (một cánh nhạt), lá kép lông chim
function fern(x, y, len, ang, bend) {
  const c = Math.cos(ang), d = Math.sin(ang), tip = [x + len * c, y + len * d], ctrl = [x + len * 0.5 * c - bend * len * d, y + len * 0.5 * d + bend * len * c];
  const rib = quad([x, y], ctrl, tip, 16), lf = [];
  for (let i = 2; i < rib.length; i++) {
    const t = i / 16, [px, py] = rib[i], [qx, qy] = rib[i - 1], dir = Math.atan2(py - qy, px - qx), L = len * 0.15 * (1 - 0.5 * t);
    lf.push(place(SMALL, px, py, L, dir + 1.2), place(SMALL, px, py, L, dir - 1.2));
  }
  return [rib, lf];
}
function phuongBranch(ctx, ox, oy, s, dir, tag, mono, col, a = 1, rot = 0) {
  const cr = Math.cos(rot), sr = Math.sin(rot), P = ([x, y]) => [ox + dir * (x * cr - y * sr) * s, oy + (x * sr + y * cr) * s], C = k => mono ? col : k;
  const main = quad([0, -0.1], [1.6, 0.2], [3.7, 1.3]);
  const subs = [quad([1.3, 0.22], [1.6, 0.85], [2.15, 1.4]), quad([2.6, 0.7], [3.0, 0.35], [3.15, -0.05]), quad([3.1, 1.05], [3.45, 1.6], [3.3, 2.05])];
  const ribs = [], leaves = [];
  [[0.5, 0.0, 1.35, -58, 0.12], [0.85, 0.1, 1.45, 80, -0.12], [1.6, 0.4, 1.3, -35, 0.1], [1.9, 1.15, 1.2, 125, 0.1], [2.9, 0.3, 1.15, -100, -0.1],
    [3.45, 1.15, 1.2, 15, 0.1], [3.3, 1.6, 1.05, 150, -0.1], [2.35, 0.65, 1.1, 68, 0.12], [1.3, 0.25, 1.1, 105, 0.1], [3.2, 2.0, 0.9, 85, -0.1]].forEach(([x, y, l, g, b]) => { const [r, lf] = fern(x, y, l, D(g), b); ribs.push(r); leaves.push(...lf); });
  ctx.poly(main.map(P), { closed: false, lineColor: C('4E342E'), lineW: Math.max(1.5, 5 * s), lineAlpha: a, name: '!!' + tag + 'canh' });
  ctx.poly(subs.map(r => r.map(P)), { closed: false, lineColor: C('5D4037'), lineW: Math.max(1, 3 * s), lineAlpha: a, name: '!!' + tag + 'canh2' });
  ctx.poly(ribs.map(r => r.map(P)), { closed: false, lineColor: C('558B2F'), lineW: Math.max(0.75, 1.2 * s), lineAlpha: a, name: '!!' + tag + 'gan' });
  ctx.poly(leaves.map(r => r.map(P)), { color: C('43A047'), alpha: mono ? a * 0.8 : a * 0.92, name: '!!' + tag + 'la' });
  const petals = [[], [], []], flags = [], stamens = [], hearts = [];
  [[1.95, 1.4], [3.15, -0.05], [3.7, 1.3], [3.3, 2.05], [1.1, 0.18], [2.6, 0.72]].forEach(([fx, fy], k) => {
    [[0, 0], [0.28, 0.16], [-0.16, 0.28], [0.12, -0.26]].slice(0, 3 + (k % 2)).forEach(([dx, dy], j) => {
      const cx = fx + dx, cy = fy + dy, pr = 0.135, rot = (k * 1.3 + j * 0.9);
      for (let m = 0; m < 5; m++) { const t = rot + TAU * m / 5, p = circle(cx + pr * 0.95 * Math.cos(t), cy + pr * 0.95 * Math.sin(t), pr, 12); (m === 0 ? flags : petals[(k + j + m) % 3]).push(p); }
      for (let m = 0; m < 6; m++) { const t = rot + 0.5 + TAU * m / 6; stamens.push(quad([cx, cy], [cx + pr * 1.3 * Math.cos(t + 0.3), cy + pr * 1.3 * Math.sin(t + 0.3)], [cx + pr * 2.0 * Math.cos(t), cy + pr * 2.0 * Math.sin(t)], 4)); }
      hearts.push(circle(cx, cy, pr * 0.35, 8));
    });
  });
  ['E53935', 'F4511E', 'D84315'].forEach((c, k) => ctx.poly(petals[k].map(r => r.map(P)), { color: C(c), alpha: a, name: '!!' + tag + 'hoa' + k }));
  ctx.poly(flags.map(r => r.map(P)), { color: C('FFB74D'), alpha: a, name: '!!' + tag + 'hoaco' });
  ctx.poly(stamens.map(r => r.map(P)), { closed: false, lineColor: C('B71C1C'), lineW: 0.8, lineAlpha: a, name: '!!' + tag + 'nhuy' });
  ctx.poly(hearts.map(r => r.map(P)), { color: C('B71C1C'), alpha: a, name: '!!' + tag + 'tam' });
}
function fallingPetals(ctx, x0, y0, w, h, n, seed, tag) {
  const r = seeded(seed), ps = [];
  for (let i = 0; i < n; i++) ps.push(ell(x0 + w * r(), y0 + h * r(), 0.11 + 0.05 * r(), 0.075, TAU * r(), 20));
  ctx.poly(ps, { color: 'FF7043', alpha: 0.9, name: '!!' + tag + 'roi' });
}

function gradCap(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, C = k => mono ? col : k, ang = D(-14);
  const c = Math.cos(ang), d = Math.sin(ang), at = t => [-0.1 + t * c, 0.66 + t * d];
  ctx.poly(rotRect(-0.1, 0.66, 1.3, 0.22, ang).map(P), { color: C('FFF8E7'), alpha: a, lineColor: C('C9A227'), lineW: 1.2, lineAlpha: a, name: '!!' + tag + 'bang' });
  ctx.poly([ell(...at(0.65), 0.045, 0.11, ang, 20), ell(...at(-0.65), 0.045, 0.11, ang, 20)].map(r => r.map(P)), { color: C('EFE2C0'), alpha: a, lineColor: C('C9A227'), lineW: 1, lineAlpha: a, name: '!!' + tag + 'bang2' });
  const [rx, ry] = at(0.05);
  ctx.poly([rotRect(rx, ry, 0.13, 0.26, ang), [[rx - 0.03, ry + 0.1], [rx - 0.12, ry + 0.38], [rx - 0.02, ry + 0.33], [rx + 0.03, ry + 0.4], [rx + 0.04, ry + 0.1]]].map(r => r.map(P)), { color: C('C62828'), alpha: a, name: '!!' + tag + 'no' });
  const skull = [[-0.5, -0.12], [-0.5, 0.26]].concat(quad([-0.5, 0.26], [0, 0.48], [0.5, 0.26], 14)).concat([[0.5, -0.12]]);
  ctx.poly(skull.map(P), { color: C('141B33'), alpha: a, name: '!!' + tag + 'mu' });
  ctx.poly([[-1.0, -0.3], [0, 0.08], [1.0, -0.3], [1.0, -0.23], [0, 0.15], [-1.0, -0.23]].map(P), { color: C('0B1022'), alpha: a, name: '!!' + tag + 'day' });
  ctx.poly([[-1.0, -0.3], [0, -0.68], [1.0, -0.3], [0, 0.08]].map(P), { color: C('263159'), alpha: a, lineColor: C('3B4A80'), lineW: 1, lineAlpha: a, name: '!!' + tag + 'mat' });
  ctx.poly(circle(0, -0.3, 0.05, 14).map(P), { color: C('F2B705'), alpha: a, name: '!!' + tag + 'nut' });
  ctx.poly([[0, -0.3], [0.7, -0.33], [0.72, 0.12]].map(P), { closed: false, lineColor: C('F2B705'), lineW: Math.max(1, 2.4 * s), lineAlpha: a, name: '!!' + tag + 'day-tua' });
  ctx.poly([[[0.67, 0.1], [0.77, 0.1], [0.83, 0.52], [0.61, 0.52]], rect(0.65, 0.08, 0.14, 0.07)].map(r => r.map(P)), { color: C('F2B705'), alpha: a, name: '!!' + tag + 'tua' });
}

function pencil(ctx, x, y, len, w, ang, tag) {           // đầu chì ở (x, y), thân hướng theo ang
  const c = Math.cos(ang), d = Math.sin(ang), at = t => [x + t * c, y + t * d], nx = -d, ny = c;
  const side = (p, k) => [p[0] + nx * k, p[1] + ny * k], tipL = w * 1.7, h = w / 2;
  ctx.poly([at(0), side(at(tipL), h), side(at(tipL), -h)], { color: 'F3D2A2', name: '!!' + tag + 'go' });
  ctx.poly([at(0), side(at(tipL * 0.38), h * 0.38), side(at(tipL * 0.38), -h * 0.38)], { color: '37474F', name: '!!' + tag + 'chi' });
  ctx.poly([side(at(tipL), h), side(at(len - w * 1.3), h), side(at(len - w * 1.3), -h), side(at(tipL), -h)], { color: 'F9C80E', name: '!!' + tag + 'than' });
  ctx.poly([side(at(tipL), h * 0.33), side(at(len - w * 1.3), h * 0.33), side(at(len - w * 1.3), -h * 0.33), side(at(tipL), -h * 0.33)], { color: 'E0A800', alpha: 0.6, name: '!!' + tag + 'canh' });
  ctx.poly([side(at(len - w * 1.3), h), side(at(len - w * 0.75), h), side(at(len - w * 0.75), -h), side(at(len - w * 1.3), -h)], { color: 'B0BEC5', name: '!!' + tag + 'dai' });
  ctx.poly([side(at(len - w * 0.75), h), side(at(len), h * 0.9), side(at(len), -h * 0.9), side(at(len - w * 0.75), -h)], { color: 'F48FB1', name: '!!' + tag + 'tay' });
}
function notebookGrid(ctx, a, xm, tag) {               // vở ô ly: ô vuông 0,4 inch, mỗi ô chia 4 dòng ly
  const thin = [], thick = [];
  for (let k = 1; k * 0.1 < SH; k++) (k % 4 ? thin : thick).push([[0, k * 0.1], [SW, k * 0.1]]);
  for (let x = xm + 0.4; x < SW; x += 0.4) thick.push([[x, 0], [x, SH]]);
  ctx.poly(thin, { closed: false, lineColor: '8E7CC3', lineW: 0.5, lineAlpha: a * 0.55, name: '!!' + tag + 'ly' });
  ctx.poly(thick, { closed: false, lineColor: '7E57C2', lineW: 0.9, lineAlpha: a, name: '!!' + tag + 'o' });
  ctx.poly([[[xm, 0], [xm, SH]]], { closed: false, lineColor: 'E53935', lineW: 1.4, lineAlpha: 0.8, name: '!!' + tag + 'le' });
}
function boardFrame(ctx, w, tag) {
  ctx.box(w / 2, w / 2, SW - w, SH - w, { lineColor: '8B5A2B', lineW: w * 72, name: '!!' + tag + 'khung' });
  ctx.box(w, w, SW - 2 * w, SH - 2 * w, { lineColor: '5D3A1A', lineW: 1.5, lineAlpha: 0.8, name: '!!' + tag + 'khung2' });
  ctx.box(w * 0.25, w * 0.25, SW - w * 0.5, SH - w * 0.5, { lineColor: 'B07A45', lineW: 1, lineAlpha: 0.7, name: '!!' + tag + 'khung3' });
}
const CHALK = { font: 'Segoe Print', align: 'l', anchor: 'm' };

Object.assign(MOTIFS, {
  'khai-giang': { pack: 'truong-hoc', name: 'Khai giảng · Trống trường', short: 'Trống trường',
    desc: 'Chiếc trống trường đỏ đai vàng, dùi trống bắt chéo và chùm bóng bay trên nền trời xanh — lễ khai giảng, ngày hội đến trường, sự kiện đầu năm học.',
    sw: ['0F3D6E', '1E88E5', 'C62828', 'FFD54F'], ownInv: true,
    palette: palW({ bg: 'FFF9F0', bg2: 'FDF2E3', ink: '2A1A12', body: '4D3426', muted: '7C6455', accent: 'C62828', accent2: '1E88E5', accent3: 'F2B705',
      card_line: 'F1D9C4', inv: ['0F3D6E', '1565A8', '1E88E5'], inv_ink: 'FFFFFF', inv_body: 'DCEBFA', inv_accent: 'FFD54F' }),
    draw: emblemDraw(schoolDrum, {
      inv: (ctx, th, kind) => {
        if (kind === 'closing') { balloon(ctx, 1.2, 1.1, 0.42, BALLOON_COLS[0], 'kg1-'); balloon(ctx, 1.9, 1.6, 0.34, BALLOON_COLS[1], 'kg2-'); balloon(ctx, SW - 1.3, 1.2, 0.42, BALLOON_COLS[2], 'kg3-'); balloon(ctx, SW - 2.0, 1.7, 0.32, BALLOON_COLS[3], 'kg4-'); }
        else if (kind === 'cover') { balloon(ctx, SW - 0.8, 1.05, 0.45, BALLOON_COLS[0], 'kg1-'); balloon(ctx, SW - 1.55, 0.75, 0.36, BALLOON_COLS[1], 'kg2-', -0.12); balloon(ctx, SW - 5.35, 0.95, 0.38, BALLOON_COLS[3], 'kg3-'); balloon(ctx, SW - 4.8, 0.6, 0.3, BALLOON_COLS[4], 'kg4-', -0.1); }
        else balloon(ctx, SW - 0.75, 1.0, 0.36, BALLOON_COLS[0], 'kg1-');
      },
      page: ctx => { balloon(ctx, SW - 0.55, 0.42, 0.17, BALLOON_COLS[0], 'kg1-', 0.05); balloon(ctx, SW - 0.95, 0.5, 0.14, BALLOON_COLS[1], 'kg2-', -0.04); } }) },
  'hoa-phuong': { pack: 'truong-hoc', name: 'Hoa phượng · Mùa chia tay', short: 'Hoa phượng',
    desc: 'Cành phượng đỏ rực với lá kép lông chim và cánh hoa rơi trên nền xanh ngọc — lễ tổng kết, chia tay cuối cấp, kỷ niệm tuổi học trò, mùa hè.',
    sw: ['0E3B3A', '1F6360', 'E53935', 'FFE0B2'], ownInv: true,
    palette: palW({ bg: 'FFF8F2', bg2: 'FCEFE6', ink: '2B1A14', body: '4E3329', muted: '7E6257', accent: 'D32F2F', accent2: '2E7D32', accent3: 'F57C00',
      card_line: 'F2D6C8', inv: ['0E3B3A', '17504D', '1F6360'], inv_ink: 'FFF8F0', inv_body: 'D5E8E2', inv_accent: 'FF8A65' }),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        if (kind === 'closing') { phuongBranch(ctx, SW + 0.05, -0.1, 1.0, -1, 'ph1-'); phuongBranch(ctx, -0.05, SH - 2.6, 0.85, 1, 'ph2-'); fallingPetals(ctx, SW / 2 - 2, SH - 1.4, 4, 1.0, 8, 5, 'ph-'); }
        else {
          const big = kind === 'cover';
          phuongBranch(ctx, SW + 0.1, -0.15, big ? 1.45 : 1.15, -1, 'ph1-', false, null, 1, D(32));
          fallingPetals(ctx, SW - 4.4, SH - 1.9, 3.9, 1.5, big ? 10 : 7, 3 + idx, 'ph-');
          info.x1 = Math.min(info.x1, SW - (big ? 4.6 : 3.7));
        }
      } else phuongBranch(ctx, SW + 0.05, 0.02, 0.42, -1, 'ph-');
    } },
  'tot-nghiep': { pack: 'truong-hoc', name: 'Tốt nghiệp · Mũ cử nhân', short: 'Mũ cử nhân',
    desc: 'Mũ cử nhân tua vàng, cuộn bằng thắt nơ đỏ và giấy kim tuyến trên nền xanh than — lễ tốt nghiệp, trao bằng, bảo vệ khóa luận, vinh danh.',
    sw: ['10162E', '24305E', 'F2C94C', 'C62828'], ownInv: true,
    palette: palW({ bg: 'F7F6F1', bg2: 'EFEEE6', ink: '141B33', body: '363E5C', muted: '676E88', accent: '1F3A93', accent2: 'B8860B', accent3: 'C62828',
      card_line: 'DEDCD0', inv: ['10162E', '1A2340', '24305E'], inv_ink: 'FFFDF5', inv_body: 'D9DDEB', inv_accent: 'F2C94C' }),
    draw: emblemDraw(gradCap, {
      inv: (ctx, th, kind) => confetti(ctx, kind === 'closing' ? 0.6 : SW - 6.2, 0.3, kind === 'closing' ? SW - 1.2 : 5.9, kind === 'closing' ? 1.6 : 2.0, kind === 'closing' ? 40 : 26, 9, ['F2C94C', 'FFFFFF', 'E57373'], 'tn-', 0.85),
      page: ctx => confetti(ctx, SW - 1.6, 0.15, 1.4, 0.45, 9, 4, ['C9A227', '1F3A93', 'C62828'], 'tn-', 0.8) }) },
  'vo-o-ly': { pack: 'truong-hoc', name: 'Vở ô ly · Tiểu học', short: 'Vở ô ly',
    desc: 'Trang vở ô ly kẻ tím có lề đỏ, gáy lò xo và cây bút chì, chữ xanh như mực học trò — tiểu học, luyện chữ, bài giảng lớp 1 đến lớp 5, phụ huynh.',
    sw: ['FFFDF6', '8E7CC3', 'E53935', '1E2A78'], ownInv: true,
    palette: palW({ bg: 'FFFEF8', bg2: 'FFFDF4', ink: '1E2A78', body: '2F3A80', muted: '6870A8', accent: 'D32F2F', accent2: '7E57C2', accent3: 'F9A825',
      card_line: 'D9D2F0', inv: ['FFFDF6', 'FBF7EB'], inv_ink: '1E2A78', inv_body: '3A4590', inv_accent: 'D32F2F' }),
    draw(ctx, th, inv, idx, kind, info) {
      const xm = 1.05;
      notebookGrid(ctx, inv ? 0.45 : 0.3, xm, 'ol-');
      info.x0 = Math.max(info.x0, xm + 0.35);
      if (inv) {
        const rings = [], holes = [];
        for (let y = 0.4; y < SH - 0.2; y += 0.48) { holes.push(circle(0.42, y, 0.075, 16)); rings.push(quad([0.06, y + 0.04], [0.2, y - 0.16], [0.44, y - 0.02], 10)); }
        ctx.poly(holes, { color: 'CFC8B8', name: '!!ol-lo' });
        ctx.poly(rings, { closed: false, lineColor: '6B6B6B', lineW: 3, name: '!!ol-xoan' });
        if (kind !== 'closing') { pencil(ctx, SW - 3.6, SH - 0.75, 3.1, 0.26, D(-12), 'ol-but-'); info.y1 = Math.min(info.y1, SH - 1.4); }
      }
    } },
  'bang-den': { pack: 'truong-hoc', name: 'Bảng đen · Phấn trắng', short: 'Bảng đen',
    desc: 'Cả bộ slide như tấm bảng xanh khung gỗ, chữ phấn trắng, phấn màu và công thức viết tay — lớp học, ôn tập, toán, khoa học tự nhiên.',
    sw: ['1F3B2D', '264D3B', 'F4F4EC', 'F6E58D'], ownInv: true,
    palette: palW({ bg: '264D3B', bg2: '23473A', ink: 'F4F4EC', body: 'DCE3D6', muted: 'A9B8AA', accent: 'F6E58D', accent2: 'F8A5C2', accent3: '9AD0EC',
      card: '2F5A47', card_line: '4A7462', inv: ['1F3B2D', '24443A'], inv_ink: 'F5F5EE', inv_body: 'D8E0D5', inv_accent: 'F6E58D' }),
    draw(ctx, th, inv, idx, kind, info) {
      const w = inv ? 0.26 : 0.16;
      ctx.poly([ell(SW * 0.3, SH * 0.35, 2.6, 0.9, D(-8), 40), ell(SW * 0.72, SH * 0.7, 2.2, 0.7, D(6), 40)], { color: 'FFFFFF', alpha: 0.035, name: '!!bd-vet' });
      boardFrame(ctx, w, 'bd-');
      ctx.box(SW * 0.55, SH - w - 0.16, SW * 0.4, 0.16, { color: '6D4422', name: '!!bd-mang' });
      ctx.poly([rotRect(SW * 0.62, SH - w - 0.21, 0.42, 0.09, D(-4)), rotRect(SW * 0.69, SH - w - 0.2, 0.3, 0.09, D(3))], { color: 'FFFFFF', alpha: 0.9, name: '!!bd-phan' });
      ctx.poly([rotRect(SW * 0.74, SH - w - 0.2, 0.34, 0.09, D(-2))], { color: 'F6E58D', name: '!!bd-phan2' });
      ctx.poly([rotRect(SW * 0.79, SH - w - 0.2, 0.26, 0.09, D(5))], { color: 'F8A5C2', name: '!!bd-phan3' });
      ctx.box(SW * 0.84, SH - w - 0.3, 0.62, 0.2, { color: 'C8B89A', name: '!!bd-lau' });
      ctx.box(SW * 0.84, SH - w - 0.14, 0.62, 0.05, { color: '3E3E3E', name: '!!bd-lau2' });
      Object.assign(info, { x0: Math.max(info.x0, w + 0.55), y0: Math.max(info.y0, w + 0.4), x1: Math.min(info.x1, SW - w - 0.55), y1: Math.min(info.y1, SH - w - 0.55) });
      if (inv && kind !== 'closing') {
        const x = SW - 4.4;
        ctx.text(x, 0.75, 3.8, 0.8, 'a² + b² = c²', Object.assign({ size: 30, color: 'E8EEE4', name: '!!bd-ct1' }, CHALK));
        ctx.text(x + 0.4, 1.7, 3.4, 0.7, 'S = π · r²', Object.assign({ size: 24, color: 'F6E58D', name: '!!bd-ct2' }, CHALK));
        ctx.text(x + 0.1, 2.55, 3.6, 0.7, 'H₂O  →  H₂ + O₂', Object.assign({ size: 22, color: '9AD0EC', name: '!!bd-ct3' }, CHALK));
        ctx.poly(quad([x + 0.1, 1.48], [x + 1.8, 1.62], [x + 3.4, 1.45], 16), { closed: false, lineColor: 'E8EEE4', lineW: 2, lineAlpha: 0.7, name: '!!bd-gach' });
        ctx.poly(star(SW - 1.4, 4.3, 0.5, 5, 0.42), { closed: true, lineColor: 'F8A5C2', lineW: 2.5, lineAlpha: 0.85, name: '!!bd-sao' });
        const sun = [circle(SW - 3.3, 4.6, 0.32, 24)]; for (let i = 0; i < 10; i++) { const t = TAU * i / 10; sun.push([[SW - 3.3 + 0.45 * Math.cos(t), 4.6 + 0.45 * Math.sin(t)], [SW - 3.3 + 0.65 * Math.cos(t), 4.6 + 0.65 * Math.sin(t)]]); }
        ctx.poly(sun, { closed: false, lineColor: 'F6E58D', lineW: 2, lineAlpha: 0.75, name: '!!bd-mattroi' });
        info.x1 = Math.min(info.x1, x - 0.4);
      }
    } },
});

// ============================================================ Gói 2. Di sản · Kiến trúc Việt
PACKS.push({ id: 'di-san', name: 'Di sản · Kiến trúc Việt', desc: 'Khuê Văn Các, chùa Một Cột, mái đình ngói vảy cá, nón lá' });

// mái cong kiểu đình chùa: đáy mái ở y, nửa rộng w, cao h, đầu đao vểnh lên k
function curvedRoof(cx, y, w, h, k) {
  return quad([cx - w - k * 0.6, y - k], [cx - w * 0.78, y + h * 0.1], [cx - w * 0.45, y], 10)
    .concat(quad([cx + w * 0.45, y], [cx + w * 0.78, y + h * 0.1], [cx + w + k * 0.6, y - k], 10))
    .concat(quad([cx + w + k * 0.6, y - k], [cx + w * 0.62, y - h * 0.5], [cx + w * 0.5, y - h], 10))
    .concat(quad([cx - w * 0.5, y - h], [cx - w * 0.62, y - h * 0.5], [cx - w - k * 0.6, y - k], 10));
}
function ridgeCurls(cx, y, w, h) { return [spiral(cx - w * 0.5 - 0.02, y - h - 0.05, 0.06, 1.1, -1, 0, 16), spiral(cx + w * 0.5 + 0.02, y - h - 0.05, 0.06, 1.1, 1, Math.PI, 16)]; }
function khueVanCac(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), lw = Math.max(1, 1.8 * s), F = { color: col, alpha: a * 0.16, lineColor: col, lineW: lw, lineAlpha: a }, R = { color: col, alpha: a * 0.5, lineColor: col, lineW: lw, lineAlpha: a };
  ctx.poly(mapR([rect(-0.84, 0.86, 1.68, 0.08), rect(-0.66, 0.22, 0.26, 0.64), rect(0.4, 0.22, 0.26, 0.64), rect(-0.7, 0.16, 0.34, 0.07), rect(0.36, 0.16, 0.34, 0.07)], P), Object.assign({ name: '!!' + tag + 'tru' }, F));
  ctx.poly(mapR([[[-0.6, 0.4], [-0.46, 0.4]], [[0.46, 0.4], [0.6, 0.4]], [[-0.6, 0.62], [-0.46, 0.62]], [[0.46, 0.62], [0.6, 0.62]]], P), { closed: false, lineColor: col, lineW: 1, lineAlpha: a * 0.7, name: '!!' + tag + 'gach' });
  ctx.poly(curvedRoof(0, 0.17, 0.8, 0.19, 0.12).map(P), Object.assign({ name: '!!' + tag + 'mai1' }, R));
  ctx.poly(rect(-0.42, -0.45, 0.84, 0.47).map(P), Object.assign({ name: '!!' + tag + 'gac' }, F));
  const lat = [[[-0.3, -0.45], [-0.3, -0.02]], [[0.3, -0.45], [0.3, -0.02]], [[-0.42, -0.09], [0.42, -0.09]]];
  for (let x = -0.38; x <= 0.39; x += 0.08) lat.push([[x, -0.09], [x, -0.02]]);
  ctx.poly(mapR(lat, P), { closed: false, lineColor: col, lineW: 1, lineAlpha: a * 0.8, name: '!!' + tag + 'lan' });
  const win = [circle(0, -0.27, 0.15, 36)]; for (let i = 0; i < 16; i++) { const t = TAU * i / 16; win.push([[0.045 * Math.cos(t), -0.27 + 0.045 * Math.sin(t)], [0.14 * Math.cos(t), -0.27 + 0.14 * Math.sin(t)]]); }
  ctx.poly(mapR(win, P), { closed: false, lineColor: col, lineW: Math.max(1, 1.3 * s), lineAlpha: a, name: '!!' + tag + 'cuaso' });
  ctx.poly(circle(0, -0.27, 0.04, 14).map(P), { color: col, alpha: a, name: '!!' + tag + 'tam' });
  ctx.poly(curvedRoof(0, -0.43, 0.64, 0.25, 0.13).map(P), Object.assign({ name: '!!' + tag + 'mai2' }, R));
  ctx.poly(mapR(ridgeCurls(0, -0.43, 0.64, 0.25), P), { closed: false, lineColor: col, lineW: lw, lineAlpha: a, name: '!!' + tag + 'dau' });
  ctx.poly(circle(0, -0.74, 0.04, 14).map(P), { color: col, alpha: a, name: '!!' + tag + 'ngoc' });
}
function chuaMotCot(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), lw = Math.max(1, 1.8 * s), F = { color: col, alpha: a * 0.16, lineColor: col, lineW: lw, lineAlpha: a }, R = { color: col, alpha: a * 0.5, lineColor: col, lineW: lw, lineAlpha: a };
  ctx.poly(rect(-0.98, 0.74, 1.96, 0.2).map(P), { color: col, alpha: a * 0.14, name: '!!' + tag + 'ho' });
  const waves = [];
  [[-0.7, 0.82], [-0.2, 0.88], [0.35, 0.81], [0.7, 0.89]].forEach(([x, y]) => { const p = []; for (let i = 0; i <= 12; i++) { const u = i / 12; p.push([x + 0.28 * u, y + 0.015 * Math.sin(u * TAU * 1.5)]); } waves.push(p); });
  ctx.poly(mapR(waves, P), { closed: false, lineColor: col, lineW: 1, lineAlpha: a * 0.7, name: '!!' + tag + 'song' });
  ctx.poly(mapR([ell(-0.62, 0.79, 0.15, 0.04, 0, 24), ell(0.6, 0.85, 0.12, 0.035, 0, 24)], P), { color: col, alpha: a * 0.55, name: '!!' + tag + 'lasen' });
  ctx.poly(rect(-0.085, 0.13, 0.17, 0.64).map(P), Object.assign({ name: '!!' + tag + 'cot' }, F));
  ctx.poly(mapR([[[0, 0.44], [-0.5, 0.15]], [[0, 0.44], [0.5, 0.15]], [[0, 0.3], [-0.3, 0.15]], [[0, 0.3], [0.3, 0.15]]], P), { closed: false, lineColor: col, lineW: lw, lineAlpha: a, name: '!!' + tag + 'xa' });
  ctx.poly(rect(-0.56, 0.09, 1.12, 0.07).map(P), Object.assign({ name: '!!' + tag + 'san' }, F));
  ctx.poly(rect(-0.36, -0.22, 0.72, 0.31).map(P), Object.assign({ name: '!!' + tag + 'tuong' }, F));
  const rail = [[[-0.5, 0.0], [0.5, 0.0]]]; for (let x = -0.48; x <= 0.49; x += 0.12) rail.push([[x, 0.0], [x, 0.09]]);
  for (let x = -0.27; x <= 0.28; x += 0.09) rail.push([[x, -0.2], [x, -0.03]]);
  ctx.poly(mapR(rail, P), { closed: false, lineColor: col, lineW: 1, lineAlpha: a * 0.85, name: '!!' + tag + 'lan' });
  ctx.poly(curvedRoof(0, -0.2, 0.62, 0.3, 0.17).map(P), Object.assign({ name: '!!' + tag + 'mai' }, R));
  ctx.poly(mapR([quad([-0.33, -0.52], [-0.22, -0.7], [-0.08, -0.6], 10), quad([0.33, -0.52], [0.22, -0.7], [0.08, -0.6], 10)], P), { closed: false, lineColor: col, lineW: lw, lineAlpha: a, name: '!!' + tag + 'rong' });
  ctx.poly(circle(0, -0.62, 0.05, 16).map(P), { color: col, alpha: a, name: '!!' + tag + 'trang' });
}
// dải mái đình ngói vảy cá, hai đầu đao vểnh, cao H ở giữa
function roofBand(ctx, H, col, a, tag) {
  const edge = 1.7 * H / 1.2, eave = x => { const d = Math.max(0, Math.abs(x - SW / 2) - (SW / 2 - edge)) / edge; return H - H * 0.5 * d * d; };
  const r = Math.max(0.07, H * 0.11), scales = [], bw = Math.max(0.05, H * 0.11);
  for (let k = 0, y = -r * 0.4; y < H; k++, y += r * 0.82) for (let x = (k % 2 ? r : 0); x < SW + r; x += 2 * r) if (y + r * 0.85 < eave(x)) scales.push(arc(x, y, r, 0, Math.PI, 7));
  ctx.poly(scales, { color: col, alpha: a * 0.28, lineColor: col, lineW: 0.75, lineAlpha: a * 0.8, name: '!!' + tag + 'ngoi' });
  const top = [], bot = [];
  for (let i = 0; i <= 60; i++) { const x = SW * i / 60; top.push([x, eave(x)]); bot.unshift([x, eave(x) + bw]); }
  ctx.poly(top.concat(bot), { color: col, alpha: a, name: '!!' + tag + 'diem' });
  const tri = [];
  for (let x = 0.35; x < SW - 0.2; x += 0.3) { const y = eave(x) + bw; tri.push([[x - 0.07, y], [x + 0.07, y], [x, y + bw * 1.1]]); }
  ctx.poly(tri, { color: col, alpha: a * 0.6, name: '!!' + tag + 'rua' });
  const horns = [quad([edge * 0.9, eave(edge * 0.9) + bw * 0.5], [edge * 0.25, eave(edge * 0.25)], [H * 0.12, Math.max(0.05, eave(0) - H * 0.55)], 14),
    quad([SW - edge * 0.9, eave(SW - edge * 0.9) + bw * 0.5], [SW - edge * 0.25, eave(SW - edge * 0.25)], [SW - H * 0.12, Math.max(0.05, eave(SW) - H * 0.55)], 14)];
  ctx.poly(horns, { closed: false, lineColor: col, lineW: Math.max(2, H * 9), lineAlpha: a, name: '!!' + tag + 'dao' });
  const ty = Math.max(0.05, eave(0) - H * 0.55), rr = Math.max(0.06, H * 0.17);
  ctx.poly([spiral(H * 0.12 + rr * 0.9, ty + rr * 0.2, rr, 1.2, 1, Math.PI, 18), spiral(SW - H * 0.12 - rr * 0.9, ty + rr * 0.2, rr, 1.2, -1, 0, 18)], { closed: false, lineColor: col, lineW: Math.max(1.5, H * 5), lineAlpha: a, name: '!!' + tag + 'cuon' });
  return H + bw * 2.2;
}
function nonLa(ctx, cx, cy, s, col, a, c2, th, tag) {
  const mono = a < 0.3, C = k => mono ? col : k, rot = D(-9), c = Math.cos(rot), d = Math.sin(rot);
  const P = ([x, y]) => [cx + (x * c - y * d) * s, cy + (x * d + y * c) * s];
  const w = 1.0, base = 0.22, apex = -0.72, ry = 0.17;
  const lower = Array.from({ length: 25 }, (_, i) => { const q = Math.PI - Math.PI * i / 24; return [w * Math.cos(q), base + ry * Math.sin(q)]; });
  const hat = [[0, apex]].concat(quad([0, apex], [-w * 0.56, apex + 0.42], [-w, base], 12).slice(1), lower, quad([w, base], [w * 0.56, apex + 0.42], [0, apex], 12).slice(1));
  ctx.poly(quad([-0.52, base + 0.1], [-0.05, 1.12], [0.5, base + 0.1], 18).map(P), { closed: false, lineColor: C('D81B60'), lineW: Math.max(1.5, 4 * s), lineAlpha: a, name: '!!' + tag + 'quai' });
  ctx.poly(hat.map(P), { color: C('EAD49B'), alpha: mono ? a * 0.6 : a, lineColor: C('8A6A2F'), lineW: 1.2, lineAlpha: a, name: '!!' + tag + 'non' });
  if (!mono) {
    const shade = [[0, apex]].concat(lower.slice(12), quad([w, base], [w * 0.56, apex + 0.42], [0, apex], 12).slice(1));
    ctx.poly(shade.map(P), { color: 'B8934A', alpha: a * 0.45, name: '!!' + tag + 'bong' });
  }
  const ribs = [];
  [0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92].forEach(f => { const y = apex + (base - apex) * f; ribs.push(Array.from({ length: 17 }, (_, i) => { const q = Math.PI * i / 16; return [w * f * Math.cos(q), y + ry * f * Math.sin(q)]; })); });
  ctx.poly(mapR(ribs, P), { closed: false, lineColor: C('8A6A2F'), lineW: 0.9, lineAlpha: a * 0.75, name: '!!' + tag + 'vanh' });
  ctx.poly(lower.map(P), { closed: false, lineColor: C('7A5A22'), lineW: Math.max(1.2, 3 * s), lineAlpha: a, name: '!!' + tag + 'vien' });
}

Object.assign(MOTIFS, {
  'khue-van-cac': { pack: 'di-san', name: 'Văn Miếu · Khuê Văn Các', short: 'Khuê Văn Các',
    desc: 'Khuê Văn Các nét vàng kim với cửa sổ tròn tỏa tia, hai tầng mái cong trên nền đỏ son — khuyến học, ngày Nhà giáo, truyền thống hiếu học, Hà Nội.',
    sw: ['4A0E0E', '7A1F1F', 'E8C26A', 'FBF4E4'], ownInv: true,
    palette: palW({ bg: 'FBF6EA', bg2: 'F6EEDC', ink: '3A1D10', body: '5A3A2A', muted: '84685A', accent: '8E2A1F', accent2: 'B8892E', accent3: '2F5D50',
      card: 'FFFCF5', card_line: 'EAD8B4', inv: ['4A0E0E', '6B1717', '7A1F1F'], inv_ink: 'FFF6E0', inv_body: 'F1DCB2', inv_accent: 'E8C26A' }),
    draw: emblemDraw(khueVanCac, { inv: (ctx, th) => ctx.box(0.45, 0.45, SW - 0.9, SH - 0.9, { lineColor: th.inv_accent, lineW: 0.75, lineAlpha: 0.4, name: '!!kvc-khung' }),
      page: (ctx, th) => ctx.box(0, 0, SW, 0.07, { color: th.accent, name: '!!kvc-bang' }) }) },
  'chua-mot-cot': { pack: 'di-san', name: 'Chùa Một Cột · Hà Nội', short: 'Chùa Một Cột',
    desc: 'Chùa Một Cột nét mảnh trên hồ sen vuông, mái cong đầu đao, lưỡng long chầu nguyệt; tông chàm và vàng nhạt — Hà Nội, văn hóa, di tích, du lịch.',
    sw: ['16243F', '24406B', 'E9D8A6', 'F6F2E8'], ownInv: true,
    palette: palW({ bg: 'F6F3EA', bg2: 'EEEADF', ink: '16243F', body: '364763', muted: '67748C', accent: '24406B', accent2: 'B08D3C', accent3: '9C3D27',
      card: 'FFFDF7', card_line: 'DDD7C6', inv: ['121D33', '1C3254', '24406B'], inv_ink: 'F8F4E8', inv_body: 'D5DCE8', inv_accent: 'E9D8A6' }),
    draw: emblemDraw(chuaMotCot, { page: (ctx, th) => ctx.box(0, SH - 0.07, SW, 0.07, { color: th.accent, name: '!!cmc-bang' }) }) },
  'mai-dinh': { pack: 'di-san', name: 'Mái đình · Ngói vảy cá', short: 'Mái đình',
    desc: 'Dải mái đình lợp ngói vảy cá, diềm mái và hai đầu đao cong vút chạy ngang đầu trang — đình làng, lễ hội, văn hóa làng xã, kiến trúc cổ.',
    sw: ['3B1D12', '6E3520', 'B5543A', 'E6B85C'], ownInv: true,
    palette: palW({ bg: 'F8F1E5', bg2: 'F2E9DA', ink: '3B2416', body: '5A3F2C', muted: '86705C', accent: '9C3D27', accent2: 'C9A227', accent3: '4E6B3A',
      card: 'FFFBF3', card_line: 'E7D5BC', inv: ['3B1D12', '5A2A18', '6E3520'], inv_ink: 'FFF4E2', inv_body: 'EBD3B5', inv_accent: 'E6B85C' }),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const h = roofBand(ctx, kind === 'closing' ? 1.0 : 1.25, th.inv_accent, 0.75, 'md-');
        ctx.box(0.6, SH - 0.42, SW - 1.2, 0.035, { color: th.inv_accent, alpha: 0.6, name: '!!md-nen' });
        info.y0 = Math.max(info.y0, h + 0.3); info.y1 = Math.min(info.y1, SH - 0.65);
      } else { const h = roofBand(ctx, 0.42, th.accent, 0.55, 'md-'); info.y0 = Math.max(info.y0, h + 0.15); }
    } },
  'non-la': { pack: 'di-san', name: 'Nón lá · Hồn Việt', short: 'Nón lá',
    desc: 'Chiếc nón lá màu rơm với các vành nan và quai hồng trên nền xanh lúa non — văn hóa Việt Nam, phụ nữ Việt Nam, du lịch, giới thiệu quê hương.',
    sw: ['1F3D2B', '3B6F4C', 'EAD49B', 'D81B60'], ownInv: true,
    palette: palW({ bg: 'FBF7EE', bg2: 'F5EFE1', ink: '2E2416', body: '4F4330', muted: '7D705B', accent: 'B23A48', accent2: 'B8892E', accent3: '3B6F4C',
      card: 'FFFDF7', card_line: 'E8DCC2', inv: ['1F3D2B', '2E5A3E', '3B6F4C'], inv_ink: 'FFFBEF', inv_body: 'DCE8D2', inv_accent: 'F2D27A' }),
    draw: emblemDraw(nonLa, { ca: 0.14 }) },
});

// ============================================================ Gói 3. Y tế · Sức khỏe
PACKS.push({ id: 'y-te', name: 'Y tế · Sức khỏe', desc: 'Nhịp tim, chuỗi ADN, tế bào, chữ thập y tế xanh' });

function heartPts(cx, cy, s, n = 64) { return Array.from({ length: n }, (_, i) => { const t = TAU * i / n, x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); return [cx + x / 17 * s, cy - (y + 2) / 17 * s]; }); }
const BEAT = [[0, 0], [0.16, 0], [0.2, -0.12], [0.24, 0], [0.31, 0], [0.34, 0.16], [0.39, -1], [0.44, 0.42], [0.48, 0], [0.6, 0], [0.68, -0.22], [0.76, 0], [1, 0]];
function ecg(x0, x1, y, amp, period) { const pts = []; for (let x = x0; x < x1; x += period) BEAT.forEach(([u, v]) => { const xx = x + u * period; if (xx <= x1 + 1e-6) pts.push([xx, y + v * amp]); }); return pts; }
function heartBeat(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, C = k => mono ? col : k;
  ctx.poly(heartPts(0, 0, 0.85).map(P), { color: C('E63950'), alpha: mono ? a * 0.6 : a, lineColor: C('B0173A'), lineW: Math.max(1, 2 * s), lineAlpha: a, name: '!!' + tag + 'tim' });
  if (!mono) ctx.poly(ell(-0.38, -0.32, 0.12, 0.22, D(35), 24).map(P), { color: 'FFFFFF', alpha: 0.35, name: '!!' + tag + 'sang' });
  ctx.poly(ecg(-1.15, 1.15, 0.02, 0.5, 1.15).map(P), { closed: false, lineColor: C('FFFFFF'), lineW: Math.max(1.5, 3.5 * s), lineAlpha: a, name: '!!' + tag + 'nhip' });
}
function helix(ctx, cx, cy, s, col, a, c2, th, tag) {
  const rot = D(22), c = Math.cos(rot), d = Math.sin(rot), P = ([x, y]) => [cx + (x * c - y * d) * s, cy + (x * d + y * c) * s];
  const mono = a < 0.3, k = 3.3, amp = 0.42, front = [[], []], back = [[], []], rungs = [[], [], [], []];
  const sx = (y, ph) => amp * Math.sin(k * y + ph), dz = (y, ph) => Math.cos(k * y + ph);
  [0, Math.PI].forEach((ph, j) => {
    let cur = null, curF = null;
    for (let i = 0; i <= 120; i++) {
      const y = -1 + 2 * i / 120, f = dz(y, ph) > 0;
      if (curF !== f) { cur = []; (f ? front : back)[j].push(cur); if (i) cur.push([sx(y - 2 / 120, ph), y - 2 / 120]); curF = f; }
      cur.push([sx(y, ph), y]);
    }
  });
  for (let i = 0; i < 18; i++) { const y = -0.94 + i * 0.11; rungs[i % 4].push([[sx(y, 0), y], [sx(y, Math.PI), y]]); }
  const cols = mono ? [col, col, col, col] : ['EF476F', 'FFD166', '06D6A0', '4CC9F0'];
  const lw = Math.max(2, 7 * s), strand = mono ? col : (th.inv_ink || 'FFFFFF');
  [0, 1].forEach(j => ctx.poly(back[j].map(r => r.map(P)), { closed: false, lineColor: strand, lineW: lw, lineAlpha: a * 0.45, name: '!!' + tag + 'sau' + j }));
  rungs.forEach((g, i) => ctx.poly(g.map(r => r.map(P)), { closed: false, lineColor: cols[i], lineW: Math.max(1.5, 4 * s), lineAlpha: a * 0.9, name: '!!' + tag + 'bac' + i }));
  [0, 1].forEach(j => ctx.poly(front[j].map(r => r.map(P)), { closed: false, lineColor: j ? strand : (mono ? col : '7FDBFF'), lineW: lw, lineAlpha: a, name: '!!' + tag + 'truoc' + j }));
}
function blob(cx, cy, r, seed, n = 40, wob = 0.08) { const rr = seeded(seed), k = [rr(), rr(), rr()].map(v => (v - 0.5) * 2 * wob); return Array.from({ length: n }, (_, i) => { const t = TAU * i / n, q = r * (1 + k[0] * Math.sin(2 * t) + k[1] * Math.cos(3 * t + 1) + k[2] * Math.sin(5 * t)); return [cx + q * Math.cos(t), cy + q * Math.sin(t)]; }); }
function cells(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, C = k => mono ? col : k;
  const small = [[0.66, -0.62, 0.2, 3], [0.74, 0.58, 0.16, 5], [-0.78, -0.72, 0.12, 8], [-0.8, 0.72, 0.1, 2]];
  ctx.poly(small.map(([x, y, r, sd]) => blob(x, y, r, sd).map(P)), { color: C('80CBC4'), alpha: a * 0.45, lineColor: C('26A69A'), lineW: Math.max(1, 1.6 * s), lineAlpha: a, name: '!!' + tag + 'nho' });
  ctx.poly(small.map(([x, y, r]) => circle(x + r * 0.15, y - r * 0.1, r * 0.33, 16).map(P)), { color: C('7E57C2'), alpha: a * 0.8, name: '!!' + tag + 'nho-nhan' });
  ctx.poly(blob(-0.08, 0.05, 0.66, 11, 56).map(P), { color: C('B2DFDB'), alpha: a * 0.55, lineColor: C('26A69A'), lineW: Math.max(1.5, 4 * s), lineAlpha: a, name: '!!' + tag + 'mang' });
  const er = []; [0.3, 0.38, 0.46].forEach(r => er.push(arc(-0.02, 0.0, r, D(110), D(250), 20).map(([x, y], i) => [x + 0.012 * Math.sin(i * 1.4), y])));
  ctx.poly(mapR(er, P), { closed: false, lineColor: C('4DB6AC'), lineW: 1.2, lineAlpha: a * 0.8, name: '!!' + tag + 'luoi' });
  ctx.poly(circle(0.02, -0.02, 0.24, 40).map(P), { color: C('9575CD'), alpha: a * 0.85, lineColor: C('5E35B1'), lineW: 1.2, lineAlpha: a, name: '!!' + tag + 'nhan' });
  ctx.poly(circle(0.08, -0.07, 0.08, 20).map(P), { color: C('4527A0'), alpha: a, name: '!!' + tag + 'hachnhan' });
  const mito = [[0.36, 0.3, D(30)], [-0.42, 0.25, D(-50)], [0.3, -0.38, D(70)]];
  ctx.poly(mito.map(([x, y, g]) => ell(x, y, 0.12, 0.055, g, 24).map(P)), { color: C('FF8A65'), alpha: a, lineColor: C('E64A19'), lineW: 1, lineAlpha: a, name: '!!' + tag + 'ti' });
  ctx.poly(mito.map(([x, y, g]) => Array.from({ length: 7 }, (_, i) => { const u = -0.09 + 0.03 * i, v = (i % 2 ? 0.03 : -0.03); return [x + u * Math.cos(g) - v * Math.sin(g), y + u * Math.sin(g) + v * Math.cos(g)]; }).map(P)), { closed: false, lineColor: C('BF360C'), lineW: 0.8, lineAlpha: a, name: '!!' + tag + 'ti2' });
  const ves = []; [[-0.35, -0.32, 0.04], [0.48, -0.05, 0.035], [-0.2, 0.48, 0.045], [0.12, 0.5, 0.03], [-0.52, -0.05, 0.03]].forEach(([x, y, r]) => ves.push(circle(x, y, r, 12)));
  ctx.poly(mapR(ves, P), { color: C('FFD54F'), alpha: a, name: '!!' + tag + 'bong' });
}
function capsule(cx, cy, len, w, ang) {
  const r = w / 2, L = len / 2 - r, half1 = arc(-L, 0, r, D(90), D(270), 12).concat([[0, -r], [0, r]]), half2 = arc(L, 0, r, D(-90), D(90), 12).concat([[0, r], [0, -r]]);
  return [half1, half2].map(h => place(h, cx, cy, 1, ang));
}
function plusShape(cx, cy, L, W) { return [[cx - W, cy - L], [cx + W, cy - L], [cx + W, cy - W], [cx + L, cy - W], [cx + L, cy + W], [cx + W, cy + W], [cx + W, cy + L], [cx - W, cy + L], [cx - W, cy + W], [cx - L, cy + W], [cx - L, cy - W], [cx - W, cy - W]]; }
function medCross(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, C = k => mono ? col : k;
  ctx.poly(circle(0, 0, 0.9, 64).map(P), { color: C('FFFFFF'), alpha: mono ? a * 0.3 : a * 0.12, lineColor: C('0FA3A3'), lineW: Math.max(1.5, 4 * s), lineAlpha: a, name: '!!' + tag + 'vong' });
  ctx.poly(circle(0, 0, 0.78, 64).map(P), { closed: true, lineColor: C('7FE0D5'), lineW: 1, lineAlpha: a * 0.6, name: '!!' + tag + 'vong2' });
  ctx.poly(plusShape(0, 0, 0.42, 0.15).map(P), { color: C('12B886'), alpha: a, name: '!!' + tag + 'chuthap' });
  const caps = capsule(0.5, -0.5, 0.36, 0.13, D(-45));
  ctx.poly(caps[0].map(P), { color: C('FF6B6B'), alpha: a, name: '!!' + tag + 'thuoc1' });
  ctx.poly(caps[1].map(P), { color: C('FFFFFF'), alpha: a, lineColor: C('FF6B6B'), lineW: 1, lineAlpha: a, name: '!!' + tag + 'thuoc2' });
  ctx.poly(circle(-0.5, 0.5, 0.11, 24).map(P), { color: C('FFD166'), alpha: a, name: '!!' + tag + 'vien' });
  ctx.poly([[-0.58, 0.5], [-0.42, 0.5]].map(P), { closed: false, lineColor: C('E0A100'), lineW: 1.2, lineAlpha: a, name: '!!' + tag + 'vien2' });
  ctx.poly(quad([-0.5, -0.66], [-0.66, -0.4], [-0.5, -0.36], 10).concat(quad([-0.5, -0.36], [-0.34, -0.4], [-0.5, -0.66], 10)).map(P), { color: C('4CC9F0'), alpha: a, name: '!!' + tag + 'giot' });
  ctx.poly(heartPts(0.5, 0.48, 0.12, 32).map(P), { color: C('E63950'), alpha: a, name: '!!' + tag + 'tim' });
}
function plusField(ctx, x, y, cols, rows, step, size, col, a, tag) {   // lưới dấu cộng nhỏ dần về bên trái-dưới, neo góc trên phải
  const out = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const t = 1 - Math.hypot(i / cols, j / rows) / 1.1; if (t > 0.1) out.push(plusShape(x - i * step, y + j * step, size * t, size * t * 0.32)); }
  ctx.poly(out, { color: col, alpha: a, name: '!!' + tag + 'cong' });
}
const MED = { bg: 'F4FAFA', bg2: 'ECF6F6', ink: '0F2D3A', body: '2E4A57', muted: '5E7885', card: 'FFFFFF', card_line: 'D2E8EA' };

Object.assign(MOTIFS, {
  'nhip-tim': { pack: 'y-te', name: 'Nhịp tim · Tim mạch', short: 'Nhịp tim',
    desc: 'Trái tim đỏ có đường điện tim trắng, dải nhịp tim xanh ngọc chạy ngang chân trang — y khoa, tim mạch, sức khỏe cộng đồng, ngày Thầy thuốc 27/2.',
    sw: ['0B3142', '11616F', 'E63950', '5EEAD4'], ownInv: true,
    palette: palW(Object.assign({}, MED, { accent: 'D7263D', accent2: '0FA3A3', accent3: '3D7DD8', inv: ['0B3142', '0F4C5C', '11616F'], inv_ink: 'F2FBFB', inv_body: 'CDE6EA', inv_accent: '5EEAD4' })),
    draw: emblemDraw(heartBeat, { k: 0.85, halo: false,
      inv: (ctx, th, kind, info) => {
        const y = kind === 'closing' ? SH - 1.2 : SH - 1.05, pts = ecg(-0.3, SW + 0.3, y, 0.55, 2.7);
        ctx.poly(pts, { closed: false, lineColor: th.inv_accent, lineW: 9, lineAlpha: 0.15, name: '!!nt-sang' });
        ctx.poly(pts, { closed: false, lineColor: th.inv_accent, lineW: 2.25, lineAlpha: 0.9, name: '!!nt-duong' });
        info.y1 = Math.min(info.y1, y - 0.8);
      },
      page: (ctx, th) => ctx.poly(ecg(SW - 3.3, SW - 0.35, 0.45, 0.22, 1.5), { closed: false, lineColor: th.accent2, lineW: 1.5, lineAlpha: 0.75, name: '!!nt-duong' }) }) },
  'adn': { pack: 'y-te', name: 'Chuỗi xoắn ADN · Sinh học', short: 'ADN',
    desc: 'Chuỗi xoắn kép ADN nghiêng với các bậc nối bốn màu trên nền xanh đêm — sinh học, di truyền, y sinh, công nghệ sinh học, nghiên cứu khoa học.',
    sw: ['0A1F3A', '133B66', '06D6A0', 'EF476F'], ownInv: true,
    palette: palW(Object.assign({}, MED, { bg: 'F5F8FC', bg2: 'EDF2F9', ink: '0E2240', body: '33465F', muted: '62738A', card_line: 'D6E0EE', accent: '1565C0', accent2: '06A77D', accent3: 'EF476F', inv: ['0A1F3A', '102C52', '133B66'], inv_ink: 'F3F8FF', inv_body: 'CFDDF0', inv_accent: '7FDBFF' })),
    draw: emblemDraw(helix, { halo: true, ca: 0.14 }) },
  'te-bao': { pack: 'y-te', name: 'Tế bào · Vi sinh', short: 'Tế bào',
    desc: 'Tế bào nhân tím, ti thể cam, lưới nội chất và vài tế bào nhỏ quanh đó, nét mềm như hình vẽ sách giáo khoa — sinh học, vi sinh, y học, phòng dịch.',
    sw: ['0E3B3A', '1C5F5B', 'B2DFDB', '9575CD'], ownInv: true,
    palette: palW(Object.assign({}, MED, { accent: '00897B', accent2: '7E57C2', accent3: 'FF7043', inv: ['0E3B3A', '154C49', '1C5F5B'], inv_ink: 'F2FBF9', inv_body: 'CFE7E2', inv_accent: 'B2DFDB' })),
    draw: emblemDraw(cells, { ca: 0.14 }) },
  'chu-thap': { pack: 'y-te', name: 'Chữ thập xanh · Y tế', short: 'Chữ thập',
    desc: 'Chữ thập y tế xanh lá trong vòng tròn cùng viên thuốc, giọt nước, trái tim, lưới dấu cộng ở góc trang — bệnh viện, trạm y tế, y tế học đường, nhà thuốc.',
    sw: ['0B2E59', '1565C0', '12B886', 'FF6B6B'], ownInv: true,
    palette: palW(Object.assign({}, MED, { bg: 'F4F8FC', bg2: 'EBF2FA', card_line: 'D3E1EF', accent: '0B8A6A', accent2: '1565C0', accent3: 'FF6B6B', inv: ['0B2E59', '0F4C81', '1565C0'], inv_ink: 'F4F9FF', inv_body: 'D3E3F5', inv_accent: '8FE3CF' })),
    draw: emblemDraw(medCross, { halo: true, page: (ctx, th) => plusField(ctx, SW - 0.35, 0.3, 7, 3, 0.26, 0.07, th.accent2, 0.45, 'ct-') }) },
});

// ============================================================ Gói 4. Vũ trụ · Khám phá
PACKS.push({ id: 'vu-tru', name: 'Vũ trụ · Khám phá', desc: 'Hành tinh vành đai, chòm sao Bắc Đẩu, tên lửa, vệ tinh' });

function planet(ctx, cx, cy, R, a, tag, mono, col) {
  const rot = D(-16), rx = R * 2.05, ry = R * 0.48, lw = Math.max(1.2, R * 8);
  const ringCol = mono ? col : 'FFE8B0';
  ctx.poly(ellArc(cx, cy, rx, ry, rot, Math.PI, TAU, 36), { closed: false, lineColor: ringCol, lineW: lw, lineAlpha: a * 0.75, name: '!!' + tag + 'vanh-sau' });
  ctx.poly(ellArc(cx, cy, rx * 1.12, ry * 1.12, rot, Math.PI, TAU, 36), { closed: false, lineColor: ringCol, lineW: lw * 0.3, lineAlpha: a * 0.5, name: '!!' + tag + 'vanh-sau2' });
  if (mono) ctx.box(cx - R, cy - R, 2 * R, 2 * R, { kind: 'ellipse', color: col, alpha: a, name: '!!' + tag + 'cau' });
  else ctx.box(cx - R, cy - R, 2 * R, 2 * R, { kind: 'ellipse', gradient: ['F6BD60', 'E76F51'], angle: 60, name: '!!' + tag + 'cau' });
  const bands = [-0.45, -0.1, 0.3].map(k => ellArc(cx, cy + k * R, Math.sqrt(1 - k * k) * R * 0.98, R * 0.1, 0, 0, Math.PI, 20));
  ctx.poly(bands, { closed: false, lineColor: mono ? col : 'B5513A', lineW: Math.max(1, R * 5), lineAlpha: mono ? a * 0.5 : 0.35, name: '!!' + tag + 'soc' });
  ctx.poly(ellArc(cx, cy, rx, ry, rot, 0, Math.PI, 36), { closed: false, lineColor: ringCol, lineW: lw, lineAlpha: a * 0.9, name: '!!' + tag + 'vanh' });
  ctx.poly(ellArc(cx, cy, rx * 1.12, ry * 1.12, rot, 0, Math.PI, 36), { closed: false, lineColor: ringCol, lineW: lw * 0.3, lineAlpha: a * 0.6, name: '!!' + tag + 'vanh2' });
}
function moon(ctx, x, y, r, tag) {
  ctx.box(x - r, y - r, 2 * r, 2 * r, { kind: 'ellipse', color: 'D9DCE6', name: '!!' + tag + 'trang' });
  ctx.poly([circle(x - r * 0.3, y - r * 0.2, r * 0.22, 14), circle(x + r * 0.35, y + r * 0.25, r * 0.16, 12), circle(x + r * 0.1, y - r * 0.5, r * 0.1, 10)], { color: 'AEB3C2', name: '!!' + tag + 'ho' });
}
const DIPPER = [[0.0, 0.3], [0.24, 0.18], [0.45, 0.2], [0.66, 0.28], [0.7, 0.52], [1.0, 0.55], [1.02, 0.25]];
function dipper(ctx, ox, oy, s, col, a, tag, big) {
  const P = ([x, y]) => [ox + x * s, oy + y * s], pts = DIPPER.map(P), polaris = P([1.09, -0.72]);
  ctx.poly([pts.slice(0, 5).concat([pts[5], pts[6], pts[3]])], { closed: false, lineColor: col, lineW: big ? 1.5 : 1, lineAlpha: a * 0.6, name: '!!' + tag + 'net' });
  const guide = []; for (let i = 0; i < 9; i++) { const t0 = i / 9, t1 = (i + 0.5) / 9; guide.push([[pts[6][0] + (polaris[0] - pts[6][0]) * t0, pts[6][1] + (polaris[1] - pts[6][1]) * t0], [pts[6][0] + (polaris[0] - pts[6][0]) * t1, pts[6][1] + (polaris[1] - pts[6][1]) * t1]]); }
  ctx.poly(guide, { closed: false, lineColor: col, lineW: 0.9, lineAlpha: a * 0.35, name: '!!' + tag + 'dan' });
  if (big) pts.concat([polaris]).forEach(([x, y], i) => glow(ctx, x, y, i === 7 ? 0.45 : 0.28, col, 0.35, '!!' + tag + 'hao' + i));
  ctx.poly(pts.map(([x, y], i) => sparkle(x, y, (big ? 0.11 : 0.05) * (i === 5 || i === 6 ? 1.2 : 1))), { color: col, alpha: a, name: '!!' + tag + 'sao' });
  ctx.poly(sparkle(...polaris, big ? 0.2 : 0.08), { color: big ? 'FFFFFF' : col, alpha: a, name: '!!' + tag + 'bacdau' });
}
function rocket(ctx, cx, cy, s, col, a, c2, th, tag) {
  const mono = a < 0.3, C = k => mono ? col : k, P = ([x, y]) => { const g = D(-45), c = Math.cos(g), d = Math.sin(g); return [cx + (x * c - y * d) * s, cy + (x * d + y * c) * s]; };
  const puffs = [[-1.28, 0.06, 0.15], [-1.5, -0.06, 0.18], [-1.78, 0.08, 0.22]];
  if (!mono) ctx.poly(puffs.map(([x, y, r]) => circle(x, y, r, 20).map(P)), { color: 'FFFFFF', alpha: a * 0.45, name: '!!' + tag + 'khoi' });
  if (!mono) {
    ctx.poly(quad([-0.58, -0.15], [-0.85, -0.12], [-1.2, 0], 10).concat(quad([-1.2, 0], [-0.85, 0.12], [-0.58, 0.15], 10)).map(P), { color: 'FB8500', alpha: a, name: '!!' + tag + 'lua' });
    ctx.poly(quad([-0.58, -0.08], [-0.75, -0.06], [-0.95, 0], 8).concat(quad([-0.95, 0], [-0.75, 0.06], [-0.58, 0.08], 8)).map(P), { color: 'FFD166', alpha: a, name: '!!' + tag + 'lua2' });
  }
  const fins = [[[-0.3, -0.21], [-0.72, -0.5], [-0.62, -0.17]], [[-0.3, 0.21], [-0.72, 0.5], [-0.62, 0.17]]];
  ctx.poly(fins.map(r => r.map(P)), { color: C('E63946'), alpha: a, name: '!!' + tag + 'canh' });
  const body = [[-0.62, -0.17], [0.32, -0.22]].concat(quad([0.32, -0.22], [0.62, -0.16], [0.78, 0], 10), quad([0.78, 0], [0.62, 0.16], [0.32, 0.22], 10)).concat([[-0.62, 0.17]]);
  ctx.poly(body.map(P), { color: C('F1F5F9'), alpha: mono ? a * 0.7 : a, lineColor: C('94A3B8'), lineW: 1, lineAlpha: a, name: '!!' + tag + 'than' });
  const nose = [[0.42, -0.205]].concat(quad([0.42, -0.205], [0.64, -0.15], [0.78, 0], 8), quad([0.78, 0], [0.64, 0.15], [0.42, 0.205], 8));
  ctx.poly(nose.map(P), { color: C('E63946'), alpha: a, name: '!!' + tag + 'mui' });
  ctx.poly([rect(-0.62, -0.17, 0.08, 0.34)].map(r => r.map(P)), { color: C('94A3B8'), alpha: a, name: '!!' + tag + 'duoi' });
  ctx.poly(circle(0.12, 0, 0.11, 24).map(P), { color: C('1D3557'), alpha: a, lineColor: C('A8DADC'), lineW: Math.max(1.5, 3 * s), lineAlpha: a, name: '!!' + tag + 'cuaso' });
  if (!mono) ctx.poly(rotRect(-0.15, 0, 0.5, 0.07, 0).map(P), { color: 'E63946', alpha: a, name: '!!' + tag + 'soc' });
}
function satellite(ctx, cx, cy, s, col, a, c2, th, tag) {
  const mono = a < 0.3, C = k => mono ? col : k, g = D(-28), c = Math.cos(g), d = Math.sin(g), P = ([x, y]) => [cx + (x * c - y * d) * s, cy + (x * d + y * c) * s];
  ctx.poly([[[-0.62, 0], [0.62, 0]]].map(r => r.map(P)), { closed: false, lineColor: C('9AA5B1'), lineW: Math.max(1.2, 3 * s), lineAlpha: a, name: '!!' + tag + 'truc' });
  const panels = [rect(-1.0, -0.17, 0.52, 0.34), rect(0.48, -0.17, 0.52, 0.34)];
  ctx.poly(panels.map(r => r.map(P)), { color: C('1E4FA3'), alpha: a, lineColor: C('A9C4F5'), lineW: 1, lineAlpha: a, name: '!!' + tag + 'pin' });
  const grid = []; [-1.0, 0.48].forEach(x0 => { for (let i = 1; i < 4; i++) grid.push([[x0 + 0.13 * i, -0.17], [x0 + 0.13 * i, 0.17]]); grid.push([[x0, 0], [x0 + 0.52, 0]]); });
  ctx.poly(grid.map(r => r.map(P)), { closed: false, lineColor: C('A9C4F5'), lineW: 0.8, lineAlpha: a * 0.8, name: '!!' + tag + 'luoi' });
  ctx.poly(rect(-0.2, -0.24, 0.4, 0.48).map(P), { color: C('D4A017'), alpha: a, lineColor: C('8C6A0A'), lineW: 1, lineAlpha: a, name: '!!' + tag + 'than' });
  if (!mono) ctx.poly([[[-0.2, -0.08], [0.2, -0.02]], [[-0.2, 0.1], [0.2, 0.14]]].map(r => r.map(P)), { closed: false, lineColor: 'FFE38A', lineW: 1, lineAlpha: a * 0.8, name: '!!' + tag + 'giay' });
  ctx.poly(ellArc(0, 0.42, 0.2, 0.09, 0, 0, Math.PI, 16).concat([[0.2, 0.42]]).map(P), { color: C('E5E7EB'), alpha: a, lineColor: C('9AA5B1'), lineW: 1, lineAlpha: a, name: '!!' + tag + 'chao' });
  ctx.poly([[[0, 0.24], [0, 0.42]], [[0, 0.42], [0, 0.58]]].map(r => r.map(P)), { closed: false, lineColor: C('9AA5B1'), lineW: 1.2, lineAlpha: a, name: '!!' + tag + 'anten' });
  ctx.poly([0.18, 0.3, 0.42].map(r => arc(0, 0.62, r, D(55), D(125), 12)).map(r => r.map(P)), { closed: false, lineColor: C('7DF9FF'), lineW: Math.max(1, 2.2 * s), lineAlpha: a * 0.8, name: '!!' + tag + 'song' });
}
const SPACE = { bg: 'F6F7FC', bg2: 'EEF0F9', ink: '141A3A', body: '363D63', muted: '666C8E', card: 'FFFFFF', card_line: 'DDE0EF' };

Object.assign(MOTIFS, {
  'hanh-tinh': { pack: 'vu-tru', name: 'Hành tinh · Vũ trụ', short: 'Hành tinh',
    desc: 'Hành tinh cam có vành đai, mặt trăng nhỏ và bầu trời đầy sao trên nền xanh tím thẫm — thiên văn, khoa học tự nhiên, khám phá, ngoại khóa STEM.',
    sw: ['070B1F', '1C1F4A', 'F6BD60', 'FFE8B0'], ownInv: true,
    palette: palW(Object.assign({}, SPACE, { accent: 'E76F51', accent2: '3D5A80', accent3: 'F4A261', inv: ['070B1F', '111A3E', '1C1F4A'], inv_ink: 'F5F6FF', inv_body: 'D3D7F0', inv_accent: 'FFE8B0' })),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        starfield(ctx, 0, 0, SW, SH, kind === 'closing' ? 140 : 110, 7 + idx, 'FFFFFF', 0.7, 'ht-');
        ctx.poly([sparkle(SW - 5.6, 2.3, 0.12), sparkle(SW - 0.7, 5.9, 0.1), sparkle(1.2, 6.6, 0.08), sparkle(SW - 2.0, 0.6, 0.09)], { color: 'FFFFFF', alpha: 0.9, name: '!!ht-lap' });
        if (kind === 'closing') { planet(ctx, SW / 2, SH / 2, 1.6, 0.14, 'ht-', true, th.inv_accent); return; }
        const big = kind === 'cover', R = big ? 1.25 : 0.95, cx = SW - (big ? 2.9 : 2.6), cy = big ? 3.4 : SH / 2;
        glow(ctx, cx, cy, R * 2.2, 'F6BD60', 0.18, '!!ht-hao');
        planet(ctx, cx, cy, R, 1, 'ht-', false);
        if (big) moon(ctx, SW - 5.0, 1.35, 0.28, 'ht-'); else moon(ctx, SW - 1.0, 1.0, 0.2, 'ht-');
        info.x1 = Math.min(info.x1, SW - (big ? 5.6 : 4.8));
      } else {
        planet(ctx, SW - 0.95, 0.48, 0.17, 1, 'ht-', false);
        ctx.poly([sparkle(SW - 1.6, 0.32, 0.06), sparkle(SW - 0.4, 0.95, 0.05)], { color: th.accent3, name: '!!ht-lap' });
      }
    } },
  'chom-sao': { pack: 'vu-tru', name: 'Chòm sao · Bắc Đẩu', short: 'Chòm sao',
    desc: 'Chòm sao Bắc Đẩu nối nét sáng, đường dẫn tới sao Bắc Cực giữa trời sao xanh đêm — thiên văn, định hướng, mục tiêu, lớp học khoa học.',
    sw: ['060B1A', '13234A', 'BFD7FF', 'FFFFFF'], ownInv: true,
    palette: palW(Object.assign({}, SPACE, { accent: '2B59C3', accent2: '6C8CD5', accent3: 'F2C14E', inv: ['060B1A', '0C1631', '13234A'], inv_ink: 'F4F7FF', inv_body: 'CCD7EE', inv_accent: 'BFD7FF' })),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        starfield(ctx, 0, 0, SW, SH, 170, 3 + idx, 'FFFFFF', 0.65, 'cs-');
        if (kind === 'closing') { dipper(ctx, SW / 2 - 1.7, 1.6, 3.4, th.inv_accent, 0.5, 'cs-', false); return; }
        const big = kind === 'cover';
        dipper(ctx, SW - (big ? 4.65 : 4.0), big ? 3.45 : 3.6, big ? 3.4 : 2.8, th.inv_accent, 0.95, 'cs-', true);
        info.x1 = Math.min(info.x1, SW - (big ? 5.2 : 4.5));
      } else dipper(ctx, SW - 1.75, 0.2, 1.25, th.accent, 0.6, 'cs-', false);
    } },
  'ten-lua': { pack: 'vu-tru', name: 'Tên lửa · Khởi hành', short: 'Tên lửa',
    desc: 'Tên lửa trắng mũi đỏ phóng chéo lên trời, lửa cam và vệt khói giữa trời tím có sao — khởi động dự án, khởi nghiệp, STEM, mục tiêu năm học.',
    sw: ['1B1446', '3C2A8F', 'FFB703', 'E63946'], ownInv: true,
    palette: palW(Object.assign({}, SPACE, { bg: 'F7F6FF', bg2: 'EFEDFB', accent: '5B3FD1', accent2: 'E63946', accent3: 'FFB703', inv: ['1B1446', '2B1B6B', '3C2A8F'], inv_ink: 'FFFFFF', inv_body: 'DCD6F7', inv_accent: 'FFB703' })),
    draw: emblemDraw(rocket, { halo: false, k: 0.9,
      closing: (ctx, th, info) => { rocket(ctx, SW - 1.6, 1.5, 0.95, th.inv_accent, 1, th.inv_ink, th, 'em-'); rocket(ctx, 1.4, SH - 1.2, 0.5, th.inv_accent, 1, th.inv_ink, th, 'em2-'); },
      under: (ctx, th, kind) => { starfield(ctx, 0, 0, SW, SH, 70, 11, 'FFFFFF', 0.55, 'tl-'); ctx.poly([sparkle(SW - 1.0, 1.0, 0.12), sparkle(SW - 5.2, 0.8, 0.09), sparkle(SW - 0.8, 4.8, 0.08)], { color: 'FFFFFF', alpha: 0.9, name: '!!tl-lap' }); },
      page: (ctx, th) => ctx.poly([sparkle(SW - 0.6, 0.42, 0.08), sparkle(SW - 1.1, 0.25, 0.05)], { color: th.accent3, name: '!!tl-lap' }) }) },
  've-tinh': { pack: 'vu-tru', name: 'Vệ tinh · Viễn thông', short: 'Vệ tinh',
    desc: 'Vệ tinh cánh pin xanh, thân vàng phát sóng xuống vầng Trái Đất xanh ở chân trang — viễn thông, chuyển đổi số, công nghệ, địa lý, bản đồ số.',
    sw: ['06121F', '0D2740', '1E88E5', 'D4A017'], ownInv: true,
    palette: palW(Object.assign({}, SPACE, { bg: 'F4F8FB', bg2: 'EAF1F7', ink: '0D2233', body: '304759', muted: '5F7686', card_line: 'D3E1EC', accent: '1565C0', accent2: '00A6C8', accent3: 'D4A017', inv: ['06121F', '0A1C30', '0D2740'], inv_ink: 'F2F8FF', inv_body: 'CADCEC', inv_accent: '7DF9FF' })),
    draw: emblemDraw(satellite, { halo: false, k: 0.95,
      under: (ctx, th, kind, info) => {
        starfield(ctx, 0, 0, SW, SH, 90, 21, 'FFFFFF', 0.55, 'vt-');
        if (kind === 'closing') return;
        const cx = SW - 2.2, cy = SH + 3.3, R = 4.55;
        ctx.box(cx - R - 0.3, cy - R - 0.3, 2 * R + 0.6, 2 * R + 0.6, { kind: 'ellipse', radial: true, gradient: ['7EC8FF', '7EC8FF'], galphas: [0.55, 0], name: '!!vt-khiquyen' });
        ctx.box(cx - R, cy - R, 2 * R, 2 * R, { kind: 'ellipse', gradient: ['1E88E5', '0D47A1'], angle: 90, name: '!!vt-traidat' });
        ctx.poly([blob(cx - 0.5, SH - 0.75, 0.42, 4), blob(cx + 1.1, SH - 0.5, 0.3, 9), blob(cx - 1.9, SH - 0.3, 0.28, 6)], { color: '66BB6A', alpha: 0.75, name: '!!vt-dat' });
        info.y1 = Math.min(info.y1, SH - 1.2);
      } }) },
});

// ============================================================ Gói 5. Thể thao · Thi đua
PACKS.push({ id: 'the-thao', name: 'Thể thao · Thi đua', desc: 'Cúp vàng, sân bóng, đường chạy, cờ vua' });

function trophy(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, C = k => mono ? col : k;
  const lw = Math.max(1.5, 6 * s), leaves = [], stems = [];
  [-1, 1].forEach(sg => {
    const path = quad([sg * 0.12, 0.86], [sg * 0.95, 0.6], [sg * 0.82, -0.32], 16); stems.push(path);
    for (let i = 3; i < 16; i += 2) { const [x, y] = path[i], [qx, qy] = path[i - 1], dir = Math.atan2(y - qy, x - qx); leaves.push(place(PETAL, x, y, 0.22, dir + sg * 0.7), place(PETAL, x, y, 0.2, dir - sg * 0.6)); }
  });
  ctx.poly(mapR(stems, P), { closed: false, lineColor: C('C98A00'), lineW: Math.max(1, 2 * s), lineAlpha: a, name: '!!' + tag + 'cong' });
  ctx.poly(mapR(leaves, P), { color: C('E6B422'), alpha: a * 0.9, name: '!!' + tag + 'la' });
  ctx.poly(mapR([quad([-0.42, -0.6], [-0.88, -0.6], [-0.3, -0.12], 14), quad([0.42, -0.6], [0.88, -0.6], [0.3, -0.12], 14)], P), { closed: false, lineColor: C('C98A00'), lineW: lw, lineAlpha: a, name: '!!' + tag + 'quai' });
  const bowl = quad([-0.5, -0.72], [-0.52, -0.05], [-0.1, 0.08], 14).concat(quad([0.1, 0.08], [0.52, -0.05], [0.5, -0.72], 14));
  ctx.poly(bowl.map(P), { color: C('F2B705'), alpha: a, name: '!!' + tag + 'cup' });
  if (!mono) ctx.poly(quad([-0.36, -0.62], [-0.38, -0.2], [-0.12, -0.02], 10).concat(quad([-0.18, -0.06], [-0.3, -0.24], [-0.27, -0.62], 10)).map(P), { color: 'FFE27A', alpha: a * 0.8, name: '!!' + tag + 'sang' });
  ctx.poly(ell(0, -0.72, 0.5, 0.08, 0, 40).map(P), { color: C('C98A00'), alpha: a, name: '!!' + tag + 'mieng' });
  ctx.poly([rect(-0.07, 0.06, 0.14, 0.3), ell(0, 0.2, 0.13, 0.05, 0, 20), [[-0.32, 0.36], [0.32, 0.36], [0.4, 0.52], [-0.4, 0.52]]].map(r => r.map(P)), { color: C('E0A100'), alpha: a, name: '!!' + tag + 'chan' });
  ctx.poly(rect(-0.47, 0.52, 0.94, 0.2).map(P), { color: C('6D4C41'), alpha: a, name: '!!' + tag + 'de' });
  ctx.poly(rect(-0.25, 0.57, 0.5, 0.1).map(P), { color: C('F2B705'), alpha: a, name: '!!' + tag + 'bien' });
  ctx.poly(star(...P([0, -0.4]), 0.15 * s), { color: C('FFFFFF'), alpha: mono ? a * 0.6 : a, name: '!!' + tag + 'sao' });
}
function medal(ctx, x, y, r, col, rib, tag) {
  ctx.poly([[[x - r * 0.9, y - r * 2.6], [x - r * 0.25, y - r * 2.6], [x + r * 0.15, y - r * 0.8], [x - r * 0.45, y - r * 0.8]], [[x + r * 0.9, y - r * 2.6], [x + r * 0.25, y - r * 2.6], [x - r * 0.15, y - r * 0.8], [x + r * 0.45, y - r * 0.8]]], { color: rib, name: '!!' + tag + 'day' });
  ctx.poly(circle(x, y, r, 36), { color: col, lineColor: 'FFFFFF', lineW: 1, lineAlpha: 0.5, name: '!!' + tag + 'mat' });
  ctx.poly(star(x, y, r * 0.5), { color: 'FFFFFF', alpha: 0.85, name: '!!' + tag + 'sao' });
}
function football(ctx, x, y, r, tag) {
  ctx.box(x - r, y - r, 2 * r, 2 * r, { kind: 'ellipse', color: 'FFFFFF', lineColor: '222222', lineW: 1, name: '!!' + tag + 'bong' });
  const pent = (cx, cy, rr, g) => star(cx, cy, rr, 5, 0.81, g), seams = [], patches = [pent(x, y, r * 0.3, -Math.PI / 2)];
  for (let i = 0; i < 5; i++) { const t = -Math.PI / 2 + TAU * i / 5; const vx = x + r * 0.3 * Math.cos(t), vy = y + r * 0.3 * Math.sin(t); seams.push([[vx, vy], [x + r * 0.62 * Math.cos(t), y + r * 0.62 * Math.sin(t)]]); patches.push(pent(x + r * 0.86 * Math.cos(t + D(36)), y + r * 0.86 * Math.sin(t + D(36)), r * 0.2, t + D(36) + Math.PI / 2)); }
  ctx.poly(seams, { closed: false, lineColor: '222222', lineW: 1, name: '!!' + tag + 'duong' });
  ctx.poly(patches, { color: '222222', name: '!!' + tag + 'mieng' });
}
function pitch(ctx, cx, col, a, tag, small) {          // vạch sân: đường giữa sân ở x = cx, khung thành bên phải
  const m = 0.25, lw = small ? 1.2 : 2, L = { closed: false, lineColor: col, lineW: lw, lineAlpha: a };
  const lines = [rect(m, m, SW - 2 * m, SH - 2 * m).concat([[m, m]]), [[cx, m], [cx, SH - m]], circle(cx, SH / 2, 1.45, 60).concat([[cx + 1.45, SH / 2]])];
  const px = SW - m - 1.9, gx = SW - m - 0.65, sp = SW - m - 1.3;
  lines.push([[SW - m, SH / 2 - 2.0], [px, SH / 2 - 2.0], [px, SH / 2 + 2.0], [SW - m, SH / 2 + 2.0]], [[SW - m, SH / 2 - 0.9], [gx, SH / 2 - 0.9], [gx, SH / 2 + 0.9], [SW - m, SH / 2 + 0.9]]);
  lines.push(arc(sp, SH / 2, 1.0, D(127), D(233), 16), arc(m, m, 0.3, 0, D(90), 8), arc(m, SH - m, 0.3, D(-90), 0, 8), arc(SW - m, m, 0.3, D(90), D(180), 8), arc(SW - m, SH - m, 0.3, D(180), D(270), 8));
  ctx.poly(lines, Object.assign({ name: '!!' + tag + 'vach' }, L));
  ctx.poly([circle(cx, SH / 2, 0.06, 10), circle(sp, SH / 2, 0.05, 10)], { color: col, alpha: a, name: '!!' + tag + 'cham' });
}
function track(ctx, cx, cy, r0, lanes, lw, xL, xT, surf, line, tag, nums) {
  const rO = r0 + lanes * lw, path = r => [[xL, cy + r]].concat(arc(cx, cy, r, D(90), D(-90), 40), [[xT, cy - r]]);
  ctx.poly(path(rO).concat(path(r0).reverse()), { color: surf, name: '!!' + tag + 'mat' });
  const ls = []; for (let k = 0; k <= lanes; k++) ls.push(path(r0 + k * lw));
  ctx.poly(ls, { closed: false, lineColor: line, lineW: 1.25, name: '!!' + tag + 'lan' });
  const fx = Math.max(xL + 1.5, SW * 0.42), sq = lw / 2, chk = [];
  for (let k = 0; k < lanes * 2; k++) for (let c = 0; c < 2; c++) if ((k + c) % 2 === 0) chk.push(rect(fx + c * sq, cy + r0 + k * sq, sq, sq));
  ctx.poly(chk, { color: line, name: '!!' + tag + 'dich' });
  if (nums) for (let k = 0; k < lanes; k++) ctx.text(xL + 0.55, cy + r0 + k * lw, 0.4, lw, String(k + 1), { size: Math.round(lw * 40), bold: true, color: line, align: 'c', anchor: 'm', name: '!!' + tag + 'so' + k });
}
const KNIGHT = [[-0.38, 0.6], [-0.3, 0.12], [-0.46, -0.02], [-0.62, -0.12], [-0.6, -0.3], [-0.38, -0.5], [-0.2, -0.62], [-0.06, -0.86], [0.04, -0.66], [0.22, -0.62], [0.4, -0.38], [0.48, -0.04], [0.42, 0.36], [0.36, 0.6]];
function knight(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, C = k => mono ? col : k;
  ctx.poly([rect(-0.56, 0.74, 1.12, 0.16), rect(-0.44, 0.6, 0.88, 0.14)].map(r => r.map(P)), { color: C(col), alpha: a, name: '!!' + tag + 'de' });
  ctx.poly(KNIGHT.map(P), { color: C(col), alpha: a, name: '!!' + tag + 'ma' });
  ctx.poly(mapR([circle(-0.18, -0.36, 0.05, 12)], P), { color: C(th.inv ? th.inv[0] : '111111'), alpha: mono ? 0 : a, name: '!!' + tag + 'mat' });
  const mane = []; for (let i = 0; i < 5; i++) { const t = i / 5; mane.push([[0.06 + 0.36 * t, -0.6 + 0.5 * t], [0.0 + 0.36 * t, -0.52 + 0.5 * t]]); }
  ctx.poly(mapR(mane, P), { closed: false, lineColor: C(th.inv ? th.inv[0] : '111111'), lineW: Math.max(1, 2 * s), lineAlpha: mono ? 0 : a * 0.6, name: '!!' + tag + 'bom' });
}
function checker(ctx, x, y, cols, rows, sq, col, a, tag) { const out = []; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if ((i + j) % 2 === 0) out.push(rect(x + i * sq, y + j * sq, sq, sq)); ctx.poly(out, { color: col, alpha: a, name: '!!' + tag + 'o' }); }

Object.assign(MOTIFS, {
  'cup-vang': { pack: 'the-thao', name: 'Cúp vàng · Vinh danh', short: 'Cúp vàng',
    desc: 'Cúp vàng giữa cành nguyệt quế, huy chương và giấy kim tuyến trên nền xanh hoàng gia — tổng kết thi đua, khen thưởng, vinh danh, giải thưởng.',
    sw: ['0E1C3D', '1B3A7A', 'F2B705', 'FFFFFF'], ownInv: true,
    palette: palW({ bg: 'F7F5EE', bg2: 'F0EDE2', ink: '142347', body: '35436A', muted: '666F8D', accent: '1B3A7A', accent2: 'C99700', accent3: 'C62828',
      card_line: 'E1DCCB', inv: ['0E1C3D', '14295A', '1B3A7A'], inv_ink: 'FFFFFF', inv_body: 'D6DEF0', inv_accent: 'F5C542' }),
    draw: emblemDraw(trophy, {
      inv: (ctx, th, kind) => {
        if (kind === 'closing') { confetti(ctx, 0.5, 0.3, SW - 1, 1.5, 36, 3, ['F5C542', 'FFFFFF', 'E57373'], 'cv-', 0.8); return; }
        confetti(ctx, SW - 6.0, 0.25, 5.7, 1.6, 24, 5, ['F5C542', 'FFFFFF', 'E57373'], 'cv-', 0.8);
        if (kind === 'cover') { medal(ctx, SW - 5.15, SH - 1.0, 0.32, 'C0C0C0', 'C62828', 'cv-m1-'); medal(ctx, SW - 0.85, SH - 1.0, 0.32, 'CD7F32', '1E88E5', 'cv-m2-'); }
      },
      page: (ctx, th) => ctx.poly([star(SW - 0.55, 0.42, 0.14), star(SW - 0.95, 0.42, 0.1), star(SW - 1.28, 0.42, 0.07)], { color: th.accent2, name: '!!cv-sao' }) }) },
  'san-bong': { pack: 'the-thao', name: 'Sân bóng · Hội khỏe', short: 'Sân bóng',
    desc: 'Mặt sân cỏ kẻ sọc với vạch giữa sân, vòng tròn trung tâm, vòng cấm và quả bóng — hội khỏe Phù Đổng, giải bóng đá, thể dục thể thao, tinh thần đồng đội.',
    sw: ['1E6B34', '2A8C45', 'FFFFFF', 'FFE66D'], ownInv: true,
    palette: palW({ bg: 'F4F8F2', bg2: 'EBF3E8', ink: '15301F', body: '35503E', muted: '637A69', accent: '1E8E3E', accent2: 'E0A100', accent3: 'E53935',
      card_line: 'D5E5D3', inv: ['1E6B34', '23803D'], inv_ink: 'FFFFFF', inv_body: 'E3F2E3', inv_accent: 'FFE66D' }),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const st = []; for (let x = 0; x < SW; x += 1.8) st.push(rect(x, 0, 0.9, SH));
        ctx.poly(st, { color: 'FFFFFF', alpha: 0.06, name: '!!sb-soc' });
        if (kind === 'closing') { pitch(ctx, SW / 2, 'FFFFFF', 0.45, 'sb-'); return; }
        const cx = SW - 3.6;
        pitch(ctx, cx, 'FFFFFF', 0.75, 'sb-');
        football(ctx, cx, SH / 2, kind === 'cover' ? 0.55 : 0.45, 'sb-');
        info.x1 = Math.min(info.x1, cx - 1.9);
        Object.assign(info, { x0: Math.max(info.x0, 0.75), y0: Math.max(info.y0, 0.7), y1: Math.min(info.y1, SH - 0.7) });
      } else {
        ctx.poly([arc(SW, 0, 0.55, D(90), D(180), 12)], { closed: false, lineColor: th.accent, lineW: 1.5, lineAlpha: 0.7, name: '!!sb-goc' });
        ctx.poly([[[SW - 0.25, 0.25], [SW - 0.25, 0.95]]], { closed: false, lineColor: '6B6B6B', lineW: 1.5, name: '!!sb-cot' });
        ctx.poly([[SW - 0.25, 0.25], [SW - 0.65, 0.38], [SW - 0.25, 0.52]], { color: th.accent3, name: '!!sb-co' });
        football(ctx, SW - 1.1, 0.42, 0.16, 'sb-');
      }
    } },
  'duong-chay': { pack: 'the-thao', name: 'Đường chạy · Về đích', short: 'Đường chạy',
    desc: 'Đường chạy điền kinh màu gạch với sáu làn đánh số, khúc cua và vạch đích ca-rô trên nền xanh sân vận động — điền kinh, lộ trình, mục tiêu, nước rút cuối năm.',
    sw: ['13294B', '23497F', 'C8553D', 'FFFFFF'], ownInv: true,
    palette: palW({ bg: 'F7F4EF', bg2: 'F1ECE4', ink: '1A2433', body: '3A4656', muted: '6A7482', accent: 'C8553D', accent2: '1D4E89', accent3: 'E9A23B',
      card_line: 'E4DACB', inv: ['13294B', '1D3C6E', '23497F'], inv_ink: 'FFFFFF', inv_body: 'D6E0EE', inv_accent: 'FFB37A' }),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        if (kind === 'closing') {
          const y0 = SH - 1.6, lw = 0.24, ls = [];
          ctx.box(-0.1, y0, SW + 0.2, lw * 6, { color: 'C8553D', name: '!!dc-mat' });
          for (let k = 0; k <= 6; k++) ls.push([[-0.1, y0 + k * lw], [SW + 0.1, y0 + k * lw]]);
          ctx.poly(ls, { closed: false, lineColor: 'FFFFFF', lineW: 1.25, name: '!!dc-lan' });
          checker(ctx, SW / 2 - 0.12, y0, 2, 12, lw / 2, 'FFFFFF', 1, 'dc-');
          info.y1 = Math.min(info.y1, y0 - 0.4); return;
        }
        const cy = 3.75, r0 = 2.0;
        track(ctx, SW - 2.6, cy, r0, 6, 0.24, -0.2, SW - 5.2, 'C8553D', 'FFFFFF', 'dc-', true);
        info.y1 = Math.min(info.y1, cy + r0 - 0.3); info.x1 = Math.min(info.x1, SW - 2.6 - r0 - 0.4);
      } else {
        const ls = []; [0.36, 0.25, 0.14].forEach(d => ls.push([[SW * 0.55, SH - d], [SW, SH - d]]));
        ctx.box(SW * 0.55, SH - 0.36, SW * 0.45, 0.33, { color: th.accent, alpha: 0.15, name: '!!dc-mat' });
        ctx.poly(ls, { closed: false, lineColor: th.accent, lineW: 1, lineAlpha: 0.7, name: '!!dc-lan' });
        checker(ctx, SW - 0.9, SH - 0.36, 2, 6, 0.055, th.ink, 0.7, 'dc-');
      }
    } },
  'co-vua': { pack: 'the-thao', name: 'Cờ vua · Chiến lược', short: 'Cờ vua',
    desc: 'Quân mã vàng đồng trên nền đen than, dải bàn cờ ca-rô ở chân trang — chiến lược, tư duy, ra quyết định, câu lạc bộ cờ vua.',
    sw: ['141414', '262626', 'D4A85A', 'F5F0E6'], ownInv: true,
    palette: palW({ bg: 'F6F3EE', bg2: 'EFEBE4', ink: '1C1C1C', body: '3D3D3D', muted: '6E6E6E', accent: '9A6B2F', accent2: '1C1C1C', accent3: 'B23A48',
      card_line: 'DED8CE', inv: ['141414', '262626'], inv_ink: 'F5F0E6', inv_body: 'D6D0C4', inv_accent: 'D4A85A' }),
    draw: emblemDraw(knight, { halo: true, k: 0.92,
      inv: (ctx, th, kind, info) => { checker(ctx, 0, SH - 0.7, Math.ceil(SW / 0.35), 2, 0.35, th.inv_accent, 0.22, 'cv-'); if (kind === 'closing') checker(ctx, 0, 0, Math.ceil(SW / 0.35), 2, 0.35, th.inv_accent, 0.22, 'cv2-'); info.y1 = Math.min(info.y1, SH - 1.0); if (kind === 'closing') info.y0 = Math.max(info.y0, 1.0); },
      page: (ctx, th) => checker(ctx, SW - 1.9, 0.2, 10, 2, 0.16, th.ink, 0.5, 'cv-') }) },
});

// ============================================================ Gói 6. Hữu nghị · Đối ngoại
PACKS.push({ id: 'doi-ngoai', name: 'Hữu nghị · Đối ngoại', desc: 'Bồ câu hòa bình, hữu nghị Việt Nam – Lào, mạng lưới kết nối, nhịp cầu' });

function dove(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, C = k => mono ? col : k, edge = { lineColor: C('9DB7D5'), lineW: 1, lineAlpha: a };
  const wingB = [[-0.05, 0.02], [-0.45, -0.52], [-0.3, -0.5], [-0.32, -0.72], [-0.15, -0.6], [-0.08, -0.8], [0.04, -0.58], [0.12, -0.7], [0.18, -0.35], [0.18, 0.02]];
  ctx.poly(wingB.map(([x, y]) => P([x + 0.12, y + 0.04])), Object.assign({ color: C('DCE8F5'), alpha: a, name: '!!' + tag + 'canh2' }, edge));
  const tail = [[-0.42, 0.18], [-0.95, 0.06], [-0.9, 0.2], [-1.0, 0.3], [-0.88, 0.36], [-0.92, 0.48], [-0.4, 0.34]];
  ctx.poly(tail.map(P), Object.assign({ color: C('F4F8FC'), alpha: a, name: '!!' + tag + 'duoi' }, edge));
  ctx.poly(ell(0.02, 0.18, 0.55, 0.2, D(-12), 48).map(P), Object.assign({ color: C('FFFFFF'), alpha: a, name: '!!' + tag + 'than' }, edge));
  ctx.poly(circle(0.52, -0.06, 0.16, 32).map(P), Object.assign({ color: C('FFFFFF'), alpha: a, name: '!!' + tag + 'dau' }, edge));
  ctx.poly([[0.66, -0.1], [0.84, -0.04], [0.66, 0.0]].map(P), { color: C('F2A541'), alpha: a, name: '!!' + tag + 'mo' });
  ctx.poly(circle(0.56, -0.1, 0.025, 10).map(P), { color: C('1D3557'), alpha: a, name: '!!' + tag + 'mat' });
  const wing = [[-0.2, 0.08], [-0.62, -0.62], [-0.42, -0.56], [-0.46, -0.84], [-0.24, -0.66], [-0.18, -0.94], [-0.02, -0.66], [0.06, -0.82], [0.16, -0.5], [0.22, -0.56], [0.24, -0.2], [0.14, 0.06]];
  ctx.poly(wing.map(P), Object.assign({ color: C('FFFFFF'), alpha: a, name: '!!' + tag + 'canh' }, edge));
  const twig = quad([0.76, -0.03], [0.92, 0.14], [0.98, 0.42], 12), lv = [];
  [[3, 0.9], [5, -0.9], [7, 0.9], [9, -0.9], [11, 0.5]].forEach(([i, g]) => { const [x, y] = twig[i], [qx, qy] = twig[i - 1], dir = Math.atan2(y - qy, x - qx); lv.push(place(NARROW, x, y, 0.24, dir + g)); });
  ctx.poly(twig.map(P), { closed: false, lineColor: C('5B7F3A'), lineW: Math.max(1, 1.6 * s), lineAlpha: a, name: '!!' + tag + 'canh-la' });
  ctx.poly(mapR(lv, P), { color: C('7CB342'), alpha: a, name: '!!' + tag + 'la' });
}
// cờ bay: cán ở (px, py), cờ bay sang trái (dir = -1) hoặc phải (dir = 1); kiểu 'vn' hoặc 'lao'
function flag(ctx, px, py, w, h, dir, kind, a, tag, mono, col) {
  const yT = x => 0.06 * h * Math.sin(5.5 * Math.abs(x - px) / w + 0.4) * Math.min(1, Math.abs(x - px) / (w * 0.3));
  const xs = Array.from({ length: 21 }, (_, i) => px + dir * w * i / 20), band = (f0, f1) => xs.map(x => [x, py + yT(x) + h * f0]).concat(xs.slice().reverse().map(x => [x, py + yT(x) + h * f1]));
  const mid = px + dir * w / 2, cy = py + yT(mid) + h / 2;
  if (mono) { ctx.poly(band(0, 1), { color: col, alpha: a, name: '!!' + tag + 'co' }); return; }
  if (kind === 'vn') {
    ctx.poly(band(0, 1), { color: 'DA251D', alpha: a, name: '!!' + tag + 'nen' });
    ctx.poly(star(mid, cy, h * 0.3), { color: 'FFDD00', alpha: a, name: '!!' + tag + 'sao' });
  } else {
    ctx.poly([band(0, 0.25), band(0.75, 1)], { color: 'CE1126', alpha: a, name: '!!' + tag + 'do' });
    ctx.poly(band(0.25, 0.75), { color: '002868', alpha: a, name: '!!' + tag + 'xanh' });
    ctx.poly(circle(mid, cy, h * 0.2, 32), { color: 'FFFFFF', alpha: a, name: '!!' + tag + 'trang' });
  }
}
function champa(ctx, x, y, r, rot, tag, mono, col, a = 1) {      // hoa chăm pa (sứ, đại): năm cánh xoắn chong chóng, tâm vàng
  const ps = []; for (let i = 0; i < 5; i++) { const t = rot + TAU * i / 5; ps.push(place(WIDE, x + r * 0.12 * Math.cos(t + 1.4), y + r * 0.12 * Math.sin(t + 1.4), r, t)); }
  ctx.poly(ps, { color: mono ? col : 'FFFFFF', alpha: a, lineColor: mono ? col : 'E8D9A8', lineW: 0.75, lineAlpha: a, name: '!!' + tag + 'canh' });
  if (!mono) { ctx.box(x - r * 0.45, y - r * 0.45, r * 0.9, r * 0.9, { kind: 'ellipse', radial: true, gradient: ['FFC93C', 'FFC93C'], galphas: [1, 0], name: '!!' + tag + 'tam' }); }
}
function vietLao(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, C = k => mono ? col : k;
  const poles = [[[0.32, 0.95], [-0.42, -0.8]], [[-0.32, 0.95], [0.42, -0.8]]];
  ctx.poly(mapR(poles, P), { closed: false, lineColor: C('C9A227'), lineW: Math.max(1.5, 4 * s), lineAlpha: a, name: '!!' + tag + 'can' });
  const [vx, vy] = P([-0.42, -0.8]), [lx, ly] = P([0.42, -0.8]);
  flag(ctx, vx, vy, 0.66 * s, 0.44 * s, -1, 'vn', a, tag + 'vn-', mono, col);
  flag(ctx, lx, ly, 0.66 * s, 0.44 * s, 1, 'lao', a, tag + 'lao-', mono, col);
  ctx.poly([circle(-0.42, -0.82, 0.045, 12), circle(0.42, -0.82, 0.045, 12)].map(r => r.map(P)), { color: C('F2C200'), alpha: a, name: '!!' + tag + 'dauc' });
  champa(ctx, ...P([-0.16, 0.62]), 0.27 * s, 0.3, tag + 'h1-', mono, col, a);
  champa(ctx, ...P([0.2, 0.74]), 0.22 * s, 1.1, tag + 'h2-', mono, col, a);
  champa(ctx, ...P([0.02, 0.38]), 0.17 * s, 2.0, tag + 'h3-', mono, col, a);
}
function netGlobe(ctx, cx, cy, s, col, a, c2, th, tag) {
  const P = U(cx, cy, s), mono = a < 0.3, R = 0.86, tilt = D(18), dots = [];
  ctx.poly(circle(0, 0, R, 72).map(P), { color: col, alpha: a * 0.1, lineColor: col, lineW: Math.max(1, 1.8 * s), lineAlpha: a, name: '!!' + tag + 'cau' });
  const proj = (lat, lon) => { const x = Math.cos(lat) * Math.sin(lon), y0 = -Math.sin(lat), z0 = Math.cos(lat) * Math.cos(lon), y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt); return [x * R, y * R, z]; };
  for (let la = -75; la <= 75; la += 12.5) for (let lo = -180; lo < 180; lo += 12) { const [x, y, z] = proj(D(la), D(lo)); if (z > 0.05) dots.push(circle(x, y, 0.012 + 0.016 * z, 8)); }
  ctx.poly(mapR(dots, P), { color: col, alpha: a * 0.75, name: '!!' + tag + 'cham' });
  const nodes = [[20, -40], [35, 25], [-10, 60], [-30, -10], [5, 10], [50, -5], [-15, -65]].map(([la, lo]) => proj(D(la), D(lo)));
  const pairs = [[0, 4], [4, 1], [4, 2], [4, 3], [1, 5], [3, 6], [0, 5], [2, 3]], arcs = [];
  pairs.forEach(([i, j]) => { const A = nodes[i], B = nodes[j], m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], k = 1.12 + 0.22 * Math.hypot(A[0] - B[0], A[1] - B[1]) / R; arcs.push(quad([A[0], A[1]], [m[0] * k, m[1] * k - 0.06], [B[0], B[1]], 18)); });
  const ac = mono ? col : (th.inv_ink || 'FFFFFF');
  ctx.poly(mapR(arcs, P), { closed: false, lineColor: ac, lineW: Math.max(1, 1.6 * s), lineAlpha: a * 0.85, name: '!!' + tag + 'cung' });
  if (!mono) nodes.forEach(([x, y], i) => glow(ctx, ...P([x, y]), 0.1 * s, col, 0.6, '!!' + tag + 'hao' + i));
  ctx.poly(nodes.map(([x, y]) => circle(x, y, 0.035, 12)).map(r => r.map(P)), { color: ac, alpha: a, name: '!!' + tag + 'nut' });
}
function bridge(ctx, x0, x1, deck, rise, col, a, tag, sun) {
  const mid = (x0 + x1) / 2, half = (x1 - x0) / 2, archY = x => deck - rise * (1 - Math.pow((x - mid) / half, 2));
  if (sun) {
    ctx.box(mid - 1.4, deck - 1.4, 2.8, 2.8, { kind: 'ellipse', radial: true, gradient: [sun, sun], galphas: [0.45, 0], name: '!!' + tag + 'hao' });
    ctx.poly(arc(mid, deck, 0.85, Math.PI, TAU, 30), { color: sun, alpha: 0.9, name: '!!' + tag + 'mattroi' });
  }
  const a1 = [], a2 = [], hang = [];
  for (let i = 0; i <= 50; i++) { const x = x0 + (x1 - x0) * i / 50; a1.push([x, archY(x)]); a2.push([x, archY(x) + 0.09]); }
  for (let x = x0 + 0.35; x < x1 - 0.2; x += 0.35) hang.push([[x, archY(x) + 0.09], [x, deck]]);
  ctx.poly(a1.concat(a2.reverse()), { color: col, alpha: a, name: '!!' + tag + 'vom' });
  ctx.poly(hang, { closed: false, lineColor: col, lineW: 1, lineAlpha: a * 0.8, name: '!!' + tag + 'day' });
  ctx.box(-0.1, deck, SW + 0.2, 0.1, { color: col, alpha: a, name: '!!' + tag + 'mat' });
  ctx.poly([rect(x0 - 0.12, deck, 0.24, SH - deck), rect(x1 - 0.12, deck, 0.24, SH - deck)], { color: col, alpha: a * 0.85, name: '!!' + tag + 'tru' });
  const r = seeded(5), wv = [];
  for (let i = 0; i < 26; i++) { const y = deck + 0.25 + (SH - deck - 0.3) * r(), x = SW * r(), L = 0.25 + 0.6 * r(); wv.push([[x, y], [x + L, y]]); }
  ctx.poly(wv, { closed: false, lineColor: col, lineW: 1, lineAlpha: a * 0.45, name: '!!' + tag + 'nuoc' });
}

Object.assign(MOTIFS, {
  'bo-cau': { pack: 'doi-ngoai', name: 'Bồ câu · Hòa bình', short: 'Bồ câu',
    desc: 'Chim bồ câu trắng ngậm cành ô liu bay trên nền xanh dương — hòa bình, hữu nghị, đối ngoại, hợp tác quốc tế, Ngày Quốc tế Hòa bình 21/9.',
    sw: ['0B3C6E', '1E7CC8', 'FFFFFF', '7CB342'], ownInv: true,
    palette: palW({ bg: 'F3F8FC', bg2: 'EAF2FA', ink: '0F2747', body: '2F4766', muted: '5F7590', accent: '1565A8', accent2: '5B9E3A', accent3: 'F2A541',
      card_line: 'D3E2F0', inv: ['0B3C6E', '1565A8', '1E7CC8'], inv_ink: 'FFFFFF', inv_body: 'DCEBF8', inv_accent: 'BFE3FF' }),
    draw: emblemDraw(dove, { ca: 0.16 }) },
  'viet-lao': { pack: 'doi-ngoai', name: 'Hữu nghị Việt Nam – Lào', short: 'Việt – Lào',
    desc: 'Cờ Việt Nam và cờ Lào bắt chéo, dưới là chùm hoa chăm pa trắng nhụy vàng trên nền xanh thẫm — quan hệ đặc biệt Việt Nam – Lào, kỷ niệm 5/9 và 18/7, giao lưu hữu nghị.',
    sw: ['0E1F4D', '1B3A86', 'DA251D', 'FFFFFF'], ownInv: true,
    palette: palW({ bg: 'FBF8F2', bg2: 'F4F0E6', ink: '1D2240', body: '3D4262', muted: '6B6F8A', accent: 'C8102E', accent2: '1B3A86', accent3: 'D4A017',
      card_line: 'E4DFD2', inv: ['0E1F4D', '15306E', '1B3A86'], inv_ink: 'FFFFFF', inv_body: 'D8E0F2', inv_accent: 'FFD54F' }),
    draw: emblemDraw(vietLao, { halo: true, wm: 0.12,
      page: (ctx, th) => { flag(ctx, SW - 1.05, 0.22, 0.42, 0.28, -1, 'vn', 1, 'vl-vn-', false); flag(ctx, SW - 0.95, 0.22, 0.42, 0.28, 1, 'lao', 1, 'vl-lao-', false); ctx.poly([[[SW - 1.0, 0.18], [SW - 1.0, 0.68]]], { closed: false, lineColor: 'C9A227', lineW: 1.5, name: '!!vl-can' }); } }) },
  'ket-noi': { pack: 'doi-ngoai', name: 'Kết nối toàn cầu · Hội nhập', short: 'Kết nối',
    desc: 'Quả cầu chấm điểm với các cung nối sáng giữa nhiều nút mạng trên nền xanh đêm — hội nhập quốc tế, hợp tác đa phương, chuyển đổi số, chuỗi cung ứng.',
    sw: ['0A1A3A', '143A73', '4FD1C5', 'FFFFFF'], ownInv: true,
    palette: palW({ bg: 'F3F7FB', bg2: 'EAF1F8', ink: '0E2240', body: '2F4664', muted: '5F7490', accent: '0F6CBD', accent2: '0FA3A3', accent3: 'F2A541',
      card_line: 'D2DFEC', inv: ['0A1A3A', '0F2A5A', '143A73'], inv_ink: 'FFFFFF', inv_body: 'D0DDF0', inv_accent: '4FD1C5' }),
    draw: emblemDraw(netGlobe, { halo: true, ca: 0.16 }) },
  'nhip-cau': { pack: 'doi-ngoai', name: 'Nhịp cầu · Hợp tác', short: 'Nhịp cầu',
    desc: 'Cây cầu vòm thép vươn qua mặt nước, mặt trời hoàng hôn phía sau trên nền xanh thép — hợp tác, kết nối, hữu nghị, giao thông, hạ tầng, phát triển vùng.',
    sw: ['12263F', '25507F', 'F4A261', 'FFFFFF'], ownInv: true,
    palette: palW({ bg: 'F5F7FA', bg2: 'ECF0F5', ink: '15233A', body: '36465E', muted: '66748A', accent: '25507F', accent2: 'E07A3F', accent3: '2A9D8F',
      card_line: 'D7DEE8', inv: ['12263F', '1C3A5E', '25507F'], inv_ink: 'FFFFFF', inv_body: 'D6E0EE', inv_accent: 'F4A261' }),
    draw(ctx, th, inv, idx, kind, info) {
      if (inv) {
        const deck = SH - 1.35;
        bridge(ctx, kind === 'closing' ? 1.2 : SW * 0.36, kind === 'closing' ? SW - 1.2 : SW - 0.6, deck, kind === 'closing' ? 1.7 : 2.2, th.inv_ink, kind === 'closing' ? 0.35 : 0.8, 'nc-', kind === 'closing' ? null : th.inv_accent);
        info.y1 = Math.min(info.y1, deck - (kind === 'closing' ? 1.9 : 0.3));
        if (kind !== 'closing') info.x1 = Math.min(info.x1, SW - 2.2);
      } else {
        const x0 = SW - 3.2, x1 = SW - 0.4, deck = SH - 0.35, mid = (x0 + x1) / 2, half = (x1 - x0) / 2, pts = [], hang = [];
        for (let i = 0; i <= 30; i++) { const x = x0 + (x1 - x0) * i / 30; pts.push([x, deck - 0.75 * (1 - Math.pow((x - mid) / half, 2))]); }
        for (let i = 2; i < 30; i += 3) hang.push([pts[i], [pts[i][0], deck]]);
        ctx.poly([pts, [[x0 - 0.3, deck], [x1 + 0.3, deck]]].concat(hang), { closed: false, lineColor: th.accent, lineW: 1.2, lineAlpha: 0.45, name: '!!nc-cau' });
      }
    } },
});

// ============================================================ ký hiệu đầu dòng theo chủ đề
const BULLET = { 'cach-mang': '★', 'bua-liem': '★', 'vong-lua': '★', 'co-bay': '★', 'sieu-anh-hung': '★', 'ho-chi-minh': '❀', 'tet': '✿', 'hoa-dao': '✿', 'dam-sen': '❀',
  'dong-son': '◆', 'hoi-van': '◆', 'tho-cam': '◆', 'gach-bong': '❖', 'phao-hoa': '✦', 'trung-thu': '✦', 'nang-luong': '✦', 'hai-tac': '✦', 'toc-do': '▶', 'khung-truyen': '▶', 'mach-dien': '▶', 'bum': '★',
  'hoa-phuong': '✿', 'tot-nghiep': '★', 'cup-vang': '★', 'viet-lao': '★', 'khue-van-cac': '◆', 'chua-mot-cot': '◆', 'mai-dinh': '◆', 'non-la': '◆',
  'hanh-tinh': '✦', 'chom-sao': '✦', 'ten-lua': '▶', 've-tinh': '▶', 'nhip-tim': '♥', 'co-vua': '♞', 'bo-cau': '❖', 'vo-o-ly': '✎', 'bang-den': '✎' };
for (const k in BULLET) if (MOTIFS[k]) MOTIFS[k].bullet = BULLET[k];

for (const k in MOTIFS) MOTIFS[k].id = k;

/** Trả về mẫu mới = mẫu gốc + họa tiết (và bảng màu của họa tiết nếu usePalette). */
function withMotif(th, id, usePalette = true) {
  const m = MOTIFS[id]; if (!m) return th;
  return Object.assign({}, th, usePalette && m.palette ? m.palette : {}, m.bullet ? { bullet: m.bullet } : {}, { motif: id, name: th.name + ' + ' + m.short });
}

T.MOTIFS = MOTIFS;
T.PACKS = PACKS;
T.withMotif = withMotif;
})(window);
