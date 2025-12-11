import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

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

  return (
    <AdminDashboard
      initialCategories={categories || []}
      initialNominees={nominees || []}
      totalVotes={votes?.length || 0}
    />
  )
}
