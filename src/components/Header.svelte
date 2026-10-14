<!-- src/components/Header.svelte -->
<script>
  import {
    currentLevelIndex,
    totalLevels,
    levelName,
    previousLevel,
    nextLevel,
    restartLevel,
    toggleSettings,
    useHint,
    undoMove,
    movesCount,
    isDarkMode,
  } from '../lib/stores/gameStore.svelte.js';
  import { editorUnlocked, openEditor } from '../lib/stores/appStore.svelte.js';
  import { soundManager } from '../lib/utils/sound.js';
  import { Colors } from '../lib/styles/colors.js';

  let moves = 0;
  movesCount.subscribe(value => moves = value);

  // Цвета из Colors — единый источник
  const headerBg = $derived(
    Colors.Background.appBackground($isDarkMode)
  );
</script>

<header
  class="header"
  class:dark={$isDarkMode}
  style="background: {headerBg};"
>
  <div class="header-left">
    <button class="icon-btn" on:click={restartLevel} aria-label="Restart" title="Заново">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 1 0 9-9m0 0v6m0-6h-6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button class="icon-btn" on:click={undoMove} disabled={moves === 0} aria-label="Undo" title="Отменить">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 7v6h6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>

  <div class="level-display">
    <span class="level-label">{$levelName}</span>
    <span class="level-sub">Moves: {moves}</span>
  </div>

  <div class="header-right">
    <button
      class="icon-btn"
      on:click={() => {
        const hint = useHint();
        if (hint) soundManager.playMove();
      }}
      aria-label="Hint"
      title="Подсказка"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round"/>
      </svg>
    </button>

    {#if $editorUnlocked}
      <button class="icon-btn editor-btn" on:click={openEditor} aria-label="Editor" title="Редактор уровней">
        🎨
      </button>
    {/if}

    <button class="icon-btn" on:click={previousLevel} disabled={$currentLevelIndex === 0} aria-label="Previous level" title="Предыдущий">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button class="icon-btn" on:click={nextLevel} disabled={$currentLevelIndex >= $totalLevels - 1} aria-label="Next level" title="Следующий">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button class="icon-btn" on:click={toggleSettings} aria-label="Settings" title="Настройки">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83"/>
      </svg>
    </button>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 16px;
    backdrop-filter: blur(12px);
    border-radius: 18px;
    width: 100%;
    max-width: 520px;
    transition: background 0.3s ease;
    box-sizing: border-box;
  }

  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #50427D;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
    font-size: 18px;
  }

  .dark .icon-btn { color: #d9c8fb; }

  .icon-btn:hover:not(:disabled) { background: rgba(80, 66, 125, 0.08); }
  .dark .icon-btn:hover:not(:disabled) { background: rgba(217, 200, 251, 0.08); }

  .icon-btn:disabled { opacity: 0.25; cursor: not-allowed; }
  .icon-btn:active:not(:disabled) { transform: scale(0.9); }

  .editor-btn { background: rgba(114, 47, 192, 0.08); }
  .dark .editor-btn { background: rgba(217, 200, 251, 0.08); }

  .level-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-width: 60px;
  }

  .level-label {
    font-size: 17px;
    font-weight: 700;
    color: #50427D;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }
  .dark .level-label { color: #d9c8fb; }

  .level-sub {
    font-size: 10px;
    color: #999;
    font-weight: 500;
    letter-spacing: 0.3px;
  }
  .dark .level-sub { color: rgba(217, 200, 251, 0.5); }

  @media (max-width: 480px) {
    .header { padding: 8px 12px; border-radius: 14px; }
    .icon-btn { width: 32px; height: 32px; font-size: 16px; }
    .level-label { font-size: 15px; }
  }
</style>