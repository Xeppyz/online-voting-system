"use client"

import type React from "react"

import type { Category, Nominee } from "@/lib/types"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Users, User, Video, X, ImageIcon, Film } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface NomineeWithCategory extends Nominee {
  categories: { name: string } | null
}

interface NomineesManagerProps {
  nominees: NomineeWithCategory[]
  categories: Category[]
  onNomineesChange: (nominees: NomineeWithCategory[]) => void
}

export function NomineesManager({ nominees, categories, onNomineesChange }: NomineesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNominee, setEditingNominee] = useState<NomineeWithCategory | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    image_url: "",
    clip_url: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleOpenDialog = (nominee?: NomineeWithCategory) => {
    setError(null)
    setImageFile(null)
    setVideoFile(null)
    if (nominee) {
      setEditingNominee(nominee)
      setFormData({
        name: nominee.name,
        description: nominee.description || "",
        category_id: nominee.category_id,
        image_url: nominee.image_url || "",
        clip_url: nominee.clip_url || "",
      })
      setImagePreview(nominee.image_url || null)
      setVideoPreview(nominee.clip_url || null)
    } else {
      setEditingNominee(null)
      setFormData({ name: "", description: "", category_id: "", image_url: "", clip_url: "" })
      setImagePreview(null)
      setVideoPreview(null)
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

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError("El video no puede superar 50MB")
        return
      }
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({ ...formData, image_url: "" })
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handleRemoveVideo = () => {
    setVideoFile(null)
    setVideoPreview(null)
    setFormData({ ...formData, clip_url: "" })
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false })

    if (error) {
      console.error("Error uploading file:", error)
      setError("Error al subir archivo: " + error.message)
      return null
    }

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(data.path)
    return urlData.publicUrl
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category_id) {
      setError("El nombre y la categoría son requeridos")
      return
    }

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      let finalImageUrl = formData.image_url
      let finalVideoUrl = formData.clip_url

      if (imageFile) {
        setUploadProgress("Subiendo imagen...")
        const uploadedUrl = await uploadFile(imageFile, "nominees")
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl
        } else {
          setIsLoading(false)
          setUploadProgress(null)
          return
        }
      }

      if (videoFile) {
        setUploadProgress("Subiendo video...")
        const uploadedUrl = await uploadFile(videoFile, "clips")
        if (uploadedUrl) {
          finalVideoUrl = uploadedUrl
        } else {
          setIsLoading(false)
          setUploadProgress(null)
          return
        }
      }

      setUploadProgress(null)

      if (editingNominee) {
        const { data, error } = await supabase
          .from("nominees")
          .update({
            name: formData.name,
            description: formData.description || null,
            category_id: formData.category_id,
            image_url: finalImageUrl || null,
            clip_url: finalVideoUrl || null,
          })
          .eq("id", editingNominee.id)
          .select("*, categories(name)")
          .single()

        if (error) throw error

        onNomineesChange(nominees.map((n) => (n.id === editingNominee.id ? data : n)))
      } else {
        const { data, error } = await supabase
          .from("nominees")
          .insert({
            name: formData.name,
            description: formData.description || null,
            category_id: formData.category_id,
            image_url: finalImageUrl || null,
            clip_url: finalVideoUrl || null,
          })
          .select("*, categories(name)")
          .single()

        if (error) throw error

        onNomineesChange([...nominees, data])
      }

      setIsDialogOpen(false)
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      console.error("Error saving nominee:", err)
      setError("Error al guardar: " + errorMessage)
    } finally {
      setIsLoading(false)
      setUploadProgress(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este nominado?")) return

    const supabase = createClient()

    try {
      const { error } = await supabase.from("nominees").delete().eq("id", id)

      if (error) throw error

      onNomineesChange(nominees.filter((n) => n.id !== id))
      router.refresh()
    } catch (err) {
      console.error("Error deleting nominee:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Nominados</h2>
          <p className="text-muted-foreground">Gestiona los nominados de cada categoría</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} disabled={categories.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Nominado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNominee ? "Editar Nominado" : "Nuevo Nominado"}</DialogTitle>
              <DialogDescription>
                {editingNominee ? "Modifica los detalles del nominado" : "Agrega un nuevo nominado a una categoría"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del nominado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción / Biografía</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del nominado"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen</Label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
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
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Subir imagen</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG hasta 5MB</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Video / Clip (opcional)</Label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />

                {videoPreview ? (
                  <div className="relative w-full rounded-lg overflow-hidden border border-border">
                    <video src={videoPreview} className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-xs">
                      <Video className="w-3 h-3" />
                      Video cargado
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <Film className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Subir video</span>
                    <span className="text-xs text-muted-foreground">MP4, MOV hasta 50MB</span>
                  </button>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={isLoading || !formData.category_id || !!uploadProgress}
                className="w-full"
              >
                {uploadProgress || (isLoading ? "Guardando..." : editingNominee ? "Guardar Cambios" : "Crear Nominado")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 && (
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-sm">Primero debes crear al menos una categoría</p>
          </CardContent>
        </Card>
      )}

      {categories.length > 0 && nominees.length === 0 ? (
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay nominados</h3>
            <p className="text-muted-foreground text-sm mb-4">Comienza agregando nominados a tus categorías</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Nominado
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {nominees.map((nominee) => (
            <Card key={nominee.id} className="border-border/50 overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-primary/10 to-[#00D4FF]/10">
                {nominee.image_url ? (
                  <Image
                    src={nominee.image_url || "/placeholder.svg"}
                    alt={nominee.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-12 h-12 text-primary/50" />
                  </div>
                )}
                {nominee.clip_url && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-xs">
                    <Video className="w-3 h-3" />
                    Video
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-1 truncate">{nominee.name}</h3>
                <p className="text-sm text-primary mb-3 truncate">{nominee.categories?.name}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(nominee)}
                    className="flex-1 bg-transparent"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(nominee.id)}
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
