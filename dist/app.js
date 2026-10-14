const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const $ = (selector, root = document) => root.querySelector(selector);
const adminModal = $('#admin-modal');
const joinModal = $('#join-modal');
const toast = $('.toast');
const crmLogin = $('#crm-login');
const crmWorkspace = $('#crm-workspace');
const crmLoginForm = $('#crm-login-form');
const crmSidebar = $('.crm-workspace');
const storageKey = 'cafeChihuahuaCRM.v1';

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3600);
}

function seedData() {
  const now = new Date();
  const daysAgo = (days) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - days, 10 + days % 8, 15).toISOString();
  const products = [
    { id: 'latte', name: 'Latte de la casa', category: 'Caliente', price: 65, stamps: true, active: true, icon: '☕', description: 'Espresso · Leche sedosa' },
    { id: 'americano', name: 'Americano', category: 'Caliente', price: 45, stamps: true, active: true, icon: '◐', description: 'Doble espresso · Agua' },
    { id: 'cold-brew', name: 'Cold brew de vainilla', category: 'Fría', price: 75, stamps: true, active: true, icon: '🧊', description: '12 h de extracción · Vainilla' },
    { id: 'chai', name: 'Chai del desierto', category: 'Temporada', price: 72, stamps: true, active: true, icon: '✦', description: 'Especias · Leche · Canela' },
    { id: 'matcha', name: 'Matcha frío', category: 'Fría', price: 78, stamps: true, active: true, icon: '🍵', description: 'Matcha · Leche · Hielo' },
    { id: 'v60', name: 'V60 de temporada', category: 'Temporada', price: 82, stamps: false, active: true, icon: '◒', description: 'Filtrado del día' },
  ];
  const customers = [
    { id: 'c1', name: 'Fernanda Ruiz', email: 'fernanda@example.test', phone: '', birthday: '', favorite: 'Latte de la casa', joined: daysAgo(80), stamps: 7, visits: 12, consent: true },
    { id: 'c2', name: 'Mariana Pérez', email: 'mariana@example.test', phone: '', birthday: '', favorite: 'Cold brew de vainilla', joined: daysAgo(63), stamps: 5, visits: 9, consent: true },
    { id: 'c3', name: 'José Díaz', email: 'jose@example.test', phone: '', birthday: '', favorite: 'Chai del desierto', joined: daysAgo(120), stamps: 9, visits: 18, consent: true },
    { id: 'c4', name: 'Lucía Méndez', email: 'lucia@example.test', phone: '', birthday: '', favorite: 'Americano', joined: daysAgo(42), stamps: 3, visits: 6, consent: false },
  ];
  const campaigns = [
    { id: 'camp1', name: 'Frío otra vez', description: 'Doble sello en bebidas frías de lunes a jueves.', segment: 'Clientes activos', code: 'FRIO10', discount: 'Doble sello', status: 'Activa', starts: daysAgo(2), ends: daysAgo(-5), usageLimit: 100, sends: 24, redemptions: 8, sales: 600, conditions: 'Una vez por cliente' },
    { id: 'camp2', name: 'Cumpleaños con bebida de regalo', description: 'Una bebida chica para celebrar.', segment: 'Cumpleaños del mes', code: 'CUMPLE', discount: 'Bebida gratis', status: 'Programada', starts: daysAgo(-10), ends: daysAgo(-40), usageLimit: 30, sends: 0, redemptions: 0, sales: 0, conditions: 'Válida durante el mes de cumpleaños' },
    { id: 'camp3', name: 'Especial V60', description: 'Conoce el origen invitado de la temporada.', segment: 'Amantes del filtrado', code: 'V60NORTE', discount: '$15 de descuento', status: 'Borrador', starts: daysAgo(-15), ends: daysAgo(-30), usageLimit: 50, sends: 0, redemptions: 0, sales: 0, conditions: 'En V60 de temporada' },
  ];
  const sales = [];
  const mix = [
    ['c1', 'latte', 65], ['c2', 'cold-brew', 75], ['c3', 'chai', 72], ['c4', 'americano', 45],
    ['c1', 'latte', 65], ['c2', 'matcha', 78], ['c3', 'americano', 45], ['c1', 'cold-brew', 75],
    ['c4', 'latte', 65], ['c2', 'cold-brew', 75], ['c3', 'chai', 72], ['c1', 'latte', 65],
    ['c2', 'americano', 45], ['c3', 'cold-brew', 75], ['c1', 'matcha', 78], ['c4', 'chai', 72],
    ['c3', 'latte', 65], ['c1', 'americano', 45], ['c2', 'latte', 65], ['c3', 'chai', 72],
  ];
  mix.forEach(([customerId, productId, amount], i) => sales.push({ id: `s${i + 1}`, customerId, productId, productName: products.find((p) => p.id === productId).name, quantity: 1, amount, date: daysAgo(i % 12), coupon: i === 2 ? 'FRIO10' : '', stamps: products.find((p) => p.id === productId).stamps ? 1 : 0, rewardRedeemed: false }));
  return { products, customers, campaigns, sales, settings: { threshold: 10, reward: 'Una bebida de cortesía', allowedProductIds: products.filter((p) => p.stamps).map((p) => p.id) }, currentPanel: 'overview' };
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.products) && Array.isArray(saved.customers) && Array.isArray(saved.sales)) return { ...seedData(), ...saved };
  } catch (error) { console.warn('No se pudieron leer los datos locales de demostración.', error); }
  return seedData();
}

let data = loadData();
let searchTerm = '';
let productFilter = 'Todos';
let activeCampaignId = null;
let sessionName = 'Equipo de barra';

