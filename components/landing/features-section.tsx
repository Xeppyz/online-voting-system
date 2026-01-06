import { Shield, Zap, BarChart3, Users } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Votación Segura",
    description: "Sistema de autenticación con Google para garantizar un voto por persona por categoría.",
  },
  {
    icon: Zap,
    title: "Tiempo Real",
    description: "Observa cómo cambian los resultados en vivo mientras la comunidad vota.",
  },

  {
    icon: Users,
    title: "Experiencia Interactiva",
    description: "Conoce a cada nominado con videos, descripciones y perfiles completos.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Una experiencia de votación
            <span className="text-primary"> única</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Diseñado para hacer tu participación fácil, segura y emocionante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
