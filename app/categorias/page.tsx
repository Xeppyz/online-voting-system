import { createClient } from "@/lib/supabase/server"
import { CategoriesGrid } from "@/components/categories/categories-grid"
import { Navbar } from "@/components/landing/navbar"

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Get vote counts for each category
  const { data: voteCounts } = await supabase.from("votes").select("category_id")

  const categoryVotes =
    voteCounts?.reduce(
      (acc, vote) => {
        acc[vote.category_id] = (acc[vote.category_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const categoriesWithVotes =
    categories?.map((category) => ({
      ...category,
      vote_count: categoryVotes[category.id] || 0,
    })) || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Categorías de <span className="text-primary">Votación</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explora las diferentes categorías y vota por tus favoritos en cada una
          </p>
        </div>

        <CategoriesGrid categories={categoriesWithVotes} />
      </main>
    </div>
  )
}
