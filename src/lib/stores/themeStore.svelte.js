// src/lib/stores/themeStore.svelte.js
import { writable } from "svelte/store";

export const isDarkMode = writable(
  typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches,
);

export function toggleDarkMode() {
  isDarkMode.update((v) => {
    const newValue = !v;
    document.documentElement.classList.toggle("dark", newValue);
    return newValue;
  });
}

export function setDarkMode(value) {
  isDarkMode.set(value);
  document.documentElement.classList.toggle("dark", value);
}
