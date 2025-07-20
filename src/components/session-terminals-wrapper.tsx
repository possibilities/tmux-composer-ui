import { SessionTerminals } from './session-terminals'

interface SessionData {
  windows?: Array<{
    index?: number
    name?: string
    panes?: Array<{
      index?: number
      width?: number
      height?: number
    }>
  }>
  session?: {
    windows?: Array<{
      index?: number
      name?: string
      panes?: Array<{
        index?: number
        width?: number
        height?: number
      }>
    }>
  }
  [key: string]: unknown
}

interface SessionTerminalsWrapperProps {
  sessionDetails: {
    success: boolean
    data?: SessionData
    error?: string
  }
}

function normalizeToArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    return Object.keys(data)
      .filter(key => !isNaN(Number(key)))
      .map(key => (data as Record<string, unknown>)[key])
  }
  return []
}

function extractPaneData(paneObj: Record<string, unknown>, index: number) {
  return {
    index: (paneObj.index ?? paneObj.pane_index ?? index) as number,
    width: (paneObj.width ?? paneObj.pane_width ?? 80) as number,
    height: (paneObj.height ?? paneObj.pane_height ?? 24) as number,
    content: (paneObj.content ||
      paneObj.pane_content ||
      paneObj.contents ||
      '') as string,
  }
}

function extractWindowData(windowObj: Record<string, unknown>, index: number) {
  const windowIndex = (windowObj.index ??
    windowObj.window_index ??
    index) as number
  return {
    index: windowIndex,
    name: (windowObj.name ||
      windowObj.window_name ||
      `Window ${windowIndex}`) as string,
    panes: [] as Array<{
      index: number
      width: number
      height: number
      content: string
    }>,
  }
}

export function SessionTerminalsWrapper({
  sessionDetails,
}: SessionTerminalsWrapperProps) {
  if (!sessionDetails.success || !sessionDetails.data) {
    return null
  }

  const parseSessionData = (data: SessionData) => {
    const windows: Array<{
      index: number
      name: string
      panes: Array<{
        index: number
        width: number
        height: number
        content: string
      }>
    }> = []

    const windowsData = data.windows || data.session?.windows || data
    const windowsArray = normalizeToArray(windowsData)

    for (const window of windowsArray) {
      if (!window || typeof window !== 'object') continue

      const windowObj = window as Record<string, unknown>
      const windowData = extractWindowData(windowObj, windows.length)

      const panesData = windowObj.panes || windowObj
      const panesArray = normalizeToArray(panesData)

      for (const pane of panesArray) {
        if (!pane || typeof pane !== 'object') continue
        const paneObj = pane as Record<string, unknown>
        windowData.panes.push(extractPaneData(paneObj, windowData.panes.length))
      }

      if (windowData.panes.length > 0) {
        windows.push(windowData)
      }
    }

    return windows
  }

  const windows = parseSessionData(sessionDetails.data)

  return <SessionTerminals windows={windows} />
}
