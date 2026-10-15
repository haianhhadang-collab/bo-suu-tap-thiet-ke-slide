/* Sửa chữ giao diện: đổi chữ trên trang Bộ sưu tập ngay trong trình duyệt rồi lưu thẳng vào file.
   - Mở chế độ sửa: thêm #sua vào cuối địa chỉ trang (vd .../Bo-suu-tap-thiet-ke-slide.html#sua).
   - Chữ đã sửa nằm trong khối <script id="sua-chu-data"> ngay trên đây, dạng "chữ gốc": "chữ mới".
     Mã chạy trong <head> nên chữ được thay ngay lúc trang đang tải, không nháy chữ cũ.
   - Không đụng tới dữ liệu từng mẫu slide (tên, mô tả), các con số tự đếm và những gì Tự dàn trang vẽ ra.
   Nguồn: Sua-chu-giao-dien/sua-chu.js, nhúng vào trang bằng gan-sua-chu.py. */
(function () {
'use strict';
const DATA_ID = 'sua-chu-data', LONG = 1500;
// vùng không sửa: mã, dữ liệu từng mẫu slide, số tự đếm, phần Tự dàn trang vẽ ra, và chính công cụ này
const NO = ['script', 'style', 'noscript', 'textarea', 'template', 'svg', '#sua-ui',
  '#st-total', '#st-topics', '#st-styles', '#count', '.count', '.toast',
  '.card h3', '.card .vi', '.pv .t', '.pv .s', '.tag.src',
  '.tdt-thumb', '#tdt-file', '#tdt-status', '#tdt-from .nm'].join(',');
const key = s => s.replace(/\s+/g, ' ').trim();
const hasWord = s => /[\p{L}\p{N}]/u.test(s);
const isEl = n => n.nodeType === 1;

let saved = new Map();
try {
  const d = JSON.parse(document.getElementById(DATA_ID).textContent);
  saved = new Map(Object.entries(d.chu || {}).filter(([, v]) => typeof v === 'string'));
} catch (e) { console.warn('Sửa chữ: không đọc được khối dữ liệu', e); }
const cur = new Map(saved);      // bảng đang dùng trên trang; `saved` là bảng đã có trong file

// ================================================================ thay chữ trên trang
const orig = new WeakMap();      // nút chữ hoặc ô nhập -> chữ gốc
const mine = new WeakMap();      // nút chữ -> chữ do công cụ này vừa đặt (để bỏ qua khi theo dõi thay đổi)
const origOf = n => orig.has(n) ? orig.get(n) : isEl(n) ? n.getAttribute('placeholder') || '' : n.nodeValue;
// khóa của một nút = chữ gốc đã gộp khoảng trắng; '' nếu không xét (mã, chữ quá dài)
function keyOf(n) {
  const p = isEl(n) ? n : n.parentNode;
  if (!p || p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE') return '';
  const o = origOf(n);
  return o.length > LONG ? '' : /[^\S ]| {2}/.test(o) ? key(o) : o.trim();
}
const usable = n => hasWord(keyOf(n));      // sửa được: có chữ hoặc số, không chỉ là ký hiệu
const allowed = n => { const p = isEl(n) ? n : n.parentElement; return !!p && !p.closest(NO); };
// đặt chữ cho một nút theo bảng đang dùng (giữ khoảng trắng đầu/cuối của chữ gốc)
function put(n) {
  const o = origOf(n), v = cur.get(key(o));
  if (v === undefined && !orig.has(n)) return;
  orig.set(n, o);
  const m = /^(\s*)[\s\S]*?(\s*)$/.exec(o), nv = v === undefined ? o : m[1] + v + m[2];
  if (isEl(n)) { if (n.getAttribute('placeholder') !== nv) n.setAttribute('placeholder', nv); }
  else if (n.nodeValue !== nv) { mine.set(n, nv); n.nodeValue = nv; }
}
// gọi fn(nút, khóa) cho mọi chữ trong một vùng: nút chữ và chữ gợi ý của ô nhập
function each(root, fn) {
  if (!root) return;
  let k;
  if (root.nodeType === 3) { if ((k = keyOf(root))) fn(root, k); return; }
  if (!isEl(root)) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if ((k = keyOf(n))) fn(n, k);
  const phs = [...root.querySelectorAll('[placeholder]')];
  if (root.hasAttribute('placeholder')) phs.unshift(root);
  for (const el of phs) if ((k = keyOf(el))) fn(el, k);
}
const apply = (root, keys = cur) => each(root, (n, k) => { if (keys.has(k) && allowed(n)) put(n); });

// chữ do mã của trang vẽ ra sau (tên chủ đề, nút đổi chữ...) cũng được thay ngay khi xuất hiện
new MutationObserver(recs => {
  if (!cur.size) return;
  for (const r of recs) {
    if (r.type === 'characterData') {
      const n = r.target;
      if (mine.get(n) !== n.nodeValue) { orig.delete(n); apply(n); }
    } else for (const n of r.addedNodes) apply(n);
  }
}).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

// ================================================================ lưu
const BLOCK = new RegExp('(<script type="application/json" id="' + DATA_ID + '">)[\\s\\S]*?(</' + 'script>)');
const inject = (text, json) => BLOCK.test(text) ? text.replace(BLOCK, (m, a, b) => a + json + b) : null;
// mỗi chữ một dòng cho dễ xem khi so sánh bản cũ/mới
function payload() {
  const es = [...cur];
  return ('{"v":1,"chu":{' + es.map(([k, v]) => '\n' + JSON.stringify(k) + ':' + JSON.stringify(v)).join(',') + (es.length ? '\n' : '') + '}}').replace(/</g, '\\u003c');
}
window.SuaChu = { payload, inject };

// ================================================================ chế độ sửa (#sua)
const FS = typeof window.showOpenFilePicker === 'function';
// khung trình duyệt trong ứng dụng Claude cho chọn file nhưng từ chối mọi quyền đọc/ghi file =>
// bỏ bước chọn file, chép chữ đã sửa ra để dán cho Claude lưu. Gặp trình duyệt khác chặn kiểu đó thì nhớ lại.
const APP = / Claude\//.test(navigator.userAgent);
let fsBlocked = APP;
try { if (localStorage.getItem('sua-chu-fs') === 'chan') fsBlocked = true; } catch (_) {}
const CTL = 'button,a,label,summary,[role="button"]';
const wantEdit = () => new URLSearchParams(location.search).has('sua') || location.hash === '#sua';
const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let ui = null, editing = false, sel = null, files = [], busy = false, hooked = false, listKeys = [];
const inUI = t => !!ui && !!t && ui.root.contains(t);
const say = (m, err) => { if (!ui) return; ui.msg.textContent = m; ui.msg.classList.toggle('sua-err', !!err); };

const CSS = `
#sua-ui{position:fixed;left:0;top:0;width:0;height:0;z-index:2147483000;font:14px/1.45 "Be Vietnam Pro",system-ui,sans-serif;color:var(--text,#1d1b18);text-align:left}
#sua-ui *{box-sizing:border-box}
#sua-ui [hidden]{display:none!important}
:where(#sua-ui button){font:inherit;color:inherit;cursor:pointer}
html.sua-on body *{cursor:text!important}
html.sua-on #sua-ui *{cursor:auto!important}
html.sua-on #sua-ui button,html.sua-on #sua-ui .sua-it{cursor:pointer!important}
html.sua-on #sua-ui textarea{cursor:text!important}
html.sua-on #sua-ui button:disabled{cursor:default!important}
.sua-hl,.sua-box{position:fixed;display:none;pointer-events:none;border-radius:6px}
.sua-hl{border:2px dashed var(--accent,#c2410c);background:color-mix(in srgb,var(--accent,#c2410c) 9%,transparent)}
.sua-box{border:2px solid var(--accent,#c2410c);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent,#c2410c) 22%,transparent)}
.sua-bar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);width:max-content;max-width:calc(100vw - 24px);display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;padding:8px 10px;background:var(--surface,#fff);border:1px solid var(--line,#e2ddd3);border-radius:14px;box-shadow:0 10px 34px rgba(0,0,0,.22)}
.sua-sw{display:inline-flex;align-items:center;gap:8px;border:0;background:none;padding:4px 6px;border-radius:8px;font-weight:700}
.sua-k{width:34px;height:20px;border-radius:999px;background:var(--line,#ccc);position:relative;flex:none;transition:background .15s}
.sua-k::after{content:"";position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:transform .15s}
.sua-sw[aria-pressed="true"] .sua-k{background:var(--accent,#c2410c)}
.sua-sw[aria-pressed="true"] .sua-k::after{transform:translateX(14px)}
.sua-b,.sua-p{border:1px solid var(--line,#e2ddd3);background:var(--surface-2,#efece5);border-radius:9px;padding:6px 12px;font-weight:600;font-size:13.5px;white-space:nowrap}
.sua-p{background:var(--accent,#c2410c);border-color:var(--accent,#c2410c);color:#fff}
.sua-b:hover,.sua-p:hover{filter:brightness(1.06)}
.sua-b:disabled{opacity:.45;filter:none}
.sua-p.sua-dirty::after{content:"";display:inline-block;width:7px;height:7px;margin-left:7px;border-radius:50%;background:#fde68a;vertical-align:1px}
.sua-x{border:0;background:none;color:var(--muted,#6b665d);font-size:20px;line-height:1;padding:2px 7px;border-radius:8px}
.sua-x:hover{background:var(--surface-2,#efece5)}
.sua-link{border:0;background:none;padding:0;color:var(--accent,#c2410c);font-weight:600;font-size:12.5px;white-space:nowrap}
.sua-link:hover{text-decoration:underline}
.sua-msg{flex-basis:100%;contain:inline-size;padding:0 6px;font-size:12.5px;color:var(--muted,#6b665d)}
.sua-msg:empty{display:none}
.sua-msg.sua-err{color:#dc2626}
.sua-pop,.sua-list{position:fixed;background:var(--surface,#fff);border:1px solid var(--line,#e2ddd3);border-radius:12px;box-shadow:0 14px 40px rgba(0,0,0,.25);padding:12px}
.sua-pop{width:min(460px,calc(100vw - 24px))}
.sua-where{font-size:12.5px;font-weight:600;color:var(--muted,#6b665d);margin-bottom:6px}
.sua-pop textarea{display:block;width:100%;min-height:40px;max-height:40vh;resize:vertical;font:inherit;font-size:15px;line-height:1.45;padding:8px 10px;border-radius:8px;border:1px solid var(--line,#e2ddd3);background:var(--bg,#fff);color:inherit}
.sua-pop textarea:focus{outline:2px solid var(--accent,#c2410c);outline-offset:1px}
.sua-orig{display:flex;gap:10px;align-items:baseline;margin-top:8px;font-size:12.5px;color:var(--muted,#6b665d)}
.sua-orig span{flex:1;overflow-wrap:anywhere}
.sua-act{display:flex;gap:8px;align-items:center;margin-top:10px}
.sua-act small{flex:1;font-size:12px;color:var(--muted,#6b665d)}
.sua-list{left:50%;transform:translateX(-50%);width:min(560px,calc(100vw - 24px));max-height:min(70vh,640px);display:flex;flex-direction:column;gap:10px}
.sua-lh{display:flex;align-items:baseline;gap:10px}
.sua-lh small{flex:1;font-size:12.5px;color:var(--muted,#6b665d)}
.sua-items{overflow:auto;display:flex;flex-direction:column;gap:6px;min-height:0}
.sua-it{display:grid;grid-template-columns:1fr auto;gap:1px 12px;padding:8px 10px;border:1px solid var(--line,#e2ddd3);border-radius:9px}
.sua-it:hover{border-color:var(--muted,#6b665d)}
.sua-it>button{grid-column:2;grid-row:1/span 3;align-self:center}
.sua-o{font-size:12.5px;color:var(--muted,#6b665d);text-decoration:line-through;overflow-wrap:anywhere}
.sua-n{font-weight:600;overflow-wrap:anywhere}
.sua-meta{font-size:11.5px;color:var(--muted,#6b665d)}
.sua-meta:empty{display:none}
.sua-warn{color:#b45309}
.sua-none{margin:4px 0;color:var(--muted,#6b665d);font-size:13.5px}
.sua-files{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;font-size:12.5px;color:var(--muted,#6b665d);border-top:1px solid var(--line,#e2ddd3);padding-top:10px}
.sua-file{display:inline-flex;align-items:center;gap:2px;padding:1px 2px 1px 10px;border-radius:999px;background:var(--surface-2,#efece5);color:var(--text,#1d1b18)}
.sua-file .sua-x{font-size:15px;padding:1px 6px}
.sua-lf{display:flex;flex-wrap:wrap;gap:8px}
.sua-data{display:block;width:100%;height:110px;resize:vertical;font:12px/1.4 Consolas,ui-monospace,monospace;padding:8px;border-radius:8px;border:1px solid var(--line,#e2ddd3);background:var(--bg,#fff);color:inherit}
@media (max-width:480px){
  .sua-bar{left:8px;right:8px;bottom:8px;transform:none;width:auto;gap:6px}
  .sua-long{display:none}
}
`;
const HTML = `
<div class="sua-hl"></div><div class="sua-box"></div>
<div class="sua-pop" role="dialog" aria-label="Sửa chữ" hidden>
  <div class="sua-where"></div>
  <textarea rows="1" spellcheck="false" aria-label="Chữ mới"></textarea>
  <div class="sua-orig" hidden><span>Gốc: “<b></b>”</span><button type="button" class="sua-link" data-a="revert">↺ Về chữ gốc</button></div>
  <div class="sua-act"><small class="sua-hint"></small><button type="button" class="sua-b" data-a="cancel">Hủy</button><button type="button" class="sua-p" data-a="done">Xong</button></div>
</div>
<div class="sua-list" role="dialog" aria-label="Chữ đã sửa" hidden>
  <div class="sua-lh"><b>Chữ đã sửa</b><small class="sua-sum"></small><button type="button" class="sua-x" data-a="close-list" aria-label="Đóng danh sách">×</button></div>
  <div class="sua-items"></div>
  <div class="sua-files"></div>
  <textarea class="sua-data" readonly spellcheck="false" aria-label="Chữ đã sửa, dạng dữ liệu để dán cho Claude" hidden></textarea>
  <div class="sua-lf"><button type="button" class="sua-b" data-a="copy">Chép chữ đã sửa</button><button type="button" class="sua-b" data-a="download">Tải file HTML về máy</button><button type="button" class="sua-b" data-a="undo">Bỏ thay đổi chưa lưu</button></div>
</div>
<div class="sua-bar" role="toolbar" aria-label="Sửa chữ trên trang">
  <button type="button" class="sua-sw" data-a="toggle" aria-pressed="true"><span class="sua-k" aria-hidden="true"></span><span class="sua-t">Đang sửa chữ</span></button>
  <button type="button" class="sua-b" data-a="list" aria-expanded="false">Đã sửa <b>0</b></button>
  <button type="button" class="sua-p" data-a="save">Lưu<span class="sua-long"> vào file</span></button>
  <button type="button" class="sua-x" data-a="exit" aria-label="Thoát chế độ sửa" title="Thoát chế độ sửa">×</button>
  <div class="sua-msg" role="status" aria-live="polite"></div>
</div>`;

function startUI() {
  if (ui) return;
  const css = document.createElement('style'); css.id = 'sua-css'; css.textContent = CSS; document.head.appendChild(css);
  const root = document.createElement('div'); root.id = 'sua-ui'; root.innerHTML = HTML;
  const q = s => root.querySelector(s);
  ui = { root, css, hl: q('.sua-hl'), box: q('.sua-box'), bar: q('.sua-bar'), sw: q('.sua-sw'), n: q('[data-a="list"]'),
    save: q('[data-a="save"]'), msg: q('.sua-msg'), pop: q('.sua-pop'), ta: q('.sua-pop textarea'), list: q('.sua-list') };
  document.body.appendChild(root);
  root.addEventListener('click', onUIClick);
  ui.ta.addEventListener('input', onType);
  ui.ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); commit(); } });
  if (!hooked) hook();
  rehost(); setEditing(true); loadFiles(); refresh();
}

