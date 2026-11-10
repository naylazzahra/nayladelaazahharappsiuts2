/**
 * AirSense City - Core Application Controller
 * Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom
 */

// Security: Anti-XSS Sanitizer for DOM injection prevention (OWASP A03)
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let currentTab = 'dashboard';

function initApp() {
  const store = window.airSenseStore;

  // Setup navigation tabs
  setupNavigation();

  // Setup UI event listeners
  setupEventListeners();

  // Initial render
  renderApp(store);

  // Subscribe store changes
  store.subscribe((s) => {
    renderApp(s);
  });

  // Start background simulation
  store.startSimulation();
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('[data-path]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-path');
      navigateTo(target);
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('btn-mobile-menu');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuDrawer.classList.toggle('hidden');
    });
  }
}

function navigateTo(tab) {
  currentTab = tab;

  // Update nav item active styles
  const navLinks = document.querySelectorAll('[data-path]');
  navLinks.forEach(link => {
    const p = link.getAttribute('data-path');
    if (p === tab) {
      link.classList.remove('text-on-surface-variant', 'hover:bg-surface-container-high', 'hover:text-on-surface');
      link.classList.add('bg-primary-container', 'text-on-primary', 'shadow-sm');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('bg-primary-container', 'text-on-primary', 'shadow-sm');
      link.classList.add('text-on-surface-variant', 'hover:bg-surface-container-high', 'hover:text-on-surface');
      link.removeAttribute('aria-current');
    }
  });

  // Hide mobile drawer
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  if (mobileMenuDrawer) {
    mobileMenuDrawer.classList.add('hidden');
  }

  // Toggle visible sections
  const tabs = ['dashboard', 'peta', 'analitik', 'peringatan', 'rekomendasi', 'tentang', 'simulasi'];
  tabs.forEach(t => {
    const el = document.getElementById(`view-${t}`);
    if (el) {
      if (t === tab) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Tab specific lifecycle triggers
  const store = window.airSenseStore;
  if (tab === 'peta') {
    window.airSenseMap.init(store);
    window.airSenseMap.invalidateSize();
  } else if (tab === 'analitik') {
    setTimeout(() => {
      window.airSenseCharts.renderTrendChart('analytics-trend-chart', store);
      window.airSenseCharts.renderComparisonChart('analytics-comparison-chart', store);
      renderHotspotTable(store);
    }, 100);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.navigateTo = navigateTo;

function setupEventListeners() {
  const store = window.airSenseStore;

  // Refresh button with 800ms spin
  const btnRefresh = document.getElementById('btn-refresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      const icon = btnRefresh.querySelector('.material-symbols-outlined');
      if (icon) icon.classList.add('animate-spin');
      store.tickSimulation();
      setTimeout(() => {
        if (icon) icon.classList.remove('animate-spin');
      }, 800);
    });
  }

  // Station dropdown selector
  const selectStation = document.getElementById('select-station');
  if (selectStation) {
    selectStation.addEventListener('change', (e) => {
      store.setSelectedStation(e.target.value);
    });
  }

  // PDF Download / Report Modal
  const btnDownloadReport = document.getElementById('btn-download-report');
  const reportModal = document.getElementById('modal-report');
  const btnCloseReport = document.getElementById('btn-close-report');
  const btnPrintReport = document.getElementById('btn-print-report');

  if (btnDownloadReport && reportModal) {
    btnDownloadReport.addEventListener('click', () => {
      renderReportModal(store);
      reportModal.classList.remove('hidden');
    });
  }
  if (btnCloseReport && reportModal) {
    btnCloseReport.addEventListener('click', () => {
      reportModal.classList.add('hidden');
    });
  }
  if (btnPrintReport) {
    btnPrintReport.addEventListener('click', () => {
      window.print();
    });
  }

  // Login & Role Switcher
  const btnLoginHeader = document.getElementById('btn-login-header');
  const loginModal = document.getElementById('modal-login');
  const btnCloseLogin = document.getElementById('btn-close-login');

  if (btnLoginHeader && loginModal) {
    btnLoginHeader.addEventListener('click', () => {
      loginModal.classList.remove('hidden');
    });
  }
  if (btnCloseLogin && loginModal) {
    btnCloseLogin.addEventListener('click', () => {
      loginModal.classList.add('hidden');
    });
  }

  // Close Station Detail Modal
  const btnCloseDetail = document.getElementById('btn-close-detail');
  const modalDetail = document.getElementById('modal-station-detail');
  if (btnCloseDetail && modalDetail) {
    btnCloseDetail.addEventListener('click', () => {
      modalDetail.classList.add('hidden');
    });
  }

  // Scenario quick buttons
  document.querySelectorAll('[data-scenario]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = btn.getAttribute('data-scenario');
      store.setScenario(scenario);
      // highlight active
      document.querySelectorAll('[data-scenario]').forEach(b => {
        b.classList.remove('bg-primary-container', 'text-on-primary');
        b.classList.add('bg-surface-container-low', 'text-on-surface');
      });
      btn.classList.add('bg-primary-container', 'text-on-primary');
      btn.classList.remove('bg-surface-container-low', 'text-on-surface');
    });
  });

  // Parameter filter buttons in analytics
  document.querySelectorAll('[data-chart-param]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-chart-param');
      document.querySelectorAll('[data-chart-param]').forEach(b => {
        b.classList.remove('bg-primary-container', 'text-on-primary');
        b.classList.add('bg-surface-container-high', 'text-on-surface');
      });
      btn.classList.add('bg-primary-container', 'text-on-primary');
      btn.classList.remove('bg-surface-container-high', 'text-on-surface');
      window.airSenseCharts.setParam(p, store);
    });
  });
}

