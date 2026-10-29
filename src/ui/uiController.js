/**
 * KodingBot: Petualangan Pulau Algoritma
 * UI Controller — Command card tray, program queue, modal popups & touch ergonomic bindings
 */

import { CONFIG } from '../config.js';
import { sounds } from '../audio/soundManager.js';
import { state } from '../core/stateManager.js';
import { LEVELS } from '../levels/levelData.js';
import { assets } from '../core/assetManager.js';
import { safeStorage } from '../core/storage.js';

export class UIController {
  constructor(game) {
    this.game = game;
    this.programCards = []; // Array of { type, count, bodyCards, thenCards, elseCards }
    this.activeCardIndex = -1;
    this.errorCardIndex = -1;
    this.activeBranch = null;
    this.draggedItem = null;
    
    this.initElements();
    this.bindEvents();
    this.initDragAndDrop();
  }

  initElements() {
    // Screens & Modals
    this.screenSplash = document.getElementById('screen-splash');
    this.screenMenu = document.getElementById('screen-menu');
    this.screenLevelSelect = document.getElementById('screen-level-select');
    this.screenGame = document.getElementById('screen-game');
    this.modalVictory = document.getElementById('modal-victory');
    this.modalHowTo = document.getElementById('modal-how-to');
    this.modalAbout = document.getElementById('modal-about');
    this.modalLevelIntro = document.getElementById('modal-level-intro');
    this.modalLevelHint = document.getElementById('modal-level-hint');

    // Splash Loading Elements
    this.splashLoadingBox = document.getElementById('splash-loading-box');
    this.splashProgressBar = document.getElementById('splash-progress-bar');
    this.splashProgressPercent = document.getElementById('splash-progress-percent');
    this.splashStatusText = document.getElementById('splash-status-text');
    this.btnStartSplash = document.getElementById('btn-start-splash');

    // Game HUD
    this.hudLevelTitle = document.getElementById('hud-level-title');
    this.hudLevelConcept = document.getElementById('hud-level-concept');
    this.btnPrevLevel = document.getElementById('btn-prev-level');
    this.btnNextLevel = document.getElementById('btn-next-level');
    this.hudCrystals = document.getElementById('hud-crystals');
    this.hudCardCount = document.getElementById('hud-card-count');
    this.hudParScore = document.getElementById('hud-par-score');
    this.deckParDisplay = document.getElementById('deck-par-display');
    this.hudStatusMessage = document.getElementById('hud-status-message');
    this.btnHudHint = document.getElementById('btn-hud-hint');
    this.btnHudSpeed = document.getElementById('btn-hud-speed');
    this.hudSpeedLabel = document.getElementById('hud-speed-label');
    this.btnHudSoundQuick = document.getElementById('btn-hud-sound-quick');
    this.hudSoundLabel = document.getElementById('hud-sound-label');
    this.btnHudFullscreen = document.getElementById('btn-hud-fullscreen');

    // Command Deck & Program Queue
    this.paletteContainer = document.getElementById('palette-container');
    this.queueContainer = document.getElementById('queue-container');
    this.btnViewList = document.getElementById('btn-view-list');
    this.btnViewGrid = document.getElementById('btn-view-grid');
    this.btnRun = document.getElementById('btn-run');
    this.btnStep = document.getElementById('btn-step');
    this.btnReset = document.getElementById('btn-reset');
    this.btnClear = document.getElementById('btn-clear');
    this.queueViewMode = 'scratch'; // Default to unified Scratch Nested Block Workspace
    this.activeBranch = null;

    // Audio & Global Toggles
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.btnToggleMusic = document.getElementById('btn-toggle-music');
    this.btnResetAllProgress = document.getElementById('btn-reset-all-progress');

    // Custom Game Dialog Modal (In-Game Confirm & Alert)
    this.modalGameDialog = document.getElementById('modal-game-dialog');
    this.dialogIconContainer = document.getElementById('dialog-icon-container');
    this.dialogTitle = document.getElementById('dialog-title');
    this.dialogMessage = document.getElementById('dialog-message');
    this.btnDialogCancel = document.getElementById('btn-dialog-cancel');
    this.btnDialogConfirm = document.getElementById('btn-dialog-confirm');
  }

