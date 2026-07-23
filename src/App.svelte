<!-- src/App.svelte -->
<script>
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import GameBoard from './components/GameBoard.svelte';
  import WinModal from './components/WinModal.svelte';
  import SettingsModal from './components/SettingsModal.svelte';
  import WallTypesDemo from './components/WallTypesDemo.svelte';
  import LevelEditor from './components/LevelEditor.svelte';
  import { isDarkMode, currentLevelIndex } from './lib/stores/gameStore.svelte.js';

  let boardContainer;
  let containerWidth = $state(0);
  let containerHeight = $state(0);
  let isDark = $state(false);
  let showWallTypes = $state(false);
  let boardKey = $state(0);
  let showEditor = $state(false); // <-- Добавлено

  isDarkMode.subscribe(value => {
    isDark = value;
    document.documentElement.classList.toggle('dark', value);
  });

  onMount(() => {
    const unsubscribe = currentLevelIndex.subscribe(() => {
      boardKey++;
    });

    updateSize();
    window.addEventListener('resize', updateSize);

    const handleShowWallTypes = () => {
      showWallTypes = true;
    };
    document.addEventListener('show-wall-types', handleShowWallTypes);

    // Горячая клавиша для открытия редактора
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        showEditor = !showEditor;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', updateSize);
      document.removeEventListener('show-wall-types', handleShowWallTypes);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  function updateSize() {
    if (!boardContainer) return;
    const rect = boardContainer.getBoundingClientRect();
    containerWidth = rect.width;
    containerHeight = rect.height;
  }

  function toggleWallTypes() {
    showWallTypes = !showWallTypes;
  }

  function toggleEditor() {
    showEditor = !showEditor;
  }
</script>

<div class="app" class:dark={isDark}>
  {#if showWallTypes}
    <div class="wall-types-overlay" class:dark={isDark}>
      <div class="wall-types-header">
        <h2>🧱 Wall Types Reference</h2>
        <button class="close-btn" on:click={toggleWallTypes}>✕</button>
      </div>
      <div class="wall-types-scroll">
        <WallTypesDemo />
      </div>
    </div>
  {:else if showEditor}
    <div class="editor-overlay" class:dark={isDark}>
      <div class="editor-header-bar">
        <h2>🎮 Level Editor</h2>
        <div class="editor-actions">
          <span class="shortcut-hint">Ctrl+E to toggle</span>
          <button class="close-btn" on:click={toggleEditor}>✕</button>
        </div>
      </div>
      <div class="editor-scroll">
        <LevelEditor />
      </div>
    </div>
  {:else}
    <div class="game-wrapper">
      <Header />
      
      <div class="board-wrapper" bind:this={boardContainer}>
        {#key boardKey}
          <GameBoard 
            containerWidth={containerWidth}
            containerHeight={containerHeight}
          />
        {/key}
      </div>

      <!-- Кнопка открытия редактора -->
      <button class="editor-toggle" on:click={toggleEditor} title="Open Level Editor (Ctrl+E)">
        🛠️
      </button>
    </div>
  {/if}

  <WinModal />
  <SettingsModal />
</div>

<style>
  .app {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    transition: background 0.3s ease;
    overflow: hidden;
  }

  .app {
    background: #F8F4FF;
  }
  .app.dark {
    background: #363344;
  }

  .game-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    width: 100%;
    max-width: 580px;
    height: 100%;
    max-height: 750px;
    position: relative;
  }

  .board-wrapper {
    flex: 1;
    width: 100%;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
  }

  /* Кнопка редактора */
  .editor-toggle {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: rgba(114, 47, 192, 0.15);
    color: #722fc0;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
    z-index: 10;
  }

  .dark .editor-toggle {
    background: rgba(166, 157, 212, 0.15);
    color: #a69dd4;
  }

  .editor-toggle:hover {
    transform: scale(1.1);
    background: rgba(114, 47, 192, 0.25);
  }

  .dark .editor-toggle:hover {
    background: rgba(166, 157, 212, 0.25);
  }

  /* Оверлей редактора */
  .editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #F8F4FF;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow: hidden;
    animation: slideIn 0.3s ease;
  }

  .editor-overlay.dark {
    background: #363344;
  }

  .editor-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(80, 66, 125, 0.1);
    flex-shrink: 0;
  }

  .editor-overlay.dark .editor-header-bar {
    border-bottom: 1px solid rgba(217, 200, 251, 0.08);
  }

  .editor-header-bar h2 {
    font-size: 20px;
    font-weight: 700;
    color: #50427D;
    margin: 0;
  }

  .editor-overlay.dark .editor-header-bar h2 {
    color: #d9c8fb;
  }

  .editor-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .shortcut-hint {
    font-size: 12px;
    color: rgba(80, 66, 125, 0.4);
    background: rgba(80, 66, 125, 0.06);
    padding: 4px 10px;
    border-radius: 6px;
  }

  .dark .shortcut-hint {
    color: rgba(217, 200, 251, 0.3);
    background: rgba(217, 200, 251, 0.05);
  }

  .editor-scroll {
    flex: 1;
    overflow-y: auto;
    padding-top: 12px;
    -webkit-overflow-scrolling: touch;
  }

  .editor-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .editor-scroll::-webkit-scrollbar-thumb {
    background: rgba(80, 66, 125, 0.2);
    border-radius: 3px;
  }
  .editor-overlay.dark .editor-scroll::-webkit-scrollbar-thumb {
    background: rgba(217, 200, 251, 0.15);
  }

  .wall-types-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #F8F4FF;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
    animation: slideIn 0.3s ease;
  }

  .wall-types-overlay.dark {
    background: #363344;
  }

  .wall-types-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(80, 66, 125, 0.1);
    flex-shrink: 0;
  }

  .wall-types-overlay.dark .wall-types-header {
    border-bottom: 1px solid rgba(217, 200, 251, 0.1);
  }

  .wall-types-header h2 {
    font-size: 22px;
    font-weight: 700;
    color: #50427D;
    margin: 0;
  }

  .wall-types-overlay.dark .wall-types-header h2 {
    color: #d9c8fb;
  }

  .close-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: rgba(80, 66, 125, 0.08);
    color: #50427D;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(80, 66, 125, 0.15);
    transform: scale(1.05);
  }

  .wall-types-overlay.dark .close-btn,
  .editor-overlay.dark .close-btn {
    background: rgba(217, 200, 251, 0.08);
    color: #d9c8fb;
  }

  .wall-types-overlay.dark .close-btn:hover,
  .editor-overlay.dark .close-btn:hover {
    background: rgba(217, 200, 251, 0.15);
  }

  .wall-types-scroll {
    flex: 1;
    overflow-y: auto;
    padding-top: 16px;
    -webkit-overflow-scrolling: touch;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @media (max-width: 480px) {
    .app {
      padding: 8px;
    }
    .game-wrapper {
      gap: 10px;
      max-height: 90vh;
    }
    .editor-overlay {
      padding: 10px;
    }
    .editor-header-bar h2 {
      font-size: 16px;
    }
    .shortcut-hint {
      display: none;
    }
    .close-btn {
      width: 34px;
      height: 34px;
      font-size: 16px;
    }
    .editor-toggle {
      width: 34px;
      height: 34px;
      font-size: 15px;
      bottom: 4px;
      right: 4px;
    }
  }

  @media (orientation: landscape) and (max-height: 500px) {
    .game-wrapper {
      flex-direction: row;
      max-width: 100%;
      max-height: 100%;
      gap: 16px;
    }
    .board-wrapper {
      flex: 2;
    }
  }

  @media (min-width: 768px) {
    .game-wrapper {
      max-height: 800px;
      max-width: 600px;
    }
  }
</style>