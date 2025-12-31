import Link from "next/link"
import { Vote } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/icon/ClikHFull.png" alt="Clikawards" className="h-8 w-auto object-contain" />
            </Link>
            <div className="flex items-center gap-4 mt-2">
              <img src="/icon/LOGOPERFILRSS.png" alt="RSS" className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
              <img src="/icon/LOGOPERFILRSS02.png" alt="RSS 02" className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Contacto email: clikawardsni@gmail.com</p>
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

          <p className="text-sm text-muted-foreground">© 2025 Clikawards. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
