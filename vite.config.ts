import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_PROXY_TARGET || 'https://weg-benefits-api.onrender.com'
  const proxy: Record<string, ProxyOptions> = {
    '/backend': {
      target, changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/backend/, ''),
      cookieDomainRewrite: '', cookiePathRewrite: '/',
      configure(proxy) {
        // This is a server-side same-origin development proxy, not a cross-origin browser request.
        proxy.on('proxyReq', request => request.removeHeader('origin'))
        proxy.on('proxyRes', (response) => {
          // Only Vite's local HTTP dev/preview proxy removes Secure. Production keeps HTTPS cookies intact.
          const cookies = response.headers['set-cookie']
          if (cookies) response.headers['set-cookie'] = cookies.map(cookie => cookie.replace(/;\s*Secure\b/gi, ''))
        })
      },
      timeout: 300_000, proxyTimeout: 300_000,
    },
  }
  return { plugins: [svelte()], server: { host: '127.0.0.1', proxy }, preview: { host: '127.0.0.1', proxy } }
})
