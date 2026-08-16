# My Learning OS — Rebuild From Zero

Ini versi baru yang dibuat ulang dari nol.

## Prinsip utama
- Satu checkbox = satu Level/Tahap.
- Tidak ada `KAMU DI SINI`.
- Tidak ada checkbox untuk setiap submateri.
- Lima track: Network Engineer, Data Analyst, Data Scientist, Python Mastery, AI Engineer.
- Progress tersimpan otomatis di browser.
- Login/Daftar tetap bisa dipakai tanpa Supabase (mode lokal).
- Supabase bersifat opsional untuk autentikasi cloud.

## Struktur
- `index.html`
- `style.css`
- `data/curriculum.js`
- `js/config.js`
- `js/auth.js`
- `js/progress.js`
- `js/app.js`
- `supabase-schema.sql`

## GitHub Pages
Upload seluruh isi folder ini ke root repository. Pastikan `index.html` berada di root.

Jangan menghapus folder `data/` atau `js/`.

## Supabase
Jika ingin memakai Supabase:
1. Isi URL project dan anon key di `js/config.js`.
2. Jalankan `supabase-schema.sql` di SQL Editor.
3. Aktifkan Email/Password di Authentication.
4. Push ke GitHub.
