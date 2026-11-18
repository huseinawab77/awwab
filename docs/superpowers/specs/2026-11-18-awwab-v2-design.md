# AWWAB v2 — design (bikin ulang dari nol)

Status: menunggu persetujuan Awab. Tampilan sudah disetujui (kanvas "AWWAB Baru — Pilihan Tampilan", baris Versi 3; sistem desain di `DESIGN.md`).

## Kenapa
- AWWAB lama (Lovable) bikin males ngisi: hari all-out skornya cuma ±30 karena yang tampil skor **mingguan** dan target mingguan/bulanan ditagih penuh sejak hari pertama.
- Tampilannya berantakan dan fiturnya kebanyakan (11 halaman, banyak yang tumpang tindih).
- Awab mau tiap hari ngisi terasa **memuaskan**: hari yang semua rencananya beres = **100**.

## Goals
- Skor harian 0–100 yang bisa dicapai: semua yang direncanakan hari itu beres = 100.
- Ngisi cepat: satu ketukan untuk centang, tombol +/− untuk angka.
- 4 tab saja: Hari Ini, Minggu, Rapor, Atur.
- Bisa dipakai di HP dan laptop, data di cloud, bisa dipasang ke layar utama HP.

## Non-goals (sengaja tidak dibuat)
- Goals/Projects/Milestones (sudah ada di app Fokus).
- Bobot domain/bobot kebiasaan (semua kebiasaan nilainya sama).
- Notifikasi (ditunda ke versi berikutnya).
- Dua bahasa (hanya Indonesia).
- Input suara, kalender event, planner tugas umum, menu mingguan/laundry sebagai fitur khusus (cukup jadi kebiasaan biasa).
- Pindah data dari AWWAB lama (mulai dari kosong; app lama tetap bisa dibuka).
- Gamifikasi selain kucing (tanpa poin, level, badge, streak).

## Anti-goal
App gagal kalau: hari yang semua rencananya beres tidak dapat 100, atau app tumbuh lagi jadi banyak halaman/pengaturan sampai bikin pusing seperti AWWAB lama.

## Batasan
- Next.js + Tailwind, deploy Vercel, Supabase (Auth + Postgres), sama seperti Fokus. Proyek Supabase dan Vercel baru, terpisah dari Fokus.
- Satu pengguna (Awab), tapi aman multi-akun: RLS di semua tabel.
- Zona waktu Asia/Jakarta; minggu mulai Senin; bulan = bulan kalender.
- Awab pemula: kode harus rapi dan mudah dijelaskan.

## Approaches
1. **Bikin baru dengan Next.js + Supabase + Vercel, data per baris (dipilih).** Sama dengan Fokus, data tidak saling timpa antar perangkat, bebas dari sisa Lovable. Lebih lama karena semua ditulis ulang.
2. Salin kode lama (TanStack Start) lalu potong. Lebih cepat di awal, tapi membawa sistem bobot, simpan-satu-bungkusan, dan sisa Lovable yang justru mau ditinggalkan.
3. (Dibuang) Gabung ke app Fokus: bertentangan dengan keputusan Awab bahwa keduanya terpisah.

## Keputusan Awab
- Skor harian dari rencana hari itu (opsi A); semua kebiasaan nilainya sama.
- Bikin dari nol, AWWAB lama hanya acuan; tidak bawa data lama.
- Goals/Projects tidak dibuat ulang (ditangani Fokus) — usulan Claude, tidak dikoreksi.
- Tampilan Versi 3 + maskot kucing versi Gemini.
- Login dimulai dari halaman masuk.

## Konsep data (bahasa sederhana)
- **Kebiasaan**: sesuatu yang dilacak. Punya:
  - nama;
  - jenis: **centang** (beres/belum) atau **angka** (misal protein dalam gram);
  - periode: **harian**, **mingguan**, atau **bulanan**;
  - untuk jenis angka: satuan, **target per hari** (misal deep work 90 menit per sesi, protein 120 g), dan **langkah tombol +** (misal 15 menit);
  - untuk mingguan/bulanan: **target periode** (misal gym 3 kali/minggu, deep work 600 menit/minggu);
  - untuk mingguan/bulanan: **hari rutin** opsional (misal gym Sen/Rab/Jum) — otomatis masuk rencana hari itu;
  - urutan tampil; tanggal mulai; tanggal diarsipkan (kalau diarsipkan).
- **Catatan harian** (log): per kebiasaan per tanggal, berisi beres/belum atau angka.
- **Jadwal manual**: kebiasaan mingguan/bulanan yang dijadwalkan ke tanggal tertentu.
- **Catatan bulan ini**: satu teks per bulan.
- **Pengaturan**: tampilkan kutipan harian atau tidak, tanggal terakhir kutipan dilihat.

