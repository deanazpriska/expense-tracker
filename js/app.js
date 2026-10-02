/* =============================================
   EXPENSE & BUDGET VISUALIZER
   Vanilla JS · LocalStorage · Chart.js
   ============================================= */

'use strict';

/* ── Constants ───────────────────────────────── */
const STORAGE_KEY      = 'expenseTrackerTx';
const CUSTOM_CATS_KEY  = 'expenseTrackerCats';

/** Default palette — extended for custom categories */
const CATEGORY_COLORS = {
  Food:      '#ff6584',
  Transport: '#43e97b',
  Fun:       '#6c63ff',
};
const EXTRA_COLORS = [
  '#ffd166','#06d6a0','#ef476f','#118ab2',
  '#f4a261','#e9c46a','#a8dadc','#457b9d',
];

/* ── State ───────────────────────────────────── */
let transactions  = [];   // { id, name, amount, category, date }
let customCats    = [];   // ['Health', 'Shopping', …]
let activeFilter  = 'all';
let spendingChart = null;

/* ── DOM refs ────────────────────────────────── */
const form            = document.getElementById('transactionForm');
const itemNameEl      = document.getElementById('itemName');
const amountEl        = document.getElementById('amount');
const categoryEl      = document.getElementById('category');
const txDateEl        = document.getElementById('txDate');
const customCatGroup  = document.getElementById('customCatGroup');
const customCatInput  = document.getElementById('customCatInput');
const saveCatBtn      = document.getElementById('saveCatBtn');
const customOptGroup  = document.getElementById('customOptGroup');
const totalBalanceEl  = document.getElementById('totalBalance');
const txCountEl       = document.getElementById('txCount');
const catCountEl      = document.getElementById('catCount');
const txListEl        = document.getElementById('transactionList');
const emptyStateEl    = document.getElementById('emptyState');
const filterChipsEl   = document.getElementById('filterChips');
const sortSelectEl    = document.getElementById('sortSelect');
const chartTypeEl     = document.getElementById('chartType');
const chartEmptyEl    = document.getElementById('chartEmpty');
const monthPickerEl   = document.getElementById('monthPicker');
const monthlySummaryEl= document.getElementById('monthlySummary');
const toastEl         = document.getElementById('toast');

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
function init() {
  loadFromStorage();
  setDefaultDate();
  renderCustomCatOptions();
  renderAll();
  bindEvents();
}

function setDefaultDate() {
  txDateEl.value = new Date().toISOString().split('T')[0];
}

function loadFromStorage() {
  try {
    transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    customCats   = JSON.parse(localStorage.getItem(CUSTOM_CATS_KEY)) || [];
  } catch {
    transactions = [];
    customCats   = [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  localStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(customCats));
}

/* ══════════════════════════════════════════════
   EVENTS
   ══════════════════════════════════════════════ */
function bindEvents() {
  form.addEventListener('submit', handleAddTransaction);

  categoryEl.addEventListener('change', () => {
    const isNew = categoryEl.value === '__new__';
    customCatGroup.style.display = isNew ? 'flex' : 'none';
    if (isNew) customCatInput.focus();
  });

  saveCatBtn.addEventListener('click', handleSaveCustomCat);
  customCatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleSaveCustomCat(); }
  });

  sortSelectEl.addEventListener('change', renderTransactionList);
  chartTypeEl.addEventListener('change', () => renderChart());
  monthPickerEl.addEventListener('change', renderMonthlySummary);

  // Default month picker to current month
  const now = new Date();
  monthPickerEl.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
}

/* ══════════════════════════════════════════════
   ADD TRANSACTION
   ══════════════════════════════════════════════ */
function handleAddTransaction(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const tx = {
    id:       crypto.randomUUID(),
    name:     sanitize(itemNameEl.value.trim()),
    amount:   parseFloat(parseFloat(amountEl.value).toFixed(2)),
    category: categoryEl.value,
    date:     txDateEl.value,
  };

  transactions.unshift(tx);
  saveToStorage();
  renderAll();
  form.reset();
  setDefaultDate();
  customCatGroup.style.display = 'none';
  showToast('Transaction added!', 'success');
}

