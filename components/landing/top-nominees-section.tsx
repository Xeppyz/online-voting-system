"use client"

import { NomineeWithVotes } from "@/lib/types"
import { NomineeCard } from "@/components/nominees/nominee-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Trophy } from "lucide-react"

interface TopNomineesSectionProps {
  nominees: (NomineeWithVotes & { category_name: string })[]
  userVotes: Record<string, string> // categoryId -> nomineeId
  userId?: string
}

export function TopNomineesSection({ nominees, userVotes, userId }: TopNomineesSectionProps) {
  if (nominees.length === 0) return null

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Líderes de la Votación
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Los favoritos del <span className="text-primary">Público</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Descubre quiénes van liderando las votaciones en cada categoría.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {nominees.map((nominee) => (
              <CarouselItem key={nominee.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="h-full">
                  <div className="mb-2 text-sm font-medium text-muted-foreground text-center">
                    {nominee.category_name}
                  </div>
                  <NomineeCard
                    nominee={nominee}
                    categoryId={nominee.category_id}
                    isVoted={userVotes[nominee.category_id] === nominee.id}
                    hasVoted={!!userVotes[nominee.category_id]}
                    userId={userId}
                  />
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
