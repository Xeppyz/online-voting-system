"use client"

import type React from "react"

import type { Category } from "@/lib/types"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, LayoutGrid, X, ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface CategoriesManagerProps {
  categories: Category[]
  onCategoriesChange: (categories: Category[]) => void
}

export function CategoriesManager({ categories, onCategoriesChange }: CategoriesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "", image_url: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleOpenDialog = (category?: Category) => {
    setError(null)
    setImageFile(null)
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || "",
        image_url: category.image_url || "",
      })
      setImagePreview(category.image_url || null)
    } else {
      setEditingCategory(null)
      setFormData({ name: "", description: "", image_url: "" })
      setImagePreview(null)
    }
    setIsDialogOpen(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar 5MB")
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({ ...formData, image_url: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `categories/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    setUploadProgress(true)
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false })
    setUploadProgress(false)

    if (error) {
      console.error("Error uploading image:", error)
      setError("Error al subir la imagen: " + error.message)
      return null
    }

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(data.path)
    return urlData.publicUrl
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("El nombre es requerido")
      return
    }

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      let finalImageUrl = formData.image_url

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl
        } else {
          setIsLoading(false)
          return
        }
      }

      if (editingCategory) {
        const { data, error } = await supabase
          .from("categories")
          .update({
            name: formData.name,
            description: formData.description || null,
            image_url: finalImageUrl || null,
          })
          .eq("id", editingCategory.id)
          .select()
          .single()

        if (error) throw error

        onCategoriesChange(categories.map((c) => (c.id === editingCategory.id ? data : c)))
      } else {
        const { data, error } = await supabase
          .from("categories")
          .insert({
            name: formData.name,
            description: formData.description || null,
            image_url: finalImageUrl || null,
          })
          .select()
          .single()

        if (error) throw error

        onCategoriesChange([...categories, data])
      }

      setIsDialogOpen(false)
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      console.error("Error saving category:", err)
      setError("Error al guardar: " + errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría? Se eliminarán todos los nominados asociados.")) return

    const supabase = createClient()

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error

      onCategoriesChange(categories.filter((c) => c.id !== id))
      router.refresh()
    } catch (err) {
      console.error("Error deleting category:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categorías</h2>
          <p className="text-muted-foreground">Gestiona las categorías de votación</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Modifica los detalles de la categoría" : "Crea una nueva categoría de votación"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre de la categoría"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Haz clic para subir una imagen</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG hasta 5MB</span>
                  </button>
                )}
              </div>

              <Button onClick={handleSave} disabled={isLoading || uploadProgress} className="w-full">
                {uploadProgress
                  ? "Subiendo imagen..."
                  : isLoading
                    ? "Guardando..."
                    : editingCategory
                      ? "Guardar Cambios"
                      : "Crear Categoría"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <LayoutGrid className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay categorías</h3>
            <p className="text-muted-foreground text-sm mb-4">Comienza creando tu primera categoría</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="border-border/50 overflow-hidden">
              {category.image_url && (
                <div className="relative h-32 bg-muted">
                  <Image
                    src={category.image_url || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{category.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(category)}
                    className="flex-1 bg-transparent"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
