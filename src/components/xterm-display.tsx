'use client'

import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

interface XtermDisplayProps {
  content: string
  width?: number
  height?: number
  cursorX?: number
  cursorY?: number
  isActive?: boolean
}

export function XtermDisplay({
  content,
  width,
  height,
  cursorX,
  cursorY,
  isActive,
}: XtermDisplayProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstanceRef = useRef<Terminal | null>(null)
  const initializedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fontSize = 14
  const lineHeight = 1
  const cols = width || 80
  const rows = height || 24

  useEffect(() => {
    if (!terminalRef.current || initializedRef.current) return

    const initializeTerminal = async () => {
      await document.fonts.ready

      if (!terminalRef.current || initializedRef.current) return

      initializedRef.current = true

      const terminal = new Terminal({
        rows: rows,
        cols: cols,
        theme: {
          background: '#000000',
          foreground: '#ffffff',
          cursor: '#ffffff',
          cursorAccent: '#ffffff',
        },
        cursorStyle: 'block',
        cursorInactiveStyle: 'block',
        fontFamily: "'Fira Code', 'Courier', monospace",
        fontSize: fontSize,
        fontWeight: 'normal',
        lineHeight: lineHeight,
        convertEol: true,
        disableStdin: true,
        cursorBlink: false,
        scrollback: 0,
        rightClickSelectsWord: false,
      })

      const webLinksAddon = new WebLinksAddon()

      terminal.loadAddon(webLinksAddon)

      terminal.open(terminalRef.current)

      setTimeout(() => {
        if (containerRef.current && terminalRef.current) {
          const xtermScreen = terminalRef.current.querySelector('.xterm-screen')
          if (xtermScreen) {
            const screenWidth = xtermScreen.clientWidth
            containerRef.current.style.width = `${screenWidth + 32}px`
          }
        }
      }, 50)

      const trimmedContent = content.endsWith('\n')
        ? content.slice(0, -1)
        : content
      terminal.write(trimmedContent)

      const contentHasVisibleCursor = /\x1b\[\d+;\d+H|\x1b\[7m/.test(
        trimmedContent,
      )

      if (contentHasVisibleCursor || !isActive) {
        terminal.options.theme = {
          ...terminal.options.theme,
          cursor: '#000000',
          cursorAccent: '#000000',
        }
        terminal.options.cursorInactiveStyle = 'none'
      }

      if (
        !contentHasVisibleCursor &&
        cursorX !== undefined &&
        cursorY !== undefined
      ) {
        const col = Math.min(Math.max(cursorX + 1, 1), terminal.cols)
        const row = Math.min(Math.max(cursorY + 1, 1), terminal.rows)
        terminal.write(`\x1b[${row};${col}H`)
      }

      terminal.attachCustomWheelEventHandler(() => false)

      terminal.attachCustomKeyEventHandler(event => {
        if (event.ctrlKey || event.metaKey) {
          return false
        }
        return true
      })

      if (isActive && !contentHasVisibleCursor) {
        setTimeout(() => {
          terminal.focus()
        }, 100)
      } else {
        terminal.blur()
      }

      terminalInstanceRef.current = terminal
    }

    initializeTerminal()

    return () => {
      terminalInstanceRef.current?.dispose()
      terminalInstanceRef.current = null
      initializedRef.current = false
    }
  }, [content, rows, cols, cursorX, cursorY, isActive])

  return (
    <>
      <style>{`
        .xterm-viewport {
          overflow: hidden !important;
        }
        .xterm-viewport::-webkit-scrollbar {
          display: none;
        }
        .xterm-viewport {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div
        ref={containerRef}
        className='p-4 bg-black rounded'
        style={{
          borderRadius: 'calc(var(--radius) - 2px)',
          width: 'fit-content',
        }}
      >
        <div ref={terminalRef} />
      </div>
    </>
  )
}
