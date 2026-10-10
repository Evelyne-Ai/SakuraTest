# Arsitektur SakuraApis

- `shared/catalog.json` — kategori, tools, docs, FAQ, changelog, dan paket (`plans`: limit harian + batas key).
- `backend/` — Express.
  - `services/store.js`: penyimpanan satu file JSON (`DATA_DIR/db.json`: users, keys, logs, feedback). Cukup untuk satu instance; ganti modul ini untuk pindah ke database.
  - `services/auth.js`: hash password (scrypt) dan token sesi bertanda tangan HMAC (30 hari).
  - `services/keys.js`: API key `sk_sakura_...`; hanya hash SHA-256 yang disimpan, key utuh tampil sekali.
  - `services/usage.js`: hitungan harian/jam per akun (dipangkas otomatis) + log request (maks. 5000 entri).
  - `middleware/auth.js`: `requireSession` (dashboard), `requireAdmin`, `requireApiKey` (limit harian per akun, header `X-RateLimit-*`).
  - Tools tetap dijalankan oleh `toolService` + `toolRunners`, kini lewat `POST /api/v1/tools/:slug/run`.
- `frontend/` — React + TypeScript + Vite. `components/Shell.tsx` berisi topbar (logo kiri, hamburger kanan) dan drawer menu kiri.

## Alur
1. Register/login -> token disimpan di `localStorage`, dikirim sebagai `Authorization: Bearer`.
2. Dashboard membuat API key -> klien memanggil `/api/v1/*` dengan `X-API-Key`.
3. Setiap request ber-key yang lolos mencatat usage + log; request yang ditolak limit tidak dihitung.

## Batasan sengaja
- Pembayaran belum ada. Paket diaktifkan admin: `PUT /api/admin/users/plan` (`{ "email": "...", "plan": "premium" }`) memakai token akun admin (email di `ADMIN_EMAILS`).
- Tidak ada verifikasi email atau reset password.
- Hari limit memakai UTC.
