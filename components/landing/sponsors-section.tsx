"use client"

import Image from "next/image"

export function SponsorsSection() {
    return (
        <section className="w-full bg-background py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter text-foreground">
                        Nuestros <span className="text-primary">Patrocinadores</span>
                    </h2>
                </div>
                <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden rounded-xl bg-white/5 p-8">
                    <Image
                        src="/side/sponsors.png"
                        alt="Sponsors"
                        fill
                        className="object-contain p-4"
                    />
                </div>
            </div>
        </section>
    )
}