function hook() {
  hooked = true;
  // khi đang sửa: bấm vào trang không chạy nút, không mở liên kết, chỉ chọn chữ
  const guard = e => { if (editing && !inUI(e.target)) { e.preventDefault(); e.stopPropagation(); } };
  for (const t of ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'dblclick', 'auxclick', 'dragstart', 'submit']) window.addEventListener(t, guard, true);
  window.addEventListener('click', e => {
    if (!editing || inUI(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    const t = hit(e.target, e.clientX, e.clientY);
    if (t) openPop(t);
    else { commit(); say('Chỗ này không sửa được. Bấm thẳng vào chữ cần sửa; tên, mô tả từng mẫu slide và các con số tự đếm không sửa ở đây.'); }
  }, true);
  let raf = 0, last = null;
  window.addEventListener('mousemove', e => {
    if (!editing) return;
    last = e;
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0; if (!ui || !editing) return;
      const t = inUI(last.target) ? null : hit(last.target, last.clientX, last.clientY);
      frame(ui.hl, t && rectOf(t));
    });
  }, true);
  window.addEventListener('scroll', () => { if (!ui) return; frame(ui.hl, null); if (sel) place(); }, true);
  window.addEventListener('resize', () => { if (ui && sel) place(); });
  window.addEventListener('keydown', e => {
    if (!ui || e.key !== 'Escape' || !(sel || !ui.list.hidden)) return;
    e.preventDefault(); e.stopPropagation();
    if (sel) cancel(); else showList(false);
  }, true);
  window.addEventListener('beforeunload', e => { if (ui && dirty()) { e.preventDefault(); e.returnValue = ''; } });
}