function saveData() {
  try { localStorage.setItem(storageKey, JSON.stringify(data)); }
  catch { showToast('El navegador no pudo guardar cambios. Revisa el espacio disponible.'); }
}
function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function money(value) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value || 0); }
function dateLabel(value) { return value ? new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(new Date(value)) : 'Sin fecha'; }
function initials(name = '') { return name.split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase(); }
function customerById(id) { return data.customers.find((customer) => customer.id === id); }
function productById(id) { return data.products.find((product) => product.id === id); }
function activeSales(since = 0) { const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - since); return data.sales.filter((sale) => new Date(sale.date) >= cutoff); }
function currentMetrics() {
  const month = activeSales(30);
  const today = data.sales.filter((sale) => new Date(sale.date).toDateString() === new Date().toDateString());
  const repeat = data.customers.filter((customer) => customer.visits > 1).length;
  return { month, today, revenue: month.reduce((sum, sale) => sum + sale.amount, 0), todayRevenue: today.reduce((sum, sale) => sum + sale.amount, 0), avg: month.length ? month.reduce((sum, sale) => sum + sale.amount, 0) / month.length : 0, repeat: data.customers.length ? Math.round(repeat / data.customers.length * 100) : 0, redeemed: data.sales.filter((sale) => sale.rewardRedeemed).length, newCustomers: data.customers.filter((customer) => new Date(customer.joined) >= new Date(Date.now() - 30 * 86400000)).length };
}
function panelHeading(kicker, title, subtitle, action, label) {
  return `<div class="crm-heading"><div><p>${kicker}</p><h2>${title}</h2><span>${subtitle}</span></div>${action ? `<button class="crm-primary-action" type="button" data-action="${action}">${label}</button>` : ''}</div>`;
}
function navName(key) { return ({ overview: 'Resumen', customers: 'Clientes', sales: 'Ventas', campaigns: 'Campañas', rewards: 'Sellos y premios', products: 'Productos', reports: 'Reportes' })[key] || 'Resumen'; }

function renderOverview() {
  const m = currentMetrics();
  const topProducts = [...data.products].map((p) => ({ ...p, sold: data.sales.filter((sale) => sale.productId === p.id).reduce((sum, sale) => sum + sale.quantity, 0) })).sort((a, b) => b.sold - a.sold).slice(0, 3);
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return date; });
  const daily = days.map((day) => data.sales.filter((sale) => new Date(sale.date).toDateString() === day.toDateString()).reduce((sum, sale) => sum + sale.amount, 0));
  const max = Math.max(...daily, 1);
  const activity = [...data.sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const campaign = data.campaigns.find((item) => item.status === 'Activa');
  return `${panelHeading(`RESUMEN · ${new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase()}`, `Hola, <em>${escapeHtml(sessionName.split('@')[0])}.</em>`, 'La actividad de esta demo se calcula con los movimientos guardados en este navegador.', 'sale', '+ Registrar venta')}
    <div class="crm-metrics-grid"><article><span class="crm-metric-icon">$</span><small>VENTAS DE HOY</small><strong>${money(m.todayRevenue)}</strong><em>${m.today.length} tickets <i>registrados</i></em></article><article><span class="crm-metric-icon">◒</span><small>VENTAS · 30 DÍAS</small><strong>${money(m.revenue)}</strong><em>${m.month.length} tickets <i>registrados</i></em></article><article><span class="crm-metric-icon">◎</span><small>TICKET PROMEDIO</small><strong>${money(m.avg)}</strong><em>${data.customers.length} clientes <i>en el CRM</i></em></article><article><span class="crm-metric-icon">✦</span><small>PREMIOS CANJEADOS</small><strong>${m.redeemed}</strong><em>${m.repeat}% <i>clientes recurrentes</i></em></article></div>
    <div class="crm-insights-grid"><article class="crm-card crm-sales-card"><div class="crm-card-top"><div><small>INGRESOS · ÚLTIMOS 7 DÍAS</small><h3>${money(daily.reduce((a, b) => a + b, 0))}</h3></div><span class="demo-label">Datos de demostración</span></div><div class="crm-chart"><div class="chart-grid-lines"></div><div class="chart-columns">${days.map((day, i) => `<i class="${i === 6 ? 'today' : ''}" style="height:${Math.max(8, daily[i] / max * 100)}%"><b>${money(daily[i])}</b><span>${new Intl.DateTimeFormat('es-MX', { weekday: 'short' }).format(day).replace('.', '').toUpperCase()}</span></i>`).join('')}</div></div></article><article class="crm-card crm-goal-card"><div class="goal-orbit"><strong>${data.settings.threshold}<span></span></strong><small>SELLOS<br>POR PREMIO</small></div><h3>${escapeHtml(data.settings.reward)}</h3><p>${data.settings.allowedProductIds.length} productos participantes. Cambia reglas desde Sellos y premios.</p><button type="button" data-panel="rewards">Editar programa →</button></article></div>
    <div class="crm-bottom-grid"><article class="crm-card crm-table-card"><div class="crm-card-title"><div><h3>Últimas ventas</h3><p>Movimientos capturados en este navegador</p></div><button type="button" data-panel="sales">Ver todas →</button></div><div class="crm-mini-table"><div class="crm-table-row table-head"><span>CLIENTE</span><span>COMPRA</span><span>SELLOS</span><span>TOTAL</span></div>${activity.length ? activity.map((sale) => `<div class="crm-table-row"><span><i class="customer-dot peach">${escapeHtml(initials(customerById(sale.customerId)?.name || 'NA'))}</i>${escapeHtml(customerById(sale.customerId)?.name || 'Cliente sin registro')}</span><span>${escapeHtml(sale.productName)}${sale.quantity > 1 ? ` × ${sale.quantity}` : ''}</span><span><b>+${sale.stamps}</b></span><strong>${money(sale.amount)}</strong></div>`).join('') : '<p class="empty-state">Aún no hay ventas. Registra la primera para iniciar tus reportes.</p>'}</div></article><article class="crm-card crm-campaign-card"><div class="campaign-chip">${campaign ? 'CAMPAÑA ACTIVA' : 'SIN CAMPAÑAS ACTIVAS'}</div><h3>${campaign ? escapeHtml(campaign.name) : 'Planea tu<br>próxima campaña.'}</h3><p>${campaign ? escapeHtml(campaign.description) : 'Crea una promoción segmentada y sigue sus resultados.'}</p>${campaign ? `<div><span><b>${campaign.sends}</b> envíos demo</span><span><b>${campaign.redemptions}</b> canjes</span><span><b>${money(campaign.sales)}</b> ventas</span></div>` : ''}<button type="button" data-panel="campaigns">Gestionar campañas →</button></article></div>
    <article class="crm-card crm-table-card crm-top-products"><div class="crm-card-title"><div><h3>Productos más vendidos</h3><p>Unidades incluidas en tickets de demostración</p></div></div>${topProducts.map((p, i) => `<div class="product-ranking"><span>${i + 1}</span><b>${escapeHtml(p.name)}</b><i>${p.sold} unidades</i><strong>${money(data.sales.filter((s) => s.productId === p.id).reduce((sum, s) => sum + s.amount, 0))}</strong></div>`).join('')}</article>`;
}

