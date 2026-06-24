import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split the large third-party SDKs into their own long-cacheable
        // chunks so the app shell stays small and updates don't re-download
        // unchanged vendor code.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase'
          if (
            id.includes('react-router') ||
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/')
          ) {
            return 'react'
          }
          return 'vendor'
        },
      },
    },
  },
})
