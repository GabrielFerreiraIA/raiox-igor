const progress = document.getElementById('reading-progress');
const choiceCards = [...document.querySelectorAll('[data-choice]')];
const choiceInsight = document.getElementById('choice-insight-text');

const choiceQuestions = {
  operacao: 'Se a primeira capacidade nova for operacional, quais tarefas e exceções ela absorveria — e como Igor saberia que o padrão de entrega foi preservado?',
  comercial: 'Se o primeiro reforço for a entrada comercial, quem garante tempo e capacidade para atender a demanda sem sobrecarregar a entrega?'
};

choiceCards.forEach((card) => {
  card.addEventListener('click', () => {
    choiceCards.forEach((item) => {
      const selected = item === card;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    choiceInsight.textContent = choiceQuestions[card.dataset.choice];
  });
});

document.getElementById('print-page')?.addEventListener('click', () => window.print());
document.getElementById('logout')?.addEventListener('click', () => {
  sessionStorage.removeItem('raiox_igor_access');
  location.replace('login.html');
});

let ticking = false;
function updateProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const percent = available > 0 ? Math.min(100, Math.max(0, (window.scrollY / available) * 100)) : 100;
  progress.style.transform = `scaleX(${percent / 100})`;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 25px 0px' });
  document.querySelectorAll('[data-reveal]').forEach((item) => revealObserver.observe(item));
}
