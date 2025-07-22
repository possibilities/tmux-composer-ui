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
}

export function XtermDisplay({
  content,
  width,
  height,
  cursorX,
  cursorY,
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
          cursorAccent: '#000000',
        },
        cursorStyle: 'block',
        cursorInactiveStyle: 'block',
        fontFamily: "'Fira Code', 'Fira Code Retina', monospace",
        fontSize: 14,
        fontWeight: 'normal',
        lineHeight: 1.2,
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
      terminal.write(content)
      if (cursorX !== undefined && cursorY !== undefined) {
        const col = Math.min(Math.max(cursorX + 1, 1), terminal.cols)
        const row = Math.min(Math.max(cursorY + 1, 1), terminal.rows)
        terminal.write(`\x1b[${row};${col}H`)
      }
      fitAddon.fit()

      terminal.attachCustomWheelEventHandler(() => false)

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
  }, [content, height, width, cursorX, cursorY])

  return (
    <div
      className='p-4 bg-black rounded'
      style={{
        borderRadius: 'calc(var(--radius) - 2px)',
      }}
    >
      <div ref={terminalRef} />
    </div>
  )
}
