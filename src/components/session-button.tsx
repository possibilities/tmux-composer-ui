'use client'

import { switchToSession } from '@/app/actions'

export function SessionButton({
  sessionName,
  children,
}: {
  sessionName: string
  children: React.ReactNode
}) {
  async function handleClick() {
    const result = await switchToSession(sessionName)
    if (!result.success) {
      console.error('Failed to switch session:', result.error)
    }
  }

  return (
    <button
      onClick={handleClick}
      className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground'
    >
      {children}
    </button>
  )
}
