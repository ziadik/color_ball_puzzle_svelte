<!-- src/components/editor/GridEditor.svelte -->
<script>
  import { isDarkMode } from '../../lib/stores/gameStore.svelte.js';
  import { Colors } from '../../lib/styles/colors.js';

  let {
    objectsGrid = [],
    gridWidth = 0,
    gridHeight = 0,
    isMobile = false,
    selectedTool = 'ball',
    selectedColor = 1,
    isErasing = false,
    showGrid = true,
    onEditCell,
  } = $props();

  let containerEl = $state(null);
  let containerW = $state(0);
  let containerH = $state(0);

  // === РАЗМЕР КЛЕТКИ ===
  const cellSize = $derived.by(() => {
    if (!gridWidth || !gridHeight) return 0;
    if (!containerW || !containerH) return 0;
    const pad = 8;
    const w = (containerW - pad) / gridWidth;
    const h = (containerH - pad) / gridHeight;
    return Math.max(Math.floor(Math.min(w, h)), 8);
  });

  const boardW = $derived(cellSize * gridWidth);
  const boardH = $derived(cellSize * gridHeight);

  // === ДАННЫЕ ===
  function getObj(y, x) {
    return objectsGrid[y]?.[x] || 0;
  }

  function typeOf(v) {
    if (v >= 2 && v <= 7) return 'ball';
    if (v >= 22 && v <= 77) return 'hole';
    if (v === 1) return 'block';
    return null;
  }

function colorOf(v) {
  if (v >= 2 && v <= 7) return Colors.ballColor(v - 1);
  if (v >= 22 && v <= 77) return Colors.ballColor(Math.floor(v / 11) - 1);
  return null;
}

  // === КООРДИНАТЫ КЛИКА → КЛЕТКА ===
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  let mouseDown = false;

  function getCellFromPosition(clientX, clientY) {
    const boardEl = containerEl?.querySelector('.board');
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (col >= 0 && col < gridWidth && row >= 0 && row < gridHeight) {
      return { col, row };
    }
    return null;
  }

  // === ТАЧ ===
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

  function handleTouchEnd() {
    isSwiping = false;
  }

  // === МЫШЬ ===
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

  function handlePointerUp() {
    mouseDown = false;
  }

  function handlePointerLeave() {
    mouseDown = false;
  }
</script>

<div
  class="grid-editor-container"
  bind:this={containerEl}
  bind:clientWidth={containerW}
  bind:clientHeight={containerH}
>
  {#if cellSize > 0}
    <div
      class="board"
      class:dark={$isDarkMode}
      style="
        width: {boardW}px;
        height: {boardH}px;
        --cell: {cellSize}px;
        --grid-color: {Colors.Grid.grid($isDarkMode)};
      "
      on:mousedown={handlePointerDown}
      on:mousemove={handlePointerMove}
      on:mouseup={handlePointerUp}
      on:mouseleave={handlePointerLeave}
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
    >
      {#if showGrid}
        <div class="grid"></div>
      {/if}

      {#each Array(gridHeight) as _, y}
        {#each Array(gridWidth) as _, x}
          {@const obj = getObj(y, x)}
          {@const t = typeOf(obj)}

          <div
            class="cell"
            class:erasing={isErasing}
            style="
              left: {x * cellSize}px;
              top: {y * cellSize}px;
              width: {cellSize}px;
              height: {cellSize}px;
            "
          >
            {#if t === 'ball'}
              <div
                class="obj-ball"
                style="
                  width: {cellSize * 0.8}px;
                  height: {cellSize * 0.8}px;
                  background: {colorOf(obj)};
                "
              >
                <div class="ball-hl"></div>
              </div>
            {:else if t === 'hole'}
              <div
                class="obj-hole"
                style="
                  width: {cellSize * 0.8}px;
                  height: {cellSize * 0.8}px;
                  border-color: {colorOf(obj)};
                "
              ></div>
            {:else if t === 'block'}
              <div
                class="obj-block"
                style="width: {cellSize * 0.9}px; height: {cellSize * 0.9}px;"
              ></div>
            {/if}
          </div>
        {/each}
      {/each}
    </div>
  {/if}
</div>

<style>
  .grid-editor-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .board {
    position: relative;
    background: #50427d;
    border-radius: 8px;
    overflow: hidden;
  }

  .board.dark {
    background: #2d234b;
  }

  .grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background-image:
      linear-gradient(var(--grid-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
    background-size: var(--cell) var(--cell);
  }

  .cell {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    pointer-events: auto;
    border-radius: 2px;
  }

  .cell:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .cell.erasing:hover {
    background: rgba(255, 59, 48, 0.15);
  }

  .obj-ball {
    position: relative;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
  }

  .ball-hl {
    position: absolute;
    top: 15%;
    left: 20%;
    width: 25%;
    height: 20%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
  }

  .obj-hole {
    border-radius: 18%;
    border: 3px solid;
    background: rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
  }

  .obj-block {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 3px;
    box-sizing: border-box;
  }
</style>