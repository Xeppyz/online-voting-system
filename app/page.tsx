import { createClient } from "@/lib/supabase/server"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { Footer } from "@/components/landing/footer"
import { Navbar } from "@/components/landing/navbar"
import { TopNomineesSection } from "@/components/landing/top-nominees-section"
import { VideoSection } from "@/components/landing/video-section"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { SideSection } from "@/components/landing/side-section"
import { SponsorsSection } from "@/components/landing/sponsors-section"
import { HeroSection } from "@/components/landing/hero-section"

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

  // Fetch all nominees with their categories
  const { data: allNominees } = await supabase
    .from("nominees")
    .select("*, categories(name, description, image_url, block)")

  // Calculate stats for all nominees
  let nomineesWithData: any[] = []

  if (allNominees) {
    nomineesWithData = allNominees.map((nominee) => {
      const categoryId = nominee.category_id
      const totalCategoryVotes = categoryTotalVotes[categoryId] || 0
      const nomineeVotes = categoryVotes[categoryId]?.[nominee.id] || 0

      return {
        ...nominee,
        vote_count: nomineeVotes,
        percentage: totalCategoryVotes > 0 ? Math.round((nomineeVotes / totalCategoryVotes) * 100) : 0,
        category_name: nominee.categories?.name || "Categoría",
        category_description: nominee.categories?.description || "",
        category_image: nominee.categories?.image_url
          ? nominee.categories.image_url.includes("categorias_png")
            ? nominee.categories.image_url
            : nominee.categories.image_url.replace("/categorias/", "/categorias/categorias_png/")
          : null,
        category_block: nominee.categories?.block || null,
      }
    })
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
    <div className="min-h-screen bg-background bg-clik-16x9 bg-cover bg-center bg-fixed">
      <Navbar />
      <main>
        <ScrollAnimation>
          <HeroSection />
        </ScrollAnimation>

        <ScrollAnimation>
          <TopNomineesSection nominees={nomineesWithData} userVotes={userVotes} userId={user?.id} />
        </ScrollAnimation>

        <SideSection />

        <ScrollAnimation>
          <VideoSection />
        </ScrollAnimation>

        <ScrollAnimation>
          <FeaturesSection />
        </ScrollAnimation>

        <ScrollAnimation>
          <HowItWorksSection />
        </ScrollAnimation>

        <SponsorsSection />
      </main>
      <Footer />
    </div>
  )
}
