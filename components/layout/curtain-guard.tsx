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
    const [isAuthorized, setIsAuthorized] = useState(false) // Allow access if logged in
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        const checkAccess = async () => {
            // 1. Check Curtain Setting
            const { data: setting } = await supabase
                .from("app_settings")
                .select("value")
                .eq("key", "enable_website_curtain")
                .single()

            if (setting) {
                setEnabled(setting.value === true)
            }

            // 2. Check User Session
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setIsAuthorized(true)
            }

            setLoading(false)
        }

        checkAccess()

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

        // Listen for auth changes to update state immediately upon login/logout
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthorized(!!session?.user)
        })

        return () => {
            supabase.removeChannel(channel)
            authListener.subscription.unsubscribe()
        }
    }, [])

    // Always allow admin routes and auth routes
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/sign-in") || pathname?.startsWith("/auth") || pathname?.startsWith("/login")) {
        return <>{children}</>
    }

    // If loading, show nothing or children? Best to show children to avoid layout shift if disabled, 
    // but if enabled we might flash. Since we have initialEnabled, we use it.
    // Actually, wait for client check to be sure about auth.

    // Revised Logic:
    // If we are absolutely sure curtain is enabled AND we are NOT authorized, show curtain.
    // We need to wait for auth check to know if we are authorized.

    if (loading && initialEnabled) {
        // If server said enabled, show curtain while we check auth. 
        // This prevents content flash.
        return <Curtain />
    }

    if (enabled && !isAuthorized) {
        return <Curtain />
    }

    if (enabled && !isAuthorized) {
        return <Curtain />
    }

    return <>{children}</>
}
