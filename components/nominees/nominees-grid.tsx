"use client"

import type { NomineeWithVotes } from "@/lib/types"
import { motion } from "framer-motion"
import { NomineeCard } from "./nominee-card"
import { Users } from "lucide-react"

interface NomineesGridProps {
  nominees: NomineeWithVotes[]
  categoryId: string
  userVote: string | null
  userId?: string
}

export function NomineesGrid({ nominees, categoryId, userVote, userId }: NomineesGridProps) {
  if (nominees.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No hay nominados</h3>
        <p className="text-muted-foreground">Los nominados se agregarán pronto. ¡Vuelve más tarde!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nominees.map((nominee, index) => (
        <motion.div
          key={nominee.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <NomineeCard
            nominee={nominee}
            categoryId={categoryId}
            isVoted={userVote === nominee.id}
            hasVoted={!!userVote}
            userId={userId}
          />
        </motion.div>
      ))}
    </div>
  )
}