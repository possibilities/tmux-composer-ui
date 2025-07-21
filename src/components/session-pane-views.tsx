'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TerminalDisplay } from '@/components/terminal-display-simple'

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
}

interface SessionPaneViewsProps {
  pane: SessionPane
  windowName: string
  sessionName: string
}

export function SessionPaneViews({
  pane,
  windowName,
  sessionName,
}: SessionPaneViewsProps) {
  const paneIdentifier = `${sessionName}-${windowName}-${pane.index}`

  return (
    <>
      <Card key={`${paneIdentifier}-pre`}>
        <CardHeader>
          <CardTitle className='text-lg'>
            {windowName} - Pane {pane.index} [pre]
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className='overflow-auto rounded-md bg-muted p-4 text-xs'>
            {pane.content}
          </pre>
        </CardContent>
      </Card>
      <Card key={`${paneIdentifier}-term`} className='overflow-visible'>
        <CardHeader>
          <CardTitle className='text-lg'>
            {windowName} - Pane {pane.index} [term] ({pane.width}x{pane.height})
          </CardTitle>
        </CardHeader>
        <CardContent className='overflow-visible p-0'>
          <TerminalDisplay content={pane.content} width={pane.width} />
        </CardContent>
      </Card>
      <Card key={`${paneIdentifier}-xterm`}>
        <CardHeader>
          <CardTitle className='text-lg'>
            {windowName} - Pane {pane.index} [xterm] ({pane.width}x{pane.height}
            )
          </CardTitle>
        </CardHeader>
        <CardContent>
          <XtermDisplay
            content={pane.content}
            width={pane.width}
            height={pane.height}
          />
        </CardContent>
      </Card>
    </>
  )
}
