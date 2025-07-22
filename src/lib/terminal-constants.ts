export const TERMINAL_FONT_SIZE = 14

export const MONOSPACE_WIDTH_TO_HEIGHT_RATIO = 0.6

export const TERMINAL_LINE_HEIGHT_MULTIPLIER = 1.2

export function calculateCharacterDimensions() {
  const characterWidth = TERMINAL_FONT_SIZE * MONOSPACE_WIDTH_TO_HEIGHT_RATIO
  const characterHeight = TERMINAL_FONT_SIZE * TERMINAL_LINE_HEIGHT_MULTIPLIER

  return {
    width: characterWidth,
    height: characterHeight,
  }
}
