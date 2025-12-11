import type { CategoryWithNominees } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Vote, Users, Trophy, TrendingUp } from "lucide-react"

interface StatsOverviewProps {
  categories: CategoryWithNominees[]
  totalVotes: number
}

export function StatsOverview({ categories, totalVotes }: StatsOverviewProps) {
  const totalNominees = categories.reduce((sum, cat) => sum + cat.nominees.length, 0)
  const topCategory = categories.reduce(
    (top, cat) => (cat.total_votes > (top?.total_votes || 0) ? cat : top),
    categories[0],
  )

  const stats = [
    {
      icon: Vote,
      label: "Votos Totales",
      value: totalVotes.toLocaleString(),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Trophy,
      label: "Categorías",
      value: categories.length.toString(),
      color: "text-[#00D4FF]",
      bgColor: "bg-[#00D4FF]/10",
    },
    {
      icon: Users,
      label: "Nominados",
      value: totalNominees.toString(),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: TrendingUp,
      label: "Categoría Más Votada",
      value: topCategory?.name || "-",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 hover:border-primary/30 transition-colors">
          <CardContent className="p-6">
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground truncate">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
