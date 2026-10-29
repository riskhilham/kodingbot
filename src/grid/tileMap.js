/**
 * KodingBot: Petualangan Pulau Algoritma
 * TileMap System — Grid rendering, interactive tiles, energy switches & crystals
 */

import { CONFIG } from '../config.js';
import { assets } from '../core/assetManager.js';

const T = CONFIG.TILE_TYPES;

export class TileMap {
  constructor(levelData) {
    this.init(levelData);
  }

  init(levelData) {
    this.gridWidth = levelData.gridWidth;
    this.gridHeight = levelData.gridHeight;
    // Deep copy layout
    this.layout = levelData.layout.map(row => [...row]);
    
    // Copy crystals with collected state
    this.crystals = (levelData.crystals || []).map(c => ({
      ...c,
      collected: false
    }));
    
    // Copy switches
    this.switches = (levelData.switches || []).map(s => ({
      ...s,
      activated: false
    }));
    
    this.startPos = levelData.startPos ? { ...levelData.startPos } : { x: 1, y: 1 };
    this.finishPos = { ...levelData.finishPos };
    this.animTime = 0;
    this.hoveredTile = null;
    this.boardCacheCanvas = null;
    this.boardCacheDirty = true;
    this.cachedTileSize = 0;
  }

  update(dt) {
    this.animTime += dt;
  }

  isWaterCell(x, y) {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return false;
    const tile = this.layout[y][x];
    return tile === T.WATER || tile === T.BRIDGE_OFF || tile === T.BRIDGE_ON;
  }

