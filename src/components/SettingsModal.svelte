<!-- src/components/SettingsModal.svelte -->
<script>
  import {
    showSettings,
    soundEnabled,
    vibrationEnabled,
    isDarkMode,
  } from '../lib/stores/gameStore.svelte.js';
  import { soundManager } from '../lib/utils/sound.js';
  import { t } from '../lib/i18n/ru.js';

  function close() {
    showSettings.set(false);
  }

  function toggleSound() {
    soundEnabled.update((v) => {
      soundManager.enabled = !v;
      return !v;
    });
  }

  function toggleVibration() {
    vibrationEnabled.update((v) => !v);
  }

  function toggleDark() {
    isDarkMode.update((v) => {
      document.documentElement.classList.toggle('dark', !v);
      return !v;
    });
  }
</script>

{#if $showSettings}
  <div
    class="overlay"
    on:click={(e) => e.target === e.currentTarget && close()}
  >
    <div class="modal" class:dark={$isDarkMode}>
      <h2>{t.settings}</h2>

      <div class="setting" on:click={toggleSound}>
        <label>{t.soundEffects}</label>
        <div class="toggle">
          <div class="slider" class:active={$soundEnabled}></div>
        </div>
      </div>

      <div class="setting" on:click={toggleVibration}>
        <label>{t.vibration}</label>
        <div class="toggle">
          <div class="slider" class:active={$vibrationEnabled}></div>
        </div>
      </div>

      <div class="setting" on:click={toggleDark}>
        <label>{t.darkMode}</label>
        <div class="toggle">
          <div class="slider" class:active={$isDarkMode}></div>
        </div>
      </div>

      <button class="close-btn" on:click={close}>
        {t.close}
      </button>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
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
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  .modal.dark {
    background: #2d234b;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  }

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #50427d;
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
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    cursor: pointer;
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
    cursor: pointer;
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

  .slider {
    position: absolute;
    inset: 0;
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
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }

  .slider.active {
    background: #722fc0;
  }

  .slider.active::before {
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
    color: #50427d;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
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
    .modal { padding: 24px 20px 20px; }
  }
</style>