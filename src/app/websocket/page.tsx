import { WebSocketClient } from '@/components/websocket-client'

export default function WebSocketPage() {
  return (
    <main className='mx-auto max-w-2xl p-6'>
      <h1 className='mb-6 text-2xl font-bold'>WebSocket Monitor</h1>
      <WebSocketClient />
    </main>
  )
}
