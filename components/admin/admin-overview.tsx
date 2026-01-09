"use client"

import type { Category, Nominee } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Vote, LayoutGrid, Users, TrendingUp, Eye, UserCheck } from "lucide-react" // Added icons
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { startOfMonth, format, subDays, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"

interface AdminOverviewProps {
  categories: Category[]
  nominees: Nominee[]
  totalVotes: number
  votes?: any[]
  uniqueVoters: number
  activityData: { date: string, count: number }[]
  categoryVotes?: Record<string, number>
}

export function AdminOverview({
  categories,
  nominees,
  totalVotes,
  votes = [],
  uniqueVoters,
  activityData,
  categoryVotes = {},
}: AdminOverviewProps) {

  // 1. Prepare Data for "Votes by Category" Bar Chart
  const votesByCategory = categories.map(cat => {
    // Use pre-calculated aggregated votes if available, otherwise fall back to raw count (legacy)
    const catVotes = categoryVotes[cat.id] !== undefined
      ? categoryVotes[cat.id]
      : votes.filter(v => v.category_id === cat.id).length

    return {
      name: cat.name,
      votos: catVotes
    }
  }).sort((a, b) => b.votos - a.votos)

  // Stats Cards Data
  const stats = [
    {
      icon: Vote,
      label: "Votos Totales",
      value: totalVotes.toLocaleString(),
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "Global",
    },
    {
      icon: Users,
      label: "Usuarios (Votantes)",
      value: uniqueVoters.toLocaleString(),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: "Únicos",
    },
    {
      icon: LayoutGrid,
      label: "Categorías",
      value: categories.length.toString(),
      color: "text-[#3ffcff]",
      bgColor: "bg-[#3ffcff]/10",
      change: "Activas",
    },
    {
      icon: TrendingUp,
      label: "Votos por Usuario",
      value: uniqueVoters > 0 ? (totalVotes / uniqueVoters).toFixed(1) : "0",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      change: "Promedio",
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

        {/* Left: Votes Activity (Line Chart) */}
        <Card className="lg:col-span-4 border-border/50">
          <CardHeader>
            <CardTitle>Actividad de Votación</CardTitle>
            <CardDescription>Votos registrados en los últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#70e54e"
                    strokeWidth={3}
                    dot={{ fill: '#70e54e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Votes by Category (Bar Chart) */}
        <Card className="lg:col-span-3 border-border/50">
          <CardHeader>
            <CardTitle>Votos por Categoría</CardTitle>
            <CardDescription>Categorías más populares</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={votesByCategory.slice(0, 6)}> {/* Top 6 */}
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: '#888', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="votos" fill="#70e54e" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
