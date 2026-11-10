/**
 * AirSense City - Telemetry State, IoT Simulator & Hotspot Engine
 * Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom
 */

const INITIAL_STATIONS = [
  {
    id: '01',
    code: 'ST-TKG-01',
    name: 'Pusat Kota (Tanjung Karang)',
    location: 'Jl. Raden Intan, Kec. Enggal',
    lat: -5.4128,
    lng: 105.2575,
    ispu: 76,
    pm25: 28.4,
    pm10: 45.2,
    temp: 31.5,
    rh: 68,
    windSpeed: 12,
    windDirection: 'BD',
    sensorModel: 'PMS7003 & MQ136',
    signalStatus: 'Sinyal Optimal',
    lastSyncMinutes: 3,
    statusKey: 'sedang',
    dominantParam: 'PM2.5',
    thi: '27.4 (Nyaman)',
    uvi: '5.2 (Sedang)'
  },
  {
    id: '02',
    code: 'ST-UTI-02',
    name: 'Area Kampus (Kedaton - UTI)',
    location: 'Jl. ZA. Pagar Alam No. 9-11, Kec. Kedaton',
    lat: -5.3789,
    lng: 105.2514,
    ispu: 42,
    pm25: 14.1,
    pm10: 22.0,
    temp: 30.2,
    rh: 72,
    windSpeed: 8,
    windDirection: 'T',
    sensorModel: 'PMS7003 & MQ136',
    signalStatus: 'Sinyal Optimal',
    lastSyncMinutes: 1,
    statusKey: 'baik',
    dominantParam: 'PM2.5',
    thi: '25.8 (Nyaman)',
    uvi: '4.8 (Sedang)'
  },
  {
    id: '03',
    code: 'ST-PNJ-03',
    name: 'Kawasan Industri (Panjang)',
    location: 'Jl. Yos Sudarso, Pelabuhan Panjang',
    lat: -5.4678,
    lng: 105.3189,
    ispu: 138,
    pm25: 58.7,
    pm10: 89.4,
    temp: 33.1,
    rh: 61,
    windSpeed: 16,
    windDirection: 'S',
    sensorModel: 'PMS7003 & MQ136',
    signalStatus: 'Sinyal Optimal',
    lastSyncMinutes: 2,
    statusKey: 'tidak-sehat',
    dominantParam: 'PM2.5',
    thi: '29.2 (Gerah)',
    uvi: '6.4 (Tinggi)'
  },
  {
    id: '04',
    code: 'ST-KML-04',
    name: 'Area Permukiman (Kemiling)',
    location: 'Jl. Teuku Cik Ditiro, Kec. Kemiling',
    lat: -5.3982,
    lng: 105.2156,
    ispu: 38,
    pm25: 11.2,
    pm10: 19.5,
    temp: 28.9,
    rh: 78,
    windSpeed: 6,
    windDirection: 'B',
    sensorModel: 'PMS7003 & MQ136',
    signalStatus: 'Sinyal Optimal',
    lastSyncMinutes: 5,
    statusKey: 'baik',
    dominantParam: 'PM2.5',
    thi: '24.5 (Sejuk)',
    uvi: '4.1 (Sedang)'
  },
  {
    id: '05',
    code: 'ST-RBS-05',
    name: 'Kawasan Transportasi (Rajabasa)',
    location: 'Terminal Bus Tipe A Rajabasa',
    lat: -5.3587,
    lng: 105.2348,
    ispu: 84,
    pm25: 32.6,
    pm10: 51.0,
    temp: 32.0,
    rh: 65,
    windSpeed: 14,
    windDirection: 'TL',
    sensorModel: 'PMS7003 & MQ136',
    signalStatus: 'Sinyal Optimal',
    lastSyncMinutes: 4,
    statusKey: 'sedang',
    dominantParam: 'PM2.5',
    thi: '28.1 (Hangat)',
    uvi: '5.8 (Sedang)'
  }
];

