// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/sitemap'],
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Stokes Valley Tennis Club'
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en-NZ' },
      titleTemplate: '%s | Stokes Valley Tennis Club',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#ffffff' }
      ]
    }
  },
  typescript: {
    typeCheck: true
  }
})
