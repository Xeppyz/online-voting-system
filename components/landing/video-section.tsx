"use client"

import { Play } from "lucide-react"

export function VideoSection() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Play className="w-4 h-4" />
                        Highlights
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4">
                        Vive la <span className="text-primary">Experiencia</span>
                    </h2>
                    <p className="text-gray-400 text-center max-w-[600px] mx-auto text-lg">
                        El reconocimiento más ambicioso de la región.
                    </p>
                </div>

                <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900">
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/placeholder.svg"
                    >
                        <source src="/clikaward.mp4" type="video/mp4" />
                        Tu navegador no soporta el elemento de video.
                    </video>
                </div>
            </div>
        </section>
    )
}
