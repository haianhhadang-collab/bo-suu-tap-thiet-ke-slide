/* Tự dàn trang — giữ nguyên bố cục của file PowerPoint gốc, chỉ khoác mẫu thiết kế lên
   (bản chuyển từ dantrang/giubocuc.py; hai bản làm cùng các bước):
   giữ vị trí, kích thước, thứ tự lớp của hộp chữ, bảng, ảnh, hình khối, nhóm hình; đổi nền, màu chữ, màu hình,
   màu ô bảng, phông chữ theo mẫu; trang trí của mẫu nằm dưới cùng, chạm vào chữ thì mờ đi; giữ số dòng của chữ;
   thêm animation cho trang chưa có và hiệu ứng chuyển trang. */
(function (G) {
'use strict';
const T = G.TuDanTrang;
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const P = 'http://schemas.openxmlformats.org/presentationml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const NSDECL = `xmlns:a="${A}" xmlns:p="${P}" xmlns:r="${R}"`;
const EMU = 914400;
const SYMBOL_FONT_RE = /^(wingdings|webdings|symbol|marlett|mt extra|segoe (ui symbol|ui emoji|mdl2)|font ?awesome|material)/i;
const FILLS = ['noFill', 'solidFill', 'gradFill', 'blipFill', 'pattFill', 'grpFill'];
const COLORS = ['srgbClr', 'schemeClr', 'sysClr', 'prstClr', 'scrgbClr', 'hslClr'];
const PRST = { black: '000000', white: 'FFFFFF', red: 'FF0000', green: '008000', blue: '0000FF', yellow: 'FFFF00', gray: '808080',
  grey: '808080', darkGray: 'A9A9A9', lightGray: 'D3D3D3', orange: 'FFA500', darkRed: '8B0000', darkBlue: '00008B', darkGreen: '006400',
  navy: '000080', purple: '800080', silver: 'C0C0C0', maroon: '800000', cyan: '00FFFF', magenta: 'FF00FF' };
const SCHEME_KEYS = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
const RPR_ORDER = ['ln', ...FILLS, 'effectLst', 'effectDag', 'highlight', 'uLnTx', 'uLn', 'uFillTx', 'uFill', 'latin', 'ea', 'cs', 'sym',
  'hlinkClick', 'hlinkMouseOver', 'rtl', 'extLst'];
const SPPR_ORDER = ['xfrm', 'custGeom', 'prstGeom', ...FILLS, 'ln', 'effectLst', 'effectDag', 'scene3d', 'sp3d', 'extLst'];
const TCPR_ORDER = ['lnL', 'lnR', 'lnT', 'lnB', 'lnTlToBr', 'lnBlToTr', 'cell3D', ...FILLS, 'headers', 'extLst'];
const _r = v => Math.floor(v + 0.5);

// ============================================================ DOM
const parse = s => new DOMParser().parseFromString(s, 'application/xml');
const kids = (el, ln) => el ? [...el.children].filter(c => c.localName === ln) : [];
const kid = (el, ln) => el ? [...el.children].find(c => c.localName === ln) || null : null;
const path = (el, ...lns) => { for (const l of lns) { el = kid(el, l); if (!el) return null; } return el; };
const desc = (el, ln) => el ? [...el.getElementsByTagNameNS('*', ln)] : [];
const at = (el, n, d = null) => el && el.hasAttribute(n) ? el.getAttribute(n) : d;
const int = (el, n, d = 0) => { const v = at(el, n); return v == null ? d : parseInt(v, 10); };
const txt = tx => tx ? desc(tx, 't').filter(t => t.namespaceURI === A).map(t => t.textContent).join('') : '';
const mk = (doc, tag, attrs) => { const e = doc.createElementNS(A, 'a:' + tag); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); return e; };
function frag(doc, xml) {
  const d = parse(`<x ${NSDECL}>${xml}</x>`);
  return [...d.documentElement.children].map(n => doc.importNode(n, true));
}
const serialize = doc => {
  const s = new XMLSerializer().serializeToString(doc);
  return s.startsWith('<?xml') ? s : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + s;
};

// ============================================================ màu
const rgbOf = h => [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16));
const hexOf = c => c.map(v => Math.max(0, Math.min(255, Math.floor(v + 0.5))).toString(16).padStart(2, '0')).join('').toUpperCase();
const lightness = h => { const c = rgbOf(h); return (Math.max(...c) + Math.min(...c)) / 510; };
const chroma = h => { const c = rgbOf(h); return (Math.max(...c) - Math.min(...c)) / 255; };
function toHls(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, l, 0];
  const d = mx - mn, s = l <= 0.5 ? d / (mx + mn) : d / (2 - mx - mn);
  const rc = (mx - r) / d, gc = (mx - g) / d, bc = (mx - b) / d;
  const h = r === mx ? bc - gc : g === mx ? 2 + rc - bc : 4 + gc - rc;
  return [(((h / 6) % 1) + 1) % 1, l, s];
}
function fromHls(h, l, s) {
  if (s === 0) return [l, l, l];
  const m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s, m1 = 2 * l - m2;
  const v = t => { t = ((t % 1) + 1) % 1; if (t < 1 / 6) return m1 + (m2 - m1) * t * 6; if (t < 0.5) return m2; if (t < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - t) * 6; return m1; };
  return [v(h + 1 / 3), v(h), v(h - 1 / 3)];
}
const hueBucket = h => { const [r, g, b] = rgbOf(h).map(v => v / 255); return Math.floor(((toHls(r, g, b)[0] * 360 + 15) % 360) / 30); };
function mods(base, el) {
  let [r, g, b] = rgbOf(base).map(v => v / 255), alpha = null;
  for (const m of el.children) {
    const v = parseInt(at(m, 'val', 'x'), 10) / 100000; if (isNaN(v)) continue;
    const tag = m.localName;
    if (tag === 'alpha') alpha = v;
    else if (tag === 'lumMod' || tag === 'lumOff' || tag === 'satMod') {
      let [hh, l, s] = toHls(r, g, b);
      if (tag === 'lumMod') l *= v; else if (tag === 'lumOff') l += v; else s *= v;
      [r, g, b] = fromHls(hh, Math.max(0, Math.min(1, l)), Math.max(0, Math.min(1, s)));
    } else if (tag === 'tint') [r, g, b] = [r, g, b].map(c => c * v + (1 - v));
    else if (tag === 'shade') [r, g, b] = [r, g, b].map(c => c * v);
  }
  return [hexOf([r * 255, g * 255, b * 255]), alpha];
}
class Scheme {
  constructor(colors, cmap) { this.colors = colors; this.cmap = cmap; }
  color(el) {
    const tag = el.localName; let base;
    if (tag === 'srgbClr') base = at(el, 'val') || '000000';
    else if (tag === 'schemeClr') { const v = at(el, 'val'); if (v === 'phClr') return null; base = this.colors[this.cmap[v] || v]; if (!base) return null; }
    else if (tag === 'sysClr') base = at(el, 'lastClr') || (at(el, 'val') === 'windowText' ? '000000' : 'FFFFFF');
    else if (tag === 'prstClr') base = PRST[at(el, 'val')] || '000000';
    else if (tag === 'scrgbClr') base = hexOf(['r', 'g', 'b'].map(k => int(el, k) / 100000 * 255));
    else return null;
    if (base.length !== 6) return null;
    return mods(base, el);
  }
  named(name) { const c = this.colors[this.cmap[name] || name]; return c ? [c, null] : null; }
  of(parent) { if (!parent) return null; for (const c of parent.children) if (COLORS.includes(c.localName)) return this.color(c); return null; }
  fill(f) {
    if (!f) return null;
    if (f.localName === 'solidFill') return this.of(f);
    if (f.localName === 'gradFill') {
      const cs = desc(f, 'gs').map(gs => this.of(gs)).filter(Boolean); if (!cs.length) return null;
      const avg = [0, 1, 2].map(i => cs.reduce((s, c) => s + rgbOf(c[0])[i], 0) / cs.length);
      const al = cs.map(c => c[1] != null ? c[1] : 1);
      return [hexOf(avg), al.reduce((a, b) => a + b, 0) / al.length];
    }
    return null;
  }
}
function readScheme(root) {
  const cs = desc(root, 'clrScheme')[0], out = {};
  for (const k of SCHEME_KEYS) {
    const el = kid(cs, k), c = el ? el.firstElementChild : null;
    out[k] = !c ? '000000' : c.localName === 'srgbClr' ? at(c, 'val') : (at(c, 'lastClr') || (at(c, 'val') === 'windowText' ? '000000' : 'FFFFFF'));
  }
  return out;
}
function readFonts(root) {
  const out = { major: 'Calibri Light', minor: 'Calibri' };
  for (const [k, tag] of [['major', 'majorFont'], ['minor', 'minorFont']]) { const el = kid(desc(root, tag)[0], 'latin'); if (at(el, 'typeface')) out[k] = at(el, 'typeface'); }
  return out;
}
const alphaOf = c => { const a = kid(c, 'alpha'); return a ? int(a, 'val') / 100000 : 1; };
function srgb(doc, hex, alpha) {
  const el = mk(doc, 'srgbClr', { val: hex.toUpperCase() });
  if (alpha != null && alpha < 1) el.appendChild(mk(doc, 'alpha', { val: String(_r(alpha * 100000)) }));
  return el;
}
function setColor(parent, hex, alpha) {
  for (const c of [...parent.children]) if (COLORS.includes(c.localName)) c.remove();
  parent.insertBefore(srgb(parent.ownerDocument, hex, alpha), parent.firstChild);
}
const solid = (doc, hex, alpha) => { const el = mk(doc, 'solidFill'); el.appendChild(srgb(doc, hex, alpha)); return el; };
/** Chèn el vào parent đúng thứ tự theo lược đồ OOXML (thay phần tử cùng loại nếu có). */
function put(parent, el, order) {
  const name = el.localName, group = FILLS.includes(name) ? FILLS : [name];
  for (const c of [...parent.children]) if (group.includes(c.localName)) c.remove();
  const rank = order.indexOf(name);
  const next = [...parent.children].find(c => order.includes(c.localName) && order.indexOf(c.localName) > rank);
  parent.insertBefore(el, next || null);
  return el;
}
const fillEl = pr => pr ? [...pr.children].find(c => FILLS.includes(c.localName)) || null : null;