function renderCustomers() {
  const q = searchTerm.toLocaleLowerCase('es-MX');
  const list = data.customers.filter((c) => `${c.name} ${c.email} ${c.phone} ${c.favorite}`.toLocaleLowerCase('es-MX').includes(q));
  return `${panelHeading('COMUNIDAD', 'Clientes <em>del Círculo.</em>', `${data.customers.length} clientes de demostración · segmentos por visitas, preferencia y progreso.`, 'customer', '+ Nuevo cliente')}<div class="crm-card crm-directory"><div class="crm-directory-tools"><label class="crm-input-search">⌕ <input data-search placeholder="Buscar nombre, correo, teléfono o favorito" value="${escapeHtml(searchTerm)}" /></label><span class="demo-label">${list.length} resultados</span></div><div class="table-scroll"><div class="crm-list-head crm-customer-head"><span>CLIENTE</span><span>VISITAS</span><span>FAVORITO</span><span>SELLOS</span><span>ÚLTIMA COMPRA</span><span>PERMISO</span></div>${list.length ? list.map((c) => {
    const last = data.sales.filter((sale) => sale.customerId === c.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return `<div class="crm-list-row crm-customer-row"><span><i class="customer-dot peach">${escapeHtml(initials(c.name))}</i><b>${escapeHtml(c.name)}<small>${escapeHtml(c.email)}</small></b></span><span>${c.visits} visitas</span><span>${escapeHtml(c.favorite || 'Sin favorito')}</span><span><em class="stamp-pips">${'●'.repeat(Math.min(c.stamps, data.settings.threshold))}<i>${'○'.repeat(Math.max(0, data.settings.threshold - c.stamps))}</i></em><small class="progress-caption">${c.stamps}/${data.settings.threshold}</small></span><span>${last ? dateLabel(last.date) : 'Sin compras'}</span><span>${c.consent ? '<i class="status-pill status-yes">Con permiso</i>' : '<i class="status-pill">Sin permiso</i>'}</span></div>`;
  }).join('') : '<p class="empty-state">No encontramos clientes con esa búsqueda.</p>'}</div></div>`;
}

function renderSales() {
  const sales = [...data.sales].sort((a, b) => new Date(b.date) - new Date(a.date));
  return `${panelHeading('OPERACIÓN DE BARRA', 'Ventas <em>registradas.</em>', 'Captura tickets manualmente y actualiza sellos, clientes e indicadores.', 'sale', '+ Registrar venta')}<div class="crm-metrics-grid"><article><small>INGRESOS · 30 DÍAS</small><strong>${money(currentMetrics().revenue)}</strong><em>${currentMetrics().month.length} tickets</em></article><article><small>TICKET PROMEDIO</small><strong>${money(currentMetrics().avg)}</strong><em>por compra</em></article><article><small>SELLOS REGISTRADOS</small><strong>${data.sales.reduce((sum, sale) => sum + sale.stamps, 0)}</strong><em>en compras participantes</em></article><article><small>CANJES DE PREMIO</small><strong>${currentMetrics().redeemed}</strong><em>en tickets</em></article></div><div class="crm-card crm-directory"><div class="crm-card-title"><div><h3>Historial de tickets</h3><p>Los datos se guardan solo en este navegador.</p></div><button type="button" data-action="sale">+ Registrar venta</button></div><div class="table-scroll"><div class="crm-list-head crm-sales-head"><span>FECHA</span><span>CLIENTE</span><span>PRODUCTO</span><span>CUPÓN</span><span>SELLOS</span><span>TOTAL</span></div>${sales.length ? sales.map((s) => `<div class="crm-list-row crm-sales-row"><span>${dateLabel(s.date)}</span><span>${escapeHtml(customerById(s.customerId)?.name || 'Cliente sin registro')}</span><span>${escapeHtml(s.productName)} × ${s.quantity}</span><span>${s.coupon ? `<code>${escapeHtml(s.coupon)}</code>` : '—'}</span><span>+${s.stamps}${s.rewardRedeemed ? ' · premio canjeado' : ''}</span><strong>${money(s.amount)}</strong></div>`).join('') : '<p class="empty-state">Aún no hay tickets. Registra una venta para empezar.</p>'}</div></div>`;
}

function renderCampaigns() {
  const campaigns = data.campaigns;
  return `${panelHeading('MENSAJES QUE SÍ REGRESAN', 'Campañas y <em>promociones.</em>', 'Define segmento, vigencia, código y límite. Los envíos se simulan; no salen mensajes.', 'campaign', '+ Crear campaña')}<div class="notice-box"><b>Modo demostración:</b> los envíos y canjes solo actualizan estos indicadores. No se contacta a clientes por correo o WhatsApp.</div><div class="crm-campaign-list">${campaigns.length ? campaigns.map((c) => `<article class="crm-card campaign-row"><div><i class="campaign-state ${c.status === 'Activa' ? 'finished' : c.status === 'Programada' ? 'scheduled' : 'draft'}">${escapeHtml(c.status.toUpperCase())}</i><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.description)}</p><div class="campaign-meta"><span>Segmento: <b>${escapeHtml(c.segment)}</b></span><span>Vigencia: <b>${dateLabel(c.starts)} – ${dateLabel(c.ends)}</b></span><span>Código: <code>${escapeHtml(c.code)}</code> · ${c.redemptions}/${c.usageLimit} canjes</span></div><div class="campaign-stats"><span><b>${c.sends}</b> envíos simulados</span><span><b>${c.redemptions}</b> canjes</span><span><b>${money(c.sales)}</b> ventas asociadas</span><span><b>${c.sends ? `${Math.round(c.redemptions / c.sends * 100)}%` : '—'}</b> tasa de canje</span></div></div><div class="campaign-actions"><button class="crm-secondary-action" data-action="send-campaign" data-id="${c.id}" type="button">Simular envío</button><button class="crm-secondary-action" data-action="edit-campaign" data-id="${c.id}" type="button">Editar</button><button class="crm-danger-action" data-action="delete-campaign" data-id="${c.id}" type="button">Eliminar</button></div></article>`).join('') : '<p class="empty-state">Aún no hay campañas. Crea una para preparar una promoción.</p>'}</div>`;
}

