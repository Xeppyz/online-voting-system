"use client"

import type { NomineeWithVotes, Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Vote, Check, ArrowLeft, Play, User, Share2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LoginDialog } from "@/components/auth/login-dialog"
import Link from "next/link"
import Image from "next/image"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"

interface NomineeProfileProps {
  nominee: NomineeWithVotes
  category: Category
  isVoted: boolean
  hasVotedInCategory: boolean
  userId?: string
}

export function NomineeProfile({ nominee, category, isVoted, hasVotedInCategory, userId }: NomineeProfileProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [localIsVoted, setLocalIsVoted] = useState(isVoted)
  const [showVideo, setShowVideo] = useState(false)
  const router = useRouter()

  const handleVote = async () => {
    if (!userId) {
      setShowLoginDialog(true)
      return
    }

    if (hasVotedInCategory) return

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("votes").insert({
        user_id: userId,
        nominee_id: nominee.id,
        category_id: nominee.category_id,
      })

      if (error) throw error

      setLocalIsVoted(true)

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 100,
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

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Vota por ${nominee.name}`,
        text: `¡Vota por ${nominee.name} en la categoría ${category.name} de Armando La Plática!`,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const voted = localIsVoted || isVoted

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/categorias/${category.id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a {category.name}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image/Video */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-[#00D4FF]/20 border border-border">
              {nominee.image_url ? (
                <Image
                  src={nominee.image_url || "/placeholder.svg"}
                  alt={nominee.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-16 h-16 text-primary" />
                  </div>
                </div>
              )}

              {/* Voted Overlay */}
              {voted && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Tu voto
                </div>
              )}
            </div>

            {/* Video Player */}
            {nominee.clip_url && (
              <div className="space-y-2">
                {showVideo ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                    <video
                      src={nominee.clip_url}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                      onError={() => setShowVideo(false)}
                    />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowVideo(true)}
                    className="w-full h-14 text-base bg-transparent"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Ver clip del nominado
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Right Column - Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Category Badge */}
            <Link href={`/categorias/${category.id}`}>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                {category.name}
              </span>
            </Link>

            {/* Nominee Name */}
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">{nominee.name}</h1>

            {/* Description */}
            {nominee.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">{nominee.description}</p>
            )}

            {/* Stats Card */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Estadísticas de votación</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">{nominee.vote_count} votos</span>
                  <span className="text-3xl font-bold text-primary">{nominee.percentage}%</span>
                </div>
                <Progress value={nominee.percentage} className="h-3" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleVote}
                disabled={hasVotedInCategory || isLoading}
                size="lg"
                className={`flex-1 h-14 text-lg ${voted ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}`}
                variant={voted ? "outline" : "default"}
              >
                {isLoading ? (
                  "Votando..."
                ) : voted ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Has votado por este nominado
                  </>
                ) : hasVotedInCategory ? (
                  "Ya votaste en esta categoría"
                ) : (
                  <>
                    <Vote className="w-5 h-5 mr-2" />
                    Votar por {nominee.name}
                  </>
                )}
              </Button>

              <Button onClick={handleShare} variant="outline" size="lg" className="h-14 bg-transparent">
                <Share2 className="w-5 h-5 mr-2" />
                Compartir
              </Button>
            </div>

            {!userId && !hasVotedInCategory && (
              <p className="text-sm text-muted-foreground text-center">
                Necesitas iniciar sesión con Google para poder votar
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
