"use client"

const steps = [
  {
    number: "01",
    title: "Inicia Sesión",
    description: "Conéctate con tu cuenta de Google para participar de forma segura.",
  },
  {
    number: "02",
    title: "Explora Categorías",
    description: "Navega por las diferentes categorías y conoce a los nominados.",
  },
  {
    number: "03",
    title: "Elige tu Favorito",
    description: "Mira los perfiles, videos y vota por quien más te guste.",
  },
  {
    number: "04",
    title: "Celebra",
    description: "Observa los resultados en tiempo real y comparte con tus amigos.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            ¿Cómo <span className="text-primary">funciona</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Votar es fácil y rápido. Sigue estos simples pasos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#3ffcff] text-primary-foreground text-xl font-bold mb-4 shadow-lg shadow-primary/25">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
