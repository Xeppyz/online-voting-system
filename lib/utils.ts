import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toNicaraguaTime(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null

  // Ensure consistent ISO format
  let cleanDate = dateStr.trim()

  // FORCE NICARAGUA TIME:
  // If the string has a timezone (Z or +/- offset), we STRIP it.
  // We want to treat "2026-01-01T18:00:00Z" as "18:00:00 in Nicaragua", not UTC.

  // Remove Z at the end
  cleanDate = cleanDate.replace(/Z$/, '')

  // Remove offset like +00:00 or -05:00 at the end if present
  cleanDate = cleanDate.replace(/[+-]\d{2}:?\d{2}$/, '')

  // Now append Nicaragua offset
  return new Date(`${cleanDate}-06:00`)
}
