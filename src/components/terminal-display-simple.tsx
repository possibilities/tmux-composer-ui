'use client'

interface TerminalDisplayProps {
  content: string
  width?: number
}

const TERMINAL_CHAR_WIDTH_PX = 8

export function TerminalDisplay({ content, width }: TerminalDisplayProps) {
  const terminalWidthPx = width ? width * TERMINAL_CHAR_WIDTH_PX : undefined

  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: '0.75rem',
        lineHeight: '1.5',
        padding: '1rem',
        borderRadius: 'calc(var(--radius) - 2px)',
        width: terminalWidthPx ? `${terminalWidthPx}px` : '100%',
        minWidth: terminalWidthPx ? `${terminalWidthPx}px` : 'auto',
        overflow: 'auto',
        whiteSpace: 'pre',
        wordBreak: 'normal',
        overflowWrap: 'normal',
      }}
    >
      {content}
    </div>
  )
}
