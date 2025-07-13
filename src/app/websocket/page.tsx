import { config } from '@/lib/config-node'
import { WebSocketClient } from '@/components/websocket-client'

export default function WebSocketPage() {
  const websocketUrl = config.websocketUrl

  if (!websocketUrl) {
    return (
      <main className='mx-auto max-w-2xl p-6'>
        <div className='rounded-lg border border-dashed p-8 text-center'>
          <p className='text-muted-foreground'>
            No WebSocket URL configured. Please set WEBSOCKET_URL environment
            variable.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className='mx-auto max-w-2xl p-6'>
      <h1 className='mb-6 text-2xl font-bold'>WebSocket Monitor</h1>
      <WebSocketClient url={websocketUrl} />
    </main>
  )
}