// ============================================================ đổi màu theo mẫu
const tdist = (c, bg) => { const lb = lightness(bg); return Math.min(1, Math.abs(lightness(c) - lb) / Math.max(lb, 1 - lb, 0.5)); };
class Mapper {
  constructor(th, order) { this.th = th; this.order = order; }
  base(c, dark) {
    const th = this.th, b = hueBucket(c), k = this.order.includes(b) ? this.order.indexOf(b) : this.order.length;
    return (dark ? [th.inv_accent, th.accent2, th.accent3] : [th.accent, th.accent2, th.accent3])[k % 3];
  }
  fill(c, s) {
    const t = tdist(c, s.bo);
    if (chroma(c) < 0.15) return T.mix(s.bn, s.tn, t);
    const base = this.base(c, s.inv);
    if (t <= 0.65) return T.mix(s.bn, base, Math.min(1, t * 2.2));
    return T.mix(base, s.tn, (t - 0.65) / 0.35 * 0.5);
  }
  text(c, role, effNew, effOld, size, bold) {
    const th = this.th, dark = T.contrast(effNew, th.inv_ink) > T.contrast(effNew, th.ink);
    const [ink, body, muted] = dark ? [th.inv_ink, th.inv_body, th.inv_body] : [th.ink, th.body, th.muted];
    const main = role === 'title' ? ink : body, colored = c != null && chroma(c) >= 0.15;
    let out = c == null ? main : !colored ? (tdist(c, effOld) >= 0.55 ? main : muted) : this.base(c, dark);
    const need = size >= 24 || (bold && size >= 18.5) ? 3 : 4.5;
    if (colored) for (let i = 0; i < 6 && T.contrast(effNew, out) < need; i++) out = T.mix(out, ink, 0.3);
    if (T.contrast(effNew, out) < need) out = T.readable(effNew, out, body, ink);
    return out;
  }
}

// ============================================================ vị trí các hình (kể cả trong nhóm) theo tọa độ trang
function xfrmOf(el) {
  if (el.localName === 'graphicFrame') return kid(el, 'xfrm');
  return path(el, el.localName === 'grpSp' ? 'grpSpPr' : 'spPr', 'xfrm');
}
function phOf(el) {
  for (const nv of el.children) if (nv.localName.startsWith('nv')) { const ph = path(nv, 'nvPr', 'ph'); if (ph) return [at(ph, 'type') || 'body', at(ph, 'idx')]; }
  return null;
}
const NORM = { ctrTitle: 'title', subTitle: 'body', obj: 'body' };
function matchPh(doc, ph) {
  if (!doc || !ph) return null;
  const [typ, idx] = ph; let byType = null;
  for (const sp of desc(doc, 'sp')) {
    const p2 = phOf(sp); if (!p2) continue;
    if (idx != null && p2[1] === idx) return sp;
    if (!byType && (NORM[p2[0]] || p2[0]) === (NORM[typ] || typ)) byType = sp;
  }
  return byType;
}
function walk(tree, layout, master) {
  const recs = [];
  const geo = (el, ph) => {
    let x = xfrmOf(el);
    if ((!x || !kid(x, 'off')) && ph) for (const d of [layout, master]) { const m = matchPh(d, ph); if (m) { x = xfrmOf(m); if (x && kid(x, 'off')) break; } }
    if (!x || !kid(x, 'off') || !kid(x, 'ext')) return null;
    const o = kid(x, 'off'), e = kid(x, 'ext');
    return [int(o, 'x'), int(o, 'y'), int(e, 'cx'), int(e, 'cy')];
  };
  (function rec(container, tf, top) {
    for (const ch of container.children) {
      const tag = ch.localName;
      if (!['sp', 'pic', 'graphicFrame', 'cxnSp', 'grpSp'].includes(tag)) {
        if (tag === 'AlternateContent' && ch.firstElementChild) rec(ch.firstElementChild, tf, top);   // đồ họa mới: chỉ lấy vị trí
        continue;
      }
      const ph = phOf(ch), g = geo(ch, ph);
      recs.push({ el: ch, tag, box: g ? tf(...g) : [0, 0, 0, 0], z: recs.length, ph, top, text: false, fillOld: null, fillNew: null, pic: false, alpha: 1 });
      if (tag === 'grpSp') {
        const x = xfrmOf(ch); let t2 = tf;
        if (x && kid(x, 'off')) {
          const o = kid(x, 'off'), e = kid(x, 'ext'), co = kid(x, 'chOff'), ce = kid(x, 'chExt');
          const ox = int(o, 'x'), oy = int(o, 'y'), ex = int(e, 'cx'), ey = int(e, 'cy');
          const cx = co ? int(co, 'x') : 0, cy = co ? int(co, 'y') : 0;
          const cex = (ce ? int(ce, 'cx') : 0) || ex || 1, cey = (ce ? int(ce, 'cy') : 0) || ey || 1;
          const sx = ex / cex, sy = ey / cey;
          t2 = (X, Y, W, H) => tf(ox + (X - cx) * sx, oy + (Y - cy) * sy, W * sx, H * sy);
        }
        rec(ch, t2, false);
      }
    }
  })(tree, (x, y, w, h) => [x, y, w, h], true);
  return recs;
}
const contains = (b, px, py) => b[0] <= px && px <= b[0] + b[2] && b[1] <= py && py <= b[1] + b[3];
const overlap = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));

