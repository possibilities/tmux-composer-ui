'use client'

import { useState } from 'react'
import { ProjectInfo } from '@/app/actions'
import { timeSince } from '@/lib/time'
import { Card, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { PlayButton } from '@/components/play-button'
import { OpenSessionButton } from '@/components/open-session-button'
import { useWebSocketSubscription } from '@/lib/use-websocket-subscription'

interface SessionData {
  name: string
  mode: string
  startTime?: string
}

interface SessionEvent {
  event: string
  projectPath?: string
  session?: SessionData
  sessionName?: string
  [key: string]: unknown
}

export function ProjectCard({ project }: { project: ProjectInfo }) {
  const [localProject, setLocalProject] = useState(project)
  const lastActivity = localProject.latestChat || localProject.latestCommit
  const hasActiveSessions =
    localProject.activeSessions && localProject.activeSessions.length > 0

  const newestSession = localProject.activeSessions?.reduce(
    (newest, session) => {
      if (!newest) return session
      if (!session.startTime || !newest.startTime) return newest
      return new Date(session.startTime) > new Date(newest.startTime)
        ? session
        : newest
    },
    null as (typeof localProject.activeSessions)[0] | null,
  )

  const handleKillSession = (data: SessionEvent) => {
    if (data.projectPath === project.path && data.sessionName) {
      setLocalProject(prev => ({
        ...prev,
        activeSessions:
          prev.activeSessions?.filter(
            session => session.name !== data.sessionName,
          ) || [],
      }))
    }
  }

  const handleCreateSession = (data: SessionEvent) => {
    if (data.projectPath === project.path && data.session) {
      setLocalProject(prev => ({
        ...prev,
        activeSessions: [...(prev.activeSessions || []), data.session!],
      }))
    }
  }

  useWebSocketSubscription<SessionEvent>(
    'kill-current-session:start',
    handleKillSession,
  )
  useWebSocketSubscription<SessionEvent>(
    'create-tmux-session:start',
    handleCreateSession,
  )

  return (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader>
        <CardTitle className='flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2'>
          <div className='flex items-center gap-2 min-w-0'>
            <div
              className={`size-2 shrink-0 rounded-full transition-colors ${
                hasActiveSessions
                  ? 'bg-yellow-400 shadow-[0_0_3px_rgba(250,204,21,0.4)]'
                  : 'bg-zinc-700 dark:bg-zinc-600'
              }`}
              aria-label={
                hasActiveSessions ? 'Sessions active' : 'No active sessions'
              }
            />
            <span className='truncate'>{localProject.name}</span>
          </div>
          {lastActivity && (
            <span className='text-sm font-normal text-muted-foreground/60 sm:shrink-0'>
              {timeSince(lastActivity)}
            </span>
          )}
        </CardTitle>
        <CardAction>
          <div className='flex gap-4'>
            <OpenSessionButton
              sessions={localProject.activeSessions}
              newestSessionName={newestSession?.name}
            />
            <PlayButton projectPath={localProject.path} />
          </div>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
