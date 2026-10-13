<!-- src/components/GameBoard.svelte -->
<script>
  import { colorToCss } from '../lib/models/GameColor.js';
  import WallSVG from './WallSVG.svelte';
  import {
    fieldEngine,
    showHint,
    isDarkMode,
    makeMove,
    vibrationEnabled,
  } from '../lib/stores/gameStore.svelte.js';
  import { soundManager } from '../lib/utils/sound.js';
  import { getWallLayer } from '../lib/models/WallType.js';
  import { generateWalls } from '../lib/engine/generateWalls.js';

  let {
    containerWidth = 0,
    containerHeight = 0,
    preview = false,
    mode = 'walls',        // 'walls' | 'generate'
    gridWidth: previewWidth = 0,
    gridHeight: previewHeight = 0,
    wallsGrid: previewWalls = [],
    objectsGrid: previewObjects = [],
  } = $props();

  let engine = $state(null);
  let cellSize = $state(0);
  let fieldWidth = $state(0);
  let fieldHeight = $state(0);
  let cols = $state(0);
  let rows = $state(0);
  let isDark = $state(false);
  let objects = $state([]);
  let allWalls = $state([]);
  let animating = $state(false);

  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;
  let mouseStartX = 0;
  let mouseStartY = 0;
  let isMouseDown = false;

  isDarkMode.subscribe((value) => (isDark = value));

  // ============================================================
  // АКТИВНЫЕ СТЕНЫ
  // mode = 'generate' → генерируем из objects
  // mode = 'walls'    → берём готовые
  // ============================================================
  let activeWalls = $derived.by(() => {
    if (mode === 'generate') {
      if (!previewObjects?.length) return [];
      const W = (previewObjects[0]?.length || 0) + 1;
      const H = previewObjects.length + 1;
      try {
        return generateWalls(previewObjects, W, H);
      } catch (e) {
        console.warn('generateWalls error:', e);
        return [];
      }
    }
    // mode = 'walls'
    if (preview) return previewWalls || [];
    if (engine?.walls) return engine.walls;
    return [];
  });

  // ============================================================
  // АКТИВНЫЕ OBJECTS
  // ============================================================
  let activeObjects = $derived.by(() => {
    if (mode === 'generate' || preview) {
      return previewObjects || [];
    }
    return engine?.field || [];
  });

  // ============================================================
  // ПОДПИСКА НА ENGINE (только игра)
  // ============================================================
  $effect(() => {
    if (preview || mode === 'generate') return;
    const unsubscribe = fieldEngine.subscribe((e) => {
      engine = e;
    });
    return unsubscribe;
  });

  // ============================================================
  // РЕАКЦИЯ НА ИЗМЕНЕНИЯ
  // ============================================================
  $effect(() => {
    const walls = activeWalls;
    const objs = activeObjects;
    const cw = containerWidth;
    const ch = containerHeight;

    if (walls?.length > 0 && cw > 0 && ch > 0) {
      updateDimensions();
      updateObjectsAndWalls();
    }
  });

  // ============================================================
  // РАСЧЁТ РАЗМЕРОВ
  // ============================================================
  function updateDimensions() {
    const walls = activeWalls;
    if (!walls?.length) return;

    cols = walls[0]?.length || 1;
    rows = walls.length || 1;

    if (containerWidth === 0 || containerHeight === 0) return;

    const padding = 4;
    const availableW = containerWidth - padding;
    const availableH = containerHeight - padding;

    // Учитываем смещение объектов (правый-нижний угол)
    // walls[y][x] — клетка; objects[y][x] — правый-нижний угол
    // Смещение вправо на cellSize/2 и вниз на cellSize/2
    // Значит, реальная ширина = cols + 0.5, высота = rows + 0.5
    const colsWithOffset = cols + 0.5;
    const rowsWithOffset = rows + 0.5;

    const cellW = availableW / colsWithOffset;
    const cellH = availableH / rowsWithOffset;

    cellSize = Math.min(cellW, cellH);
    fieldWidth = cellSize * colsWithOffset;
    fieldHeight = cellSize * rowsWithOffset;
  }

  // ============================================================
  // ПОЛУЧЕНИЕ ОБЪЕКТОВ
  // ============================================================
  function getObjects() {
    const src = activeObjects;
    if (!src?.length) return [];

    const result = [];
    for (let y = 0; y < src.length; y++) {
      const row = src[y];
      if (!row) continue;
      for (let x = 0; x < row.length; x++) {
        const val = row[x];

        // Случай engine (Item объект)
        if (val && typeof val === 'object' && val.type) {
          if (val.type === 'ball' || val.type === 'hole') {
            result.push({ x, y, item: val });
          }
          continue;
        }

        // Случай preview (число)
        if (val === 0) continue;
        let type = 'block';
        if (val >= 2 && val <= 7) type = 'ball';
        else if (val >= 22 && val <= 77) type = 'hole';
        else if (val === 1) type = 'block';

        if (type !== 'block') {
          const color = type === 'ball' ? val - 1 : Math.floor(val / 11);
          result.push({ x, y, item: { type, color } });
        }
      }
    }
    return result;
  }

  // ============================================================
  // ПОЛУЧЕНИЕ СТЕН
  // ============================================================
  function getAllWallsList() {
    const walls = activeWalls;
    if (!walls?.length) return [];

    const result = [];
    for (let y = 0; y < walls.length; y++) {
      for (let x = 0; x < walls[y]?.length; x++) {
        const wallType = walls[y][x];
        if (wallType && wallType !== 'N') {
          result.push({ x, y, wallType });
        }
      }
    }
    return result;
  }

  function updateObjectsAndWalls() {
    objects = getObjects();
    allWalls = getAllWallsList();
  }

  // ============================================================
  // СМЕЩЕНИЕ ОБЪЕКТОВ
  // Объекты всегда смещены на полклетки вправо-вниз
  // (в редакторе и в игре — одинаково)
  // ============================================================
  const gridOffsetX = $derived(cellSize / 2);
  const gridOffsetY = $derived(cellSize / 2);

  // ============================================================
  // ОБРАБОТЧИКИ (только для игры)
  // ============================================================
  function handleTouchStart(e) {
    if (animating || preview) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isDragging = false;
  }

  function handleTouchMove(e) {
    if (animating || preview) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) isDragging = true;
  }

  async function handleTouchEnd(e) {
    if (animating || preview) return;
    if (!isDragging) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const threshold = 15;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    const direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0 ? 'right' : 'left'
        : dy > 0 ? 'down' : 'up';
    const { col, row } = getCellFromPosition(touchStartX, touchStartY);
    if (col !== null && row !== null) await handleMove(col, row, direction);
  }

  function handleMouseDown(e) {
    if (animating || preview) return;
    if (e.button !== 0) return;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    isMouseDown = true;
  }

  function handleMouseMove(e) {
    if (!isMouseDown || animating || preview) return;
    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) isDragging = true;
  }

  async function handleMouseUp(e) {
    if (animating || preview) return;
    if (!isMouseDown) return;
    isMouseDown = false;
    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;
    const threshold = 15;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      isDragging = false;
      return;
    }
    const direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0 ? 'right' : 'left'
        : dy > 0 ? 'down' : 'up';
    const { col, row } = getCellFromPosition(mouseStartX, mouseStartY);
    if (col !== null && row !== null) await handleMove(col, row, direction);
    isDragging = false;
  }

  function handleMouseLeave() {
    isMouseDown = false;
    isDragging = false;
  }

  function getCellFromPosition(clientX, clientY) {
    const boardEl = document.querySelector('.board');
    if (!boardEl) return { col: null, row: null };
    const rect = boardEl.getBoundingClientRect();
    const padding = 3;
    const offsetX = cellSize / 2;
    const offsetY = cellSize / 2;
    let relX = clientX - rect.left - padding - offsetX;
    let relY = clientY - rect.top - padding - offsetY;
    const col = Math.floor(relX / cellSize);
    const row = Math.floor(relY / cellSize);
    return { col, row };
  }

  async function handleMove(col, row, direction) {
    if (!engine) return;
    if (row < 0 || row >= engine.field.length || col < 0 || col >= engine.field[0].length) return;
    const item = engine.field[row][col];
    if (!item || item.type !== 'ball') return;

    animating = true;
    const success = makeMove(col, row, direction);
    if (success) {
      if (engine.lastMoveWasHitHole) {
        soundManager.playHoleCapture();
        if (vibrationEnabled) soundManager.playVibration();
      } else {
        soundManager.playMove();
      }
      updateObjectsAndWalls();
      await new Promise((resolve) => setTimeout(resolve, 150));
    } else {
      soundManager.playError();
    }
    animating = false;
  }
