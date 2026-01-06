"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Vote, Menu, X, User as UserIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"

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

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  const isAdmin = user?.user_metadata?.is_admin === true

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon/ClikHFull.png" alt="Clikawards" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/categorias" className="text-sm font-medium hover:text-primary transition-colors">
              Categorías
            </Link>
            <Link href="/galeria" className="text-sm font-medium hover:text-primary transition-colors">
              Galería
            </Link>
            {isAdmin && (
              <Link href="/estadisticas" className="text-sm font-medium hover:text-primary transition-colors">
                Estadísticas
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      Panel Admin
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="w-4 h-4" />
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" suppressHydrationWarning>
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black/95 border-white/10 text-white">
                <SheetHeader>
                  <SheetTitle>
                    <span className="sr-only">Menú de Navegación</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-8 mt-8">
                  <Link href="/categorias" className="text-lg font-medium hover:text-primary transition-colors">
                    Categorías
                  </Link>
                  <Link href="/galeria" className="text-lg font-medium hover:text-primary transition-colors">
                    Galería
                  </Link>
                  {isAdmin && (
                    <Link href="/estadisticas" className="text-lg font-medium hover:text-primary transition-colors">
                      Estadísticas
                    </Link>
                  )}
                  {user ? (
                    <>
                      {isAdmin && (
                        <Link href="/admin" className="text-lg font-medium hover:text-primary transition-colors">
                          Panel Admin
                        </Link>
                      )}
                      <Button variant="outline" className="w-full" onClick={handleSignOut}>
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full gap-2">
                        <UserIcon className="w-4 h-4" />
                        Iniciar Sesión
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
