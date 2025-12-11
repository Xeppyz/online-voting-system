export interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
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
