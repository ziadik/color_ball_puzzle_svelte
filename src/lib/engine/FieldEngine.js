// src/lib/engine/FieldEngine.js
import { createDebugger } from "../utils/debug.js";

const log = createDebugger("FieldEngine");

export class FieldEngine {
  constructor(level) {
    log.info("🏗️ FieldEngine constructor called");
    this.level = level;
    this.field = level.field.map((row) =>
      row.map((item) => (item ? item.copy() : null)),
    );
    this.walls = level.walls || [];
    this.ballsCount = this.countBalls();
    this.history = [];
    this.movesCount = 0;
    this.lastMoveWasHitHole = false;

    log.info("  Field size:", this.field.length, "x", this.field[0]?.length);
    log.info("  Balls count:", this.ballsCount);
    log.info("  Walls (visual only):", this.walls.length);
  }

  countBalls() {
    let count = 0;
    for (const row of this.field) {
      for (const item of row) {
        if (item && item.type === "ball") count++;
      }
    }
    return count;
  }

  saveState() {
    const snapshot = this.field.map((row) =>
      row.map((item) => (item ? item.copy() : null)),
    );
    this.history.push(snapshot);
    log.verbose("  💾 State saved, history length:", this.history.length);
  }

  undo() {
    if (this.history.length === 0) {
      log.warn("  ⏪ Undo failed - no history");
      return false;
    }
    this.field = this.history.pop();
    this.ballsCount = this.countBalls();
    if (this.movesCount > 0) this.movesCount--;
    log.info("  ⏪ Undo successful, moves:", this.movesCount);
    return true;
  }

  get ballsRemaining() {
    return this.ballsCount;
  }
  isWin() {
    return this.ballsCount === 0;
  }

  isValidCoord(x, y) {
    return (
      y >= 0 && y < this.field.length && x >= 0 && x < this.field[0].length
    );
  }

  isWallAt(x, y) {
    if (!this.isValidCoord(x, y)) {
      log.verbose(`  🧱 isWallAt(${x},${y}) - out of bounds, returning true`);
      return true;
    }

    const cell = this.field[y][x];
    if (cell && cell.type === "block") {
      log.verbose(`  🧱 isWallAt(${x},${y}) - block found`);
      return true;
    }

    if (cell && cell.type === "ball") {
      log.verbose(`  🧱 isWallAt(${x},${y}) - ball found, blocking`);
      return true;
    }

    return false;
  }

  makeTurn(fromX, fromY, direction) {
    log.debug(
      `\n🎯 makeTurn called: from(${fromX},${fromY}) direction: ${direction}`,
    );
    log.debug(`  Field size: ${this.field.length}x${this.field[0]?.length}`);

    if (!this.isValidCoord(fromX, fromY)) {
      log.error(`  ❌ Invalid coordinates: (${fromX},${fromY})`);
      return false;
    }

    const ball = this.field[fromY][fromX];
    if (!ball || ball.type !== "ball") {
      log.error(`  ❌ No ball at (${fromX},${fromY}) - found:`, ball);
      return false;
    }

    log.debug(`  ✅ Ball found at (${fromX},${fromY}) color: ${ball.color}`);

    this.saveState();

    let currentX = fromX;
    let currentY = fromY;
    let hitHole = false;
    let moved = false;

    const dx = direction === "right" ? 1 : direction === "left" ? -1 : 0;
    const dy = direction === "down" ? 1 : direction === "up" ? -1 : 0;

    log.verbose(`  Direction vector: dx=${dx}, dy=${dy}`);
    log.verbose(`  Starting position: (${currentX},${currentY})`);

    let step = 0;
    while (true) {
      step++;
      const nextX = currentX + dx;
      const nextY = currentY + dy;

      log.verbose(`  Step ${step}: checking (${nextX},${nextY})`);

      if (!this.isValidCoord(nextX, nextY)) {
        log.verbose(`    ❌ Out of bounds - stopping`);
        break;
      }

      if (this.isWallAt(nextX, nextY)) {
        log.verbose(
          `    🧱 Block or ball detected at (${nextX},${nextY}) - stopping`,
        );
        break;
      }

      const nextCell = this.field[nextY][nextX];
      log.verbose(`    Cell at (${nextX},${nextY}):`, nextCell);

      if (nextCell === null) {
        currentX = nextX;
        currentY = nextY;
        moved = true;
        log.verbose(`    ➡️ Moving to empty cell (${currentX},${currentY})`);
      } else if (nextCell.type === "hole" && nextCell.color === ball.color) {
        hitHole = true;
        moved = true;
        log.debug(`    🎯 Found matching hole at (${nextX},${nextY})!`);
        break;
      } else if (nextCell.type === "hole" && nextCell.color !== ball.color) {
        log.verbose(
          `    ⛔ Wrong color hole at (${nextX},${nextY}) - stopping`,
        );
        break;
      } else {
        log.verbose(
          `    ⛔ Obstacle at (${nextX},${nextY}) type: ${nextCell.type} - stopping`,
        );
        break;
      }
    }

    log.debug(`  Final position: (${currentX},${currentY})`);
    log.debug(`  moved: ${moved}, hitHole: ${hitHole}`);

    if (!moved) {
      log.warn(`  ❌ No movement possible`);
      this.lastMoveWasHitHole = false;
      return false;
    }

    if (hitHole) {
      log.debug(`  🎯 Ball captured in hole!`);
      this.field[fromY][fromX] = null;
      this.ballsCount--;
      this.lastMoveWasHitHole = true;
      log.debug(`  Balls remaining: ${this.ballsCount}`);
    } else {
      log.debug(`  ➡️ Moving ball to (${currentX},${currentY})`);
      this.field[currentY][currentX] = this.field[fromY][fromX];
      this.field[fromY][fromX] = null;
      this.lastMoveWasHitHole = false;
    }

    this.movesCount++;
    log.debug(`  ✅ Move complete! Moves: ${this.movesCount}`);
    return true;
  }

