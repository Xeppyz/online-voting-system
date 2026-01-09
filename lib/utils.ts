import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toNicaraguaTime(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null

  // Ensure consistent ISO format
  let cleanDate = dateStr.trim()

  // If it's already an ISO string with timezone, trust it.
  // Regex looks for Z or +XX:XX or -XX:XX at the end
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(cleanDate)) {
    return new Date(cleanDate)
  }

  // Otherwise, assume it's local Nicaragua time and append offset
  return new Date(`${cleanDate}-06:00`)
}
