import { getProjects } from './actions'
import { ProjectCard } from '@/components/project-card'

export default async function Home() {
  const projects = await getProjects()

  return (
    <main className='mx-auto max-w-2xl p-6'>
      {projects.length === 0 ? (
        <div className='rounded-lg border border-dashed p-8 text-center'>
          <p className='text-muted-foreground'>
            No projects found. Make sure PROJECTS_PATH is configured correctly.
          </p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {projects.map(project => (
            <ProjectCard key={project.path} project={project} />
          ))}
        </div>
      )}
    </main>
  )
}
