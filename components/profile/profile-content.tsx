"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, Vote, User, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Navbar } from "@/components/landing/navbar"
import Image from "next/image"

interface VoteWithDetails {
  id: string
  created_at: string
  nominees: {
    id: string
    name: string
    image_url: string | null
    categories: {
      id: string
      name: string
    }
  }
}

interface ProfileContentProps {
  user: SupabaseUser
  votes: VoteWithDetails[]
}

export function ProfileContent({ user, votes }: ProfileContentProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url || "/placeholder.svg"}
                      alt={user.user_metadata?.full_name || "Avatar"}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-foreground">{user.user_metadata?.full_name || "Usuario"}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Vote className="w-3 h-3" />
                      {votes.length} votos
                    </Badge>
                    {user.user_metadata?.is_admin && (
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Administrador</Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={handleSignOut} className="shrink-0 bg-transparent">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Votes History */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-primary" />
                Mis Votos
              </CardTitle>
              <CardDescription>Historial de tus votos en las diferentes categorías</CardDescription>
            </CardHeader>
            <CardContent>
              {votes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Vote className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">Aún no has votado en ninguna categoría</p>
                  <Button onClick={() => router.push("/categorias")}>Explorar Categorías</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {votes.map((vote) => (
                    <div
                      key={vote.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 shrink-0">
                        {vote.nominees?.image_url ? (
                          <Image
                            src={vote.nominees.image_url || "/placeholder.svg"}
                            alt={vote.nominees.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{vote.nominees?.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{vote.nominees?.categories?.name}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Calendar className="w-3 h-3" />
                        {new Date(vote.created_at).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
