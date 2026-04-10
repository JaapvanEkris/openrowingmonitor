/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'app/client',
  build: {
    outDir: '../../build',
    emptyOutDir: true,
    target: 'es2021'
  },
  plugins: []
})
