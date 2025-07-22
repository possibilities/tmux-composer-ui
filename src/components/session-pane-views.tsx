'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const XtermDisplay = dynamic(
  () => import('@/components/xterm-display').then(mod => mod.XtermDisplay),
  { ssr: false },
)

type SessionPane = {
  index: string
  width: number
  height: number
  currentCommand: string
  currentPath: string
  content: string
  cursorX: number
  cursorY: number
  active: boolean
}

interface SessionPaneViewsProps {
  pane: SessionPane
  windowName: string
}

export function SessionPaneViews({ pane, windowName }: SessionPaneViewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>
          {windowName} - Pane {pane.index} ({pane.width}x{pane.height})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <XtermDisplay
          content={pane.content}
          width={pane.width}
          height={pane.height}
          cursorX={pane.cursorX}
          cursorY={pane.cursorY}
        />
      </CardContent>
    </Card>
  )
}
