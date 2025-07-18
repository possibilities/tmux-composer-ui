'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWebSocket } from './websocket-provider'

export function useWebSocketSubscription<T = unknown>(
  eventType: string,
  onMessage?: (data: T) => void,
) {
  const { isConnected, isConnecting, error, subscribe } = useWebSocket()
  const [lastMessage, setLastMessage] = useState<T | null>(null)

  const handleMessage = useCallback(
    (data: unknown) => {
      const typedData = data as T
      setLastMessage(typedData)
      onMessage?.(typedData)
    },
    [onMessage],
  )

  useEffect(() => {
    const unsubscribe = subscribe(eventType, handleMessage)
    return unsubscribe
  }, [eventType, subscribe, handleMessage])

  return {
    isConnected,
    isConnecting,
    error,
    lastMessage,
  }
}
