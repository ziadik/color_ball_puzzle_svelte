<!-- src/components/LevelEditor.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { levels } from '../lib/data/levels.js';
  import { isDarkMode } from '../lib/stores/gameStore.svelte.js';
  import { showWalls, toggleWalls } from '../lib/stores/editorStore.svelte.js';
  import { Colors } from '../lib/styles/colors.js';
  import LayerPanel from './editor/LayerPanel.svelte';
  import GridEditor from './editor/GridEditor.svelte';
  import LevelPreview from './editor/LevelPreview.svelte';
  import SubmitModal from './editor/SubmitModal.svelte';
  import SizeModal from './editor/SizeModal.svelte';

  // ============================================================
  // СОСТОЯНИЕ
  // ============================================================
  let currentLevelIndex = $state(0);
  let objectsGrid = $state([]);
  let gridWidth = $state(0);
  let gridHeight = $state(0);

  let selectedTool = $state('ball');
  let selectedColor = $state(1);
  let isErasing = $state(false);
  let isMobile = $state(false);

  let viewMode = $state('edit'); // 'edit' | 'preview'
  let showSubmitModal = $state(false);
  let showSizeModal = $state(false);

  let history = $state([]);
  let historyIndex = $state(-1);
  const MAX_HISTORY = 50;

  // ============================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================================
  onMount(() => {
    checkMobile();
    loadLevel(0);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', checkMobile);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', checkMobile);
  });

  function checkMobile() {
    isMobile = window.innerWidth <= 768;
  }

  function handleKeyDown(e) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }
    if (e.key === '1') { selectedTool = 'ball'; isErasing = false; }
    if (e.key === '2') { selectedTool = 'hole'; isErasing = false; }
    if (e.key === '3') { selectedTool = 'block'; isErasing = false; }
    if (e.key === '4') { isErasing = !isErasing; }
    if (e.key === 'Escape') {
      showSubmitModal = false;
      showSizeModal = false;
    }
  }

  // ============================================================
  // ЗАГРУЗКА УРОВНЯ — только objects
  // ============================================================
  function loadLevel(index) {
    if (index < 0 || index >= levels.length) index = 0;
    currentLevelIndex = index;
    const data = levels[index];

    const objRows = data.objects || [];
    const objH = objRows.length;
    const objW = objRows[0]?.split(' ').length || 0;

    gridWidth = objW;
    gridHeight = objH;

    const newObjects = [];
    for (let y = 0; y < objH; y++) {
      const row = [];
      const objRow = objRows[y]?.split(' ') || [];
      for (let x = 0; x < objW; x++) {
        row.push(parseInt(objRow[x]) || 0);
      }
      newObjects.push(row);
    }

    objectsGrid = newObjects;
    saveHistory();
  }

  // ============================================================
  // ИСТОРИЯ
  // ============================================================
  function saveHistory() {
    const snapshot = {
      objects: objectsGrid.map(r => [...r]),
      width: gridWidth,
      height: gridHeight,
    };
    history = history.slice(0, historyIndex + 1);
    history.push(snapshot);
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      const s = history[historyIndex];
      objectsGrid = s.objects.map(r => [...r]);
      gridWidth = s.width;
      gridHeight = s.height;
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      const s = history[historyIndex];
      objectsGrid = s.objects.map(r => [...r]);
      gridWidth = s.width;
      gridHeight = s.height;
    }
  }

  // ============================================================
  // РЕДАКТИРОВАНИЕ
  // ============================================================
  function editCell(col, row) {
    if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth) return;

    const newObjects = objectsGrid.map(r => [...r]);

    if (isErasing) {
      newObjects[row][col] = 0;
    } else if (selectedTool === 'ball') {
      newObjects[row][col] = selectedColor + 1;
    } else if (selectedTool === 'hole') {
      newObjects[row][col] = (selectedColor + 1) * 11;
    } else if (selectedTool === 'block') {
      newObjects[row][col] = 1;
    }

    objectsGrid = newObjects;
    saveHistory();
  }

  // ============================================================
  // НАВИГАЦИЯ
  // ============================================================
  function nextLevel() {
    if (currentLevelIndex < levels.length - 1) loadLevel(currentLevelIndex + 1);
  }

  function prevLevel() {
    if (currentLevelIndex > 0) loadLevel(currentLevelIndex - 1);
  }

  function newLevel() {
    const size = 8;
    objectsGrid = Array(size).fill(null).map(() => Array(size).fill(0));
    gridWidth = size;
    gridHeight = size;
    saveHistory();
  }

  function clearGrid() {
    if (!confirm('Очистить?')) return;
    objectsGrid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0));
    saveHistory();
  }

  function resizeGrid(newW, newH) {
    const old = objectsGrid;
    const newObjects = [];
    for (let y = 0; y < newH; y++) {
      const row = [];
      for (let x = 0; x < newW; x++) {
        row.push(old[y]?.[x] ?? 0);
      }
      newObjects.push(row);
    }
    objectsGrid = newObjects;
    gridWidth = newW;
    gridHeight = newH;
    saveHistory();
  }

  // ============================================================
  // ИНСТРУМЕНТЫ
  // ============================================================
  function handleSelectTool(tool, color) {
    if (tool === 'eraser') {
      isErasing = !isErasing;
      return;
    }
    selectedTool = tool;
    if (color !== undefined) selectedColor = color;
    isErasing = false;
  }

  // ============================================================
  // JSON
  // ============================================================
  function getLevelJson() {
    return {
      walls: [],
      objects: objectsGrid.map(r => r.join(' ')),
    };
  }
