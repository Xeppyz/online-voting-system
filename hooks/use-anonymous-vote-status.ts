"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import FingerprintJS from "@fingerprintjs/fingerprintjs"

export function useAnonymousVoteStatus(categoryId: string, nomineeId?: string, userId?: string) {
    // If we have a userId, we trust the server-side props (or existing auth logic), 
    // so we default to false/null here and let the parent handle it, 
    // OR we can return predictable "not anonymous" state.
    // Ideally this hook only runs if !userId.

    const [hasVotedInCategory, setHasVotedInCategory] = useState(false)
    const [votedForNominee, setVotedForNominee] = useState(false)
    const [loading, setLoading] = useState(true)
    const [deviceId, setDeviceId] = useState<string | null>(null)

    useEffect(() => {
        if (userId) {
            setLoading(false)
            return
        }

        let mounted = true

        const checkVotes = async () => {
            try {
                const supabase = createClient()

                // 0. Check if anonymous voting is enabled GLOBALLY
                const { data: settings } = await supabase
                    .from("app_settings")
                    .select("value")
                    .eq("key", "enable_anonymous_voting")
                    .single()

                // If disabled or error, we assume it's disabled, so we don't check for anonymous votes
                // IMPORTANT: If we return early, loading state stays true? No, we must set false.
                if (!settings || settings.value !== true) {
                    if (mounted) setLoading(false)
                    return
                }

                // 1. Get Device ID
                // Try to get from localStorage first to be fast
                let visitorId = localStorage.getItem("fv_visitor_id")

                if (!visitorId) {
                    const fp = await FingerprintJS.load()
                    const result = await fp.get()
                    visitorId = result.visitorId
                    localStorage.setItem("fv_visitor_id", visitorId)
                }

                if (mounted) setDeviceId(visitorId)

                // 2. Query Supabase
                // const supabase = createClient() -- already created above
                const { data: votes } = await supabase
                    .from("votes")
                    .select("nominee_id")
                    .eq("category_id", categoryId)
                    .eq("device_id", visitorId)

                if (mounted && votes && votes.length > 0) {
                    setHasVotedInCategory(true)
                    if (nomineeId) {
                        const myVote = votes.find(v => v.nominee_id === nomineeId)
                        if (myVote) setVotedForNominee(true)
                    }
                }
            } catch (err) {
                console.error("Error checking anonymous votes:", err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        checkVotes()

        return () => { mounted = false }
    }, [categoryId, nomineeId, userId])

    return { hasVotedInCategory, votedForNominee, loading, deviceId }
}
