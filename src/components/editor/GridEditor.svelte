<!-- src/components/editor/GridEditor.svelte -->
<script>
  import { colorToCss } from '../../lib/models/GameColor.js';
  import { getWallSVG } from '../../lib/engine/WallSVGs.js';
  import { isDarkMode } from '../../lib/stores/gameStore.svelte.js';

  let {
    objectsGrid = [],
    wallsGrid = [],
    gridWidth = 0,
    gridHeight = 0,
    cellSize = 32,
    showGrid = true,
    isErasing = false,
    isMobile = false,
    selectedTool = 'ball',
    selectedColor = 1,
    onEditCell,
  } = $props();

  let isDark = false;
  isDarkMode.subscribe(value => isDark = value);

  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  let mouseDown = false;

  // Размер walls (обычно gridWidth + 1)
  const wallsW = $derived(wallsGrid[0]?.length || gridWidth + 1);
  const wallsH = $derived(wallsGrid.length || gridHeight + 1);

  // Общий размер поля — по walls
  const boardW = $derived(wallsW * cellSize);
  const boardH = $derived(wallsH * cellSize);

  // Смещение объектов: objects[0][0] = узел между walls[0][0] и walls[1][1]
  // Значит, объект визуально в клетке walls[1][1] → сдвиг на 1 клетку
  const objectOffsetX = $derived(cellSize);
  const objectOffsetY = $derived(cellSize);

  function getWallSVGData(type) {
    if (!type || type === 'N') return '';
    return getWallSVG(type, isDark, cellSize);
  }

  function getObjectColor(value) {
    if (value >= 2 && value <= 7) {
      return colorToCss(value - 1, isDark);
    }
    if (value >= 22 && value <= 77) {
      return colorToCss(Math.floor(value / 11), isDark);
    }
    return null;
  }

  function getObj(rowIndex, colIndex) {
    if (rowIndex < objectsGrid.length && colIndex < objectsGrid[rowIndex]?.length) {
      return objectsGrid[rowIndex][colIndex] || 0;
    }
    return 0;
  }

  function getCellFromPosition(clientX, clientY) {
    const boardEl = document.querySelector('.grid-editor-board');
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    const x = clientX - rect.left - objectOffsetX;
    const y = clientY - rect.top - objectOffsetY;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (col >= 0 && col < gridWidth && row >= 0 && row < gridHeight) {
      return { col, row };
    }
    return null;
  }

  function handleTouchStart(e) {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isSwiping = false;
    const cell = getCellFromPosition(touch.clientX, touch.clientY);
    if (cell && onEditCell) onEditCell(cell.col, cell.row);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) isSwiping = true;
    if (isSwiping) {
      const cell = getCellFromPosition(touch.clientX, touch.clientY);
      if (cell && onEditCell) onEditCell(cell.col, cell.row);
    }
  }

  function handleTouchEnd() { isSwiping = false; }

  function handlePointerDown(e) {
    if (e.button !== 0) return;
    mouseDown = true;
    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell && onEditCell) onEditCell(cell.col, cell.row);
  }

  function handlePointerMove(e) {
    if (!mouseDown) return;
    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell && onEditCell) onEditCell(cell.col, cell.row);
  }

  function handlePointerUp() { mouseDown = false; }
  function handlePointerLeave() { mouseDown = false; }
</script>

<div 
  class="grid-editor-board"
  class:mobile={isMobile}
  class:dark={isDark}
  style="
    --cell-size: {cellSize}px; 
    width: {boardW}px; 
    height: {boardH}px;
  "
  on:mousedown={handlePointerDown}
  on:mousemove={handlePointerMove}
  on:mouseup={handlePointerUp}
  on:mouseleave={handlePointerLeave}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchEnd}
