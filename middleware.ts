import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    // HEADER DE PROTECCIÓN DE VERCEL
    // x-vercel-bot-label:
    // '0' -> Humano (o muy parecido a humano)
    // '1' -> Bot (Automatizado)
    const botLabel = req.headers.get('x-vercel-bot-label')

    // Si Vercel dice que es un BOT (1)
    if (botLabel === '1') {
        // Lista blanca de bots "buenos" (Buscadores)
        // Vercel ya verifica si es Google/Bing real, pero aquí podemos filtrar extra si queremos.
        // Por ahora, si es un bot y estamos bajo ataque, podríamos bloquear todo menos lo vital.

        // OJO: Si tienes el modo "Attack Challenge" activado en Vercel, el bloqueo sucede ANTES de llegar aquí.
        // Si llega aquí, es porque Vercel lo dejó pasar (quizás en modo "Log").

        // ESTRATEGIA: Bloquear bots si no parecen buscadores legítimos.
        // Simplificación: Bloquear todo tráfico marcado como '1' si no es ruta estática.
        // (A menos que quieras SEO, en cuyo caso habría que hilar más fino, pero para parar el ataque 1.2M...)

        // Vamos a permitir el paso por ahora, pero prepárate para descomentar el bloqueo si el ataque sigue.
        // Si quieres bloquear YA:
        // return new NextResponse('Bot detection', { status: 403 })
    }

    // IMPORTANTE:
    // La protección real de "BotID" (ese paquete npm) funciona inyectando un script en el cliente.
    // El middleware solo ve el resultado.

    // Como pediste instalar 'botid', lo dejamos listo.
    // Pero la defensa PRINCIPAL contra los 1.2M de requests es configurar en el Dashboard de Vercel:
    // Security -> Bot Protection -> Action: "Challenge" o "Deny".

    return NextResponse.next()
}

export const config = {
    matcher: '/:path*',
}
