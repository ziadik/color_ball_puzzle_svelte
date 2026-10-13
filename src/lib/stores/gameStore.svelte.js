// src/lib/stores/gameStore.svelte.js
import { writable, derived } from "svelte/store";
import { LevelManager } from "../engine/LevelManager.js";
import { FieldEngine } from "../engine/FieldEngine.js";
import { soundManager } from "../utils/sound.js";

const levelManager = new LevelManager();

export const currentLevelIndex = writable(0);
export const maxOpenedLevel = writable(0);
export const fieldEngine = writable(null);
export const isDarkMode = writable(
  typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches,
);
export const soundEnabled = writable(true);
export const vibrationEnabled = writable(true);
export const showWinModal = writable(false);
export const showSettings = writable(false);
export const showHint = writable(false);
export const movesCount = writable(0);
export const isWin = writable(false);

export const levelName = derived(
  currentLevelIndex,
  ($index) => `Level ${$index + 1}`,
);

export const totalLevels = writable(levelManager.totalLevels);

export function loadLevel(index) {
  if (index >= levelManager.totalLevels) return;
  if (index > maxOpenedLevel) return;

  levelManager.currentLevelIndex = index;
  currentLevelIndex.set(index);

  const level = levelManager.getCurrentLevel();
  const engine = new FieldEngine(level);
  fieldEngine.set(engine);

  movesCount.set(0);
  isWin.set(false);
  showWinModal.set(false);
  showHint.set(false);
}

export function loadCurrentLevel() {
  const index = levelManager.currentLevelIndex;
  loadLevel(index);
}

export function nextLevel() {
  const next = levelManager.currentLevelIndex + 1;
  if (next >= levelManager.totalLevels) return;
  if (next > maxOpenedLevel) return;
  loadLevel(next);
}

export function previousLevel() {
  const prev = levelManager.currentLevelIndex - 1;
  if (prev < 0) return;
  loadLevel(prev);
}

export function restartLevel() {
  loadLevel(levelManager.currentLevelIndex);
}

export function makeMove(x, y, direction) {
  let currentEngine = null;
  const unsubscribe = fieldEngine.subscribe((e) => {
    currentEngine = e;
  });
  unsubscribe();

  if (!currentEngine) return false;

  const success = currentEngine.makeTurn(x, y, direction);
  if (success) {
    movesCount.set(currentEngine.movesCount);
    if (currentEngine.isWin()) {
      isWin.set(true);
      showWinModal.set(true);

      // Обновляем прогресс
      let currentMax = 0;
      maxOpenedLevel.subscribe((v) => (currentMax = v))();

      const newMax = Math.max(currentMax, levelManager.currentLevelIndex + 1);
      if (newMax > currentMax) {
        maxOpenedLevel.set(newMax);

        // Сохраняем в VK Storage
        import("../services/vkBridge.js").then(({ vkBridge }) => {
          vkBridge.setStorage("progress", {
            maxOpenedLevel: newMax,
            editorUnlocked: newMax > 60,
          });
        });
      }
    }
    fieldEngine.set(currentEngine);
    return true;
  }
  return false;
}

export function undoMove() {
  let currentEngine = null;
  const unsubscribe = fieldEngine.subscribe((e) => {
    currentEngine = e;
  });
  unsubscribe();

  if (!currentEngine) return;

  if (currentEngine.undo()) {
    movesCount.set(currentEngine.movesCount);
    isWin.set(false);
    showWinModal.set(false);
    fieldEngine.set(currentEngine);
  }
}

export function useHint() {
  let currentEngine = null;
  const unsubscribe = fieldEngine.subscribe((e) => {
    currentEngine = e;
  });
  unsubscribe();

  if (!currentEngine) return null;

  const hint = currentEngine.getHint();
  if (hint) {
    showHint.set(true);
    setTimeout(() => showHint.set(false), 1500);
  }
  return hint;
}

export function toggleSettings() {
  showSettings.update((v) => !v);
}

export function toggleSound() {
  soundEnabled.update((v) => {
    soundManager.enabled = !v;
    return !v;
  });
}

export function toggleVibration() {
  vibrationEnabled.update((v) => !v);
}

export function toggleDarkMode() {
  isDarkMode.update((v) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", !v);
    }
    return !v;
  });
}

if (typeof window !== "undefined") {
  loadLevel(0);

  isDarkMode.subscribe((isDark) => {
    document.documentElement.classList.toggle("dark", isDark);
  });
}
