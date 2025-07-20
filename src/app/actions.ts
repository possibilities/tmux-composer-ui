'use server'

import { exec } from 'child_process'
import { promisify } from 'util'
import { config } from '@/lib/config-node'

const execAsync = promisify(exec)

function getMostRecentSessionStartTime(
  sessions?: Array<{ startTime?: string }>,
): string | undefined {
  if (!sessions || sessions.length === 0) return undefined

  return sessions.reduce<string | undefined>((mostRecent, session) => {
    if (!session.startTime) return mostRecent
    if (!mostRecent) return session.startTime

    return new Date(session.startTime) > new Date(mostRecent)
      ? session.startTime
      : mostRecent
  }, undefined)
}

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
  lastActivity?: string
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
    const listProjectsResult = await execAsync(
      `tmux-composer list-projects --tmux-socket ${config.tmuxServer}`,
      {
        cwd: projectsPath,
      },
    )

    const projectsMap: ProjectsMap = JSON.parse(listProjectsResult.stdout)

    const projects = Object.values(projectsMap)
      .map(({ project }) => {
        const mostRecentSessionStartTime = getMostRecentSessionStartTime(
          project.activeSessions,
        )

        const availableTimestamps = [
          mostRecentSessionStartTime,
          project.latestChat,
          project.latestCommit,
        ].filter(Boolean)

        const lastActivity =
          availableTimestamps.length > 0
            ? availableTimestamps.reduce((newest, current) => {
                return new Date(current!) > new Date(newest!) ? current : newest
              })
            : undefined

        return {
          ...project,
          lastActivity,
        }
      })
      .filter(
        project =>
          project.isProjectsPath ||
          (project.files?.dotGit && project.files?.packageJson) ||
          project.files?.tmuxComposerConfig,
      )

    return projects.sort((a, b) => {
      const aTime = a.lastActivity
      const bTime = b.lastActivity

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
    const result = await execAsync(
      `tmux-composer start-session --tmux-socket ${config.tmuxServer}`,
      {
        cwd: projectPath,
      },
    )

    // Parse newline-delimited JSON output
    const lines = result.stdout.trim().split('\n')
    let sessionName: string | undefined

    for (const line of lines) {
      try {
        const data = JSON.parse(line)
        // Look for session name in context
        if (data.payload?.context?.session?.name) {
          sessionName = data.payload.context.session.name
          break
        }
      } catch {
        // Skip lines that aren't valid JSON
      }
    }

    return { success: true, sessionName }
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
    await execAsync(
      `tmux -L ${config.tmuxServer} switch-client -t "${sessionName}"`,
    )
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
    await execAsync(
      `tmux-composer finish-session --tmux-socket ${config.tmuxServer} "${sessionName}"`,
    )
    return { success: true }
  } catch (error) {
    console.error('Failed to finish session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getProjectDetails(projectPath: string) {
  try {
    const result = await execAsync(
      `tmux-composer show-project --tmux-socket ${config.tmuxServer}`,
      {
        cwd: projectPath,
      },
    )

    const projectDetails = JSON.parse(result.stdout)
    return { success: true, data: projectDetails }
  } catch (error) {
    console.error('Failed to get project details:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getSessionDetails(sessionName: string) {
  try {
    const result = await execAsync(
      `tmux-composer show-session --tmux-socket ${config.tmuxServer} "${sessionName}"`,
    )

    const sessionDetails = JSON.parse(result.stdout)
    return { success: true, data: sessionDetails }
  } catch (error) {
    console.error('Failed to get session details:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
