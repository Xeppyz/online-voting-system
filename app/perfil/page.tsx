import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileContent } from "@/components/profile/profile-content"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's votes
  const { data: votes } = await supabase
    .from("votes")
    .select(`
      *,
      nominees (
        id,
        name,
        image_url,
        categories (
          id,
          name
        )
      )
    `)
    .eq("user_id", user.id)

  return <ProfileContent user={user} votes={votes || []} />
}