// hộp thoại mở dạng modal làm phần còn lại của trang không bấm được => chuyển công cụ vào trong hộp thoại
const watched = new WeakSet();
function rehost() {
  if (!ui) return;
  document.querySelectorAll('dialog').forEach(d => {
    if (watched.has(d)) return;
    watched.add(d); new MutationObserver(rehost).observe(d, { attributes: true, attributeFilter: ['open'] });
  });
  let host = document.body;
  document.querySelectorAll('dialog[open]').forEach(d => { try { if (d.matches(':modal')) host = d; } catch (_) {} });
  if (ui.root.parentNode !== host) { commit(); host.appendChild(ui.root); }
  frame(ui.hl, null);
}

function setEditing(on) {
  commit();
  editing = on;
  document.documentElement.classList.toggle('sua-on', on);
  ui.sw.setAttribute('aria-pressed', String(on));
  ui.sw.querySelector('.sua-t').innerHTML = on ? 'Đang sửa<span class="sua-long"> chữ</span>' : 'Đã tắt<span class="sua-long"> sửa chữ</span>';
  frame(ui.hl, null);
  say(on ? 'Bấm vào chữ bất kỳ trên trang để sửa. ' + (fsBlocked
      ? 'Trình duyệt này không lưu thẳng vào file được: sửa xong bấm “Lưu” để chép chữ đã sửa, rồi dán vào khung chat cho Claude lưu.'
      : 'Sửa xong bấm “Lưu vào file”.')
    : 'Trang đang chạy như bình thường: bấm được nút, mở được hộp thoại. Bật lại để sửa tiếp, kể cả chữ trong hộp thoại Tự dàn trang.');
}

