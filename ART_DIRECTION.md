# ART DIRECTION & VISUAL SPECIFICATION
# RoboJalur: Ekspedisi Pulau Algoritma

---

## 1. APPROVED ART STYLE: PREMIUM CARTOON 2D
* **Definisi Gaya:** Ilustrasi kartun 2D premium modern dengan garis tepi (*clean outline*) yang rapi, pewarnaan jenuh cerah (*vibrant saturated palette*), pencahayaan matahari tropis hangat, dan ekspresi karakter yang hidup, ramah, serta menggemaskan.
* **Inspirasi Visual:** Game-game Nintendo (*Mario Kart / Captain Toad*), *Rayman Legends*, dan animasi kartun modern beresolusi tinggi.
* **Tujuan Emosional:** Mengubah kesan koding yang sering dianggap "rumit dan kaku" menjadi petualangan pulau tropis yang seru, penuh rasa ingin tahu, dan ramah anak.

---

## 2. COLOR PALETTE SYSTEM

### A. Palet Dunia & Lingkungan (Tropical Eco-Tech)
* **Lush Canopy Green:** `#10B981` (Ubin rumput tropis, vegetasi pulau)
* **Sunlit Island Sand:** `#FDE047` (Pasir pantai, tepian ubin)
* **Ancient Basalt Rock:** `#334155` (Batu reruntuhan kuno, tebing grid)
* **Crystal Cyan River:** `#06B6D4` (Air sungai jernih, jembatan energi transparan)
* **Deep Ocean Abyssal:** `#0F172A` (Latar kedalaman laut dan bingkai luar)

### B. Palet Karakter: Robot Byte
* **Solar Chibi Shell (Primer):** `#F8FAFC` (Plastik keramik putih mutiara bersih dengan aksen oranye surya `#FB923C`)
* **Interactive Cyan Visor (Mata/Layar):** `#22D3EE` (Mata digital LED yang dinamis dan ekspresif)
* **Metallic Joint Slate:** `#475569` (Sendi mekanik lembut dan roda karet kelabu)
* **Antenna Beacon Glow:** `#FACC15` (Indikator sinyal kode aktif di ujung antena)

### C. Palet Kartu Instruksi UI (High Semantic Contrast)
* **MAJU (Move Forward):** `#10B981` (Hijau zamrud — aksi positif/maju)
* **PUTAR KIRI / KANAN (Turn):** `#0284C7` (Biru cerah — perubahan arah)
* **LOMPAT / AKSI (Action):** `#F59E0B` (Kuning amber — aksi vertikal/interaksi tombol)
* **LOOP (Perulangan):** `#8B5CF6` (Ungu royalis — kartu pembungkus algoritma khusus)
* **DEBUG / STOP:** `#F43F5E` (Merah koral bersahabat — berhenti & perbaiki)

---

## 3. PERSPECTIVE & CAMERA
* **Sudut Pandang:** Top-Down 2.5D Orthographic (Tampak atas dengan kemiringan 30°–45° ke depan).
* **Fungsi Desain:** 
  - Memastikan siswa dapat melihat wajah dan mata ekspresif Byte secara jelas (tidak sekadar melihat tempurung kepalanya dari atas).
  - Menjaga garis petak grid tetap geometris dan mudah dihitung jarak langkahnya oleh anak usia 7–12 tahun.
* **Rasio Layar Target:** 16:9 Landscape ideal (1920x1080 / 1280x720) dengan *safe-area* responsif untuk layar sentuh tablet/smartphone.

---

## 4. CHARACTER PROPORTIONS & DESIGN: ROBOT BYTE
* **Rasio Tubuh:** Chibi 1:1.5 (Kepala bulat kubus bersudut tumpul besar, badan kompak, tanpa leher).
* **Fitur Utama:**
  - Layar visor hitam glossy melengkung dengan ekspresi mata LED biru cyan:
    * *Idle:* Mata berkedip ramah dengan senyum busur.
    * *Walking:* Mata melirik ke arah langkah.
    * *Thinking / Running Code:* Rangkaian biner hijau melintas cepat di layar visor.
    * *Bumping / Error:* Mata berputar membentuk pusaran lucu dengan ekspresi "*Oops!*".
    * *Victory:* Mata berbentuk bintang/hati bersorak ceria.
  - Antena lentur di atas kepala dengan lampu LED kecil yang berkedip tiap kali menerima pulsa perintah.
  - Roda penggerak bola guling (*spherical omni-wheel*) dengan suspensi mini untuk animasi melompat dan memutar yang mulus.

---

## 5. ENVIRONMENT & TILES
* **Grid Tile Size:** 64x64px hingga 80x80px (tergantung kerapatan level).
* **Lapisan Ubin:**
  * *Walkable Tiles:* Ubin batu kuno dengan ukiran sirkuit runic yang berpendar halus saat Byte menginjaknya.
  * *Energy Crystal:* Kristal prisma heksagonal melayang berputar dengan efek partikel kilauan emas.
  * *Switches:* Tombol pelat tekan bermotif baterai neon; menyala hijau saat diinjak Byte.
  * *Finish Zone:* Lingkaran landasan transmisi surya dengan cincin berputar.

---

## 6. TYPOGRAPHY SYSTEM
* **Display / Judul Layar:** `Fredoka`, `Outfit`, atau `Poppins` (Bold/Semi-bold, sudut membulat, ramah anak, kontras tinggi).
* **UI Labels & Card Commands:** `Outfit` / `Inter` (All-caps bold, jarak huruf rapat dan jelas dibaca pada tombol kecil).
* **Deskripsi Pembelajaran & Kredit:** `Nunito` / `Inter` (Font sans-serif humanist yang nyaman dibaca untuk literasi siswa SD).

---

## 7. UI VISUAL LANGUAGE & ERGONOMICS
* **Gaya Tombol:** *Tactile Toy-Like Aesthetic* — Tombol dengan sedikit bayangan bawah 3D (3D bevel/drop-shadow 4px) yang memberikan sensasi "ditekan nyata" saat disentuh.
* **Command Slots:** Slot antrean perintah menyerupai rak puzzle balok kayu/plastik modern yang saling mengunci (*interlocking tabs*).
* **Visual Tracing Indicator:** Garis penunjuk laser oranye bercahaya meluncur di atas kartu yang sedang aktif dijalankan.
* **Touch Target Standard:** Area sentuh minimal 48x48 pixel dengan jarak aman antar-tombol minimal 8 pixel guna mencegah salah tekan pada layar sentuh anak.

---

## 8. ANIMATION PRINCIPLES
* **Prinsip Squash & Stretch:** Digunakan saat Byte melompat dan mendarat untuk memberi kesan hidup dan elastis.
* **Secondary Action:** Antena bergoyang ke belakang saat Byte melaju ke depan.
* **Clear Keyframing:** Gerakan melangkah berlangsung selama 350–450 milidetik per ubin, cukup cepat agar tidak membosankan, namun cukup jelas untuk ditelusuri logika pergerakannya oleh siswa.
