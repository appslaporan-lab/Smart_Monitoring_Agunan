# Aplikasi Monitoring Agunan

Aplikasi ini dibuat untuk monitoring agunan untuk kredit. Fitur utama:

- Register hanya 1 agunan per nasabah, tetapi 1 nasabah bisa punya beberapa agunan.
- Peringatan ketika agunan keluar dari brankas tetapi belum diserahkan ke nasabah.
- Peringatan BPKB HER 5 tahunan untuk pengambilan ke samsat dan dimasukkan kembali ke register lama.
- Menggunakan Next.js, Prisma, dan SQLite untuk prototipe lokal.
- Siap untuk dikembangkan di GitHub dan dideploy di Vercel.

## Instalasi

1. Buka terminal di folder `agunan-monitoring`
2. Jalankan `npm install`
3. Jalankan `npx prisma migrate dev --name init`
4. Jalankan `npm run dev` atau, jika Node tidak ada di PATH di Windows, `npm run dev:windows`

## Menjalankan Lokal

- `npm run dev` — jalankan pengembangan lokal jika `node` tersedia di PATH.
- `npm run dev:windows` — jalankan menggunakan path Node eksplisit di Windows.
- `npm run build` — membuat build produksi.
- `npm run start` — jalankan build produksi setelah `npm run build`.

## Penggunaan

- `app/page.tsx` menampilkan daftar agunan dan peringatan.
- `prisma/schema.prisma` mendefinisikan model data agunan dan nasabah.

## Supabase Cloud Database
Gunakan Supabase sebagai provider Postgres gratis untuk aplikasi ini.

1. Buat akun di https://supabase.com dan buat project baru.
2. Masuk ke dashboard project, lalu buka Settings -> Database -> Connection string.
3. Salin nilai connection string PostgreSQL dan isi `DATABASE_URL` di file `.env` lokal untuk development.
4. Pastikan `prisma/schema.prisma` menggunakan `provider = "postgresql"`.
5. Jalankan `npx prisma db push` di development untuk membuat tabel di database Supabase.

> Jika Anda deploy ke Vercel, simpan `DATABASE_URL` dan `SESSION_SECRET` di Vercel Environment Variables.

## Deploy live dengan Supabase, GitHub, dan Vercel

1. Buat repository baru di GitHub dan push seluruh folder `agunan-monitoring`.
2. Buat project Supabase baru dan salin PostgreSQL connection string dari `Settings -> Database -> Connection string`.
3. Atur database tabel di Supabase dengan menjalankan di lokal:
   - `npm install`
   - `npm run prisma:generate`
   - `npm run db:push`

4. Masuk ke Vercel dan buat project baru dari repo GitHub yang sudah dipush.
5. Di Vercel dashboard, tambahkan environment variables:
   - `DATABASE_URL` = connection string Supabase
   - `SESSION_SECRET` = string acak aman

6. Pastikan Build Command di Vercel adalah `npm run build`.
7. Pastikan Output Directory adalah `.next` (Vercel biasanya otomatis mendeteksi Next.js).
8. Deploy project. Vercel akan membangun aplikasi dan mengarahkan live URL.

> Jika Anda ingin menggunakan GitHub Actions untuk build otomatis, file `.github/workflows/deploy.yml` sudah tersedia.

## Production-ready Prisma deployment
Untuk environment produksi, jalankan:

```bash
npm run db:deploy
```

Jika Anda menggunakan Vercel, cukup deploy setelah menyimpan `DATABASE_URL` dan `SESSION_SECRET`. Vercel akan menjalankan `npm run build` otomatis pada deploy.

## Skrip tambahan
Gunakan perintah berikut untuk manajemen database lokal dan deploy:

```bash
npm run prisma:generate
npm run db:push
npm run db:migrate
npm run db:deploy
```
"# Smart_Monitoring_Agunan" 
"# Smart_Monitoring_Agunan" 
