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
        <CardAction>
          <PlayButton projectPath={project.path} />
        </CardAction>
      </CardHeader>
    </Card>
  )
}
