// src/lib/styles/colors.js

export const Colors = {
  // MARK: - Основные цвета приложения
  Background: {
    appBackground: (isDark) => (isDark ? "#363344" : "#F8F4FF"),
    fieldBackground: (isDark) => (isDark ? "#2D234B" : "#50427D"),
  },

  // MARK: - Цвета сетки
  Grid: {
    grid: (isDark) =>
      isDark ? "rgba(100, 86, 145, 0.3)" : "rgba(59, 45, 104, 0.4)",
  },

  // MARK: - Цвета стен
  Walls: {
    light: (isDark) => (isDark ? "#363344" : "#F8F4FF"),
    accent: (isDark) => (isDark ? "#A69DD4" : "#8889B6"),
    shadow: (isDark) => (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.2)"),
  },

  // MARK: - Цвета интерфейса
  UI: {
    levelText: (isDark) => (isDark ? "#FFFFFF" : "#50427D"),
    buttonTint: (isDark) => (isDark ? "#FFFFFF" : "#50427D"),
    hintButton: (isDark) => (isDark ? "#FFD700" : "#50427D"),
  },

  // MARK: - Цвета игровых объектов
  GameObjects: {
    ballHighlight: (isDark) =>
      isDark ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
    holeStroke: (isDark, color) => (isDark ? color : color),
  },

  // MARK: - Основные цвета
  primary: "#50427D",
  secondary: "#4CAF50",
  backgroundColor: "#F8F4FF",
  surfaceColor: "#F8F4FF",
  errorColor: "#F44336",
  successColor: "#4CAF50",
  warningColor: "#FF9800",
  infoColor: "#2196F3",

  // Градиент кнопок
  buttonGradientStart: "#722FC0",
  buttonGradientEnd: "#8F5CEC",
  buttonIconColor: "#D9C8FB",

  // Alert цвета
  alertTitleColor: (isDark) => (isDark ? "#FFFFFF" : "#50427D"),
  alertMessageColor: (isDark) => (isDark ? "#FFFFFF" : "rgba(80,66,125,0.8)"),
  alertBackgroundColor: (isDark) => (isDark ? "#2D2341" : "#F8F4FF"),
  alertBorderColor: (isDark) => (isDark ? "rgba(166,157,212,0.5)" : "#50427D"),
  alertSuccessActionColor: (isDark) => (isDark ? "#4CAF50" : "#4CAF50"),
  alertCancelActionColor: (isDark) =>
    isDark ? "rgba(255,255,255,0.9)" : "rgba(80,66,125,0.6)",
  alertDestructiveActionColor: (isDark) => (isDark ? "#FF4D4D" : "#F44336"),
};
