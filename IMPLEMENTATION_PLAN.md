# TECHNICAL ARCHITECTURE & IMPLEMENTATION PLAN
# RoboJalur: Ekspedisi Pulau Algoritma

---

## 1. TECH STACK & RUNTIME DECISIONS
* **Runtime:** Universal Web Browser (HTML5 Standard)
* **Local Server Compatibility:** Laragon Web Server (`http://localhost/mpi/game3/`) & Standalone Static Browser
* **Rendering Engine:** Native HTML5 2D Canvas dengan Virtual Resolution (960x640, rasio 3:2 / 16:9 responsive auto-scaling) untuk rendering 60 FPS yang sangat ringan.
* **UI Layer:** DOM HTML5 + Modern CSS Tactile Styling (keunggulan aksesibilitas, responsivitas sentuhan, dan performa tinggi pada perangkat lab sekolah).
* **Audio Engine:** Web Audio API Procedural Synthesizer (SFX nada servo robotik, klik taktil, chime kristal harmonik, piringan saklar, dan fanfare kemenangan tanpa ketergantungan file eksternal yang lambat dimuat).
* **Code Architecture:** Modular ES6 JavaScript terpisah per tanggung jawab (*Separation of Concerns*).

---

## 2. PROJECT DIRECTORY STRUCTURE

```text
game3/
├── index.html                   # Entry point aplikasi & UI container
├── GAME_DESIGN.md               # Game Design Document
├── GAME_IDENTITY.md             # Identitas Resmi & Data Pengembang
├── ART_DIRECTION.md             # Panduan Arah Seni Visual
├── UI_UX_SPEC.md                # Spesifikasi UI/UX & Flow
├── ASSET_MANIFEST.json          # Manifest Aset Grafis & Status
├── IMPLEMENTATION_PLAN.md       # Rencana Arsitektur Teknis
├── PROJECT_STATE.md             # Status Proyek & Milestone
├── assets/
│   ├── css/
│   │   └── main.css             # Desain sistem, tombol 3D, animasi
│   └── images/
│       ├── branding/
│       │   ├── game-cover-landscape.jpg
│       │   └── game-cover-square.jpg
│       ├── backgrounds/
│       │   └── menu-background.jpg
│       ├── characters/
│       │   └── byte-hero.jpg
│       ├── tiles/
│       │   └── island-tileset.jpg
│       └── props/
│           └── crystal-energy.jpg
└── src/
    ├── config.js                # Konstanta game, konfigurasi canvas & grid
    ├── audio/
    │   └── soundManager.js      # Web Audio API Sound Synthesizer & Music
    ├── core/
    │   └── stateManager.js      # Status navigasi layar & penyimpanan progres
    ├── entities/
    │   └── byteRobot.js         # Entitas robot Byte, animasi mata, gerakan halus
    ├── grid/
    │   └── tileMap.js           # Sistem peta grid, ubin batu/air, kristal, saklar
    ├── interpreter/
    │   └── codeRunner.js        # Eksekutor perintah koding, loop tracer & debugger
    ├── levels/
    │   └── levelData.js         # Konfigurasi data level 1, 2, dan 3
    ├── ui/
    │   └── uiController.js      # Manajemen kartu perintah, slot antrean, modal
    └── main.js                  # Entry point script, render loop & inisialisasi
```

---

## 3. SEPARATION OF CONCERNS (MODULAR ARCHITECTURE)

### A. `src/interpreter/codeRunner.js` (Inti Pedagogis Koding)
* Menerima daftar kartu perintah dari UI (`MAJU`, `PUTAR_KANAN`, `PUTAR_KIRI`, `LOMPAT`, `LOOP`).
* Mengonversi kartu menjadi deretan aksi atomik sambil memetakan indeks kartu asli (*Visual Code Tracing*).
* Menjalankan program langkah demi langkah dengan jeda 400ms per aksi.
* Mengirimkan event visual (*onStepStart*, *onStepComplete*, *onError*, *onGoalReached*).
* Menyediakan fungsionalitas **Debug** untuk mengembalikan Byte ke koordinat awal dan menandai baris kartu yang bermasalah.

### B. `src/entities/byteRobot.js` (Entitas Karakter)
* Menangani koordinat grid `(x, y)` dan orientasi hadap (0: Bawah/Selatan, 1: Kanan/Timur, 2: Atas/Utara, 3: Kiri/Barat).
* Menangani interpolasi pergerakan halus (*ease-in-out transition*) antar-ubin di canvas.
* Menampilkan ekspresi visor LED Byte (Normal, Berkedip, Mengedip Riang, Pusaran Bingung saat menabrak).

### C. `src/grid/tileMap.js` (Peta Grid Pulau)
* Menggambar ubin latar belakang menggunakan tileset pulau tropis.
* Menggambar ubin jalan batu kuno dengan sirkuit bercahaya neon.
* Mengelola objek kristal energi dengan efek partikel mengapung (*floating oscillation*).
* Mengelola saklar energi (*pressure switch*): saat Byte menginjak saklar, gerbang/jembatan energi terbuka seketika.

### D. `src/audio/soundManager.js` (Audio Synthesis)
* Menggunakan Web Audio API terkalibrasi:
  - `playClick()`: Umpan balik klik taktil kartu koding.
  - `playStep()`: Frekuensi servo pendek saat robot melangkah.
  - `playTurn()`: Nada rotasi frekuensi naik.
  - `playCrystal()`: Akor arpeggio kristal berkilau (C6-E6-G6-C7).
  - `playSwitch()`: Suara saklar energi aktif.
  - `playBump()`: Nada kartun *bonk* ramah saat menabrak rintangan.
  - `playFanfare()`: Akor mayor kemenangan ceria saat menyelesaikan level.
  - `toggleMusic()`: Musik latar bertema petualangan pulau tropis sintetis.

---

## 4. VERTICAL SLICE SCOPE (3 LEVEL LENGKAP)
1. **Level 1 — "Langkah Pertama Byte":** Memperkenalkan konsep *Sequencing* (Maju, Belok Kanan, 1 Kristal, Target Par: 4 kartu).
2. **Level 2 — "Labirin Sungai Kristal":** Memperkenalkan orientasi spasial dan penghindaran rintangan air (2 Kristal, Target Par: 7 kartu).
3. **Level 3 — "Kuil Loop Kuno":** Memperkenalkan kartu *LOOP* untuk menyederhanakan perulangan langkah dan aktivasi saklar jembatan energi (3 Kristal, Target Par: 5 kartu).
