"use client"

import type { CategoryWithNominees } from "@/lib/types"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { StatsOverview } from "./stats-overview"
import { CategoryStats } from "./category-stats"
import { motion } from "framer-motion"

interface StatsContentProps {
  initialCategories: CategoryWithNominees[]
  totalVotes: number
}

export function StatsContent({ initialCategories, totalVotes: initialTotalVotes }: StatsContentProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to real-time vote changes
    const channel = supabase
      .channel("votes-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, async () => {
        // Refetch all data when votes change
        const { data: allVotes } = await supabase.from("votes").select("*")
        const { data: allNominees } = await supabase.from("nominees").select("*")
        const { data: allCategories } = await supabase.from("categories").select("*")

        if (allVotes && allNominees && allCategories) {
          const nomineeVotes = allVotes.reduce(
            (acc, vote) => {
              acc[vote.nominee_id] = (acc[vote.nominee_id] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )

          const categoryVotes = allVotes.reduce(
            (acc, vote) => {
              acc[vote.category_id] = (acc[vote.category_id] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )

          const updatedCategories = allCategories.map((category) => {
            const categoryNominees = allNominees
              .filter((n) => n.category_id === category.id)
              .map((nominee) => ({
                ...nominee,
                vote_count: nomineeVotes[nominee.id] || 0,
              }))

            const totalCategoryVotes = categoryVotes[category.id] || 0

            return {
              ...category,
              nominees: categoryNominees.map((n) => ({
                ...n,
                percentage: totalCategoryVotes > 0 ? Math.round((n.vote_count / totalCategoryVotes) * 100) : 0,
              })),
              total_votes: totalCategoryVotes,
            }
          })

          setCategories(updatedCategories)
          setTotalVotes(allVotes.length)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="space-y-8">
      <StatsOverview categories={categories} totalVotes={totalVotes} />

      <div className="space-y-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CategoryStats category={category} />
          </motion.div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No hay estadísticas disponibles aún</p>
          </div>
        )}
      </div>
    </div>
  )
}
