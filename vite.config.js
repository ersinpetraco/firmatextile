import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist' },
  // fs.strict off: Vite's allow-list check mishandles ":" in the project path
  server: { port: 5173, fs: { strict: false } }
})