function renderApp(store) {
  renderHeaderSync(store);
  renderCityAlertBanner(store);
  renderDistributionCards(store);
  renderFocusStation(store);
  renderBestWorstCards(store);
  renderStationListCards(store);
  renderAlertsView(store);
  renderSimulationControls(store);

  // If in map or analytics tab, refresh them
  if (currentTab === 'peta') {
    window.airSenseMap.renderMarkers(store);
  } else if (currentTab === 'analitik') {
    window.airSenseCharts.renderTrendChart('analytics-trend-chart', store);
    window.airSenseCharts.renderComparisonChart('analytics-comparison-chart', store);
    renderHotspotTable(store);
  }
}

function renderHeaderSync(store) {
  const syncTimeEl = document.getElementById('meta-sync-time');
  if (syncTimeEl) {
    const now = store.lastUpdated;
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    syncTimeEl.textContent = `Diperbarui: Baru saja (${timeStr})`;
  }

  // Role button text & avatar
  const user = store.currentUser;
  const userRoleBadge = document.getElementById('user-role-badge');
  const btnLogin = document.getElementById('btn-login-header');
  if (userRoleBadge) {
    if (user.role === 'admin') {
      userRoleBadge.textContent = 'Admin DLH';
      userRoleBadge.className = 'px-2 py-0.5 rounded text-xs font-bold bg-error-container text-on-error-container';
    } else if (user.role === 'officer') {
      userRoleBadge.textContent = 'Petugas';
      userRoleBadge.className = 'px-2 py-0.5 rounded text-xs font-bold bg-secondary-fixed text-on-secondary-fixed';
    } else {
      userRoleBadge.textContent = 'Publik';
      userRoleBadge.className = 'px-2 py-0.5 rounded text-xs font-bold bg-surface-container-high text-on-surface-variant';
    }
  }
  if (btnLogin) {
    btnLogin.textContent = user.role === 'public' ? 'Login' : 'Keluar / Ganti';
  }
}

function renderCityAlertBanner(store) {
  const bannerContainer = document.getElementById('city-alert-banner-container');
  if (!bannerContainer) return;

  // Filter stations with ISPU >= 101 (Tidak Sehat or worse)
  const alertStations = store.stations.filter(s => s.ispu >= 101);

  if (alertStations.length === 0) {
    bannerContainer.classList.add('hidden');
    return;
  }

  bannerContainer.classList.remove('hidden');
  const worstStation = alertStations.reduce((prev, curr) => (curr.ispu > prev.ispu ? curr : prev));
  const worstStatus = getISPUStatus(worstStation.ispu);

  bannerContainer.innerHTML = `
    <div class="rounded-xl bg-error-container text-on-error-container shadow-sm p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
      <div class="flex items-start gap-space-sm">
        <div class="w-10 h-10 rounded-lg bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
          <span class="material-symbols-outlined text-[24px]">warning</span>
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-label-bold uppercase tracking-wider text-error">Peringatan Kualitas Udara Kota</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-error text-on-error tracking-wider">TINGGI</span>
          </div>
          <p class="font-body-md">
            Konsentrasi polutan di <strong>${worstStation.name}</strong> mencapai kategori <strong>${worstStatus.label} (ISPU ${worstStation.ispu})</strong>. 
            Masyarakat di sekitar kawasan serta kelompok sensitif (anak-anak, lansia, penderita asma) disarankan menggunakan masker standar respirasi dan membatasi kegiatan di luar ruang.
          </p>
        </div>
      </div>
      <a href="#lokasi-pantau" class="shrink-0 px-space-md py-space-xs rounded-lg bg-error text-on-error font-label-bold hover:bg-[#93000a] transition-all shadow-sm flex items-center gap-1">
        Lihat Lokasi <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
      </a>
    </div>
  `;
}

