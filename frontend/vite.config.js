import vue from '@vitejs/plugin-vue'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
function githubPagesBase(repository) {
  const repositoryName = repository?.split('/')[1]

  if (!repositoryName || repositoryName.toLowerCase().endsWith('.github.io')) {
    return '/'
  }

  return `/${repositoryName}/`
}

function githubPagesFallback() {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    writeBundle({ dir }) {
      if (dir) copyFileSync(resolve(dir, 'index.html'), resolve(dir, '404.html'))
    },
  }
}

export default defineConfig(({ command }) => ({
  // GitHub Actions provides GITHUB_REPOSITORY as "owner/repository".
  // Local development and non-GitHub builds keep Vite's default root path.
  base: command === 'build'
    ? githubPagesBase(process.env.GITHUB_REPOSITORY)
    : '/',
  plugins: [vue(), githubPagesFallback()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
}))
