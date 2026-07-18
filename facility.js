// ============================================================
// MERIDIAN ESTATES — shared front-end behaviour
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Sidebar toggle (mobile, dashboard pages) ---------- */
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('show');
    });
    document.addEventListener('click', function (e) {
      if (window.innerWidth < 992 && sidebar.classList.contains('show') &&
          !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('show');
      }
    });
  }

  /* ---------- Property filter (index.html) ---------- */
  var filterType = document.getElementById('filterType');
  var filterLocation = document.getElementById('filterLocation');
  var filterPrice = document.getElementById('filterPrice');
  var propertyGrid = document.getElementById('propertyGrid');
  var resultsCount = document.getElementById('resultsCount');
  var emptyState = document.getElementById('emptyState');

  function applyFilters() {
    if (!propertyGrid) return;
    var type = filterType ? filterType.value : 'all';
    var location = filterLocation ? filterLocation.value : 'all';
    var price = filterPrice ? filterPrice.value : 'all';
    var cards = propertyGrid.querySelectorAll('.property-item');
    var visible = 0;

    cards.forEach(function (card) {
      var matchesType = type === 'all' || card.dataset.type === type;
      var matchesLocation = location === 'all' || card.dataset.location === location;
      var matchesPrice = price === 'all' || card.dataset.priceband === price;
      var show = matchesType && matchesLocation && matchesPrice;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (resultsCount) resultsCount.textContent = visible;
    if (emptyState) emptyState.classList.toggle('d-none', visible !== 0);
  }

  [filterType, filterLocation, filterPrice].forEach(function (el) {
    if (el) el.addEventListener('change', applyFilters);
  });

  /* ---------- Property detail modal population ---------- */
  var detailModalEl = document.getElementById('propertyDetailModal');
  if (detailModalEl) {
    detailModalEl.addEventListener('show.bs.modal', function (event) {
      var trigger = event.relatedTarget;
      if (!trigger) return;
      var data = trigger.dataset;
      detailModalEl.querySelector('.pd-title').textContent = data.name || '';
      detailModalEl.querySelector('.pd-plot').textContent = data.plot || '';
      detailModalEl.querySelector('.pd-location').textContent = data.locationLabel || '';
      detailModalEl.querySelector('.pd-price').textContent = data.price || '';
      detailModalEl.querySelector('.pd-beds').textContent = data.beds || '';
      detailModalEl.querySelector('.pd-baths').textContent = data.baths || '';
      detailModalEl.querySelector('.pd-area').textContent = data.area || '';
      detailModalEl.querySelector('.pd-desc').textContent = data.desc || '';
      var thumb = detailModalEl.querySelector('.pd-thumb');
      if (thumb) thumb.className = 'pd-thumb thumb ' + (data.thumbclass || 'thumb-1');
      var status = detailModalEl.querySelector('.pd-status');
      if (status) {
        status.textContent = data.status || '';
        status.className = 'status-pill pd-status ' + (data.statusclass || 'status-available');
      }
    });
  }

  /* ---------- Inquiry form validation (Bootstrap pattern) ---------- */
  var forms = document.querySelectorAll('.needs-validation');
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (form.checkValidity()) {
        var successBox = form.querySelector('.form-success');
        form.classList.add('d-none');
        if (successBox) successBox.classList.remove('d-none');
      }
      form.classList.add('was-validated');
    }, false);
  });

  /* ---------- Dashboard: table search filters ---------- */
  document.querySelectorAll('[data-table-search]').forEach(function (input) {
    input.addEventListener('input', function () {
      var targetSelector = input.getAttribute('data-table-search');
      var table = document.querySelector(targetSelector);
      if (!table) return;
      var query = input.value.trim().toLowerCase();
      table.querySelectorAll('tbody tr').forEach(function (row) {
        row.style.display = row.textContent.toLowerCase().indexOf(query) !== -1 ? '' : 'none';
      });
    });
  });

  /* ---------- Dashboard: status filter chips ---------- */
  document.querySelectorAll('[data-status-filter]').forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      var group = chip.closest('[data-chip-group]');
      var tableSel = chip.getAttribute('data-status-filter-table');
      var table = document.querySelector(tableSel);
      var status = chip.getAttribute('data-status-filter');
      if (group) group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      if (!table) return;
      table.querySelectorAll('tbody tr').forEach(function (row) {
        var show = status === 'all' || row.getAttribute('data-status') === status;
        row.style.display = show ? '' : 'none';
      });
    });
  });

  /* ---------- Dashboard: maintenance ticket quick-resolve ---------- */
  document.querySelectorAll('.js-resolve-ticket').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('tr');
      if (!row) return;
      var badge = row.querySelector('.badge-status');
      if (badge) {
        badge.textContent = 'Resolved';
        badge.className = 'badge-status badge-resolved';
      }
      row.setAttribute('data-status', 'resolved');
      btn.disabled = true;
      btn.textContent = 'Resolved';
    });
  });

  /* ---------- Dashboard: add-property form -> prepend to table ---------- */
  var addPropertyForm = document.getElementById('addPropertyForm');
  if (addPropertyForm) {
    addPropertyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('apName').value || 'Untitled property';
      var location = document.getElementById('apLocation').value || '—';
      var rent = document.getElementById('apRent').value || '0';
      var type = document.getElementById('apType').value || 'Residential';
      var tbody = document.querySelector('#propertiesTable tbody');
      if (tbody) {
        var tr = document.createElement('tr');
        tr.setAttribute('data-status', 'vacant');
        tr.innerHTML =
          '<td class="mono text-ink-soft">NEW</td>' +
          '<td>' + name + '</td>' +
          '<td>' + type + '</td>' +
          '<td>' + location + '</td>' +
          '<td class="mono">$' + Number(rent).toLocaleString() + '/mo</td>' +
          '<td><span class="badge-status badge-vacant">Vacant</span></td>' +
          '<td class="text-end"><button class="btn btn-sm btn-outline-secondary" disabled><i class="bi bi-pencil"></i></button></td>';
        tbody.prepend(tr);
      }
      addPropertyForm.reset();
      var modalEl = document.getElementById('addPropertyModal');
      var modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    });
  }

  /* ---------- Charts (dashboard overview) ---------- */
  if (window.Chart && document.getElementById('revenueChart')) {
    var ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Revenue',
          data: [128000, 133500, 131200, 139800, 142600, 148300],
          borderColor: '#B98B4E',
          backgroundColor: 'rgba(185,139,78,0.12)',
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: '#B98B4E'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#E7E9E4' }, ticks: { callback: function (v) { return '$' + (v / 1000) + 'k'; } } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  if (window.Chart && document.getElementById('occupancyChart')) {
    var ctx2 = document.getElementById('occupancyChart').getContext('2d');
    new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Occupied', 'Vacant', 'Under maintenance'],
        datasets: [{
          data: [78, 14, 8],
          backgroundColor: ['#5C8A6E', '#B5533C', '#C79A3C'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }
      }
    });
  }

  /* ---------- Login demo ---------- */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = 'dashboard.html';
    });
  }

});
