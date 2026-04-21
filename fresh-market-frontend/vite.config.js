import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3001,
    // host: true,
    watch: {
      usePolling: true,
    },
    open: true,
  },
  plugins: [react()],
  define: {
    global: 'window',
  },
})
