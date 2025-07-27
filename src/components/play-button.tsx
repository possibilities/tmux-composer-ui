'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, ChevronDown } from 'lucide-react'
import { startSession, startSessionWithDirtyWorktree } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function PlayButton({ projectPath }: { projectPath: string }) {
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [showDirtyRepoDialog, setShowDirtyRepoDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleStartSession = async () => {
    const result = await startSession(projectPath)
    if (!result.success) {
      if (result.errorCode === 'DIRTY_REPOSITORY') {
        setShowDirtyRepoDialog(true)
      } else {
        setErrorMessage(result.error || 'Failed to start session')
        setShowErrorDialog(true)
      }
    }
  }

  const handleForceStart = async () => {
    const result = await startSessionWithDirtyWorktree(projectPath)
    setShowDirtyRepoDialog(false)

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to start session')
      setShowErrorDialog(true)
    }
  }

  return (
    <>
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

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Failed to start session</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDirtyRepoDialog}
        onOpenChange={setShowDirtyRepoDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uncommitted Changes Detected</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to start the session anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceStart}>
              Start Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
