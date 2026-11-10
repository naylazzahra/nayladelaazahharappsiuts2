---
name: airsense-city-design
description: "Design system \"AirSense City\" untuk Sistem Monitoring Kualitas Udara Perkotaan Bandar Lampung (kolaborasi Pemkot Bandar Lampung & Universitas Teknokrat Indonesia). Gunakan skill ini setiap kali membuat, mengubah, atau mereview UI/halaman/komponen untuk proyek ini: Dashboard, Peta, Analitik, Peringatan, Rekomendasi, Tentang, Login, kartu titik pantau, kartu ISPU, banner peringatan, selector stasiun, atau layar baru apa pun. Gunakan juga kalau user menyebut \"AirSense\", \"dashboard ISPU\", \"monitoring kualitas udara\", \"samakan dengan desain Stitch\", atau minta kode HTML/Tailwind/React yang harus konsisten dengan dashboard yang sudah ada, walaupun user tidak menyebut nama skill ini. Own the look: biru teal pemerintahan, Inter, kartu putih di atas latar biru-es, tanpa border tebal."
---

# AirSense City: Design System

Gaya: **dashboard pemerintahan yang bersih dan terbaca cepat**. Latar biru-es sangat muda, kartu putih, aksen teal gelap, status warna dipakai hanya untuk menyampaikan kualitas udara. Satu keluarga font (Inter), hierarki dibangun dari ukuran dan bobot, bukan dari dekorasi.

Sumber: halaman Dashboard hasil Stitch (header global, banner peringatan, 4 kartu sebaran ISPU, fokus stasiun, wilayah terbersih/terpapar, daftar 5 titik pantau, footer). Skill ini mengunci token, komponen, dan aturan supaya layar baru terlihat satu keluarga.

## 1. Kapan dan bagaimana memakai skill ini

1. Baca seluruh skill ini sebelum menulis kode UI.
2. Pakai token di Bagian 4 apa adanya. Jangan mengarang warna, font, atau radius baru.
3. Bangun dari app shell (Bagian 5) dan komponen (Bagian 6). Komponen baru diturunkan dari pola yang ada.
4. Cek checklist Bagian 9 sebelum selesai.

Konteks produk (supaya teks UI masuk akal):
- Pengguna: warga (membaca status dan rekomendasi), petugas Dinas Lingkungan Hidup (memantau, menganalisis, melihat peringatan).
- Wilayah: Kota Bandar Lampung. Lima titik pantau: Pusat Kota (Tanjung Karang), Area Kampus (Kedaton - UTI), Kawasan Industri (Panjang), Area Permukiman (Kemiling), Kawasan Transportasi (Rajabasa).
- Perangkat: sensor IoT mikrokontroler (PMS7003 untuk partikulat, MQ136), protokol MQTT / LoRaWAN.
- Standar acuan yang tampil di UI: ISPU, SNI 19-4102-1996 / KLHK.
- Semua teks UI **berbahasa Indonesia**.

## 2. Aturan wajib (non-negotiable)

1. **Badge "Data Simulasi" selalu tampil** di header halaman selama datanya belum telemetri nyata (pill `bg-surface-variant text-on-secondary-fixed` dengan titik berdenyut `animate-ping`). Jangan menyajikan angka simulasi seolah data resmi.
2. **Light theme saja.** `darkMode: "class"` ada di config tetapi tidak ada layar dark.
3. **Satu font: Inter.** Tidak ada serif, tidak ada font display lain.
4. **Warna status ISPU hanya dipakai untuk status.** Jangan memakai hijau/biru/merah status sebagai dekorasi.
5. **Kartu tanpa border tebal dan tanpa bayangan tebal.** Pemisahan lewat lapisan warna (tonal layering) dan `shadow-sm`; hover boleh `shadow-md`. Satu-satunya border aksen adalah `border-l-4` pada kartu titik pantau.
6. **Dilarang**: gradien ungu, neon, glassmorphism (kecuali `backdrop-blur` tipis pada header), bayangan tebal, emoji sebagai ikon.
7. **Ikon hanya Material Symbols Outlined.** Ikon status memakai `font-variation-settings: 'FILL' 1`.
8. **Footer wajib**: "Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom" dan baris "Kolaborasi Pemerintah Kota Bandar Lampung & Universitas Teknokrat Indonesia".
9. **Header wajib memuat dua logo** (Pemkot Bandar Lampung dan Universitas Teknokrat Indonesia) + nama "AirSense City".
10. Data yang belum ada ditandai belum ada ("Belum tersedia"), bukan diisi perkiraan.
11. Rekomendasi kesehatan memakai bahasa saran ("disarankan", "dapat"), bukan klaim medis atau perintah.