function renderDistributionCards(store) {
  const container = document.getElementById('distribution-cards-container');
  if (!container) return;

  const stations = store.stations;
  const total = stations.length;

  const categories = [
    { key: 'baik', label: 'Baik (0 - 50)', subtext: 'Aman untuk beraktivitas', icon: 'eco', color: '#005036', pillBg: 'bg-tertiary-fixed text-on-tertiary-fixed', textColor: 'text-tertiary-container' },
    { key: 'sedang', label: 'Sedang (51 - 100)', subtext: 'Dapat diterima masyarakat', icon: 'cloud', color: '#4059aa', pillBg: 'bg-secondary-fixed text-on-secondary-fixed', textColor: 'text-secondary' },
    { key: 'tidak-sehat', label: 'Tidak Sehat (101 - 200)', subtext: 'Kelompok sensitif terdampak', icon: 'crisis_alert', color: '#ba1a1a', pillBg: 'bg-error-container text-on-error-container', textColor: 'text-error' },
    { key: 'sangat-tidak-sehat', label: 'Sangat Tidak Sehat / Berbahaya (>200)', subtext: 'Risiko kesehatan serius', icon: 'health_and_safety', color: '#70787c', pillBg: 'bg-surface-container-high text-on-surface-variant', textColor: 'text-on-surface-variant' }
  ];

  container.innerHTML = categories.map(cat => {
    let matched = [];
    if (cat.key === 'sangat-tidak-sehat') {
      matched = stations.filter(s => s.ispu > 200);
    } else {
      matched = stations.filter(s => getISPUStatus(s.ispu).key === cat.key);
    }

    const count = matched.length;
    const pct = Math.round((count / total) * 100);
    const stationNames = matched.length > 0 
      ? matched.map(s => `${s.name.replace(/Area |Kawasan |Pusat /g, '')} (${s.ispu})`).join(' • ')
      : 'Kondisi Terkendali';

    return `
      <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div class="flex items-start justify-between">
          <div>
            <span class="font-label-bold uppercase text-[11px] block" style="color: ${cat.color}">${cat.label}</span>
            <span class="font-body-sm text-on-surface-variant">${cat.subtext}</span>
          </div>
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background-color: ${cat.color}15; color: ${cat.color}">
            <span class="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' 1;">${cat.icon}</span>
          </div>
        </div>

        <div class="mt-space-md flex items-baseline justify-between">
          <div class="flex items-baseline gap-1">
            <span class="font-metric-huge text-metric-huge leading-none ${cat.textColor}">${count}</span>
            <span class="font-headline-md text-on-surface-variant font-normal">Titik</span>
          </div>
          <span class="px-space-xs py-0.5 rounded-full font-label-sm ${cat.pillBg}">
            ${pct}% Wilayah
          </span>
        </div>

        <div class="mt-space-sm bg-surface-container-low rounded-lg p-space-xs font-body-sm text-on-surface-variant truncate" title="${stationNames}">
          ${stationNames}
        </div>
      </div>
    `;
  }).join('');
}

function renderFocusStation(store) {
  const st = store.getSelectedStation();
  const status = getISPUStatus(st.ispu);
  const ringOffset = calculateRingOffset(st.ispu);

  // Sync select element
  const selectStation = document.getElementById('select-station');
  if (selectStation && selectStation.value !== st.id) {
    selectStation.value = st.id;
  }

  // Update ring and numbers
  const ringFill = document.getElementById('focus-ring-fill');
  const ispuNumber = document.getElementById('focus-ispu-number');
  const statusPill = document.getElementById('focus-status-pill');
  const statusDesc = document.getElementById('focus-status-desc');
  const sensorModel = document.getElementById('focus-sensor-model');

  if (ringFill) {
    ringFill.style.strokeDashoffset = ringOffset;
    ringFill.style.stroke = status.strokeColor;
  }
  if (ispuNumber) {
    ispuNumber.textContent = st.ispu;
    ispuNumber.className = `font-metric-huge text-metric-huge leading-none font-extrabold ${status.textClass}`;
  }
  if (statusPill) {
    statusPill.textContent = `${status.label} (ISPU ${st.ispu})`;
    statusPill.className = `px-space-sm py-1 rounded-full font-label-bold text-xs inline-flex items-center gap-1 ${status.pillClass}`;
  }
  if (statusDesc) {
    statusDesc.textContent = status.description;
  }
  if (sensorModel) {
    sensorModel.textContent = st.sensorModel;
  }

  // Update 6 Parameters grid
  const paramsGrid = document.getElementById('focus-params-grid');
  if (paramsGrid) {
    paramsGrid.innerHTML = `
      <div class="bg-surface-container rounded-lg p-space-sm">
        <span class="font-label-sm text-on-surface-variant block">Partikulat PM2.5</span>
        <div class="font-headline-md font-bold mt-1 text-primary">${st.pm25} <span class="text-xs font-normal text-on-surface-variant">µg/m³</span></div>
        <span class="font-label-sm text-secondary font-semibold block mt-0.5">Batas Aman 55.0</span>
      </div>

      <div class="bg-surface-container rounded-lg p-space-sm">
        <span class="font-label-sm text-on-surface-variant block">Partikulat PM10</span>
        <div class="font-headline-md font-bold mt-1 text-primary">${st.pm10} <span class="text-xs font-normal text-on-surface-variant">µg/m³</span></div>
        <span class="font-label-sm text-secondary font-semibold block mt-0.5">Batas Aman 75.0</span>
      </div>

      <div class="bg-surface-container rounded-lg p-space-sm">
        <span class="font-label-sm text-on-surface-variant block">Suhu Udara</span>
        <div class="font-headline-md font-bold mt-1 text-primary">${st.temp} <span class="text-xs font-normal text-on-surface-variant">°C</span></div>
        <span class="font-label-sm text-on-surface-variant block mt-0.5">Termometer Digital</span>
      </div>

      <div class="bg-surface-container rounded-lg p-space-sm">
        <span class="font-label-sm text-on-surface-variant block">Kelembapan Nisbi</span>
        <div class="font-headline-md font-bold mt-1 text-primary">${st.rh} <span class="text-xs font-normal text-on-surface-variant">%</span></div>
        <span class="font-label-sm text-on-surface-variant block mt-0.5">Sensor Higrometer</span>
      </div>

      <div class="bg-surface-container rounded-lg p-space-sm">
        <span class="font-label-sm text-on-surface-variant block">Parameter Dominan</span>
        <div class="font-headline-md font-bold mt-1 text-error">${st.dominantParam}</div>
        <span class="font-label-sm text-error font-semibold block mt-0.5">Pencemar Kritis</span>
      </div>

      <div class="bg-surface-container rounded-lg p-space-sm">
        <span class="font-label-sm text-on-surface-variant block">Kecepatan & Arah Angin</span>
        <div class="font-headline-md font-bold mt-1 text-primary">${st.windSpeed} <span class="text-xs font-normal text-on-surface-variant">km/j</span> ${st.windDirection}</div>
        <span class="font-label-sm text-on-surface-variant block mt-0.5">Anemometer Stasiun</span>
      </div>
    `;
  }

  // Update dynamic recommendations based on selected station
  const maskText = document.getElementById('rec-mask-text');
  const ventText = document.getElementById('rec-vent-text');
  const outdoorText = document.getElementById('rec-outdoor-text');
  if (maskText) maskText.textContent = status.maskAdvise;
  if (ventText) ventText.textContent = status.ventilationAdvise;
  if (outdoorText) outdoorText.textContent = status.outdoorAdvise;
}

