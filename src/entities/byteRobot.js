/**
 * KodingBot: Petualangan Pulau Algoritma
 * Robot Byte Entity — Chibi explorer robot with dynamic visor animations
 */

import { CONFIG } from '../config.js';
import { assets } from '../core/assetManager.js';

export class ByteRobot {
  constructor(startPos) {
    this.gridX = startPos ? startPos.x : 1;
    this.gridY = startPos ? startPos.y : 1;
    this.direction = startPos ? startPos.dir : CONFIG.DIRECTIONS.RIGHT;
    
    // Pixel coordinates for smooth movement
    this.renderX = this.gridX;
    this.renderY = this.gridY;
    this.targetX = this.gridX;
    this.targetY = this.gridY;
    
    // Rotation & Jump
    this.angle = this.dirToAngle(this.direction);
    this.targetAngle = this.angle;
    this.jumpHeight = 0;
    this.isJumping = false;
    this.isMoving = false;
    this.isBumping = false;
    this.isVictory = false;
    
    // Animation timers & state
    this.animTimer = 0;
    this.blinkTimer = 0;
    this.expression = 'normal'; // 'normal', 'blink', 'dizzy', 'victory'
    this.moveProgress = 1;
    this.moveDuration = 0.4;
    this.continuousStride = false;
    this.strideBob = 0;

    // Wheel roll & smooth turning states
    this.wheelSpin = 0;
    this.isTurning = false;
    this.turnProgress = 1;
    this.turnDuration = 0.22;
    this.turnDirection = 1;
    this.antennaInertia = 0;
    this.dustParticles = [];
  }

  dirToAngle(dir) {
    // 0: Down (90° / PI/2), 1: Right (0), 2: Up (-90° / -PI/2), 3: Left (180° / PI)
    switch(dir) {
      case CONFIG.DIRECTIONS.RIGHT: return 0;
      case CONFIG.DIRECTIONS.DOWN: return Math.PI / 2;
      case CONFIG.DIRECTIONS.LEFT: return Math.PI;
      case CONFIG.DIRECTIONS.UP: return -Math.PI / 2;
      default: return 0;
    }
  }

  reset(startPos) {
    this.gridX = startPos.x;
    this.gridY = startPos.y;
    this.direction = startPos.dir;
    this.renderX = this.gridX;
    this.renderY = this.gridY;
    this.targetX = this.gridX;
    this.targetY = this.gridY;
    this.angle = this.dirToAngle(this.direction);
    this.targetAngle = this.angle;
    this.jumpHeight = 0;
    this.isJumping = false;
    this.isMoving = false;
    this.isBumping = false;
    this.isVictory = false;
    this.expression = 'normal';
    this.moveProgress = 1;
    this.continuousStride = false;
    this.strideBob = 0;
    this.wheelSpin = 0;
    this.isTurning = false;
    this.turnProgress = 1;
    this.antennaInertia = 0;
    this.dustParticles = [];
  }

  moveTo(gx, gy, isJump = false, speedMultiplier = 1, continuous = false) {
    this.startX = this.renderX;
    this.startY = this.renderY;
    this.targetX = gx;
    this.targetY = gy;
    this.gridX = gx;
    this.gridY = gy;
    this.isMoving = true;
    this.isJumping = isJump;
    this.continuousStride = continuous;
    this.moveProgress = 0;
    const baseDuration = isJump ? (CONFIG.JUMP_DURATION / 1000) : (CONFIG.STEP_DURATION / 1000);
    this.moveDuration = baseDuration / (speedMultiplier || 1);
  }

  turn(newDir, speedMultiplier = 1) {
    let target = this.dirToAngle(newDir);
    // Find shortest angle distance
    let diff = target - this.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.targetAngle = this.angle + diff;
    this.turnDirection = diff >= 0 ? 1 : -1;
    this.direction = newDir;
    this.turnSpeed = 16 * (speedMultiplier || 1);

    // Trigger smooth turning swivel animation
    this.isTurning = true;
    this.turnProgress = 0;
    this.turnDuration = 0.22 / (speedMultiplier || 1);
  }

  setBump() {
    this.isBumping = true;
    this.expression = 'dizzy';
    setTimeout(() => {
      this.isBumping = false;
    }, 1200);
  }

  setVictory() {
    this.isVictory = true;
    this.expression = 'victory';
  }

