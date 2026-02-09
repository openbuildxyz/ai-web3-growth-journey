'use client'
import { useEffect, useState } from 'react'

async function startWorker() {
  const { worker } = await import('@/msw/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

type MswProviderProps = {
  children: React.ReactNode
}

export default function MswProvider({ children }: MswProviderProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development'
    const shouldUseMsw = process.env.USE_MSW === 'true' && isDev

    if (!shouldUseMsw) {
      setReady(true)
      return
    }

    startWorker().finally(() => setReady(true))
  }, [])

  if (!ready) return null

  return children
}
