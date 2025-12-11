import { createClient } from "@/lib/supabase/server"
import { StatsContent } from "@/components/stats/stats-content"
import { Navbar } from "@/components/landing/navbar"

export default async function StatsPage() {
  const supabase = await createClient()

  // Get all categories with nominees
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Get all nominees
  const { data: nominees } = await supabase.from("nominees").select("*")

  // Get all votes
  const { data: votes } = await supabase.from("votes").select("*")

  // Process data for stats
  const nomineeVotes =
    votes?.reduce(
      (acc, vote) => {
        acc[vote.nominee_id] = (acc[vote.nominee_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const categoryVotes =
    votes?.reduce(
      (acc, vote) => {
        acc[vote.category_id] = (acc[vote.category_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const categoriesWithStats =
    categories?.map((category) => {
      const categoryNominees =
        nominees
          ?.filter((n) => n.category_id === category.id)
          .map((nominee) => ({
            ...nominee,
            vote_count: nomineeVotes[nominee.id] || 0,
          })) || []

      const totalVotes = categoryVotes[category.id] || 0

      return {
        ...category,
        nominees: categoryNominees.map((n) => ({
          ...n,
          percentage: totalVotes > 0 ? Math.round((n.vote_count / totalVotes) * 100) : 0,
        })),
        total_votes: totalVotes,
      }
    }) || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Estadísticas <span className="text-primary">en Vivo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Observa los resultados de las votaciones en tiempo real
          </p>
        </div>

        <StatsContent initialCategories={categoriesWithStats} totalVotes={votes?.length || 0} />
      </main>
    </div>
  )
}