  getHint() {
    log.info("💡 getHint called");
    for (let y = 0; y < this.field.length; y++) {
      for (let x = 0; x < this.field[0].length; x++) {
        const item = this.field[y][x];
        if (item && item.type === "ball") {
          for (const dir of ["up", "down", "left", "right"]) {
            if (this.canMoveToHole(x, y, dir)) {
              log.info(`  💡 Hint found: (${x},${y}) -> ${dir}`);
              return { x, y, direction: dir };
            }
          }
        }
      }
    }

    for (let y = 0; y < this.field.length; y++) {
      for (let x = 0; x < this.field[0].length; x++) {
        const item = this.field[y][x];
        if (item && item.type === "ball") {
          for (const dir of ["up", "down", "left", "right"]) {
            if (this.canMove(x, y, dir)) {
              log.info(`  💡 Fallback hint: (${x},${y}) -> ${dir}`);
              return { x, y, direction: dir };
            }
          }
        }
      }
    }

    log.warn(`  💡 No hint found`);
    return null;
  }

  canMove(x, y, direction) {
    const dx = direction === "right" ? 1 : direction === "left" ? -1 : 0;
    const dy = direction === "down" ? 1 : direction === "up" ? -1 : 0;
    const nx = x + dx;
    const ny = y + dy;

    if (!this.isValidCoord(nx, ny)) return false;
    if (this.isWallAt(nx, ny)) return false;

    const cell = this.field[ny][nx];
    const can =
      cell === null ||
      (cell.type === "hole" && cell.color === this.field[y][x]?.color);
    if (can) {
      log.verbose(`  🔍 canMove(${x},${y},${direction}) -> ${can}`);
    }
    return can;
  }

  canMoveToHole(x, y, direction) {
    const ball = this.field[y][x];
    if (!ball || ball.type !== "ball") return false;

    const dx = direction === "right" ? 1 : direction === "left" ? -1 : 0;
    const dy = direction === "down" ? 1 : direction === "up" ? -1 : 0;

    let currentX = x;
    let currentY = y;

    while (true) {
      const nx = currentX + dx;
      const ny = currentY + dy;

      if (!this.isValidCoord(nx, ny)) return false;
      if (this.isWallAt(nx, ny)) return false;

      const cell = this.field[ny][nx];

      if (cell && cell.type === "hole") {
        const can = cell.color === ball.color;
        if (can) {
          log.verbose(`  🔍 canMoveToHole(${x},${y},${direction}) -> true`);
        }
        return can;
      }

      if (cell !== null) return false;
      currentX = nx;
      currentY = ny;
    }
  }
}
