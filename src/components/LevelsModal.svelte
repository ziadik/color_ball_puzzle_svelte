<!-- src/components/LevelsModal.svelte -->
<script>
  import { levels } from '../lib/data/levels.js';
  import {
    currentLevelIndex,
    maxOpenedLevel,
    loadLevel,
    isDarkMode,
  } from '../lib/stores/gameStore.svelte.js';

  let { isOpen = false, onClose } = $props();

  function selectLevel(i) {
    loadLevel(i);
    onClose?.();
  }
</script>

{#if isOpen}
  <div
    class="overlay"
    on:click={(e) => e.target === e.currentTarget && onClose?.()}
  >
    <div class="modal" class:dark={$isDarkMode}>
      <div class="modal-header">
        <h2>Уровни</h2>
        <button class="close-btn" on:click={onClose}>✕</button>
      </div>

      <div class="grid">
  {#each levels as _, i}
  {@const opened = i <= $maxOpenedLevel}
  <button
    class="level-cell"
    class:opened
    class:locked={!opened}
    class:current={i === $currentLevelIndex}
    disabled={!opened}
    on:click={() => opened && selectLevel(i)}
    aria-label={opened ? `Уровень ${i + 1}` : `Уровень ${i + 1} закрыт`}
  >
    {#if opened}
      <span class="num">{i + 1}</span>
    {:else}
      <svg
        class="lock"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 1 1 8 0v4" />
      </svg>
    {/if}
  </button>
{/each}
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
    padding: 16px;
  }

  .modal {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px;
    max-width: 480px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal.dark {
    background: #2d234b;
    color: #d9c8fb;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #50427d;
  }

  .modal.dark h2 {
    color: #d9c8fb;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: rgba(80, 66, 125, 0.08);
    color: #50427d;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal.dark .close-btn {
    background: rgba(217, 200, 251, 0.08);
    color: #d9c8fb;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 8px;
    overflow-y: auto;
    flex: 1;
    padding-right: 4px;
  }

 .level-cell {
  aspect-ratio: 1;
  border: none;
  border-radius: 12px;
  background: rgba(80, 66, 125, 0.08);
  color: #50427d;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal.dark .level-cell {
  background: rgba(217, 200, 251, 0.08);
  color: #d9c8fb;
}

/* Открытые */
.level-cell.opened {
  background: linear-gradient(135deg, #722FC0, #8F5CEC);
  color: #fff;
}

/* Закрытые (с замком) — приглушённые, но иконка видна */
.level-cell.locked {
  background: rgba(80, 66, 125, 0.06);
  color: rgba(80, 66, 125, 0.35);
  cursor: not-allowed;
}

.modal.dark .level-cell.locked {
  background: rgba(217, 200, 251, 0.05);
  color: rgba(217, 200, 251, 0.35);
}

/* Текущий */
.level-cell.current {
  outline: 3px solid #FFD700;
  outline-offset: -3px;
}

.level-cell:disabled {
  cursor: not-allowed;
}

.level-cell:hover:not(:disabled) {
  transform: scale(1.06);
}

/* Замок не масштабируется */
.level-cell .lock {
  display: block;
}

.level-cell .num {
  font-size: 16px;
  font-weight: 700;
}
</style>