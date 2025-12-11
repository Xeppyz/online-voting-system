"use client"

import type { NomineeWithVotes } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Vote, Check, User, Play } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LoginDialog } from "@/components/auth/login-dialog"
import Link from "next/link"
import Image from "next/image"
import confetti from "canvas-confetti"

interface NomineeCardProps {
  nominee: NomineeWithVotes
  categoryId: string
  isVoted: boolean
  hasVoted: boolean
  userId?: string
}

export function NomineeCard({ nominee, categoryId, isVoted, hasVoted, userId }: NomineeCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [localIsVoted, setLocalIsVoted] = useState(isVoted)
  const router = useRouter()

  const handleVote = async () => {
    if (!userId) {
      setShowLoginDialog(true)
      return
    }

    if (hasVoted) return

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("votes").insert({
        user_id: userId,
        nominee_id: nominee.id,
        category_id: categoryId,
      })

      if (error) throw error

      setLocalIsVoted(true)

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0066FF", "#00D4FF", "#3385FF"],
      })

      router.refresh()
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const voted = localIsVoted || isVoted

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl bg-card border transition-all duration-300 hover:shadow-lg ${voted ? "border-primary shadow-primary/10" : "border-border hover:border-primary/50"}`}
      >
        {/* Voted Badge */}
        {voted && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            <Check className="w-3 h-3" />
            Votado
          </div>
        )}

        {/* Nominee Image */}
        <Link href={`/nominados/${nominee.id}`}>
          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-[#00D4FF]/20">
            {nominee.image_url ? (
              <Image
                src={nominee.image_url || "/placeholder.svg"}
                alt={nominee.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

            {/* Video Indicator */}
            {nominee.clip_url && (
              <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs text-foreground">
                <Play className="w-3 h-3" />
                Ver clip
              </div>
            )}
          </div>
        </Link>

        {/* Nominee Info */}
        <div className="p-5">
          <Link href={`/nominados/${nominee.id}`}>
            <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {nominee.name}
            </h3>
          </Link>
          {nominee.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{nominee.description}</p>
          )}

          {/* Vote Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{nominee.vote_count} votos</span>
              <span className="font-medium text-primary">{nominee.percentage}%</span>
            </div>
            <Progress value={nominee.percentage} className="h-2" />
          </div>

          {/* Vote Button */}
          <Button
            onClick={handleVote}
            disabled={hasVoted || isLoading}
            className={`w-full ${voted ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
            variant={voted ? "outline" : "default"}
          >
            {isLoading ? (
              "Votando..."
            ) : voted ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Tu voto
              </>
            ) : hasVoted ? (
              "Ya votaste"
            ) : (
              <>
                <Vote className="w-4 h-4 mr-2" />
                Votar
              </>
            )}
          </Button>
        </div>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
