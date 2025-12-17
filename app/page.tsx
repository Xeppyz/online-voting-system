import { createClient } from "@/lib/supabase/server"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { Footer } from "@/components/landing/footer"
import { Navbar } from "@/components/landing/navbar"
import { TopNomineesSection } from "@/components/landing/top-nominees-section"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch all votes to calculate statistics
  const { data: votes } = await supabase.from("votes").select("category_id, nominee_id")

  // Process votes to find top nominee per category
  const categoryVotes: Record<string, Record<string, number>> = {} // categoryId -> { nomineeId -> count }
  const categoryTotalVotes: Record<string, number> = {} // categoryId -> total

  votes?.forEach((vote) => {
    if (!categoryVotes[vote.category_id]) categoryVotes[vote.category_id] = {}
    categoryVotes[vote.category_id][vote.nominee_id] = (categoryVotes[vote.category_id][vote.nominee_id] || 0) + 1
    categoryTotalVotes[vote.category_id] = (categoryTotalVotes[vote.category_id] || 0) + 1
  })

  const topNomineeIds: string[] = []
  const topNomineesStats: Record<string, { count: number; percentage: number }> = {}

  Object.keys(categoryVotes).forEach((categoryId) => {
    const nominees = categoryVotes[categoryId]
    let maxVotes = -1
    let winnerId = null

    Object.entries(nominees).forEach(([nomineeId, count]) => {
      if (count > maxVotes) {
        maxVotes = count
        winnerId = nomineeId
      }
    })

    if (winnerId) {
      topNomineeIds.push(winnerId)
      topNomineesStats[winnerId] = {
        count: maxVotes,
        percentage: Math.round((maxVotes / categoryTotalVotes[categoryId]) * 100),
      }
    }
  })

  // Fetch top nominees details
  let topNomineesWithData: any[] = []

  if (topNomineeIds.length > 0) {
    const { data: topNominees } = await supabase
      .from("nominees")
      .select("*, categories(name)")
      .in("id", topNomineeIds)

    if (topNominees) {
      topNomineesWithData = topNominees.map((nominee) => ({
        ...nominee,
        vote_count: topNomineesStats[nominee.id].count,
        percentage: topNomineesStats[nominee.id].percentage,
        category_name: nominee.categories?.name || "Categoría",
      }))
    }
  }

  // Get current user's votes
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userVotes: Record<string, string> = {}

  if (user) {
    const { data: myVotes } = await supabase
      .from("votes")
      .select("category_id, nominee_id")
      .eq("user_id", user.id)

    myVotes?.forEach((vote) => {
      userVotes[vote.category_id] = vote.nominee_id
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TopNomineesSection nominees={topNomineesWithData} userVotes={userVotes} userId={user?.id} />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  )
}
