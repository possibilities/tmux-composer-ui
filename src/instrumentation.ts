import { validateConfig, validateEnvironment } from '@/lib/config-node'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      validateEnvironment()
      validateConfig()
      console.log('✓ Environment variables validated successfully')
    } catch (error) {
      console.error('✗ Environment variable validation failed:', error)
      process.exit(1)
    }
  }
}
