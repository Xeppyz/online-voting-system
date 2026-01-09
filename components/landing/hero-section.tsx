"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Vote } from "lucide-react"
import localFont from "next/font/local"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toNicaraguaTime } from "@/lib/utils"

const avantiqueBold = localFont({
    src: "../../public/fonts/Avantique-Bold.otf",
})

interface HeroSectionProps {
    votingStartDate?: string | null
    votingEndDate?: string | null
    showCountdown?: boolean
    heroVideoUrl?: string | null
}

export function HeroSection({ votingStartDate, votingEndDate, showCountdown = true, heroVideoUrl }: HeroSectionProps) {
    const [timerTarget, setTimerTarget] = useState<Date | null>(null)
    const [timerTitle, setTimerTitle] = useState("")
    const [isVotingEnded, setIsVotingEnded] = useState(false)
    const [showVoteButton, setShowVoteButton] = useState(false)

    useEffect(() => {
        const now = new Date()

        const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime())

        let start = toNicaraguaTime(votingStartDate)
        let end = toNicaraguaTime(votingEndDate)

        if (start && !isValidDate(start)) start = null
        if (end && !isValidDate(end)) end = null

        // Reset states at the beginning of each effect run
        setTimerTarget(null);
        setTimerTitle("");
        setIsVotingEnded(false);
        setShowVoteButton(false);

        const checkAdminStatus = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            console.log("HeroSection: Checking user", user?.id)

            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                console.log("HeroSection: Profile check", { profile, error })

                if (profile?.role === 'admin') {
                    console.log("HeroSection: User is admin, enabling button")
                    setShowVoteButton(true)
                    setIsVotingEnded(false)
                    setTimerTarget(null) // No timer for admins if they can already vote
                    return
                }
            }

            if (end && now > end) {
                setIsVotingEnded(true)
                setShowVoteButton(false)
                setTimerTarget(null)
                return
            }

            // Always show vote button if not passed end date
            setShowVoteButton(true)

            if (start && now < start && showCountdown) {
                setTimerTarget(start)
                setTimerTitle("La votación inicia en:")
                setShowVoteButton(false)
            } else if (end && showCountdown) {
                setTimerTarget(end)
                setTimerTitle("La votación termina en:")
                setShowVoteButton(true)
            } else {
                // If manual toggle is off, we still want to show the button if active
                if (start && now >= start && (!end || now <= end)) {
                    setShowVoteButton(true)
                }
                setTimerTarget(null)
            }
        }

        checkAdminStatus()

    }, [votingStartDate, votingEndDate, showCountdown])

    return (
        <section className="relative min-h-[100dvh] md:min-h-[80vh] flex items-center justify-center overflow-hidden pt-32 md:pt-0 pb-12 md:pb-0">
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
                <div className="space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        <span className="text-[10px] md:text-xs font-medium uppercase tracking-wide font-sans">El primer reconocimiento a los creadores de contenido en Nicaragua</span>
                    </div>

                    {/* MOBILE HERO LAYOUT */}
                    <div className="block md:hidden w-full space-y-6 mt-4">
                        <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10 mx-auto max-w-[400px]">
                            <video
                                className="absolute inset-0 w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster="/placeholder.svg"
                            >
                                <source src={heroVideoUrl || "/clikaward.mp4"} type="video/mp4" />
                            </video>

                            <div className="absolute inset-0 bg-black/40 z-10" />

                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center space-y-6">
                                <p className="text-white text-lg font-medium drop-shadow-md max-w-[280px]">
                                    Tu voto cuenta. Elige a tus favoritos y sé parte de la celebración más grande del año.
                                </p>

                                {showVoteButton ? (
                                    <Link href="/categorias" className="w-full max-w-[240px]">
                                        <Button
                                            size="lg"
                                            className={`w-full text-base px-6 py-6 h-auto rounded-xl bg-[#3ffcff] text-black shadow-lg shadow-[#3ffcff]/25 hover:shadow-xl hover:shadow-[#3ffcff]/30 transition-all hover:bg-[#3ffcff]/90 ${avantiqueBold.className}`}
                                        >
                                            <div className="relative w-6 h-6 mr-3">
                                                <Image
                                                    src="/icon/CHECKICON-8.png"
                                                    alt="Icon"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            Iniciar Votación
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button
                                        size="lg"
                                        disabled
                                        className={`w-full max-w-[240px] text-base px-6 py-6 h-auto rounded-xl bg-white/10 text-white/50 border border-white/10 backdrop-blur-md cursor-not-allowed ${avantiqueBold.className}`}
                                    >
                                        {isVotingEnded ? "Votación Cerrada" : "Próximamente"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-4 items-center mt-4">
                        {/* Left Image Block */}
                        <div className="hidden md:flex md:col-span-3 order-1 md:order-1 justify-center">
                            <div className="relative w-full aspect-[3/4] max-w-[200px] md:max-w-[240px] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                                <Image
                                    src="/side/side1.png"
                                    alt="Clikawards Highlights"
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 300px"
                                />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-span-1 md:col-span-6 space-y-6 order-2 md:order-2">
                            {/* Main Title - Replaced with Logo */}
                            <div className="flex justify-center">
                                <Image
                                    src="/icon/ClikV01.png"
                                    alt="Clik Awards Logo"
                                    width={400}
                                    height={200}
                                    className="w-full max-w-[180px] md:max-w-[300px] h-auto object-contain"
                                    priority
                                />
                            </div>

                            {/* Countdown Timer */}
                            {timerTarget && (
                                <div className="py-2">
                                    <CountdownTimer targetDate={timerTarget.toISOString()} title={timerTitle} />
                                </div>
                            )}

                            {isVotingEnded && (
                                <div className="py-2">
                                    <h3 className="text-xl md:text-3xl font-bold uppercase tracking-widest text-[#3ffcff]">
                                        Votación Finalizada
                                    </h3>
                                    <p className="text-muted-foreground mt-2">Gracias por participar.</p>
                                </div>
                            )}

                            {/* Subtitle */}
                            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty font-sans px-4">
                                Tu voto cuenta. Elige a tus favoritos y sé parte de la celebración más grande del año.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {showVoteButton ? (
                                    <Link href="/categorias">
                                        <Button
                                            size="lg"
                                            className={`text-sm md:text-lg px-6 py-4 md:px-8 md:py-6 h-auto rounded-xl bg-[#3ffcff] text-primary-foreground shadow-lg shadow-[#3ffcff]/25 hover:shadow-xl hover:shadow-[#3ffcff]/30 transition-all hover:bg-[#3ffcff]/90 ${avantiqueBold.className}`}
                                        >
                                            <div className="relative w-6 h-6 mr-3">
                                                <Image
                                                    src="/icon/CHECKICON-8.png"
                                                    alt="Icon"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            Iniciar Votación
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button
                                        size="lg"
                                        disabled
                                        className={`text-sm md:text-lg px-6 py-4 md:px-8 md:py-6 h-auto rounded-xl bg-muted text-muted-foreground opacity-50 cursor-not-allowed ${avantiqueBold.className}`}
                                    >
                                        <Vote className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                                        {isVotingEnded ? "Votación Cerrada" : "Próximamente"}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Right Image Block */}
                        <div className="block md:col-span-3 order-3 md:order-3">
                            <div className="flex justify-center">
                                <div className="relative w-full aspect-[3/4] max-w-[200px] md:max-w-[240px] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 transform rotate-[6deg] hover:rotate-0 transition-transform duration-500">
                                    <Image
                                        src="/side/side1.1.png"
                                        alt="Clikawards Highlights"
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 300px"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
