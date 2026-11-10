# AirSense City 🌿
### Sistem Monitoring Kualitas Udara Perkotaan & Deteksi Titik Panas Pencemaran (Smart City Bandar Lampung)

Aplikasi web interaktif **AirSense City** dibangun dengan pendekatan *vibe coding* berkinerja tinggi, memadukan **Product Requirements Document (PRD)** dan **Design System SKILL.md** secara 100% presisi dan terverifikasi.

Proyek ini merupakan kolaborasi resmi antara **Pemerintah Kota Bandar Lampung** dan **Universitas Teknokrat Indonesia (UTI)**.
**Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom**

---

## 🚀 Fitur Utama

1. **Dashboard Eksekutif & Publik**:
   - Badge wajib **Data Simulasi** berdenyut (`animate-ping`) sesuai aturan non-negotiable.
   - Header terpadu dengan **Logo Pemerintah Kota Bandar Lampung** dan **Logo Universitas Teknokrat Indonesia (UTI)**.
   - Banner peringatan dinamis (*City Alert Banner*) otomatis aktif saat ISPU ≥ 101.
   - 4 Kartu Distribusi ISPU (*Baik, Sedang, Tidak Sehat, Sangat Tidak Sehat / Berbahaya*).
   - Fokus Stasiun (pilihan 5 stasiun telemetri) dengan cincin ISPU SVG dinamis (`dashoffset = 264 * (1 - min(ISPU, 200)/200)`), status sinyal LoRaWAN, dan grid 6 parameter.
   - Rekomendasi tindakan warga adaptif (*Masker, Ventilasi, Olahraga*).
   - Pasangan kartu Wilayah Terbersih (*Kemiling*) & Paling Terpapar (*Panjang*) lengkap dengan foto lanskap dan indeks THI/UVI.
   - 5 Kartu Titik Pantau berurut keparahan dengan **SVG sparkline tren 6 jam** nyata.

2. **Peta Kualitas Udara Spasial (Leaflet + OpenStreetMap)**:
   - Pemetaan 5 stasiun di Kota Bandar Lampung dengan pin marker berkategori warna ISPU resmi dan efek pulsing.
   - Radius cakupan hotspot dan pop-up interaktif data telemetri.

3. **Analitik & Deteksi Pollution Hotspot (PRD Section 6.5 FR-HOT)**:
   - Grafik tren riwayat 24 jam (Chart.js) dengan garis ambang batas baku mutu (PM2.5: 55 µg/m³, PM10: 75 µg/m³).
   - Perbandingan antar-stasiun dalam grafik batang modern.
   - Algoritma Hotspot Jendela W = 24 jam dengan ambang batas frekuensi P% ≥ 30% dan rata-rata konsentrasi.

4. **Pusat Peringatan Dini (Early Warning Center)**:
   - Log peringatan otomatis dengan status aktif/terselesaikan dan pencatat parameter pemicu polusi.

5. **Simulator Telemetri Virtual IoT (PRD Section 6.7 FR-SIM)**:
   - 5 Skenario siap uji: *Normal, Jam Sibuk / Rush Hour, Polusi Industri Panjang, Penurunan Polusi / Hujan, dan Inversi Suhu*.
   - Slider pengatur konsentrasi manual per stasiun dengan reaktivitas instan ke seluruh antarmuka.

6. **Otentikasi & Switch Role**:
   - Dukungan peran *Publik*, *Petugas Lapangan DLH*, dan *Administrator Sistem*.

7. **Pratinjau & Ekspor Laporan Resmi (PDF / Print-ready)**:
   - Cetak dokumen laporan pemantauan lengkap dengan tabel stasiun dan teks hak cipta mandatori BR-03/BR-04.

---

## 🛠️ Cara Menjalankan

Server lokal telah aktif dan dapat langsung diakses melalui peramban:
- Buka: [http://localhost:3000](http://localhost:3000)

Atau jalankan kembali kapan saja menggunakan:
```bash
npm start
```
atau cukup klik dua kali pada berkas `index.html`.

