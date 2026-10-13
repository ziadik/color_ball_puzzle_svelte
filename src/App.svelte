<!-- src/App.svelte -->
<script>
  import { onMount } from 'svelte';
  import { vkBridge } from './lib/services/vkBridge.js';
  import Game from './Game.svelte';
  import Editor from './Editor.svelte';
  import { isEditorOpen, loadProgress } from './lib/stores/appStore.svelte.js';
  import { isDarkMode } from './lib/stores/gameStore.svelte.js';

  let isDark = $state(false);

  isDarkMode.subscribe(value => {
    isDark = value;
    document.documentElement.classList.toggle('dark', value);
  });

  onMount(async () => {
    await vkBridge.init();
    if (vkBridge.isVKApp()) {
      vkBridge.showLoading();
      setTimeout(() => vkBridge.hideLoading(), 1000);
    }
    await loadProgress();
  });
</script>

<div class="app" class:dark={isDark}>
  {#if $isEditorOpen}
    <Editor />
  {:else}
    <Game />
  {/if}
</div>

<style>
  .app {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: #F8F4FF;
    transition: background 0.3s ease;
    overflow: hidden;
  }

  .app.dark {
    background: #363344;
  }

  @media (max-width: 480px) {
    .app { padding: 8px; }
  }
</style>