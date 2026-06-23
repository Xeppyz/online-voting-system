import { createMockBrowserClient, createRealBrowserClient, isSupabaseMockMode } from "./mock"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ""

  if (isSupabaseMockMode()) {
    return createMockBrowserClient()
  }

  return createRealBrowserClient(url, anonKey)
}
