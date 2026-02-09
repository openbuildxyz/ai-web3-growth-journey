import { useAuthStore } from '@/stores/auth'

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN

export async function apiFetch(path: string, options: RequestInit = {}) {
  const { token } = useAuthStore.getState()

  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${BACKEND_DOMAIN}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`,
    )
  }

  return response.json()
}
