// src/lib/stores/editorStore.svelte.js
import { writable } from "svelte/store";

// Показывать ли стены в превью редактора
export const showWalls = writable(false);

export function toggleWalls() {
  showWalls.update((v) => !v);
}