/* ── Validation ──────────────────────────────── */
function validateForm() {
  let valid = true;

  clearErrors();

  if (!itemNameEl.value.trim()) {
    showError('nameError', 'Item name is required');
    valid = false;
  }

  const amt = parseFloat(amountEl.value);
  if (!amountEl.value || isNaN(amt) || amt <= 0) {
    showError('amountError', 'Enter a valid amount > 0');
    valid = false;
  }

  if (!categoryEl.value || categoryEl.value === '__new__') {
    showError('categoryError', 'Please select a category');
    valid = false;
  }

  if (!txDateEl.value) {
    showError('dateError', 'Date is required');
    valid = false;
  }

  return valid;
}

function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearErrors() {
  ['nameError','amountError','categoryError','dateError']
    .forEach(id => document.getElementById(id).textContent = '');
}

/* ══════════════════════════════════════════════
   DELETE TRANSACTION
   ══════════════════════════════════════════════ */
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage();
  renderAll();
  showToast('Transaction removed', 'error');
}

/* ══════════════════════════════════════════════
   CUSTOM CATEGORIES
   ══════════════════════════════════════════════ */
function handleSaveCustomCat() {
  const name = customCatInput.value.trim();
  if (!name) { showToast('Enter a category name', 'error'); return; }
  if (getAllCategories().map(c => c.toLowerCase()).includes(name.toLowerCase())) {
    showToast('Category already exists', 'error'); return;
  }

  customCats.push(sanitize(name));
  saveToStorage();
  renderCustomCatOptions();

  // Select the newly added cat
  categoryEl.value = sanitize(name);
  customCatGroup.style.display = 'none';
  customCatInput.value = '';
  showToast(`Category "${name}" added!`, 'success');
}

function renderCustomCatOptions() {
  customOptGroup.innerHTML = '';
  customCats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = `⭐ ${cat}`;
    customOptGroup.appendChild(opt);
  });
  // Hide optgroup label if empty
  customOptGroup.style.display = customCats.length ? '' : 'none';
}

function getAllCategories() {
  return ['Food', 'Transport', 'Fun', ...customCats];
}

function getCategoryColor(cat) {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  const idx = customCats.indexOf(cat);
  return EXTRA_COLORS[idx % EXTRA_COLORS.length];
}

/* ══════════════════════════════════════════════
   RENDER — orchestrator
   ══════════════════════════════════════════════ */
function renderAll() {
  renderBalance();
  renderFilterChips();
  renderTransactionList();
  renderChart();
  renderMonthlySummary();
}

/* ── Balance ─────────────────────────────────── */
function renderBalance() {
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  totalBalanceEl.textContent = formatCurrency(total);

  const cats = new Set(transactions.map(t => t.category));
  txCountEl.textContent  = `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`;
  catCountEl.textContent = `${cats.size} categor${cats.size !== 1 ? 'ies' : 'y'}`;
}

/* ── Filter chips ────────────────────────────── */
function renderFilterChips() {
  const usedCats = [...new Set(transactions.map(t => t.category))];

  // Keep 'All' chip, rebuild the rest
  filterChipsEl.innerHTML = `<button class="chip${activeFilter === 'all' ? ' active' : ''}" data-filter="all">All</button>`;

  usedCats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `chip${activeFilter === cat ? ' active' : ''}`;
    btn.dataset.filter = cat;
    btn.textContent = cat;
    filterChipsEl.appendChild(btn);
  });

  filterChipsEl.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      renderFilterChips();
      renderTransactionList();
    });
  });
}

