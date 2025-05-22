import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/AD/', // ← обязательно с косой чертой!
  plugins: [react()],
})
