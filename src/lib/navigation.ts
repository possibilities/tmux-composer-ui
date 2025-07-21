export function buildSessionPageUrl(
  projectPath: string,
  sessionName: string,
): string {
  const projectName = projectPath.split('/').pop() || 'unknown'
  const encodedProjectName = encodeURIComponent(projectName)
  const encodedSessionName = encodeURIComponent(sessionName)
  return `/${encodedProjectName}/${encodedSessionName}`
}
