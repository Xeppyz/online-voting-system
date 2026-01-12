import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                userAgent: 'GPTBot',
                disallow: '/',
            },
            {
                userAgent: 'CCBot',
                disallow: '/',
            },
            {
                userAgent: 'ClaudeBot',
                disallow: '/',
            },
            {
                userAgent: 'AnthropicAI',
                disallow: '/',
            }
        ],
        sitemap: 'https://awards.clik.com.ni/sitemap.xml',
    }
}