/** Máy có cài phông này không (so bề rộng chữ với các phông dự phòng). Không có thì giữ nguyên phông gốc. */
const _installed = new Map();
function fontInstalled(face) {
  if (!face) return false;
  if (_installed.has(face)) return _installed.get(face);
  const c = document.createElement('canvas').getContext('2d'), probe = 'mmmmmmmmmmlliWWQq ÀẮỆơư 0123';
  let ok = false;
  for (const fb of ['monospace', 'serif', 'sans-serif']) {
    c.font = `72px ${fb}`; const w0 = c.measureText(probe).width;
    c.font = `72px "${face.replace(/"/g, '')}", ${fb}`;
    if (c.measureText(probe).width !== w0) { ok = true; break; }
  }
  _installed.set(face, ok);
  return ok;
}
/** Tên phông kiểu Windows (vd 'Eras Bold ITC', 'Times New Roman Bold') -> [họ phông trình duyệt đo được, đậm?]; null nếu máy không có. */
function fontFamily(face) {
  if (fontInstalled(face)) return [face, false];
  const fam = (face || '').replace(/\s+(bold|semibold|demibold|demi|black|heavy|extrabold|ultrabold|medium|light|extralight|thin|italic|oblique)\b/gi, '').replace(/\s+/g, ' ').trim();
  return fam && fam !== face && fontInstalled(fam) ? [fam, /\b(bold|semibold|demibold|demi|black|heavy|extrabold|ultrabold)\b/i.test(face)] : null;
}
/** Số dòng khi ngắt theo khoảng trắng như PowerPoint, tính cả giãn chữ spc (pt mỗi ký tự). */
function nLines(text, face, size, widthIn, bold, slack, spc) {
  const maxw = widthIn * 72 * slack, wid = t => T.textWidthPt(t, face, size, bold) + spc * t.length;
  let n = 0;
  for (const para of text.split('\n')) {
    let cur = '';
    for (let w of para.split(' ')) {
      const trial = cur ? cur + ' ' + w : w;
      if (wid(trial) <= maxw) { cur = trial; continue; }
      if (cur) n++;
      while (wid(w) > maxw && w.length > 4) { let cut = w.length; while (cut > 1 && wid(w.slice(0, cut)) > maxw) cut--; n++; w = w.slice(cut); }
      cur = w;
    }
    n++;
  }
  return n;
}

// ============================================================ kiểu chữ thừa kế: hình -> bố cục -> khuôn -> trình chiếu
class Styles {
  constructor(pres, layout, master, fonts) { Object.assign(this, { pres, layout, master, fonts }); }
  chain(tx, ph, level) {
    const tag = `lvl${Math.min(level, 8) + 1}pPr`, out = [];
    out.push(kid(kid(tx, 'lstStyle'), tag));
    const st = kid(this.master, 'txStyles');
    if (ph) {
      for (const d of [this.layout, this.master]) { const m = matchPh(d, ph); if (m) out.push(kid(path(m, 'txBody', 'lstStyle'), tag)); }
      if (st) out.push(kid(kid(st, ph[0] === 'title' || ph[0] === 'ctrTitle' ? 'titleStyle' : 'bodyStyle'), tag));
    } else {
      out.push(kid(kid(this.pres, 'defaultTextStyle'), tag));
      if (st) out.push(kid(kid(st, 'otherStyle'), tag));
    }
    return out.filter(Boolean);
  }
  static attr(rPr, chain, name) {
    if (rPr && rPr.hasAttribute(name)) return rPr.getAttribute(name);
    for (const lv of chain) { const d = kid(lv, 'defRPr'); if (d && d.hasAttribute(name)) return d.getAttribute(name); }
    return null;
  }
  face(rPr, chain, ph) {
    let face = at(kid(rPr, 'latin'), 'typeface');
    if (!face) for (const lv of chain) { const d = path(lv, 'defRPr', 'latin'); if (at(d, 'typeface')) { face = at(d, 'typeface'); break; } }
    if (!face) face = ph && (ph[0] === 'title' || ph[0] === 'ctrTitle') ? '+mj-lt' : '+mn-lt';
    if (face.startsWith('+mj')) return this.fonts.major;
    if (face.startsWith('+mn')) return this.fonts.minor;
    return face;
  }
}

// ============================================================ đọc file gốc một lần (giữ chuỗi XML để dựng lại nhanh khi đổi mẫu)
const relType = t => t.split('/').pop();
function resolveTarget(base, target) {
  if (target.startsWith('/')) return target.slice(1);
  const parts = base.split('/'); parts.pop();
  for (const p of target.split('/')) { if (p === '..') parts.pop(); else if (p !== '.') parts.push(p); }
  return parts.join('/');
}
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', svg: 'image/svg+xml', webp: 'image/webp' };
async function loadSource(buf) {
  const zip = await JSZip.loadAsync(buf), files = {};
  const read = async p => { if (!(p in files)) files[p] = zip.file(p) ? await zip.file(p).async('string') : null; return files[p]; };
  const relsOf = async part => {
    const i = part.lastIndexOf('/'), x = await read(part.slice(0, i) + '/_rels/' + part.slice(i + 1) + '.rels'), out = {};
    if (!x) return out;
    for (const r of desc(parse(x).documentElement, 'Relationship'))
      out[at(r, 'Id')] = { type: relType(at(r, 'Type')), target: at(r, 'TargetMode') === 'External' ? null : resolveTarget(part, at(r, 'Target')) };
    return out;
  };
  const presPath = 'ppt/presentation.xml', pres = parse(await read(presPath)).documentElement;
  const prel = await relsOf(presPath), sz = desc(pres, 'sldSz')[0];
  const src = { buf, files, pres: presPath, sw: int(sz, 'cx', 12192000), sh: int(sz, 'cy', 6858000), slides: [], media: {} };
  for (const id of desc(pres, 'sldId')) {
    const r = prel[id.getAttributeNS(R, 'id') || at(id, 'r:id')]; if (!r || !r.target || !zip.file(r.target)) continue;
    await read(r.target);
    const srel = await relsOf(r.target), lay = Object.values(srel).find(x => x.type === 'slideLayout');
    if (!lay || !lay.target || !(await read(lay.target))) continue;
    const lrel = await relsOf(lay.target), mas = Object.values(lrel).find(x => x.type === 'slideMaster');
    if (!mas || !mas.target || !(await read(mas.target))) continue;
    const mrel = await relsOf(mas.target), th = Object.values(mrel).find(x => x.type === 'theme');
    if (!th || !th.target || !(await read(th.target))) continue;
    const rels = {};
    for (const [k, v] of Object.entries(srel)) {
      rels[k] = v.target;
      if (v.type === 'image' && v.target && !(v.target in src.media) && zip.file(v.target)) {
        const ext = v.target.split('.').pop().toLowerCase();
        src.media[v.target] = MIME[ext] ? URL.createObjectURL(new Blob([await zip.file(v.target).async('uint8array')], { type: MIME[ext] })) : null;
      }
    }
    src.slides.push({ path: r.target, layout: lay.target, master: mas.target, theme: th.target, rels });
  }
  const core = 'docProps/core.xml'; if (zip.file(core)) await read(core);
  return src;
}

