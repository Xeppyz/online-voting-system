"use client"

import type { NomineeWithVotes, Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, User, Share2, Instagram, Facebook, Check } from "lucide-react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { LoginDialog } from "@/components/auth/login-dialog"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import html2canvas from "html2canvas"

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
  const router = useRouter()
  const shareRef = useRef<HTMLDivElement>(null)

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
      }
    } catch (err) {
      console.error("Error generating share image", err)
    } finally {
      setIsLoading(false)
    }
  }

  const voted = isVoted // Simplified since local state is gone with vote button removal

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
              <h1 className="text-5xl sm:text-7xl font-black text-foreground uppercase tracking-tight leading-none text-balance">
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
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
                <Button
                  onClick={handleShare}
                  size="lg"
                  disabled={isLoading}
                  className="w-full sm:w-auto h-16 text-xl px-12 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 shadow-lg shadow-orange-500/20 text-white border-0 transition-transform active:scale-95"
                >
                  <Share2 className="w-6 h-6 mr-3" />
                  {isLoading ? "Generando Story..." : "Compartir en Historia"}
                </Button>
                <p className="text-xs text-muted-foreground mt-3 pl-1">
                  * Crea una imagen personalizada lista para subir a tus historias de Instagram.
                </p>
              </div>
            </div>

            {!userId && !hasVotedInCategory && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-sm text-muted-foreground">
                  Para votar por este nominado, regresa a la categoría o inicia sesión.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

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
            <div className="w-4 h-32 rounded-full" style={{ backgroundColor: '#3ffcff' }} />
            <h2 className="text-6xl font-black uppercase tracking-tighter" style={{ fontWeight: 900, lineHeight: 1 }}>
              Clik<br /><span style={{ color: '#3ffcff' }}>Awards</span>
            </h2>
          </div>
        </div>

        {/* Main Card */}
        <div
          className="relative w-full aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl"
          style={{
            border: '8px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.05)'
          }}
        >
          {/* Glowing back */}
          <div
            className="absolute inset-0 mix-blend-overlay"
            style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(63,252,255,0.2), rgba(147,51,234,0.2))' }}
          />

          {nominee.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={nominee.image_url} alt="" className="w-full h-full object-contain" style={{ objectPosition: 'center' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <User className="w-48 h-48" style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
          )}

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}
          />

          {/* Content on Image */}
          <div className="absolute bottom-16 left-12 right-12">
            <div
              className="inline-block px-8 py-3 rounded-full mb-6 text-3xl font-bold uppercase tracking-wider text-white"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {category.name}
            </div>
            <h1 className="text-7xl font-black uppercase text-white leading-none tracking-tight" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
              {nominee.name}
            </h1>
          </div>
        </div>

        {/* Voting Text */}
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-bold uppercase tracking-widest" style={{ color: '#3ffcff' }}>
            ¡Yo Voté Por!
          </h2>
          <div className="w-32 h-2 mx-auto rounded-full mt-8" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Footer Tag */}
        <div className="mt-auto text-center space-y-4">
          <p className="text-5xl font-black tracking-tighter text-white">
            @clikawards_nic
          </p>
          <p className="text-3xl font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Enero 2026
          </p>
        </div>
      </div>
    </>
  )
}
