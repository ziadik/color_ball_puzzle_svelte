import { levels } from "./src/lib/data/levels.js";

function parseWalls(g) {
  return g.map((r) => r.split(" ").map((s) => s.trim()));
}
function parseObjects(g) {
  return g.map((r) => r.split(" ").map((s) => parseInt(s.trim(), 10)));
}

/**
 * Классификация + flood fill ТОЛЬКО от шаров.
 *
 * - 1 → 0 (block)
 * - 2-7 → 1 (шар, ИСТОЧНИК flood fill)
 * - 22-77 → 1 (лунка, пустота, НО НЕ источник)
 * - 0 → -1 (неизвестно)
 * - OOB → 0
 */
function computeBinary(objects) {
  const H = objects.length,
    W = objects[0].length;

  const bin = objects.map((row) =>
    row.map((v) => {
      if (v === 1) return 0; // block → занято
      if (v === 0) return -1; // неизвестно
      if (v >= 2 && v <= 7) return 1; // ШАР → пустота
      if (v >= 22 && v <= 77) return 1; // ЛУНКА → пустота (не 0!)
      return 0;
    }),
  );

  // Flood fill от шаров И лунок
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

const TABLE = {
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

function generateWalls(bin, W, H) {
  const walls = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      const LT = bin[y - 1]?.[x - 1] ?? 0;
      const RT = bin[y - 1]?.[x] ?? 0;
      const LD = bin[y]?.[x - 1] ?? 0;
      const RD = bin[y]?.[x] ?? 0;
      const key = `${LT}${RT}${LD}${RD}`;
      row.push(TABLE[key] || "B");
    }
    walls.push(row);
  }
  return walls;
}

// Прогон
let total = 0,
  exact = 0;
const contextStats = {};
const mismatches = [];

for (let li = 0; li < levels.length; li++) {
  const ref = parseWalls(levels[li].walls);
  const obj = parseObjects(levels[li].objects);
  const bin = computeBinary(obj);
  const H = ref.length,
    W = ref[0].length;

  const gen = generateWalls(bin, W, H);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const LT = bin[y - 1]?.[x - 1] ?? 0;
      const RT = bin[y - 1]?.[x] ?? 0;
      const LD = bin[y]?.[x - 1] ?? 0;
      const RD = bin[y]?.[x] ?? 0;
      const ctx = `${LT}${RT}${LD}${RD}`;

      if (!contextStats[ctx]) contextStats[ctx] = {};
      contextStats[ctx][ref[y][x]] = (contextStats[ctx][ref[y][x]] || 0) + 1;

      total++;
      if (gen[y][x] === ref[y][x]) exact++;
      else
        mismatches.push({
          level: li,
          x,
          y,
          ctx,
          gen: gen[y][x],
          ref: ref[y][x],
        });
    }
  }
}

console.log(
  `Точность: ${exact}/${total} = ${((100 * exact) / total).toFixed(2)}%`,
);
console.log(`\n=== СТАТИСТИКА ПО КОНТЕКСТАМ ===`);
for (const [ctx, types] of Object.entries(contextStats).sort()) {
  const dist = Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .map(([t, c]) => `${t}:${c}`)
    .join(", ");
  console.log(`  ${ctx} → ${dist}`);
}
console.log(`\n=== ПЕРВЫЕ 30 РАСХОЖДЕНИЙ ===`);
for (const m of mismatches.slice(0, 30)) {
  console.log(
    `  L${m.level} (${m.x},${m.y}): ctx=${m.ctx}, gen=${m.gen}, ref=${m.ref}`,
  );
}