/* Tự dàn trang — vẽ xem trước một trang IR bằng HTML/SVG (gần đúng bản PowerPoint). */
(function (G) {
'use strict';
const T = G.TuDanTrang;
const PX = 96;                       // 1 inch = 96px trên khung 1280x720
const rgba = (h, a) => { h = h.replace('#', ''); const n = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); return `rgba(${n[0]},${n[1]},${n[2]},${a == null ? 1 : a})`; };
function cssFill(f) {
  if (!f) return 'transparent';
  if (f.grad) {
    const n = f.grad.length, al = f.alphas || [];
    const stops = f.grad.map((c, i) => `${rgba(c, al[i])} ${Math.round(i * 100 / Math.max(n - 1, 1))}%`).join(',');
    return f.radial ? `radial-gradient(circle at 50% 50%, ${stops.replace(/ (\d+)%/g, (m, p) => ' ' + (p * 0.5) + '%')})` : `linear-gradient(${90 + (f.angle || 0)}deg, ${stops})`;
  }
  return rgba(f.color, f.alpha);
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function textHtml(spec) {
  const jc = { t: 'flex-start', m: 'center', b: 'flex-end' }[spec.anchor] || 'flex-start';
  const ps = spec.paras.map(p => {
    const al = { l: 'left', c: 'center', r: 'right', j: 'justify' }[p.align] || 'left';
    const ind = p.bullet ? p.bullet.indent * PX : 0;
    const bullet = p.bullet ? `<span style="position:absolute;left:0;color:#${p.bullet.color}">${esc(p.bullet.char)}</span>` : '';
    const runs = p.runs.map(r => `<span style="font-family:'${r.font}',sans-serif;font-size:${r.size * PX / 72}px;font-weight:${r.bold ? 700 : 400};font-style:${r.italic ? 'italic' : 'normal'};color:#${r.color}">${esc(r.t)}</span>`).join('');
    // cỡ chữ của khối = cỡ lớn nhất trong đoạn, để dòng không bị giãn bởi cỡ chữ mặc định của trang
    const fs = Math.max(...p.runs.map(r => r.size)) * PX / 72, ff = p.runs.length ? p.runs[0].font : 'Segoe UI';
    return `<div style="position:relative;text-align:${al};font-family:'${ff}',sans-serif;font-size:${fs}px;line-height:${p.ln * PX / 72}px;padding-left:${ind}px;white-space:pre-wrap;word-wrap:break-word">${bullet}${runs}</div>`;
  }).join('');
  return `<div style="position:absolute;inset:${(spec.margin || 0) * PX}px;display:flex;flex-direction:column;justify-content:${jc}">${ps}</div>`;
}
function render(sl, width = 320) {
  const k = width / 1280;
  const outer = document.createElement('div');
  outer.className = 'tdt-thumb';
  outer.style.cssText = `width:${width}px;height:${width * 9 / 16}px;position:relative;overflow:hidden;border-radius:8px;flex:none`;
  const s = document.createElement('div');
  s.style.cssText = `position:absolute;left:0;top:0;width:1280px;height:720px;transform:scale(${k});transform-origin:0 0;overflow:hidden;background:${sl.bg ? (sl.bg.color ? '#' + sl.bg.color : cssFill({ grad: sl.bg.grad, angle: sl.bg.angle, radial: sl.bg.radial })) : '#fff'}`;
  let html = '';
  for (const el of sl.els) {
    const box = `left:${el.x * PX}px;top:${el.y * PX}px;width:${el.w * PX}px;height:${el.h * PX}px`;
    if (el.t === 'shape') {
      let rad = '0';
      if (el.geom === 'ellipse') rad = '50%'; else if (el.geom === 'roundRect') rad = (Math.min(el.w, el.h) * PX * el.adj) + 'px';
      const clip = el.geom === 'diamond' ? 'clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);' : el.geom === 'rightArrow' ? 'clip-path:polygon(0 30%,60% 30%,60% 0,100% 50%,60% 100%,60% 70%,0 70%);' : '';
      const bd = el.line ? `border:${el.line.w * PX / 72}px solid ${rgba(el.line.color, el.line.alpha)};` : '';
      const sh = el.shadow ? `box-shadow:0 ${el.shadow.dist * 1.3}px ${el.shadow.blur * 1.3}px ${rgba(el.shadow.color, el.shadow.alpha)};` : '';
      html += `<div style="position:absolute;${box};background:${cssFill(el.fill)};border-radius:${rad};${clip}${bd}${sh}box-sizing:border-box;${el.rot ? `transform:rotate(${el.rot}deg);` : ''}">${el.text ? textHtml(el.text) : ''}</div>`;
    } else if (el.t === 'text') {
      html += `<div style="position:absolute;${box}">${textHtml(el.text)}</div>`;
    } else if (el.t === 'poly') {
      const rings = Array.isArray(el.pts[0][0]) ? el.pts : [el.pts], all = [].concat(...rings);
      const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
      const x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0 || 0.01, h = Math.max(...ys) - y0 || 0.01;
      const d = rings.map(pts => 'M' + pts.map(([x, y]) => `${((x - x0) * PX).toFixed(1)},${((y - y0) * PX).toFixed(1)}`).join('L') + (el.closed ? 'Z' : '')).join('');
      const fill = el.closed && el.fill ? rgba(el.fill.color, el.fill.alpha) : 'none';
      const stroke = el.line ? `stroke="${rgba(el.line.color, el.line.alpha)}" stroke-width="${el.line.w * PX / 72}"` : '';
      html += `<svg style="position:absolute;left:${x0 * PX}px;top:${y0 * PX}px;overflow:visible" width="${w * PX}" height="${h * PX}"><path d="${d}" fill="${fill}" ${stroke} stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    } else if (el.t === 'pic') {
      const c = el.crop;
      const r = el.radius ? `border-radius:${Math.min(el.w, el.h) * PX * el.radius}px;` : '';
      if (!el.img.url) { html += `<div style="position:absolute;${box};background:#ddd;${r}"></div>`; continue; }
      if (c) {
        const iw = el.w / (1 - c.l - c.r), ihh = el.h / (1 - c.t - c.b);
        html += `<div style="position:absolute;${box};overflow:hidden;${r}"><img src="${el.img.url}" style="position:absolute;left:${-c.l * iw * PX}px;top:${-c.t * ihh * PX}px;width:${iw * PX}px;height:${ihh * PX}px;max-width:none"></div>`;
      } else html += `<img src="${el.img.url}" style="position:absolute;${box};${r}object-fit:fill">`;
    } else if (el.t === 'table') {
      let y = el.y; const rows = el.rows.map(rw => {
        const tds = rw.cells.map((c, j) => `<td style="width:${el.cols[j] * PX}px;height:${rw.h * PX}px;background:#${c.fill};color:#${c.color};font-family:'${c.font}';font-size:${c.size * PX / 72}px;font-weight:${c.bold ? 700 : 400};padding:0 ${0.1 * PX}px;border:1px solid #fff">${esc(c.text)}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      html += `<table style="position:absolute;left:${el.x * PX}px;top:${y * PX}px;border-collapse:collapse;table-layout:fixed">${rows}</table>`;
    }
  }
  s.innerHTML = html;
  outer.appendChild(s);
  return outer;
}
T.renderSlide = render;
})(window);
