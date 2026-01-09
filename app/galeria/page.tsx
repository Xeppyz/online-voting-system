import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/landing/navbar"
import Image from "next/image"
import { Calendar } from "lucide-react"

export const revalidate = 60 // Cache for 60 seconds

export default async function GalleryPage() {
    const supabase = await createClient()

    const { data: items } = await supabase
        .from("gallery_items")
        .select("*")
        .order("published_at", { ascending: false })

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            <Navbar />

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-widest uppercase relative inline-block">
                        Galería
                        <span className="absolute -top-6 -right-8 text-2xl rotate-12 text-primary animate-pulse tracking-widest">
                            Multimedia
                        </span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
                        Multimedia de los CLik Awards
                    </p>
                </div>

                {(!items || items.length === 0) ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
                        <p className="text-white/40">Aún no hay contenido en la galería.</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="break-inside-avoid group relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300">
                                {item.media_type === 'video' ? (
                                    <div className="relative aspect-video">
                                        <video
                                            src={item.media_url}
                                            className="w-full h-full object-cover"
                                            controls
                                            preload="metadata"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Image
                                            src={item.media_url}
                                            alt={item.title}
                                            width={800}
                                            height={600}
                                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                            unoptimized
                                        />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-6">
                                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                                    <p className="text-sm text-primary flex items-center gap-2 font-medium">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.published_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
