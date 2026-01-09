import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    // Only run on Vercel (where req.geo is defined)
    // Locally, req.geo is usually undefined, so we allow access for development.
    const { geo } = req as NextRequest & { geo?: { country?: string } }
    const country = geo?.country

    // If we are in production (geo exists) and the country is NOT Nicaragua (NI)
    if (country && country !== 'NI') {
        // Allows access to static files so they don't break if we ever show a custom error page
        if (
            req.nextUrl.pathname.startsWith('/_next') ||
            req.nextUrl.pathname.startsWith('/static') ||
            req.nextUrl.pathname.startsWith('/api/webhooks') // Allow webhooks if needed (e.g. Stripe/Resend)
        ) {
            return NextResponse.next()
        }

        // Block the request
        return new NextResponse(
            `<html>
        <head><title>Access Denied</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:#fff;font-family:sans-serif;text-align:center;">
          <div>
            <h1 style="color:#e11d48;">Acceso Restringido</h1>
            <p>Por seguridad, el acceso a este sitio está limitado temporalmente para tu región (${country}).</p>
            <p>Si eres de Nicaragua y ves esto, por favor intenta usar datos móviles.</p>
          </div>
        </body>
      </html>`,
            { status: 403, headers: { 'content-type': 'text/html' } }
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Apply to all routes except api/webhooks if needed, static files, etc.
        // The middleware function logic explicitly handles _next/static, but we can also exclude here for perf
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
