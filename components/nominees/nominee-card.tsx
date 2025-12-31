"use client"

import type { NomineeWithVotes } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Vote, Check, User } from "lucide-react"
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
  showCategoryInfo?: boolean
  compact?: boolean
}

export function NomineeCard({
  nominee,
  categoryId,
  isVoted,
  hasVoted,
  userId,
  categoryName,
  showCategoryInfo = true,
  compact = false
}: NomineeCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [localIsVoted, setLocalIsVoted] = useState(isVoted)
  const router = useRouter()

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault()
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
      {/* CORRECCIÓN: Usamos h-auto en lugar de h-full para que el aspect-ratio mande sobre la altura */}
      <div className={`group h-auto w-full aspect-[4/5] [perspective:1000px] ${compact ? 'text-sm' : ''}`}>
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
                  <div className={`rounded-full bg-primary/20 flex items-center justify-center ${compact ? 'w-16 h-16' : 'w-24 h-24'}`}>
                    <User className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} text-primary`} />
                  </div>
                </div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Name on Front */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                {/* Usamos line-clamp-2 para evitar textos muy largos */}
                <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold line-clamp-2 leading-tight`}>{nominee.name}</h3>
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
            {categoryName && showCategoryInfo && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-[#00D4FF] text-white text-xs font-bold shadow-lg transform hover:scale-105 transition-transform z-20">
                {categoryName}
              </div>
            )}

            <div className="w-full mt-6">
              <h3 className="text-xl font-bold text-foreground mb-1 truncate">{nominee.name}</h3>
              {nominee.description && (
                <p
                  className="text-muted-foreground text-sm mb-4 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3, // Ajustado a 3 líneas para que se vea bien
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {nominee.description}
                </p>
              )}


            </div>

            <div className="space-y-3 w-full">
              <Link href={`/nominados/${nominee.id}`} className="block w-full">
                <Button variant="outline" className="w-full">
                  Ver Perfil
                </Button>
              </Link>

              <Button
                onClick={handleVote}
                disabled={hasVoted || isLoading}
                className={`w-full ${voted ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
                variant={voted ? "outline" : "default"}
              >
                {isLoading ? (
                  "..."
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