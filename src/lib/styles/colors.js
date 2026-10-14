// src/lib/styles/colors.js

// ============================================================
// БАЗОВЫЕ ПАЛИТРЫ
// ============================================================

const Palette = {
  // Шары и лунки
  Ball: {
    1: { name: "Green", hex: "#34C759", emoji: "🟢" },
    2: { name: "Red", hex: "#FF3B30", emoji: "🔴" },
    3: { name: "Blue", hex: "#007AFF", emoji: "🔵" },
    4: { name: "Yellow", hex: "#FFCC00", emoji: "🟡" },
    5: { name: "Purple", hex: "#AF52DE", emoji: "🟣" },
    6: { name: "Cyan", hex: "#32ADE6", emoji: "🔷" },
  },

  // Акценты
  Accent: {
    primary: "#50427D",
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
    info: "#2196F3",
    gradientStart: "#722FC0",
    gradientEnd: "#8F5CEC",
    gradientIcon: "#D9C8FB",
  },

  // Фоны
  Surface: {
    light: "#F8F4FF",
    dark: "#363344",
  },
};

// ============================================================
// ПРОИЗВОДНЫЕ
// ============================================================

export const Colors = {
  BallMap: Palette.Ball,
  ballColor: (color) => Palette.Ball[color]?.hex || "#999999",
  ballMeta: (color) => Palette.Ball[color] || null,

  Background: {
    appBackground: (isDark) =>
      isDark ? Palette.Surface.dark : Palette.Surface.light,
    fieldBackground: (isDark) => (isDark ? "#2D234B" : "#50427D"),
  },

  Grid: {
    grid: (isDark) =>
      isDark ? "rgba(100, 86, 145, 0.3)" : "rgba(59, 45, 104, 0.4)",
  },

  Walls: {
    light: (isDark) => (isDark ? Palette.Surface.dark : Palette.Surface.light),
    accent: (isDark) => (isDark ? "#A69DD4" : "#8889B6"),
    shadow: (isDark) => (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.2)"),
  },

  UI: {
    levelText: (isDark) => (isDark ? "#FFFFFF" : Palette.Accent.primary),
    buttonTint: (isDark) => (isDark ? "#FFFFFF" : Palette.Accent.primary),
    hintButton: (isDark) => (isDark ? "#FFD700" : Palette.Accent.primary),
  },

  GameObjects: {
    ballHighlight: (isDark) =>
      isDark ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
    holeStroke: (isDark, color) => color,
  },

  primary: Palette.Accent.primary,
  secondary: Palette.Accent.success,
  errorColor: Palette.Accent.error,
  successColor: Palette.Accent.success,
  warningColor: Palette.Accent.warning,
  infoColor: Palette.Accent.info,

  backgroundColor: Palette.Surface.light,
  surfaceColor: Palette.Surface.light,

  buttonGradientStart: Palette.Accent.gradientStart,
  buttonGradientEnd: Palette.Accent.gradientEnd,
  buttonIconColor: Palette.Accent.gradientIcon,

  alertTitleColor: (isDark) => (isDark ? "#FFFFFF" : Palette.Accent.primary),
  alertMessageColor: (isDark) => (isDark ? "#FFFFFF" : "rgba(80,66,125,0.8)"),
  alertBackgroundColor: (isDark) =>
    isDark ? "#2D2341" : Palette.Surface.light,
  alertBorderColor: (isDark) =>
    isDark ? "rgba(166,157,212,0.5)" : Palette.Accent.primary,
  alertSuccessActionColor: () => Palette.Accent.success,
  alertCancelActionColor: (isDark) =>
    isDark ? "rgba(255,255,255,0.9)" : "rgba(80,66,125,0.6)",
  alertDestructiveActionColor: (isDark) =>
    isDark ? "#FF4D4D" : Palette.Accent.error,
};
