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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`font-sans antialiased ${avantique.variable}`} suppressHydrationWarning>
        {children}
        <AnalyticsTracker /> {/* [NEW] Real custom analytics */}
        <Analytics /> {/* Vercel analytics (optional, keep if user wants both) */}
      </body>
    </html>
  )
}
