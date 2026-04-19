import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { qrcode } from 'vite-plugin-qrcode'

export default defineConfig({
  base: '/AstroCoin/',
  plugins: [react(), tailwindcss(), qrcode()],
  server: {
    host: true,
  },
})
