import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@solana/wallet-adapter-base'],
  },
  server:{
    port:3000
  },
 
})