  bindEvents() {
    // Start Splash Loading Sequence
    this.startSplashLoading();

    // Splash screen click to start (after loading)
    if (this.btnStartSplash) {
      this.btnStartSplash.addEventListener('click', () => {
        sounds.init();
        sounds.playClick();
        sounds.startMusic();
        this.showScreen('menu');
      });
    }

    // Main Menu Buttons
    document.getElementById('btn-menu-play')?.addEventListener('click', () => {
      sounds.playClick();
      this.game.loadLevel(state.currentLevelIndex);
      this.showScreen('game');
    });

    document.getElementById('btn-menu-levels')?.addEventListener('click', () => {
      sounds.playClick();
      this.renderLevelSelectGrid();
      this.showScreen('level_select');
    });

    document.getElementById('btn-menu-howto')?.addEventListener('click', () => {
      sounds.playClick();
      this.modalHowTo.classList.remove('hidden');
    });

    document.getElementById('btn-menu-about')?.addEventListener('click', () => {
      sounds.playClick();
      this.modalAbout.classList.remove('hidden');
    });

    // Level Intro "Siap, Ayo Koding!" Button
    document.getElementById('btn-start-level')?.addEventListener('click', () => {
      sounds.playClick();
      this.modalLevelIntro?.classList.add('hidden');
    });

    // HUD Level Quick Navigation (◀ / ▶)
    this.btnPrevLevel?.addEventListener('click', () => {
      sounds.playClick();
      if (state.currentLevelIndex > 0) {
        this.game.loadLevel(state.currentLevelIndex - 1);
      }
    });

    this.btnNextLevel?.addEventListener('click', () => {
      sounds.playClick();
      if (state.currentLevelIndex < LEVELS.length - 1) {
        this.game.loadLevel(state.currentLevelIndex + 1);
      }
    });

    // HUD Hint Button
    this.btnHudHint?.addEventListener('click', () => {
      sounds.playClick();
      this.showLevelHintModal();
    });

    // HUD Speed Controller (3-State Cycle: 1x Normal -> 2x Cepat -> 0.5x Santai)
    this.btnHudSpeed?.addEventListener('click', () => {
      sounds.playClick();
      const current = this.game.codeRunner.speedMultiplier || 1.0;
      let next = 1.0;
      let label = '1x';
      if (current === 1.0) {
        next = 2.0;
        label = '2x';
      } else if (current === 2.0) {
        next = 0.5;
        label = '0.5x';
      } else {
        next = 1.0;
        label = '1x';
      }
      this.game.codeRunner.speedMultiplier = next;
      if (this.hudSpeedLabel) {
        this.hudSpeedLabel.textContent = label;
      }
      this.btnHudSpeed.classList.toggle('btn-emerald', next === 2.0);
      this.btnHudSpeed.classList.toggle('btn-purple', next === 0.5);
      this.btnHudSpeed.classList.toggle('btn-secondary', next === 1.0);
    });

    // Step-by-Step Code Tracing Button
    this.btnStep?.addEventListener('click', () => {
      sounds.playClick();
      this.clearHighlight();
      this.game.codeRunner.step(this.programCards);
    });

    // HUD Quick Sound Controller (Mute / Unmute Effects)
    this.btnHudSoundQuick?.addEventListener('click', () => {
      const active = sounds.toggleSound();
      sounds.playClick();
      if (this.hudSoundLabel) {
        this.hudSoundLabel.textContent = active ? 'Suara' : 'Senyap';
      }
      this.btnHudSoundQuick.classList.toggle('btn-secondary', active);
      this.btnHudSoundQuick.classList.toggle('btn-rose', !active);

      // Sync menu toggle button
      if (this.btnToggleSound) {
        this.btnToggleSound.innerHTML = `
          <svg class="svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
            ${active 
              ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>' 
              : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>'}
          </svg>
          Suara: ${active ? 'Aktif' : 'Senyap'}
        `;
      }
    });

    // Close Modals
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sounds.playClick();
        e.target.closest('.modal-overlay').classList.add('hidden');
      });
    });

    // Back to Menu Buttons
    document.querySelectorAll('.btn-back-menu').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playClick();
        this.game.codeRunner.stop();
        this.showScreen('menu');
      });
    });

    // Execution Buttons
    this.btnRun?.addEventListener('click', () => {
      if (this.game.codeRunner.isRunning) return;

      // Pre-flight validation: ensure no empty loop or conditional cavities
      for (let i = 0; i < this.programCards.length; i++) {
        const c = this.programCards[i];
        if (c.type === CONFIG.COMMANDS.LOOP && (!c.bodyCards || c.bodyCards.length === 0)) {
          sounds.playBump();
          this.setStatus(`Perhatian: Balok ULANGI langkah ke-${i + 1} masih kosong! Tambahkan minimal 1 perintah di dalam rongganya.`, true);
          const blockEl = this.queueContainer.children[i];
          const cavity = blockEl?.querySelector('.c-block-cavity');
          if (cavity) {
            cavity.classList.add('empty-cavity-alert');
            cavity.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setTimeout(() => cavity.classList.remove('empty-cavity-alert'), 1800);
          }
          return;
        }
        if (c.type === CONFIG.COMMANDS.IF_OBSTACLE) {
          if (!c.thenCards || c.thenCards.length === 0) {
            sounds.playBump();
            this.setStatus(`Perhatian: Cabang MAKA langkah ke-${i + 1} masih kosong! Tambahkan perintah ke dalamnya.`, true);
            const blockEl = this.queueContainer.children[i];
            const cavity = blockEl?.querySelector('.then-cavity');
            if (cavity) {
              cavity.classList.add('empty-cavity-alert');
              cavity.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              setTimeout(() => cavity.classList.remove('empty-cavity-alert'), 1800);
            }
            return;
          }
          if (!c.elseCards || c.elseCards.length === 0) {
            sounds.playBump();
            this.setStatus(`Perhatian: Cabang LAINNYA langkah ke-${i + 1} masih kosong! Tambahkan perintah ke dalamnya.`, true);
            const blockEl = this.queueContainer.children[i];
            const cavity = blockEl?.querySelector('.else-cavity');
            if (cavity) {
              cavity.classList.add('empty-cavity-alert');
              cavity.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              setTimeout(() => cavity.classList.remove('empty-cavity-alert'), 1800);
            }
            return;
          }
        }
      }

      sounds.playClick();
      this.game.runProgram(this.programCards);
    });

    this.btnReset?.addEventListener('click', () => {
      sounds.playClick();
      this.game.resetLevel();
      this.clearHighlight();
    });

    this.btnClear?.addEventListener('click', async () => {
      sounds.playClick();
      if (!this.game.codeRunner.isRunning && this.programCards.length > 0) {
        if (this.programCards.length >= 3) {
          const ok = await this.showGameConfirm({
            title: "Hapus Semua Balok?",
            message: "Apakah kamu yakin ingin mengosongkan seluruh susunan balok perintah di area koding robot?",
            confirmText: "Ya, Kosongkan",
            cancelText: "Batal",
            type: "warning"
          });
          if (!ok) return;
        }
        sounds.playTrash();
        this.programCards = [];
        this.renderQueue();
        this.clearHighlight();
        this.setStatus("Semua balok perintah telah dibersihkan. Silakan susun kembali!");
      }
    });

    // Queue View Mode Toggle (Horizontal Ribbon Track vs 1-Column List)
    this.btnViewGrid?.addEventListener('click', () => {
      sounds.playClick();
      this.setQueueViewMode('ribbon');
    });

    this.btnViewList?.addEventListener('click', () => {
      sounds.playClick();
      this.setQueueViewMode('list');
    });

    // Audio Toggles
    this.btnToggleSound?.addEventListener('click', () => {
      const active = sounds.toggleSound();
      this.btnToggleSound.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
          ${active 
            ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>' 
            : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>'}
        </svg>
        Suara: ${active ? 'Aktif' : 'Senyap'}
      `;
      if (this.hudSoundLabel) {
        this.hudSoundLabel.textContent = active ? 'Suara' : 'Senyap';
      }
      if (this.btnHudSoundQuick) {
        this.btnHudSoundQuick.classList.toggle('btn-secondary', active);
        this.btnHudSoundQuick.classList.toggle('btn-rose', !active);
      }
    });

    // Fullscreen Toggle Controller
    this.btnHudFullscreen?.addEventListener('click', () => {
      sounds.playClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });

    // Keyboard Shortcuts (Desktop / Laptop Accessibility)
    window.addEventListener('keydown', (e) => {
      // Ignore if user is inside an input field
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

      if (state.currentScreen === 'game') {
        // 1 - 6: Quick Add Card from Palette (Computer Lab Keyboard Mode)
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1 && num <= 6) {
          const paletteBlocks = this.paletteContainer?.querySelectorAll('.command-palette-block');
          if (paletteBlocks && paletteBlocks[num - 1]) {
            e.preventDefault();
            paletteBlocks[num - 1].click();
          }
        }
        // Space / Enter: Run Program
        else if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          if (!this.game.codeRunner.isRunning && this.programCards.length > 0) {
            sounds.playClick();
            this.game.runProgram(this.programCards);
          }
        }
        // T / t: 1 Langkah (Step Tracing)
        else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          this.btnStep?.click();
        }
        // R / r: Reset / Debug Route
        else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          sounds.playClick();
          this.game.resetLevel();
          this.clearHighlight();
        }
        // H / h: Show Hint Modal
        else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          sounds.playClick();
          this.showLevelHintModal();
        }
        // S / s: Toggle Execution Speed
        else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          this.btnHudSpeed?.click();
        }
        // M / m: Mute / Sound Toggle
        else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          this.btnHudSoundQuick?.click();
        }
        // F / f: Toggle Fullscreen
        else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          this.btnHudFullscreen?.click();
        }
      }

      // Escape: Close any visible modal or dialog
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-overlay:not(.hidden)');
        if (openModal) {
          sounds.playClick();
          openModal.classList.add('hidden');
        }
      }
    });

    this.btnToggleMusic?.addEventListener('click', () => {
      const active = sounds.toggleMusic();
      this.btnToggleMusic.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
          <path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>
          ${active ? '' : '<line x1="1" y1="1" x2="23" y2="23" stroke="#F43F5E" stroke-width="2.5"></line>'}
        </svg>
        Musik: ${active ? 'Aktif' : 'Senyap'}
      `;
    });

    // Victory Modal Buttons
    document.getElementById('btn-victory-replay')?.addEventListener('click', () => {
      sounds.playClick();
      this.modalVictory.classList.add('hidden');
      this.game.resetLevel();
    });

    document.getElementById('btn-victory-next')?.addEventListener('click', () => {
      sounds.playClick();
      this.modalVictory.classList.add('hidden');
      const nextIdx = state.currentLevelIndex + 1;
      if (nextIdx < LEVELS.length) {
        this.game.loadLevel(nextIdx);
      } else {
        this.showScreen('level_select');
      }
    });

    // Teacher Reset All Stars Handler (Computer Lab Utility)
    this.btnResetAllProgress?.addEventListener('click', async () => {
      sounds.playClick();
      const confirmed = await this.showGameConfirm({
        title: "Reset Seluruh Bintang Siswa",
        message: "Perhatian Guru: Apakah Anda yakin ingin menghapus seluruh perolehan bintang dan progres siswa di perangkat ini untuk memulai sesi kelas / rombel baru?",
        confirmText: "Hapus Semua",
        cancelText: "Batal",
        type: "danger"
      });

      if (confirmed) {
        safeStorage.clear();
        sounds.playTrash();
        await this.showGameAlert({
          title: "Progres Berhasil Direset",
          message: "Seluruh skor bintang telah berhasil dikembalikan ke 0 untuk memulai sesi rombel/kelas baru.",
          okText: "Mulai Baru",
          type: "success"
        });
        window.location.reload();
      }
    });

    // Dismiss any open sensor dropdown menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.sensor-selector-container')) {
        document.querySelectorAll('.sensor-dropdown-menu').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.sensor-selector-btn').forEach(b => b.classList.remove('open'));
      }
    });
  }

  /**
   * Custom In-Game Modal Confirm Dialog
   * Replaces native browser window.confirm with a beautiful sci-fi themed modal.
   * @param {Object} options
   * @param {string} options.title - Dialog header title
   * @param {string} options.message - Informative description
   * @param {string} [options.confirmText='Lanjutkan'] - Label for confirm button
   * @param {string} [options.cancelText='Batal'] - Label for cancel button
   * @param {'danger'|'warning'|'success'|'info'} [options.type='danger'] - Dialog visual theme
   * @returns {Promise<boolean>}
   */
  showGameConfirm({ title, message, confirmText = 'Lanjutkan', cancelText = 'Batal', type = 'danger' }) {
    return new Promise((resolve) => {
      if (!this.modalGameDialog) {
        resolve(window.confirm(`${title}\n\n${message}`));
        return;
      }

      sounds.playClick();
      const card = this.modalGameDialog.querySelector('.dialog-card');
      if (card) {
        card.className = `modal-card dialog-card dialog-${type}`;
      }

      // Dynamic glowing SVG icon
      let iconSvg = '';
      if (type === 'danger') {
        iconSvg = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      } else if (type === 'warning') {
        iconSvg = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      } else if (type === 'success') {
        iconSvg = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      }
      if (this.dialogIconContainer) this.dialogIconContainer.innerHTML = iconSvg;

      if (this.dialogTitle) this.dialogTitle.textContent = title;
      if (this.dialogMessage) this.dialogMessage.textContent = message;

      if (this.btnDialogCancel) {
        this.btnDialogCancel.style.display = 'inline-block';
        this.btnDialogCancel.textContent = cancelText;
      }

      if (this.btnDialogConfirm) {
        this.btnDialogConfirm.textContent = confirmText;
        this.btnDialogConfirm.className = `btn-3d ${type === 'danger' ? 'btn-rose' : type === 'success' ? 'btn-emerald' : 'btn-amber'}`;
      }

      this.modalGameDialog.classList.remove('hidden');

      const cleanup = () => {
        if (this.btnDialogConfirm) this.btnDialogConfirm.onclick = null;
        if (this.btnDialogCancel) this.btnDialogCancel.onclick = null;
        this.modalGameDialog.classList.add('hidden');
      };

      if (this.btnDialogConfirm) {
        this.btnDialogConfirm.onclick = () => {
          sounds.playClick();
          cleanup();
          resolve(true);
        };
      }

      if (this.btnDialogCancel) {
        this.btnDialogCancel.onclick = () => {
          sounds.playClick();
          cleanup();
          resolve(false);
        };
      }
    });
  }

  /**
   * Custom In-Game Modal Alert Dialog
   * Replaces native browser window.alert with a cohesive sci-fi themed modal.
   * @param {Object} options
   * @param {string} options.title - Dialog header title
   * @param {string} options.message - Informative description
   * @param {string} [options.okText='Mengerti'] - Label for acknowledgment button
   * @param {'success'|'info'|'warning'} [options.type='success'] - Dialog visual theme
   * @returns {Promise<void>}
   */
  showGameAlert({ title, message, okText = 'Mengerti', type = 'success' }) {
    return new Promise((resolve) => {
      if (!this.modalGameDialog) {
        window.alert(`${title}\n\n${message}`);
        resolve();
        return;
      }

      sounds.playClick();
      const card = this.modalGameDialog.querySelector('.dialog-card');
      if (card) {
        card.className = `modal-card dialog-card dialog-${type}`;
      }

      let iconSvg = '';
      if (type === 'success') {
        iconSvg = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      }
      if (this.dialogIconContainer) this.dialogIconContainer.innerHTML = iconSvg;

      if (this.dialogTitle) this.dialogTitle.textContent = title;
      if (this.dialogMessage) this.dialogMessage.textContent = message;

      if (this.btnDialogCancel) this.btnDialogCancel.style.display = 'none';

      if (this.btnDialogConfirm) {
        this.btnDialogConfirm.textContent = okText;
        this.btnDialogConfirm.className = `btn-3d ${type === 'success' ? 'btn-emerald' : 'btn-cyan'}`;
      }

      this.modalGameDialog.classList.remove('hidden');

      const cleanup = () => {
        if (this.btnDialogConfirm) this.btnDialogConfirm.onclick = null;
        if (this.btnDialogCancel) this.btnDialogCancel.onclick = null;
        this.modalGameDialog.classList.add('hidden');
      };

      if (this.btnDialogConfirm) {
        this.btnDialogConfirm.onclick = () => {
          sounds.playClick();
          cleanup();
          resolve();
        };
      }
    });
  }

  showScreen(screenName) {
    state.currentScreen = screenName;
    const screens = [
      this.screenSplash,
      this.screenMenu,
      this.screenLevelSelect,
      this.screenGame
    ];
    screens.forEach(s => s?.classList.add('hidden'));

    if (screenName === 'splash') this.screenSplash?.classList.remove('hidden');
    else if (screenName === 'menu') this.screenMenu?.classList.remove('hidden');
    else if (screenName === 'level_select') this.screenLevelSelect?.classList.remove('hidden');
    else if (screenName === 'game') this.screenGame?.classList.remove('hidden');
  }

  renderLevelSelectGrid(selectedZone = null) {
    if (selectedZone !== null) {
      this.currentSelectedZone = selectedZone;
    } else if (!this.currentSelectedZone) {
      this.currentSelectedZone = 'all';
    }
    const currentZone = this.currentSelectedZone;

    const grid = document.getElementById('level-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Update active class on zone tabs and attach listener
    const tabsContainer = document.getElementById('zone-filter-tabs');
    if (tabsContainer) {
      tabsContainer.querySelectorAll('.zone-tab').forEach(tab => {
        const isMatch = tab.dataset.zone === currentZone;
        tab.classList.toggle('active', isMatch);
        if (!tab.dataset.bound) {
          tab.dataset.bound = 'true';
          tab.addEventListener('click', () => {
            sounds.playClick();
            this.renderLevelSelectGrid(tab.dataset.zone);
          });
        }
      });
    }

    // Calculate total expedition stars & update progress banner
    let totalStars = 0;
    LEVELS.forEach((_, idx) => totalStars += state.getStarsForLevel(idx));
    const maxStars = LEVELS.length * 3;
    const countEl = document.getElementById('level-select-stars-count');
    const fillEl = document.getElementById('level-select-progress-fill');
    if (countEl) countEl.textContent = `${totalStars} / ${maxStars} Bintang`;
    if (fillEl) {
      const pct = maxStars > 0 ? Math.round((totalStars / maxStars) * 100) : 0;
      fillEl.style.width = `${pct}%`;
    }

    const ZONES_INFO = [
      {
        id: 1,
        name: "Zona 1: Pantai Fondasi",
        desc: "Fondasi Langkah Logis & Orientasi Spasial 90°",
        color: "#38BDF8",
        icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M3 20c3-2 6-2 9 0 3-2 6-2 9 0"></path></svg>`
      },
      {
        id: 2,
        name: "Zona 2: Teluk Rintangan",
        desc: "Manuver Melompati Celah Sungai & Rintangan Air",
        color: "#10B981",
        icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c3-2.5 6-2.5 9 0s6 2.5 9 0"></path><path d="M2 17c3-2.5 6-2.5 9 0s6 2.5 9 0"></path></svg>`
      },
      {
        id: 3,
        name: "Zona 3: Lembah Perulangan",
        desc: "Meringkas Kode Efisien dengan Loop (Ulangi Nx)",
        color: "#F59E0B",
        icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`
      },
      {
        id: 4,
        name: "Zona 4: Hutan Sensor Logika",
        desc: "Percabangan Logis (Sensor Rintangan: Lompat / Maju)",
        color: "#F43F5E",
        icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F43F5E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg>`
      },
      {
        id: 5,
        name: "Zona 5: Kuil Master Algoritma",
        desc: "Sintesis Lengkap Saklar Jembatan & Petualangan Penuh",
        color: "#8B5CF6",
        icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#8B5CF6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 22 7 12 2"></polygon><line x1="5" y1="7" x2="5" y2="18"></line><line x1="19" y1="7" x2="19" y2="18"></line><line x1="12" y1="7" x2="12" y2="18"></line><line x1="2" y1="21" x2="22" y2="21"></line></svg>`
      }
    ];

    let currentZoneHeaderAdded = false;

    LEVELS.forEach((lvl, idx) => {
      const zoneIdx = Math.floor(idx / 6);

      // Filter by selected zone
      if (currentZone !== 'all' && parseInt(currentZone) !== zoneIdx) {
        return;
      }

      // Insert Zone Header if first level in zone
      const defaultZoneIcon = `<svg class="svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>`;
      if (currentZone === 'all') {
        if (idx % 6 === 0) {
          const zone = ZONES_INFO[zoneIdx] || { name: `Zona ${zoneIdx + 1}`, desc: lvl.world, icon: defaultZoneIcon };
          const header = document.createElement('div');
          header.className = `level-zone-header zone-${zoneIdx}-header`;
          header.innerHTML = `
            <div class="zone-header-left">
              <div class="zone-icon-circle">${zone.icon}</div>
              <div>
                <div class="zone-header-title">${zone.name}</div>
                <div class="zone-header-desc">${zone.desc}</div>
              </div>
            </div>
            <span class="zone-badge-tag">Level ${zoneIdx * 6 + 1} – ${Math.min((zoneIdx + 1) * 6, LEVELS.length)}</span>
          `;
          grid.appendChild(header);
        }
      } else {
        if (!currentZoneHeaderAdded) {
          currentZoneHeaderAdded = true;
          const zone = ZONES_INFO[zoneIdx] || { name: `Zona ${zoneIdx + 1}`, desc: lvl.world, icon: defaultZoneIcon };
          const header = document.createElement('div');
          header.className = `level-zone-header zone-${zoneIdx}-header`;
          header.innerHTML = `
            <div class="zone-header-left">
              <div class="zone-icon-circle">${zone.icon}</div>
              <div>
                <div class="zone-header-title">${zone.name}</div>
                <div class="zone-header-desc">${zone.desc}</div>
              </div>
            </div>
            <span class="zone-badge-tag">Level ${zoneIdx * 6 + 1} – ${Math.min((zoneIdx + 1) * 6, LEVELS.length)}</span>
          `;
          grid.appendChild(header);
        }
      }

      const stars = state.getStarsForLevel(idx);
      const isCompleted = stars > 0;
      const isPerfect = stars === 3;

      let statusBadgeHtml = '';
      if (isPerfect) {
        statusBadgeHtml = `<span class="level-status-pill pill-perfect" title="Lulus dengan Target Par Efisien"><svg viewBox="0 0 24 24" width="11" height="11" fill="#FACC15" stroke="#CA8A04" stroke-width="1.8" style="vertical-align: -1px; margin-right: 3px;"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M6 3h12v7a6 6 0 0 1-12 0V3zM9 21h6M12 17v4"></path></svg>3 Bintang</span>`;
      } else if (isCompleted) {
        statusBadgeHtml = `<span class="level-status-pill pill-done" title="Level Selesai Diselesaikan"><svg viewBox="0 0 24 24" width="11" height="11" fill="#FACC15" stroke="#F59E0B" stroke-width="1.8" style="vertical-align: -1px; margin-right: 3px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>Selesai</span>`;
      } else {
        statusBadgeHtml = `<span class="level-status-pill pill-new" title="Siap Dimainkan Kapan Saja"><svg viewBox="0 0 24 24" width="8" height="8" fill="#10B981" style="vertical-align: 0px; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle></svg>Baru</span>`;
      }

      const card = document.createElement('div');
      card.className = `level-card zone-${zoneIdx}-card unlocked ${isPerfect ? 'card-perfect' : ''} ${isCompleted ? 'card-completed' : ''}`;

      let starHtml = '';
      for (let s = 1; s <= 3; s++) {
        const active = s <= stars;
        starHtml += `<svg class="star-icon ${active ? 'active' : ''}" viewBox="0 0 24 24" width="16" height="16" fill="${active ? '#FACC15' : 'rgba(255,255,255,0.08)'}" stroke="${active ? '#FACC15' : 'rgba(255,255,255,0.25)'}" stroke-width="1.8" style="margin: 0 1px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      }

      card.innerHTML = `
        <div class="level-card-top">
          <div class="level-badge-num">Level ${lvl.id}</div>
          ${statusBadgeHtml}
        </div>
        <div class="level-name">${lvl.title}</div>
        <div class="level-concept">${lvl.concept}</div>
        <div class="level-card-bottom">
          <div class="level-stars">${starHtml}</div>
          <button class="btn-play-level">Buka <svg class="svg-icon" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
        </div>
      `;

      card.addEventListener('click', () => {
        sounds.playClick();
        this.game.loadLevel(idx);
        this.showScreen('game');
      });

      grid.appendChild(card);
    });
  }

  startSplashLoading() {
    if (!this.splashProgressBar || !this.splashProgressPercent) return;
    
    let realAssetsLoaded = false;
    const realLoadPromise = assets.loadAll().then(() => {
      realAssetsLoaded = true;
    });

    // Pacing progress halus dan edukatif (~2.2 detik total)
    const stages = [
      { target: 25, label: "Menghubungkan satelit Pulau Algoritma..." },
      { target: 50, label: "Mengisi daya baterai surya Robot Byte..." },
      { target: 75, label: "Menata ubin petualangan & batu runik..." },
      { target: 92, label: "Mengaktifkan pendaran kristal energi..." },
      { target: 100, label: "Sistem Siap! Selamat datang di Pulau Algoritma!" }
    ];

    let currentPercent = 0;
    let stageIndex = 0;
    const startTime = performance.now();
    const minDuration = 2200; // 2.2 detik agar terasa mantap dan dapat dinikmati

    const updateLoading = () => {
      const elapsed = performance.now() - startTime;
      const timeRatio = Math.min(elapsed / minDuration, 1);
      
      // Hitung target persen berdasarkan kurva halus
      let targetProgress = Math.floor(timeRatio * 100);
      if (targetProgress >= 95 && !realAssetsLoaded) {
        targetProgress = 95; // Tunggu jika aset berat belum selesai
      }

      if (currentPercent < targetProgress) {
        currentPercent += Math.ceil((targetProgress - currentPercent) * 0.2) || 1;
        if (currentPercent > targetProgress) currentPercent = targetProgress;
      }

      // Update teks status sesuai tahapan
      if (stageIndex < stages.length - 1 && currentPercent >= stages[stageIndex].target) {
        stageIndex++;
      }
      const activeStage = stages[stageIndex];

      this.splashProgressBar.style.width = `${currentPercent}%`;
      this.splashProgressPercent.textContent = `${currentPercent}%`;
      if (this.splashStatusText && activeStage) {
        this.splashStatusText.textContent = activeStage.label;
      }

      if (currentPercent >= 100 && realAssetsLoaded) {
        // Pemuatan sempurna
        setTimeout(() => {
          if (this.splashLoadingBox) {
            this.splashLoadingBox.style.opacity = '0';
            this.splashLoadingBox.style.transform = 'scale(0.95)';
            setTimeout(() => {
              if (this.splashLoadingBox) this.splashLoadingBox.style.display = 'none';
              if (this.btnStartSplash) {
                this.btnStartSplash.style.display = 'inline-flex';
                this.btnStartSplash.classList.remove('hidden');
              }
            }, 300);
          }
        }, 350);
      } else {
        requestAnimationFrame(updateLoading);
      }
    };

    requestAnimationFrame(updateLoading);
  }

  showLevelHintModal() {
    const level = LEVELS[state.currentLevelIndex];
    if (!level || !this.modalLevelHint) return;

    const zoneNum = Math.floor((level.id - 1) / 6) + 1;
    const levelBadge = document.getElementById('hint-level-badge');
    const zoneBadge = document.getElementById('hint-zone-badge');
    const titleEl = document.getElementById('hint-level-title');
    const conceptEl = document.getElementById('hint-level-concept');
    const textEl = document.getElementById('hint-level-text');

    if (levelBadge) levelBadge.textContent = `Level ${level.id} dari 30`;
    if (zoneBadge) zoneBadge.textContent = `Zona ${zoneNum}: ${level.world.toUpperCase()}`;
    if (titleEl) titleEl.textContent = level.title;
    if (conceptEl) conceptEl.textContent = `Fokus Materi: ${level.concept} • Target Par: ${level.parCards} Kartu`;
    if (textEl) textEl.textContent = level.hint || level.description;

    this.modalLevelHint.classList.remove('hidden');
  }

  showLevelIntroModal(level) {
    if (!this.modalLevelIntro) return;

    const zoneNum = Math.floor((level.id - 1) / 6) + 1;
    const levelNumberBadge = document.getElementById('intro-level-number-badge');
    const levelZoneBadge = document.getElementById('intro-level-zone-badge');
    const title = document.getElementById('intro-level-title');
    const conceptText = document.getElementById('intro-concept-text');
    const speech = document.getElementById('intro-byte-speech');
    const crystalGoal = document.getElementById('intro-crystal-goal');
    const parGoal = document.getElementById('intro-par-goal');

    if (levelNumberBadge) levelNumberBadge.textContent = `Level ${level.id} dari 30`;
    if (levelZoneBadge) levelZoneBadge.textContent = `Zona ${zoneNum}: ${level.world.toUpperCase()}`;
    if (title) title.textContent = level.title;
    if (conceptText) conceptText.textContent = `Fokus: ${level.concept}`;
    if (speech) speech.textContent = level.description;
    if (crystalGoal) crystalGoal.textContent = `Kumpulkan ${level.crystals.length} Kristal Energi`;
    if (parGoal) parGoal.textContent = `Maksimal ${level.parCards} kartu perintah (Target Par)`;

    this.modalLevelIntro.classList.remove('hidden');
  }

  setQueueViewMode(mode) {
    this.queueViewMode = mode || 'scratch';
    this.renderQueue();
  }

  setupLevelUI(level) {
    this.hudLevelTitle.textContent = `Level ${level.id}: ${level.title}`;
    this.hudLevelConcept.textContent = level.concept;
    this.hudParScore.textContent = level.parCards;
    if (this.deckParDisplay) {
      this.deckParDisplay.textContent = `${level.parCards} Kartu`;
    }

    // Update HUD Level Navigation Buttons
    if (this.btnPrevLevel) {
      const isFirst = state.currentLevelIndex === 0;
      this.btnPrevLevel.disabled = isFirst;
      this.btnPrevLevel.classList.toggle('disabled', isFirst);
    }
    if (this.btnNextLevel) {
      const isLast = state.currentLevelIndex === LEVELS.length - 1;
      this.btnNextLevel.disabled = isLast;
      this.btnNextLevel.classList.toggle('disabled', isLast);
    }

    this.programCards = [];
    this.activeCardIndex = -1;
    this.errorCardIndex = -1;
    this.activeBranch = null;

    // Use Scratch Block Workspace for nested visual coding
    this.queueViewMode = 'scratch';

    this.renderPalette(level.availableCards);
    this.renderQueue();
    this.updateHUD(0, level.crystals.length);
    this.setStatus(level.description);

    // Show friendly Byte Mission Briefing
    setTimeout(() => {
      this.showLevelIntroModal(level);
    }, 250);
  }

  renderPalette(availableCards) {
    this.paletteContainer.innerHTML = '';

    availableCards.forEach((cmdType, pIdx) => {
      const block = document.createElement('div');
      block.className = `scratch-block palette-block command-palette-block block-${cmdType.toLowerCase()}`;
      block.setAttribute('draggable', 'true');
      block.setAttribute('title', `Klik untuk tambah atau tekan angka [${pIdx + 1}] di keyboard`);

      const config = this.getCardVisuals(cmdType);
      block.innerHTML = `
        <div class="block-left-content">
          <div class="block-icon-badge">${config.icon}</div>
          <span class="block-label-text">${config.label}</span>
        </div>
        <span class="palette-shortcut-badge" title="Pintasan Keyboard [${pIdx + 1}]">[${pIdx + 1}]</span>
        <span class="block-add-hint">+</span>
      `;

      // Drag event from Palette
      block.addEventListener('dragstart', (e) => {
        if (this.game.codeRunner.isRunning) {
          e.preventDefault();
          return;
        }
        sounds.playClick();
        this.draggedItem = { source: 'palette', type: cmdType };
        e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedItem));
        e.dataTransfer.effectAllowed = 'copyMove';
        block.classList.add('is-dragging');
      });

      block.addEventListener('dragend', () => {
        block.classList.remove('is-dragging');
        this.removeDropIndicator();
      });

      // Accessible click-to-add
      block.addEventListener('click', () => {
        if (this.game.codeRunner.isRunning) return;
        sounds.playSnap(this.programCards.length);

        if (cmdType === CONFIG.COMMANDS.LOOP) {
          this.programCards.push({
            type: CONFIG.COMMANDS.LOOP,
            count: 3,
            bodyCards: [] // Clean empty cavity - prompts student to choose action
          });
        } else if (cmdType === CONFIG.COMMANDS.IF_OBSTACLE) {
          this.programCards.push({
            type: CONFIG.COMMANDS.IF_OBSTACLE,
            condition: 'OBSTACLE_AHEAD',
            thenCards: [], // Clean empty cavity
            elseCards: []  // Clean empty cavity
          });
        } else {
          this.programCards.push({ type: cmdType });
        }

        this.renderQueue();
      });

      this.paletteContainer.appendChild(block);
    });
  }

  getCardVisuals(type) {
    switch (type) {
      case CONFIG.COMMANDS.FORWARD:
        return {
          icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`,
          label: 'Maju',
          fullName: 'Maju 1 Langkah'
        };
      case CONFIG.COMMANDS.TURN_RIGHT:
        return {
          icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19V12a4 4 0 0 1 4-4h10"></path><polyline points="15 4 19 8 15 12"></polyline></svg>`,
          label: 'Putar Kanan',
          fullName: 'Belok Kanan 90°'
        };
      case CONFIG.COMMANDS.TURN_LEFT:
        return {
          icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 19V12a4 4 0 0 0-4-4H5"></path><polyline points="9 4 5 8 9 12"></polyline></svg>`,
          label: 'Putar Kiri',
          fullName: 'Belok Kiri 90°'
        };
      case CONFIG.COMMANDS.JUMP:
        return {
          icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18 C 7 7, 17 7, 21 18"></path><polyline points="15 9 20 6 22 11"></polyline></svg>`,
          label: 'Lompat',
          fullName: 'Lompati Air'
        };
      case CONFIG.COMMANDS.LOOP:
        return {
          icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`,
          label: 'Ulangi (Loop)',
          fullName: 'Ulangi (Loop)'
        };
      case CONFIG.COMMANDS.IF_OBSTACLE:
        return {
          icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
          label: 'Jika Rintangan',
          fullName: 'Jika Ada Rintangan [Lompat : Maju]'
        };
      default:
        return {
          icon: `<svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`,
          label: type,
          fullName: type
        };
    }
  }

  initDragAndDrop() {
    if (!this.queueContainer) return;

    this.queueContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (this.game.codeRunner.isRunning) return;
      e.dataTransfer.dropEffect = 'move';

      this.queueContainer.classList.add('drag-over-queue');
      this.updateDropIndicator(e.clientX, e.clientY);
    });

    this.queueContainer.addEventListener('dragleave', (e) => {
      if (!this.queueContainer.contains(e.relatedTarget)) {
        this.queueContainer.classList.remove('drag-over-queue');
        this.removeDropIndicator();
      }
    });

    this.queueContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      if (this.game.codeRunner.isRunning) return;

      this.queueContainer.classList.remove('drag-over-queue');
      this.queueContainer.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      this.removeDropIndicator();

      if (!this.draggedItem) return;

      // Check if dropped into a nested cavity (C-Block or E-Block)
      const cavityEl = e.target.closest('.c-block-cavity, .e-block-cavity');
      if (cavityEl) {
        const pIdx = parseInt(cavityEl.dataset.parentIndex, 10);
        const branch = cavityEl.dataset.branch;
        const parentCard = this.programCards[pIdx];

        if (parentCard) {
          let childCmd = this.draggedItem.type;
          if (this.draggedItem.source === 'queue') {
            const fromIdx = this.draggedItem.fromIndex;
            if (fromIdx !== undefined && fromIdx >= 0 && fromIdx < this.programCards.length) {
              const [moved] = this.programCards.splice(fromIdx, 1);
              childCmd = moved.type;
            }
          }

          if (childCmd) {
            if (branch === 'loop') {
              parentCard.bodyCards = parentCard.bodyCards || [];
              if (parentCard.bodyCards.length < 5) {
                parentCard.bodyCards.push({ type: childCmd });
                sounds.playSnap();
              }
            } else if (branch === 'then') {
              parentCard.thenCards = parentCard.thenCards || [];
              if (parentCard.thenCards.length < 4) {
                parentCard.thenCards.push({ type: childCmd });
                sounds.playSnap();
              }
            } else if (branch === 'else') {
              parentCard.elseCards = parentCard.elseCards || [];
              if (parentCard.elseCards.length < 4) {
                parentCard.elseCards.push({ type: childCmd });
                sounds.playSnap();
              }
            }
            this.draggedItem = null;
            this.renderQueue();
            return;
          }
        }
      }

      // Main Stack Insertion
      const insertIdx = this.calcDropIndex(e.clientX, e.clientY);

      if (this.draggedItem.source === 'palette') {
        if (this.draggedItem.type === CONFIG.COMMANDS.LOOP) {
          this.programCards.splice(insertIdx, 0, {
            type: CONFIG.COMMANDS.LOOP,
            count: 3,
            bodyCards: []
          });
        } else if (this.draggedItem.type === CONFIG.COMMANDS.IF_OBSTACLE) {
          this.programCards.splice(insertIdx, 0, {
            type: CONFIG.COMMANDS.IF_OBSTACLE,
            condition: 'OBSTACLE_AHEAD',
            thenCards: [],
            elseCards: []
          });
        } else {
          this.programCards.splice(insertIdx, 0, {
            type: this.draggedItem.type
          });
        }
        sounds.playSnap();
      } else if (this.draggedItem.source === 'queue') {
        const fromIdx = this.draggedItem.fromIndex;
        if (fromIdx !== undefined && fromIdx >= 0 && fromIdx < this.programCards.length) {
          const [movedCard] = this.programCards.splice(fromIdx, 1);
          let targetIdx = insertIdx;
          if (insertIdx > fromIdx) {
            targetIdx = insertIdx - 1;
          }
          this.programCards.splice(targetIdx, 0, movedCard);
          sounds.playSnap();
        }
      }

      this.draggedItem = null;
      this.renderQueue();
    });

    // Support dragging out of queue to delete
    window.addEventListener('dragover', (e) => {
      if (this.draggedItem && this.draggedItem.source === 'queue') {
        e.preventDefault();
      }
    });

    window.addEventListener('drop', (e) => {
      if (this.draggedItem && this.draggedItem.source === 'queue') {
        if (!this.queueContainer.contains(e.target)) {
          e.preventDefault();
          const fromIdx = this.draggedItem.fromIndex;
          if (fromIdx !== undefined && fromIdx >= 0 && fromIdx < this.programCards.length) {
            this.programCards.splice(fromIdx, 1);
            sounds.playTrash();
            this.renderQueue();
          }
        }
        this.draggedItem = null;
      }
    });
  }

  calcDropIndex(clientX, clientY) {
    const slots = Array.from(this.queueContainer.querySelectorAll('.scratch-block:not(.palette-block):not(.nested-scratch-block), .scratch-c-block, .scratch-e-block'));
    if (slots.length === 0) return 0;

    for (let i = 0; i < slots.length; i++) {
      const rect = slots[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        return i;
      }
    }
    return slots.length;
  }

  updateDropIndicator(clientX, clientY) {
    const indicatorClass = 'drop-indicator';

    let indicator = this.queueContainer.querySelector(`.${indicatorClass}`);
    if (!indicator) {
      this.removeDropIndicator();
      indicator = document.createElement('div');
      indicator.className = indicatorClass;
    }

    const slots = Array.from(this.queueContainer.querySelectorAll('.scratch-block:not(.palette-block):not(.nested-scratch-block), .scratch-c-block, .scratch-e-block'));
    let insertBeforeEl = null;

    for (let i = 0; i < slots.length; i++) {
      const rect = slots[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        insertBeforeEl = slots[i];
        break;
      }
    }

    if (insertBeforeEl) {
      insertBeforeEl.parentNode.insertBefore(indicator, insertBeforeEl);
    } else {
      this.queueContainer.appendChild(indicator);
    }
  }

  removeDropIndicator() {
    this.queueContainer?.querySelectorAll('.drop-indicator, .drop-indicator-vertical').forEach(el => el.remove());
  }

  attachQueueDragEvents(el, idx) {
    el.addEventListener('dragstart', (e) => {
      if (this.game.codeRunner.isRunning) {
        e.preventDefault();
        return;
      }
      sounds.playClick();
      this.draggedItem = { source: 'queue', fromIndex: idx, type: this.programCards[idx].type };
      e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedItem));
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('is-dragging');
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('is-dragging');
      this.removeDropIndicator();
      this.queueContainer?.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over'));
    });
  }

  renderQueue() {
    this.queueContainer.innerHTML = '';
    this.hudCardCount.textContent = this.programCards.length;

    if (this.programCards.length === 0) {
      this.queueContainer.innerHTML = `
        <div class="empty-queue-guide">
          <div class="empty-queue-title">
            <svg class="svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Area Koding Byte
          </div>
          <div class="empty-queue-step">
            <span class="queue-step-num">1</span>
            <span><strong>Klik (+)</strong> atau <strong>Tarik</strong> balok perintah dari rak kanan ke sini.</span>
          </div>
          <div class="empty-queue-step">
            <span class="queue-step-num">2</span>
            <span>Balok <strong>Loop</strong> & <strong>Jika</strong> punya rongga bertingkat untuk langkah bersarang.</span>
          </div>
          <div class="empty-queue-step">
            <span class="queue-step-num">3</span>
            <span>Tekan <strong>Jalankan Program</strong> untuk menguji rute Byte!</span>
          </div>
        </div>
      `;
      return;
    }

    this.programCards.forEach((card, idx) => {
      let blockEl;
      if (card.type === CONFIG.COMMANDS.LOOP) {
        blockEl = this.renderLoopBlock(card, idx);
      } else if (card.type === CONFIG.COMMANDS.IF_OBSTACLE) {
        blockEl = this.renderIfObstacleBlock(card, idx);
      } else {
        blockEl = this.renderStandardBlock(card, idx);
      }
      this.queueContainer.appendChild(blockEl);
    });

    // Auto-scroll to keep active block in view
    if (this.activeCardIndex >= 0) {
      const activeEl = this.queueContainer.querySelector('.active-step');
      if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  moveCard(fromIdx, toIdx) {
    if (this.game.codeRunner.isRunning) return;
    if (toIdx < 0 || toIdx >= this.programCards.length) return;
    sounds.playClick();
    const item = this.programCards.splice(fromIdx, 1)[0];
    this.programCards.splice(toIdx, 0, item);
    this.renderQueue();
  }

  duplicateCard(idx) {
    if (this.game.codeRunner.isRunning) return;
    sounds.playSnap(this.programCards.length);
    const copy = JSON.parse(JSON.stringify(this.programCards[idx]));
    this.programCards.splice(idx + 1, 0, copy);
    this.renderQueue();
  }

  renderStandardBlock(card, idx) {
    const block = document.createElement('div');
    block.className = `scratch-block block-${card.type.toLowerCase()} ${idx === this.activeCardIndex ? 'active-step' : ''} ${idx === this.errorCardIndex ? 'error-step' : ''}`;
    block.setAttribute('draggable', 'true');
    block.dataset.index = idx;

    const vis = this.getCardVisuals(card.type);
    block.innerHTML = `
      <div class="block-left-content">
        <span class="block-drag-grip" title="Tarik untuk memindahkan urutan">⋮⋮</span>
        <span class="slot-badge-num">${idx + 1}</span>
        <div class="block-icon-badge">${vis.icon}</div>
        <span class="block-label-text">${vis.fullName || vis.label}</span>
      </div>
      <div class="block-actions-right">
        <button class="btn-card-tool btn-tool-copy" title="Duplikasi balok (❐)">❐</button>
        <button class="btn-remove-block" title="Hapus balok">&times;</button>
      </div>
    `;

    this.attachQueueDragEvents(block, idx);

    block.querySelector('.btn-tool-copy')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.duplicateCard(idx);
    });

    block.querySelector('.btn-remove-block')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.game.codeRunner.isRunning) return;
      sounds.playTrash();
      this.programCards.splice(idx, 1);
      this.renderQueue();
    });

    return block;
  }

  renderLoopBlock(card, idx) {
    if (!card.bodyCards || !Array.isArray(card.bodyCards)) {
      card.bodyCards = card.subCommand ? [{ type: card.subCommand }] : [];
    }

    const cBlock = document.createElement('div');
    cBlock.className = `scratch-c-block ${idx === this.activeCardIndex ? 'active-step' : ''} ${idx === this.errorCardIndex ? 'error-step' : ''}`;
    cBlock.setAttribute('draggable', 'true');
    cBlock.dataset.index = idx;

    cBlock.innerHTML = `
      <div class="c-block-header">
        <div class="block-left-content" style="display:flex; align-items:center; gap:4px; min-width:0;">
          <span class="block-drag-grip" title="Tarik untuk memindahkan urutan">⋮⋮</span>
          <span class="slot-badge-num">${idx + 1}</span>
          <div class="block-icon-badge">
            <svg class="svg-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          </div>
          <span class="block-label-text">ULANGI</span>
        </div>
        <div class="c-stepper-container" title="Ubah jumlah perulangan">
          <button class="btn-stepper btn-stepper-minus" title="Kurangi">−</button>
          <span class="stepper-val">${card.count || 3}x</span>
          <button class="btn-stepper btn-stepper-plus" title="Tambah">+</button>
        </div>
        <div class="block-actions-right">
          <button class="btn-card-tool btn-tool-copy" title="Duplikasi balok (❐)">❐</button>
          <button class="btn-remove-block" title="Hapus balok loop">&times;</button>
        </div>
      </div>
      <div class="c-block-cavity" data-parent-index="${idx}" data-branch="loop" title="Rongga Perulangan: Perintah di dalam sini akan diulang">
        <div class="nested-blocks-container" style="display:flex; flex-direction:column; gap:3px;"></div>
      </div>
      <div class="c-block-footer"></div>
    `;

    // Duplicate
    cBlock.querySelector('.btn-tool-copy')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.duplicateCard(idx);
    });

    // Steppers
    cBlock.querySelector('.btn-stepper-minus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.game.codeRunner.isRunning) return;
      sounds.playClick();
      card.count = Math.max(2, (card.count || 3) - 1);
      this.renderQueue();
    });

    cBlock.querySelector('.btn-stepper-plus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.game.codeRunner.isRunning) return;
      sounds.playClick();
      card.count = Math.min(8, (card.count || 3) + 1);
      this.renderQueue();
    });

    cBlock.querySelector('.btn-remove-block')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.game.codeRunner.isRunning) return;
      sounds.playTrash();
      this.programCards.splice(idx, 1);
      this.renderQueue();
    });

    // Populate nested bodyCards or sleek quick-action-slot
    const nestedContainer = cBlock.querySelector('.nested-blocks-container');
    const cycle = [CONFIG.COMMANDS.FORWARD, CONFIG.COMMANDS.TURN_RIGHT, CONFIG.COMMANDS.TURN_LEFT];
    if (this.game.levelManager?.currentLevel?.availableCards?.includes(CONFIG.COMMANDS.JUMP)) {
      cycle.push(CONFIG.COMMANDS.JUMP);
    }
    if (this.game.levelManager?.currentLevel?.availableCards?.includes(CONFIG.COMMANDS.IF_OBSTACLE)) {
      cycle.push(CONFIG.COMMANDS.IF_OBSTACLE);
    }

    if (card.bodyCards.length === 0) {
      const quickSlot = document.createElement('div');
      quickSlot.className = 'quick-action-slot';
      quickSlot.innerHTML = `
        <span class="quick-slot-label">+ Pilih:</span>
        <button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.FORWARD}">+ Maju</button>
        <button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.TURN_RIGHT}">+ Kanan</button>
        <button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.TURN_LEFT}">+ Kiri</button>
        ${this.game.levelManager?.currentLevel?.availableCards?.includes(CONFIG.COMMANDS.JUMP) ? `<button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.JUMP}">+ Lompat</button>` : ''}
      `;

      quickSlot.querySelectorAll('.pill-add-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          sounds.playSnap();
          card.bodyCards.push({ type: btn.dataset.cmd });
          this.renderQueue();
        });
      });
      nestedContainer.appendChild(quickSlot);
    } else {
      card.bodyCards.forEach((childCard, childIdx) => {
        const childEl = document.createElement('div');
        childEl.className = `nested-scratch-block block-${childCard.type.toLowerCase()}`;
        childEl.title = 'Klik untuk mengganti perintah';

        const vis = this.getCardVisuals(childCard.type);
        childEl.innerHTML = `
          <div class="block-left-content" style="display:flex; align-items:center; gap:4px;">
            <div class="block-icon-badge">${vis.icon}</div>
            <span style="font-size:0.72rem; font-weight:800;">${vis.label}</span>
            <span style="font-size:0.58rem; color:#CBD5E1; opacity:0.8;">(ganti)</span>
          </div>
          <button class="btn-remove-child" title="Hapus langkah ini">&times;</button>
        `;

        // Cycle on click
        childEl.addEventListener('click', (e) => {
          if (e.target.closest('.btn-remove-child')) return;
          if (this.game.codeRunner.isRunning) return;
          sounds.playClick();
          const curr = cycle.indexOf(childCard.type);
          childCard.type = cycle[(curr + 1) % cycle.length];
          this.renderQueue();
        });

        // Remove child
        childEl.querySelector('.btn-remove-child')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          sounds.playTrash();
          card.bodyCards.splice(childIdx, 1);
          this.renderQueue();
        });

        nestedContainer.appendChild(childEl);
      });

      if (card.bodyCards.length < 5) {
        const addInlineBtn = document.createElement('button');
        addInlineBtn.className = 'pill-add-inline';
        addInlineBtn.title = 'Tambah langkah ke perulangan';
        addInlineBtn.textContent = '+ Langkah';
        addInlineBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          sounds.playClick();
          card.bodyCards.push({ type: CONFIG.COMMANDS.FORWARD });
          this.renderQueue();
        });
        nestedContainer.appendChild(addInlineBtn);
      }
    }

    // Cavity drag-over styling
    const cavity = cBlock.querySelector('.c-block-cavity');
    cavity.addEventListener('dragover', (e) => {
      e.preventDefault();
      cavity.classList.add('drag-over');
    });
    cavity.addEventListener('dragleave', (e) => {
      if (!cavity.contains(e.relatedTarget)) {
        cavity.classList.remove('drag-over');
      }
    });

    this.attachQueueDragEvents(cBlock, idx);
    return cBlock;
  }

  renderIfObstacleBlock(card, idx) {
    if (!card.thenCards || !Array.isArray(card.thenCards)) {
      card.thenCards = card.thenCommand ? [{ type: card.thenCommand }] : [];
    }
    if (!card.elseCards || !Array.isArray(card.elseCards)) {
      card.elseCards = card.elseCommand ? [{ type: card.elseCommand }] : [];
    }
    if (!card.condition) {
      card.condition = 'OBSTACLE_AHEAD';
    }

    const SENSORS = {
      'OBSTACLE_AHEAD': {
        id: 'OBSTACLE_AHEAD',
        shortLabel: 'Ada Rintangan di Depan',
        fullTitle: 'Ada Rintangan di Depan',
        desc: 'Tebing atau air menghalangi lintasan robot',
        color: '#F59E0B',
        btnIcon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#F59E0B" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        menuIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F59E0B" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
      },
      'CRYSTAL_AHEAD': {
        id: 'CRYSTAL_AHEAD',
        shortLabel: 'Ada Kristal Energi',
        fullTitle: 'Ada Kristal Energi',
        desc: 'Kristal energi berkilau siap diambil',
        color: '#38BDF8',
        btnIcon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#38BDF8" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 2 18 2 22 8 12 22 2 8 6 2"></polygon><line x1="2" y1="8" x2="22" y2="8"></line><line x1="12" y1="22" x2="9" y2="8"></line><line x1="12" y1="22" x2="15" y2="8"></line><line x1="6" y1="2" x2="9" y2="8"></line><line x1="18" y1="2" x2="15" y2="8"></line></svg>`,
        menuIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#38BDF8" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 2 18 2 22 8 12 22 2 8 6 2"></polygon><line x1="2" y1="8" x2="22" y2="8"></line><line x1="12" y1="22" x2="9" y2="8"></line><line x1="12" y1="22" x2="15" y2="8"></line><line x1="6" y1="2" x2="9" y2="8"></line><line x1="18" y1="2" x2="15" y2="8"></line></svg>`
      },
      'DEAD_END': {
        id: 'DEAD_END',
        shortLabel: 'Jalan Buntu / Tembok',
        fullTitle: 'Jalan Buntu / Tembok',
        desc: 'Ujung lintasan tidak dapat dilewati robot',
        color: '#F43F5E',
        btnIcon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#F43F5E" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`,
        menuIcon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F43F5E" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`
      }
    };
    const currentSensor = SENSORS[card.condition] || SENSORS['OBSTACLE_AHEAD'];

    const eBlock = document.createElement('div');
    eBlock.className = `scratch-e-block block-if_obstacle ${idx === this.activeCardIndex ? 'active-step' : ''} ${idx === this.errorCardIndex ? 'error-step' : ''}`;
    eBlock.setAttribute('draggable', 'true');
    eBlock.dataset.index = idx;

    let dropdownItemsHtml = '';
    Object.keys(SENSORS).forEach(key => {
      const s = SENSORS[key];
      const isSelected = key === card.condition;
      dropdownItemsHtml += `
        <div class="sensor-dropdown-item ${isSelected ? 'active' : ''}" data-sensor="${key}">
          <div class="sensor-item-icon" style="background:${s.color}22; border-color:${s.color}55;">
            ${s.menuIcon}
          </div>
          <div class="sensor-item-content">
            <div class="sensor-item-title">${s.fullTitle}</div>
            <div class="sensor-item-desc">${s.desc}</div>
          </div>
          ${isSelected ? `
            <div class="sensor-item-check">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          ` : ''}
        </div>
      `;
    });

    eBlock.innerHTML = `
      <div class="e-block-header">
        <div class="e-block-header-top">
          <div class="block-left-content" style="display:flex; align-items:center; gap:4px; min-width:0;">
            <span class="block-drag-grip" title="Tarik untuk memindahkan urutan">⋮⋮</span>
            <span class="slot-badge-num">${idx + 1}</span>
            <div class="block-icon-badge">
              <svg class="svg-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <span class="block-label-text" style="font-size:0.72rem; letter-spacing:0.02em;">JIKA (SENSOR ROBOT)</span>
          </div>
          <div class="block-actions-right">
            <button class="btn-card-tool btn-tool-copy" title="Duplikasi balok (❐)">❐</button>
            <button class="btn-remove-block" title="Hapus balok kondisi">&times;</button>
          </div>
        </div>

        <!-- Dedicated Prominent Sensor Selector Button & Popover -->
        <div class="sensor-selector-container">
          <button type="button" class="sensor-selector-btn" title="Klik untuk membuka pilihan kondisi sensor">
            <div class="sensor-btn-content">
              <span class="sensor-btn-icon">${currentSensor.btnIcon}</span>
              <span class="sensor-btn-label">${currentSensor.shortLabel}</span>
            </div>
            <svg class="sensor-btn-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div class="sensor-dropdown-menu hidden">
            ${dropdownItemsHtml}
          </div>
        </div>
      </div>

      <!-- MAKA Cavity (If condition holds true) -->
      <div class="e-block-cavity then-cavity" data-parent-index="${idx}" data-branch="then" title="Rongga MAKA: Dilakukan jika kondisi terpenuhi">
        <div class="cavity-branch-label">▶ LAKUKAN (MAKA):</div>
        <div class="then-nested-container" style="display:flex; flex-direction:column; gap:3px;"></div>
      </div>

      <!-- ELSE Branch Divider Header -->
      <div class="e-block-branch-header">
        <span class="e-branch-label">▶ KALAUPUN TIDAK (LAINNYA):</span>
      </div>

      <!-- LAINNYA Cavity (If condition is false) -->
      <div class="e-block-cavity else-cavity" data-parent-index="${idx}" data-branch="else" title="Rongga LAINNYA: Dilakukan jika kondisi tidak terpenuhi">
        <div class="else-nested-container" style="display:flex; flex-direction:column; gap:3px;"></div>
      </div>

      <div class="e-block-footer"></div>
    `;

    // Dropdown toggle & selection handling
    const sensorBtn = eBlock.querySelector('.sensor-selector-btn');
    const dropdownMenu = eBlock.querySelector('.sensor-dropdown-menu');

    if (sensorBtn && dropdownMenu) {
      sensorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.game.codeRunner.isRunning) return;
        sounds.playClick();
        const isHidden = dropdownMenu.classList.contains('hidden');
        // Close all other dropdown menus in the queue first
        document.querySelectorAll('.sensor-dropdown-menu').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.sensor-selector-btn').forEach(b => b.classList.remove('open'));

        if (isHidden) {
          dropdownMenu.classList.remove('hidden');
          sensorBtn.classList.add('open');
        }
      });

      // Item selection
      dropdownMenu.querySelectorAll('.sensor-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          const chosenSensor = item.dataset.sensor;
          if (chosenSensor && SENSORS[chosenSensor]) {
            sounds.playSnap();
            card.condition = chosenSensor;
            this.renderQueue();
          }
        });
      });
    }

    // Duplicate
    eBlock.querySelector('.btn-tool-copy')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.duplicateCard(idx);
    });

    // Remove block
    eBlock.querySelector('.btn-remove-block')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.game.codeRunner.isRunning) return;
      sounds.playTrash();
      this.programCards.splice(idx, 1);
      this.renderQueue();
    });

    const cycle = [CONFIG.COMMANDS.JUMP, CONFIG.COMMANDS.FORWARD, CONFIG.COMMANDS.TURN_RIGHT, CONFIG.COMMANDS.TURN_LEFT];

    // Populate THEN cavity or quick-action-slot
    const thenContainer = eBlock.querySelector('.then-nested-container');
    if (card.thenCards.length === 0) {
      const quickThen = document.createElement('div');
      quickThen.className = 'quick-action-slot';
      quickThen.innerHTML = `
        <span class="quick-slot-label">+ Pilih:</span>
        <button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.JUMP}">+ Lompat</button>
        <button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.TURN_RIGHT}">+ Kanan</button>
        <button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.FORWARD}">+ Maju</button>
      `;
      quickThen.querySelectorAll('.pill-add-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          sounds.playSnap();
          card.thenCards.push({ type: btn.dataset.cmd });
          this.renderQueue();
        });
      });
      thenContainer.appendChild(quickThen);
    } else {
      card.thenCards.forEach((childCard, childIdx) => {
        const childEl = document.createElement('div');
        childEl.className = `nested-scratch-block block-${childCard.type.toLowerCase()}`;
        childEl.title = 'Klik untuk mengganti perintah';

        const vis = this.getCardVisuals(childCard.type);
        childEl.innerHTML = `
          <div class="block-left-content" style="display:flex; align-items:center; gap:4px;">
            <div class="block-icon-badge">${vis.icon}</div>
            <span style="font-size:0.72rem; font-weight:800;">${vis.label}</span>
            <span style="font-size:0.58rem; color:#CBD5E1; opacity:0.8;">(ganti)</span>
          </div>
          <button class="btn-remove-child" title="Hapus langkah">&times;</button>
        `;

        childEl.addEventListener('click', (e) => {
          if (e.target.closest('.btn-remove-child')) return;
          if (this.game.codeRunner.isRunning) return;
          sounds.playClick();
          const curr = cycle.indexOf(childCard.type);
          childCard.type = cycle[(curr + 1) % cycle.length];
          this.renderQueue();
        });

        childEl.querySelector('.btn-remove-child')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          sounds.playTrash();
          card.thenCards.splice(childIdx, 1);
          this.renderQueue();
        });

        thenContainer.appendChild(childEl);
      });

      if (card.thenCards.length < 4) {
        const addInlineThen = document.createElement('button');
        addInlineThen.className = 'pill-add-inline';
        addInlineThen.title = 'Tambah langkah cabang MAKA';
        addInlineThen.textContent = '+ Langkah';
        addInlineThen.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          sounds.playClick();
          card.thenCards.push({ type: CONFIG.COMMANDS.JUMP });
          this.renderQueue();
        });
        thenContainer.appendChild(addInlineThen);
      }
    }

    // Populate ELSE cavity or quick-action-slot
    const elseContainer = eBlock.querySelector('.else-nested-container');
    if (card.elseCards.length === 0) {
      const quickElse = document.createElement('div');
      quickElse.className = 'quick-action-slot';
      quickElse.innerHTML = `
        <span class="quick-slot-label">+ Pilih:</span>
        <button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.FORWARD}">+ Maju</button>
        <button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.TURN_RIGHT}">+ Kanan</button>
        <button class="pill-add-step" data-cmd="${CONFIG.COMMANDS.TURN_LEFT}">+ Kiri</button>
      `;
      quickElse.querySelectorAll('.pill-add-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          sounds.playSnap();
          card.elseCards.push({ type: btn.dataset.cmd });
          this.renderQueue();
        });
      });
      elseContainer.appendChild(quickElse);
    } else {
      card.elseCards.forEach((childCard, childIdx) => {
        const childEl = document.createElement('div');
        childEl.className = `nested-scratch-block block-${childCard.type.toLowerCase()}`;
        childEl.title = 'Klik untuk mengganti perintah';

        const vis = this.getCardVisuals(childCard.type);
        childEl.innerHTML = `
          <div class="block-left-content" style="display:flex; align-items:center; gap:4px;">
            <div class="block-icon-badge">${vis.icon}</div>
            <span style="font-size:0.72rem; font-weight:800;">${vis.label}</span>
            <span style="font-size:0.58rem; color:#CBD5E1; opacity:0.8;">(ganti)</span>
          </div>
          <button class="btn-remove-child" title="Hapus langkah">&times;</button>
        `;

        childEl.addEventListener('click', (e) => {
          if (e.target.closest('.btn-remove-child')) return;
          if (this.game.codeRunner.isRunning) return;
          sounds.playClick();
          const curr = cycle.indexOf(childCard.type);
          childCard.type = cycle[(curr + 1) % cycle.length];
          this.renderQueue();
        });

        childEl.querySelector('.btn-remove-child')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          sounds.playTrash();
          card.elseCards.splice(childIdx, 1);
          this.renderQueue();
        });

        elseContainer.appendChild(childEl);
      });

      if (card.elseCards.length < 4) {
        const addInlineElse = document.createElement('button');
        addInlineElse.className = 'pill-add-inline';
        addInlineElse.title = 'Tambah langkah cabang LAINNYA';
        addInlineElse.textContent = '+ Langkah';
        addInlineElse.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.game.codeRunner.isRunning) return;
          sounds.playClick();
          card.elseCards.push({ type: CONFIG.COMMANDS.FORWARD });
          this.renderQueue();
        });
        elseContainer.appendChild(addInlineElse);
      }
    }

    // Cavities dragover
    const thenCavity = eBlock.querySelector('.then-cavity');
    thenCavity.addEventListener('dragover', (e) => {
      e.preventDefault();
      thenCavity.classList.add('drag-over');
    });
    thenCavity.addEventListener('dragleave', (e) => {
      if (!thenCavity.contains(e.relatedTarget)) {
        thenCavity.classList.remove('drag-over');
      }
    });

    const elseCavity = eBlock.querySelector('.else-cavity');
    elseCavity.addEventListener('dragover', (e) => {
      e.preventDefault();
      elseCavity.classList.add('drag-over');
    });
    elseCavity.addEventListener('dragleave', (e) => {
      if (!elseCavity.contains(e.relatedTarget)) {
        elseCavity.classList.remove('drag-over');
      }
    });

    this.attachQueueDragEvents(eBlock, idx);
    return eBlock;
  }

  highlightStep(cardIndex) {
    this.activeCardIndex = cardIndex;
    this.errorCardIndex = -1;
    this.activeBranch = null;
    this.renderQueueHighlight();
  }

  highlightConditionalBranch(cardIndex, branch) {
    this.activeCardIndex = cardIndex;
    this.activeBranch = { cardIndex, branch };
    this.errorCardIndex = -1;
    this.renderQueueHighlight();
  }

  highlightError(cardIndex) {
    this.activeCardIndex = -1;
    this.errorCardIndex = cardIndex;
    this.activeBranch = null;
    this.renderQueueHighlight();
  }

  clearHighlight() {
    this.activeCardIndex = -1;
    this.errorCardIndex = -1;
    this.activeBranch = null;
    this.renderQueueHighlight();
  }

  renderQueueHighlight() {
    // Clear all existing branch highlights
    this.queueContainer.querySelectorAll('.branch-active').forEach(el => el.classList.remove('branch-active'));

    const slots = this.queueContainer.querySelectorAll('.scratch-block:not(.palette-block):not(.nested-scratch-block), .scratch-c-block, .scratch-e-block');
    slots.forEach((slot, idx) => {
      const isActive = idx === this.activeCardIndex;
      const isError = idx === this.errorCardIndex;
      slot.classList.toggle('active-step', isActive);
      slot.classList.toggle('error-step', isError);

      if (isActive) {
        slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // If conditional branch is active, light up the corresponding cavity!
        if (this.activeBranch && this.activeBranch.cardIndex === idx) {
          if (this.activeBranch.branch === 'then') {
            const thenCavity = slot.querySelector('.then-cavity');
            if (thenCavity) thenCavity.classList.add('branch-active');
          } else if (this.activeBranch.branch === 'else') {
            const elseCavity = slot.querySelector('.else-cavity');
            if (elseCavity) elseCavity.classList.add('branch-active');
          }
        }
      }
    });
  }

  updateHUD(crystalsCollected, totalCrystals) {
    this.hudCrystals.textContent = `${crystalsCollected} / ${totalCrystals}`;
  }

  setStatus(msg, isError = false) {
    if (this.hudStatusMessage) {
      this.hudStatusMessage.textContent = msg;
      this.hudStatusMessage.className = `status-bar ${isError ? 'error-text' : 'info-text'}`;
    }
  }

  showVictoryModal(stats) {
    const level = LEVELS[state.currentLevelIndex];
    
    // Calculate stars
    const star1 = true; // Reached finish portal
    const star2 = stats.crystalsCollected >= stats.totalCrystals;
    const star3 = stats.cardsUsed <= level.parCards;
    let stars = 1 + (star2 ? 1 : 0) + (star3 ? 1 : 0);

    // Save progress
    state.completeLevel(state.currentLevelIndex, stars, stats.crystalsCollected);

    // Modal Content
    const titleEl = document.getElementById('victory-level-title');
    if (titleEl) titleEl.textContent = `Level ${level.id}: ${level.title}`;

    // Byte Congratulatory Speech
    const quoteEl = document.getElementById('victory-byte-quote');
    if (quoteEl) {
      if (stars === 3) {
        quoteEl.textContent = "Luar biasa sempurna! Kamu memecahkan misi dengan 3 Bintang dan kode sangat efisien!";
      } else if (stars === 2) {
        const diff = Math.max(1, stats.cardsUsed - level.parCards);
        quoteEl.textContent = `Hebat! Rute tuntas & kristal terkumpul. Kurangi ${diff} kartu lagi untuk meraih 3 Bintang sempurna!`;
      } else {
        quoteEl.textContent = "Bagus! Kamu sampai di stasiun pendaratan. Kumpulkan semua kristal untuk meraih Bintang ke-2!";
      }
    }

    // Star Checklist Rows
    const crystalsBadge = document.getElementById('star-check-crystals-badge');
    if (crystalsBadge) {
      crystalsBadge.className = `check-badge ${star2 ? 'status-pass' : 'status-miss'}`;
      crystalsBadge.innerHTML = `${stats.crystalsCollected} / ${stats.totalCrystals} ${star2 ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-left:3px;"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-left:3px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}`;
    }

    const parBadge = document.getElementById('star-check-par-badge');
    if (parBadge) {
      parBadge.className = `check-badge ${star3 ? 'status-pass' : 'status-miss'}`;
      parBadge.innerHTML = `${stats.cardsUsed} Kartu (Par: ${level.parCards}) ${star3 ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-left:3px;"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-left:3px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}`;
    }

    const parTip = document.getElementById('star-check-par-tip');
    if (parTip) {
      parTip.classList.remove('hidden');
      if (!star3) {
        const diff = Math.max(1, stats.cardsUsed - level.parCards);
        parTip.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="#FACC15" stroke="#78350F" stroke-width="1.8" style="vertical-align: -2px; margin-right: 4px;"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path></svg><strong>Tantangan Bintang 3:</strong> Kamu menggunakan <strong>${stats.cardsUsed} kartu</strong>. Target Par adalah <strong>${level.parCards} kartu</strong>. Kurangi <strong>${diff} kartu</strong> (bisa memanfaatkan belokan efisien atau Loop) untuk meraih 3 Bintang!`;
      } else {
        parTip.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="#FACC15" stroke="#CA8A04" stroke-width="1.8" style="vertical-align: -2px; margin-right: 4px;"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M6 3h12v7a6 6 0 0 1-12 0V3zM9 21h6M12 17v4"></path></svg><strong>Efisiensi Kode Sempurna!</strong> Kamu berhasil menggunakan ${stats.cardsUsed} kartu (Target Par: ${level.parCards}). Strategi logikamu sangat mantap!`;
      }
    }

    // Stars render with staggered pop & audio chimes
    const starsContainer = document.getElementById('victory-stars-display');
    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let s = 1; s <= 3; s++) {
        const awarded = s <= stars;
        const starWrapper = document.createElement('div');
        starWrapper.className = 'star-wrapper';
        starWrapper.innerHTML = `
          <svg viewBox="0 0 24 24" width="54" height="54" fill="${awarded ? '#FACC15' : '#334155'}" stroke="${awarded ? '#F59E0B' : '#475569'}" stroke-width="1.6" style="filter: ${awarded ? 'drop-shadow(0 0 16px rgba(250, 204, 21, 0.8))' : 'none'};">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        `;
        if (awarded) {
          starWrapper.style.opacity = '0';
          setTimeout(() => {
            starWrapper.style.opacity = '1';
            starWrapper.classList.add('awarded');
            sounds.playStar(s);
          }, s * 240);
        }
        starsContainer.appendChild(starWrapper);
      }
    }

    // Confetti particles celebration
    const confettiBox = document.getElementById('victory-confetti-container');
    if (confettiBox) {
      confettiBox.innerHTML = '';
      const colors = ['#F59E0B', '#10B981', '#38BDF8', '#EC4899', '#A855F7', '#FBBF24', '#34D399'];
      for (let i = 0; i < 30; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 1.5}s`;
        piece.style.animationDuration = `${1.8 + Math.random() * 1.5}s`;
        confettiBox.appendChild(piece);
      }
    }

    this.modalVictory.classList.remove('hidden');
  }
}
