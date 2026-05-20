import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const iobrokerTarget = env.VITE_IOBROKER_URL || 'http://localhost:8082'

  // In production the web adapter serves the app at /apuvis/
  const base = mode === 'production' ? '/apuvis/' : '/'

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Output directly into www/ — the ioBroker web adapter serves this folder
      outDir: 'www',
      emptyOutDir: true,
    },
    server: {
      // Dev proxy: forwards /socket.io → ioBroker (avoids CORS in development)
      proxy: {
        '/socket.io': {
          target: iobrokerTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})