function renderRewards() {
  const eligible = data.settings.allowedProductIds.map(productById).filter(Boolean);
  return `${panelHeading('PROGRAMA DE LEALTAD', 'Sellos que se <em>vuelven visitas.</em>', 'Elige qué productos participan y cuántos sellos desbloquean una recompensa.', 'rewards', 'Editar reglas')}<div class="crm-rewards-layout"><article class="crm-card reward-rule"><div class="reward-rule-top"><span>REGLA ACTUAL</span><span class="demo-label">Editable</span></div><h3>${data.settings.threshold} compras participantes<br><em>= ${escapeHtml(data.settings.reward)}</em></h3><p>Se suma un sello por unidad participante en una venta registrada.</p><div class="rule-products">${eligible.length ? eligible.map((p) => `<span>${escapeHtml(p.name)}</span>`).join('') : '<span>Sin productos elegibles</span>'}</div><div class="reward-rule-footer"><span><b>${data.sales.reduce((sum, sale) => sum + sale.stamps, 0)}</b> sellos de demo</span><span><b>${currentMetrics().redeemed}</b> premios canjeados</span></div><button type="button" data-action="rewards">Editar regla y productos →</button></article><article class="crm-card birthday-card"><span>CAMPAÑAS ESTACIONALES</span><h3>Cumpleaños,<br>temporada y lanzamientos.</h3><p>Prepara una promoción segmentada y su cupón. Programa envíos futuros en esta demo; no se mandan mensajes.</p><div><b>${data.campaigns.length}</b> campañas <button type="button" data-panel="campaigns">Gestionar →</button></div></article></div><div class="crm-card redemption-card"><div><h3>Progreso de sellos</h3><p>Clientes cerca de desbloquear su premio</p></div>${data.customers.slice().sort((a,b) => b.stamps-a.stamps).map((c) => `<div class="progress-row"><span>${escapeHtml(c.name)}</span><span>${c.stamps}/${data.settings.threshold}</span><div class="mini-progress"><i style="width:${Math.min(100, c.stamps/data.settings.threshold*100)}%"></i></div></div>`).join('')}</div>`;
}

function renderProducts() {
  const products = data.products.filter((p) => productFilter === 'Todos' || p.category === productFilter);
  return `${panelHeading('CATÁLOGO DE BARRA', 'Lo que se <em>sirve hoy.</em>', 'Edita productos, precio, categoría y participación en el programa de sellos.', 'product', '+ Agregar producto')}<div class="crm-product-toolbar">${['Todos', 'Caliente', 'Fría', 'Temporada'].map((filter) => `<button class="${productFilter === filter ? 'active' : ''}" type="button" data-action="filter-products" data-filter="${filter}">${filter === 'Caliente' ? 'Calientes' : filter === 'Fría' ? 'Frías' : filter}</button>`).join('')}</div><div class="crm-products-grid">${products.map((p) => `<article class="crm-product-card ${p.category === 'Fría' ? 'cold' : p.category === 'Temporada' ? 'season' : 'hot'} ${p.active ? '' : 'product-disabled'}"><span>${escapeHtml(p.category.toUpperCase())} · ${p.active ? 'ACTIVO' : 'PAUSADO'}</span><div>${escapeHtml(p.icon)}</div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description)}</p><footer><b>${money(p.price)}</b><em>${p.stamps ? '✓ Suma sello' : 'No suma sello'}</em></footer><div class="product-actions"><button type="button" data-action="edit-product" data-id="${p.id}">Editar</button><button type="button" data-action="toggle-product" data-id="${p.id}">${p.active ? 'Pausar' : 'Activar'}</button></div></article>`).join('')}</div>`;
}

