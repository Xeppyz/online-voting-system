"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Settings } from "lucide-react"

export function SettingsManager() {
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [enableAnonymous, setEnableAnonymous] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("app_settings")
                .select("value")
                .eq("key", "enable_anonymous_voting")
                .single()

            if (error) {
                // If error is 406 (row not found), we assume default false and create it later if asked
                if (error.code !== "PGRST116") {
                    console.error(error)
                    toast.error("Error cargando configuración")
                }
            }

            if (data) {
                setEnableAnonymous(data.value === true) // JSONB true
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (checked: boolean) => {
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
            // Revert in UI on error
            setEnableAnonymous(!checked)
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
                        {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Switch
                            checked={enableAnonymous}
                            onCheckedChange={handleToggle}
                            disabled={updating}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
