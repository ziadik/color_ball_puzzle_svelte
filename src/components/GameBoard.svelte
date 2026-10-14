<!-- src/components/GameBoard.svelte -->
<script>
  import { Colors } from "../lib/styles/colors.js";
  import WallSVG from "./WallSVG.svelte";
  import {
    fieldEngine,
    showHint,
    isDarkMode,
    makeMove,
    vibrationEnabled,
  } from "../lib/stores/gameStore.svelte.js";
  import { soundManager } from "../lib/utils/sound.js";
  import { getWallLayer } from "../lib/models/WallType.js";
  import { generateWalls } from "../lib/engine/generateWalls.js";
  import { FieldEngine } from "../lib/engine/FieldEngine.js";
  import {
    Level,
    createBall,
    createHole,
    createBlock,
  } from "../lib/models/Level.js";

  let {
    containerWidth = 0,
    containerHeight = 0,

    // Режим:
    //   'game'    — читает fieldEngine из store (по умолчанию)
    //   'preview' — показывает objectsGrid, walls из генератора, без ввода
    //   'play'    — играет objectsGrid локально (свой FieldEngine)
    mode = "game",

    // Для 'preview' и 'play' — источник данных
    objectsGrid: externalObjects = null,

    // Дополнительно
    editable = null,
    previewWalls: extWalls = null,
  } = $props();

  // ============================================================
  // ENGINE
  // ============================================================
  let localEngine = $state(null);
  let globalEngine = $state(null);

  const isPreview = $derived(mode === "preview");
  const isPlay = $derived(mode === "play");
  const isGame = $derived(mode === "game");
  const canInteract = $derived(isPlay || isGame);

  // Подписка на глобальный engine (только game)
  $effect(() => {
    if (!isGame) return;
    const unsub = fieldEngine.subscribe((e) => {
      globalEngine = e;
    });
    return unsub;
  });

  // Локальный engine (только play)
  $effect(() => {
    if (!isPlay) {
      localEngine = null;
      return;
    }
    if (!externalObjects?.length) return;
    if (localEngine) return;

    const H = externalObjects.length;
    const W = externalObjects[0]?.length || 0;
    const wallsArr = generateWalls(externalObjects, W + 1, H + 1);

    const field = [];
    for (let y = 0; y < H; y++) {
      const row = [];
      for (let x = 0; x < W; x++) {
        const v = externalObjects[y][x];
        if (v >= 2 && v <= 7) row.push(createBall(v - 1));
        else if (v >= 22 && v <= 77)
          row.push(createHole(Math.floor(v / 11) - 1));
        else if (v === 1) row.push(createBlock());
        else row.push(null);
      }
      field.push(row);
    }

    const lvl = new Level(W, H, field, wallsArr);
    localEngine = new FieldEngine(lvl);
  });

  const activeEngine = $derived(isPlay ? localEngine : globalEngine);

  // ============================================================
  // ЧИСЛОВЫЕ OBJECTS
  // ============================================================
  // Для preview/play — externalObjects.
  // Для game — конвертируем engine.level.field (исходный) в числа.
  const numericObjects = $derived.by(() => {
    // preview/play — внешние objects
    if (externalObjects?.length) return externalObjects;

    // game — исходный objectsGrid из level (8×8, как в levels.js)
    const eng = activeEngine;
    if (eng?.level?.objectsGrid) return eng.level.objectsGrid;

    return null;
  });

  // ============================================================
  // СГЕНЕРИРОВАННЫЕ WALLS
  // ============================================================
  const generatedWalls = $derived.by(() => {
    const objs = numericObjects;
    if (!objs?.length) return null;
    const W = (objs[0]?.length || 0) + 1;
    const H = objs.length + 1;
    try {
      return generateWalls(objs, W, H);
    } catch (e) {
      console.warn("generateWalls error:", e);
      return null;
    }
  });

  // ============================================================
  // АКТИВНЫЕ WALLS
  // Приоритет: явно переданные → сгенерированные
  // ============================================================
  const activeWalls = $derived.by(() => {
    if (extWalls?.length) return extWalls;
    if (generatedWalls?.length) return generatedWalls;
    return [];
  });

  // ============================================================
  // РАЗМЕРЫ
  // ============================================================
  let cellSize = $state(0);
  let fieldWidth = $state(0);
  let fieldHeight = $state(0);
  let cols = $state(0);
  let rows = $state(0);

  function updateDimensions() {
    const walls = activeWalls;
    if (!walls?.length) return;

    cols = walls[0]?.length || 1;
    rows = walls.length || 1;

    if (containerWidth === 0 || containerHeight === 0) return;

    const padding = 8;
    const availableW = containerWidth - padding;
    const availableH = containerHeight - padding;

    const cellW = availableW / cols;
    const cellH = availableH / rows;

    cellSize = Math.floor(Math.min(cellW, cellH));
    fieldWidth = cellSize * cols;
    fieldHeight = cellSize * rows;
  }

  // ============================================================
  // OBJECTS И WALLS — СПИСКИ ДЛЯ РЕНДЕРА
  // ============================================================
  let objects = $state([]);
  let allWalls = $state([]);

  function collectObjects() {
    // play → из engine
    if (isPlay && localEngine) {
      const result = [];
      for (let y = 0; y < localEngine.field.length; y++) {
        for (let x = 0; x < localEngine.field[0].length; x++) {
          const item = localEngine.field[y][x];
          if (item && (item.type === "ball" || item.type === "hole")) {
            result.push({ x, y, item });
          }
        }
      }
      return result;
    }

    // preview → из externalObjects
    if (isPreview && externalObjects?.length) {
      const result = [];
      for (let y = 0; y < externalObjects.length; y++) {
        for (let x = 0; x < externalObjects[y].length; x++) {
          const v = externalObjects[y][x];
          if (v === 0 || v === 1) continue;
          if (v >= 2 && v <= 7) {
            result.push({ x, y, item: { type: "ball", color: v - 1 } });
          } else if (v >= 22 && v <= 77) {
            result.push({
              x,
              y,
              item: { type: "hole", color: Math.floor(v / 11) - 1 },
            });
          }
        }
      }
      return result;
    }

    // game → из globalEngine
    if (isGame && globalEngine) {
      const result = [];
      for (let y = 0; y < globalEngine.field.length; y++) {
        for (let x = 0; x < globalEngine.field[0].length; x++) {
          const item = globalEngine.field[y][x];
          if (item && (item.type === "ball" || item.type === "hole")) {
            result.push({ x, y, item });
          }
        }
      }
      return result;
    }
    return [];
  }

  function collectWalls() {
    const walls = activeWalls;
    if (!walls?.length) return [];
    const result = [];
    for (let y = 0; y < walls.length; y++) {
      for (let x = 0; x < walls[y]?.length; x++) {
        const t = walls[y][x];
        if (t && t !== "N") result.push({ x, y, wallType: t });
      }
    }
    return result;
  }

  function refresh() {
    objects = collectObjects();
    allWalls = collectWalls();
  }

  // ============================================================
  // РЕАКТИВНОСТЬ
  // ============================================================
  $effect(() => {
    const _walls = activeWalls;
    const _objs = externalObjects;
    const _cw = containerWidth;
    const _ch = containerHeight;
    const _eng = activeEngine;

    if (_walls?.length > 0 && _cw > 0 && _ch > 0) {
      updateDimensions();
      refresh();
    }
  });

  // ============================================================
  // СМЕЩЕНИЕ OBJECTS
  // ============================================================
  const gridOffsetX = $derived(cellSize / 2);
  const gridOffsetY = $derived(cellSize / 1.5);

  // ============================================================
  // ВВОД
  // ============================================================
  let animating = $state(false);
  let touchStartX = 0,
    touchStartY = 0,
    isDragging = false;
  let mouseStartX = 0,
    mouseStartY = 0,
    isMouseDown = false;

  function handleTouchStart(e) {
    if (animating || !canInteract) return;
    const t = e.touches[0];
    if (!t) return;
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    isDragging = false;
  }

  function handleTouchMove(e) {
    if (animating || !canInteract) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) isDragging = true;
  }

  async function handleTouchEnd(e) {
    if (animating || !canInteract || !isDragging) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
    const dir =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    const cell = getCellFromPosition(touchStartX, touchStartY);
    if (cell) await doMove(cell.col, cell.row, dir);
  }

  function handleMouseDown(e) {
    if (animating || !canInteract || e.button !== 0) return;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    isMouseDown = true;
  }

  function handleMouseMove(e) {
    if (!isMouseDown || animating || !canInteract) return;
    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) isDragging = true;
  }

  async function handleMouseUp(e) {
    if (animating || !canInteract || !isMouseDown) return;
    isMouseDown = false;
    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
      isDragging = false;
      return;
    }
    const dir =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    const cell = getCellFromPosition(mouseStartX, mouseStartY);
    if (cell) await doMove(cell.col, cell.row, dir);
    isDragging = false;
  }

  function handleMouseLeave() {
    isMouseDown = false;
    isDragging = false;
  }

  function getCellFromPosition(clientX, clientY) {
    const boardEl = document.querySelector(".board");
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    const relX = clientX - rect.left - gridOffsetX;
    const relY = clientY - rect.top - gridOffsetY;
    const col = Math.floor(relX / cellSize);
    const row = Math.floor(relY / cellSize);
    return { col, row };
  }

  async function doMove(col, row, dir) {
    animating = true;

    if (isPlay && localEngine) {
      const ok = localEngine.makeTurn(col, row, dir);
      if (ok) {
        if (localEngine.lastMoveWasHitHole) soundManager.playHoleCapture();
        else soundManager.playMove();
        refresh();
        await new Promise((r) => setTimeout(r, 120));
      } else {
        soundManager.playError();
      }
      animating = false;
      return;
    }

    // game
    if (!globalEngine) {
      animating = false;
      return;
    }
    const item = globalEngine.field[row]?.[col];
    if (!item || item.type !== "ball") {
      animating = false;
      return;
    }

    const ok = makeMove(col, row, dir);
    if (ok) {
      if (globalEngine.lastMoveWasHitHole) {
        soundManager.playHoleCapture();
        if (vibrationEnabled) soundManager.playVibration();
      } else {
        soundManager.playMove();
      }
      refresh();
      await new Promise((r) => setTimeout(r, 150));
    } else {
      soundManager.playError();
    }
    animating = false;
  }

  // ============================================================
  // ПОБЕДА (play)
  // ============================================================
  const isWin = $derived(isPlay && localEngine ? localEngine.isWin() : false);
  const movesCount = $derived(
    isPlay && localEngine ? localEngine.movesCount : 0,
  );

  export function reset() {
    if (isPlay && externalObjects?.length) {
      localEngine = null;
    }
  }
