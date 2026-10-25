/* Giao diện "Tự dàn trang" gắn vào trang Bộ sưu tập. */
(function () {
  const TDT = window.TuDanTrang;
  const $ = id => document.getElementById(id);
  const dlg = $('tdt');
  const state = { deck: null, src: null, theme: TDT.THEMES['song-bien'], cardTheme: null, cardInfo: null, motif: '', open: null, result: null, busy: false };
  // mẫu thực dùng = mẫu đã chọn + họa tiết theo chủ đề (nếu có)
  const usedTheme = () => state.motif ? TDT.withMotif(state.theme, state.motif, $('tdt-motif-pal').checked) : state.theme;
  const SAMPLE = { title: 'Tiêu đề bài', subtitle: '', meta: [], slides: [], fileName: '' };

  const opts = () => ({ anim: document.querySelector('input[name="tdt-anim"]:checked').value, transition: $('tdt-trans').value || null });
  const status = (msg, err) => { const s = $('tdt-status'); s.textContent = msg; s.classList.toggle('err', !!err); };

  function swatches(th) { return [th.inv[0], th.inv[th.inv.length - 1], th.bg, th.accent, th.accent2, th.accent3].map(c => `<i style="background:#${c}"></i>`).join(''); }
  function renderThemes() {
    $('tdt-themes').innerHTML = Object.values(TDT.THEMES).map(th =>
      `<button class="tdt-th${state.theme === th ? ' on' : ''}" data-id="${th.id}" title="${th.desc}"><span class="bar">${swatches(th)}</span><span class="nm">${th.name}</span></button>`).join('');
    const f = $('tdt-from');
    if (state.cardTheme) {
      const c = state.cardInfo;
      f.innerHTML = `<div class="tdt-from${state.theme === state.cardTheme ? ' on' : ''}" id="tdt-card" role="button" tabindex="0">
        <span class="tdt-sw">${c.pal.map(h => `<i style="background:${h}"></i>`).join('')}</span>
        <span><small>Từ bộ sưu tập</small><span class="nm">${c.name}</span></span></div>`;
    } else f.innerHTML = '';
    renderMotifs();
  }
  // mỗi họa tiết hiện bằng ảnh thu nhỏ trang bìa dựng thật trên mẫu đang chọn
  function motifButton(id, w, pal) {
    const m = TDT.MOTIFS[id], b = document.createElement('button');
    b.className = 'tdt-mo' + (state.motif === id ? ' on' : ''); b.dataset.id = id; b.title = m.desc;
    b.innerHTML = `<span class="pic"></span><span class="nm">${m.name}</span>`;
    try { b.firstChild.appendChild(TDT.renderSlide(TDT.build(SAMPLE, TDT.withMotif(state.theme, id, pal), { anim: 'none' }).slides[0], w)); }
    catch (e) { console.error(e); }
    return b;
  }
  // họa tiết chia theo gói, mỗi gói gập/mở được; ảnh thu nhỏ chỉ dựng khi gói được mở
  function renderMotifs() {
    const box = $('tdt-motifs'), pal = $('tdt-motif-pal').checked, w = Math.max(120, ((box.clientWidth || 300) - 26) / 2);
    if (!state.open) state.open = new Set([state.motif ? TDT.MOTIFS[state.motif].pack : TDT.PACKS[0].id]);
    const none = document.createElement('button');
    none.className = 'tdt-none' + (state.motif ? '' : ' on'); none.dataset.id = ''; none.textContent = 'Không dùng họa tiết — chỉ trang trí của mẫu';
    const packs = TDT.PACKS.map(pk => {
      const ids = Object.keys(TDT.MOTIFS).filter(id => TDT.MOTIFS[id].pack === pk.id);
      const d = document.createElement('details'); d.className = 'tdt-pack'; d.open = state.open.has(pk.id);
      const sel = ids.includes(state.motif) ? `<span class="sel">✓ ${TDT.MOTIFS[state.motif].short}</span>` : '';
      d.innerHTML = `<summary title="${pk.desc}"><span class="pn">${pk.name}</span><small>${ids.length}</small>${sel}</summary><div class="tdt-mgrid"></div>`;
      const fill = () => { const g = d.lastChild; if (!g.childElementCount) g.replaceChildren(...ids.map(id => motifButton(id, w, pal))); };
      if (d.open) fill();
      d.addEventListener('toggle', () => { if (d.open) { state.open.add(pk.id); fill(); } else state.open.delete(pk.id); });
      return d;
    });
    box.replaceChildren(none, ...packs);
  }
  function refresh() {
    renderThemes();
    if (!state.deck) return;
    const t0 = performance.now();
    try {
      // file .pptx: mặc định giữ nguyên bố cục gốc (giu-bo-cuc.js); bỏ chọn thì dàn lại từ đầu như file Word, Markdown
      state.result = state.src && $('tdt-keep').checked ? TDT.keepBuild(state.src, state.deck, usedTheme(), opts()) : TDT.build(state.deck, usedTheme(), opts());
    } catch (e) { console.error(e); status('Lỗi khi dàn trang: ' + e.message, true); return; }
    const box = $('tdt-preview');
    const grid = document.createElement('div'); grid.className = 'tdt-grid';
    const w = Math.max(200, Math.min(300, (box.clientWidth - 24) / 3 - 8));
    state.result.slides.forEach((sl, i) => {
      const cell = document.createElement('div'); cell.className = 'cell';
      cell.innerHTML = `<span class="no">${i + 1}</span>`;
      cell.appendChild(TDT.renderSlide(sl, w));
      grid.appendChild(cell);
    });
    box.replaceChildren(grid);
    const miss = state.deck.missingImages && state.deck.missingImages.length ? ` · Thiếu ảnh: ${state.deck.missingImages.join(', ')} (chọn kèm file ảnh)` : '';
    status(`${state.result.slides.length} trang · mẫu “${state.result.theme.name}”${state.result.keep ? ' · giữ bố cục gốc' : ''} · ${Math.round(performance.now() - t0)} ms${miss}`);
    $('tdt-dl').disabled = false;
  }
  async function loadFiles(files) {
    if (!files || !files.length) return;
    if (!window.JSZip) { status('Không tải được thư viện JSZip (cần mạng Internet ở lần mở đầu). Hãy kiểm tra kết nối rồi tải lại trang.', true); return; }
    status('Đang đọc file…'); $('tdt-dl').disabled = true;
    try {
      state.deck = await TDT.readFiles(files);
      const main = [...files].find(f => /\.(pptx|docx|pdf|md|markdown|txt)$/i.test(f.name));
      if (state.src) Object.values(state.src.media).forEach(u => u && URL.revokeObjectURL(u));
      state.src = /\.pptx$/i.test(main.name) ? await TDT.loadSource(await main.arrayBuffer()) : null;
      $('tdt-keep-row').hidden = !state.src;
      const extra = files.length - 1;
      $('tdt-file').textContent = '📄 ' + main.name + (extra > 0 ? ` + ${extra} file ảnh` : '');
      refresh();
    } catch (e) { console.error(e); state.deck = state.src = null; $('tdt-keep-row').hidden = true; status('Không đọc được file: ' + e.message, true); }
  }
  async function download() {
    if (!state.result) return;
    $('tdt-dl').disabled = true; status('Đang tạo file PowerPoint…');
    try {
      const blob = state.result.keep ? await TDT.keepToPptx(state.src, state.result) : await TDT.toPptx(state.result);
      const name = `${state.deck.fileName || 'slide'} - ${state.result.theme.name}`.replace(/[\\/:*?"<>|]+/g, '_') + '.pptx';
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      status(`Đã tạo “${name}” (${Math.round(blob.size / 1024)} KB).`);
    } catch (e) { console.error(e); status('Lỗi khi tạo file: ' + e.message, true); }
    $('tdt-dl').disabled = false;
  }
  function open() { renderThemes(); if (state.deck) refresh(); if (!dlg.open) dlg.showModal(); }

  // nút mở
  document.getElementById('tdt-open').addEventListener('click', () => open());
  document.addEventListener('click', e => {
    const b = e.target.closest('.apply'); if (!b) return;
    const t = T.find(x => x[6] === b.dataset.url); if (!t) return;
    state.cardInfo = { name: t[0], style: t[4], pal: t[7] };
    state.cardTheme = TDT.themeFromCard(state.cardInfo);
    state.theme = state.cardTheme;
    open();
  });
  $('tdt-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  $('tdt-themes').addEventListener('click', e => { const b = e.target.closest('.tdt-th'); if (!b) return; state.theme = TDT.THEMES[b.dataset.id]; refresh(); });
  $('tdt-motifs').addEventListener('click', e => { const b = e.target.closest('.tdt-mo, .tdt-none'); if (!b) return; state.motif = b.dataset.id; refresh(); });
  $('tdt-motif-pal').addEventListener('change', () => refresh());
  $('tdt-from').addEventListener('click', e => { if (e.target.closest('#tdt-card')) { state.theme = state.cardTheme; refresh(); } });
  document.querySelectorAll('input[name="tdt-anim"]').forEach(r => r.addEventListener('change', () => state.deck && refresh()));
  $('tdt-trans').addEventListener('change', () => state.deck && refresh());
  $('tdt-keep').addEventListener('change', () => state.deck && refresh());
  $('tdt-dl').addEventListener('click', download);
  const drop = $('tdt-drop'), inp = $('tdt-input');
  drop.addEventListener('click', () => inp.click());
  drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
  inp.addEventListener('change', () => { const fs = [...inp.files]; inp.value = ''; loadFiles(fs); });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => { e.stopPropagation(); loadFiles([...e.dataTransfer.files]); });
  // thả file lên cả hộp thoại cũng được
  dlg.addEventListener('dragover', e => e.preventDefault());
  dlg.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) loadFiles([...e.dataTransfer.files]); });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => dlg.open && state.deck && refresh(), 200); });
})();
