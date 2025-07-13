'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface WebSocketMessage {
  id: string
  timestamp: string
  data: string
}

export function WebSocketClient() {
  const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connect = useCallback(() => {
    if (!url) {
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        console.log('WebSocket connected')
      }

      ws.onmessage = event => {
        const newMessage: WebSocketMessage = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          data: event.data,
        }
        setMessages(prev => [...prev, newMessage])
      }

      ws.onerror = event => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection error')
      }

      ws.onclose = event => {
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null

        if (!event.wasClean) {
          setError(`Connection lost: ${event.reason || 'Unknown error'}`)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }
      }
    } catch (err) {
      setIsConnecting(false)
      setError(err instanceof Error ? err.message : 'Failed to connect')
    }
  }, [url])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  useEffect(() => {
    if (url) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [url, connect, disconnect])

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
            {!isConnected && !isConnecting && (
              <Button onClick={connect} size='sm'>
                Connect
              </Button>
            )}
            {(isConnected || isConnecting) && (
              <Button onClick={disconnect} size='sm' variant='outline'>
                Disconnect
              </Button>
            )}
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
        <div className='max-h-[500px] overflow-y-auto'>
          {messages.length === 0 ? (
            <p className='text-center text-muted-foreground'>
              No messages received yet
            </p>
          ) : (
            <div className='space-y-2'>
              {messages.map(message => (
                <div
                  key={message.id}
                  className='rounded-md bg-muted/50 p-3 font-mono text-sm'
                >
                  <div className='mb-1 text-xs text-muted-foreground'>
                    {message.timestamp}
                  </div>
                  <pre className='whitespace-pre-wrap break-all'>
                    {message.data}
                  </pre>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
