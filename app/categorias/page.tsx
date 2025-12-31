import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/landing/navbar"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Definición de Grupos y Colores según la imagen de referencia
  const groups = [
    {
      id: "green",
      color: "#70e54e", // Green
      title: "Auténtico",
      filter: ["Auténtico", "Orgullo Nica", "Producción", "Country", "Comediante"],
    },
    {
      id: "blue",
      color: "#4771ff", // Blue
      title: "Empresario",
      filter: ["Empresario", "Educativo", "Podcast", "Familiar", "Fitness"],
    },
    {
      id: "cyan",
      color: "#3ffcff", // Cyan
      title: "Travel",
      filter: ["Travel", "Revelación", "Polémico", "Foodie", "Duo", "Trend"],
    },
    {
      id: "pink",
      color: "#e87bff", // Pink
      title: "Lifestyle",
      filter: ["Lifestyle", "Fashionista"],
    },
  ]

  // Función para normalizar nombres y comparar sin distinción de mayúsculas/acentos
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

  // Distribuir categorías en sus grupos
  const groupedCategories = groups.map((group) => {
    const groupCategories = categories?.filter((cat) => {
      // Verificamos si el nombre de la categoría contiene alguna de las palabras clave del filtro
      return group.filter.some((keyword) => normalize(cat.name).includes(normalize(keyword)))
    })

    return {
      ...group,
      items: groupCategories || [],
    }
  })

  // Categorías que no cayeron en ningún grupo (para no perderlas)
  const allGroupedIds = new Set(groupedCategories.flatMap((g) => g.items.map((c) => c.id)))
  const otherCategories = categories?.filter((cat) => !allGroupedIds.has(cat.id)) || []

  // Si hay categorías "huerfanas", las agregamos al grupo con menos elementos o creamos uno "Otros"
  // Por ahora, las agregaremos al último grupo (Pink/Lifestyle) o al primero si está vacío?
  // Mejor añadirlas al Blue que parece ser "General"
  if (otherCategories.length > 0) {
    groupedCategories[1].items.push(...otherCategories)
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tighter uppercase">
            Categorías <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#70e54e] via-[#4771ff] to-[#e87bff]">Clik</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
            Explora y vota por el talento nicaragüense
          </p>
        </div>

        {/* Layout de 4 Columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {groupedCategories.map((group) => (
            <div key={group.id} className="flex flex-col gap-6">
              {/* Encabezado del Grupo (Estilo Visual) */}
              <div className="pb-4 border-b-2" style={{ borderColor: group.color }}>
                {/* Logo Simulado CLIK */}
                <h2 className="text-3xl font-black uppercase tracking-tight flex flex-col leading-none" style={{ color: group.color }}>
                  <span className="text-lg opacity-80 font-bold mb-1 ml-1 text-white">Bloque</span>
                  {group.title}
                </h2>
              </div>

              {/* Lista de Categorías de este Grupo */}
              <div className="flex flex-col gap-3">
                {group.items.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categorias/${category.id}`}
                    className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block"
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                      style={{ backgroundColor: group.color }}
                    />

                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1 block" style={{ color: group.color }}>
                          Clik Awards
                        </span>
                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 transition-colors">
                          {category.name}
                        </h3>
                      </div>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: `${group.color}20` }}
                      >
                        <ArrowRight className="w-5 h-5" style={{ color: group.color }} />
                      </div>
                    </div>
                  </Link>
                ))}

                {group.items.length === 0 && (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-white/30 italic text-sm">
                    Próximamente
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
