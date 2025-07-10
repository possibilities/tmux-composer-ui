'use client'

import { Button } from '@/components/ui/button'
import { Monitor, ChevronDown, X } from 'lucide-react'
import { switchToSession, finishSession, type ProjectInfo } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function OpenSessionButton({
  sessions,
  newestSessionName,
}: {
  sessions?: NonNullable<ProjectInfo['activeSessions']>
  newestSessionName?: string
}) {
  const hasNoSessions = !sessions || sessions.length === 0 || !newestSessionName

  const handleSwitchSession = async (sessionName: string) => {
    const result = await switchToSession(sessionName)
    if (!result.success) {
      console.error('Failed to switch session:', result.error)
    }
  }

  const handleFinishSession = async (
    e: React.MouseEvent,
    sessionName: string,
  ) => {
    e.stopPropagation()
    const result = await finishSession(sessionName)
    if (!result.success) {
      console.error('Failed to finish session:', result.error)
    }
  }

  return (
    <div className='flex'>
      <Button
        size='icon'
        variant='outline'
        className='rounded-r-none'
        disabled={hasNoSessions}
        onClick={() =>
          newestSessionName && handleSwitchSession(newestSessionName)
        }
      >
        <Monitor className='size-4' />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size='icon'
            variant='outline'
            className='rounded-l-none border-l-0 px-1'
            disabled={hasNoSessions}
          >
            <ChevronDown className='size-3' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {sessions && sessions.length > 0 ? (
            sessions.map((session, index) => (
              <DropdownMenuItem
                key={session.name}
                onClick={() => handleSwitchSession(session.name)}
                className='flex items-center justify-between gap-2 pr-1'
              >
                <div className='flex items-center flex-1 py-0.5'>
                  <Monitor className='mr-2 size-4' />
                  Session {index + 1}
                  {session.name === newestSessionName && (
                    <span className='ml-2 text-xs text-muted-foreground'>
                      newest
                    </span>
                  )}
                </div>
                <button
                  onClick={e => handleFinishSession(e, session.name)}
                  className='ml-2 flex items-center justify-center rounded-sm border border-border bg-background p-1 text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive hover:text-destructive-foreground'
                  aria-label={`Stop session ${index + 1}`}
                >
                  <X className='size-3' />
                </button>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No active sessions</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
