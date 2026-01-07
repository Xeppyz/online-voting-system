"use client"

import { NomineeWithVotes } from "@/lib/types"
import { NomineeCard } from "@/components/nominees/nominee-card"
import { ArrowRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { useEffect, useRef, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TopNomineesSectionProps {
  nominees: (NomineeWithVotes & {
    category_name: string
    category_description?: string
    category_image?: string | null
    category_block?: string | null // [NEW]
  })[]
  userVotes: Record<string, string>
  userId?: string
  votingStatus?: "active" | "upcoming" | "ended"
}

type ColumnItem =
  | { type: "category"; id: string; name: string; description?: string; image?: string | null; block?: string | null } // [NEW]
  | {
    type: "nominee"
    data: NomineeWithVotes & {
      category_name: string
      category_description?: string
      category_image?: string | null
    }
  }

const blockColors: Record<string, string> = {
  green: "#70e54e",
  blue: "#4771ff",
  cyan: "#3ffcff",
  pink: "#e87bff",
}

export function TopNomineesSection({ nominees, userVotes, userId, votingStatus = "active" }: TopNomineesSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [rotationSeed, setRotationSeed] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Rotación aleatoria cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationSeed((prev) => prev + 1)
    }, 15000) // 15 segundos
    return () => clearInterval(interval)
  }, [])

  const columns = useMemo(() => {
    if (nominees.length === 0) return []

    // 1. Agrupar
    const nomineesByCategory: Record<string, typeof nominees> = {}
    nominees.forEach((nominee) => {
      if (!nomineesByCategory[nominee.category_id]) {
        nomineesByCategory[nominee.category_id] = []
      }
      nomineesByCategory[nominee.category_id].push(nominee)
    })

    const items: ColumnItem[] = []

    Object.entries(nomineesByCategory).forEach(([categoryId, categoryNominees]) => {
      // Push Category
      items.push({
        type: "category",
        id: categoryId,
        name: categoryNominees[0].category_name,
        description: categoryNominees[0].category_description,
        image: categoryNominees[0].category_image,
        block: categoryNominees[0].category_block,
      })

      // Filter & Shuffle Nominees
      let selected: typeof categoryNominees = []
      const total = categoryNominees.length

      if (total <= 2) {
        selected = categoryNominees
      } else {
        // Deterministic rotation based on seed
        // We show 2 items per rotation.
        const startIndex = (rotationSeed * 2) % total

        // Get first item
        selected.push(categoryNominees[startIndex])

        // Get second item (wrap around if needed)
        const nextIndex = (startIndex + 1) % total
        selected.push(categoryNominees[nextIndex])
      }

      selected.forEach((nominee) => {
        items.push({
          type: "nominee",
          data: nominee,
        })
      })
    })

    // Build Columns
    const cols: ColumnItem[][] = []
    let currentColumn: ColumnItem[] = []

    items.forEach((item) => {
      if (item.type === "category") {
        if (currentColumn.length > 0) {
          cols.push(currentColumn)
          currentColumn = []
        }
        currentColumn.push(item)
      } else {
        if (currentColumn.length === 2) {
          cols.push(currentColumn)
          currentColumn = []
        }
        currentColumn.push(item)
      }
    })
    if (currentColumn.length > 0) {
      cols.push(currentColumn)
    }
    return cols
  }, [nominees, rotationSeed, isMounted])

  if (nominees.length === 0) return null

  // --- 2. DUPLICACIÓN CONDICIONAL ---
  // Solo duplicamos y animamos si hay suficientes elementos para que valga la pena (ej: 4 columnas o más)
  const shouldAnimate = columns.length >= 4
  const displayColumns = shouldAnimate ? [...columns, ...columns] : columns

  // --- 3. LÓGICA HÍBRIDA (AUTO + MANUAL) ---
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || !shouldAnimate) return

    let animationFrameId: number
    const speed = 1.5 // Velocidad aumentada (antes 0.5)

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
  }, [isPaused, columns.length, shouldAnimate])

  const renderItem = (item: ColumnItem) => {
    if (item.type === "category") {
      // Determine background color based on block
      const bgColor = item.block && blockColors[item.block] ? blockColors[item.block] : "#4771ff"

      return (
        <div key={`${item.type}-${item.id}`} className="h-full w-full">
          <div
            className="relative group h-full min-h-[160px] md:min-h-[200px] w-full overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: bgColor }}
          >
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
                        <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter text-white mb-2 transform group-hover:scale-105 transition-transform drop-shadow-md break-words w-full">
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
          <div
            className="h-full transform hover:-translate-y-1 transition-transform duration-300"
          >
            <NomineeCard
              nominee={nominee}
              categoryId={nominee.category_id}
              isVoted={hasVote}
              hasVoted={!!userVotes[nominee.category_id]}
              userId={userId}
              categoryName={nominee.category_name}
              showCategoryInfo={false}
              compact={true}
              votingStatus={votingStatus}
              priority={true} // Force eager load for carousel
            />
          </div>
        </div>
      )
    }
  }

  return (
    <section className="py-8 md:py-12">
      <div className="relative w-full max-w-[100vw]">
        <div className="text-center mb-6 md:mb-8 px-4">
          <h2 className="text-xl font-bold tracking-widest text-foreground sm:text-3xl text-center">
            Nominados Destacados
          </h2>

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
          className={`flex overflow-x-auto pb-8 px-0 gap-3 md:gap-4 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none] ${!shouldAnimate ? "justify-center" : ""}`}
        >
          {displayColumns.map((column, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 md:gap-4 flex-shrink-0 w-[160px] md:w-[260px]"
            >
              {column.map((item) => renderItem(item))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}