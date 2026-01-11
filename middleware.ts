import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from "@/lib/supabase/proxy"

export async function middleware(req: NextRequest) {
    // 1. Vercel Bot Protection
    // x-vercel-bot-label: '1' -> Automated
    const botLabel = req.headers.get('x-vercel-bot-label')

    if (botLabel === '1') {
        // Optional: Add logic here to block specific bots or if under attack.
        // verifiable bots like Googlebot usually have this label but are allowed by Vercel firewall settings.
        // For now, we pass-through to Auth.
    }

    // 2. Supabase Auth & Admin Protection
    // CRITICAL OPTIMIZATION:
    // If the user has NO cookies, they are not logged in.
    // We skip updateSession() to avoid hitting the database for every bot request.
    const hasCookies = req.cookies.getAll().length > 0;

    if (!hasCookies) {
        return NextResponse.next();
    }

    return await updateSession(req)
}

export const config = {
    // Matcher excluding static files and images
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2|mp4|webm|ico|xml|txt)$).*)"],
}
