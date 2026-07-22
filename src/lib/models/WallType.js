// src/lib/models/WallType.js

export const WallType = {
  L: "L",
  R: "R",
  T: "T",
  LIT: "LIT",
  RIT: "RIT",
  LOT: "LOT",
  ROT: "ROT",
  D: "D",
  LID: "LID",
  RID: "RID",
  LOD: "LOD",
  ROD: "ROD",
  B: "B",
  LB: "LB",
  RB: "RB",
  N: "N",
};

// First layer walls (Layer 4 from iOS - below balls)
// T, LIT, RIT, LOT, B, ROT
export function isFirstLayer(type) {
  return [
    WallType.T,
    WallType.LIT,
    WallType.RIT,
    WallType.LOT,
    WallType.B,
    WallType.ROT,
  ].includes(type);
}

// Second layer walls (Layer 6 from iOS - above balls)
// L, R, D, LID, RID, LOD, ROD, LB, RB
export function isSecondLayer(type) {
  return [
    WallType.L,
    WallType.R,
    WallType.D,
    WallType.LID,
    WallType.RID,
    WallType.LOD,
    WallType.ROD,
    WallType.LB,
    WallType.RB,
  ].includes(type);
}

// Check if wall needs horizontal flip (for R, RIT, RID, ROT, RB, LOD)
export function needsFlipX(type) {
  return [
    WallType.R,
    WallType.RIT,
    WallType.RID,
    WallType.ROT,
    WallType.RB,
    WallType.LOD,
  ].includes(type);
}

// Get wall layer as string
export function getWallLayer(type) {
  if (isFirstLayer(type)) return "bottom";
  if (isSecondLayer(type)) return "top";
  return null;
}

// Check if type is a bridge (for shadow rendering)
export function isBridge(type) {
  return [WallType.LB, WallType.RB].includes(type);
}
