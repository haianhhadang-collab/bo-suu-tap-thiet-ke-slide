/* Nút lên đầu trang: chỉ hiện khi đã cuộn xuống quá khoảng một màn hình. */
(function () {
  const b = document.getElementById('len-dau');
  if (!b) return;
  const sync = () => b.classList.toggle('on', scrollY > innerHeight * 0.8);
  addEventListener('scroll', sync, { passive: true });
  sync();
  b.addEventListener('click', () => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
})();
