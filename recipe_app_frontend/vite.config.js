import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite 4.x config tuned for Node 18 / CI.
 * - Bind to 0.0.0.0 and use strictPort 3000 to satisfy preview system
 * - Avoid crypto/browser polyfill pitfalls by setting clear build targets
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  },
  build: {
    target: 'es2020'
  }
})
