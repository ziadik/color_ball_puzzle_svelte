<!-- src/components/editor/LayerPanel.svelte -->
<script>
  let {
    selectedTool = 'wall',
    selectedColor = 1,
    isErasing = false,
    gridWidth = 0,
    gridHeight = 0,
    objectsGrid = [],
    isMobile = false,
    isDark = false,
    colorMap = {},
    onSelectTool
  } = $props();

  function selectTool(tool, color) {
    if (onSelectTool) {
      onSelectTool(tool, color);
    }
  }

  function toggleEraser() {
    if (onSelectTool) {
      onSelectTool('eraser', null);
    }
  }

  // Подсчет объектов
  let ballsCount = $derived(objectsGrid.flat().filter(v => v >= 2 && v <= 7).length);
  let holesCount = $derived(objectsGrid.flat().filter(v => v >= 22 && v <= 77).length);
</script>

<div class="layer-panel" class:mobile={isMobile} class:dark={isDark}>
  <div class="layer-section">
    <div class="layer-title">🎯 Balls</div>
    <div class="layer-items">
      {#each [1,2,3,4,5,6] as color}
        <button 
          class="layer-btn" 
          class:active={selectedTool === 'ball' && selectedColor === color}
          on:click={() => selectTool('ball', color)}
          style="background: {colorMap[color].hex}; color: white;"
        >
          {color}
        </button>
      {/each}
    </div>
  </div>

  <div class="layer-section">
    <div class="layer-title">🕳️ Holes</div>
    <div class="layer-items">
      {#each [1,2,3,4,5,6] as color}
        <button 
          class="layer-btn layer-hole" 
          class:active={selectedTool === 'hole' && selectedColor === color}
          on:click={() => selectTool('hole', color)}
          style="border-color: {colorMap[color].hex}; color: {colorMap[color].hex};"
        >
          {color}
        </button>
      {/each}
    </div>
  </div>

  <div class="layer-section">
    <div class="layer-title">🧱 Tools</div>
    <div class="layer-items">
      <button 
        class="layer-btn block-btn" 
        class:active={selectedTool === 'block'}
        on:click={() => selectTool('block')}
      >
        █ Block
      </button>
      <button 
        class="layer-btn eraser-btn" 
        class:active={isErasing}
        on:click={toggleEraser}
      >
        🗑️ Eraser
      </button>
    </div>
  </div>

  <div class="layer-info">
    <span>{gridWidth}×{gridHeight}</span>
    <span>B:{ballsCount}</span>
    <span>H:{holesCount}</span>
  </div>
</div>

<style>
  .layer-panel {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    width: 100%;
    padding: 4px 8px;
    background: rgba(255,255,255,0.3);
    border-radius: 8px;
    border: 1px solid rgba(80,66,125,0.1);
    align-items: center;
  }

  .layer-panel.mobile {
    padding: 3px 6px;
    gap: 4px;
    border-radius: 6px;
  }

  .dark .layer-panel {
    background: rgba(255,255,255,0.05);
    border-color: rgba(217,200,251,0.08);
  }

  .layer-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 4px;
    border-right: 1px solid rgba(80,66,125,0.1);
  }

  .dark .layer-section {
    border-right: 1px solid rgba(217,200,251,0.08);
  }

  .layer-section:last-child {
    border-right: none;
  }

  .layer-title {
    font-size: 9px;
    font-weight: 600;
    color: #50427d;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .dark .layer-title {
    color: #d9c8fb;
  }

  .layer-items {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
  }

  .layer-btn {
    width: 28px;
    height: 28px;
    border: 2px solid transparent;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .layer-btn.mobile {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }

  .layer-btn.active {
    border-color: #722fc0;
    transform: scale(1.1);
    box-shadow: 0 0 0 2px rgba(114,47,192,0.3);
  }

  .dark .layer-btn.active {
    border-color: #a69dd4;
  }

  .layer-btn:hover {
    transform: scale(1.05);
  }

  .layer-hole {
    background: transparent !important;
    border: 2px solid currentColor;
  }

  .block-btn {
    background: rgba(255,255,255,0.15) !important;
    color: #50427d;
    width: auto;
    padding: 0 8px;
    font-size: 12px;
  }

  .dark .block-btn {
    color: #d9c8fb;
  }

  .eraser-btn {
    background: rgba(255,59,48,0.1) !important;
    color: #ff3b30;
    width: auto;
    padding: 0 8px;
    font-size: 12px;
  }

  .eraser-btn.active {
    border-color: #ff3b30;
    background: rgba(255,59,48,0.2) !important;
  }

  .layer-info {
    display: flex;
    gap: 4px;
    font-size: 9px;
    color: rgba(80,66,125,0.5);
    flex-wrap: wrap;
  }

  .dark .layer-info {
    color: rgba(217,200,251,0.3);
  }

  .layer-info span {
    background: rgba(80,66,125,0.06);
    padding: 1px 6px;
    border-radius: 3px;
  }

  .dark .layer-info span {
    background: rgba(217,200,251,0.05);
  }
</style>