function renderReports() {
  const m = currentMetrics();
  const productStats = data.products.map((p) => ({ ...p, sold: data.sales.filter((s) => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0), income: data.sales.filter((s) => s.productId === p.id).reduce((sum, s) => sum + s.amount, 0) })).sort((a,b) => b.sold-a.sold);
  const best = productStats[0];
  const bestCampaign = data.campaigns.slice().sort((a,b) => (b.sends ? b.redemptions/b.sends : 0) - (a.sends ? a.redemptions/a.sends : 0))[0];
  return `${panelHeading('INTELIGENCIA DE LA BARRA', 'Datos para <em>decidir mejor.</em>', 'Métricas calculadas desde las ventas, campañas y canjes registrados en esta demo.', 'export', 'Descargar CSV ↓')}<div class="notice-box">Periodo de análisis: últimos 30 días · Moneda: pesos mexicanos · Fuente: registros locales de demostración.</div><div class="crm-report-grid"><article class="crm-card"><small>INGRESOS · 30 DÍAS</small><h3>Ventas de barra</h3><strong>${money(m.revenue)} <em>${m.month.length} tickets</em></strong><div class="mini-progress"><i style="width:${Math.min(100, Math.max(4, m.revenue / 30000 * 100))}%"></i></div></article><article class="crm-card"><small>TICKET PROMEDIO</small><h3>Por compra</h3><strong>${money(m.avg)} <em>por ticket</em></strong><div class="mini-progress orange"><i style="width:${Math.min(100, m.avg / 150 * 100)}%"></i></div></article><article class="crm-card"><small>CLIENTES</small><h3>${m.newCustomers} nuevos · ${data.customers.length} totales</h3><strong>${m.repeat}% <em>recurrentes</em></strong><div class="mini-progress green"><i style="width:${m.repeat}%"></i></div></article><article class="crm-card"><small>PRODUCTO MÁS VENDIDO</small><h3>${escapeHtml(best?.name || 'Sin ventas')}</h3><strong>${best?.sold || 0} <em>unidades · ${money(best?.income || 0)}</em></strong><div class="mini-progress"><i style="width:${best && productStats[0].sold ? Math.max(8, best.sold / Math.max(1, productStats.reduce((a,b) => a+b.sold,0))*100) : 0}%"></i></div></article><article class="crm-card"><small>PREMIOS</small><h3>Recompensas canjeadas</h3><strong>${m.redeemed} <em>en tickets</em></strong><div class="mini-progress orange"><i style="width:${Math.min(100, m.redeemed * 10)}%"></i></div></article><article class="crm-card"><small>CAMPAÑA CON MÁS CANJES</small><h3>${escapeHtml(bestCampaign?.name || 'Sin campañas')}</h3><strong>${bestCampaign?.sends ? `${Math.round(bestCampaign.redemptions/bestCampaign.sends*100)}%` : '—'} <em>tasa de canje</em></strong><div class="mini-progress green"><i style="width:${bestCampaign?.sends ? Math.min(100, bestCampaign.redemptions/bestCampaign.sends*100) : 0}%"></i></div></article></div><div class="crm-card crm-directory report-products"><div class="crm-card-title"><div><h3>Rendimiento por producto</h3><p>Unidades e ingresos por producto</p></div></div>${productStats.map((p) => `<div class="product-ranking"><span>${p.icon}</span><b>${escapeHtml(p.name)}</b><i>${p.sold} unidades</i><strong>${money(p.income)}</strong></div>`).join('')}</div><div class="crm-card crm-directory report-products"><div class="crm-card-title"><div><h3>Resultados por campaña</h3><p>Código, envíos de demo, canjes y ventas atribuidas</p></div></div>${data.campaigns.length ? data.campaigns.map((c) => `<div class="product-ranking"><span>✦</span><b>${escapeHtml(c.name)} <code>${escapeHtml(c.code)}</code></b><i>${c.sends} envíos · ${c.redemptions} canjes</i><strong>${money(c.sales)}</strong></div>`).join('') : '<p class="empty-state">Crea una campaña para medir resultados.</p>'}</div>`;
}

const renderers = { overview: renderOverview, customers: renderCustomers, sales: renderSales, campaigns: renderCampaigns, rewards: renderRewards, products: renderProducts, reports: renderReports };
function renderPanel(panel = 'overview') {
  if (!renderers[panel]) panel = 'overview';
  data.currentPanel = panel;
  $$('.crm-nav').forEach((button) => button.classList.toggle('active', button.dataset.panel === panel));
  $$('[data-panel-content]').forEach((section) => { section.classList.toggle('active', section.dataset.panelContent === panel); if (section.dataset.panelContent === panel) section.innerHTML = `<div class="crm-dynamic-panel">${renderers[panel]()}</div>`; });
  $('#crm-section-name').textContent = navName(panel);
  $('.crm-sidebar').classList.remove('menu-open');
  $('.crm-main').scrollTop = 0;
}
function openCrmPanel(panel = 'overview') { renderPanel(panel); }

function showForm(title, description, fields, onSave, submitLabel = 'Guardar') {
  const dialog = document.createElement('dialog');
  dialog.className = 'crm-dialog';
  dialog.innerHTML = `<form method="dialog" class="crm-dialog-card"><button class="crm-dialog-close" type="button" aria-label="Cerrar">×</button><p class="eyebrow"><span></span> CAFÉ CHIHUAHUA · DEMO</p><h2>${title}</h2><p class="crm-dialog-description">${description}</p><div class="crm-form-fields">${fields}</div><div class="crm-dialog-actions"><button type="button" class="crm-secondary-action" data-close-dialog>Cancelar</button><button class="crm-primary-action" type="submit">${submitLabel}</button></div></form></dialog>`;
  document.body.append(dialog);
  dialog.showModal();
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  $('[data-close-dialog], .crm-dialog-close', dialog).addEventListener('click', () => dialog.close());
  $('form', dialog).addEventListener('submit', (event) => { event.preventDefault(); if (onSave(new FormData(event.currentTarget)) !== false) { dialog.close(); renderPanel(data.currentPanel); } });
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  return dialog;
}