function renderBestWorstCards(store) {
  const stations = [...store.stations].sort((a, b) => a.ispu - b.ispu);
  const best = stations[0];
  const worst = stations[stations.length - 1];

  const bestStatus = getISPUStatus(best.ispu);
  const worstStatus = getISPUStatus(worst.ispu);

  const container = document.getElementById('best-worst-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Wilayah Terbersih -->
    <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5 text-tertiary font-label-bold uppercase text-[11px]">
            <span class="material-symbols-outlined text-[18px]">verified</span>
            Wilayah Terbersih
          </div>
          <span class="px-space-xs py-0.5 rounded-full font-label-sm ${bestStatus.pillClass}">
            ISPU ${best.ispu} • ${bestStatus.label}
          </span>
        </div>

        <div class="flex items-baseline justify-between mb-3">
          <div>
            <h4 class="font-headline-md text-primary font-bold">${best.name}</h4>
            <p class="font-body-sm text-on-surface-variant">${best.location}</p>
          </div>
          <div class="text-right">
            <span class="font-metric-lg text-tertiary-container font-extrabold leading-none">${best.pm25}</span>
            <span class="font-label-sm text-on-surface-variant block">PM2.5 (µg/m³)</span>
          </div>
        </div>

        <!-- Thumbnail Photo -->
        <div class="h-24 rounded-lg overflow-hidden relative shadow-inner mb-3">
          <img src="assets/kemiling.svg" alt="Foto Udara Bersih Kemiling" class="w-full h-full object-cover"/>
          <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex items-end p-2">
            <span class="font-label-sm text-white font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">nature</span> Lanskap Vegetasi Asri & Sejuk
            </span>
          </div>
        </div>

        <!-- Mini Metric Cards -->
        <div class="grid grid-cols-2 gap-space-sm">
          <div class="bg-surface-container-low rounded-lg p-space-xs">
            <div class="flex items-center justify-between text-on-surface-variant font-label-sm">
              <span>Indeks Termal (THI)</span>
              <span class="material-symbols-outlined text-secondary text-[16px]">thermostat</span>
            </div>
            <div class="font-headline-lg font-bold text-primary mt-0.5">24.5</div>
            <span class="font-label-sm text-secondary font-semibold">Kategori Nyaman</span>
          </div>
          <div class="bg-surface-container-low rounded-lg p-space-xs">
            <div class="flex items-center justify-between text-on-surface-variant font-label-sm">
              <span>Radiasi UV (UVI)</span>
              <span class="material-symbols-outlined text-secondary text-[16px]">wb_sunny</span>
            </div>
            <div class="font-headline-lg font-bold text-primary mt-0.5">4.1</div>
            <span class="font-label-sm text-secondary font-semibold">Taraf Sedang</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Wilayah Paling Terpapar -->
    <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5 text-error font-label-bold uppercase text-[11px]">
            <span class="material-symbols-outlined text-[18px]">report_problem</span>
            Wilayah Paling Terpapar
          </div>
          <span class="px-space-xs py-0.5 rounded-full font-label-sm ${worstStatus.pillClass}">
            ISPU ${worst.ispu} • ${worstStatus.label}
          </span>
        </div>

        <div class="flex items-baseline justify-between mb-3">
          <div>
            <h4 class="font-headline-md text-primary font-bold">${worst.name}</h4>
            <p class="font-body-sm text-on-surface-variant">${worst.location}</p>
          </div>
          <div class="text-right">
            <span class="font-metric-lg text-error font-extrabold leading-none">${worst.pm25}</span>
            <span class="font-label-sm text-on-surface-variant block">PM2.5 (µg/m³)</span>
          </div>
        </div>

        <!-- Thumbnail Photo -->
        <div class="h-24 rounded-lg overflow-hidden relative shadow-inner mb-3">
          <img src="assets/panjang.svg" alt="Foto Kawasan Industri Panjang" class="w-full h-full object-cover"/>
          <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex items-end p-2">
            <span class="font-label-sm text-white font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">factory</span> Aktivitas Logistik & Pelabuhan
            </span>
          </div>
        </div>

        <!-- Mini Metric Cards -->
        <div class="grid grid-cols-2 gap-space-sm">
          <div class="bg-surface-container-low rounded-lg p-space-xs">
            <div class="flex items-center justify-between text-on-surface-variant font-label-sm">
              <span>Indeks Termal (THI)</span>
              <span class="material-symbols-outlined text-secondary text-[16px]">thermostat</span>
            </div>
            <div class="font-headline-lg font-bold text-primary mt-0.5">29.2</div>
            <span class="font-label-sm text-error font-semibold">Kategori Gerah</span>
          </div>
          <div class="bg-surface-container-low rounded-lg p-space-xs">
            <div class="flex items-center justify-between text-on-surface-variant font-label-sm">
              <span>Radiasi UV (UVI)</span>
              <span class="material-symbols-outlined text-secondary text-[16px]">wb_sunny</span>
            </div>
            <div class="font-headline-lg font-bold text-primary mt-0.5">6.4</div>
            <span class="font-label-sm text-error font-semibold">Taraf Tinggi</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStationListCards(store) {
  const container = document.getElementById('station-cards-grid');
  if (!container) return;

  // Urutkan berdasarkan keparahan ISPU menurun (SKILL.md Bagian 6)
  const sorted = [...store.stations].sort((a, b) => b.ispu - a.ispu);

  const cardsHtml = sorted.map(st => {
    const status = getISPUStatus(st.ispu);
    const hist = store.history[st.id] || [];
    const recent6 = hist.slice(-6);

    // Generate real SVG sparkline 6 jam
    const sparklineSvg = generateSparklineSvg(recent6, status.strokeColor);
    const maxVal = recent6.length > 0 ? Math.max(...recent6.map(r => r.ispu)) : st.ispu;

    return `
      <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border-l-4 ${status.borderClass} flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          <!-- Header Baris 1 -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="font-label-sm text-on-surface-variant block uppercase tracking-wide">Stasiun #${st.id} • ${st.location}</span>
              <h4 class="font-headline-md font-bold text-primary mt-0.5">${st.name}</h4>
            </div>
            <span class="px-space-xs py-0.5 rounded-full font-label-sm shrink-0 ${status.pillClass}">
              ${status.label}
            </span>
          </div>

          <!-- Baris 2 ISPU & Dominan -->
          <div class="mt-space-md flex items-baseline justify-between border-b border-surface-container pb-space-xs">
            <div>
              <span class="font-label-sm text-on-surface-variant block">ISPU Terhitung</span>
              <span class="font-metric-huge text-metric-huge leading-none font-extrabold ${status.textClass}">${st.ispu}</span>
            </div>
            <div class="text-right">
              <span class="font-label-sm text-on-surface-variant block">Parameter Dominan</span>
              <span class="font-label-bold text-primary block mt-0.5">${st.dominantParam} (${st.pm25} µg/m³)</span>
            </div>
          </div>

          <!-- Sparkline Tren 6 Jam -->
          <div class="my-space-sm bg-surface-container-low rounded-lg p-space-xs">
            <div class="flex items-center justify-between text-[11px] text-on-surface-variant mb-1 font-semibold">
              <span>Tren 6 Jam Terakhir</span>
              <span>Puncak: ${maxVal}</span>
            </div>
            ${sparklineSvg}
          </div>

          <!-- Parameter Mini Well -->
          <div class="grid grid-cols-2 gap-space-xs bg-surface-container-low rounded-lg p-space-xs text-xs">
            <div>
              <span class="text-on-surface-variant block text-[10px]">Partikulat PM10</span>
              <strong class="text-on-surface font-bold">${st.pm10} µg/m³</strong>
            </div>
            <div>
              <span class="text-on-surface-variant block text-[10px]">Suhu / RH</span>
              <strong class="text-on-surface font-bold">${st.temp} °C / ${st.rh} %</strong>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-space-sm pt-space-xs flex items-center justify-between border-t border-surface-container">
          <span class="font-label-sm text-on-surface-variant flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-tertiary"></span> Sinkronisasi: ${st.lastSyncMinutes} mnt lalu
          </span>
          <button onclick="window.openStationDetail('${st.id}');" 
                  class="font-label-bold text-primary hover:underline flex items-center gap-0.5">
            ${st.ispu >= 101 ? '<span class="text-error font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[14px]">warning</span> Detail & Peringatan →</span>' : 'Detail →'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Closing network expansion card (SKILL.md Bagian 6)
  const networkCardHtml = `
    <div class="bg-primary-container text-on-primary rounded-xl p-space-md shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-2 text-on-primary-container font-label-bold uppercase text-[11px] mb-2">
          <span class="material-symbols-outlined text-[20px]">sensors</span>
          Jaringan Sensor Cerdas
        </div>
        <h4 class="font-headline-md font-bold text-white mb-2">Perluasan Titik Pantau Kota</h4>
        <p class="font-body-sm text-on-primary-container mb-4">
          Integrasi telemetri cerdas mikrokontroler berbasis IoT di seluruh kecamatan Kota Bandar Lampung mendukung perencanaan tata ruang dan mitigasi emisi berbasis data.
        </p>
      </div>

      <div class="pt-space-xs border-t border-white/20 flex items-center justify-between font-label-sm">
        <span class="text-on-primary-container">Protokol: MQTT / LoRaWAN</span>
        <button onclick="window.navigateTo('peta');" class="px-space-sm py-1 rounded bg-white text-primary font-bold hover:bg-surface-container-high transition-colors">
          Peta Lengkap ›
        </button>
      </div>
    </div>
  `;

  container.innerHTML = cardsHtml + networkCardHtml;
}

function generateSparklineSvg(dataPoints, color) {
  if (!dataPoints || dataPoints.length === 0) {
    return `<div class="h-8 flex items-center justify-center text-xs text-gray-400">Data memuat...</div>`;
  }

  const values = dataPoints.map(d => d.ispu);
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.1 || 100;
  const width = 100;
  const height = 24;

  const points = values.map((val, idx) => {
    const x = idx * (width / (values.length - 1 || 1));
    const y = height - ((val - min) / (max - min || 1)) * (height - 6) - 3;
    return { x: x.toFixed(1), y: y.toFixed(1) };
  });

  const pathStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const lastPoint = points[points.length - 1];

  return `
    <svg viewBox="0 0 100 24" class="w-full h-8 overflow-visible">
      <path d="${pathStr}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="3.5" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
    </svg>
  `;
}

function renderAlertsView(store) {
  const container = document.getElementById('alerts-list-container');
  if (!container) return;

  const alerts = store.alerts;
  if (alerts.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-on-surface-variant font-body-md">Tidak ada peringatan aktif saat ini. Semua kualitas udara dalam batas aman.</div>`;
    return;
  }

  container.innerHTML = alerts.map(a => {
    const status = getISPUStatus(a.ispu);
    return `
      <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border-l-4 ${a.active ? 'border-error' : 'border-outline-variant'} flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div class="flex items-start gap-space-sm">
          <div class="w-10 h-10 rounded-lg ${a.active ? 'bg-error-container text-error' : 'bg-surface-container-high text-outline'} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[24px]">${a.active ? 'crisis_alert' : 'history'}</span>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-label-bold ${a.active ? 'text-error' : 'text-on-surface-variant'} uppercase">${a.id} • ${a.stationName}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.active ? 'bg-error text-on-error' : 'bg-surface-container-high text-on-surface-variant'}">
                ${a.active ? 'AKTIF' : 'TERSELESAIKAN'}
              </span>
            </div>
            <p class="font-body-md text-on-surface">${a.message}</p>
            <span class="font-label-sm text-on-surface-variant block mt-1">Parameter Pemicu: <strong>${a.param}</strong> • Waktu Deteksi: ${a.timestamp}</span>
          </div>
        </div>
        <button onclick="window.airSenseStore.setSelectedStation('${a.stationId}'); window.navigateTo('dashboard');" 
                class="shrink-0 px-space-md py-space-xs rounded-lg ${a.active ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface'} font-label-bold hover:opacity-90">
          Tinjau Stasiun
        </button>
      </div>
    `;
  }).join('');
}

function renderHotspotTable(store) {
  const tbody = document.getElementById('hotspot-table-body');
  if (!tbody) return;

  const analysis = store.getHotspotAnalysis();
  tbody.innerHTML = analysis.map(row => {
    return `
      <tr class="border-b border-surface-container hover:bg-surface-container-low transition-colors font-body-sm">
        <td class="py-3 px-4 font-bold text-primary">${row.name} <span class="text-[11px] text-on-surface-variant block font-normal">${row.code}</span></td>
        <td class="py-3 px-4 font-semibold text-center">${row.avgPm25} µg/m³</td>
        <td class="py-3 px-4 font-bold text-center ${row.pctUnhealthy >= 30 ? 'text-error' : 'text-on-surface'}">${row.pctUnhealthy}%</td>
        <td class="py-3 px-4 text-center">${row.peakHour} (${row.maxPm25} µg/m³)</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${row.badgeClass}">
            ${row.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderSimulationControls(store) {
  const container = document.getElementById('sim-station-sliders');
  if (!container) return;

  container.innerHTML = store.stations.map(st => {
    return `
      <div class="bg-surface-container-low rounded-lg p-space-sm mb-3">
        <div class="flex items-center justify-between mb-2">
          <span class="font-label-bold text-primary">${st.name}</span>
          <span class="px-2 py-0.5 rounded text-xs font-bold ${getISPUStatus(st.ispu).pillClass}">
            ISPU ${st.ispu} (${getISPUStatus(st.ispu).label})
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <div class="flex justify-between font-semibold text-on-surface-variant mb-1">
              <span>PM2.5 (µg/m³)</span>
              <span id="slider-val-pm25-${st.id}">${st.pm25}</span>
            </div>
            <input type="range" min="0" max="180" step="0.5" value="${st.pm25}" 
                   oninput="document.getElementById('slider-val-pm25-${st.id}').textContent = this.value; window.airSenseStore.updateStationManual('${st.id}', { pm25: this.value })"
                   class="w-full accent-[#0f4c5c] cursor-pointer"/>
          </div>
          <div>
            <div class="flex justify-between font-semibold text-on-surface-variant mb-1">
              <span>PM10 (µg/m³)</span>
              <span id="slider-val-pm10-${st.id}">${st.pm10}</span>
            </div>
            <input type="range" min="0" max="250" step="0.5" value="${st.pm10}" 
                   oninput="document.getElementById('slider-val-pm10-${st.id}').textContent = this.value; window.airSenseStore.updateStationManual('${st.id}', { pm10: this.value })"
                   class="w-full accent-[#4059aa] cursor-pointer"/>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderReportModal(store) {
  const content = document.getElementById('report-modal-content');
  if (!content) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const stations = store.stations;

  content.innerHTML = `
    <div class="border-b-2 border-primary pb-4 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="assets/1794305676149_image.png" class="w-12 h-12 object-contain" alt="Logo Pemerintah Kota Bandar Lampung"/>
          <img src="assets/IMG_5280.png" class="w-12 h-12 object-contain" alt="Logo Universitas Teknokrat Indonesia"/>
          <div>
            <h2 class="text-xl font-extrabold text-primary">LAPORAN PEMANTAUAN KUALITAS UDARA PERKOTAAN</h2>
            <p class="text-xs text-on-surface-variant font-semibold">Sistem AirSense City • Pemerintah Kota Bandar Lampung & Universitas Teknokrat Indonesia</p>
          </div>
        </div>
        <div class="text-right text-xs text-on-surface-variant">
          <span class="block font-bold text-primary">Periode Laporan: Harian</span>
          <span>${dateStr}</span>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <div class="inline-block px-2.5 py-1 rounded bg-[#d3e4fe] text-[#00164e] text-xs font-bold mb-2">
        Data Simulasi Telemetri Virtual IoT (PMS7003 & MQ136)
      </div>
      <p class="text-xs text-on-surface-variant leading-relaxed">
        Laporan ini menyajikan ringkasan indeks kualitas udara (ISPU) berdasarkan interpolasi baku mutu KLHK / SNI 19-4102-1996 pada lima stasiun pemantauan terpasang di wilayah Kota Bandar Lampung.
      </p>
    </div>

    <!-- Tabel Data Stasiun -->
    <table class="w-full text-left text-xs border border-gray-200 mb-6">
      <thead class="bg-gray-100 font-bold text-primary">
        <tr>
          <th class="p-2 border">Kode</th>
          <th class="p-2 border">Stasiun & Lokasi</th>
          <th class="p-2 border text-center">ISPU</th>
          <th class="p-2 border text-center">Kategori</th>
          <th class="p-2 border text-center">PM2.5 (µg/m³)</th>
          <th class="p-2 border text-center">PM10 (µg/m³)</th>
          <th class="p-2 border text-center">Suhu / RH</th>
          <th class="p-2 border text-center">Pencemar Kritis</th>
        </tr>
      </thead>
      <tbody>
        ${stations.map(st => {
          const status = getISPUStatus(st.ispu);
          return `
            <tr class="border-b">
              <td class="p-2 border font-bold">${st.code}</td>
              <td class="p-2 border font-semibold">${st.name}<br/><span class="text-[10px] text-gray-500 font-normal">${st.location}</span></td>
              <td class="p-2 border text-center font-extrabold" style="color: ${status.strokeColor}">${st.ispu}</td>
              <td class="p-2 border text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${status.pillClass}">${status.label}</span></td>
              <td class="p-2 border text-center">${st.pm25}</td>
              <td class="p-2 border text-center">${st.pm10}</td>
              <td class="p-2 border text-center">${st.temp}°C / ${st.rh}%</td>
              <td class="p-2 border text-center font-bold text-red-700">${st.dominantParam}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- Ringkasan Deteksi Hotspot -->
    <div class="bg-surface-container-low p-3 rounded-lg mb-4 text-xs">
      <h4 class="font-bold text-primary mb-1">Status Deteksi Hotspot (W=24h, Ambang P=30%)</h4>
      <p class="text-on-surface-variant">
        Berdasarkan analisis jendela 24 jam terakhir, wilayah berstatus <strong>Hotspot Aktif</strong> adalah 
        <em>${stations.find(s => s.ispu >= 101)?.name || 'Nihil (Kondisi Terkendali)'}</em>.
        Rekomendasi tindakan mitigasi: inspeksi sumber emisi dan penyiapan masker bagi warga rentan.
      </p>
    </div>

    <!-- Footer Laporan Mandatori BR-03 & BR-04 -->
    <div class="border-t border-gray-300 pt-3 text-center text-[11px] text-gray-600">
      <p class="font-semibold text-[#0b1c30]">Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom</p>
      <p class="text-[10px] text-gray-500">Kolaborasi Pemerintah Kota Bandar Lampung & Universitas Teknokrat Indonesia</p>
    </div>
  `;
}

function openStationDetail(stationId) {
  const store = window.airSenseStore;
  const st = store.stations.find(s => s.id === stationId);
  if (!st) return;

  const modal = document.getElementById('modal-station-detail');
  const title = document.getElementById('detail-modal-title');
  const body = document.getElementById('detail-modal-body');
  if (!modal || !title || !body) return;

  const status = getISPUStatus(st.ispu);
  const hist = store.history[st.id] || [];

  title.textContent = `Stasiun #${st.id} • ${st.name} (${st.code})`;

  body.innerHTML = `
    <div class="flex flex-col gap-4">
      <!-- Status Summary Header -->
      <div class="bg-surface-container-low p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span class="text-xs text-on-surface-variant block uppercase font-bold">${st.location}</span>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-2xl font-black ${status.textClass}">ISPU ${st.ispu}</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${status.pillClass}">${status.label}</span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">${status.description}</p>
        </div>
        <div class="text-right sm:border-l border-gray-300 sm:pl-4">
          <span class="text-[10px] text-gray-500 block uppercase font-semibold">Parameter Kritis</span>
          <span class="text-sm font-bold text-error">${st.dominantParam}</span>
          <span class="text-[10px] text-gray-500 block mt-1">Update: ${st.lastSyncMinutes} mnt lalu</span>
        </div>
      </div>

      <!-- Technical Specifications Hardware IoT -->
      <div class="border border-surface-container rounded-xl p-3 text-xs">
        <h5 class="font-bold text-primary mb-2 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">memory</span> Spesifikasi Perangkat Sensor IoT Telemetri
        </h5>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-700">
          <div><span class="text-gray-500 block text-[10px]">Sensor Partikulat</span><strong>PMS7003 Laser</strong></div>
          <div><span class="text-gray-500 block text-[10px]">Sensor Gas</span><strong>MQ136 (CO/H2S)</strong></div>
          <div><span class="text-gray-500 block text-[10px]">Mikrokontroler</span><strong>ESP32 240MHz</strong></div>
          <div><span class="text-gray-500 block text-[10px]">Transmisi</span><strong>LoRaWAN / MQTT</strong></div>
          <div><span class="text-gray-500 block text-[10px]">Kekuatan Sinyal</span><strong class="text-green-700">-68 dBm (Optimal)</strong></div>
          <div><span class="text-gray-500 block text-[10px]">Koordinat GPS</span><strong>${st.lat}, ${st.lng}</strong></div>
        </div>
      </div>

      <!-- Real-time Parameters Grid -->
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
        <div class="bg-gray-50 p-2 rounded-lg border">
          <span class="text-[10px] text-gray-500 block">PM2.5</span>
          <strong class="text-sm font-bold text-primary">${st.pm25}</strong>
          <span class="text-[9px] text-gray-400 block">µg/m³</span>
        </div>
        <div class="bg-gray-50 p-2 rounded-lg border">
          <span class="text-[10px] text-gray-500 block">PM10</span>
          <strong class="text-sm font-bold text-primary">${st.pm10}</strong>
          <span class="text-[9px] text-gray-400 block">µg/m³</span>
        </div>
        <div class="bg-gray-50 p-2 rounded-lg border">
          <span class="text-[10px] text-gray-500 block">Suhu</span>
          <strong class="text-sm font-bold text-primary">${st.temp}</strong>
          <span class="text-[9px] text-gray-400 block">°C</span>
        </div>
        <div class="bg-gray-50 p-2 rounded-lg border">
          <span class="text-[10px] text-gray-500 block">Kelembapan</span>
          <strong class="text-sm font-bold text-primary">${st.rh}</strong>
          <span class="text-[9px] text-gray-400 block">%</span>
        </div>
        <div class="bg-gray-50 p-2 rounded-lg border">
          <span class="text-[10px] text-gray-500 block">THI</span>
          <strong class="text-xs font-bold text-secondary">${st.thi.split(' ')[0]}</strong>
          <span class="text-[9px] text-gray-400 block">Indeks Termal</span>
        </div>
        <div class="bg-gray-50 p-2 rounded-lg border">
          <span class="text-[10px] text-gray-500 block">UV Index</span>
          <strong class="text-xs font-bold text-secondary">${st.uvi.split(' ')[0]}</strong>
          <span class="text-[9px] text-gray-400 block">Radiasi UV</span>
        </div>
      </div>

      <!-- Riwayat Terakhir 5 Jam -->
      <div class="border border-surface-container rounded-xl p-3 text-xs">
        <h5 class="font-bold text-primary mb-2 flex items-center justify-between">
          <span>Riwayat Telemetri Terakhir</span>
          <span class="font-normal text-gray-500 text-[11px]">Interval Pembacaan: Tiap 1 Jam</span>
        </h5>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-[11px]">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="p-1.5">Waktu</th>
                <th class="p-1.5 text-center">ISPU</th>
                <th class="p-1.5 text-center">PM2.5</th>
                <th class="p-1.5 text-center">PM10</th>
                <th class="p-1.5 text-center">Suhu</th>
                <th class="p-1.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${hist.slice(-5).reverse().map(h => {
                const s = getISPUStatus(h.ispu);
                return `
                  <tr class="border-b">
                    <td class="p-1.5 font-bold">${h.label} WIB</td>
                    <td class="p-1.5 text-center font-bold" style="color:${s.strokeColor}">${h.ispu}</td>
                    <td class="p-1.5 text-center">${h.pm25} µg/m³</td>
                    <td class="p-1.5 text-center">${h.pm10} µg/m³</td>
                    <td class="p-1.5 text-center">${h.temp} °C</td>
                    <td class="p-1.5 text-center"><span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${s.pillClass}">${s.label}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
        <button onclick="exportStationCSV('${st.id}')" class="px-3 py-1.5 rounded-lg bg-surface-container-high text-primary font-bold hover:bg-surface-container-highest flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">download</span> Unduh Riwayat CSV (24 Jam)
        </button>
        <div class="flex items-center gap-2">
          <button onclick="document.getElementById('modal-station-detail').classList.add('hidden'); window.airSenseStore.setSelectedStation('${st.id}'); window.navigateTo('peta'); window.airSenseMap.focusStation(window.airSenseStore.getSelectedStation());" 
                  class="px-3 py-1.5 rounded-lg bg-secondary text-white font-bold hover:opacity-90 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">location_on</span> Lihat di Peta
          </button>
          <button onclick="document.getElementById('modal-station-detail').classList.add('hidden'); window.airSenseStore.setSelectedStation('${st.id}'); window.navigateTo('dashboard'); window.scrollTo({top: 300, behavior:'smooth'});" 
                  class="px-3 py-1.5 rounded-lg bg-primary-container text-white font-bold hover:bg-primary flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">visibility</span> Fokus di Dashboard
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function exportStationCSV(stationId) {
  const store = window.airSenseStore;
  const st = store.stations.find(s => s.id === stationId);
  if (!st) return;

  const hist = store.history[st.id] || [];
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Timestamp_ISO,Waktu_WIB,Kode_Stasiun,Nama_Stasiun,ISPU,PM25_ug_m3,PM10_ug_m3,Suhu_C,Kelembapan_Persen\n";

  hist.forEach(h => {
    csvContent += `${h.time},${h.label},${st.code},"${st.name}",${h.ispu},${h.pm25},${h.pm10},${h.temp},${h.rh}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `airsense_telemetri_${st.code}_24h.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.openStationDetail = openStationDetail;
window.exportStationCSV = exportStationCSV;


