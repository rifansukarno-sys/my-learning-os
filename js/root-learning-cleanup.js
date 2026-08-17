// Keep the root My Learning OS focused on skills and professional learning.
// The separate BINUS Online app remains under /binus-online/ and is untouched.
(() => {
  const removeCollegeTrack = () => {
    if (window.CURRICULUM && window.CURRICULUM.industrial) {
      delete window.CURRICULUM.industrial;
    }
  };

  removeCollegeTrack();

  document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.hero-copy h1');
    const eyebrow = document.querySelector('.hero-copy .eyebrow');
    const sub = document.querySelector('.hero-sub');
    const cta = document.querySelector('#startLearning');

    if (eyebrow) eyebrow.textContent = 'PERSONAL SKILL DEVELOPMENT';
    if (title) {
      title.innerHTML = 'Kembangkan Skill.<br><span>Bangun Portofolio. Siap untuk Masa Depan.</span>';
    }
    if (sub) {
      sub.textContent = 'Satu ruang belajar untuk membangun kompetensi praktis dari dasar hingga mahir—tanpa batas semester dan tanpa fokus pada kuliah.';
    }
    if (cta) cta.innerHTML = 'Mulai Belajar <b>→</b>';

    // Remove any accidentally rendered BINUS/Industrial card from existing markup.
    document.querySelectorAll('a, button, article, section, div').forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text === 's1 teknik industri — binus online' || text === 'binus online') el.remove();
    });
  });
})();
