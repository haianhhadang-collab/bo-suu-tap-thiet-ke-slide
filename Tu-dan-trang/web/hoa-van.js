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

// cành mai: gốc ở (ox, oy), mọc sang trái-xuống (dir = -1) hoặc phải-xuống (dir = 1), tỉ lệ s
function maiBranch(ctx, ox, oy, s, dir, tag) {
  const P = ([x, y]) => [ox + dir * x * s, oy + y * s];
  const main = quad([0, -0.1], [1.5, 0.25], [3.6, 1.45]).map(P);
  const subs = [quad([1.2, 0.27], [1.45, 0.9], [1.95, 1.35]).map(P), quad([2.45, 0.82], [2.85, 0.5], [2.95, 0.05]).map(P), quad([3.0, 1.15], [3.3, 1.7], [3.2, 2.0]).map(P)];
  ctx.poly(main, { closed: false, lineColor: '4E342E', lineW: Math.max(1.5, 5 * s), name: '!!' + tag + 'canh' });
  ctx.poly(subs, { closed: false, lineColor: '5D4037', lineW: Math.max(1, 3 * s), name: '!!' + tag + 'canh2' });
  const flowers = [[0.85, 0.12, 0.24], [1.95, 1.33, 0.22], [2.95, 0.07, 0.2], [3.55, 1.45, 0.22], [2.25, 0.72, 0.17], [3.2, 1.98, 0.16]];
  const petals = [], hearts = [];
  flowers.forEach(([x, y, r], k) => {
    const [cx, cy] = P([x, y]), pr = r * s * 0.5, rot = k * 0.7;
    for (let j = 0; j < 5; j++) { const a = rot + TAU * j / 5; petals.push(circle(cx + pr * 0.95 * Math.cos(a), cy + pr * 0.95 * Math.sin(a), pr, 18)); }
    hearts.push(circle(cx, cy, pr * 0.5, 14));
  });
  [[1.4, 0.36], [0.4, 0.0], [3.1, 1.12], [2.6, 0.55]].forEach(([x, y]) => { const [cx, cy] = P([x, y]); petals.push(circle(cx, cy, 0.07 * s, 12)); });
  ctx.poly(petals, { color: 'FFC107', name: '!!' + tag + 'hoa' });
  ctx.poly(hearts, { color: 'E65100', name: '!!' + tag + 'nhuy' });
}

// ---------- bộ họa tiết
// palette: bảng màu gợi ý (áp khi bật “dùng màu của họa tiết”); ownInv: tự vẽ trang bìa/chương/kết thay cho trang trí của mẫu
const MOTIFS = {
  'cach-mang': {
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
  'ho-chi-minh': {
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
  'dong-son': {
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
  'hoi-van': {
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
  'tet': {
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
for (const k in MOTIFS) MOTIFS[k].id = k;

/** Trả về mẫu mới = mẫu gốc + họa tiết (và bảng màu của họa tiết nếu usePalette). */
function withMotif(th, id, usePalette = true) {
  const m = MOTIFS[id]; if (!m) return th;
  return Object.assign({}, th, usePalette && m.palette ? m.palette : {}, { motif: id, name: th.name + ' + ' + m.short });
}

T.MOTIFS = MOTIFS;
T.withMotif = withMotif;
})(window);
