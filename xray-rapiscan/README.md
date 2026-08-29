# Rapiscan 600 Learning Hub

Web learning portal berbahasa Indonesia yang merangkum materi maintenance training Rapiscan 600 Series dalam bentuk yang lebih mudah dipahami.

## Isi aplikasi
- 9 modul: Health & Safety, System Overview, Machine Operation & UI, Electrical/Software/Hardware, Collimation, Replacement & Adjustment, 600 DV, Troubleshooting, Preventive Maintenance.
- Alur sistem interaktif dari power sampai image.
- Troubleshooting berbasis gejala.
- Quiz singkat.
- Glosarium teknisi.
- Progress belajar tersimpan di browser dengan `localStorage`.
- Responsive untuk desktop dan mobile.

## Sumber materi
Konten dibuat berdasarkan PDF training Rapiscan 600 Series yang diberikan untuk percakapan ini. Aplikasi ini adalah media pembelajaran dan tidak menggantikan service manual resmi, prosedur site, atau ketentuan keselamatan radiasi.

## Menjalankan lokal
Buka `xray-rapiscan/index.html` langsung di browser, atau gunakan static server sederhana.

## GitHub Pages
Workflow deployment berada di `.github/workflows/deploy-pages.yml`. Setelah GitHub Pages pada repository menggunakan sumber **GitHub Actions**, push ke branch `main` akan mem-publish folder `xray-rapiscan`.
