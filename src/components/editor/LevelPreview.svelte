<!-- src/components/editor/LevelPreview.svelte -->
<script>
  import { getWallSVG } from "../../lib/engine/WallSVGs.js";
  import { generateWalls } from "../../lib/engine/generateWalls.js";
  import { getWallLayer } from "../../lib/models/WallType.js";
  import { isDarkMode } from "../../lib/stores/gameStore.svelte.js";
  import { showWalls, toggleWalls } from "../../lib/stores/editorStore.svelte.js";
  import { Colors } from "../../lib/styles/colors.js";

  let {
    objectsGrid = [],
    containerWidth = 400,
    containerHeight = 400,
  } = $props();

  // === ГЕНЕРАЦИЯ WALLS ===
  const wallsGrid = $derived.by(() => {
    if (!objectsGrid?.length) return [];
    const W = (objectsGrid[0]?.length || 0) + 1;
    const H = objectsGrid.length + 1;
    try {
      return generateWalls(objectsGrid, W, H);
    } catch (e) {
      console.warn("generateWalls error:", e);
      return [];
    }
  });

  const cols = $derived(wallsGrid[0]?.length || 0);
  const rows = $derived(wallsGrid.length || 0);

  const cellSize = $derived.by(() => {
    if (!cols || !rows || !containerWidth || !containerHeight) return 0;
    const pad = 8;
    const w = (containerWidth - pad) / cols;
    const h = (containerHeight - pad) / rows;
    return Math.max(Math.floor(Math.min(w, h)), 8);
  });

  const boardW = $derived(cellSize * cols);
  const boardH = $derived(cellSize * rows);

  const wallsBottom = $derived.by(() => {
    const result = [];
    for (let y = 0; y < wallsGrid.length; y++) {
      for (let x = 0; x < wallsGrid[y]?.length; x++) {
        const t = wallsGrid[y][x];
        if (t && t !== "N" && getWallLayer(t) === "bottom") {
          result.push({ x, y, wallType: t });
        }
      }
    }
    return result;
  });

  const wallsTop = $derived.by(() => {
    const result = [];
    for (let y = 0; y < wallsGrid.length; y++) {
      for (let x = 0; x < wallsGrid[y]?.length; x++) {
        const t = wallsGrid[y][x];
        if (t && t !== "N" && getWallLayer(t) === "top") {
          result.push({ x, y, wallType: t });
        }
      }
    }
    return result;
  });

  function typeOf(v) {
    if (v >= 2 && v <= 7) return "ball";
    if (v >= 22 && v <= 77) return "hole";
    if (v === 1) return "block";
    return null;
  }

  function colorOf(v) {
    if (v >= 2 && v <= 7) return Colors.ballColor(v - 1);
    if (v >= 22 && v <= 77) return Colors.ballColor(Math.floor(v / 11));
    return null;
  }

  const objOffsetX = $derived(cellSize / 2);
  const objOffsetY = $derived(cellSize / 1.5);


</script>

<div class="wrapper">
  

  <div
    class="preview"
    style="width: {containerWidth}px; height: {containerHeight}px;"
  >
    {#if cellSize > 0}
      <div
        class="board"
        style="
          width: {boardW}px;
          height: {boardH}px;
          --cell: {cellSize}px;
          --grid-color: {Colors.Grid.grid($isDarkMode)};
          background: {Colors.Background.fieldBackground($isDarkMode)};
        "
      >
        <div class="grid"></div>

        {#if $showWalls}
          <div class="layer walls-bottom">
            {#each wallsBottom as { x, y, wallType } (x + "-" + y + "-b-" + $isDarkMode)}
              <div
                class="wall-cell"
                style="
                  left: {x * cellSize}px;
                  top: {y * cellSize}px;
                  width: {cellSize}px;
                  height: {cellSize}px;
                "
              >
                {@html getWallSVG(wallType, $isDarkMode, cellSize)}
              </div>
            {/each}
          </div>
        {/if}

        <div class="layer objects">
          {#each objectsGrid as row, y}
            {#each row as v, x}
              {@const t = typeOf(v)}
              {#if t}
                {#if !($showWalls && t === "block")}
                  <div
                    class="cell"
                    style="
                      left: {x * cellSize + objOffsetX}px;
                      top: {y * cellSize + objOffsetY}px;
                      width: {cellSize}px;
                      height: {cellSize}px;
                    "
                  >
                    {#if t === "ball"}
                      <div
                        class="ball"
                        style="width: {cellSize}px; height: {cellSize}px; background: {colorOf(v)};"
                      >
                        <div class="ball-hl"></div>
                      </div>
                    {:else if t === "hole"}
                      <div
                        class="hole"
                        style="width: {cellSize}px; height: {cellSize}px; border-color: {colorOf(v)};"
                      ></div>
                    {:else if t === "block"}
                      <div
                        class="block"
                        style="width: {cellSize}px; height: {cellSize}px;"
                      ></div>
                    {/if}
                  </div>
                {/if}
              {/if}
            {/each}
          {/each}
        </div>

        {#if $showWalls}
          <div class="layer walls-top">
            {#each wallsTop as { x, y, wallType } (x + "-" + y + "-t-" + $isDarkMode)}
              <div
                class="wall-cell"
                style="
                  left: {x * cellSize}px;
                  top: {y * cellSize}px;
                  width: {cellSize}px;
                  height: {cellSize}px;
                "
              >
                {@html getWallSVG(wallType, $isDarkMode, cellSize)}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
    overflow: hidden;
    background: transparent;
  }

  .preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
    flex: 1;
    width: 100%;
  }

  .board {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    /* transition: background 0.3s ease; */
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

  .layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .walls-bottom { z-index: 2; }
  .objects { z-index: 3; }
  .walls-top { z-index: 4; }

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
  }

  .ball {
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

  .hole {
    border-radius: 18%;
    border: 3px solid;
    background: rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
  }

  .block {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 3px;
    box-sizing: border-box;
  }
</style>