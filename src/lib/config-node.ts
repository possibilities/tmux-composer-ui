function expandTilde(filepath: string | undefined): string | undefined {
  if (!filepath) return filepath
  if (filepath === '~') {
    const home = process.env.HOME
    if (!home) {
      throw new Error(
        'HOME environment variable is required when using tilde (~) in paths.',
      )
    }
    return home
  }
  if (filepath.startsWith('~/')) {
    const home = process.env.HOME
    if (!home) {
      throw new Error(
        'HOME environment variable is required when using tilde (~) in paths.',
      )
    }
    return home + '/' + filepath.slice(2)
  }
  return filepath
}

export const config = {
  worktreesPath: expandTilde(process.env.WORKTREES_PATH),
  projectsPath: expandTilde(process.env.PROJECTS_PATH),
  tmuxServer: process.env.TMUX_SERVER || 'default',
  websocketUrl: process.env.WEBSOCKET_URL,
}

export function validateEnvironment() {
  const pathsUsingTilde = [
    process.env.WORKTREES_PATH,
    process.env.PROJECTS_PATH,
  ].some(path => path === '~' || path?.startsWith('~/'))

  if (pathsUsingTilde && !process.env.HOME) {
    throw new Error(
      'HOME environment variable is required when using tilde (~) in paths.',
    )
  }
}

export function validateConfig() {
  validateEnvironment()
  if (!config.worktreesPath) {
    throw new Error(
      'WORKTREES_PATH environment variable is required. Please set it to the path of your worktrees directory.',
    )
  }
  if (!config.projectsPath) {
    throw new Error(
      'PROJECT_PATHS environment variable is required. Please set it to the path of your project directory.',
    )
  }
  if (config.websocketUrl) {
    try {
      new URL(config.websocketUrl)
      if (
        !config.websocketUrl.startsWith('ws://') &&
        !config.websocketUrl.startsWith('wss://')
      ) {
        throw new Error('WebSocket URL must use ws:// or wss:// protocol')
      }
    } catch (error) {
      throw new Error(
        `Invalid WEBSOCKET_URL: ${error instanceof Error ? error.message : 'Invalid URL format'}`,
      )
    }
  }
}
