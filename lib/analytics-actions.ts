"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export async function trackVisit(path: string) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Get simple visitor ID from headers (IP hash fallback or similar if needed, 
        // but for now we rely on user_id or just anonymous count)
        // We won't complex fingerprinting to keep it simple and privacy friendly-ish.

        await supabase.from("analytics_visits").insert({
            path,
            user_id: user?.id || null,
        })
    } catch (error) {
        console.error("Failed to track visit:", error)
    }
}
