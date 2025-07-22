'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SessionWindow } from '@/lib/types'
import { calculateCharacterDimensions } from '@/lib/terminal-constants'

const XtermDisplay = dynamic(
  () => import('@/components/xterm-display').then(mod => mod.XtermDisplay),
  { ssr: false },
)

interface SessionWindowTiledProps {
  window: SessionWindow
}

export function SessionWindowTiled({ window }: SessionWindowTiledProps) {
  if (window.panes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{window.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground'>No panes in this window</div>
        </CardContent>
      </Card>
    )
  }

  const characterDimensions = calculateCharacterDimensions()
  const windowPixelWidth = window.windowWidth * characterDimensions.width
  const windowPixelHeight = window.windowHeight * characterDimensions.height

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>{window.name}</span>
          <span className='text-sm font-normal text-muted-foreground'>
            {window.panes.length} {window.panes.length === 1 ? 'pane' : 'panes'}{' '}
            • {window.windowWidth}×{window.windowHeight}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='overflow-x-auto'>
        <div
          className='relative bg-black'
          style={{
            width: `${windowPixelWidth}px`,
            height: `${windowPixelHeight}px`,
          }}
        >
          {window.panes.map(pane => {
            return (
              <div
                key={pane.index}
                className={`absolute overflow-hidden bg-black ${
                  pane.active ? 'ring-2 ring-green-500 ring-inset z-10' : ''
                }`}
                style={{
                  left: `${pane.left * characterDimensions.width}px`,
                  top: `${pane.top * characterDimensions.height}px`,
                  width: `${pane.width * characterDimensions.width}px`,
                  height: `${pane.height * characterDimensions.height}px`,
                }}
              >
                <XtermDisplay
                  content={pane.content}
                  width={pane.width}
                  height={pane.height}
                  cursorX={pane.cursorX}
                  cursorY={pane.cursorY}
                  isActive={pane.active}
                  noPadding
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
