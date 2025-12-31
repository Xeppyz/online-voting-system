"use client"

import { NomineeWithVotes } from "@/lib/types"
import { NomineeCard } from "@/components/nominees/nominee-card"
import { ArrowRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface TopNomineesSectionProps {
  nominees: (NomineeWithVotes & {
    category_name: string
    category_description?: string
    category_image?: string | null
  })[]
  userVotes: Record<string, string>
  userId?: string
}

type ColumnItem =
  | { type: "category"; id: string; name: string; description?: string; image?: string | null }
  | {
    type: "nominee"
    data: NomineeWithVotes & {
      category_name: string
      category_description?: string
      category_image?: string | null
    }
  }

export function TopNomineesSection({ nominees, userVotes, userId }: TopNomineesSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  if (nominees.length === 0) return null

  // --- 1. PREPARACIÓN DE DATOS (Igual que antes) ---
  const nomineesByCategory: Record<string, typeof nominees> = {}
  nominees.forEach((nominee) => {
    if (!nomineesByCategory[nominee.category_id]) {
      nomineesByCategory[nominee.category_id] = []
    }
    nomineesByCategory[nominee.category_id].push(nominee)
  })

  const items: ColumnItem[] = []
  Object.entries(nomineesByCategory).forEach(([categoryId, categoryNominees]) => {
    items.push({
      type: "category",
      id: categoryId,
      name: categoryNominees[0].category_name,
      description: categoryNominees[0].category_description,
      image: categoryNominees[0].category_image,
    })
    categoryNominees.forEach((nominee) => {
      items.push({
        type: "nominee",
        data: nominee,
      })
    })
  })

  const columns: ColumnItem[][] = []
  let currentColumn: ColumnItem[] = []

  items.forEach((item) => {
    if (item.type === "category") {
      if (currentColumn.length > 0) {
        columns.push(currentColumn)
        currentColumn = []
      }
      currentColumn.push(item)
    } else {
      if (currentColumn.length === 2) {
        columns.push(currentColumn)
        currentColumn = []
      }
      currentColumn.push(item)
    }
  })
  if (currentColumn.length > 0) {
    columns.push(currentColumn)
  }

  // --- 2. DUPLICACIÓN PARA EFECTO INFINITO ---
  const doubledColumns = [...columns, ...columns]

  // --- 3. LÓGICA HÍBRIDA (AUTO + MANUAL) ---
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    let animationFrameId: number
    const speed = 0.5 // Velocidad del auto-scroll

    const step = () => {
      // Importante: Calculamos el límite de reinicio (la mitad del contenido total)
      // Como tenemos el contenido duplicado, scrollWidth/2 es el punto exacto donde
      // el segundo set comienza.
      const maxScroll = scrollContainer.scrollWidth / 2

      // Lógica de "Bucle Infinito Silencioso":
      // Si el scroll (manual o automático) pasa de la mitad, lo regresamos al inicio (0).
      // Si el scroll es 0 (o menor), lo mandamos a la mitad.
      // Esto crea la ilusión de que nunca termina.
      if (scrollContainer.scrollLeft >= maxScroll) {
        scrollContainer.scrollLeft = scrollContainer.scrollLeft - maxScroll
      } else if (scrollContainer.scrollLeft <= 0) {
        // Opcional: permite scroll infinito hacia atrás
        // scrollContainer.scrollLeft = maxScroll 
      }

      // Si NO está pausado (no hay dedo ni mouse encima), avanzamos automáticamente
      if (!isPaused) {
        scrollContainer.scrollLeft += speed
      }

      animationFrameId = requestAnimationFrame(step)
    }

    animationFrameId = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animationFrameId)
  }, [isPaused, columns.length])

  // Función auxiliar para renderizar items (sin cambios)
  const renderItem = (item: ColumnItem) => {
    if (item.type === "category") {
      return (
        <div key={`${item.type}-${item.id}`} className="h-full w-full">
          <div className="relative group h-full min-h-[240px] w-full overflow-hidden rounded-2xl bg-[#4771ff] p-4 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-all duration-300">
            {item.image ? (
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help flex flex-col items-center justify-center h-full w-full relative z-10">
                    {!item.image && (
                      <>
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white mb-2 transform group-hover:scale-105 transition-transform drop-shadow-md break-words w-full">
                          {item.name}
                        </h3>
                        <div className="w-8 h-1 bg-white/40 mx-auto rounded-full" />
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                {item.description && (
                  <TooltipContent side="bottom" className="max-w-[250px] bg-background/95 backdrop-blur-sm border-primary/20">
                    <p className="text-sm font-medium">{item.description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300 z-20">
              <Link href={`/categorias/${item.id}`}>
                <div className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-colors">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )
    } else {
      const nominee = item.data!
      const hasVote = userVotes?.[nominee.category_id] === nominee.id
      return (
        <div key={`${item.type}-${nominee.id}`} className="h-full w-full">
          <div className="h-full transform hover:-translate-y-1 transition-transform duration-300">
            <NomineeCard
              nominee={nominee}
              categoryId={nominee.category_id}
              isVoted={hasVote}
              hasVoted={!!userVotes[nominee.category_id]}
              userId={userId}
              categoryName={nominee.category_name}
              showCategoryInfo={false}
              compact={true}
            />
          </div>
        </div>
      )
    }
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="relative w-full max-w-[100vw]">
        <div className="text-center mb-12 px-4">
          <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
            Nominados Destacados
          </h2>
          <p className="mt-4 text-muted-foreground">
            Descubre a los candidatos en cada categoría
          </p>
        </div>

        <div
          ref={scrollContainerRef}
          // EVENTOS DE PC
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          // EVENTOS DE MOVIL (Touch)
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => {
            // Pequeño delay para que el usuario termine el gesto de deslizar
            setTimeout(() => setIsPaused(false), 1000)
          }}
          // CLASES: overflow-x-auto permite el scroll manual
          // cursor-grab indica que se puede agarrar
          className="flex overflow-x-auto pb-8 px-0 gap-4 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
        >
          {doubledColumns.map((column, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 flex-shrink-0 w-[260px] md:w-[300px]"
            >
              {column.map((item) => renderItem(item))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}