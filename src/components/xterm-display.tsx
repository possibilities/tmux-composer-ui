'use client'

import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
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
  const fitAddonRef = useRef<FitAddon | null>(null)
  const resizeHandlerRef = useRef<(() => void) | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!terminalRef.current || initializedRef.current) return

    const initializeTerminal = async () => {
      await document.fonts.ready

      if (!terminalRef.current || initializedRef.current) return

      initializedRef.current = true

      const terminal = new Terminal({
        rows: height || 24,
        cols: width || 80,
        theme: {
          background: '#000000',
          foreground: '#ffffff',
          cursor: '#ffffff',
          cursorAccent: '#ffffff',
        },
        cursorStyle: 'block',
        cursorInactiveStyle: 'block',
        fontFamily: "'Fira Code', 'Courier', monospace",
        fontSize: 14,
        fontWeight: 'normal',
        lineHeight: 1,
        convertEol: true,
        disableStdin: true,
        cursorBlink: false,
        scrollback: 0,
        rightClickSelectsWord: false,
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()

      terminal.loadAddon(fitAddon)
      terminal.loadAddon(webLinksAddon)

      terminal.open(terminalRef.current)

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

      fitAddon.fit()

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
      fitAddonRef.current = fitAddon

      const handleWindowResize = () => {
        fitAddon.fit()
      }
      resizeHandlerRef.current = handleWindowResize
      window.addEventListener('resize', handleWindowResize)
    }

    initializeTerminal()

    return () => {
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current)
      }
      terminalInstanceRef.current?.dispose()
      terminalInstanceRef.current = null
      fitAddonRef.current = null
      resizeHandlerRef.current = null
      initializedRef.current = false
    }
  }, [content, height, width, cursorX, cursorY, isActive])

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
        className='p-4 bg-black rounded'
        style={{
          borderRadius: 'calc(var(--radius) - 2px)',
        }}
      >
        <div ref={terminalRef} />
      </div>
    </>
  )
}
