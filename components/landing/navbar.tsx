"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Vote, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = user?.user_metadata?.is_admin === true

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon/ClikHFull.png" alt="Clikawards" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/categorias" className="text-sm font-medium hover:text-primary transition-colors">
              Categorías
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                Admin
              </Link>
            )}
            {!isLoading &&
              (user ? (
                <Link href="/perfil">
                  <Button variant="outline" size="sm">
                    Mi Perfil
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button size="sm">Iniciar Sesión</Button>
                </Link>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/categorias"
              className="block px-3 py-2 text-base font-medium hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Categorías
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}
            {!isLoading &&
              (user ? (
                <Link href="/perfil" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full bg-transparent">
                    Mi Perfil
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Iniciar Sesión</Button>
                </Link>
              ))}
          </div>
        </div>
      )}
    </nav>
  )
}
