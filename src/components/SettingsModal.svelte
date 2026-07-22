<script>
  import { 
    showSettings, 
    soundEnabled, 
    vibrationEnabled, 
    isDarkMode,
    toggleSound,
    toggleVibration,
    toggleDarkMode
  } from '../lib/stores/gameStore.svelte.js';

  function close() {
    showSettings.set(false);
  }
</script>

{#if $showSettings}
  <div class="overlay" on:click={e => e.target === e.currentTarget && close()}>
    <div class="modal" class:dark={$isDarkMode}>
      <h2>Settings</h2>

      <div class="setting">
        <label>Sound Effects</label>
        <div class="toggle">
          <input type="checkbox" checked={$soundEnabled} on:change={toggleSound} />
          <span class="slider"></span>
        </div>
      </div>

      <div class="setting">
        <label>Vibration</label>
        <div class="toggle">
          <input type="checkbox" checked={$vibrationEnabled} on:change={toggleVibration} />
          <span class="slider"></span>
        </div>
      </div>

      <div class="setting">
        <label>Dark Mode</label>
        <div class="toggle">
          <input type="checkbox" checked={$isDarkMode} on:change={toggleDarkMode} />
          <span class="slider"></span>
        </div>
      </div>

      <button class="close-btn" on:click={close}>Close</button>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .modal {
    background: #ffffff;
    border-radius: 24px;
    padding: 28px 24px 24px;
    max-width: 320px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }

  .modal.dark {
    background: #2d234b;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #50427D;
    margin: 0 0 20px;
    text-align: center;
  }

  .modal.dark h2 {
    color: #d9c8fb;
  }

  .setting {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  .modal.dark .setting {
    border-bottom: 1px solid rgba(217, 200, 251, 0.08);
  }

  .setting:last-of-type {
    border-bottom: none;
  }

  .setting label {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }

  .modal.dark .setting label {
    color: #d9c8fb;
  }

  .toggle {
    position: relative;
    width: 44px;
    height: 26px;
    flex-shrink: 0;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ccc;
    border-radius: 26px;
    cursor: pointer;
    transition: 0.3s;
  }

  .slider::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    transition: 0.3s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }

  .toggle input:checked + .slider {
    background: #722FC0;
  }

  .toggle input:checked + .slider::before {
    transform: translateX(18px);
  }

  .close-btn {
    width: 100%;
    margin-top: 18px;
    padding: 13px;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    background: rgba(80, 66, 125, 0.08);
    color: #50427D;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .modal.dark .close-btn {
    background: rgba(217, 200, 251, 0.08);
    color: #d9c8fb;
  }

  .close-btn:hover {
    background: rgba(80, 66, 125, 0.14);
  }

  .modal.dark .close-btn:hover {
    background: rgba(217, 200, 251, 0.14);
  }

  .close-btn:active {
    transform: scale(0.96);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: 400px) {
    .modal {
      padding: 24px 20px 20px;
    }
  }
</style>