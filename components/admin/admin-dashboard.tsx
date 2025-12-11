"use client"

import type { Category, Nominee } from "@/lib/types"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminHeader } from "./admin-header"
import { AdminOverview } from "./admin-overview"
import { CategoriesManager } from "./categories-manager"
import { NomineesManager } from "./nominees-manager"
import { LayoutGrid, Users, BarChart3 } from "lucide-react"

interface NomineeWithCategory extends Nominee {
  categories: { name: string } | null
}

interface AdminDashboardProps {
  initialCategories: Category[]
  initialNominees: NomineeWithCategory[]
  totalVotes: number
}

export function AdminDashboard({ initialCategories, initialNominees, totalVotes }: AdminDashboardProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [nominees, setNominees] = useState(initialNominees)

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona categorías, nominados y visualiza estadísticas</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Categorías</span>
            </TabsTrigger>
            <TabsTrigger value="nominees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Nominados</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview categories={categories} nominees={nominees} totalVotes={totalVotes} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager categories={categories} onCategoriesChange={setCategories} />
          </TabsContent>

          <TabsContent value="nominees">
            <NomineesManager nominees={nominees} categories={categories} onNomineesChange={setNominees} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
