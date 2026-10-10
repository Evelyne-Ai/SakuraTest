# Deploy SakuraApis ke Vercel

## Deploy
1. Ekstrak ZIP, lalu unggah proyek ke repository GitHub (jangan unggah `.env` atau `node_modules`).
2. Di Vercel pilih **Add New → Project**, impor repository tersebut.
3. Biarkan **Root Directory** di root repository (folder yang berisi `vercel.json` dan `package.json`).
4. Framework Preset: **Other**. Biarkan Root Directory di root repository. Build Command: `npm run build`. Output Directory: `frontend/dist`. Install Command: `npm install`. Jangan mengatur Root Directory ke `frontend` atau `backend`.
5. Deploy. Frontend dan endpoint `/api/*` akan berada di domain Vercel yang sama.

## Environment variables
Tambahkan variabel yang diperlukan di Project → Settings → Environment Variables, misalnya:
- `NODE_ENV=production`
- `DATA_DIR=memory` (hanya untuk percobaan; data TIDAK tersimpan permanen)
- `ADMIN_EMAILS=email-admin-anda`
- `CORS_ORIGINS=https://domain-proyek-anda.vercel.app`
- `BUY_CONTACT_URL` (opsional, untuk tautan kontak pembelian paket)

Setelah mengubah environment variables, lakukan redeploy. Jangan masukkan rahasia ke variabel `VITE_*`, karena nilainya bisa terekspos di browser.

## Penting: penyimpanan data
Backend saat ini menyimpan akun, API key, dan log ke file JSON. Filesystem function Vercel tidak cocok untuk penyimpanan persisten; `DATA_DIR=memory` hanya membuat aplikasi bisa diuji, tetapi data dapat hilang/reset saat function dijalankan ulang dan antar-instance tidak berbagi data. Untuk penggunaan nyata, ubah penyimpanan ke database terkelola (misalnya PostgreSQL/Supabase) sebelum mengandalkan registrasi, login, atau API key.

## Catatan fitur
- Endpoint API berada pada domain yang sama dengan frontend: `/api/...`.
- Fitur integrasi eksternal tetap memerlukan provider yang sesuai; variabel API key saja tidak mengaktifkan runner yang belum diimplementasikan.
- Jangan memasukkan rahasia ke variabel `VITE_*`, karena variabel tersebut bisa masuk ke kode browser.
