<!-- src/components/EditorUnlockModal.svelte -->
<script>
  import { showEditorUnlockModal, openEditor, dismissUnlockModal } from '../lib/stores/appStore.svelte.js';
  import { isDarkMode } from '../lib/stores/gameStore.svelte.js';

  let isDark = false;
  isDarkMode.subscribe(v => isDark = v);

  function handleOpen() {
    openEditor();
  }

  function handleLater() {
    dismissUnlockModal();
  }
</script>

{#if $showEditorUnlockModal}
  <div class="overlay" on:click={(e) => e.target === e.currentTarget && handleLater()}>
    <div class="modal" class:dark={isDark}>
      <div class="icon">🎨</div>
      <h2>Редактор открыт!</h2>
      <p>Ты прошёл все уровни. Теперь можешь создавать свои и предлагать их для публикации.</p>

      <div class="buttons">
        <button class="btn primary" on:click={handleOpen}>
          Попробовать
        </button>
        <button class="btn secondary" on:click={handleLater}>
          Позже
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
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal {
    background: #ffffff;
    border-radius: 24px;
    padding: 32px 24px 24px;
    max-width: 360px;
    width: 100%;
    text-align: center;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
    box-sizing: border-box;
  }

  .modal.dark {
    background: #2d234b;
  }

  .icon {
    font-size: 64px;
    margin-bottom: 12px;
  }

  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #50427d;
    margin: 0 0 8px;
  }

  .modal.dark h2 {
    color: #d9c8fb;
  }

  p {
    font-size: 14px;
    color: #50427d;
    opacity: 0.8;
    line-height: 1.5;
    margin: 0 0 24px;
  }

  .modal.dark p {
    color: #d9c8fb;
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
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }

  .btn:active {
    transform: scale(0.97);
  }

  .btn.primary {
    background: linear-gradient(135deg, #722FC0, #8F5CEC);
    color: #ffffff;
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