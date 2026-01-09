import { createClient } from "@/lib/supabase/server"
import { AdvancedStats } from "@/components/admin/advanced-stats"
import { Navbar } from "@/components/landing/navbar"

export default async function StatsPage() {
  const supabase = await createClient()

  // Get all categories with nominees
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Get all nominees
  const { data: nominees } = await supabase.from("nominees").select("*")

  // Get scalable stats
  const { data: voteCounts } = await supabase.rpc("get_vote_counts")
  const { data: adminStats } = await supabase.rpc("get_admin_stats")

  const totalGlobalVotes = Number(adminStats?.[0]?.total_votes || 0)

  // Process data for stats from RPC
  const nomineeVotes: Record<string, number> = {}
  const categoryVotes: Record<string, number> = {}

  if (voteCounts) {
    voteCounts.forEach((vc: any) => {
      const count = Number(vc.vote_count)
      // Check if IDs exist to avoid undefined keys
      if (vc.nominee_id) nomineeVotes[vc.nominee_id] = count
      if (vc.category_id) categoryVotes[vc.category_id] = (categoryVotes[vc.category_id] || 0) + count
    })
  }

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

        <AdvancedStats initialCategories={categoriesWithStats} totalVotes={totalGlobalVotes} />
      </main>
    </div>
  )
}
