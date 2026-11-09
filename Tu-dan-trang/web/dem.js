/* Đếm lượt truy cập trang và lượt tải file PowerPoint, hiện ở dãy số liệu đầu trang.
   GitHub Pages là trang tĩnh nên số đếm nằm ở dịch vụ abacus.jasoncameron.dev (không cần tài khoản).
   Chỉ gửi yêu cầu tăng số, không gửi file hay nội dung của người dùng. Mở trên máy (localhost, file://) thì chỉ đọc số, không đếm thêm. */
(function () {
  const API = 'https://abacus.jasoncameron.dev', NS = 'bo-suu-tap-thiet-ke-slide';
  const THAT = /\.github\.io$/.test(location.hostname);
  const NHAN = { 'truy-cap': 'lượt truy cập', 'tai-ve': 'lượt tải về' };
  const box = document.querySelector('.stats');
  const dem = (key, tang) => fetch(`${API}/${tang ? 'hit' : 'get'}/${NS}/${key}`, { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null).then(d => d ? d.value : null).catch(() => null);
  function hien(key, v) {
    if (v == null || !box) return;
    let el = document.getElementById('dem-' + key);
    if (!el) {
      el = document.createElement('div'); el.className = 'stat'; el.id = 'dem-' + key;
      el.append(document.createElement('b'), document.createElement('span'));
      el.lastChild.textContent = NHAN[key];
      box.append(el);
    }
    el.firstChild.textContent = v.toLocaleString('vi-VN');
  }
  // mỗi phiên trình duyệt chỉ tính một lượt truy cập, tải lại trang không đếm thêm
  let moi = true;
  try { moi = !sessionStorage.getItem('dem-da-tinh'); sessionStorage.setItem('dem-da-tinh', '1'); } catch (e) { /* trình duyệt chặn lưu trữ */ }
  Promise.all([dem('truy-cap', THAT && moi), dem('tai-ve', false)]).then(([vao, tai]) => {
    if (vao == null) return;   // dịch vụ không trả lời: không hiện gì, trang vẫn dùng bình thường
    hien('truy-cap', vao); hien('tai-ve', tai == null ? 0 : tai);
  });
  // gọi từ ui.js sau khi file PowerPoint đã được tạo và tải về
  window.TuDanTrang.demTai = () => { if (THAT) dem('tai-ve', true).then(v => hien('tai-ve', v)); };
})();
