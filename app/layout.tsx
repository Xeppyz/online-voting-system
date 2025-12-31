import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker"

const inter = Inter({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

const sentient = localFont({
  src: [
    {
      path: "../public/fonts/Sentient-Variable.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/Sentient-VariableItalic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-sentient",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`font-sans antialiased ${sentient.variable}`} suppressHydrationWarning>
        {children}
        <AnalyticsTracker /> {/* [NEW] Real custom analytics */}
        <Analytics /> {/* Vercel analytics (optional, keep if user wants both) */}
      </body>
    </html>
  )
}
