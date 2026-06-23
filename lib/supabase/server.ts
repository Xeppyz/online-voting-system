import { cookies } from "next/headers"
import { createMockServerClient, createRealServerClient, isSupabaseMockMode } from "./mock"

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ""

  if (isSupabaseMockMode()) {
    return createMockServerClient()
  }

  return createRealServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have proxy refreshing user sessions.
        }
      },
    },
  })
}
