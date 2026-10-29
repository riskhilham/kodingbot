/**
 * KodingBot: Petualangan Pulau Algoritma
 * Code Interpreter & Visual Tracing Engine
 * Executes commands sequentially, unwraps loops, tracks errors, and provides debugging hooks.
 */

import { CONFIG } from '../config.js';
import { sounds } from '../audio/soundManager.js';

export class CodeRunner {
  constructor(robot, tileMap) {
    this.robot = robot;
    this.tileMap = tileMap;
    this.isRunning = false;
    this.abortRequested = false;
    this.currentStepIndex = -1;
    this.speedMultiplier = 1.0;

    // Step-by-Step execution state (Code tracing)
    this.isStepMode = false;
    this.stepPointer = 0;
    this.stepCards = [];
    this.stepTotal = 0;
    
    // Event callbacks
    this.onStepStart = null; // (cardIndex, stepIndex, totalSteps)
    this.onStepEnd = null;
    this.onError = null;     // (message, cardIndex)
    this.onSuccess = null;   // (stats)
    this.onFinished = null;
    this.onConditionalBranch = null; // (cardIndex, 'then' | 'else')
  }

  setContext(robot, tileMap) {
    this.robot = robot;
    this.tileMap = tileMap;
    this.stop();
  }

  /**
   * Expands program cards into flattened atomic steps.
   * Handles nested Scratch C-Block loops and E-Block conditionals.
   */
  flattenCards(cards) {
    const steps = [];
    cards.forEach((card, cardIndex) => {
      if (card.type === CONFIG.COMMANDS.LOOP) {
        const count = card.count || 2;
        const innerCards = (card.bodyCards && card.bodyCards.length > 0)
          ? card.bodyCards
          : (card.subCommand ? [{ type: card.subCommand }] : [{ type: CONFIG.COMMANDS.FORWARD }]);

        for (let i = 0; i < count; i++) {
          innerCards.forEach((innerCard, innerIdx) => {
            if (innerCard.type === CONFIG.COMMANDS.IF_OBSTACLE) {
              steps.push({
                type: CONFIG.COMMANDS.IF_OBSTACLE,
                cardIndex: cardIndex,
                subIndex: innerIdx,
                isLoop: true,
                iteration: i + 1,
                totalIterations: count,
                condition: innerCard.condition || 'OBSTACLE_AHEAD',
                thenCards: innerCard.thenCards || [{ type: innerCard.thenCommand || CONFIG.COMMANDS.JUMP }],
                elseCards: innerCard.elseCards || [{ type: innerCard.elseCommand || CONFIG.COMMANDS.FORWARD }]
              });
            } else {
              steps.push({
                type: innerCard.type,
                cardIndex: cardIndex,
                subIndex: innerIdx,
                isLoop: true,
                iteration: i + 1,
                totalIterations: count
              });
            }
          });
        }
      } else if (card.type === CONFIG.COMMANDS.IF_OBSTACLE) {
        steps.push({
          type: CONFIG.COMMANDS.IF_OBSTACLE,
          cardIndex: cardIndex,
          isLoop: false,
          condition: card.condition || 'OBSTACLE_AHEAD',
          thenCards: card.thenCards || [{ type: card.thenCommand || CONFIG.COMMANDS.JUMP }],
          elseCards: card.elseCards || [{ type: card.elseCommand || CONFIG.COMMANDS.FORWARD }]
        });
      } else {
        steps.push({
          type: card.type,
          cardIndex: cardIndex,
          isLoop: false
        });
      }
    });
    return steps;
  }

  async run(cards) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.abortRequested = false;

    // If resuming from step mode, continue from current pointer
    let steps = [];
    let startIdx = 0;
    if (this.isStepMode && this.stepPointer > 0 && this.stepCards.length > 0) {
      steps = this.stepCards;
      startIdx = this.stepPointer;
    } else {
      steps = this.flattenCards(cards);
      startIdx = 0;
    }
    this.isStepMode = false;

    if (steps.length === 0) {
      if (this.onError) {
        this.onError("Peringatan: Antrean program masih kosong. Pilih kartu perintah di sebelah kanan untuk menyusun rute.", -1);
      }
      this.isRunning = false;
      return;
    }