## 3. Kategori ISPU dan pemetaannya ke warna

| Kategori | Rentang | Teks / angka | Pill / latar ikon | Border kartu | Ikon |
| --- | --- | --- | --- | --- | --- |
| Baik | 0-50 | `text-tertiary-container` (angka), `text-tertiary` (label) | `bg-tertiary-fixed text-on-tertiary-fixed` | `border-tertiary` | `eco` |
| Sedang | 51-100 | `text-secondary` | `bg-secondary-fixed text-on-secondary-fixed` | `border-secondary` | `cloud` |
| Tidak Sehat | 101-200 | `text-error` | `bg-error-container text-on-error-container` | `border-error` | `crisis_alert` |
| Sangat Tidak Sehat / Berbahaya | >200 | `text-on-surface-variant` | `bg-surface-container-high text-on-surface-variant` | `border-outline` | `health_and_safety` |

Catatan: pada desain ini "Sedang" memakai biru (`secondary`), bukan kuning. Pertahankan, jangan "memperbaiki" ke kuning supaya konsisten dengan layar lain.

Baku mutu yang tampil di kartu parameter: PM2.5 batas aman **55.0 µg/m³**, PM10 batas aman **75.0 µg/m³** (label kecil `text-secondary font-semibold`).

Penerjemah status dari nilai ISPU:

```js
const status = (v) =>
  v <= 50  ? { label: 'Baik',        key: 'baik' } :
  v <= 100 ? { label: 'Sedang',      key: 'sedang' } :
  v <= 200 ? { label: 'Tidak Sehat', key: 'tidak-sehat' } :
             { label: 'Sangat Tidak Sehat', key: 'sangat-buruk' };
```

## 4. Design tokens

### 4.1 Warna (Material 3 style, dipakai lewat nama token Tailwind)

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `surface` / `background` / `surface-bright` | `#f8f9ff` | Latar halaman |
| `surface-container-lowest` | `#ffffff` | Semua kartu, header, footer |
| `surface-container-low` | `#eff4ff` | Sumur (well) dalam kartu: ringkasan angka, kartu mini di dalam kartu |
| `surface-container` | `#e5eeff` | Sumur parameter (PM2.5, PM10, suhu, dst.) |
| `surface-container-high` | `#dce9ff` | Hover item nav, pill netral, input select |
| `surface-container-highest` / `surface-variant` | `#d3e4fe` | Track ring, badge "Data Simulasi" |
| `primary` | `#003441` | Judul halaman/kartu, hover tombol primer |
| `primary-container` | `#0f4c5c` | Tombol primer, item nav aktif, kartu info gelap |
| `on-primary` / `on-primary-container` | `#ffffff` / `#87bbce` | Teks di atas primary / teks sekunder di kartu gelap |
| `secondary` | `#4059aa` | Status Sedang, aksen ikon, fokus ring |
| `secondary-fixed` / `on-secondary-fixed` | `#dce1ff` / `#00164e` | Pill Sedang |
| `tertiary` / `tertiary-container` | `#003724` / `#005036` | Status Baik (label / angka) |
| `tertiary-fixed` / `on-tertiary-fixed` | `#85f8c4` / `#002114` | Pill Baik |
| `tertiary-fixed-dim` / `on-tertiary-fixed-variant` | `#68dba9` / `#005137` | Pill persentase wilayah Baik |
| `error` / `on-error` | `#ba1a1a` / `#ffffff` | Status Tidak Sehat, ikon peringatan |
| `error-container` / `on-error-container` | `#ffdad6` / `#93000a` | Banner peringatan, pill Tidak Sehat |
| `on-surface` / `on-background` | `#0b1c30` | Teks utama |
| `on-surface-variant` | `#40484b` | Teks sekunder, keterangan |
| `outline` / `outline-variant` | `#70787c` / `#c0c8cb` | Ikon redup, pemisah vertikal tipis |

