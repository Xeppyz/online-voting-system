
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
      {/* Background Elements - Removed to allow page background to show */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-[#00D4FF]/5" /> */}

      {/* Grid Pattern - Removed */}
      {/* <div className="absolute inset-0 opacity-[0.02]" ... /> */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <span className="text-sm font-medium uppercase tracking-wide">Primer Edición de los Clikaward Enero 2026 - Managua - Nicaragua</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-8">
            {/* Left Image Block */}
            <div className="block md:col-span-3 order-1 md:order-1">
              <div className="relative w-full aspect-[3/4] max-w-[200px] md:max-w-full mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                <img src="/side/side1.png" alt="Clikawards Highlights" className="object-cover w-full h-full" />
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-1 md:col-span-6 space-y-8 order-2 md:order-2">
              {/* Main Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                <span className="text-foreground">Clik</span>
                <br />
                <span className="text-foreground">
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
                    className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90"
                  >
                    <Vote className="w-5 h-5 mr-2" />
                    Iniciar Votación
                  </Button>
                </Link>
                {/* Stats button hidden/removed for user as requested, or keep strictly? 
                    User said: "quitaremos las estadistica de la vista del usuario normal, soolo estara para el admin tambien quitaremos el contador de votos"
                    So I will remove the "Ver Estadísticas" button as well to clean up the user view.
                */}
              </div>
            </div>

            {/* Right Image Block */}
            <div className="block md:col-span-3 order-3 md:order-3">
              <div className="relative w-full aspect-[3/4] max-w-[200px] md:max-w-full mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 transform rotate-[6deg] hover:rotate-0 transition-transform duration-500">
                <img src="/side/side1.1.png" alt="Clikawards Highlights" className="object-cover w-full h-full" />
              </div>
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
