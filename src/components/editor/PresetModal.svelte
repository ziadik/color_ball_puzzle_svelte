<!-- src/components/editor/PresetModal.svelte -->
<script>
  import { levels } from '../../lib/data/levels.js';

  let {
    isOpen = false,
    isDark = false,
    isMobile = false,
    onSelect,
    onClose,
  } = $props();
</script>

{#if isOpen}
  <div class="overlay" on:click={(e) => e.target === e.currentTarget && onClose?.()}>
    <div class="modal" class:dark={isDark} class:mobile={isMobile}>
      <h2>📚 Загрузить уровень</h2>
      
      <div class="list">
        {#each levels as level, i}
          <button 
            class="item"
            on:click={() => { onSelect?.(i); onClose?.(); }}
          >
            Level {i + 1}
          </button>
        {/each}
      </div>
      
      <button class="btn secondary" on:click={onClose}>Отмена</button>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-sizing: border-box;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal.dark {
    background: #2d234b;
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: #50427d;
    margin: 0 0 16px;
  }

  .modal.dark h2 {
    color: #d9c8fb;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 50vh;
    overflow-y: auto;
    margin-bottom: 16px;
  }

  .item {
    padding: 10px 14px;
    border: none;
    border-radius: 8px;
    background: rgba(80, 66, 125, 0.05);
    color: #50427d;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }

  .item:hover {
    background: rgba(80, 66, 125, 0.12);
  }

  .modal.dark .item {
    background: rgba(217, 200, 251, 0.05);
    color: #d9c8fb;
  }

  .modal.dark .item:hover {
    background: rgba(217, 200, 251, 0.12);
  }

  .btn {
    width: 100%;
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .btn.secondary {
    background: rgba(80, 66, 125, 0.08);
    color: #50427d;
  }

  .modal.dark .btn.secondary {
    background: rgba(217, 200, 251, 0.08);
    color: #d9c8fb;
  }
</style>