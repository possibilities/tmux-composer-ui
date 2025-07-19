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

interface TmuxComposerEvent {
  event: string
  payload: {
    context: {
      project?: {
        name?: string
        path?: string
      }
      session?: {
        name?: string
        mode?: string
      }
      worktree?: {
        path?: string
        number?: string
      }
    }
    details?: Record<string, unknown>
  }
  timestamp?: string
  sessionId?: string
}

const isRelevantSessionEvent = (
  data: TmuxComposerEvent,
  projectPath: string,
): data is TmuxComposerEvent & {
  payload: { context: { session: { name: string } } }
} => {
  return (
    data.payload.context.project?.path === projectPath &&
    !!data.payload.context.session?.name
  )
}

const addSessionToList = (
  sessions: SessionData[],
  newSession: SessionData,
): SessionData[] => {
  const sessionAlreadyExists = sessions.some(
    session => session.name === newSession.name,
  )
  return sessionAlreadyExists ? sessions : [...sessions, newSession]
}

const removeSessionFromList = (
  sessions: SessionData[],
  sessionName: string,
): SessionData[] => {
  return sessions.filter(session => session.name !== sessionName)
}

export function ProjectCard({ project }: { project: ProjectInfo }) {
  const [localProject, setLocalProject] = useState(project)
  const lastActivity = localProject.latestChat || localProject.latestCommit
  const hasActiveSessions =
    localProject.activeSessions && localProject.activeSessions.length > 0

  const newestSession = localProject.activeSessions
    ?.filter(session => session.startTime)
    .sort(
      (a, b) =>
        new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime(),
    )[0]

  const handleSessionObservationStarted = (data: TmuxComposerEvent) => {
    if (!isRelevantSessionEvent(data, project.path)) return

    const newSession: SessionData = {
      name: data.payload.context.session.name,
      mode: data.payload.context.session.mode || 'worktree',
      startTime: data.timestamp || new Date().toISOString(),
    }

    setLocalProject(prev => ({
      ...prev,
      activeSessions: addSessionToList(prev.activeSessions || [], newSession),
    }))
  }

  const handleSessionObservationExited = (data: TmuxComposerEvent) => {
    if (!isRelevantSessionEvent(data, project.path)) return

    const sessionName = data.payload.context.session.name

    setLocalProject(prev => ({
      ...prev,
      activeSessions: removeSessionFromList(
        prev.activeSessions || [],
        sessionName,
      ),
    }))
  }

  useWebSocketSubscription<TmuxComposerEvent>(
    'observe-session:start',
    handleSessionObservationStarted,
  )

  useWebSocketSubscription<TmuxComposerEvent>(
    'observe-session:exit',
    handleSessionObservationExited,
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
