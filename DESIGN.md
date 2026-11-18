# AWWAB — DESIGN.md (v3)

Arah: **planner pagi yang cerah.** Semangat dari kuning mentega + tangerine, cozy dari ungu tua lembut dan sudut membulat. Satu elemen yang diingat: panel skor (ungu) dengan kucing yang bereaksi + bar energi bersegmen. Sisanya kalem.

Catatan: arah ini dari referensi Awab (TODU, Mood Diary, app belajar pastel), belum dibandingkan dengan situs nyata (UXKIN tidak tersambung).

## Warna (semua teks ≥ 4.5:1, sudah dicek)
| Token | Hex | Peran |
|---|---|---|
| `--butter` | #FFF4D6 | latar app |
| `--paper` | #FFFFFF | kartu baris, input |
| `--plum` | #2B2350 | teks utama, panel skor, nav bawah, tombol utama |
| `--plum-soft` | #5E5680 | teks sekunder (6.1:1 di butter) |
| `--tangerine` | #FF7A2F | primary: centang beres, progres, tombol "+" (teks di atasnya selalu plum) |
| `--lime` | #B8E04A | accent: tanda target tercapai / skor ≥ 80 |
| `--sun` | #FFE59A | angka skor di panel plum, tab aktif |
| `--lilac` | #E7E1FF | wadah "Jadwal hari ini" |
| `--mint` | #D6F2E1 | wadah "Rutin harian" |
| `--peach` | #FFDCC7 | wadah target / peringatan lembut |
| `--track` | #F1EBDD | rel bar progres yang kosong |
| `--tangerine-soft` | #FFB98F | progres sebagian (segmen bar energi, skor < 80) |

Teks berwarna: `--tangerine-ink` #B34A12, `--mint-ink` #3D6B1F, `--lilac-ink` #6A3FC9.

## Huruf
- Display: **Bricolage Grotesque** 700/800 — judul layar, angka skor, nama bagian.
- Teks: **Plus Jakarta Sans** 500/600/700/800.
- Skala: 56 (skor), 32 (judul layar), 20 (judul bagian), 16 (nama kebiasaan, body), 14, 12 (keterangan, minimal).
- Angka pakai tabular-nums. Sentence case, tanpa label huruf kapital.

## Jarak & bentuk
- Skala 4: 4, 8, 12, 16, 20, 24. Padding layar 16. Jarak antar bagian 16.
- Radius bertingkat sesuai hierarki: panel/wadah 28, kartu baris 20, tombol & pil 999.
- Bayangan: hanya nav melayang (`0 10px 24px rgba(43,35,80,.22)`). Kartu lain datar.

## Komponen
- **Baris kebiasaan:** kartu putih di dalam wadah pastel. Kiri: tombol bulat 44px (kosong = garis plum; beres = isi tangerine + centang plum, animasi "stempel" 160ms). Angka: bar progres + tombol − / + bulat 44px. Tombol sekunder (mis. "+ Rab") = pil butter berteks plum, tinggi 44px. Format hitungan selalu "2 dari 3".
- **Panel skor:** plum, skor 56px warna sun, bar energi 10 segmen (kosong → tangerine → lime saat 100), pil 7 hari.
- **Nav bawah:** melayang, plum, 4 ikon garis; tab aktif = pil sun berisi ikon + label.
- **Segmented control:** pil plum, opsi aktif sun.
- Fokus keyboard: outline 3px tangerine-ink, offset 2px. Target sentuh ≥ 44px.

## Ilustrasi & ikon
- Ikon: garis 2.2px, ujung bulat, satu set.
- Kucing: **maskot versi Gemini** (gouache bertekstur, oranye belang, moncong krem, pipi merah muda), PNG transparan. Detail aset: `claude/awwab-maskot.md`.
  - Panel skor: kepala 112px di kanan atas, ekspresi dari skor: <50 mengantuk, 50–79 senyum kecil, 80–99 senang, 100 berbinar.
  - Badan penuh (pegang centang): layar kosong / hari santai, onboarding.
  - Taruh di atas plum; di atas butter tepinya sedikit gelap.
- Tanpa emoji, tanpa gradasi dekoratif, tanpa pemandangan.

## Gerak
- Hanya karena aksi pengguna: stempel centang, segmen bar terisi. Hormati `prefers-reduced-motion`.
