"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface VoteStats {
  nomineeId: string
  voteCount: number
}

export function useRealtimeVotes(categoryId: string) {
  const [voteStats, setVoteStats] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    const fetchVotes = async () => {
      const { data } = await supabase.from("votes").select("nominee_id").eq("category_id", categoryId)

      if (data) {
        const stats = data.reduce(
          (acc, vote) => {
            acc[vote.nominee_id] = (acc[vote.nominee_id] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )
        setVoteStats(stats)
      }
      setIsLoading(false)
    }

    fetchVotes()

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`votes-${categoryId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `category_id=eq.${categoryId}`,
        },
        () => {
          fetchVotes()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [categoryId])

  return { voteStats, isLoading }
}