// ---------------------------------------------------------------- chọn chữ dưới con trỏ
function rectsOf(n) { const r = document.createRange(); r.selectNodeContents(n); return [...r.getClientRects()]; }
function distTo(n, x, y) {
  let d = Infinity;
  for (const b of rectsOf(n)) d = Math.min(d, Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom)));
  return d;
}
function textsIn(root, max) {
  const out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    { acceptNode: n => isEl(n) ? (n.matches(NO) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP) : NodeFilter.FILTER_ACCEPT });
  for (let n = w.nextNode(); n && out.length <= max; n = w.nextNode()) if (usable(n) && rectsOf(n).length) out.push(n);
  return out;
}
function hit(el, x, y) {
  if (!el || !isEl(el) || el.closest(NO)) return null;
  if (el.tagName === 'INPUT' && usable(el)) return { n: el, el };                // ô nhập: sửa chữ gợi ý
  if (el.tagName === 'SELECT') {                                                    // ô chọn: sửa dòng đang hiện
    const o = el.options[el.selectedIndex], t = o && [...o.childNodes].find(c => c.nodeType === 3 && usable(c));
    return t ? { n: t, el } : null;
  }
  const ctl = el.closest(CTL), scope = ctl && !ctl.closest(NO) ? ctl : el;
  const list = textsIn(scope, 40);
  if (!list.length || list.length > 40) return null;                                // bấm vào khoảng trống của khối lớn
  // nút, chip, hoặc khối chỉ có một đoạn chữ: bấm đâu trong khối cũng được
  if (list.length === 1 && (ctl || list[0].parentNode === el)) return { n: list[0], el: ctl || el };
  let best = null, bd = 18;
  for (const t of list) { const d = distTo(t, x, y); if (d < bd) { bd = d; best = t; } }
  return best && { n: best, el: best.parentElement };
}
function rectOf(t) {
  if (!t.n.isConnected) return t.el.isConnected ? t.el.getBoundingClientRect() : null;
  if (isEl(t.n)) return t.n.getBoundingClientRect();
  const r = document.createRange(); r.selectNodeContents(t.n);
  const b = r.getBoundingClientRect();
  return b.width || b.height ? b : t.el.getBoundingClientRect();
}
function frame(el, r) {
  if (!r || (!r.width && !r.height)) { el.style.display = 'none'; return; }
  Object.assign(el.style, { display: 'block', left: r.left - 4 + 'px', top: r.top - 3 + 'px', width: r.width + 8 + 'px', height: r.height + 6 + 'px' });
}

