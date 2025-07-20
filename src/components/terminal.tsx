'use client'

import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'

interface TerminalProps {
  width: number
  height: number
  content?: string
}

export function Terminal({ width, height, content }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    const initTerminal = async () => {
      await document.fonts.ready

      const term = new XTerm({
        rows: height + 1,
        cols: width,
        fontFamily: '"Fira Code", Monaco, Consolas, "Courier New", monospace',
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 1.0,
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
        },
        cursorBlink: false,
        cursorStyle: 'underline',
        scrollback: 0,
        disableStdin: true,
        allowTransparency: false,
        rightClickSelectsWord: false,
        convertEol: true,
      })

      term.open(terminalRef.current!)
      xtermRef.current = term

      setTimeout(() => {
        const terminalElement =
          terminalRef.current?.querySelector('.xterm-screen')
        if (terminalElement) {
          const rect = terminalElement.getBoundingClientRect()
          terminalRef.current!.style.width = `${rect.width}px`
          terminalRef.current!.style.height = `${rect.height}px`
        }
      }, 0)

      if (content) {
        const lines = content.split('\n')
        lines.forEach((line, index) => {
          term.write(line)
          if (index < lines.length - 1) {
            term.write('\r\n')
          }
        })
      } else {
        term.write('No content available for this pane')
      }

      return term
    }

    let terminal: XTerm | undefined

    initTerminal().then(term => {
      terminal = term
    })

    return () => {
      terminal?.dispose()
    }
  }, [width, height, content])

  return (
    <div
      ref={terminalRef}
      className='bg-[#1e1e1e] rounded-md [&_.xterm-viewport]:overflow-hidden [&_.xterm-viewport::-webkit-scrollbar]:hidden pointer-events-none select-none'
      style={{ userSelect: 'none' }}
    />
  )
}
