/**
 * KodingBot: Petualangan Pulau Algoritma
 * Main Game Orchestrator & Loop
 */

import { CONFIG } from './config.js';
import { ByteRobot } from './entities/byteRobot.js';
import { TileMap } from './grid/tileMap.js';
import { CodeRunner } from './interpreter/codeRunner.js';
import { UIController } from './ui/uiController.js';
import { state } from './core/stateManager.js';
import { LEVELS } from './levels/levelData.js';
import { assets } from './core/assetManager.js';

class KodingBotGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.robot = null;
    this.tileMap = null;
    this.codeRunner = null;
    this.ui = null;
    
    this.lastTime = 0;
    this.currentLevel = null;
    this.lastReportedCrystals = -1;
    
    this.init();
  }

  init() {
    // Canvas sizing
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;

    // Load initial level
    this.loadLevel(state.currentLevelIndex);

    // Instantiate UI
    this.ui = new UIController(this);

    // Setup CodeRunner callbacks
    this.codeRunner.onStepStart = (cardIndex, stepIdx, totalSteps) => {
      this.ui.highlightStep(cardIndex);
      const stepText = (stepIdx !== undefined && totalSteps) ? `Langkah ${stepIdx + 1} dari ${totalSteps}` : `Langkah ${cardIndex + 1}`;
      this.ui.setStatus(`Mengeksekusi ${stepText}...`);
    };

    this.codeRunner.onConditionalBranch = (cardIndex, branch) => {
      this.ui.highlightConditionalBranch(cardIndex, branch);
    };

    this.codeRunner.onError = (message, cardIndex) => {
      this.ui.highlightError(cardIndex);
      this.ui.setStatus(message, true);
    };

    this.codeRunner.onSuccess = (stats) => {
      this.ui.setStatus("Misi Selesai: Robot Byte berhasil mencapai stasiun pendaratan dengan tepat!");
      setTimeout(() => {
        this.ui.showVictoryModal(stats);
      }, 800);
    };

    // Responsive Window Resize & Orientation Change Listeners
    window.addEventListener('resize', () => {
      if (this.tileMap) {
        this.tileMap.boardCacheDirty = true;
      }
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (this.tileMap) {
          this.tileMap.boardCacheDirty = true;
        }
      }, 150);
    });

    // Interactive Canvas Mouse Hover for Grid Tile Inspection
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.tileMap || !this.boardMetrics || state.currentScreen !== 'game') return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;

      const { offsetX, offsetY, tileSize } = this.boardMetrics;
      const gx = Math.floor((canvasX - offsetX) / tileSize);
      const gy = Math.floor((canvasY - offsetY) / tileSize);

      if (this.tileMap.isWithinBounds(gx, gy)) {
        this.tileMap.hoveredTile = { x: gx, y: gy };
      } else {
        this.tileMap.hoveredTile = null;
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      if (this.tileMap) {
        this.tileMap.hoveredTile = null;
      }
    });

    // Start render loop
    requestAnimationFrame((t) => this.loop(t));
  }

  loadLevel(levelIndex) {
    state.currentLevelIndex = levelIndex;
    this.currentLevel = LEVELS[levelIndex];
    this.lastReportedCrystals = -1;

    this.tileMap = new TileMap(this.currentLevel);
    this.robot = new ByteRobot(this.currentLevel.startPos);

    if (this.codeRunner) {
      this.codeRunner.stop();
      this.codeRunner.setContext(this.robot, this.tileMap);
    } else {
      this.codeRunner = new CodeRunner(this.robot, this.tileMap);
    }

    if (this.ui) {
      this.ui.setupLevelUI(this.currentLevel);
    }
  }

  resetLevel() {
    this.codeRunner.stop();
    this.lastReportedCrystals = -1;
    this.tileMap.init(this.currentLevel);
    this.robot.reset(this.currentLevel.startPos);
    this.ui.updateHUD(0, this.currentLevel.crystals.length);
    this.ui.setStatus("Posisi robot direset. Silakan periksa dan perbaiki urutan kartu perintah!");
  }

  runProgram(cards) {
    if (cards.length === 0) {
      this.ui.setStatus("Peringatan: Antrean kartu masih kosong. Pilih kartu perintah di sebelah kanan untuk menyusun rute.", true);
      return;
    }

    // Reset positions before executing fresh run
    this.tileMap.init(this.currentLevel);
    this.robot.reset(this.currentLevel.startPos);
    this.ui.updateHUD(0, this.currentLevel.crystals.length);
    this.ui.setStatus("Menjalankan program langkah demi langkah...");

    this.codeRunner.run(cards);
  }

  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Update
    if (state.currentScreen === 'game') {
      this.tileMap?.update(dt);
      this.robot?.update(dt);

      // Live HUD crystal count update (throttled: only updates DOM when count actually changes)
      if (this.ui && this.tileMap) {
        const count = this.tileMap.getCrystalsCollectedCount();
        if (count !== this.lastReportedCrystals) {
          this.lastReportedCrystals = count;
          this.ui.updateHUD(count, this.tileMap.crystals.length);
        }
      }
    }

    // Render
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (state.currentScreen !== 'game' || !this.tileMap || !this.robot) {
      return;
    }

    // 1. Draw Panoramic Island Environment Backdrop
    const bgImg = assets.getImage('gameBg');
    if (bgImg) {
      this.ctx.drawImage(bgImg, 0, 0, this.canvas.width, this.canvas.height);
      // Soft ambient vignette for gameplay focus
      this.ctx.fillStyle = 'rgba(11, 19, 41, 0.28)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = '#064E3B';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Calculate dynamic tile size to maximize preview area while keeping board centered
    const margin = 48;
    const availableW = this.canvas.width - margin;
    const availableH = this.canvas.height - margin;
    const dynamicTileSize = Math.min(
      Math.floor(availableW / this.tileMap.gridWidth),
      Math.floor(availableH / this.tileMap.gridHeight),
      110 // Max comfortable tile size
    );
    const tileSize = Math.max(dynamicTileSize, 64);

    const gridPxWidth = this.tileMap.gridWidth * tileSize;
    const gridPxHeight = this.tileMap.gridHeight * tileSize;
    const offsetX = Math.floor((this.canvas.width - gridPxWidth) / 2);
    const offsetY = Math.floor((this.canvas.height - gridPxHeight) / 2);
    this.boardMetrics = { offsetX, offsetY, tileSize };

    // 2. Render TileMap (Meadow, contiguous path, trees, gift box & direction pointer)
    this.tileMap.render(this.ctx, offsetX, offsetY, tileSize, this.robot);

    // 3. Render Robot Byte on top
    this.robot.render(this.ctx, offsetX, offsetY, tileSize);
  }
}

// Boot game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new KodingBotGame();
});
