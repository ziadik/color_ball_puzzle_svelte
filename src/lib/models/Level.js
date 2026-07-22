export class Level {
  constructor(width, height, field, walls) {
    this.width = width;
    this.height = height;
    this.field = field;
    this.walls = walls || [];
  }

  countBalls() {
    let count = 0;
    for (const row of this.field) {
      for (const item of row) {
        if (item && item.type === 'ball') count++;
      }
    }
    return count;
  }
}

export class Item {
  constructor(color, type) {
    this.color = color;
    this.type = type;
  }

  copy() {
    return new Item(this.color, this.type);
  }
}

export function createBall(color) {
  return new Item(color, 'ball');
}

export function createHole(color) {
  return new Item(color, 'hole');
}

export function createBlock() {
  return new Item(0, 'block');
}