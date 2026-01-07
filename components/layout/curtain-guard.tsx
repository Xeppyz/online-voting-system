"use client"

import { usePathname, useRouter } from "next/navigation"
import { Curtain } from "@/components/ui/curtain"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface CurtainGuardProps {
    children: React.ReactNode
    initialEnabled?: boolean
    startDate?: string | null
}

export function CurtainGuard({ children, initialEnabled = false, startDate }: CurtainGuardProps) {
    const pathname = usePathname()
    const [enabled, setEnabled] = useState(initialEnabled)
    const [isAuthorized, setIsAuthorized] = useState(false) // Allow access if logged in
    const [loading, setLoading] = useState(true)

    const router = useRouter() // Use router for refresh

    useEffect(() => {
        const supabase = createClient()
        let timer: NodeJS.Timeout

        const checkAccess = async () => {
            // 1. Fetch settings (curtain + start date)
            const { data: settings } = await supabase
                .from("app_settings")
                .select("key, value")
                .in("key", ["enable_website_curtain", "voting_start_date"])

            let shouldEnable = false
            let fetchedStartDate: Date | null = null

            if (settings) {
                const curtainSetting = settings.find(s => s.key === "enable_website_curtain")
                const dateSetting = settings.find(s => s.key === "voting_start_date")

                if (curtainSetting?.value === true) {
                    shouldEnable = true
                }

                if (dateSetting?.value) {
                    fetchedStartDate = new Date(dateSetting.value)
                }
            }

            // Allow override via prop if fetch fails or for initial sync
            const effectiveStartDate = fetchedStartDate || (startDate ? new Date(startDate) : null)

            // check overrides
            if (shouldEnable && effectiveStartDate && !isNaN(effectiveStartDate.getTime())) {
                const now = new Date()
                if (now >= effectiveStartDate) {
                    shouldEnable = false // Auto-open!
                } else {
                    // Set timer to auto-open
                    const diff = effectiveStartDate.getTime() - now.getTime()
                    // Max delay for setTimeout is 2^31-1 (~24.8 days), so check reasonable range
                    if (diff > 0 && diff < 2147483647) {
                        timer = setTimeout(() => {
                            setEnabled(false)
                            router.refresh()
                        }, diff)
                    }
                }
            }

            setEnabled(shouldEnable)

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
                },
                (payload) => {
                    // Re-run check on any setting change (simplest way to handle dates/toggles concurrently)
                    checkAccess()
                }
            )
            .subscribe()

        // Listen for auth changes to update state immediately upon login/logout
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthorized(!!session?.user)
        })

        return () => {
            if (timer) clearTimeout(timer)
            supabase.removeChannel(channel)
            authListener.subscription.unsubscribe()
        }
    }, [startDate, router])

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
        return <Curtain startDate={startDate} />
    }

    if (enabled && !isAuthorized) {
        return <Curtain startDate={startDate} />
    }

    if (enabled && !isAuthorized) {
        return <Curtain />
    }

    return <>{children}</>
}
