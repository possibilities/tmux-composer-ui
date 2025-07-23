'use client'

import { Button } from '@/components/ui/button'
import { Play, ChevronDown } from 'lucide-react'
import { startSession } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function PlayButton({ projectPath }: { projectPath: string }) {
  const handleStartSession = async () => {
    const result = await startSession(projectPath)
    if (!result.success) {
      console.error('Failed to start session:', result.error)
    }
  }

  return (
    <div className='flex'>
      <Button
        size='icon'
        variant='outline'
        className='rounded-r-none'
        onClick={handleStartSession}
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
          <DropdownMenuItem onClick={handleStartSession}>
            Start session
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
