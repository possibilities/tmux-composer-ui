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
  projectPath: expandTilde(process.env.PROJECT_PATH),
}

export function validateEnvironment() {
  const pathsUsingTilde = [
    process.env.WORKTREES_PATH,
    process.env.PROJECT_PATH,
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
  if (!config.projectPath) {
    throw new Error(
      'PROJECT_PATH environment variable is required. Please set it to the path of your project directory.',
    )
  }
}