## Aturan skor (inti app)
Untuk satu tanggal D:
1. **Rencana D** = semua kebiasaan **harian** yang aktif di D
   + kebiasaan mingguan/bulanan yang **hari rutinnya** jatuh di D
   + kebiasaan mingguan/bulanan yang **dijadwalkan manual** ke D
   + kebiasaan mingguan/bulanan yang **dicatat** di D walau tidak dijadwalkan (dikerjakan di luar jadwal tetap dihitung).
   Satu kebiasaan hanya muncul sekali walau masuk lewat beberapa jalan.
2. **Nilai tiap kebiasaan** di D: centang = 1 kalau beres, 0 kalau belum; angka = nilai ÷ target per hari, maksimal 1 (lewat target tetap 1, ditandai "lewat target").
3. **Skor D** = bulat(100 × jumlah nilai ÷ jumlah rencana). Kalau rencana kosong → **tidak ada skor** ("hari santai"), dan tidak ikut rata-rata.
4. "Aktif di D" = tanggal mulai ≤ D dan (belum diarsipkan atau tanggal arsip > D).
5. **Skor minggu/bulan** = rata-rata skor harian dari hari yang punya skor, sampai hari ini. Hari lewat yang ada rencananya tapi tidak diisi = 0.
6. **Progres target** mingguan/bulanan: centang = jumlah hari beres di periode itu; angka = jumlah nilainya. Ditampilkan "2 dari 3"; tercapai = warna lime.
7. Skor dihitung dari catatan + pengaturan kebiasaan saat ini (tidak disimpan). Konsekuensi: mengubah target kebiasaan ikut mengubah skor hari lalu. Diterima demi kesederhanaan.

## Layar dan fitur

### 0a. Masuk / Daftar
- Satu layar dengan tombol pindah "Masuk" / "Daftar". Isian email + password (minimal 8 karakter, tombol lihat password).
- Konfirmasi email dimatikan (seperti Fokus): daftar langsung masuk.
- "Lupa password?": kirim email reset dari Supabase → halaman "Bikin password baru".
- Tampilan: latar butter, kucing badan penuh di atas kartu putih, tombol utama plum. Pesan error jelas ("Email atau password salah").
- Setelah masuk: kalau belum punya kebiasaan → Mulai; kalau sudah → Hari Ini.

### 0b. Mulai (sekali, setelah daftar)
- Langkah 1 "Pilih kebiasaanmu": daftar kebiasaan contoh dari AWWAB lama, dikelompokkan Harian / Mingguan / Bulanan, bisa dicentang/dihapus, target bisa diubah. Default tercentang:
  - Harian: Catat pengeluaran, Baca 10 halaman, Journaling, Buah dan sayur, Skill development, Protein 120 g (+20), Langkah 6.000 (+1.000).
  - Mingguan: Gym 3 kali (rutin Sen/Rab/Jum), Study session 5 kali, Deep work 600 menit (90 menit per sesi, +15), Networking 5 kali, Bantu orang 3 kali, Laundry 1 kali, Bikin menu mingguan 1 kali.
  - Bulanan: Ikut lomba 2 kali, Event profesional 1 kali, Waktu keluarga 2 kali, Kabarin teman 2 kali.
  - Tidak tercentang (opsional): Selesaikan tugas harian, Selesaikan proyek, Follow-up relasi.
- Langkah 2 "Selesai": kucing badan penuh + tombol "Mulai hari ini".

### 0c. Kutipan harian
- Muncul sekali sehari saat app pertama dibuka hari itu, sebagai kartu penuh layar: sapaan ("Selamat pagi, Awab"), tanggal, satu kutipan dari 45 kutipan AWWAB lama (teks, tokoh, renungan singkat), tombol "Mulai hari ini".
- Kutipan dipilih bergantian berdasarkan tanggal. Bisa dimatikan di Atur.

