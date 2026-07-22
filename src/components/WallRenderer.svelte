<!-- src/components/WallRenderer.svelte -->
<script>
  import { WallPainter } from '../lib/engine/WallPainter.js';
  import { isDarkMode } from '../lib/stores/gameStore.svelte.js';

  let { wallType, size = 40, className = '' } = $props();
  
  let isDark = false;
  isDarkMode.subscribe(value => isDark = value);
  
  let canvas = $state(null);
  let ctx = $state(null);

  // Compute classes
  let wallClasses = $derived(`wall-renderer ${className} ${isDark ? 'dark' : ''}`);

  function drawWall() {
    if (!canvas || !wallType || wallType === 'N') return;
    
    const dpr = window.devicePixelRatio || 1;
    const actualSize = size * dpr;
    
    canvas.width = actualSize;
    canvas.height = actualSize;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // DEBUG: Draw a visible background to confirm canvas is working
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.fillRect(0, 0, size, size);
    
    const colors = {
      light: isDark ? '#5a4a7a' : '#f8f4ff',
      accent: isDark ? '#a69dd4' : '#8888b6',
      shadow: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.2)',
      border: isDark ? 'rgba(166,157,212,0.3)' : 'rgba(136,136,182,0.3)',
    };
    
    // DEBUG: Draw wall type text
    ctx.fillStyle = isDark ? '#ffffff' : '#000000';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(wallType, size / 2, size / 2);
    
    // Get wall style
    let style = WallPainter.getWallStyles(wallType, isDark);
    if (!style) {
      // DEBUG: Draw a colored rectangle if no style
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(0, 0, size, size);
      return;
    }
    
    const drawLayer = (layer, flipX = false) => {
      ctx.save();
      
      if (flipX) {
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
      }
      
      if (layer.type === 'fill') {
        const { top, left, width, height } = layer.rect;
        ctx.fillStyle = layer.color;
        ctx.fillRect(left * size, top * size, width * size, height * size);
      } else if (layer.type === 'path') {
        ctx.beginPath();
        
        const points = layer.points || [];
        const lineTo = layer.lineTo || [];
        const curve = layer.curve || [];
        const curveTo = layer.curveTo || [];
        
        if (points.length > 0) {
          ctx.moveTo(points[0].x * size, points[0].y * size);
        }
        
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x * size, points[i].y * size);
        }
        
        for (const pt of lineTo) {
          ctx.lineTo(pt.x * size, pt.y * size);
        }
        
        for (const c of curve) {
          if (c.cp1 && c.cp2) {
            ctx.bezierCurveTo(
              c.cp1.x * size, c.cp1.y * size,
              c.cp2.x * size, c.cp2.y * size,
              c.x * size, c.y * size
            );
          }
        }
        
        for (const c of curveTo) {
          if (c.cp1 && c.cp2) {
            ctx.bezierCurveTo(
              c.cp1.x * size, c.cp1.y * size,
              c.cp2.x * size, c.cp2.y * size,
              c.x * size, c.y * size
            );
          }
        }
        
        if (layer.close) {
          ctx.closePath();
        }
        
        ctx.fillStyle = layer.color;
        ctx.fill();
      }
      
      ctx.restore();
    };
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw layers
    for (const layer of style.layers) {
      drawLayer(layer, style.flipX || false);
    }
    
    // Draw border
    if (style.border) {
      ctx.save();
      ctx.strokeStyle = style.border.color;
      ctx.lineWidth = style.border.width;
      ctx.strokeRect(0, 0, size, size);
      ctx.restore();
    }
  }

  // Draw on mount and when dependencies change
  $effect(() => {
    drawWall();
  });

  // Redraw on size change
  $effect(() => {
    if (size) {
      drawWall();
    }
  });

  // Redraw on dark mode change
  $effect(() => {
    const unsubscribe = isDarkMode.subscribe(() => {
      drawWall();
    });
    return unsubscribe;
  });
</script>

<div class={wallClasses}>
  {#if wallType && wallType !== 'N'}
    <canvas bind:this={canvas} />
  {/if}
</div>

<style>
  .wall-renderer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1;
    overflow: visible;
  }

  .wall-renderer.dark canvas {
    filter: brightness(0.9);
  }

  .wall-renderer canvas {
    display: block;
    image-rendering: pixelated;
    width: 100%;
    height: 100%;
  }
</style>