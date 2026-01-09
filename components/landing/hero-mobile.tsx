"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import localFont from "next/font/local"

const avantiqueBold = localFont({
    src: "../../public/fonts/Avantique-Bold.otf",
})

export function HeroMobile() {
    return (
        <section className="relative w-full overflow-hidden bg-background pb-12">
            {/* 1. Header Image with Overlay */}
            <div className="relative w-full aspect-[16/9] mb-8">
                <Image
                    src="/side/side3.png"
                    alt="Hero Header"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-end justify-center pb-6">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary backdrop-blur-md max-w-[90%] shadow-sm">
                        <span className="text-[10px] font-medium uppercase tracking-wide font-sans text-center leading-normal">
                            El primer reconocimiento a los creadores de contenido en Nicaragua
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Text Content & CTA */}
            <div className="px-4 text-center space-y-6 mb-8">


                <h1 className="text-3xl font-bold tracking-widest uppercase text-white leading-tight">
                    Vive la <span className="text-primary">Experiencia</span>
                </h1>

                <p className="text-muted-foreground text-sm max-w-[280px] mx-auto text-pretty">
                    El reconocimiento más ambicioso de la región.
                </p>

                <div className="flex justify-center pt-2">
                    <Link href="/categorias">
                        <Button
                            className={`px-8 h-12 rounded-full bg-[#3ffcff] text-black text-sm font-bold shadow-lg shadow-[#3ffcff]/20 hover:shadow-[#3ffcff]/40 transition-all hover:scale-105 ${avantiqueBold.className}`}
                        >
                            <div className="relative w-5 h-5 mr-3">
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
                </div>
            </div>

            {/* 3. Video Section */}
            <div className="relative w-full aspect-video md:aspect-auto">
                <div className="w-full h-full overflow-hidden">
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/placeholder.svg"
                    >
                        <source src="/clikaward.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>
        </section>
    )
}
