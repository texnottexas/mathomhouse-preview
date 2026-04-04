function toggleMenu() {
  document.getElementById('nav').classList.toggle('active');
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Theme is handled by header.js (dark by default). No duplicate theme init needed.
window.addEventListener('scroll', () => {
  const button = document.getElementById('backToTop');
  button.classList.toggle('show', window.scrollY > 300);
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.section').forEach(section => observer.observe(section));

function filterGuides() {
  const query = document.getElementById('guideSearch').value.toLowerCase();
  const sections = document.querySelectorAll('.section');

  sections.forEach(section => {
    const cards = section.querySelectorAll('.card');
    let sectionHasVisibleCard = false;

    cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const content = card.querySelector('p').textContent.toLowerCase();
      const keywords = card.dataset.keywords?.toLowerCase() || '';
      const isMatch = title.includes(query) || content.includes(query) || keywords.includes(query);

      card.classList.toggle('hidden', !isMatch);
      if (isMatch) sectionHasVisibleCard = true;
    });

    if (section.id !== 'home') {
      section.classList.toggle('hidden', !sectionHasVisibleCard);
    }
  });
}

