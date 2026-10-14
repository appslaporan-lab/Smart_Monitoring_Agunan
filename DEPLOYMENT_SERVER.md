# Panduan Deployment Server Lokal / On-Premise (Self-Hosted)
Aplikasi: **Smart Monitoring Agunan & Collecting Kredit — BPR Bank Tulungagung**

Panduan ini disiapkan agar aplikasi dapat dipindahkan dan dijalankan langsung di server internal kantor (on-premise / private VPS), terbebas dari batasan kuota layanan cloud Vercel.

---

## 1. Rekomendasi Spesifikasi Server

Untuk menjamin performa stabil bagi seluruh kantor kas dan cabang:
- **Sistem Operasi**: 
  - *Direkomendasikan*: Ubuntu Server 22.04 LTS / 24.04 LTS (atau Debian 12).
  - *Alternatif*: Windows Server 2019 / 2022 (atau Windows 10/11 Pro dedicated PC server).
- **Processor**: Minimal 2 Core (Rekomendasi: 4 Core).
- **RAM**: Minimal 4 GB (Rekomendasi: 8 GB).
- **Penyimpanan (SSD)**: Minimal 50 GB SSD (NVMe / SATA).
- **Jaringan**: 
  - Alamat IP Statis lokal (contoh: `192.168.1.50`).
  - Koneksi ke database PostgreSQL (bisa tetap menggunakan Supabase Cloud atau database lokal).

---

## 2. Pilihan Skema Database

Ada 2 opsi arsitektur database:

### Opsi A (Paling Mudah): Web di Server Lokal, Database Tetap di Supabase Cloud
- **Keuntungan**: Tidak perlu memindahkan data database yang sudah ada, backup tetap otomatis di cloud.
- **Konfigurasi**: Cukup pasang connection string `DATABASE_URL` Supabase di file `.env`.

### Opsi B: Web & Database Semuanya di Server Lokal Kantor
- **Keuntungan**: 100% mandiri di dalam jaringan kantor tanpa tergantung koneksi internet luar.
- **Langkah**: Pasang PostgreSQL versi 15 atau 16 di server lokal, lalu ubah `DATABASE_URL="postgresql://user:password@localhost:5432/agunan_db"`.

---

## 3. Metode Instalasi di Server

Pilih salah satu dari dua metode di bawah ini:

---

### METODE 1: Menggunakan Node.js & PM2 (Rekomendasi untuk Pemula / Windows / Linux)

PM2 adalah process manager yang menjaga aplikasi tetap hidup (*auto-restart* jika terjadi error atau server mati/nyala kembali).

#### Langkah 1: Pasang Node.js & PM2
- Pasang **Node.js versi 20 LTS** dari situs resmi [nodejs.org](https://nodejs.org).
- Pasang PM2 secara global:
  ```bash
  npm install -g pm2
  ```

#### Langkah 2: Siapkan File Aplikasi
- Letakkan folder proyek aplikasi di direktori server (contoh: `/var/www/smart-monitoring` di Linux, atau `C:\Apps\smart-monitoring` di Windows).
- Buat file `.env` di folder utama aplikasi dengan menyalin dari `.env.example`:
  ```bash
  DATABASE_URL="postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres"
  DIRECT_URL="postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres"
  SESSION_SECRET="kunci-rahasia-acak-yang-panjang-dan-aman"
  PORT=3000
  ```

#### Langkah 3: Install Dependensi & Build
Jalankan perintah berikut di terminal/PowerShell (di dalam folder aplikasi):
```bash
npm install
npm run build
```

#### Langkah 4: Jalankan dengan PM2
File konfigurasi `ecosystem.config.js` sudah disiapkan. Anda cukup menjalankan:
```bash
pm2 start ecosystem.config.js
```

Untuk memastikan aplikasi otomatis berjalan saat server dinyalakan ulang (*booting*):
- Di Linux:
  ```bash
  pm2 startup
  pm2 save
  ```
- Di Windows:
  Bisa menggunakan paket `pm2-windows-service` atau Task Scheduler.

Untuk memantau status aplikasi:
```bash
pm2 status
pm2 logs
```

Aplikasi kini dapat diakses di jaringan kantor melalui browser:
`http://IP_SERVER:3000` (contoh: `http://192.168.1.50:3000`).

---

### METODE 2: Menggunakan Docker & Docker Compose (Modern & Rapi)

Jika server menggunakan Docker, konfigurasi `Dockerfile` dan `docker-compose.yml` sudah tersedia di proyek.

#### Langkah:
1. Pastikan **Docker** dan **Docker Compose** sudah terpasang di server.
2. Pastikan file `.env` sudah diisi dengan benar.
3. Jalankan perintah:
   ```bash
   docker compose up -d --build
   ```
4. Untuk melihat log:
   ```bash
   docker compose logs -f
   ```
5. Untuk menghentikan:
   ```bash
   docker compose down
   ```

---

## 4. Konfigurasi Domain / Nama Lokal & HTTPS (Opsional)

Agar staf tidak perlu mengetikkan IP dan port `:3000`, Anda dapat memasang **Nginx** sebagai Reverse Proxy:

Contoh konfigurasi Nginx (`/etc/nginx/sites-available/monitoring`):
```nginx
server {
    listen 80;
    server_name monitoring.banktulungagung.local; # atau domain kantor

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M; # Mendukung upload file excel/foto besar
    }
}
```

---

## 5. Ringkasan File Konfigurasi yang Tersedia di Proyek
1. **`ecosystem.config.js`** : Konfigurasi PM2 Process Manager (Auto-restart, memory limit, log management).
2. **`Dockerfile`** : Petunjuk container Docker siap pakai dengan Node 20.
3. **`.dockerignore`** : Mencegah file cache/local terikut ke dalam build Docker.
4. **`docker-compose.yml`** : Konfigurasi Docker Compose untuk menjalankan aplikasi dalam 1 perintah.
5. **`DEPLOYMENT_SERVER.md`** : Dokumen panduan ini.

*Catatan: Seluruh file persiapan di atas bersifat pasif dan tidak akan mengganggu deployment Vercel yang sedang berjalan saat ini.*