function customerOptions(selected = '') { return `<option value="">Cliente sin registro</option>${data.customers.map((c) => `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${escapeHtml(c.name)} · ${escapeHtml(c.email)}</option>`).join('')}`; }
function productOptions(selected = '') { return data.products.filter((p) => p.active).map((p) => `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${escapeHtml(p.name)} · ${money(p.price)}</option>`).join(''); }
function openSaleForm() {
  const customers = data.customers.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  showForm('Registrar venta', 'Agrega un ticket. Los productos participantes suman sellos al cliente.', `<label>Cliente<select name="customerId" required>${customers}</select></label><label>Producto<select name="productId" required>${productOptions()}</select></label><label>Cantidad<input name="quantity" type="number" min="1" max="30" value="1" required></label><label>Cupón (opcional)<input name="coupon" placeholder="Código de campaña"></label><label class="crm-check-field"><input type="checkbox" name="redeemReward"> Canjear recompensa en este ticket (si tiene sellos suficientes)</label>`, (form) => {
    const customer = customerById(form.get('customerId'));
    const product = productById(form.get('productId'));
    const quantity = Math.max(1, Number(form.get('quantity')) || 1);
    if (!product || !product.active || !customer) { showToast('Elige un cliente y un producto activo.'); return false; }
    const code = String(form.get('coupon') || '').trim().toUpperCase();
    const campaign = code ? data.campaigns.find((c) => c.code.toUpperCase() === code) : null;
    if (code && (!campaign || campaign.status !== 'Activa' || campaign.redemptions >= campaign.usageLimit || (campaign.ends && new Date(campaign.ends) < new Date()) || (campaign.starts && new Date(campaign.starts) > new Date()))) { showToast('Ese cupón no está vigente, venció o llegó a su límite.'); return false; }
    if (campaign?.conditions.toLowerCase().includes('una vez por cliente') && (campaign.usedCustomerIds || []).includes(customer.id)) { showToast('Este cupón ya se canjeó con este cliente.'); return false; }
    const stamps = product.stamps && data.settings.allowedProductIds.includes(product.id) ? quantity : 0;
    const sale = { id: `s${Date.now()}`, customerId: customer.id, productId: product.id, productName: product.name, quantity, amount: product.price * quantity, date: new Date().toISOString(), coupon: campaign?.code || '', stamps, rewardRedeemed: false };
    const stampsAfterSale = customer.stamps + stamps;
    if (form.get('redeemReward') && stampsAfterSale < data.settings.threshold) { showToast(`Aún requiere ${data.settings.threshold - stampsAfterSale} sello(s) para canjear.`); return false; }
    customer.visits += 1;
    customer.favorite = product.name;
    customer.stamps = stampsAfterSale;
    if (form.get('redeemReward')) {
      customer.stamps -= data.settings.threshold;
      sale.rewardRedeemed = true;
    }
    if (campaign) { campaign.redemptions += 1; campaign.sales += sale.amount; campaign.usedCustomerIds = [...new Set([...(campaign.usedCustomerIds || []), customer.id])]; }
    data.sales.unshift(sale); saveData(); showToast(`Venta guardada · ${money(sale.amount)} · ${stamps} sello(s).`); return true;
  }, 'Guardar venta');
}
function openCustomerForm(customer = null) {
  showForm(customer ? 'Editar cliente' : 'Nuevo cliente', 'Registra datos y preferencias. Solicita permiso antes de enviar promociones.', `<label>Nombre<input name="name" required value="${escapeHtml(customer?.name || '')}"></label><label>Correo<input name="email" type="email" value="${escapeHtml(customer?.email || '')}" placeholder="cliente@correo.com"></label><label>WhatsApp<input name="phone" type="tel" value="${escapeHtml(customer?.phone || '')}" placeholder="614 000 0000"></label><label>Fecha de cumpleaños<input name="birthday" type="date" value="${escapeHtml(customer?.birthday || '')}"></label><label>Producto favorito<select name="favorite"><option value="">Sin preferencia</option>${data.products.map((p) => `<option ${customer?.favorite === p.name ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('')}</select></label><label class="crm-check-field"><input type="checkbox" name="consent" ${customer?.consent ? 'checked' : ''}> Aceptó recibir promociones</label>`, (form) => {
    const name = String(form.get('name')).trim(); const email = String(form.get('email') || '').trim();
    if (email && data.customers.some((c) => c.email.toLowerCase() === email.toLowerCase() && c.id !== customer?.id)) { showToast('Ya existe un cliente con ese correo.'); return false; }
    if (customer) Object.assign(customer, { name, email, phone: form.get('phone'), birthday: form.get('birthday'), favorite: form.get('favorite'), consent: form.get('consent') === 'on' });
    else data.customers.unshift({ id: `c${Date.now()}`, name, email, phone: form.get('phone'), birthday: form.get('birthday'), favorite: form.get('favorite'), consent: form.get('consent') === 'on', joined: new Date().toISOString(), stamps: 0, visits: 0 });
    saveData(); showToast(customer ? 'Cliente actualizado.' : 'Cliente agregado.'); return true;
  });
}
function openCampaignForm(campaign = null) {
  const c = campaign || {};
  const dateValue = (value, offset) => value ? new Date(value).toISOString().slice(0,10) : new Date(Date.now() + offset*86400000).toISOString().slice(0,10);
  showForm(campaign ? 'Editar campaña' : 'Crear campaña', 'Define vigencia y condiciones; la comunicación se queda en modo simulación.', `<label>Nombre<input name="name" required value="${escapeHtml(c.name || '')}" placeholder="Ej. Bebida de otoño"></label><label>Descripción<textarea name="description" required placeholder="¿Qué ofrece esta promoción?">${escapeHtml(c.description || '')}</textarea></label><label>Segmento<select name="segment">${['Todos con permiso', 'Clientes activos', 'Sin visita reciente', 'Cerca de recompensa', 'Cumpleaños del mes', 'Amantes del filtrado'].map((s) => `<option ${c.segment === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label>Beneficio<input name="discount" required value="${escapeHtml(c.discount || '')}" placeholder="Ej. 2x1, bebida gratis, 15%"></label><label>Código de cupón<input name="code" required pattern="[A-Za-z0-9_-]{3,20}" value="${escapeHtml(c.code || '')}" placeholder="OTOÑO26"></label><div class="crm-form-row"><label>Inicia<input name="starts" type="date" required value="${dateValue(c.starts,0)}"></label><label>Vence<input name="ends" type="date" required value="${dateValue(c.ends,14)}"></label></div><div class="crm-form-row"><label>Límite de canjes<input name="usageLimit" type="number" min="1" value="${c.usageLimit || 50}" required></label><label>Estado<select name="status">${['Borrador','Programada','Activa','Finalizada'].map((s) => `<option ${c.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div><label>Condiciones<input name="conditions" value="${escapeHtml(c.conditions || '')}" placeholder="Una vez por cliente; en bebidas participantes"></label>`, (form) => {
    const code = String(form.get('code')).trim().toUpperCase();
    if (data.campaigns.some((item) => item.code.toUpperCase() === code && item.id !== campaign?.id)) { showToast('Ese código ya está asignado a otra campaña.'); return false; }
    const payload = { name: String(form.get('name')).trim(), description: String(form.get('description')).trim(), segment: form.get('segment'), discount: form.get('discount'), code, starts: new Date(`${form.get('starts')}T12:00:00`).toISOString(), ends: new Date(`${form.get('ends')}T23:59:59`).toISOString(), usageLimit: Number(form.get('usageLimit')), status: form.get('status'), conditions: form.get('conditions'), sends: c.sends || 0, redemptions: c.redemptions || 0, sales: c.sales || 0 };
    if (new Date(payload.ends) < new Date(payload.starts)) { showToast('La fecha de vencimiento debe ser igual o posterior al inicio.'); return false; }
    if (campaign) Object.assign(campaign, payload); else data.campaigns.unshift({ id: `camp${Date.now()}`, ...payload });
    saveData(); showToast(campaign ? 'Campaña actualizada.' : 'Campaña creada.'); return true;
  });
}
function openProductForm(product = null) {
  const p = product || {};
  showForm(product ? 'Editar producto' : 'Agregar producto', 'Los cambios afectan las próximas ventas capturadas.', `<label>Nombre<input name="name" required value="${escapeHtml(p.name || '')}"></label><div class="crm-form-row"><label>Categoría<select name="category">${['Caliente','Fría','Temporada'].map((s) => `<option ${p.category === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label>Precio (MXN)<input name="price" type="number" min="1" step="1" required value="${p.price || ''}"></label></div><label>Descripción<input name="description" value="${escapeHtml(p.description || '')}"></label><div class="crm-form-row"><label>Ícono<input name="icon" maxlength="4" value="${escapeHtml(p.icon || '☕')}"></label><label class="crm-check-field"><input type="checkbox" name="stamps" ${p.stamps !== false ? 'checked' : ''}> Acumula sellos</label></div>`, (form) => {
    const payload = { name: String(form.get('name')).trim(), category: form.get('category'), price: Number(form.get('price')), description: form.get('description'), icon: form.get('icon') || '☕', stamps: form.get('stamps') === 'on', active: p.active !== false };
    if (product) Object.assign(product, payload); else { const added = { id: `p${Date.now()}`, ...payload }; data.products.push(added); if (payload.stamps) data.settings.allowedProductIds.push(added.id); }
    if (product && !payload.stamps) data.settings.allowedProductIds = data.settings.allowedProductIds.filter((id) => id !== product.id);
    if (product && payload.stamps && !data.settings.allowedProductIds.includes(product.id)) data.settings.allowedProductIds.push(product.id);
    saveData(); showToast(product ? 'Producto actualizado.' : 'Producto agregado.'); return true;
  });
}
function openRewardsForm() {
  showForm('Reglas de lealtad', 'Elige productos elegibles y define la recompensa de la tarjeta.', `<label>Compras para desbloquear<input name="threshold" type="number" min="2" max="50" required value="${data.settings.threshold}"></label><label>Recompensa<input name="reward" required value="${escapeHtml(data.settings.reward)}"></label><fieldset class="crm-product-checks"><legend>Productos que acumulan sellos</legend>${data.products.filter((p) => p.active).map((p) => `<label><input type="checkbox" name="eligible" value="${p.id}" ${data.settings.allowedProductIds.includes(p.id) ? 'checked' : ''}> ${escapeHtml(p.name)}</label>`).join('')}</fieldset>`, (form) => {
    const threshold = Number(form.get('threshold')); const allowed = form.getAll('eligible').map(String);
    if (!allowed.length) { showToast('Selecciona al menos un producto participante.'); return false; }
    if (!threshold || threshold < 2 || threshold > 50) { showToast('El programa debe tener entre 2 y 50 sellos.'); return false; }
    data.settings = { threshold, reward: String(form.get('reward')).trim(), allowedProductIds: allowed }; data.customers.forEach((c) => { c.stamps = Math.min(c.stamps, threshold); }); saveData(); showToast('Reglas del programa actualizadas.'); return true;
  });
}
function simulateCampaign(id) {
  const campaign = data.campaigns.find((item) => item.id === id);
  if (!campaign) return;
  if (campaign.status === 'Borrador' || campaign.status === 'Finalizada') { showToast('Activa o programa la campaña antes de simular un envío.'); return; }
  const audience = campaign.segment === 'Cerca de recompensa' ? data.customers.filter((c) => c.stamps >= data.settings.threshold - 2) : campaign.segment === 'Sin visita reciente' ? data.customers.filter((c) => { const last = data.sales.filter((s) => s.customerId === c.id).sort((a,b) => new Date(b.date)-new Date(a.date))[0]; return !last || Date.now() - new Date(last.date) > 14*86400000; }) : campaign.segment === 'Cumpleaños del mes' ? data.customers.filter((c) => c.birthday && new Date(c.birthday).getMonth() === new Date().getMonth()) : campaign.segment === 'Amantes del filtrado' ? data.customers.filter((c) => c.favorite.toLowerCase().includes('v60')) : data.customers;
  const eligible = audience.filter((c) => c.consent).length;
  campaign.sends += eligible; saveData(); renderPanel('campaigns'); showToast(`${eligible} envíos de demostración preparados. No se mandó ningún mensaje.`);
}
function downloadReport() {
  const rows = [['fecha','cliente','producto','cantidad','importe_mxn','sellos','cupon','recompensa_can-jeada'], ...data.sales.map((s) => [new Date(s.date).toISOString(), customerById(s.customerId)?.name || 'Cliente sin registro', s.productName, s.quantity, s.amount, s.stamps, s.coupon, s.rewardRedeemed ? 'sí' : 'no'])];
  const csv = '\uFEFF' + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'cafe-chihuahua-reporte-demo.csv'; link.click(); URL.revokeObjectURL(url); showToast('Reporte CSV descargado.');
}
function resetDemo() {
  if (!window.confirm('¿Reiniciar todos los datos locales de demostración? Esta acción no se puede deshacer.')) return;
  data = seedData(); saveData(); renderPanel('overview'); showToast('Datos de demostración reiniciados.');
}

function navigate(panel) { if (panel && renderers[panel]) renderPanel(panel); }

$$('.js-open-admin').forEach((button) => button.addEventListener('click', () => adminModal.showModal()));
$('.js-join').addEventListener('click', () => joinModal.showModal());
$$('.modal-close, .js-close-modal').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach((modal) => modal.addEventListener('click', (event) => { const rect = modal.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close(); }));

$('.join-form').addEventListener('submit', (event) => {
  event.preventDefault(); const form = new FormData(event.currentTarget); const email = String(form.get('Correo') || $('input[type="email"]', event.currentTarget).value).trim();
  const name = $('input:not([type="email"]):not([type="checkbox"])', event.currentTarget).value.trim();
  if (!data.customers.some((c) => c.email.toLowerCase() === email.toLowerCase())) data.customers.unshift({ id: `c${Date.now()}`, name, email, phone: '', birthday: '', favorite: '', joined: new Date().toISOString(), stamps: 0, visits: 0, consent: true });
  saveData(); joinModal.close(); showToast('¡Listo! Tu registro de demostración quedó guardado en este navegador.'); event.currentTarget.reset();
});
$('.newsletter').addEventListener('submit', (event) => { event.preventDefault(); showToast('Gracias. Esta suscripción solo se muestra como demostración.'); event.currentTarget.reset(); });
$$('.js-product').forEach((button) => button.addEventListener('click', () => showToast('Pregunta por esta bebida en barra.')));
$('.js-play-story').addEventListener('click', () => $('#cafe').scrollIntoView({ behavior: 'smooth' }));

let stamps = 7;
let selectedDrink = 'Latte de la casa';
const stampCount = $('#stamp-count'); const rewardTitle = $('#reward-title'); const rewardIcon = $('#reward-icon'); const stampItems = $$('.stamp-track i'); const feedback = $('.simulator-feedback');
function updateLoyaltySimulator() {
  const threshold = 10; const remaining = Math.max(threshold - stamps, 0);
  stampCount.textContent = Math.min(stamps, threshold); stampItems.forEach((stamp, index) => stamp.classList.toggle('is-earned', index < Math.min(stamps, threshold - 1)));
  if (stamps >= threshold) { rewardTitle.textContent = '¡Bebida de cortesía!'; rewardIcon.textContent = '☕'; rewardIcon.classList.add('is-redeemable'); feedback.textContent = `Tu ${selectedDrink} desbloqueó la recompensa. La siguiente bebida participante es cortesía de la casa.`; }
  else { rewardTitle.textContent = `Faltan ${remaining} sello${remaining === 1 ? '' : 's'}`; rewardIcon.textContent = String(remaining).padStart(2, '0'); rewardIcon.classList.remove('is-redeemable'); feedback.textContent = `${selectedDrink} seleccionado · ${remaining} sello${remaining === 1 ? '' : 's'} para una bebida de cortesía.`; }
}
$$('.drink-choice').forEach((choice) => choice.addEventListener('click', () => { $$('.drink-choice').forEach((item) => item.classList.remove('selected')); choice.classList.add('selected'); selectedDrink = choice.dataset.drink; updateLoyaltySimulator(); }));
$('.js-add-stamp').addEventListener('click', () => { if (stamps < 10) stamps += 1; updateLoyaltySimulator(); });
$('.reset-stamps').addEventListener('click', () => { stamps = 7; updateLoyaltySimulator(); });

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }), { threshold: 0.14 });
$$('.reveal').forEach((element) => observer.observe(element));
$('#year').textContent = new Date().getFullYear();
const toggle = $('.menu-toggle'); const nav = $('.site-header nav');
toggle.addEventListener('click', () => { const expanded = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', String(!expanded)); nav.classList.toggle('open', !expanded); });

crmLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = $('input[type="email"]', crmLoginForm).value.trim(); const password = $('input[type="password"]', crmLoginForm).value;
  if (!email || !password) { showToast('Escribe cualquier correo y contraseña para abrir la demo.'); return; }
  sessionName = email.includes('@') ? email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Equipo de barra';
  $('.crm-user b').textContent = sessionName; $('.crm-user small').textContent = 'Modo demostración';
  crmLogin.hidden = true; crmWorkspace.hidden = false; renderPanel('overview'); showToast('Demo abierta. Cualquier correo y contraseña no vacíos funcionan.');
});
$$('.crm-nav').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.panel)));
$('.crm-logout').addEventListener('click', () => { crmWorkspace.hidden = true; crmLogin.hidden = false; crmLoginForm.reset(); showToast('Sesión de demostración cerrada.'); });
$('.crm-mobile-menu').addEventListener('click', () => crmSidebar.classList.toggle('menu-open'));
$('.crm-wallet-card').addEventListener('click', () => showToast('Google Wallet está en la siguiente fase; aún no se emiten tarjetas.'));
$('.crm-login-form .link-button').addEventListener('click', () => showToast('En esta demo no hay recuperación de contraseña.'));

