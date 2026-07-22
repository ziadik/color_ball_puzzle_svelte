// src/lib/utils/debug.js

// Global debug flag - set to false to disable all console.logs
let DEBUG = true;

// Debug levels
export const DebugLevel = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  VERBOSE: 5,
};

let currentLevel = DebugLevel.DEBUG;

export function setDebug(enabled) {
  DEBUG = enabled;
  console.log(`🐛 Debug ${enabled ? "ENABLED" : "DISABLED"}`);
}

export function setDebugLevel(level) {
  currentLevel = level;
  console.log(`🐛 Debug level set to ${level}`);
}

export function isDebugEnabled() {
  return DEBUG;
}

// Debug logger functions
export function debug(...args) {
  if (DEBUG && currentLevel >= DebugLevel.DEBUG) {
    console.log("🐛", ...args);
  }
}

export function debugVerbose(...args) {
  if (DEBUG && currentLevel >= DebugLevel.VERBOSE) {
    console.log("🔍", ...args);
  }
}

export function debugInfo(...args) {
  if (DEBUG && currentLevel >= DebugLevel.INFO) {
    console.log("ℹ️", ...args);
  }
}

export function debugWarn(...args) {
  if (DEBUG && currentLevel >= DebugLevel.WARN) {
    console.warn("⚠️", ...args);
  }
}

export function debugError(...args) {
  if (DEBUG && currentLevel >= DebugLevel.ERROR) {
    console.error("❌", ...args);
  }
}

// Create a debugger for a specific module
export function createDebugger(moduleName) {
  return {
    debug: (...args) => debug(`[${moduleName}]`, ...args),
    verbose: (...args) => debugVerbose(`[${moduleName}]`, ...args),
    info: (...args) => debugInfo(`[${moduleName}]`, ...args),
    warn: (...args) => debugWarn(`[${moduleName}]`, ...args),
    error: (...args) => debugError(`[${moduleName}]`, ...args),
  };
}

// Toggle debug from console
if (typeof window !== "undefined") {
  window.__debug = {
    enable: () => setDebug(true),
    disable: () => setDebug(false),
    toggle: () => setDebug(!DEBUG),
    setLevel: (level) => setDebugLevel(level),
    status: () =>
      console.log(
        `Debug: ${DEBUG ? "ENABLED" : "DISABLED"}, Level: ${currentLevel}`,
      ),
  };
}
