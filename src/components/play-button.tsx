'use client'

import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { startSession } from '@/app/actions'

export function PlayButton({ projectPath }: { projectPath: string }) {
  return (
    <Button
      size='icon'
      variant='outline'
      onClick={async () => {
        const result = await startSession(projectPath)
        if (!result.success) {
          console.error('Failed to start session:', result.error)
        }
      }}
    >
      <Play className='size-4' />
    </Button>
  )
}