### 1. Hari Ini
- Header: tanggal + "Halo, Awab". Panah ‹ › untuk pindah ke hari sebelumnya (maks 7 hari ke belakang, tidak bisa ke masa depan); label "Kemarin"/tanggal, tombol "Kembali ke hari ini".
- Panel skor (plum): skor, kucing kepala yang ekspresinya ikut skor (<50 mengantuk, 50–79 senyum kecil, 80–99 senang, 100 berbinar), kalimat status ("5 dari 10 beres, tinggal 5 lagi" / "Semua beres hari ini. Mantap."), bar energi bersegmen (satu segmen per kebiasaan di rencana; kalau > 12 kebiasaan, bar jadi satu bar persen), pil 7 hari minggu ini dengan skornya.
- **Jadwal hari ini** (lilac): kebiasaan mingguan/bulanan di rencana hari ini, dengan keterangan "minggu ini 2 dari 3". Tombol "+ Tambah ke hari ini" membuka lembar bawah berisi kebiasaan mingguan/bulanan yang belum ada di hari ini.
- **Rutin harian** (mint): semua kebiasaan harian.
- Baris centang: tombol bulat 44px, ketuk = beres/batal (animasi stempel).
- Baris angka: bar progres, tombol − / + (sesuai langkah), **ketuk angkanya** untuk mengetik nilai pasti (lembar bawah dengan papan angka). Ketuk lingkaran = langsung isi target.
- **Timer fokus**: kebiasaan angka bersatuan menit punya ikon timer. Membuka lembar timer (mulai/jeda/selesai). Saat selesai, menitnya **otomatis ditambahkan** ke kebiasaan itu. Waktu mulai disimpan supaya timer tetap jalan walau app ditutup.
- Hari santai (rencana kosong): kartu kucing badan penuh "Hari santai, nggak ada yang dijadwalkan".
- Setiap perubahan langsung tersimpan (tanpa tombol simpan); kalau gagal tersimpan, muncul pesan kecil "Belum tersimpan, coba lagi" dan nilai dikembalikan.

### 2. Minggu
- Pil 7 hari (Sen–Min) dengan skor tiap hari; hari dipilih = kuning.
- Kartu hari terpilih: daftar rencana dengan sumbernya ("Dari rutinitas" / "Dijadwalin manual"). Jadwal manual bisa dihapus (×). Hari lewat menampilkan beres/belum per item; hari santai menampilkan kucing badan penuh.
- **Target minggu ini** dan **Target bulan ini**: bar progres "2 dari 3" + tombol "+ Sen" untuk menjadwalkan ke hari yang dipilih (tombol mati untuk hari lewat).
- Panah ‹ › untuk minggu sebelumnya/berikutnya.

### 3. Rapor
- Pilihan Minggu / Bulan (+ panah ‹ › ganti periode).
- Rata-rata skor + perubahan dari periode sebelumnya ("+4 dari minggu lalu"; kosong kalau belum ada data pembanding).
- Minggu: **jalur perjalanan** 7 titik berwarna sesuai skor (lime ≥ 80, peach di bawahnya, putus-putus = belum/libur), bendera di akhir.
- Bulan: grafik garis rata-rata per minggu.
- **Paling konsisten** dan **paling sering bolong**: dari kebiasaan harian, berdasarkan persentase hari beres di periode itu (perlu minimal 3 hari data; kalau belum, kartu bilang "Belum cukup data").
- Progres target periode itu.
- Mode Bulan: **Catatan bulan ini** (tersimpan otomatis).

### 4. Atur
- **Kebiasaan**: daftar dikelompokkan Harian/Mingguan/Bulanan; ubah urutan (tombol naik/turun); ketuk untuk edit; tombol "+ Kebiasaan baru".
- Form kebiasaan: nama, jenis (centang/angka), periode, satuan + target per hari + langkah (kalau angka), target periode (kalau mingguan/bulanan), hari rutin (kalau mingguan/bulanan). Tombol "Arsipkan" (riwayat tetap tersimpan) dan daftar "Diarsipkan" yang bisa dipulihkan.
- **Tampilan**: kutipan harian nyala/mati.
- **Akun**: email, ganti password, keluar.
- **Data**: unduh cadangan (JSON).

### Umum
- Navigasi bawah melayang 4 tab (sesuai mockup v3).
- PWA: bisa dipasang ke layar utama, ikon = kepala kucing senang di kotak sun.
- Keadaan memuat: kerangka abu lembut; error jaringan: pesan + tombol "Coba lagi".
- Aksesibilitas: target sentuh ≥ 44px, kontras ≥ 4.5:1, fokus keyboard terlihat, label pada tombol ikon, hormati reduced-motion.

## Diserahkan ke builder
- Struktur folder, nama tabel/kolom, cara query, selama aturan di atas terpenuhi dan RLS aktif.
- Detail animasi kecil dan teks mikro, mengikuti DESIGN.md.
- Penyempurnaan UI/UX saat membangun (Awab minta), selama tetap sesuai DESIGN.md dan tidak menambah fitur di luar dokumen ini.

## Urutan bangun
1. Fondasi: proyek, Supabase + tabel + RLS, sistem desain, masuk/daftar/lupa password.
2. Kebiasaan: Mulai + Atur (CRUD kebiasaan).
3. Hari Ini: rencana, centang/angka, skor, kucing, pindah hari.
4. Minggu: jadwal manual, target.
5. Rapor.
6. Timer fokus, kutipan harian, ekspor, PWA.
7. Deploy Vercel, uji di HP.
