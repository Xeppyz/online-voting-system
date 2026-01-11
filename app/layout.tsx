import type React from "react"
export const revalidate = 3600 // Revalidate every hour
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker"

const inter = Inter({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

const avantique = localFont({
  src: "../public/fonts/Avantique-Regular.ttf",
  variable: "--font-avantique",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Clik Awards 2026",
  description: "Vota por tus favoritos en los Clik Awards 2026",
  icons: {
    icon: "/icon/ISOTIPOCLIK512PX.png",
    shortcut: "/icon/ISOTIPOCLIK512PX.png",
    apple: "/apple-icon.png",
  },
  other: {
    google: "notranslate",
  },
}

import { CurtainGuard } from "@/components/layout/curtain-guard"
import { createPublicClient } from "@/lib/supabase/public"
import { Toaster } from "sonner"
import { UserVotesProvider } from "@/components/context/user-votes-provider"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  // Check initial curtain state using public client (no cookies/auth) to allow Static/ISR
  const supabase = createPublicClient()
  const { data: settings } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["enable_website_curtain", "voting_start_date"])

  const curtainEnabled = settings?.find(s => s.key === "enable_website_curtain")?.value === true
  const startDateVal = settings?.find(s => s.key === "voting_start_date")?.value

  let isCurtainEnabled = curtainEnabled

  // Simple server-side check (ISR will update this every revalidation period)
  if (isCurtainEnabled && startDateVal) {
    const start = new Date(startDateVal)
    const now = new Date()
    if (!isNaN(start.getTime()) && now >= start) {
      isCurtainEnabled = false
    }
  }

  return (
    <html lang="es" className="dark notranslate" translate="no">
      <body className={`font-sans antialiased ${avantique.variable}`} suppressHydrationWarning>
        <UserVotesProvider>
          <CurtainGuard initialEnabled={isCurtainEnabled} startDate={startDateVal}>
            {children}
          </CurtainGuard>
          {/* AnalyticsTracker removed to save requests */}
          <Analytics /> {/* Vercel analytics (optional, keep if user wants both) */}
          <Toaster theme="dark" position="bottom-right" />
        </UserVotesProvider>
      </body>
    </html>
  )
}
