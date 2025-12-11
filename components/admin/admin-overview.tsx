"use client"

import type { Category, Nominee } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Vote, LayoutGrid, Users, TrendingUp } from "lucide-react"

interface AdminOverviewProps {
  categories: Category[]
  nominees: Nominee[]
  totalVotes: number
}

export function AdminOverview({ categories, nominees, totalVotes }: AdminOverviewProps) {
  const stats = [
    {
      icon: Vote,
      label: "Votos Totales",
      value: totalVotes.toLocaleString(),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: LayoutGrid,
      label: "Categorías",
      value: categories.length.toString(),
      color: "text-[#00D4FF]",
      bgColor: "bg-[#00D4FF]/10",
    },
    {
      icon: Users,
      label: "Nominados",
      value: nominees.length.toString(),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: TrendingUp,
      label: "Promedio de Votos",
      value: categories.length > 0 ? Math.round(totalVotes / categories.length).toString() : "0",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Categorías Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay categorías creadas</p>
            ) : (
              <div className="space-y-3">
                {categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium text-foreground">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {nominees.filter((n) => n.category_id === category.id).length} nominados
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Nominados Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {nominees.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay nominados creados</p>
            ) : (
              <div className="space-y-3">
                {nominees.slice(0, 5).map((nominee) => (
                  <div key={nominee.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium text-foreground">{nominee.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {(nominee as { categories?: { name: string } | null }).categories?.name || "Sin categoría"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