crmWorkspace.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action], [data-panel]'); if (!button) return;
  if (button.dataset.panel) { navigate(button.dataset.panel); return; }
  const action = button.dataset.action; const id = button.dataset.id;
  if (action === 'sale') openSaleForm();
  if (action === 'customer') openCustomerForm();
  if (action === 'campaign') openCampaignForm();
  if (action === 'edit-campaign') openCampaignForm(data.campaigns.find((c) => c.id === id));
  if (action === 'delete-campaign') { if (window.confirm('¿Eliminar esta campaña de la demo?')) { data.campaigns = data.campaigns.filter((c) => c.id !== id); saveData(); renderPanel('campaigns'); } }
  if (action === 'send-campaign') simulateCampaign(id);
  if (action === 'rewards') openRewardsForm();
  if (action === 'product') openProductForm();
  if (action === 'edit-product') openProductForm(productById(id));
  if (action === 'toggle-product') { const product = productById(id); if (product) { product.active = !product.active; if (!product.active) data.settings.allowedProductIds = data.settings.allowedProductIds.filter((item) => item !== product.id); saveData(); renderPanel('products'); } }
  if (action === 'filter-products') { productFilter = button.dataset.filter; renderPanel('products'); }
  if (action === 'export') downloadReport();
  if (action === 'reset-demo') resetDemo();
});
crmWorkspace.addEventListener('input', (event) => { if (event.target.matches('[data-search]')) { const cursor = event.target.selectionStart; searchTerm = event.target.value; renderPanel('customers'); const input = $('[data-search]'); input.focus(); input.setSelectionRange(cursor, cursor); } });
crmWorkspace.addEventListener('click', (event) => { const row = event.target.closest('.crm-customer-row'); if (row) { const name = $('b', row)?.childNodes[0]?.textContent?.trim(); const customer = data.customers.find((item) => item.name === name); if (customer) openCustomerForm(customer); } });

// Exponer herramientas de reinicio sin confundirlas con operaciones reales.
$('.crm-sidebar-bottom').insertAdjacentHTML('afterbegin', '<button type="button" class="crm-reset-demo" data-action="reset-demo">Reiniciar datos demo</button>');