  update(dt) {
    this.animTimer += dt;
    this.blinkTimer += dt;

    // Wheel roll animation when moving
    if (this.isMoving) {
      this.wheelSpin += dt * 16;
    }

    // Smooth turning swivel animation
    if (this.isTurning) {
      this.turnProgress += dt / this.turnDuration;
      if (this.turnProgress >= 1) {
        this.turnProgress = 1;
        this.isTurning = false;
        this.antennaInertia = 0;
      } else {
        // Antenna trails opposite to rotation, then bounces back
        const p = this.turnProgress;
        this.antennaInertia = -this.turnDirection * Math.sin(p * Math.PI) * 0.38;
      }
    }

    // Random blinking
    if (this.expression === 'normal') {
      if (this.blinkTimer > 3.5) {
        this.expression = 'blink';
        setTimeout(() => {
          if (this.expression === 'blink') this.expression = 'normal';
          this.blinkTimer = 0;
        }, 150);
      }
    }

    // Move interpolation
    if (this.isMoving) {
      this.moveProgress += dt / this.moveDuration;
      if (this.moveProgress >= 1) {
        this.moveProgress = 1;
        this.renderX = this.targetX;
        this.renderY = this.targetY;
        this.isMoving = false;
        if (this.isJumping) {
          this.spawnLandingDust();
        }
        this.isJumping = false;
        this.jumpHeight = 0;
        this.strideBob = 0;
      } else {
        const t = this.moveProgress;
        let ease;
        if (this.continuousStride) {
          // Flowing linear-cushioned curve for consecutive steps
          ease = t < 0.2 ? 2.5 * t * t : (t > 0.8 ? 1 - 2.5 * (1 - t) * (1 - t) : 0.1 + (t - 0.2) * (0.8 / 0.6));
        } else {
          // Natural sinusoidal ease-in-out for single step
          ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
        }

        this.renderX = this.startX + (this.targetX - this.startX) * ease;
        this.renderY = this.startY + (this.targetY - this.startY) * ease;

        if (this.isJumping) {
          // Parabolic jump arc
          this.jumpHeight = Math.sin(t * Math.PI) * 36;
          this.strideBob = 0;
        } else {
          // Lively walking stride bounce (hops smoothly on each step)
          this.strideBob = Math.sin(t * Math.PI) * -3.2;
        }
      }
    } else {
      this.strideBob = 0;
    }

    // Angle interpolation
    const angleDiff = this.targetAngle - this.angle;
    const speed = this.turnSpeed || 16;
    if (Math.abs(angleDiff) > 0.01) {
      this.angle += angleDiff * speed * dt;
    } else {
      this.angle = this.targetAngle;
    }

    // Update jump landing dust particles
    if (this.dustParticles && this.dustParticles.length > 0) {
      for (let i = this.dustParticles.length - 1; i >= 0; i--) {
        const p = this.dustParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= dt * 2.5;
        p.radius += dt * 6;
        if (p.alpha <= 0) {
          this.dustParticles.splice(i, 1);
        }
      }
    }
  }

