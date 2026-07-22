// src/lib/rendering/WallSVGs.js

import { Colors } from "../styles/colors.js";

function getColors(isDark) {
  return {
    light: Colors.Walls.light(isDark),
    accent: Colors.Walls.accent(isDark),
    shadow: Colors.Walls.shadow(isDark),
  };
}

export const WallSVGs = {
  // ============================================================
  // BOTTOM LAYER WALLS (rendered below balls and holes)
  // ============================================================

  // MARK: - TopWall (T)
  T: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${s}" height="${s * 0.5}" fill="${c.light}" rx="2"/>
        <path d="M0 ${s * 0.5} L${s} ${s * 0.5} L${s} ${s * 0.67} L0 ${s * 0.67} Z" fill="${c.accent}"/>
        <rect x="${s * 0.001}" y="${s * 0.67}" width="${s}" height="${s * 0.15}" fill="${c.shadow}" rx="1"/>
      </svg>
    `;
  },

  // MARK: - Block (B)
  B: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${s}" height="${s}" fill="${c.light}" rx="2"/>
      </svg>
    `;
  },

  // MARK: - TopLeftOutAngle (LOT)
  LOT: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    const inset = s * 0.001;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <!-- Shadow -->
        <path d="M${inset} ${s * 0.65} L${s * 0.32} ${s * 0.65} C${s * 0.419} ${s * 0.65} ${s * 0.5} ${s * 0.569} ${s * 0.5} ${s * 0.47} L${s * 0.5} ${s * 0.64} C${s * 0.5} ${s * 0.739} ${s * 0.419} ${s * 0.82} ${s * 0.32} ${s * 0.82} L${inset} ${s * 0.82} Z" fill="${c.shadow}"/>
        <!-- Accent -->
        <path d="M0 ${s * 0.5} L${s * 0.32} ${s * 0.5} C${s * 0.419} ${s * 0.5} ${s * 0.5} ${s * 0.419} ${s * 0.5} ${s * 0.32} L${s * 0.5} ${s * 0.49} C${s * 0.5} ${s * 0.589} ${s * 0.419} ${s * 0.67} ${s * 0.32} ${s * 0.67} L0 ${s * 0.67} Z" fill="${c.accent}"/>
        <!-- Light -->
        <path d="M${s * 0.5} 0 L${s * 0.5} ${s * 0.32} C${s * 0.5} ${s * 0.419} ${s * 0.419} ${s * 0.5} ${s * 0.32} ${s * 0.5} L0 ${s * 0.5} L0 0 Z" fill="${c.light}"/>
      </svg>
    `;
  },

  // MARK: - TopRightOutAngle (ROT)
  ROT: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    const inset = s * 0.001;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${s - inset} ${s * 0.65} L${s * 0.68} ${s * 0.65} C${s * 0.581} ${s * 0.65} ${s * 0.5} ${s * 0.569} ${s * 0.5} ${s * 0.47} L${s * 0.5} ${s * 0.64} C${s * 0.5} ${s * 0.739} ${s * 0.581} ${s * 0.82} ${s * 0.68} ${s * 0.82} L${s - inset} ${s * 0.82} Z" fill="${c.shadow}"/>
        <path d="M${s} ${s * 0.5} L${s * 0.68} ${s * 0.5} C${s * 0.581} ${s * 0.5} ${s * 0.5} ${s * 0.419} ${s * 0.5} ${s * 0.32} L${s * 0.5} ${s * 0.49} C${s * 0.5} ${s * 0.589} ${s * 0.581} ${s * 0.67} ${s * 0.68} ${s * 0.67} L${s} ${s * 0.67} Z" fill="${c.accent}"/>
        <path d="M${s * 0.5} 0 L${s * 0.5} ${s * 0.32} C${s * 0.5} ${s * 0.419} ${s * 0.581} ${s * 0.5} ${s * 0.68} ${s * 0.5} L${s} ${s * 0.5} L${s} 0 Z" fill="${c.light}"/>
      </svg>
    `;
  },

  // MARK: - TopLeftInAngle (LIT)
  LIT: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    const inset = s * 0.001;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${s - inset} ${s * 0.82} L${s * 0.68} ${s * 0.82} C${s * 0.58} ${s * 0.82} ${s * 0.5} ${s * 0.9} ${s * 0.5} ${s} L${s * 0.5} ${s * 0.83} C${s * 0.5} ${s * 0.73} ${s * 0.58} ${s * 0.65} ${s * 0.68} ${s * 0.65} L${s - inset} ${s * 0.65} Z" fill="${c.shadow}"/>
        <path d="M${s} ${s * 0.67} L${s * 0.68} ${s * 0.67} C${s * 0.58} ${s * 0.67} ${s * 0.5} ${s * 0.75} ${s * 0.5} ${s * 0.85} L${s * 0.5} ${s * 0.68} C${s * 0.5} ${s * 0.58} ${s * 0.58} ${s * 0.5} ${s * 0.68} ${s * 0.5} L${s} ${s * 0.5} Z" fill="${c.accent}"/>
        <path d="M0 0 L${s} 0 L${s} ${s * 0.5} L${s * 0.68} ${s * 0.5} C${s * 0.58} ${s * 0.5} ${s * 0.5} ${s * 0.58} ${s * 0.5} ${s * 0.68} L${s * 0.5} ${s} L0 ${s} Z" fill="${c.light}"/>
      </svg>
    `;
  },

  // MARK: - TopRightInAngle (RIT)
  RIT: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    const inset = s * 0.001;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${inset} ${s * 0.82} L${s * 0.32} ${s * 0.82} C${s * 0.42} ${s * 0.82} ${s * 0.5} ${s * 0.9} ${s * 0.5} ${s} L${s * 0.5} ${s * 0.83} C${s * 0.5} ${s * 0.73} ${s * 0.42} ${s * 0.65} ${s * 0.32} ${s * 0.65} L${inset} ${s * 0.65} Z" fill="${c.shadow}"/>
        <path d="M0 ${s * 0.67} L${s * 0.32} ${s * 0.67} C${s * 0.42} ${s * 0.67} ${s * 0.5} ${s * 0.75} ${s * 0.5} ${s * 0.85} L${s * 0.5} ${s * 0.68} C${s * 0.5} ${s * 0.58} ${s * 0.42} ${s * 0.5} ${s * 0.32} ${s * 0.5} L0 ${s * 0.5} Z" fill="${c.accent}"/>
        <path d="M${s} 0 L0 0 L0 ${s * 0.5} L${s * 0.32} ${s * 0.5} C${s * 0.42} ${s * 0.5} ${s * 0.5} ${s * 0.58} ${s * 0.5} ${s * 0.68} L${s * 0.5} ${s} L${s} ${s} Z" fill="${c.light}"/>
      </svg>
    `;
  },

  // ============================================================
  // TOP LAYER WALLS (rendered above balls and holes)
  // ============================================================

  // MARK: - LeftWall (L)
  L: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${s * 0.5}" height="${s}" fill="${c.light}" rx="2"/>
      </svg>
    `;
  },

  // MARK: - RightWall (R)
  R: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <rect x="${s * 0.5}" y="0" width="${s * 0.5}" height="${s}" fill="${c.light}" rx="2"/>
      </svg>
    `;
  },

  // MARK: - DownWall (D)
  D: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="${s * 0.5}" width="${s}" height="${s * 0.5}" fill="${c.light}" rx="2"/>
      </svg>
    `;
  },

  // ============================================================
  // BOTTOM CORNERS
  // ============================================================

  // MARK: - Bottom Left Inner Corner (LID)
  LID: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 ${s} V0 H${s * 0.5} V${s * 0.32} C${s * 0.5} ${s * 0.41941} ${s * 0.58059} ${s * 0.5} ${s * 0.68} ${s * 0.5} H${s} V${s} H0 Z" fill="${c.light}"/>
      </svg>
    `;
  },

  // MARK: - Bottom Right Inner Corner (RID)
  RID: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${s} ${s} V0 H${s * 0.5} V${s * 0.32} C${s * 0.5} ${s * 0.41941} ${s * 0.41941} ${s * 0.5} ${s * 0.32} ${s * 0.5} H0 V${s} H${s} Z" fill="${c.light}"/>
      </svg>
    `;
  },

  // MARK: - Bottom Left Outer Corner (LOD)
  LOD: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${s * 0.5} ${s} V${s * 0.68} C${s * 0.5} ${s * 0.58059} ${s * 0.41941} ${s * 0.5} ${s * 0.32} ${s * 0.5} H0 V${s} H${s * 0.5} Z" fill="${c.light}"/>
      </svg>
    `;
  },

  // MARK: - Bottom Right Outer Corner (ROD)
  ROD: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${s * 0.5} ${s} V${s * 0.68} C${s * 0.5} ${s * 0.58059} ${s * 0.58059} ${s * 0.5} ${s * 0.68} ${s * 0.5} H${s} V${s} H${s * 0.5} Z" fill="${c.light}"/>
      </svg>
    `;
  },

  // ============================================================
  // BRIDGES
  // ============================================================

  // MARK: - LeftBridge (LB)
  LB: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    const inset = s * 0.001;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${s - inset} ${s * 0.82} L${s * 0.68} ${s * 0.82} C${s * 0.58} ${s * 0.82} ${s * 0.5} ${s * 0.9} ${s * 0.5} ${s} L${s * 0.5} ${s * 0.83} C${s * 0.5} ${s * 0.73} ${s * 0.58} ${s * 0.65} ${s * 0.68} ${s * 0.65} L${s - inset} ${s * 0.65} Z" fill="${c.shadow}"/>
        <path d="M${s} ${s * 0.67} L${s * 0.68} ${s * 0.67} C${s * 0.58} ${s * 0.67} ${s * 0.5} ${s * 0.75} ${s * 0.5} ${s * 0.85} L${s * 0.5} ${s * 0.68} C${s * 0.5} ${s * 0.58} ${s * 0.58} ${s * 0.5} ${s * 0.68} ${s * 0.5} L${s} ${s * 0.5} Z" fill="${c.accent}"/>
        <path d="M${s} ${s * 0.5} L${s * 0.68} ${s * 0.5} C${s * 0.58} ${s * 0.5} ${s * 0.5} ${s * 0.58} ${s * 0.5} ${s * 0.68} L${s * 0.5} ${s} L0 ${s} L0 ${s * 0.5} L${s * 0.32} ${s * 0.5} C${s * 0.419} ${s * 0.5} ${s * 0.5} ${s * 0.419} ${s * 0.5} ${s * 0.32} L${s * 0.5} 0 L${s} 0 Z" fill="${c.light}"/>
        <ellipse cx="${s * 0.5}" cy="${s * 0.5}" rx="${s * 0.12}" ry="${s * 0.12}" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>
      </svg>
    `;
  },

  // MARK: - RightBridge (RB)
  RB: (isDark, size = 100) => {
    const c = getColors(isDark);
    const s = size;
    const inset = s * 0.001;
    return `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${inset} ${s * 0.82} L${s * 0.32} ${s * 0.82} C${s * 0.42} ${s * 0.82} ${s * 0.5} ${s * 0.9} ${s * 0.5} ${s} L${s * 0.5} ${s * 0.83} C${s * 0.5} ${s * 0.73} ${s * 0.42} ${s * 0.65} ${s * 0.32} ${s * 0.65} L${inset} ${s * 0.65} Z" fill="${c.shadow}"/>
        <path d="M0 ${s * 0.67} L${s * 0.32} ${s * 0.67} C${s * 0.42} ${s * 0.67} ${s * 0.5} ${s * 0.75} ${s * 0.5} ${s * 0.85} L${s * 0.5} ${s * 0.68} C${s * 0.5} ${s * 0.58} ${s * 0.42} ${s * 0.5} ${s * 0.32} ${s * 0.5} L0 ${s * 0.5} Z" fill="${c.accent}"/>
        <path d="M0 ${s * 0.5} L${s * 0.32} ${s * 0.5} C${s * 0.42} ${s * 0.5} ${s * 0.5} ${s * 0.58} ${s * 0.5} ${s * 0.68} L${s * 0.5} ${s} L${s} ${s} L${s} ${s * 0.5} L${s * 0.68} ${s * 0.5} C${s * 0.581} ${s * 0.5} ${s * 0.5} ${s * 0.419} ${s * 0.5} ${s * 0.32} L${s * 0.5} 0 L0 0 Z" fill="${c.light}"/>
        <ellipse cx="${s * 0.5}" cy="${s * 0.5}" rx="${s * 0.12}" ry="${s * 0.12}" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>
      </svg>
    `;
  },
};

export function getWallSVG(type, isDark = false, size = 100) {
  const generator = WallSVGs[type];
  if (!generator) return null;
  return generator(isDark, size);
}
