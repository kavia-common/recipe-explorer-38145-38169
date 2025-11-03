import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ensure compatibility with Node 18 by avoiding features from newer Vite.
// No special options required; keeping defaults minimal.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020'
  }
})
