<!-- src/Editor.svelte -->
<script>
  import { onMount } from 'svelte';
  import LevelEditor from './components/LevelEditor.svelte';
  import { closeEditor } from './lib/stores/appStore.svelte.js';
  import { isDarkMode } from './lib/stores/gameStore.svelte.js';
  import { Colors } from './lib/styles/colors.js';

  function handleBack() {
    closeEditor();
  }

  onMount(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') handleBack();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });
</script>

<div class="editor-screen">
  <div
    class="editor-top-bar"
    style="border-bottom-color: {Colors.Grid.grid($isDarkMode)};"
  >
    <button class="back-btn" class:dark={$isDarkMode} on:click={handleBack}>
      ← Назад
    </button>
    <h1 class="editor-title" class:dark={$isDarkMode}>🎨 Редактор уровней</h1>
    <div class="spacer"></div>
  </div>

  <div class="editor-content">
    <LevelEditor />
  </div>
</div>

<style>
  .editor-screen {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-width: 1000px;
    max-height: 900px;
    background: transparent;
    border-radius: 16px;
    overflow: hidden;
  }

  .editor-top-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid transparent;
    flex-shrink: 0;
  }

  .back-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 10px;
    background: rgba(80, 66, 125, 0.08);
    color: #50427D;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }

  .back-btn:hover {
    background: rgba(80, 66, 125, 0.14);
  }

  .back-btn.dark {
    background: rgba(217, 200, 251, 0.08);
    color: #d9c8fb;
  }

  .back-btn.dark:hover {
    background: rgba(217, 200, 251, 0.14);
  }

  .editor-title {
    font-size: 18px;
    font-weight: 700;
    color: #50427D;
    margin: 0;
  }

  .editor-title.dark {
    color: #d9c8fb;
  }

  .spacer { flex: 1; }

  .editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
</style>