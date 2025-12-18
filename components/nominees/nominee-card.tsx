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
  categoryName?: string
}

export function NomineeCard({ nominee, categoryId, isVoted, hasVoted, userId, categoryName }: NomineeCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [localIsVoted, setLocalIsVoted] = useState(isVoted)
  const router = useRouter()

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link navigation if inside a link
    e.stopPropagation()

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
      <div className="group h-[400px] w-full [perspective:1000px]">
        <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          {/* Front Face */}
          <div className="absolute inset-0 h-full w-full rounded-2xl overflow-hidden [backface-visibility:hidden]">
            <div className="relative h-full w-full bg-gradient-to-br from-primary/20 to-[#00D4FF]/20">
              {nominee.image_url ? (
                <Image
                  src={nominee.image_url || "/placeholder.svg"}
                  alt={nominee.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                </div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Name on Front (Optional, but good for UX) */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-bold truncate">{nominee.name}</h3>
              </div>

              {/* Voted Badge */}
              {voted && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  <Check className="w-3 h-3" />
                  Votado
                </div>
              )}
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 h-full w-full rounded-2xl bg-card border border-border p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-center items-center text-center">
            {/* Floating Category Badge */}
            {categoryName && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-[#00D4FF] text-white text-xs font-bold shadow-lg transform hover:scale-105 transition-transform z-20">
                {categoryName}
              </div>
            )}

            <div className="w-full mt-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{nominee.name}</h3>
              {nominee.description && (
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{nominee.description}</p>
              )}

              {/* Vote Stats */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm px-2">
                  <span className="text-muted-foreground">{nominee.vote_count} votos</span>
                  <span className="font-medium text-primary">{nominee.percentage}%</span>
                </div>
                <Progress value={nominee.percentage} className="h-2" />
              </div>
            </div>

            <div className="space-y-3 w-full">
              <Link href={`/nominados/${nominee.id}`} className="block w-full">
                <Button variant="outline" className="w-full">
                  Ver Perfil Completo
                </Button>
              </Link>

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
        </div>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
