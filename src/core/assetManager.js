/**
 * KodingBot: Petualangan Pulau Algoritma
 * AssetManager — Asynchronous asset preloader and cache
 */

export class AssetManager {
  constructor() {
    this.images = {};
    this.loadedCount = 0;
    this.totalCount = 0;
    this.isLoaded = false;
  }

  getManifest() {
    return [
      { key: 'cover', src: 'assets/images/branding/game-cover-landscape.jpg', label: 'Matriks Cover Pulau Algoritma' },
      { key: 'menuBg', src: 'assets/images/backgrounds/menu-background.jpg', label: 'Panorama Markas Ekspedisi' },
      { key: 'gameBg', src: 'assets/images/backgrounds/gameplay-island-panorama.jpg', label: 'Latar Alam Pulau Tropis' },
      { key: 'tilePath', src: 'assets/images/tiles/tile-stone-seamless.jpg', label: 'Ubin Jalan Kuno Runik Seamless' },
      { key: 'tileGrass', src: 'assets/images/tiles/tile-grass-topdown.jpg', label: 'Ubin Rumput Zamrud Top-Down' },
      { key: 'tileWater', src: 'assets/images/tiles/tile-water-seamless.jpg', label: 'Ubin Air Biru Pirus Seamless' },
      { key: 'tileFinish', src: 'assets/images/tiles/tile-portal-circular.jpg', label: 'Platform Portal Finis Bundar', transparent: true },
      { key: 'tileSwitch', src: 'assets/images/tiles/tile-switch-circular.jpg', label: 'Ubin Saklar Pijak Batu Bundar', transparent: true },
      { key: 'propCrystal', src: 'assets/images/props/crystal-gem.jpg', label: 'Kristal Energi Faset', transparent: true },
      { key: 'byteCharacter', src: 'assets/images/characters/byte-hero-sprite.jpg', label: 'Karakter Robot Byte Asli', transparent: true }
    ];
  }

  createTransparentSprite(img, threshold = 230) {
    try {
      const maxDim = 256;
      const canvas = document.createElement('canvas');
      canvas.width = maxDim;
      canvas.height = maxDim;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, maxDim, maxDim);

      const imgData = ctx.getImageData(0, 0, maxDim, maxDim);
      const d = imgData.data;
      const w = maxDim;
      const h = maxDim;
      const visited = new Uint8Array(w * h);
      const queue = [];

      // Titik awal flood-fill dari 4 sudut
      const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
      for (const [cx, cy] of corners) {
        const idx = (cy * w + cx) * 4;
        if (d[idx] >= threshold && d[idx + 1] >= threshold && d[idx + 2] >= threshold) {
          queue.push(cx, cy);
          visited[cy * w + cx] = 1;
        }
      }

      // BFS Flood Fill dari latar luar
      let head = 0;
      while (head < queue.length) {
        const x = queue[head++];
        const y = queue[head++];
        const pIdx = (y * w + x) * 4;

        const r = d[pIdx];
        const g = d[pIdx + 1];
        const b = d[pIdx + 2];
        const minVal = Math.min(r, g, b);

        // Hapus latar dan lembutkan tepi (feathering)
        if (minVal >= threshold) {
          const factor = Math.max(0, 255 - (minVal - threshold) * 20);
          d[pIdx + 3] = Math.min(d[pIdx + 3], factor);
        }

        // Tetangga 4 arah
        const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nPos = ny * w + nx;
            if (!visited[nPos]) {
              const nIdx = nPos * 4;
              if (d[nIdx] >= threshold && d[nIdx + 1] >= threshold && d[nIdx + 2] >= threshold) {
                visited[nPos] = 1;
                queue.push(nx, ny);
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return canvas;
    } catch (e) {
      console.warn('[AssetManager] Gagal memproses transparansi sprite:', e);
      return img;
    }
  }

  loadAll(onProgress) {
    return new Promise((resolve) => {
      const manifest = this.getManifest();
      this.totalCount = manifest.length;
      this.loadedCount = 0;

      if (this.totalCount === 0) {
        this.isLoaded = true;
        if (onProgress) onProgress(100, 'Selesai');
        resolve();
        return;
      }

      manifest.forEach((item) => {
        const img = new Image();
        img.onload = () => {
          if (item.transparent) {
            this.images[item.key] = this.createTransparentSprite(img);
          } else {
            this.images[item.key] = img;
          }
          this.loadedCount++;
          const percent = Math.floor((this.loadedCount / this.totalCount) * 100);
          if (onProgress) {
            onProgress(percent, `Memuat: ${item.label}...`);
          }
          if (this.loadedCount >= this.totalCount) {
            this.isLoaded = true;
            resolve();
          }
        };
        img.onerror = () => {
          console.warn(`[AssetManager] Gagal memuat aset: ${item.src}. Menggunakan fallback.`);
          this.loadedCount++;
          const percent = Math.floor((this.loadedCount / this.totalCount) * 100);
          if (onProgress) {
            onProgress(percent, `Memuat: ${item.label}...`);
          }
          if (this.loadedCount >= this.totalCount) {
            this.isLoaded = true;
            resolve();
          }
        };
        img.src = item.src;
      });
    });
  }

  getImage(key) {
    return this.images[key] || null;
  }
}

export const assets = new AssetManager();
