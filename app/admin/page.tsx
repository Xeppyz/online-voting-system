import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getPreloadedCategoryImages } from "@/lib/actions"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const isAdmin = user.user_metadata?.is_admin === true
  if (!isAdmin) {
    redirect("/")
  }

  // Get all data
  const { data: categories } = await supabase.from("categories").select("*").order("name")
  const { data: nominees } = await supabase.from("nominees").select("*, categories(name)").order("name")
  const { data: galleryItems } = await supabase.from("gallery_items").select("*").order("published_at", { ascending: false })
  const { data: sponsors } = await supabase.from("sponsors").select("*").order("name")
  const { data: votes } = await supabase.from("votes").select("*")

  // Calculate Real Metrics from Votes
  const uniqueVoters = new Set(votes?.map(v => v.user_id).filter(Boolean)).size

  // Votes over time (Group by date) - REAL Data
  // This replaces the empty "Visits" chart with a working "Votes" chart
  const votesByDate: Record<string, number> = votes?.reduce((acc, vote) => {
    const date = vote.created_at.split('T')[0] // YYYY-MM-DD
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Format for Recharts
  const activityData = Object.entries(votesByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30) // Last 30 active days


  // Get preloaded images
  const preloadedImages = await getPreloadedCategoryImages()

  return (
    <AdminDashboard
      initialCategories={categories || []}
      initialNominees={nominees || []}
      initialGalleryItems={galleryItems || []}
      initialSponsors={sponsors || []}
      totalVotes={votes?.length || 0}
      votes={votes || []}
      uniqueVoters={uniqueVoters}
      activityData={activityData}
      preloadedImages={preloadedImages}
    />
  )
}
