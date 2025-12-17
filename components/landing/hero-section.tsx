
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Vote, Trophy, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export async function HeroSection() {
  const supabase = await createClient()

  // Fetch real counts from database
  const [categoriesResult, nomineesResult, votesResult] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("nominees").select("id", { count: "exact", head: true }),
    supabase.from("votes").select("id", { count: "exact", head: true }),
  ])

  const categoriesCount = categoriesResult.count ?? 0
  const nomineesCount = nomineesResult.count ?? 0
  const votesCount = votesResult.count ?? 0

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-[#00D4FF]/5" />

      {/* Animated Orbs */}
      {/* Removed animated orbs */}
      {/* <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-[#00D4FF]/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-[#00D4FF]/10 rounded-full blur-3xl" /> */}

      {/* Grid Pattern */}
      {/* Simplified background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%230066FF' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Removed motion effects */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
            {/* Removed Sparkles icon */}
            <span className="text-sm font-medium">Votaciones Abiertas 2025</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            <span className="text-foreground">Clik</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-[#3385FF] to-[#00D4FF] bg-clip-text text-transparent">
              awards
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Tu voto cuenta. Elige a tus favoritos y sé parte de la celebración más grande del año.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/categorias">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Vote className="w-5 h-5 mr-2" />
                Iniciar Votación
              </Button>
            </Link>
            {/* Updated link to "/estadisticas" */}
            <Link href="/estadisticas">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl bg-transparent">
                Ver Estadísticas
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="pt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              {/* Updated with real data */}
              <div className="text-2xl font-bold text-foreground">{categoriesCount}</div>
              <div className="text-sm text-muted-foreground">Categorías</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              {/* Updated with real data */}
              <div className="text-2xl font-bold text-foreground">{nomineesCount}</div>
              <div className="text-sm text-muted-foreground">Nominados</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10">
                <Vote className="w-6 h-6 text-primary" />
              </div>
              {/* Updated with real data */}
              <div className="text-2xl font-bold text-foreground">{votesCount}</div>
              <div className="text-sm text-muted-foreground">Votos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* Removed scroll indicator */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="w-1.5 h-1.5 rounded-full bg-primary mt-2"
          />
        </div>
      </motion.div> */}
    </section>
  )
}
