'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Monitor, ChevronDown } from 'lucide-react'
import { switchToSession, type ProjectInfo } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buildSessionPageUrl } from '@/lib/navigation'

export function OpenSessionButton({
  sessions,
  newestSessionName,
  projectPath,
}: {
  sessions?: NonNullable<ProjectInfo['activeSessions']>
  newestSessionName?: string
  projectPath: string
}) {
  const router = useRouter()
  const hasNoSessions = !sessions || sessions.length === 0 || !newestSessionName

  const handleSwitchSession = async (sessionName: string) => {
    const result = await switchToSession(sessionName)
    if (!result.success) {
      console.error('Failed to switch session:', result.error)
      return
    }

    const sessionPageUrl = buildSessionPageUrl(projectPath, sessionName)
    router.push(sessionPageUrl)
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
                className='flex items-center gap-2'
              >
                <Monitor className='mr-2 size-4' />
                Session {index + 1}
                {session.name === newestSessionName && (
                  <span className='ml-2 text-xs text-muted-foreground'>
                    newest
                  </span>
                )}
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
