/**
 * KodingBot: Petualangan Pulau Algoritma
 * Central State Manager & Progression Store
 */

import { safeStorage } from './storage.js';

class StateManager {
  constructor() {
    this.currentScreen = 'splash'; // 'splash', 'menu', 'level_select', 'game', 'how_to', 'about'
    this.currentLevelIndex = 0;
    this.unlockedLevels = 30; // Mode Belajar Bebas: Seluruh 30 level langsung terbuka untuk eksplorasi fleksibel
    this.allLevelsUnlocked = true;
    this.levelStars = {}; // e.g. { 0: 3, 1: 2 }
    this.totalCrystals = 0;
    this.isExecuting = false;
    
    this.loadProgress();
  }

  loadProgress() {
    try {
      const saved = safeStorage.getItem('kodingbot_progress') || safeStorage.getItem('robojalur_progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.levelStars = data.levelStars || {};
        this.totalCrystals = data.totalCrystals || 0;
        // Tetap pastikan seluruh level terbuka untuk mode belajar fleksibel
        this.unlockedLevels = 30;
      }
    } catch (e) {
      console.warn('Could not load progress from safeStorage', e);
    }
  }

  saveProgress() {
    try {
      const data = {
        unlockedLevels: 30,
        levelStars: this.levelStars,
        totalCrystals: this.totalCrystals
      };
      safeStorage.setItem('kodingbot_progress', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save progress to safeStorage', e);
    }
  }

  completeLevel(levelIdx, starsEarned, crystalsCollected) {
    const currentStars = this.levelStars[levelIdx] || 0;
    if (starsEarned > currentStars) {
      this.levelStars[levelIdx] = starsEarned;
    }
    
    this.unlockedLevels = 30;
    this.totalCrystals += crystalsCollected;
    this.saveProgress();
  }

  resetProgress() {
    this.unlockedLevels = 30;
    this.levelStars = {};
    this.totalCrystals = 0;
    safeStorage.removeItem('kodingbot_progress');
    safeStorage.removeItem('robojalur_progress');
  }

  isLevelUnlocked(levelIdx) {
    return true; // Seluruh 30 level dapat dimainkan bebas kapan saja
  }

  getStarsForLevel(levelIdx) {
    return this.levelStars[levelIdx] || 0;
  }
}

export const state = new StateManager();
