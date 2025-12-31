"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePathname, useSearchParams } from "next/navigation"

export function AnalyticsTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        const track = async () => {
            const supabase = createClient()

            // Intentamos obtener el usuario para métricas de "Usuarios Activos"
            // No bloqueamos (no await crítico)
            const { data: { user } } = await supabase.auth.getUser()

            // Usamos la tabla 'analytics_visits' que ya creamos para no tener que borrar/crear tablas nuevas
            const { error } = await supabase.from('analytics_visits').insert({
                path: pathname,
                user_id: user?.id || null
            })

            if (error) console.error("Analytics Error:", error)
        }

        track()
    }, [pathname, searchParams])

    return null
}
