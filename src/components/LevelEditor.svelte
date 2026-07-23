<!-- src/components/LevelEditor.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { levels } from '../lib/data/levels.js';
  import { isDarkMode } from '../lib/stores/gameStore.svelte.js';
  import GameBoard from './GameBoard.svelte';
  import { getWallSVG } from '../lib/engine/WallSVGs.js';

  // --- Состояние редактора ---
  let isDark = false;
  isDarkMode.subscribe(value => isDark = value);

  // Текущий редактируемый уровень
  let currentLevelIndex = 0;
  let wallsGrid = $state([]);
  let objectsGrid = $state([]);
  let gridWidth = 0;
  let gridHeight = 0;

  // Состояние редактирования
  let selectedTool = $state('wall');
  let selectedColor = $state(1);
  let selectedWallType = $state('L');
  let cellSize = $state(40);
  let showGrid = $state(true);
  let showCoords = $state(false);
  let hoveredCell = $state(null);
  let isErasing = $state(false);

  // Режимы отображения
  let viewMode = $state('edit');
  let showJsonModal = $state(false);
  let showLayerPanel = $state(true);
  let previewContainerWidth = $state(400);
  let previewContainerHeight = $state(400);
  let previewContainer = $state(null);

  // История для Undo/Redo
  let history = $state([]);
  let historyIndex = $state(-1);
  const MAX_HISTORY = 50;

  // Список доступных типов стен
  const wallTypes = [
    { key: 'L', type: 'L' },
    { key: 'R', type: 'R' },
    { key: 'T', type: 'T' },
    { key: 'D', type: 'D' },
    { key: 'LIT', type: 'LIT' },
    { key: 'RIT', type: 'RIT' },
    { key: 'LID', type: 'LID' },
    { key: 'RID', type: 'RID' },
    { key: 'LOT', type: 'LOT' },
    { key: 'ROT', type: 'ROT' },
    { key: 'LOD', type: 'LOD' },
    { key: 'ROD', type: 'ROD' },
    { key: 'LB', type: 'LB' },
    { key: 'RB', type: 'RB' },
    { key: 'B', type: 'B' },
    { key: 'N', type: 'N' },
  ];

  const colorMap = {
    1: { name: 'Green', hex: '#34C759', emoji: '🟢' },
    2: { name: 'Red', hex: '#FF3B30', emoji: '🔴' },
    3: { name: 'Blue', hex: '#007AFF', emoji: '🔵' },
    4: { name: 'Yellow', hex: '#FFCC00', emoji: '🟡' },
    5: { name: 'Purple', hex: '#AF52DE', emoji: '🟣' },
    6: { name: 'Cyan', hex: '#32ADE6', emoji: '🔷' },
  };

  // --- Инициализация ---
  onMount(() => {
    loadLevel(0);
    window.addEventListener('keydown', handleKeyDown);
    updatePreviewSize();
    window.addEventListener('resize', updatePreviewSize);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', updatePreviewSize);
  });

  function updatePreviewSize() {
    if (previewContainer) {
      const rect = previewContainer.getBoundingClientRect();
      previewContainerWidth = rect.width - 40 || 400;
      previewContainerHeight = rect.height - 40 || 400;
    }
  }

  function loadLevel(index) {
    if (index < 0 || index >= levels.length) {
      index = 0;
    }
    currentLevelIndex = index;
    const data = levels[index];
    
    const wallRows = data.walls || [];
    const height = wallRows.length;
    const width = wallRows[0]?.split(' ').length || 0;

    wallsGrid = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      const wallRow = wallRows[y]?.split(' ') || [];
      for (let x = 0; x < width; x++) {
        row.push(wallRow[x] || 'N');
      }
      wallsGrid.push(row);
    }

    const objRows = data.objects || [];
    const objHeight = objRows.length;
    const objWidth = objRows[0]?.split(' ').length || 0;

    objectsGrid = [];
    for (let y = 0; y < objHeight; y++) {
      const row = [];
      const objRow = objRows[y]?.split(' ') || [];
      for (let x = 0; x < objWidth; x++) {
        row.push(parseInt(objRow[x]) || 0);
      }
      objectsGrid.push(row);
    }

    if (objHeight === 0) {
      objectsGrid = [];
      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          row.push(0);
        }
        objectsGrid.push(row);
      }
    }

    gridWidth = width;
    gridHeight = height;
    saveHistory();
  }

  function saveHistory() {
    const snapshot = {
      walls: wallsGrid.map(row => [...row]),
      objects: objectsGrid.map(row => [...row]),
      width: gridWidth,
      height: gridHeight,
    };
    history = history.slice(0, historyIndex + 1);
    history.push(snapshot);
    if (history.length > MAX_HISTORY) {
      history.shift();
    }
    historyIndex = history.length - 1;
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      restoreHistory(history[historyIndex]);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      restoreHistory(history[historyIndex]);
    }
  }

  function restoreHistory(snapshot) {
    wallsGrid = snapshot.walls.map(row => [...row]);
    objectsGrid = snapshot.objects.map(row => [...row]);
    gridWidth = snapshot.width;
    gridHeight = snapshot.height;
  }

  function handleKeyDown(e) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }
    if (e.key === '1') { selectedTool = 'wall'; isErasing = false; }
    if (e.key === '2') { selectedTool = 'ball'; isErasing = false; }
    if (e.key === '3') { selectedTool = 'hole'; isErasing = false; }
    if (e.key === '4') { selectedTool = 'block'; isErasing = false; }
    if (e.key === '5') { isErasing = !isErasing; }
    if (e.key === 'j') { showJsonModal = !showJsonModal; }
    if (e.key === 'l') { showLayerPanel = !showLayerPanel; }
  }

  // --- Взаимодействие с сеткой ---
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

  function handlePointerDown(e) {
    if (e.button !== 0) return;
    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell) {
      editCell(cell.col, cell.row);
    }
  }

  function handlePointerMove(e) {
    const cell = getCellFromPosition(e.clientX, e.clientY);
    hoveredCell = cell;
    if (e.buttons === 1 && cell) {
      editCell(cell.col, cell.row);
    }
  }

  function handlePointerLeave() {
    hoveredCell = null;
  }

  function editCell(col, row) {
    if (isErasing) {
      wallsGrid[row][col] = 'N';
      if (row < objectsGrid.length && col < objectsGrid[row].length) {
        objectsGrid[row][col] = 0;
      }
    } else if (selectedTool === 'wall') {
      wallsGrid[row][col] = selectedWallType;
    } else if (selectedTool === 'ball') {
      ensureObjectSize(row, col);
      objectsGrid[row][col] = selectedColor + 1;
    } else if (selectedTool === 'hole') {
      ensureObjectSize(row, col);
      objectsGrid[row][col] = selectedColor * 11 + 11;
    } else if (selectedTool === 'block') {
      ensureObjectSize(row, col);
      objectsGrid[row][col] = 1;
    }
    saveHistory();
  }

  function ensureObjectSize(row, col) {
    while (objectsGrid.length <= row) {
      objectsGrid.push([]);
    }
    while (objectsGrid[row].length <= col) {
      objectsGrid[row].push(0);
    }
  }

  // --- Получение JSON уровня ---
  function getLevelJson() {
    const wallStrings = wallsGrid.map(row => row.join(' '));
    const objStrings = objectsGrid.map(row => row.join(' '));

    return {
      walls: wallStrings,
      objects: objStrings,
    };
  }

  function getPrettyJson() {
    return JSON.stringify(getLevelJson(), null, 2);
  }

  // --- Экспорт/Импорт ---
  function exportMap() {
    const json = getPrettyJson();
    navigator.clipboard?.writeText(json).then(() => {
      alert('Map exported to clipboard!');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = json;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Map exported to clipboard!');
    });
  }

  function importMap() {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.top = '50%';
    textarea.style.left = '50%';
    textarea.style.transform = 'translate(-50%, -50%)';
    textarea.style.width = '500px';
    textarea.style.height = '300px';
    textarea.style.zIndex = '9999';
    textarea.style.padding = '12px';
    textarea.style.fontFamily = 'monospace';
    textarea.style.fontSize = '12px';
    textarea.placeholder = 'Paste map JSON here...';
    document.body.appendChild(textarea);

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '9998';
    overlay.onclick = () => {
      document.body.removeChild(textarea);
      document.body.removeChild(overlay);
    };
    document.body.appendChild(overlay);

    textarea.focus();
    textarea.onkeydown = (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        try {
          const data = JSON.parse(textarea.value);
          if (data.walls && data.objects) {
            parseImportedMap(data);
            document.body.removeChild(textarea);
            document.body.removeChild(overlay);
            alert('Map imported successfully!');
          }
        } catch (err) {
          alert('Invalid JSON format');
        }
      }
      if (e.key === 'Escape') {
        document.body.removeChild(textarea);
        document.body.removeChild(overlay);
      }
    };
  }

  function parseImportedMap(data) {
    const wallRows = data.walls;
    const objRows = data.objects;
    
    const height = wallRows.length;
    const width = wallRows[0]?.split(' ').length || 0;

    wallsGrid = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      const wallRow = wallRows[y]?.split(' ') || [];
      for (let x = 0; x < width; x++) {
        row.push(wallRow[x] || 'N');
      }
      wallsGrid.push(row);
    }

    objectsGrid = [];
    for (let y = 0; y < objRows.length; y++) {
      const row = [];
      const objRow = objRows[y]?.split(' ') || [];
      for (let x = 0; x < objRow.length; x++) {
        row.push(parseInt(objRow[x]) || 0);
      }
      objectsGrid.push(row);
    }

    gridWidth = width;
    gridHeight = height;
    saveHistory();
  }

  // --- Загрузка готовых уровней ---
  function loadPresetMap() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = isDark ? '#2d234b' : '#ffffff';
    modal.style.borderRadius = '16px';
    modal.style.padding = '24px';
    modal.style.zIndex = '9999';
    modal.style.maxWidth = '400px';
    modal.style.maxHeight = '80vh';
    modal.style.overflow = 'auto';
    modal.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';

    const title = document.createElement('h3');
    title.textContent = '📚 Load Preset Map';
    title.style.color = isDark ? '#d9c8fb' : '#50427d';
    title.style.marginBottom = '16px';
    modal.appendChild(title);

    const list = document.createElement('div');
    levels.forEach((level, index) => {
      const item = document.createElement('div');
      item.style.padding = '8px 12px';
      item.style.margin = '4px 0';
      item.style.borderRadius = '8px';
      item.style.cursor = 'pointer';
      item.style.color = isDark ? '#d9c8fb' : '#50427d';
      item.style.background = isDark ? 'rgba(217,200,251,0.05)' : 'rgba(80,66,125,0.05)';
      const wallSize = level.walls.length;
      const objSize = level.objects?.length || 0;
      item.textContent = `Level ${index + 1} (walls: ${wallSize}×${level.walls[0]?.split(' ').length || 0}, objects: ${objSize}×${level.objects?.[0]?.split(' ').length || 0})`;
      item.onmouseover = () => {
        item.style.background = isDark ? 'rgba(217,200,251,0.1)' : 'rgba(80,66,125,0.1)';
      };
      item.onmouseout = () => {
        item.style.background = isDark ? 'rgba(217,200,251,0.05)' : 'rgba(80,66,125,0.05)';
      };
      item.onclick = () => {
        loadLevel(index);
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
      };
      list.appendChild(item);
    });
    modal.appendChild(list);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancel';
    closeBtn.style.marginTop = '16px';
    closeBtn.style.padding = '10px 20px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.background = isDark ? 'rgba(217,200,251,0.08)' : 'rgba(80,66,125,0.08)';
    closeBtn.style.color = isDark ? '#d9c8fb' : '#50427d';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.width = '100%';
    closeBtn.onclick = () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    };
    modal.appendChild(closeBtn);

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '9998';
    overlay.onclick = () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    };

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  }

  // --- Управление сеткой ---
  function changeGridSize() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = isDark ? '#2d234b' : '#ffffff';
    modal.style.borderRadius = '16px';
    modal.style.padding = '24px';
    modal.style.zIndex = '9999';
    modal.style.maxWidth = '400px';
    modal.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';

    const title = document.createElement('h3');
    title.textContent = '📐 Grid Size';
    title.style.color = isDark ? '#d9c8fb' : '#50427d';
    title.style.marginBottom = '16px';
    modal.appendChild(title);

    const sizeContainer = document.createElement('div');
    sizeContainer.style.display = 'flex';
    sizeContainer.style.gap = '12px';
    sizeContainer.style.marginBottom = '16px';

    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.value = gridWidth;
    widthInput.min = 5;
    widthInput.max = 20;
    widthInput.style.flex = '1';
    widthInput.style.padding = '8px';
    widthInput.style.borderRadius = '6px';
    widthInput.style.border = '1px solid rgba(80,66,125,0.2)';
    widthInput.style.background = isDark ? '#363344' : '#ffffff';
    widthInput.style.color = isDark ? '#d9c8fb' : '#50427d';
    sizeContainer.appendChild(widthInput);

    const xLabel = document.createElement('span');
    xLabel.textContent = '×';
    xLabel.style.display = 'flex';
    xLabel.style.alignItems = 'center';
    xLabel.style.color = isDark ? '#d9c8fb' : '#50427d';
    sizeContainer.appendChild(xLabel);

    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.value = gridHeight;
    heightInput.min = 5;
    heightInput.max = 20;
    heightInput.style.flex = '1';
    heightInput.style.padding = '8px';
    heightInput.style.borderRadius = '6px';
    heightInput.style.border = '1px solid rgba(80,66,125,0.2)';
    heightInput.style.background = isDark ? '#363344' : '#ffffff';
    heightInput.style.color = isDark ? '#d9c8fb' : '#50427d';
    sizeContainer.appendChild(heightInput);
    modal.appendChild(sizeContainer);

    const presets = [
      [13, 13], [8, 12], [12, 8], [10, 15], [5, 7], [20, 20]
    ];
    const presetContainer = document.createElement('div');
    presetContainer.style.display = 'flex';
    presetContainer.style.flexWrap = 'wrap';
    presetContainer.style.gap = '8px';
    presetContainer.style.marginBottom = '16px';

    presets.forEach(([w, h]) => {
      const btn = document.createElement('button');
      btn.textContent = `${w}×${h}`;
      btn.style.padding = '4px 12px';
      btn.style.borderRadius = '4px';
      btn.style.border = '1px solid rgba(80,66,125,0.2)';
      btn.style.background = 'transparent';
      btn.style.color = isDark ? '#d9c8fb' : '#50427d';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        widthInput.value = w;
        heightInput.value = h;
      };
      presetContainer.appendChild(btn);
    });
    modal.appendChild(presetContainer);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '8px';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.flex = '1';
    cancelBtn.style.padding = '10px';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '8px';
    cancelBtn.style.background = isDark ? 'rgba(217,200,251,0.08)' : 'rgba(80,66,125,0.08)';
    cancelBtn.style.color = isDark ? '#d9c8fb' : '#50427d';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    };
    buttonContainer.appendChild(cancelBtn);

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    applyBtn.style.flex = '1';
    applyBtn.style.padding = '10px';
    applyBtn.style.border = 'none';
    applyBtn.style.borderRadius = '8px';
    applyBtn.style.background = 'linear-gradient(135deg, #722FC0, #8F5CEC)';
    applyBtn.style.color = '#ffffff';
    applyBtn.style.cursor = 'pointer';
    applyBtn.onclick = () => {
      const newWidth = parseInt(widthInput.value);
      const newHeight = parseInt(heightInput.value);
      if (newWidth >= 5 && newWidth <= 20 && newHeight >= 5 && newHeight <= 20) {
        resizeGrid(newWidth, newHeight);
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
      } else {
        alert('Size must be between 5 and 20');
      }
    };
    buttonContainer.appendChild(applyBtn);
    modal.appendChild(buttonContainer);

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '9998';

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  }

  function resizeGrid(newWidth, newHeight) {
    const oldWalls = wallsGrid;
    const oldObjects = objectsGrid;

    const newWalls = [];
    const newObjects = [];
    for (let y = 0; y < newHeight; y++) {
      const wallRow = [];
      const objRow = [];
      for (let x = 0; x < newWidth; x++) {
        if (y < oldWalls.length && x < oldWalls[y].length) {
          wallRow.push(oldWalls[y][x]);
        } else {
          wallRow.push('N');
        }
        if (y < oldObjects.length && x < oldObjects[y].length) {
          objRow.push(oldObjects[y][x]);
        } else {
          objRow.push(0);
        }
      }
      newWalls.push(wallRow);
      newObjects.push(objRow);
    }

    wallsGrid = newWalls;
    objectsGrid = newObjects;
    gridWidth = newWidth;
    gridHeight = newHeight;
    saveHistory();
  }

  function clearGrid() {
    if (confirm('Clear all walls and objects?')) {
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          wallsGrid[y][x] = 'N';
          if (y < objectsGrid.length && x < objectsGrid[y].length) {
            objectsGrid[y][x] = 0;
          }
        }
      }
      saveHistory();
    }
  }

  function togglePreview() {
    viewMode = viewMode === 'edit' ? 'preview' : 'edit';
    setTimeout(updatePreviewSize, 100);
  }

  function saveToLevelsFile() {
    const levelExport = getLevelJson();
    const updatedLevels = [...levels];
    updatedLevels[currentLevelIndex] = levelExport;

    const content = `export const levels = ${JSON.stringify(updatedLevels, null, 2)};\n\nexport const totalLevels = levels.length;`;
    const blob = new Blob([content], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'levels.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function nextLevel() {
    if (currentLevelIndex < levels.length - 1) {
      loadLevel(currentLevelIndex + 1);
    }
  }

  function prevLevel() {
    if (currentLevelIndex > 0) {
      loadLevel(currentLevelIndex - 1);
    }
  }

  function newLevel() {
    const newLevel = {
      walls: ['B B B B B', 'B N N N B', 'B N N N B', 'B N N N B', 'B B B B B'],
      objects: [
        '0 0 0 0 0',
        '0 0 0 0 0',
        '0 0 0 0 0',
        '0 0 0 0 0',
        '0 0 0 0 0'
      ]
    };
    levels.push(newLevel);
    loadLevel(levels.length - 1);
  }

  function getObjectColor(value) {
    if (value >= 2 && value <= 7) {
      return colorMap[value - 1]?.hex || '#999';
    }
    if (value >= 22 && value <= 77) {
      const color = Math.floor(value / 11);
      return colorMap[color]?.hex || '#999';
    }
    return null;
  }

  function getObjectEmoji(value) {
    if (value >= 2 && value <= 7) {
      return colorMap[value - 1]?.emoji || '⚪';
    }
    if (value >= 22 && value <= 77) {
      const color = Math.floor(value / 11);
      return colorMap[color]?.emoji || '◎';
    }
    return '';
  }

  function getWallSVGData(type) {
    const svg = getWallSVG(type, isDark, 30);
    if (!svg) return '';
    return svg;
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

  // Быстрый выбор инструментов из панели слоев
  function selectTool(tool, color) {
    selectedTool = tool;
    if (color !== undefined) {
      selectedColor = color;
    }
    isErasing = false;
  }
</script>

<div class="editor-container" class:dark={isDark}>
  <!-- Верхняя панель -->
  <div class="editor-header">
    <div class="header-left">
      <button class="icon-btn" on:click={prevLevel} disabled={currentLevelIndex === 0} title="Previous level">◀</button>
      <span class="level-info">Level {currentLevelIndex + 1} / {levels.length}</span>
      <button class="icon-btn" on:click={nextLevel} disabled={currentLevelIndex >= levels.length - 1} title="Next level">▶</button>
      <button class="icon-btn" on:click={newLevel} title="New level">➕</button>
    </div>
    <div class="header-right">
      <button class="icon-btn" on:click={loadPresetMap} title="Load preset map">📚</button>
      <button class="icon-btn" on:click={changeGridSize} title="Change grid size">📐</button>
      <button class="icon-btn" on:click={importMap} title="Import map">📥</button>
      <button class="icon-btn" on:click={exportMap} title="Export map">📤</button>
      <button class="icon-btn" on:click={() => showJsonModal = !showJsonModal} title="View JSON (J)">📄</button>
      <button class="icon-btn" on:click={saveToLevelsFile} title="Save to levels.js">💾</button>
      <button class="icon-btn" on:click={clearGrid} title="Clear grid">🧹</button>
      <button class="icon-btn" on:click={togglePreview}>{viewMode === 'edit' ? '👁️' : '✏️'}</button>
      <button class="icon-btn" on:click={() => showLayerPanel = !showLayerPanel} title="Toggle layers (L)">📋</button>
    </div>
  </div>

  <!-- Панель слоев объектов -->
  {#if showLayerPanel}
    <div class="layer-panel" class:dark={isDark}>
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
              {colorMap[color].emoji} {color}
            </button>
          {/each}
        </div>
      </div>

      <div class="layer-section">
        <div class="layer-title">🕳️ Holes</div>
        <div class="layer-items">
          {#each [1,2,3,4,5,6] as color}
            <button 
              class="layer-btn" 
              class:active={selectedTool === 'hole' && selectedColor === color}
              on:click={() => selectTool('hole', color)}
              style="border-color: {colorMap[color].hex}; color: {colorMap[color].hex};"
            >
              {colorMap[color].emoji} {color}
            </button>
          {/each}
        </div>
      </div>

      <div class="layer-section">
        <div class="layer-title">🧱 Objects</div>
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
            on:click={() => { isErasing = !isErasing; }}
          >
            🗑️ Eraser
          </button>
        </div>
      </div>

      <div class="layer-section">
        <div class="layer-title">📐 Grid Info</div>
        <div class="layer-info">
          <span>Walls: {gridWidth}×{gridHeight}</span>
          <span>Objects: {objectsGrid.length}×{objectsGrid[0]?.length || 0}</span>
          <span>Balls: {objectsGrid.flat().filter(v => v >= 2 && v <= 7).length}</span>
          <span>Holes: {objectsGrid.flat().filter(v => v >= 22 && v <= 77).length}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Панель инструментов стен -->
  <div class="toolbar">
    <div class="toolbar-scroll">
      {#each wallTypes as tool}
        <button 
          class="tool-item" 
          class:active={selectedTool === 'wall' && selectedWallType === tool.type && !isErasing}
          on:click={() => { selectedTool = 'wall'; selectedWallType = tool.type; isErasing = false; }}
          title={tool.key}
        >
          <div class="tool-preview">
            {#if tool.type !== 'N'}
              <div class="wall-preview-svg">
                {@html getWallSVGData(tool.type)}
              </div>
            {:else}
              <span class="empty-preview">∅</span>
            {/if}
          </div>
          <span class="tool-label">{tool.key}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Режим рисования/ластика -->
  <div class="mode-switch">
    <div class="mode-group">
      <span class="mode-label">Eraser</span>
      <button 
        class="mode-btn" 
        class:active={isErasing}
        on:click={() => isErasing = !isErasing}
      >
        {isErasing ? '🗑️' : '✏️'}
      </button>
      <span class="mode-label">Drawing</span>
    </div>
    <span class="grid-size-label">{gridWidth}×{gridHeight}</span>
  </div>

  <!-- Основное поле -->
  {#if viewMode === 'edit'}
    {@const gridOffsetX = cellSize / 2}
    {@const gridOffsetY = cellSize / 1.5}
    
    <div 
      class="editor-board"
      style="--cell-size: {cellSize}px; width: {gridWidth * cellSize + 8}px; height: {gridHeight * cellSize + 8}px;"
      on:mousedown={handlePointerDown}
      on:mousemove={handlePointerMove}
      on:mouseleave={handlePointerLeave}
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
            class:grid={showGrid}
            class:hover={hover}
            class:erasing={isErasing}
            style="left: {colIndex * cellSize + 4}px; top: {rowIndex * cellSize + 4}px; width: {cellSize}px; height: {cellSize}px;"
          >
            {#if wall !== 'N'}
              <div class="wall-display">
                {@html getWallSVGData(wall)}
              </div>
            {/if}

            {#if obj && obj !== 0}
              <div 
                class="object-display"
                class:ball={obj >= 2 && obj <= 7}
                class:hole={obj >= 22 && obj <= 77}
                class:block={obj === 1}
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
  {:else}
    <div class="preview-container" bind:this={previewContainer}>
      <div class="preview-wrapper">
        <GameBoard 
          preview={true}
          containerWidth={previewContainerWidth}
          containerHeight={previewContainerHeight}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          wallsGrid={wallsGrid}
          objectsGrid={objectsGrid}
        />
      </div>
    </div>
  {/if}

  <!-- JSON модальное окно -->
  {#if showJsonModal}
    <div class="json-modal-overlay" on:click={e => e.target === e.currentTarget && (showJsonModal = false)}>
      <div class="json-modal" class:dark={isDark}>
        <div class="json-header">
          <h3>📄 Level JSON</h3>
          <button class="close-btn" on:click={() => showJsonModal = false}>✕</button>
        </div>
        <div class="json-content">
          <pre>{getPrettyJson()}</pre>
        </div>
        <div class="json-actions">
          <button class="json-btn" on:click={() => {
            navigator.clipboard?.writeText(getPrettyJson());
            alert('JSON copied to clipboard!');
          }}>📋 Copy</button>
          <button class="json-btn primary" on:click={() => showJsonModal = false}>Close</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .editor-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    background: #f8f4ff;
    border-radius: 16px;
    min-height: 500px;
    transition: background 0.3s;
  }

  .editor-container.dark {
    background: #2d234b;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 6px 12px;
    background: rgba(255,255,255,0.5);
    border-radius: 12px;
    flex-wrap: wrap;
    gap: 4px;
  }

  .dark .editor-header {
    background: rgba(255,255,255,0.05);
  }

  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .level-info {
    font-weight: 600;
    color: #50427d;
    font-size: 14px;
    min-width: 80px;
    text-align: center;
  }

  .dark .level-info {
    color: #d9c8fb;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #50427d;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .dark .icon-btn {
    color: #d9c8fb;
  }

  .icon-btn:hover:not(:disabled) {
    background: rgba(80,66,125,0.08);
  }
  .dark .icon-btn:hover:not(:disabled) {
    background: rgba(217,200,251,0.08);
  }
  .icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Панель слоев */
  .layer-panel {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    width: 100%;
    padding: 8px 12px;
    background: rgba(255,255,255,0.3);
    border-radius: 10px;
    border: 1px solid rgba(80,66,125,0.1);
  }

  .dark .layer-panel {
    background: rgba(255,255,255,0.05);
    border-color: rgba(217,200,251,0.08);
  }

  .layer-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 8px;
    border-right: 1px solid rgba(80,66,125,0.1);
  }

  .dark .layer-section {
    border-right: 1px solid rgba(217,200,251,0.08);
  }

  .layer-section:last-child {
    border-right: none;
  }

  .layer-title {
    font-size: 11px;
    font-weight: 600;
    color: #50427d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dark .layer-title {
    color: #d9c8fb;
  }

  .layer-items {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .layer-btn {
    width: 36px;
    height: 36px;
    border: 2px solid transparent;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .block-btn {
    background: rgba(255,255,255,0.15);
    color: #50427d;
    width: auto;
    padding: 0 12px;
  }

  .dark .block-btn {
    color: #d9c8fb;
  }

  .eraser-btn {
    background: rgba(255,59,48,0.1);
    color: #ff3b30;
    width: auto;
    padding: 0 12px;
  }

  .eraser-btn.active {
    border-color: #ff3b30;
    background: rgba(255,59,48,0.2);
  }

  .layer-info {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: rgba(80,66,125,0.6);
    flex-wrap: wrap;
  }

  .dark .layer-info {
    color: rgba(217,200,251,0.4);
  }

  .layer-info span {
    background: rgba(80,66,125,0.06);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .dark .layer-info span {
    background: rgba(217,200,251,0.05);
  }

  /* Остальные стили */
  .toolbar {
    width: 100%;
    background: rgba(255,255,255,0.3);
    border-radius: 10px;
    padding: 4px;
  }

  .dark .toolbar {
    background: rgba(255,255,255,0.05);
  }

  .toolbar-scroll {
    display: flex;
    gap: 2px;
    overflow-x: auto;
    padding: 4px;
    -webkit-overflow-scrolling: touch;
  }

  .toolbar-scroll::-webkit-scrollbar {
    height: 4px;
  }

  .toolbar-scroll::-webkit-scrollbar-thumb {
    background: rgba(80,66,125,0.2);
    border-radius: 2px;
  }

  .tool-item {
    min-width: 50px;
    padding: 4px 6px;
    border: 2px solid transparent;
    border-radius: 6px;
    background: rgba(255,255,255,0.5);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    transition: all 0.15s;
    flex-shrink: 0;
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
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wall-preview-svg svg {
    width: 30px;
    height: 30px;
    display: block;
  }

  .empty-preview {
    font-size: 16px;
    color: rgba(80,66,125,0.3);
  }

  .tool-label {
    font-size: 8px;
    font-weight: 600;
    color: #50427d;
  }

  .dark .tool-label {
    color: #d9c8fb;
  }

  .mode-switch {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 4px 12px;
    background: rgba(255,255,255,0.2);
    border-radius: 8px;
  }

  .dark .mode-switch {
    background: rgba(255,255,255,0.03);
  }

  .mode-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mode-label {
    font-size: 12px;
    color: #50427d;
  }

  .dark .mode-label {
    color: #d9c8fb;
  }

  .mode-btn {
    width: 32px;
    height: 32px;
    border: 2px solid transparent;
    border-radius: 50%;
    background: transparent;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .mode-btn.active {
    border-color: #ff3b30;
    background: rgba(255,59,48,0.1);
  }

  .mode-btn:hover {
    background: rgba(80,66,125,0.06);
  }

  .grid-size-label {
    font-size: 14px;
    font-weight: 600;
    color: #50427d;
  }

  .dark .grid-size-label {
    color: #d9c8fb;
  }

  .editor-board {
    position: relative;
    background: #50427d;
    border-radius: 12px;
    padding: 4px;
    touch-action: none;
    user-select: none;
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
  }

  .cell.grid {
    outline: 1px solid rgba(255,255,255,0.05);
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
  }

  .wall-display svg {
    width: 100%;
    height: 100%;
  }

  .object-display {
    position: absolute;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: white;
    pointer-events: none;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  .object-display.ball {
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .object-display.hole {
    border-radius: 12%;
    border: 2px solid currentColor;
    background: rgba(0,0,0,0.15) !important;
    color: currentColor;
  }

  .object-display.block {
    background: rgba(255,255,255,0.15) !important;
    color: rgba(255,255,255,0.3);
    font-size: 14px;
  }

  .obj-label {
    font-size: 8px;
    opacity: 0.8;
  }

  .preview-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(80,66,125,0.05);
    border-radius: 12px;
    min-height: 300px;
    width: 100%;
    flex: 1;
  }

  .dark .preview-container {
    background: rgba(255,255,255,0.03);
  }

  .preview-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* JSON Modal */
  .json-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .json-modal {
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
  }

  .json-modal.dark {
    background: #2d234b;
  }

  .json-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .json-header h3 {
    color: #50427d;
    margin: 0;
  }

  .dark .json-header h3 {
    color: #d9c8fb;
  }

  .json-content {
    flex: 1;
    overflow: auto;
    background: rgba(0,0,0,0.05);
    border-radius: 8px;
    padding: 12px;
    max-height: 400px;
  }

  .dark .json-content {
    background: rgba(255,255,255,0.05);
  }

  .json-content pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 12px;
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .dark .json-content pre {
    color: #d9c8fb;
  }

  .json-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    justify-content: flex-end;
  }

  .json-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    background: rgba(80,66,125,0.08);
    color: #50427d;
  }

  .dark .json-btn {
    background: rgba(217,200,251,0.08);
    color: #d9c8fb;
  }

  .json-btn:hover {
    background: rgba(80,66,125,0.15);
  }

  .dark .json-btn:hover {
    background: rgba(217,200,251,0.15);
  }

  .json-btn.primary {
    background: linear-gradient(135deg, #722FC0, #8F5CEC);
    color: white;
  }

  .json-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(114,47,192,0.3);
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: rgba(80,66,125,0.08);
    color: #50427d;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .dark .close-btn {
    background: rgba(217,200,251,0.08);
    color: #d9c8fb;
  }

  .close-btn:hover {
    background: rgba(80,66,125,0.15);
    transform: scale(1.05);
  }

  .dark .close-btn:hover {
    background: rgba(217,200,251,0.15);
  }

  @media (max-width: 600px) {
    .editor-container {
      padding: 6px;
      gap: 4px;
    }
    .layer-panel {
      flex-direction: column;
      gap: 8px;
    }
    .layer-section {
      border-right: none;
      border-bottom: 1px solid rgba(80,66,125,0.1);
      padding-bottom: 4px;
    }
    .dark .layer-section {
      border-bottom: 1px solid rgba(217,200,251,0.08);
    }
    .layer-section:last-child {
      border-bottom: none;
    }
    .tool-item {
      min-width: 40px;
      padding: 2px 4px;
    }
    .tool-preview {
      width: 24px;
      height: 24px;
    }
    .wall-preview-svg svg {
      width: 24px;
      height: 24px;
    }
    .tool-label {
      font-size: 6px;
    }
    .icon-btn {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }
    .level-info {
      font-size: 12px;
      min-width: 60px;
    }
    .mode-label {
      font-size: 10px;
    }
    .grid-size-label {
      font-size: 12px;
    }
    .json-modal {
      padding: 16px;
      max-width: 95%;
    }
    .json-content pre {
      font-size: 10px;
    }
  }
</style>