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
    gridY = 0
  } = $props();
  
  let isDark = false;
  isDarkMode.subscribe(value => isDark = value);
  
  // Wall size equals cell size (full cell)
  let wallSize = cellSize;
  
  // Position within the grid - top-left of cell
  let positionX = gridX * cellSize;
  let positionY = gridY * cellSize;
  
  // Generate SVG content - re-renders when cellSize or isDark changes
  let svgContent = $derived(getWallSVG(wallType, isDark, wallSize));
  
  // Container style - updates when cellSize changes
  let containerStyle = $derived(`
    width: ${wallSize}px;
    height: ${wallSize}px;
    left: ${positionX}px;
    top: ${positionY}px;
  `);
  
  let classes = $derived(`wall-svg ${className} ${isDark ? 'dark' : ''} layer-${layer}`);
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