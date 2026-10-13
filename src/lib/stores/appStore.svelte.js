// src/lib/stores/appStore.svelte.js
import { writable, get } from "svelte/store";
import { vkBridge } from "../services/vkBridge.js";
import { maxOpenedLevel } from "./gameStore.svelte.js";

// Уровень, после которого открывается редактор
const UNLOCK_AFTER_LEVEL = 1; // после прохождения L61 (индекс 60)

export const editorUnlocked = writable(false);
export const isEditorOpen = writable(false);
export const showEditorUnlockModal = writable(false);

let initialized = false;

export async function loadProgress() {
  if (initialized) return;
  initialized = true;

  // Загружаем сохранённый прогресс
  const saved = await vkBridge.getStorage("progress");
  if (saved) {
    if (typeof saved.maxOpenedLevel === "number") {
      maxOpenedLevel.set(saved.maxOpenedLevel);
    }
    if (saved.editorUnlocked) {
      editorUnlocked.set(true);
    }
  }

  // Проверяем разблокировку при изменении maxOpenedLevel
  maxOpenedLevel.subscribe(async (level) => {
    if (level >= UNLOCK_AFTER_LEVEL && !get(editorUnlocked)) {
      editorUnlocked.set(true);
      showEditorUnlockModal.set(true);
      await saveProgress();
    }
  });
}

async function saveProgress() {
  await vkBridge.setStorage("progress", {
    maxOpenedLevel: get(maxOpenedLevel),
    editorUnlocked: get(editorUnlocked),
  });
}

export function openEditor() {
  isEditorOpen.set(true);
  showEditorUnlockModal.set(false);
}

export function closeEditor() {
  isEditorOpen.set(false);
}

export function dismissUnlockModal() {
  showEditorUnlockModal.set(false);
}
