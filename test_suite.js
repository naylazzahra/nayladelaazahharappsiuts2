/**
 * AirSense City - Automated Comprehensive Test Suite
 * Validating PRD G6, Section 8, Section 16 & SKILL.md Design System
 * Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom
 */

const fs = require('fs');
const path = require('path');
const { calculateSubIndex, getISPUStatus, calculateRingOffset } = require('./js/ispu.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function assert(condition, testId, description, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    testResults.push({ id: testId, description, status: 'PASSED', details });
    console.log(`[PASS] ${testId}: ${description}`);
  } else {
    failedTests++;
    testResults.push({ id: testId, description, status: 'FAILED', details });
    console.error(`[FAIL] ${testId}: ${description} - ${details}`);
  }
}

function runTestSuite() {
  console.log('===============================================================');
  console.log(' AIRSENSE CITY - AUTOMATED TEST SUITE EXECUTION');
  console.log(' Standards: Permen LHK No. 14 Tahun 2020 / SNI 19-4102-1996');
  console.log(' Copyright©2026 Nayla Dela Azzahra & Dr. Erliyan Redy Susanto');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // CATEGORY 1: ISPU FORMULA & BOUNDARY VALUE TESTING (PRD G6 / Section 8)
  // -------------------------------------------------------------------------
  console.log('--- 1. Pengujian Nilai Batas Formula ISPU (Boundary Test) ---');
  
  // PM2.5 Boundaries
  const pm25Cases = [
    { conc: 0.0, expMin: 0, expMax: 0, cat: 'baik', label: 'Batas Bawah Baik' },
    { conc: 15.5, expMin: 50, expMax: 50, cat: 'baik', label: 'Batas Atas Baik' },
    { conc: 15.6, expMin: 51, expMax: 51, cat: 'sedang', label: 'Batas Bawah Sedang' },
    { conc: 55.4, expMin: 100, expMax: 100, cat: 'sedang', label: 'Batas Atas Sedang' },
    { conc: 55.5, expMin: 101, expMax: 101, cat: 'tidak-sehat', label: 'Batas Bawah Tidak Sehat' },
    { conc: 150.4, expMin: 200, expMax: 200, cat: 'tidak-sehat', label: 'Batas Atas Tidak Sehat' },
    { conc: 150.5, expMin: 201, expMax: 201, cat: 'sangat-tidak-sehat', label: 'Batas Bawah Sangat Tidak Sehat' },
    { conc: 250.4, expMin: 300, expMax: 300, cat: 'sangat-tidak-sehat', label: 'Batas Atas Sangat Tidak Sehat' },
    { conc: 250.5, expMin: 301, expMax: 301, cat: 'berbahaya', label: 'Batas Bawah Berbahaya' },
    { conc: 500.0, expMin: 500, expMax: 500, cat: 'berbahaya', label: 'Batas Maksimum 500' }
  ];

  pm25Cases.forEach((tc, idx) => {
    const ispu = calculateSubIndex('pm25', tc.conc);
    const st = getISPUStatus(ispu);
    const passed = (ispu >= tc.expMin && ispu <= tc.expMax) && (st.key === tc.cat);
    assert(passed, `TC-ISPU-PM25-${idx+1}`, `PM2.5 ${tc.conc} µg/m³ -> ISPU ${ispu} (${st.label}) [Harapan: ${tc.expMin}-${tc.expMax}, ${tc.cat}]`, `Got ${ispu}`);
  });

  // PM10 Boundaries
  const pm10Cases = [
    { conc: 0.0, expMin: 0, expMax: 0, cat: 'baik' },
    { conc: 50.0, expMin: 50, expMax: 50, cat: 'baik' },
    { conc: 51.0, expMin: 51, expMax: 51, cat: 'sedang' },
    { conc: 150.0, expMin: 100, expMax: 100, cat: 'sedang' },
    { conc: 151.0, expMin: 101, expMax: 101, cat: 'tidak-sehat' },
    { conc: 350.0, expMin: 200, expMax: 200, cat: 'tidak-sehat' },
    { conc: 351.0, expMin: 201, expMax: 201, cat: 'sangat-tidak-sehat' },
    { conc: 420.0, expMin: 300, expMax: 300, cat: 'sangat-tidak-sehat' },
    { conc: 421.0, expMin: 301, expMax: 301, cat: 'berbahaya' }
  ];

  pm10Cases.forEach((tc, idx) => {
    const ispu = calculateSubIndex('pm10', tc.conc);
    const st = getISPUStatus(ispu);
    const passed = (ispu >= tc.expMin && ispu <= tc.expMax) && (st.key === tc.cat);
    assert(passed, `TC-ISPU-PM10-${idx+1}`, `PM10 ${tc.conc} µg/m³ -> ISPU ${ispu} (${st.label})`, `Got ${ispu}`);
  });

  // -------------------------------------------------------------------------
  // CATEGORY 2: SVG RING OFFSET CALCULATION (SKILL.md Bagian 6 & 10)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Pengujian Rumus Cincin SVG ISPU ---');
  // Formula: dashoffset = 264 * (1 - min(ISPU, 200)/200)
  assert(calculateRingOffset(0) === 264, 'TC-RING-01', 'ISPU 0 menghasilkan dashoffset 264 (lingkaran kosong)');
  assert(calculateRingOffset(50) === 198, 'TC-RING-02', 'ISPU 50 menghasilkan dashoffset 198 (seperempat)');
  assert(calculateRingOffset(100) === 132, 'TC-RING-03', 'ISPU 100 menghasilkan dashoffset 132 (setengah)');
  assert(calculateRingOffset(200) === 0, 'TC-RING-04', 'ISPU 200 menghasilkan dashoffset 0 (lingkaran penuh)');
  assert(calculateRingOffset(300) === 0, 'TC-RING-05', 'ISPU 300 dibatasi (clamped) pada 0 (tidak negatif/kosong)');

  // -------------------------------------------------------------------------
  // CATEGORY 3: DESIGN TOKENS & MANDATORY ASSETS (BR-01 s.d. BR-07, SKILL.md)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Verifikasi File Aset, Logo, dan Elemen Mandatori ---');
  
  // Check Logo Pemkot & UTI files
  assert(fs.existsSync(path.join(__dirname, 'assets/logo-pemkot.svg')), 'TC-ASSET-01', 'Logo Pemkot Bandar Lampung SVG tersedia');
  assert(fs.existsSync(path.join(__dirname, 'assets/logo-uti.svg')), 'TC-ASSET-02', 'Logo Universitas Teknokrat Indonesia SVG tersedia');
  // Check Official Uploaded Logo Pemkot & UTI files (PRD BR-01 & BR-02)
  const pemkotLogoStat = fs.statSync(path.join(__dirname, 'assets/1794305676149_image.png'));
  const utiLogoStat = fs.statSync(path.join(__dirname, 'assets/IMG_5280.png'));
  assert(pemkotLogoStat.size > 50000, 'TC-ASSET-03', `Logo Resmi Pemkot Bandar Lampung PNG berukuran valid (${pemkotLogoStat.size} bytes)`);
  assert(utiLogoStat.size > 50000, 'TC-ASSET-04', `Logo Resmi Universitas Teknokrat Indonesia PNG berukuran valid (${utiLogoStat.size} bytes)`);
  assert(fs.existsSync(path.join(__dirname, 'assets/kemiling.svg')), 'TC-ASSET-05', 'Ilustrasi lanskap Kemiling tersedia');
  assert(fs.existsSync(path.join(__dirname, 'assets/panjang.svg')), 'TC-ASSET-06', 'Ilustrasi kawasan industri Panjang tersedia');

  // Verify index.html content
  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert(indexHtml.includes('Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom'), 'TC-REQ-BR03', 'Footer memuat teks hak cipta persis BR-03');
  assert(indexHtml.includes('Kolaborasi Pemerintah Kota Bandar Lampung & Universitas Teknokrat Indonesia'), 'TC-REQ-BR03B', 'Footer memuat teks kolaborasi Pemkot & UTI');
  assert(indexHtml.includes('Data Simulasi'), 'TC-REQ-SIM-BADGE', 'Badge Data Simulasi berdenyut hadir di header');
  assert(indexHtml.includes('animate-ping'), 'TC-REQ-PING', 'Efek berdenyut animate-ping terpasang');
  assert(indexHtml.includes('PMS7003'), 'TC-REQ-PMS7003', 'Spesifikasi sensor PMS7003 tercantum');
  assert(indexHtml.includes('MQ136'), 'TC-REQ-MQ136', 'Spesifikasi sensor gas MQ136 tercantum');
  assert(indexHtml.includes('leaflet-map-container'), 'TC-REQ-MAP', 'Container peta Leaflet terpasang');
  assert(indexHtml.includes('modal-report'), 'TC-REQ-REPORT', 'Modal dokumen laporan PDF terpasang');
  assert(indexHtml.includes('modal-station-detail'), 'TC-REQ-DETAIL', 'Modal detail telemetri stasiun terpasang');

  // -------------------------------------------------------------------------
  // CATEGORY 4: REFERENCE DATA & STATIONS VERIFICATION (SKILL.md Bagian 6)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Verifikasi 5 Titik Pantau Acuan Kota Bandar Lampung ---');
  const dataJs = fs.readFileSync(path.join(__dirname, 'js/data.js'), 'utf8');
  const stations = [
    { name: 'Tanjung Karang', expISPU: 76, expCat: 'sedang' },
    { name: 'Kedaton - UTI', expISPU: 42, expCat: 'baik' },
    { name: 'Panjang', expISPU: 138, expCat: 'tidak-sehat' },
    { name: 'Kemiling', expISPU: 38, expCat: 'baik' },
    { name: 'Rajabasa', expISPU: 84, expCat: 'sedang' }
  ];

  stations.forEach(s => {
    assert(dataJs.includes(s.name), `TC-STN-${s.name.replace(/\s+/g,'')}`, `Stasiun pantau ${s.name} terkonfigurasi`);
  });

  // -------------------------------------------------------------------------
  // CATEGORY 5: ENDPOINT & SERVER VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Verifikasi Integritas File Script Aplikasi ---');
  const scripts = ['js/ispu.js', 'js/data.js', 'js/map.js', 'js/charts.js', 'js/app.js', 'server.js'];
  scripts.forEach(sc => {
    const content = fs.readFileSync(path.join(__dirname, sc), 'utf8');
    assert(content.length > 200, `TC-CODE-${sc.replace(/\W/g,'_')}`, `Berkas ${sc} valid dan berukuran ${content.length} bytes`);
  });

  // Summary
  console.log('\n===============================================================');
  console.log(` HASIL PENGUJIAN: ${passedTests} LULUS, ${failedTests} GAGAL (Total: ${totalTests} Kasus Uji)`);
  console.log(` Persentase Keberhasilan: ${((passedTests/totalTests)*100).toFixed(1)}%`);
  console.log('===============================================================');

  return { totalTests, passedTests, failedTests, testResults };
}

if (require.main === module) {
  runTestSuite();
}

module.exports = { runTestSuite };

