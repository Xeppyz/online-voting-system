import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Clikawards | Sistema de Votaciones",
  description:
    "Vota por tus favoritos en las diferentes categorías de Clikawards. Sistema de votación en línea seguro y en tiempo real.",
  generator: "v0.app",
  icons: {
    icon: "/clikawards-icon.svg",
    apple: "/clikawards-icon.svg",
  },
  openGraph: {
    title: "Clikawards | Sistema de Votaciones",
    description: "Vota por tus favoritos en las diferentes categorías",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066FF" },
    { media: "(prefers-color-scheme: dark)", color: "#0066FF" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
