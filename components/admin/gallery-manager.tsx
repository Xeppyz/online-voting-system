"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Image as ImageIcon, Video, X, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import type { GalleryItem } from "@/lib/types"

interface GalleryManagerProps {
    items: GalleryItem[]
    onItemsChange: (items: GalleryItem[]) => void
}

export function GalleryManager({ items, onItemsChange }: GalleryManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        published_at: new Date().toISOString().split('T')[0],
        media_url: "",
        media_type: "image" as "image" | "video",
    })

    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleOpenDialog = (item?: GalleryItem) => {
        setError(null)
        setFile(null)
        setUploadProgress(null)

        if (item) {
            setEditingItem(item)
            setFormData({
                title: item.title,
                published_at: item.published_at,
                media_url: item.media_url,
                media_type: item.media_type,
            })
            setPreview(item.media_url)
        } else {
            setEditingItem(null)
            setFormData({
                title: "",
                published_at: new Date().toISOString().split('T')[0],
                media_url: "",
                media_type: "image",
            })
            setPreview(null)
        }
        setIsDialogOpen(true)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            // Validation
            const isVideo = selectedFile.type.startsWith("video/")
            const maxLimit = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024 // 50MB video, 5MB image

            if (selectedFile.size > maxLimit) {
                setError(`El archivo es muy grande (Máx: ${isVideo ? '50MB' : '5MB'})`)
                return
            }

            setFile(selectedFile)
            setPreview(URL.createObjectURL(selectedFile))
            setFormData({
                ...formData,
                media_type: isVideo ? "video" : "image"
            })
            setError(null)
        }
    }

    const uploadFile = async (file: File): Promise<string | null> => {
        const supabase = createClient()
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // Upload to 'gallery' bucket
        const { data, error } = await supabase.storage
            .from("gallery")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            })

        if (error) {
            console.error("Upload error:", error)
            setError("Error al subir el archivo: " + error.message)
            return null
        }

        const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(data.path)
        return publicUrl
    }

    const handleSave = async () => {
        if (!formData.title) {
            setError("El título es obligatorio")
            return
        }
        if (!formData.media_url && !file) {
            setError("Debes subir una imagen o video")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            let finalMediaUrl = formData.media_url

            if (file) {
                setUploadProgress("Subiendo archivo...")
                const url = await uploadFile(file)
                if (!url) {
                    setIsLoading(false)
                    return
                }
                finalMediaUrl = url
            }

            const supabase = createClient()
            const payload = {
                title: formData.title,
                media_url: finalMediaUrl,
                media_type: formData.media_type,
                published_at: formData.published_at
            }

            if (editingItem) {
                const { error } = await supabase
                    .from("gallery_items")
                    .update(payload)
                    .eq("id", editingItem.id)

                if (error) throw error

                onItemsChange(items.map(i => i.id === editingItem.id ? { ...i, ...payload } : i))
            } else {
                const { data, error } = await supabase
                    .from("gallery_items")
                    .insert([payload])
                    .select()
                    .single()

                if (error) throw error
                if (data) onItemsChange([...items, data])
            }

            setIsDialogOpen(false)
        } catch (err: any) {
            console.error("Error saving gallery item:", err)
            setError("Error al guardar: " + err.message)
        } finally {
            setIsLoading(false)
            setUploadProgress(null)
        }
    }

    const handleDelete = async (id: string, mediaUrl: string) => {
        if (!confirm("¿Estás seguro de eliminar este elemento?")) return

        const supabase = createClient()

        // Delete from DB first
        const { error } = await supabase.from("gallery_items").delete().eq("id", id)

        if (error) {
            console.error(error)
            alert("Error al eliminar")
            return
        }

        // Attempt to delete from storage (optional, but good practice)
        try {
            const urlObj = new URL(mediaUrl)
            const path = urlObj.pathname.split("/gallery/")[1]
            if (path) {
                await supabase.storage.from("gallery").remove([decodeURIComponent(path)])
            }
        } catch (e) {
            console.warn("Could not delete file from storage", e)
        }

        onItemsChange(items.filter(i => i.id !== id))
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Galería Multimedia</h2>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Elemento
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden group">
                        <div className="relative aspect-video bg-muted">
                            {item.media_type === 'video' ? (
                                <video src={item.media_url} className="w-full h-full object-cover" controls />
                            ) : (
                                <Image
                                    src={item.media_url}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            )}
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <h3 className="font-bold truncate">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {item.published_at}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id, item.media_url)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar' : 'Nuevo'} Elemento</DialogTitle>
                    </DialogHeader>

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ej: Resumen del Evento"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Publicación</Label>
                            <Input
                                type="date"
                                value={formData.published_at}
                                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Archivo (Imagen o Video)</Label>
                            <div
                                className="border-2 border-dashed border-input hover:border-primary transition-colors rounded-lg p-8 text-center cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <div className="relative aspect-video w-full max-w-[300px] mx-auto overflow-hidden rounded-md bg-black/5">
                                        {formData.media_type === 'video' ? (
                                            <video src={preview} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                        )}
                                        <Button
                                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                            variant="destructive"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setFile(null)
                                                setPreview(null)
                                                setFormData({ ...formData, media_url: "" })
                                                if (fileInputRef.current) fileInputRef.current.value = ""
                                            }}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <div className="flex gap-2">
                                            <ImageIcon className="w-8 h-8" />
                                            <Video className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm">Click para seleccionar (Max: 50MB)</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </div>

                        <Button className="w-full" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? (uploadProgress || "Guardando...") : "Guardar"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
