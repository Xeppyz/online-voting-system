import Link from "next/link"
import { Vote } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#00D4FF] flex items-center justify-center">
              <Vote className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Armando La Plática</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/categorias" className="hover:text-foreground transition-colors">
              Categorías
            </Link>
            <Link href="/estadisticas" className="hover:text-foreground transition-colors">
              Estadísticas
            </Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Iniciar Sesión
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">© 2025 Armando La Plática. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
