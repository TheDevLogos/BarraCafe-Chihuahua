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

let stamps = 7;
let selectedDrink = 'Latte de la casa';
const stampCount = document.querySelector('#stamp-count');
const rewardTitle = document.querySelector('#reward-title');
const rewardIcon = document.querySelector('#reward-icon');
const stampItems = [...document.querySelectorAll('.stamp-track i')];
const feedback = document.querySelector('.simulator-feedback');

function updateLoyaltySimulator() {
  const remaining = Math.max(10 - stamps, 0);
  stampCount.textContent = Math.min(stamps, 10);
  stampItems.forEach((stamp, index) => {
    const earned = index < Math.min(stamps, 9);
    stamp.classList.toggle('is-earned', earned);
  });
  if (stamps >= 10) {
    rewardTitle.textContent = '¡Bebida de cortesía!';
    rewardIcon.textContent = '☕';
    rewardIcon.classList.add('is-redeemable');
    feedback.textContent = `Tu ${selectedDrink} desbloqueó la recompensa. La siguiente bebida participante es cortesía de la casa.`;
  } else {
    rewardTitle.textContent = `Faltan ${remaining} sello${remaining === 1 ? '' : 's'}`;
    rewardIcon.textContent = String(remaining).padStart(2, '0');
    rewardIcon.classList.remove('is-redeemable');
    feedback.textContent = `${selectedDrink} seleccionado · ${remaining} sello${remaining === 1 ? '' : 's'} para una bebida de cortesía.`;
  }
}

$$('.drink-choice').forEach((choice) => choice.addEventListener('click', () => {
  $$('.drink-choice').forEach((item) => item.classList.remove('selected'));
  choice.classList.add('selected');
  selectedDrink = choice.dataset.drink;
  updateLoyaltySimulator();
}));

document.querySelector('.js-add-stamp').addEventListener('click', () => {
  if (stamps < 10) stamps += 1;
  updateLoyaltySimulator();
});

document.querySelector('.reset-stamps').addEventListener('click', () => {
  stamps = 7;
  updateLoyaltySimulator();
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

// Demo funcional del panel administrativo.
const crmLogin = document.querySelector('#crm-login');
const crmWorkspace = document.querySelector('#crm-workspace');
const crmLoginForm = document.querySelector('#crm-login-form');
const crmSectionName = document.querySelector('#crm-section-name');
const crmSidebar = document.querySelector('.crm-workspace');

function openCrmPanel(panel = 'overview') {
  $$('.crm-nav').forEach((item) => item.classList.toggle('active', item.dataset.panel === panel));
  $$('[data-panel-content]').forEach((item) => item.classList.toggle('active', item.dataset.panelContent === panel));
  const selected = document.querySelector(`.crm-nav[data-panel="${panel}"]`);
  if (selected) crmSectionName.textContent = selected.textContent.replace(/\d+/g, '').trim();
  crmSidebar.classList.remove('menu-open');
  document.querySelector('.crm-main').scrollTop = 0;
}

crmLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  crmLogin.hidden = true;
  crmWorkspace.hidden = false;
  openCrmPanel();
  showToast('Sesión de demostración iniciada.');
});

$$('.crm-nav, [data-panel]').forEach((button) => button.addEventListener('click', () => {
  const panel = button.dataset.panel;
  if (panel) openCrmPanel(panel);
}));

document.querySelector('.crm-logout').addEventListener('click', () => {
  crmWorkspace.hidden = true;
  crmLogin.hidden = false;
  showToast('Sesión cerrada.');
});

document.querySelector('.crm-mobile-menu').addEventListener('click', () => crmSidebar.classList.toggle('menu-open'));
document.querySelector('.crm-wallet-card').addEventListener('click', () => showToast('Google Wallet está listo para conectar cuando se configure el emisor.'));
document.querySelector('.crm-login-form .link-button').addEventListener('click', () => showToast('En la versión conectada podrás recuperar el acceso por correo.'));
