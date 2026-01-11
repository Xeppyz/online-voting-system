import Link from "next/link"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <h2 className="text-4xl font-bold mb-4">404 - Página no encontrada</h2>
            <p className="text-gray-400 mb-8">Lo sentimos, la página que buscas no existe.</p>
            <Link
                href="/"
                className="px-6 py-3 bg-primary text-black font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
                Volver al inicio
            </Link>
        </div>
    )
}
