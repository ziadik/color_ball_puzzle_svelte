<!-- src/components/editor/GridEditor.svelte -->
<script>
  import { getWallSVG } from '../../lib/engine/WallSVGs.js';
  import { isDarkMode } from '../../lib/stores/gameStore.svelte.js';

  let {
    wallsGrid = [],
    objectsGrid = [],
    gridWidth = 0,
    gridHeight = 0,
    cellSize = 40,
    showGrid = true,
    isErasing = false,
    isMobile = false,
    selectedTool = 'wall',
    selectedWallType = 'L',
    selectedColor = 1,
    hoveredCell = null,
    onEditCell
  } = $props();

  let isDark = false;
  isDarkMode.subscribe(value => isDark = value);

  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;

  function getWallSVGData(type) {
    const svg = getWallSVG(type, isDark, cellSize);
    if (!svg) return '';
    return svg;
  }

  function getObjectColor(value) {
    const colorMap = {
      1: { hex: '#34C759' },
      2: { hex: '#FF3B30' },
      3: { hex: '#007AFF' },
      4: { hex: '#FFCC00' },
      5: { hex: '#AF52DE' },
      6: { hex: '#32ADE6' },
    };
    if (value >= 2 && value <= 7) {
      return colorMap[value - 1]?.hex || '#999';
    }
    if (value >= 22 && value <= 77) {
      const color = Math.floor(value / 11);
      return colorMap[color]?.hex || '#999';
    }
    return null;
  }

  function getObj(rowIndex, colIndex) {
    if (rowIndex < objectsGrid.length && colIndex < objectsGrid[rowIndex]?.length) {
      return objectsGrid[rowIndex][colIndex] || 0;
    }
    return 0;
  }

  function isHovered(rowIndex, colIndex) {
    return hoveredCell?.col === colIndex && hoveredCell?.row === rowIndex;
  }

  function getCellFromPosition(clientX, clientY) {
    const boardEl = document.querySelector('.editor-board');
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    const padding = 4;
    const x = clientX - rect.left - padding;
    const y = clientY - rect.top - padding;
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
    if (cell && onEditCell) {
      onEditCell(cell.col, cell.row);
    }
  }

  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      isSwiping = true;
    }
    
    if (isSwiping) {
      const cell = getCellFromPosition(touch.clientX, touch.clientY);
      if (cell && onEditCell) {
        onEditCell(cell.col, cell.row);
      }
    }
  }

  function handleTouchEnd(e) {
    isSwiping = false;
  }

  function handlePointerDown(e) {
    if (e.button !== 0) return;
    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell && onEditCell) {
      onEditCell(cell.col, cell.row);
    }
  }

  function handlePointerMove(e) {
    const cell = getCellFromPosition(e.clientX, e.clientY);
    hoveredCell = cell;
    if (e.buttons === 1 && cell && onEditCell) {
      onEditCell(cell.col, cell.row);
    }
  }

  function handlePointerLeave() {
    hoveredCell = null;
  }

  const gridOffsetX = cellSize / 2;
  const gridOffsetY = cellSize / 1.5;
</script>

<div 
  class="editor-board"
  class:mobile={isMobile}
  style="--cell-size: {cellSize}px; width: {gridWidth * cellSize + 8}px; height: {gridHeight * cellSize + 8}px;"
  on:mousedown={handlePointerDown}
  on:mousemove={handlePointerMove}
  on:mouseleave={handlePointerLeave}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchEnd}
>
  <div 
    class="grid-overlay"
    class:visible={showGrid}
    style="--cell-size: {cellSize}px;"
  ></div>

  {#each wallsGrid as row, rowIndex}
    {#each row as wall, colIndex}
      {@const obj = getObj(rowIndex, colIndex)}
      {@const hover = isHovered(rowIndex, colIndex)}
      <div 
        class="cell"
        class:mobile={isMobile}
        class:hover={hover}
        class:erasing={isErasing}
        style="left: {colIndex * cellSize + 4}px; top: {rowIndex * cellSize + 4}px; width: {cellSize}px; height: {cellSize}px;"
      >
        <!-- Стена -->
        {#if wall !== 'N'}
          <div class="wall-display">
            {@html getWallSVGData(wall)}
          </div>
        {/if}

        <!-- Объект -->
        {#if obj && obj !== 0}
          <div 
            class="object-display"
            class:ball={obj >= 2 && obj <= 7}
            class:hole={obj >= 22 && obj <= 77}
            class:block={obj === 1}
            class:mobile={isMobile}
            style="
              left: {gridOffsetX}px;
              top: {gridOffsetY}px;
              width: {cellSize}px;
              height: {cellSize}px;
              background: {getObjectColor(obj) || 'transparent'};
            "
          >
            {#if obj >= 2 && obj <= 7}
              <span class="obj-label">{obj - 1}</span>
            {:else if obj >= 22 && obj <= 77}
              <span class="obj-label">{Math.floor(obj / 11)}</span>
            {:else if obj === 1}
              <span>█</span>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  {/each}
</div>

<style>
  .editor-board {
    position: relative;
    background: #50427d;
    border-radius: 10px;
    padding: 3px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .editor-board.mobile {
    border-radius: 6px;
    padding: 2px;
  }

  .dark .editor-board {
    background: #2d234b;
  }

  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .grid-overlay.visible {
    background-image: 
      linear-gradient(rgba(59, 45, 104, 0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 45, 104, 0.3) 1px, transparent 1px);
    background-size: var(--cell-size, 40px) var(--cell-size, 40px);
  }

  .dark .grid-overlay.visible {
    background-image: 
      linear-gradient(rgba(100, 86, 145, 0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(100, 86, 145, 0.2) 1px, transparent 1px);
  }

  .cell {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.05s;
    z-index: 2;
    border-radius: 1px;
  }

  .cell.mobile {
    border-radius: 0;
  }

  .cell:hover {
    background: rgba(255,255,255,0.08);
  }

  .cell.hover {
    background: rgba(255,255,255,0.12);
  }

  .cell.erasing:hover {
    background: rgba(255,59,48,0.15);
  }

  .wall-display {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    overflow: hidden;
  }

  .wall-display svg {
    width: 100% !important;
    height: 100% !important;
    max-width: 100%;
    max-height: 100%;
    display: block;
  }

  .object-display {
    position: absolute;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    font-weight: 700;
    color: white;
    pointer-events: none;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  .object-display.mobile {
    border-radius: 2px;
    font-size: 7px;
  }

  .object-display.ball {
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .object-display.hole {
    border-radius: 10%;
    border: 2px solid currentColor;
    background: rgba(0,0,0,0.15) !important;
    color: currentColor;
  }

  .object-display.block {
    background: rgba(255,255,255,0.15) !important;
    color: rgba(255,255,255,0.3);
    font-size: 12px;
  }

  .object-display.block.mobile {
    font-size: 10px;
  }

  .obj-label {
    font-size: 7px;
    opacity: 0.8;
  }

  .obj-label.mobile {
    font-size: 6px;
  }
</style>