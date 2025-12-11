import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Vote } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-[#00D4FF]/5">
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-xl">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#00D4FF] flex items-center justify-center">
              <Vote className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-destructive/10">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Error de Autenticación</CardTitle>
          <CardDescription className="text-muted-foreground">Ocurrió un problema al iniciar sesión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params?.error && (
            <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">Código de error: {params.error}</div>
          )}

          <div className="flex flex-col gap-2">
            <Link href="/auth/login">
              <Button className="w-full">Intentar de nuevo</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
