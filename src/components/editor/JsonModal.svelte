<!-- src/components/editor/JsonModal.svelte -->
<script>
  let { isOpen = false, json = '', isDark = false, isMobile = false, onClose } = $props();

  function handleClose() {
    if (onClose) onClose();
  }

  function copyJson() {
    navigator.clipboard?.writeText(json);
    alert('JSON copied to clipboard!');
  }
</script>

{#if isOpen}
  <div class="json-modal-overlay" class:mobile={isMobile} on:click={e => e.target === e.currentTarget && handleClose()}>
    <div class="json-modal" class:dark={isDark} class:mobile={isMobile}>
      <div class="json-header">
        <h3>📄 Level JSON</h3>
        <button class="close-btn" on:click={handleClose}>✕</button>
      </div>
      <div class="json-content" class:mobile={isMobile}>
        <pre>{json}</pre>
      </div>
      <div class="json-actions" class:mobile={isMobile}>
        <button class="json-btn" on:click={copyJson}>📋 Copy</button>
        <button class="json-btn primary" on:click={handleClose}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .json-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .json-modal-overlay.mobile {
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  .json-modal {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
  }

  .json-modal.mobile {
    border-radius: 8px;
    padding: 12px;
    width: 95%;
    max-height: 85vh;
  }

  .json-modal.dark {
    background: #2d234b;
  }

  .json-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .json-header h3 {
    color: #50427d;
    margin: 0;
    font-size: 16px;
  }

  .json-header.mobile h3 {
    font-size: 14px;
  }

  .dark .json-header h3 {
    color: #d9c8fb;
  }

  .json-content {
    flex: 1;
    overflow: auto;
    background: rgba(0,0,0,0.05);
    border-radius: 6px;
    padding: 8px;
    max-height: 400px;
  }

  .json-content.mobile {
    max-height: 250px;
    padding: 6px;
  }

  .dark .json-content {
    background: rgba(255,255,255,0.05);
  }

  .json-content pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 11px;
    line-height: 1.5;
    color: #333;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .json-content.mobile pre {
    font-size: 9px;
  }

  .dark .json-content pre {
    color: #d9c8fb;
  }

  .json-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    justify-content: flex-end;
  }

  .json-actions.mobile {
    gap: 4px;
  }

  .json-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    background: rgba(80,66,125,0.08);
    color: #50427d;
  }

  .json-btn.mobile {
    padding: 4px 10px;
    font-size: 11px;
    border-radius: 4px;
  }

  .dark .json-btn {
    background: rgba(217,200,251,0.08);
    color: #d9c8fb;
  }

  .json-btn:hover {
    background: rgba(80,66,125,0.15);
  }

  .dark .json-btn:hover {
    background: rgba(217,200,251,0.15);
  }

  .json-btn.primary {
    background: linear-gradient(135deg, #722FC0, #8F5CEC);
    color: white;
  }

  .json-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 12px rgba(114,47,192,0.3);
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    background: rgba(80,66,125,0.08);
    color: #50427d;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-btn.mobile {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  .dark .close-btn {
    background: rgba(217,200,251,0.08);
    color: #d9c8fb;
  }

  .close-btn:hover {
    background: rgba(80,66,125,0.15);
    transform: scale(1.05);
  }

  .dark .close-btn:hover {
    background: rgba(217,200,251,0.15);
  }
</style>