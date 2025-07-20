import type { Metadata } from 'next'
import { ThemeProvider } from '@/lib/theme-provider'
import { WebSocketProvider } from '@/lib/websocket-provider'
import './globals.css'
import './debug.css'

export const metadata: Metadata = {
  title: 'Tmux Composer',
  description: 'Tmux Composer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href='https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Geist+Mono:wght@100..900&display=optional'
          rel='stylesheet'
        />
      </head>
      <body>
        <ThemeProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
