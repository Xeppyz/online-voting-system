import type { Category } from "@/lib/types"
import Link from "next/link"
import { Users, ChevronRight } from "lucide-react"
import Image from "next/image"

interface CategoryWithVotes extends Category {
  vote_count: number
}

interface CategoriesGridProps {
  categories: CategoryWithVotes[]
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No hay categorías disponibles</h3>
        <p className="text-muted-foreground">Las categorías se agregarán pronto. ¡Vuelve más tarde!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/categorias/${category.id}`}>
          <div className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            {/* Category Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-[#00D4FF]/20">
              {category.image_url ? (
                <Image
                  src={category.image_url || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                </div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>

            {/* Category Info */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">{category.description}</p>
                  )}
                </div>
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* Vote Count Badge */}
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted">
                  <Users className="w-4 h-4" />
                  <span>{category.vote_count} votos</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