  isWalkable(x, y) {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
      return false; // Out of bounds
    }
    const tile = this.layout[y][x];
    if (tile === T.PATH || tile === T.SWITCH || tile === T.FINISH || tile === T.BRIDGE_ON) {
      return true;
    }
    // Grass is walkable if on path, but here grass is obstacle edge (barrier)
    return false;
  }

  isWaterOrHazard(x, y) {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return true;
    const tile = this.layout[y][x];
    return tile === T.WATER || tile === T.HAZARD || tile === T.BRIDGE_OFF;
  }

  checkCollectibles(x, y) {
    for (let c of this.crystals) {
      if (!c.collected && c.x === x && c.y === y) {
        c.collected = true;
        return c;
      }
    }
    return null;
  }

  checkTriggers(x, y) {
    let triggered = false;
    for (let s of this.switches) {
      if (s.x === x && s.y === y && !s.activated) {
        s.activated = true;
        // Turn on linked bridge(s) - supports single or multiple bridge tiles
        if (Array.isArray(s.bridges)) {
          for (let b of s.bridges) {
            if (b.y !== undefined && b.x !== undefined && this.layout[b.y]) {
              this.layout[b.y][b.x] = T.BRIDGE_ON;
              triggered = true;
            }
          }
        } else if (s.bridgeY !== undefined && s.bridgeX !== undefined) {
          if (this.layout[s.bridgeY]) {
            this.layout[s.bridgeY][s.bridgeX] = T.BRIDGE_ON;
            triggered = true;
          }
        }
      }
    }
    if (triggered) {
      this.boardCacheDirty = true;
    }
    return triggered;
  }

  isFinish(x, y) {
    return x === this.finishPos.x && y === this.finishPos.y;
  }

  allCrystalsCollected() {
    return this.crystals.every(c => c.collected);
  }

  getCrystalsCollectedCount() {
    return this.crystals.filter(c => c.collected).length;
  }

  hasCrystalAt(x, y) {
    return this.crystals.some(c => !c.collected && c.x === x && c.y === y);
  }

  render(ctx, offsetX, offsetY, tileSize, robot = null) {
    // 1. Pre-render static board environment to offscreen cache if dirty or size changed
    if (!this.boardCacheCanvas || this.cachedTileSize !== tileSize || this.boardCacheDirty) {
      this.renderBoardCache(tileSize);
    }

    // 2. Blit static board from offscreen cache in 1 single high-speed drawImage call
    const margin = 16;
    if (this.boardCacheCanvas) {
      ctx.drawImage(this.boardCacheCanvas, offsetX - margin, offsetY - margin);
    }

    // 3. Dynamic Interactive Elements rendered per frame
    // 3A. Direction Pointer: Bold Red Arrow (⬆) in front of robot
    if (robot) {
      this.drawDirectionPointer(ctx, robot, offsetX, offsetY, tileSize);
    }

    // 3B. Collectible Energy Crystals on Pathway (animated floating bob & spin)
    this.drawCrystals(ctx, offsetX, offsetY, tileSize);

    // 3C. Interactive Tile Hover Highlight & Spatial Coordinate Badge
    if (this.hoveredTile && this.isWithinBounds(this.hoveredTile.x, this.hoveredTile.y)) {
      this.drawHoveredTileHighlight(ctx, offsetX, offsetY, tileSize, robot);
    }
  }

  renderBoardCache(tileSize) {
    const totalW = this.gridWidth * tileSize;
    const totalH = this.gridHeight * tileSize;
    const margin = 16;
    const canvasW = totalW + margin * 2;
    const canvasH = totalH + margin * 2;

    if (!this.boardCacheCanvas) {
      this.boardCacheCanvas = document.createElement('canvas');
    }
    this.boardCacheCanvas.width = canvasW;
    this.boardCacheCanvas.height = canvasH;
    const cCtx = this.boardCacheCanvas.getContext('2d');
    cCtx.clearRect(0, 0, canvasW, canvasH);

    const bX = margin;
    const bY = margin;

    // 1. Board Outer Shadow
    cCtx.save();
    cCtx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    cCtx.beginPath();
    cCtx.roundRect(bX - 6, bY + 6, totalW + 12, totalH + 16, 20);
    cCtx.fill();

    // 2. Board Wooden/Cream Trim Frame
    cCtx.fillStyle = '#F8FAFC';
    cCtx.beginPath();
    cCtx.roundRect(bX - 6, bY - 6, totalW + 12, totalH + 12, 18);
    cCtx.fill();
    cCtx.lineWidth = 3.5;
    cCtx.strokeStyle = '#0F172A';
    cCtx.stroke();

    // 3. Clip Board Canvas for seamless inner meadow
    cCtx.beginPath();
    cCtx.roundRect(bX, bY, totalW, totalH, 12);
    cCtx.clip();

    // 3A. Base Seamless Green Meadow with Texture
    this.drawMeadowBase(cCtx, bX, bY, totalW, totalH, tileSize);

    // 3C. Scattered Cute Meadow Daisies & Flowers
    this.drawMeadowDaisies(cCtx, bX, bY, tileSize);

    // 3D. Water Streams / Canals (if level contains water)
    this.drawWaterStreams(cCtx, bX, bY, tileSize);

    // 3E. Connected Contiguous Stone Pathway (Seamless slabs with NO gaps!)
    this.drawConnectedStonePath(cCtx, bX, bY, tileSize);

    // 3F. Environment Props (Puffy cartoon trees & wooden fences on grass)
    this.drawEnvironmentProps(cCtx, bX, bY, tileSize);

    // 3G. Target / Finish: Ancient Tech Portal Pad
    const finishPxX = bX + this.finishPos.x * tileSize + tileSize / 2;
    const finishPxY = bY + this.finishPos.y * tileSize + tileSize / 2;
    this.drawFinishPortal(cCtx, finishPxX, finishPxY, tileSize);

    cCtx.restore(); // Restore Board Clip

    this.cachedTileSize = tileSize;
    this.boardCacheDirty = false;
  }

  drawMeadowBase(ctx, offsetX, offsetY, totalW, totalH, tileSize) {
    const grassImg = assets.getImage('tileGrass');
    if (grassImg) {
      if (!this.grassPattern || this.grassPatternSource !== grassImg) {
        this.grassPattern = ctx.createPattern(grassImg, 'repeat');
        this.grassPatternSource = grassImg;
      }
      ctx.save();
      ctx.fillStyle = this.grassPattern;
      ctx.fillRect(offsetX, offsetY, totalW, totalH);

      // Grid tipis yang rapi untuk membaca langkah koding
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          ctx.strokeRect(offsetX + x * tileSize, offsetY + y * tileSize, tileSize, tileSize);
        }
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#52B747';
      ctx.fillRect(offsetX, offsetY, totalW, totalH);
    }
  }

  drawMeadowDaisies(ctx, offsetX, offsetY, tileSize) {
    ctx.save();
    // Deterministic flower positions
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const tile = this.layout[y][x];
        if (tile === T.GRASS && (x * 3 + y * 7) % 5 === 0) {
          const fx = offsetX + x * tileSize + tileSize * 0.35;
          const fy = offsetY + y * tileSize + tileSize * 0.65;
          
          // White flower petals
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(fx - 2, fy, 2.5, 0, Math.PI * 2);
          ctx.arc(fx + 2, fy, 2.5, 0, Math.PI * 2);
          ctx.arc(fx, fy - 2, 2.5, 0, Math.PI * 2);
          ctx.arc(fx, fy + 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Yellow center
          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  getWaterPattern(ctx, tileSize) {
    const waterImg = assets.getImage('tileWater');
    if (!waterImg) return null;
    if (this.cachedWaterPattern && this.cachedWaterTileSize === tileSize) {
      return this.cachedWaterPattern;
    }
    const patSize = Math.max(64, Math.round(tileSize * 2));
    const offCanvas = document.createElement('canvas');
    offCanvas.width = patSize;
    offCanvas.height = patSize;
    const offCtx = offCanvas.getContext('2d');
    offCtx.drawImage(waterImg, 0, 0, patSize, patSize);
    this.cachedWaterPattern = ctx.createPattern(offCanvas, 'repeat');
    this.cachedWaterTileSize = tileSize;
    return this.cachedWaterPattern;
  }

  drawWaterStreams(ctx, offsetX, offsetY, tileSize) {
    ctx.save();
    ctx.translate(offsetX, offsetY);

    // 1. Shoreline Sandy Edge (ONLY on exterior edges touching land)
    const sandMargin = 4.5;
    ctx.fillStyle = '#F59E0B';
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (!this.isWaterCell(x, y)) continue;

        const up = this.isWaterCell(x, y - 1);
        const down = this.isWaterCell(x, y + 1);
        const left = this.isWaterCell(x - 1, y);
        const right = this.isWaterCell(x + 1, y);

        const px = x * tileSize;
        const py = y * tileSize;

        const sx = px - (left ? 0 : sandMargin);
        const sy = py - (up ? 0 : sandMargin);
        const sw = tileSize + (left ? 0 : sandMargin) + (right ? 0 : sandMargin);
        const sh = tileSize + (up ? 0 : sandMargin) + (down ? 0 : sandMargin);

        const rTL = (!left && !up) ? 7 : 0;
        const rTR = (!right && !up) ? 7 : 0;
        const rBR = (!right && !down) ? 7 : 0;
        const rBL = (!left && !down) ? 7 : 0;

        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, [rTL, rTR, rBR, rBL]);
        ctx.fill();
      }
    }

    // 2. Seamless Contiguous River Water Body Fill
    const waterPat = this.getWaterPattern(ctx, tileSize);
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (!this.isWaterCell(x, y)) continue;

        const up = this.isWaterCell(x, y - 1);
        const down = this.isWaterCell(x, y + 1);
        const left = this.isWaterCell(x - 1, y);
        const right = this.isWaterCell(x + 1, y);

        const px = x * tileSize;
        const py = y * tileSize;

        const rTL = (!left && !up) ? 6 : 0;
        const rTR = (!right && !up) ? 6 : 0;
        const rBR = (!right && !down) ? 6 : 0;
        const rBL = (!left && !down) ? 6 : 0;

        ctx.beginPath();
        ctx.roundRect(px, py, tileSize, tileSize, [rTL, rTR, rBR, rBL]);

        if (waterPat) {
          ctx.fillStyle = waterPat;
          ctx.fill();
          // Transparent aqua tint overlay to unify water tone
          ctx.fillStyle = 'rgba(2, 132, 199, 0.16)';
          ctx.fill();
        } else {
          const waterGrad = ctx.createLinearGradient(px, py, px, py + tileSize);
          waterGrad.addColorStop(0, '#0284C7');
          waterGrad.addColorStop(0.5, '#0EA5E9');
          waterGrad.addColorStop(1, '#0284C7');
          ctx.fillStyle = waterGrad;
          ctx.fill();
        }
      }
    }

    // 3. Clean Dark Outline ONLY on boundaries touching land (NO divider lines between water cells)
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (!this.isWaterCell(x, y)) continue;

        const up = this.isWaterCell(x, y - 1);
        const down = this.isWaterCell(x, y + 1);
        const left = this.isWaterCell(x - 1, y);
        const right = this.isWaterCell(x + 1, y);

        const px = x * tileSize;
        const py = y * tileSize;

        if (!up) {
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + tileSize, py); ctx.stroke();
        }
        if (!down) {
          ctx.beginPath(); ctx.moveTo(px, py + tileSize); ctx.lineTo(px + tileSize, py + tileSize); ctx.stroke();
        }
        if (!left) {
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + tileSize); ctx.stroke();
        }
        if (!right) {
          ctx.beginPath(); ctx.moveTo(px + tileSize, py); ctx.lineTo(px + tileSize, py + tileSize); ctx.stroke();
        }

        // 4. Flowing River Currents & Animated Wavelets
        const waveX = Math.sin(this.animTime * 2.6 + x * 0.9 + y * 1.3) * 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(px + tileSize * 0.45 + waveX, py + tileSize * 0.4, 6, 0.3, Math.PI - 0.3);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px + tileSize * 0.65 - waveX, py + tileSize * 0.65, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 5. Special Bridges (BRIDGE_OFF / BRIDGE_ON)
        const tile = this.layout[y][x];
        if (tile === T.BRIDGE_OFF) {
          this.drawBridgeOff(ctx, px, py, tileSize);
        } else if (tile === T.BRIDGE_ON) {
          this.drawBridgeOn(ctx, px, py, tileSize);
        }
      }
    }

    ctx.restore();
  }

  drawBridgeOff(ctx, px, py, tileSize) {
    ctx.save();
    // Submerged wooden posts with red hazard warning
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 2;

    const pad = tileSize * 0.22;
    for (let cx of [px + pad, px + tileSize - pad]) {
      for (let cy of [py + pad, py + tileSize - pad]) {
        ctx.beginPath();
        ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Hazard indicator cross
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px + tileSize * 0.35, py + tileSize * 0.5);
    ctx.lineTo(px + tileSize * 0.65, py + tileSize * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  drawBridgeOn(ctx, px, py, tileSize) {
    ctx.save();
    // Sturdy wooden plank walkway
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2;

    // Planks spanning across
    for (let i = 0.15; i <= 0.85; i += 0.22) {
      ctx.fillStyle = (i > 0.35 && i < 0.65) ? '#D97706' : '#B45309';
      ctx.beginPath();
      ctx.roundRect(px + 4, py + tileSize * i - 5, tileSize - 8, 10, 2);
      ctx.fill();
      ctx.stroke();
    }

    // Guide ropes
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px + 5, py); ctx.lineTo(px + 5, py + tileSize);
    ctx.moveTo(px + tileSize - 5, py); ctx.lineTo(px + tileSize - 5, py + tileSize);
    ctx.stroke();

    ctx.restore();
  }

  getStonePattern(ctx, tileSize) {
    const pathImg = assets.getImage('tilePath');
    if (!pathImg) return null;
    if (this.cachedStonePattern && this.cachedStoneTileSize === tileSize) {
      return this.cachedStonePattern;
    }
    const patSize = Math.max(64, Math.round(tileSize * 2));
    const offCanvas = document.createElement('canvas');
    offCanvas.width = patSize;
    offCanvas.height = patSize;
    const offCtx = offCanvas.getContext('2d');
    offCtx.drawImage(pathImg, 0, 0, patSize, patSize);
    this.cachedStonePattern = ctx.createPattern(offCanvas, 'repeat');
    this.cachedStoneTileSize = tileSize;
    return this.cachedStonePattern;
  }

  drawConnectedStonePath(ctx, offsetX, offsetY, tileSize) {
    ctx.save();
    ctx.translate(offsetX, offsetY);

    const pad = 4;
    const stonePat = this.getStonePattern(ctx, tileSize);

    // Pass 1: Soft Drop Shadow on exterior edges
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (!this.isWalkable(x, y)) continue;

        const up = this.isWalkable(x, y - 1);
        const down = this.isWalkable(x, y + 1);
        const left = this.isWalkable(x - 1, y);
        const right = this.isWalkable(x + 1, y);

        const px = x * tileSize;
        const py = y * tileSize;

        const sx = px + (left ? 0 : pad);
        const sy = py + (up ? 0 : pad);
        const sw = tileSize - (left ? 0 : pad) - (right ? 0 : pad);
        const sh = tileSize - (up ? 0 : pad) - (down ? 0 : pad);

        const rTL = (!left && !up) ? 7 : 0;
        const rTR = (!right && !up) ? 7 : 0;
        const rBR = (!right && !down) ? 7 : 0;
        const rBL = (!left && !down) ? 7 : 0;

        ctx.beginPath();
        ctx.roundRect(sx + (right ? 0 : 2), sy + (down ? 0 : 3), sw, sh, [rTL, rTR, rBR, rBL]);
        ctx.fill();
      }
    }

    // Pass 2: Continuous Stone Pattern Fill
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (!this.isWalkable(x, y)) continue;

        const up = this.isWalkable(x, y - 1);
        const down = this.isWalkable(x, y + 1);
        const left = this.isWalkable(x - 1, y);
        const right = this.isWalkable(x + 1, y);

        const px = x * tileSize;
        const py = y * tileSize;

        const sx = px + (left ? 0 : pad);
        const sy = py + (up ? 0 : pad);
        const sw = tileSize - (left ? 0 : pad) - (right ? 0 : pad);
        const sh = tileSize - (up ? 0 : pad) - (down ? 0 : pad);

        const rTL = (!left && !up) ? 7 : 0;
        const rTR = (!right && !up) ? 7 : 0;
        const rBR = (!right && !down) ? 7 : 0;
        const rBL = (!left && !down) ? 7 : 0;

        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, [rTL, rTR, rBR, rBL]);

        if (stonePat) {
          ctx.fillStyle = stonePat;
          ctx.fill();
        } else {
          ctx.fillStyle = '#94A3B8';
          ctx.fill();
        }
      }
    }

    // Pass 2B: Modular Paving Seams & Grout Lines (Membuat tiap petak kotak langkah terlihat jelas!)
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (!this.isWalkable(x, y)) continue;

        const px = x * tileSize;
        const py = y * tileSize;

        // Seam vertikal di sebelah kanan jika petak kanan juga jalan
        if (x + 1 < this.gridWidth && this.isWalkable(x + 1, y)) {
          // Dark groove shadow
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(px + tileSize, py + 3);
          ctx.lineTo(px + tileSize, py + tileSize - 3);
          ctx.stroke();

          // Highlight bevel
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + tileSize + 1, py + 4);
          ctx.lineTo(px + tileSize + 1, py + tileSize - 4);
          ctx.stroke();
        }

        // Seam horizontal di sebelah bawah jika petak bawah juga jalan
        if (y + 1 < this.gridHeight && this.isWalkable(x, y + 1)) {
          // Dark groove shadow
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(px + 3, py + tileSize);
          ctx.lineTo(px + tileSize - 3, py + tileSize);
          ctx.stroke();

          // Highlight bevel
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + 4, py + tileSize + 1);
          ctx.lineTo(px + tileSize - 4, py + tileSize + 1);
          ctx.stroke();
        }

        // Pass 2C: Subtle Tech Step Node di tengah petak jalan biasa untuk mempermudah menghitung langkah
        const tileType = this.layout[y][x];
        if (tileType === T.PATH) {
          const cx = px + tileSize / 2;
          const cy = py + tileSize / 2;
          const nodeRadius = tileSize * 0.12;

          // Bayangan cincin
          ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
          ctx.beginPath();
          ctx.arc(cx, cy + 1, nodeRadius + 2, 0, Math.PI * 2);
          ctx.fill();

          // Cincin pendaran cyan lembut
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.38)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, nodeRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Titik simpul tengah
          ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.beginPath();
          ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Pass 3: Exterior Bevels & Outlines ONLY on disconnected edges (NO seams between connected stones)
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (!this.isWalkable(x, y)) continue;

        const up = this.isWalkable(x, y - 1);
        const down = this.isWalkable(x, y + 1);
        const left = this.isWalkable(x - 1, y);
        const right = this.isWalkable(x + 1, y);

        const upWater = this.isWaterCell(x, y - 1);
        const downWater = this.isWaterCell(x, y + 1);
        const leftWater = this.isWaterCell(x - 1, y);
        const rightWater = this.isWaterCell(x + 1, y);

        const px = x * tileSize;
        const py = y * tileSize;

        const sx = px + (left ? 0 : pad);
        const sy = py + (up ? 0 : pad);
        const sw = tileSize - (left ? 0 : pad) - (right ? 0 : pad);
        const sh = tileSize - (up ? 0 : pad) - (down ? 0 : pad);

        // Highlight Bevel on top & left
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        if (!up) {
          ctx.beginPath(); ctx.moveTo(sx + 2, sy + 1.5); ctx.lineTo(sx + sw - 2, sy + 1.5); ctx.stroke();
        }
        if (!left) {
          ctx.beginPath(); ctx.moveTo(sx + 1.5, sy + 2); ctx.lineTo(sx + 1.5, sy + sh - 2); ctx.stroke();
        }

        // Shadow Bevel on bottom & right
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.8;
        if (!down) {
          ctx.beginPath(); ctx.moveTo(sx + 2, sy + sh - 1.5); ctx.lineTo(sx + sw - 2, sy + sh - 1.5); ctx.stroke();
        }
        if (!right) {
          ctx.beginPath(); ctx.moveTo(sx + sw - 1.5, sy + 2); ctx.lineTo(sx + sw - 1.5, sy + sh - 2); ctx.stroke();
        }

        // Clean Dark Outline ONLY on exterior edges
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        if (!up) {
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sw, sy); ctx.stroke();
        }
        if (!down) {
          ctx.beginPath(); ctx.moveTo(sx, sy + sh); ctx.lineTo(sx + sw, sy + sh); ctx.stroke();
        }
        if (!left) {
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + sh); ctx.stroke();
        }
        if (!right) {
          ctx.beginPath(); ctx.moveTo(sx + sw, sy); ctx.lineTo(sx + sw, sy + sh); ctx.stroke();
        }

        // Stone Curb Rim where path borders water (Clear visual boundary for jumps!)
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#0F172A';
        if (upWater) {
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sw, sy); ctx.stroke();
        }
        if (downWater) {
          ctx.beginPath(); ctx.moveTo(sx, sy + sh); ctx.lineTo(sx + sw, sy + sh); ctx.stroke();
        }
        if (leftWater) {
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + sh); ctx.stroke();
        }
        if (rightWater) {
          ctx.beginPath(); ctx.moveTo(sx + sw, sy); ctx.lineTo(sx + sw, sy + sh); ctx.stroke();
        }

        // Interactive Switch Plate overlay if tile is switch
        const tile = this.layout[y][x];
        if (tile === T.SWITCH) {
          const swObj = this.switches.find(s => s.x === x && s.y === y);
          this.drawSwitch(ctx, px, py, tileSize, swObj);
        }
      }
    }

    ctx.restore();
  }

  drawSwitch(ctx, px, py, tileSize, sw) {
    const isActive = sw && sw.activated;
    const switchImg = assets.getImage('tileSwitch');
    const cx = px + tileSize / 2;
    const cy = py + tileSize / 2;
    const size = tileSize * 0.88;

    ctx.save();

    // Soft Circular Ground Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.08, size * 0.44, size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    if (switchImg) {
      ctx.drawImage(switchImg, cx - size / 2, cy - size / 2, size, size);

      // Energy Ring Accent
      const glowColor = isActive ? '#10B981' : '#F59E0B';
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = isActive ? 3.5 : 2.5;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isActive ? 16 : 8;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
      ctx.stroke();

      // Center battery glow pulse
      const coreRadius = size * (isActive ? 0.22 : 0.18) + Math.sin(this.animTime * (isActive ? 6 : 3)) * 2;
      ctx.fillStyle = isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Recessed base fallback
      ctx.beginPath();
      ctx.arc(cx, cy, tileSize * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#064E3B' : '#78350F';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0F172A';
      ctx.stroke();

      // Button core fallback
      ctx.beginPath();
      ctx.arc(cx, cy, tileSize * 0.24, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#10B981' : '#F59E0B';
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  drawEnvironmentProps(ctx, offsetX, offsetY, tileSize) {
    ctx.save();

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const tile = this.layout[y][x];
        if (tile !== T.GRASS) continue;

        const px = offsetX + x * tileSize;
        const py = offsetY + y * tileSize;

        // Adaptive Wooden Fence: top boundary on grass that does not block path below
        const pathBelow = (y + 1 < this.gridHeight) && this.isWalkable(x, y + 1);
        if (y === 0 && !pathBelow && (x <= 2 || x >= this.gridWidth - 2)) {
          this.drawWoodenFence(ctx, px, py, tileSize);
          continue;
        }

        // Adaptive Puffy Cartoon Trees: placed on GRASS away from start and finish
        const distToStart = Math.hypot(x - (this.startPos?.x ?? 1), y - (this.startPos?.y ?? 1));
        const distToFinish = Math.hypot(x - this.finishPos.x, y - this.finishPos.y);

        if (distToStart > 1.3 && distToFinish > 1.2) {
          // Check perimeter or corners
          const isPerimeter = (x === 0 || x === this.gridWidth - 1 || y === 0 || y === this.gridHeight - 1);
          const hasWaterNear = this.isWaterCell(x + 1, y) || this.isWaterCell(x - 1, y) || this.isWaterCell(x, y + 1) || this.isWaterCell(x, y - 1);

          if (isPerimeter && !hasWaterNear && (x * 7 + y * 13) % 2 === 0) {
            this.drawCartoonTree(ctx, px + tileSize / 2, py + tileSize / 2, tileSize * 0.88);
          } else if ((x === 0 && y === 1) || (x === 0 && y === this.gridHeight - 2)) {
            this.drawCartoonTree(ctx, px + tileSize / 2, py + tileSize / 2, tileSize * 0.88);
          }
        }
      }
    }

    ctx.restore();
  }

  drawWoodenFence(ctx, px, py, tileSize) {
    ctx.save();
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2;

    // Horizontal rails
    ctx.beginPath();
    ctx.roundRect(px, py + tileSize * 0.35, tileSize, 5, 2);
    ctx.roundRect(px, py + tileSize * 0.6, tileSize, 5, 2);
    ctx.fill();
    ctx.stroke();

    // Vertical posts
    for (let i = 0.2; i <= 0.8; i += 0.4) {
      ctx.beginPath();
      ctx.roundRect(px + tileSize * i - 3, py + tileSize * 0.2, 7, tileSize * 0.6, 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCartoonTree(ctx, cx, cy, size) {
    ctx.save();

    // 1. Oval ground shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.32, size * 0.38, size * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Brown wooden trunk
    ctx.fillStyle = '#854D0E';
    ctx.beginPath();
    ctx.roundRect(cx - size * 0.1, cy + size * 0.05, size * 0.2, size * 0.32, 4);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#451A03';
    ctx.stroke();

    // 3. Puffy cartoon foliage (3 overlapping lush green circles)
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(cx - size * 0.16, cy - size * 0.05, size * 0.24, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.16, cy - size * 0.05, size * 0.24, 0, Math.PI * 2);
    ctx.arc(cx, cy - size * 0.18, size * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#14532D';
    ctx.stroke();

    // Mid vibrant green foliage
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(cx - size * 0.14, cy - size * 0.08, size * 0.2, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.14, cy - size * 0.08, size * 0.2, 0, Math.PI * 2);
    ctx.arc(cx, cy - size * 0.2, size * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Sunlit bright highlight puffs
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.arc(cx - size * 0.1, cy - size * 0.22, size * 0.09, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.08, cy - size * 0.24, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawFinishPortal(ctx, cx, cy, tileSize) {
    const portalImg = assets.getImage('tileFinish');
    const size = tileSize * 0.92;
    const bounce = Math.sin(this.animTime * 2.8) * 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Ground Target Landing Shadow (Smooth ellipse directly beneath circular disc)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.16, size * 0.44, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    if (portalImg) {
      // Draw circular portal platform
      ctx.drawImage(portalImg, -size / 2, -size / 2 + bounce, size, size);

      // Rotating holographic energy rings
      ctx.save();
      ctx.translate(0, bounce);
      ctx.rotate(this.animTime * 0.8);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-this.animTime * 1.6);
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Floating golden sparkles
      for (let i = 0; i < 4; i++) {
        const angle = this.animTime * 2 + (i * Math.PI / 2);
        const dist = size * 0.28;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist * 0.5 + bounce - 5;
        ctx.fillStyle = '#FEF08A';
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      this.drawGiftBox(ctx, 0, 0, tileSize);
    }

    ctx.restore();
  }

  drawGiftBox(ctx, cx, cy, tileSize) {
    const size = tileSize * 0.62;
    const bounce = Math.sin(this.animTime * 3) * 3;
    ctx.save();

    // Ground Target Landing Platform
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.ellipse(cx, cy + tileSize * 0.22, size * 0.58, size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    // Target Golden Inner Ring
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + tileSize * 0.22, size * 0.44, size * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.translate(cx, cy + bounce);

    // Box Drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.44 - bounce * 0.5, size * 0.44, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3D Red gift box body (From Reference Image!)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(-size * 0.38, -size * 0.24, size * 0.76, size * 0.68, 6);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#991B1B';
    ctx.stroke();

    // Lid top
    ctx.fillStyle = '#F87171';
    ctx.beginPath();
    ctx.roundRect(-size * 0.42, -size * 0.42, size * 0.84, size * 0.22, 5);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#991B1B';
    ctx.stroke();

    // Golden ribbon vertical
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.rect(-size * 0.1, -size * 0.42, size * 0.2, size * 0.86);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#CA8A04';
    ctx.stroke();

    // Golden ribbon horizontal
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.rect(-size * 0.38, -size * 0.02, size * 0.76, size * 0.18);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#CA8A04';
    ctx.stroke();

    // Fluffy ribbon bow on top
    ctx.fillStyle = '#FDE047';
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 2;
    // Left loop
    ctx.beginPath();
    ctx.ellipse(-size * 0.15, -size * 0.52, size * 0.15, size * 0.09, -0.4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Right loop
    ctx.beginPath();
    ctx.ellipse(size * 0.15, -size * 0.52, size * 0.15, size * 0.09, 0.4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Center knot
    ctx.beginPath();
    ctx.arc(0, -size * 0.46, size * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = '#FACC15';
    ctx.fill(); ctx.stroke();

    // Golden sparkle stars above gift box
    const spark = Math.sin(this.animTime * 5) > 0;
    if (spark) {
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(size * 0.32, -size * 0.65, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawDirectionPointer(ctx, robot, offsetX, offsetY, tileSize) {
    if (!robot || robot.isMoving) return;
    const dirVec = CONFIG.DIR_VECTORS[robot.direction];
    const nextX = robot.gridX + dirVec.dx;
    const nextY = robot.gridY + dirVec.dy;

    if (nextX < 0 || nextX >= this.gridWidth || nextY < 0 || nextY >= this.gridHeight) return;

    const px = offsetX + nextX * tileSize + tileSize / 2;
    const py = offsetY + nextY * tileSize + tileSize / 2;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(robot.dirToAngle(robot.direction));

    // Pulse animation
    const pulse = 1 + Math.sin(this.animTime * 6) * 0.08;
    ctx.scale(pulse, pulse);

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // Bold Red Arrow pointing forward (angle 0 is RIGHT)
    ctx.beginPath();
    ctx.moveTo(15, 0);       // tip
    ctx.lineTo(3, -13);      // top barb
    ctx.lineTo(3, -5.5);     // top stem inner
    ctx.lineTo(-15, -5.5);   // tail top
    ctx.lineTo(-15, 5.5);    // tail bottom
    ctx.lineTo(3, 5.5);      // bottom stem inner
    ctx.lineTo(3, 13);       // bottom barb
    ctx.closePath();

    // Thick white border (Matches reference image arrow!)
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Vibrant Red Fill
    ctx.fillStyle = '#EF4444';
    ctx.fill();

    ctx.restore();
  }

  drawCrystals(ctx, offsetX, offsetY, tileSize) {
    for (let c of this.crystals) {
      if (!c.collected) {
        const cx = offsetX + c.x * tileSize + tileSize / 2;
        const cy = offsetY + c.y * tileSize + tileSize / 2;
        this.drawCrystal(ctx, cx, cy, tileSize);
      }
    }
  }

  drawCrystal(ctx, cx, cy, tileSize) {
    const crystalImg = assets.getImage('propCrystal');
    ctx.save();
    // Floating bounce and pulse
    const bounce = Math.sin(this.animTime * 4 + cx) * 5;
    const pulse = 1 + Math.sin(this.animTime * 3 + cy) * 0.05;

    // 1. Soft oval ground shadow on floor
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + tileSize * 0.32, tileSize * 0.22, tileSize * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Floating Crystal
    ctx.translate(cx, cy + bounce);
    ctx.scale(pulse, pulse);

    if (crystalImg) {
      const size = tileSize * 0.72;
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 14;
      ctx.drawImage(crystalImg, -size / 2, -size / 2, size, size);

      // Sparkle glint
      if (Math.sin(this.animTime * 5 + cx) > 0.4) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(size * 0.18, -size * 0.22, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    const r = tileSize * 0.32;

    // Glowing warm aura
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 12;

    // Outer Silhouette Outline
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.65, -r * 0.2);
    ctx.lineTo(-r * 0.65, r * 0.2);
    ctx.lineTo(0, r);
    ctx.lineTo(r * 0.65, r * 0.2);
    ctx.lineTo(r * 0.65, -r * 0.2);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Facet 1: Top-Left (Bright sunlit gold)
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.65, -r * 0.2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#B45309';
    ctx.stroke();

    // Facet 2: Top-Right (Warm vibrant amber)
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.65, -r * 0.2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Facet 3: Mid-Left (Rich amber)
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-r * 0.65, -r * 0.2);
    ctx.lineTo(-r * 0.65, r * 0.2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Facet 4: Mid-Right (Deep gold)
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.moveTo(r * 0.65, -r * 0.2);
    ctx.lineTo(r * 0.65, r * 0.2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Facet 5: Bottom-Left (Warm orange depth)
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(-r * 0.65, r * 0.2);
    ctx.lineTo(0, r);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Facet 6: Bottom-Right (Deep amber shadow)
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.moveTo(r * 0.65, r * 0.2);
    ctx.lineTo(0, r);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Specular Glint (White shiny reflection)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, -r * 0.7);
    ctx.lineTo(-r * 0.45, -r * 0.25);
    ctx.lineTo(-r * 0.2, -r * 0.15);
    ctx.lineTo(0, -r * 0.45);
    ctx.closePath();
    ctx.fill();

    // Orbiting Sparkle Star
    const sparkAngle = this.animTime * 3;
    const sx = Math.cos(sparkAngle) * (r * 1.15);
    const sy = Math.sin(sparkAngle) * (r * 0.65);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  isWithinBounds(x, y) {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }

  drawHoveredTileHighlight(ctx, offsetX, offsetY, tileSize, robot) {
    const gx = this.hoveredTile.x;
    const gy = this.hoveredTile.y;
    const px = offsetX + gx * tileSize;
    const py = offsetY + gy * tileSize;

    ctx.save();
    // Pulsing glowing border
    const pulse = 0.65 + Math.sin(this.animTime * 4.5) * 0.25;
    ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(px + 2, py + 2, tileSize - 4, tileSize - 4, 8);
    ctx.stroke();

    // Subtle inner fill
    ctx.fillStyle = `rgba(56, 189, 248, 0.08)`;
    ctx.fill();

    // Badge showing coordinate [Kolom, Baris]
    const badgeText = `[${gx + 1}, ${gy + 1}]`;
    ctx.font = 'bold 11px Fredoka, sans-serif';
    const textW = ctx.measureText(badgeText).width;
    const badgeW = textW + 10;
    const badgeH = 17;
    const bx = px + tileSize - badgeW - 3;
    const by = py + 3;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(bx, by, badgeW, badgeH, 4);
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, bx + badgeW / 2, by + badgeH / 2 + 1);

    ctx.restore();
  }
}
