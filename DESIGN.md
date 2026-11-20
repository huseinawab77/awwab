# AWWAB — DESIGN.md (v4)

Arah: **planner pagi yang cerah dan rapi.** Latar krem polos, kartu putih, satu panel gelap (skor) dengan kucing full body yang bereaksi. Setiap kebiasaan punya ikon dan warnanya sendiri, jadi daftar kebaca sekilas. Warna dan font mengikuti aturan taste-skill (Leonxlnx/taste-skill): warna milik AWWAB lewat `start.mjs brand`, tanpa ungu atau lavender, font dari undian skill.

Referensi pola: layar habit tracker "Steadyfit" dari Made Good Designs (ikon di kotak warna, centang di kanan, baris beres dicoret, strip minggu berupa cincin).

## Warna (teks ≥ 4.5:1)
| Token | Hex | Peran |
|---|---|---|
| `butter` | #FFF4D6 | latar app (datar) |
| `paper` | #FFFFFF | kartu, input |
| `ink` | #1F2A3D | teks utama, panel skor, nav bawah, tombol utama gelap |
| `muted` | #5B6577 | teks sekunder |
| `ink-raised` / `ink-muted` | #2C3647 / #3A4558 | permukaan di atas panel gelap |
| `on-ink` | #C9CED8 | teks sekunder di panel gelap |
| `line` | #E8DFC6 | garis tombol sekunder dan input |
| `tangerine` | #FF7A2F | aksi utama: centang beres, progres, tombol "+" (teks di atasnya selalu ink) |
| `leaf` / `lime` | #7FB82E / #B8E04A | target tercapai, skor ≥ 80 |
| `sun` | #FFE59A | angka skor di panel gelap, tab aktif |
| `track` | #F1EBDD | rel bar dan cincin yang kosong |

Warna chip ikon (latar / garis ikon), dipilih per kebiasaan: peach #FFE1CC / #9E3F0C, mint #D9F0E1 / #2E6A40, sky #DCE9F7 / #1F5590, sun #FFEDB3 / #7A5300, rose #FADDE3 / #9C2F4A, teal #D3EFEC / #0F625C.

## Huruf
- **Schibsted Grotesk** (variabel, self-hosted) untuk semuanya.
- Judul 500 dengan tracking rapat (-0.035em di 32px), teks 400, label dan tombol 500–600.
- Skala: 72 (skor), 32 (judul layar), 20 (judul bagian), 16 (nama kebiasaan, body), 14, 13, 12 (minimal).
- Angka pakai tabular-nums. Sentence case.

## Jarak & bentuk
- Skala 4: 4, 8, 12, 16, 20, 24. Padding layar 16. Jarak antar bagian 14–16.
- Radius: panel 24, kartu 20, chip ikon dan tombol kecil 14, pil 999.
- Maksimal dua lapis kotak. Judul bagian langsung di latar, tanpa wadah berwarna.
- Bayangan: kartu `0 1px 2px / 0 6px 16px rgba(31,42,61,.05–.06)`, nav melayang `0 10px 24px rgba(31,42,61,.25)`.

## Komponen
- **Baris kebiasaan:** kartu putih. Kiri chip ikon 44px (warna kebiasaan). Tengah nama 16/600 + keterangan 13 muted (bar progres untuk angka). Kanan: tombol centang bulat 44px (kosong = garis 2px #D9CDAE; beres = isi tangerine + centang ink, animasi pop). Baris centang yang beres: nama muted dan dicoret. Angka: tombol − (garis) dan + (tangerine), 44px, radius 14.
- **Panel skor:** ink, skor 72px warna sun, kalimat status, bar progres tunggal (tangerine → lime saat 100), kucing full body di kanan.
- **Strip minggu:** 7 cincin skor 40px di bawah panel; hari ini cincin terisi ink.
- **Nav bawah:** melayang, ink, 4 tab ikon + label; tab aktif = latar sun.
- **Tombol sekunder** (mis. "+ Kam"): garis `line`, latar putih, tinggi 44px.
- Fokus keyboard: outline 3px ink, offset 2px. Target sentuh ≥ 44px.

## Ilustrasi & ikon
- Ikon: **Lucide**, garis 2px, ujung bulat. Ikon kebiasaan dipilih dari 24 ikon dalam 3 kelompok.
- Kucing: **vektor full body** (`src/components/Mascot.tsx`), oranye belang, moncong krem, pipi pink. Lima emosi dari skor hari ini: pagi (belum ada yang beres, melambai), ngantuk (<50), senyum (50–79), senang (80–99, kedua tangan naik), berbinar (100, melompat + bintang).
- Kepala kucing PNG lama masih dipakai di Masuk, Mulai, Kutipan, dan Rapor.
- Tanpa emoji, tanpa gradasi dekoratif.

## Gerak
- Kucing: napas, kedip, ekor goyang terus-menerus dan pelan; lompat sekali saat emosinya berubah.
- Lainnya hanya karena aksi pengguna: tombol mengecil 0.96 saat ditekan, centang pop 200ms, bar dan skor bergerak 240–320ms ease-out, konfeti saat skor 100.
- Tidak ada animasi saat scroll. `prefers-reduced-motion` mematikan semuanya.
