<!-- src/components/Header.svelte -->
<script>
  import {
    restartLevel,
    toggleSettings,
    currentLevelIndex,
  } from '../lib/stores/gameStore.svelte.js';
  import { Colors } from '../lib/styles/colors.js';
  import { t } from '../lib/i18n/ru.js';

  let { onOpenLevels = null } = $props();

  const btnBg = `linear-gradient(135deg, ${Colors.buttonGradientStart}, ${Colors.buttonGradientEnd})`;
</script>

<header class="header">
  <button
    class="round-btn"
    style="background: {btnBg};"
    on:click={restartLevel}
    aria-label={t.restart}
    title={t.restart}
  >
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  </button>

  <button
    class="level-badge"
    on:click={() => onOpenLevels?.()}
    aria-label={t.levels}
    title={t.levels}
  >
    {t.level($currentLevelIndex + 1)}
  </button>

  <button
    class="round-btn"
    style="background: {btnBg};"
    on:click={toggleSettings}
    aria-label={t.settings}
    title={t.settings}
  >
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </button>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    max-width: 520px;
    padding: 6px 4px;
    box-sizing: border-box;
  }

  .round-btn {
    width: 64px;
    height: 64px;
    border: none;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    box-shadow: 0 4px 10px rgba(114, 47, 192, 0.25);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    flex-shrink: 0;
    padding: 0;
  }

  .round-btn:active {
    transform: translateY(2px) scale(0.96);
    box-shadow: 0 2px 6px rgba(114, 47, 192, 0.2);
  }

  .level-badge {
    flex: 1;
    max-width: 260px;
    padding: 18px 24px;
    border: none;
    border-radius: 24px;
    background: rgba(114, 47, 192, 0.18);
    color: #722FC0;
    font-size: 22px;
    font-weight: 700;
    font-family: inherit;
    letter-spacing: -0.3px;
    text-align: center;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.15s ease;
  }

  .level-badge:hover {
    background: rgba(114, 47, 192, 0.24);
  }

  .level-badge:active {
    transform: scale(0.98);
  }

  :global(.dark) .level-badge {
    background: rgba(166, 157, 212, 0.18);
    color: #D9C8FB;
  }

  :global(.dark) .level-badge:hover {
    background: rgba(166, 157, 212, 0.24);
  }

  @media (max-width: 480px) {
    .round-btn {
      width: 54px;
      height: 54px;
      border-radius: 18px;
    }

    .round-btn svg {
      width: 24px;
      height: 24px;
    }

    .level-badge {
      padding: 14px 18px;
      font-size: 18px;
      border-radius: 20px;
    }
  }
</style>