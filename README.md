# Forum API - Dicoding Backend Expert

Aplikasi RESTful API Forum Diskusi Online yang dibangun menggunakan **Node.js (Express.js)**, **PostgreSQL**, **Clean Architecture**, **Test-Driven Development (TDD)** dengan cakupan pengujian 100%, serta dilengkapi dengan **Winston Logging**, **Dokumentasi Swagger (OpenAPI)**, **Nginx Reverse Proxy**, dan **CI/CD GitHub Actions**.

---

## Fitur Utama

- **User Management & Authentication**: Registrasi pengguna, Login/Logout dengan JWT (Access Token & Refresh Token).
- **Threads & Comments**: Membuat dan melihat thread diskusi, menambahkan dan menghapus komentar.
- **Replies**: Membalas dan menghapus balasan komentar.
- **Likes**: Menyukai dan membatalkan suka (*like/unlike toggle*) pada komentar thread.
- **Interactive Documentation**: Dokumentasi OpenAPI 3.0 via Swagger UI di endpoint `/api-docs`.
- **Logging System**: Sistem pencatatan event (*application logs*) menggunakan Winston Logger.
- **100% Test Coverage**: Pengujian unit dan integrasi otomatis dengan Vitest & Supertest.

---

## Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan Anda telah memasang:
- **Node.js** (v22)
- **npm** (v10 atau lebih baru)
- **PostgreSQL Database** (Lokal atau Cloud seperti AWS RDS)

---

## Instalasi & Persiapan

1. **Clone Repository**
   ```bash
   git clone https://github.com/hermansyah32/forum-api-starter-project.git
   cd forum-api-starter-project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Pengaturan Environment Variable**
   Salin berkas contoh lingkungan ke berkas `.env` dan `.test.env`:
   ```bash
   cp .env.example .env
   cp .test.env.example .test.env
   ```

4. **Konfigurasi Berkas `.env`**
   Sesuaikan variabel kredensial database dan token di berkas `.env`:
   ```env
   # SERVER
   HOST=localhost
   PORT=5000

   # DATABASE DEVELOPMENT
   PGHOST=localhost
   PGUSER=postgres
   PGDATABASE=forumapi
   PGPASSWORD=password
   PGPORT=5432

   # TOKEN AUTHENTICATION
   ACCESS_TOKEN_KEY=your_super_secret_access_key
   REFRESH_TOKEN_KEY=your_super_secret_refresh_key
   ACCESS_TOKEN_AGE=3000

   # OPTIONAL: DATABASE SSL (Koneksi AWS RDS / Cloud DB)
   # PGSSLMODE=no-verify
   # PGSSLROOTCERT=certs/global-bundle.pem
   ```

5. **Jalankan Migrasi Database**
   Pastikan database `forumapi` dan `forumapi_test` sudah dibuat di PostgreSQL Anda, lalu jalankan:
   ```bash
   # Migrasi database utama (development/production)
   npm run migrate up

   # Migrasi database pengujian (test)
   npm run migrate:test up
   ```

---

## Menjalankan Aplikasi

### Mode Pengembangan (Development)
```bash
npm run start:dev
```
Aplikasi akan berjalan di `http://localhost:5000` (atau sesuai konfigurasi `PORT` di `.env`).

### Mode Produksi (Production)
```bash
npm start
```

---

## Dokumentasi API (Swagger UI)

Dokumentasi OpenAPI dapat diakses secara langsung melalui browser saat aplikasi berjalan:
- **URL**: `http://localhost:5000/api-docs` (atau `https://domain-anda.com/api-docs`)
- **Fitur**: Uji coba endpoint secara interaktif (*Try it out -> Execute*) dengan skema data lengkap per kategori tag (*Users*, *Authentications*, *Threads*, *Comments*, *Likes*, *Replies*).

---

## Pengujian (Testing) & Coverage

Proyek ini dibangun menerapkan TDD dengan target cakupan uji 100%.

```bash
# Menjalankan seluruh Unit & Integration Test
npm run test

# Menjalankan test dalam mode watch
npm run test:watch

# Menjalankan test coverage report (Vitest + V8)
npm run test:coverage

# Memeriksa linters (ESLint)
npm run lint
```

---

## Pengaturan Server Produksi (Nginx & CI/CD)

- **Nginx Reverse Proxy**: Konfigurasi siap pakai tersedia di berkas [nginx-config.conf](file:///mnt/netdata1/projects/dicoding/menjadi-backend-expert-javascript/forum-api-starter-project-code/nginx-config.conf) (dilengkapi dengan *Rate Limiting* 90 request/menit khusus rute `/threads` dan turunannya, serta dukungan HTTPS SSL Certbot).
- **CI/CD Pipeline**:
  - **Continuous Integration**: [.github/workflows/ci.yml](file:///mnt/netdata1/projects/dicoding/menjadi-backend-expert-javascript/forum-api-starter-project-code/.github/workflows/ci.yml) (Menjalankan pengujian dan migrasi test otomatis pada setiap Pull Request ke branch `main`).
  - **Continuous Deployment**: [.github/workflows/cd.yml](file:///mnt/netdata1/projects/dicoding/menjadi-backend-expert-javascript/forum-api-starter-project-code/.github/workflows/cd.yml) (Automated deployment via SSH & PM2 saat PR di-merge ke branch `main`).

---