    for (let i = startIdx; i < steps.length; i++) {
      if (this.abortRequested) break;

      this.currentStepIndex = i;
      this.stepPointer = i + 1;
      const step = steps[i];
      const nextStep = steps[i + 1];

      // Check if this step flows continuously into another forward step
      const isContinuousForward = (
        step.type === CONFIG.COMMANDS.FORWARD &&
        nextStep &&
        nextStep.type === CONFIG.COMMANDS.FORWARD
      );

      // Highlight active card
      if (this.onStepStart) {
        this.onStepStart(step.cardIndex, i, steps.length);
      }

      // Execute atomic step
      const stepSuccess = await this.executeStep(step, isContinuousForward);
      
      if (!stepSuccess) {
        // Robot hit an obstacle or fell
        this.isRunning = false;
        return;
      }

      // Check if robot reached the finish pad!
      if (this.tileMap.isFinish(this.robot.gridX, this.robot.gridY)) {
        this.robot.setVictory();
        sounds.playFanfare();
        if (this.onSuccess) {
          this.onSuccess({
            cardsUsed: cards.length,
            crystalsCollected: this.tileMap.getCrystalsCollectedCount(),
            totalCrystals: this.tileMap.crystals.length
          });
        }
        this.isRunning = false;
        return;
      }

      if (this.onStepEnd) {
        this.onStepEnd(step.cardIndex, i);
      }

      // Stride pause: brief fluid handoff for continuous strides; natural pause for turns/jumps
      if (isContinuousForward) {
        await this.sleep(Math.round(25 / (this.speedMultiplier || 1)));
      } else {
        await this.sleep(Math.round(70 / (this.speedMultiplier || 1)));
      }
    }

    this.isRunning = false;

    // Check if finished sequence but didn't reach goal
    if (!this.tileMap.isFinish(this.robot.gridX, this.robot.gridY) && !this.abortRequested) {
      if (this.onError) {
        this.onError("Evaluasi Rute: Seluruh kartu telah dijalankan, namun robot Byte belum sampai di stasiun pendaratan. Tambahkan perintah langkah berikutnya!", -1);
      }
    }

