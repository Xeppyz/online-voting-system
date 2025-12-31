"use client"

import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { trackVisit } from "@/lib/analytics-actions"

function AnalyticsTrackerContent() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Debounce or just track? 
        // Just track for now. Logic handles rapid changes if needed?
        // We'll track every path change.

        // Construct full path
        const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

        // Call server action
        trackVisit(url)
    }, [pathname, searchParams])

    return null
}

export function AnalyticsTracker() {
    return (
        <Suspense fallback={null}>
            <AnalyticsTrackerContent />
        </Suspense>
    )
}
