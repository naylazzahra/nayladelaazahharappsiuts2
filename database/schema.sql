-- =====================================================================
-- AirSense City - Skema Database PostgreSQL 16 + PostGIS
-- Sesuai Dokumen Kebutuhan Produk (PRD) Bagian 11 & Lampiran Permen LHK 14/2020
-- Copyright©2026 by Nayla Dela Azzahra dan Dr. Erliyan Redy Susanto, M.Kom
-- Kolaborasi: Pemerintah Kota Bandar Lampung & Universitas Teknokrat Indonesia
-- =====================================================================

-- Aktifkan Ekstensi PostGIS untuk Geospasial
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Tipe Enumerasi (ENUM) Sesuai PRD Bagian 11
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'officer', 'public');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ispu_category AS ENUM ('baik', 'sedang', 'tidak-sehat', 'sangat-tidak-sehat', 'berbahaya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_status AS ENUM ('active', 'resolved', 'acknowledged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hotspot_status AS ENUM ('hotspot', 'monitored', 'controlled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabel Pengguna (users) - FR-AUTH
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Hash Argon2id
    role user_role NOT NULL DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Lokasi Pemantauan (locations) - FR-ADM-02
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(10) PRIMARY KEY, -- Misal: '01', '02', '03'
    code VARCHAR(30) UNIQUE NOT NULL, -- 'ST-TKG-01', 'ST-UTI-02', dst.
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) DEFAULT 'Kota Bandar Lampung',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index Spasial GiST
CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST(geom);

-- 4. Tabel Sensor Telemetri IoT (sensors) - FR-ADM-03 / FR-SIM
CREATE TABLE IF NOT EXISTS sensors (
    id VARCHAR(50) PRIMARY KEY,
    location_id VARCHAR(10) REFERENCES locations(id) ON DELETE CASCADE,
    model_name VARCHAR(100) DEFAULT 'PMS7003 & MQ136',
    microcontroller VARCHAR(100) DEFAULT 'ESP32 Dual-Core',
    protocol VARCHAR(50) DEFAULT 'LoRaWAN / MQTT',
    api_key_hash VARCHAR(255) NOT NULL,
    interval_seconds INT DEFAULT 30,
    scenario VARCHAR(50) DEFAULT 'normal',
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Pembacaan Kualitas Udara (air_quality_readings) - FR-MON
CREATE TABLE IF NOT EXISTS air_quality_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) REFERENCES sensors(id) ON DELETE CASCADE,
    pm25 NUMERIC(6, 2) NOT NULL CHECK (pm25 >= 0),
    pm10 NUMERIC(6, 2) NOT NULL CHECK (pm10 >= 0),
    co NUMERIC(6, 2) DEFAULT 0.0 CHECK (co >= 0),
    no2 NUMERIC(6, 2) DEFAULT 0.0 CHECK (no2 >= 0),
    temperature NUMERIC(4, 1) NOT NULL,
    humidity NUMERIC(4, 1) NOT NULL CHECK (humidity BETWEEN 0 AND 100),
    wind_speed NUMERIC(5, 2) DEFAULT 0.0,
    wind_direction VARCHAR(10) DEFAULT 'U',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks komposit untuk kueri riwayat cepat (NFR-02)
CREATE INDEX IF NOT EXISTS idx_readings_sensor_time ON air_quality_readings(sensor_id, recorded_at DESC);

-- 6. Tabel Hasil Perhitungan ISPU (ispu_results) - Section 8
CREATE TABLE IF NOT EXISTS ispu_results (
    id BIGSERIAL PRIMARY KEY,
    reading_id BIGINT REFERENCES air_quality_readings(id) ON DELETE CASCADE,
    subindex_pm25 INT NOT NULL,
    subindex_pm10 INT NOT NULL,
    ispu_value INT NOT NULL,
    category ispu_category NOT NULL,
    dominant_param VARCHAR(20) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Breakpoint ISPU Resmi (ispu_breakpoints) - PRD Section 8 & Permen LHK 14/2020
CREATE TABLE IF NOT EXISTS ispu_breakpoints (
    id SERIAL PRIMARY KEY,
    parameter VARCHAR(20) NOT NULL,
    category ispu_category NOT NULL,
    conc_low NUMERIC(6, 2) NOT NULL,
    conc_high NUMERIC(6, 2) NOT NULL,
    index_low INT NOT NULL,
    index_high INT NOT NULL,
    averaging_period VARCHAR(20) DEFAULT '24-jam'
);

-- 8. Tabel Ambang Batas Peringatan & Parameter Hotspot (thresholds) - FR-ADM-04
CREATE TABLE IF NOT EXISTS thresholds (
    id SERIAL PRIMARY KEY,
    parameter VARCHAR(20) NOT NULL,
    level ispu_category NOT NULL,
    threshold_value NUMERIC(6, 2) NOT NULL,
    hotspot_window_hours INT DEFAULT 24,
    hotspot_percent NUMERIC(5, 2) DEFAULT 30.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabel Peringatan Dini (alerts) - FR-ALR
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    location_id VARCHAR(10) REFERENCES locations(id) ON DELETE CASCADE,
    level VARCHAR(50) NOT NULL,
    ispu_value INT NOT NULL,
    trigger_param VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status alert_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 10. Tabel Panduan Rekomendasi Kesehatan (recommendations) - FR-PUB-05
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    category ispu_category NOT NULL,
    mask_advice TEXT NOT NULL,
    ventilation_advice TEXT NOT NULL,
    outdoor_advice TEXT NOT NULL,
    sensitive_groups_advice TEXT NOT NULL
);

-- 11. Tabel Riwayat Deteksi Hotspot (hotspot_results) - FR-HOT
CREATE TABLE IF NOT EXISTS hotspot_results (
    id BIGSERIAL PRIMARY KEY,
    location_id VARCHAR(10) REFERENCES locations(id) ON DELETE CASCADE,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    avg_pm25 NUMERIC(6, 2) NOT NULL,
    pct_unhealthy NUMERIC(5, 2) NOT NULL,
    peak_hour VARCHAR(20),
    max_pm25 NUMERIC(6, 2),
    status hotspot_status NOT NULL,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabel Audit Log Administrasi (audit_logs) - FR-ADM-07
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- SEED DATA AWAL: 5 TITIK PANTAU KOTA BANDAR LAMPUNG & BREAKPOINTS ISPU
-- =====================================================================

-- Masukkan 5 Titik Pantau Acuan
INSERT INTO locations (id, code, name, address, district, latitude, longitude, geom)
VALUES 
('01', 'ST-TKG-01', 'Pusat Kota (Tanjung Karang)', 'Jl. Raden Intan, Kec. Enggal', 'Enggal', -5.4128, 105.2575, ST_SetSRID(ST_MakePoint(105.2575, -5.4128), 4326)),
('02', 'ST-UTI-02', 'Area Kampus (Kedaton - UTI)', 'Jl. ZA. Pagar Alam No. 9-11, Kec. Kedaton', 'Kedaton', -5.3789, 105.2514, ST_SetSRID(ST_MakePoint(105.2514, -5.3789), 4326)),
('03', 'ST-PNJ-03', 'Kawasan Industri (Panjang)', 'Jl. Yos Sudarso, Pelabuhan Panjang', 'Panjang', -5.4678, 105.3189, ST_SetSRID(ST_MakePoint(105.3189, -5.4678), 4326)),
('04', 'ST-KML-04', 'Area Permukiman (Kemiling)', 'Jl. Teuku Cik Ditiro, Kec. Kemiling', 'Kemiling', -5.3982, 105.2156, ST_SetSRID(ST_MakePoint(105.2156, -5.3982), 4326)),
('05', 'ST-RBS-05', 'Kawasan Transportasi (Rajabasa)', 'Terminal Bus Tipe A Rajabasa', 'Rajabasa', -5.3587, 105.2348, ST_SetSRID(ST_MakePoint(105.2348, -5.3587), 4326))
ON CONFLICT (id) DO NOTHING;

-- Masukkan Sensor Telemetri
INSERT INTO sensors (id, location_id, model_name, microcontroller, protocol, api_key_hash)
VALUES 
('SNS-01', '01', 'PMS7003 & MQ136', 'ESP32 Dual-Core', 'LoRaWAN / MQTT', 'hash_key_tkg_01'),
('SNS-02', '02', 'PMS7003 & MQ136', 'ESP32 Dual-Core', 'LoRaWAN / MQTT', 'hash_key_uti_02'),
('SNS-03', '03', 'PMS7003 & MQ136', 'ESP32 Dual-Core', 'LoRaWAN / MQTT', 'hash_key_pnj_03'),
('SNS-04', '04', 'PMS7003 & MQ136', 'ESP32 Dual-Core', 'LoRaWAN / MQTT', 'hash_key_kml_04'),
('SNS-05', '05', 'PMS7003 & MQ136', 'ESP32 Dual-Core', 'LoRaWAN / MQTT', 'hash_key_rbs_05')
ON CONFLICT (id) DO NOTHING;

-- Masukkan Breakpoints Resmi Permen LHK 14/2020
INSERT INTO ispu_breakpoints (parameter, category, conc_low, conc_high, index_low, index_high)
VALUES 
('pm25', 'baik', 0.0, 15.5, 0, 50),
('pm25', 'sedang', 15.6, 55.4, 51, 100),
('pm25', 'tidak-sehat', 55.5, 150.4, 101, 200),
('pm25', 'sangat-tidak-sehat', 150.5, 250.4, 201, 300),
('pm25', 'berbahaya', 250.5, 500.0, 301, 500),
('pm10', 'baik', 0.0, 50.0, 0, 50),
('pm10', 'sedang', 51.0, 150.0, 51, 100),
('pm10', 'tidak-sehat', 151.0, 350.0, 101, 200),
('pm10', 'sangat-tidak-sehat', 351.0, 420.0, 201, 300),
('pm10', 'berbahaya', 421.0, 600.0, 301, 500)
ON CONFLICT DO NOTHING;

-- Masukkan Rekomendasi Kesehatan Resmi
INSERT INTO recommendations (category, mask_advice, ventilation_advice, outdoor_advice, sensitive_groups_advice)
VALUES 
('baik', 'Tidak wajib bagi warga sehat', 'Buka jendela lebar untuk sirkulasi udara bersih', 'Sangat direkomendasikan untuk olahraga', 'Aman untuk semua kelompok umur'),
('sedang', 'Disarankan untuk kelompok sensitif', 'Ventilasi normal di luar jam padat', 'Aktivitas normal dapat dilanjutkan', 'Penderita asma membatasi aktivitas fisik berat'),
('tidak-sehat', 'Wajib masker medis / N95', 'Tutup jendela, gunakan pembersih udara', 'Kurangi aktivitas fisik di luar ruang', 'Kelompok sensitif harus tetap di dalam ruangan'),
('sangat-tidak-sehat', 'Wajib respirator N95/KN95', 'Tutup rapat semua ventilasi', 'Hindari seluruh aktivitas di luar ruangan', 'Bahaya bagi penderita jantung dan pernapasan'),
('berbahaya', 'Wajib respirator kedap udara', 'Evakuasi ke ruang berfilter HEPA', 'Dilarang beraktivitas di luar ruangan', 'Darurat kesehatan masyarakat')
ON CONFLICT DO NOTHING;

-- Masukkan Pengguna Bawaan (Admin, Petugas, Publik)
INSERT INTO users (name, email, password_hash, role)
VALUES 
('Administrator DLH', 'admin.dlh@bandarlampung.go.id', '$argon2id$v=19$m=19456,t=2,p=1$fakeadminhash$airsense2026', 'admin'),
('Petugas Lapangan DLH', 'petugas.dlh@bandarlampung.go.id', '$argon2id$v=19$m=19456,t=2,p=1$fakeofficerhash$airsense2026', 'officer'),
('Warga Kota', 'warga@bandarlampung.go.id', '$argon2id$v=19$m=19456,t=2,p=1$fakepublichash$airsense2026', 'public')
ON CONFLICT (email) DO NOTHING;

