<!-- src/components/WallSVG.svelte -->
<script>
  import { getWallSVG } from '../lib/engine/WallSVGs.js';
  import { isDarkMode } from '../lib/stores/gameStore.svelte.js';

  let {
    wallType,
    cellSize = 40,
    layer = 'top',
    className = '',
    gridX = 0,
    gridY = 0,
  } = $props();

  let wallSize = cellSize;
  let positionX = gridX * cellSize;
  let positionY = gridY * cellSize;

  // $isDarkMode — РЕАКТИВНОЕ значение (а не store-объект)
  let svgContent = $derived(getWallSVG(wallType, $isDarkMode, wallSize));

  let containerStyle = $derived(`
    width: ${wallSize}px;
    height: ${wallSize}px;
    left: ${positionX}px;
    top: ${positionY}px;
  `);

  let classes = $derived(`wall-svg ${className} ${$isDarkMode ? 'dark' : ''} layer-${layer}`);
</script>

<div class={classes} style={containerStyle}>
  {#if wallType && wallType !== 'N' && svgContent}
    {@html svgContent}
  {/if}
</div>

<style>
  .wall-svg {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    overflow: visible;
    z-index: 1;
  }

  .wall-svg svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .wall-svg.dark svg {
    filter: brightness(0.9);
  }

  .wall-svg.layer-bottom {
    z-index: 3;
  }

  .wall-svg.layer-top {
    z-index: 5;
  }
</style>