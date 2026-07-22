// src/lib/engine/LevelManager.js
import { levels, totalLevels } from "../data/levels.js";
import { Level, createBall, createHole, createBlock } from "../models/Level.js";

export class LevelManager {
  constructor() {
    this.levels = [];
    this.currentLevelIndex = 0;
    this.maxOpenedLevel = 0;
    this.loadAllLevels();
  }

  loadAllLevels() {
    for (const levelData of levels) {
      const level = this.parseLevel(levelData);
      if (level) {
        this.levels.push(level);
      }
    }
    console.log(`Loaded ${this.levels.length} levels`);
  }

  parseLevel(levelData) {
    const wallData = levelData.walls || [];
    const objectData = levelData.objects || [];

    // GRID SIZE IS DETERMINED BY WALLS
    const height = wallData.length;
    const width = wallData[0]?.split(" ").length || 0;

    if (height === 0 || width === 0) return null;

    // Parse walls - these define the grid
    const walls = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      const wallRow = wallData[y]?.split(" ") || [];
      for (let x = 0; x < width; x++) {
        const symbol = wallRow[x] || "N";
        row.push(symbol);
      }
      walls.push(row);
    }

    // Parse objects - these are placed on the grid
    // Objects grid may be smaller than walls grid
    const field = [];
    const symbolToItem = {
      // Balls (iOS values 2-7)
      2: () => createBall(1), // Green
      3: () => createBall(2), // Red
      4: () => createBall(3), // Blue
      5: () => createBall(4), // Yellow
      6: () => createBall(5), // Purple
      7: () => createBall(6), // Cyan
      // Holes (iOS values 22-77)
      22: () => createHole(1), // Green
      33: () => createHole(2), // Red
      44: () => createHole(3), // Blue
      55: () => createHole(4), // Yellow
      66: () => createHole(5), // Purple
      77: () => createHole(6), // Cyan
      // Block (iOS value 1) - these are walls for ball movement
      1: () => createBlock(),
      // Empty (iOS value 0)
      0: () => null,
    };

    // Initialize field with null values (empty cells)
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(null);
      }
      field.push(row);
    }

    // Place objects onto the field using the objects grid
    // Objects grid is positioned starting from (0,0)
    const objHeight = objectData.length;
    const objWidth = objectData[0]?.split(" ").length || 0;

    for (let y = 0; y < Math.min(objHeight, height); y++) {
      const objRow = objectData[y]?.split(" ") || [];
      for (let x = 0; x < Math.min(objWidth, width); x++) {
        const symbol = objRow[x] || "0";
        if (symbol in symbolToItem) {
          field[y][x] = symbolToItem[symbol]();
        } else {
          field[y][x] = null;
        }
      }
    }

    return new Level(width, height, field, walls);
  }

  getCurrentLevel() {
    if (this.currentLevelIndex >= this.levels.length) {
      this.currentLevelIndex = this.levels.length - 1;
    }
    if (this.currentLevelIndex < 0) this.currentLevelIndex = 0;
    return this.levels[this.currentLevelIndex];
  }

  get totalLevels() {
    return this.levels.length;
  }

  nextLevel() {
    if (this.currentLevelIndex < this.levels.length - 1) {
      this.currentLevelIndex++;
      return true;
    }
    return false;
  }

  previousLevel() {
    if (this.currentLevelIndex > 0) {
      this.currentLevelIndex--;
      return true;
    }
    return false;
  }

  goToLevel(index) {
    if (index >= 0 && index < this.levels.length) {
      this.currentLevelIndex = index;
      return true;
    }
    return false;
  }
}
