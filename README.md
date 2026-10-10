# SakuraApis

Platform REST API dengan manajemen API key: login, dashboard pemakaian, request log, leaderboard, feedback, dan dokumentasi.
Frontend React + TypeScript + Vite; backend Node.js + Express + Zod. Tampilan krem + hitam dengan menu drawer kiri (tombol hamburger kanan atas).

## Status jujur
- **Sudah ada dan ditulis lengkap:** register/login, API key (buat/cabut, hash), autentikasi `X-API-Key`, limit harian per paket, dashboard (stat, grafik 24 jam, quick action), request log per akun, leaderboard, profile, feedback, Buy Plan, Code Snippet (12 bahasa), Docs, Changelog, Stats, Status, Privacy/Terms.
- **Teruji:** logika akun/key/limit/usage di `backend/test/account.test.js` (node:test, tanpa jaringan). Lapisan Express, validasi Zod, dan seluruh frontend **belum dijalankan/ditypecheck** di lingkungan pembuatan karena tidak ada akses `npm install`. Jalankan `npm install && npm test && npm run typecheck && npm run dev` dulu dan laporkan error bila ada.
- **Belum ada:** pembayaran otomatis (paket diaktifkan admin), verifikasi email, reset password, database sungguhan (data di satu file JSON).
- **Harga:** kosong sampai diisi di `shared/catalog.json` (`plans[].price`). Limit paket Premium (10.000/hari, 20 key) adalah angka contoh yang bisa diubah.
- Tools berstatus Not configured (Media Downloader, AI Assistant, Image Compressor) belum punya runner.
- Privacy/Terms adalah templat, belum ditinjau secara hukum.

## Menjalankan
```bash
npm install
cp .env.example .env     # isi ADMIN_EMAILS, BUY_CONTACT_URL, dll.
npm run dev              # backend :4000 + frontend :5173
```
Buka http://localhost:5173, daftar akun, lalu buat API key di Dashboard.

```bash
curl -X POST http://localhost:4000/api/v1/tools/hash/run \
  -H 'Content-Type: application/json' -H 'X-API-Key: sk_sakura_...' \
  -d '{"algorithm":"sha256","text":"abc"}'
```

## Mengaktifkan paket Premium (admin)
Daftar dengan email yang ada di `ADMIN_EMAILS`, login, lalu panggil `PUT /api/admin/users/plan` dengan header `Authorization: Bearer <token>` dan body `{"email":"user@contoh.com","plan":"premium"}`. Token ada di respons `/api/auth/login`.

## Endpoint
Publik: `/api/health`, `/tools`, `/tools/:slug`, `/categories`, `/docs`, `/stats`, `/openapi.json`, `/changelog`, `/plans`, `/leaderboard`.
Akun (Bearer token): `/auth/register`, `/auth/login`, `/auth/me`, `/me`, `/me/password`, `/me/dashboard`, `/me/logs`, `/keys`, `/feedback`.
API key (`X-API-Key`): `GET /api/v1/me`, `POST /api/v1/tools/:slug/run`.

## Data & keamanan
- `DATA_DIR/db.json` (default `backend/data/`, diabaikan git) berisi akun, hash password (scrypt), hash API key (SHA-256), log, feedback. Backup berkala.
- Token sesi disimpan di `localStorage` (rentan bila ada XSS; frontend tidak memakai HTML mentah).
- Log tidak menyimpan body, header, query, atau IP.
- Wajib HTTPS di produksi dan set `CORS_ORIGINS`.

## Build, test, Docker
```bash
npm run build && npm run start
npm test && npm run typecheck
docker compose up --build   # UI di :8080, data di volume sakuraapis-data (belum diuji)
```

Lihat `docs/ARCHITECTURE.md` untuk struktur, `.env.example` untuk konfigurasi.