  spawnLandingDust() {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 20 + Math.random() * 25;
      this.dustParticles.push({
        x: 0,
        y: 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.45,
        radius: 3 + Math.random() * 2.5,
        alpha: 0.65
      });
    }
  }

  render(ctx, offsetX, offsetY, tileSize) {
    const px = offsetX + this.renderX * tileSize + tileSize / 2;
    const py = offsetY + this.renderY * tileSize + tileSize / 2 - this.jumpHeight;
    const scale = tileSize / 72;
    
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale, scale);

    // Subtle breathing bounce (ONLY when completely idle and NOT stepping)
    const idleBob = (!this.isMoving && !this.isTurning) ? Math.sin(this.animTimer * 4) * 2.2 : 0;
    const totalBob = idleBob + (this.strideBob || 0);
    
    // Dynamic Drop Shadow (scales with jump height and stride bounce)
    ctx.beginPath();
    const shadowW = Math.max(10, 22 - (this.jumpHeight / scale) * 0.25);
    const shadowH = Math.max(5, 10 - (this.jumpHeight / scale) * 0.15);
    ctx.ellipse(0, 23 + (this.jumpHeight / scale) * 0.55, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
    ctx.fill();

    // Render landing dust puff particles
    if (this.dustParticles && this.dustParticles.length > 0) {
      for (const p of this.dustParticles) {
        ctx.fillStyle = `rgba(241, 245, 249, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y + 16, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bump shake effect when hitting obstacle
    if (this.isBumping) {
      const shake = Math.sin(this.animTimer * 40) * 4;
      ctx.translate(shake, 0);
    }

    // Victory celebration hop
    if (this.isVictory) {
      const hop = Math.abs(Math.sin(this.animTimer * 7)) * 16;
      ctx.translate(0, -hop);
    }

    ctx.save();
    ctx.translate(0, totalBob);

    // Turning swivel animation (squash & stretch spring effect)
    if (this.isTurning) {
      const p = this.turnProgress;
      const swivelHop = Math.sin(p * Math.PI) * -3.5;
      const squashX = 1 - Math.sin(p * Math.PI) * 0.15;
      const stretchY = 1 + Math.sin(p * Math.PI) * 0.12;
      ctx.translate(0, swivelHop);
      ctx.scale(squashX, stretchY);
      ctx.rotate(this.turnDirection * Math.sin(p * Math.PI) * 0.1);
    }

    // Directional walking lean
    if (this.isMoving && !this.isJumping) {
      const lean = Math.sin(this.moveProgress * Math.PI) * 0.06;
      if (this.direction === CONFIG.DIRECTIONS.RIGHT) {
        ctx.rotate(lean);
      } else if (this.direction === CONFIG.DIRECTIONS.LEFT) {
        ctx.rotate(-lean);
      } else if (this.direction === CONFIG.DIRECTIONS.DOWN) {
        ctx.translate(0, 1.2 * Math.sin(this.moveProgress * Math.PI));
      } else if (this.direction === CONFIG.DIRECTIONS.UP) {
        ctx.translate(0, -1.2 * Math.sin(this.moveProgress * Math.PI));
      }
    }

    switch (this.direction) {
      case CONFIG.DIRECTIONS.UP:
        this.renderFacingUp(ctx, tileSize);
        break;
      case CONFIG.DIRECTIONS.DOWN:
        this.renderFacingDown(ctx, tileSize);
        break;
      case CONFIG.DIRECTIONS.LEFT:
        ctx.save();
        ctx.scale(-1, 1);
        this.renderFacingRight(ctx, tileSize);
        ctx.restore();
        break;
      case CONFIG.DIRECTIONS.RIGHT:
      default:
        this.renderFacingRight(ctx, tileSize);
        break;
    }

    ctx.restore();
    ctx.restore();
  }

  // 1. HADAP BAWAH / DEPAN (Full Frontal View with Visor & Expressive Eyes)
  renderFacingDown(ctx, tileSize) {
    // Solar Panel Backpack tips peeking behind shoulders
    ctx.fillStyle = '#1E3A8A';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-24, -14, 10, 16, 2);
    ctx.roundRect(14, -14, 10, 16, 2);
    ctx.fill();
    ctx.stroke();

    // Omni-Wheel Base
    this.renderOmniWheel(ctx, 0, 14, 0);

    // Torso / Body Chassis
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-16, -6, 32, 19, 6);
    ctx.fill();
    ctx.stroke();

    // Orange Chest Armor Plate with Cyan Power Core
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.roundRect(-11, -3, 22, 11, 4);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#22D3EE';
    ctx.shadowColor = '#22D3EE';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, 2.5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Headphone Ear Nodes
    this.renderEarNodes(ctx, -25, 19, -18);

    // Head / Helmet
    this.renderHelmetBase(ctx);

    // Visor Glass
    this.renderVisorGlass(ctx, -17, -21, 34, 21);

    // LED Eyes and Smile
    this.renderFaceExpressions(ctx, 0, 0);

    // Antenna & Blinking Beacon
    this.renderAntenna(ctx, 0, -26);
  }

  // 2. HADAP ATAS / BELAKANG (Back View with Solar Panel Backpack)
  renderFacingUp(ctx, tileSize) {
    // Omni-Wheel Base (seen rolling away)
    this.renderOmniWheel(ctx, 0, 14, 0);

    // Headphone Ear Nodes (back view)
    this.renderEarNodes(ctx, -25, 19, -18);

    // Head (Back of white helmet)
    const headGrad = ctx.createLinearGradient(0, -26, 0, 8);
    headGrad.addColorStop(0, '#FFFFFF');
    headGrad.addColorStop(0.5, '#F8FAFC');
    headGrad.addColorStop(1, '#E2E8F0');

    ctx.beginPath();
    ctx.roundRect(-22, -26, 44, 34, 12);
    ctx.fillStyle = headGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Orange crown stripe across the back of the helmet
    ctx.beginPath();
    ctx.roundRect(-12, -26, 24, 7, [4, 4, 0, 0]);
    ctx.fillStyle = '#F97316';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Antenna & Beacon
    this.renderAntenna(ctx, 0, -26);

    // Prominent Solar Panel Backpack (Full view on back)
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-20, -10, 40, 24, 6);
    ctx.fill();
    ctx.stroke();

    // Deep Blue Photovoltaic Solar Matrix
    ctx.fillStyle = '#1E3A8A';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-16, -7, 32, 18, 3);
    ctx.fill();
    ctx.stroke();

    // Solar Cell Grid Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-16, 2); ctx.lineTo(16, 2); // Horizontal dividing line
    ctx.moveTo(-5, -7); ctx.lineTo(-5, 11); // Vertical dividing line 1
    ctx.moveTo(5, -7); ctx.lineTo(5, 11);   // Vertical dividing line 2
    ctx.stroke();

    // Glowing Cyan Power Conduit Plug
    ctx.fillStyle = '#22D3EE';
    ctx.shadowColor = '#22D3EE';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // 3. HADAP KANAN (Profile / 3-Quarter Right View)
  renderFacingRight(ctx, tileSize) {
    // Solar Backpack on the Left/Back
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-25, -12, 14, 22, 4);
    ctx.fill();
    ctx.stroke();

    // Photovoltaic cell on backpack
    ctx.fillStyle = '#1E3A8A';
    ctx.beginPath();
    ctx.roundRect(-23, -9, 8, 16, 2);
    ctx.fill();

    // Omni-Wheel (Profile View)
    ctx.save();
    ctx.translate(1, 14);
    ctx.beginPath();
    ctx.ellipse(0, 4, 14, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Wheel rim hubcap
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(0, 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Torso / Body (Profile)
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-14, -6, 26, 18, 6);
    ctx.fill();
    ctx.stroke();

    // Orange side shoulder armor
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.roundRect(-6, -4, 14, 12, 3);
    ctx.fill();
    ctx.stroke();

    // Head / Helmet (Shifted right)
    const headGrad = ctx.createLinearGradient(0, -26, 0, 8);
    headGrad.addColorStop(0, '#FFFFFF');
    headGrad.addColorStop(0.5, '#F8FAFC');
    headGrad.addColorStop(1, '#E2E8F0');

    ctx.beginPath();
    ctx.roundRect(-18, -26, 40, 34, 12);
    ctx.fillStyle = headGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Specular highlight on helmet
    ctx.beginPath();
    ctx.arc(-10, -20, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Orange crown stripe
    ctx.beginPath();
    ctx.roundRect(-10, -26, 24, 7, [4, 4, 0, 0]);
    ctx.fillStyle = '#F97316';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Left ear node on profile
    ctx.fillStyle = '#06B6D4';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(-22, -18, 6, 14, 3);
    ctx.fill();
    ctx.stroke();

    // Visor Glass (Right-Curved Profile)
    ctx.beginPath();
    ctx.roundRect(-7, -21, 27, 21, [4, 8, 8, 4]);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1E293B';
    ctx.stroke();

    // Visor reflection
    ctx.beginPath();
    ctx.ellipse(5, -17, 8, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fill();

    // Cute pink blush cheek
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(10, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Profile Eye & Smile
    ctx.fillStyle = '#22D3EE';
    ctx.shadowColor = '#22D3EE';
    ctx.shadowBlur = 8;

    if (this.expression === 'blink') {
      ctx.fillRect(4, -11, 8, 2.5);
    } else if (this.expression === 'dizzy') {
      this.drawCrossEye(ctx, 8, -11);
    } else if (this.expression === 'victory') {
      this.drawHappyEye(ctx, 8, -9);
    } else {
      // Big friendly anime eye looking forward
      ctx.beginPath();
      ctx.arc(8, -11, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Glint
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(7, -12, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.beginPath();
      ctx.arc(9, -6, 3, 0.2, Math.PI - 0.2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#22D3EE';
      ctx.stroke();
    }

    // Antenna & Beacon
    this.renderAntenna(ctx, 0, -26);
  }

  // --- REUSABLE HELPER RENDERERS ---

  renderOmniWheel(ctx, x, y, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 9.5, rot, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Dynamic wheel roll animation with tread movement
    const rollOffset = Math.sin(this.wheelSpin || 0) * 4;
    ctx.beginPath();
    ctx.arc(rollOffset, 4, 8, 0, Math.PI);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Wheel hubcap center
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(rollOffset * 0.3, 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderHelmetBase(ctx) {
    const headGrad = ctx.createLinearGradient(0, -26, 0, 8);
    headGrad.addColorStop(0, '#FFFFFF');
    headGrad.addColorStop(0.5, '#F8FAFC');
    headGrad.addColorStop(1, '#E2E8F0');

    ctx.beginPath();
    ctx.roundRect(-22, -26, 44, 34, 12);
    ctx.fillStyle = headGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Specular highlight dot
    ctx.beginPath();
    ctx.arc(-14, -20, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Orange crown stripe
    ctx.beginPath();
    ctx.roundRect(-12, -26, 24, 7, [4, 4, 0, 0]);
    ctx.fillStyle = '#F97316';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();
  }

  renderEarNodes(ctx, leftX, rightX, y) {
    ctx.fillStyle = '#06B6D4';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(leftX, y, 6, 14, 3);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(rightX, y, 6, 14, 3);
    ctx.fill();
    ctx.stroke();
  }

  renderVisorGlass(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1E293B';
    ctx.stroke();

    // Visor Glass Reflection highlight arc
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 3, w * 0.35, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fill();

    // Cute blush cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.38)';
    ctx.beginPath();
    ctx.arc(x + 6, y + h - 5, 2.5, 0, Math.PI * 2);
    ctx.arc(x + w - 6, y + h - 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  renderFaceExpressions(ctx, offsetX, offsetY) {
    ctx.fillStyle = '#22D3EE';
    ctx.shadowColor = '#22D3EE';
    ctx.shadowBlur = 8;

    if (this.expression === 'blink') {
      ctx.fillRect(-11 + offsetX, -11 + offsetY, 8, 2.5);
      ctx.fillRect(3 + offsetX, -11 + offsetY, 8, 2.5);
    } else if (this.expression === 'dizzy') {
      this.drawCrossEye(ctx, -7, -11);
      this.drawCrossEye(ctx, 7, -11);
    } else if (this.expression === 'victory') {
      this.drawHappyEye(ctx, -7, -9);
      this.drawHappyEye(ctx, 7, -9);
    } else {
      // Big friendly anime eyes with pupil glints
      ctx.beginPath();
      ctx.arc(-7 + offsetX, -11 + offsetY, 4, 0, Math.PI * 2);
      ctx.arc(7 + offsetX, -11 + offsetY, 4, 0, Math.PI * 2);
      ctx.fill();

      // White eye glints
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-8 + offsetX, -12 + offsetY, 1.5, 0, Math.PI * 2);
      ctx.arc(6 + offsetX, -12 + offsetY, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Friendly smile
      ctx.beginPath();
      ctx.arc(offsetX, -7 + offsetY, 3.5, 0.2, Math.PI - 0.2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#22D3EE';
      ctx.stroke();
    }
  }

  renderAntenna(ctx, x, y) {
    ctx.save();
    // Dynamic antenna sway with physics inertia from turns and steps
    const sway = (this.antennaInertia || 0) + (this.isMoving ? Math.sin(this.moveProgress * Math.PI * 2) * 0.06 : 0);
    ctx.translate(x, y);
    ctx.rotate(sway);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -12);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Antenna Beacon (blinks warm sunny yellow)
    const beaconGlow = Math.sin(this.animTimer * 8) > 0;
    ctx.beginPath();
    ctx.arc(0, -14, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = beaconGlow ? '#FDE047' : '#F59E0B';
    ctx.shadowColor = '#FACC15';
    ctx.shadowBlur = beaconGlow ? 12 : 4;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    ctx.restore();
  }

  drawCrossEye(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 3, y - 3);
    ctx.lineTo(x + 3, y + 3);
    ctx.moveTo(x + 3, y - 3);
    ctx.lineTo(x - 3, y + 3);
    ctx.stroke();
    ctx.restore();
  }

  drawHappyEye(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, 4, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.restore();
  }
}
