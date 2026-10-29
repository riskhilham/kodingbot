/**
 * KodingBot: Petualangan Pulau Algoritma
 * Level Data Specifications — 30 Progressive Levels across 5 Thematic Zones
 */

import { CONFIG } from '../config.js';

const C = CONFIG.COMMANDS;
const D = CONFIG.DIRECTIONS;

export const LEVELS = [
  // --- ZONA 1: PANTAI FONDASI (Level 1–6) ---
  {
    id: 1,
    title: "Langkah Pertama Byte",
    world: "Pantai Fondasi",
    concept: "Urutan Langkah Logis (Sequencing)",
    description: "Bantu robot Byte melangkah lurus di atas jalan batu untuk mengambil kristal energi pertama dan mencapai stasiun akhir!",
    hint: "Byte sudah menghadap ke kanan. Pasang kartu Maju sebanyak 4 kali untuk mengumpulkan kristal dan masuk ke portal.",
    gridWidth: 7,
    gridHeight: 5,
    startPos: { x: 1, y: 2, dir: D.RIGHT },
    finishPos: { x: 5, y: 2 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 8, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c1_1', x: 3, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD],
    parCards: 4
  },
  {
    id: 2,
    title: "Belokan Pertama",
    world: "Pantai Fondasi",
    concept: "Orientasi Spasial (Sudut 90°)",
    description: "Jalur batu berbelok ke arah selatan. Putar orientasi robot Byte ke kanan sebelum melanjutkan langkah!",
    hint: "Maju 3 langkah sampai di ujung tikungan, lalu belokkan robot ke kanan sebelum maju lagi.",
    gridWidth: 7,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 4, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 2, 2],
      [2, 2, 2, 2, 1, 2, 2],
      [2, 2, 2, 2, 8, 2, 2],
      [2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c2_1', x: 4, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT],
    parCards: 6
  },
  {
    id: 3,
    title: "Tikungan Pesisir",
    world: "Pantai Fondasi",
    concept: "Dekomposisi Tikungan Ganda",
    description: "Jalur berliku menuntut koordinasi belok kanan dan belok kiri secara tepat untuk meraih seluruh kristal pantai.",
    hint: "Amati arah hadap awal Byte. Byte menghadap ke ATAS, susun belokan kiri dan kanan sesuai alur jalan batu.",
    gridWidth: 7,
    gridHeight: 5,
    startPos: { x: 1, y: 3, dir: D.UP },
    finishPos: { x: 5, y: 1 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 2, 8, 2],
      [2, 1, 2, 1, 1, 1, 2],
      [2, 1, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c3_1', x: 3, y: 1 }, { id: 'c3_2', x: 5, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT],
    parCards: 12
  },
  {
    id: 4,
    title: "Jalur U-Turn Kerang",
    world: "Pantai Fondasi",
    concept: "Orientasi Balik Arah (180°)",
    description: "Ujung pantai buntu! Bantu Byte memutar balik arah untuk kembali menyusuri dermaga bawah menuju portal finis.",
    hint: "Untuk memutar balik ke arah sebaliknya di ujung jalan, gunakan dua kali Putar Kanan berturut-turut.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 1, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 1, 2],
      [2, 2, 2, 2, 2, 2, 1, 2],
      [2, 8, 1, 1, 1, 1, 1, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c4_1', x: 4, y: 1 }, { id: 'c4_2', x: 4, y: 3 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT],
    parCards: 13
  },
  {
    id: 5,
    title: "Zig-Zag Dermaga Pasir",
    world: "Pantai Fondasi",
    concept: "Pola Gerak Berundak",
    description: "Jalur batu berundak zig-zag melintasi tepian pantai berpasir emas. Susun pergantian arah belok yang konsisten!",
    hint: "Kombinasikan maju, belok kanan, maju, lalu belok kiri untuk menapaki undakan tangga.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 3, dir: D.RIGHT },
    finishPos: { x: 6, y: 1 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 1, 1, 8, 2],
      [2, 2, 1, 1, 1, 2, 2, 2],
      [2, 1, 1, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c5_1', x: 2, y: 3 }, { id: 'c5_2', x: 4, y: 1 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT],
    parCards: 10
  },
  {
    id: 6,
    title: "Labirin Karang Bintang",
    world: "Pantai Fondasi",
    concept: "Dekomposisi Labirin Multi-Kristal",
    description: "Tiga kristal energi tersebar di celah karang pantai. Rencanakan rute terlengkap sebelum melangkah ke portal!",
    hint: "Ambil kristal di lorong atas terlebih dahulu sebelum berbelok menuju lorong bawah.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 6, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 2, 2, 2],
      [2, 2, 1, 2, 1, 1, 1, 2],
      [2, 2, 1, 1, 1, 2, 8, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c6_1', x: 3, y: 1 }, { id: 'c6_2', x: 2, y: 3 }, { id: 'c6_3', x: 5, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT],
    parCards: 14
  },

  // --- ZONA 2: TELUK RINTANGAN (Level 7–12) ---
  {
    id: 7,
    title: "Lompatan Perdana",
    world: "Teluk Rintangan",
    concept: "Pengenalan Balok Lompat (Jump)",
    description: "Aliran air laut membelah jalan batu! Gunakan kartu LOMPAT untuk melompati celah air 1 petak dengan mulus.",
    hint: "Kartu Lompat akan menerbangkan robot melewati 1 petak air dan mendarat di petak batu 2 langkah di depannya.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 2, dir: D.RIGHT },
    finishPos: { x: 6, y: 2 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 3, 2, 2, 2, 2],
      [2, 1, 1, 3, 1, 1, 8, 2],
      [2, 2, 2, 3, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c7_1', x: 4, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP],
    parCards: 4
  },
  {
    id: 8,
    title: "Selat Karang Ganda",
    world: "Teluk Rintangan",
    concept: "Lompatan Bergantian & Penjagaan Irama",
    description: "Dua celah kanal air memisahkan pulau. Gabungkan langkah maju dan lompatan terencana!",
    hint: "Maju ke tepi celah pertama, lompat, maju satu langkah, lalu lompat melintasi celah kedua.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 2, dir: D.RIGHT },
    finishPos: { x: 6, y: 2 },
    layout: [
      [2, 2, 3, 2, 3, 2, 2, 2],
      [2, 2, 3, 2, 3, 2, 2, 2],
      [2, 1, 3, 1, 3, 1, 8, 2],
      [2, 2, 3, 2, 3, 2, 2, 2],
      [2, 2, 3, 2, 3, 2, 2, 2]
    ],
    crystals: [{ id: 'c8_1', x: 3, y: 2 }, { id: 'c8_2', x: 5, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP],
    parCards: 4
  },
  {
    id: 9,
    title: "Lompat Batu Sungai",
    world: "Teluk Rintangan",
    concept: "Kombinasi Belokan & Lompatan",
    description: "Perpaduan navigasi tikungan dan lompatan celah sungai. Jangan sampai mendarat di tepian rumput!",
    hint: "Pastikan Byte tepat menghadap ke celah air sebelum melompat, lalu belok menuju portal finis.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 3, dir: D.UP },
    finishPos: { x: 6, y: 1 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 1, 3, 1, 8, 2],
      [2, 1, 1, 1, 3, 2, 2, 2],
      [2, 1, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c9_1', x: 1, y: 2 }, { id: 'c9_2', x: 3, y: 1 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP],
    parCards: 8
  },
  {
    id: 10,
    title: "Jalur Cabang Teluk",
    world: "Teluk Rintangan",
    concept: "Analisis Rute Alternatif & Efisiensi",
    description: "Ada dua jalan menuju portal: rute memutar yang panjang atau rute pintas melompati selat!",
    hint: "Rute pintas melompati air membutuhkan lebih sedikit kartu untuk mencapai Target Par 4 kartu.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 2, dir: D.RIGHT },
    finishPos: { x: 6, y: 2 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 2, 2],
      [2, 1, 1, 3, 1, 1, 8, 2],
      [2, 2, 2, 3, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c10_1', x: 2, y: 2 }, { id: 'c10_2', x: 5, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP],
    parCards: 4
  },
  {
    id: 11,
    title: "Batu Loncatan Muara",
    world: "Teluk Rintangan",
    concept: "Pendaratan Beruntun Presisi",
    description: "Rangkaian ubin lompat di muara sungai menantang ketepatan koordinat robot Byte.",
    hint: "Lompat melintasi celah air pertama, belok kanan, lalu lompat lagi menuju ubin finis.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 4, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 3, 1, 1, 2, 2, 2],
      [2, 2, 2, 2, 3, 2, 2, 2],
      [2, 2, 2, 2, 8, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c11_1', x: 3, y: 1 }, { id: 'c11_2', x: 4, y: 1 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP],
    parCards: 5
  },
  {
    id: 12,
    title: "Labirin Arus Pasang",
    world: "Teluk Rintangan",
    concept: "Evaluasi Rute Berisiko Tinggi",
    description: "Air pasang mengepung tiga kristal energi! Buat algoritma lengkap untuk memandu Byte melompat dan bermanuver.",
    hint: "Ambil kristal di pulau tengah sebelum melompat ke seberang dermaga finis.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 3, dir: D.UP },
    finishPos: { x: 6, y: 1 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 1, 1, 3, 1, 8, 2],
      [2, 1, 3, 1, 2, 2, 2, 2],
      [2, 1, 2, 1, 1, 1, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c12_1', x: 1, y: 2 }, { id: 'c12_2', x: 3, y: 2 }, { id: 'c12_3', x: 5, y: 1 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP],
    parCards: 11
  },

  // --- ZONA 3: LEMBAH PERULANGAN (Level 13–18) ---
  {
    id: 13,
    title: "Koridor Panjang Berulang",
    world: "Lembah Perulangan",
    concept: "Pengenalan Balok Ulangi (Loop)",
    description: "Jalur lurus panjang sejauh 5 petak. Gunakan kartu ULANGI agar susunan kartu tetap ringkas dan elegan!",
    hint: "Cukup pasang 1 kartu Ulangi dan atur angka putaran menjadi 5x Maju.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 2, dir: D.RIGHT },
    finishPos: { x: 6, y: 2 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 8, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c13_1', x: 4, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.LOOP],
    parCards: 2
  },
  {
    id: 14,
    title: "Tangga Rerumputan",
    world: "Lembah Perulangan",
    concept: "Pola Berulang Multi-Arah",
    description: "Mendaki bukit berundak dengan pola gerak identik. Kenali pola berulangnya untuk menghemat kartu!",
    hint: "Amati polanya: Byte melangkah [Maju 1, Belok Kanan, Maju 1, Belok Kiri]. Ulangi pola ini!",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 3, dir: D.UP },
    finishPos: { x: 5, y: 1 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 1, 8, 2, 2],
      [2, 2, 1, 1, 1, 2, 2, 2],
      [2, 1, 1, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c14_1', x: 2, y: 2 }, { id: 'c14_2', x: 4, y: 1 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.LOOP],
    parCards: 6
  },
  {
    id: 15,
    title: "Persegi Monumen Kuno",
    world: "Lembah Perulangan",
    concept: "Pola Geometris Persegi 4 Sisi",
    description: "Mengelilingi monumen batu kuno berukuran 3x3 petak untuk mengumpulkan 3 kristal suci.",
    hint: "Pola sisi persegi selalu sama: Maju 2 langkah lalu Belok Kanan. Ulangi pola ini!",
    gridWidth: 7,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 1, y: 2 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 2, 2],
      [2, 8, 2, 2, 1, 2, 2],
      [2, 1, 1, 1, 1, 2, 2],
      [2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c15_1', x: 4, y: 1 }, { id: 'c15_2', x: 4, y: 3 }, { id: 'c15_3', x: 2, y: 3 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.LOOP],
    parCards: 6
  },
  {
    id: 16,
    title: "Lompatan Berirama",
    world: "Lembah Perulangan",
    concept: "Perulangan Berisi Aksi Lompat",
    description: "Deretan kanal air berirama teratur memisahkan lembah. Masukkan aksi Lompat ke dalam balok Loop!",
    hint: "Masukkan perintah Lompat ke dalam balok Ulangi untuk melintasi kanal air berturut-turut.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 2, dir: D.RIGHT },
    finishPos: { x: 6, y: 2 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 3, 2, 3, 2, 2, 2],
      [2, 1, 3, 1, 3, 1, 8, 2],
      [2, 2, 3, 2, 3, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c16_1', x: 3, y: 2 }, { id: 'c16_2', x: 5, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.LOOP],
    parCards: 4
  },
  {
    id: 17,
    title: "Spiral Hutan Bambu",
    world: "Lembah Perulangan",
    concept: "Loop Bertingkat & Jalur Konsentris",
    description: "Jalur spiral berputar masuk menuju jantung hutan bambu rahasia. Kumpulkan seluruh kristal di pusat spiral!",
    hint: "Gunakan Loop pada sisi luar yang panjang, lalu belok dan susun langkah masuk.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 3, y: 2 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 2, 2],
      [2, 2, 2, 8, 1, 1, 2, 2],
      [2, 2, 2, 1, 1, 1, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c17_1', x: 4, y: 1 }, { id: 'c17_2', x: 5, y: 3 }, { id: 'c17_3', x: 4, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.LOOP],
    parCards: 6
  },
  {
    id: 18,
    title: "Uji Efisiensi Target Par",
    world: "Lembah Perulangan",
    concept: "Optimasi Computational Thinking",
    description: "Tantangan bintang 3! Hanya algoritma teringkas menggunakan Loop cerdas yang dapat meraih skor Target Par.",
    hint: "Kombinasikan Loop 4x Maju dengan belokan tepat untuk memangkas jumlah kartu menjadi 4 saja.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 3, dir: D.UP },
    finishPos: { x: 6, y: 1 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 8, 2],
      [2, 1, 2, 2, 2, 2, 2, 2],
      [2, 1, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c18_1', x: 1, y: 1 }, { id: 'c18_2', x: 3, y: 1 }, { id: 'c18_3', x: 5, y: 1 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.LOOP],
    parCards: 4
  },

  // --- ZONA 4: HUTAN SENSOR LOGIKA (Level 19–24) ---
  {
    id: 19,
    title: "Sensor Celah Pertama",
    world: "Hutan Sensor Logika",
    concept: "Pengenalan Percabangan Kondisional (If-Else)",
    description: "Byte dilengkapi sensor pintar! Kartu 'JIKA RINTANGAN' otomatis melompat bila ada celah air, atau maju bila jalan aman.",
    hint: "Pasang kartu 'JIKA RINTANGAN' di depan celah air. Robot akan otomatis memilih melompat!",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 2, dir: D.RIGHT },
    finishPos: { x: 6, y: 2 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 3, 2, 2, 2, 2],
      [2, 1, 1, 3, 1, 1, 8, 2],
      [2, 2, 2, 3, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c19_1', x: 4, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.IF_OBSTACLE],
    parCards: 4
  },
  {
    id: 20,
    title: "Jalur Rintangan Acak",
    world: "Hutan Sensor Logika",
    concept: "Keputusan Otonom Adaptif",
    description: "Jalur hutan memiliki celah air tak terduga. Gunakan logika kondisional agar Byte melangkah secara adaptif.",
    hint: "Kartu Jika Rintangan akan otomatis membedakan petak tanah biasa vs celah air di depan.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 2, dir: D.RIGHT },
    finishPos: { x: 6, y: 2 },
    layout: [
      [2, 2, 2, 3, 2, 3, 2, 2],
      [2, 2, 2, 3, 2, 3, 2, 2],
      [2, 1, 1, 3, 1, 3, 8, 2],
      [2, 2, 2, 3, 2, 3, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c20_1', x: 4, y: 2 }, { id: 'c20_2', x: 6, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.IF_OBSTACLE],
    parCards: 5
  },
  {
    id: 21,
    title: "Dua Pilihan Rute Sensor",
    world: "Hutan Sensor Logika",
    concept: "Kombinasi Belokan & Sensor Lingkungan",
    description: "Navigasi tikungan lembah berawa. Uji deteksi halangan di tikungan sebelum Byte melompat ke seberang.",
    hint: "Belokkan robot menghadap ke arah jalan batu, lalu biarkan kartu logika mengeksekusi langkah aman.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 3, dir: D.UP },
    finishPos: { x: 6, y: 1 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 1, 1, 3, 1, 8, 2],
      [2, 1, 1, 2, 2, 2, 2, 2],
      [2, 1, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c21_1', x: 1, y: 2 }, { id: 'c21_2', x: 3, y: 1 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.IF_OBSTACLE],
    parCards: 7
  },
  {
    id: 22,
    title: "Sensor di Dalam Loop",
    world: "Hutan Sensor Logika",
    concept: "Loop Bersarang Kondisional (While-like Flow)",
    description: "Tingkat mahir SD: Masukkan kartu 'JIKA RINTANGAN' ke dalam balok ULANGI! Byte akan otomatis menjelajah dan melompati setiap celah.",
    hint: "Ulangi 4x kartu 'Jika Rintangan'. Byte akan otomatis maju jika jalan aman, dan melompat jika bertemu air!",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 2, dir: D.RIGHT },
    finishPos: { x: 6, y: 2 },
    layout: [
      [2, 2, 2, 3, 2, 3, 2, 2],
      [2, 2, 2, 3, 2, 3, 2, 2],
      [2, 1, 1, 3, 1, 3, 8, 2],
      [2, 2, 2, 3, 2, 3, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c22_1', x: 2, y: 2 }, { id: 'c22_2', x: 4, y: 2 }, { id: 'c22_3', x: 6, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.LOOP, C.IF_OBSTACLE],
    parCards: 3
  },
  {
    id: 23,
    title: "Pembersih Rintangan Hutan",
    world: "Hutan Sensor Logika",
    concept: "Pola Jalur Campuran Dinamis",
    description: "Jalur berliku dengan celah air bervariasi. Gunakan balok kondisi untuk menyederhanakan rute rumit menjadi elegan.",
    hint: "Amati petak-petak di mana Byte harus melompat vs di mana Byte harus melangkah biasa.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 6, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 3, 1, 1, 2, 2, 2],
      [2, 2, 2, 2, 1, 3, 1, 2],
      [2, 2, 2, 2, 2, 2, 8, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c23_1', x: 3, y: 1 }, { id: 'c23_2', x: 4, y: 2 }, { id: 'c23_3', x: 6, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.IF_OBSTACLE],
    parCards: 7
  },
  {
    id: 24,
    title: "Lembah Kabut Otonom",
    world: "Hutan Sensor Logika",
    concept: "Navigasi Cerdas Menyeluruh",
    description: "Ujian Zona 4! Susun algoritma adaptif yang membimbing Byte melintasi kabut tebal hutan sensor menuju portal.",
    hint: "Manfaatkan kartu logika kondisional di lorong lurus untuk memangkas Target Par kartu.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 3, dir: D.UP },
    finishPos: { x: 6, y: 1 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 1, 3, 1, 1, 8, 2],
      [2, 1, 1, 2, 2, 2, 2, 2],
      [2, 1, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c24_1', x: 1, y: 2 }, { id: 'c24_2', x: 4, y: 1 }, { id: 'c24_3', x: 5, y: 1 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.LOOP, C.IF_OBSTACLE],
    parCards: 6
  },

  // --- ZONA 5: KUIL MASTER ALGORITMA (Level 25–30) ---
  {
    id: 25,
    title: "Gerbang Kuil Kuno",
    world: "Kuil Master Algoritma",
    concept: "Sintesis Struktur Labirin Simetris",
    description: "Selamat datang di Kuil Algoritma! Gerbang kuno dijaga jalan simetris dengan tiga kristal sakral.",
    hint: "Gunakan Loop untuk melintasi sayap kiri kuil, lalu belok menuju pilar utama.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 3, dir: D.UP },
    finishPos: { x: 6, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 8, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c25_1', x: 1, y: 1 }, { id: 'c25_2', x: 4, y: 1 }, { id: 'c25_3', x: 6, y: 1 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.LOOP],
    parCards: 7
  },
  {
    id: 26,
    title: "Lintasan Karang Mistis",
    world: "Kuil Master Algoritma",
    concept: "Integrasi Loop & Lompatan Celah",
    description: "Kanal kuil dialiri air mistis bercahaya biru. Seberangi dengan perpaduan balok Loop dan Lompat!",
    hint: "Rancang urutan yang efisien untuk melompati selat dan bermanuver di lorong kuil.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 6, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 3, 1, 1, 2, 2],
      [2, 2, 2, 2, 2, 1, 2, 2],
      [2, 2, 2, 2, 2, 1, 8, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c26_1', x: 2, y: 1 }, { id: 'c26_2', x: 5, y: 1 }, { id: 'c26_3', x: 5, y: 3 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.LOOP],
    parCards: 8
  },
  {
    id: 27,
    title: "Sakelar Jembatan Kuil",
    world: "Kuil Master Algoritma",
    concept: "Interaksi Objek Sakelar & Jembatan",
    description: "Jembatan batu terputus! Injak sakelar energi (lingkaran kuning) untuk memunculkan jembatan penyeberangan.",
    hint: "Arahkan Byte menuju petak sakelar terlebih dahulu. Jembatan otomatis terhubung setelah sakelar terinjak!",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 4, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 5, 1, 1, 2, 2, 2],
      [2, 2, 2, 2, 6, 2, 2, 2],
      [2, 2, 2, 2, 8, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c27_1', x: 3, y: 1 }, { id: 'c27_2', x: 4, y: 1 }, { id: 'c27_3', x: 4, y: 2 }],
    switches: [
      { x: 2, y: 1, bridgeX: 4, bridgeY: 2, activated: false }
    ],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.LOOP],
    parCards: 7
  },
  {
    id: 28,
    title: "Labirin Tiga Pilar Energi",
    world: "Kuil Master Algoritma",
    concept: "Dekomposisi Labirin Tingkat Mahir",
    description: "Tiga kristal kuno terletak di sudut-sudut kuil. Uraikan menjadi sub-masalah kecil sebelum merakit kodenya!",
    hint: "Ambil kristal atas, lalu turun melintasi lorong tengah untuk meraih dua kristal lainnya.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 6, y: 2 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 2, 1, 1, 2],
      [2, 1, 2, 1, 1, 1, 8, 2],
      [2, 1, 1, 1, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c28_1', x: 3, y: 1 }, { id: 'c28_2', x: 2, y: 3 }, { id: 'c28_3', x: 5, y: 2 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.LOOP],
    parCards: 11
  },
  {
    id: 29,
    title: "Ujian Logika Byte",
    world: "Kuil Master Algoritma",
    concept: "Sintesis Penuh: Sequencing + Jump + Loop + Sensor",
    description: "Seluruh keterampilan koding yang dipelajari diuji di sini: sakelar jembatan, celah air, dan belokan presisi!",
    hint: "Aktifkan sakelar jembatan, gunakan sensor jika rintangan untuk melompati air, dan capai portal kuil.",
    gridWidth: 8,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 6, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 5, 2, 1, 1, 2, 2],
      [2, 2, 1, 6, 1, 3, 1, 2],
      [2, 2, 2, 2, 2, 2, 8, 2],
      [2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c29_1', x: 2, y: 2 }, { id: 'c29_2', x: 4, y: 2 }, { id: 'c29_3', x: 6, y: 2 }],
    switches: [
      { x: 2, y: 1, bridgeX: 3, bridgeY: 2, activated: false }
    ],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.LOOP, C.IF_OBSTACLE],
    parCards: 9
  },
  {
    id: 30,
    title: "Gerbang Algoritma Abadi",
    world: "Kuil Master Algoritma",
    concept: "Kelulusan Berpikir Komputasional (Grand Master)",
    description: "Level pamungkas Pulau Algoritma! Kumpulkan 3 Kristal Legendaris dan bawa robot Byte membuka Gerbang Abadi!",
    hint: "Kombinasikan Loop efisien dengan lompatan presisi untuk menuntaskan ekspedisi agung dan raih gelar Master KodingBot!",
    gridWidth: 9,
    gridHeight: 5,
    startPos: { x: 1, y: 1, dir: D.RIGHT },
    finishPos: { x: 7, y: 3 },
    layout: [
      [2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 3, 1, 1, 2],
      [2, 2, 2, 2, 1, 2, 2, 1, 2],
      [2, 2, 2, 2, 1, 1, 1, 8, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2]
    ],
    crystals: [{ id: 'c30_1', x: 4, y: 1 }, { id: 'c30_2', x: 4, y: 3 }, { id: 'c30_3', x: 6, y: 3 }],
    switches: [],
    availableCards: [C.FORWARD, C.TURN_RIGHT, C.TURN_LEFT, C.JUMP, C.LOOP, C.IF_OBSTACLE],
    parCards: 9
  }
];