Token lain di config (`inverse-*`, `*-fixed-dim`, `surface-dim`, `surface-tint`) boleh dipakai bila perlu, tetap dari config yang sama.

Opacity yang dipakai: header `bg-surface-container-lowest/95`, pemisah `border-outline-variant/30`, overlay gradien foto `from-primary/80`.

### 4.2 Tipografi (Inter saja)

| Token Tailwind | Ukuran / line-height | Weight | Pemakaian |
| --- | --- | --- | --- |
| `text-metric-huge` | 44/48, -0.03em | 800 | Angka ISPU besar di kartu |
| `text-metric-huge-mobile` | 34/38 | 800 | Versi mobile angka hero |
| `text-metric-lg` | 32/36 | 700 | Nilai PM2.5 di kartu wilayah terbersih/terpapar |
| `text-display-hero` | 48/56, -0.03em | 800 | Hero halaman (jarang) |
| `text-headline-xl` | 36/44 | 700 | Judul halaman (H1) |
| `text-headline-xl-mobile` | 28/34 | 700 | H1 mobile |
| `text-headline-lg` | 28/36 | 700 | Angka kartu mini (THI, UVI) |
| `text-headline-md` | 20/28 | 600 | Judul section/kartu, nilai parameter |
| `text-body-lg` | 16/24 | 400 | Teks pengantar |
| `text-body-md` | 14/20 | 400 | Isi |
| `text-body-sm` | 13/18 | 400 | Keterangan, meta |
| `text-label-bold` | 12/16, 0.04em | 700 | Tombol, pill, nav, judul kecil kapital |
| `text-label-sm` | 11/14, 0.02em | 600 | Meta kecil, sync time |

Selalu pasangkan kelas `font-*` dan `text-*` dengan nama yang sama (`font-headline-md text-headline-md`) seperti pada desain sumber. Angka besar memakai `leading-none`.

### 4.3 Spacing, radius, bayangan

Spacing kustom: `space-2xs` 0.25rem, `space-xs` 0.5rem, `space-sm` 0.75rem, `space-md` 1rem, `space-lg` 1.5rem, `space-xl` 2rem, `space-2xl` 3rem, `gutter` 1.25rem, `gutter-desktop` 1.5rem, `margin` 1rem, `margin-desktop` 2rem.

Radius: `rounded-lg` 0.5rem (tombol, sumur, input), `rounded-xl` 0.75rem (kartu), `rounded-full` (pill, ikon bulat). Tidak ada radius 20px.

Bayangan: `shadow-sm` untuk kartu dan tombol, `hover:shadow-md` untuk kartu interaktif, `shadow-[0_1px_8px_rgba(0,0,0,0.04)]` untuk header, `shadow-[0_-1px_6px_rgba(0,0,0,0.03)]` untuk footer.