// ---------------------------------------------------------------- ô sửa
function openPop(t) {
  commit();
  const k = key(origOf(t.n)), slots = [];
  each(document.body, (n, nk) => { if (nk === k && allowed(n)) slots.push(n); });
  if (!slots.includes(t.n)) slots.push(t.n);
  sel = { n: t.n, el: t.el, k, slots, before: cur.get(k) };
  ui.pop.querySelector('.sua-where').textContent = (isEl(t.n) ? 'Chữ gợi ý trong ô nhập' : 'Sửa chữ') +
    (slots.length > 1 ? ` · đổi cùng lúc ở ${slots.length} chỗ có chữ này` : '');
  ui.ta.value = cur.has(k) ? cur.get(k) : k;
  ui.pop.hidden = false;
  syncPop(); place();
  ui.ta.focus(); ui.ta.setSelectionRange(ui.ta.value.length, ui.ta.value.length);
}
function syncPop() {
  const o = ui.pop.querySelector('.sua-orig');
  o.hidden = !cur.has(sel.k); o.querySelector('b').textContent = sel.k;
  ui.pop.querySelector('.sua-hint').textContent = ui.ta.value.trim() ? 'Enter: xong · Esc: hủy' : 'Để trống thì chỗ này sẽ không còn chữ';
  ui.ta.style.height = 'auto'; ui.ta.style.height = Math.min(ui.ta.scrollHeight + 2, innerHeight * 0.4) + 'px';
}
function onType() {
  if (!sel) return;
  const v = ui.ta.value.replace(/\s+/g, ' ').trim();
  if (v === sel.k) cur.delete(sel.k); else cur.set(sel.k, v);
  sel.slots.forEach(put); syncPop(); place(); refresh();
}
function place() {
  if (!sel) return;
  const r = rectOf(sel);
  if (!r) { closePop(); return; }
  frame(ui.box, r);
  const p = ui.pop, pw = p.offsetWidth, ph = p.offsetHeight;
  let top = r.bottom + 10;
  if (top + ph > innerHeight - 8 && r.top - 10 - ph >= 8) top = r.top - 10 - ph;
  p.style.top = Math.max(8, Math.min(top, innerHeight - ph - 8)) + 'px';
  p.style.left = Math.max(12, Math.min(r.left, innerWidth - pw - 12)) + 'px';
}
function closePop() { sel = null; if (!ui) return; ui.pop.hidden = true; frame(ui.box, null); }
const unsavedNote = () => { const d = dirty(); return d ? ` Có ${d} thay đổi chưa lưu, bấm “Lưu” để giữ lại.` : ''; };
function commit() {
  if (!sel) return;
  const { k, before } = sel;
  closePop();
  apply(document.body, new Set([k]));
  refresh();
  if (cur.get(k) !== before) say('Đã sửa.' + unsavedNote());
}
function cancel() {
  if (!sel) return;
  const { k, before, slots } = sel;
  if (before === undefined) cur.delete(k); else cur.set(k, before);
  slots.forEach(put); closePop(); refresh(); say('Đã hủy.' + unsavedNote());
}
function revert() {
  if (!sel) return;
  cur.delete(sel.k); sel.slots.forEach(put); closePop(); refresh(); say('Đã đưa về chữ gốc.' + unsavedNote());
}