/* ── Transaction list ────────────────────────── */
function renderTransactionList() {
  let filtered = activeFilter === 'all'
    ? [...transactions]
    : transactions.filter(t => t.category === activeFilter);

  const sort = sortSelectEl.value;
  filtered.sort((a, b) => {
    if (sort === 'newest')   return new Date(b.date) - new Date(a.date);
    if (sort === 'oldest')   return new Date(a.date) - new Date(b.date);
    if (sort === 'highest')  return b.amount - a.amount;
    if (sort === 'lowest')   return a.amount - b.amount;
    if (sort === 'category') return a.category.localeCompare(b.category);
    return 0;
  });

  if (filtered.length === 0) {
    txListEl.innerHTML = '';
    emptyStateEl.style.display = 'block';
    txListEl.appendChild(emptyStateEl);
    return;
  }

  emptyStateEl.style.display = 'none';
  txListEl.innerHTML = '';

  filtered.forEach(tx => {
    const li = document.createElement('li');
    li.className = 'tx-item';
    li.dataset.id = tx.id;

    const color = getCategoryColor(tx.category);

    li.innerHTML = `
      <span class="tx-dot" style="background:${color};"></span>
      <div class="tx-info">
        <div class="tx-name">${tx.name}</div>
        <div class="tx-meta">${tx.category} · ${formatDate(tx.date)}</div>
      </div>
      <span class="tx-amount">${formatCurrency(tx.amount)}</span>
      <button class="btn btn-danger" aria-label="Delete ${tx.name}" data-id="${tx.id}">✕</button>
    `;

    li.querySelector('.btn-danger').addEventListener('click', () => deleteTransaction(tx.id));
    txListEl.appendChild(li);
  });
}

/* ── Chart ───────────────────────────────────── */
function renderChart() {
  const totals = {};
  transactions.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colors = labels.map(getCategoryColor);

  const hasData = labels.length > 0;
  chartEmptyEl.style.display = hasData ? 'none' : 'flex';

  const type = chartTypeEl.value; // pie | doughnut | bar
  const ctx  = document.getElementById('spendingChart').getContext('2d');

  if (spendingChart) spendingChart.destroy();

  if (!hasData) return;

  const isBar = type === 'bar';

  spendingChart = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: isBar ? colors : '#1a1d27',
        borderWidth: isBar ? 0 : 2,
        borderRadius: isBar ? 6 : 0,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: isBar ? 'top' : 'bottom',
          labels: {
            color: '#e8eaf6',
            font: { size: 12 },
            padding: 16,
            boxWidth: 12,
            boxHeight: 12,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${formatCurrency(ctx.parsed.r ?? ctx.parsed.y ?? ctx.parsed)}`,
          },
        },
      },
      scales: isBar ? {
        x: { ticks: { color: '#8892b0' }, grid: { color: '#2e3248' } },
        y: {
          ticks: {
            color: '#8892b0',
            callback: v => '$' + v.toFixed(0),
          },
          grid: { color: '#2e3248' },
        },
      } : {},
    },
  });
}

/* ── Monthly summary ─────────────────────────── */
function renderMonthlySummary() {
  const ym = monthPickerEl.value; // e.g. '2025-06'
  if (!ym) return;

  const [year, month] = ym.split('-').map(Number);
  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  if (filtered.length === 0) {
    monthlySummaryEl.innerHTML = '<p class="empty-state">No data for this month</p>';
    return;
  }

  const totals = {};
  filtered.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const maxVal = Math.max(...Object.values(totals));
  monthlySummaryEl.innerHTML = '';

  Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, total]) => {
      const pct = Math.round((total / maxVal) * 100);
      const color = getCategoryColor(cat);

      const row = document.createElement('div');
      row.className = 'monthly-row';
      row.innerHTML = `
        <div class="monthly-row-label">
          <span>${cat}</span>
          <span>${formatCurrency(total)}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${pct}%; background:${color};"></div>
        </div>
      `;
      monthlySummaryEl.appendChild(row);
    });
}

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */
function formatCurrency(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(iso) {
  // 'YYYY-MM-DD' → 'Jun 5, 2025'
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Basic XSS sanitiser — strip HTML tags from user input */
function sanitize(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

let toastTimer;
function showToast(msg, type = '') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast${type ? ' ' + type : ''}`;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

/* ── Boot ────────────────────────────────────── */
init();
