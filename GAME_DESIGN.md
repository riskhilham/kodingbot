# GAME DESIGN DOCUMENT (GDD)
# RoboJalur: Ekspedisi Pulau Algoritma (RoboPath: Algorithm Island)

---

## 1. GAME IDENTITY
* **Judul Resmi:** RoboJalur: Ekspedisi Pulau Algoritma
* **Judul Alternatif (EN):** RoboPath: Algorithm Island
* **Genre:** Grid-Based Puzzle-Adventure & Visual Command Programming
* **Target Pemain:** Siswa SD / MI (Usia 7–12 Tahun / Fase B & C Kurikulum Merdeka)
* **Mata Pelajaran:** Informatika & Berpikir Komputasional (*Computational Thinking*)
* **Platform Sasaran:** Universal Web Browser (HTML5, responsif untuk Desktop Lab Komputer 16:9 maupun Tablet/Smartphone Layar Sentuh)
* **Model Interaksi:** Klik mouse, drag-and-drop kartu, dan tap sentuh layar lebar yang ramah anak.

---

## 2. PLAYER FANTASY & NARRATIVE PREMISE
Pemain berperan sebagai **Insinyur Robotika Cilik** yang ditugaskan memandu robot penjelajah mungil bertenaga surya bernama **Byte**.
Byte terdampar di **Pulau Algoritma**—sebuah pulau tropis kuno yang ditenagai oleh instalasi teknologi ramah lingkungan. Karena badai petir, sistem navigasi Byte kehilangan program intinya. Pemain harus merancang rangkaian kode instruksi blok untuk menggerakkan Byte, mengumpulkan kristal energi yang tersebar, mengaktifkan saklar jembatan kuno, dan mencapai stasiun pemancar sinyal penyelamat.

---

## 3. CORE GAMEPLAY LOOP
1. **Analisis Peta (*Decomposition & Spatial Awareness*):** 
   Pemain mengamati arena permainan (grid berbasis petak ubin isometrik/top-down), mengidentifikasi posisi awal Byte, rintangan (jurang, air, batu), posisi kristal energi, dan ubin pendaratan target.
2. **Penyusunan Perintah (*Algorithm Design & Sequencing*):**
   Pemain memilih dan menyusun balok instruksi dari *Command Tray* (Rak Perintah) ke dalam *Program Queue* (Antrean Eksekusi).
3. **Eksekusi (*Run & Visual Code Tracing*):**
   Pemain menekan tombol besar **"JALANKAN PROGRAM"**. Byte bergerak langkah demi langkah di papan grid. Setiap langkah yang sedang dijalankan disorot secara *real-time* pada antrean kartu sehingga pemain dapat melihat hubungan langsung antara "baris perintah" dan "aksi nyata".
4. **Umpan Balik & Debugging (*Debugging Loop*):**
   - **Jika Sukses:** Byte melakukan tarian kemenangan singkat, kembang api partikel muncul, dan skor 1–3 bintang diberikan berdasarkan efisiensi kode.
   - **Jika Menabrak Rintangan / Salah Arah:** Byte berhenti dengan animasi lucu (mata berkedip bingung, suara *bonk* kartun yang bersahabat). Kartu perintah yang menyebabkan kekeliruan disorot warna oranye. Pemain tidak dihukum "Game Over", melainkan diberikan tombol **"DEBUG / PERBAIKI"** untuk memodifikasi kartu dan mencoba lagi seketika.
5. **Kemajuan (*Progression*):**
   Membuka level berikutnya dengan mekanisme dan tantangan algoritma baru.

---

## 4. PRIMARY MECHANICS & INSTRUCTION CARDS

### A. Kartu Perintah Dasar
* **MAJU (Move Forward):** Menggerakkan Byte 1 langkah ke petak di depannya.
* **PUTAR KIRI (Turn Left):** Memutar hadap Byte 90° berlawanan arah jarum jam (tetap di petak yang sama).
* **PUTAR KANAN (Turn Right):** Memutar hadap Byte 90° searah jarum jam.
* **LOMPAT / AKSI (Jump / Action):** Melompati rintangan rendah 1 petak atau menginjak saklar energi kuno untuk menurunkan jembatan.