// ============================================================ dựng lại cả bộ (đồng bộ: gọi lại mỗi lần đổi mẫu)
class Restyler {
  constructor(src, th, opts) {
    this.src = src; this.th = th; this.opts = opts; this.SW = src.sw; this.SH = src.sh;
    this.docs = {};
    this.media = {};      // ảnh trang trí thêm vào gói: đường dẫn trong gói -> dữ liệu
    this.extraRels = {};  // trang -> { rId mới: đường dẫn ảnh }
    this.themes = {};
    for (const s of src.slides) if (!this.themes[s.theme]) { const root = this.doc(s.theme).documentElement; this.themes[s.theme] = { scheme: readScheme(root), fonts: readFonts(root) }; }
    this.mapper = new Mapper(th, this.bucketOrder());
  }
  doc(p) { return this.docs[p] || (this.docs[p] = parse(this.src.files[p])); }
  relsPath(s) { const i = s.path.lastIndexOf('/'); return s.path.slice(0, i) + '/_rels/' + s.path.slice(i + 1) + '.rels'; }
  /** Ảnh trang trí (kho-anh.js) vào trang gốc: thêm file ảnh vào gói và một quan hệ mới; trả về rId. */
  addMedia(s, img) {
    const target = 'ppt/media/' + img.id + '.' + img.ext, rels = this.doc(this.relsPath(s)), root = rels.documentElement;
    const ids = new Set(desc(root, 'Relationship').map(r => at(r, 'Id')));
    let n = 1; while (ids.has('rIdKA' + n)) n++;
    const r = rels.createElementNS(root.namespaceURI, 'Relationship');
    r.setAttribute('Id', 'rIdKA' + n);
    r.setAttribute('Type', R + '/image');
    r.setAttribute('Target', '../media/' + img.id + '.' + img.ext);
    root.appendChild(r);
    this.media[target] = img.data;
    (this.extraRels[s.path] = this.extraRels[s.path] || {})['rIdKA' + n] = target;
    this.src.media[target] = img.url;   // cho bản xem trước
    return 'rIdKA' + n;
  }
  root(p) { return this.doc(p).documentElement; }
  scheme(s) {
    const cm = kid(this.root(s.master), 'clrMap'), ov = path(this.root(s.path), 'clrMapOvr', 'overrideClrMapping');
    const attrs = el => el ? Object.fromEntries([...el.attributes].map(a => [a.name, a.value])) : {};
    return new Scheme(this.themes[s.theme].scheme, ov ? attrs(ov) : attrs(cm));
  }
  bucketOrder() {
    const cnt = {}, first = {}; let n = 0;
    for (const s of this.src.slides) {
      const sc = this.scheme(s);
      for (const el of this.root(s.path).getElementsByTagName('*')) {
        if (el.namespaceURI !== A || (el.localName !== 'solidFill' && el.localName !== 'gs')) continue;
        const c = sc.of(el);
        if (c && chroma(c[0]) >= 0.15) { const b = hueBucket(c[0]); cnt[b] = (cnt[b] || 0) + 1; if (!(b in first)) first[b] = n; n++; }
      }
    }
    return Object.keys(cnt).map(Number).sort((a, b) => cnt[b] - cnt[a] || first[a] - first[b]);
  }
  origBg(s, sc) {
    for (const p of [s.path, s.layout, s.master]) {
      const bg = path(this.root(p), 'cSld', 'bg'); if (!bg) continue;
      const pr = kid(bg, 'bgPr'); if (pr) { const c = sc.fill(fillEl(pr)); return c ? c[0] : 'FFFFFF'; }
      const ref = kid(bg, 'bgRef'); if (ref) { const c = sc.of(ref); return c ? c[0] : 'FFFFFF'; }
    }
    return 'FFFFFF';
  }
  run(kinds) {
    const out = { slides: [], files: {} };
    this.src.slides.forEach((s, i) => out.slides.push(this.slide(s, i, kinds[i] || 'content')));
    for (const p in this.themes) { this.restyleTheme(this.doc(p)); out.files[p] = serialize(this.doc(p)); }
    for (const s of this.src.slides) {
      out.files[s.path] = serialize(this.doc(s.path));
      if (this.extraRels[s.path]) out.files[this.relsPath(s)] = serialize(this.doc(this.relsPath(s)));
    }
    out.media = this.media;
    const core = this.src.files['docProps/core.xml'];
    if (core) {
      const sub = `<dc:subject>${T.pptxXml.esc('Giữ bố cục gốc – mẫu ' + this.th.name)}</dc:subject>`;
      out.files['docProps/core.xml'] = /<dc:subject[\s\S]*?(<\/dc:subject>|\/>)/.test(core) ? core.replace(/<dc:subject[\s\S]*?(<\/dc:subject>|\/>)/, sub) : core.replace('</cp:coreProperties>', sub + '</cp:coreProperties>');
    }
    return out;
  }
  restyleTheme(doc) {
    const th = this.th, root = doc.documentElement;
    const vals = { dk1: th.ink, lt1: th.bg, dk2: th.inv[0], lt2: th.bg2, accent1: th.accent, accent2: th.accent2, accent3: th.accent3,
      accent4: T.mix(th.accent, th.accent2, 0.5), accent5: T.mix(th.accent2, th.accent3, 0.5), accent6: T.mix(th.accent, th.ink, 0.35), hlink: th.accent, folHlink: th.muted };
    const cs = desc(root, 'clrScheme')[0];
    if (cs) for (const k in vals) { const el = kid(cs, k); if (el) { el.replaceChildren(); el.appendChild(srgb(doc, vals[k])); } }
    for (const [tag, face] of [['majorFont', th.head], ['minorFont', th.body_font]]) {
      const el = kid(desc(root, tag)[0], 'latin');
      if (el) { el.setAttribute('typeface', face); ['panose', 'pitchFamily', 'charset'].forEach(k => el.removeAttribute(k)); }
    }
  }

