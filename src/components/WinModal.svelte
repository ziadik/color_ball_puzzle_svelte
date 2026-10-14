<!-- src/components/WinModal.svelte -->
<script>
  import {
    showWinModal,
    currentLevelIndex,
    totalLevels,
    nextLevel,
    restartLevel,
    movesCount,
    isDarkMode,
  } from '../lib/stores/gameStore.svelte.js';
  import { soundManager } from '../lib/utils/sound.js';
  import { t } from '../lib/i18n/ru.js';

  let moves = $derived($movesCount);
  let isLastLevel = $derived($currentLevelIndex >= $totalLevels - 1);

  function handleNext() {
    showWinModal.set(false);
    if (!isLastLevel) nextLevel();
    else restartLevel();
  }

  function handleRestart() {
    showWinModal.set(false);
    restartLevel();
  }

  $effect(() => {
    if ($showWinModal) soundManager.playVictory();
  });
</script>

{#if $showWinModal}
  <div
    class="overlay"
    class:dark={$isDarkMode}
    on:click={(e) => e.target === e.currentTarget && handleRestart()}
  >
    <div class="modal" class:dark={$isDarkMode}>
      <div class="icon">🏆</div>
      <h2>{t.win}</h2>
      <p class="moves-text">{t.winMoves(moves)}</p>

      <div class="buttons">
        {#if !isLastLevel}
          <button class="btn primary" on:click={handleNext}>
            {t.winNext}
          </button>
        {/if}
        <button class="btn secondary" on:click={handleRestart}>
          {isLastLevel ? t.winPlayAgain : t.winRestart}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  .modal {
    background: #ffffff;
    border-radius: 28px;
    padding: 36px 32px 28px;
    max-width: 340px;
    width: 90%;
    text-align: center;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
    animation: slideUp 0.4s ease;
  }

  .modal.dark {
    background: #2d234b;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  }

  .icon {
    font-size: 56px;
    margin-bottom: 6px;
  }

  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #50427d;
    margin: 0 0 4px;
  }

  .modal.dark h2 {
    color: #d9c8fb;
  }

  .moves-text {
    font-size: 15px;
    color: #888;
    margin: 4px 0 20px;
  }

  .modal.dark .moves-text {
    color: rgba(217, 200, 251, 0.6);
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .btn {
    padding: 14px 24px;
    border: none;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .btn:active {
    transform: scale(0.96);
  }

  .btn.primary {
    background: linear-gradient(135deg, #722fc0, #8f5cec);
    color: #fff;
  }

  .btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(114, 47, 192, 0.3);
  }

  .btn.secondary {
    background: rgba(80, 66, 125, 0.08);
    color: #50427d;
  }

  .modal.dark .btn.secondary {
    background: rgba(217, 200, 251, 0.08);
    color: #d9c8fb;
  }

  .btn.secondary:hover {
    background: rgba(80, 66, 125, 0.14);
  }

  .modal.dark .btn.secondary:hover {
    background: rgba(217, 200, 251, 0.14);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 400px) {
    .modal { padding: 28px 24px 24px; }
    .icon { font-size: 44px; }
    h2 { font-size: 20px; }
  }
</style>