### 4.4 Setup Tailwind + font (wajib di `<head>`)

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com"></script>
<script id="tailwind-config">
tailwind.config = {
  darkMode: "class",
  theme: { extend: {
    colors: {
      "surface":"#f8f9ff","background":"#f8f9ff","surface-bright":"#f8f9ff","surface-dim":"#cbdbf5",
      "surface-container-lowest":"#ffffff","surface-container-low":"#eff4ff","surface-container":"#e5eeff",
      "surface-container-high":"#dce9ff","surface-container-highest":"#d3e4fe","surface-variant":"#d3e4fe",
      "surface-tint":"#306576","on-surface":"#0b1c30","on-background":"#0b1c30","on-surface-variant":"#40484b",
      "outline":"#70787c","outline-variant":"#c0c8cb",
      "primary":"#003441","on-primary":"#ffffff","primary-container":"#0f4c5c","on-primary-container":"#87bbce",
      "primary-fixed":"#b6ebfe","primary-fixed-dim":"#9acee1","on-primary-fixed":"#001f28","on-primary-fixed-variant":"#114d5d",
      "inverse-primary":"#9acee1","inverse-surface":"#213145","inverse-on-surface":"#eaf1ff",
      "secondary":"#4059aa","on-secondary":"#ffffff","secondary-container":"#8fa7fe","on-secondary-container":"#1d3989",
      "secondary-fixed":"#dce1ff","secondary-fixed-dim":"#b6c4ff","on-secondary-fixed":"#00164e","on-secondary-fixed-variant":"#264191",
      "tertiary":"#003724","on-tertiary":"#ffffff","tertiary-container":"#005036","on-tertiary-container":"#53c896",
      "tertiary-fixed":"#85f8c4","tertiary-fixed-dim":"#68dba9","on-tertiary-fixed":"#002114","on-tertiary-fixed-variant":"#005137",
      "error":"#ba1a1a","on-error":"#ffffff","error-container":"#ffdad6","on-error-container":"#93000a"
    },
    borderRadius: { DEFAULT:"0.25rem", lg:"0.5rem", xl:"0.75rem", full:"9999px" },
    spacing: {
      "space-2xs":"0.25rem","space-xs":"0.5rem","space-sm":"0.75rem","space-md":"1rem","space-lg":"1.5rem",
      "space-xl":"2rem","space-2xl":"3rem","margin":"1rem","margin-desktop":"2rem","gutter":"1.25rem","gutter-desktop":"1.5rem"
    },
    fontFamily: {
      "display-hero":["Inter"],"headline-xl":["Inter"],"headline-xl-mobile":["Inter"],"headline-lg":["Inter"],
      "headline-md":["Inter"],"body-lg":["Inter"],"body-md":["Inter"],"body-sm":["Inter"],
      "label-bold":["Inter"],"label-sm":["Inter"],"metric-huge":["Inter"],"metric-huge-mobile":["Inter"],"metric-lg":["Inter"]
    },
    fontSize: {
      "display-hero":["48px",{lineHeight:"56px",letterSpacing:"-0.03em",fontWeight:"800"}],
      "headline-xl":["36px",{lineHeight:"44px",letterSpacing:"-0.025em",fontWeight:"700"}],
      "headline-xl-mobile":["28px",{lineHeight:"34px",letterSpacing:"-0.02em",fontWeight:"700"}],
      "headline-lg":["28px",{lineHeight:"36px",letterSpacing:"-0.02em",fontWeight:"700"}],
      "headline-md":["20px",{lineHeight:"28px",letterSpacing:"-0.015em",fontWeight:"600"}],
      "body-lg":["16px",{lineHeight:"24px",fontWeight:"400"}],
      "body-md":["14px",{lineHeight:"20px",fontWeight:"400"}],
      "body-sm":["13px",{lineHeight:"18px",fontWeight:"400"}],
      "label-bold":["12px",{lineHeight:"16px",letterSpacing:"0.04em",fontWeight:"700"}],
      "label-sm":["11px",{lineHeight:"14px",letterSpacing:"0.02em",fontWeight:"600"}],
      "metric-huge":["44px",{lineHeight:"48px",letterSpacing:"-0.03em",fontWeight:"800"}],
      "metric-huge-mobile":["34px",{lineHeight:"38px",letterSpacing:"-0.02em",fontWeight:"800"}],
      "metric-lg":["32px",{lineHeight:"36px",letterSpacing:"-0.02em",fontWeight:"700"}]
    }
  } }
};
</script>
<style>
  @layer base { html,body{margin:0;padding:0;} body{overscroll-behavior:none;} }
  ::-webkit-scrollbar{display:none;}
