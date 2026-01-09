export const revalidate = 60 // Revalidate every minute for better performance

import { createClient } from "@/lib/supabase/server"
import { toNicaraguaTime } from "@/lib/utils"
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
import { HeroMobile } from "@/components/landing/hero-mobile"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch all votes to calculate statistics using RPC to bypass 1000 row limit
  const { data: votes, error: votesError } = await supabase.rpc("get_vote_counts")

  if (votesError) {
    console.error("Error fetching vote counts via RPC:", JSON.stringify(votesError, null, 2))
  } else {
    console.log("RPC returned rows:", votes?.length)
    if (votes && votes.length > 0) {
      console.log("First row sample:", votes[0])
    }
  }

  // Process votes to find top nominee per category
  const categoryVotes: Record<string, Record<string, number>> = {} // categoryId -> { nomineeId -> count }
  const categoryTotalVotes: Record<string, number> = {} // categoryId -> total

  if (votes) {
    votes.forEach((vote: any) => {
      const count = Number(vote.vote_count)
      if (!categoryVotes[vote.category_id]) categoryVotes[vote.category_id] = {}
      categoryVotes[vote.category_id][vote.nominee_id] = count

      // Sum up total votes for the category
      categoryTotalVotes[vote.category_id] = (categoryTotalVotes[vote.category_id] || 0) + count
    })
  }

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

  // Fetch app settings for voting dates
  const { data: settings } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["voting_start_date", "voting_end_date", "show_hero_countdown"])

  const startDate = settings?.find((s) => s.key === "voting_start_date")?.value || null
  const endDate = settings?.find((s) => s.key === "voting_end_date")?.value || null
  // Default to true if setting doesn't exist to maintain backward compatibility
  const showHeroCountdown = settings?.find((s) => s.key === "show_hero_countdown")?.value !== false

  const now = new Date()
  const start = toNicaraguaTime(startDate)
  const end = toNicaraguaTime(endDate)

  let votingStatus: "active" | "upcoming" | "ended" = "active"
  if (start && start > now) votingStatus = "upcoming"
  if (end && end <= now) votingStatus = "ended"

  return (
    <div className="min-h-screen bg-background bg-clik-16x9 bg-cover bg-center bg-fixed">
      <Navbar />
      <main>

        <div className="hidden md:block">
          <SideSection />
        </div>



        <div className="block md:hidden">
          <HeroMobile />
        </div>

        <div className="hidden md:block">
          <ScrollAnimation>
            <HeroSection
              votingStartDate={startDate}
              votingEndDate={endDate}
              showCountdown={showHeroCountdown}
            />
          </ScrollAnimation>
        </div>

        <div className="hidden md:block">
          <ScrollAnimation>
            <VideoSection />
          </ScrollAnimation>
        </div>

        <ScrollAnimation>
          <TopNomineesSection nominees={nomineesWithData} userVotes={userVotes} userId={user?.id} votingStatus={votingStatus} />
        </ScrollAnimation>



        <ScrollAnimation>
          <HowItWorksSection />
        </ScrollAnimation>

        <ScrollAnimation>
          <FeaturesSection />
        </ScrollAnimation>


        <SponsorsSection />
      </main>
      <Footer />
    </div>
  )
}
