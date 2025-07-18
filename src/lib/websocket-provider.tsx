'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  ReactNode,
} from 'react'

type MessageCallback = (data: unknown) => void
type EventCallbacks = Map<string, Set<MessageCallback>>

interface WebSocketMessage {
  event?: string
  [key: string]: unknown
}

interface WebSocketContextValue {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  subscribe: (eventType: string, callback: MessageCallback) => () => void
  sendMessage: (message: unknown) => void
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

interface WebSocketProviderProps {
  children: ReactNode
  url?: string
}

export function WebSocketProvider({ children, url }: WebSocketProviderProps) {
  const wsUrl = url || process.env.NEXT_PUBLIC_WEBSOCKET_URL
  const wsRef = useRef<WebSocket | null>(null)
  const eventCallbacksRef = useRef<EventCallbacks>(new Map())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [state, setState] = useReducer(
    (
      prev: {
        isConnected: boolean
        isConnecting: boolean
        error: string | null
      },
      next: Partial<{
        isConnected: boolean
        isConnecting: boolean
        error: string | null
      }>,
    ) => ({ ...prev, ...next }),
    { isConnected: false, isConnecting: false, error: null },
  )

  const notifySubscribers = useCallback((eventType: string, data: unknown) => {
    const callbacks = eventCallbacksRef.current.get(eventType)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }, [])

  const connect = useCallback(() => {
    if (!wsUrl || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setState({ isConnecting: true, error: null })

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setState({ isConnected: true, isConnecting: false, error: null })
        console.log('WebSocket connected')
      }

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage

          if (data.event) {
            notifySubscribers(data.event, data)
          }

          notifySubscribers('*', data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = event => {
        console.error('WebSocket error:', event)
        setState({ error: 'WebSocket connection error' })
      }

      ws.onclose = event => {
        setState({ isConnected: false, isConnecting: false })
        wsRef.current = null

        if (!event.wasClean && wsUrl) {
          setState({
            error: `Connection lost: ${event.reason || 'Unknown error'}`,
          })
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }
      }
    } catch (err) {
      setState({
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Failed to connect',
      })
    }
  }, [wsUrl, notifySubscribers])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Provider unmounting')
      wsRef.current = null
    }

    setState({ isConnected: false, isConnecting: false })
  }, [])

  const subscribe = useCallback(
    (eventType: string, callback: MessageCallback) => {
      if (!eventCallbacksRef.current.has(eventType)) {
        eventCallbacksRef.current.set(eventType, new Set())
      }
      eventCallbacksRef.current.get(eventType)!.add(callback)

      return () => {
        const callbacks = eventCallbacksRef.current.get(eventType)
        if (callbacks) {
          callbacks.delete(callback)
          if (callbacks.size === 0) {
            eventCallbacksRef.current.delete(eventType)
          }
        }
      }
    },
    [],
  )

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  useEffect(() => {
    if (wsUrl) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [wsUrl, connect, disconnect])

  const value: WebSocketContextValue = {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    subscribe,
    sendMessage,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

function useReducer<T>(
  reducer: (state: T, action: Partial<T>) => T,
  initialState: T,
): [T, (action: Partial<T>) => void] {
  const [state, setState] = useState(initialState)
  const dispatch = useCallback(
    (action: Partial<T>) => {
      setState(prevState => reducer(prevState, action))
    },
    [reducer],
  )
  return [state, dispatch]
}
