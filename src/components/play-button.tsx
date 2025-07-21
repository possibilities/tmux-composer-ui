'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, ChevronDown } from 'lucide-react'
import { startSession } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buildSessionPageUrl } from '@/lib/navigation'

export function PlayButton({ projectPath }: { projectPath: string }) {
  const router = useRouter()

  const handleStartSession = async (foreground: boolean = true) => {
    const result = await startSession(projectPath)
    if (!result.success) {
      console.error('Failed to start session:', result.error)
      return
    }

    if (foreground && result.sessionName) {
      const sessionPageUrl = buildSessionPageUrl(
        projectPath,
        result.sessionName,
      )
      router.push(sessionPageUrl)
    }
  }

  return (
    <div className='flex'>
      <Button
        size='icon'
        variant='outline'
        className='rounded-r-none'
        onClick={() => handleStartSession(true)}
      >
        <Play className='size-4' />
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
          <DropdownMenuItem onClick={() => handleStartSession(true)}>
            Start in foreground
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStartSession(false)}>
            Start in background
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
