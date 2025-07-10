import { ProjectInfo } from '@/app/actions'
import { timeSince } from '@/lib/time'
import { Card, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { PlayButton } from '@/components/play-button'
import { OpenSessionButton } from '@/components/open-session-button'

export function ProjectCard({ project }: { project: ProjectInfo }) {
  const lastActivity = project.latestChat || project.latestCommit
  const hasActiveSessions =
    project.activeSessions && project.activeSessions.length > 0

  const newestSession = project.activeSessions?.reduce(
    (newest, session) => {
      if (!newest) return session
      if (!session.startTime || !newest.startTime) return newest
      return new Date(session.startTime) > new Date(newest.startTime)
        ? session
        : newest
    },
    null as (typeof project.activeSessions)[0] | null,
  )

  return (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <div
            className={`size-2 rounded-full transition-colors ${
              hasActiveSessions
                ? 'bg-yellow-400 shadow-[0_0_3px_rgba(250,204,21,0.4)]'
                : 'bg-zinc-700 dark:bg-zinc-600'
            }`}
            aria-label={
              hasActiveSessions ? 'Sessions active' : 'No active sessions'
            }
          />
          {project.name}
          {lastActivity && (
            <span className='text-sm font-normal text-muted-foreground/60'>
              {timeSince(lastActivity)}
            </span>
          )}
        </CardTitle>
        <CardAction>
          <div className='flex gap-4'>
            <OpenSessionButton
              sessions={project.activeSessions}
              newestSessionName={newestSession?.name}
            />
            <PlayButton projectPath={project.path} />
          </div>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
