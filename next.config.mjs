/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ciuvwumhmxdskmtkijru.supabase.co",
      },
    ],
  },
}

export default nextConfig
