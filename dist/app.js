const $$ = (selector) => document.querySelectorAll(selector);
const adminModal = document.querySelector('#admin-modal');
const joinModal = document.querySelector('#join-modal');
const toast = document.querySelector('.toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3600);
}

$$('.js-open-admin').forEach((button) => button.addEventListener('click', () => adminModal.showModal()));
$$('.js-join').forEach((button) => button.addEventListener('click', () => joinModal.showModal()));
$$('.modal-close, .js-close-modal').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach((modal) => modal.addEventListener('click', (event) => {
  const rect = modal.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
}));

document.querySelector('.join-form').addEventListener('submit', (event) => {
  event.preventDefault();
  joinModal.close();
  showToast('¡Listo! Tu tarjeta estará lista para agregar a Google Wallet.');
  event.target.reset();
});

document.querySelector('.newsletter').addEventListener('submit', (event) => {
  event.preventDefault();
  showToast('Gracias. Te avisaremos de la próxima bebida de temporada.');
  event.target.reset();
});

$$('.js-product').forEach((button) => button.addEventListener('click', () => showToast('Pregunta por esta bebida en barra.')));
document.querySelector('.js-play-story').addEventListener('click', () => {
  document.querySelector('#cafe').scrollIntoView({ behavior: 'smooth' });
});

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('in-view');
    observer.unobserve(entry.target);
  }
}), { threshold: 0.14 });
$$('.reveal').forEach((element) => observer.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-header nav');
toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('open', !expanded);
});
