/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
import { defineConfig, transformWithEsbuild } from 'vite'

// Temporary plugin: transforms .js files with esbuild's ts loader for
// decorator support in dev mode. Will be removed once files are .ts.
function jsDecoratorPlugin () {
  return {
    name: 'js-decorator-support',
    async transform (code, id) {
      if (!id.endsWith('.js') || id.includes('node_modules')) {
        return
      }

      return transformWithEsbuild(code, id, { loader: 'ts' })
    }
  }
}

export default defineConfig({
  root: 'app/client',
  build: {
    outDir: '../../build',
    emptyOutDir: true,
    target: 'es2021'
  },
  plugins: [jsDecoratorPlugin()]
})
