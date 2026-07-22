export const GameColor = {
  GRAY: 0,
  GREEN: 1,
  RED: 2,
  BLUE: 3,
  YELLOW: 4,
  PURPLE: 5,
  CYAN: 6,
};

export function colorToCss(color, isDark = false) {
  const colors = {
    [GameColor.GRAY]: isDark ? '#666666' : '#999999',
    [GameColor.GREEN]: '#34C759',
    [GameColor.RED]: '#FF3B30',
    [GameColor.BLUE]: '#007AFF',
    [GameColor.YELLOW]: '#FFCC00',
    [GameColor.PURPLE]: '#AF52DE',
    [GameColor.CYAN]: '#32ADE6',
  };
  return colors[color] || '#999999';
}

export function colorToHex(color) {
  const colors = {
    [GameColor.GRAY]: '#999999',
    [GameColor.GREEN]: '#34C759',
    [GameColor.RED]: '#FF3B30',
    [GameColor.BLUE]: '#007AFF',
    [GameColor.YELLOW]: '#FFCC00',
    [GameColor.PURPLE]: '#AF52DE',
    [GameColor.CYAN]: '#32ADE6',
  };
  return colors[color] || '#999999';
}