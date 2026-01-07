import type React from "react"
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
})

export const metadata: Metadata = {
  title: "Click Awards 2025",
  description: "Vota por tus favoritos en los Click Awards 2025",
  icons: {
    icon: "/icon/ISOTIPOCLIK512PX.png",
    shortcut: "/icon/ISOTIPOCLIK512PX.png",
    apple: "/apple-icon.png",
  },
}

import { CurtainGuard } from "@/components/layout/curtain-guard"
import { createClient } from "@/lib/supabase/server"
import { Toaster } from "sonner"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  // Check initial curtain state server-side to prevent flash
  const supabase = await createClient()
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "enable_website_curtain")
    .single()

  const isCurtainEnabled = data?.value === true

  return (
    <html lang="es" className="dark">
      <body className={`font-sans antialiased ${avantique.variable}`} suppressHydrationWarning>
        <CurtainGuard initialEnabled={isCurtainEnabled}>
          {children}
        </CurtainGuard>
        <AnalyticsTracker /> {/* [NEW] Real custom analytics */}
        <Analytics /> {/* Vercel analytics (optional, keep if user wants both) */}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  )
}