</style>
```

`<body class="bg-surface font-body-md text-on-surface antialiased">`

## 5. App shell

### Header (fixed, tinggi 80px)
- `header.fixed.top-0.w-full.z-50.bg-surface-container-lowest/95.backdrop-blur-md` + bayangan header (Bagian 4.3). Isi: `h-20 px-gutter-desktop flex items-center justify-between`.
- Kiri: dua logo `w-10 h-10 object-contain` (Pemkot, UTI), pemisah vertikal `h-9 w-px bg-outline-variant`, lalu nama "AirSense City" (`font-headline-md text-headline-md text-primary tracking-tight leading-none`) dan subjudul "Sistem Monitoring Kualitas Udara Perkotaan" (`font-label-sm text-on-surface-variant mt-0.5`).
- Kanan: nav + tombol **Login** + avatar `w-8 h-8 rounded-full object-cover`.
- Nav (`hidden xl:flex`): Dashboard, Peta, Analitik, Peringatan, Rekomendasi, Tentang. Item = `px-space-sm py-space-xs rounded-lg font-label-bold transition-colors`. **Aktif**: `bg-primary-container text-on-primary shadow-sm` + `aria-current="page"`. Tidak aktif: `text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface`. Tiap tautan punya `data-path`.
- Tombol Login: `px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-bold hover:bg-primary shadow-sm`.

### Main
- `main.w-full.pt-20.bg-surface` (pt-20 mengganti tinggi header).
- Kontainer: `w-full px-gutter-desktop py-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto`.

### Footer
`footer.w-full.bg-surface-container-lowest.py-space-lg` + bayangan footer; konten di tengah: baris copyright `font-body-sm text-on-surface`, baris kolaborasi `font-label-sm text-on-surface-variant`.

## 6. Komponen

### Judul halaman + status
- H1 `font-headline-xl text-headline-xl text-primary tracking-tight`, diikuti badge **Data Simulasi** dan pill standar (`px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm`, isi "SNI 19-4102-1996 / KLHK").
- Baris meta di bawah: ikon `schedule` 18px + "Diperbarui: {relatif} ({jam} WIB)" + titik pemisah `text-outline-variant` + nama stasiun pusat, `font-body-md text-on-surface-variant`.
- Kanan (`md:items-end`): tombol sekunder **Segarkan** (`bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-high`, ikon `autorenew` berputar `animate-spin` 800ms saat diklik) dan tombol primer **Unduh Laporan Harian (PDF)** (`bg-primary-container text-on-primary hover:bg-primary`, ikon `download`). Satu tombol primer per area aksi.

### Banner peringatan kota
`rounded-xl bg-error-container text-on-error-container shadow-sm p-space-md` flex. Kiri: kotak ikon `w-10 h-10 rounded-lg bg-error text-on-error` (ikon `warning` 24px). Kicker `label-bold uppercase tracking-wider text-error` "Peringatan Kualitas Udara Kota" + chip `TINGGI` (`bg-error text-on-error rounded`). Isi: nama wilayah dan kategori dalam `<strong>`, lalu saran untuk kelompok sensitif. Kanan: tautan "Lihat Lokasi →" (`hover:underline`, anchor ke `#lokasi-pantau`). Tampil hanya bila ada titik ≥ Tidak Sehat.

### Kartu sebaran ISPU (4 kartu, `grid sm:grid-cols-2 lg:grid-cols-4 gap-space-md`)
- Dasar: `bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between transition-all hover:shadow-md`.
- Atas: kicker kategori `label-bold uppercase` (warna kategori, mis. "Baik (0 - 50)") + subteks `body-sm` ("Aman untuk beraktivitas", "Dapat diterima masyarakat", "Kelompok sensitif terdampak", "Risiko kesehatan serius"); kanan lingkaran ikon 40px sesuai tabel Bagian 3.
- Tengah (`mt-space-md flex items-baseline justify-between`): angka `metric-huge leading-none` + satuan "Titik" (`headline-md font-normal text-on-surface-variant`); kanan pill persentase "{n}% Wilayah" (kartu kosong: pill netral "Kondisi Terkendali").
- Bawah: sumur `bg-surface-container-low rounded-lg p-space-xs body-sm` berisi nama stasiun dan nilai ("Kemiling (38) • Kedaton (42)"). Kartu Tidak Sehat memakai angka `text-error`.
- Persentase wilayah = jumlah titik / total titik aktif.