class AirSenseStore {
  constructor() {
    this.stations = JSON.parse(JSON.stringify(INITIAL_STATIONS));
    this.selectedStationId = '01';
    this.currentScenario = 'normal';
    this.isSimulating = true;
    this.simSpeed = 5000; // ms
    this.timer = null;
    this.lastUpdated = new Date();
    this.currentUser = {
      role: 'public', // 'public', 'officer', 'admin'
      name: 'Masyarakat Umum',
      email: 'warga@bandarlampung.go.id'
    };
    
    // Generate 24 hours of history per station
    this.history = this.generateInitialHistory();
    this.alerts = this.generateInitialAlerts();
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  generateInitialHistory() {
    const hist = {};
    const now = new Date();
    for (const st of this.stations) {
      hist[st.id] = [];
      for (let h = 23; h >= 0; h--) {
        const time = new Date(now.getTime() - h * 3600 * 1000);
        // Base value with diurnal curve (peaks at 08:00 and 17:00)
        const hour = time.getHours();
        let diurnalFactor = 1.0;
        if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
          diurnalFactor = 1.35;
        } else if (hour >= 1 && hour <= 4) {
          diurnalFactor = 0.75;
        }

        const basePm25 = st.pm25 * diurnalFactor * (0.85 + Math.random() * 0.3);
        const basePm10 = st.pm10 * diurnalFactor * (0.85 + Math.random() * 0.3);
        const sub25 = calculateSubIndex('pm25', basePm25);
        const sub10 = calculateSubIndex('pm10', basePm10);
        const ispuVal = Math.max(sub25, sub10);

        hist[st.id].push({
          time: time.toISOString(),
          label: `${String(hour).padStart(2, '0')}:00`,
          pm25: parseFloat(basePm25.toFixed(1)),
          pm10: parseFloat(basePm10.toFixed(1)),
          ispu: ispuVal,
          temp: parseFloat((st.temp + (Math.sin(hour / 3.8) * 3) + (Math.random() - 0.5)).toFixed(1)),
          rh: Math.min(95, Math.max(45, Math.round(st.rh - (Math.sin(hour / 3.8) * 10) + (Math.random() * 4))))
        });
      }
    }
    return hist;
  }

  generateInitialAlerts() {
    return [
      {
        id: 'ALT-2026-001',
        stationId: '03',
        stationName: 'Kawasan Industri (Panjang)',
        level: 'Tidak Sehat',
        ispu: 138,
        param: 'PM2.5 (58.7 µg/m³)',
        message: 'Kualitas udara melewati ambang baku mutu lingkungan di Kawasan Industri Panjang. Kelompok sensitif disarankan memakai masker respirator.',
        timestamp: '14:15 WIB',
        active: true
      },
      {
        id: 'ALT-2026-002',
        stationId: '05',
        stationName: 'Kawasan Transportasi (Rajabasa)',
        level: 'Sedang (Mendekati Ambang)',
        ispu: 84,
        param: 'PM2.5 (32.6 µg/m³)',
        message: 'Kenaikan konsentrasi partikulat akibat kepadatan armada bus antarkota menjelang sore.',
        timestamp: '11:30 WIB',
        active: false
      }
    ];
  }

  getSelectedStation() {
    return this.stations.find(s => s.id === this.selectedStationId) || this.stations[0];
  }

  setSelectedStation(id) {
    this.selectedStationId = id;
    this.notify();
  }

  setRole(role) {
    if (role === 'admin') {
      this.currentUser = {
        role: 'admin',
        name: 'Administrator DLH',
        email: 'admin.dlh@bandarlampung.go.id'
      };
    } else if (role === 'officer') {
      this.currentUser = {
        role: 'officer',
        name: 'Petugas Monitoring Lapangan',
        email: 'petugas.dlh@bandarlampung.go.id'
      };
    } else {
      this.currentUser = {
        role: 'public',
        name: 'Masyarakat Umum',
        email: 'warga@bandarlampung.go.id'
      };
    }
    this.notify();
  }

  setScenario(scenarioKey) {
    this.currentScenario = scenarioKey;
    for (const st of this.stations) {
      if (scenarioKey === 'normal') {
        const init = INITIAL_STATIONS.find(s => s.id === st.id);
        Object.assign(st, init);
      } else if (scenarioKey === 'rush_hour') {
        if (st.id === '01' || st.id === '05') {
          // Tanjung Karang & Rajabasa melonjak
          st.pm25 = parseFloat((st.pm25 * 1.85).toFixed(1));
          st.pm10 = parseFloat((st.pm10 * 1.6).toFixed(1));
        }
      } else if (scenarioKey === 'industrial_peak') {
        if (st.id === '03') {
          // Industri Panjang polusi tinggi
          st.pm25 = 92.4;
          st.pm10 = 145.2;
        }
      } else if (scenarioKey === 'rain_clearing') {
        // Hujan merata di Bandar Lampung
        st.pm25 = parseFloat((st.pm25 * 0.45).toFixed(1));
        st.pm10 = parseFloat((st.pm10 * 0.5).toFixed(1));
        st.rh = Math.min(96, st.rh + 15);
      } else if (scenarioKey === 'inversion') {
        // Inversi suhu parah
        st.pm25 = parseFloat((st.pm25 * 2.2).toFixed(1));
        st.pm10 = parseFloat((st.pm10 * 2.0).toFixed(1));
      }
      this.recomputeStation(st);
    }

    this.checkAlerts();
    this.lastUpdated = new Date();
    this.notify();
  }

  updateStationManual(id, { pm25, pm10, temp, rh }) {
    const st = this.stations.find(s => s.id === id);
    if (!st) return;
    if (pm25 !== undefined) st.pm25 = Math.max(0, parseFloat(pm25));
    if (pm10 !== undefined) st.pm10 = Math.max(0, parseFloat(pm10));
    if (temp !== undefined) st.temp = parseFloat(temp);
    if (rh !== undefined) st.rh = parseInt(rh);

    this.recomputeStation(st);
    this.checkAlerts();
    this.lastUpdated = new Date();
    this.notify();
  }

