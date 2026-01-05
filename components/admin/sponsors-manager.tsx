"use client"

import { useState, useRef } from "react"
import type { Sponsor } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Instagram, Facebook, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { ImageCropper } from "@/components/ui/image-cropper"

interface SponsorsManagerProps {
    sponsors: Sponsor[]
    onSponsorsChange: (sponsors: Sponsor[]) => void
}

export function SponsorsManager({ sponsors, onSponsorsChange }: SponsorsManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Cropper State
    const [isCropperOpen, setIsCropperOpen] = useState(false)
    const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        logo_url: "",
        social_links: [] as { platform: "instagram" | "tiktok" | "facebook" | "website"; url: string }[],
    })

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)

    const handleOpenDialog = (sponsor?: Sponsor) => {
        setError(null)
        setImageFile(null)

        if (sponsor) {
            setEditingSponsor(sponsor)
            setFormData({
                name: sponsor.name,
                description: sponsor.description || "",
                logo_url: sponsor.logo_url || "",
                social_links: sponsor.social_links || [],
            })
            setImagePreview(sponsor.logo_url || null)
        } else {
            setEditingSponsor(null)
            setFormData({
                name: "",
                description: "",
                logo_url: "",
                social_links: [],
            })
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

            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setOriginalImageSrc(reader.result?.toString() || null)
                setIsCropperOpen(true)
                if (imageInputRef.current) imageInputRef.current.value = ""
            })
            reader.readAsDataURL(file)
            setError(null)
        }
    }

    const handleCropComplete = (croppedBlob: Blob) => {
        const file = new File([croppedBlob], "sponsor-logo.jpg", { type: "image/jpeg" })
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setOriginalImageSrc(null)
        setIsCropperOpen(false)
    }

    const handleAddSocialLink = () => {
        setFormData({
            ...formData,
            social_links: [...formData.social_links, { platform: "instagram", url: "" }]
        })
    }

    const handleRemoveSocialLink = (index: number) => {
        const newLinks = [...formData.social_links]
        newLinks.splice(index, 1)
        setFormData({ ...formData, social_links: newLinks })
    }

    const handleSocialLinkChange = (index: number, field: "platform" | "url", value: string) => {
        const newLinks = [...formData.social_links]
        newLinks[index] = { ...newLinks[index], [field]: value }
        setFormData({ ...formData, social_links: newLinks })
    }

    const uploadFile = async (file: File): Promise<string | null> => {
        const supabase = createClient()
        const fileName = `sponsors/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`

        const { data, error } = await supabase.storage
            .from("gallery") // Reusing gallery bucket structure
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            })

        if (error) {
            console.error("Upload error:", error)
            setError("Error al subir imagen: " + error.message)
            return null
        }

        const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(data.path)
        return publicUrl
    }

    const handleSave = async () => {
        if (!formData.name) {
            setError("El nombre es obligatorio")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            let finalLogoUrl = formData.logo_url

            if (imageFile) {
                const url = await uploadFile(imageFile)
                if (!url) {
                    setIsLoading(false)
                    return
                }
                finalLogoUrl = url
            }

            const supabase = createClient()
            const payload = {
                name: formData.name,
                description: formData.description,
                logo_url: finalLogoUrl,
                social_links: formData.social_links
            }

            if (editingSponsor) {
                const { error } = await supabase
                    .from("sponsors")
                    .update(payload)
                    .eq("id", editingSponsor.id)

                if (error) throw error

                onSponsorsChange(sponsors.map(s => s.id === editingSponsor.id ? { ...s, ...payload } : s))
            } else {
                const { data, error } = await supabase
                    .from("sponsors")
                    .insert([payload])
                    .select()
                    .single()

                if (error) throw error
                if (data) onSponsorsChange([...sponsors, data])
            }

            setIsDialogOpen(false)
        } catch (err: any) {
            console.error("Error saving sponsor:", err)
            setError("Error al guardar: " + err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este patrocinador?")) return

        const supabase = createClient()
        const { error } = await supabase.from("sponsors").delete().eq("id", id)

        if (error) {
            console.error(error)
            alert("Error al eliminar")
            return
        }

        onSponsorsChange(sponsors.filter(s => s.id !== id))
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Patrocinadores</h2>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Patrocinador
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors.map((sponsor) => (
                    <Card key={sponsor.id} className="overflow-hidden group">
                        <div className="relative aspect-[3/2] bg-white p-6 flex items-center justify-center">
                            {sponsor.logo_url ? (
                                <Image
                                    src={sponsor.logo_url}
                                    alt={sponsor.name}
                                    fill
                                    className="object-contain p-4"
                                    unoptimized
                                />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                            )}
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <h3 className="font-bold truncate">{sponsor.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{sponsor.description}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(sponsor)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(sponsor.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingSponsor ? 'Editar' : 'Nuevo'} Patrocinador</DialogTitle>
                    </DialogHeader>

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Logo</Label>
                                    <div
                                        className="border-2 border-dashed border-input hover:border-primary transition-colors rounded-lg h-[200px] flex items-center justify-center cursor-pointer relative bg-muted/20"
                                        onClick={() => imageInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" />
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-sm">Click para subir logo</p>
                                            </div>
                                        )}
                                        <input
                                            ref={imageInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nombre de la Marca</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Coca Cola"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Breve descripción..."
                                        className="h-[100px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Redes Sociales</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddSocialLink}>
                                    <Plus className="w-3 h-3 mr-1" /> Agregar Red
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {formData.social_links.map((link, index) => (
                                    <div key={index} className="flex gap-2">
                                        <select
                                            className="flex h-10 w-[140px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={link.platform}
                                            onChange={(e) => handleSocialLinkChange(index, "platform", e.target.value)}
                                        >
                                            <option value="instagram">Instagram</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="tiktok">TikTok</option>
                                            <option value="website">Sitio Web</option>
                                        </select>
                                        <Input
                                            value={link.url}
                                            onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                                            placeholder="https://"
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSocialLink(index)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {formData.social_links.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-2">Sin redes sociales</p>
                                )}
                            </div>
                        </div>

                        <Button className="w-full" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Guardar Patrocinador"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ImageCropper
                open={isCropperOpen}
                onOpenChange={setIsCropperOpen}
                imageSrc={originalImageSrc}
                onCropComplete={handleCropComplete}
                aspect={3 / 2} // Landscape aspect for logos usually
            />
        </div>
    )
}
