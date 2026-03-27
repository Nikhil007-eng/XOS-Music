import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/XOS-Music/', // This fixes the 404/Blank screen on GitHub Pages
  resolve: {
    alias: {
      // This allows the "import ... from '@/data/music'" syntax to work
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