### B. Kartu Perintah Lanjutan (Tingkat Perulangan)
* **LOOP (Perulangan):** Kartu pembungkus dengan parameter pengulangan (2x, 3x, 4x).
  * Contoh: `[LOOP 3x: MAJU -> AMBIL KRISTAL]` menghemat kartu dari 6 langkah menjadi 2 langkah terbungkus.
  * Mengajarkan pengenalan pola (*Pattern Recognition*) dan penulisan kode yang efisien (*DRY - Don't Repeat Yourself*).

### C. Elemen Interaktif di Lingkungan
* **Ubin Jalan (Path Tile):** Jalur aman yang bisa dilalui.
* **Kristal Energi (Collectible):** Kristal berkilau untuk mendapatkan bintang tambahan.
* **Saklar Energi (Pressure Switch):** Ubin tombol yang membuka pintu gerbang atau memunculkan jembatan hologram.
* **Air / Jurang (Hazard):** Ubin yang tidak bisa diinjak langsung; harus dilompati atau dilewati lewat jembatan.
* **Ubin Stasiun (Finish Tile):** Zona akhir untuk menyelesaikan level.

---

## 5. WIN, LOSE, & SCORING RULES
* **Kondisi Menang (Win Condition):** Byte berhasil menginjak ubin Stasiun Akhir.
* **Sistem Bintang (3-Star Rating):**
  * ⭐ **Bintang 1 (Penyelesaian):** Berhasil mencapai stasiun akhir.
  * ⭐⭐ **Bintang 2 (Koleksi Penuh):** Berhasil mengumpulkan seluruh Kristal Energi di level tersebut.
  * ⭐⭐⭐ **Bintang 3 (Master Kode / Par Code):** Menyelesaikan misi menggunakan jumlah kartu instruksi sama dengan atau di bawah batas optimal (*Code Par Limit*).
* **Kondisi Kalah (No Punitive Failure):** Tidak ada *game over* atau kehilangan nyawa. Jika terjadi kesalahan (menabrak tebing atau keluar jalur), robot berhenti secara aman dan pemain diajak melakukan *debugging*. Ini memupuk *growth mindset*.

---

## 6. LEVEL PROGRESSION & DIFFICULTY CURVE (VERTICAL SLICE & BEYOND)

### Fase Vertical Slice (3 Level Produksi Utama):
* **Level 1: "Langkah Pertama Byte"**
  * *Konsep Belajar:* Urutan Logis Sederhana (*Sequencing*).
  * *Tantangan:* Jalur lurus dan belokan tunggal dengan 1 Kristal Energi.
  * *Kartu Tersedia:* Maju, Putar Kanan, Putar Kiri.
* **Level 2: "Labirin Sungai Kristal"**
  * *Konsep Belajar:* Orientasi Spasial & Penghindaran Rintangan.
  * *Tantangan:* Jalur berliku di sekitar danau tropis, mengumpulkan 2 Kristal Energi, menghindari tercebur.
  * *Kartu Tersedia:* Maju, Putar Kanan, Putar Kiri, Lompat.
* **Level 3: "Kuil Loop Kuno"**
  * *Konsep Belajar:* Pengenalan Pola & Perulangan (*Looping*).
  * *Tantangan:* Rute berulang mengelilingi kuil, mengaktifkan saklar jembatan, dan meraih bintang efisiensi kode dengan kartu LOOP.
  * *Kartu Tersedia:* Maju, Putar Kanan, Putar Kiri, Aksi, LOOP.

---

## 7. FEEDBACK SYSTEMS & AUDIO-VISUAL CUES
* **Visual Tracing:** Saat eksekusi kode, kursor penunjuk cahaya berjalan melintasi kartu yang sedang aktif sehingga siswa melihat proses *interpretasi perintah komputer*.
* **Status Robot:** Indikator animasi Byte (tersenyum saat melangkah, kaget lucu saat menabrak, bersorak saat menang).
* **Efek Suara (SFX):**
  * Klik/pasang kartu: Suara *snap* mekanik yang renyah (*tactile click*).
  * Gerakan robot: Suara langkah servo hidrolik ceria.
  * Ambil kristal: Nada *chime* harmonis yang memuaskan.
  * Saklar aktif: Suara tenaga listrik sci-fi lembut.
  * Sukses: Fanfare kemenangan nada mayor ceria.
* **Musik Latar (BGM):** Melodi santai bergaya petualangan tropis akustik dengan instrumen marimba dan synthesizer ceria.

---

## 8. INTEGRASI PEMBELAJARAN (PEDAGOGICAL VALUE)
Game ini menerapkan prinsip **4 Fondasi Berpikir Komputasional**:
1. **Dekomposisi:** Memecah perjalanan Byte dari titik start ke finish menjadi langkah-langkah kecil per ubin.
2. **Pengenalan Pola:** Mengenali gerakan yang berulang (misal: maju 3 kali atau pola tangga) untuk disederhanakan.
3. **Abstraksi:** Mengabaikan elemen dekoratif lingkungan dan fokus pada ubin grid yang dapat dilalui serta objek fungsional.
4. **Algoritma & Debugging:** Menyusun resep langkah berurutan yang logis dan kemampuan membaca ulang alur logika saat hasil tidak sesuai harapan.

---

## 9. SESI BERMAIN & REPLAYABILITY
* **Durasi per Level:** 1.5 – 3 menit.
* **Durasi Sesi:** 15 – 25 menit.
* **Faktor Replayability:** Tantangan meraih Bintang 3 (*Par Code*) mendorong pemain untuk kembali ke level yang sudah diselesaikan guna menemukan algoritma yang lebih ringkas dan elegan menggunakan *Loop*.
