"use client"

import type { Category, Nominee } from "@/lib/types"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminHeader } from "./admin-header"
import { AdminOverview } from "./admin-overview"
import { CategoriesManager } from "./categories-manager"
import { NomineesManager } from "./nominees-manager"
import { GalleryManager } from "./gallery-manager"
import { SponsorsManager } from "./sponsors-manager"
import { SettingsManager } from "./settings-manager"
import { UsersManager } from "./users-manager"
import { LayoutGrid, Users, BarChart3, Image as ImageIcon, Briefcase, Settings, Mail } from "lucide-react"

interface NomineeWithCategory extends Nominee {
  categories: { name: string } | null
}

interface AdminDashboardProps {
  initialCategories: Category[]
  initialNominees: NomineeWithCategory[]
  initialGalleryItems: any[]
  initialSponsors: any[]
  totalVotes: number
  votes?: any[]
  uniqueVoters: number
  activityData: { date: string, count: number }[]
  preloadedImages: string[]
  categoryVotes?: Record<string, number> // New prop for scalable stats
}

export function AdminDashboard({
  initialCategories,
  initialNominees,
  initialGalleryItems = [],
  initialSponsors = [],
  totalVotes,
  votes = [],
  uniqueVoters,
  activityData,
  preloadedImages,
  categoryVotes = {},
}: AdminDashboardProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [nominees, setNominees] = useState(initialNominees)
  const [galleryItems, setGalleryItems] = useState(initialGalleryItems)
  const [sponsors, setSponsors] = useState(initialSponsors)

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
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Galería</span>
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Patrocinadores</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configuración</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview
              categories={categories}
              nominees={initialNominees}
              totalVotes={totalVotes}
              votes={votes}
              uniqueVoters={uniqueVoters}
              activityData={activityData}
              categoryVotes={categoryVotes}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager
              categories={categories}
              onCategoriesChange={setCategories}
              preloadedImages={preloadedImages}
            />
          </TabsContent>

          <TabsContent value="nominees">
            <NomineesManager nominees={nominees} categories={categories} onNomineesChange={setNominees} />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManager items={galleryItems} onItemsChange={setGalleryItems} />
          </TabsContent>

          <TabsContent value="sponsors">
            <SponsorsManager sponsors={sponsors} onSponsorsChange={setSponsors} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManager />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
