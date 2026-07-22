// src/lib/rendering/WallPainter.js
export class WallPainter {
  static getWallStyles(wallType, isDark = false) {
    const colors = {
      light: isDark ? "#4a3a6a" : "#f8f4ff",
      accent: isDark ? "#a69dd4" : "#8888b6",
      shadow: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.2)",
      border: isDark ? "rgba(166,157,212,0.3)" : "rgba(136,136,182,0.3)",
    };

    // Map wall types to painters - all functions must be defined
    const painters = {
      T: WallPainter.T,
      L: WallPainter.L,
      R: WallPainter.R,
      D: WallPainter.D,
      B: WallPainter.B,
      LOT: WallPainter.LOT,
      ROT: WallPainter.ROT,
      LIT: WallPainter.LIT,
      RIT: WallPainter.RIT,
      LID: WallPainter.LID,
      RID: WallPainter.RID,
      LOD: WallPainter.LOD,
      ROD: WallPainter.ROD,
      LB: WallPainter.LB,
      RB: WallPainter.RB,
    };

    const painter = painters[wallType];
    if (!painter) {
      // Return a basic rectangle for unknown types
      return {
        layers: [
          {
            type: "fill",
            rect: { top: 0, left: 0, width: 1, height: 1 },
            color: colors.light,
          },
        ],
        border: { color: colors.border, width: 0.5 },
      };
    }

