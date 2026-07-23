<!-- src/components/editor/WallToolbar.svelte -->
<script>
  import { getWallSVG } from '../../lib/engine/WallSVGs.js';
  import { isDarkMode } from '../../lib/stores/gameStore.svelte.js';

  let { 
    wallTypes = [], 
    selectedTool = 'wall', 
    selectedWallType = 'L', 
    isErasing = false,
    isMobile = false,
    onSelect 
  } = $props();

  let isDark = false;
  isDarkMode.subscribe(value => isDark = value);

  function getWallSVGData(type) {
    const size = isMobile ? 24 : 30;
    const svg = getWallSVG(type, isDark, size);
    if (!svg) return '';
    return svg;
  }

  function handleSelect(type) {
    if (onSelect) {
      onSelect(type);
    }
  }
</script>

<div class="toolbar" class:mobile={isMobile}>
  <div class="toolbar-scroll">
    {#each wallTypes as tool}
      <button 
        class="tool-item" 
        class:active={selectedTool === 'wall' && selectedWallType === tool.type && !isErasing}
        class:mobile={isMobile}
        on:click={() => handleSelect(tool.type)}
        title={tool.key}
      >
        <div class="tool-preview" class:mobile={isMobile}>
          {#if tool.type !== 'N'}
            <div class="wall-preview-svg">
              {@html getWallSVGData(tool.type)}
            </div>
          {:else}
            <span class="empty-preview">∅</span>
          {/if}
        </div>
        <span class="tool-label" class:mobile={isMobile}>{tool.key}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .toolbar {
    width: 100%;
    background: rgba(255,255,255,0.3);
    border-radius: 8px;
    padding: 2px;
  }

  .toolbar.mobile {
    border-radius: 6px;
    padding: 1px;
  }

  .dark .toolbar {
    background: rgba(255,255,255,0.05);
  }

  .toolbar-scroll {
    display: flex;
    gap: 1px;
    overflow-x: auto;
    padding: 2px;
    -webkit-overflow-scrolling: touch;
  }

  .toolbar-scroll::-webkit-scrollbar {
    height: 3px;
  }

  .toolbar-scroll::-webkit-scrollbar-thumb {
    background: rgba(80,66,125,0.2);
    border-radius: 2px;
  }

  .tool-item {
    min-width: 36px;
    padding: 2px 4px;
    border: 2px solid transparent;
    border-radius: 4px;
    background: rgba(255,255,255,0.5);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .tool-item.mobile {
    min-width: 30px;
    padding: 1px 2px;
    border-radius: 3px;
  }

  .dark .tool-item {
    background: rgba(255,255,255,0.05);
  }

  .tool-item.active {
    border-color: #722fc0;
    background: rgba(114,47,192,0.1);
  }

  .dark .tool-item.active {
    border-color: #a69dd4;
    background: rgba(166,157,212,0.15);
  }

  .tool-item:hover {
    background: rgba(80,66,125,0.06);
  }

  .dark .tool-item:hover {
    background: rgba(217,200,251,0.06);
  }

  .tool-preview {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }

  .tool-preview.mobile {
    width: 20px;
    height: 20px;
  }

  .wall-preview-svg {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wall-preview-svg svg {
    width: 100% !important;
    height: 100% !important;
    max-width: 100%;
    max-height: 100%;
    display: block;
  }

  .empty-preview {
    font-size: 12px;
    color: rgba(80,66,125,0.3);
  }

  .tool-label {
    font-size: 7px;
    font-weight: 600;
    color: #50427d;
  }

  .tool-label.mobile {
    font-size: 6px;
  }

  .dark .tool-label {
    color: #d9c8fb;
  }
</style>