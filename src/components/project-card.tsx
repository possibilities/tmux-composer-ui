import { ProjectInfo } from '@/app/actions'
import { timeSince } from '@/lib/time'
import { Card, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { PlayButton } from '@/components/play-button'
import { OpenSessionButton } from '@/components/open-session-button'

export function ProjectCard({ project }: { project: ProjectInfo }) {
  const lastActivity = project.latestChat || project.latestCommit

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
          {project.name}
          {lastActivity && (
            <span className='text-sm font-normal text-muted-foreground/60'>
              {timeSince(lastActivity)}
            </span>
          )}
        </CardTitle>
        <CardAction>
          <div className='flex gap-4'>
            {project.activeSessions &&
              project.activeSessions.length > 0 &&
              newestSession && (
                <OpenSessionButton
                  sessions={project.activeSessions}
                  newestSessionName={newestSession.name}
                />
              )}
            <PlayButton projectPath={project.path} />
          </div>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
