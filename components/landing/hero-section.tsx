import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Vote } from "lucide-react"
import localFont from "next/font/local"
import { CountdownTimer } from "@/components/ui/countdown-timer"

const avantiqueBold = localFont({
    src: "../../public/fonts/Avantique-Bold.otf",
})

interface HeroSectionProps {
    votingStartDate?: string | null
    votingEndDate?: string | null
}

export function HeroSection({ votingStartDate, votingEndDate }: HeroSectionProps) {
    const now = new Date()
    const startDate = votingStartDate ? new Date(votingStartDate) : null
    const endDate = votingEndDate ? new Date(votingEndDate) : null

    let timerTarget: string | null = null
    let timerTitle = ""
    let showVoteButton = true
    let isVotingEnded = false

    if (startDate && startDate > now) {
        timerTarget = startDate.toISOString()
        timerTitle = "La votación inicia en"
        showVoteButton = false
    } else if (endDate && endDate > now) {
        timerTarget = endDate.toISOString()
        timerTitle = "La votación termina en"
        showVoteButton = true
    } else if (endDate && endDate <= now) {
        isVotingEnded = true
        showVoteButton = false
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mt-24 md:mt-0">
                        <span className="text-sm font-medium uppercase tracking-wide font-sans">Primer Edición de los Clik Award Enero 2026 - Managua - Nicaragua</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-8">
                        {/* Left Image Block */}
                        <div className="hidden md:block md:col-span-3 order-1 md:order-1">
                            <div className="relative w-full aspect-[3/4] max-w-[200px] md:max-w-full mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                                <img src="/side/side1.png" alt="Clikawards Highlights" className="object-cover w-full h-full" />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-span-1 md:col-span-6 space-y-8 order-2 md:order-2">
                            {/* Main Title - Replaced with Logo */}
                            <div className="flex justify-center">
                                <img
                                    src="/icon/ClikV01.png"
                                    alt="Clik Awards Logo"
                                    className="w-full max-w-[250px] md:max-w-[400px] h-auto object-contain"
                                />
                            </div>

                            {/* Countdown Timer */}
                            {timerTarget && (
                                <div className="py-4">
                                    <CountdownTimer targetDate={timerTarget} title={timerTitle} />
                                </div>
                            )}

                            {isVotingEnded && (
                                <div className="py-4">
                                    <h3 className="text-3xl font-bold uppercase tracking-widest text-[#3ffcff]">
                                        Votación Finalizada
                                    </h3>
                                    <p className="text-muted-foreground mt-2">Gracias por participar.</p>
                                </div>
                            )}

                            {/* Subtitle */}
                            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty font-sans">
                                Tu voto cuenta. Elige a tus favoritos y sé parte de la celebración más grande del año.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {showVoteButton ? (
                                    <Link href="/categorias">
                                        <Button
                                            size="lg"
                                            className={`text-lg px-8 py-6 rounded-xl bg-[#3ffcff] text-primary-foreground shadow-lg shadow-[#3ffcff]/25 hover:shadow-xl hover:shadow-[#3ffcff]/30 transition-all hover:bg-[#3ffcff]/90 ${avantiqueBold.className}`}
                                        >
                                            <Vote className="w-5 h-5 mr-2" />
                                            Iniciar Votación
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button
                                        size="lg"
                                        disabled
                                        className={`text-lg px-8 py-6 rounded-xl bg-muted text-muted-foreground opacity-50 cursor-not-allowed ${avantiqueBold.className}`}
                                    >
                                        <Vote className="w-5 h-5 mr-2" />
                                        {isVotingEnded ? "Votación Cerrada" : "Próximamente"}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Right Image Block */}
                        <div className="block md:col-span-3 order-3 md:order-3">
                            <div className="relative w-full aspect-[3/4] max-w-[200px] md:max-w-full mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 transform rotate-[6deg] hover:rotate-0 transition-transform duration-500">
                                <img src="/side/side1.1.png" alt="Clikawards Highlights" className="object-cover w-full h-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
