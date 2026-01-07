"use client"

import { usePathname } from "next/navigation"
import { Curtain } from "@/components/ui/curtain"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface CurtainGuardProps {
    children: React.ReactNode
    initialEnabled?: boolean
}

export function CurtainGuard({ children, initialEnabled = false }: CurtainGuardProps) {
    const pathname = usePathname()
    const [enabled, setEnabled] = useState(initialEnabled)
    const [loading, setLoading] = useState(!initialEnabled) // If already passed from server, no load needed logic simplifier

    useEffect(() => {
        // If not passed from server or to stay in sync
        const supabase = createClient()
        const checkCurtain = async () => {
            const { data } = await supabase
                .from("app_settings")
                .select("value")
                .eq("key", "enable_website_curtain")
                .single()

            if (data) {
                setEnabled(data.value === true)
            }
            setLoading(false)
        }

        checkCurtain()

        // Realtime subscription to curtain changes
        const channel = supabase
            .channel("settings_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "app_settings",
                    filter: "key=eq.enable_website_curtain",
                },
                (payload) => {
                    const newVal = payload.new as any
                    if (newVal) {
                        setEnabled(newVal.value === true)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Always allow admin routes
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/sign-in")) {
        return <>{children}</>
    }

    // If enabled, show Curtain
    if (enabled) {
        return <Curtain />
    }

    return <>{children}</>
}
