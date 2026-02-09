import { keccak_256 } from '@noble/hashes/sha3.js'
import { bytesToHex } from '@noble/hashes/utils.js'

type JsonPrimitive = string | number | boolean | null

export type JsonInput =
  | JsonPrimitive
  | JsonInput[]
  | { [key: string]: JsonInput | undefined }

type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

const isPlainObject = (value: unknown): value is Record<string, JsonInput> => {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

const compareKeys = (a: string, b: string): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

const canonicalize = (value: JsonInput, path = '$'): JsonValue => {
  if (value === null) {
    return null
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => canonicalize(item, `${path}[${index}]`))
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid number in payload at ${path}: expected finite`)
    }
    return value
  }

  if (typeof value !== 'object') {
    return value
  }

  if (!isPlainObject(value)) {
    throw new Error(`Invalid payload object at ${path}: expected plain object`)
  }

  const sortedEntries = Object.entries(value)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([a], [b]) => compareKeys(a, b))
    .map(([key, entryValue]) => [
      key,
      canonicalize(entryValue as JsonInput, `${path}.${key}`),
    ])

  return Object.fromEntries(sortedEntries)
}

export const canonicalStringify = (payload: JsonInput): string => {
  return JSON.stringify(canonicalize(payload))
}

export const hashPayload = (payload: JsonInput): string => {
  const canonical = canonicalStringify(payload)
  const bytes = new TextEncoder().encode(canonical)
  return `0x${bytesToHex(keccak_256(bytes))}`
}
