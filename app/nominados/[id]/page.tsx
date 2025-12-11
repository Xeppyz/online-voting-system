import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { NomineeProfile } from "@/components/nominees/nominee-profile"
import { Navbar } from "@/components/landing/navbar"

interface NomineePageProps {
  params: Promise<{ id: string }>
}

export default async function NomineePage({ params }: NomineePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get nominee with category
  const { data: nominee } = await supabase.from("nominees").select("*, categories(*)").eq("id", id).single()

  if (!nominee) {
    notFound()
  }

  // Get vote count for this nominee
  const { count: voteCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("nominee_id", id)

  // Get total votes in this category
  const { count: totalCategoryVotes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("category_id", nominee.category_id)

  const percentage =
    totalCategoryVotes && totalCategoryVotes > 0 ? Math.round(((voteCount || 0) / totalCategoryVotes) * 100) : 0

  // Get current user's vote
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasVotedInCategory = false
  let isVoted = false

  if (user) {
    const { data: vote } = await supabase
      .from("votes")
      .select("nominee_id")
      .eq("user_id", user.id)
      .eq("category_id", nominee.category_id)
      .single()

    hasVotedInCategory = !!vote
    isVoted = vote?.nominee_id === id
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <NomineeProfile
          nominee={{
            ...nominee,
            vote_count: voteCount || 0,
            percentage,
          }}
          category={nominee.categories}
          isVoted={isVoted}
          hasVotedInCategory={hasVotedInCategory}
          userId={user?.id}
        />
      </main>
    </div>
  )
}