  // ---------- một trang
  slide(s, idx, kind) {
    const th = this.th, opts = this.opts, doc = this.doc(s.path), sld = doc.documentElement;
    const cSld = kid(sld, 'cSld'), tree = kid(cSld, 'spTree');
    const sc = this.scheme(s), bo = this.origBg(s, sc), inv = ['cover', 'section', 'closing'].includes(kind);
    const layout = this.root(s.layout), master = this.root(s.master);
    const styles = new Styles(this.root(this.src.pres), layout, master, this.themes[s.theme].fonts);
    const hadTiming = !!kid(sld, 'timing');
    const recs = walk(tree, layout, master);

    // 1. nền + trang trí của mẫu (vẽ xong thì dời xuống lớp dưới cùng)
    const ctx = new T.Ctx([], th, idx, inv ? kind : 'content', inv, opts);
    const bgEl = frag(doc, `<p:bg><p:bgPr>${T.pptxXml.fillXml(ctx.sl.bg.color ? { color: ctx.sl.bg.color } : { grad: ctx.sl.bg.grad, angle: ctx.sl.bg.angle, radial: ctx.sl.bg.radial })}<a:effectLst/></p:bgPr></p:bg>`)[0];
    const oldBg = kid(cSld, 'bg'); if (oldBg) oldBg.remove();
    cSld.insertBefore(bgEl, cSld.firstElementChild);
    let id = Math.max(1, ...desc(sld, 'cNvPr').map(e => int(e, 'id')));
    const added = frag(doc, ctx.sl.els.map(el => T.pptxXml.shapeXml(el, ++id, el.t === 'pic' ? this.addMedia(s, el.img) : null)).join(''));
    const ext = kid(tree, 'extLst');
    for (const el of added) tree.insertBefore(el, ext);
    this.placeDecor(tree, added);
    const bn = ctx.info.bg, tn = T.readable(bn, inv ? th.inv_ink : th.ink, th.ink, th.inv_ink);
    const st = { bo, bn, tn, inv };
    sld.setAttribute('showMasterSp', '0');   // ẩn hình trang trí của mẫu cũ (trong slide master)
    this.clrmap(doc, sld, bn);

    // 2. màu hình khối, đường kẻ
    for (const r of recs) this.shapeColors(r, st, sc);
    // 3. chữ (trong hình và trong bảng)
    for (const r of recs) {
      if (r.tag === 'sp') { const tx = kid(r.el, 'txBody'); if (tx && txt(tx).trim()) { r.text = true; this.textBody(tx, r, recs, st, sc, styles, r.box[2]); } }
      else if (r.tag === 'graphicFrame' && desc(r.el, 'tbl')[0]) { r.text = true; this.table(r, recs, st, sc, styles); }
      else if (r.tag === 'graphicFrame') r.text = true;   // biểu đồ, SmartArt: không đổi gì, chỉ tránh để họa tiết đè lên
    }
    // 4. họa tiết chạm vào chữ, ảnh thì làm mờ (ảnh phủ kín trang che hết họa tiết nên bỏ qua)
    const full = 0.85 * this.SW * this.SH;
    // ảnh trang trí (artN hình đầu) đã có lớp phủ đều cả trang nên không làm mờ; họa tiết vẽ sau vẫn làm mờ như thường
    this.softenDecor(added.slice(ctx.info.artN || 0), recs.filter(r => r.text || (r.pic && r.box[2] * r.box[3] < full)).map(r => r.box));
    // 5. animation (giữ animation có sẵn) + chuyển trang
    if (!hadTiming && (opts.anim || 'auto') !== 'none') {
      const steps = this.steps(tree, recs, added), ids = new Map();
      const st2 = steps.map(step => step.map(([r, eff]) => {
        const sp = r.tag === 'sp', tx = sp ? kid(r.el, 'txBody') : null, pr = kid(r.el, 'spPr');
        const el = { t: r.tag === 'pic' ? 'pic' : 'sp', text: sp && tx && txt(tx).trim() ? 1 : null, fill: !!(pr && (kid(pr, 'solidFill') || kid(pr, 'gradFill'))) };
        ids.set(el, at(path(r.el, [...r.el.children].find(c => c.localName.startsWith('nv')).localName, 'cNvPr'), 'id'));
        return { el, eff };
      }));
      const xml = T.pptxXml.timingXml(st2, ids, opts.anim || 'auto');
      if (xml) sld.insertBefore(frag(doc, xml)[0], kid(sld, 'extLst'));
    }
    for (const c of [...sld.children]) if (c.localName === 'transition' || c.localName === 'AlternateContent') c.remove();
    const tr = T.pptxXml.transitionXml(opts.transition || th.transition);
    if (tr) { const anchor = kid(sld, 'clrMapOvr') || cSld; sld.insertBefore(frag(doc, tr)[0], anchor.nextElementSibling); }
    return this.preview(s, sld, ctx.sl.bg, styles);
  }
  clrmap(doc, sld, bn) {
    const th = this.th, swap = T.contrast(bn, th.ink) < 3 && T.contrast(bn, th.bg) > T.contrast(bn, th.ink);
    let ovr = kid(sld, 'clrMapOvr');
    if (!ovr) { ovr = doc.createElementNS(P, 'p:clrMapOvr'); sld.insertBefore(ovr, kid(sld, 'cSld').nextElementSibling); }
    ovr.replaceChildren(swap ? mk(doc, 'overrideClrMapping', { bg1: 'dk1', tx1: 'lt1', bg2: 'dk2', tx2: 'lt2', accent1: 'accent1', accent2: 'accent2',
      accent3: 'accent3', accent4: 'accent4', accent5: 'accent5', accent6: 'accent6', hlink: 'hlink', folHlink: 'folHlink' }) : mk(doc, 'masterClrMapping'));
  }
  // ---------- trang trí: co giãn theo khổ trang, đặt dưới cùng
  placeDecor(tree, added) {
    const W0 = _r(T.SW * EMU), H0 = _r(T.SH * EMU), sx = this.SW / W0, sy = this.SH / H0;
    if (Math.abs(sx - 1) > 1e-6 || Math.abs(sy - 1) > 1e-6) {
      const s = Math.min(sx, sy);
      for (const el of added) {
        const x = xfrmOf(el); if (!x || !kid(x, 'off')) continue;
        const o = kid(x, 'off'), e = kid(x, 'ext');
        let X = int(o, 'x'), Y = int(o, 'y'), Wd = int(e, 'cx'), Hd = int(e, 'cy');
        if (Wd > 0.6 * W0 || Hd > 0.6 * H0) { X *= sx; Y *= sy; Wd *= sx; Hd *= sy; }   // hình trải ngang/dọc trang: kéo theo khổ
        else { const cx = (X + Wd / 2) * sx, cy = (Y + Hd / 2) * sy; Wd *= s; Hd *= s; X = cx - Wd / 2; Y = cy - Hd / 2; }   // hình gọn: giữ tỉ lệ
        o.setAttribute('x', String(_r(X))); o.setAttribute('y', String(_r(Y)));
        e.setAttribute('cx', String(Math.max(1, _r(Wd)))); e.setAttribute('cy', String(Math.max(1, _r(Hd))));
      }
    }
    let after = kid(tree, 'grpSpPr').nextElementSibling;   // hình gốc đầu tiên (hoặc extLst)
    while (after && added.includes(after)) after = after.nextElementSibling;
    for (const el of added) tree.insertBefore(el, after);
  }
  softenDecor(added, boxes) {
    const pad = Math.floor(0.04 * EMU);
    for (const el of added) {
      const x = xfrmOf(el); if (!x || !kid(x, 'off')) continue;
      const o = kid(x, 'off'), e = kid(x, 'ext'), box = [int(o, 'x'), int(o, 'y'), int(e, 'cx'), int(e, 'cy')];
      const spPr = kid(el, 'spPr'), f = fillEl(spPr);
      const strong = !!f && (f.localName === 'solidFill' || f.localName === 'gradFill') && desc(f, 'srgbClr').some(c => alphaOf(c) > 0.3);
      const hasText = !!txt(kid(el, 'txBody')).trim();
      const inner = [box[0] + pad * 2, box[1] + pad * 2, box[2] - pad * 4, box[3] - pad * 4];
      const hit = boxes.some(b => overlap(box, b) > 0.02 * EMU * EMU && (strong || hasText ||
        !(inner[0] <= b[0] && inner[1] <= b[1] && b[0] + b[2] <= inner[0] + inner[2] && b[1] + b[3] <= inner[1] + inner[3])));   // khung viền: chỉ khi chữ cắt qua viền
      if (!hit) continue;
      if (hasText) { el.remove(); continue; }
      for (const c of desc(spPr, 'srgbClr')) {
        let inLn = false; for (let p = c.parentNode; p && p !== spPr; p = p.parentNode) if (p.localName === 'ln') inLn = true;
        const cap = Math.min(alphaOf(c), inLn ? 0.3 : 0.18);
        let a = kid(c, 'alpha'); if (!a) { a = mk(c.ownerDocument, 'alpha'); c.appendChild(a); }
        a.setAttribute('val', String(_r(cap * 100000)));
      }
    }
  }
  // ---------- màu hình
  shapeColors(r, s, sc) {
    const el = r.el, M = this.mapper, doc = el.ownerDocument;
    if (r.tag === 'pic') { r.pic = true; this.line(kid(el, 'spPr'), el, s, sc); return; }
    if (!['sp', 'cxnSp', 'grpSp'].includes(r.tag)) return;
    const spPr = kid(el, r.tag === 'grpSp' ? 'grpSpPr' : 'spPr'); if (!spPr) return;
    let f = fillEl(spPr);
    const style = kid(el, 'style');
    if (!f && style && r.tag === 'sp') {
      const ref = kid(style, 'fillRef');
      if (ref && !['0', '1000'].includes(at(ref, 'idx', '0'))) { const c = sc.of(ref); if (c) f = put(spPr, solid(doc, c[0], c[1]), SPPR_ORDER); }
    }
    if (f) {
      if (f.localName === 'blipFill') r.pic = true;
      else if (f.localName === 'solidFill') {
        const c = sc.of(f);
        if (c) {
          if (this.isBackdrop(r, spPr)) put(spPr, mk(doc, 'noFill'), SPPR_ORDER);
          else { const nw = M.fill(c[0], s); setColor(f, nw, c[1]); r.fillOld = c[0]; r.fillNew = nw; r.alpha = c[1] != null ? c[1] : 1; }
        }
      } else if (f.localName === 'gradFill') {
        const avg = sc.fill(f);
        if (avg && this.isBackdrop(r, spPr)) put(spPr, mk(doc, 'noFill'), SPPR_ORDER);
        else {
          const news = [];
          for (const gs of desc(f, 'gs')) { const c = sc.of(gs); if (c) { const nw = M.fill(c[0], s); setColor(gs, nw, c[1]); news.push(nw); } }
          if (avg && news.length) { r.fillOld = avg[0]; r.fillNew = hexOf([0, 1, 2].map(i => news.reduce((t, n) => t + rgbOf(n)[i], 0) / news.length)); r.alpha = avg[1]; }
        }
      }
    }
    if (r.tag !== 'grpSp') this.line(spPr, el, s, sc);
  }
  /** Mảng màu phủ gần kín trang, không chữ: là nền của mẫu cũ => bỏ để lộ nền mới. */
  isBackdrop(r, spPr) {
    const geom = kid(spPr, 'prstGeom');
    if (r.tag !== 'sp' || !geom || at(geom, 'prst') !== 'rect' || txt(kid(r.el, 'txBody')).trim()) return false;
    const [x, y, w, h] = r.box;
    return Math.max(0, Math.min(x + w, this.SW) - Math.max(x, 0)) * Math.max(0, Math.min(y + h, this.SH) - Math.max(y, 0)) >= 0.92 * this.SW * this.SH;
  }
  line(spPr, el, s, sc) {
    if (!spPr) return;
    let ln = kid(spPr, 'ln'); const f = ln ? fillEl(ln) : null;
    if (f) {
      if (f.localName === 'solidFill') { const c = sc.of(f); if (c) setColor(f, this.mapper.fill(c[0], s), c[1]); }
      else if (f.localName === 'gradFill') for (const gs of desc(f, 'gs')) { const c = sc.of(gs); if (c) setColor(gs, this.mapper.fill(c[0], s), c[1]); }
      return;
    }
    const ref = kid(kid(el, 'style'), 'lnRef');
    if (ref && at(ref, 'idx', '0') !== '0') {
      const c = sc.of(ref);
      if (c) { if (!ln) ln = put(spPr, mk(el.ownerDocument, 'ln'), SPPR_ORDER); ln.insertBefore(solid(el.ownerDocument, this.mapper.fill(c[0], s), c[1]), ln.firstChild); }
    }
  }
  // ---------- chữ
  /** Nền ngay dưới chữ: [màu gốc, màu mới] hoặc null nếu chữ nằm trên ảnh (giữ màu chữ gốc). */
  effBg(r, recs, s) {
    if (r.pic) return null;
    if (r.fillOld && r.alpha >= 0.5) return [r.fillOld, r.fillNew];
    const [x, y, w, h] = r.box, cx = x + w / 2, cy = y + h / 2;
    for (let i = r.z - 1; i >= 0; i--) {
      const q = recs[i];
      if (q.tag === 'grpSp' || !contains(q.box, cx, cy)) continue;
      if (q.pic) return null;
      if (q.fillOld && q.alpha >= 0.5) return [q.fillOld, q.fillNew];
    }
    return [s.bo, s.bn];
  }
  /** widthEmu: bề rộng hộp; trong bảng (cell) là bề rộng ô đã trừ lề ô, eff là nền ô (null: ô trên ảnh). */
  textBody(tx, r, recs, s, sc, styles, widthEmu, eff = null, cell = false) {
    const th = this.th, M = this.mapper, doc = tx.ownerDocument;
    if (!cell) eff = this.effBg(r, recs, s);
    const keep = eff == null, bp = kid(tx, 'bodyPr');
    if (bp && (at(bp, 'wrap') === 'none' || ![null, 'horz'].includes(at(bp, 'vert')))) widthEmu = 0;   // không xuống dòng hoặc chữ dọc: không đo
    else if (!cell) widthEmu -= int(bp, 'lIns', 91440) + int(bp, 'rIns', 91440);
    const na = kid(bp, 'normAutofit'), scale = na && at(na, 'fontScale') ? int(na, 'fontScale') / 100000 : 1;
    const titlePh = !!r.ph && (r.ph[0] === 'title' || r.ph[0] === 'ctrTitle');
    const stl = r.tag === 'sp' ? kid(r.el, 'style') : null, base = stl && kid(stl, 'fontRef') ? sc.of(kid(stl, 'fontRef')) : null;
    const plan = [];
    for (const p of kids(tx, 'p')) {
      const pPr = kid(p, 'pPr'), level = int(pPr, 'lvl'), chain = styles.chain(tx, r.ph, level);
      const runs = [...p.children].filter(c => c.localName === 'r' || c.localName === 'fld');
      const text = [...p.children].filter(c => ['r', 'fld', 'br'].includes(c.localName)).map(c => c.localName === 'br' ? '\n' : (kid(c, 't') ? kid(c, 't').textContent : '')).join('');
      const sizes = [], faces = [], bolds = [];
      for (const rn of runs) {
        const rPr = kid(rn, 'rPr'), sz = Styles.attr(rPr, chain, 'sz');
        sizes.push(sz ? parseInt(sz, 10) / 100 : 18); faces.push(styles.face(rPr, chain, r.ph)); bolds.push(['1', 'true'].includes(Styles.attr(rPr, chain, 'b')));
      }
      const size = sizes.length ? Math.max(...sizes) : 18;
      const role = titlePh || size * scale >= 28 ? 'title' : 'body', font = role === 'title' ? th.head : th.body_font;
      if (!keep) { const bc = kid(pPr, 'buClr'); if (bc && sc.of(bc)) setColor(bc, M.text(sc.of(bc)[0], 'body', eff[1], eff[0], size * scale, false)); }
      // phông gốc máy không có (không đo được) hoặc phông ký hiệu: giữ nguyên để không vỡ bố cục
      const keepFace = faces.map(f => SYMBOL_FONT_RE.test(f || '') || !fontFamily(f));
      runs.forEach((rn, k) => {
        let rPr = kid(rn, 'rPr'); if (!rPr) { rPr = mk(doc, 'rPr'); rn.insertBefore(rPr, rn.firstChild); }
        this.styleRun(rPr, sc, role, eff, keep, sizes[k] * scale, bolds[k], keepFace[k] ? null : font, chain, base);
      });
      const end = kid(p, 'endParaRPr');
      if (end) {
        const f0 = faces.length ? faces[0] : styles.face(end, chain, r.ph);
        const kf = keepFace.length ? keepFace[0] : (SYMBOL_FONT_RE.test(f0 || '') || !fontFamily(f0));
        this.styleRun(end, sc, role, eff, keep, size * scale, bolds.length ? bolds[0] : false, kf ? null : font, chain, base);
      }
      const changed = keepFace.map((kf, k) => kf ? -1 : k).filter(k => k >= 0);
      if (text.trim() && changed.length) {
        const marl = pPr && at(pPr, 'marL') ? at(pPr, 'marL') : (chain.map(lv => at(lv, 'marL')).find(v => v) || '0');
        const r0 = runs.length ? kid(runs[0], 'rPr') : null;
        const t2 = ['all', 'small'].includes(Styles.attr(r0, chain, 'cap')) ? text.toUpperCase() : text;
        const spc = parseInt(Styles.attr(r0, chain, 'spc') || '0', 10) / 100;   // giãn chữ (pt mỗi ký tự)
        plan.push({ size, face0: faces[changed[0]], face1: font, bold: bolds.some(Boolean), marl: parseInt(marl, 10), text: t2, runs, end, sizes, spc });
      }
    }
    this.keepLines(plan, widthEmu / EMU, scale);
  }
  /** Tô màu một run theo mẫu; font = null: giữ phông gốc. */
  styleRun(rPr, sc, role, eff, keep, size, bold, font, chain, base) {
    const doc = rPr.ownerDocument, f = fillEl(rPr);
    if (keep) {   // chữ nằm trên ảnh: giữ đúng màu gốc (ghi rõ ra để không đổi theo bảng màu theme mới)
      if (!f) {
        const lv = chain.find(l => path(l, 'defRPr', 'solidFill'));
        const c = (lv ? sc.of(path(lv, 'defRPr', 'solidFill')) : null) || base || sc.named('tx1');
        if (c) put(rPr, solid(doc, c[0], c[1]), RPR_ORDER);
      } else if (f.localName === 'solidFill' && sc.of(f)) { const c = sc.of(f); setColor(f, c[0], c[1]); }
    } else {
      const c = f && (f.localName === 'solidFill' || f.localName === 'gradFill') ? sc.fill(f) : null;
      if (!(f && f.localName === 'noFill')) put(rPr, solid(doc, this.mapper.text(c ? c[0] : null, role, eff[1], eff[0], size, bold), c ? c[1] : null), RPR_ORDER);
    }
    if (font) {
      let lat = kid(rPr, 'latin'); if (!lat) lat = put(rPr, mk(doc, 'latin'), RPR_ORDER);
      lat.setAttribute('typeface', font); ['panose', 'pitchFamily', 'charset'].forEach(k => lat.removeAttribute(k));
      const cs = kid(rPr, 'cs'); if (cs) cs.setAttribute('typeface', font);
    }
  }
  /** Phông mới rộng hơn làm chữ xuống thêm dòng => thu nhỏ chữ vừa đủ để giữ số dòng như bản gốc. */
  keepLines(plan, width, scale) {
    if (!plan.length || width <= 0.3) return;
    // bản gốc: đo đúng bề rộng (PowerPoint đã ngắt dòng như vậy); bản mới: chừa 1,5% cho chắc
    const lines = (useNew, f) => plan.reduce((n, q) => {
      const w = Math.max(0.3, width - q.marl / EMU);
      if (useNew) return n + nLines(q.text, q.face1, q.size * scale * f, w, q.bold, 0.985, q.spc);
      const [fam, b] = fontFamily(q.face0);
      return n + nLines(q.text, fam, q.size * scale, w, q.bold || b, 1, q.spc);
    }, 0);
    const base = lines(false, 1);
    if (lines(true, 1) <= base) return;
    const pick = [0.95, 0.9, 0.85, 0.8, 0.75, 0.7].find(f => lines(true, f) <= base) || 0.7;
    for (const q of plan) {
      q.runs.forEach((rn, k) => kid(rn, 'rPr').setAttribute('sz', String(Math.max(100, _r(q.sizes[k] * pick * 100)))));
      if (q.end) q.end.setAttribute('sz', String(Math.max(100, _r(q.size * pick * 100))));
    }
  }
  // ---------- bảng
  table(r, recs, s, sc, styles) {
    const th = this.th, M = this.mapper, tbl = desc(r.el, 'tbl')[0], doc = tbl.ownerDocument, pr = kid(tbl, 'tblPr');
    const under = this.effBg(r, recs, s);   // null: bảng nằm trên ảnh => ô không tô màu giữ nguyên màu chữ, màu viền
    const styled = !!kid(pr, 'tableStyleId'), first = ['1', 'true'].includes(at(pr, 'firstRow')), band = ['1', 'true'].includes(at(pr, 'bandRow'));
    const cols = desc(tbl, 'gridCol').map(g => int(g, 'w')), head = s.inv ? th.inv_accent : th.accent;
    kids(tbl, 'tr').forEach((tr, i) => {
      let ci = 0;
      for (const tc of kids(tr, 'tc')) {
        const span = int(tc, 'gridSpan', 1), w = cols.slice(ci, ci + span).reduce((a, b) => a + b, 0) || (ci < cols.length ? cols[ci] : r.box[2]);
        ci += span;
        if (at(tc, 'hMerge') || at(tc, 'vMerge')) continue;
        let tcPr = kid(tc, 'tcPr');
        if (!tcPr) { tcPr = mk(doc, 'tcPr'); const tx = kid(tc, 'txBody'); tc.insertBefore(tcPr, tx ? tx.nextElementSibling : tc.firstChild); }
        const f = fillEl(tcPr), c = f ? sc.fill(f) : null;
        let old, nw;
        if (c) { old = c[0]; nw = M.fill(c[0], s); put(tcPr, solid(doc, nw, c[1]), TCPR_ORDER); }
        else if ((f && f.localName === 'noFill') || !styled) [old, nw] = under || [null, null];
        else {   // ô theo kiểu bảng của theme: tô màu rõ ràng như bảng của công cụ
          if (first && i === 0) { old = '000000'; nw = head; }
          else { nw = !band || i % 2 ? th.card : T.mix(th.accent, th.card, 0.92); old = 'FFFFFF'; }
          put(tcPr, solid(doc, nw), TCPR_ORDER);
        }
        for (const side of old ? ['lnL', 'lnR', 'lnT', 'lnB'] : []) {
          const lf = fillEl(kid(tcPr, side));
          if (lf && lf.localName === 'solidFill' && sc.of(lf)) { const cc = sc.of(lf); setColor(lf, M.fill(cc[0], s), cc[1]); }
        }
        const tx = kid(tc, 'txBody');
        if (tx && txt(tx).trim()) {
          const mar = int(tcPr, 'marL', 91440) + int(tcPr, 'marR', 91440);
          this.textBody(tx, Object.assign({}, r, { ph: null, top: false }), [], s, sc, styles, w - mar, old ? [old, nw] : null, true);
        }
      }
    });
  }
  // ---------- animation: các khối nội dung theo thứ tự đọc (trên xuống, trái sang)
  steps(tree, recs, added) {
    const th = this.th, opts = this.opts, cands = [];
    for (const r of recs) {
      if (!r.top || r.el.parentNode !== tree || added.includes(r.el)) continue;
      if (r.ph && ['sldNum', 'dt', 'ftr'].includes(r.ph[0])) continue;
      const [x, y, w, h] = r.box;
      if (w <= 0 || h <= 0 || x >= this.SW || y >= this.SH || x + w <= 0 || y + h <= 0) continue;
      const has = r.text || r.tag === 'pic' || r.tag === 'graphicFrame' || (r.tag === 'grpSp' && (desc(r.el, 't').some(t => t.namespaceURI === A) || desc(r.el, 'pic').length));
      if (!has || (r.tag === 'sp' && !r.text)) continue;
      if (w * h >= 0.85 * this.SW * this.SH) continue;   // ảnh/khối phủ kín trang: là nền, không cho bay vào
      cands.push(r);
    }
    if (!cands.length) return [];
    cands.sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
    const ti = cands.findIndex(r => r.ph && (r.ph[0] === 'title' || r.ph[0] === 'ctrTitle'));
    const title = ti >= 0 ? cands.splice(ti, 1)[0] : null;
    const eff = opts.effect || th.effect, steps = [];
    let band = null;
    for (const r of cands) {
      if (steps.length && r.box[1] < band + 0.06 * this.SH) steps[steps.length - 1].push([r, eff]);
      else { steps.push([[r, eff]]); band = r.box[1]; }
    }
    while (steps.length > 7) { const last = steps.pop(); steps[steps.length - 1].push(...last); }
    if (title) steps.unshift([[title, 'fade']]);
    return steps;
  }

