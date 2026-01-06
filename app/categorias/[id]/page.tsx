import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { NomineesGrid } from "@/components/nominees/nominees-grid"
import { Navbar } from "@/components/landing/navbar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"

interface CategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get category
  const { data: category } = await supabase.from("categories").select("*").eq("id", id).single()

  if (!category) {
    notFound()
  }

  // Get nominees for this category
  const { data: nominees } = await supabase.from("nominees").select("*").eq("category_id", id).order("name")

  // Get vote counts for nominees
  const { data: voteCounts } = await supabase.from("votes").select("nominee_id").eq("category_id", id)

  const nomineeVotes =
    voteCounts?.reduce(
      (acc, vote) => {
        acc[vote.nominee_id] = (acc[vote.nominee_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const totalVotes = voteCounts?.length || 0

  const nomineesWithVotes =
    nominees?.map((nominee) => ({
      ...nominee,
      vote_count: nomineeVotes[nominee.id] || 0,
      percentage: totalVotes > 0 ? Math.round(((nomineeVotes[nominee.id] || 0) / totalVotes) * 100) : 0,
    })) || []

  // Get current user's vote
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userVote: string | null = null
  if (user) {
    const { data: vote } = await supabase
      .from("votes")
      .select("nominee_id")
      .eq("user_id", user.id)
      .eq("category_id", id)
      .single()

    userVote = vote?.nominee_id || null
  }

  // --- LOGICA DE TEMA DINÁMICO ---
  const groups = [
    { id: "green", color: "#70e54e", filter: ["Auténtico", "Orgullo Nica", "Producción", "Country", "Comediante"] },
    { id: "blue", color: "#4771ff", filter: ["Empresario", "Educativo", "Podcast", "Familiar", "Fitness"] },
    { id: "cyan", color: "#3ffcff", filter: ["Travel", "Revelación", "Polémico", "Foodie", "Duo", "Trend"] },
    { id: "pink", color: "#e87bff", filter: ["Lifestyle", "Fashionista"] },
  ]

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

  // Priorizar el bloque asignado en DB, sino fallback a detección por nombre
  let activeGroup = groups.find((g) => g.id === category.block)

  if (!activeGroup) {
    activeGroup = groups.find((g) =>
      g.filter.some((keyword) => normalize(category.name).includes(normalize(keyword)))
    )
  }

  const themeColor = activeGroup ? activeGroup.color : "#4771ff" // Default Blue fallback

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <Navbar />

      {/* Header con Color Dinámico */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
        <div className="mb-12">
          <Link href="/categorias" className="inline-block mb-8 group">
            <div className="flex items-center gap-2 text-white/50 group-hover:text-white transition-colors">
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm uppercase tracking-wider">Volver a Categorías</span>
            </div>
          </Link>

          <div className="relative">
            {/* Elemento decorativo de fondo */}
            <div
              className="absolute -top-20 -left-20 w-64 h-64 blur-[100px] opacity-20 pointer-events-none mix-blend-screen"
              style={{ backgroundColor: themeColor }}
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
                <Trophy className="w-4 h-4" style={{ color: themeColor }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                  Clikawards 2026
                </span>
              </div>

              <div className="mb-6 flex justify-center lg:justify-start">
                <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-none text-balance sr-only">
                  Clik {category.name}
                </h1>
                {category.aplicativo_color ? (
                  <img
                    src={category.aplicativo_color}
                    alt={`Clik ${category.name}`}
                    className="h-20 md:h-24 w-auto object-contain"
                  />
                ) : (
                  <div className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-none text-balance not-sr-only">
                    Clik <span style={{ color: themeColor }}>{category.name}</span>
                  </div>
                )}
              </div>

              {category.description && (
                <p className="text-xl text-white/60 max-w-2xl text-pretty border-l-2 pl-6" style={{ borderColor: themeColor }}>
                  {category.description}
                </p>
              )}


            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

        <NomineesGrid
          nominees={nomineesWithVotes}
          categoryId={id}
          userVote={userVote}
          userId={user?.id}
          themeColor={themeColor}
        />
      </main>
    </div>
  )
}
