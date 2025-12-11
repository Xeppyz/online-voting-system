import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { NomineesGrid } from "@/components/nominees/nominees-grid"
import { Navbar } from "@/components/landing/navbar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/categorias">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Categorías
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">{category.description}</p>
            )}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {totalVotes} votos totales
            </div>
          </div>
        </div>

        <NomineesGrid nominees={nomineesWithVotes} categoryId={id} userVote={userVote} userId={user?.id} />
      </main>
    </div>
  )
}
