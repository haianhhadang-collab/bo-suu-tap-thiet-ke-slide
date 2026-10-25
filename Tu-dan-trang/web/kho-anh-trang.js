/* Mục "Kho ảnh trang trí" trên trang Bộ sưu tập: xem, lọc theo gói, tải ảnh chụp (.jpg) và tranh vector (.svg). */
(function () {
  const TDT = window.TuDanTrang, D = TDT && TDT.KHO_ANH, box = document.getElementById('kho-anh');
  if (!box) return;
  if (!D) { box.hidden = true; return; }
  const $ = id => document.getElementById(id);
  const goc = () => window.TU_DAN_TRANG_KHO_ANH || 'Tu-dan-trang/kho-anh/';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const st = { goi: '', loai: '', mau: 'song-bien' };
  const tenGoi = id => (D.goi.find(g => g.id === id) || {}).ten || id;

  /** Tranh vector -> SVG theo bảng màu của một mẫu (cùng cách tô với bản dựng slide, không có lớp phủ). */
  function svg(it, th) {
    const c0 = th.inv[0], c1 = th.inv[th.inv.length - 1];
    const paths = it.hinh.map(s => {
      const d = s.p.map(r => { let p = 'M'; for (let i = 0; i < r.length; i += 2) p += (i ? 'L' : '') + r[i] + ',' + r[i + 1]; return p + (s.w ? '' : 'Z'); }).join('');
      const c = '#' + TDT.khoAnhMau(th, s.r);
      return s.w ? `<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${s.a}" stroke-width="${(s.w / 72).toFixed(4)}" stroke-linejoin="round" stroke-linecap="round"/>`
        : `<path d="${d}" fill="${c}" fill-opacity="${s.a}" fill-rule="evenodd"/>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.333 7.5" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g-${it.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${c0}"/><stop offset="1" stop-color="#${c1}"/></linearGradient></defs><rect width="13.333" height="7.5" fill="url(#g-${it.id})"/>${paths}</svg>`;
  }

  function card(it) {
    const goiTxt = `<span class="ka-goi">${esc(tenGoi(it.goi))}</span>`;
    if (it.loai === 'anh') {
      return `<figure class="ka-card"><a class="ka-pic" href="${goc()}anh/${it.id}.jpg" target="_blank" rel="noopener"><img loading="lazy" src="${goc()}thu-nho/${it.id}.jpg" alt="${esc(it.ten)}"></a>
        <figcaption><b>${esc(it.ten)}</b>${goiTxt}<small>Ảnh: ${esc(it.tac_gia)} · <a href="${esc(it.giay_phep_url || it.nguon)}" target="_blank" rel="noopener">${esc(it.giay_phep)}</a> · <a href="${esc(it.nguon)}" target="_blank" rel="noopener">Wikimedia Commons</a></small>
        <a class="ka-dl" href="${goc()}anh/${it.id}.jpg" download="${it.id}.jpg">⬇ Tải ảnh 1600×900</a></figcaption></figure>`;
    }
    return `<figure class="ka-card"><div class="ka-pic" data-tranh="${it.id}">${svg(it, TDT.THEMES[st.mau])}</div>
      <figcaption><b>${esc(it.ten)}</b>${goiTxt}<small>Tranh vector tự vẽ cho Tự dàn trang, đổi màu theo mẫu · dùng tự do</small>
      <button class="ka-dl" type="button" data-svg="${it.id}">⬇ Tải tranh .svg</button></figcaption></figure>`;
  }

  function render() {
    const items = D.muc.filter(m => (!st.goi || m.goi === st.goi) && (!st.loai || m.loai === st.loai));
    $('ka-grid').innerHTML = items.map(card).join('');
    $('ka-count').textContent = `${items.length} ảnh`;
    box.querySelectorAll('#ka-goi .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === st.goi)));
    box.querySelectorAll('#ka-loai .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === st.loai)));
    $('ka-mau-row').hidden = st.loai === 'anh';
  }

  const nAnh = D.muc.filter(m => m.loai === 'anh').length, nTranh = D.muc.length - nAnh;
  $('ka-sum').textContent = `${nAnh} ảnh chụp và ${nTranh} tranh vẽ trong ${D.goi.length} gói chủ đề.`;
  $('ka-goi').innerHTML = `<button class="chip" data-v="">Tất cả</button>` + D.goi.map(g => `<button class="chip" data-v="${g.id}">${esc(g.ten)}</button>`).join('');
  $('ka-loai').innerHTML = [['', 'Cả hai'], ['anh', 'Ảnh chụp'], ['tranh', 'Tranh vẽ']].map(([v, t]) => `<button class="chip" data-v="${v}">${t}</button>`).join('');
  $('ka-mau').innerHTML = Object.values(TDT.THEMES).map(th => `<option value="${th.id}">${esc(th.name)}</option>`).join('');
  $('ka-goi').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { st.goi = b.dataset.v; render(); } });
  $('ka-loai').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { st.loai = b.dataset.v; render(); } });
  $('ka-mau').addEventListener('change', e => { st.mau = e.target.value; render(); });
  $('ka-grid').addEventListener('click', e => {
    const b = e.target.closest('[data-svg]'); if (!b) return;
    const it = D.muc.find(m => m.id === b.dataset.svg);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg(it, TDT.THEMES[st.mau])], { type: 'image/svg+xml' }));
    a.download = `${it.id}-${st.mau}.svg`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
  const tog = $('ka-tog');
  tog.addEventListener('click', () => {
    const open = tog.getAttribute('aria-expanded') !== 'true';
    tog.setAttribute('aria-expanded', String(open)); box.classList.toggle('collapsed', !open);
    if (open && !$('ka-grid').childElementCount) render();
  });
  if (location.hash === '#kho-anh') { tog.setAttribute('aria-expanded', 'true'); box.classList.remove('collapsed'); render(); }
  window.addEventListener('hashchange', () => { if (location.hash === '#kho-anh' && tog.getAttribute('aria-expanded') !== 'true') tog.click(); });
})();
