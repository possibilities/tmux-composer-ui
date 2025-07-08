'use server'

import { promises as fs } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export type ProjectInfo = {
  name: string
  path: string
  lastActivity?: string
  git?: {
    branch: string
    commit: string
    status: string
  }
  config?: {
    worktree?: {
      value: boolean
      source: string
      sourcePath: string
    }
    commands?: Record<
      string,
      {
        value: string
        source: string
        sourcePath: string
      }
    >
  }
  nextWorktreeNumber?: string
}

export async function getProjects(): Promise<ProjectInfo[]> {
  const projectsPath = process.env.PROJECTS_PATH
  if (!projectsPath) {
    return []
  }

  try {
    const entries = await fs.readdir(projectsPath, { withFileTypes: true })
    const projects: ProjectInfo[] = []

    try {
      const { stdout } = await execAsync('tmux-composer show-project --json', {
        cwd: projectsPath,
      })
      const data = JSON.parse(stdout)
      projects.push({
        name: data.project.name,
        path: data.project.path,
        lastActivity: data.project.lastActivity,
        git: data.project.git,
        config: data.config,
        nextWorktreeNumber: data.project.nextWorktreeNumber,
      })
    } catch (error) {
      console.error(`Failed to get info for PROJECTS_PATH:`, error)
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const projectPath = path.join(projectsPath, entry.name)

      try {
        const { stdout } = await execAsync(
          'tmux-composer show-project --json',
          {
            cwd: projectPath,
          },
        )
        const data = JSON.parse(stdout)

        const hasGit = data.project.files?.dotGit ?? false
        const hasPackageJson = data.project.files?.packageJson ?? false
        const hasTmuxComposerConfig =
          data.project.files?.tmuxComposerConfig ?? false

        if ((hasGit && hasPackageJson) || hasTmuxComposerConfig) {
          projects.push({
            name: data.project.name,
            path: data.project.path,
            lastActivity: data.project.lastActivity,
            git: data.project.git,
            config: data.config,
            nextWorktreeNumber: data.project.nextWorktreeNumber,
          })
        }
      } catch (error) {
        console.error(`Failed to get info for ${entry.name}:`, error)
      }
    }

    return projects.sort((a, b) => {
      if (a.lastActivity && b.lastActivity) {
        return (
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime()
        )
      }
      if (a.lastActivity && !b.lastActivity) return -1
      if (!a.lastActivity && b.lastActivity) return 1
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    console.error('Failed to read projects directory:', error)
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
