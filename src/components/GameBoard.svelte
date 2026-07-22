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
    movesCount
  } from '../lib/stores/gameStore.svelte.js';
  import { soundManager } from '../lib/utils/sound.js';
  import { getWallLayer } from '../lib/models/WallType.js';

  let { containerWidth = 0, containerHeight = 0 } = $props();

  let engine = $state(null);
  let cellSize = $state(0);
  let fieldWidth = $state(0);
  let fieldHeight = $state(0);
  let cols = $state(0);
  let rows = $state(0);
  let touchStartX = $state(0);
  let touchStartY = $state(0);
  let isDragging = $state(false);
  let isDark = $state(false);
  
  let objects = $state([]);
  let allWalls = $state([]);
  
  let animating = $state(false);

  isDarkMode.subscribe(value => isDark = value);

  $effect(() => {
    const unsubscribe = fieldEngine.subscribe(e => {
      engine = e;
      if (engine) {
        updateDimensions();
        updateObjectsAndWalls();
      }
    });
    return unsubscribe;
  });

  $effect(() => {
    updateDimensions();
  });

  $effect(() => {
    if (engine && cellSize > 0) {
      updateObjectsAndWalls();
    }
  });

  function updateDimensions() {
    if (!engine || containerWidth === 0 || containerHeight === 0) return;

    cols = engine.field[0]?.length || 1;
    rows = engine.field.length || 1;

    const cellByWidth = (containerWidth - 8) / cols;
    const cellByHeight = (containerHeight - 8) / rows;
    cellSize = Math.min(cellByWidth, cellByHeight, 75, Math.max(cellByWidth, cellByHeight) * 0.95);

    fieldWidth = cellSize * cols + 4;
    fieldHeight = cellSize * rows + 4;
  }

  function getWallType(x, y) {
    if (!engine || !engine.walls) return null;
    if (y >= 0 && y < engine.walls.length && x >= 0 && x < engine.walls[0]?.length) {
      const wall = engine.walls[y][x];
      const wallMap = {
        'L': 'L', 'R': 'R', 'T': 'T', 'D': 'D',
        'LIT': 'LIT', 'RIT': 'RIT', 'LOT': 'LOT', 'ROT': 'ROT',
        'LID': 'LID', 'RID': 'RID', 'LOD': 'LOD', 'ROD': 'ROD',
        'B': 'B', 'LB': 'LB', 'RB': 'RB', 'N': 'N'
      };
      return wallMap[wall] || null;
    }
    return null;
  }

  function handleTouchStart(e) {
    if (animating) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isDragging = false;
  }

  function handleTouchMove(e) {
    if (animating) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      isDragging = true;
    }
  }

  async function handleTouchEnd(e) {
    if (animating) return;
    if (!isDragging) return;

    const touch = e.changedTouches[0];
    if (!touch) return;
    
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    const threshold = 15;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    const direction = Math.abs(dx) > Math.abs(dy) 
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down' : 'up');

    const { col, row } = getCellFromPosition(touchStartX, touchStartY);

    if (col !== null && row !== null) {
      await handleMove(col, row, direction);
    }
  }

  let mouseStartX = 0;
  let mouseStartY = 0;
  let isMouseDown = false;

  function handleMouseDown(e) {
    if (animating) return;
    if (e.button !== 0) return;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    isMouseDown = true;
  }

  function handleMouseMove(e) {
    if (!isMouseDown || animating) return;
    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      isDragging = true;
    }
  }

  async function handleMouseUp(e) {
    if (animating) return;
    if (!isMouseDown) return;
    isMouseDown = false;

    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;

    const threshold = 15;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      isDragging = false;
      return;
    }

    const direction = Math.abs(dx) > Math.abs(dy) 
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down' : 'up');

    const { col, row } = getCellFromPosition(mouseStartX, mouseStartY);

    if (col !== null && row !== null) {
      await handleMove(col, row, direction);
    }
    isDragging = false;
  }

  function handleMouseLeave(e) {
    isMouseDown = false;
    isDragging = false;
  }

  function getCellFromPosition(clientX, clientY) {
    const boardEl = document.querySelector('.board');
    if (!boardEl) return { col: null, row: null };
    
    const rect = boardEl.getBoundingClientRect();
    const padding = 3;
    const offsetX = cellSize / 2;
    const offsetY = cellSize / 1.5;
    
    let relX = clientX - rect.left - padding - offsetX;
    let relY = clientY - rect.top - padding - offsetY;
    
    const col = Math.floor(relX / cellSize);
    const row = Math.floor(relY / cellSize);
    
    return { col, row };
  }

  async function handleMove(col, row, direction) {
    if (!engine) return;
    
    if (row < 0 || row >= engine.field.length || col < 0 || col >= engine.field[0].length) {
      return;
    }
    
    const item = engine.field[row][col];
    if (!item || item.type !== 'ball') {
      return;
    }
    
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
      await new Promise(resolve => setTimeout(resolve, 150));
    } else {
      soundManager.playError();
    }
    animating = false;
  }

  function getObjects() {
    if (!engine) return [];
    const result = [];
    for (let y = 0; y < engine.field.length; y++) {
      for (let x = 0; x < engine.field[0].length; x++) {
        const item = engine.field[y][x];
        if (item && (item.type === 'ball' || item.type === 'hole')) {
          result.push({ x, y, item });
        }
      }
    }
    return result;
  }

  function getAllWalls() {
    if (!engine) return [];
    const result = [];
    for (let y = 0; y < engine.walls.length; y++) {
      for (let x = 0; x < engine.walls[0]?.length; x++) {
        const wallType = getWallType(x, y);
        if (wallType && wallType !== 'N') {
          result.push({ x, y, wallType });
        }
      }
    }
    return result;
  }

  function updateObjectsAndWalls() {
    objects = getObjects();
    allWalls = getAllWalls();
  }

  const gridOffsetX = $derived(cellSize / 2);
  const gridOffsetY = $derived(cellSize / 1.5);
