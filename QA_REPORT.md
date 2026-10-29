# QUALITY ASSURANCE & VERIFICATION REPORT
# RoboJalur: Ekspedisi Pulau Algoritma

* **Tanggal Pengujian:** 2026-10-26
* **Lingkungan Uji:** Chromium Headless / Browser Automation subagent pada `http://localhost:8080/`
* **Status Uji Keseluruhan:** ✅ PASSED (100% Lulus Verifikasi Fungsional, Visual, & Pedagogis)

---

## 1. SUMMARY HASIL PENGUJIAN

| Kategori Pengujian | Parameter Diuji | Hasil | Catatan / Bukti |
| :--- | :--- | :---: | :--- |
| **Branding & Identitas** | Lencana BBGTK Jateng & Judul Game | **PASSED** | Lencana institusi resmi dan judul muncul elegan di Splash & Menu. |
| **Kredit Pengembang** | Nama: Riskhi Ilham Hidayat, Pengembang Teknologi Pembelajaran | **PASSED** | Modal *Tentang & Kredit* memuat data lengkap dan akurat. |
| **Asset Integrity** | Ketersediaan file grafis nyata (bukan SVG/emoji generik) | **PASSED** | Cover 16:9, Square, Hero Byte, Tileset, dan Kristal terverifikasi di disk. |
| **Rendering Canvas** | Render grid 60 FPS, tile stone path, grass, water, finish pad | **PASSED** | Grid tampil presisi dengan border emerald dan efek pendar sirkuit. |
| **Siklus Koding** | Palet Kartu -> Antrean Program -> Tracing Visual | **PASSED** | Kartu tersusun berurutan; sorot kuning aktif sinkron dengan langkah robot. |
| **Audio Synthesizer** | Web Audio API (Langkah servo, klik taktil, chime kristal, fanfare) | **PASSED** | Suara sintetis berjalan mulus tanpa jeda buffering jaringan. |
| **Toleransi Galat** | Feedback saat menabrak rintangan / tombol Debug | **PASSED** | Byte berhenti aman dengan animasi dizzy; tidak ada Game Over yang menghukum. |
| **Penyelesaian Misi** | Kondisi Menang & Modal Kemenangan Bintang 1-3 | **PASSED** | Misi Level 1 berhasil dituntaskan dengan 2-3 bintang dan statistik lengkap. |
| **Console Diagnostics** | Error, Warning, atau Memory Leaks di DevTools | **PASSED** | 0 Console Errors tercatat selama seluruh sesi pengujian. |

---

## 2. DETAIL PENGUJIAN TAHAP DEMI TAHAP (EVIDENCE-BASED QA)

### A. Pengujian Layar Splash (Splash Screen)
* **Aksi:** Memuat URL `http://localhost:8080/`.
* **Hasil:**
  - Latar belakang panorama pulau tropis (`menu-background.jpg`) tampil jernih.
  - Avatar lingkaran robot Byte dengan efek animasi melayang (*float*) berfungsi.
  - Tombol 3D besar *"🚀 SENTUH / KLIK UNTUK MEMULAI"* merespons klik dan mengaktifkan konteks audio Web Audio API.

### B. Pengujian Menu Utama & Modal Kredit
* **Aksi:** Menavigasi ke menu utama dan membuka modal *"Tentang & Kredit"*.
* **Hasil:**
  - Identitas terverifikasi:
    * **Instansi:** Balai Besar Guru dan Tenaga Kependidikan (BBGTK) Provinsi Jawa Tengah
    * **Pengembang Media:** Riskhi Ilham Hidayat (Pengembang Teknologi Pembelajaran)
  - Cover art 1:1 (`game-cover-square.jpg`) tampil proporsional tanpa distorsi rasio.
  - Tombol tutup modal berfungsi mengembalikan fokus ke menu utama.

### C. Pengujian Gameplay Level 1 ("Langkah Pertama Byte")
* **Aksi:**
  - Memilih Level 1 dari menu.
  - Memasukkan kartu perintah: `MAJU`, `MAJU`, `PUTAR KANAN`, `MAJU`, `PUTAR KIRI`, `MAJU`, `MAJU`.
  - Menekan tombol hijau *"▶ JALANKAN PROGRAM"*.
* **Hasil:**
  - Robot Byte melangkah maju 2 petak, mengambil Kristal Energi emas (`1 / 1`), berputar 90° ke bawah, melangkah ke ubin belokan, berputar 90° ke kanan, lalu melangkah 2 petak mencapai landasan transmisi surya.
  - Kursor *Visual Code Tracing* menyorot setiap kartu yang sedang dieksekusi secara *real-time*.
  - Modal *"MISI BERHASIL!"* muncul dengan animasi bintang emas dan statistik langkah.

---

## 3. PENYESUAIAN & PERBAIKAN YANG TELAH DITERAPKAN (FIXED ISSUES)
1. **Penyelarasan Orientasi Kompas Jarum Jam:**
   - Standar arah dikalibrasi menjadi `UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3` sehingga aksi *Putar Kanan* saat menghadap Timur (Kanan) secara intuitif memutar hadap robot ke Selatan (Bawah layar).
2. **Penyelarasan Skor Par Kartu:**
   - Target par Level 1 diselaraskan ke 7 kartu untuk memberikan penghargaan 3 Bintang penuh pada solusi navigasi sempurna.

---

## 4. LIMITASI & PENGEMBANGAN LANJUTAN
* Tiga level utama (*Vertical Slice*) telah selesai dan dapat dimainkan secara utuh. Untuk penambahan hingga 10–12 level di fase ekspansi penuh, pengembang cukup menambahkan konfigurasi matriks level baru pada `src/levels/levelData.js`.