</script>

<div class="editor" class:dark={$isDarkMode}>
  <!-- Верхняя панель -->
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="icon-btn" on:click={prevLevel} disabled={currentLevelIndex === 0}>◀</button>
      <span class="level-info">L{currentLevelIndex + 1}</span>
      <button class="icon-btn" on:click={nextLevel} disabled={currentLevelIndex >= levels.length - 1}>▶</button>
      <button class="icon-btn" on:click={newLevel} title="Новый">➕</button>
    </div>

    <div class="toolbar-center">
      <button
        class="pill-btn"
        class:active={viewMode === 'edit'}
        on:click={() => viewMode = 'edit'}
      >✏️ Рисовать</button>
      <button
        class="pill-btn"
        class:active={viewMode === 'preview'}
        on:click={() => viewMode = 'preview'}
      >👁️ Превью</button>
      <button
        class="pill-btn"
        class:active={$showWalls}
        on:click={toggleWalls}
      >🧱 {$showWalls ? 'Стены: вкл' : 'Стены: выкл'}</button>
    </div>

    <div class="toolbar-right">
      <button class="icon-btn" on:click={undo} disabled={historyIndex <= 0} title="Отменить (Ctrl+Z)">↶</button>
      <button class="icon-btn" on:click={redo} disabled={historyIndex >= history.length - 1} title="Повторить (Ctrl+Shift+Z)">↷</button>
      <button class="icon-btn" on:click={() => showSizeModal = true} title="Размер поля">📐</button>
      <button class="icon-btn" on:click={clearGrid} title="Очистить">🧹</button>
      <button class="icon-btn submit-btn" on:click={() => showSubmitModal = true} title="Отправить автору">📤</button>
    </div>
  </div>

  <!-- Инструменты: colorMap = Colors.BallMap -->
  <LayerPanel
    {selectedTool}
    {selectedColor}
    {isErasing}
    {isMobile}
    colorMap={Colors.BallMap}
    isDark={$isDarkMode}
    onSelectTool={handleSelectTool}
  />

  <!-- Рабочая область -->
  <div class="workspace">
    {#if viewMode === 'edit'}
      <GridEditor
        {objectsGrid}
        {gridWidth}
        {gridHeight}
        isMobile={isMobile}
        {selectedTool}
        {selectedColor}
        {isErasing}
        onEditCell={editCell}
      />
    {:else}
      <LevelPreview
        {objectsGrid}
        containerWidth={600}
        containerHeight={600}
      />
    {/if}
  </div>

  <!-- Футер -->
  <div class="footer">
    <span>{gridWidth} × {gridHeight}</span>
    <span class="sep">·</span>
    <span>Уровень {currentLevelIndex + 1} из {levels.length}</span>
  </div>

  <!-- Модалки -->
  <SizeModal
    isOpen={showSizeModal}
    width={gridWidth}
    height={gridHeight}
    isDark={$isDarkMode}
    {isMobile}
    onApply={(w, h) => { resizeGrid(w, h); showSizeModal = false; }}
    onClose={() => showSizeModal = false}
  />

  <SubmitModal
    isOpen={showSubmitModal}
    level={getLevelJson()}
    isDark={$isDarkMode}
    {isMobile}
    onClose={() => showSubmitModal = false}
  />
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 8px;
    box-sizing: border-box;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 10px;
    background: rgba(80, 66, 125, 0.06);
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  .editor.dark .toolbar {
    background: rgba(217, 200, 251, 0.06);
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .toolbar-center {
    flex: 1;
    justify-content: center;
    flex-wrap: wrap;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #50427d;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }

  .editor.dark .icon-btn {
    color: #d9c8fb;
  }

  .icon-btn:hover:not(:disabled) {
    background: rgba(80, 66, 125, 0.1);
  }

  .editor.dark .icon-btn:hover:not(:disabled) {
    background: rgba(217, 200, 251, 0.1);
  }

  .icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .icon-btn.submit-btn {
    background: linear-gradient(135deg, #722FC0, #8F5CEC);
    color: #fff;
  }

  .icon-btn.submit-btn:hover:not(:disabled) {
    opacity: 0.9;
    background: linear-gradient(135deg, #722FC0, #8F5CEC);
  }

  .level-info {
    font-weight: 700;
    font-size: 13px;
    color: #50427d;
    min-width: 40px;
    text-align: center;
  }

  .editor.dark .level-info {
    color: #d9c8fb;
  }

  .pill-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 8px;
    background: rgba(80, 66, 125, 0.08);
    color: #50427d;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .editor.dark .pill-btn {
    background: rgba(217, 200, 251, 0.08);
    color: #d9c8fb;
  }

  .pill-btn:hover {
    background: rgba(80, 66, 125, 0.14);
  }

  .editor.dark .pill-btn:hover {
    background: rgba(217, 200, 251, 0.14);
  }

  .pill-btn.active {
    background: #722FC0;
    color: #fff;
  }

  .editor.dark .pill-btn.active {
    background: #8F5CEC;
    color: #fff;
  }

  .workspace {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 10px;
    background: rgba(80, 66, 125, 0.04);
  }

  .editor.dark .workspace {
    background: rgba(217, 200, 251, 0.04);
  }

  .footer {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #50427d;
    opacity: 0.6;
    flex-shrink: 0;
  }

  .editor.dark .footer {
    color: #d9c8fb;
  }

  .sep {
    opacity: 0.4;
  }

  @media (max-width: 768px) {
    .editor { padding: 4px; gap: 4px; }
    .toolbar { padding: 4px 6px; gap: 4px; }
    .icon-btn { width: 28px; height: 28px; font-size: 13px; }
    .pill-btn { padding: 4px 8px; font-size: 11px; }
    .level-info { font-size: 11px; min-width: 30px; }
  }

  @media (max-width: 480px) {
    .editor { padding: 2px; gap: 2px; }
    .icon-btn { width: 26px; height: 26px; font-size: 12px; }
    .pill-btn { padding: 3px 6px; font-size: 10px; }
    .level-info { font-size: 10px; min-width: 26px; }
  }
</style>