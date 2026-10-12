// src/lib/engine/generateWalls.js

/**
 * Бинарная карта: 1 = пустота, 0 = занято
 */
export function computeBinary(objects) {
  const H = objects.length;
  const W = objects[0]?.length || 0;

  const bin = objects.map((row) =>
    row.map((v) => {
      if (v === 1) return 0; // block
      if (v === 0) return -1; // неизвестно
      if (v >= 2 && v <= 7) return 1; // шар
      if (v >= 22 && v <= 77) return 1; // лунка
      return 0;
    }),
  );

  const queue = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (bin[y][x] === 1) queue.push([x, y]);
    }
  }

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx,
        ny = y + dy;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      if (bin[ny][nx] !== -1) continue;
      bin[ny][nx] = 1;
      queue.push([nx, ny]);
    }
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (bin[y][x] === -1) bin[y][x] = 0;
    }
  }

  return bin;
}

/**
 * Таблица: (LT, RT, LD, RD) → тип стены
 */
export const WALL_TABLE = {
  "0000": "B",
  "0001": "LIT",
  "0010": "RIT",
  "0011": "T",
  "0100": "LID",
  "0101": "L",
  "0110": "RB",
  "0111": "LOT",
  1000: "RID",
  1001: "LB",
  1010: "R",
  1011: "ROT",
  1100: "D",
  1101: "LOD",
  1110: "ROD",
  1111: "N",
};

/**
 * Генерация walls из objects.
 *
 * @param {number[][]} objects - сетка объектов
 * @param {number} targetW - ширина walls (может быть больше objects)
 * @param {number} targetH - высота walls
 * @returns {string[][]} - сгенерированные walls
 */
export function generateWalls(objects, targetW, targetH) {
  const bin = computeBinary(objects);

  const walls = [];
  for (let y = 0; y < targetH; y++) {
    const row = [];
    for (let x = 0; x < targetW; x++) {
      const LT = bin[y - 1]?.[x - 1] ?? 0;
      const RT = bin[y - 1]?.[x] ?? 0;
      const LD = bin[y]?.[x - 1] ?? 0;
      const RD = bin[y]?.[x] ?? 0;
      const key = `${LT}${RT}${LD}${RD}`;
      row.push(WALL_TABLE[key] || "B");
    }
    walls.push(row);
  }

  return walls;
}

/**
 * Сравнение двух walls.
 * Возвращает матрицу: true = совпадает, false = расхождение.
 */
export function diffWalls(genWalls, refWalls) {
  const H = Math.max(genWalls.length, refWalls.length);
  const W = Math.max(genWalls[0]?.length || 0, refWalls[0]?.length || 0);

  const diff = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      const g = genWalls[y]?.[x] ?? "";
      const r = refWalls[y]?.[x] ?? "";
      row.push(g === r);
    }
    diff.push(row);
  }

  return diff;
}
