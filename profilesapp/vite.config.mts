import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // stay in profilesapp directory
  build: {
    outDir: 'dist',
  },
})
