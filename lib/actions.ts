"use server"

import fs from "fs"
import path from "path"

export async function getPreloadedCategoryImages() {
    const categoriesDir = path.join(process.cwd(), "public", "categorias")

    try {
        if (!fs.existsSync(categoriesDir)) {
            return []
        }

        const files = fs.readdirSync(categoriesDir)

        // Filter for image files
        const imageFiles = files.filter(file =>
            /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
        )

        // Return paths relative to public, e.g., "/categorias/image.png"
        return imageFiles.map(file => `/categorias/${file}`)
    } catch (error) {
        console.error("Error reading category images:", error)
        return []
    }
}
