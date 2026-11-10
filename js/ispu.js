/**
 * AirSense City - ISPU Engine & Health Advisory
 * Sesuai Standar ISPU Indonesia (Permen LHK No. 14 Tahun 2020 / SNI 19-4102-1996)
 * Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom
 */

const ISPU_BREAKPOINTS = {
  pm25: [
    { concLow: 0.0, concHigh: 15.5, indexLow: 0, indexHigh: 50, category: 'baik' },
    { concLow: 15.6, concHigh: 55.4, indexLow: 51, indexHigh: 100, category: 'sedang' },
    { concLow: 55.5, concHigh: 150.4, indexLow: 101, indexHigh: 200, category: 'tidak-sehat' },
    { concLow: 150.5, concHigh: 250.4, indexLow: 201, indexHigh: 300, category: 'sangat-tidak-sehat' },
    { concLow: 250.5, concHigh: 500.0, indexLow: 301, indexHigh: 500, category: 'berbahaya' }
  ],
  pm10: [
    { concLow: 0.0, concHigh: 50.0, indexLow: 0, indexHigh: 50, category: 'baik' },
    { concLow: 51.0, concHigh: 150.0, indexLow: 51, indexHigh: 100, category: 'sedang' },
    { concLow: 151.0, concHigh: 350.0, indexLow: 101, indexHigh: 200, category: 'tidak-sehat' },
    { concLow: 351.0, concHigh: 420.0, indexLow: 201, indexHigh: 300, category: 'sangat-tidak-sehat' },
    { concLow: 421.0, concHigh: 600.0, indexLow: 301, indexHigh: 500, category: 'berbahaya' }
  ]
};

/**
 * Hitung sub-indeks ISPU untuk konsentrasi polutan tertentu
 */
function calculateSubIndex(param, concentration) {
  const table = ISPU_BREAKPOINTS[param];
  if (!table) return 0;
  const conc = Math.max(0, concentration);

  for (const b of table) {
    if (conc <= b.concHigh) {
      const ispu = ((b.indexHigh - b.indexLow) / (b.concHigh - b.concLow)) * (conc - b.concLow) + b.indexLow;
      return Math.round(ispu);
    }
  }

  // Konsentrasi di atas batas tertinggi
  const last = table[table.length - 1];
  const ispu = ((last.indexHigh - last.indexLow) / (last.concHigh - last.concLow)) * (conc - last.concLow) + last.indexLow;
  return Math.min(500, Math.round(ispu));
}

/**
 * Tentukan status dan token desain dari nilai ISPU
 * Mengikuti tabel Bagian 3 SKILL.md
 */
function getISPUStatus(ispuValue) {
  const v = Math.round(ispuValue);
  if (v <= 50) {
    return {
      key: 'baik',
      label: 'Baik',
      range: '0 - 50',
      description: 'Tingkat kualitas udara sangat baik, tidak memberikan efek negatif bagi manusia, hewan, dan tumbuhan.',
      subtext: 'Aman untuk beraktivitas',
      textClass: 'text-tertiary-container',
      labelClass: 'text-tertiary',
      pillClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
      borderClass: 'border-tertiary',
      strokeColor: '#005036',
      icon: 'eco',
      maskAdvise: 'Tidak wajib bagi warga sehat',
      ventilationAdvise: 'Buka jendela, sirkulasi udara bersih',
      outdoorAdvise: 'Sangat direkomendasikan untuk berolahraga'
    };
  } else if (v <= 100) {
    return {
      key: 'sedang',
      label: 'Sedang',
      range: '51 - 100',
      description: 'Kualitas udara masih dapat diterima, namun kelompok sensitif disarankan memperhatikan gejala.',
      subtext: 'Dapat diterima masyarakat',
      textClass: 'text-secondary',
      labelClass: 'text-secondary',
      pillClass: 'bg-secondary-fixed text-on-secondary-fixed',
      borderClass: 'border-secondary',
      strokeColor: '#4059aa',
      icon: 'cloud',
      maskAdvise: 'Disarankan untuk kelompok sensitif',
      ventilationAdvise: 'Ventilasi normal di luar jam sibuk lalu lintas',
      outdoorAdvise: 'Aktivitas luar ruang dapat dilanjutkan secara normal'
    };
  } else if (v <= 200) {
    return {
      key: 'tidak-sehat',
      label: 'Tidak Sehat',
      range: '101 - 200',
      description: 'Kualitas udara merugikan manusia atau kelompok hewan yang sensitif atau dapat menimbulkan kerusakan pada tumbuhan.',
      subtext: 'Kelompok sensitif terdampak',
      textClass: 'text-error',
      labelClass: 'text-error',
      pillClass: 'bg-error-container text-on-error-container',
      borderClass: 'border-error',
      strokeColor: '#ba1a1a',
      icon: 'crisis_alert',
      maskAdvise: 'Wajib masker medis / N95 bila keluar ruangan',
      ventilationAdvise: 'Tutup jendela dan nyalakan penjernih udara (air purifier)',
      outdoorAdvise: 'Kurangi aktivitas fisik berat di luar ruang'
    };
  } else if (v <= 300) {
    return {
      key: 'sangat-tidak-sehat',
      label: 'Sangat Tidak Sehat',
      range: '201 - 300',
      description: 'Kualitas udara dapat meningkatkan risiko penyakit pada sejumlah segmen populasi yang terpapar.',
      subtext: 'Risiko kesehatan serius',
      textClass: 'text-error',
      labelClass: 'text-error',
      pillClass: 'bg-error text-on-error',
      borderClass: 'border-error',
      strokeColor: '#93000a',
      icon: 'health_and_safety',
      maskAdvise: 'Wajib masker respirator standar N95 / KN95',
      ventilationAdvise: 'Tutup rapat semua ventilasi dan jendela',
      outdoorAdvise: 'Hindari segala aktivitas di luar ruangan yang tidak perlu'
    };
  } else {
    return {
      key: 'berbahaya',
      label: 'Berbahaya',
      range: '> 300',
      description: 'Kualitas udara berbahaya secara umum dan dapat menimbulkan dampak kesehatan serius bagi seluruh populasi.',
      subtext: 'Darurat kesehatan masyarakat',
      textClass: 'text-on-surface-variant',
      labelClass: 'text-error',
      pillClass: 'bg-on-surface-variant text-surface',
      borderClass: 'border-outline',
      strokeColor: '#213145',
      icon: 'health_and_safety',
      maskAdvise: 'Wajib respirator kedap udara',
      ventilationAdvise: 'Evakuasi ke ruang isolasi berfilter HEPA',
      outdoorAdvise: 'Dilarang beraktivitas di luar ruangan (ikuti protokol BPBD/DLH)'
    };
  }
}

/**
 * Hitung offset cincin ISPU SVG
 * Rumus SKILL.md Bagian 6 & 9: dashoffset = 264 * (1 - min(ISPU, 200) / 200)
 */
function calculateRingOffset(ispu) {
  const clamped = Math.min(Math.max(0, ispu), 200);
  return Math.round(264 * (1 - clamped / 200));
}

// Export for module or global use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateSubIndex, getISPUStatus, calculateRingOffset, ISPU_BREAKPOINTS };
}

