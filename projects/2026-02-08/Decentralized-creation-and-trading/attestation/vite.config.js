import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
    // Use the plugin to handle ALL Node.js polyfills automatically
    plugins: [
        nodePolyfills({
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
            protocolImports: true, // Allows 'node:fs', 'node:util' etc.
        }),
    ],
    resolve: {
        alias: {
            'node:fs/promises': '/src/mocks/fs.js',
            'fs': 'browserify-fs',
        }
    },
    server: {
        port: 3000,
        proxy: {
            '/indexer': {
                target: 'https://indexer-storage-testnet-turbo.0g.ai',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/indexer/, ''),
                // Add headers to disguise proxy as legitimate browser request
                headers: {
                    'Origin': 'https://scan-testnet.0g.ai',
                    'Referer': 'https://scan-testnet.0g.ai/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            },
        },
    },
    define: {
        global: 'globalThis',
    },
    optimizeDeps: {
        exclude: ['@0glabs/0g-ts-sdk'], // Prevent Vite from trying to pre-bundle the entire SDK including node-only files
        include: ['js-sha3', 'axios'] // Explicitly include js-sha3 to convert it to ESM
    }
});
