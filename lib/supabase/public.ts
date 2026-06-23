import { createMockSupabaseClient, createRealSupabaseClient, isSupabaseMockMode } from "./mock"

export function createPublicClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ""
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ""

    if (isSupabaseMockMode()) {
        return createMockSupabaseClient()
    }

    return createRealSupabaseClient(url, anonKey)
}
