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
  activeSessions?: Array<{
    name: string
    mode: string
    startTime?: string
  }>
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
    const listProjectsResult = await execAsync('tmux-composer list-projects', {
      cwd: projectsPath,
    })

    const projectsMap: ProjectsMap = JSON.parse(listProjectsResult.stdout)

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

export async function switchToSession(sessionName: string) {
  try {
    await execAsync(`tmux switch-client -t "${sessionName}"`)
    return { success: true }
  } catch (error) {
    console.error('Failed to switch session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function finishSession(sessionName: string) {
  try {
    await execAsync(`tmux-composer finish-session "${sessionName}"`)
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to finish session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
