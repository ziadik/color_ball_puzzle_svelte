<!-- src/components/editor/SizeModal.svelte -->
<script>
  let {
    isOpen = false,
    width = 8,
    height = 8,
    isDark = false,
    isMobile = false,
    onApply,
    onClose,
  } = $props();

  let localW = $state(width);
  let localH = $state(height);

  $effect(() => {
    if (isOpen) {
      localW = width;
      localH = height;
    }
  });

  const presets = [
    [5, 5], [8, 8], [10, 10], [12, 12],
    [8, 12], [12, 8], [15, 15], [20, 20],
  ];

  function apply() {
    const w = Math.max(3, Math.min(30, parseInt(localW) || 8));
    const h = Math.max(3, Math.min(30, parseInt(localH) || 8));
    onApply?.(w, h);
  }
</script>

{#if isOpen}
  <div class="overlay" on:click={(e) => e.target === e.currentTarget && onClose?.()}>
    <div class="modal" class:dark={isDark} class:mobile={isMobile}>
      <h2>📐 Размер поля</h2>

      <div class="inputs">
        <input type="number" bind:value={localW} min="3" max="30" />
        <span class="times">×</span>
        <input type="number" bind:value={localH} min="3" max="30" />
      </div>

      <div class="presets">
        {#each presets as [w, h]}
          <button 
            class="preset"
            on:click={() => { localW = w; localH = h; }}
          >{w}×{h}</button>
        {/each}
      </div>

      <div class="buttons">
        <button class="btn secondary" on:click={onClose}>Отмена</button>
        <button class="btn primary" on:click={apply}>Применить</button>
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
    border-radius: 20px;
    padding: 24px;
    max-width: 360px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
  }

  .modal.dark {
    background: #2d234b;
    color: #d9c8fb;
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

  .inputs {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .inputs input {
    flex: 1;
    padding: 10px 12px;
    border: 1.5px solid rgba(80, 66, 125, 0.15);
    border-radius: 10px;
    font-size: 16px;
    text-align: center;
    font-family: inherit;
    color: #50427d;
    background: #f8f4ff;
  }

  .modal.dark .inputs input {
    background: #363344;
    color: #d9c8fb;
    border-color: rgba(217, 200, 251, 0.15);
  }

  .times {
    font-size: 18px;
    font-weight: 600;
    color: #50427d;
  }

  .modal.dark .times {
    color: #d9c8fb;
  }

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 20px;
  }

  .preset {
    padding: 6px 12px;
    border: 1px solid rgba(80, 66, 125, 0.15);
    border-radius: 8px;
    background: transparent;
    color: #50427d;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }

  .preset:hover {
    background: rgba(80, 66, 125, 0.08);
  }

  .modal.dark .preset {
    color: #d9c8fb;
    border-color: rgba(217, 200, 251, 0.15);
  }

  .modal.dark .preset:hover {
    background: rgba(217, 200, 251, 0.08);
  }

  .buttons {
    display: flex;
    gap: 8px;
  }

  .btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
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