>
  <!-- Слой стен (занимает всё поле) -->
  <div class="layer layer-walls">
    {#each wallsGrid as row, y}
      {#each row as wallType, x}
        {#if wallType && wallType !== 'N'}
          <div 
            class="wall-cell"
            style="
              left: {x * cellSize}px;
              top: {y * cellSize}px;
              width: {cellSize}px;
              height: {cellSize}px;
            "
          >
            {@html getWallSVGData(wallType)}
          </div>
        {/if}
      {/each}
    {/each}
  </div>

  <!-- Сетка: только на области objects (со сдвигом на 1 клетку) -->
  {#if showGrid}
    <div 
      class="grid-overlay" 
      style="
        --cell-size: {cellSize}px;
        left: {objectOffsetX}px;
        top: {objectOffsetY}px;
        width: {gridWidth * cellSize}px;
        height: {gridHeight * cellSize}px;
      "
    ></div>
  {/if}

  <!-- Слой объектов: объекты в клетках сетки -->
  <div class="layer layer-objects">
    {#each Array(gridHeight) as _, rowIndex}
      {#each Array(gridWidth) as _, colIndex}
        {@const obj = getObj(rowIndex, colIndex)}
        <div 
          class="cell"
          class:erasing={isErasing}
          style="
            left: {colIndex * cellSize + objectOffsetX}px;
            top: {rowIndex * cellSize + objectOffsetY}px;
            width: {cellSize}px;
            height: {cellSize}px;
          "
        >
          {#if obj && obj !== 0}
            {#if obj === 1}
              <div class="obj-block" style="width: {cellSize * 0.9}px; height: {cellSize * 0.9}px;">█</div>
            {:else if obj >= 2 && obj <= 7}
              <div 
                class="obj-ball" 
                style="
                  width: {cellSize * 0.7}px;
                  height: {cellSize * 0.7}px;
                  background: {getObjectColor(obj)};
                "
              >
                <div class="ball-highlight"></div>
              </div>
            {:else if obj >= 22 && obj <= 77}
              <div 
                class="obj-hole" 
                style="
                  width: {cellSize * 0.7}px;
                  height: {cellSize * 0.7}px;
                  border-color: {getObjectColor(obj)};
                "
              >
                <div class="hole-inner"></div>
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    {/each}
  </div>
</div>

<style>
  .grid-editor-board {
    position: relative;
    background: #50427d;
    border-radius: 8px;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .grid-editor-board.dark {
    background: #2d234b;
  }

  .grid-editor-board.mobile {
    border-radius: 6px;
  }

  .grid-overlay {
    position: absolute;
    pointer-events: none;
    z-index: 1;
    background-image: 
      linear-gradient(rgba(59, 45, 104, 0.5) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 45, 104, 0.5) 1px, transparent 1px);
    background-size: var(--cell-size, 32px) var(--cell-size, 32px);
    box-sizing: border-box;
    border: 1px solid rgba(59, 45, 104, 0.5);
  }

  .grid-editor-board.dark .grid-overlay {
    background-image: 
      linear-gradient(rgba(100, 86, 145, 0.4) 1px, transparent 1px),
      linear-gradient(90deg, rgba(100, 86, 145, 0.4) 1px, transparent 1px);
    border-color: rgba(100, 86, 145, 0.4);
  }

  .layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .layer-walls {
    z-index: 2;
  }

  .layer-objects {
    z-index: 3;
  }

  .wall-cell {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
  }

  .wall-cell svg {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }

  .cell {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    pointer-events: auto;
    transition: background 0.1s;
  }

  .cell:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .cell.erasing:hover {
    background: rgba(255, 59, 48, 0.15);
  }

  .obj-block {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    color: rgba(255, 255, 255, 0.3);
    font-size: 14px;
    border-radius: 3px;
    box-sizing: border-box;
  }

  .obj-ball {
    position: relative;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
  }

  .ball-highlight {
    position: absolute;
    top: 15%;
    left: 20%;
    width: 25%;
    height: 20%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
  }

  .obj-hole {
    position: relative;
    border-radius: 18%;
    border: 3px solid;
    background: rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
  }

  .hole-inner {
    position: absolute;
    top: 20%;
    left: 20%;
    right: 20%;
    bottom: 20%;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1);
  }
</style>