</script>

<div
  class="board-container"
  style="width: {containerWidth}px; height: {containerHeight}px;"
>
  {#if cellSize > 0 && allWalls.length > 0}
    <div
      class="board"
      class:dark={$isDarkMode}
      class:interactive={canInteract}
      class:preview={isPreview}
      style="
    width: {fieldWidth}px;
    height: {fieldHeight}px;
    --cell-size: {cellSize}px;
    --board-bg: {Colors.Background.appBackground($isDarkMode)};
    --field-bg: {Colors.Background.fieldBackground($isDarkMode)};
    --grid-color: {Colors.Grid.grid($isDarkMode)};
  "
      on:mousedown={handleMouseDown}
      on:mousemove={handleMouseMove}
      on:mouseup={handleMouseUp}
      on:mouseleave={handleMouseLeave}
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
    >
      <div class="board-layer board-background" />

      <!-- Сетка -->
      <div
        class="board-layer board-grid"
        style="
    left: 0;
    top: 0;
    width: {cols * cellSize}px;
    height: {rows * cellSize}px;
  "
      />

      <!-- Лунки -->
      <div class="board-layer board-holes">
        {#each objects as { x, y, item } (x + "-" + y + "-h")}
          {#if item.type === "hole"}
            <div
              class="hole"
              style="
                left: {x * cellSize + gridOffsetX}px;
                top: {y * cellSize + gridOffsetY}px;
                width: {cellSize}px;
                height: {cellSize}px;
                border-color: {Colors.ballColor(item.color)};
              "
            >
              <div class="hole-inner"></div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Нижние стены -->
      <div class="board-layer board-bottom-walls">
        {#each allWalls as { x, y, wallType } (x + "-" + y + "-b-" + $isDarkMode)}
          {@const layer = getWallLayer(wallType)}
          {#if layer === "bottom"}
            <WallSVG {wallType} {cellSize} layer="bottom" gridX={x} gridY={y} />
          {/if}
        {/each}
      </div>

      <!-- Шары -->
      <div class="board-layer board-balls">
        {#each objects as { x, y, item } (x + "-" + y + "-ball")}
          {#if item.type === "ball"}
            <div
              class="ball"
              class:hint={isGame && $showHint}
              style="
                left: {x * cellSize + gridOffsetX}px;
                top: {y * cellSize + gridOffsetY}px;
                width: {cellSize}px;
                height: {cellSize}px;
                background: {Colors.ballColor(item.color)};
              "
            >
              <div class="ball-highlight"></div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Верхние стены -->
      <div class="board-layer board-top-walls">
        {#each allWalls as { x, y, wallType } (x + "-" + y + "-t-" + $isDarkMode)}
          {@const layer = getWallLayer(wallType)}
          {#if layer === "top"}
            <WallSVG {wallType} {cellSize} layer="top" gridX={x} gridY={y} />
          {/if}
        {/each}
      </div>

      <!-- Победа (только play) -->
      {#if isPlay && isWin}
        <div class="win-overlay">
          <div class="win-box">
            <div class="win-icon">🏆</div>
            <div class="win-title">Победа!</div>
            <div class="win-moves">Ходов: {movesCount}</div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .board-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
  }

  .board {
    position: relative;
    border-radius: 14px;
    padding: 0;
    overflow: hidden;
    touch-action: none;
    background: var(--board-bg);
    transition: background 0.3s ease;
  }

  .board.interactive {
    cursor: pointer;
  }

  .board.preview {
    cursor: default;
    pointer-events: none;
  }

  .board-background {
    background: var(--field-bg, #50427d);
    border-radius: 12px;
    z-index: 0;
  }

  .board-grid {
    position: absolute;
    z-index: 1;
    border-radius: 12px;
    background-image: linear-gradient(
        var(--grid-color, rgba(59, 45, 104, 0.4)) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        var(--grid-color, rgba(59, 45, 104, 0.4)) 1px,
        transparent 1px
      );
    background-size: var(--cell-size, 40px) var(--cell-size, 40px);
  }

  .board-holes {
    z-index: 2;
  }

  .hole {
    position: absolute;
    border-radius: 18%;
    border: 5px solid;
    background: rgba(0, 0, 0, 0.08);
    z-index: 2;
    box-sizing: border-box;
  }

  .hole-inner {
    position: absolute;
    top: 20%;
    left: 20%;
    right: 20%;
    bottom: 20%;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.05);
  }

  .board-bottom-walls {
    z-index: 3;
    overflow: visible;
  }

  .board-balls {
    z-index: 5;
  }

  .ball {
    position: absolute;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.15s ease;
    pointer-events: none;
    z-index: 5;
    box-sizing: border-box;
  }

  .ball-highlight {
    position: absolute;
    top: 15%;
    left: 20%;
    width: 25%;
    height: 20%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
  }

  .board.dark .ball-highlight {
    background: rgba(255, 255, 255, 0.6);
  }

  .ball.hint {
    animation: pulse 0.6s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
  }

  .board-top-walls {
    z-index: 5;
    overflow: visible;
  }

  .board-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .win-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10;
    border-radius: 14px;
  }

  .win-box {
    background: #fff;
    border-radius: 16px;
    padding: 24px 32px;
    text-align: center;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  .board.dark .win-box {
    background: #2d234b;
    color: #d9c8fb;
  }

  .win-icon {
    font-size: 48px;
  }

  .win-title {
    font-size: 20px;
    font-weight: 700;
    margin: 8px 0;
    color: #50427d;
  }

  .board.dark .win-title {
    color: #d9c8fb;
  }

  .win-moves {
    font-size: 14px;
    opacity: 0.7;
  }
</style>
