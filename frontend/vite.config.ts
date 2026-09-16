import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const sitemapPaths = [
  '/',
  '/annonces',
  '/categories',
  '/a-propos',
  '/don',
  '/contact',
  '/mentions-legales',
  '/confidentialite',
  '/conditions-utilisation',
  '/conditions-abonnement',
  '/cookies',
]

function normalizeSiteOrigin(value?: string) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.origin : null
  } catch {
    return null
  }
}

function seoAssets(siteOrigin: string | null): Plugin {
  const robots = `User-agent: *\nAllow: /\n${siteOrigin ? `Sitemap: ${siteOrigin}/sitemap.xml\n` : ''}`
  const sitemap = siteOrigin
    ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map((path) => `  <url><loc>${siteOrigin}${path}</loc></url>`).join('\n')}\n</urlset>\n`
    : null

  return {
    name: 'start-seo-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url === '/robots.txt') {
          response.setHeader('Content-Type', 'text/plain; charset=utf-8')
          response.end(robots)
          return
        }
        if (request.url === '/sitemap.xml' && sitemap) {
          response.setHeader('Content-Type', 'application/xml; charset=utf-8')
          response.end(sitemap)
          return
        }
        next()
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })
      if (sitemap) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  return {
  plugins: [react(), tailwindcss(), seoAssets(normalizeSiteOrigin(env.VITE_PUBLIC_SITE_URL))],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'maps-vendor'
          if (id.includes('node_modules/@supabase')) return 'supabase-vendor'
          if (id.includes('node_modules/@tanstack')) return 'query-vendor'
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router') || id.includes('node_modules/react/')) return 'react-vendor'
        },
      },
    },
  },
  }
})
