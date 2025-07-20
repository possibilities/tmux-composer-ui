'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Terminal } from '@/components/terminal'

interface Pane {
  index: number
  width: number
  height: number
  content?: string
}

interface Window {
  index: number
  name: string
  panes: Pane[]
}

interface SessionTerminalsProps {
  windows: Window[]
}

export function SessionTerminals({ windows }: SessionTerminalsProps) {
  if (!windows || windows.length === 0) {
    return (
      <div className='text-muted-foreground text-center py-8'>
        No windows found in session
      </div>
    )
  }

  const defaultWindow = windows[0]?.index.toString() || '0'

  return (
    <Tabs defaultValue={defaultWindow} className='gap-0'>
      <TabsList>
        {windows.map(window => (
          <TabsTrigger key={window.index} value={window.index.toString()}>
            {window.name || `Window ${window.index}`}
          </TabsTrigger>
        ))}
      </TabsList>
      {windows.map(window => (
        <TabsContent key={window.index} value={window.index.toString()}>
          <div className={window.panes.length > 1 ? 'flex flex-row gap-2' : ''}>
            {window.panes.map(pane => (
              <Terminal
                key={`${window.index}-${pane.index}`}
                width={pane.width}
                height={pane.height}
                content={pane.content}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
