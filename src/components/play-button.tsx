'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, ChevronDown } from 'lucide-react'
import { startSession, startSessionWithDirtyRepo } from '@/app/actions'
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

export function PlayButton({
  projectPath,
  defaultWorktree = true,
}: {
  projectPath: string
  defaultWorktree?: boolean
}) {
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [showDirtyRepoDialog, setShowDirtyRepoDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleStartSession = async (useWorktree: boolean) => {
    const result = await startSession(projectPath, useWorktree)
    if (!result.success) {
      if (result.errorCode === 'DIRTY_REPOSITORY') {
        setShowDirtyRepoDialog(true)
      } else {
        setErrorMessage(result.error || 'Failed to start session')
        setShowErrorDialog(true)
      }
    }
  }

  const handlePrimaryAction = () => handleStartSession(defaultWorktree)

  const handleForceStart = async () => {
    const result = await startSessionWithDirtyRepo(projectPath, defaultWorktree)
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
          onClick={handlePrimaryAction}
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
            <DropdownMenuItem
              onClick={() => handleStartSession(true)}
              className='flex items-center gap-2'
            >
              {defaultWorktree ? (
                <Play className='size-3' />
              ) : (
                <div className='size-3' />
              )}
              Start in worktree session
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStartSession(false)}
              className='flex items-center gap-2'
            >
              {!defaultWorktree ? (
                <Play className='size-3' />
              ) : (
                <div className='size-3' />
              )}
              Start in main branch session
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
