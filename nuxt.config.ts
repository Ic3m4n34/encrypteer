import { defineNuxtConfig } from 'nuxt';
import 'dotenv/config';
import moment from 'moment';

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      title: 'Encrypteer.com',
      meta: [
        { name: 'description', content: 'We\'ve curated all News from every Crypto News Source. Read all the latest Crypto News now!' },
      ],
    },
  },
  css: [
    '@/assets/css/main.css',
  ],
  modules: [
    '@nuxt/image-edge',
    '@funken-studio/sitemap-nuxt-3',
    '@kevinmarrec/nuxt-pwa',
  ],
  sitemap: {
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: moment().format('YYYY-MM-DD'),
    },
    hostname: 'https://encrypteer.com',
    gzip: true,
    routes: async () => $fetch('/api/sitemap'),
  },
  build: {
    transpile: ['@heroicons/vue'],
    postcss: {
      postcssOptions: {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      },
    },
  },
});
