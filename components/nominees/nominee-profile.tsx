"use client"

import type { NomineeWithVotes, Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, User, Share2, Instagram, Facebook, Check, Vote } from "lucide-react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { LoginDialog } from "@/components/auth/login-dialog"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import html2canvas from "html2canvas"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import { useAnonymousVoteStatus } from "@/hooks/use-anonymous-vote-status"

import { createClient } from "@/lib/supabase/client"
import confetti from "canvas-confetti"
import { toast } from "sonner"

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
  const [showVideo, setShowVideo] = useState(false)
  const [localIsVoted, setLocalIsVoted] = useState(isVoted)

  // Hook for anonymous vote persistence
  const { hasVotedInCategory: anonHasVotedCat, votedForNominee: anonVotedNominee, loading: anonLoading } = useAnonymousVoteStatus(category.id, nominee.id, userId)

  const router = useRouter()
  const shareRef = useRef<HTMLDivElement>(null)

  // Merge server/local/anonymous states
  const effectiveIsVoted = isVoted || localIsVoted || anonVotedNominee
  const effectiveHasVotedInCategory = hasVotedInCategory || localIsVoted || anonHasVotedCat

  // Determine if we are still checking (only if not logged in)
  const isCheckingAuth = !userId && anonLoading

  const handleVote = async () => {
    // 1. Check if user is logged in
    if (!userId) {
      // 2. If not logged in, check if anonymous voting is enabled
      const supabase = createClient()
      const { data: settings } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "enable_anonymous_voting")
        .single()

      if (settings?.value === true) {
        // 3. Anonymous voting enabled: Generate Fingerprint
        setIsLoading(true)
        try {
          const fp = await FingerprintJS.load()
          const result = await fp.get()
          const deviceId = result.visitorId

          // 4. Submit anonymous vote
          const { error } = await supabase.from("votes").insert({
            device_id: deviceId,
            nominee_id: nominee.id,
            category_id: category.id,
          })

          if (error) {
            if (error.code === "23505") { // Unique violation
              toast.error("Ya has votado desde este dispositivo en esta categoría")
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

          toast.success("¡Voto registrado!")
          router.refresh()
        } catch (error) {
          console.error("Error anonymous voting:", error)
          toast.error("No se pudo registrar el voto anónimo")
        } finally {
          setIsLoading(false)
        }
        return
      }

      // 5. If anonymous voting disabled, show login dialog
      setShowLoginDialog(true)
      return
    }

    if (effectiveHasVotedInCategory && !effectiveIsVoted) {
      toast.error("Ya has votado en esta categoría")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("votes").insert({
        user_id: userId,
        nominee_id: nominee.id,
        category_id: category.id,
      })

      if (error) throw error

      setLocalIsVoted(true)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0066FF", "#3ffcff", "#3385FF"],
      })

      toast.success("¡Voto registrado!")
      router.refresh()
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("No se pudo registrar el voto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    setIsLoading(true)
    try {
      const element = shareRef.current
      if (!element) return

      // Generar imagen
      const canvas = await html2canvas(element, {
        backgroundColor: "#080808",
        scale: 1, // Full resolution matches container
        useCORS: true, // Allow external images
        allowTaint: true,
      })

      const dataUrl = canvas.toDataURL("image/png")
      const blob = await (await fetch(dataUrl)).blob()

      if (navigator.share) {
        try {
          const file = new File([blob], `voto-${nominee.id}.png`, { type: "image/png" })
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              // title: `Mi voto por ${nominee.name}`,
              // text: `He votado por ${nominee.name} en los Clik Awards. ¡Vota tú también! @clikawards_nic`
            })
          } else {
            // Fallback for devices supporting share but not files
            await navigator.share({
              title: `Mi voto por ${nominee.name}`,
              url: window.location.href
            })
          }
        } catch (err) {
          console.warn("Share failed or cancelled", err)
          // Fallback to manual download if share interaction failed (and wasn't just cancelled)
          if ((err as Error).name !== 'AbortError') {
            const link = document.createElement("a")
            link.href = dataUrl
            link.download = `voto-${nominee.name.replace(/\s+/g, "-")}.png`
            link.click()
          }
        }
      } else {
        // Desktop fallback
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `voto-${nominee.name.replace(/\s+/g, "-")}.png`
        link.click()
        toast.success("Imagen guardada", {
          description: "La imagen se ha descargado. ¡Ahora puedes subirla a tus redes!"
        })
      }
    } catch (err) {
      console.error("Error generating share image", err)
    } finally {
      setIsLoading(false)
    }
  }

  const voted = effectiveIsVoted

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
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-[#3ffcff]/20 border border-border group shadow-2xl shadow-primary/10">
              {nominee.image_url ? (
                <Image
                  src={nominee.image_url || "/placeholder.svg"}
                  alt={nominee.name}
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
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
                <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg z-20">
                  <Check className="w-4 h-4" />
                  Tu voto
                </div>
              )}
            </div>

            {/* Video Player */}
            {nominee.clip_url && (
              <div className="space-y-2">
                {showVideo ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border shadow-lg">
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
                    className="w-full h-14 text-base bg-transparent hover:bg-white/5 border-white/20 transition-all"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Ver clip del nominado
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Right Column - Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              {/* Category Badge */}
              <Link href={`/categorias/${category.id}`}>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors uppercase tracking-wider">
                  {category.name}
                </span>
              </Link>

              {/* Nominee Name */}
              <h1 className="text-5xl sm:text-7xl font-black text-foreground uppercase tracking-widest leading-none text-balance">
                {nominee.name}
              </h1>
            </div>

            {/* Description */}
            {nominee.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary/50 pl-6">
                  {nominee.description}
                </p>
              </div>
            )}

            <div className="w-full h-px bg-white/10" />

            {/* Social Media & Share */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-widest">
                Sigue al nominado
              </h3>

              <div className="flex flex-wrap gap-4">
                {nominee.social_links?.map((link, i) => {
                  const Icon = link.platform === "instagram" ? Instagram : link.platform === "facebook" ? Facebook : null
                  return (
                    <Link key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="lg" className="h-14 px-8 border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                        {link.platform === "tiktok" ? (
                          <img src="/icon/TIKTOKWHITE.png" alt="TikTok" className="w-5 h-5 mr-2 object-contain" />
                        ) : Icon ? (
                          <Icon className="w-6 h-6 mr-2" />
                        ) : null}
                        <span className="capitalize">{link.platform}</span>
                      </Button>
                    </Link>
                  )
                })}
                {(!nominee.social_links || nominee.social_links.length === 0) && (
                  <p className="text-muted-foreground italic">Este nominado no tiene redes sociales registradas.</p>
                )}
              </div>

              <div className="pt-4">
                {voted ? (
                  <>
                    <Button
                      onClick={handleShare}
                      size="lg"
                      disabled={isLoading || isCheckingAuth}
                      className="w-full sm:w-auto h-16 text-xl px-12 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 shadow-lg shadow-orange-500/20 text-white border-0 transition-transform active:scale-95"
                    >
                      <Share2 className="w-6 h-6 mr-3" />
                      {isLoading ? "Generando Story..." : "Compartir en Historia"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3 pl-1">
                      * Crea una imagen personalizada lista para subir a tus historias de Instagram.
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Button
                      onClick={handleVote}
                      size="lg"
                      disabled={isLoading || (effectiveHasVotedInCategory && !voted) || isCheckingAuth}
                      className="w-full sm:w-auto h-16 text-xl px-12 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-transform active:scale-95"
                    >
                      <img src="/icon/ISOTIPOCLIK512PX.png" alt="Votar" className="w-6 h-6 mr-3 object-contain" />
                      {isLoading ? "Registrando..." : "Votar"}
                    </Button>

                    {(effectiveHasVotedInCategory && !voted) && (
                      <p className="text-sm text-red-400">
                        Ya has votado por otro nominado en esta categoría.
                      </p>
                    )}

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center max-w-md mx-auto sm:mx-0">
                      <p className="text-amber-400 font-bold mb-1 uppercase tracking-wider text-xs">
                        🔒 ¡SORPRESA ESPECIAL!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Al votar por tu creador favorito, tendrás desbloqueada la opción de descargar una imagen que certifica que VOTASTE en los Clik Awards 2026.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {!userId && !effectiveHasVotedInCategory && !effectiveIsVoted && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-sm text-muted-foreground">
                  Para votar por este nominado, inicia sesión.
                </p>
              </div>
            )}
          </motion.div >
        </div >
      </div >

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

      {/* Hidden Capture Element for Instagram Story (1080x1920) */}
      <div
        ref={shareRef}
        style={{
          position: 'fixed',
          bottom: '-9999px',
          right: '-9999px',
          width: '1080px',
          height: '1920px',
          background: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #0a0a0a 70%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '120px 60px',
          gap: '60px',
          zIndex: -10,
          fontFamily: 'sans-serif',
          color: 'white'
        }}
      >
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon/ClikHFull.png"
              alt="Clik Awards"
              style={{ height: '160px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

        </div>

        {/* Main Card */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4/5',
            borderRadius: '60px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '8px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.05)'
          }}
        >
          {/* Glowing back - REMOVED per user request to avoid gradient effect */}

          {nominee.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={nominee.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <User style={{ width: '192px', height: '192px', color: 'rgba(255,255,255,0.2)' }} />
            </div>
          )}

          {/* Content on Image */}
          <div style={{ position: 'absolute', bottom: '64px', left: '48px', right: '48px' }}>

            <h1 style={{ fontSize: '72px', fontWeight: 900, textTransform: 'uppercase', color: 'white', lineHeight: 1, letterSpacing: '-0.025em', textShadow: '0 4px 8px rgba(0,0,0,0.5)', margin: 0 }}>
              {nominee.name}
            </h1>
          </div>
        </div>

        {/* Voting Text */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3ffcff', margin: 0 }}>
            ¡Yo Voté Por!
          </h2>
          <div style={{ width: '128px', height: '8px', margin: '32px auto 0', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Footer Tag */}
        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.05em', color: 'white', margin: '0 0 16px' }}>
            @clikawards_nic
          </p>
          <p style={{ fontSize: '30px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Enero 2026
          </p>
        </div>
      </div >
    </>
  )
}
