import { createContext } from 'react'
import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createServiceContext<T>(service: () => T, initialValue?: T) {
  return createContext(initialValue!)
}

export function truncateAddress(address: string) {
  if (!address) return ''
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
