<!-- src/Game.svelte -->
<script>
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import GameBoard from './components/GameBoard.svelte';
  import WinModal from './components/WinModal.svelte';
  import SettingsModal from './components/SettingsModal.svelte';
  import EditorUnlockModal from './components/EditorUnlockModal.svelte';
  import { currentLevelIndex } from './lib/stores/gameStore.svelte.js';

  let boardContainer;
  let containerWidth = $state(0);
  let containerHeight = $state(0);
  let boardKey = $state(0);

  onMount(() => {
    const unsubscribe = currentLevelIndex.subscribe(() => {
      boardKey++;
    });

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', updateSize);
    };
  });

  function updateSize() {
    if (!boardContainer) return;
    const rect = boardContainer.getBoundingClientRect();
    containerWidth = rect.width;
    containerHeight = rect.height;
  }
</script>

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

<WinModal />
<SettingsModal />
<EditorUnlockModal />

<style>
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

  @media (max-width: 480px) {
    .game-wrapper { gap: 10px; max-height: 90vh; }
  }

  @media (min-width: 768px) {
    .game-wrapper { max-height: 800px; max-width: 600px; }
  }
</style>