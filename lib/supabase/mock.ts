import { createBrowserClient as createSsrBrowserClient, createServerClient as createSsrServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const mockCategories = [
  {
    id: "cat-1",
    name: "Mejor Startup",
    description: "Innovación y crecimiento",
    image_url: "/categorias/placeholder.svg",
    block: 1,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-2",
    name: "Mejor Diseño",
    description: "Experiencia visual y branding",
    image_url: "/categorias/placeholder.svg",
    block: 2,
    created_at: "2026-01-02T00:00:00.000Z",
  },
]

const mockNominees = [
  {
    id: "nom-1",
    name: "Nova Studio",
    category_id: "cat-1",
    description: "Plataforma creativa para equipos modernos",
    image_url: "/icon/ISOTIPOCLIK512PX.png",
    website_url: "https://example.com",
    created_at: "2026-01-03T00:00:00.000Z",
    categories: { name: "Mejor Startup", description: "Innovación y crecimiento", image_url: "/categorias/placeholder.svg", block: 1 },
  },
  {
    id: "nom-2",
    name: "Lumen Labs",
    category_id: "cat-1",
    description: "Herramientas de IA para marketing",
    image_url: "/icon/ISOTIPOCLIK512PX.png",
    website_url: "https://example.com",
    created_at: "2026-01-04T00:00:00.000Z",
    categories: { name: "Mejor Startup", description: "Innovación y crecimiento", image_url: "/categorias/placeholder.svg", block: 1 },
  },
  {
    id: "nom-3",
    name: "Ataraxia",
    category_id: "cat-2",
    description: "Diseño editorial para marcas de lujo",
    image_url: "/icon/ISOTIPOCLIK512PX.png",
    website_url: "https://example.com",
    created_at: "2026-01-05T00:00:00.000Z",
    categories: { name: "Mejor Diseño", description: "Experiencia visual y branding", image_url: "/categorias/placeholder.svg", block: 2 },
  },
]

const mockSponsors = [
  { id: "sponsor-1", name: "Clik Studio", image_url: "/icon/ISOTIPOCLIK512PX.png", created_at: "2026-01-01T00:00:00.000Z" },
  { id: "sponsor-2", name: "North Labs", image_url: "/icon/ISOTIPOCLIK512PX.png", created_at: "2026-01-02T00:00:00.000Z" },
]

const mockGalleryItems = [
  {
    id: "gallery-1",
    title: "Noche de premiación",
    media_url: "/icon/ISOTIPOCLIK512PX.png",
    media_type: "image",
    image_url: "/icon/ISOTIPOCLIK512PX.png",
    published_at: "2026-01-03T00:00:00.000Z",
  },
]

const mockAppSettings = [
  { key: "enable_website_curtain", value: false },
  { key: "voting_start_date", value: "2026-06-01T00:00:00.000Z" },
  { key: "voting_end_date", value: "2026-12-31T23:59:59.000Z" },
  { key: "show_hero_countdown", value: true },
  { key: "disable_voting", value: false },
]

const mockVotes = [{ category_id: "cat-1", nominee_id: "nom-1" }, { category_id: "cat-1", nominee_id: "nom-2" }]

function getMockRows(table: string) {
  switch (table) {
    case "categories":
      return mockCategories
    case "nominees":
      return mockNominees
    case "sponsors":
      return mockSponsors
    case "gallery_items":
    case "gallery":
      return mockGalleryItems
    case "app_settings":
      return mockAppSettings
    case "votes":
      return mockVotes
    default:
      return []
  }
}

function getMockRpcRows(name: string) {
  if (name === "get_vote_counts") {
    return [
      { category_id: "cat-1", nominee_id: "nom-1", vote_count: 42 },
      { category_id: "cat-1", nominee_id: "nom-2", vote_count: 31 },
      { category_id: "cat-2", nominee_id: "nom-3", vote_count: 18 },
    ]
  }
  return []
}

export function isSupabaseMockMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ""

  return !url || !anonKey || url.includes("example") || url.includes("your-project") || url.includes("placeholder")
}

function createMockQueryBuilder(table: string) {
  const data = getMockRows(table)

  const builder: any = {
    select: () => builder,
    order: () => builder,
    eq: () => builder,
    in: () => builder,
    limit: () => builder,
    single: async () => ({ data: Array.isArray(data) ? data[0] ?? null : null, error: null }),
    maybeSingle: async () => ({ data: Array.isArray(data) ? data[0] ?? null : null, error: null }),
    insert: async (values: any) => ({ data: values, error: null }),
    update: async (values: any) => ({ data: values, error: null }),
    delete: async () => ({ data: null, error: null }),
    then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve),
  }

  return new Proxy(builder, {
    get(target, prop) {
      if (prop === "then") {
        return target.then
      }
      return target[prop]
    },
  })
}

export function createMockSupabaseClient() {
  return {
    from(table: string) {
      return createMockQueryBuilder(table)
    },
    rpc(name: string) {
      return Promise.resolve({ data: getMockRpcRows(name), error: null })
    },
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      }),
    },
    storage: {
      from(bucket: string) {
        return {
          getPublicUrl(path: string) {
            return { data: { publicUrl: path || `/storage/v1/object/public/${bucket}/demo.png` } }
          },
          remove: async () => ({ data: null, error: null }),
        }
      },
    },
    channel: () => ({
      on: () => ({ subscribe: async () => "subscribed" }),
      subscribe: async () => "subscribed",
    }),
    removeChannel: () => null,
  } as any
}

export function createMockBrowserClient() {
  return createMockSupabaseClient()
}

export function createMockServerClient() {
  return createMockSupabaseClient()
}

export function createRealSupabaseClient(url: string, key: string) {
  return createSupabaseClient(url, key)
}

export function createRealBrowserClient(url: string, key: string) {
  return createSsrBrowserClient(url, key)
}

export function createRealServerClient(url: string, key: string, options: any) {
  return createSsrServerClient(url, key, options)
}
