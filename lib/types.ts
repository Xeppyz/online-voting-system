export interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
  aplicativo_color: string | null // [NEW] Imagen para el título de la página
  block: "green" | "blue" | "cyan" | "pink" | null // [NEW]
  created_at: string
}

export interface Nominee {
  id: string
  category_id: string
  name: string
  description: string | null
  image_url: string | null
  clip_url: string | null
  created_at: string
  social_links?: { platform: "instagram" | "tiktok" | "facebook"; url: string }[] | null
}

export interface Vote {
  id: string
  user_id: string
  nominee_id: string
  category_id: string
  created_at: string
}

export interface NomineeWithVotes extends Nominee {
  vote_count: number
  percentage: number
}

export interface CategoryWithNominees extends Category {
  nominees: NomineeWithVotes[]
  total_votes: number
}

export interface GalleryItem {
  id: string
  title: string
  media_url: string
  media_type: "image" | "video"
  published_at: string
  created_at: string
}

export interface Sponsor {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  created_at: string
  social_links?: { platform: "instagram" | "tiktok" | "facebook" | "website"; url: string }[] | null
}
