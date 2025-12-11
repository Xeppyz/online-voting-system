"use client"

import type { CategoryWithNominees } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

interface CategoryStatsProps {
  category: CategoryWithNominees
}

export function CategoryStats({ category }: CategoryStatsProps) {
  // Sort nominees by vote count
  const sortedNominees = [...category.nominees].sort((a, b) => b.vote_count - a.vote_count)
  const leader = sortedNominees[0]

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-[#00D4FF]/5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{category.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{category.total_votes} votos totales</p>
            </div>
          </div>
          <Link href={`/categorias/${category.id}`} className="text-sm text-primary hover:underline underline-offset-4">
            Ver nominados
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {sortedNominees.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No hay nominados en esta categoría</p>
        ) : (
          <div className="space-y-4">
            {sortedNominees.map((nominee, index) => {
              const isLeader = index === 0 && nominee.vote_count > 0

              return (
                <motion.div
                  key={nominee.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${isLeader ? "bg-primary/5 border border-primary/20" : "bg-muted/30"}`}
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isLeader ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 shrink-0">
                    {nominee.image_url ? (
                      <Image
                        src={nominee.image_url || "/placeholder.svg"}
                        alt={nominee.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{nominee.name}</p>
                      {isLeader && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                          Líder
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{nominee.vote_count} votos</span>
                        <span className={`font-medium ${isLeader ? "text-primary" : "text-foreground"}`}>
                          {nominee.percentage}%
                        </span>
                      </div>
                      <Progress value={nominee.percentage} className={`h-2 ${isLeader ? "[&>div]:bg-primary" : ""}`} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
