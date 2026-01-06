import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export async function SponsorsSection() {
    const supabase = await createClient()
    const { data: sponsors } = await supabase.from("sponsors").select("*").order("created_at")

    if (!sponsors || sponsors.length === 0) {
        return null
    }

    return (
        <section className="w-full bg-background py-16 border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-widest text-foreground uppercase">
                        Nuestros <span className="text-primary">Patrocinadores</span>
                    </h2>
                </div>

                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
                    {sponsors.map((sponsor) => {
                        // Find a suitable link (website first, then instagram, etc)
                        const link = sponsor.social_links?.find((l: { platform: string; url: string }) => l.platform === 'website')?.url ||
                            sponsor.social_links?.[0]?.url;

                        const Content = (
                            <div className="relative w-32 h-20 md:w-48 md:h-32 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 transform hover:scale-110">
                                {sponsor.logo_url && (
                                    <Image
                                        src={sponsor.logo_url}
                                        alt={sponsor.name}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                )}
                            </div>
                        );

                        return link ? (
                            <Link key={sponsor.id} href={link} target="_blank" rel="noopener noreferrer" title={sponsor.name}>
                                {Content}
                            </Link>
                        ) : (
                            <div key={sponsor.id} title={sponsor.name}>
                                {Content}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