### Fokus pemantauan wilayah (kartu besar kiri, `lg:col-span-7`)
- Kartu `bg-surface-container-lowest rounded-xl p-space-lg shadow-sm gap-space-md`.
- Header: kicker `label-bold uppercase text-primary tracking-wide` "Fokus Pemantauan Wilayah" + keterangan; kanan `<select>` (`min-w-[240px] bg-surface-container-low font-label-bold px-space-sm py-2 rounded-lg appearance-none focus:ring-2 focus:ring-primary-container shadow-sm`) dengan ikon `arrow_drop_down` absolut. Opsi = lima stasiun. Mengubah pilihan memperbarui ISPU, status, PM2.5, PM10, suhu, kelembapan, parameter dominan, angin, dan cincin.
- **Sorotan ISPU** (`bg-surface-container-low rounded-xl p-space-md`): kiri cincin `w-28 h-28` + status pill + deskripsi; kanan blok sensor (`sm:border-l border-outline-variant/30`) berisi "Sensor Telemetri", nama sensor `headline-md text-primary font-bold`, dan indikator sinyal (titik 8px `bg-tertiary` + "Sinyal Optimal").
- **Cincin ISPU**: SVG `viewBox 0 0 100 100`, `-rotate-90`, dua `circle` r=42, stroke-width 10; track `text-surface-variant`, isi `text-secondary` (ganti warna sesuai kategori), `stroke-dasharray="264"`, `stroke-linecap="round"`, `transition-all duration-700 ease-out`. Nilai ISPU `metric-huge` di tengah + "ISPU" `label-sm font-bold`. Rumus: `dashoffset = 264 × (1 − min(ISPU, 200) / 200)`.
- **Grid parameter** (`grid-cols-2 sm:grid-cols-3 gap-space-xs`), enam sumur `bg-surface-container rounded-lg p-space-sm`: label `label-sm text-on-surface-variant`, nilai `headline-md font-bold mt-1`, keterangan `label-sm`. Isi: Partikulat PM2.5 ("Batas Aman 55.0"), Partikulat PM10 ("Batas Aman 75.0"), Suhu Udara, Kelembapan Nisbi, Parameter Dominan ("Pencemar Kritis" `text-error`), Kecepatan & Arah Angin.
- Format nilai: `28.4 µg/m³`, `31.5 °C`, `68 %`, `12 km/j BD`. Arah angin disingkat bahasa Indonesia: U, TL, T, TG, S, BD, B, BL.

### Kartu Rekomendasi Tindakan Warga
Kartu putih `rounded-xl p-space-md shadow-sm`, header ikon `health_and_safety` + judul `headline-md text-primary`, paragraf `body-md text-on-surface-variant`, lalu tiga sel `bg-surface-container-low rounded-lg p-space-xs` (ikon `secondary` 20px + judul `label-bold` + keterangan `body-sm`): Pakai Masker (`masks`), Ventilasi Ruangan (`window`), Olahraga Luar Ruang (`fitness_center`). Isi saran harus mengikuti kategori ISPU stasiun yang dipilih.

### Kartu Wilayah Terbersih / Paling Terpapar (kolom kanan, `lg:col-span-5`)
- Header: kicker `label-bold uppercase` + ikon 18px (`verified` hijau `text-tertiary`, `report_problem` merah `text-error`) dan pill "ISPU {n} • {kategori}".
- Baris isi: nama (`headline-md text-primary`) + lokasi (`body-sm`) di kiri; kanan nilai PM2.5 `metric-lg font-extrabold leading-none` (hijau `text-tertiary-container` atau merah `text-error`) dengan label "PM2.5 (µg/m³)".
- Thumbnail foto `h-24 rounded-lg overflow-hidden relative`, overlay `bg-gradient-to-t from-primary/80 via-transparent to-transparent` dengan keterangan putih `label-sm` di kiri bawah. Teks alt/`data-alt` deskriptif.
- Pasangan kartu mini (`grid-cols-2 gap-space-sm`): Indeks Termal (THI, ikon `thermostat`) dan Radiasi Sinar UV (UVI, ikon `wb_sunny`): label kiri, ikon `secondary`, angka `headline-lg font-bold`, status `label-sm text-secondary font-semibold`.