  // ---------- xem trước: đổi trang đã khoác mẫu thành IR để preview.js vẽ (khung 13,333 × 7,5 inch)
  preview(s, sld, bg, styles) {
    const kx = T.SW / (this.SW / EMU), ky = T.SH / (this.SH / EMU);
    const X = v => v / EMU * kx, Y = v => v / EMU * ky;
    const tree = path(sld, 'cSld', 'spTree'), els = [];
    const clr = (parent, d = null) => { const c = parent ? [...parent.children].find(e => e.localName === 'srgbClr') : null; return c ? at(c, 'val') : d; };
    const fillOf = f => {
      if (!f) return null;
      if (f.localName === 'solidFill') { const c = kid(f, 'srgbClr'); return c ? { color: at(c, 'val'), alpha: alphaOf(c) } : null; }
      if (f.localName === 'gradFill') {
        const gs = desc(f, 'gs').map(g => kid(g, 'srgbClr')).filter(Boolean); if (!gs.length) return null;
        const lin = kid(f, 'lin');
        return { grad: gs.map(c => at(c, 'val')), alphas: gs.map(alphaOf), angle: lin ? int(lin, 'ang') / 60000 : 90, radial: !!kid(f, 'path') };
      }
      return null;
    };
    const lineOf = spPr => {
      const ln = kid(spPr, 'ln'), f = ln ? kid(ln, 'solidFill') : null, c = f ? kid(f, 'srgbClr') : null;
      return c ? { color: at(c, 'val'), alpha: alphaOf(c), w: int(ln, 'w', 9525) / 12700 } : null;
    };
    const textOf = (tx, ph, bx) => {
      const bp = kid(tx, 'bodyPr'), na = kid(bp, 'normAutofit'), k = na && at(na, 'fontScale') ? int(na, 'fontScale') / 100000 : 1;
      const paras = kids(tx, 'p').map(p => {
        const pPr = kid(p, 'pPr'), chain = styles.chain(tx, ph, int(pPr, 'lvl'));
        const pa = n => (pPr && pPr.hasAttribute(n)) ? pPr.getAttribute(n) : (chain.map(lv => at(lv, n)).find(v => v != null) || null);
        const runs = [...p.children].filter(c => ['r', 'fld', 'br'].includes(c.localName)).map(c => {
          if (c.localName === 'br') return { t: '\n', font: 'Segoe UI', size: 1, bold: false, italic: false, color: '000000' };
          const rPr = kid(c, 'rPr'), sz = Styles.attr(rPr, chain, 'sz'), t = kid(c, 't') ? kid(c, 't').textContent : '';
          return { t: ['all', 'small'].includes(Styles.attr(rPr, chain, 'cap')) ? t.toUpperCase() : t, font: styles.face(rPr, chain, ph),
            size: (sz ? parseInt(sz, 10) / 100 : 18) * k * ky, bold: ['1', 'true'].includes(Styles.attr(rPr, chain, 'b')),
            italic: ['1', 'true'].includes(Styles.attr(rPr, chain, 'i')), color: clr(kid(rPr, 'solidFill'), '222222') };
        });
        const end = kid(p, 'endParaRPr'), szEnd = Styles.attr(end, chain, 'sz');
        if (!runs.length) runs.push({ t: '', font: 'Segoe UI', size: (szEnd ? parseInt(szEnd, 10) / 100 : 18) * k * ky, bold: false, italic: false, color: '000000' });
        const size = Math.max(...runs.map(r => r.size)), lp = path(pPr, 'lnSpc', 'spcPct'), pct = lp ? int(lp, 'val') / 100000 : 1;
        const bu = pPr && kid(pPr, 'buNone') ? null : (kid(pPr, 'buChar') || chain.map(lv => kid(lv, 'buChar')).find(Boolean));
        const has = runs.some(r => r.t.trim());
        return { runs, align: { ctr: 'c', r: 'r', just: 'j', dist: 'j' }[pa('algn')] || 'l', ln: Math.round(size * 1.2 * pct * 10) / 10, after: 0,
          bullet: bu && has ? { char: at(bu, 'char', '•'), color: clr(kid(pPr, 'buClr'), runs[0].color), indent: X(parseInt(pa('marL') || '0', 10)) } : null };
      });
      return { paras, anchor: { ctr: 'm', b: 'b' }[at(bp, 'anchor')] || 't', margin: X(int(bp, 'lIns', 91440)) };
    };
    const pathPts = (el, bx) => {
      const geo = path(el, 'spPr', 'custGeom'), rings = []; let closed = false;
      for (const pth of desc(geo, 'path')) {
        const pw = int(pth, 'w', 0) || bx[2] || 1, phh = int(pth, 'h', 0) || bx[3] || 1;
        const pt = e => [X(bx[0] + int(e, 'x') / pw * bx[2]), Y(bx[1] + int(e, 'y') / phh * bx[3])];
        let ring = null, cur = null;
        for (const c of pth.children) {
          const pts = kids(c, 'pt').map(pt);
          if (c.localName === 'moveTo') { ring = [pts[0]]; rings.push(ring); cur = pts[0]; }
          else if (c.localName === 'lnTo' && ring) { ring.push(pts[0]); cur = pts[0]; }
          else if ((c.localName === 'cubicBezTo' || c.localName === 'quadBezTo') && ring && cur) {
            const ctl = [cur, ...pts];
            for (let i = 1; i <= 8; i++) {
              const t = i / 8, u = 1 - t;
              ring.push(ctl.length === 4 ? [0, 1].map(j => u * u * u * ctl[0][j] + 3 * u * u * t * ctl[1][j] + 3 * u * t * t * ctl[2][j] + t * t * t * ctl[3][j])
                : [0, 1].map(j => u * u * ctl[0][j] + 2 * u * t * ctl[1][j] + t * t * ctl[2][j]));
            }
            cur = pts[pts.length - 1];
          } else if (c.localName === 'close') closed = true;
        }
      }
      return { rings: rings.filter(r => r.length > 1), closed };
    };
    const shapes = walk(tree, this.root(s.layout), this.root(s.master));
    for (const r of shapes) {
      const el = r.el, b = r.box, x = X(b[0]), y = Y(b[1]), w = X(b[2]), h = Y(b[3]);
      if (r.tag === 'grpSp') continue;
      const xf = xfrmOf(el), rot = xf ? int(xf, 'rot') / 60000 : 0;
      if (r.tag === 'pic' || (r.tag === 'sp' && kid(kid(el, 'spPr'), 'blipFill'))) {
        const blip = desc(el, 'blip')[0], rid = blip ? (blip.getAttributeNS(R, 'embed') || at(blip, 'r:embed')) : null, url = rid ? this.src.media[s.rels[rid] || (this.extraRels[s.path] || {})[rid]] : null;
        const sr = desc(el, 'srcRect')[0];
        const crop = sr ? { l: int(sr, 'l') / 100000, t: int(sr, 't') / 100000, r: int(sr, 'r') / 100000, b: int(sr, 'b') / 100000 } : null;
        els.push({ t: 'pic', img: { url }, x, y, w, h, crop: crop && (crop.l || crop.t || crop.r || crop.b) ? crop : null, radius: 0 });
        continue;
      }
      if (r.tag === 'graphicFrame') {
        const tbl = desc(el, 'tbl')[0];
        if (!tbl) { els.push({ t: 'shape', x, y, w, h, geom: 'rect', fill: { color: 'F2F2F2', alpha: 0.6 }, line: { color: 'BFBFBF', w: 0.75 }, rot: 0 }); continue; }
        const cols = desc(tbl, 'gridCol').map(g => X(int(g, 'w')));
        const rows = kids(tbl, 'tr').map(tr => ({ h: Y(int(tr, 'h')), cells: kids(tr, 'tc').filter(tc => !at(tc, 'hMerge')).map(tc => {
          const tp = textOf(kid(tc, 'txBody') || tc, null, b), r0 = tp.paras.flatMap(p => p.runs).find(q => q.t.trim()) || tp.paras[0].runs[0];
          const fc = clr(kid(kid(tc, 'tcPr'), 'solidFill'), null), span = int(tc, 'gridSpan', 1);
          return { text: tp.paras.map(p => p.runs.map(q => q.t).join('')).join('\n'), fill: fc || bg.color || (bg.grad && bg.grad[0]) || 'FFFFFF',
            color: r0 ? r0.color : '222222', font: r0 ? r0.font : 'Segoe UI', size: r0 ? r0.size : 14, bold: r0 ? r0.bold : false, span, hidden: !!at(tc, 'vMerge') };
        }) }));
        els.push({ t: 'table', x, y, w, cols, rows });
        continue;
      }
      const spPr = kid(el, 'spPr'), tx = kid(el, 'txBody'), hasText = !!txt(tx).trim();
      const fill = fillOf(fillEl(spPr)), line = lineOf(spPr), prst = at(kid(spPr, 'prstGeom'), 'prst');
      if (kid(spPr, 'custGeom')) {
        const { rings, closed } = pathPts(el, b);
        if (rings.length && (fill || line)) els.push({ t: 'poly', pts: rings, closed, fill: closed ? (fill && fill.color ? fill : (fill && fill.grad ? { color: fill.grad[0], alpha: fill.alphas[0] } : null)) : null, line });
        if (hasText) els.push({ t: 'text', x, y, w, h, text: textOf(tx, r.ph, b) });
        continue;
      }
      if (prst && /line|connector/i.test(prst)) {
        if (line) {
          const fh = at(xf, 'flipH') === '1', fv = at(xf, 'flipV') === '1';
          els.push({ t: 'poly', pts: [[fh ? x + w : x, fv ? y + h : y], [fh ? x : x + w, fv ? y : y + h]], closed: false, fill: null, line });
        }
        continue;
      }
      if (!fill && !line && !hasText) continue;
      const adj = desc(kid(spPr, 'prstGeom'), 'gd')[0];
      els.push({ t: 'shape', x, y, w, h, geom: ['ellipse', 'roundRect', 'diamond', 'rightArrow'].includes(prst) ? prst : 'rect',
        adj: prst === 'roundRect' ? (adj ? parseInt((at(adj, 'fmla') || 'val 16667').split(' ')[1], 10) / 100000 : 0.16667) : null,
        fill, line, rot, text: hasText ? textOf(tx, r.ph, b) : null });
    }
    return { bg, els };
  }
}