    const style = painter(colors);
    if (!style.border) {
      style.border = { color: colors.border, width: 0.5 };
    }
    return style;
  }

  // MARK: - TopWall (T)
  static T(colors) {
    return {
      layers: [
        {
          type: "fill",
          rect: { top: 0, left: 0, width: 1, height: 0.5 },
          color: colors.light,
        },
        {
          type: "path",
          points: [
            { x: 0, y: 0.5 },
            { x: 1, y: 0.5 },
            { x: 1, y: 0.67 },
            { x: 0, y: 0.67 },
          ],
          color: colors.accent,
          close: true,
        },
        {
          type: "fill",
          rect: { top: 0.67, left: 0.08, width: 0.84, height: 0.15 },
          color: colors.shadow,
        },
      ],
    };
  }

  // MARK: - LeftWall (L)
  static L(colors) {
    return {
      layers: [
        {
          type: "fill",
          rect: { top: 0, left: 0, width: 0.5, height: 1 },
          color: colors.light,
        },
      ],
    };
  }

  // MARK: - RightWall (R)
  static R(colors) {
    return {
      layers: [
        {
          type: "fill",
          rect: { top: 0, left: 0.5, width: 0.5, height: 1 },
          color: colors.light,
        },
      ],
      flipX: true,
    };
  }

  // MARK: - DownWall (D)
  static D(colors) {
    return {
      layers: [
        {
          type: "fill",
          rect: { top: 0.5, left: 0, width: 1, height: 0.5 },
          color: colors.light,
        },
      ],
    };
  }

  // MARK: - Block (B)
  static B(colors) {
    return {
      layers: [
        {
          type: "fill",
          rect: { top: 0, left: 0, width: 1, height: 1 },
          color: colors.light,
        },
      ],
    };
  }

  // MARK: - TopLeftOutAngle (LOT)
  static LOT(colors) {
    const shadowInset = 0.08;
    return {
      layers: [
        {
          type: "path",
          points: [
            { x: shadowInset, y: 0.65 },
            { x: 0.32, y: 0.65 },
          ],
          curve: [
            {
              x: 0.5,
              y: 0.47,
              cp1: { x: 0.419, y: 0.65 },
              cp2: { x: 0.5, y: 0.569 },
            },
          ],
          lineTo: [{ x: 0.5, y: 0.64 }],
          curveTo: [
            {
              x: 0.32,
              y: 0.82,
              cp1: { x: 0.5, y: 0.739 },
              cp2: { x: 0.419, y: 0.82 },
            },
          ],
          lineTo: [{ x: shadowInset, y: 0.82 }],
          close: true,
          color: colors.shadow,
        },
        {
          type: "path",
          points: [
            { x: 0, y: 0.5 },
            { x: 0.32, y: 0.5 },
          ],
          curve: [
            {
              x: 0.5,
              y: 0.32,
              cp1: { x: 0.419, y: 0.5 },
              cp2: { x: 0.5, y: 0.419 },
            },
          ],
          lineTo: [{ x: 0.5, y: 0.49 }],
          curveTo: [
            {
              x: 0.32,
              y: 0.67,
              cp1: { x: 0.5, y: 0.589 },
              cp2: { x: 0.419, y: 0.67 },
            },
          ],
          lineTo: [{ x: 0, y: 0.67 }],
          close: true,
          color: colors.accent,
        },
        {
          type: "path",
          points: [
            { x: 0.5, y: 0 },
            { x: 0.5, y: 0.32 },
          ],
          curve: [
            {
              x: 0.32,
              y: 0.5,
              cp1: { x: 0.5, y: 0.419 },
              cp2: { x: 0.419, y: 0.5 },
            },
          ],
          lineTo: [
            { x: 0, y: 0.5 },
            { x: 0, y: 0 },
          ],
          close: true,
          color: colors.light,
        },
      ],
    };
  }

  // MARK: - TopRightOutAngle (ROT)
  static ROT(colors) {
    const style = WallPainter.LOT(colors);
    style.flipX = true;
    return style;
  }

  // MARK: - TopLeftInAngle (LIT)
  static LIT(colors) {
    const shadowInset = 0.08;
    return {
      layers: [
        {
          type: "path",
          points: [
            { x: 1 - shadowInset, y: 0.82 },
            { x: 0.68, y: 0.82 },
          ],
          curve: [
            {
              x: 0.5,
              y: 1,
              cp1: { x: 0.58, y: 0.82 },
              cp2: { x: 0.5, y: 0.9 },
            },
          ],
          lineTo: [{ x: 0.5, y: 0.83 }],
          curveTo: [
            {
              x: 0.68,
              y: 0.65,
              cp1: { x: 0.5, y: 0.73 },
              cp2: { x: 0.58, y: 0.65 },
            },
          ],
          lineTo: [{ x: 1 - shadowInset, y: 0.65 }],
          close: true,
          color: colors.shadow,
        },
        {
          type: "path",
          points: [
            { x: 1, y: 0.67 },
            { x: 0.68, y: 0.67 },
          ],
          curve: [
            {
              x: 0.5,
              y: 0.85,
              cp1: { x: 0.58, y: 0.67 },
              cp2: { x: 0.5, y: 0.75 },
            },
          ],
          lineTo: [{ x: 0.5, y: 0.68 }],
          curveTo: [
            {
              x: 0.68,
              y: 0.5,
              cp1: { x: 0.5, y: 0.58 },
              cp2: { x: 0.58, y: 0.5 },
            },
          ],
          lineTo: [{ x: 1, y: 0.5 }],
          close: true,
          color: colors.accent,
        },
        {
          type: "path",
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 0.5 },
            { x: 0.68, y: 0.5 },
          ],
          curve: [
            {
              x: 0.5,
              y: 0.68,
              cp1: { x: 0.58, y: 0.5 },
              cp2: { x: 0.5, y: 0.58 },
            },
          ],
          lineTo: [
            { x: 0.5, y: 1 },
            { x: 0, y: 1 },
          ],
          close: true,
          color: colors.light,
        },
      ],
    };
  }

  // MARK: - TopRightInAngle (RIT)
  static RIT(colors) {
    const style = WallPainter.LIT(colors);
    style.flipX = true;
    return style;
  }

  // MARK: - DownLeftInAngle (LID)
  static LID(colors) {
    return {
      layers: [
        {
          type: "path",
          points: [
            { x: 0, y: 1 },
            { x: 0, y: 0 },
            { x: 0.5, y: 0 },
          ],
          curve: [
            {
              x: 0.68,
              y: 0.5,
              cp1: { x: 0.5, y: 0.419 },
              cp2: { x: 0.58, y: 0.5 },
            },
          ],
          lineTo: [
            { x: 1, y: 0.5 },
            { x: 1, y: 1 },
          ],
          close: true,
          color: colors.light,
        },
      ],
    };
  }

  // MARK: - DownRightInAngle (RID)
  static RID(colors) {
    const style = WallPainter.LID(colors);
    style.flipX = true;
    return style;
  }

  // MARK: - DownLeftOutAngle (LOD)
  static LOD(colors) {
    return {
      layers: [
        {
          type: "path",
          points: [
            { x: 0, y: 1 },
            { x: 0, y: 0 },
            { x: 0.5, y: 0 },
          ],
          curve: [
            {
              x: 0.68,
              y: 0.5,
              cp1: { x: 0.5, y: 0.419 },
              cp2: { x: 0.58, y: 0.5 },
            },
          ],
          lineTo: [
            { x: 1, y: 0.5 },
            { x: 1, y: 1 },
          ],
          close: true,
          color: colors.light,
        },
      ],
      flipX: true,
    };
  }

  // MARK: - DownRightOutAngle (ROD)
  static ROD(colors) {
    return {
      layers: [
        {
          type: "path",
          points: [
            { x: 0.5, y: 1 },
            { x: 0.5, y: 0.68 },
          ],
          curve: [
            {
              x: 0.68,
              y: 0.5,
              cp1: { x: 0.5, y: 0.58 },
              cp2: { x: 0.58, y: 0.5 },
            },
          ],
          lineTo: [
            { x: 1, y: 0.5 },
            { x: 1, y: 1 },
          ],
          close: true,
          color: colors.light,
        },
      ],
    };
  }

  // MARK: - LeftBridge (LB)
  static LB(colors) {
    return {
      layers: [
        {
          type: "path",
          points: [
            { x: 1, y: 0.67 },
            { x: 0.68, y: 0.67 },
          ],
          curve: [
            {
              x: 0.5,
              y: 0.85,
              cp1: { x: 0.58, y: 0.67 },
              cp2: { x: 0.5, y: 0.75 },
            },
          ],
          lineTo: [{ x: 0.5, y: 0.68 }],
          curveTo: [
            {
              x: 0.68,
              y: 0.5,
              cp1: { x: 0.5, y: 0.58 },
              cp2: { x: 0.58, y: 0.5 },
            },
          ],
          lineTo: [{ x: 1, y: 0.5 }],
          close: true,
          color: colors.accent,
        },
        {
          type: "path",
          points: [
            { x: 1, y: 0.5 },
            { x: 0.68, y: 0.5 },
          ],
          curve: [
            {
              x: 0.5,
              y: 0.68,
              cp1: { x: 0.58, y: 0.5 },
              cp2: { x: 0.5, y: 0.58 },
            },
          ],
          lineTo: [
            { x: 0.5, y: 1 },
            { x: 0, y: 1 },
            { x: 0, y: 0.5 },
            { x: 0.32, y: 0.5 },
          ],
          curve: [
            {
              x: 0.5,
              y: 0.32,
              cp1: { x: 0.419, y: 0.5 },
              cp2: { x: 0.5, y: 0.419 },
            },
          ],
          lineTo: [
            { x: 0.5, y: 0 },
            { x: 1, y: 0 },
          ],
          close: true,
          color: colors.light,
        },
      ],
    };
  }

  // MARK: - RightBridge (RB)
  static RB(colors) {
    const style = WallPainter.LB(colors);
    style.flipX = true;
    return style;
  }
}
