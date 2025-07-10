import { ProjectInfo } from '@/app/actions'
import { timeSince } from '@/lib/time'
import { Card, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { PlayButton } from '@/components/play-button'

export function ProjectCard({ project }: { project: ProjectInfo }) {
  const lastActivity = project.latestChat || project.latestCommit

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
        {project.activeSessions && project.activeSessions.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-1.5'>
            {project.activeSessions.map((session, index) => (
              <div
                key={session.name}
                className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground'
              >
                Session {index + 1}
              </div>
            ))}
          </div>
        )}
        <CardAction>
          <PlayButton projectPath={project.path} />
        </CardAction>
      </CardHeader>
    </Card>
  )
}
