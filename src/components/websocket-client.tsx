'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useWebSocketSubscription } from '@/lib/use-websocket-subscription'

interface WebSocketMessage {
  id: string
  timestamp: string
  data: string
  parsedData?: Record<string, unknown>
  type?: string
}

interface CollapsibleMessageProps {
  message: WebSocketMessage
}

function extractMessageType(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'event' in data) {
    const possibleType = (data as Record<string, unknown>).event
    return typeof possibleType === 'string' ? possibleType : undefined
  }
  return undefined
}

function extractSourceScript(data: unknown): string | undefined {
  if (
    typeof data === 'object' &&
    data !== null &&
    'source' in data &&
    typeof (data as Record<string, unknown>).source === 'object' &&
    (data as Record<string, unknown>).source !== null
  ) {
    const source = (data as Record<string, unknown>).source as Record<
      string,
      unknown
    >
    if ('script' in source && typeof source.script === 'string') {
      return source.script
    }
  }
  return undefined
}

function CollapsibleMessage({ message }: CollapsibleMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isJsonMessage = message.parsedData !== undefined
  const displayType = message.type || 'Unknown'
  const sourceScript = message.parsedData
    ? extractSourceScript(message.parsedData)
    : undefined

  return (
    <div className='rounded-md bg-muted/50 p-3 font-mono text-sm'>
      <div className='mb-1 flex items-center justify-between text-xs text-muted-foreground'>
        <span>{message.timestamp}</span>
      </div>

      {isJsonMessage ? (
        <div>
          <button
            type='button'
            onClick={() => setIsExpanded(!isExpanded)}
            className='flex items-center gap-1 hover:opacity-70 focus:opacity-70 transition-opacity focus:outline-none cursor-pointer'
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            <span className='font-semibold'>{displayType}</span>
            {sourceScript && (
              <span className='ml-2 text-muted-foreground'>
                - {sourceScript}
              </span>
            )}
          </button>

          {isExpanded && (
            <pre className='mt-2 whitespace-pre-wrap break-all text-xs'>
              {JSON.stringify(message.parsedData, null, 2)}
            </pre>
          )}
        </div>
      ) : (
        <pre className='whitespace-pre-wrap break-all'>{message.data}</pre>
      )}
    </div>
  )
}

export function WebSocketClient() {
  const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isConnected, isConnecting, error } = useWebSocketSubscription(
    '*',
    data => {
      let messageType: string | undefined

      if (typeof data === 'object' && data !== null) {
        messageType = extractMessageType(data)
      }

      const newMessage: WebSocketMessage = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        data: JSON.stringify(data),
        parsedData: data as Record<string, unknown>,
        type: messageType,
      }
      setMessages(prev => [...prev, newMessage])
    },
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const clearMessages = () => {
    setMessages([])
  }

  if (!url) {
    return (
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <p className='text-muted-foreground'>
          No WebSocket URL configured. Please set NEXT_PUBLIC_WEBSOCKET_URL
          environment variable.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <Card className='p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected
                  ? 'bg-green-500'
                  : isConnecting
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            />
            <span className='text-sm font-medium'>
              {isConnected
                ? 'Connected'
                : isConnecting
                  ? 'Connecting...'
                  : 'Disconnected'}
            </span>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={clearMessages}
              size='sm'
              variant='outline'
              disabled={messages.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        {error && (
          <div className='mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400'>
            {error}
          </div>
        )}

        <div className='text-xs text-muted-foreground'>URL: {url}</div>
      </Card>

      <Card className='p-4'>
        <h2 className='mb-3 font-semibold'>Messages</h2>
        <div className='h-[calc(100vh-20rem)] overflow-y-auto'>
          {messages.length === 0 ? (
            <p className='text-center text-muted-foreground'>
              No messages received yet
            </p>
          ) : (
            <div className='space-y-2'>
              {messages.map(message => (
                <CollapsibleMessage
                  key={`${message.id}-${message.type || 'unknown'}`}
                  message={message}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
