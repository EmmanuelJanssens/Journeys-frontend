import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server:{
    port:3000,
    proxy:{
      '/api':{
        changeOrigin: true,
        target:'http://localhost:4000/api',
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
