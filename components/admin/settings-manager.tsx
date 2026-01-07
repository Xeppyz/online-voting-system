"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Settings } from "lucide-react"

export function SettingsManager() {
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [enableAnonymous, setEnableAnonymous] = useState(false)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [enableCurtain, setEnableCurtain] = useState(false)
    const [showHeroCountdown, setShowHeroCountdown] = useState(true) // Default true
    const supabase = createClient()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const { data: settings } = await supabase
                .from("app_settings")
                .select("key, value")
                .in("key", ["enable_anonymous_voting", "enable_website_curtain", "show_hero_countdown", "voting_start_date", "voting_end_date"])

            if (settings) {
                const anon = settings.find(s => s.key === "enable_anonymous_voting")
                if (anon) setEnableAnonymous(anon.value === true)

                const curtain = settings.find(s => s.key === "enable_website_curtain")
                if (curtain) setEnableCurtain(curtain.value === true)

                const heroCountdown = settings.find(s => s.key === "show_hero_countdown")
                // Default to true if not present, or use value if present
                if (heroCountdown) setShowHeroCountdown(heroCountdown.value === true)

                const start = settings.find(s => s.key === "voting_start_date")
                const end = settings.find(s => s.key === "voting_end_date")
                if (start?.value) setStartDate(start.value)
                if (end?.value) setEndDate(end.value)
            }

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleAnonymous = async (checked: boolean) => {
        setUpdating(true)
        try {
            const { error } = await supabase
                .from("app_settings")
                .upsert({
                    key: "enable_anonymous_voting",
                    value: checked,
                    description: "Permitir votos anónimos via fingerprint"
                }, { onConflict: "key" })

            if (error) throw error

            setEnableAnonymous(checked)
            toast.success(checked ? "Voto Anónimo ACTIVADO" : "Voto Anónimo DESACTIVADO")
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar configuración")
            setEnableAnonymous(!checked)
        } finally {
            setUpdating(false)
        }
    }

    const handleToggleCurtain = async (checked: boolean) => {
        setUpdating(true)
        try {
            const { error } = await supabase
                .from("app_settings")
                .upsert({
                    key: "enable_website_curtain",
                    value: checked,
                    description: "Activar modo cortina (Coming Soon)"
                }, { onConflict: "key" })

            if (error) throw error

            setEnableCurtain(checked)
            toast.success(checked ? "Modo Cortina ACTIVADO" : "Modo Cortina DESACTIVADO")
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar configuración")
            setEnableCurtain(!checked)
        } finally {
            setUpdating(false)
        }
    }

    const handleToggleHeroCountdown = async (checked: boolean) => {
        setUpdating(true)
        try {
            const { error } = await supabase
                .from("app_settings")
                .upsert({
                    key: "show_hero_countdown",
                    value: checked,
                    description: "Mostrar contador en Hero Section"
                }, { onConflict: "key" })

            if (error) throw error

            setShowHeroCountdown(checked)
            toast.success("Visibilidad del contador actualizada")
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar configuración")
            setShowHeroCountdown(!checked)
        } finally {
            setUpdating(false)
        }
    }

    const handleDateChange = async (key: string, value: string) => {
        setUpdating(true)
        try {
            const { error } = await supabase
                .from("app_settings")
                .upsert({
                    key: key,
                    value: value,
                    description: key === "voting_start_date" ? "Fecha de inicio de votaciones" : "Fecha de fin de votaciones"
                }, { onConflict: "key" })

            if (error) throw error

            if (key === "voting_start_date") setStartDate(value)
            if (key === "voting_end_date") setEndDate(value)

            toast.success("Fecha actualizada")
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar fecha")
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card className="border-primary/20 bg-black/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Configuración General
                </CardTitle>
                <CardDescription>
                    Controla las características globales de la aplicación
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Anonymous Voting */}
                <div className="flex items-center justify-between space-x-4 rounded-lg border border-white/10 p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold">
                            Voto Anónimo (Fingerprint)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Permite a usuarios votar sin iniciar sesión usando la huella de su dispositivo.
                            <br />
                            <span className="text-amber-400 text-xs">⚠️ Aumenta drásticamente el volumen de votos pero reduce la seguridad.</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={enableAnonymous}
                            onCheckedChange={handleToggleAnonymous}
                            disabled={updating}
                        />
                    </div>
                </div>

                {/* Curtain Mode */}
                <div className="flex items-center justify-between space-x-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold text-amber-500">
                            Activar Cortina (Coming Soon)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Bloquea el acceso público a toda la web y muestra una pantalla de "Próximamente".
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={enableCurtain}
                            onCheckedChange={handleToggleCurtain}
                            disabled={updating}
                        />
                    </div>
                </div>

                {/* Show Hero Countdown */}
                <div className="flex items-center justify-between space-x-4 rounded-lg border border-white/10 p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold">
                            Mostrar Contador en Hero
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Muestra u oculta la cuenta regresiva en la sección principal (Hero).
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={showHeroCountdown}
                            onCheckedChange={handleToggleHeroCountdown}
                            disabled={updating}
                        />
                    </div>
                </div>

                {/* Voting Dates */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Periodo de Votación</Label>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                                if (!confirm("¿Estás seguro de querer borrar las fechas de votación?")) return
                                setUpdating(true)
                                try {
                                    const updates = [
                                        { key: "voting_start_date", value: "null", description: "Fecha de inicio de votaciones" },
                                        { key: "voting_end_date", value: "null", description: "Fecha de fin de votaciones" }
                                    ]

                                    const { error } = await supabase
                                        .from("app_settings")
                                        .upsert(updates, { onConflict: "key" })

                                    if (error) throw error

                                    setStartDate("")
                                    setEndDate("")
                                    toast.success("Fechas borradas correctamente")
                                } catch (error) {
                                    console.error(error)
                                    toast.error("Error al borrar fechas")
                                } finally {
                                    setUpdating(false)
                                }
                            }}
                            disabled={updating || (!startDate && !endDate)}
                        >
                            Limpiar Fechas
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Fecha de Inicio</Label>
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    className="flex h-10 w-full rounded-md border border-input bg-zinc-900 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white scheme-dark"
                                    value={startDate}
                                    onChange={(e) => handleDateChange("voting_start_date", e.target.value)}
                                    disabled={updating}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Antes de esta fecha, se mostrará una cuenta regresiva de "Inicia en...".
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Fin</Label>
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    className="flex h-10 w-full rounded-md border border-input bg-zinc-900 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white scheme-dark"
                                    value={endDate}
                                    onChange={(e) => handleDateChange("voting_end_date", e.target.value)}
                                    disabled={updating}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Después de esta fecha, se mostrará "Votación Finalizada".
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