    if (this.onFinished) {
      this.onFinished();
    }
  }

  /**
   * Executes exactly one atomic step from the program cards (Code Tracing Mode).
   */
  async step(cards) {
    if (this.isRunning) return;
    this.abortRequested = false;

    // Check if initializing step mode or if cards modified
    if (!this.isStepMode || this.stepPointer >= this.stepCards.length) {
      this.isStepMode = true;
      this.stepCards = this.flattenCards(cards);
      this.stepPointer = 0;
      this.stepTotal = this.stepCards.length;
      if (this.stepCards.length === 0) {
        if (this.onError) {
          this.onError("Peringatan: Antrean program masih kosong. Pilih kartu perintah di sebelah kanan untuk menyusun rute.", -1);
        }
        this.isStepMode = false;
        return;
      }
    }

    if (this.stepPointer >= this.stepCards.length) {
      this.isStepMode = false;
      return;
    }

    this.isRunning = true;
    const i = this.stepPointer;
    const step = this.stepCards[i];
    this.currentStepIndex = i;

    if (this.onStepStart) {
      this.onStepStart(step.cardIndex, i, this.stepTotal);
    }

    const stepSuccess = await this.executeStep(step, false);

    if (!stepSuccess) {
      this.isRunning = false;
      this.isStepMode = false;
      return;
    }

    this.stepPointer++;

    // Check if reached finish
    if (this.tileMap.isFinish(this.robot.gridX, this.robot.gridY)) {
      this.robot.setVictory();
      sounds.playFanfare();
      if (this.onSuccess) {
        this.onSuccess({
          cardsUsed: cards.length,
          crystalsCollected: this.tileMap.getCrystalsCollectedCount(),
          totalCrystals: this.tileMap.crystals.length
        });
      }
      this.isRunning = false;
      this.isStepMode = false;
      return;
    }

    if (this.onStepEnd) {
      this.onStepEnd(step.cardIndex, i);
    }

    this.isRunning = false;

    // If exhausted all steps
    if (this.stepPointer >= this.stepCards.length) {
      if (!this.tileMap.isFinish(this.robot.gridX, this.robot.gridY)) {
        if (this.onError) {
          this.onError("Evaluasi Rute: Seluruh langkah telah dijalankan satu per satu, namun robot Byte belum sampai di stasiun pendaratan. Tambahkan perintah berikutnya!", -1);
        }
      }
      this.isStepMode = false;
    }
  }

  async executeStep(step, isContinuous = false) {
    const dirVec = CONFIG.DIR_VECTORS[this.robot.direction];
    const spd = this.speedMultiplier || 1;
    const stepDuration = Math.round(CONFIG.STEP_DURATION / spd);
    const turnDuration = Math.round(260 / spd);
    const jumpDuration = Math.round(CONFIG.JUMP_DURATION / spd);

    switch (step.type) {
      case CONFIG.COMMANDS.FORWARD: {
        const nextX = this.robot.gridX + dirVec.dx;
        const nextY = this.robot.gridY + dirVec.dy;

        if (this.tileMap.isWalkable(nextX, nextY)) {
          this.robot.moveTo(nextX, nextY, false, spd, isContinuous);
          sounds.playStep();
          await this.sleep(stepDuration);

          // Check collectibles & triggers
          this.checkTileEvents(nextX, nextY);
          return true;
        } else {
          // Obstacle collision
          this.robot.setBump();
          sounds.playBump();
          await this.sleep(stepDuration);

          let errorMsg = "Peringatan Rute: Robot Byte terhalang dinding batu. Periksa urutan belokan sebelum melangkah.";
          if (this.tileMap.isWaterOrHazard(nextX, nextY)) {
            errorMsg = "Peringatan Rute: Terdapat aliran air sungai di depan. Gunakan kartu LOMPAT untuk melintasinya.";
          }
          if (this.onError) {
            this.onError(errorMsg, step.cardIndex);
          }
          return false;
        }
      }

      case CONFIG.COMMANDS.TURN_RIGHT: {
        const nextDir = (this.robot.direction + 1) % 4;
        this.robot.turn(nextDir, spd);
        sounds.playTurn();
        await this.sleep(turnDuration);
        return true;
      }

      case CONFIG.COMMANDS.TURN_LEFT: {
        const nextDir = (this.robot.direction + 3) % 4;
        this.robot.turn(nextDir, spd);
        sounds.playTurn();
        await this.sleep(turnDuration);
        return true;
      }

      case CONFIG.COMMANDS.JUMP: {
        // Jump over 1 tile (lands 2 tiles ahead)
        const midX = this.robot.gridX + dirVec.dx;
        const midY = this.robot.gridY + dirVec.dy;
        const landX = this.robot.gridX + dirVec.dx * 2;
        const landY = this.robot.gridY + dirVec.dy * 2;

        if (this.tileMap.isWalkable(landX, landY)) {
          this.robot.moveTo(landX, landY, true, spd);
          sounds.playJump();
          await this.sleep(jumpDuration);

          this.checkTileEvents(landX, landY);
          return true;
        } else {
          // Cannot land safely
          this.robot.setBump();
          sounds.playBump();
          await this.sleep(jumpDuration);

          if (this.onError) {
            this.onError("Peringatan Lompatan: Petak pendaratan di depan terhalang rintangan. Pastikan ada ubin aman sejauh 2 petak di depan robot.", step.cardIndex);
          }
          return false;
        }
      }

      case CONFIG.COMMANDS.IF_OBSTACLE: {
        const checkX = this.robot.gridX + dirVec.dx;
        const checkY = this.robot.gridY + dirVec.dy;
        
        let conditionMet = false;
        const condType = step.condition || 'OBSTACLE_AHEAD';
        if (condType === 'CRYSTAL_AHEAD') {
          conditionMet = this.tileMap.hasCrystalAt(checkX, checkY);
        } else if (condType === 'DEAD_END') {
          conditionMet = !this.tileMap.isWalkable(checkX, checkY);
        } else {
          // Default: OBSTACLE_AHEAD (water, pit, or cliff blocking path)
          conditionMet = !this.tileMap.isWalkable(checkX, checkY);
        }

        const branchName = conditionMet ? 'then' : 'else';

        // Notify UI to highlight the active branch cavity during runtime!
        if (this.onConditionalBranch) {
          this.onConditionalBranch(step.cardIndex, branchName);
        }

        const branchCards = conditionMet 
          ? (step.thenCards || [{ type: step.thenCommand || CONFIG.COMMANDS.JUMP }]) 
          : (step.elseCards || [{ type: step.elseCommand || CONFIG.COMMANDS.FORWARD }]);

        for (let b = 0; b < branchCards.length; b++) {
          const bCard = branchCards[b];
          const isSubContinuous = (
            bCard.type === CONFIG.COMMANDS.FORWARD &&
            b < branchCards.length - 1 &&
            branchCards[b + 1].type === CONFIG.COMMANDS.FORWARD
          );
          const success = await this.executeStep({
            type: bCard.type,
            cardIndex: step.cardIndex,
            isLoop: step.isLoop
          }, isSubContinuous);
          if (!success) return false;
        }
        return true;
      }

      default:
        return true;
    }
  }

  checkTileEvents(x, y) {
    // Check crystal
    const crystal = this.tileMap.checkCollectibles(x, y);
    if (crystal) {
      sounds.playCrystal();
    }

    // Check switches
    const switchTriggered = this.tileMap.checkTriggers(x, y);
    if (switchTriggered) {
      sounds.playSwitch();
    }
  }

  stop() {
    this.abortRequested = true;
    this.isRunning = false;
    this.isStepMode = false;
    this.stepPointer = 0;
    this.stepCards = [];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
