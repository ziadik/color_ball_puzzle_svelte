<!-- src/components/Cell.svelte - Simplified (optional) -->
<script>
  import { colorToCss } from '../lib/models/GameColor.js';
  import { isDarkMode } from '../lib/stores/gameStore.svelte.js';

  let { 
    cellSize, 
    item = null,
    showHint = false
  } = $props();

  let isDark = false;
  isDarkMode.subscribe(value => isDark = value);
  
  let isBall = $derived(item && item.type === 'ball');
  let isHole = $derived(item && item.type === 'hole');
</script>

<div
  class="cell"
  class:ball={isBall}
  class:hole={isHole}
  class:hint={showHint}
  class:dark={isDark}
  style="width: {cellSize}px; height: {cellSize}px;"
>
  {#if isHole}
    <div 
      class="hole"
      style="border-color: {colorToCss(item.color, isDark)}; width: {cellSize }px; height: {cellSize }px;"
    >
      <div class="hole-inner"></div>
    </div>
  {/if}

  {#if isBall}
    <div 
      class="ball"
      style="background: {colorToCss(item.color, isDark)}; width: {cellSize}px; height: {cellSize }px;"
    >
      <div class="ball-highlight"></div>
    </div>
  {/if}
</div>

<style>
  .cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: transparent;
    z-index: 0;
    overflow: visible;
    pointer-events: none;
  }

  .hole {
    position: relative;
    border-radius: 12%;
    border: 3px solid;
    background: rgba(0, 0, 0, 0.08);
    opacity: 0.7;
    flex-shrink: 0;
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

  .ball {
    position: relative;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.15s ease;
    flex-shrink: 0;
  }

  .ball-highlight {
    position: absolute;
    top: 15%;
    left: 20%;
    width: 25%;
    height: 20%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
  }

  .hint .ball {
    animation: pulse 0.6s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
</style>