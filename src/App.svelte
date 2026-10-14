<!-- src/App.svelte -->
<script>
  import { onMount } from 'svelte';
  import { vkBridge } from './lib/services/vkBridge.js';
  import Game from './Game.svelte';
  import Editor from './Editor.svelte';
  import { isEditorOpen, loadProgress } from './lib/stores/appStore.svelte.js';
  import { isDarkMode } from './lib/stores/gameStore.svelte.js';
  import { Colors } from './lib/styles/colors.js';

  onMount(async () => {
    await vkBridge.init();
    if (vkBridge.isVKApp()) {
      vkBridge.showLoading();
      setTimeout(() => vkBridge.hideLoading(), 1000);
    }
    await loadProgress();

    // Синхронизация <html> с темой
    const unsub = isDarkMode.subscribe(v => {
      document.documentElement.classList.toggle('dark', v);
    });
    return unsub;
  });
</script>

<div
  class="app"
  style="background: {Colors.Background.appBackground($isDarkMode)};"
>
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
    /* transition: background 0.3s ease; */
    overflow: hidden;
    box-sizing: border-box;
  }

  @media (max-width: 480px) {
    .app { padding: 8px; }
  }
</style>