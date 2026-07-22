<!-- src/components/WallTypesDemo.svelte -->
<script>
  import { isDarkMode } from '../lib/stores/gameStore.svelte.js';
  import WallSVG from './WallSVG.svelte';

  let isDark = false;
  isDarkMode.subscribe(value => isDark = value);

  // All wall types with descriptions
  const wallTypes = [
    { type: 'T', name: 'Top Wall', description: 'Horizontal wall at top of cell' },
    { type: 'L', name: 'Left Wall', description: 'Vertical wall on left side' },
    { type: 'R', name: 'Right Wall', description: 'Vertical wall on right side' },
    { type: 'D', name: 'Down Wall', description: 'Horizontal wall at bottom of cell' },
    { type: 'B', name: 'Block', description: 'Full solid block' },
    { type: 'LIT', name: 'Top Left Inner Corner', description: 'Inner corner at top-left' },
    { type: 'RIT', name: 'Top Right Inner Corner', description: 'Inner corner at top-right' },
    { type: 'LOT', name: 'Top Left Outer Corner', description: 'Outer corner at top-left' },
    { type: 'ROT', name: 'Top Right Outer Corner', description: 'Outer corner at top-right' },
    { type: 'LID', name: 'Bottom Left Inner Corner', description: 'Inner corner at bottom-left' },
    { type: 'RID', name: 'Bottom Right Inner Corner', description: 'Inner corner at bottom-right' },
    { type: 'LOD', name: 'Bottom Left Outer Corner', description: 'Outer corner at bottom-left' },
    { type: 'ROD', name: 'Bottom Right Outer Corner', description: 'Outer corner at bottom-right' },
    { type: 'LB', name: 'Left Bridge', description: 'Bridge wall on left side' },
    { type: 'RB', name: 'Right Bridge', description: 'Bridge wall on right side' },
  ];

  // Group wall types by category
  const categories = {
    'Straight Walls': ['T', 'L', 'R', 'D'],
    'Blocks': ['B'],
    'Inner Corners': ['LIT', 'RIT', 'LID', 'RID'],
    'Outer Corners': ['LOT', 'ROT', 'LOD', 'ROD'],
    'Bridges': ['LB', 'RB'],
  };

  function getCategory(type) {
    for (const [category, types] of Object.entries(categories)) {
      if (types.includes(type)) return category;
    }
    return 'Other';
  }

  let selectedCategory = 'All';
  let categoriesList = ['All', ...Object.keys(categories)];
  let searchTerm = '';

  $: filteredTypes = wallTypes.filter(wt => {
    const matchesCategory = selectedCategory === 'All' || getCategory(wt.type) === selectedCategory;
    const matchesSearch = wt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wt.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
</script>

<div class="demo-container" class:dark={isDark}>
  <div class="demo-header">
    <h1>Wall Types Reference</h1>
    <p class="subtitle">All available wall types for level design</p>
  </div>

  <!-- Controls -->
  <div class="controls">
    <div class="search-box">
      <input 
        type="text" 
        placeholder="Search walls..." 
        bind:value={searchTerm}
        class="search-input"
      />
    </div>
    
    <div class="category-filter">
      {#each categoriesList as category}
        <button 
          class="category-btn"
          class:active={selectedCategory === category}
          on:click={() => selectedCategory = category}
        >
          {category}
        </button>
      {/each}
    </div>
  </div>

  <!-- Wall Types Grid -->
  <div class="wall-grid">
    {#each filteredTypes as wallType}
      <div class="wall-card" class:dark={isDark}>
        <div class="wall-preview">
          <div class="preview-cell">
            <div class="cell-border">
              <WallSVG 
                wallType={wallType.type}
                cellSize={60}
                wallSize={78}
                layer="top"
              />
            </div>
          </div>
          <div class="wall-label">{wallType.type}</div>
        </div>
        
        <div class="wall-info">
          <h3>{wallType.name}</h3>
          <p>{wallType.description}</p>
          <span class="wall-category">{getCategory(wallType.type)}</span>
        </div>
        
        <button 
          class="copy-btn"
          on:click={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(wallType.type);
            }
          }}
          title="Copy wall type"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
    {/each}
  </div>

  <!-- Legend -->
  <div class="legend" class:dark={isDark}>
    <h3>Color Legend</h3>
    <div class="legend-items">
      <div class="legend-item">
        <div class="color-swatch" style="background: {isDark ? '#4a3a6a' : '#f8f4ff'}"></div>
        <span>Light Layer (Top/Front)</span>
      </div>
      <div class="legend-item">
        <div class="color-swatch" style="background: {isDark ? '#a69dd4' : '#8888b6'}"></div>
        <span>Accent Layer (Middle)</span>
      </div>
      <div class="legend-item">
        <div class="color-swatch" style="background: {isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.2)'}"></div>
        <span>Shadow Layer (Bottom/Back)</span>
      </div>
    </div>
  </div>

  <!-- Level Data Format Example -->
  <div class="example" class:dark={isDark}>
    <h3>How to Use in Level Data</h3>
    <pre><code>{`// In your level walls array:
walls: [
  "B B B B B B B",
  "B LIT T T T RIT B",
  "B LID D D LOD R B",
  "B B B B L R B",
  "B B B B L R B",
  "B B B B LID RID B",
  "B B B B B B B",
]`}</code></pre>
  </div>
</div>

<style>
  .demo-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f4ff;
    border-radius: 16px;
    transition: background 0.3s ease;
  }

  .demo-container.dark {
    background: #2d234b;
    color: #d9c8fb;
  }

  .demo-header {
    margin-bottom: 24px;
  }

  .demo-header h1 {
    font-size: 28px;
    margin: 0 0 4px;
    color: #50427D;
  }

  .demo-container.dark .demo-header h1 {
    color: #d9c8fb;
  }

  .subtitle {
    color: #888;
    margin: 0;
    font-size: 14px;
  }

  .demo-container.dark .subtitle {
    color: rgba(217, 200, 251, 0.6);
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .search-box {
    width: 100%;
  }

  .search-input {
    width: 100%;
    padding: 10px 16px;
    border: 2px solid rgba(80, 66, 125, 0.2);
    border-radius: 10px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
  }

  .demo-container.dark .search-input {
    background: rgba(45, 35, 75, 0.5);
    border-color: rgba(217, 200, 251, 0.2);
    color: #d9c8fb;
  }

  .search-input:focus {
    outline: none;
    border-color: #722FC0;
    box-shadow: 0 0 0 3px rgba(114, 47, 192, 0.1);
  }

  .category-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .category-btn {
    padding: 6px 14px;
    border: 2px solid rgba(80, 66, 125, 0.15);
    border-radius: 20px;
    background: transparent;
    color: #50427D;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .demo-container.dark .category-btn {
    color: #d9c8fb;
    border-color: rgba(217, 200, 251, 0.15);
  }

  .category-btn:hover {
    background: rgba(80, 66, 125, 0.08);
  }

  .demo-container.dark .category-btn:hover {
    background: rgba(217, 200, 251, 0.08);
  }

  .category-btn.active {
    background: #722FC0;
    color: white;
    border-color: #722FC0;
  }

  .demo-container.dark .category-btn.active {
    background: #8F5CEC;
    border-color: #8F5CEC;
  }

  .wall-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .wall-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    border: 1px solid rgba(80, 66, 125, 0.08);
    transition: all 0.2s ease;
    position: relative;
  }

  .wall-card.dark {
    background: rgba(45, 35, 75, 0.6);
    border-color: rgba(217, 200, 251, 0.08);
  }

  .wall-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .wall-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 12px;
  }

  .preview-cell {
    width: 90px;
    height: 90px;
    padding: 10px;
    background: #50427D;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .demo-container.dark .preview-cell {
    background: #3d2f5a;
  }

  .cell-border {
    width: 78px;
    height: 78px;
    position: relative;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow: visible;
  }

  .cell-border :global(.wall-svg) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .wall-label {
    margin-top: 8px;
    font-family: 'Courier New', monospace;
    font-size: 18px;
    font-weight: 700;
    color: #50427D;
    background: rgba(80, 66, 125, 0.08);
    padding: 2px 12px;
    border-radius: 6px;
  }

  .demo-container.dark .wall-label {
    color: #d9c8fb;
    background: rgba(217, 200, 251, 0.08);
  }

  .wall-info {
    text-align: center;
    width: 100%;
  }

  .wall-info h3 {
    font-size: 14px;
    margin: 0 0 4px;
    color: #50427D;
  }

  .demo-container.dark .wall-info h3 {
    color: #d9c8fb;
  }

  .wall-info p {
    font-size: 12px;
    color: #888;
    margin: 0 0 8px;
  }

  .demo-container.dark .wall-info p {
    color: rgba(217, 200, 251, 0.6);
  }

  .wall-category {
    font-size: 10px;
    font-weight: 600;
    color: #722FC0;
    background: rgba(114, 47, 192, 0.1);
    padding: 2px 10px;
    border-radius: 12px;
  }

  .demo-container.dark .wall-category {
    color: #a69dd4;
    background: rgba(166, 157, 212, 0.1);
  }

  .copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: rgba(80, 66, 125, 0.06);
    color: #50427D;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0.5;
  }

  .copy-btn:hover {
    background: rgba(80, 66, 125, 0.12);
    opacity: 1;
  }

  .demo-container.dark .copy-btn {
    color: #d9c8fb;
    background: rgba(217, 200, 251, 0.06);
  }

  .demo-container.dark .copy-btn:hover {
    background: rgba(217, 200, 251, 0.12);
  }

  .legend {
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 12px;
    margin-bottom: 24px;
  }

  .legend.dark {
    background: rgba(45, 35, 75, 0.4);
  }

  .legend h3 {
    font-size: 14px;
    margin: 0 0 12px;
    color: #50427D;
  }

  .demo-container.dark .legend h3 {
    color: #d9c8fb;
  }

  .legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #666;
  }

  .demo-container.dark .legend-item {
    color: rgba(217, 200, 251, 0.7);
  }

  .color-swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .example {
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 12px;
  }

  .example.dark {
    background: rgba(255, 255, 255, 0.04);
  }

  .example h3 {
    font-size: 14px;
    margin: 0 0 8px;
    color: #50427D;
  }

  .demo-container.dark .example h3 {
    color: #d9c8fb;
  }

  .example pre {
    margin: 0;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    overflow-x: auto;
    font-size: 12px;
  }

  .demo-container.dark .example pre {
    background: rgba(0, 0, 0, 0.2);
  }

  .example code {
    font-family: 'Courier New', monospace;
    color: #50427D;
  }

  .demo-container.dark .example code {
    color: #d9c8fb;
  }

  @media (max-width: 600px) {
    .demo-container {
      padding: 12px;
    }
    
    .wall-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .preview-cell {
      width: 70px;
      height: 70px;
      padding: 6px;
    }

    .cell-border {
      width: 60px;
      height: 60px;
    }

    .category-btn {
      font-size: 10px;
      padding: 4px 10px;
    }

    .demo-header h1 {
      font-size: 20px;
    }
  }
</style>