</script>

<div 
  class="board-container"
  style="width: {containerWidth}px; height: {containerHeight}px;"
>
  {#if engine && cellSize > 0}
    <div 
      class="board"
      style="
        width: {fieldWidth - 5}px; 
        height: {fieldHeight - 5}px; 
        --cell-size: {cellSize}px;
      "
      class:dark={isDark}
      on:mousedown={handleMouseDown}
      on:mousemove={handleMouseMove}
      on:mouseup={handleMouseUp}
      on:mouseleave={handleMouseLeave}
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
    >
      <div class="board-layer board-background" />
      
      <div 
        class="board-layer board-grid"
        style="
          left: {gridOffsetX}px;
          top: {gridOffsetY}px;
          width: calc(100% - {gridOffsetX}px);
          height: calc(100% - {gridOffsetY}px);
        "
      />

      <div class="board-layer board-holes">
        {#each objects as { x, y, item } (item)}
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

      <div class="board-layer board-bottom-walls">
        {#each allWalls as { x, y, wallType } (wallType + x + y)}
          {@const layer = getWallLayer(wallType)}
          {#if layer === 'bottom'}
            <WallSVG 
              wallType={wallType}
              cellSize={cellSize}
              layer="bottom"
              className="type-{wallType}"
              gridX={x}
              gridY={y}
            />
          {/if}
        {/each}
      </div>

      <div class="board-layer board-balls">
        {#each objects as { x, y, item } (item)}
          {#if item.type === 'ball'}
            <div 
              class="ball"
              class:hint={$showHint}
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

      <div class="board-layer board-top-walls">
        {#each allWalls as { x, y, wallType } (wallType + x + y)}
          {@const layer = getWallLayer(wallType)}
          {#if layer === 'top'}
            <WallSVG 
              wallType={wallType}
              cellSize={cellSize}
              layer="top"
              className="type-{wallType}"
              gridX={x}
              gridY={y}
            />
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- src/components/GameBoard.svelte - только стили -->
<style>
  .board-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .board {
    position: relative;
    border-radius: 14px;
    padding: 3px;
    overflow: hidden;
    cursor: pointer;
    touch-action: none;
  }

  /* СВЕТЛАЯ ТЕМА - фон поля #50427D */
  .board {
    background: #50427D;
  }

  /* ТЕМНАЯ ТЕМА - фон поля #2D234B */
  .board.dark {
    background: #2D234B;
  }

  .board-background {
    border-radius: 12px;
    z-index: 0;
  }

  /* СВЕТЛАЯ ТЕМА - фон поля #50427D */
  .board-background {
    background: #50427D;
  }

  /* ТЕМНАЯ ТЕМА - фон поля #2D234B */
  .board.dark .board-background {
    background: #2D234B;
  }

  /* СЕТКА */
  .board-grid {
    background-image: 
      linear-gradient(rgba(59, 45, 104, 0.4) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 45, 104, 0.4) 1px, transparent 1px);
    background-size: var(--cell-size, 40px) var(--cell-size, 40px);
    border-radius: 12px;
    z-index: 1;
    position: absolute;
  }

  /* ТЕМНАЯ ТЕМА - сетка */
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
    z-index: 4;
  }

  .ball {
    position: absolute;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.15s ease;
    pointer-events: none;
  }

  /* СВЕТЛАЯ ТЕМА - блик */
  .ball-highlight {
    position: absolute;
    top: 15%;
    left: 20%;
    width: 25%;
    height: 20%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
  }

  /* ТЕМНАЯ ТЕМА - блик ярче */
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

  .board {
    cursor: pointer;
    touch-action: none;
  }

  @media (max-width: 480px) {
    .board {
      border-radius: 10px;
      padding: 2px;
    }
  }
</style>