import { AsyncLocalStorage } from 'async_hooks'

export type RequestContextData = {
  userId?: string
  requestId?: string
  method?: string
  path?: string
}

const storage = new AsyncLocalStorage<RequestContextData>()

export const RequestContext = {
  run<T>(context: RequestContextData, fn: () => T): T {
    return storage.run(context, fn)
  },
  get(): RequestContextData | undefined {
    return storage.getStore()
  },
}
