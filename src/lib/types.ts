export type SessionPane = {
  index: string
  width: number
  height: number
  left: number
  top: number
  right: number
  bottom: number
  currentCommand: string
  currentPath: string
  content: string
  cursorX: number
  cursorY: number
  active: boolean
}

export type SessionWindow = {
  index: number
  name: string
  active: boolean
  layout: string
  windowWidth: number
  windowHeight: number
  panes: SessionPane[]
}
