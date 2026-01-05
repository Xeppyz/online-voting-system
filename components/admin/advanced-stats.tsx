"use client"

import { useState, useMemo } from "react"
import { CategoryWithNominees } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search, Trophy, Filter } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Image from "next/image"

interface AdvancedStatsProps {
    initialCategories: CategoryWithNominees[]
    totalVotes: number
}

export function AdvancedStats({ initialCategories, totalVotes }: AdvancedStatsProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState("")

    // Filter and flatten data for the table
    const filteredData = useMemo(() => {
        let data = initialCategories.flatMap(category =>
            category.nominees.map(nominee => ({
                ...nominee,
                categoryName: category.name,
                role: "Nominee" // Just a placeholder label
            }))
        )

        if (selectedCategory !== "all") {
            data = data.filter(item => item.category_id === selectedCategory)
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.name.toLowerCase().includes(lowerSearch) ||
                item.categoryName.toLowerCase().includes(lowerSearch)
            )
        }

        // Sort by votes descending
        return data.sort((a, b) => b.vote_count - a.vote_count)
    }, [initialCategories, selectedCategory, searchTerm])

    const exportCSV = () => {
        const headers = ["Nombre", "Categoría", "Votos", "Porcentaje", "Fecha Registro"]
        const rows = filteredData.map(item => [
            item.name,
            item.categoryName,
            item.vote_count,
            `${item.percentage}%`,
            new Date(item.created_at).toLocaleDateString()
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `clik-awards-stats-${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Calculate winner for selected category
    const categoryWinner = useMemo(() => {
        if (selectedCategory === "all") return null
        return filteredData[0] // Since it's sorted by votes
    }, [filteredData, selectedCategory])

    return (
        <div className="space-y-6">

            {/* Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Votos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVotes.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Nominados Mostrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredData.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Categorías Activas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialCategories.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar nominado..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Categorías</SelectItem>
                            {initialCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={exportCSV} variant="outline" className="w-full md:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
            </div>

            {/* Category Winner Highlight */}
            {categoryWinner && selectedCategory !== "all" && categoryWinner.vote_count > 0 && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-lg shadow-primary/20">
                            <Image
                                src={categoryWinner.image_url || "/placeholder-user.jpg"}
                                alt={categoryWinner.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="w-5 h-5 text-primary" />
                                <span className="font-bold text-primary tracking-wide uppercase text-sm">Ganador Virtual</span>
                            </div>
                            <h2 className="text-3xl font-black text-foreground">{categoryWinner.name}</h2>
                            <p className="text-muted-foreground text-lg">
                                Liderando la categoría <span className="text-foreground font-semibold">{categoryWinner.categoryName}</span> con <span className="font-bold text-primary">{categoryWinner.vote_count}</span> votos ({categoryWinner.percentage}%)
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Resultados Detallados</CardTitle>
                    <CardDescription>
                        Listado completo de votos ordenado por popularidad.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Ranking</TableHead>
                                <TableHead>Nominado</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">Votos</TableHead>
                                <TableHead className="text-right">Porcentaje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        #{index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden relative bg-muted">
                                                <Image
                                                    src={item.image_url || "/placeholder-user.jpg"}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="font-semibold">{item.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.categoryName}</TableCell>
                                    <TableCell className="text-right font-mono font-medium">{item.vote_count.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-muted-foreground text-sm">{item.percentage}%</span>
                                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No se encontraron resultados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
