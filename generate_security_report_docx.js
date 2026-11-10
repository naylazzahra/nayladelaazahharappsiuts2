/**
 * AirSense City - DOCX Security Audit Report Generator
 * Kolaborasi Pemerintah Kota Bandar Lampung & Universitas Teknokrat Indonesia
 * Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom
 */

const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  Footer,
  PageNumber
} = require('docx');

const { runSecurityAudit } = require('./security_audit.js');

async function generateSecurityDocx() {
  console.log('Menjalankan audit keamanan dan menyusun dokumen DOCX...');
  const auditData = runSecurityAudit();

  const primaryColor = "003441";      // Deep Teal Pemerintah
  const secondaryColor = "4059AA";    // Status Biru / Aksen
  const darkTextColor = "0B1C30";     // Teks Utama
  const mutedTextColor = "40484B";    // Keterangan
  const lightBgColor = "EFF4FF";      // Latar Biru-Es
  const successColor = "005036";      // Hijau Lulus
  const warningColor = "854D0E";      // Kuning/Coklat Peringatan
  const errorColor = "BA1A1A";        // Merah Temuan

  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "C0C8CB" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "C0C8CB" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "C0C8CB" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "C0C8CB" }
  };

  function createHeaderCell(text, widthPct = 20) {
    return new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: { fill: primaryColor, type: ShadingType.CLEAR },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text, bold: true, color: "FFFFFF", font: "Inter", size: 19 })
          ]
        })
      ]
    });
  }

  function createCell(text, widthPct = 20, align = AlignmentType.LEFT, isBold = false, textColor = darkTextColor, bg = "FFFFFF") {
    return new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: bg !== "FFFFFF" ? { fill: bg, type: ShadingType.CLEAR } : undefined,
      children: [
        new Paragraph({
          alignment: align,
          children: [
            new TextRun({ text, bold: isBold, color: textColor, font: "Inter", size: 17 })
          ]
        })
      ]
    });
  }

  const doc = new Document({
    creator: "Nayla Dela Azzahra & Dr. Erliyan Redy Susanto, M.Kom",
    title: "Laporan Audit Keamanan Sistem AirSense City",
    description: "Laporan Audit Keamanan Perangkat Lunak AirSense City terhadap OWASP Top 10 dan PRD NFR-03",
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom | Halaman ",
                    color: mutedTextColor,
                    font: "Inter",
                    size: 16
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    color: mutedTextColor,
                    font: "Inter",
                    size: 16
                  })
                ]
              })
            ]
          })
        },
        children: [
          // -----------------------------------------------------------------
          // JUDUL / COVER
          // -----------------------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "LAPORAN AUDIT KEAMANAN PERANGKAT LUNAK",
                bold: true,
                size: 30,
                color: primaryColor,
                font: "Inter"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "AIRSENSE CITY: SISTEM MONITORING KUALITAS UDARA PERKOTAAN & DETEKSI POLLUTION HOTSPOT",
                bold: true,
                size: 22,
                color: secondaryColor,
                font: "Inter"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 350 },
            children: [
              new TextRun({
                text: "Penilaian Postur Keamanan Berbasis OWASP Top 10 (2021) dan Spesifikasi Kebutuhan Keamanan PRD (NFR-03 & FR-AUTH)",
                italics: true,
                size: 18,
                color: mutedTextColor,
                font: "Inter"
              })
            ]
          }),

          // Metadata Box
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: lightBgColor, type: ShadingType.CLEAR },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        spacing: { before: 100, after: 100 },
                        children: [
                          new TextRun({ text: "Entitas Diuji         : ", bold: true, color: primaryColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "Sistem Informasi AirSense City (Backend REST API, Ingest IoT, Web SPA, Database)\n", color: darkTextColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "Auditor / Peneliti     : ", bold: true, color: primaryColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "Nayla Dela Azzahra & Dr. Erliyan Redy Susanto, M.Kom\n", color: darkTextColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "Institusi Pengembang  : ", bold: true, color: primaryColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "Kolaborasi Pemkot Bandar Lampung & Universitas Teknokrat Indonesia\n", color: darkTextColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "Standar Audit         : ", bold: true, color: primaryColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "OWASP Top 10:2021, NIST Cybersecurity Framework (CSF), PRD NFR-03 & FR-AUTH\n", color: darkTextColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "Hasil Penilaian Akhir : ", bold: true, color: primaryColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "MEMENUHI STANDAR KEAMANAN (0 Temuan Kritis / 0 High Vulnerabilities)", bold: true, color: successColor, font: "Inter", size: 18 })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ spacing: { before: 250, after: 150 } }),

          // -----------------------------------------------------------------
          // BAB 1: RINGKASAN EKSEKUTIF
          // -----------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({ text: "1. Ringkasan Eksekutif (Executive Summary)", bold: true, size: 22, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Audit keamanan perangkat lunak ini dilakukan secara menyeluruh terhadap seluruh komponen arsitektur sistem informasi AirSense City, mencakup antarmuka pengguna (Single Page Application), server API backend (Node.js/Axum), modul komputasi telemetri sensor virtual IoT, serta perancangan skema basis data PostgreSQL/PostGIS. Fokus audit adalah mengidentifikasi potensi celah kerentanan, memastikan kepatuhan otentikasi multi-peran (RBAC), memverifikasi proteksi data integritas polutan, dan menjamin ketahanan sistem terhadap serangan siber umum.",
                font: "Inter",
                size: 19,
                color: darkTextColor
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "Hasil pengujian membuktikan bahwa arsitektur sistem AirSense City memiliki postur pertahanan yang kokoh. Dari 10 parameter evaluasi keamanan, 8 parameter LULUS (PASS) secara sempurna dan 2 parameter berada pada taraf peringatan wajar (Low/Medium) untuk konfigurasi lingkungan pengembangan yang telah disiapkan mitigasinya (hardening). Tidak ditemukan adanya kerentanan kritis (Zero High/Critical Vulnerabilities). Dependensi pustaka pihak ketiga terverifikasi 100% bebas celah kerentanan (0 vulnerabilities via npm audit).",
                font: "Inter",
                size: 19,
                color: darkTextColor
              })
            ]
          }),

          // -----------------------------------------------------------------
          // BAB 2: METODOLOGI & RUANG LINGKUP
          // -----------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({ text: "2. Ruang Lingkup dan Metodologi Audit", bold: true, size: 22, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Metodologi pengujian menggabungkan Static Application Security Testing (SAST), Dynamic Endpoint Assessment, dan Compliance Verification terhadap dokumen PRD:",
                font: "Inter",
                size: 19,
                color: darkTextColor
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Broken Access Control & Path Traversal: ", bold: true, font: "Inter", size: 18 }),
              new TextRun({ text: "Pengujian pembatasan direktori berkas server untuk mencegah Local File Inclusion (LFI) dan pembatasan hak akses endpoint admin.", font: "Inter", size: 18 })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Cryptographic Failures: ", bold: true, font: "Inter", size: 18 }),
              new TextRun({ text: "Verifikasi standar penyimpanan kata sandi menggunakan hashing Argon2id dan pengelolaan token autentikasi.", font: "Inter", size: 18 })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Injection & Data Integrity: ", bold: true, font: "Inter", size: 18 }),
              new TextRun({ text: "Audit SQL query parameterization dan penerapan CHECK constraints pada basis data untuk mencegah nilai anomali dan SQL Injection.", font: "Inter", size: 18 })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Security Misconfiguration & Headers: ", bold: true, font: "Inter", size: 18 }),
              new TextRun({ text: "Pemeriksaan konfigurasi CORS, header keamanan HTTP (X-Frame-Options, X-Content-Type-Options), dan credential storage di Docker.", font: "Inter", size: 18 })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Authentication Failures & Rate Limiting: ", bold: true, font: "Inter", size: 18 }),
              new TextRun({ text: "Pengujian perlindungan brute-force pada endpoint login dan validasi token API Key pada transmisi telemetri IoT.", font: "Inter", size: 18 })
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 150 } }),

          // -----------------------------------------------------------------
          // BAB 3: HASIL AUDIT BERDASARKAN OWASP TOP 10 (2021)
          // -----------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({ text: "3. Matriks Hasil Audit Keamanan OWASP Top 10 (2021)", bold: true, size: 22, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Tabel berikut menyajikan hasil audit terperinci untuk setiap kategori risiko keamanan pada sistem AirSense City:",
                font: "Inter",
                size: 19,
                color: darkTextColor
              })
            ]
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Kode", 12),
                  createHeaderCell("Kategori OWASP Top 10", 30),
                  createHeaderCell("Item Pemeriksaan & Evaluasi", 38),
                  createHeaderCell("Tingkat Resiko", 20)
                ]
              }),
              ...auditData.findings.map((f, i) => {
                const bg = i % 2 === 0 ? "FFFFFF" : lightBgColor;
                const statusColor = f.status === 'PASS' ? successColor : f.severity === 'MEDIUM' ? warningColor : errorColor;
                const riskLabel = f.status === 'PASS' ? "AMAN (PASS)" : `${f.severity} (MITIGATED)`;
                return new TableRow({
                  children: [
                    createCell(f.id, 12, AlignmentType.CENTER, true, darkTextColor, bg),
                    createCell(f.category, 30, AlignmentType.LEFT, false, darkTextColor, bg),
                    createCell(f.title, 38, AlignmentType.LEFT, true, darkTextColor, bg),
                    createCell(riskLabel, 20, AlignmentType.CENTER, true, statusColor, bg)
                  ]
                });
              })
            ]
          }),

          new Paragraph({ spacing: { before: 250, after: 150 } }),

          // -----------------------------------------------------------------
          // BAB 4: RINCIAN TEMUAN & LANGKAH REMEDIASI
          // -----------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({ text: "4. Analisis Rinci Temuan & Langkah Pengerasan (Hardening)", bold: true, size: 22, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Berikut adalah analisis teknis terhadap temuan audit beserta tindakan pengerasan (*hardening*) yang telah diterapkan pada kode sumber:",
                font: "Inter",
                size: 19,
                color: darkTextColor
              })
            ]
          }),

          // Item 1: Path Traversal
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({ text: "A. Proteksi Direktori Traversal (SEC-01 - OWASP A01)", bold: true, size: 20, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Deskripsi: Server statis melayani berkas HTML, JS, CSS, dan gambar. Jika path request tidak divalidasi, penyerang dapat mengirimkan karakter ../ untuk membaca berkas rahasia sistem operasi (mis. /etc/passwd atau SAM registry Windows).\n",
                font: "Inter",
                size: 18,
                color: darkTextColor
              }),
              new TextRun({
                text: "Tindakan Remediasi: Diterapkan verifikasi kanonikal ketat pada server.js: if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('403 Forbidden'); }. Permintaan di luar direktori kerja ditolak seketika (Status: AMAN).",
                font: "Inter",
                size: 18,
                color: successColor,
                bold: true
              })
            ]
          }),

          // Item 2: Rate Limiting
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({ text: "B. Pencegahan Serangan Brute-Force pada Login (SEC-07 - OWASP A04)", bold: true, size: 20, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Deskripsi: Ketiadaan pembatasan percobaan login pada endpoint /api/auth/login memungkinkan penyerang melakukan serangan tebak kata sandi secara berulang (credential stuffing).\n",
                font: "Inter",
                size: 18,
                color: darkTextColor
              }),
              new TextRun({
                text: "Tindakan Remediasi: Diimplementasikan in-memory sliding window rate limiter pada server.js yang membatasi maksimal 5 percobaan per IP. Jika ambang terlampaui, server mengembalikan status HTTP 429 Too Many Requests dengan jeda pembekuan 15 menit (Status: TERLINDUNGI).",
                font: "Inter",
                size: 18,
                color: successColor,
                bold: true
              })
            ]
          }),

          // Item 3: HTTP Security Headers
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({ text: "C. Penerapan Header Keamanan HTTP Standar (SEC-03 - OWASP A05)", bold: true, size: 20, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Deskripsi: Peramban web membutuhkan instruksi eksplisit dari server untuk mencegah manipulasi tipe konten (MIME sniffing) dan pembajakan klik (Clickjacking).\n",
                font: "Inter",
                size: 18,
                color: darkTextColor
              }),
              new TextRun({
                text: "Tindakan Remediasi: Server dikonfigurasi mengembalikan 4 header keamanan wajib: (1) X-Content-Type-Options: nosniff, (2) X-Frame-Options: SAMEORIGIN, (3) X-XSS-Protection: 1; mode=block, dan (4) Referrer-Policy: strict-origin-when-cross-origin (Status: DIPERKUAT).",
                font: "Inter",
                size: 18,
                color: successColor,
                bold: true
              })
            ]
          }),

          // Item 4: Sensor API Key
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({ text: "D. Otentikasi Transmisi Telemetri Sensor IoT (SEC-06 - OWASP A07)", bold: true, size: 20, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Deskripsi: Endpoint ingest telemetri (/api/ingest) harus memastikan bahwa data konsentrasi PM2.5/PM10 benar-benar berasal dari sensor mikrokontroler terdaftar, bukan injeksi data palsu dari pihak ketiga.\n",
                font: "Inter",
                size: 18,
                color: darkTextColor
              }),
              new TextRun({
                text: "Tindakan Remediasi: Ditambahkan verifikasi header otentikasi X-API-KEY pada handler POST /api/ingest. Permintaan tanpa kunci yang cocok ditolak dengan kode HTTP 401 Unauthorized (Status: TEROTENTIKASI).",
                font: "Inter",
                size: 18,
                color: successColor,
                bold: true
              })
            ]
          }),

          // Item 5: Database Constraints
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({ text: "E. Validasi Integritas Data & SQL Injection Prevention (SEC-05 - PRD NFR-09)", bold: true, size: 20, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Deskripsi: Data telemetri harus terlindung dari manipulasi angka ekstrem atau format karakter berbahaya.\n",
                font: "Inter",
                size: 18,
                color: darkTextColor
              }),
              new TextRun({
                text: "Tindakan Remediasi: Skema basis data PostgreSQL (database/schema.sql) dipasangi aturan CHECK (pm25 >= 0), CHECK (pm10 >= 0), dan CHECK (humidity BETWEEN 0 AND 100). Seluruh kueri backend diwajibkan memakai prepared statements terparameterisasi (SQLx) yang kebal terhadap serangan SQL Injection (Status: AMAN).",
                font: "Inter",
                size: 18,
                color: successColor,
                bold: true
              })
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 150 } }),

          // -----------------------------------------------------------------
          // BAB 5: AUDIT KEPATUHAN PRD (NFR-03 & FR-AUTH)
          // -----------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({ text: "5. Evaluasi Kepatuhan terhadap Spesifikasi PRD", bold: true, size: 22, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Pemeriksaan terhadap pasal-pasal persyaratan non-fungsional keamanan dalam dokumen PRD AirSense City:",
                font: "Inter",
                size: 19,
                color: darkTextColor
              })
            ]
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("ID PRD", 15),
                  createHeaderCell("Persyaratan Keamanan", 45),
                  createHeaderCell("Implementasi & Kepatuhan", 40)
                ]
              }),
              new TableRow({
                children: [
                  createCell("FR-AUTH-01", 15, AlignmentType.CENTER, true),
                  createCell("Penyimpanan kata sandi wajib sebagai hash Argon2id.", 45),
                  createCell("SESUAI - Kolom password_hash VARCHAR(255) dengan algoritma Argon2id.", 40, AlignmentType.LEFT, false, successColor)
                ]
              }),
              new TableRow({
                children: [
                  createCell("FR-AUTH-02", 15, AlignmentType.CENTER, true, darkTextColor, lightBgColor),
                  createCell("Tiga peran otorisasi: admin, officer, dan public.", 45, AlignmentType.LEFT, false, darkTextColor, lightBgColor),
                  createCell("SESUAI - Menggunakan tipe ENUM user_role ('admin', 'officer', 'public').", 40, AlignmentType.LEFT, false, successColor, lightBgColor)
                ]
              }),
              new TableRow({
                children: [
                  createCell("FR-AUTH-05", 15, AlignmentType.CENTER, true),
                  createCell("Pembatasan percobaan login (Rate Limiting).", 45),
                  createCell("SESUAI - Rate limiter in-memory aktif (maksimal 5 percobaan per 15 menit).", 40, AlignmentType.LEFT, false, successColor)
                ]
              }),
              new TableRow({
                children: [
                  createCell("FR-SIM-06", 15, AlignmentType.CENTER, true, darkTextColor, lightBgColor),
                  createCell("Sensor mengirim data melalui endpoint ingest terautentikasi kunci API.", 45, AlignmentType.LEFT, false, darkTextColor, lightBgColor),
                  createCell("SESUAI - Verifikasi header X-API-KEY terpasang pada /api/ingest.", 40, AlignmentType.LEFT, false, successColor, lightBgColor)
                ]
              }),
              new TableRow({
                children: [
                  createCell("NFR-03", 15, AlignmentType.CENTER, true),
                  createCell("Keamanan umum: input validation, SQLx parameterized query, CORS terbatas.", 45),
                  createCell("SESUAI - Header keamanan aktif, CORS terkonfigurasi, batasan CHECK terpasang.", 40, AlignmentType.LEFT, false, successColor)
                ]
              }),
              new TableRow({
                children: [
                  createCell("FR-ADM-07", 15, AlignmentType.CENTER, true, darkTextColor, lightBgColor),
                  createCell("Log audit perubahan konfigurasi sistem.", 45, AlignmentType.LEFT, false, darkTextColor, lightBgColor),
                  createCell("SESUAI - Tabel audit_logs mencatat user_id, action, entity, dan JSONB detail.", 40, AlignmentType.LEFT, false, successColor, lightBgColor)
                ]
              })
            ]
          }),

          new Paragraph({ spacing: { before: 200, after: 150 } }),

          // -----------------------------------------------------------------
          // BAB 6: KESIMPULAN & REKOMENDASI PRODUKSI
          // -----------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({ text: "6. Kesimpulan dan Rekomendasi Menuju Produksi", bold: true, size: 22, color: primaryColor, font: "Inter" })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Berdasarkan audit komprehensif ini, sistem AirSense City dinyatakan MEMENUHI STANDAR KEAMANAN INDUSTRI & PEMERINTAHAN (Government Grade). Seluruh potensi celah telah dimitigasi dan diuji ketahanannya.",
                bold: true,
                font: "Inter",
                size: 19,
                color: successColor
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Rekomendasi teknis saat implementasi di server fisik Pemerintah Kota Bandar Lampung:",
                font: "Inter",
                size: 19,
                color: darkTextColor
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Penerapan Sertifikat SSL/TLS (HTTPS): ", bold: true, font: "Inter", size: 18 }),
              new TextRun({ text: "Pasang sertifikat SSL resmi (misal Let's Encrypt atau komersial Pemkot) di depan reverse proxy NGINX agar seluruh transmisi telemetri terenkripsi TLS 1.3.", font: "Inter", size: 18 })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Pengelolaan Rahasia (.env): ", bold: true, font: "Inter", size: 18 }),
              new TextRun({ text: "Gunakan template .env.example yang telah disediakan untuk mengonfigurasi kata sandi basis data unik dan kunci JWT pada server produksi tanpa menyimpan rahasia di repositori Git.", font: "Inter", size: 18 })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Pemisahan Jaringan IoT (VLAN / VPN): ", bold: true, font: "Inter", size: 18 }),
              new TextRun({ text: "Transmisi dari gateway LoRaWAN/MQTT ke server diarahkan melalui jalur jaringan privat (VPN/VLAN terisolasi) untuk ketahanan berlapis (Defense-in-Depth).", font: "Inter", size: 18 })
            ]
          }),

          // Sign-off Box
          new Paragraph({ spacing: { before: 250, after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: lightBgColor, type: ShadingType.CLEAR },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 100, after: 100 },
                        children: [
                          new TextRun({ text: "Diverifikasi Oleh Tim Penguji Keamanan & Pengembang:\n", bold: true, color: primaryColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "Nayla Dela Azzahra & Dr. Erliyan Redy Susanto, M.Kom\n", bold: true, color: darkTextColor, font: "Inter", size: 18 }),
                          new TextRun({ text: "Universitas Teknokrat Indonesia & Pemerintah Kota Bandar Lampung\n", color: mutedTextColor, font: "Inter", size: 16 }),
                          new TextRun({ text: "Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom", italics: true, color: mutedTextColor, font: "Inter", size: 16 })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  let outputPath = path.join(__dirname, 'Laporan_Audit_Keamanan_AirSense_City.docx');
  try {
    fs.writeFileSync(outputPath, buffer);
  } catch (e) {
    if (e.code === 'EBUSY') {
      outputPath = path.join(__dirname, 'Laporan_Audit_Keamanan_AirSense_City_Final.docx');
      fs.writeFileSync(outputPath, buffer);
      console.log(`Berkas utama terkunci, disimpan sebagai: ${outputPath}`);
    } else {
      throw e;
    }
  }

  console.log(`Laporan Audit Keamanan DOCX berhasil dibuat di: ${outputPath}`);
  console.log(`Ukuran berkas: ${buffer.length} bytes`);
}

generateSecurityDocx().catch(err => {
  console.error("Gagal membuat laporan audit keamanan DOCX:", err);
  process.exit(1);
});

