// vite.config.js or vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar } from '@quasar/vite-plugin'

export default defineConfig({
    plugins: [
        vue(),
        quasar({
            sassVariables: 'src/quasar-variables.sass',
        }),
    ],
    server: {
        port: 9811,
        proxy: {
            '/api': {
                target: 'http://localhost:9810',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api'),
                // Fix CORS issues
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        // Add headers to avoid CORS
                        proxyReq.setHeader('Origin', 'http://localhost:9811')
                    })
                },
            },
        },
    },
})