// ---------------------------------------------------------------- thanh công cụ, danh sách
function dirty() {
  let n = 0;
  for (const k of new Set([...cur.keys(), ...saved.keys()])) if (cur.get(k) !== saved.get(k)) n++;
  return n;
}
function refresh() {
  if (!ui) return;
  const d = dirty();
  ui.n.querySelector('b').textContent = cur.size;
  ui.save.classList.toggle('sua-dirty', d > 0);
  ui.save.innerHTML = fsBlocked ? 'Lưu<span class="sua-long"> (chép ra)</span>' : 'Lưu<span class="sua-long"> vào file</span>';
  ui.save.title = d ? `${d} thay đổi chưa lưu` : 'Không có thay đổi mới';
  if (!ui.list.hidden) renderList();
}
function showList(on) {
  ui.list.hidden = !on; ui.n.setAttribute('aria-expanded', String(on));
  if (!on) return;
  renderList();
  ui.list.style.bottom = innerHeight - ui.bar.getBoundingClientRect().top + 8 + 'px';
}
function renderList() {
  const cnt = new Map();
  if (cur.size) each(document.body, (n, k) => { if (cur.has(k) && allowed(n)) cnt.set(k, (cnt.get(k) || 0) + 1); });
  listKeys = [...cur.keys()];
  ui.list.querySelector('.sua-items').innerHTML = listKeys.length ? listKeys.map((k, i) => {
    const v = cur.get(k), c = cnt.get(k) || 0, meta = [];
    if (!c) meta.push('<span class="sua-warn">không còn chữ gốc này trên trang</span>'); else if (c > 1) meta.push(`${c} chỗ`);
    if (saved.get(k) !== v) meta.push('chưa lưu');
    return `<div class="sua-it" data-i="${i}" title="Bấm để tìm trên trang"><div class="sua-o">${escH(k)}</div>` +
      `<div class="sua-n">${v ? escH(v) : '<i>(để trống)</i>'}</div><div class="sua-meta">${meta.join(' · ')}</div>` +
      `<button type="button" class="sua-link" data-a="rv" data-i="${i}">↺ Về gốc</button></div>`;
  }).join('') : '<p class="sua-none">Chưa sửa chữ nào. Bấm vào chữ trên trang để bắt đầu.</p>';
  const d = dirty();
  ui.list.querySelector('.sua-sum').textContent = d ? `${d} thay đổi chưa lưu` : cur.size ? 'đã lưu hết' : '';
  ui.list.querySelector('[data-a="undo"]').disabled = !d;
  const fb = ui.list.querySelector('.sua-files');
  fb.innerHTML = FS && fsBlocked
    ? `<span>Trình duyệt này không cho trang ghi vào file trên máy${APP ? ' (khung trình duyệt trong ứng dụng Claude chặn việc này)' : ''}. “Lưu” sẽ chép chữ đã sửa để dán cho Claude; muốn tự lưu thẳng thì mở trang bằng Chrome hoặc Edge.</span>` +
      '<button type="button" class="sua-link" data-a="addfile">Vẫn thử chọn file</button>'
    : FS
    ? '<span>Lưu vào:</span>' + (files.length ? files.map((f, i) => `<span class="sua-file">${escH(f.name)}<button type="button" class="sua-x" data-a="unfile" data-i="${i}" aria-label="Bỏ ${escH(f.name)}" title="Thôi lưu vào file này">×</button></span>`).join('') : '<span>chưa chọn file</span>') +
      '<button type="button" class="sua-link" data-a="addfile">+ Thêm file</button>'
    : '<span>Trình duyệt này không ghi thẳng vào file được: “Lưu vào file” sẽ tải về file HTML mới để chép đè lên file cũ. Dùng Chrome hoặc Edge để lưu thẳng.</span>';
}
function locate(k) {
  let t = null;
  each(document.body, (n, nk) => {
    if (t || nk !== k || !allowed(n)) return;
    const c = { n, el: isEl(n) ? n : n.parentElement }, r = rectOf(c);
    if (r && (r.width || r.height)) t = c;
  });
  if (!t) { say('Không thấy chữ này ở phần đang hiện của trang (có thể nằm trong chủ đề đang thu gọn, trong hộp thoại Tự dàn trang, hoặc chữ gốc đã đổi).'); return; }
  t.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  setTimeout(() => { if (!ui) return; frame(ui.box, rectOf(t)); setTimeout(() => { if (ui && !sel) frame(ui.box, null); }, 1600); }, 450);
}
function reset() {
  const ks = new Set([...cur.keys(), ...saved.keys()]);
  cur.clear(); saved.forEach((v, k) => cur.set(k, v));
  apply(document.body, ks);
}
function onUIClick(e) {
  const b = e.target.closest('[data-a]');
  if (!b) { const it = e.target.closest('.sua-it'); if (it) locate(listKeys[+it.dataset.i]); return; }
  const a = b.dataset.a;
  if (a === 'toggle') setEditing(!editing);
  else if (a === 'list') { commit(); showList(ui.list.hidden); }
  else if (a === 'close-list') showList(false);
  else if (a === 'save') save();
  else if (a === 'exit') exit();
  else if (a === 'done') commit();
  else if (a === 'cancel') cancel();
  else if (a === 'revert') revert();
  else if (a === 'rv') { const k = listKeys[+b.dataset.i]; cur.delete(k); apply(document.body, new Set([k])); refresh(); say('Đã đưa về chữ gốc.' + unsavedNote()); }
  else if (a === 'download') { commit(); download(payload()); }
  else if (a === 'copy') { commit(); copyOut(payload(), ''); }
  else if (a === 'undo') { commit(); reset(); refresh(); say('Đã bỏ các thay đổi chưa lưu.'); }
  else if (a === 'addfile') { setBlocked(false); addFile().then(() => renderList(), err => { renderList(); if (err.name !== 'AbortError') say('Không chọn được file: ' + err.message, true); }); }
  else if (a === 'unfile') { files.splice(+b.dataset.i, 1); keepFiles(); renderList(); }
}
function exit() {
  commit();
  if (dirty() && !confirm('Còn thay đổi chưa lưu. Thoát và bỏ các thay đổi này?')) return;
  reset();
  editing = false; document.documentElement.classList.remove('sua-on');
  ui.root.remove(); ui.css.remove(); ui = null;
  const u = new URL(location.href);
  u.searchParams.delete('sua'); if (u.hash === '#sua') u.hash = '';
  history.replaceState(history.state, '', u.href);
}

