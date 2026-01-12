"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export function useUserVoteStatus(categoryId: string, nomineeId?: string) {
    const [user, setUser] = useState<User | null>(null)
    const [hasVotedInCategory, setHasVotedInCategory] = useState(false)
    const [votedForNominee, setVotedForNominee] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        const checkAuthAndVotes = async () => {
            try {
                const supabase = createClient()

                // 1. Check Session
                const { data: { user } } = await supabase.auth.getUser()

                if (mounted) setUser(user)

                if (!user) {
                    if (mounted) setLoading(false)
                    return
                }

                // 2. Fetch Votes
                const { data: vote } = await supabase
                    .from("votes")
                    .select("nominee_id")
                    .eq("user_id", user.id)
                    .eq("category_id", categoryId)
                    .single()

                if (mounted && vote) {
                    setHasVotedInCategory(true)
                    if (nomineeId && vote.nominee_id === nomineeId) {
                        setVotedForNominee(true)
                    }
                }
            } catch (err) {
                console.error("Error checking user votes:", err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        checkAuthAndVotes()

        return () => { mounted = false }
    }, [categoryId, nomineeId])

    return { user, hasVotedInCategory, votedForNominee, loading }
}