  recomputeStation(st) {
    const sub25 = calculateSubIndex('pm25', st.pm25);
    const sub10 = calculateSubIndex('pm10', st.pm10);
    st.ispu = Math.max(sub25, sub10);
    st.dominantParam = sub25 >= sub10 ? 'PM2.5' : 'PM10';
    st.statusKey = getISPUStatus(st.ispu).key;
  }

  tickSimulation() {
    const now = new Date();
    this.lastUpdated = now;

    for (const st of this.stations) {
      // Small realistic fluctuations
      const delta25 = (Math.random() - 0.48) * 1.8;
      const delta10 = (Math.random() - 0.48) * 2.5;
      st.pm25 = Math.max(3.0, parseFloat((st.pm25 + delta25).toFixed(1)));
      st.pm10 = Math.max(5.0, parseFloat((st.pm10 + delta10).toFixed(1)));
      st.lastSyncMinutes = Math.floor(Math.random() * 4) + 1;
      
      this.recomputeStation(st);

      // Append to history
      const stationHist = this.history[st.id];
      if (stationHist) {
        stationHist.push({
          time: now.toISOString(),
          label: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          pm25: st.pm25,
          pm10: st.pm10,
          ispu: st.ispu,
          temp: st.temp,
          rh: st.rh
        });
        if (stationHist.length > 36) {
          stationHist.shift();
        }
      }
    }

    this.checkAlerts();
    this.notify();
  }

  checkAlerts() {
    for (const st of this.stations) {
      if (st.ispu >= 101) {
        const existing = this.alerts.find(a => a.stationId === st.id && a.active);
        const status = getISPUStatus(st.ispu);
        if (!existing) {
          const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
          this.alerts.unshift({
            id: 'ALT-' + Date.now().toString().slice(-6),
            stationId: st.id,
            stationName: st.name,
            level: status.label,
            ispu: st.ispu,
            param: `${st.dominantParam} (${st.dominantParam === 'PM2.5' ? st.pm25 : st.pm10} µg/m³)`,
            message: `Kualitas udara di ${st.name} mencapai kategori ${status.label} (ISPU ${st.ispu}). Warga dianjurkan ${status.outdoorAdvise.toLowerCase()}.`,
            timestamp: nowStr,
            active: true
          });
        } else {
          existing.ispu = st.ispu;
          existing.level = status.label;
        }
      } else {
        const existing = this.alerts.find(a => a.stationId === st.id && a.active);
        if (existing) {
          existing.active = false;
        }
      }
    }
  }

  startSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.isSimulating = true;
    this.timer = setInterval(() => {
      this.tickSimulation();
    }, this.simSpeed);
  }

  stopSimulation() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isSimulating = false;
    this.notify();
  }

  toggleSimulation() {
    if (this.isSimulating) {
      this.stopSimulation();
    } else {
      this.startSimulation();
    }
  }

  /**
   * Deteksi Hotspot Berdasarkan PRD Section 6.5 (FR-HOT)
   * Waktu W = 24 Jam
   * Ambang Persentase P% = 30% bacaan >= Tidak Sehat ATAU avg PM2.5 > 55.0
   */
  getHotspotAnalysis() {
    const results = [];
    for (const st of this.stations) {
      const hist = this.history[st.id] || [];
      const totalPoints = hist.length || 1;
      let unhealthyCount = 0;
      let sumPm25 = 0;
      let maxVal = -1;
      let peakHour = '-';

      for (const p of hist) {
        sumPm25 += p.pm25;
        if (p.ispu >= 101) {
          unhealthyCount++;
        }
        if (p.pm25 > maxVal) {
          maxVal = p.pm25;
          peakHour = p.label;
        }
      }

      const avgPm25 = parseFloat((sumPm25 / totalPoints).toFixed(1));
      const pctUnhealthy = Math.round((unhealthyCount / totalPoints) * 100);

      let status = 'Terkendali';
      let badgeClass = 'bg-tertiary-fixed text-on-tertiary-fixed';
      if (pctUnhealthy >= 30 || avgPm25 >= 55.0) {
        status = 'Hotspot Aktif';
        badgeClass = 'bg-error-container text-on-error-container font-bold';
      } else if (pctUnhealthy >= 15 || avgPm25 >= 35.0) {
        status = 'Perlu Dipantau';
        badgeClass = 'bg-secondary-fixed text-on-secondary-fixed';
      }

      results.push({
        stationId: st.id,
        name: st.name,
        code: st.code,
        avgPm25,
        pctUnhealthy,
        peakHour,
        maxPm25: maxVal,
        status,
        badgeClass
      });
    }

    return results;
  }
}

// Global store instance
window.airSenseStore = new AirSenseStore();

