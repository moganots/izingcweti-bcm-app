import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: { transformAssetUrls },
        }),
        quasar({
            sassVariables: 'src/css/quasar.variables.scss',
        }),
    ],
    server: {
        port: 9811,
        proxy: {
            '/api': {
                target: 'http://localhost:9810',
                changeOrigin: true,
                rewrite: (path:any) => path.replace(/^\/api/, '/api'),
                configure: (proxy:any, options:any) => {
                    proxy.on('error', (err:any, req:any, res:any) => {
                        console.log('proxy error', err)
                    })
                    proxy.on('proxyReq', (proxyReq:any, req:any, res:any) => {
                        console.log('Sending Request to the Target:', req.method, req.url)
                    })
                    proxy.on('proxyRes', (proxyRes:any, req:any, res:any) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
                    })
                },
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
})
