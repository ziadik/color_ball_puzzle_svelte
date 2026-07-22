<!-- src/App.svelte -->
<script>
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import GameBoard from './components/GameBoard.svelte';
  import WinModal from './components/WinModal.svelte';
  import SettingsModal from './components/SettingsModal.svelte';
  import WallTypesDemo from './components/WallTypesDemo.svelte';
  import { isDarkMode, currentLevelIndex } from './lib/stores/gameStore.svelte.js';

  let boardContainer;
  let containerWidth = $state(0);
  let containerHeight = $state(0);
  let isDark = $state(false);
  let showWallTypes = $state(false);
  let boardKey = $state(0);

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

    return () => {
      unsubscribe();
      window.removeEventListener('resize', updateSize);
      document.removeEventListener('show-wall-types', handleShowWallTypes);
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

  /* СВЕТЛАЯ ТЕМА (по умолчанию) */
  .app {
    background: #F8F4FF;
  }

  /* ТЕМНАЯ ТЕМА */
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

  .wall-types-overlay.dark .close-btn {
    background: rgba(217, 200, 251, 0.08);
    color: #d9c8fb;
  }

  .wall-types-overlay.dark .close-btn:hover {
    background: rgba(217, 200, 251, 0.15);
  }

  .wall-types-scroll {
    flex: 1;
    overflow-y: auto;
    padding-top: 16px;
    -webkit-overflow-scrolling: touch;
  }

  .wall-types-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .wall-types-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .wall-types-scroll::-webkit-scrollbar-thumb {
    background: rgba(80, 66, 125, 0.2);
    border-radius: 3px;
  }

  .wall-types-overlay.dark .wall-types-scroll::-webkit-scrollbar-thumb {
    background: rgba(217, 200, 251, 0.2);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 480px) {
    .app {
      padding: 8px;
    }
    .game-wrapper {
      gap: 10px;
      max-height: 90vh;
    }
    .wall-types-overlay {
      padding: 12px;
    }
    .wall-types-header h2 {
      font-size: 17px;
    }
    .close-btn {
      width: 34px;
      height: 34px;
      font-size: 16px;
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