// ---------------------------------------------------------------- ghi file
// Chrome/Edge: đọc lại file trên máy, chỉ thay khối dữ liệu rồi ghi đè (không mất phần khác đã đổi trong file).
// Nhớ các file đã chọn (IndexedDB) để lần sau bấm Lưu là xong.
function idb(fn) {
  return new Promise((res, rej) => {
    const rq = indexedDB.open('sua-chu', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
    rq.onerror = () => rej(rq.error);
    rq.onsuccess = () => {
      const db = rq.result, tx = db.transaction('kv', 'readwrite'), r = fn(tx.objectStore('kv'));
      tx.oncomplete = () => { db.close(); res(r && r.result); };
      tx.onerror = () => { db.close(); rej(tx.error); };
    };
  });
}
async function loadFiles() {
  if (!FS) return;
  try { files = (await idb(s => s.get('files'))) || []; } catch (_) { files = []; }
  if (ui && !ui.list.hidden) renderList();
}
async function keepFiles() { try { await idb(s => s.put(files, 'files')); } catch (_) {} }
async function addFile() {
  const picked = await window.showOpenFilePicker({ id: 'sua-chu', multiple: true, types: [{ description: 'Trang HTML', accept: { 'text/html': ['.html', '.htm'] } }] });
  for (const h of picked) {
    let dup = false;
    for (const f of files) if (await f.isSameEntry(h)) dup = true;
    if (!dup) files.push(h);
  }
  await keepFiles();
}
const blockedErr = () => Object.assign(new Error('trình duyệt chặn'), { name: 'Blocked' });
function setBlocked(on) {
  fsBlocked = on;
  try { if (on) localStorage.setItem('sua-chu-fs', 'chan'); else localStorage.removeItem('sua-chu-fs'); } catch (_) {}
  if (ui) refresh();
}
async function save() {
  if (busy) return;
  commit();
  const json = payload();
  if (!FS) { download(json); return; }
  if (fsBlocked) { copyOut(json, ''); return; }
  busy = true;
  const ok = [];
  try {
    if (!files.length) {
      say('Chọn file trang Bộ sưu tập trên máy để ghi (vd D:\\SLide\\Bo-suu-tap-thiet-ke-slide.html)…');
      await addFile();
    }
    for (const f of files) {
      let p = await f.queryPermission({ mode: 'readwrite' });
      if (p !== 'granted') p = await f.requestPermission({ mode: 'readwrite' });
      // bị từ chối cả quyền đọc file vừa chọn: trình duyệt chặn hẳn, không phải người dùng bấm "Không cho phép"
      if (p === 'denied' && (await f.queryPermission({ mode: 'read' })) === 'denied') throw blockedErr();
      if (p !== 'granted') throw new Error(`trình duyệt chưa được cho phép ghi vào “${f.name}”. Bấm “Lưu vào file” lần nữa và chọn “Cho phép” khi trình duyệt hỏi`);
      let text;
      try { text = await (await f.getFile()).text(); } catch (e) { throw e.name === 'NotAllowedError' ? blockedErr() : e; }
      const out = inject(text, json);
      if (out == null) throw new Error(`“${f.name}” không phải trang Bộ sưu tập có công cụ sửa chữ`);
      if (out !== text) { const w = await f.createWritable(); await w.write(out); await w.close(); }
      ok.push(f.name);
    }
    saved = new Map(cur); refresh();
    const at = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    say(`Đã lưu vào ${ok.map(n => '“' + n + '”').join(' và ')} lúc ${at}.` + (ok.length === 1 ? ' Muốn lưu cả bản còn lại: mở “Đã sửa” → “+ Thêm file”.' : ''));
  } catch (e) {
    const part = ok.length ? ` (đã lưu ${ok.join(', ')})` : '';
    if (e.name === 'Blocked') {
      setBlocked(true);
      copyOut(json, `Trình duyệt này không cho trang ghi vào file trên máy${APP ? ' (khung trình duyệt trong ứng dụng Claude chặn việc này)' : ''}${part}. `);
    }
    else if (e.name === 'AbortError') say('Chưa lưu.' + part);
    else if (e.name === 'SecurityError') say('Bấm “Lưu vào file” thêm lần nữa để cho phép trình duyệt ghi vào file.' + part);
    else say('Không lưu được: ' + e.message + part, true);
  } finally { busy = false; }
}
// chép chữ đã sửa ra bộ nhớ tạm và hiện trong ô dữ liệu, để dán cho Claude lưu vào file
async function copyOut(json, why) {
  let copied = false;
  try { await navigator.clipboard.writeText(json); copied = true; } catch (_) {}
  if (!ui) return;
  const ta = ui.list.querySelector('.sua-data');
  ta.value = json; ta.hidden = false;
  showList(true); ta.focus({ preventScroll: true }); ta.select();
  say(why + (copied
    ? 'Đã chép chữ đã sửa vào bộ nhớ tạm: dán (Ctrl+V) vào khung chat để Claude lưu vào file.'
    : 'Chữ đã sửa nằm trong ô đang bôi đen: bấm Ctrl+C để chép, rồi dán vào khung chat để Claude lưu vào file.') +
    ' Muốn tự lưu thẳng: mở trang bằng Chrome hoặc Edge.', !!why);
}
// trình duyệt khác: tải về file HTML mới (đọc mã trang qua mạng; mở thẳng từ ổ đĩa thì chép dữ liệu ra bộ nhớ tạm)
async function download(json) {
  let src = null;
  try { const r = await fetch(location.href.split('#')[0], { cache: 'no-store' }); if (r.ok) src = await r.text(); } catch (_) {}
  const out = src && inject(src, json);
  if (!out) { copyOut(json, 'Trình duyệt không đọc được mã của trang (trang mở thẳng từ ổ đĩa). '); return; }
  const name = decodeURIComponent(location.pathname.split('/').pop() || '') || 'index.html';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([out], { type: 'text/html' })); a.download = name;
  ui.root.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  saved = new Map(cur); refresh();
  say(`Đã tải về “${name}”. Chép đè file này lên file cũ để giữ chữ đã sửa.`);
}

// ================================================================ khởi động
function init() { if (cur.size) apply(document.body); if (wantEdit()) startUI(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
window.addEventListener('hashchange', () => { if (wantEdit()) startUI(); });
})();
