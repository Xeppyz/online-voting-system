"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

interface UserVotesContextType {
    userVotes: Record<string, string> // categoryId -> nomineeId
    hasVotedInCategory: (categoryId: string) => boolean
    getVotedNominee: (categoryId: string) => string | null
    isLoading: boolean
    userId: string | null
    refreshVotes: () => Promise<void>
    addVoteLocally: (categoryId: string, nomineeId: string) => void
}

const UserVotesContext = createContext<UserVotesContextType | undefined>(undefined)

export function UserVotesProvider({ children }: { children: ReactNode }) {
    const [userVotes, setUserVotes] = useState<Record<string, string>>({})
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const fetchVotes = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session) {
                setUserId(null)
                setUserVotes({})
                setIsLoading(false)
                return
            }

            setUserId(session.user.id)

            const { data: votes, error } = await supabase
                .from("votes")
                .select("category_id, nominee_id")
                .eq("user_id", session.user.id)

            if (error) {
                console.error("Error fetching votes:", error)
                return
            }

            const votesMap: Record<string, string> = {}
            votes?.forEach((vote) => {
                votesMap[vote.category_id] = vote.nominee_id
            })

            setUserVotes(votesMap)
        } catch (error) {
            console.error("Error in fetchVotes:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const addVoteLocally = (categoryId: string, nomineeId: string) => {
        setUserVotes((prev) => ({
            ...prev,
            [categoryId]: nomineeId,
        }))
    }

    useEffect(() => {
        fetchVotes()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                if (session?.user.id !== userId) {
                    fetchVotes()
                }
            } else if (event === "SIGNED_OUT") {
                setUserId(null)
                setUserVotes({})
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [userId])

    const hasVotedInCategory = (categoryId: string) => !!userVotes[categoryId]
    const getVotedNominee = (categoryId: string) => userVotes[categoryId] || null

    return (
        <UserVotesContext.Provider
            value={{ userVotes, hasVotedInCategory, getVotedNominee, isLoading, userId, refreshVotes: fetchVotes, addVoteLocally }}
        >
            {children}
        </UserVotesContext.Provider>
    )
}

export function useUserVotes() {
    const context = useContext(UserVotesContext)
    if (context === undefined) {
        throw new Error("useUserVotes must be used within a UserVotesProvider")
    }
    return context
}
