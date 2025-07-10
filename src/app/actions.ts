'use server'

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export type ProjectInfo = {
  name: string
  path: string
  git?: {
    branch: string
    commit: string
    status: 'clean' | 'dirty'
  }
  files?: {
    dotGit: boolean
    packageJson: boolean
    tmuxComposerConfig: boolean
  }
  latestCommit?: string
  latestChat?: string
  isProjectsPath?: boolean
}

export async function getProjects(): Promise<ProjectInfo[]> {
  const projectsPath = process.env.PROJECTS_PATH
  if (!projectsPath) {
    return []
  }

  type ProjectWithConfig = {
    project: ProjectInfo
    config: Record<string, unknown>
  }

  type ProjectsMap = {
    [key: string]: ProjectWithConfig
  }

  try {
    const [listProjectsResult, showProjectResult] = await Promise.all([
      execAsync('tmux-composer list-projects', {
        cwd: projectsPath,
      }),
      execAsync(`tmux-composer show-project "${projectsPath}"`),
    ])

    const projectsMap: ProjectsMap = JSON.parse(listProjectsResult.stdout)

    const projectsPathData: ProjectWithConfig = JSON.parse(
      showProjectResult.stdout,
    )
    if (projectsPathData.project) {
      projectsPathData.project.path = projectsPath
      projectsMap[projectsPath] = projectsPathData
    }

    const projects = Object.values(projectsMap)
      .map(({ project }) => project)
      .filter(
        project =>
          project.isProjectsPath ||
          (project.files?.dotGit && project.files?.packageJson) ||
          project.files?.tmuxComposerConfig,
      )

    return projects.sort((a, b) => {
      const aTime = a.latestChat || a.latestCommit
      const bTime = b.latestChat || b.latestCommit

      if (!aTime && !bTime) return a.name.localeCompare(b.name)
      if (!aTime) return 1
      if (!bTime) return -1
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  } catch (error) {
    console.error(`Failed to list projects in ${projectsPath}:`, error)
    return []
  }
}

export async function startSession(projectPath: string) {
  try {
    await execAsync('tmux-composer start-session', {
      cwd: projectPath,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to start session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
