"use client"

import { NomineeWithVotes } from "@/lib/types"
import { NomineeCard } from "@/components/nominees/nominee-card"
import { Trophy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

interface TopNomineesSectionProps {
  nominees: (NomineeWithVotes & { category_name: string; category_description?: string })[]
  userVotes: Record<string, string> // categoryId -> nomineeId
  userId?: string
}

type ColumnItem =
  | { type: "category"; id: string; name: string; description?: string }
  | { type: "nominee"; data: NomineeWithVotes & { category_name: string; category_description?: string } }

type SliderColumn = ColumnItem[]

export function TopNomineesSection({ nominees, userVotes, userId }: TopNomineesSectionProps) {
  if (nominees.length === 0) return null

  // Group nominees by category
  const nomineesByCategory: Record<string, typeof nominees> = {}
  nominees.forEach((nominee) => {
    if (!nomineesByCategory[nominee.category_id]) {
      nomineesByCategory[nominee.category_id] = []
    }
    nomineesByCategory[nominee.category_id].push(nominee)
  })

  // Build columns
  const columns: SliderColumn[] = []

  Object.entries(nomineesByCategory).forEach(([categoryId, categoryNominees]) => {
    // 1. Category Column (Dedicated)
    columns.push([
      {
        type: "category",
        id: categoryId,
        name: categoryNominees[0].category_name,
        description: categoryNominees[0].category_description,
      },
    ])

    // 2. Nominee Columns (Pairs)
    for (let i = 0; i < categoryNominees.length; i += 2) {
      const pair = categoryNominees.slice(i, i + 2).map((nominee) => ({
        type: "nominee" as const,
        data: nominee,
      }))
      columns.push(pair)
    }
  })

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Votaciones Abiertas
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-4">
            Conoce a los <span className="text-primary">Nominados</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-[600px] mx-auto mb-12 text-lg">
            Descubre a todos los participantes de las diferentes categorías y vota por tus favoritos.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
            }) as any,
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {columns.map((column, colIndex) => (
              <CarouselItem key={colIndex} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="flex flex-col gap-6 h-full">
                  {column.map((item, itemIndex) => (
                    <div key={`${colIndex}-${itemIndex}`} className={item.type === "category" ? "h-full" : "flex-1"}>
                      {item.type === "category" ? (
                        <div className="relative group h-full min-h-[400px] w-full overflow-hidden rounded-2xl bg-[#3cabaa] p-6 flex flex-col items-center justify-center text-center">
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help">
                                  <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-2 transform group-hover:scale-105 transition-transform">
                                    {item.name}
                                  </h3>
                                  <div className="w-12 h-1 bg-white/20 mx-auto rounded-full" />
                                </div>
                              </TooltipTrigger>
                              {item.description && (
                                <TooltipContent side="top" className="max-w-[250px] bg-black text-white border-none p-4 text-center">
                                  <p>{item.description}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>

                          {/* Decorative Elements */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10" />
                        </div>
                      ) : (
                        <div className="h-[400px]">
                          <NomineeCard
                            nominee={item.data}
                            categoryId={item.data.category_id}
                            isVoted={userVotes[item.data.category_id] === item.data.id}
                            hasVoted={!!userVotes[item.data.category_id]}
                            userId={userId}
                            categoryName={item.data.category_name}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Spacer if column has only 1 item (Nominee) to maintain grid alignment */}
                  {column.length === 1 && column[0].type === "nominee" && <div className="flex-1 h-[400px]" />}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  )
}
