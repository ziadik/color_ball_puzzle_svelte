<!-- src/components/LevelEditor.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { levels } from '../lib/data/levels.js';
  import { isDarkMode } from '../lib/stores/gameStore.svelte.js';
  import GameBoard from './GameBoard.svelte';
  import WallToolbar from './editor/WallToolbar.svelte';
  import LayerPanel from './editor/LayerPanel.svelte';
  import GridEditor from './editor/GridEditor.svelte';
  import JsonModal from './editor/JsonModal.svelte';

  // --- Состояние редактора ---
  let isDark = false;
  isDarkMode.subscribe(value => isDark = value);

  // Текущий редактируемый уровень
  let currentLevelIndex = $state(0);
  let wallsGrid = $state([]);
  let objectsGrid = $state([]);
  let gridWidth = $state(0);
  let gridHeight = $state(0);

  // Состояние редактирования
  let selectedTool = $state('wall');
  let selectedColor = $state(1);
  let selectedWallType = $state('L');
  let cellSize = $state(40);
  let showGrid = $state(true);
  let hoveredCell = $state(null);
  let isErasing = $state(false);

  // Режимы отображения
  let viewMode = $state('edit');
  let showJsonModal = $state(false);
  let showLayerPanel = $state(true);
  let previewContainerWidth = $state(400);
  let previewContainerHeight = $state(400);
  let previewContainer = $state(null);
  
  // Мобильная оптимизация
  let isMobile = $state(false);

  // История для Undo/Redo
  let history = $state([]);
  let historyIndex = $state(-1);
  const MAX_HISTORY = 50;

  // Данные для компонентов
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
    checkMobile();
    loadLevel(0);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', checkMobile);
    updatePreviewSize();
    window.addEventListener('resize', updatePreviewSize);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', checkMobile);
    window.removeEventListener('resize', updatePreviewSize);
  });

  function checkMobile() {
    isMobile = window.innerWidth <= 768;
    if (isMobile) {
      cellSize = Math.min(cellSize, 32);
      showLayerPanel = false;
    }
  }

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

    const newWallsGrid = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      const wallRow = wallRows[y]?.split(' ') || [];
      for (let x = 0; x < width; x++) {
        row.push(wallRow[x] || 'N');
      }
      newWallsGrid.push(row);
    }

    const objRows = data.objects || [];
    const objHeight = objRows.length;
    const objWidth = objRows[0]?.split(' ').length || 0;

    const newObjectsGrid = [];
    for (let y = 0; y < objHeight; y++) {
      const row = [];
      const objRow = objRows[y]?.split(' ') || [];
      for (let x = 0; x < objWidth; x++) {
        row.push(parseInt(objRow[x]) || 0);
      }
      newObjectsGrid.push(row);
    }

    if (objHeight === 0) {
      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          row.push(0);
        }
        newObjectsGrid.push(row);
      }
    }

    wallsGrid = newWallsGrid;
    objectsGrid = newObjectsGrid;
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

  // --- Редактирование ---
  function editCell(col, row) {
    if (isErasing) {
      const newWalls = [...wallsGrid];
      newWalls[row] = [...newWalls[row]];
      newWalls[row][col] = 'N';
      wallsGrid = newWalls;
      
      if (row < objectsGrid.length && col < objectsGrid[row].length) {
        const newObjects = [...objectsGrid];
        newObjects[row] = [...newObjects[row]];
        newObjects[row][col] = 0;
        objectsGrid = newObjects;
      }
    } else if (selectedTool === 'wall') {
      const newWalls = [...wallsGrid];
      newWalls[row] = [...newWalls[row]];
      newWalls[row][col] = selectedWallType;
      wallsGrid = newWalls;
    } else if (selectedTool === 'ball') {
      ensureObjectSize(row, col);
      const newObjects = [...objectsGrid];
      newObjects[row] = [...newObjects[row]];
      newObjects[row][col] = selectedColor + 1;
      objectsGrid = newObjects;
    } else if (selectedTool === 'hole') {
      ensureObjectSize(row, col);
      const newObjects = [...objectsGrid];
      newObjects[row] = [...newObjects[row]];
      newObjects[row][col] = selectedColor * 11 + 11;
      objectsGrid = newObjects;
    } else if (selectedTool === 'block') {
      ensureObjectSize(row, col);
      const newObjects = [...objectsGrid];
      newObjects[row] = [...newObjects[row]];
      newObjects[row][col] = 1;
      objectsGrid = newObjects;
    }
    saveHistory();
  }

  function ensureObjectSize(row, col) {
    let newObjects = [...objectsGrid];
    while (newObjects.length <= row) {
      newObjects.push([]);
    }
    while (newObjects[row].length <= col) {
      newObjects[row] = [...newObjects[row], 0];
    }
    objectsGrid = newObjects;
  }

  // --- Получение JSON ---
  function getLevelJson() {
    const wallStrings = wallsGrid.map(row => row.join(' '));
    const objStrings = objectsGrid.map(row => row.join(' '));
    return { walls: wallStrings, objects: objStrings };
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
    textarea.style.width = isMobile ? '90%' : '500px';
    textarea.style.height = isMobile ? '200px' : '300px';
    textarea.style.zIndex = '9999';
    textarea.style.padding = '12px';
    textarea.style.fontFamily = 'monospace';
    textarea.style.fontSize = isMobile ? '10px' : '12px';
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

    const newWallsGrid = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      const wallRow = wallRows[y]?.split(' ') || [];
      for (let x = 0; x < width; x++) {
        row.push(wallRow[x] || 'N');
      }
      newWallsGrid.push(row);
    }

    const newObjectsGrid = [];
    for (let y = 0; y < objRows.length; y++) {
      const row = [];
      const objRow = objRows[y]?.split(' ') || [];
      for (let x = 0; x < objRow.length; x++) {
        row.push(parseInt(objRow[x]) || 0);
      }
      newObjectsGrid.push(row);
    }

    wallsGrid = newWallsGrid;
    objectsGrid = newObjectsGrid;
    gridWidth = width;
    gridHeight = height;
    saveHistory();
  }

  // --- Загрузка уровней ---
  function loadPresetMap() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = isDark ? '#2d234b' : '#ffffff';
    modal.style.borderRadius = isMobile ? '12px' : '16px';
    modal.style.padding = isMobile ? '16px' : '24px';
    modal.style.zIndex = '9999';
    modal.style.maxWidth = isMobile ? '95%' : '400px';
    modal.style.width = '100%';
    modal.style.maxHeight = '80vh';
    modal.style.overflow = 'auto';
    modal.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';

    const title = document.createElement('h3');
    title.textContent = '📚 Load Preset Map';
    title.style.color = isDark ? '#d9c8fb' : '#50427d';
    title.style.marginBottom = '16px';
    title.style.fontSize = isMobile ? '16px' : '20px';
    modal.appendChild(title);

    const list = document.createElement('div');
    levels.forEach((level, index) => {
      const item = document.createElement('div');
      item.style.padding = isMobile ? '6px 10px' : '8px 12px';
      item.style.margin = '4px 0';
      item.style.borderRadius = '8px';
      item.style.cursor = 'pointer';
      item.style.color = isDark ? '#d9c8fb' : '#50427d';
      item.style.background = isDark ? 'rgba(217,200,251,0.05)' : 'rgba(80,66,125,0.05)';
      item.style.fontSize = isMobile ? '12px' : '14px';
      item.textContent = `Level ${index + 1}`;
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
    closeBtn.style.padding = isMobile ? '8px 16px' : '10px 20px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.background = isDark ? 'rgba(217,200,251,0.08)' : 'rgba(80,66,125,0.08)';
    closeBtn.style.color = isDark ? '#d9c8fb' : '#50427d';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.width = '100%';
    closeBtn.style.fontSize = isMobile ? '14px' : '16px';
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
    modal.style.borderRadius = isMobile ? '12px' : '16px';
    modal.style.padding = isMobile ? '16px' : '24px';
    modal.style.zIndex = '9999';
    modal.style.maxWidth = isMobile ? '95%' : '400px';
    modal.style.width = '100%';
    modal.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';

    const title = document.createElement('h3');
    title.textContent = '📐 Grid Size';
    title.style.color = isDark ? '#d9c8fb' : '#50427d';
    title.style.marginBottom = '16px';
    title.style.fontSize = isMobile ? '16px' : '20px';
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
    widthInput.style.padding = isMobile ? '6px' : '8px';
    widthInput.style.borderRadius = '6px';
    widthInput.style.border = '1px solid rgba(80,66,125,0.2)';
    widthInput.style.background = isDark ? '#363344' : '#ffffff';
    widthInput.style.color = isDark ? '#d9c8fb' : '#50427d';
    widthInput.style.fontSize = isMobile ? '14px' : '16px';
    sizeContainer.appendChild(widthInput);

    const xLabel = document.createElement('span');
    xLabel.textContent = '×';
    xLabel.style.display = 'flex';
    xLabel.style.alignItems = 'center';
    xLabel.style.color = isDark ? '#d9c8fb' : '#50427d';
    xLabel.style.fontSize = isMobile ? '16px' : '18px';
    sizeContainer.appendChild(xLabel);

    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.value = gridHeight;
    heightInput.min = 5;
    heightInput.max = 20;
    heightInput.style.flex = '1';
    heightInput.style.padding = isMobile ? '6px' : '8px';
    heightInput.style.borderRadius = '6px';
    heightInput.style.border = '1px solid rgba(80,66,125,0.2)';
    heightInput.style.background = isDark ? '#363344' : '#ffffff';
    heightInput.style.color = isDark ? '#d9c8fb' : '#50427d';
    heightInput.style.fontSize = isMobile ? '14px' : '16px';
    sizeContainer.appendChild(heightInput);
    modal.appendChild(sizeContainer);

    const presets = [
      [13, 13], [8, 12], [12, 8], [10, 15], [5, 7], [20, 20]
    ];
    const presetContainer = document.createElement('div');
    presetContainer.style.display = 'flex';
    presetContainer.style.flexWrap = 'wrap';
    presetContainer.style.gap = '6px';
    presetContainer.style.marginBottom = '16px';

    presets.forEach(([w, h]) => {
      const btn = document.createElement('button');
      btn.textContent = `${w}×${h}`;
      btn.style.padding = isMobile ? '4px 8px' : '4px 12px';
      btn.style.borderRadius = '4px';
      btn.style.border = '1px solid rgba(80,66,125,0.2)';
      btn.style.background = 'transparent';
      btn.style.color = isDark ? '#d9c8fb' : '#50427d';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = isMobile ? '11px' : '13px';
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
    cancelBtn.style.padding = isMobile ? '8px' : '10px';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '8px';
    cancelBtn.style.background = isDark ? 'rgba(217,200,251,0.08)' : 'rgba(80,66,125,0.08)';
    cancelBtn.style.color = isDark ? '#d9c8fb' : '#50427d';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.fontSize = isMobile ? '14px' : '16px';
    cancelBtn.onclick = () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    };
    buttonContainer.appendChild(cancelBtn);

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    applyBtn.style.flex = '1';
    applyBtn.style.padding = isMobile ? '8px' : '10px';
    applyBtn.style.border = 'none';
    applyBtn.style.borderRadius = '8px';
    applyBtn.style.background = 'linear-gradient(135deg, #722FC0, #8F5CEC)';
    applyBtn.style.color = '#ffffff';
    applyBtn.style.cursor = 'pointer';
    applyBtn.style.fontSize = isMobile ? '14px' : '16px';
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

    const newWallsGrid = [];
    const newObjectsGrid = [];
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
      newWallsGrid.push(wallRow);
      newObjectsGrid.push(objRow);
    }

    wallsGrid = newWallsGrid;
    objectsGrid = newObjectsGrid;
    gridWidth = newWidth;
    gridHeight = newHeight;
    saveHistory();
  }

  function clearGrid() {
    if (confirm('Clear all walls and objects?')) {
      const newWallsGrid = [];
      const newObjectsGrid = [];
      for (let y = 0; y < gridHeight; y++) {
        const wallRow = [];
        const objRow = [];
        for (let x = 0; x < gridWidth; x++) {
          wallRow.push('N');
          if (y < objectsGrid.length && x < objectsGrid[y].length) {
            objRow.push(0);
          } else {
            objRow.push(0);
          }
        }
        newWallsGrid.push(wallRow);
        newObjectsGrid.push(objRow);
      }
      wallsGrid = newWallsGrid;
      objectsGrid = newObjectsGrid;
      saveHistory();
    }
  }

  function togglePreview() {
    viewMode = viewMode === 'edit' ? 'preview' : 'edit';
    setTimeout(updatePreviewSize, 100);
  }

  function toggleLayerPanel() {
    showLayerPanel = !showLayerPanel;
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

  function handleSelectTool(type) {
    selectedTool = 'wall';
    selectedWallType = type;
    isErasing = false;
  }

  function handleSelectLayerTool(tool, color) {
    if (tool === 'eraser') {
      isErasing = !isErasing;
      return;
    }
    selectedTool = tool;
    if (color !== undefined) {
      selectedColor = color;
    }
    isErasing = false;
  }
</script>

<div class="editor-container" class:dark={isDark}>
  <!-- Верхняя панель -->
  <div class="editor-header" class:mobile={isMobile}>
    <div class="header-left">
      <button class="icon-btn" on:click={prevLevel} disabled={currentLevelIndex === 0} title="Previous level">◀</button>
      <span class="level-info">L{currentLevelIndex + 1}</span>
      <button class="icon-btn" on:click={nextLevel} disabled={currentLevelIndex >= levels.length - 1} title="Next level">▶</button>
      <button class="icon-btn" on:click={newLevel} title="New level">➕</button>
    </div>
    <div class="header-right">
      <button class="icon-btn" on:click={loadPresetMap} title="Load preset map">📚</button>
      <button class="icon-btn" on:click={changeGridSize} title="Change grid size">📐</button>
      <button class="icon-btn" on:click={() => showJsonModal = !showJsonModal} title="View JSON (J)">📄</button>
      <button class="icon-btn" on:click={exportMap} title="Export">📤</button>
      <button class="icon-btn" on:click={importMap} title="Import">📥</button>
      <button class="icon-btn" on:click={saveToLevelsFile} title="Save to levels.js">💾</button>
      <button class="icon-btn" on:click={clearGrid} title="Clear grid">🧹</button>
      <button class="icon-btn" on:click={togglePreview}>{viewMode === 'edit' ? '👁️' : '✏️'}</button>
      <button class="icon-btn" on:click={toggleLayerPanel} title="Layers (L)">📋</button>
    </div>
  </div>

  <!-- Панель слоев -->
  {#if showLayerPanel}
    <LayerPanel 
      {selectedTool}
      {selectedColor}
      {isErasing}
      {gridWidth}
      {gridHeight}
      {objectsGrid}
      {isMobile}
      {isDark}
      colorMap={colorMap}
      onSelectTool={handleSelectLayerTool}
    />
  {/if}

  <!-- Панель инструментов стен -->
  <WallToolbar 
    {wallTypes}
    {selectedTool}
    {selectedWallType}
    {isErasing}
    {isMobile}
    onSelect={handleSelectTool}
  />

  <!-- Режим рисования/ластика -->
  <div class="mode-switch" class:mobile={isMobile}>
    <div class="mode-group">
      <span class="mode-label">✏️</span>
      <button 
        class="mode-btn" 
        class:active={isErasing}
        on:click={() => isErasing = !isErasing}
      >
        {isErasing ? '🗑️' : '✏️'}
      </button>
      <span class="mode-label">🗑️</span>
    </div>
    <span class="grid-size-label">{gridWidth}×{gridHeight}</span>
  </div>

  <!-- Основное поле -->
  {#if viewMode === 'edit'}
    <GridEditor 
      {wallsGrid}
      {objectsGrid}
      {gridWidth}
      {gridHeight}
      {cellSize}
      {showGrid}
      {isErasing}
      {isMobile}
      {selectedTool}
      {selectedWallType}
      {selectedColor}
      bind:hoveredCell
      onEditCell={editCell}
    />
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
  <JsonModal 
    isOpen={showJsonModal}
    json={getPrettyJson()}
    {isDark}
    {isMobile}
    onClose={() => showJsonModal = false}
  />
</div>

<style>
  .editor-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 8px;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    background: #f8f4ff;
    border-radius: 12px;
    min-height: 400px;
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
    padding: 4px 8px;
    background: rgba(255,255,255,0.5);
    border-radius: 10px;
    flex-wrap: wrap;
    gap: 2px;
  }

  .editor-header.mobile {
    padding: 2px 4px;
    gap: 1px;
    border-radius: 8px;
  }

  .dark .editor-header {
    background: rgba(255,255,255,0.05);
  }

  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-wrap: wrap;
  }

  .level-info {
    font-weight: 600;
    color: #50427d;
    font-size: 13px;
    min-width: 40px;
    text-align: center;
  }

  .dark .level-info {
    color: #d9c8fb;
  }

  .icon-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #50427d;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .icon-btn.mobile {
    width: 24px;
    height: 24px;
    font-size: 12px;
    border-radius: 4px;
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

  .mode-switch {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 2px 8px;
    background: rgba(255,255,255,0.2);
    border-radius: 6px;
  }

  .mode-switch.mobile {
    padding: 1px 4px;
    border-radius: 4px;
  }

  .dark .mode-switch {
    background: rgba(255,255,255,0.03);
  }

  .mode-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .mode-label {
    font-size: 10px;
    color: #50427d;
  }

  .mode-label.mobile {
    font-size: 8px;
  }

  .dark .mode-label {
    color: #d9c8fb;
  }

  .mode-btn {
    width: 28px;
    height: 28px;
    border: 2px solid transparent;
    border-radius: 50%;
    background: transparent;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .mode-btn.mobile {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .mode-btn.active {
    border-color: #ff3b30;
    background: rgba(255,59,48,0.1);
  }

  .mode-btn:hover {
    background: rgba(80,66,125,0.06);
  }

  .grid-size-label {
    font-size: 12px;
    font-weight: 600;
    color: #50427d;
  }

  .grid-size-label.mobile {
    font-size: 10px;
  }

  .dark .grid-size-label {
    color: #d9c8fb;
  }

  .preview-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: rgba(80,66,125,0.05);
    border-radius: 10px;
    min-height: 200px;
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

  @media (max-width: 768px) {
    .editor-container {
      padding: 4px;
      gap: 4px;
    }
    
    .editor-header {
      padding: 2px 4px;
      gap: 1px;
    }
    
    .icon-btn {
      width: 24px;
      height: 24px;
      font-size: 12px;
      border-radius: 4px;
    }
    
    .level-info {
      font-size: 11px;
      min-width: 30px;
    }
    
    .mode-btn {
      width: 24px;
      height: 24px;
      font-size: 12px;
    }
    
    .mode-label {
      font-size: 8px;
    }
    
    .grid-size-label {
      font-size: 10px;
    }
  }

  @media (max-width: 480px) {
    .editor-container {
      padding: 2px;
      gap: 2px;
    }
    
    .icon-btn {
      width: 20px;
      height: 20px;
      font-size: 10px;
    }
    
    .level-info {
      font-size: 9px;
      min-width: 24px;
    }
    
    .mode-btn {
      width: 20px;
      height: 20px;
      font-size: 10px;
    }
    
    .mode-label {
      font-size: 7px;
    }
    
    .grid-size-label {
      font-size: 8px;
    }
  }
</style>