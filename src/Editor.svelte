<!-- src/Editor.svelte -->
<script>
  import { onMount } from 'svelte';
  import LevelEditor from './components/LevelEditor.svelte';
  import { closeEditor } from './lib/stores/appStore.svelte.js';
  import { isDarkMode } from './lib/stores/gameStore.svelte.js';

  let isDark = $state(false);
  isDarkMode.subscribe(v => isDark = v);

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

<div class="editor-screen" class:dark={isDark}>
  <div class="editor-top-bar">
    <button class="back-btn" on:click={handleBack}>
      ← Назад
    </button>
    <h1 class="editor-title">🎨 Редактор уровней</h1>
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

  .editor-screen.dark {
     background: transparent;
  }

  .editor-top-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    /* background: rgba(255, 255, 255, 0.7); */
    border-bottom: 1px solid rgba(80, 66, 125, 0.08);
    flex-shrink: 0;
  }

  .editor-screen.dark .editor-top-bar {
    /* background: rgba(45, 35, 75, 0.7); */
    border-bottom: 1px solid rgba(217, 200, 251, 0.08);
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

  .editor-screen.dark .back-btn {
    /* background: rgba(217, 200, 251, 0.08); */
    color: #d9c8fb;
  }

  .editor-title {
    font-size: 18px;
    font-weight: 700;
    color: #50427D;
    margin: 0;
  }

  .editor-screen.dark .editor-title {
    color: #d9c8fb;
  }

  .spacer { flex: 1; }

  .editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
</style>