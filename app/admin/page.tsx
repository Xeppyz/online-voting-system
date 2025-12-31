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
  const { data: votes } = await supabase.from("votes").select("*")

  // Get Analytics Data (Real)
  const { data: visits } = await supabase.from("analytics_visits").select("*")

  // Calculate unique engaged users (users who visited while logged in)
  // Since we don't have a 'logins' table, we use distinct user_id from visits as a proxy for active users
  // Or if we specifically want 'logins' we check visits to /dashboard or similar? 
  // Let's simpler: Unique users in visits table = Active Users
  const uniqueVisitors = new Set(visits?.map(v => v.user_id).filter(Boolean)).size

  // Total Visits
  const totalVisits = visits?.length || 0

  // Organic vs Direct? We only have path. 
  // We can just call it "Total Page Views" for now.

  // Get preloaded images
  const preloadedImages = await getPreloadedCategoryImages()

  return (
    <AdminDashboard
      initialCategories={categories || []}
      initialNominees={nominees || []}
      totalVotes={votes?.length || 0}
      votes={votes || []}
      totalVisits={totalVisits}
      uniqueVisitors={uniqueVisitors}
      visits={visits || []}
      preloadedImages={preloadedImages}
    />
  )
}
