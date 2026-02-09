const SENSITIVE_KEYS = [
  'authorization',
  'token',
  'access_token',
  'refresh_token',
  'password',
  'secret',
  'auth_secret_hash',
  'private_key',
  'api_key',
  'key',
]

const isSensitiveKey = (key: string) =>
  SENSITIVE_KEYS.includes(key.toLowerCase())

const maskValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return value
  }
  if (typeof value === 'string') {
    if (value.length <= 6) {
      return '***'
    }
    return `${value.slice(0, 2)}***${value.slice(-2)}`
  }
  return '***'
}

export const maskSensitiveData = (input: unknown): unknown => {
  if (input === null || input === undefined) {
    return input
  }
  if (typeof input !== 'object') {
    return input
  }
  if (input instanceof Date) {
    return input.toISOString()
  }
  if (Array.isArray(input)) {
    return input.map((item) => maskSensitiveData(item))
  }
  const entries = Object.entries(input as Record<string, unknown>).map(
    ([key, value]) => [
      key,
      isSensitiveKey(key) ? maskValue(value) : maskSensitiveData(value),
    ],
  )
  return Object.fromEntries(entries)
}

export const safeJsonStringify = (value: unknown): string => {
  return JSON.stringify(value, (_key, val) => {
    if (typeof val === 'bigint') {
      return val.toString()
    }
    if (typeof val?.toFixed === 'function') {
      return val.toString()
    }
    return val
  })
}
