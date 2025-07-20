import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFullProjectPath(projectName: string): string {
  const projectsBasePath = process.env.PROJECTS_PATH
  return projectsBasePath ? `${projectsBasePath}/${projectName}` : projectName
}
