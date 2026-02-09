import { Injectable } from '@nestjs/common'

type CacheEntry<T> = {
  value: T
  expiresAt?: number
  timeoutId?: NodeJS.Timeout
}

@Injectable()
export class CacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>()

  set<T>(key: string, value: T, ttlMs?: number): void {
    this.delete(key)

    const entry: CacheEntry<T> = { value }
    if (ttlMs && ttlMs > 0) {
      entry.expiresAt = Date.now() + ttlMs
      entry.timeoutId = setTimeout(() => this.delete(key), ttlMs)
    }
    this.store.set(key, entry)
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined
    if (!entry) {
      return undefined
    }
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.delete(key)
      return undefined
    }
    return entry.value
  }

  delete(key: string): void {
    const entry = this.store.get(key)
    if (entry?.timeoutId) {
      clearTimeout(entry.timeoutId)
    }
    this.store.delete(key)
  }

  clear(): void {
    for (const key of this.store.keys()) {
      this.delete(key)
    }
  }
}
