'use client'

import { Button } from '@/components/ui/button'
import { Monitor, ChevronDown } from 'lucide-react'
import { switchToSession, type ProjectInfo } from '@/app/actions'
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
  sessions: NonNullable<ProjectInfo['activeSessions']>
  newestSessionName: string
}) {
  const handleSwitchSession = async (sessionName: string) => {
    const result = await switchToSession(sessionName)
    if (!result.success) {
      console.error('Failed to switch session:', result.error)
    }
  }

  return (
    <div className='flex'>
      <Button
        size='icon'
        variant='outline'
        className='rounded-r-none'
        onClick={() => handleSwitchSession(newestSessionName)}
      >
        <Monitor className='size-4' />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size='icon'
            variant='outline'
            className='rounded-l-none border-l-0 px-1'
          >
            <ChevronDown className='size-3' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {sessions?.map((session, index) => (
            <DropdownMenuItem
              key={session.name}
              onClick={() => handleSwitchSession(session.name)}
            >
              <Monitor className='mr-2 size-4' />
              Session {index + 1}
              {session.name === newestSessionName && (
                <span className='ml-auto text-xs text-muted-foreground'>
                  newest
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