### Kartu titik pantau (`#lokasi-pantau`, grid `md:grid-cols-2 lg:grid-cols-3`)
- Header section: judul `headline-md text-primary` + subjudul "Pemantauan real-time sensor mikrokontroler berbasis IoT di seluruh kecamatan" + catatan "Diurutkan berdasarkan keparahan ISPU".
- Kartu: dasar kartu ISPU + `border-l-4` warna kategori. Baris 1: kicker "Stasiun #0N • {lokasi}" (`label-sm`), judul stasiun (`headline-md`), pill kategori. Baris 2: "ISPU Terhitung" + angka `metric-huge`; kanan "Parameter Dominan" + "PM2.5 (28.4 µg/m³)". Lalu **sparkline** "Tren 6 Jam Terakhir" + "Max: {n}": SVG `viewBox 0 0 100 24`, `h-8`, path stroke 2.5 dengan warna kategori + titik akhir r=3.5. Lalu sumur `bg-surface-container-low rounded-lg` dua kolom (PM10, Suhu). Footer: "Sinkronisasi: {n} mnt lalu" kiri, tautan "Detail →" `text-primary font-semibold hover:underline` kanan (kartu Tidak Sehat: "Peringatan Aktif" `text-error`).
- Kartu penutup grid (info jaringan sensor): `bg-primary-container text-on-primary rounded-xl p-space-md`, kicker ikon `sensors`, judul "Perluasan Titik Pantau Kota", teks `text-on-primary-container`, footer "Protokol MQTT / LoRaWAN" + tautan "Peta Lengkap ›".

### Data stasiun acuan (data simulasi; ISPU memakai PM2.5 sebagai parameter dominan)

| # | Stasiun | ISPU | Kategori | PM2.5 | PM10 | Suhu | RH | Angin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Pusat Kota (Tanjung Karang) | 76 | Sedang | 28.4 | 45.2 | 31.5 | 68 | 12 km/j BD |
| 02 | Area Kampus (Kedaton - UTI) | 42 | Baik | 14.1 | 22.0 | 30.2 | 72 | 8 km/j T |
| 03 | Kawasan Industri (Panjang) | 138 | Tidak Sehat | 58.7 | 89.4 | 33.1 | 61 | 16 km/j S |
| 04 | Area Permukiman (Kemiling) | 38 | Baik | 11.2 | 19.5 | 28.9 | 78 | 6 km/j B |
| 05 | Kawasan Transportasi (Rajabasa) | 84 | Sedang | 32.6 | 51.0 | 32.0 | 65 | 14 km/j TL |

Pakai tabel ini sebagai data contoh bila user tidak memberi data lain, dan tetap tampilkan badge Data Simulasi.

## 7. Pola per layar

| Layar | Struktur |
| --- | --- |
| Dashboard | Judul + badge + aksi, banner peringatan, 4 kartu sebaran ISPU, split 7/5 (fokus stasiun + rekomendasi | terbersih + terpapar + THI/UV), daftar titik pantau |
| Peta | Peta penuh di bawah header; marker per stasiun diwarnai kategori ISPU; panel detail stasiun di samping memakai komponen sorotan ISPU + grid parameter |
| Analitik | Filter periode/stasiun di atas, kartu grafik tren (garis, warna kategori), perbandingan antar stasiun, tabel ringkasan; gaya sparkline diperbesar |
| Peringatan | Daftar banner peringatan (pola banner Bagian 6) berurut keparahan + riwayat dalam tabel |
| Rekomendasi | Kartu tiga sel rekomendasi per kategori ISPU (Baik, Sedang, Tidak Sehat, Sangat Tidak Sehat), kelompok sensitif disorot |
| Tentang | Penjelasan sistem, sensor, standar ISPU, kolaborasi Pemkot dan UTI, memakai kartu putih + kartu info gelap `primary-container` |
| Login | Kartu form di tengah di atas `bg-surface`, tombol primer tunggal, input `bg-surface-container-low rounded-lg focus:ring-2 focus:ring-primary-container` |

Layar baru: mulai dari app shell (Bagian 5), pilih pola terdekat, rakit dari komponen Bagian 6.

## 8. Konten dan copywriting