// ============================================================ loại trang: bìa, chương, kết (nền đậm) hay nội dung
function slideKinds(rs, deck) {
  const raw = [{ title: deck.title, items: [], images: [], table: null }].concat(deck.slides), n = rs.src.slides.length;
  return rs.src.slides.map((s, i) => {
    const sl = raw[i] || { title: '', items: [], images: [], table: null };
    const bg = rs.origBg(s, rs.scheme(s));
    const dark = lightness(bg) < 0.45 || (chroma(bg) >= 0.3 && lightness(bg) < 0.75);   // nền tối hoặc nền màu đậm
    const texts = [sl.title].concat(sl.items.map(it => it.text));
    if (i === 0) return 'cover';
    if (i === n - 1 && texts.some(t => T.CLOSING_RE.test(t || '') && (t || '').length < 80)) return 'closing';
    if (dark || (sl.title && !sl.items.length && !sl.images.length && !sl.table && i < n - 1)) return 'section';
    return 'content';
  });
}

/** Khoác mẫu lên file gốc: trả về { keep: true, slides (IR xem trước), files (XML đã đổi), theme, title }. */
function keepBuild(src, deck, th, opts = {}) {
  if (opts.khoAnh && T.khoAnhPlan) opts = Object.assign({}, opts, { _art: T.khoAnhPlan(deck, th, opts, src.sw / src.sh) });
  const rs = new Restyler(src, th, opts), out = rs.run(slideKinds(rs, deck));
  return { keep: true, title: deck.title, fileName: deck.fileName, theme: th, slides: out.slides, files: out.files, media: out.media };
}
async function keepToPptx(src, result) {
  const zip = await JSZip.loadAsync(src.buf);
  for (const [p, xml] of Object.entries(result.files)) zip.file(p, xml);
  const media = Object.entries(result.media || {});
  for (const [p, data] of media) zip.file(p, data);
  if (media.length) {   // khai báo kiểu ảnh .jpg nếu file gốc chưa có
    const ctp = '[Content_Types].xml', ct = await zip.file(ctp).async('string');
    if (!/Extension="jpg"/i.test(ct)) zip.file(ctp, ct.replace(/(<Types[^>]*>)/, '$1<Default Extension="jpg" ContentType="image/jpeg"/>'));
  }
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', compression: 'DEFLATE' });
}

Object.assign(T, { loadSource, keepBuild, keepToPptx });
})(window);
