"use client"

import type { NomineeWithVotes } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Vote, Check, User, Instagram, Facebook } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LoginDialog } from "@/components/auth/login-dialog"
import Link from "next/link"
import Image from "next/image"
import confetti from "canvas-confetti"
import { useAnonymousVoteStatus } from "@/hooks/use-anonymous-vote-status"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import { toast } from "sonner"

interface NomineeCardProps {
  nominee: NomineeWithVotes
  categoryId: string
  isVoted: boolean
  hasVoted: boolean
  userId?: string
  categoryName?: string
  showCategoryInfo?: boolean
  compact?: boolean
  variant?: "social" | "voting"
  votingStatus?: "active" | "upcoming" | "ended"
}

export function NomineeCard({
  nominee,
  categoryId,
  isVoted,
  hasVoted,
  userId,
  categoryName,
  showCategoryInfo = true,
  compact = false,
  variant = "social",
  votingStatus = "active"
}: NomineeCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [localIsVoted, setLocalIsVoted] = useState(isVoted)
  const [isManualFlipped, setIsManualFlipped] = useState(false) // [NEW] State for mobile flip

  // Hook for anonymous vote persistence
  const { hasVotedInCategory: anonHasVotedCat, votedForNominee: anonVotedNominee, loading: anonLoading } = useAnonymousVoteStatus(categoryId, nominee.id, userId)

  const effectiveIsVoted = isVoted || localIsVoted || anonVotedNominee
  const effectiveHasVoted = hasVoted || localIsVoted || anonHasVotedCat || anonVotedNominee
  const isVotingDisabled = votingStatus !== "active"

  const router = useRouter()

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isVotingDisabled) {
      if (votingStatus === "upcoming") toast.info("La votación aún no ha comenzado")
      if (votingStatus === "ended") toast.info("La votación ha finalizado")
      return
    }

    if (!userId) {
      const supabase = createClient()
      const { data: settings } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "enable_anonymous_voting")
        .single()

      if (settings?.value === true) {
        setIsLoading(true)
        try {
          const fp = await FingerprintJS.load()
          const result = await fp.get()
          const deviceId = result.visitorId

          const { error } = await supabase.from("votes").insert({
            device_id: deviceId,
            nominee_id: nominee.id,
            category_id: categoryId,
          })

          if (error) {
            if (error.code === "23505") {
              toast.error("Ya has votado desde este dispositivo")
              setLocalIsVoted(true)
              return
            }
            throw error
          }

          setLocalIsVoted(true)
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#0066FF", "#3ffcff", "#3385FF"],
          })
          router.refresh()
        } catch (error) {
          console.error("Error anonymous voting:", error)
          toast.error("Error al votar")
        } finally {
          setIsLoading(false)
        }
        return
      }

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
        colors: ["#0066FF", "#3ffcff", "#3385FF"],
      })

      router.refresh()
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Error al votar")
    } finally {
      setIsLoading(false)
    }
  }

  const voted = effectiveIsVoted

  return (
    <>
      {/* CORRECCIÓN: Usamos h-auto en lugar de h-full para que el aspect-ratio mande sobre la altura */}
      <div
        className={`group h-auto w-full aspect-[4/5] [perspective:1000px] ${compact ? 'text-sm' : ''} cursor-pointer`}
        onClick={() => setIsManualFlipped(!isManualFlipped)}
      >
        <div className={`relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] ${isManualFlipped ? "[transform:rotateY(180deg)]" : "group-hover:[transform:rotateY(180deg)]"}`}>
          {/* Front Face */}
          <div className="absolute inset-0 h-full w-full rounded-2xl overflow-hidden [backface-visibility:hidden]">
            <div className="relative h-full w-full bg-gradient-to-br from-primary/20 to-[#3ffcff]/20">
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
                <h3 className={`${compact ? 'text-base md:text-lg' : 'text-lg md:text-xl'} font-bold line-clamp-2 leading-tight`}>{nominee.name}</h3>
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
          <div className="absolute inset-0 h-full w-full rounded-2xl bg-card border border-border p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-center items-center text-center overflow-hidden">

            {/* Background Image with Low Opacity */}
            {nominee.image_url && (
              <>
                <Image
                  src={nominee.image_url}
                  alt=""
                  fill
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-background/80" />
              </>
            )}

            {/* Clik Logo */}
            <div className="relative w-24 h-12 mb-2 z-20 flex-shrink-0">
              <Image
                src="/icon/ClikHFull.png"
                alt="Clik Awards"
                fill
                className="object-contain"
              />
            </div>

            {categoryName && showCategoryInfo && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-[#3ffcff] text-white text-xs font-bold shadow-lg transform hover:scale-105 transition-transform z-20">
                {categoryName}
              </div>
            )}

            <div className="w-full mt-4 relative z-10 px-2">
              <h3 className="text-lg font-bold text-foreground mb-1 truncate">{nominee.name}</h3>
              {nominee.description && (
                <p
                  className="text-muted-foreground text-xs overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {nominee.description}
                </p>
              )}
            </div>

            {variant === "voting" ? (
              <div className="space-y-2 w-full relative z-10 mt-auto pt-2">
                <Link href={`/nominados/${nominee.id}`} className="block w-full">
                  <Button variant="outline" size="sm" className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 backdrop-blur-sm">
                    Ver Perfil
                  </Button>
                </Link>

                <Button
                  onClick={handleVote}
                  disabled={effectiveHasVoted || isLoading || (anonLoading && !userId) || isVotingDisabled}
                  size="sm"
                  className={`w-full ${voted ? "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20" : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"}`}
                  variant={voted ? "outline" : "default"}
                >
                  {isLoading ? (
                    "..."
                  ) : voted ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Tu voto
                    </>
                  ) : effectiveHasVoted ? (
                    "Ya votaste"
                  ) : isVotingDisabled ? (
                    votingStatus === "upcoming" ? "Próximamente" : "Finalizado"
                  ) : (
                    <>
                      <Vote className="w-4 h-4 mr-2" />
                      Votar
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 mt-auto relative z-10 pt-4">
                {nominee.social_links?.map((link, index) => {
                  const Icon = link.platform === "instagram" ? Instagram : link.platform === "facebook" ? Facebook : null

                  return (
                    <Link
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      {link.platform === "tiktok" ? (
                        <img
                          src="/icon/TIKTOKWHITE.png"
                          alt="TikTok"
                          className="w-5 h-5 object-contain"
                        />
                      ) : Icon ? (
                        <Icon className="w-5 h-5" />
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}