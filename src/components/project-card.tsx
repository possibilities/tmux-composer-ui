import { ProjectInfo } from '@/app/actions'
import { timeSince } from '@/lib/time'
import { Card, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

export function ProjectCard({ project }: { project: ProjectInfo }) {
  return (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          {project.name}
          {project.lastActivity && (
            <span className='text-sm font-normal text-muted-foreground/60'>
              {timeSince(project.lastActivity)}
            </span>
          )}
        </CardTitle>
        <CardAction>
          <Button size='icon' variant='outline'>
            <Play className='size-4' />
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