- Bahasa Indonesia ringkas, formal-teknis, ramah warga. Label tombol memakai kata kerja: "Segarkan", "Unduh", "Lihat Lokasi".
- Waktu: "Diperbarui: 15 Menit Lalu (14:30 WIB)". Selalu sebut zona WIB.
- Satuan: `µg/m³`, `°C`, `%`, `km/j`, `UVI`. Desimal pakai titik seperti desain sumber (`28.4`); konsisten dalam satu layar.
- Istilah: ISPU, titik pantau, stasiun telemetri, parameter dominan, kelompok sensitif.
- Jangan menulis klaim medis atau jaminan keamanan. Pakai "disarankan", "dapat diterima", "kelompok sensitif terdampak".
- Nama tempat nyata boleh dipakai (Tanjung Karang, Kedaton, Panjang, Kemiling, Rajabasa, Teluk Betung Selatan, Sukarame), tetapi angkanya tetap berlabel simulasi.

## 9. Checklist sebelum selesai

- [ ] Badge "Data Simulasi" tampil bila data bukan telemetri nyata.
- [ ] Hanya token warna di Bagian 4; tidak ada ungu, neon, gradien dekoratif.
- [ ] Semua teks Inter; tidak ada font lain.
- [ ] Kartu `rounded-xl`, `shadow-sm`, tanpa border (kecuali `border-l-4` kartu titik pantau).
- [ ] Warna status konsisten dengan tabel Bagian 3 di pill, angka, ikon, border, dan sparkline.
- [ ] Satu tombol primer (`bg-primary-container`) per area aksi, sisanya sekunder putih.
- [ ] Header memuat dua logo + nav 6 item dengan item aktif benar; footer copyright lengkap.
- [ ] Banner peringatan hanya muncul bila ada stasiun ≥ Tidak Sehat.
- [ ] Rekomendasi sesuai kategori ISPU stasiun yang dipilih.
- [ ] Ring: `dashoffset = 264 × (1 − min(ISPU,200)/200)`.
- [ ] Responsif: nav `hidden xl:flex` harus punya pengganti di layar kecil (tombol menu `menu` membuka panel), grid turun ke 1 kolom, konten lebar scroll di `overflow-x-auto`.
- [ ] Teks UI Indonesia; kontras terjaga (teks `on-*` selalu di atas latar pasangannya).

## 10. Catatan ketidakkonsistenan pada desain sumber (perbaiki saat membangun ulang)

1. **Nilai `stroke-dashoffset` cincin** di desain sumber (190, 270, 80, 285, 165) tidak mengikuti rumus; nilai >264 membuat cincin tampak kosong. Pakai rumus Bagian 6.
2. **Deskripsi kategori Baik**: teks di sorotan ISPU ("berpengaruh pada tumbuhan yang peka") sebenarnya definisi kategori Sedang. Sesuaikan deskripsi dengan kategori terpilih; jangan satu teks untuk semua.
3. **Kartu 4** berlabel "Sangat Buruk (>200)". Sebutan resmi: "Sangat Tidak Sehat" (201-300) dan "Berbahaya" (>300). Pakai istilah resmi.
4. **Standar acuan**: UI menulis SNI 19-4102-1996 / KLHK. ISPU resmi saat ini mengacu pada Permen LHK No. 14 Tahun 2020. Konfirmasi ke dosen pembimbing sebelum mengganti teks di laporan.
5. **Waktu pembaruan**: header "15 Menit Lalu" tetapi sinkronisasi stasiun 1-8 menit. Sinkronkan agar angka tidak saling bertentangan.
6. **Nav tersembunyi di bawah `xl`** tanpa menu pengganti. Tambahkan menu mobile.
7. **Atribut SVG**: `viewbox` huruf kecil di HTML sumber; di JSX/React tulis `viewBox`.
8. **Ukuran hit target**: avatar `w-8 h-8` dan tautan "Detail" kecil; beri area sentuh minimal 40px pada mobile.

## 11. Di luar cakupan skill ini

Halaman Peta (basemap, marker, klaster), grafik Analitik penuh, alur Login/autentikasi, dan notifikasi push belum dirancang di sumber. Kalau diminta, turunkan dari komponen di atas dan patuhi Bagian 2 dan 3.
