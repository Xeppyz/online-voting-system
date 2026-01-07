"use client"

import Image from "next/image"

export function SideSection() {
    return (
        <section className="w-full bg-background py-16">
            <div className="container mx-auto px-4">
                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-3xl">
                    <Image
                        src="/side/side3.png"
                        alt="Clik Awards Banner"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>
        </section>
    )
}