</script>

<div
  class="board-container"
  style="width: {containerWidth}px; height: {containerHeight}px;"
>
  {#if cellSize > 0 && allWalls.length > 0}
    <div
      class="board"
      class:preview
      class:dark={isDark}
      style="
        width: {fieldWidth}px; 
        height: {fieldHeight}px; 
        --cell-size: {cellSize}px;
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

      <!-- Фоновая сетка -->
      <div
        class="board-layer board-grid"
        style="
          left: {gridOffsetX}px;
          top: {gridOffsetY}px;
          width: calc(100% - {gridOffsetX}px);
          height: calc(100% - {gridOffsetY}px);
        "
      />

      <!-- Лунки -->
      <div class="board-layer board-holes">
        {#each objects as { x, y, item } (x + '-' + y)}
          {#if item.type === 'hole'}
            <div
              class="hole"
              style="
                left: {x * cellSize + gridOffsetX}px;
                top: {y * cellSize + gridOffsetY}px;
                width: {cellSize}px;
                height: {cellSize}px;
                border-color: {colorToCss(item.color, isDark)};
              "
            >
              <div class="hole-inner"></div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Нижние стены -->
      <div class="board-layer board-bottom-walls">
        {#each allWalls as { x, y, wallType } (x + '-' + y + '-b')}
          {@const layer = getWallLayer(wallType)}
          {#if layer === 'bottom'}
            <WallSVG
              {wallType}
              {cellSize}
              layer="bottom"
              gridX={x}
              gridY={y}
            />
          {/if}
        {/each}
      </div>

      <!-- Шары -->
      <div class="board-layer board-balls">
        {#each objects as { x, y, item } (x + '-' + y + '-ball')}
          {#if item.type === 'ball'}
            <div
              class="ball"
              class:hint={!preview && $showHint}
              style="
                left: {x * cellSize + gridOffsetX}px;
                top: {y * cellSize + gridOffsetY}px;
                width: {cellSize}px;
                height: {cellSize}px;
                background: {colorToCss(item.color, isDark)};
              "
            >
              <div class="ball-highlight"></div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Верхние стены -->
      <div class="board-layer board-top-walls">
        {#each allWalls as { x, y, wallType } (x + '-' + y + '-t')}
          {@const layer = getWallLayer(wallType)}
          {#if layer === 'top'}
            <WallSVG
              {wallType}
              {cellSize}
              layer="top"
              gridX={x}
              gridY={y}
            />
          {/if}
        {/each}
      </div>
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
    cursor: pointer;
    touch-action: none;
  }

  .board.preview {
    cursor: default;
    pointer-events: none;
  }

  .board {
    background: #50427d;
  }
  .board.dark {
    background: #2d234b;
  }

  .board-background {
    border-radius: 12px;
    z-index: 0;
    background: #50427d;
  }
  .board.dark .board-background {
    background: #2d234b;
  }

  .board-grid {
    background-image:
      linear-gradient(rgba(59, 45, 104, 0.4) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 45, 104, 0.4) 1px, transparent 1px);
    background-size: var(--cell-size, 40px) var(--cell-size, 40px);
    border-radius: 12px;
    z-index: 1;
    position: absolute;
  }

  .board.dark .board-grid {
    background-image:
      linear-gradient(rgba(100, 86, 145, 0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(100, 86, 145, 0.3) 1px, transparent 1px);
  }

  .board-holes {
    z-index: 2;
  }

  .hole {
    position: absolute;
    border-radius: 18%;
    border: 5px solid;
    background: rgba(0, 0, 0, 0.08);
    opacity: 1;
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
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }

  .board-top-walls {
    z-index: 5;
    overflow: visible;
  }

  .board-layer {
    pointer-events: none;
  }

  @media (max-width: 480px) {
    .board {
      border-radius: 10px;
      padding: 0;
    }
  }
</style>