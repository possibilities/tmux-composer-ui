import { ProjectInfo } from '@/app/actions'
import { ProjectCard } from '@/components/project-card'

export function ProjectCardWrapper({ project }: { project: ProjectInfo }) {
  return <ProjectCard project={project} />
}
